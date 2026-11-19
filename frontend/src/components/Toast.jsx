import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Toast Context ──
const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4500 }) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Convenience methods
  const toast = useMemo(() => ({
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ── Toast Icons ──
const icons = {
  success: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

// ── Color Themes ──
const themes = {
  success: {
    accent: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.15)',
    progressBg: 'rgba(16, 185, 129, 0.2)',
    progressFill: '#10B981',
  },
  error: {
    accent: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    glow: 'rgba(239, 68, 68, 0.15)',
    progressBg: 'rgba(239, 68, 68, 0.2)',
    progressFill: '#EF4444',
  },
  warning: {
    accent: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    glow: 'rgba(245, 158, 11, 0.15)',
    progressBg: 'rgba(245, 158, 11, 0.2)',
    progressFill: '#F59E0B',
  },
  info: {
    accent: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
    glow: 'rgba(59, 130, 246, 0.15)',
    progressBg: 'rgba(59, 130, 246, 0.2)',
    progressFill: '#3B82F6',
  },
};

// ── Single Toast ──
const ToastItem = ({ toast: t, onRemove }) => {
  const theme = themes[t.type] || themes.info;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = t.duration;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onRemove(t.id);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [t.id, t.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px 14px',
        minWidth: '340px',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        border: `1.5px solid ${theme.border}`,
        borderRadius: '16px',
        boxShadow: `
          0 12px 40px rgba(26, 13, 46, 0.12),
          0 4px 16px ${theme.glow},
          0 0 0 1px rgba(255, 255, 255, 0.6) inset
        `,
        overflow: 'hidden',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}
      onClick={() => onRemove(t.id)}
      whileHover={{ scale: 1.02 }}
    >
      {/* Icon */}
      <div style={{
        flexShrink: 0,
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.accent,
      }}>
        {icons[t.type]}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {t.title && (
          <div style={{
            fontWeight: 400,
            fontSize: '0.92rem',
            color: '#2D1B4E',
            marginBottom: '3px',
            lineHeight: 1.3,
          }}>
            {t.title}
          </div>
        )}
        {t.message && (
          <div style={{
            fontSize: '0.84rem',
            color: '#A08BB5',
            lineHeight: 1.45,
            wordBreak: 'break-word',
          }}>
            {t.message}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(t.id); }}
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          color: '#A08BB5',
          fontSize: '1.1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          marginTop: '-2px',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(160,139,181,0.12)'; e.target.style.color = '#2D1B4E'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#A08BB5'; }}
      >
        ✕
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: theme.progressBg,
        borderRadius: '0 0 16px 16px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${theme.progressFill}, ${theme.accent}88)`,
          borderRadius: '3px',
          transition: 'width 0.05s linear',
        }} />
      </div>
    </motion.div>
  );
};

// ── Toast Container ──
const ToastContainer = ({ toasts, removeToast }) => (
  <div style={{
    position: 'fixed',
    top: '88px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none',
  }}>
    <AnimatePresence mode="popLayout">
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

export default ToastProvider;
