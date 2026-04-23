import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Keyframe injection ──────────────────────────────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-12px) rotate(1deg); }
    66%       { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(20px, -15px); }
  }
  @keyframes shimmerLine {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(1.05); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .fade-up-1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .fade-up-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
  .fade-up-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
  .fade-up-4 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
  .fade-up-5 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.7s both; }
  .fade-in-6 { animation: fadeIn 1s ease 0.9s both; }

  .animate-on-scroll { opacity: 0; transform: translateY(32px); }
  .animate-on-scroll.visible { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  .animate-on-scroll.delay-1.visible { animation-delay: 0.1s; }
  .animate-on-scroll.delay-2.visible { animation-delay: 0.25s; }
  .animate-on-scroll.delay-3.visible { animation-delay: 0.4s; }
  .animate-on-scroll.delay-4.visible { animation-delay: 0.55s; }

  .feature-card {
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(24,95,165,0.12);
  }
  .college-card {
    transition: transform 0.25s ease, border-color 0.2s ease;
  }
  .college-card:hover {
    transform: translateY(-3px);
    border-color: #185FA5 !important;
  }
  .cta-btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(24,95,165,0.35);
    background: #0C447C !important;
  }
  .sec-btn {
    transition: background 0.2s ease, color 0.2s ease;
  }
  .sec-btn:hover {
    background: #f0f7ff !important;
    color: #0C447C !important;
  }
  .stat-num {
    animation: countUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  .stat-num:nth-child(1) { animation-delay: 0.8s; }
  .stat-num:nth-child(2) { animation-delay: 1.0s; }
  .stat-num:nth-child(3) { animation-delay: 1.2s; }

  /* Step card animations */
  .step-card {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .step-card.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .step-card:nth-child(1) { transition-delay: 0s; }
  .step-card:nth-child(2) { transition-delay: 0.15s; }
  .step-card:nth-child(3) { transition-delay: 0.3s; }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .features-grid, .college-grid, .steps-grid, .testimonials-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

/* ─── Scroll Observer Hook ──────────────────────────────────────────────────── */
const useScrollAnimation = () => {
  const [visible, setVisible] = useState({});
  const refs = useRef({});

  const setRef = (id) => (el) => {
    if (el && !refs.current[id]) {
      refs.current[id] = el;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(prev => ({ ...prev, [id]: true }));
            observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(el);
    }
  };

  return { visible, setRef };
};

/* ─── SVG Icons ───────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const AIIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const StepsIcon = ({ num }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4l2 2" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
  </svg>
);

/* ─── Decorative blob ─────────────────────────────────────────────────────── */
const Blob = ({ style }) => (
  <div style={{
    position: 'absolute',
    borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    animation: 'drift 8s ease-in-out infinite',
    ...style,
  }} />
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Home = () => {
  const { visible, setRef } = useScrollAnimation();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', overflowX: 'hidden' }}>
      <style>{KEYFRAMES}</style>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 1.5rem 4rem',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #f0f7ff 0%, #ffffff 50%, #f5f3ff 100%)',
      }}>
        {/* Decorative blobs */}
        <Blob style={{ width: 500, height: 500, background: 'rgba(24,95,165,0.07)', top: -100, right: -100 }} />
        <Blob style={{ width: 400, height: 400, background: 'rgba(83,74,183,0.06)', bottom: -80, left: -80, animationDelay: '3s' }} />
        <Blob style={{ width: 200, height: 200, background: 'rgba(59,109,17,0.05)', top: '40%', left: '20%', animationDelay: '5s' }} />

        {/* Dot grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(24,95,165,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <div className="fade-up-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(24,95,165,0.08)', border: '1px solid rgba(24,95,165,0.15)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#185FA5',
              animation: 'pulse 2s ease infinite',
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#185FA5' }}>
              AI-Powered Admissions Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-2" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
            fontWeight: 800,
            color: '#0a0f1e',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}>
            Your Journey to the{' '}
            <span style={{
              position: 'relative',
              display: 'inline-block',
              color: '#185FA5',
            }}>
              Right College
              {/* Shimmer underline */}
              <span style={{
                position: 'absolute',
                bottom: 2, left: 0, right: 0,
                height: 3, borderRadius: 100,
                background: 'linear-gradient(90deg, #185FA5, #534AB7, #185FA5)',
                backgroundSize: '200%',
                overflow: 'hidden',
              }}>
                <span style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  animation: 'shimmerLine 2.5s ease infinite',
                }} />
              </span>
            </span>{' '}
            Starts Here
          </h1>

          {/* Subheading */}
          <p className="fade-up-3" style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: '#4b5563',
            lineHeight: 1.75,
            maxWidth: 540,
            margin: '0 auto 36px',
            fontWeight: 300,
          }}>
            Discover hundreds of colleges, get AI-powered career guidance, and apply to multiple courses — all from one seamless platform.
          </p>

          {/* CTA buttons */}
          <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to="/signup" className="cta-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#185FA5', color: '#fff',
              padding: '13px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              border: '1px solid #185FA5',
            }}>
              Get started free
              <ArrowRight />
            </Link>
            <Link to="/colleges" className="sec-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#374151',
              padding: '13px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              border: '1px solid #e5e7eb',
            }}>
              Browse colleges
            </Link>
          </div>

          {/* Trust row */}
          <div className="fade-up-5" style={{
            display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {['Free to apply', 'AI recommendations', 'Track applications'].map(t => (
              <div key={t} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: '#6b7280',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#EAF3DE', color: '#27500A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckIcon />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section style={{
        background: '#0a0f1e',
        padding: '2.5rem 1.5rem',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '1rem', textAlign: 'center',
        }}>
          {[
            { num: '500+', label: 'Colleges listed' },
            { num: '10K+', label: 'Students enrolled' },
            { num: '98%', label: 'Satisfaction rate' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="stat-num" style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 800, color: '#fff',
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>{num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6, fontWeight: 300 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', background: '#fafafa' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Section label */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#185FA5', marginBottom: 12,
            }}>
              Why AdmissionHub
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 700, color: '#0a0f1e',
              letterSpacing: '-0.02em', margin: 0,
            }}>
              Everything you need to get admitted
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                icon: <SearchIcon />,
                iconBg: '#E6F1FB', iconColor: '#185FA5',
                title: 'Discover Colleges',
                body: 'Search and filter from hundreds of colleges and courses across India by location, domain, and fees.',
                accent: '#185FA5',
              },
              {
                icon: <AIIcon />,
                iconBg: '#EEEDFE', iconColor: '#534AB7',
                title: 'AI Career Guidance',
                body: 'Get personalised course recommendations powered by AI — based on your interests, skills, and career goals.',
                accent: '#534AB7',
              },
              {
                icon: <DocIcon />,
                iconBg: '#EAF3DE', iconColor: '#3B6D11',
                title: 'Easy Applications',
                body: 'Apply to multiple colleges, upload documents, confirm admissions, and track every status in one place.',
                accent: '#3B6D11',
              },
            ].map(({ icon, iconBg, iconColor, title, body, accent }) => (
              <div key={title} className="feature-card" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: '2rem 1.75rem',
                borderTop: `3px solid ${accent}`,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: iconBg, color: iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18, fontWeight: 700,
                  color: '#0a0f1e', marginBottom: 10, margin: '0 0 10px',
                }}>{title}</h3>
                <p style={{
                  fontSize: 14, color: '#6b7280', lineHeight: 1.7,
                  margin: 0, fontWeight: 300,
                }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED COLLEGES
      ══════════════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <div style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', marginBottom: '2.5rem',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
                textTransform: 'uppercase', color: '#185FA5', marginBottom: 8,
              }}>Top institutions</div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 700, color: '#0a0f1e',
                letterSpacing: '-0.02em', margin: 0,
              }}>Featured Colleges</h2>
            </div>
            <Link to="/colleges" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 500, color: '#185FA5', textDecoration: 'none',
            }}>
              View all <ArrowRight />
            </Link>
          </div>

          <div className="college-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {[
              { name: 'IIT Bombay', loc: 'Mumbai, Maharashtra', code: 'IIT', color: '#185FA5', bg: '#E6F1FB' },
              { name: 'AIIMS Delhi', loc: 'New Delhi', code: 'AII', color: '#3B6D11', bg: '#EAF3DE' },
              { name: 'IIM Ahmedabad', loc: 'Ahmedabad, Gujarat', code: 'IIM', color: '#534AB7', bg: '#EEEDFE' },
              { name: 'NIT Trichy', loc: 'Tiruchirappalli, Tamil Nadu', code: 'NIT', color: '#BA7517', bg: '#FAEEDA' },
              { name: 'Delhi University', loc: 'New Delhi', code: 'DU', color: '#A32D2D', bg: '#FCEBEB' },
              { name: 'BITS Pilani', loc: 'Pilani, Rajasthan', code: 'BIT', color: '#185FA5', bg: '#E6F1FB' },
            ].map(({ name, loc, code, color, bg }) => (
              <div key={name} className="college-card" style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: bg, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{code}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0a0f1e', marginBottom: 2 }}>{name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section 
        ref={setRef('how-it-works')}
        className={`animate-on-scroll ${visible['how-it-works'] ? 'visible' : ''}`}
        style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem', background: '#fff' }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#185FA5', marginBottom: 12,
            }}>
              Simple process
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700, color: '#0a0f1e',
              letterSpacing: '-0.02em', margin: 0,
            }}>
              How it Works
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { num: '01', title: 'Create Account', desc: 'Sign up in 30 seconds with your basic details' },
              { num: '02', title: 'Discover Colleges', desc: 'AI recommends best matches based on your profile' },
              { num: '03', title: 'Apply & Track', desc: 'One-click applications with real-time status' },
            ].map(({ num, title, desc }) => (
              <div key={num} className={`step-card ${visible['how-it-works'] ? 'visible' : ''}`} style={{
                textAlign: 'center', padding: '2rem 1.5rem',
              }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                  fontWeight: 800, color: '#e5e7eb',
                  marginBottom: 8, lineHeight: 1,
                }}>{num}</div>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 18, fontWeight: 600, color: '#0a0f1e',
                  marginBottom: 10,
                }}>{title}</h3>
                <p style={{
                  fontSize: 14, color: '#6b7280', lineHeight: 1.6,
                  margin: 0,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section 
        ref={setRef('testimonials')}
        className={`animate-on-scroll ${visible['testimonials'] ? 'visible' : ''}`}
        style={{ padding: 'clamp(3rem, 6vw, 6rem) 1.5rem', background: '#fafafa' }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: '#185FA5', marginBottom: 12,
            }}>
              Student Stories
            </div>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700, color: '#0a0f1e',
              letterSpacing: '-0.02em', margin: 0,
            }}>
              What Students Say
            </h2>
          </div>

          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { quote: 'Found my dream college within a week. The AI recommendations were spot on!', name: 'Arjun Sharma', role: 'Engineering Student', college: 'IIT Bombay' },
              { quote: 'Applied to 5 colleges from one platform. So much easier than applying separately.', name: 'Priya Patel', role: 'Medical Student', college: 'AIIMS Delhi' },
              { quote: 'Tracking application status in real-time gave me peace of mind during admissions.', name: 'Rahul Verma', role: 'Commerce Student', college: 'Delhi University' },
            ].map(({ quote, name, role, college }) => (
              <div key={name} style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 16, padding: '1.75rem',
              }}>
                <p style={{
                  fontSize: 14, color: '#4b5563', lineHeight: 1.7,
                  marginBottom: '1.5rem', fontWeight: 300,
                }}>"{quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#E6F1FB', color: '#185FA5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UserIcon />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0a0f1e' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{role}, {college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════ */}
      <section style={{
        margin: '0 1.5rem 4rem',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2744 100%)',
        padding: 'clamp(3rem, 6vw, 5rem) 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: 960,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.04)', top: -80, right: -80,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)', bottom: -60, left: -60,
        }} />
        <div style={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          background: 'rgba(24,95,165,0.15)', top: '20%', left: '10%',
          filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-block',
            fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            marginBottom: 16,
          }}>
            Start today — it's free
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800, color: '#fff',
            letterSpacing: '-0.02em',
            margin: '0 0 16px',
          }}>
            Ready to find your perfect college?
          </h2>
          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px',
            fontWeight: 300,
          }}>
            Join thousands of students who found their dream college through AdmissionHub.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="cta-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#185FA5', color: '#fff',
              padding: '13px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              border: '1px solid #185FA5',
            }}>
              Create free account
              <ArrowRight />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              padding: '13px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'background 0.2s ease',
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;