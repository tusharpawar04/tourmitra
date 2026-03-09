import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { destinationsAPI } from '../services/api';
import CalendarPicker from '../components/CalendarPicker';

/* ─── Static data ────────────────────────────────────────── */
const vibeOptions = [
  { icon: '🏛️', label: 'Heritage & History', color: '#C9A14A' },
  { icon: '🍛', label: 'Food & Culinary', color: '#E8622A' },
  { icon: '🏔️', label: 'Adventure & Trekking', color: '#3B82F6' },
  { icon: '🕉️', label: 'Spiritual & Wellness', color: '#8B5CF6' },
  { icon: '🌿', label: 'Nature & Wildlife', color: '#22C55E' },
  { icon: '📸', label: 'Photography', color: '#EC4899' },
  { icon: '🎭', label: 'Art & Culture', color: '#F59E0B' },
  { icon: '🛍️', label: 'Shopping & Markets', color: '#EF4444' },
];

const budgetOptions = [
  { label: 'Budget', desc: '₹500–1,000/day', value: 'budget', icon: '🎒' },
  { label: 'Mid-Range', desc: '₹1,000–2,000/day', value: 'mid', icon: '🏨' },
  { label: 'Premium', desc: '₹2,000–4,000/day', value: 'premium', icon: '🌟' },
  { label: 'Luxury', desc: '₹4,000+/day', value: 'luxury', icon: '👑' },
];

const paceOptions = [
  { value: 'relaxed', icon: '🐢', label: 'Relaxed', desc: 'Fewer activities, more free time' },
  { value: 'moderate', icon: '🚶', label: 'Moderate', desc: 'Balanced pace with breaks' },
  { value: 'packed', icon: '⚡', label: 'Action-Packed', desc: 'See everything possible' },
];

const groupOptions = [
  { value: 'solo', icon: '🧑', label: 'Solo Traveler' },
  { value: 'couple', icon: '💑', label: 'Couple' },
  { value: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family' },
  { value: 'friends', icon: '👥', label: 'Friends Group' },
  { value: 'seniors', icon: '👴', label: 'Senior Citizens' },
  { value: 'corporate', icon: '💼', label: 'Corporate Group' },
];

/* ─── Time slots per pace ─── */
const timeSlots = {
  relaxed: [
    { time: '9:00 AM', period: 'Morning' },
    { time: '1:00 PM', period: 'Afternoon' },
    { time: '6:00 PM', period: 'Evening' },
  ],
  moderate: [
    { time: '7:30 AM', period: 'Early Morning' },
    { time: '10:30 AM', period: 'Late Morning' },
    { time: '2:00 PM', period: 'Afternoon' },
    { time: '5:30 PM', period: 'Evening' },
  ],
  packed: [
    { time: '6:00 AM', period: 'Sunrise' },
    { time: '9:00 AM', period: 'Morning' },
    { time: '12:00 PM', period: 'Midday' },
    { time: '3:00 PM', period: 'Afternoon' },
    { time: '6:00 PM', period: 'Evening' },
    { time: '8:30 PM', period: 'Night' },
  ],
};

/* ─── Activity templates by vibe ─── */
const activityTemplates = {
  'Heritage & History': [
    { name: 'Guided Fort & Palace Tour', desc: 'Explore centuries-old architecture with stories from your guide', icon: '🏰', duration: '2-3 hrs', tip: 'Wear comfortable shoes — lots of stairs!' },
    { name: 'Historical Walking Trail', desc: 'Walk through lanes steeped in centuries of history', icon: '🚶', duration: '1.5 hrs', tip: 'Best before 10 AM when it\'s cooler' },
    { name: 'Museum & Archives Visit', desc: 'Curated tour of rare artifacts and royal memorabilia', icon: '🏛️', duration: '1-2 hrs', tip: 'Photography may be restricted inside' },
    { name: 'Ancient Temple Complex', desc: 'Marvel at architectural mastery spanning centuries', icon: '🛕', duration: '1.5 hrs', tip: 'Cover your shoulders for temple entry' },
  ],
  'Food & Culinary': [
    { name: 'Street Food Crawl', desc: 'Hop through legendary food stalls with a local foodie guide', icon: '🍜', duration: '2-3 hrs', tip: 'Come hungry! Your guide knows the hygienic spots' },
    { name: 'Traditional Cooking Class', desc: 'Learn authentic regional recipes from a local home chef', icon: '👩‍🍳', duration: '2-3 hrs', tip: 'You\'ll take home a recipe card' },
    { name: 'Spice Market Tour', desc: 'Navigate colorful spice bazaars and learn about local ingredients', icon: '🌶️', duration: '1.5 hrs', tip: 'Great for picking up gifts to take home' },
    { name: 'Royal Thali Experience', desc: 'Curated multi-course meal at a heritage restaurant', icon: '🍽️', duration: '1.5 hrs', tip: 'Mention dietary restrictions to your guide in advance' },
  ],
  'Adventure & Trekking': [
    { name: 'Sunrise Trek', desc: 'Guided hike to a viewpoint for a breathtaking sunrise', icon: '🌄', duration: '3-4 hrs', tip: 'Start early! Carry a flashlight and water' },
    { name: 'River Rafting / Kayaking', desc: 'Adrenaline-pumping water adventure with certified guides', icon: '🚣', duration: '2-3 hrs', tip: 'Waterproof phone pouches available at base camp' },
    { name: 'Mountain Biking Trail', desc: 'Off-road ride through scenic trails at your skill level', icon: '🚵', duration: '2-3 hrs', tip: 'Helmets and gear provided' },
    { name: 'Rock Climbing & Rappelling', desc: 'Scale natural rock faces with safety harness and expert instruction', icon: '🧗', duration: '2-3 hrs', tip: 'No prior experience needed' },
  ],
  'Spiritual & Wellness': [
    { name: 'Sunrise Meditation & Yoga', desc: 'Begin your day with guided meditation at a serene spot', icon: '🧘', duration: '1.5 hrs', tip: 'Mats provided, carry your own water bottle' },
    { name: 'Temple Ritual Experience', desc: 'Participate in traditional ceremonies with a spiritual guide', icon: '🪔', duration: '1-2 hrs', tip: 'Dress modestly — no shorts or sleeveless' },
    { name: 'Ayurvedic Spa Session', desc: 'Traditional wellness therapy tailored to your dosha', icon: '💆', duration: '2 hrs', tip: 'Book in advance during peak season' },
    { name: 'Evening Aarti Ceremony', desc: 'Witness the mesmerizing fire-and-chanting riverside ritual', icon: '🔥', duration: '1 hr', tip: 'Arrive 30 mins early for front-row views' },
  ],
  'Nature & Wildlife': [
    { name: 'Wildlife Safari', desc: 'Jeep safari through a protected sanctuary with a naturalist', icon: '🦁', duration: '3-4 hrs', tip: 'Bring binoculars and wear earth-toned clothing' },
    { name: 'Bird Watching Trail', desc: 'Spot rare and migratory species with an ornithologist guide', icon: '🦅', duration: '2-3 hrs', tip: 'Best at dawn — carry a zoom lens if you can' },
    { name: 'Waterfall & Jungle Trek', desc: 'Hike through lush forests to hidden waterfalls', icon: '🌊', duration: '3-4 hrs', tip: 'Leeches possible in monsoon — carry salt' },
    { name: 'Sunset at a Scenic Viewpoint', desc: 'Golden hour at the most photogenic natural lookout', icon: '🌅', duration: '1-2 hrs', tip: 'Your guide knows the secret less-crowded spots' },
  ],
  'Photography': [
    { name: 'Golden Hour Photo Walk', desc: 'Capture stunning shots with a photographer guide during magic light', icon: '📷', duration: '2 hrs', tip: 'Wide-angle lens recommended for architecture' },
    { name: 'Street Life Photography', desc: 'Document the vibrant everyday culture through your lens', icon: '📸', duration: '2-3 hrs', tip: 'Always ask before photographing locals' },
    { name: 'Drone Aerial Session', desc: 'Guided drone photography at permitted scenic locations', icon: '🛸', duration: '1.5 hrs', tip: 'Check drone regulations — some sites prohibit them' },
    { name: 'Night Photography Tour', desc: 'Capture illuminated monuments and starry skies', icon: '🌃', duration: '2 hrs', tip: 'Bring a tripod for long exposure shots' },
  ],
  'Art & Culture': [
    { name: 'Artisan Workshop Visit', desc: 'Meet master craftspeople and try your hand at their art', icon: '🎨', duration: '2 hrs', tip: 'You can commission custom pieces to ship home' },
    { name: 'Traditional Dance Performance', desc: 'Front-row seats to an authentic cultural performance', icon: '💃', duration: '1.5 hrs', tip: 'Guide will explain the mythology behind each dance' },
    { name: 'Local Art Gallery Crawl', desc: 'Explore contemporary and traditional art spaces with context', icon: '🖼️', duration: '2 hrs', tip: 'Many galleries offer student/group discounts' },
    { name: 'Folk Music Evening', desc: 'Live traditional music in an intimate local setting', icon: '🎵', duration: '1.5 hrs', tip: 'Pair with dinner for the full experience' },
  ],
  'Shopping & Markets': [
    { name: 'Bazaar Treasure Hunt', desc: 'Navigate colorful markets with a local who knows the best deals', icon: '🛒', duration: '2-3 hrs', tip: 'Your guide can help you bargain — save 30-50%!' },
    { name: 'Textile & Fabric Shopping', desc: 'Discover handloom shops and pick up authentic regional fabrics', icon: '🧵', duration: '2 hrs', tip: 'Ask for certificates of authenticity for silk' },
    { name: 'Handicraft Village Tour', desc: 'Visit artisan villages where crafts are made from scratch', icon: '🏺', duration: '3 hrs', tip: 'Buying direct supports local artisan families' },
    { name: 'Night Market Experience', desc: 'Evening market with street food, live music, and local crafts', icon: '🏮', duration: '2 hrs', tip: 'Carry cash — many vendors don\'t accept cards' },
  ],
};

const defaultActivities = [
  { name: 'City Orientation Walk', desc: 'Get your bearings with a guided tour of key landmarks', icon: '🗺️', duration: '2 hrs', tip: 'Great way to start any trip' },
  { name: 'Local Breakfast Experience', desc: 'Start the day with authentic regional morning food', icon: '☕', duration: '1 hr', tip: 'Ask your guide about must-try dishes' },
  { name: 'Hidden Gem Exploration', desc: 'Off-the-beaten-path spots only locals know about', icon: '💎', duration: '2-3 hrs', tip: 'These places don\'t show up on Google Maps' },
  { name: 'Sunset Viewpoint', desc: 'End the day at the most spectacular sunset location', icon: '🌇', duration: '1 hr', tip: 'Arrive 30 mins early for the best spot' },
  { name: 'Night Walk & Local Stories', desc: 'Experience the city after dark with folklore and legends', icon: '🌙', duration: '1.5 hrs', tip: 'Perfect for photography enthusiasts too' },
  { name: 'Free Time & Rest', desc: 'Relax, journal, or explore on your own', icon: '☕', duration: '1-2 hrs', tip: 'Your guide can suggest nearby cafés' },
];

const weatherData = {
  Jaipur: { temp: '18-32°C', condition: 'Sunny & Dry', icon: '☀️', pack: 'Sunscreen, hat, light cotton clothes' },
  Varanasi: { temp: '12-28°C', condition: 'Cool mornings, warm afternoons', icon: '🌤️', pack: 'Layers, comfortable walking shoes' },
  Goa: { temp: '24-33°C', condition: 'Warm & Humid', icon: '🏖️', pack: 'Swimwear, sunscreen, flip-flops' },
  Kerala: { temp: '22-32°C', condition: 'Tropical Warm', icon: '🌴', pack: 'Rain jacket, insect repellent, light clothing' },
  Agra: { temp: '10-28°C', condition: 'Pleasant', icon: '🌤️', pack: 'Comfortable shoes, camera, sunhat' },
  Ladakh: { temp: '-5 to 20°C', condition: 'Cold & Dry', icon: '🏔️', pack: 'Heavy jacket, thermals, sunglasses, altitude meds' },
  Udaipur: { temp: '15-30°C', condition: 'Pleasant & Sunny', icon: '☀️', pack: 'Sunscreen, hat, boat-friendly clothes' },
  Delhi: { temp: '8-25°C', condition: 'Variable, mild', icon: '🌥️', pack: 'Layers, mask for pollution, comfortable shoes' },
};

const budgetMultipliers = { budget: 0.6, mid: 1, premium: 1.6, luxury: 2.5 };

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */
const AITripPlannerPage = () => {
  const [step, setStep] = useState(1);
  const [selectedDest, setSelectedDest] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [numDays, setNumDays] = useState(3);
  const [travelGroup, setTravelGroup] = useState('solo');
  const [groupSize, setGroupSize] = useState(1);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [budget, setBudget] = useState('mid');
  const [pace, setPace] = useState('moderate');
  const [preferences, setPreferences] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [itinerary, setItinerary] = useState(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimer = useRef(null);
  const destFieldRef = useRef(null);

  // Real destinations from DB
  const [dbDestinations, setDbDestinations] = useState([]);
  useEffect(() => {
    destinationsAPI.getAll().then(d => setDbDestinations(d.destinations || [])).catch(() => {});
  }, []);

  // Chat refinement
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Expanded day tracking
  const [expandedDays, setExpandedDays] = useState({});

  const totalSteps = 7;

  /* ─── Autocomplete ─── */
  const handleDestChange = (val) => {
    setSelectedDest(val);
    clearTimeout(suggestionsTimer.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestionsTimer.current = setTimeout(() => {
      destinationsAPI.getAll({ search: val.trim(), limit: 5 }).then(data => {
        setSuggestions(data.destinations || []);
        setShowSuggestions(true);
      }).catch(() => {});
    }, 200);
  };

  const pickSuggestion = (dest) => {
    setSelectedDest(dest.name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (destFieldRef.current && !destFieldRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Step helpers ─── */
  const toggleVibe = (label) =>
    setSelectedVibes(prev => prev.includes(label) ? prev.filter(v => v !== label) : [...prev, label]);

  const canProceed = () => {
    if (step === 1) return selectedDest.trim().length > 0;
    if (step === 4) return selectedVibes.length > 0;
    return true;
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else startGeneration();
  };
  const prevStep = () => step > 1 && setStep(step - 1);

  /* ─── AI Generation (animated sequence) ─── */
  const genSteps = [
    'Analyzing your preferences…',
    `Mapping ${selectedDest || 'destination'} highlights…`,
    'Matching with local guide expertise…',
    'Building day-by-day itinerary…',
    'Adding insider tips & cost estimates…',
    'Finalizing your personalized plan…',
  ];

  const startGeneration = () => {
    setGenerating(true);
    setGenStep(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s >= genSteps.length) {
        clearInterval(interval);
        buildItinerary();
      } else {
        setGenStep(s);
      }
    }, 700);
  };

  /* ─── Build the itinerary ─── */
  const buildItinerary = () => {
    const dest = dbDestinations.find(d => d.name.toLowerCase() === selectedDest.toLowerCase()) || null;
    const slots = timeSlots[pace] || timeSlots.moderate;

    // Build activities pool from selected vibes
    let pool = [];
    selectedVibes.forEach(v => {
      const templates = activityTemplates[v] || [];
      pool = pool.concat(templates);
    });
    if (pool.length < 10) pool = pool.concat(defaultActivities);

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const days = [];
    let actIdx = 0;
    const dayTitles = [
      'Arrival & First Impressions',
      `Deep Dive — ${selectedVibes[0] || 'Exploration'}`,
      `${selectedVibes[1] || 'Hidden Gems'} Discovery`,
      'Off-the-Beaten-Path Day',
      `${selectedVibes[2] || 'Cultural'} Immersion`,
      'Adventure & Surprises',
      'Farewell & Lasting Memories',
    ];

    for (let d = 0; d < numDays; d++) {
      const activities = slots.map((slot) => {
        const act = shuffled[actIdx % shuffled.length];
        actIdx++;
        return { ...act, time: slot.time, period: slot.period };
      });
      days.push({ day: d + 1, title: dayTitles[d % dayTitles.length], activities });
    }

    // Cost estimate
    const basePrice = dest?.price || 1500;
    const mult = budgetMultipliers[budget] || 1;
    const dailyCost = Math.round(basePrice * mult);

    // Weather
    const weather = weatherData[selectedDest] || { temp: '20-30°C', condition: 'Pleasant', icon: '🌤️', pack: 'Comfortable clothing, sunscreen' };

    setItinerary({
      destination: dest || { name: selectedDest, image: '', tag: '', state: '' },
      days,
      costBreakdown: {
        daily: dailyCost,
        total: dailyCost * numDays,
        guide: Math.round(dailyCost * 0.4),
        food: Math.round(dailyCost * 0.25),
        transport: Math.round(dailyCost * 0.2),
        activities: Math.round(dailyCost * 0.15),
      },
      weather,
      totalDays: numDays,
      vibes: selectedVibes,
      group: travelGroup,
      groupSize,
      pace,
      budget,
      dates: travelDates,
    });

    // Init chat
    setChatMessages([
      {
        role: 'ai',
        text: `Your ${numDays}-day ${selectedDest} plan is ready! 🎉 I've tailored it for a ${pace} pace with ${selectedVibes.join(', ')} vibes. Ask me to adjust anything — swap activities, change timing, add rest days, or get more tips!`,
      },
    ]);

    setExpandedDays({ 1: true });

    setTimeout(() => {
      setGenerating(false);
      setShowResult(true);
    }, 500);
  };

  /* ─── Chat refinement ─── */
  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    setTimeout(() => {
      let response;
      const lower = userMsg.toLowerCase();
      if (lower.includes('restaurant') || lower.includes('food') || lower.includes('eat')) {
        response = `Great question! For ${selectedDest}, I recommend trying local specialties at popular spots. Your guide will know the best hidden restaurants. Want me to add a dedicated food tour to any specific day?`;
      } else if (lower.includes('swap') || lower.includes('change') || lower.includes('replace')) {
        response = 'Sure! Just tell me which day and time slot you\'d like to change, and what kind of activity you\'d prefer instead. Example: "Day 2 morning — something more relaxed"';
      } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('expensive')) {
        response = `The estimated cost is ₹${itinerary?.costBreakdown?.total?.toLocaleString()} total (₹${itinerary?.costBreakdown?.daily?.toLocaleString()}/day). Want me to suggest free activities and budget-friendly alternatives?`;
      } else if (lower.includes('rest') || lower.includes('relax') || lower.includes('free time')) {
        response = 'Absolutely! I can make the pace more relaxed. Want me to remove the earliest morning slot and add a spa/rest block? Just tell me which day(s).';
      } else if (lower.includes('guide') || lower.includes('local')) {
        response = `I'll match you with guides who specialize in ${selectedVibes.join(' and ')}. After finalizing, you can browse and book verified guides directly.`;
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('cold') || lower.includes('hot')) {
        const w = itinerary?.weather;
        response = `Forecast for ${selectedDest}: ${w?.icon} ${w?.condition}, ${w?.temp}. Pack: ${w?.pack}. Want me to adjust outdoor activities based on weather?`;
      } else {
        response = `Good point! I've noted "${userMsg}" — your guide will take it into account. Want me to adjust any specific day or activity?`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 800);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleDay = (day) => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));

  /* ─── Render ─── */
  const stepTitles = ['Destination', 'Dates', 'Travelers', 'Vibes', 'Budget', 'Pace', 'Finish'];

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>

      {/* ═══ GENERATING ANIMATION ═══ */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'linear-gradient(135deg, rgba(45,27,78,0.97), rgba(232,98,42,0.92))',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '40px',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(252,199,75,0.9), rgba(245,166,35,0.3))',
                marginBottom: '36px',
                boxShadow: '0 0 60px rgba(252,199,75,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem',
              }}
            >✦</motion.div>
            <motion.h2
              key={genStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#fff', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--font-heading)' }}
            >
              {genSteps[genStep]}
            </motion.h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {genSteps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: i === genStep ? 1.3 : 1, background: i <= genStep ? '#FCC74B' : 'rgba(255,255,255,0.25)' }}
                  style={{ width: '10px', height: '10px', borderRadius: '50%' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ WIZARD ═══ */}
      {!showResult && !generating && (
        <div style={{
          minHeight: 'calc(100vh - var(--nav-height))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 16px',
        }}>
          <motion.div
            className="glass"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: '680px',
              padding: 'clamp(28px, 4vw, 44px)', borderRadius: '24px',
              border: '1.5px solid rgba(245,166,35,0.3)',
              boxShadow: '0 12px 60px rgba(26,13,46,0.12)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', color: '#fff',
              }}>✦</div>
              <div>
                <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--deep-violet)' }}>AI Trip Planner</h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)', margin: 0 }}>Powered by smart planning</p>
              </div>
            </div>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: '4px', margin: '20px 0 8px', alignItems: 'center' }}>
              {stepTitles.map((t, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    height: '3px', width: '100%', borderRadius: '2px',
                    background: i + 1 <= step ? 'var(--burnt-orange)' : 'rgba(245,166,35,0.15)',
                    transition: 'background 0.4s',
                  }} />
                  <span style={{
                    fontSize: '0.62rem',
                    color: i + 1 <= step ? 'var(--deep-violet)' : 'var(--muted-lavender)',
                    fontWeight: i + 1 === step ? 700 : 400,
                    whiteSpace: 'nowrap',
                  }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 24px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)' }}>Step {step} of {totalSteps}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{Math.round((step / totalSteps) * 100)}%</span>
            </div>

            {/* Steps */}
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

                {/* Step 1: Destination */}
                {step === 1 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Where do you want to go? 🗺️</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Search for any Indian destination</p>
                    <div ref={destFieldRef} style={{ position: 'relative', marginBottom: '16px' }}>
                      <input
                        type="text" className="input-glass"
                        placeholder="Search — try Jaipur, Kerala, Varanasi..."
                        value={selectedDest}
                        onChange={e => handleDestChange(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        style={{ fontSize: '1rem' }}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="ai-autocomplete-dropdown">
                          {suggestions.map(s => (
                            <div key={s._id} className="ai-autocomplete-item" onClick={() => pickSuggestion(s)}>
                              <img src={s.image} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--deep-violet)' }}>{s.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{s.state} • {s.tag} • {s.duration}</div>
                              </div>
                              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 600, color: 'var(--burnt-orange)' }}>₹{s.price?.toLocaleString()}/day</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {dbDestinations.slice(0, 8).map(d => (
                        <button key={d._id} className={`pill ${selectedDest === d.name ? 'active' : ''}`} onClick={() => setSelectedDest(d.name)}>
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: When + Duration */}
                {step === 2 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>When & how long? 📅</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Pick dates and trip length</p>
                    <CalendarPicker value={/^\d{4}-\d{2}-\d{2}$/.test(travelDates) ? travelDates : ''} onChange={val => setTravelDates(val)} placeholder="Pick a start date" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', marginTop: '12px' }}>
                      {['This Weekend', 'Next Week', 'This Month', "I'm Flexible"].map(opt => (
                        <button key={opt} className={`pill ${travelDates === opt ? 'active' : ''}`} onClick={() => setTravelDates(opt)}>{opt}</button>
                      ))}
                    </div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>
                      Trip Duration: <span style={{ color: 'var(--burnt-orange)' }}>{numDays} day{numDays > 1 ? 's' : ''}</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="range" min="1" max="14" value={numDays} onChange={e => setNumDays(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--burnt-orange)' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[2, 3, 5, 7].map(d => (
                          <button key={d} className={`pill ${numDays === d ? 'active' : ''}`} onClick={() => setNumDays(d)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{d}D</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Who */}
                {step === 3 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Who's traveling? 👥</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Helps us tailor the experience</p>
                    <div className="ai-group-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                      {groupOptions.map(opt => (
                        <button
                          key={opt.value} onClick={() => setTravelGroup(opt.value)}
                          style={{
                            padding: '16px 8px', textAlign: 'center', cursor: 'pointer',
                            border: travelGroup === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                            borderRadius: '14px', transition: 'all 0.2s',
                            background: travelGroup === opt.value ? 'rgba(232,98,42,0.06)' : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{opt.icon}</div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{opt.label}</div>
                        </button>
                      ))}
                    </div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
                      Group Size: <span style={{ color: 'var(--burnt-orange)' }}>{groupSize}</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button className="pill" onClick={() => setGroupSize(Math.max(1, groupSize - 1))} style={{ padding: '8px 14px' }}>−</button>
                      <div style={{ width: '50px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--deep-violet)' }}>{groupSize}</div>
                      <button className="pill" onClick={() => setGroupSize(Math.min(20, groupSize + 1))} style={{ padding: '8px 14px' }}>+</button>
                    </div>
                  </div>
                )}

                {/* Step 4: Vibes */}
                {step === 4 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>What's your vibe? ✨</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>
                      Select all that interest you <span style={{ fontSize: '0.78rem' }}>({selectedVibes.length} selected)</span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {vibeOptions.map(vibe => {
                        const active = selectedVibes.includes(vibe.label);
                        return (
                          <button
                            key={vibe.label} onClick={() => toggleVibe(vibe.label)}
                            style={{
                              padding: '14px', textAlign: 'center', cursor: 'pointer', position: 'relative',
                              border: active ? `2px solid ${vibe.color}` : '1px solid var(--glass-border)',
                              borderRadius: '14px', background: active ? `${vibe.color}12` : 'rgba(255,255,255,0.5)',
                              transition: 'all 0.2s',
                            }}
                          >
                            {active && (
                              <div style={{
                                position: 'absolute', top: '6px', right: '8px', fontSize: '0.7rem',
                                background: vibe.color, color: '#fff', borderRadius: '50%',
                                width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>✓</div>
                            )}
                            <span style={{ fontSize: '1.5rem' }}>{vibe.icon}</span>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--deep-violet)', marginTop: '4px' }}>{vibe.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 5: Budget */}
                {step === 5 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>What's your budget? 💰</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Per person per day (guide, food & transport)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {budgetOptions.map(opt => (
                        <button
                          key={opt.value} onClick={() => setBudget(opt.value)}
                          style={{
                            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
                            cursor: 'pointer', textAlign: 'left',
                            border: budget === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                            borderRadius: '14px', background: budget === opt.value ? 'rgba(232,98,42,0.06)' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)' }}>{opt.desc}</div>
                          </div>
                          {budget === opt.value && <span style={{ fontSize: '1.1rem', color: 'var(--burnt-orange)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Pace */}
                {step === 6 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Pick your travel pace 🚀</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>How many activities per day?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {paceOptions.map(opt => (
                        <button
                          key={opt.value} onClick={() => setPace(opt.value)}
                          style={{
                            padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
                            cursor: 'pointer', textAlign: 'left',
                            border: pace === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                            borderRadius: '14px', background: pace === opt.value ? 'rgba(232,98,42,0.06)' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>{opt.desc}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--burnt-orange)', marginTop: '2px' }}>
                              {opt.value === 'relaxed' ? '3 activities/day' : opt.value === 'moderate' ? '4 activities/day' : '6 activities/day'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 7: Final touches */}
                {step === 7 && (
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Final touches ✍️</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Any special requirements or must-see places?</p>
                    <textarea
                      className="input-glass" rows={4}
                      placeholder="e.g., Vegetarian food only, wheelchair accessible, must see Taj at sunrise, allergic to peanuts..."
                      value={preferences} onChange={e => setPreferences(e.target.value)}
                      style={{ resize: 'vertical', minHeight: '100px', fontSize: '0.95rem' }}
                    />
                    {/* Summary preview */}
                    <div style={{
                      marginTop: '20px', padding: '16px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(45,27,78,0.05), rgba(232,98,42,0.05))',
                      border: '1px solid var(--glass-border)',
                    }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--deep-violet)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ✦ Trip Summary
                      </div>
                      <div className="ai-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--muted-lavender)' }}>📍 {selectedDest || '—'}</span>
                        <span style={{ color: 'var(--muted-lavender)' }}>📅 {numDays} day{numDays > 1 ? 's' : ''} · {travelDates || 'Flexible'}</span>
                        <span style={{ color: 'var(--muted-lavender)' }}>👥 {travelGroup} · {groupSize} {groupSize > 1 ? 'people' : 'person'}</span>
                        <span style={{ color: 'var(--muted-lavender)' }}>💰 {budgetOptions.find(b => b.value === budget)?.label}</span>
                        <span style={{ color: 'var(--muted-lavender)', gridColumn: '1 / -1' }}>✨ {selectedVibes.join(', ') || 'No vibes selected'}</span>
                        <span style={{ color: 'var(--muted-lavender)', gridColumn: '1 / -1' }}>🚶 {paceOptions.find(p => p.value === pace)?.label} pace</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={prevStep} className="btn-secondary" style={{ padding: '12px 24px', visibility: step === 1 ? 'hidden' : 'visible' }}>← Back</button>
              <button
                onClick={nextStep} className="btn-primary"
                disabled={!canProceed()}
                style={{
                  padding: '12px 28px',
                  opacity: canProceed() ? 1 : 0.4,
                  cursor: canProceed() ? 'pointer' : 'not-allowed',
                  background: step === totalSteps ? 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))' : undefined,
                  fontSize: step === totalSteps ? '1rem' : undefined,
                }}
              >
                {step === totalSteps ? '✦ Generate My Trip' : 'Next →'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ RESULT PAGE ═══ */}
      {showResult && itinerary && (
        <div style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Hero header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="glass" style={{ padding: '28px', borderRadius: '20px', marginBottom: '24px', border: '1.5px solid rgba(245,166,35,0.25)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))', color: '#fff', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      ✦ AI GENERATED
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '8px', lineHeight: 1.2 }}>
                      Your {itinerary.totalDays}-Day {itinerary.destination.name} Adventure
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.5 }}>
                      {itinerary.dates || 'Flexible dates'} · {itinerary.group}{itinerary.groupSize > 1 ? ` (${itinerary.groupSize})` : ''} · {itinerary.vibes.join(', ')} · {paceOptions.find(p => p.value === itinerary.pace)?.label} pace
                    </p>
                  </div>
                  <div className="ai-result-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>📥 Save</button>
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>🔗 Share</button>
                    <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}>📄 Export PDF</button>
                  </div>
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                className="ai-stat-grid"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}
              >
                {[
                  { icon: itinerary.weather.icon, label: 'Weather', value: itinerary.weather.temp, sub: itinerary.weather.condition },
                  { icon: '💰', label: 'Est. Total', value: `₹${itinerary.costBreakdown.total.toLocaleString()}`, sub: `₹${itinerary.costBreakdown.daily.toLocaleString()}/day` },
                  { icon: '📅', label: 'Duration', value: `${itinerary.totalDays} Days`, sub: `${(timeSlots[itinerary.pace] || timeSlots.moderate).length} activities/day` },
                  { icon: '🎒', label: 'Pack This', value: itinerary.weather.pack.split(',')[0], sub: itinerary.weather.pack.split(',').slice(1).join(',').trim() },
                ].map((stat, i) => (
                  <div key={i} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-lavender)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{stat.label}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep-violet)' }}>{stat.value}</div>
                    {stat.sub && <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)', marginTop: '2px' }}>{stat.sub}</div>}
                  </div>
                ))}
              </motion.div>

              {/* Cost breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
                className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}
              >
                <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', marginBottom: '14px' }}>
                  💰 Cost Breakdown <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', fontWeight: 400 }}>(per person per day)</span>
                </h3>
                <div className="ai-cost-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Guide Fee', amount: itinerary.costBreakdown.guide, color: '#8B5CF6' },
                    { label: 'Food & Dining', amount: itinerary.costBreakdown.food, color: '#E8622A' },
                    { label: 'Transport', amount: itinerary.costBreakdown.transport, color: '#3B82F6' },
                    { label: 'Activities', amount: itinerary.costBreakdown.activities, color: '#22C55E' },
                  ].map((item, i) => (
                    <div key={i} style={{ flex: '1 1 100px', padding: '12px', borderRadius: '12px', background: `${item.color}08`, border: `1px solid ${item.color}20`, textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>₹{item.amount.toLocaleString()}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)', marginTop: '2px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Day-by-day itinerary */}
              {itinerary.days.map((day, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + di * 0.1 }}
                  style={{ marginBottom: '16px' }}
                >
                  {/* Day header */}
                  <button
                    onClick={() => toggleDay(day.day)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 20px', borderRadius: expandedDays[day.day] ? '16px 16px 0 0' : '16px',
                      cursor: 'pointer', border: '1px solid var(--glass-border)', textAlign: 'left',
                      background: expandedDays[day.day] ? 'rgba(232,98,42,0.04)' : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(12px)', transition: 'all 0.3s',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem',
                    }}>D{day.day}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: 0 }}>{day.title}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{day.activities.length} activities</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: expandedDays[day.day] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }}>
                      <path d="M5 8l5 5 5-5" stroke="var(--muted-lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Day activities (collapsible) */}
                  <AnimatePresence>
                    {expandedDays[day.day] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          overflow: 'hidden', borderRadius: '0 0 16px 16px',
                          border: '1px solid var(--glass-border)', borderTop: 'none',
                          background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)',
                        }}
                      >
                        <div style={{ padding: '16px 20px' }}>
                          {day.activities.map((activity, ai) => (
                            <div key={ai} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: ai < day.activities.length - 1 ? '1px solid rgba(245,166,35,0.1)' : 'none' }}>
                              {/* Timeline dot */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '30px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--burnt-orange)', border: '2px solid rgba(232,98,42,0.2)', marginTop: '6px' }} />
                                {ai < day.activities.length - 1 && <div style={{ width: '2px', flex: 1, background: 'rgba(245,166,35,0.15)', marginTop: '4px' }} />}
                              </div>
                              {/* Content */}
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{activity.icon}</span>
                                    <h4 style={{ fontSize: '0.92rem', color: 'var(--deep-violet)', margin: 0 }}>{activity.name}</h4>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,166,35,0.1)', color: 'var(--burnt-orange)', fontWeight: 600 }}>{activity.time}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-lavender)' }}>⏱ {activity.duration}</span>
                                  </div>
                                </div>
                                <p style={{ fontSize: '0.84rem', color: 'var(--muted-lavender)', lineHeight: 1.5, margin: '4px 0' }}>{activity.desc}</p>
                                {activity.tip && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(139,92,246,0.06)', fontSize: '0.75rem', color: '#8B5CF6', marginTop: '4px' }}>
                                    💡 <em>{activity.tip}</em>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Bottom actions */}
              <div className="ai-bottom-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => { setShowResult(false); setItinerary(null); setStep(1); }} style={{ padding: '12px 24px' }}>← Plan New Trip</button>
                <button className="btn-primary" onClick={() => setChatOpen(true)} style={{ padding: '12px 24px' }}>✦ Refine with AI Chat</button>
                <Link to="/explore" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', background: 'var(--deep-violet)' }}>🔍 Find Guides</Link>
              </div>
            </div>

            {/* Chat sidebar */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 30, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: '340px' }}
                  exit={{ opacity: 0, x: 30, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ai-chat-sidebar glass"
                >
                  {/* Chat header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#fff' }}>✦</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--deep-violet)' }}>AI Assistant</div>
                        <div style={{ fontSize: '0.68rem', color: '#22C55E' }}>● Online</div>
                      </div>
                    </div>
                    <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted-lavender)' }}>✕</button>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
                          background: msg.role === 'user' ? 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))' : 'rgba(255,255,255,0.8)',
                          color: msg.role === 'user' ? '#fff' : 'var(--deep-violet)',
                          fontSize: '0.85rem', lineHeight: 1.5,
                          border: msg.role === 'ai' ? '1px solid var(--glass-border)' : 'none',
                        }}>{msg.text}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
                    <input
                      type="text" value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChat()}
                      placeholder="Ask me to adjust the plan…"
                      style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font-body)', color: 'var(--deep-violet)' }}
                    />
                    <button onClick={handleChat} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>→</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITripPlannerPage;
