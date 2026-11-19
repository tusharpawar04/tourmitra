
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const suggestionsTimer = useRef(null);
  const searchFieldRef = useRef(null);
  const categoryRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTourist = user && user.role === 'tourist';

  // Parallax for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % Math.min(reviews.length, 3));
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

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
      {/* ===== HERO SECTION ===== */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '90px 24px 50px',
        textAlign: 'center',
      }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.8rem, 7vw, 5rem)',
              color: '#fff',
              marginBottom: '16px',
              textShadow: '0 2px 40px rgba(26,13,46,0.3)',
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
            }}
          >
            Discover India<br />
            Through <span style={{
              background: 'linear-gradient(135deg, #FCC74B, #F5A623)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Local Eyes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.75)',
              maxWidth: '540px',
              marginBottom: '36px',
              lineHeight: 1.7,
              margin: '0 auto 36px',
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
              position: 'relative',
              zIndex: 50,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0',
              width: '100%',
              maxWidth: '720px',
              borderRadius: '18px',
              overflow: 'visible',
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(245,166,35,0.3)',
              boxShadow: '0 16px 50px rgba(26,13,46,0.22), 0 0 0 1px rgba(255,255,255,0.5) inset',
              margin: '0 auto',
            }}
          >
            <div className="search-field" ref={searchFieldRef} style={{ flex: '1 1 180px', padding: '16px 20px', borderRight: '1px solid rgba(245,166,35,0.15)', position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Destination</div>
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
                        <div style={{ fontWeight: 400, fontSize: '0.88rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{s.state}, India • {s.tag}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 20px', borderRight: '1px solid rgba(245,166,35,0.15)', position: 'relative', zIndex: 60 }}>
              <CalendarPicker
                value={searchDate}
                onChange={setSearchDate}
                placeholder="Add dates"
                label="When"
              />
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '12px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Travelers</div>
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
                  padding: '14px 28px',
                  fontSize: '0.95rem',
                  opacity: isSearchReady ? 1 : 0.45,
                  cursor: isSearchReady ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.3s',
                }}
              >
                Search
              </button>
            </div>
          </motion.div>

          {/* Popular destination quick chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '32px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.04em',
              fontWeight: 400,
            }}>
              Popular:
            </span>
            {['Jaipur', 'Varanasi', 'Goa', 'Ladakh', 'Kerala'].map((city, i) => (
              <button
                key={i}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(city)}`)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.borderColor = 'rgba(252,199,75,0.6)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {city}
              </button>
            ))}
          </motion.div>

          {/* Genuine platform highlights (no fake counts) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              gap: 'clamp(20px, 4vw, 40px)',
              marginTop: '36px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              '✨ AI-Powered Planning',
              '🛡️ Verified Local Guides',
              '🔒 Secure Escrow Payments',
              '💬 Direct Local Insights',
            ].map((feature, i) => (
              <span key={i} style={{
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.65)',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}>
                {feature}
              </span>
            ))}
          </motion.div>
        </motion.div>

      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-glass" style={{ padding: 'clamp(56px, 7vw, 80px) clamp(20px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: 'var(--burnt-orange)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 400,
              marginBottom: '10px',
            }}>Simple Process</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
              How It Works
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            position: 'relative',
          }}>
            {[
              { num: '01', title: 'Discover', desc: 'Browse destinations or use AI to plan your perfect trip', icon: '🔍' },
              { num: '02', title: 'Match', desc: 'Find a verified local guide who matches your interests', icon: '🤝' },
              { num: '03', title: 'Book', desc: 'Secure your guide with our safe escrow payment system', icon: '📅' },
              { num: '04', title: 'Experience', desc: 'Enjoy an authentic, personalized journey guided by a local', icon: '⭐' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: '28px 24px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(245,166,35,0.12)',
                  position: 'relative',
                  transition: 'box-shadow 0.3s, border-color 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,166,35,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(245,166,35,0.12)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(232,98,42,0.1), rgba(245,166,35,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '16px',
                }}>{step.icon}</div>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  fontSize: '0.72rem',
                  fontWeight: 400,
                  color: 'var(--burnt-orange)',
                  opacity: 0.5,
                  fontFamily: 'var(--font-numeric)',
                }}>STEP {step.num}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--deep-violet)', fontWeight: 400 }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED DESTINATION SHOWCASE (Bento Grid) ===== */}
      <section className="section-glass" style={{
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.72)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}
          >
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                color: 'var(--burnt-orange)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 400,
                marginBottom: '10px',
              }}>Handpicked for you</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
                Explore Destinations
              </h2>
            </div>
            <Link to="/explore">
              <button className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                View All →
              </button>
            </Link>
          </motion.div>

          {/* Category pills */}
          <div ref={categoryRef} style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '28px',
            scrollbarWidth: 'none',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`pill ${activeCategory === cat.label ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
              >
                <span style={{ fontSize: '1rem' }}>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Bento-style destination grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(180px, auto)',
            gap: '16px',
          }}>
            {displayDestinations.slice(0, 6).map((dest, i) => {
              // Bento layout: first item large, rest smaller
              const spans = [
                { col: 'span 8', row: 'span 2' },   // hero card
                { col: 'span 4', row: 'span 1' },   // small
                { col: 'span 4', row: 'span 1' },   // small
                { col: 'span 4', row: 'span 1' },   // small
                { col: 'span 4', row: 'span 1' },   // small
                { col: 'span 4', row: 'span 1' },   // small
              ];
              const layout = spans[i] || spans[1];

              return (
                <motion.div
                  key={dest._id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    gridColumn: layout.col,
                    gridRow: layout.row,
                  }}
                  className="bento-dest-card"
                >
                  <Link to={`/destination/${dest._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                    <div style={{
                      position: 'relative',
                      height: '100%',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s cubic-bezier(.22,.68,0,1)',
                        }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                      {/* Gradient overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(26,13,46,0.85) 0%, rgba(26,13,46,0.3) 40%, transparent 70%)',
                      }} />
                      {/* Tag */}
                      <span className="tag-badge" style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}>{dest.tag}</span>
                      {/* Content */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: i === 0 ? '28px' : '18px',
                      }}>
                        <h3 style={{
                          color: '#fff',
                          fontSize: i === 0 ? 'clamp(1.4rem, 3vw, 1.8rem)' : '1.05rem',
                          marginBottom: '4px',
                          fontWeight: 400,
                        }}>{dest.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{dest.state}</span>
                          <span style={{ color: 'var(--golden-amber)', fontSize: '0.82rem' }}>★ {dest.rating}</span>
                          {i === 0 && (
                            <>
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{dest.guides} guides</span>
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                              <span style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 400 }}>from ₹{dest.price.toLocaleString()}/day</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== AI TRIP PLANNER CTA ===== */}
      <section className="section-glass" style={{ padding: 'clamp(40px, 5vw, 60px) clamp(20px, 4vw, 48px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            borderRadius: '24px',
            padding: 'clamp(32px, 5vw, 56px) clamp(24px, 4vw, 48px)',
            background: 'linear-gradient(135deg, var(--deep-violet) 0%, #462066 50%, var(--magenta) 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(245,166,35,0.12)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(192,68,106,0.2)', filter: 'blur(30px)' }} />

          <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '100px',
              background: 'rgba(245,166,35,0.15)',
              border: '1px solid rgba(245,166,35,0.3)',
              fontSize: '0.75rem',
              color: 'var(--golden-amber)',
              marginBottom: '16px',
              fontWeight: 400,
            }}>
              ✨ Powered by AI
            </div>
            <h2 style={{
              color: '#fff',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}>
              Plan Your Perfect Trip<br />in 60 Seconds
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              marginBottom: '24px',
              maxWidth: '400px',
            }}>
              Tell our AI your preferences — budget, interests, group size — and get a custom day-by-day itinerary with matched local guides.
            </p>
            <Link to="/plan">
              <button className="btn-primary" style={{
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))',
                boxShadow: '0 6px 24px rgba(232,98,42,0.4)',
              }}>
                Try AI Planner →
              </button>
            </Link>
          </div>

          {/* Faux itinerary preview */}
          <div style={{
            flex: '0 1 280px',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '20px',
            }}>
              {[
                { day: 'Day 1', place: 'Amber Fort & City Palace', time: '9:00 AM' },
                { day: 'Day 2', place: 'Hawa Mahal & Bazaars', time: '10:00 AM' },
                { day: 'Day 3', place: 'Nahargarh & Sunset', time: '4:00 PM' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: i === 0 ? 'var(--burnt-orange)' : 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.72rem',
                    fontWeight: 400,
                    flexShrink: 0,
                  }}>{item.day.split(' ')[1]}</div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 400 }}>{item.place}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURED GUIDES ===== */}
      <section className="section-glass" style={{
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 4vw, 48px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}
          >
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                color: 'var(--burnt-orange)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 400,
                marginBottom: '10px',
              }}>Meet the locals</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '6px' }}>
                Top Verified Guides
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted-lavender)', maxWidth: '460px' }}>
                Passionate locals who turn every trip into a story worth telling.
              </p>
            </div>
            <Link to="/guides">
              <button className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                All Guides →
              </button>
            </Link>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {guides.slice(0, 4).map((guide, i) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/guides/${guide._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                      <img
                        src={guide.photo}
                        alt={guide.name}
                        style={{
                          width: '88px',
                          height: '88px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--golden-amber)',
                          boxShadow: '0 4px 16px rgba(245,166,35,0.2)',
                        }}
                      />
                      {guide.verified && (
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '-2px',
                          background: '#4CAF50',
                          color: '#fff',
                          fontSize: '0.65rem',
                          padding: '3px 7px',
                          borderRadius: '100px',
                          fontWeight: 400,
                          boxShadow: '0 2px 6px rgba(76,175,80,0.3)',
                        }}>✓ Verified</span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.08rem', color: 'var(--deep-violet)', marginBottom: '4px' }}>{guide.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '10px' }}>{guide.city}, India</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '12px' }}>
                      <StarRating rating={guide.rating} />
                      <span style={{ fontSize: '0.82rem', color: 'var(--deep-violet)', fontWeight: 400 }}>{guide.rating}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>({guide.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                      {guide.specialties.map(s => (
                        <span key={s} className="tag-badge" style={{ fontSize: '0.7rem' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(245,166,35,0.1)',
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{guide.languages.slice(0, 2).join(' • ')}</span>
                      <span style={{ fontWeight: 400, color: 'var(--deep-violet)', fontSize: '0.95rem' }}>
                        ₹{guide.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>/day</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS (Carousel Style) ===== */}
      <section className="section-glass" style={{
        padding: 'clamp(56px, 7vw, 80px) clamp(20px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.72)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: 'var(--burnt-orange)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 400,
              marginBottom: '10px',
            }}>Real Stories</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
              Traveler Stories
            </h2>
          </motion.div>

          {/* Featured testimonial */}
          {reviews.length > 0 && (
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                padding: 'clamp(28px, 4vw, 48px)',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 8px 40px rgba(26,13,46,0.08)',
              }}
            >
              {/* Large quote mark */}
              <div style={{
                fontSize: '4rem',
                lineHeight: 1,
                color: 'rgba(245,166,35,0.15)',
                fontFamily: 'Georgia, serif',
                marginBottom: '8px',
              }}>"</div>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--deep-violet)',
                lineHeight: 1.7,
                fontStyle: 'italic',
                maxWidth: '600px',
                margin: '0 auto 24px',
              }}>
                "{reviews[activeTestimonial]?.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 400,
                  fontSize: '1rem',
                }}>
                  {(reviews[activeTestimonial]?.author?.name || 'A')[0]}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--deep-violet)' }}>
                    {reviews[activeTestimonial]?.author?.name || 'Anonymous'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StarRating rating={reviews[activeTestimonial]?.rating || 5} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>
                      {new Date(reviews[activeTestimonial]?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {reviews.slice(0, 3).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    style={{
                      width: activeTestimonial === i ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '100px',
                      border: 'none',
                      background: activeTestimonial === i ? 'var(--burnt-orange)' : 'rgba(245,166,35,0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Grid of smaller testimonials below */}
          {reviews.length > 1 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '24px',
            }}>
              {reviews.filter((_, i) => i !== activeTestimonial).slice(0, 2).map((review, i) => (
                <motion.div
                  key={review._id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{ padding: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <StarRating rating={review.rating} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--deep-violet)', lineHeight: 1.6, marginBottom: '12px', fontStyle: 'italic' }}>
                    "{review.text.length > 100 ? review.text.slice(0, 100) + '...' : review.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 400, fontSize: '0.75rem' }}>
                      {(review.author?.name || 'A')[0]}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)' }}>{review.author?.name || 'Anonymous'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== BECOME A GUIDE + FINAL CTA (Split Section) ===== */}
      <section style={{
        padding: 'clamp(56px, 8vw, 88px) clamp(20px, 4vw, 48px)',
        position: 'relative',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {/* Traveler CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                borderRadius: '24px',
                padding: 'clamp(32px, 4vw, 48px)',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.15)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🌍</div>
              <h3 style={{
                color: '#fff',
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                marginBottom: '12px',
                textShadow: '0 2px 20px rgba(26,13,46,0.3)',
              }}>
                Your Next Adventure Awaits
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}>
                Let our AI plan the perfect trip, matched with a local guide who'll make it unforgettable.
              </p>
              <Link to="/explore">
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '0.95rem' }}>
                  Start Exploring
                </button>
              </Link>
            </motion.div>

            {/* Guide CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                borderRadius: '24px',
                padding: 'clamp(32px, 4vw, 48px)',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(245,166,35,0.2)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🗺️</div>
              <h3 style={{
                color: '#fff',
                fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                marginBottom: '12px',
                textShadow: '0 2px 20px rgba(26,13,46,0.3)',
              }}>
                Share Your Local Knowledge
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}>
                Join our growing community of verified guides earning by showing travelers the authentic side of India.
              </p>
              <Link to="/for-guides">
                <button className="btn-secondary" style={{
                  padding: '14px 32px',
                  fontSize: '0.95rem',
                  color: '#fff',
                  borderColor: 'rgba(245,166,35,0.4)',
                  background: 'rgba(245,166,35,0.1)',
                }}>
                  Become a Guide
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
