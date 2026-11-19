const mongoose = require('mongoose');

const guidePackageSchema = new mongoose.Schema({
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  duration_hours: { type: Number, required: true, min: 1, max: 24 },
  base_price: { type: Number, required: true, min: 0 },
  max_guests: { type: Number, required: true, min: 1, max: 20, default: 5 },
  base_capacity: { type: Number, default: 3 }, // Guests included in base price
  extra_guest_fee: { type: Number, default: 200 }, // Per guest beyond base_capacity
  inclusions: [{ type: String, trim: true }],
  exclusions: [{ type: String, trim: true }],
  is_active: { type: Boolean, default: true },
  meeting_point: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

// Indexes
guidePackageSchema.index({ guide: 1, is_active: 1 });
guidePackageSchema.index({ guide: 1, duration_hours: 1 });

// Validation: Ensure price is within suggested ranges based on duration
guidePackageSchema.pre('save', function(next) {
  const ranges = {
    2: { min: 700, max: 1500, name: '2-Hour' },
    4: { min: 1500, max: 2500, name: '4-Hour' },
    8: { min: 2200, max: 4000, name: '8-Hour' }
  };
  
  const range = ranges[this.duration_hours];
  if (range) {
    // Allow ±30% variance from suggested range
    const minAllowed = range.min * 0.7;
    const maxAllowed = range.max * 1.3;
    
    if (this.base_price < minAllowed || this.base_price > maxAllowed) {
      console.warn(`Warning: ${this.title} price ₹${this.base_price} is outside suggested range ₹${range.min}-${range.max}`);
    }
  }
  
  next();
});

module.exports = mongoose.model('GuidePackage', guidePackageSchema);
