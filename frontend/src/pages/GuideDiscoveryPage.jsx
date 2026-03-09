import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guidesAPI } from '../services/api';
import { categories } from '../data/mockData';

const StarRating = ({ rating }) => (
  <span className="star" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}
  </span>
);

const GuideDiscoveryPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState(3000);

  useEffect(() => {
    guidesAPI.getAll().then(data => {
      setGuides(data.guides);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = guides.filter(g => {
    const matchSearch = !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase()) ||
      g.languages.some(l => l.toLowerCase().includes(search.toLowerCase()));
    const matchSpec = !activeSpecialty || g.specialties.includes(activeSpecialty);
    const matchPrice = g.price <= priceRange;
    return matchSearch && matchSpec && matchPrice;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'most-booked') return b.tours - a.tours;
    return b.reviews - a.reviews;
  });

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header with search */}
      <div className="section-glass" style={{ padding: '28px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '16px' }}
          >
            Find Your Perfect Guide
          </motion.h1>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <input
                type="text"
                className="input-glass"
                placeholder="Search by name, city, or language..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', opacity: 0.5 }}>🔍</span>
            </div>
          </div>

          {/* Specialty pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            <button
              className={`pill ${!activeSpecialty ? 'active' : ''}`}
              onClick={() => setActiveSpecialty(null)}
            >All Guides</button>
            {categories.slice(0, 7).map(cat => (
              <button
                key={cat.label}
                className={`pill ${activeSpecialty === cat.label ? 'active' : ''}`}
                onClick={() => setActiveSpecialty(cat.label === activeSpecialty ? null : cat.label)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 48px)', display: 'flex', gap: '28px' }}>
        {/* Sidebar filters (desktop) */}
        <aside className="glass" id="guide-sidebar" style={{
          width: '250px',
          minWidth: '250px',
          padding: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: 'calc(var(--nav-height) + 24px)',
          display: 'none',
        }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', marginBottom: '20px' }}>Filters</h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Max Price (₹/day)</label>
            <input
              type="range" min="500" max="3000" step="100"
              value={priceRange}
              onChange={e => setPriceRange(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--burnt-orange)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>
              <span>₹500</span><span>₹{priceRange.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Languages</label>
            {['English', 'Hindi', 'French', 'Japanese', 'Spanish'].map(lang => (
              <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--muted-lavender)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--burnt-orange)' }} /> {lang}
              </label>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Minimum Rating</label>
            {[4.5, 4.0, 3.5].map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--muted-lavender)', cursor: 'pointer' }}>
                <input type="radio" name="guide-rating" style={{ accentColor: 'var(--burnt-orange)' }} />
                <StarRating rating={r} /> {r}+
              </label>
            ))}
          </div>
        </aside>

        {/* Results */}
        <div style={{ flex: 1 }}>
          {/* Sort bar */}
          <div className="glass" style={{ padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>{sorted.length} guides found</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', color: 'var(--deep-violet)', fontFamily: 'var(--font-body)', outline: 'none' }}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="most-booked">Most Booked</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>

          {/* Guide cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sorted.map((guide, i) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={`/guides/${guide._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Photo */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={guide.photo} alt={guide.name} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--golden-amber)' }} />
                      {guide.verified && (
                        <span style={{ position: 'absolute', bottom: '2px', right: '-2px', background: '#4CAF50', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '100px', fontWeight: 700 }}>✓</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--deep-violet)', margin: 0 }}>{guide.name}</h3>
                        {guide.verified && <span style={{ fontSize: '0.68rem', background: 'rgba(76,175,80,0.1)', color: '#4CAF50', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Verified Guide</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '6px' }}>📍 {guide.city}, India</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--deep-violet)', marginBottom: '10px', fontStyle: 'italic', opacity: 0.85 }}>"{guide.tagline}"</p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarRating rating={guide.rating} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--deep-violet)' }}>{guide.rating}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>({guide.reviews} reviews)</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>• {guide.tours} tours completed</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {guide.specialties.map(s => <span key={s} className="tag-badge">{s}</span>)}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>🗣️ {guide.languages.join(' • ')}</p>
                    </div>

                    {/* Price + CTA */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '130px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--deep-violet)', fontSize: '1.2rem', marginBottom: '4px', fontFamily: 'var(--font-numeric)' }}>
                        ₹{guide.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '16px' }}>per day</div>
                      <button className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>View Profile</button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          #guide-sidebar { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default GuideDiscoveryPage;
