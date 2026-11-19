import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}
      >
        <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🗺️</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>404 - Page Not Found</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)', marginBottom: '32px', lineHeight: 1.6 }}>
          Looks like you've wandered off the beaten path. Let's get you back to exploring!
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/">
            <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Go Home
            </button>
          </Link>
          <Link to="/explore">
            <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Explore Destinations
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
