const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const ItineraryPurchase = require('../models/ItineraryPurchase');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/itineraries
// @desc    Get all published itineraries (public with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { destination, category, minPrice, maxPrice, minDays, maxDays, search, sort = '-purchaseCount' } = req.query;
    
    const query = { status: 'published' };
    
    if (destination) query.destination = destination;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (minDays || maxDays) {
      query.duration = {};
      if (minDays) query.duration.$gte = parseInt(minDays);
      if (maxDays) query.duration.$lte = parseInt(maxDays);
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    const itineraries = await Itinerary.find(query)
      .populate('creator', 'name photo city verified')
      .populate('destination', 'name image state')
      .sort(sort)
      .lean();
    
    res.json({ itineraries });
  } catch (err) {
    console.error('Get itineraries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/itineraries/my
// @desc    Get logged-in user's created itineraries
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ creator: req.user._id })
      .populate('destination', 'name image')
      .sort('-createdAt')
      .lean();
    
    res.json({ itineraries });
  } catch (err) {
    console.error('Get my itineraries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/itineraries/purchased
// @desc    Get logged-in user's purchased itineraries
// @access  Private
router.get('/purchased', protect, async (req, res) => {
  try {
    const purchases = await ItineraryPurchase.find({ 
      buyer: req.user._id,
      paymentStatus: 'completed'
    })
      .populate({
        path: 'itinerary',
        populate: [
          { path: 'creator', select: 'name photo city' },
          { path: 'destination', select: 'name image' }
        ]
      })
      .sort('-purchaseDate')
      .lean();
    
    const itineraries = purchases.map(p => ({
      ...p.itinerary,
      purchaseDate: p.purchaseDate,
      purchaseId: p._id,
      wasHelpful: p.wasHelpful,
    }));
    
    res.json({ itineraries });
  } catch (err) {
    console.error('Get purchased itineraries error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/itineraries/:id
// @desc    Get single itinerary by ID
// @access  Public (but full details only if purchased or owner)
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('creator', 'name photo city rating reviewCount verified')
      .populate('destination', 'name image state country')
      .lean();
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Check access rights
    let hasFullAccess = false;
    if (req.user) {
      // Owner always has access
      if (itinerary.creator._id.toString() === req.user._id.toString()) {
        hasFullAccess = true;
      } else {
        // Check if user purchased it
        const purchase = await ItineraryPurchase.findOne({
          itinerary: itinerary._id,
          buyer: req.user._id,
          paymentStatus: 'completed',
        });
        hasFullAccess = !!purchase;
      }
    }
    
    // If no access, hide detailed day-by-day breakdown
    if (!hasFullAccess && itinerary.status === 'published') {
      // Show preview only
      itinerary.days = itinerary.days.slice(0, 1).map(day => ({
        ...day,
        activities: day.activities.slice(0, 2),
      }));
      itinerary.daysPreviewOnly = true;
    }
    
    // Increment view count
    await Itinerary.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    res.json({ itinerary, hasFullAccess });
  } catch (err) {
    console.error('Get itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/itineraries
// @desc    Create new itinerary
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const itinerary = new Itinerary({
      ...req.body,
      creator: req.user._id,
    });
    
    await itinerary.save();
    
    const populated = await Itinerary.findById(itinerary._id)
      .populate('creator', 'name photo')
      .populate('destination', 'name image');
    
    res.status(201).json({ itinerary: populated });
  } catch (err) {
    console.error('Create itinerary error:', err);
    res.status(400).json({ error: err.message || 'Failed to create itinerary' });
  }
});

// @route   PUT /api/itineraries/:id
// @desc    Update itinerary (owner only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    // Check ownership
    if (itinerary.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this itinerary' });
    }
    
    // Update fields
    Object.assign(itinerary, req.body);
    await itinerary.save();
    
    const populated = await Itinerary.findById(itinerary._id)
      .populate('creator', 'name photo')
      .populate('destination', 'name image');
    
    res.json({ itinerary: populated });
  } catch (err) {
    console.error('Update itinerary error:', err);
    res.status(400).json({ error: err.message || 'Failed to update itinerary' });
  }
});

// @route   PUT /api/itineraries/:id/publish
// @desc    Publish itinerary (change status to published)
// @access  Private
router.put('/:id/publish', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    if (itinerary.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    itinerary.status = 'published';
    await itinerary.save();
    
    res.json({ itinerary });
  } catch (err) {
    console.error('Publish itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/itineraries/:id
// @desc    Delete itinerary (owner only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    if (itinerary.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await itinerary.deleteOne();
    res.json({ message: 'Itinerary deleted' });
  } catch (err) {
    console.error('Delete itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/itineraries/:id/purchase
// @desc    Purchase an itinerary (TEST MODE)
// @access  Private
router.post('/:id/purchase', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    
    if (itinerary.status !== 'published') {
      return res.status(400).json({ error: 'Itinerary is not available for purchase' });
    }
    
    // Check if already purchased
    const existingPurchase = await ItineraryPurchase.findOne({
      itinerary: itinerary._id,
      buyer: req.user._id,
      paymentStatus: 'completed',
    });
    
    if (existingPurchase) {
      return res.status(400).json({ error: 'You have already purchased this itinerary' });
    }
    
    // Cannot buy your own itinerary
    if (itinerary.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot purchase your own itinerary' });
    }
    
    // Calculate fees (15% platform fee)
    const platformFee = Math.round(itinerary.price * 0.15);
    const creatorEarning = itinerary.price - platformFee;
    
    // Create purchase record (TEST MODE - auto-complete)
    const purchase = new ItineraryPurchase({
      itinerary: itinerary._id,
      buyer: req.user._id,
      amount: itinerary.price,
      platformFee,
      creatorEarning,
      paymentStatus: 'completed', // TEST MODE
      paymentMethod: 'test_mode',
      transactionId: `TEST_${Date.now()}`,
      accessGranted: true,
    });
    
    await purchase.save();
    
    // Update itinerary purchase count
    itinerary.purchaseCount += 1;
    await itinerary.save();
    
    res.status(201).json({ 
      message: 'Itinerary purchased successfully (TEST MODE)',
      purchase,
      itinerary,
    });
  } catch (err) {
    console.error('Purchase itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/itineraries/:id/review
// @desc    Leave a review for purchased itinerary
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, review, wasHelpful } = req.body;
    
    // Find purchase
    const purchase = await ItineraryPurchase.findOne({
      itinerary: req.params.id,
      buyer: req.user._id,
      paymentStatus: 'completed',
    });
    
    if (!purchase) {
      return res.status(403).json({ error: 'You must purchase this itinerary before reviewing' });
    }
    
    // Update purchase with review
    purchase.rating = rating;
    purchase.review = review;
    purchase.wasHelpful = wasHelpful;
    purchase.reviewDate = new Date();
    await purchase.save();
    
    // Recalculate itinerary rating
    const allPurchases = await ItineraryPurchase.find({
      itinerary: req.params.id,
      rating: { $gt: 0 },
    });
    
    if (allPurchases.length > 0) {
      const avgRating = allPurchases.reduce((sum, p) => sum + p.rating, 0) / allPurchases.length;
      await Itinerary.findByIdAndUpdate(req.params.id, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allPurchases.length,
      });
    }
    
    res.json({ message: 'Review submitted successfully', purchase });
  } catch (err) {
    console.error('Review itinerary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/itineraries/:id/reviews
// @desc    Get reviews for an itinerary
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await ItineraryPurchase.find({
      itinerary: req.params.id,
      rating: { $gt: 0 },
    })
      .populate('buyer', 'name photo')
      .sort('-reviewDate')
      .lean();
    
    res.json({ reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
