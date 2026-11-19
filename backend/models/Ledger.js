const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  tourist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Financial details (snapshot from booking)
  total_amount: { type: Number, required: true },
  guide_fee: { type: Number, required: true },
  commission: { type: Number, required: true },
  guide_payout: { type: Number, required: true },
  platform_fee: { type: Number, required: true },
  tax: { type: Number, required: true },
  
  // Payment status (mirrors booking but specific to payment)
  payment_status: {
    type: String,
    enum: ['pending', 'intent_recorded', 'held', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  
  // Payment intent details (test mode for alpha)
  payment_intent: {
    method: { type: String }, // 'upi', 'card', 'netbanking', etc.
    recorded_at: { type: Date },
    test_mode: { type: Boolean, default: true },
    transaction_id: { type: String },
  },
  
  // Payout tracking
  payout_status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'paid', 'failed'],
    default: 'pending',
  },
  
  payout_approved_at: { type: Date },
  payout_approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payout_completed_at: { type: Date },
  payout_method: { type: String },
  payout_reference: { type: String },
  
  // Refund tracking
  refund_amount: { type: Number, default: 0 },
  refund_reason: { type: String },
  refunded_at: { type: Date },
  
  // Notes and history
  admin_notes: { type: String },
  history: [{
    action: { type: String }, // 'created', 'payment_recorded', 'refunded', 'payout_approved'
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
  }],
  
}, { timestamps: true });

// Indexes
ledgerSchema.index({ booking_id: 1 });
ledgerSchema.index({ guide_id: 1, payout_status: 1 });
ledgerSchema.index({ tourist_id: 1 });

// Method: Record payment intent
ledgerSchema.methods.recordPaymentIntent = function(method, userId) {
  this.payment_status = 'intent_recorded';
  this.payment_intent = {
    method,
    recorded_at: new Date(),
    test_mode: true,
  };
  
  this.history.push({
    action: 'payment_intent_recorded',
    user: userId,
    timestamp: new Date(),
    notes: `Payment method: ${method} (TEST MODE)`,
  });
};

// Method: Approve payout
ledgerSchema.methods.approvePayout = function(adminId, notes = '') {
  if (this.payment_status !== 'intent_recorded' && this.payment_status !== 'paid') {
    throw new Error('Payment must be recorded before payout approval');
  }
  
  this.payout_status = 'approved';
  this.payout_approved_at = new Date();
  this.payout_approved_by = adminId;
  
  this.history.push({
    action: 'payout_approved',
    user: adminId,
    timestamp: new Date(),
    notes: notes || 'Payout approved for guide',
  });
};

// Method: Process refund
ledgerSchema.methods.processRefund = function(amount, reason, userId) {
  this.payment_status = 'refunded';
  this.refund_amount = amount;
  this.refund_reason = reason;
  this.refunded_at = new Date();
  
  // Cancel pending payout if exists
  if (this.payout_status === 'pending' || this.payout_status === 'approved') {
    this.payout_status = 'failed';
  }
  
  this.history.push({
    action: 'refunded',
    user: userId,
    timestamp: new Date(),
    notes: `Refunded ₹${amount}: ${reason}`,
  });
};

// Static method: Get guide earnings summary
ledgerSchema.statics.getGuideEarnings = async function(guideId) {
  const result = await this.aggregate([
    {
      $match: {
        guide_id: guideId,
        payment_status: { $in: ['intent_recorded', 'paid'] },
      }
    },
    {
      $group: {
        _id: null,
        total_bookings: { $sum: 1 },
        total_earned: { $sum: '$guide_payout' },
        total_commission: { $sum: '$commission' },
        pending_payout: {
          $sum: {
            $cond: [
              { $eq: ['$payout_status', 'pending'] },
              '$guide_payout',
              0
            ]
          }
        },
        approved_payout: {
          $sum: {
            $cond: [
              { $eq: ['$payout_status', 'approved'] },
              '$guide_payout',
              0
            ]
          }
        },
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : {
    total_bookings: 0,
    total_earned: 0,
    total_commission: 0,
    pending_payout: 0,
    approved_payout: 0,
  };
};

module.exports = mongoose.model('Ledger', ledgerSchema);
