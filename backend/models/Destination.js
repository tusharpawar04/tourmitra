const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  country: { type: String, default: 'India' },
  state: { type: String, default: '' },
  tag: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  highlights: [String],
  guideCount: { type: Number, default: 0 },
  duration: { type: String, default: '' },
  bestTime: { type: String, default: '' },
  gallery: [String],
}, { timestamps: true });

// Text index for search
destinationSchema.index({ name: 'text', description: 'text', state: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
