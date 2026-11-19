import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { bookingsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const TouristDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingsAPI.getMyBookings();
        setAllBookings(data.bookings || []);
      } catch (err) {
        console.error('Bookings fetch error:', err);
        setAllBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Handle cancel request
  const handleCancelRequest = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingsAPI.cancel(bookingId, 'Cancelled by tourist');
      toast.success('Request Cancelled', 'Your pending request has been cancelled.');
      // Refetch
      const data = await bookingsAPI.getMyBookings();
      setAllBookings(data.bookings || []);
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Cancellation Failed', err.response?.data?.error || err.message || 'Could not cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel booking with modal
  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      toast.warning('Missing Reason', 'Please provide a cancellation reason before proceeding.');
      return;
    }
    setActionLoading(true);
    try {
      await bookingsAPI.cancel(selectedBooking._id, cancelReason);
      toast.success('Booking Cancelled', 'Your booking has been cancelled successfully.');
      setCancelModalOpen(false);
      setCancelReason('');
      setSelectedBooking(null);
      // Refetch
      const data = await bookingsAPI.getMyBookings();
      setAllBookings(data.bookings || []);
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Cancellation Failed', err.response?.data?.error || err.message || 'Could not cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Mock user data (in alpha, user comes from auth context)
  const userData = {
    name: user?.name || 'Tourist User',
    email: user?.email || 'tourist@example.com',
    memberSince: user?.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'March 2025',
    tripsCompleted: allBookings.filter(b => b.status === 'completed').length,
    savedGuides: user?.savedGuides?.length || 0,
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'T';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  // Filter bookings by status
  const upcomingBookings = allBookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status));
  const pendingBookings = allBookings.filter(b => b.status === 'requested' || b.status === 'pending');
  const pastBookings = allBookings.filter(b => b.status === 'completed');
  const cancelledBookings = allBookings.filter(b => ['cancelled', 'declined', 'expired'].includes(b.status));

  const savedItineraries = [
    { id: 1, title: 'Jaipur Heritage & Food Tour', dest: 'Jaipur', days: 3, created: 'Feb 28, 2026' },
    { id: 2, title: 'Spiritual Varanasi Experience', dest: 'Varanasi', days: 2, created: 'Mar 2, 2026' },
  ];

  const statusColor = (s) => {
    if (s === 'requested' || s === 'pending') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' };
    if (s === 'accepted') return { bg: 'rgba(33,150,243,0.1)', color: '#2196F3', text: 'Accepted' };
    if (s === 'confirmed') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Confirmed' };
    if (s === 'in_progress') return { bg: 'rgba(0,188,212,0.1)', color: '#00BCD4', text: 'In Progress' };
    if (s === 'completed') return { bg: 'rgba(46,125,50,0.1)', color: '#2E7D32', text: 'Completed' };
    if (s === 'cancelled') return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: 'Cancelled' };
    if (s === 'declined') return { bg: 'rgba(244,67,54,0.1)', color: '#F44336', text: 'Declined' };
    if (s === 'expired') return { bg: 'rgba(158,158,158,0.1)', color: '#9E9E9E', text: 'Expired' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: s };
  };

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(245,166,35,0.15)', borderTopColor: 'var(--burnt-orange)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="section-glass" style={{ padding: '32px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Profile Picture or Initials */}
          {user?.photo && user.photo.trim() && !user.photo.includes('ui-avatars.com') ? (
            <img
              src={user.photo}
              alt={userData.name}
              style={{
                width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                border: '2px solid var(--glass-border)'
              }}
              onError={(e) => {
                // Hide image on error and show initials fallback
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: 'var(--burnt-orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              fontWeight: 400, fontSize: '1.3rem', fontFamily: 'var(--font-heading)', flexShrink: 0,
            }}>{getInitials(userData.name)}</div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '4px' }}>Welcome back, {userData.name.split(' ')[0]}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Member since {userData.memberSince} • {userData.tripsCompleted} trips completed</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Upcoming Trips', value: upcomingBookings.length },
              { label: 'Pending', value: pendingBookings.length },
              { label: 'AI Itineraries', value: savedItineraries.length },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="section-glass" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', display: 'flex', overflowX: 'auto' }}>
          {[
            { key: 'upcoming', label: '📅 Upcoming' },
            { key: 'pending', label: '⏳ Pending' },
            { key: 'past', label: '📋 Past' },
            { key: 'cancelled', label: '❌ Cancelled' },
            { key: 'itineraries', label: '🤖 My Itineraries' },
            { key: 'settings', label: '⚙️ Settings' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '16px 20px',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--burnt-orange)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
                fontWeight: activeTab === tab.key ? 500 : 400,
                fontSize: '0.88rem', fontFamily: 'var(--font-body)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s',
              }}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)', minHeight: '60vh' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Upcoming Trips */}
          {activeTab === 'upcoming' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Upcoming Trips</h2>
              {upcomingBookings.length === 0 ? (
                <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)', marginBottom: '16px' }}>No upcoming trips yet</p>
                  <Link to="/explore"><button className="btn-primary">Explore Destinations</button></Link>
                </div>
              ) : (
                upcomingBookings.map((booking, i) => {
                  const sc = statusColor(booking.status);
                  const guideName = booking.guide?.name || 'Guide';
                  const guidePhoto = booking.guide?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideName)}`;
                  const packageTitle = booking.package?.title || 'Custom Tour';
                  
                  return (
                    <motion.div key={booking._id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}
                    >
                      <img src={guidePhoto} alt={guideName} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', margin: 0 }}>{packageTitle}</h3>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>Guide: <strong style={{ color: 'var(--deep-violet)' }}>{guideName}</strong> • {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>Ref: {booking.bookingId}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', marginBottom: '8px' }}>₹{(booking.pricing?.total || 0).toLocaleString()}</div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {(booking.status === 'accepted' || booking.status === 'confirmed') && (
                            <button onClick={() => openCancelModal(booking)} disabled={actionLoading} style={{ padding: '6px 14px', fontSize: '0.78rem', border: '1px solid rgba(220,53,69,0.3)', background: 'rgba(220,53,69,0.05)', color: '#dc3545', borderRadius: '8px', cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', opacity: actionLoading ? 0.6 : 1 }}>Cancel</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Pending Requests */}
          {activeTab === 'pending' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Pending Requests</h2>
              {pendingBookings.length === 0 ? (
                <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No pending requests</p>
                </div>
              ) : (
                pendingBookings.map((booking, i) => {
                  const sc = statusColor(booking.status);
                  const guideName = booking.guide?.name || 'Guide';
                  const guidePhoto = booking.guide?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideName)}`;
                  const packageTitle = booking.package?.title || 'Custom Tour';
                  
                  return (
                    <motion.div key={booking._id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}
                    >
                      <img src={guidePhoto} alt={guideName} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', margin: 0 }}>{packageTitle}</h3>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>Guide: <strong style={{ color: 'var(--deep-violet)' }}>{guideName}</strong> • {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>Ref: {booking.bookingId}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', marginBottom: '8px' }}>₹{(booking.pricing?.total || 0).toLocaleString()}</div>
                        <button onClick={() => handleCancelRequest(booking._id)} disabled={actionLoading} style={{ padding: '6px 14px', fontSize: '0.78rem', border: '1px solid rgba(220,53,69,0.3)', background: 'rgba(220,53,69,0.05)', color: '#dc3545', borderRadius: '8px', cursor: actionLoading ? 'wait' : 'pointer', fontFamily: 'var(--font-body)', opacity: actionLoading ? 0.6 : 1 }}>Cancel Request</button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Past Trips */}
          {activeTab === 'past' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Past Trips</h2>
              {pastBookings.length === 0 ? (
                <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No past trips yet</p>
                </div>
              ) : (
                pastBookings.map((booking, i) => {
                  const guideName = booking.guide?.name || 'Guide';
                  const guidePhoto = booking.guide?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideName)}`;
                  const packageTitle = booking.package?.title || 'Custom Tour';
                  
                  return (
                    <motion.div key={booking._id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}
                    >
                      <img src={guidePhoto} alt={guideName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 250px' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: '0 0 4px' }}>{packageTitle}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Guide: {guideName} • {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '8px' }}>₹{(booking.pricing?.total || 0).toLocaleString()}</div>
                        <button onClick={() => toast.info('Coming Soon', 'The review feature will be available in the next update!')} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem' }}>Leave Review</button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Cancelled Trips */}
          {activeTab === 'cancelled' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Cancelled Bookings</h2>
              {cancelledBookings.length === 0 ? (
                <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No cancelled bookings</p>
                </div>
              ) : (
                cancelledBookings.map((booking, i) => {
                  const sc = statusColor(booking.status);
                  const guideName = booking.guide?.name || 'Guide';
                  const guidePhoto = booking.guide?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guideName)}`;
                  const packageTitle = booking.package?.title || 'Custom Tour';
                  
                  return (
                    <motion.div key={booking._id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', opacity: 0.7 }}
                    >
                      <img src={guidePhoto} alt={guideName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--muted-lavender)', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: 0 }}>{packageTitle}</h3>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Guide: {guideName} • {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted-lavender)' }}>₹{(booking.pricing?.total || 0).toLocaleString()}</div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* My AI Itineraries */}
          {activeTab === 'itineraries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>My AI Itineraries</h2>
                <Link to="/plan"><button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>✨ Create New Trip</button></Link>
              </div>
              {savedItineraries.map((itin, i) => (
                <motion.div key={itin.id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
                >
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: '0 0 4px' }}>{itin.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>📍 {itin.dest} • {itin.days} days • Created {itin.created}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>View</button>
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>🔗 Share</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>Account Settings</h2>
              <div className="glass" style={{ padding: '28px', borderRadius: '16px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input type="text" className="input-glass" defaultValue={userData.name} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Email</label>
                    <input type="email" className="input-glass" defaultValue={userData.email} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Phone</label>
                    <input type="tel" className="input-glass" defaultValue="+91 98765 43210" />
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: '20px', padding: '10px 24px', fontSize: '0.88rem' }}>Save Changes</button>
              </div>
              <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Preferences</h3>
                {[
                  { label: 'Email Notifications', desc: 'Booking confirmations, travel tips, promotions' },
                  { label: 'SMS Notifications', desc: 'OTP, booking reminders, guide messages' },
                  { label: 'Push Notifications', desc: 'Real-time trip updates and alerts' },
                ].map((pref, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--deep-violet)' }}>{pref.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{pref.desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                      <span style={{ position: 'absolute', inset: 0, background: 'var(--burnt-orange)', borderRadius: '12px', transition: '0.3s' }}></span>
                      <span style={{ position: 'absolute', left: '22px', top: '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.3s' }}></span>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,13,46,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => !actionLoading && setCancelModalOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '100%', padding: '32px', borderRadius: '16px', border: '1.5px solid rgba(245,166,35,0.3)' }}
          >
            <h2 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Cancel Booking</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', marginBottom: '20px', lineHeight: 1.6 }}>
              ⚠️ <strong>Cancellation Policy:</strong> Cancellations made 48+ hours before trip: full refund. 24-48 hours: 50% refund. Less than 24 hours: no refund. Refunds processed in 5-7 business days.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Reason for cancellation *</label>
              <textarea 
                className="input-glass"
                rows={3}
                placeholder="Please tell us why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                disabled={actionLoading}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => !actionLoading && setCancelModalOpen(false)} disabled={actionLoading} className="btn-secondary" style={{ padding: '10px 20px', opacity: actionLoading ? 0.6 : 1, cursor: actionLoading ? 'wait' : 'pointer' }}>Keep Booking</button>
              <button onClick={confirmCancel} disabled={actionLoading || !cancelReason.trim()} style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '10px', border: 'none', background: '#dc3545', color: '#fff', cursor: (actionLoading || !cancelReason.trim()) ? 'not-allowed' : 'pointer', fontWeight: 400, fontFamily: 'var(--font-body)', opacity: (actionLoading || !cancelReason.trim()) ? 0.6 : 1 }}>
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TouristDashboardPage;
