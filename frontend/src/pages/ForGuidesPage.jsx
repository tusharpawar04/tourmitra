import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForGuidesPage = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const estimatedMonthly = Math.round(hoursPerWeek * 4.3 * 280);

  return (
    <div className="page-content">
      {/* Hero — sits over sunset */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(var(--nav-height) + 40px) 24px 60px',
      }}>
        <div style={{ maxWidth: '800px', textAlign: 'center' }}>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)',
              color: '#fff',
              marginBottom: '16px',
              textShadow: '0 2px 40px rgba(26,13,46,0.3)',
              lineHeight: 1.15,
            }}
          >
            Turn Your Local Knowledge<br />
            Into <span style={{ color: '#FCC74B' }}>Income</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.8)', maxWidth: '540px', margin: '0 auto 36px', lineHeight: 1.7 }}
          >
            Join 5,000+ verified guides earning on Tourmitra. Flexible hours, secure payments, and tourists who value your expertise.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/signup?role=guide&redirect=/guide/onboard">
              <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>Start Earning →</button>
            </Link>
            <a href="#how-it-works">
              <button className="btn-secondary" style={{ padding: '16px 28px', fontSize: '1.05rem' }}>Learn More ↓</button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '32px' }}>
            How Much Can You Earn?
          </motion.h2>
          <div className="glass" style={{ padding: '36px', borderRadius: '20px', border: '1.5px solid rgba(245,166,35,0.3)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--deep-violet)', display: 'block', marginBottom: '12px' }}>
              Hours per week you can guide
            </label>
            <input
              type="range" min="5" max="40" step="1" value={hoursPerWeek}
              onChange={e => setHoursPerWeek(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--burnt-orange)', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted-lavender)', marginBottom: '28px' }}>
              <span>5 hrs</span><span style={{ fontWeight: 600, color: 'var(--deep-violet)', fontSize: '0.95rem' }}>{hoursPerWeek} hrs/week</span><span>40 hrs</span>
            </div>
            <div style={{
              padding: '24px',
              background: 'rgba(245,166,35,0.06)',
              borderRadius: '14px',
              border: '1px solid rgba(245,166,35,0.15)',
            }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted-lavender)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Estimated Monthly Earnings</div>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'var(--deep-violet)', fontFamily: 'var(--font-numeric)' }}>
                ₹{estimatedMonthly.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)', marginTop: '4px' }}>Based on average guide rate of ₹280/hr</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Tourmitra */}
      <section id="how-it-works" className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)', background: 'rgba(255,255,255,0.72)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '48px' }}>
            Why Guides Choose Tourmitra
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { icon: '💰', title: 'Secure Payments', desc: 'Every booking is escrow-protected. You get paid within 24 hours of trip completion — guaranteed.' },
              { icon: '📅', title: 'Flexible Schedule', desc: 'Set your own availability. Work as much or as little as you want. No commitments.' },
              { icon: '🛡️', title: 'Verified Badge', desc: 'Your Aadhaar verification and trust score make tourists confident in booking you.' },
              { icon: '📊', title: 'AI Demand Insights', desc: 'See what tourists are searching for in your city. Adjust your offerings to match demand.' },
              { icon: '⭐', title: 'Build Your Brand', desc: 'Your profile, reviews, and gallery work as your personal storefront. Grow your reputation.' },
              { icon: '🌍', title: 'Global Tourists', desc: 'Connect with domestic and international travelers. Multi-language support built in.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ padding: '28px', textAlign: 'center' }}
              >
                <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', color: 'var(--deep-violet)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-lavender)', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Onboarding Works */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '48px' }}>
            Your Path to Becoming a Guide
          </motion.h2>
          {[
            { step: '1', title: 'Create Your Account', desc: 'Sign up with Google or phone OTP. Quick and free.', accent: 'var(--burnt-orange)' },
            { step: '2', title: 'Upload Documents', desc: 'Aadhaar, PAN, address proof, and a professional photo. We verify within 48 hours.', accent: 'var(--magenta)' },
            { step: '3', title: 'Complete Your Profile', desc: 'Add your specialties, sample itineraries, pricing, and availability calendar.', accent: 'var(--golden-amber)' },
            { step: '4', title: 'Pass the Knowledge Quiz', desc: 'Answer questions about your city to prove your expertise. 80% pass rate.', accent: 'var(--deep-violet)' },
            { step: '5', title: 'Start Earning', desc: 'Once approved, your profile goes live. Tourists can discover and book you immediately.', accent: '#4CAF50' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                marginBottom: '28px',
                paddingBottom: i < 4 ? '28px' : '0',
                borderBottom: i < 4 ? '1px solid var(--glass-border)' : 'none',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: item.accent,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
                flexShrink: 0,
                fontFamily: 'var(--font-numeric)',
              }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-violet)', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-lavender)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Required documents preview */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)', background: 'rgba(255,255,255,0.72)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', marginBottom: '32px' }}>
            Documents You'll Need
          </motion.h2>
          <div className="glass" style={{ padding: '28px', borderRadius: '16px' }}>
            {[
              { doc: 'Aadhaar Card (front & back)', required: true },
              { doc: 'PAN Card', required: true },
              { doc: 'Address Proof (Voter ID / Utility Bill / Bank Statement)', required: true },
              { doc: 'Professional Photo', required: true },
              { doc: 'Tourism License / Guide Certificate', required: false },
              { doc: 'Police Clearance Certificate', required: false },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < 5 ? '1px solid rgba(245,166,35,0.1)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1rem' }}>{item.required ? '📋' : '⭐'}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--deep-violet)' }}>{item.doc}</span>
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '100px',
                  background: item.required ? 'rgba(232,98,42,0.1)' : 'rgba(160,139,181,0.1)',
                  color: item.required ? 'var(--burnt-orange)' : 'var(--muted-lavender)',
                }}>
                  {item.required ? 'Required' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted-lavender)', marginTop: '16px' }}>
            All documents are stored securely and used only for verification. JPG, PNG, PDF accepted (max 5MB each).
          </p>
        </div>
      </section>

      {/* Guide testimonials */}
      <section className="section-glass" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '40px' }}>
            Hear From Our Guides
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { name: 'Rajesh S.', city: 'Jaipur', text: 'Tourmitra changed my life. I went from irregular freelance work to 20+ bookings a month. The escrow system means I always get paid on time.', earnings: '₹45,000/mo' },
              { name: 'Priya N.', city: 'Kerala', text: 'I love that I can set my own schedule. As a single mother, the flexibility to choose when I work is invaluable. And the tourists are wonderful.', earnings: '₹38,000/mo' },
              { name: 'Amit V.', city: 'Varanasi', text: 'The AI demand insights are amazing. I adjusted my tour offerings based on what tourists search for, and my bookings tripled in two months.', earnings: '₹52,000/mo' },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ padding: '28px' }}
              >
                <p style={{ fontSize: '0.92rem', color: 'var(--deep-violet)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>"{testimonial.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--deep-violet)' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted-lavender)' }}>{testimonial.city}</div>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4CAF50' }}>{testimonial.earnings}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: 'clamp(60px, 10vw, 100px) 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#fff', marginBottom: '16px', textShadow: '0 2px 30px rgba(26,13,46,0.4)' }}>
            Ready to share your city with the world?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            It takes 10 minutes to apply. Verification in 48 hours. Start earning this week.
          </p>
          <Link to="/signup?role=guide&redirect=/guide/onboard">
            <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.05rem' }}>Apply Now →</button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default ForGuidesPage;
