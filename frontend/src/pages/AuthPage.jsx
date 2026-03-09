import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, login: authLogin } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  const redirectParam = queryParams.get('redirect');
  const initialCheckDone = useRef(false);

  // Only redirect if user was ALREADY logged in when this page loaded
  // (not when they just completed login/signup on this page)
  useEffect(() => {
    if (authLoading || initialCheckDone.current) return;
    initialCheckDone.current = true;
    if (user) {
      const dest = redirectParam || (user.role === 'guide' ? '/guide/dashboard' : '/explore');
      navigate(dest, { replace: true });
    }
  }, [authLoading, user, navigate, redirectParam]);

  const isSignup = location.pathname === '/signup';
  const isGuideFlow = roleParam === 'guide';
  // Guide flow ALWAYS defaults to signup tab so new guides register (not login as tourist)
  const [activeTab, setActiveTab] = useState((isSignup || isGuideFlow) ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    showToast('🚧 Password reset coming soon. Please use OTP or Google sign-in.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMethod === 'phone') {
      showToast('✨ Phone auth (OTP) is in demo mode — use Email instead.');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (activeTab === 'signup') {
        data = await authAPI.register({
          name,
          email,
          password,
          role: roleParam === 'guide' ? 'guide' : 'tourist'
        });
      } else {
        // If logging in via guide flow, send desired role so backend can upgrade tourist→guide
        data = await authAPI.login({ email, password, ...(isGuideFlow && { role: 'guide' }) });
      }
      authLogin(data.token, data.user);
      showToast(`✨ Successfully logged in as ${data.user.name}`);
      const dest = redirectParam || (data.user.role === 'guide' ? '/guide/dashboard' : '/explore');
      setTimeout(() => navigate(dest, { replace: true }), 1000);
    } catch (err) {
      showToast('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await authAPI.googleLogin(credentialResponse.credential, isGuideFlow ? 'guide' : undefined);
      authLogin(data.token, data.user);
      showToast(`✨ Successfully logged in as ${data.user.name}`);
      const dest = redirectParam || (data.user.role === 'guide' ? '/guide/dashboard' : '/explore');
      setTimeout(() => navigate(dest, { replace: true }), 1000);
    } catch (err) {
      showToast('❌ Google Sign-In failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast('❌ Google Sign-In was unsuccessful. Try again.');
  };

  return (
    <div className="page-content" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(var(--nav-height) + 24px) 16px 40px',
    }}>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 'calc(var(--nav-height) + 16px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            padding: '14px 28px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-deep)',
            fontSize: '0.9rem',
            color: 'var(--deep-violet)',
            fontWeight: 500,
            zIndex: 200,
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {toast}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 0.68, 0, 1] }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: 'clamp(28px, 5vw, 40px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(245,166,35,0.3)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              color: 'var(--deep-violet)',
              marginBottom: '4px',
            }}>Tourmitra</h2>
          </Link>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>
            {isGuideFlow
              ? (activeTab === 'login' ? 'Welcome back, guide' : 'Register as a Guide')
              : (activeTab === 'login' ? 'Welcome back, explorer' : 'Start your journey')
            }
          </p>
          {isGuideFlow && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              padding: '5px 14px',
              borderRadius: '100px',
              background: 'rgba(232,98,42,0.1)',
              border: '1px solid rgba(232,98,42,0.2)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--burnt-orange)',
            }}>
              🎯 Guide Account
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '28px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
        }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--burnt-orange)' : 'rgba(255,255,255,0.6)',
              color: activeTab === 'login' ? '#fff' : 'var(--muted-lavender)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'var(--font-body)',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--burnt-orange)' : 'rgba(255,255,255,0.6)',
              color: activeTab === 'signup' ? '#fff' : 'var(--muted-lavender)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'var(--font-body)',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Google Sign In */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSignIn}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            shape="pill"
            width="100%"
            text={activeTab === 'login' ? "signin_with" : "signup_with"}
          />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(245,166,35,0.2)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(245,166,35,0.2)' }} />
        </div>

        {/* Auth method toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <button
            className={`pill ${authMethod === 'email' ? 'active' : ''}`}
            onClick={() => setAuthMethod('email')}
            style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
          >
            📧 Email
          </button>
          <button
            className={`pill ${authMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setAuthMethod('phone')}
            style={{ flex: 1, justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
          >
            📱 Phone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name
              </label>
              <input
                type="text"
                className="input-glass"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          {authMethod === 'email' ? (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-glass"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required={authMethod === 'email'}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input-glass"
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required={authMethod === 'email'}
                />
              </div>
            </>
          ) : (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-glass"
                  value="+91"
                  readOnly
                  style={{ width: '60px', textAlign: 'center', color: 'var(--muted-lavender)' }}
                />
                <input
                  type="tel"
                  className="input-glass"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* OTP field (shown for phone only) */}
          {authMethod === 'phone' && (
            <div style={{ marginBottom: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OTP
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Enter OTP"
                  maxLength={6}
                  style={{ flex: 1, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 600 }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '12px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  onClick={() => showToast('📱 OTP sent! (Demo mode)')}
                >
                  Send OTP
                </button>
              </div>
            </div>
          )}

          {/* Forgot password */}
          {activeTab === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--burnt-orange)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  padding: '4px 0',
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {activeTab === 'signup' && (
            <div style={{ marginBottom: '20px', marginTop: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--muted-lavender)', lineHeight: 1.5 }}>
                <input type="checkbox" style={{ accentColor: 'var(--burnt-orange)', marginTop: '3px' }} />
                I agree to the <a href="#" style={{ color: 'var(--burnt-orange)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--burnt-orange)' }}>Privacy Policy</a>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1rem', marginTop: activeTab === 'login' ? '6px' : '0' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (activeTab === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>

        {/* Switch */}
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-lavender)', marginTop: '20px' }}>
          {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--burnt-orange)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}
          >
            {activeTab === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>

        {/* Guide CTA — only show when NOT in guide flow */}
        {!isGuideFlow && (
          <div style={{
            marginTop: '20px',
            padding: '14px',
            background: 'rgba(192,68,106,0.06)',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid rgba(192,68,106,0.12)',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>
              Are you a local guide? <Link to="/signup?role=guide&redirect=/guide/onboard" style={{ color: 'var(--magenta)', fontWeight: 600 }}>Register as Guide →</Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
