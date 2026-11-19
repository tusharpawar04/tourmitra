const mongoose = require('mongoose');

const slotReservationSchema = new mongoose.Schema({
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  status: { 
    type: String, 
    enum: ['held', 'confirmed', 'released'], 
    default: 'held' 
  },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date }, // For held slots
}, { _id: true });

const availabilitySchema = new mongoose.Schema({
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  working_days: [{ 
    type: String, 
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
  }],
  blocked_dates: [{ type: Date }], // Specific dates guide is unavailable
  slot_reservations: [slotReservationSchema],
}, { timestamps: true });

// Indexes
availabilitySchema.index({ guide: 1 });
availabilitySchema.index({ 'slot_reservations.start_time': 1, 'slot_reservations.status': 1 });

// Method to check if a time slot is available
availabilitySchema.methods.isSlotAvailable = function(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Check if date is blocked
  const dateStr = start.toISOString().split('T')[0];
  const isBlocked = this.blocked_dates.some(blocked => {
    return blocked.toISOString().split('T')[0] === dateStr;
  });
  
  if (isBlocked) return false;
  
  // Check if day of week is in working days
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[start.getDay()];
  
  if (!this.working_days.includes(dayName)) return false;
  
  // Check for conflicting reservations (held or confirmed)
  const hasConflict = this.slot_reservations.some(reservation => {
    if (reservation.status === 'released') return false;
    
    const resStart = new Date(reservation.start_time);
    const resEnd = new Date(reservation.end_time);
    
    // Check if there's any overlap
    return (start < resEnd && end > resStart);
  });
  
  return !hasConflict;
};

// Method to reserve a slot
availabilitySchema.methods.reserveSlot = function(startTime, endTime, bookingId, status = 'held') {
  const reservation = {
    start_time: startTime,
    end_time: endTime,
    booking_id: bookingId,
    status: status,
    created_at: new Date(),
  };
  
  // Set expiry for held slots (24 hours)
  if (status === 'held') {
    reservation.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  this.slot_reservations.push(reservation);
  return this.slot_reservations[this.slot_reservations.length - 1];
};

// Method to update reservation status
availabilitySchema.methods.updateReservationStatus = function(bookingId, newStatus) {
  const reservation = this.slot_reservations.find(
    res => res.booking_id && res.booking_id.toString() === bookingId.toString()
  );
  
  if (reservation) {
    reservation.status = newStatus;
    if (newStatus === 'confirmed') {
      reservation.expires_at = undefined; // Remove expiry
    }
  }
  
  return reservation;
};

// Method to release slot
availabilitySchema.methods.releaseSlot = function(bookingId) {
  return this.updateReservationStatus(bookingId, 'released');
};

// Static method to clean up expired holds
availabilitySchema.statics.cleanupExpiredHolds = async function() {
  const now = new Date();
  
  await this.updateMany(
    { 'slot_reservations.expires_at': { $lt: now }, 'slot_reservations.status': 'held' },
    { $set: { 'slot_reservations.$[elem].status': 'released' } },
    { arrayFilters: [{ 'elem.expires_at': { $lt: now }, 'elem.status': 'held' }] }
  );
};

module.exports = mongoose.model('Availability', availabilitySchema);
