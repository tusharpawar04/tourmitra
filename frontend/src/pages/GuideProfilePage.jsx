import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guidesAPI, reviewsAPI } from '../services/api';

const StarRating = ({ rating, size = '0.85rem' }) => (
  <span className="star" style={{ fontSize: size, letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}
    {rating % 1 >= 0.5 ? '½' : ''}
  </span>
);

const GuideProfilePage = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [guideReviews, setGuideReviews] = useState([]);
  const [otherGuides, setOtherGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    Promise.all([
      guidesAPI.getById(id),
      guidesAPI.getAll({ limit: 6 }),
    ]).then(([guideData, allGuidesData]) => {
      setGuide(guideData.guide);
      setGuideReviews(guideData.reviews || []);
      setOtherGuides(allGuidesData.guides.filter(g => g._id !== id).slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted-lavender)' }}>Loading guide...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '16px' }}>Guide not found</h2>
          <Link to="/guides"><button className="btn-primary">Browse Guides</button></Link>
        </div>
      </div>
    );
  }

  // Generate fake availability for demo
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Cover / Hero */}
      <div style={{
        height: 'clamp(200px, 30vh, 320px)',
        background: 'linear-gradient(135deg, #2D1B4E 0%, #C0446A 50%, #E8622A 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(245,166,35,0.15)', top: '-100px', right: '-50px', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(192,68,106,0.2)', bottom: '-60px', left: '20%', filter: 'blur(40px)' }} />
      </div>

      {/* Profile header overlapping cover */}
      <div className="section-glass" style={{ padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-end',
              marginTop: '-60px',
              paddingBottom: '28px',
              flexWrap: 'wrap',
            }}
          >
            {/* Photo */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={guide.photo} alt={guide.name} style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #fff',
                boxShadow: '0 4px 20px rgba(26,13,46,0.15)',
              }} />
              {guide.verified && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: '#4CAF50',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '3px solid #fff',
                }}>✓</div>
              )}
            </div>

            {/* Name + info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '4px' }}>{guide.name}</h1>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>📍 {guide.city}, India</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <StarRating rating={guide.rating} size="1rem" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep-violet)' }}>{guide.rating}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>({guide.reviews} reviews)</span>
                <span style={{ color: 'var(--glass-border)' }}>•</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{guide.tours} tours completed</span>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/login">
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>Book This Guide</button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary" style={{ padding: '12px 20px', fontSize: '0.95rem' }}>💬 Message</button>
              </Link>
            </div>
          </motion.div>

          {/* Trust strip */}
          <div style={{
            display: 'flex',
            gap: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--glass-border)',
            flexWrap: 'wrap',
          }}>
            {[
              { icon: '🛡️', text: 'Aadhaar Verified' },
              { icon: '✅', text: 'Background Checked' },
              { icon: '🎯', text: `${guide.tours}+ Tours` },
              { icon: '⭐', text: `${guide.rating} Rating` },
            ].map((item, i) => (
              <span key={i} style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="section-glass" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', display: 'flex', gap: '0', overflowX: 'auto' }}>
          {['about', 'gallery', 'itineraries', 'availability', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--burnt-orange)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="section-glass" style={{ padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 48px)', minHeight: '400px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {/* Main content */}
          <div style={{ flex: '1 1 580px', minWidth: 0 }}>
            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>About {guide.name}</h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted-lavender)', marginBottom: '32px' }}>{guide.about}</p>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Specialties</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                  {guide.specialties.map(s => <span key={s} className="tag-badge" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>{s}</span>)}
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Languages</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
                  {guide.languages.map(lang => (
                    <span key={lang} className="glass" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>
                      🗣️ {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Experience Gallery</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop',
                  ].map((img, i) => (
                    <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', height: '180px' }}>
                      <img src={img} alt={`Tour ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Itineraries Tab */}
            {activeTab === 'itineraries' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Sample Itineraries</h2>
                {[
                  { title: `${guide.city} Heritage Walk`, duration: 'Full Day (8 hrs)', highlights: ['Historical monuments', 'Local markets', 'Street food stops', 'Hidden gems'], price: guide.price },
                  { title: `${guide.city} Sunrise Experience`, duration: 'Half Day (4 hrs)', highlights: ['Sunrise viewpoint', 'Morning rituals', 'Traditional breakfast', 'Photo walk'], price: Math.round(guide.price * 0.6) },
                ].map((itin, i) => (
                  <div key={i} className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', margin: 0 }}>{itin.title}</h3>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>⏱️ {itin.duration}</span>
                      </div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>₹{itin.price.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {itin.highlights.map(h => (
                        <span key={h} className="glass" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--deep-violet)' }}>📍 {h}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Availability This Week</h2>
                <div className="glass" style={{ padding: '20px', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}></th>
                        {days.map(d => (
                          <th key={d} style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' }}>{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(slot => (
                        <tr key={slot}>
                          <td style={{ padding: '12px 10px', fontSize: '0.82rem', color: 'var(--muted-lavender)', fontWeight: 500 }}>{slot}</td>
                          {days.map(d => {
                            const available = guide.availability.includes(d);
                            return (
                              <td key={d} style={{ padding: '8px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: available ? 'rgba(76,175,80,0.15)' : 'rgba(160,139,181,0.1)',
                                  color: available ? '#4CAF50' : 'var(--muted-lavender)',
                                  fontSize: '0.75rem',
                                  lineHeight: '28px',
                                  fontWeight: 600,
                                }}>
                                  {available ? '✓' : '–'}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Reviews ({guideReviews.length})</h2>
                {guideReviews.length === 0 ? (
                  <p style={{ color: 'var(--muted-lavender)' }}>No reviews yet for this guide.</p>
                ) : (
                  guideReviews.map(review => (
                    <div key={review._id} className="glass-card" style={{ padding: '20px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{(review.author?.name || 'A')[0]}</div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{review.author?.name || 'Anonymous'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.6, fontStyle: 'italic' }}>"{review.text}"</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          {/* Sticky pricing sidebar */}
          <div style={{ flex: '0 0 300px', minWidth: '280px' }} id="guide-price-sidebar">
            <div className="glass" style={{
              padding: '24px',
              position: 'sticky',
              top: 'calc(var(--nav-height) + 24px)',
              borderRadius: '16px',
              border: '1.5px solid rgba(245,166,35,0.3)',
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Pricing</h3>
              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                {[
                  { label: 'Half Day (4 hrs)', price: Math.round(guide.price * 0.6) },
                  { label: 'Full Day (8 hrs)', price: guide.price },
                  { label: 'Multi-Day (per day)', price: Math.round(guide.price * 0.85) },
                ].map(tier => (
                  <div key={tier.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--muted-lavender)' }}>{tier.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--deep-violet)' }}>₹{tier.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', marginBottom: '16px' }}>
                + Group surcharge: ₹200/person for 4+ travelers
              </p>
              <Link to="/login" style={{ display: 'block' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Book {guide.name.split(' ')[0]}</button>
              </Link>
              <Link to="/login" style={{ display: 'block', marginTop: '10px' }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}>💬 Send Message</button>
              </Link>
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted-lavender)', marginTop: '12px' }}>🔒 Escrow-protected payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other guides */}
      <div className="section-glass" style={{ padding: '40px clamp(16px, 4vw, 48px)', background: 'rgba(255,255,255,0.72)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Other Guides You Might Like</h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            {otherGuides.map(g => (
              <Link key={g._id} to={`/guides/${g._id}`} style={{ textDecoration: 'none', minWidth: '240px' }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <img src={g.photo} alt={g.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', margin: '0 auto 10px' }} />
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--deep-violet)', marginBottom: '4px' }}>{g.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>📍 {g.city}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                    <StarRating rating={g.rating} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{g.rating}</span>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep-violet)' }}>₹{g.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>/day</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #guide-price-sidebar { flex: 1 1 100% !important; min-width: 100% !important; order: -1; }
          #guide-price-sidebar .glass { position: static !important; }
        }
      `}</style>
    </div>
  );
};

export default GuideProfilePage;
