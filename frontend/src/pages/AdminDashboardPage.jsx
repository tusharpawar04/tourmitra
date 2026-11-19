import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { verificationsAPI, bookingsAPI, guidesAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { useModal } from '../components/ConfirmModal';

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verifications');
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allGuides, setAllGuides] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();
  const { showPrompt } = useModal();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch data
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [verificationsRes, bookingsRes, guidesRes] = await Promise.all([
          verificationsAPI.getAll(),
          bookingsAPI.getAll(),
          guidesAPI.getAll({ limit: 100 }),
        ]);
        setVerifications(verificationsRes.verifications || []);
        setAllBookings(bookingsRes.bookings || []);
        setAllGuides(guidesRes.guides || []);
      } catch (err) {
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Handle verification approval
  const handleVerificationAction = async (verificationId, action) => {
    setActionLoading(verificationId);
    try {
      if (action === 'approve') {
        await verificationsAPI.approve(verificationId);
        toast.success('Guide Verified', 'The guide has been successfully verified and can now accept bookings.');
      } else if (action === 'reject') {
        const reason = await showPrompt({
          title: 'Reject Verification',
          message: 'Please provide a reason for rejecting this guide\'s verification request.',
          placeholder: 'Enter rejection reason...',
          confirmText: 'Reject',
          type: 'danger',
        });
        if (!reason) {
          setActionLoading(null);
          return;
        }
        await verificationsAPI.reject(verificationId, reason);
        toast.warning('Verification Rejected', 'The guide has been notified of the rejection.');
      }
      // Refetch
      const verificationsRes = await verificationsAPI.getAll();
      setVerifications(verificationsRes.verifications || []);
    } catch (err) {
      console.error('Verification action error:', err);
      toast.error('Action Failed', err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s) => {
    if (s === 'pending') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' };
    if (s === 'approved') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Approved' };
    if (s === 'rejected') return { bg: 'rgba(244,67,54,0.1)', color: '#F44336', text: 'Rejected' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: s };
  };

  const bookingStatusColor = (s) => {
    if (s === 'requested') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Requested' };
    if (s === 'accepted') return { bg: 'rgba(33,150,243,0.1)', color: '#2196F3', text: 'Accepted' };
    if (s === 'confirmed') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Confirmed' };
    if (s === 'completed') return { bg: 'rgba(46,125,50,0.1)', color: '#2E7D32', text: 'Completed' };
    if (s === 'cancelled') return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: 'Cancelled' };
    if (s === 'declined') return { bg: 'rgba(244,67,54,0.1)', color: '#F44336', text: 'Declined' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: s };
  };

  if (authLoading || loading || !user) {
    return (
      <div className="page-content" style={{ paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(245,166,35,0.15)', borderTopColor: 'var(--burnt-orange)', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pendingVerifications = verifications.filter(v => v.status === 'pending');
  const verifiedGuides = allGuides.filter(g => g.verification_status === 'approved');
  const totalBookings = allBookings.length;
  const activeBookings = allBookings.filter(b => ['requested', 'accepted', 'confirmed', 'in_progress'].includes(b.status)).length;

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="section-glass" style={{ padding: '28px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '8px' }}>🛡️ Admin Dashboard</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Manage verifications, bookings, and guides</p>
        </div>
      </div>

      {/* Stats */}
      <div className="section-glass" style={{ padding: '24px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Pending Verifications', value: pendingVerifications.length, icon: '⏳', color: '#F5A623' },
            { label: 'Verified Guides', value: verifiedGuides.length, icon: '✅', color: '#4CAF50' },
            { label: 'Active Bookings', value: activeBookings, icon: '📅', color: '#2196F3' },
            { label: 'Total Bookings', value: totalBookings, icon: '📊', color: 'var(--deep-violet)' },
          ].map((stat, i) => (
            <motion.div key={stat.label} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>{stat.label}</span>
                <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 400, color: stat.color, fontFamily: 'var(--font-numeric)' }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="section-glass" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', display: 'flex', overflowX: 'auto' }}>
          {[
            { key: 'verifications', label: '🔍 Verifications' },
            { key: 'bookings', label: '📅 Bookings' },
            { key: 'guides', label: '👥 Guides' },
            { key: 'stats', label: '📊 Statistics' },
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
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Verification Requests</h2>
              {pendingVerifications.length === 0 ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No pending verifications</p>
                </div>
              ) : (
                <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {['Guide Name', 'Email', 'City', 'Submitted', 'Documents', 'Status', 'Action'].map(h => (
                          <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVerifications.map(ver => {
                        const sc = statusColor(ver.status);
                        const guide = ver.guide_id;
                        return (
                          <tr key={ver._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{guide?.name || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{guide?.email || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{guide?.city || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(ver.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{ver.documents?.length || 0} files</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => handleVerificationAction(ver._id, 'approve')} disabled={actionLoading === ver._id} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: 'none', background: '#4CAF50', color: '#fff', cursor: actionLoading === ver._id ? 'wait' : 'pointer', fontWeight: 400, opacity: actionLoading === ver._id ? 0.6 : 1 }}>Approve</button>
                                <button onClick={() => handleVerificationAction(ver._id, 'reject')} disabled={actionLoading === ver._id} style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '6px', border: '1px solid rgba(220,53,69,0.3)', background: 'transparent', color: '#dc3545', cursor: actionLoading === ver._id ? 'wait' : 'pointer', fontWeight: 400, opacity: actionLoading === ver._id ? 0.6 : 1 }}>Reject</button>
                              </div>
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

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>All Bookings</h2>
              {allBookings.length === 0 ? (
                <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '14px' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)' }}>No bookings yet</p>
                </div>
              ) : (
                <div className="glass dashboard-table-wrap" style={{ borderRadius: '14px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {['Booking ID', 'Tourist', 'Guide', 'Date', 'Amount', 'Status', 'Payment'].map(h => (
                          <th key={h} style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 400, color: 'var(--deep-violet)', textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.slice(0, 50).map(bk => {
                        const sc = bookingStatusColor(bk.status);
                        const paymentStatusColors = {
                          pending: { bg: 'rgba(245,166,35,0.1)', color: '#F5A623' },
                          confirmed: { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50' },
                          failed: { bg: 'rgba(244,67,54,0.1)', color: '#F44336' },
                        };
                        const psc = paymentStatusColors[bk.payment_status] || paymentStatusColors.pending;
                        return (
                          <tr key={bk._id} style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--deep-violet)', fontWeight: 500 }}>{bk.bookingId}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.tourist?.name || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{bk.guide?.name || '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>{new Date(bk.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)' }}>₹{(bk.pricing?.total || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 400 }}>{sc.text}</span></td>
                            <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: psc.bg, color: psc.color, fontWeight: 400 }}>{bk.payment_status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Guides Tab */}
          {activeTab === 'guides' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>All Guides</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {allGuides.map((guide, i) => (
                  <motion.div key={guide._id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: '20px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <img src={guide.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}`} alt={guide.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--deep-violet)' }}>{guide.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>📍 {guide.city}</div>
                      </div>
                      {guide.verification_status === 'approved' && <span style={{ fontSize: '1.2rem' }}>✅</span>}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>
                      ⭐ {guide.rating || '—'} • {guide.tours || 0} tours • ₹{(guide.price || 0).toLocaleString()}/day
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>
                      Status: <span style={{ fontWeight: 400, color: guide.verification_status === 'approved' ? '#4CAF50' : '#F5A623' }}>{guide.verification_status || 'unverified'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Platform Statistics</h2>
              <div className="glass" style={{ padding: '32px', borderRadius: '14px', textAlign: 'center' }}>
                <p style={{ fontSize: '1rem', color: 'var(--muted-lavender)' }}>📊 Detailed analytics coming soon...</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginTop: '12px' }}>
                  Revenue tracking, booking trends, guide performance metrics, and more.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
