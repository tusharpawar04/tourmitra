import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { guidesAPI, bookingsAPI } from '../services/api';

const GuideDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [allBookings, setAllBookings] = useState([]);

  // Redirect if not guide
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'guide')) {
      navigate('/login?redirect=/guide/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user || user.role !== 'guide') return;
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          guidesAPI.getDashboard(),
          bookingsAPI.getGuideBookings(),
        ]);
        setDashData(statsRes);
        setAllBookings(bookingsRes.bookings || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Handle accept/decline booking
  const handleBookingAction = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      // Re-fetch
      const [statsRes, bookingsRes] = await Promise.all([
        guidesAPI.getDashboard(),
        bookingsAPI.getGuideBookings(),
      ]);
      setDashData(statsRes);
      setAllBookings(bookingsRes.bookings || []);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(245,166,35,0.15)', borderTopColor: 'var(--burnt-orange)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const guide = user;
  const stats = dashData?.stats || {};
  const upcomingBookings = dashData?.upcomingBookings || [];
  const recentReviews = dashData?.recentReviews || [];

  const statCards = [
    { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, icon: '💰', change: `${stats.totalBookings || 0} bookings`, changeColor: '#4CAF50' },
    { label: 'Confirmed', value: String(stats.confirmedBookings || 0), icon: '✅', change: 'active tours', changeColor: '#4CAF50' },
    { label: 'Pending', value: String(stats.pendingBookings || 0), icon: '⏳', change: 'awaiting action', changeColor: '#F5A623' },
    { label: 'Avg Rating', value: String(stats.rating || '—'), icon: '⭐', change: `${stats.reviewCount || 0} reviews`, changeColor: 'var(--muted-lavender)' },
  ];

  const statusColor = (s) => {
    if (s === 'confirmed') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Confirmed' };
    if (s === 'pending') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: s };
  };

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="section-glass" style={{ padding: '28px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={guide.photo || guide.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(guide.name)} alt={guide.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--golden-amber)' }} />
            {guide.verified && <div style={{ position: 'absolute', bottom: '0', right: '-2px', background: '#4CAF50', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, border: '2px solid #fff' }}>✓</div>}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', marginBottom: '2px' }}>Guide Dashboard</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{guide.name} • 📍 {guide.city || 'N/A'} • ⭐ {stats.rating || '—'} ({stats.reviewCount || 0} reviews)</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/guides/${guide._id}`}><button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>View Public Page</button></Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-glass" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', display: 'flex', overflowX: 'auto' }}>
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'bookings', label: '📅 Bookings' },
            { key: 'earnings', label: '💰 Earnings' },
            { key: 'messages', label: '💬 Messages' },
            { key: 'reviews', label: '⭐ Reviews' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '16px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--burnt-orange)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
              fontWeight: activeTab === tab.key ? 600 : 400, fontSize: '0.88rem',
              fontFamily: 'var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats cards */}
              <div className="dashboard-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {statCards.map((stat, i) => (
                  <motion.div key={stat.label} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ padding: '20px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>{stat.label}</span>
                      <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', marginBottom: '4px' }}>{stat.value}</div>
                    <span style={{ fontSize: '0.75rem', color: stat.changeColor, fontWeight: 600 }}>{stat.change}</span>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Update Availability', icon: '📅' },
                  { label: 'Add Itinerary', icon: '📝' },
                  { label: 'Upload Gallery', icon: '📸' },
                  { label: 'Set Pricing', icon: '💰' },
                ].map(action => (
                  <button key={action.label} className="glass-card" style={{ padding: '16px 20px', cursor: 'pointer', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 500, color: 'var(--deep-violet)', fontFamily: 'var(--font-body)', transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '1.2rem' }}>{action.icon}</span> {action.label}
                  </button>
                ))}
              </div>

              {/* Upcoming + Messages side by side */}
              <div className="dashboard-flex-row" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Upcoming Bookings</h3>
                  {upcomingBookings.length === 0 && <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>No upcoming bookings yet.</p>}
                  {upcomingBookings.slice(0, 3).map(bk => {
                    const sc = statusColor(bk.status);
                    return (
                      <div key={bk._id || bk.bookingId} className="glass-card" style={{ padding: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{bk.tourist?.name || 'Tourist'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'} • {bk.travelers} travelers</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 600 }}>{sc.text}</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--deep-violet)', marginTop: '4px', fontFamily: 'var(--font-numeric)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Recent Reviews</h3>
                  {recentReviews.length === 0 && <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>No reviews yet.</p>}
                  {recentReviews.slice(0, 3).map((review, i) => (
                    <div key={review._id || i} className="glass-card" style={{ padding: '14px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep-violet)' }}>
                          {review.author?.name || 'Anonymous'}
                        </span>
                        <span className="star" style={{ fontSize: '0.78rem' }}>{'★'.repeat(review.rating)}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>All Bookings</h2>
              {allBookings.length === 0 ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No bookings yet. Share your profile to get started!</p>
                </div>
              ) : (
              <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      {['Booking ID', 'Tourist', 'Date', 'Type', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map(bk => {
                      const sc = statusColor(bk.status);
                      return (
                        <tr key={bk._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{bk.bookingId}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)' }}>{bk.tourist?.name || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep-violet)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 600 }}>{sc.text}</span></td>
                          <td style={{ padding: '12px 16px' }}>
                            {bk.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => handleBookingAction(bk._id, 'confirmed')} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: 'none', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Accept</button>
                                <button onClick={() => handleBookingAction(bk._id, 'cancelled')} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.3)', background: 'transparent', color: '#dc3545', cursor: 'pointer', fontWeight: 600 }}>Decline</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </motion.div>
          )}

          {/* Earnings */}
          {activeTab === 'earnings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Earnings & Payouts</h2>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>Total Earnings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>₹{(stats.totalEarnings || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4CAF50', fontWeight: 600, marginTop: '8px' }}>{stats.tours || 0} tours completed</div>
                </div>
                <div className="glass-card" style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>Active Bookings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>{stats.confirmedBookings || 0}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>{stats.pendingBookings || 0} pending</div>
                </div>
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Recent Bookings</h3>
              {allBookings.filter(b => ['confirmed', 'completed'].includes(b.status)).length === 0 && (
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>No confirmed bookings yet.</p>
              )}
              {allBookings.filter(b => ['confirmed', 'completed'].includes(b.status)).map((bk, i) => (
                <div key={bk._id || i} className="glass-card" style={{ padding: '16px 20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{bk.tourist?.name || 'Tourist'} — {bk.destination?.name || 'Tour'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {bk.days} day(s)</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>₹{(bk.pricing?.guideFee || 0).toLocaleString()}</div>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '100px', background: bk.status === 'completed' ? 'rgba(76,175,80,0.1)' : 'rgba(245,166,35,0.1)', color: bk.status === 'completed' ? '#4CAF50' : '#F5A623', fontWeight: 600 }}>{bk.status === 'completed' ? 'Completed' : 'Confirmed'}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Messages</h2>
              <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                <p style={{ fontSize: '1rem', color: 'var(--deep-violet)', fontWeight: 600, marginBottom: '4px' }}>Messaging Coming Soon</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>In-app chat with tourists will be available in the next update.</p>
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Reviews ({stats.reviewCount || 0})</h2>
                <div className="glass" style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>{stats.rating || '—'}</span>
                  <div>
                    <span className="star" style={{ fontSize: '0.9rem' }}>{'★'.repeat(Math.floor(stats.rating || 0))}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)' }}>{stats.reviewCount || 0} reviews</div>
                  </div>
                </div>
              </div>
              {recentReviews.length === 0 && <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>No reviews yet.</p>}
              {recentReviews.map((review, i) => (
                <motion.div key={review._id || i} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '20px', marginBottom: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        {review.author?.avatar ? (
                          <img src={review.author.avatar} alt={review.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{(review.author?.name || '?')[0]}</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{review.author?.name || 'Tourist'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <span className="star" style={{ fontSize: '0.85rem' }}>{'★'.repeat(review.rating)}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.6, fontStyle: 'italic' }}>"{review.text}"</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDashboardPage;
