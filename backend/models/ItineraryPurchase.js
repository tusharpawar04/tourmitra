const mongoose = require('mongoose');

const itineraryPurchaseSchema = new mongoose.Schema({
  itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Payment details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, default: 'test_mode' },
  transactionId: { type: String, default: '' },
  
  // Platform fee (creator gets 85%, platform gets 15%)
  platformFee: { type: Number, default: 0 },
  creatorEarning: { type: Number, default: 0 },
  
  // Access
  purchaseDate: { type: Date, default: Date.now },
  accessGranted: { type: Boolean, default: true },
  
  // Feedback
  wasHelpful: { type: Boolean, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  review: { type: String, default: '' },
  reviewDate: { type: Date, default: null },
  
}, { timestamps: true });

// Indexes
itineraryPurchaseSchema.index({ buyer: 1, purchaseDate: -1 });
itineraryPurchaseSchema.index({ itinerary: 1 });
itineraryPurchaseSchema.index({ 'createdAt': 1 }); // For time-based queries

module.exports = mongoose.model('ItineraryPurchase', itineraryPurchaseSchema);
