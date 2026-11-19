/**
 * Clear all data from Tourmitra DB for alpha testing
 * Run: node scripts/clearDatabase.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const GuidePackage = require('../models/GuidePackage');
const Availability = require('../models/Availability');
const Ledger = require('../models/Ledger');
const Verification = require('../models/Verification');

// Alpha destinations - only Agra active
const alphaDestinations = [
  {
    name: 'Agra',
    country: 'India',
    state: 'Uttar Pradesh',
    tag: 'Heritage',
    rating: 0,
    reviewCount: 0,
    price: 1000,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop',
    description: 'Home of the Taj Mahal — a testament to eternal love. Explore Mughal architecture and rich history with our verified local guides.',
    highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itmad-ud-Daulah'],
    guideCount: 0,
    duration: '1-2 days',
    bestTime: 'October - March',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=500&fit=crop',
    ],
    isActive: true,
  },
  {
    name: 'Jaipur',
    country: 'India',
    state: 'Rajasthan',
    tag: 'Heritage',
    rating: 0,
    reviewCount: 0,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop',
    description: 'The Pink City awaits! We are onboarding verified guides and will launch soon.',
    highlights: [],
    guideCount: 0,
    duration: '2-4 days',
    bestTime: 'October - March',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Launching soon! We\'re onboarding the best heritage storytellers in Rajasthan.',
  },
  {
    name: 'Varanasi',
    country: 'India',
    state: 'Uttar Pradesh',
    tag: 'Spiritual',
    rating: 0,
    reviewCount: 0,
    price: 800,
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&h=400&fit=crop',
    description: 'The spiritual capital will be available soon with expert spiritual guides.',
    highlights: [],
    guideCount: 0,
    duration: '2-3 days',
    bestTime: 'November - February',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Coming soon! Connecting you with third-generation Varanasi guides.',
  },
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    tag: 'Beach & Culture',
    rating: 0,
    reviewCount: 0,
    price: 1500,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop',
    description: 'Beach paradise and Portuguese heritage coming soon!',
    highlights: [],
    guideCount: 0,
    duration: '3-5 days',
    bestTime: 'November - February',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Beach season is coming! Stay tuned for our Goa launch.',
  },
  {
    name: 'Kerala',
    country: 'India',
    state: 'Kerala',
    tag: 'Nature',
    rating: 0,
    reviewCount: 0,
    price: 1800,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop',
    description: 'Backwaters and tea plantations await! Launching soon.',
    highlights: [],
    guideCount: 0,
    duration: '4-6 days',
    bestTime: 'September - March',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'God\'s Own Country is coming! Wellness and nature guides in the works.',
  },
  {
    name: 'Ladakh',
    country: 'India',
    state: 'Ladakh',
    tag: 'Adventure',
    rating: 0,
    reviewCount: 0,
    price: 2200,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=400&fit=crop',
    description: 'High altitude adventures coming in summer season!',
    highlights: [],
    guideCount: 0,
    duration: '5-7 days',
    bestTime: 'June - September',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Mountain magic coming! Ladakh guides launching for summer 2027.',
  },
  {
    name: 'Udaipur',
    country: 'India',
    state: 'Rajasthan',
    tag: 'Heritage',
    rating: 0,
    reviewCount: 0,
    price: 1400,
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&h=400&fit=crop',
    description: 'City of Lakes launching soon with royal heritage guides!',
    highlights: [],
    guideCount: 0,
    duration: '2-3 days',
    bestTime: 'September - March',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Venice of the East coming soon! Royal heritage awaits.',
  },
  {
    name: 'Delhi',
    country: 'India',
    state: 'Delhi',
    tag: 'Culture',
    rating: 0,
    reviewCount: 0,
    price: 900,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop',
    description: 'Capital city tours and food walks launching soon!',
    highlights: [],
    guideCount: 0,
    duration: '2-4 days',
    bestTime: 'October - March',
    gallery: [],
    isActive: false,
    comingSoonMessage: 'Delhi food and heritage walks coming soon!',
  },
];

const clearAndSeed = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing ALL data from database...\n');

    // Delete everything
    await User.deleteMany({});
    await Destination.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await GuidePackage.deleteMany({});
    await Availability.deleteMany({});
    await Ledger.deleteMany({});
    await Verification.deleteMany({});

    console.log('✅ All users cleared');
    console.log('✅ All destinations cleared');
    console.log('✅ All reviews cleared');
    console.log('✅ All bookings cleared');
    console.log('✅ All packages cleared');
    console.log('✅ All availability cleared');
    console.log('✅ All ledger entries cleared');
    console.log('✅ All verifications cleared');

    // Seed alpha destinations
    console.log('\n🌍 Creating alpha destinations...');
    const createdDests = await Destination.insertMany(alphaDestinations);
    console.log(`✅ ${createdDests.length} destinations created`);
    console.log(`   - Agra: ACTIVE ✅`);
    console.log(`   - Others: Coming Soon 🔜`);

    // Create admin user
    console.log('\n👤 Creating admin user...');
    const admin = new User({
      name: 'Admin',
      email: 'admin@tourmitra.com',
      password: 'admin123',
      role: 'admin',
    });
    await admin.save();
    console.log('✅ Admin user created');

    console.log('\n🎉 Database cleared and alpha setup complete!');
    console.log('\n📋 Admin credentials:');
    console.log('   Email: admin@tourmitra.com');
    console.log('   Password: admin123');
    console.log('\n🚀 Alpha is ready! Only Agra is active for guide onboarding.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

clearAndSeed();
