const mongoose = require('mongoose');

// Valid state transitions
const VALID_TRANSITIONS = {
  requested: ['accepted', 'declined', 'expired', 'cancelled'],
  accepted: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed', 'disputed'],
  completed: [],
  declined: [],
  cancelled: [],
  expired: [],
  disputed: ['completed', 'cancelled']
};

const bookingSchema = new mongoose.Schema({
  tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'GuidePackage' },
  bookingId: { type: String, unique: true },
  
  // Trip details
  tripType: { type: String, enum: ['half', 'full', 'multi'], default: 'full' }, // Legacy field
  startDate: { type: Date, required: true },
  start_time: { type: Date }, // Specific start time
  end_time: { type: Date }, // Calculated from start_time + package duration
  days: { type: Number, default: 1 },
  travelers: { type: Number, default: 1 },
  specialRequests: { type: String, default: '' },
  
  // State machine
  status: {
    type: String,
    enum: ['requested', 'accepted', 'confirmed', 'in_progress', 'completed', 'declined', 'cancelled', 'expired'],
    default: 'requested',
  },
  
  // Payment state (separate from booking state)
  payment_status: {
    type: String,
    enum: ['pending', 'intent_recorded', 'held', 'paid', 'refunded'],
    default: 'pending',
  },
  
  paymentMethod: { type: String, default: '' },
  
  // Pricing snapshot (immutable once created)
  pricing: {
    guideFee: { type: Number, default: 0 },
    groupSurcharge: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    guide_payout: { type: Number, default: 0 },
  },
  
  // Slot reservation references
  slot_reservation_ids: [{ type: mongoose.Schema.Types.ObjectId }],
  
  // Quote verification
  quote_hash: { type: String },
  
  // Cancellation
  cancellation_reason: { type: String },
  cancelled_at: { type: Date },
  cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // State history for audit
  state_history: [{
    from_state: { type: String },
    to_state: { type: String },
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changed_at: { type: Date, default: Date.now },
    reason: { type: String },
  }],
  
}, { timestamps: true });

// Indexes
bookingSchema.index({ guide: 1, status: 1, startDate: 1 });
bookingSchema.index({ tourist: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });

// Auto-generate bookingId before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 9000) + 1000);
    this.bookingId = `BK-${year}-${month}-${day}-${random}`;
  }
  next();
});

// Method: Validate state transition
bookingSchema.methods.canTransitionTo = function(newState) {
  const validNextStates = VALID_TRANSITIONS[this.status] || [];
  return validNextStates.includes(newState);
};

// Method: Change state with validation
bookingSchema.methods.changeState = function(newState, userId, reason = '') {
  if (!this.canTransitionTo(newState)) {
    throw new Error(`Invalid state transition: ${this.status} → ${newState}`);
  }
  
  // Record state change in history
  this.state_history.push({
    from_state: this.status,
    to_state: newState,
    changed_by: userId,
    changed_at: new Date(),
    reason,
  });
  
  const oldState = this.status;
  this.status = newState;
  
  return { from: oldState, to: newState };
};

// Method: Check if booking can be cancelled
bookingSchema.methods.canBeCancelledBy = function(userId) {
  // Tourist can cancel if status is requested, accepted, or confirmed (with policy check)
  if (this.tourist.toString() === userId.toString()) {
    return ['requested', 'accepted', 'confirmed'].includes(this.status);
  }
  
  // Guide can decline if status is requested
  if (this.guide.toString() === userId.toString()) {
    return this.status === 'requested';
  }
  
  return false;
};

// Method: Check if within cancellation policy
bookingSchema.methods.isWithinCancellationPolicy = function() {
  const hoursUntilTour = (new Date(this.startDate) - new Date()) / (1000 * 60 * 60);
  return hoursUntilTour >= 24;
};

// Method: Check if eligible for review
bookingSchema.methods.isEligibleForReview = function() {
  return this.status === 'completed';
};

module.exports = mongoose.model('Booking', bookingSchema);
