import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationsAPI, guidesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CalendarPicker from '../components/CalendarPicker';

const StarRating = ({ rating, size = '0.85rem' }) => (
  <span className="star" style={{ fontSize: size, letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? '½' : ''}
  </span>
);

const DestinationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dest, setDest] = useState(null);
  const [guides, setGuides] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [otherDests, setOtherDests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingDate, setBookingDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  useEffect(() => {
    Promise.all([
      destinationsAPI.getById(id),
      guidesAPI.getAll({ limit: 6 }),
      reviewsAPI.getByDestination(id).catch(() => ({ reviews: [] })),
      destinationsAPI.getAll({ limit: 8 }),
    ]).then(([destData, guidesData, reviewsData, allDestsData]) => {
      setDest(destData.destination);
      setGuides(guidesData.guides);
      setReviews(reviewsData.reviews);
      setOtherDests(allDestsData.destinations.filter(d => d._id !== id).slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ padding: '60px 40px', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 20px',
            border: '3px solid rgba(245, 166, 35, 0.15)',
            borderTopColor: 'var(--burnt-orange)',
            animation: 'spin 0.7s linear infinite',
          }} />
          <p style={{ color: 'var(--deep-violet)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>Loading destination...</p>
          <p style={{ color: 'var(--muted-lavender)', fontSize: '0.82rem' }}>Fetching guides & reviews</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!dest) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '16px' }}>Destination not found</h2>
          <Link to="/explore"><button className="btn-primary">Back to Explore</button></Link>
        </div>
      </div>
    );
  }

  const relatedGuides = guides.filter(g =>
    (g.city && dest.name && g.city.toLowerCase() === dest.name.toLowerCase()) ||
    (g.specialties && dest.tag && g.specialties.some(s => dest.tag.includes(s)))
  ).slice(0, 3);

  const relatedReviews = reviews;

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Hero Image Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', height: 'clamp(300px, 50vh, 480px)', overflow: 'hidden' }}
      >
        <img
          src={dest.gallery?.[selectedImage] || dest.image}
          alt={dest.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 40%, rgba(26,13,46,0.7))',
        }} />

        {/* Info overlay */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: 'clamp(16px, 4vw, 48px)',
          right: 'clamp(16px, 4vw, 48px)',
        }}>
          <div className="glass" style={{
            display: 'inline-block',
            padding: '20px 32px',
            borderRadius: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--deep-violet)', margin: 0 }}>{dest.name}</h1>
              <span className="tag-badge">{dest.tag}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', marginTop: '4px' }}>
              {dest.state}, {dest.country} • {dest.guideCount || 0} verified guides • {dest.duration}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <StarRating rating={dest.rating} size="1rem" />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep-violet)' }}>{dest.rating}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>({(dest.reviewCount || 0).toLocaleString()} reviews)</span>
            </div>
          </div>
        </div>

        {/* Gallery thumbnails */}
        {dest.gallery && dest.gallery.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '32px',
            right: 'clamp(16px, 4vw, 48px)',
            display: 'flex',
            gap: '8px',
          }}>
            {dest.gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '10px',
                  border: selectedImage === i ? '2px solid var(--golden-amber)' : '2px solid rgba(255,255,255,0.5)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Main content */}
      <div className="section-glass" style={{ padding: 'clamp(32px, 5vw, 60px) clamp(16px, 4vw, 48px)' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }}>
          {/* Use CSS to make 2-column on desktop */}
          <div id="detail-layout" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ flex: '1 1 600px', minWidth: 0 }}
            >
              {/* Description */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>About {dest.name}</h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted-lavender)' }}>
                  {dest.description}
                </p>
              </div>

              {/* Highlights */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Top Highlights</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {dest.highlights.map(h => (
                    <span key={h} className="glass" style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      color: 'var(--deep-violet)',
                      fontWeight: 500,
                    }}>
                      📍 {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Travel Info */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Travel Info</h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}>
                  {[
                    { label: 'Best Time', value: dest.bestTime, icon: '🌤️' },
                    { label: 'Duration', value: dest.duration, icon: '📅' },
                    { label: 'Starting Price', value: `₹${dest.price.toLocaleString()}/day`, icon: '💰' },
                    { label: 'Available Guides', value: `${dest.guideCount || 0} verified`, icon: '👤' },
                  ].map(info => (
                    <div key={info.label} className="glass" style={{ padding: '18px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{info.icon}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {info.label}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--deep-violet)', fontWeight: 600 }}>
                        {info.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guides */}
              {relatedGuides.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Available Guides in {dest.name}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {relatedGuides.map(guide => (
                      <div key={guide._id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <img src={guide.photo} alt={guide.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)' }} />
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: 0 }}>{guide.name}</h4>
                            {guide.verified && <span style={{ background: '#4CAF50', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '100px', fontWeight: 700 }}>✓ Verified</span>}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '6px' }}>{guide.tagline}</p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <StarRating rating={guide.rating} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--deep-violet)', fontWeight: 600 }}>{guide.rating}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>• {guide.tours} tours • {guide.languages.join(', ')}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--deep-violet)', fontSize: '1.05rem', marginBottom: '8px' }}>
                            ₹{guide.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>/day</span>
                          </div>
                          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                            onClick={() => navigate(user ? `/book/${guide._id}` : '/login')}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {relatedReviews.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Recent Reviews</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {relatedReviews.map(review => (
                      <div key={review._id} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                              {(review.author?.name || 'A')[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{review.author?.name || 'Anonymous'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{review.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right sidebar — Booking card (sticky) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ flex: '0 0 340px', minWidth: '300px' }}
              id="booking-sidebar"
            >
              <div className="glass" style={{
                padding: '28px',
                position: 'sticky',
                top: 'calc(var(--nav-height) + 24px)',
                borderRadius: '16px',
                border: '1.5px solid rgba(245,166,35,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>
                    ₹{dest.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)' }}>/day per guide</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Date
                  </label>
                  <CalendarPicker
                    value={bookingDate}
                    onChange={setBookingDate}
                    placeholder="Select date"
                    inputClassName="glass-input"
                    compact
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    Travelers
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                      className="glass"
                      style={{ width: '36px', height: '36px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--deep-violet)', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    >−</button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--deep-violet)', minWidth: '24px', textAlign: 'center' }}>{travelers}</span>
                    <button
                      className="glass"
                      style={{ width: '36px', height: '36px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--deep-violet)', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => setTravelers(travelers + 1)}
                    >+</button>
                  </div>
                </div>

                <div style={{
                  padding: '16px 0',
                  borderTop: '1px solid var(--glass-border)',
                  borderBottom: '1px solid var(--glass-border)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>
                    <span>Guide fee × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
                    <span>₹{(dest.price * travelers).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>
                    <span>Platform fee</span>
                    <span>₹{Math.round(dest.price * travelers * 0.12).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: 'var(--deep-violet)', marginTop: '12px' }}>
                    <span>Total</span>
                    <span>₹{Math.round(dest.price * travelers * 1.12).toLocaleString()}</span>
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                  onClick={() => {
                    if (!user) return navigate('/login');
                    const guide = relatedGuides[0];
                    if (guide) navigate(`/book/${guide._id}`);
                    else navigate('/guides');
                  }}
                >
                  Book a Guide
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-lavender)', marginTop: '12px' }}>
                  🔒 Payment secured in escrow until trip completion
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Similar destinations */}
      <div className="section-glass" style={{
        padding: '48px clamp(16px, 4vw, 48px)',
        background: 'rgba(255,255,255,0.72)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>Similar Destinations</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
            {otherDests.map(d => (
              <Link key={d._id} to={`/destination/${d._id}`} style={{ textDecoration: 'none', minWidth: '260px' }}>
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)' }}>{d.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <StarRating rating={d.rating} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{d.rating}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{d.state} • From ₹{d.price}/day</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          #booking-sidebar {
            flex: 1 1 100% !important;
            min-width: 100% !important;
            order: -1;
          }
          #booking-sidebar .glass {
            position: static !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DestinationDetailPage;
