const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ── POST /api/reviews ───────────────────────────────────
router.post(
  '/',
  protect,
  [
    body('guideId').notEmpty().withMessage('Guide ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('text').trim().notEmpty().withMessage('Review text is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { guideId, destinationId, rating, text } = req.body;

      // Verify guide exists
      const guide = await User.findOne({ _id: guideId, role: 'guide' });
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      // Can't review yourself
      if (guideId === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot review yourself' });
      }

      const review = await Review.create({
        author: req.user._id,
        guide: guideId,
        destination: destinationId || null,
        rating,
        text,
      });

      // Update guide's average rating
      const allReviews = await Review.find({ guide: guideId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await User.findByIdAndUpdate(guideId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      });

      // Populate author before returning
      await review.populate('author', 'name avatar');

      res.status(201).json({ review });
    } catch (err) {
      // Handle duplicate review
      if (err.code === 11000) {
        return res.status(400).json({ message: 'You have already reviewed this guide' });
      }
      next(err);
    }
  }
);

// ── GET /api/reviews/guide/:id ──────────────────────────
router.get('/guide/:id', async (req, res, next) => {
  try {
    const reviews = await Review.find({ guide: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/reviews/destination/:id ────────────────────
router.get('/destination/:id', async (req, res, next) => {
  try {
    const reviews = await Review.find({ destination: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
