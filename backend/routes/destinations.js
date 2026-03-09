const express = require('express');
const Destination = require('../models/Destination');

const router = express.Router();

// ── GET /api/destinations ───────────────────────────────
// Supports: ?tag=Heritage&minPrice=500&maxPrice=2000&sort=rating&search=jaipur
router.get('/', async (req, res, next) => {
  try {
    const { tag, minPrice, maxPrice, sort, search, limit } = req.query;
    const filter = {};

    if (tag && tag !== 'All') filter.tag = tag;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Destination.find(filter);

    // Sorting
    if (sort === 'price-low') query = query.sort({ price: 1 });
    else if (sort === 'price-high') query = query.sort({ price: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ rating: -1 }); // default: recommended

    if (limit) query = query.limit(Number(limit));

    const destinations = await query;
    res.json({ count: destinations.length, destinations });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/destinations/:id ───────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ destination });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/destinations (Admin only) ─────────────────
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ destination });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
