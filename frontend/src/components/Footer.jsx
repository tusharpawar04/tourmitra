import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-main">
          {/* Logo icon */}
          <div className="footer-logo-col">
            <div className="footer-logo-icon">✈</div>
          </div>

          {/* Column 1 — Platform */}
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link to="/explore">Explore Destinations</Link></li>
              <li><Link to="/guides">Find Guides</Link></li>
              <li><Link to="/plan">AI Trip Planner</Link></li>
              <li><Link to="/explore">Curated Experiences</Link></li>
            </ul>
          </div>

          {/* Column 2 — Company */}
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><Link to="/for-guides">Become a Guide</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Safety Center</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Travel Guides</a></li>
              <li><a href="#">Trust & Safety</a></li>
              <li><a href="#">API Partners</a></li>
            </ul>
          </div>

          {/* Column 4 — Social icons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '16px' }}>
            <h4>Connect</h4>
            <div className="footer-social">
              {/* Instagram */}
              <a href="#" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="5"/>
                  <circle cx="17.5" cy="6.5" r="1.5"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="#" aria-label="X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Language + Watermark */}
      <div style={{ padding: '16px clamp(24px, 5vw, 64px) 0', maxWidth: '1320px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button className="footer-language">
          🌐 English ▾
        </button>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace, var(--font-body)' }}>
          Tourmitra Inc © 2026
        </span>
      </div>

      <div className="footer-watermark">
        <div className="footer-watermark-text">Tourmitra</div>
      </div>
    </footer>
  );
};

export default Footer;
