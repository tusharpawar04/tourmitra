const express = require('express');
const Ledger = require('../models/Ledger');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/ledger/guide/me ─────────────────────────────────
// Get logged-in guide's earnings summary
router.get('/guide/me', protect, authorize('guide'), async (req, res, next) => {
  try {
    const summary = await Ledger.getGuideEarnings(req.user._id);
    
    // Get detailed breakdown of recent bookings
    const recentEntries = await Ledger.find({
      guide_id: req.user._id,
    })
      .populate('booking_id', 'bookingId startDate status')
      .populate('tourist_id', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      summary,
      recent_entries: recentEntries,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ledger/guide/:guideId ──────────────────────────
// Get guide earnings (admin only)
router.get('/guide/:guideId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const summary = await Ledger.getGuideEarnings(req.params.guideId);
    
    const entries = await Ledger.find({
      guide_id: req.params.guideId,
    })
      .populate('booking_id', 'bookingId startDate status')
      .populate('tourist_id', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      summary,
      entries,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ledger/booking/:bookingId ──────────────────────
// Get ledger entry for specific booking
router.get('/booking/:bookingId', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Verify user is either tourist or guide of this booking
    const userId = req.user._id.toString();
    if (booking.tourist.toString() !== userId && booking.guide.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this ledger entry' });
    }
    
    const ledgerEntry = await Ledger.findOne({ booking_id: req.params.bookingId });
    
    if (!ledgerEntry) {
      return res.status(404).json({ message: 'Ledger entry not found' });
    }
    
    res.json({ ledger: ledgerEntry });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/ledger/:id/approve-payout ──────────────────────
// Approve payout (admin only)
router.put('/:id/approve-payout', protect, authorize('admin'), async (req, res, next) => {
  try {
    const ledgerEntry = await Ledger.findById(req.params.id);
    
    if (!ledgerEntry) {
      return res.status(404).json({ message: 'Ledger entry not found' });
    }
    
    ledgerEntry.approvePayout(req.user._id, req.body.notes);
    await ledgerEntry.save();
    
    res.json({ 
      message: 'Payout approved',
      ledger: ledgerEntry 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
