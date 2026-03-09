import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { guidesAPI } from '../services/api';
import CalendarPicker from '../components/CalendarPicker';

const BookingFlowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState('full');
  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPrototypeModal, setShowPrototypeModal] = useState(false);

  useEffect(() => {
    guidesAPI.getById(id).then(data => {
      setGuide(data.guide);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !guide) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted-lavender)' }}>{loading ? 'Loading...' : 'Guide not found'}</p>
        </div>
      </div>
    );
  }

  const basePrice = tripType === 'half' ? Math.round(guide.price * 0.6) : tripType === 'multi' ? Math.round(guide.price * 0.85) : guide.price;
  const guideFee = basePrice * days * (tripType === 'half' ? 1 : 1);
  const groupSurcharge = travelers > 3 ? (travelers - 3) * 200 * days : 0;
  const platformFee = Math.round((guideFee + groupSurcharge) * 0.1);
  const tax = Math.round((guideFee + groupSurcharge + platformFee) * 0.18);
  const total = guideFee + groupSurcharge + platformFee + tax;

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)', minHeight: 'calc(100vh - var(--nav-height))' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
            {['Configure', 'Review', 'Pay'].map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="booking-progress-circle" style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: step > i ? 'var(--burnt-orange)' : step === i + 1 ? 'var(--burnt-orange)' : 'rgba(160,139,181,0.2)',
                    color: step >= i + 1 ? '#fff' : 'var(--muted-lavender)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-numeric)',
                    transition: 'all 0.3s',
                  }}>{step > i + 1 ? '✓' : i + 1}</div>
                  <span className="booking-progress-label" style={{ fontSize: '0.85rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--deep-violet)' : 'var(--muted-lavender)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
                {i < 2 && <div className="booking-progress-connector" style={{ width: '60px', height: '2px', background: step > i + 1 ? 'var(--burnt-orange)' : 'rgba(160,139,181,0.2)', margin: '0 12px', transition: 'all 0.3s' }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {/* Main content */}
            <div style={{ flex: '1 1 400px' }}>
              {/* Step 1: Configure */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Configure Your Trip</h2>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '10px' }}>Trip Type</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[
                        { value: 'half', label: 'Half Day', desc: '4 hours' },
                        { value: 'full', label: 'Full Day', desc: '8 hours' },
                        { value: 'multi', label: 'Multi-Day', desc: '8 hrs/day' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setTripType(opt.value)} style={{
                          flex: '1 1 100px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                          border: tripType === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                          borderRadius: '12px', background: tripType === opt.value ? 'rgba(232,98,42,0.06)' : 'transparent',
                          transition: 'all 0.3s',
                        }}>
                          <div style={{ fontWeight: 600, color: 'var(--deep-violet)', fontSize: '0.9rem' }}>{opt.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {tripType === 'multi' && (
                    <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Number of Days</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setDays(Math.max(2, days - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}>−</button>
                        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', minWidth: '30px', textAlign: 'center' }}>{days}</span>
                        <button onClick={() => setDays(Math.min(7, days + 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  )}

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Start Date</label>
                    <CalendarPicker
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="Pick a start date"
                      inputClassName="glass-input"
                    />
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Number of Travelers</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => setTravelers(Math.max(1, travelers - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}>−</button>
                      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)', minWidth: '30px', textAlign: 'center' }}>{travelers}</span>
                      <button onClick={() => setTravelers(Math.min(10, travelers + 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                    </div>
                    {travelers > 3 && <p style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>Group surcharge: ₹200/person for travelers beyond 3</p>}
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>Special Requests (optional)</label>
                    <textarea className="input-glass" rows={3} placeholder="Dietary needs, accessibility, pace preference..." value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  <button className="btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>Continue to Review →</button>
                </motion.div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Review Your Booking</h2>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <img src={guide.photo} alt={guide.name} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)' }} />
                      <div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: '0 0 2px' }}>{guide.name}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>📍 {guide.city} • ⭐ {guide.rating} ({guide.reviews} reviews)</p>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                      {[
                        { label: 'Trip Type', value: tripType === 'half' ? 'Half Day (4 hrs)' : tripType === 'full' ? 'Full Day (8 hrs)' : `Multi-Day (${days} days)` },
                        { label: 'Date', value: startDate || 'TBD' },
                        { label: 'Travelers', value: `${travelers} ${travelers === 1 ? 'person' : 'people'}` },
                        ...(specialRequests ? [{ label: 'Special Requests', value: specialRequests }] : []),
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--muted-lavender)' }}>{item.label}</span>
                          <span style={{ color: 'var(--deep-violet)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Cancellation Policy</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', lineHeight: 1.7 }}>
                      <p>• <strong style={{ color: 'var(--deep-violet)' }}>Free cancellation</strong> up to 48 hours before the trip</p>
                      <p>• 50% refund for cancellations 24–48 hours before</p>
                      <p>• No refund for cancellations within 24 hours</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, padding: '14px' }}>← Back</button>
                    <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', fontSize: '1rem' }}>Proceed to Payment →</button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Pay */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Payment</h2>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Select Payment Method</h3>
                    {[
                      { value: 'upi', label: 'UPI / Google Pay / PhonePe', icon: '📱', tag: 'Recommended' },
                      { value: 'card', label: 'Credit / Debit Card', icon: '💳', tag: null },
                      { value: 'netbanking', label: 'Net Banking', icon: '🏦', tag: null },
                      { value: 'wallet', label: 'Wallet (Paytm / PhonePe)', icon: '👛', tag: null },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setPaymentMethod(opt.value)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', marginBottom: '8px',
                        textAlign: 'left', cursor: 'pointer',
                        border: paymentMethod === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                        borderRadius: '12px', background: paymentMethod === opt.value ? 'rgba(232,98,42,0.05)' : 'transparent',
                        transition: 'all 0.3s',
                      }}>
                        <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--deep-violet)' }}>{opt.label}</span>
                        {opt.tag && <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '100px', background: 'rgba(76,175,80,0.1)', color: '#4CAF50', fontWeight: 600 }}>{opt.tag}</span>}
                      </button>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--deep-violet)' }}>Escrow-Protected Payment</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>Your payment is held securely and released to the guide only after trip completion.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1, padding: '14px' }}>← Back</button>
                    <button className="btn-primary" style={{ flex: 2, padding: '14px', fontSize: '1rem' }}
                      onClick={() => setShowPrototypeModal(true)}
                    >Pay ₹{total.toLocaleString()} →</button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Price summary sidebar */}
            <div style={{ flex: '0 0 280px', minWidth: '260px' }} id="booking-sidebar">
              <div className="glass" style={{
                padding: '24px', borderRadius: '16px', position: 'sticky',
                top: 'calc(var(--nav-height) + 24px)', border: '1.5px solid rgba(245,166,35,0.3)',
              }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Price Breakdown</h3>
                <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--muted-lavender)' }}>Guide fee {tripType === 'multi' ? `(${days} days)` : ''}</span>
                    <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{guideFee.toLocaleString()}</span>
                  </div>
                  {groupSurcharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Group surcharge</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{groupSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--muted-lavender)' }}>Platform fee (10%)</span>
                    <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{platformFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--muted-lavender)' }}>GST (18%)</span>
                    <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{tax.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--deep-violet)' }}>Total</span>
                  <span style={{ color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>₹{total.toLocaleString()}</span>
                </div>

                <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(76,175,80,0.06)', borderRadius: '10px', border: '1px solid rgba(76,175,80,0.15)' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <img src={guide.photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{guide.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-lavender)' }}>⭐ {guide.rating} • {guide.city}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          #booking-sidebar { flex: 1 1 100% !important; min-width: 100% !important; order: -1; }
          #booking-sidebar .glass { position: static !important; }
        }
      `}</style>

      {/* ═══ Prototype Coming-Soon Modal ═══ */}
      <AnimatePresence>
        {showPrototypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(26,13,46,0.55)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setShowPrototypeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 260 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '460px',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                borderRadius: '24px',
                border: '1.5px solid rgba(245,166,35,0.3)',
                boxShadow: '0 24px 80px rgba(26,13,46,0.25)',
                padding: 'clamp(32px, 5vw, 48px)',
                textAlign: 'center',
              }}
            >
              {/* Confetti-style decorative emoji */}
              <div style={{ fontSize: '3.5rem', marginBottom: '16px', lineHeight: 1 }}>🎉</div>

              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
                color: 'var(--deep-violet)',
                marginBottom: '12px',
                lineHeight: 1.3,
              }}>
                We're Almost There!
              </h2>

              <p style={{
                fontSize: '0.95rem',
                color: 'var(--muted-lavender)',
                lineHeight: 1.7,
                marginBottom: '8px',
              }}>
                You've got great taste! 🙌 This is currently a <strong style={{ color: 'var(--deep-violet)' }}>prototype</strong> and
                live bookings will be available very soon.
              </p>

              <p style={{
                fontSize: '0.88rem',
                color: 'var(--burnt-orange)',
                fontWeight: 600,
                marginBottom: '28px',
              }}>
                Stay tuned — your dream trip with <span style={{ color: 'var(--deep-violet)' }}>{guide?.name}</span> is just around the corner! ✨
              </p>

              <div style={{
                background: 'linear-gradient(135deg, rgba(45,27,78,0.04), rgba(232,98,42,0.06))',
                border: '1px solid var(--glass-border)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '28px',
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Your Selection
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  {guide?.photo && <img src={guide.photo} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)' }} />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--deep-violet)' }}>{guide?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>📍 {guide?.city} · ₹{total.toLocaleString()} total</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setShowPrototypeModal(false)}
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  ← Go Back
                </button>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/explore')}
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Keep Exploring 🌍
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingFlowPage;
