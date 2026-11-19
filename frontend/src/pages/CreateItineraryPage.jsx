import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itinerariesAPI, destinationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateItineraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    duration: 3,
    difficulty: 'moderate',
    category: 'Heritage',
    description: '',
    highlights: ['', '', ''],
    price: 199,
    estimatedTripCost: 5000,
    coverImage: '',
    included: ['Detailed day-by-day plan', 'GPS coordinates for all locations', 'Restaurant recommendations', 'Budget breakdown', 'Packing list'],
    notIncluded: ['Accommodation', 'Meals', 'Transportation', 'Entry fees'],
    days: [
      {
        day: 1,
        title: '',
        description: '',
        activities: [
          { time: '09:00 AM', activity: '', location: '', duration: '2 hours', cost: 0, notes: '' }
        ]
      }
    ],
    packingList: ['Comfortable walking shoes', 'Sunscreen', 'Camera', 'Water bottle'],
    travelTips: ['Book tickets online in advance', 'Start early to avoid crowds'],
    tags: [],
  });

  useEffect(() => {
    const fetchDest = async () => {
      try {
        const data = await destinationsAPI.getAll();
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDest();
  }, []);

  const categories = ['Heritage', 'Adventure', 'Spiritual', 'Nature', 'Beach & Culture', 'Food Tours', 'Photography', 'Family', 'Romantic', 'Solo'];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateDayField = (dayIndex, field, value) => {
    const newDays = [...formData.days];
    newDays[dayIndex][field] = value;
    setFormData({ ...formData, days: newDays });
  };

  const updateActivityField = (dayIndex, activityIndex, field, value) => {
    const newDays = [...formData.days];
    newDays[dayIndex].activities[activityIndex][field] = value;
    setFormData({ ...formData, days: newDays });
  };

  const addActivity = (dayIndex) => {
    const newDays = [...formData.days];
    newDays[dayIndex].activities.push({ time: '', activity: '', location: '', duration: '', cost: 0, notes: '' });
    setFormData({ ...formData, days: newDays });
  };

  const addDay = () => {
    const newDays = [...formData.days, {
      day: formData.days.length + 1,
      title: `Day ${formData.days.length + 1}`,
      description: '',
      activities: [{ time: '', activity: '', location: '', duration: '', cost: 0, notes: '' }]
    }];
    setFormData({ ...formData, days: newDays });
  };

  const handleSubmit = async (publish = false) => {
    if (!formData.title || !formData.destination) {
      alert('Please fill in title and destination');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: publish ? 'published' : 'draft',
      };
      const response = await itinerariesAPI.create(payload);
      alert(publish ? '🎉 Itinerary published successfully!' : '✅ Itinerary saved as draft');
      navigate(`/itineraries/${response.itinerary._id}`);
    } catch (err) {
      console.error('Create itinerary error:', err);
      alert(err.response?.data?.error || 'Failed to create itinerary');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>✨ Create Itinerary</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', marginBottom: '28px' }}>
              Share your travel experience and earn 85% from each purchase!
            </p>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              {['Basic Info', 'Days & Activities', 'Finalize'].map((label, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 6px',
                    background: step > i ? 'var(--burnt-orange)' : step === i + 1 ? 'rgba(245,166,35,0.2)' : 'rgba(160,139,181,0.1)',
                    color: step > i ? '#fff' : step === i + 1 ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: '0.9rem',
                    border: step === i + 1 ? '2px solid var(--burnt-orange)' : 'none'
                  }}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: step === i + 1 ? 'var(--burnt-orange)' : 'var(--muted-lavender)', fontWeight: step === i + 1 ? 500 : 400 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(245,166,35,0.15)', marginBottom: '32px' }}>
              <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: 'var(--burnt-orange)', borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Basic Information</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                    Itinerary Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., 3-Day Taj Mahal Heritage Circuit"
                    className="input-glass"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                      Destination *
                    </label>
                    <select value={formData.destination} onChange={(e) => updateField('destination', e.target.value)} className="input-glass" style={{ width: '100%' }}>
                      <option value="">Select destination</option>
                      {destinations.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                      Duration (days) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.duration}
                      onChange={(e) => updateField('duration', parseInt(e.target.value))}
                      className="input-glass"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                      Difficulty
                    </label>
                    <select value={formData.difficulty} onChange={(e) => updateField('difficulty', e.target.value)} className="input-glass" style={{ width: '100%' }}>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateField('category', cat)}
                        className={`pill ${formData.category === cat ? 'active' : ''}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your itinerary in detail..."
                    className="input-glass"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                      Itinerary Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="49"
                      max="999"
                      value={formData.price}
                      onChange={(e) => updateField('price', parseInt(e.target.value))}
                      className="input-glass"
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-lavender)', marginTop: '4px' }}>
                      You earn 85%: ₹{Math.round(formData.price * 0.85)}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                      Est. Trip Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedTripCost}
                      onChange={(e) => updateField('estimatedTripCost', parseInt(e.target.value))}
                      className="input-glass"
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-lavender)', marginTop: '4px' }}>
                      Total cost to follow the plan
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Days & Activities */}
            {step === 2 && (
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Day-by-Day Activities</h3>

                {formData.days.map((day, dayIndex) => (
                  <div key={dayIndex} style={{ marginBottom: '24px', padding: '20px', background: 'rgba(245,166,35,0.05)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--burnt-orange)', marginBottom: '12px' }}>Day {day.day}</h4>

                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDayField(dayIndex, 'title', e.target.value)}
                      placeholder="Day title (e.g., Taj Mahal Sunrise Tour)"
                      className="input-glass"
                      style={{ width: '100%', marginBottom: '12px' }}
                    />

                    <textarea
                      value={day.description}
                      onChange={(e) => updateDayField(dayIndex, 'description', e.target.value)}
                      placeholder="Day overview..."
                      className="input-glass"
                      rows={2}
                      style={{ width: '100%', marginBottom: '16px', resize: 'vertical' }}
                    />

                    {/* Activities */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '10px' }}>Activities</div>
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="glass" style={{ padding: '14px', marginBottom: '10px', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            value={activity.time}
                            onChange={(e) => updateActivityField(dayIndex, actIndex, 'time', e.target.value)}
                            placeholder="09:00 AM"
                            className="input-glass"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                          <input
                            type="text"
                            value={activity.activity}
                            onChange={(e) => updateActivityField(dayIndex, actIndex, 'activity', e.target.value)}
                            placeholder="Activity name"
                            className="input-glass"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            value={activity.location}
                            onChange={(e) => updateActivityField(dayIndex, actIndex, 'location', e.target.value)}
                            placeholder="Location"
                            className="input-glass"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                          <input
                            type="text"
                            value={activity.duration}
                            onChange={(e) => updateActivityField(dayIndex, actIndex, 'duration', e.target.value)}
                            placeholder="2 hours"
                            className="input-glass"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                          <input
                            type="number"
                            value={activity.cost}
                            onChange={(e) => updateActivityField(dayIndex, actIndex, 'cost', parseInt(e.target.value) || 0)}
                            placeholder="Cost ₹"
                            className="input-glass"
                            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                          />
                        </div>

                        <textarea
                          value={activity.notes}
                          onChange={(e) => updateActivityField(dayIndex, actIndex, 'notes', e.target.value)}
                          placeholder="Tips & notes..."
                          className="input-glass"
                          rows={2}
                          style={{ width: '100%', fontSize: '0.85rem', padding: '6px 10px', resize: 'vertical' }}
                        />
                      </div>
                    ))}

                    <button onClick={() => addActivity(dayIndex)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 16px' }}>
                      + Add Activity
                    </button>
                  </div>
                ))}

                <button onClick={addDay} className="btn-primary" style={{ fontSize: '0.9rem', padding: '10px 20px' }}>
                  + Add Day {formData.days.length + 1}
                </button>
              </div>
            )}

            {/* Step 3: Finalize */}
            {step === 3 && (
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>Finalize & Publish</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 400, color: 'var(--deep-violet)', marginBottom: '6px' }}>
                    Cover Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => updateField('coverImage', e.target.value)}
                    placeholder="https://..."
                    className="input-glass"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ padding: '20px', background: 'rgba(76,175,80,0.1)', border: '1px solid #4CAF50', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#4CAF50', marginBottom: '12px' }}>✅ Summary</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', lineHeight: 1.8 }}>
                    <div><strong>Title:</strong> {formData.title || 'Not set'}</div>
                    <div><strong>Duration:</strong> {formData.duration} days</div>
                    <div><strong>Days Created:</strong> {formData.days.length}</div>
                    <div><strong>Price:</strong> ₹{formData.price} (You earn: ₹{Math.round(formData.price * 0.85)})</div>
                    <div><strong>Category:</strong> {formData.category}</div>
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>
                  💡 <strong>Tip:</strong> Publish to make it visible in the marketplace. You can save as draft and edit later.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                className="btn-secondary"
                style={{ padding: '12px 24px', visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} className="btn-primary" style={{ padding: '12px 28px' }}>
                    Next →
                  </button>
                ) : (
                  <>
                    <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-secondary" style={{ padding: '12px 24px', opacity: submitting ? 0.6 : 1 }}>
                      Save as Draft
                    </button>
                    <button onClick={() => handleSubmit(true)} disabled={submitting} className="btn-primary" style={{ padding: '12px 28px', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'Publishing...' : '🚀 Publish'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateItineraryPage;
