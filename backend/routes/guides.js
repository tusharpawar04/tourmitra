const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/guides ─────────────────────────────────────
// List all guides with filters: ?city=Jaipur&specialty=Heritage&minRating=4&sort=rating
router.get('/', async (req, res, next) => {
  try {
    const { city, specialty, minRating, sort, search, limit } = req.query;
    const filter = { role: 'guide' };

    if (city) filter.city = { $regex: city, $options: 'i' };
    if (specialty) filter.specialties = { $in: [specialty] };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
      ];
    }

    let query = User.find(filter).select('-savedGuides -savedItineraries -documents');

    if (sort === 'price-low') query = query.sort({ price: 1 });
    else if (sort === 'price-high') query = query.sort({ price: -1 });
    else if (sort === 'reviews') query = query.sort({ reviewCount: -1 });
    else query = query.sort({ rating: -1 });

    if (limit) query = query.limit(Number(limit));

    const guides = await query;
    res.json({ count: guides.length, guides });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/guides/:id ─────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const guide = await User.findOne({ _id: req.params.id, role: 'guide' })
      .select('-savedGuides -savedItineraries -documents');

    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // Get recent reviews for this guide
    const reviews = await Review.find({ guide: guide._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ guide, reviews });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/guides/onboard ────────────────────────────
// Tourist applies to become a guide
router.post('/onboard', protect, async (req, res, next) => {
  try {
    const { city, languages, specialties, tagline, about, price, availability, photo } = req.body;

    if (req.user.role === 'guide') {
      return res.status(400).json({ message: 'You are already registered as a guide' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: 'guide',
        city,
        languages,
        specialties,
        tagline,
        about,
        price,
        availability,
        photo: photo || req.user.avatar,
        verified: false,
      },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Guide application submitted', user });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/guides/dashboard ───────────────────────────
// Guide's dashboard stats (must be placed BEFORE /:id to avoid conflict)
router.get('/dashboard/stats', protect, authorize('guide'), async (req, res, next) => {
  try {
    const guideId = req.user._id;

    const [totalBookings, confirmedBookings, pendingBookings, reviews] = await Promise.all([
      Booking.countDocuments({ guide: guideId }),
      Booking.countDocuments({ guide: guideId, status: 'confirmed' }),
      Booking.countDocuments({ guide: guideId, status: 'pending' }),
      Review.find({ guide: guideId }).sort({ createdAt: -1 }).limit(5).populate('author', 'name avatar'),
    ]);

    // Calculate earnings from completed bookings
    const earningsResult = await Booking.aggregate([
      { $match: { guide: guideId, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.guideFee' } } },
    ]);

    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    // Upcoming bookings
    const upcoming = await Booking.find({
      guide: guideId,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $gte: new Date() },
    })
      .populate('tourist', 'name avatar email')
      .populate('destination', 'name')
      .sort({ startDate: 1 })
      .limit(5);

    res.json({
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalEarnings,
        rating: req.user.rating,
        reviewCount: req.user.reviewCount,
        tours: req.user.tours,
      },
      recentReviews: reviews,
      upcomingBookings: upcoming,
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/guides/profile ─────────────────────────────
router.put('/profile', protect, authorize('guide'), async (req, res, next) => {
  try {
    const allowedFields = [
      'city', 'languages', 'specialties', 'tagline', 'about',
      'price', 'availability', 'photo',
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
