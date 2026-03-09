import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GuideOnboardingPage = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [profile, setProfile] = useState({ fullName: '', phone: '', city: '', bio: '' });
  const [documents, setDocuments] = useState({ aadhaar: null, pan: null, address: null, photo: null, license: null });
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [pricePerDay, setPricePerDay] = useState(1500);
  const [availability, setAvailability] = useState([]);
  const [sampleItinerary, setSampleItinerary] = useState({ title: '', description: '' });

  const allSpecialties = ['Heritage', 'Spiritual', 'Adventure', 'Food Tours', 'Nature', 'Photography', 'Art & Culture', 'Wellness', 'Shopping', 'Nightlife'];
  const allLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Kannada', 'French', 'Spanish', 'German', 'Japanese', 'Mandarin'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleItem = (arr, setArr, item) => {
    setArr(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleFileChange = (key) => (e) => {
    if (e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [key]: e.target.files[0].name }));
    }
  };

  const nextStep = () => step < totalSteps ? setStep(step + 1) : null;
  const prevStep = () => step > 1 && setStep(step - 1);

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      <div style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(28px, 4vw, 48px) 16px',
      }}>
        <motion.div
          className="glass"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: '100%', maxWidth: '680px', padding: 'clamp(28px, 4vw, 44px)',
            borderRadius: '20px', border: '1.5px solid rgba(245,166,35,0.3)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: '4px' }}>Become a Tourmitra Guide</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Complete your profile to start receiving bookings</p>
          </div>

          {/* Progress bar */}
          <div style={{ margin: '24px 0 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--deep-violet)' }}>Step {step} of {totalSteps}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(245,166,35,0.15)' }}>
              <motion.div
                initial={false}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', borderRadius: '2px', background: 'var(--burnt-orange)' }}
              />
            </div>
            {/* Step labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {['Profile', 'Documents', 'Expertise', 'Review'].map((label, i) => (
                <span key={label} style={{ fontSize: '0.72rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--burnt-orange)' : 'var(--muted-lavender)' }}>{label}</span>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Profile Info */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Personal Information</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                      <input type="text" className="input-glass" placeholder="As on your Aadhaar card" value={profile.fullName} onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
                      <input type="tel" className="input-glass" placeholder="+91 XXXXX XXXXX" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Primary City *</label>
                      <input type="text" className="input-glass" placeholder="Where do you guide? e.g., Jaipur" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '6px' }}>Bio / Tagline *</label>
                      <textarea className="input-glass" rows={3} placeholder="Tell tourists why they should choose you. What makes your tours unique?" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ resize: 'vertical' }} />
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)', marginTop: '4px' }}>{profile.bio.length}/300 characters</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Document Upload */}
              {step === 2 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Verification Documents</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', marginBottom: '20px' }}>Upload clear scans or photos. JPG, PNG, PDF accepted (max 5MB each).</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {[
                      { key: 'aadhaar', label: 'Aadhaar Card (front & back)', required: true },
                      { key: 'pan', label: 'PAN Card', required: true },
                      { key: 'address', label: 'Address Proof', required: true },
                      { key: 'photo', label: 'Professional Photo', required: true },
                      { key: 'license', label: 'Tourism Guide License / Certificate', required: false },
                    ].map(doc => (
                      <div key={doc.key} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                        border: '1px dashed var(--glass-border)', borderRadius: '12px',
                        background: documents[doc.key] ? 'rgba(76,175,80,0.04)' : 'transparent',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--deep-violet)', fontWeight: 500 }}>
                            {doc.label}
                            {doc.required && <span style={{ color: 'var(--burnt-orange)', marginLeft: '4px' }}>*</span>}
                          </div>
                          {documents[doc.key] && (
                            <div style={{ fontSize: '0.75rem', color: '#4CAF50', marginTop: '2px' }}>✓ {documents[doc.key]}</div>
                          )}
                        </div>
                        <label style={{
                          padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.3s',
                          background: documents[doc.key] ? 'rgba(76,175,80,0.1)' : 'rgba(232,98,42,0.1)',
                          color: documents[doc.key] ? '#4CAF50' : 'var(--burnt-orange)',
                        }}>
                          {documents[doc.key] ? 'Change' : 'Upload'}
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange(doc.key)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', marginTop: '12px' }}>🔒 Documents are encrypted and used only for verification. Never shared with tourists.</p>
                </div>
              )}

              {/* Step 3: Expertise & Pricing */}
              {step === 3 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Your Expertise</h2>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>Specialties (select at least 2) *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {allSpecialties.map(s => (
                        <button key={s} onClick={() => toggleItem(specialties, setSpecialties, s)}
                          className={`pill ${specialties.includes(s) ? 'active' : ''}`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>Languages *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {allLanguages.map(l => (
                        <button key={l} onClick={() => toggleItem(languages, setLanguages, l)}
                          className={`pill ${languages.includes(l) ? 'active' : ''}`}
                          style={{ fontSize: '0.78rem' }}
                        >{l}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>Price Per Day (₹)</label>
                    <input
                      type="range" min="500" max="5000" step="100" value={pricePerDay}
                      onChange={e => setPricePerDay(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--burnt-orange)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>
                      <span>₹500</span>
                      <span style={{ fontWeight: 700, color: 'var(--deep-violet)', fontSize: '1rem', fontFamily: 'var(--font-numeric)' }}>₹{pricePerDay.toLocaleString()}/day</span>
                      <span>₹5,000</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>Availability *</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {days.map(d => (
                        <button key={d} onClick={() => toggleItem(availability, setAvailability, d)} style={{
                          width: '44px', height: '44px', borderRadius: '10px',
                          border: availability.includes(d) ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                          background: availability.includes(d) ? 'rgba(232,98,42,0.08)' : 'transparent',
                          color: availability.includes(d) ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
                          fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.3s',
                        }}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Sample Itinerary (optional)</label>
                    <input type="text" className="input-glass" placeholder="e.g., Jaipur Heritage Walk" value={sampleItinerary.title} onChange={e => setSampleItinerary({ ...sampleItinerary, title: e.target.value })} style={{ marginBottom: '10px' }} />
                    <textarea className="input-glass" rows={3} placeholder="Describe highlights, stops, duration..." value={sampleItinerary.description} onChange={e => setSampleItinerary({ ...sampleItinerary, description: e.target.value })} style={{ resize: 'vertical' }} />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Review & Submit</h2>

                  <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--deep-violet)' }}>📋 Profile</h3>
                    {[
                      { label: 'Name', value: profile.fullName || '—' },
                      { label: 'Phone', value: profile.phone || '—' },
                      { label: 'City', value: profile.city || '—' },
                      { label: 'Bio', value: profile.bio ? profile.bio.slice(0, 80) + '...' : '—' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--muted-lavender)' }}>{item.label}</span>
                        <span style={{ color: 'var(--deep-violet)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--deep-violet)' }}>📁 Documents</h3>
                    {Object.entries(documents).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--muted-lavender)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ color: val ? '#4CAF50' : 'var(--muted-lavender)', fontWeight: 500 }}>{val ? '✓ Uploaded' : 'Not uploaded'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--deep-violet)' }}>🎯 Expertise</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Specialties</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>{specialties.join(', ') || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Languages</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>{languages.join(', ') || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Price</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 700 }}>₹{pricePerDay.toLocaleString()}/day</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Available</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>{availability.join(', ') || '—'}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--deep-violet)', lineHeight: 1.6 }}>
                      By submitting, you agree to Tourmitra's <a href="#" style={{ color: 'var(--burnt-orange)', fontWeight: 600 }}>Guide Terms of Service</a> and consent to background verification.
                    </p>
                  </div>

                  <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                    onClick={() => alert('🎉 Application Submitted!\n\nWe will review your documents within 48 hours. You\'ll receive an email/SMS once approved.')}
                  >Submit Application 🚀</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
            <button onClick={prevStep} className="btn-secondary" style={{ padding: '12px 24px', visibility: step === 1 ? 'hidden' : 'visible' }}>← Back</button>
            {step < totalSteps && (
              <button onClick={nextStep} className="btn-primary" style={{ padding: '12px 28px' }}>Next →</button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuideOnboardingPage;
