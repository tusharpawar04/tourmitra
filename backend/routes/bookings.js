const express = require('express');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');
const GuidePackage = require('../models/GuidePackage');
const Availability = require('../models/Availability');
const Ledger = require('../models/Ledger');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper: Calculate quote
function calculateQuote(packageDoc, guests, commission_rate = 0.12, gst_rate = 0.18) {
  const base = packageDoc.base_price;
  const base_capacity = packageDoc.base_capacity || 3;
  const extra_guest_fee = packageDoc.extra_guest_fee || 200;
  
  // Group surcharge for guests beyond base capacity
  const group_surcharge = guests > base_capacity 
    ? (guests - base_capacity) * extra_guest_fee 
    : 0;
  
  const guideFee = base + group_surcharge;
  const commission = Math.round(guideFee * commission_rate);
  const platformFee = commission; // Platform fee is the commission
  const subtotalBeforeTax = guideFee + platformFee;
  const tax = Math.round(subtotalBeforeTax * gst_rate);
  const total = subtotalBeforeTax + tax;
  
  return {
    guideFee,
    groupSurcharge: group_surcharge,
    platformFee,
    tax,
    total,
    guide_payout: guideFee - commission,
    base_price: base,
    guests,
    commission,
  };
}

// Helper: Generate quote hash
function generateQuoteHash(quote, packageId, guideId, date) {
  const data = `${packageId}-${guideId}-${date}-${quote.total}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ── POST /api/bookings/quote ────────────────────────────────
// Get a server-calculated quote before booking
router.post(
  '/quote',
  protect,
  [
    body('guide_id').notEmpty().withMessage('Guide ID is required'),
    body('package_id').notEmpty().withMessage('Package ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('start_time').notEmpty().withMessage('Start time is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { guide_id, package_id, date, start_time, guests } = req.body;

      // Verify guide exists and is active
      const guide = await User.findOne({ _id: guide_id, role: 'guide' });
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      // Verify package exists and is active
      const packageDoc = await GuidePackage.findOne({ 
        _id: package_id, 
        guide: guide_id,
        is_active: true 
      });
      
      if (!packageDoc) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Check if guests exceed capacity
      if (guests > packageDoc.max_guests) {
        return res.status(400).json({ 
          message: `This package accommodates up to ${packageDoc.max_guests} guests. Contact guide for larger groups.` 
        });
      }

      // Calculate start and end times
      const startDateTime = new Date(`${date}T${start_time}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + packageDoc.duration_hours);

      // Verify date is in the future
      if (startDateTime < new Date()) {
        return res.status(400).json({ message: 'Tour date must be in the future' });
      }

      // Check availability
      const availability = await Availability.findOne({ guide: guide_id });
      if (availability && !availability.isSlotAvailable(startDateTime, endDateTime)) {
        return res.status(409).json({ message: 'This time slot is no longer available' });
      }

      // Calculate pricing
      const pricing = calculateQuote(packageDoc, guests);
      
      // Generate quote hash for verification
      const quote_hash = generateQuoteHash(pricing, package_id, guide_id, date);
      
      // Quote expires in 15 minutes
      const expires_at = new Date(Date.now() + 15 * 60 * 1000);

      res.json({
        quote: {
          ...pricing,
          package: {
            id: packageDoc._id,
            title: packageDoc.title,
            duration_hours: packageDoc.duration_hours,
          },
          guide: {
            id: guide._id,
            name: guide.name,
            photo: guide.photo || guide.avatar,
            city: guide.city,
          },
          start_time: startDateTime,
          end_time: endDateTime,
          guests,
          quote_hash,
          expires_at,
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/bookings ──────────────────────────────────
// Create new booking request with slot reservation
router.post(
  '/',
  protect,
  [
    body('guide_id').notEmpty().withMessage('Guide ID is required'),
    body('package_id').notEmpty().withMessage('Package ID is required'),
    body('start_time').notEmpty().withMessage('Start time is required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
    body('quote_hash').notEmpty().withMessage('Quote hash is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { guide_id, package_id, start_time, guests, quote_hash, special_requests, payment_method } = req.body;

      // Verify package
      const packageDoc = await GuidePackage.findOne({ _id: package_id, is_active: true });
      if (!packageDoc) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Calculate times
      const startDateTime = new Date(start_time);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + packageDoc.duration_hours);

      // Recalculate pricing to verify quote
      const pricing = calculateQuote(packageDoc, guests);
      
      // Verify quote hash hasn't been tampered with
      const date = startDateTime.toISOString().split('T')[0];
      const expectedHash = generateQuoteHash(pricing, package_id, guide_id, date);
      if (quote_hash !== expectedHash) {
        return res.status(400).json({ message: 'Invalid quote. Please request a new quote.' });
      }

      // Get or create availability record
      let availability = await Availability.findOne({ guide: guide_id });
      if (!availability) {
        availability = await Availability.create({
          guide: guide_id,
          working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          slot_reservations: []
        });
      }

      // Check slot availability one more time
      if (!availability.isSlotAvailable(startDateTime, endDateTime)) {
        return res.status(409).json({ message: 'This time slot is no longer available' });
      }

      // Create booking
      const booking = await Booking.create({
        tourist: req.user._id,
        guide: guide_id,
        package: package_id,
        startDate: startDateTime,
        start_time: startDateTime,
        end_time: endDateTime,
        travelers: guests,
        specialRequests: special_requests || '',
        status: 'requested',
        payment_status: 'pending',
        paymentMethod: payment_method || '',
        quote_hash,
        pricing: {
          guideFee: pricing.guideFee,
          groupSurcharge: pricing.groupSurcharge,
          platformFee: pricing.platformFee,
          commission: pricing.commission,
          tax: pricing.tax,
          total: pricing.total,
          guide_payout: pricing.guide_payout,
        },
      });

      // Reserve slot (held status)
      const reservation = availability.reserveSlot(startDateTime, endDateTime, booking._id, 'held');
      await availability.save();

      // Store reservation ID in booking
      booking.slot_reservation_ids = [reservation._id];
      await booking.save();

      // Populate for response
      await booking.populate('guide', 'name photo avatar city rating');
      await booking.populate('package', 'title duration_hours');

      res.status(201).json({ 
        booking,
        message: 'Booking request submitted. Awaiting guide confirmation.'
      });
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
      .populate('guide', 'name city photo avatar rating price')
      .populate('package', 'title duration_hours')
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
      .populate('package', 'title duration_hours')
      .populate('destination', 'name')
      .sort({ startDate: 1 });

    res.json({ count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/accept ────────────────────────
// Guide accepts booking request (confirms slot)
router.put('/:id/accept', protect, authorize('guide'), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guide: req.user._id });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'requested') {
      return res.status(400).json({ message: `Cannot accept booking with status "${booking.status}"` });
    }

    // Re-check slot availability
    const availability = await Availability.findOne({ guide: req.user._id });
    if (!availability.isSlotAvailable(booking.start_time, booking.end_time)) {
      return res.status(409).json({ message: 'Time slot is no longer available' });
    }

    // Update slot reservation status to confirmed
    availability.updateReservationStatus(booking._id, 'confirmed');
    await availability.save();

    // Change booking state
    booking.changeState('accepted', req.user._id, 'Guide accepted the booking');
    await booking.save();

    // TODO: Create notification for tourist (Task 16)

    res.json({ 
      booking,
      message: 'Booking accepted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/decline ───────────────────────
// Guide declines booking request
router.put('/:id/decline', protect, authorize('guide'), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guide: req.user._id });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'requested') {
      return res.status(400).json({ message: `Cannot decline booking with status "${booking.status}"` });
    }

    // Release slot reservation
    const availability = await Availability.findOne({ guide: req.user._id });
    if (availability) {
      availability.releaseSlot(booking._id);
      await availability.save();
    }

    // Change booking state
    const reason = req.body.reason || 'Guide declined the booking';
    booking.changeState('declined', req.user._id, reason);
    booking.cancellation_reason = reason;
    await booking.save();

    // TODO: Create notification for tourist (Task 16)

    res.json({ 
      booking,
      message: 'Booking declined'
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/confirm ───────────────────────
// Confirm booking with payment intent (tourist or system)
router.put('/:id/confirm', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user is the tourist
    if (booking.tourist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ message: 'Booking must be accepted by guide first' });
    }

    // Record payment intent
    booking.payment_status = 'intent_recorded';
    booking.changeState('confirmed', req.user._id, 'Payment intent recorded');
    await booking.save();

    // Create ledger entry
    const ledger = await Ledger.create({
      booking_id: booking._id,
      tourist_id: booking.tourist,
      guide_id: booking.guide,
      total_amount: booking.pricing.total,
      guide_fee: booking.pricing.guideFee,
      commission: booking.pricing.commission,
      guide_payout: booking.pricing.guide_payout,
      platform_fee: booking.pricing.platformFee,
      tax: booking.pricing.tax,
    });

    ledger.recordPaymentIntent(req.body.payment_method || 'test', req.user._id);
    await ledger.save();

    res.json({ 
      booking,
      message: 'Booking confirmed (TEST MODE)'
    });
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

    if (!booking.canBeCancelledBy(req.user._id)) {
      return res.status(400).json({ message: 'This booking cannot be cancelled' });
    }

    // Check cancellation policy
    const withinPolicy = booking.isWithinCancellationPolicy();
    
    // Release slot reservation
    const availability = await Availability.findOne({ guide: booking.guide });
    if (availability) {
      availability.releaseSlot(booking._id);
      await availability.save();
    }

    // Update booking
    booking.changeState('cancelled', req.user._id, req.body.reason || 'Cancelled by tourist');
    booking.cancellation_reason = req.body.reason || 'Cancelled by tourist';
    booking.cancelled_at = new Date();
    booking.cancelled_by = req.user._id;
    await booking.save();

    // Process refund in ledger if payment was recorded
    if (booking.payment_status === 'intent_recorded' || booking.payment_status === 'paid') {
      const ledger = await Ledger.findOne({ booking_id: booking._id });
      if (ledger) {
        const refundAmount = withinPolicy ? booking.pricing.total : Math.round(booking.pricing.total * 0.5);
        ledger.processRefund(refundAmount, `Cancelled ${withinPolicy ? 'within' : 'outside'} policy`, req.user._id);
        await ledger.save();
      }
    }

    res.json({ 
      booking,
      message: withinPolicy 
        ? 'Booking cancelled. Full refund processed (TEST MODE)' 
        : 'Booking cancelled. 50% refund processed (TEST MODE)'
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/bookings/:id/complete ──────────────────────
// Mark booking as completed (guide or auto after tour date)
router.put('/:id/complete', protect, authorize('guide'), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guide: req.user._id });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed' && booking.status !== 'in_progress') {
      return res.status(400).json({ message: 'Only confirmed bookings can be marked complete' });
    }

    // Verify tour date has passed
    if (new Date(booking.end_time) > new Date()) {
      return res.status(400).json({ message: 'Cannot complete booking before tour ends' });
    }

    // Change state
    booking.changeState('completed', req.user._id, 'Tour completed');
    await booking.save();

    // Approve payout in ledger
    const ledger = await Ledger.findOne({ booking_id: booking._id });
    if (ledger) {
      ledger.approvePayout(req.user._id, 'Tour completed successfully');
      await ledger.save();
    }

    res.json({ 
      booking,
      message: 'Booking marked as completed. Review now enabled.'
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/bookings/:id ───────────────────────────────
// Get single booking details
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guide', 'name city photo avatar rating')
      .populate('tourist', 'name avatar email phone')
      .populate('package', 'title duration_hours inclusions exclusions')
      .populate('destination', 'name');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user is tourist or guide
    const userId = req.user._id.toString();
    if (booking.tourist._id.toString() !== userId && booking.guide._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
