const express = require('express');
const GuidePackage = require('../models/GuidePackage');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ── GET /api/packages/guide/:guideId ────────────────────────
// Get all packages for a specific guide (public)
router.get('/guide/:guideId', async (req, res, next) => {
  try {
    const packages = await GuidePackage.find({
      guide: req.params.guideId,
      is_active: true
    }).sort({ duration_hours: 1 });

    res.json({ count: packages.length, packages });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/packages ───────────────────────────────────────
// Create new package (guide only)
router.post(
  '/',
  protect,
  authorize('guide'),
  [
    body('title').trim().notEmpty().withMessage('Package title is required'),
    body('duration_hours').isInt({ min: 1, max: 24 }).withMessage('Duration must be 1-24 hours'),
    body('base_price').isInt({ min: 100 }).withMessage('Base price must be at least ₹100'),
    body('max_guests').isInt({ min: 1, max: 20 }).withMessage('Max guests must be 1-20'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const packageData = {
        guide: req.user._id,
        title: req.body.title,
        duration_hours: req.body.duration_hours,
        base_price: req.body.base_price,
        max_guests: req.body.max_guests,
        base_capacity: req.body.base_capacity || 3,
        extra_guest_fee: req.body.extra_guest_fee || 200,
        inclusions: req.body.inclusions || [],
        exclusions: req.body.exclusions || [],
        meeting_point: req.body.meeting_point || '',
        description: req.body.description || '',
        is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      };

      const newPackage = await GuidePackage.create(packageData);

      res.status(201).json({ package: newPackage });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/packages/batch ─────────────────────────────────
// Create multiple packages at once (used during onboarding)
router.post(
  '/batch',
  protect,
  authorize('guide'),
  async (req, res, next) => {
    try {
      const { packages } = req.body;

      if (!Array.isArray(packages) || packages.length === 0) {
        return res.status(400).json({ message: 'Packages array is required' });
      }

      // Add guide ID to each package
      const packagesWithGuide = packages.map(pkg => ({
        ...pkg,
        guide: req.user._id,
      }));

      const createdPackages = await GuidePackage.insertMany(packagesWithGuide);

      res.status(201).json({ 
        count: createdPackages.length, 
        packages: createdPackages 
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/packages/my ─────────────────────────────────────
// Get logged-in guide's packages
router.get('/my', protect, authorize('guide'), async (req, res, next) => {
  try {
    const packages = await GuidePackage.find({ guide: req.user._id })
      .sort({ duration_hours: 1 });

    res.json({ count: packages.length, packages });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/packages/:id ────────────────────────────────────
// Update package (guide only, own packages only)
router.put(
  '/:id',
  protect,
  authorize('guide'),
  async (req, res, next) => {
    try {
      const packageDoc = await GuidePackage.findOne({
        _id: req.params.id,
        guide: req.user._id
      });

      if (!packageDoc) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Update allowed fields
      const allowedFields = [
        'title', 'duration_hours', 'base_price', 'max_guests',
        'base_capacity', 'extra_guest_fee', 'inclusions', 'exclusions',
        'meeting_point', 'description', 'is_active'
      ];

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          packageDoc[field] = req.body[field];
        }
      });

      await packageDoc.save();

      res.json({ package: packageDoc });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/packages/:id ─────────────────────────────────
// Delete package (guide only, own packages only)
router.delete('/:id', protect, authorize('guide'), async (req, res, next) => {
  try {
    const packageDoc = await GuidePackage.findOne({
      _id: req.params.id,
      guide: req.user._id
    });

    if (!packageDoc) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Soft delete by setting is_active to false
    packageDoc.is_active = false;
    await packageDoc.save();

    res.json({ message: 'Package deactivated', package: packageDoc });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
