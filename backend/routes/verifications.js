const express = require('express');
const Verification = require('../models/Verification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ── POST /api/verifications/submit ──────────────────────────
// Submit verification documents (guide only)
router.post(
  '/submit',
  protect,
  authorize('guide'),
  [
    body('documents').isArray({ min: 1 }).withMessage('At least one document is required'),
    body('documents.*.type').isIn(['aadhaar', 'pan', 'driving_license', 'passport', 'certificate', 'other']).withMessage('Invalid document type'),
    body('documents.*.url').isURL().withMessage('Valid document URL is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { documents } = req.body;

      // Check if verification already exists
      let verification = await Verification.findOne({ guide_id: req.user._id });

      if (verification) {
        // Update existing verification
        if (verification.status === 'verified') {
          return res.status(400).json({ message: 'Already verified. Cannot resubmit.' });
        }
        
        verification.submit(documents, req.user._id);
        await verification.save();
      } else {
        // Create new verification
        verification = new Verification({ guide_id: req.user._id });
        verification.submit(documents, req.user._id);
        await verification.save();
      }

      // Update user's verification_status
      await User.findByIdAndUpdate(req.user._id, { 
        verification_status: 'submitted',
        verified: false 
      });

      res.status(201).json({ 
        verification,
        message: 'Verification documents submitted. Under review.'
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/verifications/my ───────────────────────────────
// Get logged-in guide's verification status
router.get('/my', protect, authorize('guide'), async (req, res, next) => {
  try {
    let verification = await Verification.findOne({ guide_id: req.user._id });
    
    if (!verification) {
      verification = {
        guide_id: req.user._id,
        status: 'not_started',
        documents: [],
        message: 'Verification not started yet'
      };
    }

    res.json({ verification });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/verifications (admin) ──────────────────────────
// Get all verifications (admin only, with filtering)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const verifications = await Verification.find(filter)
      .populate('guide_id', 'name email phone city photo avatar')
      .populate('reviewed_by', 'name email')
      .sort({ createdAt: -1 });

    res.json({ 
      count: verifications.length,
      verifications 
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/verifications/:id ──────────────────────────────
// Get specific verification (admin or own)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const verification = await Verification.findById(req.params.id)
      .populate('guide_id', 'name email phone city photo avatar languages specialties')
      .populate('reviewed_by', 'name email');

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && verification.guide_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ verification });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/verifications/:id/approve ──────────────────────
// Approve verification (admin only)
router.put('/:id/approve', protect, authorize('admin'), async (req, res, next) => {
  try {
    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    if (verification.status === 'verified') {
      return res.status(400).json({ message: 'Already verified' });
    }

    // Approve verification
    verification.approve(req.user._id, req.body.notes);
    await verification.save();

    // Update user record
    await User.findByIdAndUpdate(verification.guide_id, {
      verified: true,
      verification_status: 'verified',
    });

    res.json({ 
      verification,
      message: 'Guide verification approved'
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/verifications/:id/reject ───────────────────────
// Reject verification (admin only)
router.put('/:id/reject', protect, authorize('admin'), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Reject verification
    verification.reject(req.user._id, reason);
    await verification.save();

    // Update user record
    await User.findByIdAndUpdate(verification.guide_id, {
      verified: false,
      verification_status: 'rejected',
    });

    res.json({ 
      verification,
      message: 'Verification rejected'
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/verifications/:id/request-info ─────────────────
// Request additional information (admin only)
router.put('/:id/request-info', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const verification = await Verification.findById(req.params.id);

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    // Request additional info
    verification.requestAdditionalInfo(req.user._id, reason);
    await verification.save();

    // Update user record
    await User.findByIdAndUpdate(verification.guide_id, {
      verification_status: 'additional_info_required',
    });

    res.json({ 
      verification,
      message: 'Additional information requested'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
