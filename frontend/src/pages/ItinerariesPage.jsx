import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itinerariesAPI } from '../services/api';

const ItinerariesPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minDays: '',
    maxDays: '',
    search: '',
  });
  const [sort, setSort] = useState('-purchaseCount');

  useEffect(() => {
    fetchItineraries();
  }, [filters, sort]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const params = { ...filters, sort };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const data = await itinerariesAPI.getAll(params);
      setItineraries(data.itineraries || []);
    } catch (err) {
      console.error('Fetch itineraries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: 'All', value: '' },
    { label: 'Heritage', value: 'Heritage' },
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Spiritual', value: 'Spiritual' },
    { label: 'Nature', value: 'Nature' },
    { label: 'Food Tours', value: 'Food Tours' },
    { label: 'Photography', value: 'Photography' },
    { label: 'Family', value: 'Family' },
    { label: 'Romantic', value: 'Romantic' },
  ];

  const difficultyColor = (diff) => {
    if (diff === 'easy') return '#4CAF50';
    if (diff === 'moderate') return '#F5A623';
    return '#F44336';
  };

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="section-glass" style={{ padding: '28px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>🗺️ Itineraries Marketplace</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>
              Detailed day-by-day plans created by real travelers and guides. Purchase and follow their footsteps!
            </p>

            {/* Search & Create */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search itineraries..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-glass"
                style={{ flex: '1 1 250px', padding: '10px 14px', fontSize: '0.9rem' }}
              />
              <Link to="/itineraries/create">
                <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                  ✨ Create Itinerary
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filter Pills */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`pill ${filters.category === cat.value ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, category: cat.value })}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-glass"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="-purchaseCount">Most Popular</option>
                <option value="-rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-createdAt">Newest</option>
              </select>

              <input
                type="number"
                placeholder="Min days"
                value={filters.minDays}
                onChange={(e) => setFilters({ ...filters, minDays: e.target.value })}
                className="input-glass"
                style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--muted-lavender)' }}>to</span>
              <input
                type="number"
                placeholder="Max days"
                value={filters.maxDays}
                onChange={(e) => setFilters({ ...filters, maxDays: e.target.value })}
                className="input-glass"
                style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
              />

              <input
                type="number"
                placeholder="Min ₹"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="input-glass"
                style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--muted-lavender)' }}>to</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="input-glass"
                style={{ width: '100px', padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(245,166,35,0.15)', borderTopColor: 'var(--burnt-orange)', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '14px' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted-lavender)', marginBottom: '16px' }}>No itineraries found</p>
              <Link to="/itineraries/create">
                <button className="btn-primary">Create the first one!</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {itineraries.map((itin, i) => (
                <motion.div
                  key={itin._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/itineraries/${itin._id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Cover Image */}
                      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'linear-gradient(135deg, #C0446A, #E8622A)' }}>
                        {itin.coverImage ? (
                          <img
                            src={itin.coverImage}
                            alt={itin.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
                            🗺️
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span className="tag-badge" style={{ fontSize: '0.75rem' }}>{itin.category}</span>
                          {itin.isVerified && (
                            <span style={{ padding: '4px 10px', borderRadius: '100px', background: '#4CAF50', color: '#fff', fontSize: '0.7rem', fontWeight: 400 }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', marginBottom: '8px', lineHeight: 1.3 }}>
                          {itin.title}
                        </h3>

                        {/* Creator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <img
                            src={itin.creator?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(itin.creator?.name || 'User')}`}
                            alt={itin.creator?.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)' }}>
                            by {itin.creator?.name}
                            {itin.creator?.verified && ' ✓'}
                          </span>
                        </div>

                        {/* Meta */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginBottom: '12px' }}>
                          📍 {itin.destination?.name} • {itin.duration} days • 
                          <span style={{ color: difficultyColor(itin.difficulty), fontWeight: 400 }}> {itin.difficulty}</span>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '12px', lineHeight: 1.5, flex: 1 }}>
                          {itin.description?.slice(0, 100)}{itin.description?.length > 100 ? '...' : ''}
                        </p>

                        {/* Stats & Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>
                            ⭐ {itin.rating || 0} • {itin.purchaseCount || 0} purchased
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 400, color: 'var(--burnt-orange)' }}>
                            ₹{itin.price}
                          </div>
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
    </div>
  );
};

export default ItinerariesPage;
