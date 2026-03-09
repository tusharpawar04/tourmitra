/**
 * Seed Tourmitra DB with mock data from the frontend mockData.js
 * Run: node utils/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');

const destinations = [
  {
    name: 'Jaipur', country: 'India', state: 'Rajasthan', tag: 'Heritage',
    rating: 4.8, reviewCount: 1240, price: 1200,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop',
    description: 'The Pink City — a living museum of royal palaces, vibrant bazaars, and centuries of Rajput grandeur.',
    highlights: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort'],
    guideCount: 48, duration: '2-4 days', bestTime: 'October - March',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=500&fit=crop',
    ],
  },
  {
    name: 'Varanasi', country: 'India', state: 'Uttar Pradesh', tag: 'Spiritual',
    rating: 4.9, reviewCount: 980, price: 800,
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&h=400&fit=crop',
    description: 'The oldest living city in the world. Witness the mystical Ganga Aarti.',
    highlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath Temple', 'Sarnath', 'Boat ride at dawn'],
    guideCount: 35, duration: '2-3 days', bestTime: 'November - February',
    gallery: ['https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&h=500&fit=crop'],
  },
  {
    name: 'Goa', country: 'India', state: 'Goa', tag: 'Beach & Culture',
    rating: 4.7, reviewCount: 1560, price: 1500,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop',
    description: 'Sun, sand, and a 500-year Portuguese legacy.',
    highlights: ['Old Goa Churches', 'Dudhsagar Falls', 'Anjuna Flea Market'],
    guideCount: 62, duration: '3-5 days', bestTime: 'November - February',
    gallery: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=500&fit=crop'],
  },
  {
    name: 'Kerala', country: 'India', state: 'Kerala', tag: 'Nature',
    rating: 4.9, reviewCount: 870, price: 1800,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop',
    description: "God's Own Country — where emerald backwaters meet misty tea plantations.",
    highlights: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Periyar Wildlife', 'Kathakali'],
    guideCount: 55, duration: '4-6 days', bestTime: 'September - March',
    gallery: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop'],
  },
  {
    name: 'Agra', country: 'India', state: 'Uttar Pradesh', tag: 'Heritage',
    rating: 4.8, reviewCount: 3200, price: 1000,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop',
    description: 'Home of the Taj Mahal — a testament to eternal love.',
    highlights: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    guideCount: 72, duration: '1-2 days', bestTime: 'October - March',
    gallery: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=500&fit=crop'],
  },
  {
    name: 'Ladakh', country: 'India', state: 'Ladakh', tag: 'Adventure',
    rating: 4.9, reviewCount: 420, price: 2200,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&h=400&fit=crop',
    description: 'The Land of High Passes — where earth meets sky.',
    highlights: ['Pangong Lake', 'Nubra Valley', 'Khardung La', 'Hemis Monastery'],
    guideCount: 28, duration: '5-7 days', bestTime: 'June - September',
    gallery: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=500&fit=crop'],
  },
  {
    name: 'Udaipur', country: 'India', state: 'Rajasthan', tag: 'Heritage',
    rating: 4.8, reviewCount: 760, price: 1400,
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&h=400&fit=crop',
    description: 'The Venice of the East — a city of lakes, palaces, and romance.',
    highlights: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon ki Bari'],
    guideCount: 38, duration: '2-3 days', bestTime: 'September - March',
    gallery: ['https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&h=500&fit=crop'],
  },
  {
    name: 'Delhi', country: 'India', state: 'Delhi', tag: 'Culture',
    rating: 4.6, reviewCount: 2800, price: 900,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop',
    description: "Where ancient empires meet modern India.",
    highlights: ['Red Fort', 'Qutub Minar', "Humayun's Tomb", 'Chandni Chowk', 'India Gate'],
    guideCount: 85, duration: '2-4 days', bestTime: 'October - March',
    gallery: ['https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=500&fit=crop'],
  },
];

const guides = [
  {
    name: 'Rajesh Sharma', email: 'rajesh@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Jaipur',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    rating: 4.9, reviewCount: 234, languages: ['English', 'Hindi', 'French'],
    specialties: ['Heritage', 'Photography'],
    tagline: "Heritage storyteller with 12 years of experience in Rajasthan's royal history",
    price: 1500, verified: true, tours: 520,
    about: 'Born and raised in the Pink City, I have spent over a decade sharing the stories behind every arch, every fresco, and every hidden courtyard of Jaipur.',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    name: 'Priya Nair', email: 'priya@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Kerala',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    rating: 4.8, reviewCount: 189, languages: ['English', 'Hindi', 'Malayalam'],
    specialties: ['Nature', 'Wellness'],
    tagline: 'Ayurveda & backwater specialist — experience Kerala beyond the tourist trail',
    price: 1800, verified: true, tours: 380,
    about: 'I grew up on the backwaters of Alleppey and trained in Ayurvedic wellness traditions.',
    availability: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
  },
  {
    name: 'Amit Verma', email: 'amit@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Varanasi',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    rating: 4.9, reviewCount: 312, languages: ['English', 'Hindi', 'Japanese'],
    specialties: ['Spiritual', 'Culture'],
    tagline: 'Third-generation Varanasi guide — the ghats are my classroom',
    price: 1200, verified: true, tours: 680,
    about: 'My grandfather was a boatman on the Ganges, my father a temple priest.',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    name: 'Sneha Kapoor', email: 'sneha@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Delhi',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    rating: 4.7, reviewCount: 156, languages: ['English', 'Hindi', 'Spanish'],
    specialties: ['Food Tours', 'Culture'],
    tagline: 'Delhi food & heritage walk curator — eat your way through history',
    price: 1000, verified: true, tours: 290,
    about: "I combine my love for Delhi's street food with its 1,000-year history.",
    availability: ['Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
  },
  {
    name: "Marco D'Souza", email: 'marco@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Goa',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    rating: 4.8, reviewCount: 203, languages: ['English', 'Hindi', 'Portuguese', 'Konkani'],
    specialties: ['Beach & Culture', 'Heritage'],
    tagline: 'Portuguese-Goan heritage expert — discover the Goa tourists never see',
    price: 1600, verified: true, tours: 410,
    about: 'Fourth-generation Goan with Portuguese roots.',
    availability: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  {
    name: 'Tenzin Dorje', email: 'tenzin@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Ladakh',
    photo: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop&crop=face',
    rating: 4.9, reviewCount: 98, languages: ['English', 'Hindi', 'Ladakhi', 'Tibetan'],
    specialties: ['Adventure', 'Spiritual'],
    tagline: "Born at 11,000ft — Ladakh is not a destination, it's my home",
    price: 2200, verified: true, tours: 190,
    about: 'I grew up in a Buddhist monastery village in Ladakh.',
    availability: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  {
    name: 'Fatima Khan', email: 'fatima@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Agra',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    rating: 4.8, reviewCount: 174, languages: ['English', 'Hindi', 'Urdu'],
    specialties: ['Heritage', 'Photography'],
    tagline: 'Mughal architecture historian — every marble inlay tells a love story',
    price: 1100, verified: true, tours: 340,
    about: 'I hold a masters in Indo-Islamic Architecture from AMU. For eight years I have been revealing the hidden geometry, symbolism, and love poetry carved into every corner of the Taj Mahal and Agra Fort.',
    availability: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
  },
  {
    name: 'Vikram Singh Rathore', email: 'vikram@tourmitra.com', password: 'guide123',
    role: 'guide', city: 'Udaipur',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    rating: 4.9, reviewCount: 132, languages: ['English', 'Hindi', 'Mewari'],
    specialties: ['Heritage', 'Art & Culture'],
    tagline: 'Rajput descendant — walk through living history on the banks of Lake Pichola',
    price: 1500, verified: true, tours: 260,
    about: 'My family served the Mewar dynasty for generations. I combine personal ancestral stories with a deep knowledge of Udaipur\'s palaces, miniature painting traditions, and the famed lake culture.',
    availability: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
];

// Demo tourist users (multiple for diverse reviews)
const tourists = [
  {
    name: 'Tushar Pawar', email: 'tushar@example.com', password: 'tourist123',
    role: 'tourist', phone: '+91 98765 43210',
  },
  {
    name: 'Ananya Iyer', email: 'ananya@example.com', password: 'tourist123',
    role: 'tourist',
  },
  {
    name: 'Rohan Mehta', email: 'rohan@example.com', password: 'tourist123',
    role: 'tourist',
  },
  {
    name: 'Sophie Laurent', email: 'sophie@example.com', password: 'tourist123',
    role: 'tourist',
  },
  {
    name: 'Arjun Desai', email: 'arjun@example.com', password: 'tourist123',
    role: 'tourist',
  },
  {
    name: 'Meera Joshi', email: 'meera@example.com', password: 'tourist123',
    role: 'tourist',
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Destination.deleteMany({});
    await Review.deleteMany({});

    // Seed destinations
    console.log('🌍 Seeding destinations...');
    const createdDestinations = await Destination.insertMany(destinations);
    console.log(`   ✅ ${createdDestinations.length} destinations created`);

    // Seed guides
    console.log('🧑‍🏫 Seeding guides...');
    const createdGuides = [];
    for (const g of guides) {
      const user = new User(g);
      await user.save(); // triggers password hashing
      createdGuides.push(user);
    }
    console.log(`   ✅ ${createdGuides.length} guides created`);

    // Seed tourist
    console.log('🧳 Seeding tourist users...');
    for (const t of tourists) {
      const user = new User(t);
      await user.save();
    }
    console.log(`   ✅ ${tourists.length} tourist(s) created`);

    // Seed reviews
    console.log('⭐ Seeding reviews...');
    const allTourists = await User.find({ role: 'tourist' });
    const t = (email) => allTourists.find(u => u.email === email);
    const g = (idx) => createdGuides[idx]._id;
    // Helper: find destination by name
    const dest = (name) => {
      const d = createdDestinations.find(dd => dd.name === name);
      return d ? d._id : null;
    };

    const reviewData = [
      // === Rajesh Sharma (Jaipur) — index 0 ===
      { author: t('tushar@example.com')._id, guide: g(0), destination: dest('Jaipur'), rating: 5, text: 'Rajesh made Jaipur come alive! His stories about the royal families were captivating. The hidden courtyard he showed us at Amber Fort was the highlight of our trip.' },
      { author: t('ananya@example.com')._id, guide: g(0), destination: dest('Jaipur'), rating: 5, text: 'Absolutely magical experience. Rajesh knew every corner of the City Palace and shared anecdotes you won\'t find in any guidebook. Worth every rupee!' },
      { author: t('sophie@example.com')._id, guide: g(0), destination: dest('Jaipur'), rating: 4, text: 'Rajesh is incredibly knowledgeable about Rajput history. He even arranged a surprise rooftop chai with a view of Nahargarh Fort at sunset. Highly recommend.' },
      { author: t('arjun@example.com')._id, guide: g(0), destination: dest('Jaipur'), rating: 5, text: 'Best heritage tour I\'ve ever taken. Rajesh\'s photography tips at Hawa Mahal were a bonus — got the best shots of my life!' },

      // === Priya Nair (Kerala) — index 1 ===
      { author: t('tushar@example.com')._id, guide: g(1), destination: dest('Kerala'), rating: 5, text: 'Priya showed us a Kerala we never knew existed. The private houseboat experience through untouched backwaters was pure magic.' },
      { author: t('rohan@example.com')._id, guide: g(1), destination: dest('Kerala'), rating: 5, text: 'The Ayurvedic spa Priya arranged was transformative. She understands wellness at a deep level and tailored everything to our needs.' },
      { author: t('meera@example.com')._id, guide: g(1), destination: dest('Kerala'), rating: 4, text: 'Priya took us to a spice plantation that wasn\'t on any tourist map. She explained every herb and its medicinal use. Beautiful day!' },
      { author: t('sophie@example.com')._id, guide: g(1), destination: dest('Kerala'), rating: 5, text: 'As a solo female traveler, I felt completely safe with Priya. Her knowledge of Kathakali traditions and local cuisine made my Kerala trip unforgettable.' },

      // === Amit Verma (Varanasi) — index 2 ===
      { author: t('tushar@example.com')._id, guide: g(2), destination: dest('Varanasi'), rating: 5, text: 'Amit spoke Japanese with our friends! The sunrise boat ride on the Ganges was the most spiritual experience of my life.' },
      { author: t('ananya@example.com')._id, guide: g(2), destination: dest('Varanasi'), rating: 5, text: 'Varanasi can be overwhelming but Amit navigated the ghats like a maestro. His family\'s connection to the temples added layers of meaning to every stop.' },
      { author: t('arjun@example.com')._id, guide: g(2), destination: dest('Varanasi'), rating: 5, text: 'The evening Ganga Aarti from the secret spot Amit knows was breathtaking. No crowds, perfect view. He truly is a third-generation master of this city.' },
      { author: t('rohan@example.com')._id, guide: g(2), destination: dest('Varanasi'), rating: 4, text: 'Amit\'s street food tour through the lanes of Varanasi was incredible. Kachori, lassi, and stories — what more could you want?' },
      { author: t('meera@example.com')._id, guide: g(2), destination: dest('Varanasi'), rating: 5, text: 'Never thought I\'d cry at a sunset, but the boat ride with Amit\'s narration of ancient legends moved me deeply. A life-changing experience.' },

      // === Sneha Kapoor (Delhi) — index 3 ===
      { author: t('rohan@example.com')._id, guide: g(3), destination: dest('Delhi'), rating: 5, text: 'Sneha\'s food walk through Chandni Chowk was the highlight of our Delhi trip. Paranthe Wali Gali, hidden kebab shops, and the best jalebi I\'ve ever had.' },
      { author: t('tushar@example.com')._id, guide: g(3), destination: dest('Delhi'), rating: 4, text: 'Great combination of history and food. Sneha explained the Mughal influence on Delhi cuisine while we ate our way through Old Delhi. Brilliant!' },
      { author: t('ananya@example.com')._id, guide: g(3), destination: dest('Delhi'), rating: 5, text: 'Sneha took us to a 200-year-old haveli restaurant that no tourist would ever find. Her passion for Delhi\'s food heritage is infectious.' },
      { author: t('meera@example.com')._id, guide: g(3), destination: dest('Delhi'), rating: 4, text: 'Loved the heritage walk at Humayun\'s Tomb followed by street food in Nizamuddin. Sneha seamlessly weaves culture with culinary exploration.' },

      // === Marco D'Souza (Goa) — index 4 ===
      { author: t('arjun@example.com')._id, guide: g(4), destination: dest('Goa'), rating: 5, text: 'Marco showed us the real Goa — centuries-old Portuguese mansions, hidden chapels, and a fish market tour that ended with a cooking class at his grandmother\'s house!' },
      { author: t('sophie@example.com')._id, guide: g(4), destination: dest('Goa'), rating: 5, text: 'Forget the beach clubs — Marco\'s heritage trail through Fontainhas and the spice plantations was the authentic Goa experience I was looking for.' },
      { author: t('tushar@example.com')._id, guide: g(4), destination: dest('Goa'), rating: 4, text: 'Marco\'s Portuguese-Goan fusion stories were fascinating. He drove us to Dudhsagar Falls via back roads with stops at local taverns. Unforgettable day.' },
      { author: t('rohan@example.com')._id, guide: g(4), destination: dest('Goa'), rating: 5, text: 'Best guide experience ever! Marco\'s Konkani songs on the river cruise, followed by a sunset at a secret beach. This is how Goa should be explored.' },

      // === Tenzin Dorje (Ladakh) — index 5 ===
      { author: t('arjun@example.com')._id, guide: g(5), destination: dest('Ladakh'), rating: 5, text: 'Tenzin is not just a guide — he\'s a storyteller of the mountains. Watching sunrise at Pangong Lake with his narration of Ladakhi legends was surreal.' },
      { author: t('ananya@example.com')._id, guide: g(5), destination: dest('Ladakh'), rating: 5, text: 'Tenzin helped us acclimatize properly and took us to a monastery where we meditated with monks. An experience money can\'t usually buy.' },
      { author: t('rohan@example.com')._id, guide: g(5), destination: dest('Ladakh'), rating: 5, text: 'Nubra Valley on camelback, stars brighter than I\'ve ever seen, and Tenzin\'s hot butter tea at his family home. Ladakh stole my heart.' },
      { author: t('meera@example.com')._id, guide: g(5), destination: dest('Ladakh'), rating: 4, text: 'Tenzin navigated Khardung La like a pro and knew exactly when to stop for the best views. His altitude sickness tips were genuinely lifesaving.' },

      // === Fatima Khan (Agra) — index 6 ===
      { author: t('tushar@example.com')._id, guide: g(6), destination: dest('Agra'), rating: 5, text: 'Fatima\'s Taj Mahal sunrise tour was extraordinary. She pointed out marble inlays and Quranic calligraphy I would have completely missed on my own.' },
      { author: t('sophie@example.com')._id, guide: g(6), destination: dest('Agra'), rating: 5, text: 'I\'ve seen the Taj in photos a thousand times but Fatima made me see it with new eyes. Her knowledge of Mughal architecture is encyclopedic.' },
      { author: t('ananya@example.com')._id, guide: g(6), destination: dest('Agra'), rating: 4, text: 'Fatima took us to Mehtab Bagh at sunset for the most stunning Taj view. Also loved the Fatehpur Sikri detour — her history storytelling is top-notch.' },
      { author: t('arjun@example.com')._id, guide: g(6), destination: dest('Agra'), rating: 5, text: 'The Agra Fort tour with Fatima was better than any documentary. She brings Shah Jahan and Mumtaz\'s love story to life. Photography tips were a bonus!' },

      // === Vikram Singh Rathore (Udaipur) — index 7 ===
      { author: t('meera@example.com')._id, guide: g(7), destination: dest('Udaipur'), rating: 5, text: 'Vikram\'s family connection to the Mewar dynasty made the City Palace tour feel like a private royal audience. Goosebumps throughout!' },
      { author: t('rohan@example.com')._id, guide: g(7), destination: dest('Udaipur'), rating: 5, text: 'The boat ride on Lake Pichola at golden hour, with Vikram explaining the history of Jag Mandir — straight out of a movie. Best evening of the trip.' },
      { author: t('tushar@example.com')._id, guide: g(7), destination: dest('Udaipur'), rating: 5, text: 'Vikram took us to a miniature painting workshop where we met a master artist. His knowledge of Mewar art traditions is remarkable.' },
      { author: t('sophie@example.com')._id, guide: g(7), destination: dest('Udaipur'), rating: 4, text: 'Udaipur is romantic on its own, but with Vikram\'s ancestral stories and hidden rooftop café recommendations, it became absolutely magical.' },
    ];

    await Review.insertMany(reviewData);
    console.log(`   ✅ ${reviewData.length} reviews created`);

    // Update guide ratings based on seeded reviews
    console.log('📊 Updating guide ratings...');
    for (const guide of createdGuides) {
      const guideReviews = await Review.find({ guide: guide._id });
      if (guideReviews.length > 0) {
        const avgRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;
        await User.findByIdAndUpdate(guide._id, {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: guideReviews.length,
        });
      }
    }
    console.log('   ✅ Guide ratings updated');

    console.log('\n🎉 Seed complete!');
    console.log('\n📋 Test credentials:');
    console.log('   Tourist: tushar@example.com / tourist123');
    console.log('   Guide:   rajesh@tourmitra.com / guide123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
