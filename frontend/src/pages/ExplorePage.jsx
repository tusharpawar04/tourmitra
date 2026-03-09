import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationsAPI } from '../services/api';
import { categories } from '../data/mockData';

const StarRating = ({ rating }) => (
  <span className="star" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
    {'★'.repeat(Math.floor(rating))}
  </span>
);

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [showMap, setShowMap] = useState(false);
  const [searchText, setSearchText] = useState(initialQuery);
  const [appliedSearch, setAppliedSearch] = useState(initialQuery);
  const searchInputRef = useRef(null);

  // Fetch destinations from API with search param
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (appliedSearch.trim()) params.search = appliedSearch.trim();
    if (activeCategory) params.tag = activeCategory;

    destinationsAPI.getAll(params).then(data => {
      setDestinations(data.destinations);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [appliedSearch, activeCategory]);

  // Sync URL → state when URL changes externally (e.g. navigating from HomePage)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== appliedSearch) {
      setSearchText(q);
      setAppliedSearch(q);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = searchText.trim();
    setAppliedSearch(q);
    // Update URL without full reload
    if (q) {
      setSearchParams(prev => { prev.set('q', q); return prev; });
    } else {
      setSearchParams(prev => { prev.delete('q'); return prev; });
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setAppliedSearch('');
    setSearchParams(prev => { prev.delete('q'); return prev; });
    searchInputRef.current?.focus();
  };

  const filtered = destinations.filter(d => {
    const matchPrice = d.price >= priceRange[0] && d.price <= priceRange[1];
    return matchPrice;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Top bar */}
      <div className="section-glass" style={{ padding: '20px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '16px' }}
          >
            Explore Destinations
          </motion.h1>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px', maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search by name, state, or keyword…"
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 14px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.85)',
                  fontSize: '0.9rem',
                  color: 'var(--deep-violet)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--burnt-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
              />
              {searchText && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                    color: 'var(--muted-lavender)', lineHeight: 1,
                  }}
                  aria-label="Clear search"
                >✕</button>
              )}
            </div>
            <button
              type="submit"
              className="pill active"
              style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              🔍 Search
            </button>
          </form>

          {appliedSearch && (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '12px' }}>
              Showing results for "<strong style={{ color: 'var(--deep-violet)' }}>{appliedSearch}</strong>"
              <button
                onClick={clearSearch}
                style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--burnt-orange)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >Clear</button>
            </p>
          )}

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
            <button
              className={`pill ${!activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.label}
                className={`pill ${activeCategory === cat.label ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.label === activeCategory ? null : cat.label)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 48px)', display: 'flex', gap: '28px' }}>

        {/* Sidebar filters */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass"
          style={{
            width: '260px',
            minWidth: '260px',
            padding: '24px',
            height: 'fit-content',
            position: 'sticky',
            top: 'calc(var(--nav-height) + 24px)',
            display: 'none',
          }}
          // Show sidebar on large screens via inline media query workaround
          id="sidebar-filters"
        >
          <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', marginBottom: '20px' }}>Filters</h3>

          {/* Price filter */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
              Price Range (₹/day)
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, parseInt(e.target.value)])}
              style={{ width: '100%', accentColor: 'var(--burnt-orange)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>
              <span>₹0</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Duration filter */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
              Duration
            </label>
            {['1-2 days', '3-5 days', '5+ days'].map(d => (
              <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--muted-lavender)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--burnt-orange)' }} />
                {d}
              </label>
            ))}
          </div>

          {/* Rating filter */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
              Minimum Rating
            </label>
            {[4.5, 4.0, 3.5].map(r => (
              <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--muted-lavender)', cursor: 'pointer' }}>
                <input type="radio" name="rating" style={{ accentColor: 'var(--burnt-orange)' }} />
                <StarRating rating={r} /> {r}+
              </label>
            ))}
          </div>
        </motion.aside>

        {/* Results area */}
        <div style={{ flex: 1 }}>
          {/* Sort bar */}
          <div className="glass" style={{
            padding: '12px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)' }}>
              {sorted.length} destinations found
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem',
                  color: 'var(--deep-violet)',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
              <button
                className={`pill ${showMap ? 'active' : ''}`}
                onClick={() => setShowMap(!showMap)}
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
              >
                🗺️ Map
              </button>
            </div>
          </div>

          {/* Map placeholder */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '300px' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass"
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted-lavender)',
                fontSize: '0.95rem',
                overflow: 'hidden',
              }}
            >
              🗺️ Interactive map coming soon — Mapbox integration planned
            </motion.div>
          )}

          {/* Card grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted-lavender)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
              <p>Loading destinations…</p>
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted-lavender)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--deep-violet)' }}>No destinations found</p>
              <p style={{ fontSize: '0.88rem' }}>Try a different search term or clear your filters.</p>
              {appliedSearch && (
                <button onClick={clearSearch} className="pill active" style={{ marginTop: '16px', padding: '10px 20px' }}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {sorted.map((dest, i) => (
              <motion.div
                key={dest._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={`/destination/${dest._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={dest.image}
                        alt={dest.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                      <span className="tag-badge" style={{ position: 'absolute', top: '10px', left: '10px' }}>{dest.tag}</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)' }}>{dest.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <StarRating rating={dest.rating} />
                          <span style={{ fontSize: '0.82rem', color: 'var(--deep-violet)', fontWeight: 600 }}>{dest.rating}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '10px' }}>{dest.state}, India • {dest.duration}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{dest.guideCount} guides</span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--deep-violet)' }}>
                          ₹{dest.price.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>/day</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* CSS to show sidebar on desktop */}
      <style>{`
        @media (min-width: 900px) {
          #sidebar-filters { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
