import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes float404 {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
  @keyframes driftA {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(18px, -14px); }
  }
  @keyframes driftB {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(-14px, 12px); }
  }
  .nf-num  { animation: float404 4s ease-in-out infinite; }
  .nf-blob-a { animation: driftA 9s ease-in-out infinite; }
  .nf-blob-b { animation: driftB 7s ease-in-out infinite; animation-delay: 2s; }

  .nf-primary-btn {
    transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, background 0.2s ease;
  }
  .nf-primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(24,95,165,0.3);
    background: #0C447C !important;
  }
  .nf-ghost-btn {
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  .nf-ghost-btn:hover {
    background: #f0f7ff !important;
    color: #0C447C !important;
    border-color: #185FA5 !important;
  }
  .nf-pill-link {
    transition: background 0.15s ease;
  }
  .nf-pill-link:hover {
    background: #B5D4F4 !important;
  }
`;

const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #f0f7ff 0%, #ffffff 55%, #f5f3ff 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1.5rem',
    position: 'relative', overflow: 'hidden',
  },
  blob: (extra) => ({
    position: 'absolute',
    borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
    filter: 'blur(64px)',
    pointerEvents: 'none',
    ...extra,
  }),
  dotGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(circle, rgba(24,95,165,0.08) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
  },
  content: { position: 'relative', textAlign: 'center', maxWidth: 480 },
  num: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(7rem, 20vw, 11rem)',
    fontWeight: 800,
    letterSpacing: '-0.05em',
    lineHeight: 1,
    marginBottom: 8,
    background: 'linear-gradient(135deg, #185FA5 0%, #534AB7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    userSelect: 'none',
  },
  divider: {
    width: 48, height: 3, borderRadius: 100,
    background: 'linear-gradient(90deg, #185FA5, #534AB7)',
    margin: '0 auto 24px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
    fontWeight: 700, color: '#0a0f1e',
    letterSpacing: '-0.02em', margin: '0 0 12px',
  },
  subtitle: {
    fontSize: 15, color: '#6b7280',
    lineHeight: 1.75, margin: '0 0 36px',
    fontWeight: 300,
  },
  btnRow: {
    display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#185FA5', color: '#fff',
    padding: '11px 24px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    border: '1px solid #185FA5',
  },
  ghostBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#fff', color: '#374151',
    padding: '11px 24px', borderRadius: 10,
    fontSize: 14, fontWeight: 500,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  quickRow: {
    marginTop: 36,
    display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center',
  },
  quickLabel: { fontSize: 13, color: '#9ca3af' },
  pillLink: {
    fontSize: 13, fontWeight: 500,
    color: '#185FA5', textDecoration: 'none',
    padding: '3px 10px', borderRadius: 100,
    background: '#E6F1FB',
  },
};

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
  </svg>
);
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={S.page}>
      <style>{PAGE_STYLES}</style>

      {/* Blobs */}
      <div className="nf-blob-a" style={S.blob({ width: 420, height: 420, background: 'rgba(24,95,165,0.07)', top: -100, right: -80 })} />
      <div className="nf-blob-b" style={S.blob({ width: 320, height: 320, background: 'rgba(83,74,183,0.06)', bottom: -80, left: -80, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%' })} />

      {/* Dot grid */}
      <div style={S.dotGrid} />

      {/* Main content */}
      <div style={S.content}>

        {/* 404 */}
        <div className="nf-num" style={S.num}>404</div>

        {/* Accent line */}
        <div style={S.divider} />

        <h1 style={S.title}>Page not found</h1>

        <p style={S.subtitle}>
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        {/* Buttons */}
        <div style={S.btnRow}>
          <Link to="/" className="nf-primary-btn" style={S.primaryBtn}>
            <HomeIcon /> Go home
          </Link>
          <button onClick={() => navigate(-1)} className="nf-ghost-btn" style={S.ghostBtn}>
            <BackIcon /> Go back
          </button>
        </div>

        {/* Quick links */}
        <div style={S.quickRow}>
          <span style={S.quickLabel}>Or try:</span>
          {[
            { to: '/courses',  label: 'Courses'  },
            { to: '/colleges', label: 'Colleges' },
            { to: '/login',    label: 'Sign in'  },
          ].map(({ to, label }) => (
            <Link key={to} to={to} className="nf-pill-link" style={S.pillLink}>
              {label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default NotFound;