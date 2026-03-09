import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guides, destinations } from '../data/mockData';

const TouristDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock user and booking data
  const user = {
    name: 'Tushar Pawar',
    email: 'tushar@example.com',
    avatar: 'TP',
    memberSince: 'March 2025',
    tripsCompleted: 3,
    savedGuides: 4,
  };

  const upcomingTrips = [
    {
      id: 'BK-2026-0312',
      destination: 'Jaipur',
      guide: guides[0],
      dates: 'Mar 15 – Mar 17, 2026',
      status: 'confirmed',
      travelers: 2,
      totalPrice: 4500,
      meetingPoint: 'Amber Fort Main Gate, 8:00 AM',
      daysUntil: 7,
    },
    {
      id: 'BK-2026-0401',
      destination: 'Varanasi',
      guide: guides[2],
      dates: 'Apr 1 – Apr 3, 2026',
      status: 'pending',
      travelers: 1,
      totalPrice: 3600,
      meetingPoint: 'Dashashwamedh Ghat, 5:30 AM',
      daysUntil: 24,
    },
  ];

  const pastTrips = [
    {
      id: 'BK-2025-1215',
      destination: 'Kerala',
      guide: guides[1],
      dates: 'Dec 15 – Dec 18, 2025',
      status: 'completed',
      travelers: 2,
      totalPrice: 10800,
      reviewed: true,
      rating: 5,
    },
    {
      id: 'BK-2025-1105',
      destination: 'Goa',
      guide: guides[4],
      dates: 'Nov 5 – Nov 8, 2025',
      status: 'completed',
      travelers: 4,
      totalPrice: 19200,
      reviewed: false,
      rating: null,
    },
  ];

  const savedGuides = [guides[0], guides[2], guides[5], guides[1]];
  const savedItineraries = [
    { id: 1, title: 'Jaipur Heritage & Food Tour', dest: 'Jaipur', days: 3, created: 'Feb 28, 2026' },
    { id: 2, title: 'Spiritual Varanasi Experience', dest: 'Varanasi', days: 2, created: 'Mar 2, 2026' },
  ];

  const statusColor = (s) => {
    if (s === 'confirmed') return { bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', text: 'Confirmed' };
    if (s === 'pending') return { bg: 'rgba(245,166,35,0.1)', color: '#F5A623', text: 'Pending' };
    return { bg: 'rgba(160,139,181,0.1)', color: 'var(--muted-lavender)', text: 'Completed' };
  };

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="section-glass" style={{ padding: '32px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--burnt-orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            fontWeight: 700, fontSize: '1.3rem', fontFamily: 'var(--font-heading)', flexShrink: 0,
          }}>{user.avatar}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '4px' }}>Welcome back, {user.name.split(' ')[0]}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Member since {user.memberSince} • {user.tripsCompleted} trips completed</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Upcoming Trips', value: upcomingTrips.length, icon: '📅' },
              { label: 'Saved Guides', value: user.savedGuides, icon: '❤️' },
              { label: 'AI Itineraries', value: savedItineraries.length, icon: '🤖' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>{stat.icon} {stat.value}</div>
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
            { key: 'upcoming', label: '📅 Upcoming Trips' },
            { key: 'past', label: '📋 Past Trips' },
            { key: 'saved', label: '❤️ Saved Guides' },
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
                fontWeight: activeTab === tab.key ? 600 : 400,
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
              {upcomingTrips.length === 0 ? (
                <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)', marginBottom: '16px' }}>No upcoming trips yet</p>
                  <Link to="/explore"><button className="btn-primary">Explore Destinations</button></Link>
                </div>
              ) : (
                upcomingTrips.map((trip, i) => {
                  const sc = statusColor(trip.status);
                  return (
                    <motion.div key={trip.id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}
                    >
                      <img src={trip.guide.photo} alt={trip.guide.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', margin: 0 }}>{trip.destination} Adventure</h3>
                          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '100px', background: sc.bg, color: sc.color, fontWeight: 600 }}>{sc.text}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>Guide: <strong style={{ color: 'var(--deep-violet)' }}>{trip.guide.name}</strong> • {trip.dates}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>📍 {trip.meetingPoint}</p>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '140px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--burnt-orange)', fontWeight: 600, marginBottom: '4px' }}>
                          {trip.daysUntil} days away
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', marginBottom: '8px' }}>₹{trip.totalPrice.toLocaleString()}</div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Modify</button>
                          <button style={{ padding: '6px 14px', fontSize: '0.78rem', border: '1px solid rgba(220,53,69,0.3)', background: 'rgba(220,53,69,0.05)', color: '#dc3545', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                        </div>
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
              {pastTrips.map((trip, i) => (
                <motion.div key={trip.id} className="glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <img src={trip.guide.photo} alt={trip.guide.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', flexShrink: 0 }} />
                  <div style={{ flex: '1 1 250px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: '0 0 4px' }}>{trip.destination} Trip</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Guide: {trip.guide.name} • {trip.dates}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '140px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--deep-violet)', marginBottom: '8px' }}>₹{trip.totalPrice.toLocaleString()}</div>
                    {trip.reviewed ? (
                      <span style={{ fontSize: '0.78rem', color: '#4CAF50', fontWeight: 600 }}>⭐ {trip.rating} — Reviewed</span>
                    ) : (
                      <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.78rem' }}>Leave Review</button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Saved Guides */}
          {activeTab === 'saved' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Saved Guides</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {savedGuides.map((guide, i) => (
                  <motion.div key={guide.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Link to={`/guides/${guide.id}`} style={{ textDecoration: 'none' }}>
                      <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <img src={guide.photo} alt={guide.name} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)', margin: '0 auto 12px' }} />
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--deep-violet)', marginBottom: '4px' }}>{guide.name}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '8px' }}>📍 {guide.city}</p>
                        <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span className="star" style={{ fontSize: '0.8rem' }}>{'★'.repeat(Math.floor(guide.rating))}</span>
                          <span style={{ fontWeight: 700, color: 'var(--deep-violet)', marginLeft: '4px' }}>{guide.rating}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--deep-violet)' }}>₹{guide.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>/day</span></span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
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
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                    <input type="text" className="input-glass" defaultValue={user.name} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Email</label>
                    <input type="email" className="input-glass" defaultValue={user.email} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Phone</label>
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
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{pref.label}</div>
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
    </div>
  );
};

export default TouristDashboardPage;
