import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHome = location.pathname === '/';
  const isGuide = user?.role === 'guide';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  // Determine text/icon color class
  const isDark = scrolled || !isHome;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${!isHome && !scrolled ? 'not-home' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <Link to="/" className="logo">Tourmitra</Link>

      <ul className="nav-links">
        {isGuide ? (
          <>
            <li><Link to="/guide/dashboard">Dashboard</Link></li>
            <li><Link to="/guide/onboard">My Profile</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/plan" className="nav-ai-link">✦ AI Planner</Link></li>
            {(!user || user.role !== 'tourist') && (
              <li><Link to="/for-guides">For Guides</Link></li>
            )}
          </>
        )}
      </ul>

      {/* Auth area */}
      {!loading && (
        <div className="nav-auth">
          {user ? (
            /* ── Logged-in: Profile Button ── */
            <div className="nav-profile-wrap" ref={profileRef}>
              <button
                className={`nav-profile-btn ${isDark ? 'dark' : ''}`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile menu"
              >
                <div className="nav-avatar-fallback">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                {/* Chevron */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.3s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="nav-profile-dropdown glass">
                  {/* User info header */}
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-avatar-fallback">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <div className="nav-dropdown-name">{user.name}</div>
                      <div className="nav-dropdown-role">
                        {isGuide && <span className="nav-role-badge">Guide</span>}
                        {!isGuide && <span className="nav-role-badge tourist">Tourist</span>}
                        {isGuide && user.city && <span className="nav-dropdown-city">📍 {user.city}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  {/* Menu items */}
                  {isGuide ? (
                    <>
                      <Link to="/guide/dashboard" className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        Dashboard
                      </Link>
                      <Link to="/guide/onboard" className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Profile
                      </Link>
                      <Link to={`/guides/${user._id}`} className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Public Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        My Trips
                      </Link>
                      <Link to="/plan" className="nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        AI Trip Planner
                      </Link>
                    </>
                  )}

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item logout" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not logged in: Login / Signup ── */
            <>
              <Link to="/login">
                <button className="btn-login">Log In</button>
              </Link>
              <Link to="/signup">
                <button className="btn-signup">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      )}

      <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile menu — logged in additions */}
      {mobileOpen && user && (
        <div className="nav-mobile-profile">
          <div className="nav-mobile-profile-header">
            <div className="nav-mobile-avatar-fallback">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--deep-violet)', fontSize: '0.95rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{user.email}</div>
            </div>
          </div>
          <div className="nav-dropdown-divider" />
          {isGuide ? (
            <>
              <Link to="/guide/dashboard" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
              <Link to="/guide/onboard" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>✏️ Edit Profile</Link>
              <Link to={`/guides/${user._id}`} className="nav-mobile-link" onClick={() => setMobileOpen(false)}>👤 Public Profile</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>🗺️ My Trips</Link>
              <Link to="/plan" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>✦ AI Trip Planner</Link>
            </>
          )}
          <button className="nav-mobile-link logout" onClick={handleLogout}>🚪 Log Out</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
