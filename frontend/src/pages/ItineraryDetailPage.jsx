import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itinerariesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ItineraryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    try {
      const data = await itinerariesAPI.getById(id);
      setItinerary(data.itinerary);
      setHasFullAccess(data.hasFullAccess);
    } catch (err) {
      console.error('Fetch itinerary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      await itinerariesAPI.purchase(id);
      alert('🎉 Itinerary purchased successfully! Full access granted.');
      fetchItinerary(); // Refresh to get full access
    } catch (err) {
      console.error('Purchase error:', err);
      alert(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const difficultyColor = (diff) => {
    if (diff === 'easy') return '#4CAF50';
    if (diff === 'moderate') return '#F5A623';
    return '#F44336';
  };

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(245,166,35,0.15)', borderTopColor: 'var(--burnt-orange)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--nav-height)', textAlign: 'center', padding: '60px 20px' }}>
        <h2>Itinerary not found</h2>
        <Link to="/itineraries"><button className="btn-primary" style={{ marginTop: '20px' }}>Browse Itineraries</button></Link>
      </div>
    );
  }

  const isOwner = user && itinerary.creator._id === user._id;

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Cover Hero */}
      <div style={{
        height: 'clamp(250px, 35vh, 400px)',
        background: itinerary.coverImage ? `url(${itinerary.coverImage})` : 'linear-gradient(135deg, #2D1B4E, #C0446A, #E8622A)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,13,46,0.4)' }} />
      </div>

      {/* Content */}
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Header Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '-60px', position: 'relative', zIndex: 2 }}>
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className="tag-badge">{itinerary.category}</span>
                <span style={{ padding: '4px 12px', borderRadius: '100px', background: `rgba(${itinerary.difficulty === 'easy' ? '76,175,80' : itinerary.difficulty === 'moderate' ? '245,166,35' : '244,67,54'},0.1)`, color: difficultyColor(itinerary.difficulty), fontSize: '0.8rem', fontWeight: 400 }}>
                  {itinerary.difficulty}
                </span>
                {itinerary.isVerified && (
                  <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(76,175,80,0.1)', color: '#4CAF50', fontSize: '0.8rem', fontWeight: 400 }}>
                    ✓ Verified
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>{itinerary.title}</h1>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={itinerary.creator.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(itinerary.creator.name)}`}
                    alt={itinerary.creator.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--deep-violet)' }}>
                      {itinerary.creator.name} {itinerary.creator.verified && '✓'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>
                      {itinerary.creator.city || 'Creator'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>
                  📍 {itinerary.destination.name} • {itinerary.duration} days • ⭐ {itinerary.rating || 0} ({itinerary.reviewCount || 0})
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>
                  👁️ {itinerary.viewCount || 0} views • 🛒 {itinerary.purchaseCount || 0} purchased
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--muted-lavender)', lineHeight: 1.6, marginBottom: '20px' }}>
                {itinerary.description}
              </p>

              {/* Price & CTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>
                    Itinerary Price • Est. Trip Cost: ₹{(itinerary.estimatedTripCost || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--burnt-orange)' }}>
                    ₹{itinerary.price}
                  </div>
                </div>

                {isOwner ? (
                  <Link to={`/itineraries/${itinerary._id}/edit`}>
                    <button className="btn-secondary" style={{ padding: '12px 28px', fontSize: '1rem' }}>✏️ Edit</button>
                  </Link>
                ) : hasFullAccess ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ padding: '12px 28px', background: 'rgba(76,175,80,0.1)', borderRadius: '10px', border: '2px solid #4CAF50', color: '#4CAF50', fontWeight: 400, fontSize: '1rem' }}>
                      ✅ Purchased - Full Access
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="btn-primary"
                    style={{ padding: '12px 28px', fontSize: '1rem', opacity: purchasing ? 0.6 : 1, cursor: purchasing ? 'wait' : 'pointer' }}
                  >
                    {purchasing ? '⏳ Processing...' : '🛒 Purchase & Unlock'}
                  </button>
                )}
              </div>

              {!hasFullAccess && !isOwner && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--burnt-orange)' }}>
                  ⚠️ <strong>Preview Mode:</strong> Showing Day 1 only. Purchase to unlock all {itinerary.duration} days with full details, GPS locations, and route map.
                </div>
              )}
            </div>

            {/* Highlights */}
            {itinerary.highlights && itinerary.highlights.length > 0 && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>✨ Highlights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {itinerary.highlights.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--burnt-orange)' }}>✓</span> {h}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>📅 Day-by-Day Itinerary</h3>

              {/* Day Tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '8px' }}>
                {itinerary.days && itinerary.days.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`pill ${activeDay === day.day ? 'active' : ''}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Day {day.day}
                  </button>
                ))}
              </div>

              {/* Active Day Content */}
              {itinerary.days && itinerary.days.filter(d => d.day === activeDay).map((day) => (
                <div key={day.day}>
                  <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: 'var(--deep-violet)', marginBottom: '12px' }}>{day.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', marginBottom: '20px', lineHeight: 1.6 }}>
                    {day.description}
                  </p>

                  {/* Activities */}
                  {day.activities && day.activities.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.95rem', color: 'var(--deep-violet)', marginBottom: '12px' }}>Activities</h5>
                      {day.activities.map((activity, i) => (
                        <div key={i} className="glass" style={{ padding: '14px', marginBottom: '10px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 400, color: 'var(--burnt-orange)', fontSize: '0.85rem' }}>
                              {activity.time || 'Flexible'}
                            </div>
                            {activity.cost > 0 && (
                              <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>
                                ₹{activity.cost}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '4px' }}>
                            {activity.activity}
                          </div>
                          {activity.location && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>
                              📍 {activity.location}
                            </div>
                          )}
                          {activity.duration && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>
                              ⏱️ {activity.duration}
                            </div>
                          )}
                          {activity.notes && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginTop: '6px', fontStyle: 'italic' }}>
                              💡 {activity.notes}
                            </div>
                          )}
                          {!hasFullAccess && activity.coordinates && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(245,166,35,0.1)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--burnt-orange)' }}>
                              🔒 GPS coordinates unlocked after purchase
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {itinerary.daysPreviewOnly && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(245,166,35,0.1)', border: '2px solid var(--burnt-orange)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--burnt-orange)', fontWeight: 400, marginBottom: '12px' }}>
                    🔒 Unlock all {itinerary.duration} days with detailed activities, GPS coordinates, and insider tips
                  </p>
                  <button onClick={handlePurchase} disabled={purchasing} className="btn-primary" style={{ padding: '10px 24px' }}>
                    Purchase for ₹{itinerary.price}
                  </button>
                </div>
              )}
            </div>

            {/* What's Included */}
            {itinerary.included && itinerary.included.length > 0 && (
              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>✅ What's Included</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                  {itinerary.included.map((item, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Tips */}
            {itinerary.travelTips && itinerary.travelTips.length > 0 && (
              <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>💡 Travel Tips</h3>
                {itinerary.travelTips.map((tip, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '8px', paddingLeft: '16px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0 }}>•</span> {tip}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetailPage;
