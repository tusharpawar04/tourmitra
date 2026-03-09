const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true },
}, { timestamps: true });

// Prevent duplicate reviews (one review per tourist per guide)
reviewSchema.index({ author: 1, guide: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
