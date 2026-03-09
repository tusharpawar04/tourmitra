import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationsAPI, guidesAPI, reviewsAPI } from '../services/api';
import { categories } from '../data/mockData';
import CalendarPicker from '../components/CalendarPicker';
import { useAuth } from '../contexts/AuthContext';

const StarRating = ({ rating }) => (
  <span className="star" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? '½' : ''}
  </span>
);

const HomePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [guides, setGuides] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Heritage');
  const [searchDest, setSearchDest] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTravelers, setSearchTravelers] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimer = useRef(null);
  const searchFieldRef = useRef(null);
  const categoryRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTourist = user && user.role === 'tourist';

  // Debounced autocomplete
  const handleDestChange = (val) => {
    setSearchDest(val);
    clearTimeout(suggestionsTimer.current);
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestionsTimer.current = setTimeout(() => {
      destinationsAPI.getAll({ search: val.trim(), limit: 5 }).then(data => {
        setSuggestions(data.destinations || []);
        setShowSuggestions(true);
      }).catch(() => {});
    }, 250);
  };

  const pickSuggestion = (name) => {
    setSearchDest(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchFieldRef.current && !searchFieldRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSearch = () => {
    if (!searchDest.trim()) return;
    const params = new URLSearchParams();
    params.set('q', searchDest.trim());
    if (searchDate) params.set('date', searchDate);
    if (searchTravelers) params.set('travelers', searchTravelers);
    navigate(`/explore?${params.toString()}`);
  };

  const isSearchReady = searchDest.trim().length > 0;

  useEffect(() => {
    Promise.all([
      destinationsAPI.getAll(),
      guidesAPI.getAll({ limit: 6 }),
    ]).then(([destData, guidesData]) => {
      setDestinations(destData.destinations);
      setGuides(guidesData.guides);
      // Fetch reviews for the first 3 guides
      if (guidesData.guides.length > 0) {
        Promise.all(
          guidesData.guides.slice(0, 3).map(g => reviewsAPI.getByGuide(g._id).catch(() => ({ reviews: [] })))
        ).then(reviewResults => {
          const allReviews = reviewResults.flatMap(r => r.reviews);
          setReviews(allReviews);
        });
      }
    }).catch(console.error);
  }, []);

  const filteredDestinations = activeCategory
    ? destinations.filter(d => d.tag.includes(activeCategory))
    : destinations;

  const displayDestinations = filteredDestinations.length > 0 ? filteredDestinations : destinations;

  return (
    <div className="page-content">
      {/* ===== HERO SECTION — Sits directly over sunset ===== */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            color: '#fff',
            marginBottom: '16px',
            textShadow: '0 2px 40px rgba(26,13,46,0.3)',
            lineHeight: 1.15,
          }}
        >
          Discover India Through<br />
          <span style={{ color: '#FCC74B' }}>Local Eyes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '560px',
            marginBottom: '40px',
            lineHeight: 1.7,
          }}
        >
          Connect with verified local guides who turn trips into stories.
          AI-powered planning, authentic experiences, unforgettable memories.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          id="hero-search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0',
            width: '100%',
            maxWidth: '680px',
            borderRadius: '16px',
            overflow: 'visible',
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(245,166,35,0.3)',
            boxShadow: '0 8px 40px rgba(26,13,46,0.15)',
          }}
        >
          <div className="search-field" ref={searchFieldRef} style={{ flex: '1 1 180px', padding: '16px 20px', borderRight: '1px solid rgba(245,166,35,0.15)', position: 'relative' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Destination</div>
            <input
              type="text"
              placeholder="Where to explore?"
              value={searchDest}
              onChange={e => handleDestChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={e => e.key === 'Enter' && isSearchReady && handleSearch()}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--deep-violet)',
                width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 100,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(40px) saturate(1.4)',
                borderRadius: '0 0 12px 12px',
                border: '1px solid var(--glass-border)',
                borderTop: 'none',
                boxShadow: '0 8px 30px rgba(26,13,46,0.12), inset 0 1px 0 rgba(255,255,255,0.5)',
                overflow: 'hidden',
              }}>
                {suggestions.map(s => (
                  <div
                    key={s._id}
                    onClick={() => pickSuggestion(s.name)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.88rem',
                      color: 'var(--deep-violet)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={s.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{s.state}, India • {s.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: '16px 20px', borderRight: '1px solid rgba(245,166,35,0.15)' }}>
            <CalendarPicker
              value={searchDate}
              onChange={setSearchDate}
              placeholder="Add dates"
              label="When"
            />
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Travelers</div>
              <input
                type="text"
                placeholder="1 guest"
                value={searchTravelers}
                onChange={e => setSearchTravelers(e.target.value.replace(/[^0-9]/g, ''))}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: 'var(--deep-violet)',
                  width: '80px',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleSearch}
              disabled={!isSearchReady}
              style={{
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '1.1rem',
                opacity: isSearchReady ? 1 : 0.45,
                cursor: isSearchReady ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.3s',
              }}
            >
              🔍
            </button>
          </div>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '48px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['✓ 5,000+ Verified Guides', '✓ 200+ Destinations', '✓ Aadhaar-Verified Safety', '✓ AI Trip Planning'].map((text, i) => (
            <span key={i} style={{
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>{text}</span>
          ))}
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '48px' }}
          >
            How Tourmitra Works
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
          }}>
            {[
              { icon: '🔍', title: 'Discover', desc: 'Browse destinations or use AI to plan your perfect trip' },
              { icon: '🤝', title: 'Match', desc: 'Find a verified local guide who matches your interests' },
              { icon: '📅', title: 'Book', desc: 'Secure your guide with our safe escrow payment system' },
              { icon: '✨', title: 'Experience', desc: 'Enjoy an authentic, personalized journey guided by a local' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{
                  textAlign: 'center',
                  padding: '32px 20px',
                }}
              >
                <div style={{ fontSize: '2.8rem', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--deep-violet)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES + FEATURED DESTINATIONS ===== */}
      <section className="section-glass" style={{
        padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.72)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '32px' }}
          >
            Explore by Category
          </motion.h2>

          {/* Category pills */}
          <div ref={categoryRef} style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '40px',
            scrollbarWidth: 'none',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`pill ${activeCategory === cat.label ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Destination cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {displayDestinations.slice(0, 8).map((dest, i) => (
              <motion.div
                key={dest._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/destination/${dest._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                      <span className="tag-badge" style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                      }}>{dest.tag}</span>
                    </div>
                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--deep-violet)' }}>{dest.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarRating rating={dest.rating} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 600 }}>{dest.rating}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '12px' }}>{dest.state}, India</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>{dest.guides} guides</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep-violet)' }}>
                          ₹{dest.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--muted-lavender)' }}>/day</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/explore">
              <button className="btn-secondary" style={{ padding: '14px 36px' }}>
                View All Destinations →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED GUIDES ===== */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '12px' }}
          >
            Meet Our Top Guides
          </motion.h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted-lavender)', marginBottom: '40px', maxWidth: '500px' }}>
            Verified, passionate locals who turn every trip into a story worth telling.
          </p>

          <div style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '16px',
            scrollbarWidth: 'none',
          }}>
            {guides.map((guide, i) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/guides/${guide._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ minWidth: '260px', padding: '24px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                      <img
                        src={guide.photo}
                        alt={guide.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--golden-amber)',
                        }}
                      />
                      {guide.verified && (
                        <span style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '-4px',
                          background: '#4CAF50',
                          color: '#fff',
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '100px',
                          fontWeight: 700,
                        }}>✓</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', marginBottom: '4px' }}>{guide.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>{guide.city}, India</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                      <StarRating rating={guide.rating} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--deep-violet)', fontWeight: 600 }}>{guide.rating}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>({guide.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                      {guide.specialties.map(s => (
                        <span key={s} className="tag-badge" style={{ fontSize: '0.7rem' }}>{s}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {guide.languages.join(' • ')}
                    </p>
                    <div style={{ fontWeight: 700, color: 'var(--deep-violet)', fontSize: '0.95rem' }}>
                      ₹{guide.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--muted-lavender)' }}>/day</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-glass" style={{
        padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.72)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '48px' }}
          >
            What Travelers Say
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {reviews.slice(0, 3).map((review, i) => (
              <motion.div
                key={review._id}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ padding: '28px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--deep-violet)', lineHeight: 1.7, marginBottom: '16px', fontStyle: 'italic' }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {(review.author?.name || 'A')[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{review.author?.name || 'Anonymous'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 48px)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#fff',
            marginBottom: '16px',
            textShadow: '0 2px 30px rgba(26,13,46,0.4)',
          }}>
            Your next adventure starts here
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.75)',
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px',
          }}>
            Let our AI plan the perfect trip, matched with a local guide who'll make it unforgettable.
          </p>
          <Link to="/explore">
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }}>
              Start Exploring →
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
