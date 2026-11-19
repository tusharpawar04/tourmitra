import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { guidesAPI, packagesAPI, availabilityAPI, bookingsAPI } from '../services/api';
import { useToast } from '../components/Toast';

const BookingFlowPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchParams] = useSearchParams();
  const packageParam = searchParams.get('package');
  const dateParam = searchParams.get('date');
  const guestsParam = searchParams.get('guests');

  // Guide & packages
  const [guide, setGuide] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Step 1: Package & Date selection
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dateParam || '');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guests, setGuests] = useState(guestsParam ? (parseInt(guestsParam, 10) || 2) : 2);
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Step 2: Quote
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  
  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch guide and packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guideData, packagesData] = await Promise.all([
          guidesAPI.getById(id),
          packagesAPI.getByGuide(id)
        ]);
        setGuide(guideData.guide);
        setPackages(packagesData.packages || []);
        
        // Auto-select package matching query param or first available
        if (packagesData.packages && packagesData.packages.length > 0) {
          const matched = packageParam ? packagesData.packages.find(p => p._id === packageParam) : null;
          setSelectedPackage(matched || packagesData.packages[0]);
        }
      } catch (err) {
        console.error('Error fetching guide data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch available slots when package and date selected
  useEffect(() => {
    if (!selectedPackage || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await availabilityAPI.getSlots({
          guide_id: id,
          date: selectedDate,
          package_id: selectedPackage._id
        });
        setAvailableSlots(response.available_slots || []);
        
        // Auto-select first slot if available
        if (response.available_slots && response.available_slots.length > 0) {
          setSelectedTime(response.available_slots[0].label);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedPackage, selectedDate, id]);

  // Fetch quote when moving to step 2
  const fetchQuote = async () => {
    if (!selectedPackage || !selectedDate || !selectedTime) {
      setQuoteError('Please select package, date, and time');
      return false;
    }

    setLoadingQuote(true);
    setQuoteError('');
    
    try {
      const startDateTime = `${selectedDate}T${selectedTime}:00`;
      
      const response = await bookingsAPI.getQuote({
        guide_id: id,
        package_id: selectedPackage._id,
        date: selectedDate,
        start_time: selectedTime,
        guests: guests
      });
      
      setQuote(response.quote);
      return true;
    } catch (err) {
      setQuoteError(err.message || 'Failed to get quote');
      return false;
    } finally {
      setLoadingQuote(false);
    }
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!quote) return;

    setSubmitting(true);
    
    try {
      const startDateTime = `${selectedDate}T${selectedTime}:00`;
      
      const response = await bookingsAPI.create({
        guide_id: id,
        package_id: selectedPackage._id,
        start_time: startDateTime,
        guests: guests,
        quote_hash: quote.quote_hash,
        special_requests: specialRequests,
        payment_method: paymentMethod,
      });
      
      setBookingResult(response.booking);
      setStep(4); // Success screen
    } catch (err) {
      toast.error('Booking Failed', err.message || 'Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle step 1 continue
  const handleStep1Continue = async () => {
    const success = await fetchQuote();
    if (success) setStep(2);
  };

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted-lavender)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted-lavender)' }}>Guide not found</p>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="page-content" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted-lavender)' }}>This guide has no tour packages available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingTop: 'var(--nav-height)' }}>
      <div className="section-glass" style={{ padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 48px)', minHeight: 'calc(100vh - var(--nav-height))' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Progress steps */}
          {step < 4 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
              {['Select Package', 'Review Quote', 'Confirm'].map((label, i) => (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: step > i + 1 ? 'var(--burnt-orange)' : step === i + 1 ? 'var(--burnt-orange)' : 'rgba(160,139,181,0.2)',
                      color: step >= i + 1 ? '#fff' : 'var(--muted-lavender)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 400, fontSize: '0.85rem',
                      transition: 'all 0.3s',
                    }}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: step === i + 1 ? 500 : 400, 
                      color: step === i + 1 ? 'var(--deep-violet)' : 'var(--muted-lavender)', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ 
                      width: '60px', height: '2px', 
                      background: step > i + 1 ? 'var(--burnt-orange)' : 'rgba(160,139,181,0.2)', 
                      margin: '0 12px', 
                      transition: 'all 0.3s' 
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {/* Main content */}
            <div style={{ flex: '1 1 400px' }}>
              
              {/* Step 1: Select Package & Date */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Select Tour Package</h2>

                  {/* Package selection */}
                  <div style={{ marginBottom: '20px' }}>
                    {packages.map(pkg => (
                      <button
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        className="glass"
                        style={{
                          width: '100%',
                          padding: '20px',
                          marginBottom: '12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          border: selectedPackage?._id === pkg._id ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                          borderRadius: '14px',
                          background: selectedPackage?._id === pkg._id ? 'rgba(232,98,42,0.05)' : 'transparent',
                          transition: 'all 0.3s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--deep-violet)', margin: '0 0 4px' }}>
                              {pkg.title}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', margin: 0 }}>
                              {pkg.duration_hours} hours • Up to {pkg.max_guests} guests
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--burnt-orange)' }}>
                              ₹{pkg.base_price.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)' }}>per group</div>
                          </div>
                        </div>
                        
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>
                            Includes: {pkg.inclusions.join(', ')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Date selection */}
                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
                      Select Date
                    </label>
                    <input
                      type="date"
                      className="input-glass"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Time selection */}
                  {selectedDate && (
                    <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
                        Select Start Time
                      </label>
                      
                      {loadingSlots ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)' }}>Checking availability...</p>
                      ) : availableSlots.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--burnt-orange)' }}>No available slots for this date. Try another date.</p>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {availableSlots.map(slot => (
                            <button
                              key={slot.label}
                              onClick={() => setSelectedTime(slot.label)}
                              style={{
                                padding: '12px 20px',
                                border: selectedTime === slot.label ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                background: selectedTime === slot.label ? 'rgba(232,98,42,0.06)' : 'transparent',
                                color: 'var(--deep-violet)',
                                fontWeight: selectedTime === slot.label ? 500 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                              }}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guests */}
                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
                      Number of Guests
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button 
                        onClick={() => setGuests(Math.max(1, guests - 1))} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: '1.3rem', fontWeight: 400, color: 'var(--deep-violet)', minWidth: '30px', textAlign: 'center' }}>
                        {guests}
                      </span>
                      <button 
                        onClick={() => setGuests(Math.min(selectedPackage?.max_guests || 10, guests + 1))} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', cursor: 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                    {selectedPackage && guests > (selectedPackage.base_capacity || 3) && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted-lavender)', marginTop: '8px' }}>
                        Extra guest fee: ₹{selectedPackage.extra_guest_fee}/person beyond {selectedPackage.base_capacity} guests
                      </p>
                    )}
                  </div>

                  {/* Special requests */}
                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--deep-violet)', display: 'block', marginBottom: '8px' }}>
                      Special Requests (optional)
                    </label>
                    <textarea 
                      className="input-glass" 
                      rows={3} 
                      placeholder="Dietary needs, accessibility requirements, pace preference..." 
                      value={specialRequests} 
                      onChange={e => setSpecialRequests(e.target.value)} 
                      style={{ resize: 'vertical', width: '100%' }} 
                    />
                  </div>

                  {quoteError && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#dc2626', margin: 0 }}>{quoteError}</p>
                    </div>
                  )}

                  <button 
                    className="btn-primary" 
                    onClick={handleStep1Continue}
                    disabled={!selectedPackage || !selectedDate || !selectedTime || loadingQuote || availableSlots.length === 0}
                    style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                  >
                    {loadingQuote ? 'Getting Quote...' : 'Continue to Review →'}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Review Quote */}
              {step === 2 && quote && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Review Your Booking</h2>

                  {/* Guide & package info */}
                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <img 
                        src={guide.photo || guide.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guide.name)}`}
                        alt={guide.name} 
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--golden-amber)' }} 
                      />
                      <div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--deep-violet)', margin: '0 0 2px' }}>{guide.name}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)' }}>
                          📍 {guide.city} • ⭐ {guide.rating} ({guide.reviewCount} reviews)
                          {guide.verified && <span style={{ marginLeft: '8px' }}>✓ Verified</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                      {[
                        { label: 'Package', value: selectedPackage.title },
                        { label: 'Date & Time', value: `${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${selectedTime}` },
                        { label: 'Duration', value: `${selectedPackage.duration_hours} hours` },
                        { label: 'Guests', value: `${guests} ${guests === 1 ? 'person' : 'people'}` },
                        ...(specialRequests ? [{ label: 'Special Requests', value: specialRequests }] : []),
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--muted-lavender)' }}>{item.label}</span>
                          <span style={{ color: 'var(--deep-violet)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation policy */}
                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Cancellation Policy</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', lineHeight: 1.7 }}>
                      <p>• <strong style={{ color: 'var(--deep-violet)' }}>Free cancellation</strong> up to 24 hours before the tour</p>
                      <p>• 50% refund for cancellations within 24 hours</p>
                      <p>• Guide can accept or decline your booking request</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1, padding: '14px' }}>
                      ← Back
                    </button>
                    <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', fontSize: '1rem' }}>
                      Proceed to Confirm →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && quote && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Confirm Booking</h2>

                  {/* TEST MODE Banner */}
                  <div style={{ 
                    background: 'rgba(245,166,35,0.1)', 
                    border: '2px solid var(--burnt-orange)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--burnt-orange)', marginBottom: '4px' }}>
                      ⚠️ TEST MODE
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', margin: 0 }}>
                      No real payment will be processed. This is an alpha booking request.
                    </p>
                  </div>

                  <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Select Payment Method</h3>
                    {[
                      { value: 'upi', label: 'UPI / Google Pay / PhonePe', icon: '📱' },
                      { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                      { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
                    ].map(opt => (
                      <button 
                        key={opt.value} 
                        onClick={() => setPaymentMethod(opt.value)} 
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', marginBottom: '8px',
                          textAlign: 'left', cursor: 'pointer',
                          border: paymentMethod === opt.value ? '2px solid var(--burnt-orange)' : '1px solid var(--glass-border)',
                          borderRadius: '12px', background: paymentMethod === opt.value ? 'rgba(232,98,42,0.05)' : 'transparent',
                          transition: 'all 0.3s',
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{opt.icon}</span>
                        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--deep-violet)' }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setStep(2)} disabled={submitting} style={{ flex: 1, padding: '14px' }}>
                      ← Back
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleSubmitBooking}
                      disabled={submitting}
                      style={{ flex: 2, padding: '14px', fontSize: '1rem' }}
                    >
                      {submitting ? 'Submitting...' : `Submit Request ₹${quote.total.toLocaleString()}`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && bookingResult && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                    <h2 style={{ fontSize: '1.6rem', color: 'var(--deep-violet)', marginBottom: '12px' }}>
                      Booking Request Submitted!
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'var(--muted-lavender)', marginBottom: '24px' }}>
                      Awaiting guide confirmation
                    </p>

                    <div className="glass" style={{ padding: '24px', borderRadius: '14px', marginBottom: '24px', textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-lavender)', marginBottom: '4px' }}>BOOKING REFERENCE</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 400, color: 'var(--burnt-orange)', marginBottom: '20px' }}>
                        {bookingResult.bookingId}
                      </div>

                      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                          <strong style={{ color: 'var(--deep-violet)' }}>What's Next:</strong>
                        </div>
                        <ol style={{ fontSize: '0.85rem', color: 'var(--muted-lavender)', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                          <li>{guide.name} will review your request</li>
                          <li>You'll be notified when they accept or decline</li>
                          <li>If accepted, confirm your booking to finalize</li>
                          <li>Meet your guide at the scheduled time!</li>
                        </ol>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px' }}>
                        View My Bookings
                      </button>
                      <button className="btn-primary" onClick={() => navigate('/guides')} style={{ padding: '12px 24px' }}>
                        Browse More Guides
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Price summary sidebar */}
            {step < 4 && quote && (
              <div style={{ flex: '0 0 280px', minWidth: '260px' }}>
                <div className="glass" style={{
                  padding: '24px', borderRadius: '16px', position: 'sticky',
                  top: 'calc(var(--nav-height) + 24px)', border: '1.5px solid rgba(245,166,35,0.3)',
                }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Price Breakdown</h3>
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Guide fee</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{quote.guideFee.toLocaleString()}</span>
                    </div>
                    {quote.groupSurcharge > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--muted-lavender)' }}>Group surcharge</span>
                        <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{quote.groupSurcharge.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>Commission (12%)</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{quote.commission.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--muted-lavender)' }}>GST (18%)</span>
                      <span style={{ color: 'var(--deep-violet)', fontWeight: 500 }}>₹{quote.tax.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 400 }}>
                    <span style={{ color: 'var(--deep-violet)' }}>Total</span>
                    <span style={{ color: 'var(--deep-violet)' }}>₹{quote.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowPage;
