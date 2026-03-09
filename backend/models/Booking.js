const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  bookingId: { type: String, unique: true },
  tripType: { type: String, enum: ['half', 'full', 'multi'], default: 'full' },
  startDate: { type: Date, required: true },
  days: { type: Number, default: 1 },
  travelers: { type: Number, default: 1 },
  specialRequests: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, default: '' },
  pricing: {
    guideFee: { type: Number, default: 0 },
    groupSurcharge: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Auto-generate bookingId before saving
bookingSchema.pre('save', function () {
  if (!this.bookingId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 9000) + 1000);
    this.bookingId = `BK-${year}-${month}${random}`;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
