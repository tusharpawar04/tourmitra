import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Modal Context ──
const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null);

  const showConfirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
    return new Promise((resolve) => {
      setModal({ title, message, confirmText, cancelText, type, onResolve: resolve, inputMode: false });
    });
  }, []);

  const showPrompt = useCallback(({ title, message, placeholder = '', confirmText = 'Submit', cancelText = 'Cancel', type = 'info' }) => {
    return new Promise((resolve) => {
      setModal({ title, message, placeholder, confirmText, cancelText, type, onResolve: resolve, inputMode: true });
    });
  }, []);

  const handleClose = useCallback((result) => {
    if (modal?.onResolve) modal.onResolve(result);
    setModal(null);
  }, [modal]);

  return (
    <ModalContext.Provider value={{ showConfirm, showPrompt }}>
      {children}
      <AnimatePresence>
        {modal && <ConfirmModalUI modal={modal} onClose={handleClose} />}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};

// ── Type Colors ──
const typeThemes = {
  warning: { accent: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', icon: '⚠️' },
  danger: { accent: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', icon: '🗑️' },
  info: { accent: '#3B82F6', bg: 'rgba(59, 130, 246, 0.08)', icon: 'ℹ️' },
  success: { accent: '#10B981', bg: 'rgba(16, 185, 129, 0.08)', icon: '✅' },
};

// ── Modal UI ──
const ConfirmModalUI = ({ modal, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const theme = typeThemes[modal.type] || typeThemes.info;

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose(modal.inputMode ? null : false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose, modal.inputMode]);

  const handleSubmit = () => {
    if (modal.inputMode) {
      onClose(inputValue.trim() || null);
    } else {
      onClose(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26, 13, 46, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '20px',
      }}
      onClick={() => onClose(modal.inputMode ? null : false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(40px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
          borderRadius: '20px',
          border: '1.5px solid rgba(245, 166, 35, 0.2)',
          boxShadow: `
            0 24px 80px rgba(26, 13, 46, 0.25),
            0 8px 24px rgba(26, 13, 46, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.6) inset
          `,
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header accent bar */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}66)`,
        }} />

        {/* Content */}
        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0,
            }}>
              {theme.icon}
            </div>
            <h3 style={{
              fontFamily: "'Copernicus', 'Georgia', serif",
              fontSize: '1.15rem',
              fontWeight: 400,
              color: '#2D1B4E',
              lineHeight: 1.3,
              margin: 0,
            }}>
              {modal.title}
            </h3>
          </div>

          {/* Message */}
          {modal.message && (
            <p style={{
              fontSize: '0.92rem',
              color: '#A08BB5',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}>
              {modal.message}
            </p>
          )}

          {/* Input field (for prompt mode) */}
          {modal.inputMode && (
            <div style={{ marginBottom: '20px' }}>
              <textarea
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modal.placeholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(245, 166, 35, 0.2)',
                  borderRadius: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.92rem',
                  color: '#2D1B4E',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  lineHeight: 1.5,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F5A623';
                  e.target.style.boxShadow = '0 0 0 4px rgba(245, 166, 35, 0.15), 0 4px 20px rgba(245, 166, 35, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(245, 166, 35, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => onClose(modal.inputMode ? null : false)}
              style={{
                padding: '10px 22px',
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(12px)',
                color: '#A08BB5',
                border: '1px solid rgba(245, 166, 35, 0.2)',
                borderRadius: '12px',
                fontWeight: 400,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = '#F5A623';
                e.target.style.color = '#2D1B4E';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'rgba(245, 166, 35, 0.2)';
                e.target.style.color = '#A08BB5';
              }}
            >
              {modal.cancelText}
            </button>
            <button
              onClick={handleSubmit}
              disabled={modal.inputMode && !inputValue.trim()}
              style={{
                padding: '10px 22px',
                background: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 400,
                fontSize: '0.88rem',
                cursor: modal.inputMode && !inputValue.trim() ? 'not-allowed' : 'pointer',
                opacity: modal.inputMode && !inputValue.trim() ? 0.5 : 1,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 16px ${theme.accent}55`,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                if (!(modal.inputMode && !inputValue.trim())) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = `0 6px 24px ${theme.accent}77`;
                }
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 16px ${theme.accent}55`;
              }}
            >
              {modal.confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModalProvider;
