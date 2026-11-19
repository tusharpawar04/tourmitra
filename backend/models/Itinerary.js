const mongoose = require('mongoose');

// Individual day in itinerary
const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  activities: [{
    time: String,
    activity: String,
    location: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    duration: String,
    cost: Number,
    notes: String,
  }],
  meals: [{
    type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
    restaurant: String,
    location: String,
    estimatedCost: Number,
  }],
  accommodation: {
    name: String,
    type: String,
    location: String,
    estimatedCost: Number,
  },
});

const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  
  // Basic info
  duration: { type: Number, required: true }, // number of days
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
  category: { type: String, enum: ['Heritage', 'Adventure', 'Spiritual', 'Nature', 'Beach & Culture', 'Food Tours', 'Photography', 'Family', 'Romantic', 'Solo'], default: 'Heritage' },
  
  // Description
  description: { type: String, required: true },
  highlights: [String],
  included: [String], // What's included in the price
  notIncluded: [String],
  bestSeason: { type: String, default: '' },
  
  // Pricing
  price: { type: Number, required: true }, // Price to purchase the itinerary
  currency: { type: String, default: 'INR' },
  estimatedTripCost: { type: Number, default: 0 }, // Total estimated cost to follow the itinerary
  
  // Map & Route
  coverImage: { type: String, default: '' },
  routeMapUrl: { type: String, default: '' }, // URL to uploaded route map image
  mapData: {
    center: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    zoom: { type: Number, default: 12 },
    markers: [{
      name: String,
      lat: Number,
      lng: Number,
      day: Number,
    }],
  },
  
  // Days breakdown
  days: [daySchema],
  
  // Logistics
  transportationNotes: { type: String, default: '' },
  packingList: [String],
  travelTips: [String],
  
  // Engagement
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isVerified: { type: Boolean, default: false }, // Admin verified quality
  isFeatured: { type: Boolean, default: false },
  
  // Tags
  tags: [String],
  
}, { timestamps: true });

// Indexes
itinerarySchema.index({ destination: 1, status: 1 });
itinerarySchema.index({ creator: 1 });
itinerarySchema.index({ rating: -1, purchaseCount: -1 });
itinerarySchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for creator info
itinerarySchema.virtual('purchases', {
  ref: 'ItineraryPurchase',
  localField: '_id',
  foreignField: 'itinerary',
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
