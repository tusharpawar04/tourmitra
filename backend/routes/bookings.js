const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ── POST /api/bookings ──────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('guideId').notEmpty().withMessage('Guide ID is required'),
    body('startDate').notEmpty().withMessage('Start date is required'),
    body('travelers').isInt({ min: 1 }).withMessage('At least 1 traveler required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { guideId, destinationId, tripType, startDate, days, travelers, specialRequests, paymentMethod } = req.body;

      // Verify guide exists
      const guide = await User.findOne({ _id: guideId, role: 'guide' });
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      // Calculate pricing
      const guideFee = guide.price * (days || 1);
      const groupSurcharge = travelers > 2 ? (travelers - 2) * guide.price * 0.25 : 0;
      const platformFee = Math.round((guideFee + groupSurcharge) * 0.1);
      const tax = Math.round((guideFee + groupSurcharge + platformFee) * 0.18);
      const total = guideFee + groupSurcharge + platformFee + tax;

      const booking = await Booking.create({
        tourist: req.user._id,
        guide: guideId,
        destination: destinationId || null,
        tripType: tripType || 'full',
        startDate,
        days: days || 1,
        travelers,
        specialRequests: specialRequests || '',
        paymentMethod: paymentMethod || '',
        pricing: { guideFee, groupSurcharge, platformFee, tax, total },
      });

      res.status(201).json({ booking });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/bookings/my ────────────────────────────────
// Tourist's bookings
router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ tourist: req.user._id })
      .populate('guide', 'name city photo rating price')
      .populate('destination', 'name image')
      .sort({ createdAt: -1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/bookings/guide ─────────────────────────────
// Guide's bookings
router.get('/guide', protect, authorize('guide'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guide: req.user._id })
      .populate('tourist', 'name email avatar phone')
      .populate('destination', 'name')
      .sort({ startDate: 1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/status ────────────────────────
// Guide accepts or declines a booking
router.put('/:id/status', protect, authorize('guide'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "confirmed" or "cancelled"' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, guide: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot update booking with status "${booking.status}"` });
    }

    booking.status = status;
    await booking.save();

    // If confirmed, increment guide's tour count
    if (status === 'confirmed') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { tours: 1 } });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/cancel ────────────────────────
// Tourist cancels their own booking
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tourist: req.user._id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking with status "${booking.status}"` });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
