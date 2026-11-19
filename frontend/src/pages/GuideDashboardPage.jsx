import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { guidesAPI, bookingsAPI, ledgerAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useModal } from '../components/ConfirmModal';

const GuideDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();
  const { showPrompt, showConfirm } = useModal();

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

  // Fetch earnings when earnings tab is active
  useEffect(() => {
    if (!user || user.role !== 'guide' || activeTab !== 'earnings') return;
    const fetchEarnings = async () => {
      try {
        const earningsData = await ledgerAPI.getMyEarnings();
        setEarnings(earningsData);
      } catch (err) {
        console.error('Earnings fetch error:', err);
        setEarnings({ totalEarnings: 0, pendingPayout: 0, paidOut: 0, entries: [] });
      }
    };
    fetchEarnings();
  }, [user, activeTab]);

  // Handle accept/decline booking
  const handleBookingAction = async (bookingId, action) => {
    if (action === 'decline') {
      const reason = await showPrompt({
        title: 'Decline Booking',
        message: 'Please provide a reason for declining this booking request.',
        placeholder: 'Enter reason for declining...',
        confirmText: 'Decline',
        type: 'danger',
      });
      if (!reason) return;
      setActionLoading(bookingId);
      try {
        await bookingsAPI.decline(bookingId, reason);
        toast.warning('Booking Declined', 'The tourist has been notified of the decline.');
        // Re-fetch
        const [statsRes, bookingsRes] = await Promise.all([
          guidesAPI.getDashboard(),
          bookingsAPI.getGuideBookings(),
        ]);
        setDashData(statsRes);
        setAllBookings(bookingsRes.bookings || []);
      } catch (err) {
        console.error('Decline error:', err);
        toast.error('Decline Failed', err.response?.data?.error || 'Failed to decline booking.');
      } finally {
        setActionLoading(null);
      }
    } else if (action === 'accept') {
      setActionLoading(bookingId);
      try {
        await bookingsAPI.accept(bookingId);
        toast.success('Booking Accepted', 'The slot has been confirmed! The tourist will be notified.');
        // Re-fetch
        const [statsRes, bookingsRes] = await Promise.all([
          guidesAPI.getDashboard(),
          bookingsAPI.getGuideBookings(),
        ]);
        setDashData(statsRes);
        setAllBookings(bookingsRes.bookings || []);
      } catch (err) {
        console.error('Accept error:', err);
        toast.error('Accept Failed', err.response?.data?.error || 'Failed to accept booking.');
      } finally {
        setActionLoading(null);
      }
    } else if (action === 'complete') {
      const confirmed = await showConfirm({
        title: 'Complete Tour',
        message: 'Mark this tour as completed? This will finalize the booking and approve the payout.',
        confirmText: 'Mark Complete',
        cancelText: 'Cancel',
        type: 'success',
      });
      if (!confirmed) return;
      setActionLoading(bookingId);
      try {
        await bookingsAPI.complete(bookingId);
        toast.success('Tour Completed! 🎉', 'The booking is marked complete and earnings have been updated.');
        // Re-fetch
        const [statsRes, bookingsRes] = await Promise.all([
          guidesAPI.getDashboard(),
          bookingsAPI.getGuideBookings(),
        ]);
        setDashData(statsRes);
        setAllBookings(bookingsRes.bookings || []);
      } catch (err) {
        console.error('Complete error:', err);
        toast.error('Complete Failed', err.response?.data?.error || 'Failed to complete booking.');
      } finally {
        setActionLoading(null);
      }
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
    if (s === 'requested') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Requested' };
    if (s === 'accepted') return { bg: 'rgba(33,150,243,0.1)', color: '#2196F3', text: 'Accepted' };
    if (s === 'confirmed') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Confirmed' };
    if (s === 'in_progress') return { bg: 'rgba(0,188,212,0.1)', color: '#00BCD4', text: 'In Progress' };
    if (s === 'completed') return { bg: 'rgba(46,125,50,0.1)', color: '#2E7D32', text: 'Completed' };
    if (s === 'declined') return { bg: 'rgba(244,67,54,0.1)', color: '#F44336', text: 'Declined' };
    if (s === 'cancelled') return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: 'Cancelled' };
    if (s === 'expired') return { bg: 'rgba(158,158,158,0.1)', color: '#9E9E9E', text: 'Expired' };
    if (s === 'disputed') return { bg: 'rgba(255,152,0,0.1)', color: '#FF9800', text: 'Disputed' };
    // Legacy support
    if (s === 'pending') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: s };
  };

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* TEST MODE Banner */}
      <div className="section-glass" style={{ padding: '12px 24px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="glass" style={{ padding: '12px 24px', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--burnt-orange)', borderRadius: '12px', textAlign: 'center' }}>
            <strong>⚠️ TEST MODE</strong> - No real payments processed
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="section-glass" style={{ padding: '28px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={guide.photo || guide.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(guide.name)} alt={guide.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--golden-amber)' }} />
            {guide.verified && <div style={{ position: 'absolute', bottom: '0', right: '-2px', background: '#4CAF50', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 400, border: '2px solid #fff' }}>✓</div>}
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
              fontWeight: activeTab === tab.key ? 500 : 400, fontSize: '0.88rem',
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
                    <div style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', marginBottom: '4px' }}>{stat.value}</div>
                    <span style={{ fontSize: '0.75rem', color: stat.changeColor, fontWeight: 400 }}>{stat.change}</span>
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
                          <div style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--deep-violet)' }}>{bk.tourist?.name || 'Tourist'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'} • {bk.travelers} travelers</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span>
                          <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--deep-violet)', marginTop: '4px', fontFamily: 'var(--font-numeric)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</div>
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
                        <span style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--deep-violet)' }}>
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
                <>
                  {/* Pending Requests */}
                  {allBookings.filter(b => b.status === 'requested' || b.status === 'pending').length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--burnt-orange)' }}>⏳ Pending Requests</h3>
                      <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                              {['Booking ID', 'Tourist', 'Date', 'Type', 'Amount', 'Status', 'Action'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allBookings.filter(b => b.status === 'requested' || b.status === 'pending').map(bk => {
                              const sc = statusColor(bk.status);
                              return (
                                <tr key={bk._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{bk.bookingId}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)' }}>{bk.tourist?.name || '—'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</td>
                                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button onClick={() => handleBookingAction(bk._id, 'accept')} disabled={actionLoading === bk._id} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: 'none', background: '#4CAF50', color: '#fff', cursor: actionLoading === bk._id ? 'wait' : 'pointer', fontWeight: 400, opacity: actionLoading === bk._id ? 0.6 : 1 }}>Accept</button>
                                      <button onClick={() => handleBookingAction(bk._id, 'decline')} disabled={actionLoading === bk._id} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.3)', background: 'transparent', color: '#dc3545', cursor: actionLoading === bk._id ? 'wait' : 'pointer', fontWeight: 400, opacity: actionLoading === bk._id ? 0.6 : 1 }}>Decline</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Confirmed Bookings */}
                  {allBookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status)).length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: '#4CAF50' }}>✅ Confirmed Bookings</h3>
                      <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                              {['Booking ID', 'Tourist', 'Date', 'Type', 'Amount', 'Status', 'Action'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allBookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status)).map(bk => {
                              const sc = statusColor(bk.status);
                              return (
                                <tr key={bk._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{bk.bookingId}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)' }}>{bk.tourist?.name || '—'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</td>
                                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <button
                                      onClick={() => handleBookingAction(bk._id, 'complete')}
                                      disabled={actionLoading === bk._id}
                                      style={{
                                        padding: '4px 10px',
                                        fontSize: '0.72rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, var(--burnt-orange), var(--golden-amber))',
                                        color: '#fff',
                                        cursor: actionLoading === bk._id ? 'wait' : 'pointer',
                                        fontWeight: 400,
                                        opacity: actionLoading === bk._id ? 0.6 : 1,
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Complete Tour
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Past Bookings */}
                  {allBookings.filter(b => ['completed', 'declined', 'cancelled', 'expired', 'disputed'].includes(b.status)).length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', color: 'var(--muted-lavender)' }}>📋 Past Bookings</h3>
                      <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                              {['Booking ID', 'Tourist', 'Date', 'Type', 'Amount', 'Status'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {allBookings.filter(b => ['completed', 'declined', 'cancelled', 'expired', 'disputed'].includes(b.status)).map(bk => {
                              const sc = statusColor(bk.status);
                              return (
                                <tr key={bk._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{bk.bookingId}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)' }}>{bk.tourist?.name || '—'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.tripType === 'half' ? 'Half Day' : bk.tripType === 'multi' ? `Multi-Day (${bk.days})` : 'Full Day'}</td>
                                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</td>
                                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Earnings */}
          {activeTab === 'earnings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass" style={{ padding: '12px 24px', marginBottom: '20px', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--burnt-orange)', borderRadius: '12px', textAlign: 'center' }}>
                <strong>⚠️ TEST MODE</strong> - No real payments processed. Commission: 15% platform fee
              </div>
              
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Earnings & Payouts</h2>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div className="glass-card" style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>Total Earnings</div>
                  <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>₹{((earnings?.totalEarnings || 0) - (earnings?.platformFee || 0)).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#4CAF50', fontWeight: 400, marginTop: '8px' }}>{earnings?.entries?.length || 0} completed tours</div>
                </div>
                <div className="glass-card" style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>Pending Payout</div>
                  <div style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--burnt-orange)', fontFamily: 'var(--font-numeric)' }}>₹{(earnings?.pendingPayout || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>Awaiting release</div>
                </div>
                <div className="glass-card" style={{ flex: '1 1 200px', padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>Paid Out</div>
                  <div style={{ fontSize: '2rem', fontWeight: 400, color: '#4CAF50', fontFamily: 'var(--font-numeric)' }}>₹{(earnings?.paidOut || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>Transferred to bank</div>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Earnings Breakdown</h3>
              {!earnings || !earnings.entries || earnings.entries.length === 0 ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--muted-lavender)' }}>No earnings yet. Complete bookings to see earnings here.</p>
                </div>
              ) : (
                <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {['Booking ID', 'Date', 'Gross Amount', 'Platform Fee (15%)', 'Net Payout', 'Status'].map(h => (
                          <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.entries.map((entry, i) => {
                        const grossAmount = entry.amount || 0;
                        const platformFee = Math.round(grossAmount * 0.15);
                        const netPayout = grossAmount - platformFee;
                        const payoutStatus = entry.payout_status || 'pending';
                        const statusStyles = {
                          paid: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Paid' },
                          pending: { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' },
                          processing: { bg: 'rgba(33,150,243,0.1)', color: '#2196F3', text: 'Processing' },
                        };
                        const sc = statusStyles[payoutStatus] || statusStyles.pending;
                        
                        return (
                          <tr key={entry._id || i} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{entry.booking?.bookingId || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(entry.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{grossAmount.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>-₹{platformFee.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{netPayout.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Messages</h2>
              <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                <p style={{ fontSize: '1rem', color: 'var(--deep-violet)', fontWeight: 400, marginBottom: '4px' }}>Messaging Coming Soon</p>
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
                  <span style={{ fontSize: '1.8rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>{stats.rating || '—'}</span>
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
                          <div style={{ width: '100%', height: '100%', background: 'var(--burnt-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 400, fontSize: '0.85rem' }}>{(review.author?.name || '?')[0]}</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--deep-violet)' }}>{review.author?.name || 'Tourist'}</div>
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
