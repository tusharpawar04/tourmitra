const express = require('express');
const Availability = require('../models/Availability');
const GuidePackage = require('../models/GuidePackage');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/availability/guide/:guideId ─────────────────────
// Get guide's availability (public)
router.get('/guide/:guideId', async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ guide: req.params.guideId });
    
    // If no availability record exists, create default one
    if (!availability) {
      availability = await Availability.create({
        guide: req.params.guideId,
        working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        blocked_dates: [],
        slot_reservations: []
      });
    }
    
    res.json({ availability });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/availability/check ──────────────────────────────
// Check if specific time slot is available
router.get('/check', async (req, res, next) => {
  try {
    const { guide_id, start_time, end_time } = req.query;
    
    if (!guide_id || !start_time || !end_time) {
      return res.status(400).json({ 
        message: 'guide_id, start_time, and end_time are required' 
      });
    }
    
    let availability = await Availability.findOne({ guide: guide_id });
    
    if (!availability) {
      // No availability record means guide hasn't set up yet, assume available
      return res.json({ available: true });
    }
    
    const isAvailable = availability.isSlotAvailable(start_time, end_time);
    
    res.json({ available: isAvailable });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/availability/slots ──────────────────────────────
// Get available time slots for a specific date and package
router.get('/slots', async (req, res, next) => {
  try {
    const { guide_id, date, package_id } = req.query;
    
    if (!guide_id || !date || !package_id) {
      return res.status(400).json({ 
        message: 'guide_id, date, and package_id are required' 
      });
    }
    
    // Get package to know duration
    const packageDoc = await GuidePackage.findById(package_id);
    if (!packageDoc) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const availability = await Availability.findOne({ guide: guide_id });
    
    // Possible start times (9 AM, 2 PM for simplicity in alpha)
    const possibleStartTimes = ['09:00', '14:00'];
    const availableSlots = [];
    
    possibleStartTimes.forEach(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + packageDoc.duration_hours);
      
      const isAvailable = !availability || availability.isSlotAvailable(startTime, endTime);
      
      if (isAvailable) {
        availableSlots.push({
          start_time: startTime,
          end_time: endTime,
          label: timeStr,
        });
      }
    });
    
    res.json({ 
      date,
      package_duration: packageDoc.duration_hours,
      available_slots: availableSlots 
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/availability/my ─────────────────────────────────
// Update guide's availability settings (guide only)
router.put('/my', protect, authorize('guide'), async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ guide: req.user._id });
    
    if (!availability) {
      availability = new Availability({ guide: req.user._id });
    }
    
    // Update working days
    if (req.body.working_days !== undefined) {
      availability.working_days = req.body.working_days;
    }
    
    // Add blocked dates
    if (req.body.add_blocked_dates && Array.isArray(req.body.add_blocked_dates)) {
      req.body.add_blocked_dates.forEach(date => {
        if (!availability.blocked_dates.some(d => d.toISOString() === new Date(date).toISOString())) {
          availability.blocked_dates.push(new Date(date));
        }
      });
    }
    
    // Remove blocked dates
    if (req.body.remove_blocked_dates && Array.isArray(req.body.remove_blocked_dates)) {
      availability.blocked_dates = availability.blocked_dates.filter(
        d => !req.body.remove_blocked_dates.includes(d.toISOString().split('T')[0])
      );
    }
    
    await availability.save();
    
    res.json({ availability });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/availability/my/bookings ────────────────────────
// Get guide's upcoming bookings (for calendar view)
router.get('/my/bookings', protect, authorize('guide'), async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      guide: req.user._id,
      status: { $in: ['requested', 'accepted', 'confirmed'] },
      startDate: { $gte: new Date() }
    })
      .populate('tourist', 'name avatar email')
      .populate('destination', 'name')
      .sort({ startDate: 1 });
    
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/availability/cleanup ───────────────────────────
// Cleanup expired holds (internal/cron use)
router.post('/cleanup', async (req, res, next) => {
  try {
    await Availability.cleanupExpiredHolds();
    res.json({ message: 'Expired holds cleaned up' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
