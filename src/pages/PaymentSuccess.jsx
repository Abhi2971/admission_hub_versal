import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../services/payment';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes scaleIn {
    0%   { opacity: 0; transform: scale(0.6); }
    70%  { transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ripple {
    0%   { transform: scale(1);   opacity: 0.35; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes driftA {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(16px, -12px); }
  }
  @keyframes driftB {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(-12px, 10px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .ps-icon    { animation: scaleIn 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .ps-title   { animation: fadeUp  0.5s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
  .ps-body    { animation: fadeUp  0.5s cubic-bezier(0.22,1,0.36,1) 0.48s both; }
  .ps-meta    { animation: fadeUp  0.5s cubic-bezier(0.22,1,0.36,1) 0.58s both; }
  .ps-actions { animation: fadeUp  0.5s cubic-bezier(0.22,1,0.36,1) 0.68s both; }

  .ps-ripple {
    position: absolute; inset: 0; border-radius: 50%;
    animation: ripple 1.8s ease-out infinite;
  }
  .ps-blob-a { animation: driftA 9s ease-in-out infinite; }
  .ps-blob-b { animation: driftB 7s ease-in-out infinite; animation-delay: 2s; }

  .ps-primary-btn {
    transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, background 0.2s ease;
  }
  .ps-primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(24,95,165,0.30);
    background: #0C447C !important;
  }
  .ps-ghost-btn {
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .ps-ghost-btn:hover {
    background: #f0f7ff !important;
    border-color: #185FA5 !important;
    color: #0C447C !important;
  }
  .ps-spinner {
    width: 48px; height: 48px;
    border: 3px solid #E6F1FB;
    border-top-color: #185FA5;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
    margin: 0 auto;
  }
`;

const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1.5rem',
    position: 'relative', overflow: 'hidden',
  },
  pageBg: (isSuccess) => ({
    background: isSuccess
      ? 'linear-gradient(160deg, #f0fff4 0%, #ffffff 55%, #f0f7ff 100%)'
      : 'linear-gradient(160deg, #fff5f5 0%, #ffffff 55%, #fff5f5 100%)',
  }),
  blob: (extra) => ({
    position: 'absolute',
    borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
    filter: 'blur(64px)',
    pointerEvents: 'none',
    ...extra,
  }),
  dotGrid: (isSuccess) => ({
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `radial-gradient(circle, ${isSuccess ? 'rgba(59,109,17,0.07)' : 'rgba(163,45,45,0.07)'} 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
  }),
  card: {
    position: 'relative',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 'clamp(2rem, 5vw, 3rem)',
    maxWidth: 440, width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  iconWrap: (isSuccess) => ({
    position: 'relative',
    width: 88, height: 88,
    borderRadius: '50%',
    background: isSuccess ? '#EAF3DE' : '#FCEBEB',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
  }),
  rippleBg: (isSuccess) => ({
    background: isSuccess ? 'rgba(59,109,17,0.15)' : 'rgba(163,45,45,0.15)',
  }),
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
    fontWeight: 800, color: '#0a0f1e',
    letterSpacing: '-0.02em', margin: '0 0 10px',
  },
  subtitle: {
    fontSize: 14, color: '#6b7280',
    lineHeight: 1.75, margin: '0 0 24px',
    fontWeight: 300,
  },
  metaBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1rem 1.25rem',
    marginBottom: 24,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  metaRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  metaLabel: { fontSize: 12, color: '#9ca3af' },
  metaValue: { fontSize: 12, fontWeight: 500, color: '#374151', fontFamily: "'DM Mono', monospace" },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: 0 },
  btnRow: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  primaryBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#185FA5', color: '#fff',
    padding: '11px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    border: '1px solid #185FA5',
  },
  ghostBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#fff', color: '#374151',
    padding: '11px 20px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    border: '1px solid #e5e7eb',
  },
  errorBox: {
    background: '#FCEBEB',
    border: '1px solid #f7c1c1',
    borderRadius: 10,
    padding: '0.875rem 1rem',
    fontSize: 13, color: '#A32D2D',
    lineHeight: 1.6, marginBottom: 20,
    textAlign: 'left',
  },

  /* Verifying state */
  verifyingWrap: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 16, background: '#f4f5f7',
  },
  verifyingText: {
    fontSize: 14, color: '#6b7280', fontWeight: 400,
  },
};

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);
const FailIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId   = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  const [verifying, setVerifying] = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  const verifyPaymentOnServer = useCallback(async () => {
    try {
      await verifyPayment({ order_id: orderId, payment_id: paymentId });
      setSuccess(true);
    } catch {
      setError('Payment verification failed. Please contact support.');
    } finally {
      setVerifying(false);
    }
  }, [orderId, paymentId]);

  useEffect(() => {
    if (orderId && paymentId) {
      verifyPaymentOnServer();
    } else {
      setError('Invalid payment parameters. Please contact support.');
      setVerifying(false);
    }
  }, [orderId, paymentId, verifyPaymentOnServer]);

  /* ── Verifying state ── */
  if (verifying) {
    return (
      <div style={S.verifyingWrap}>
        <style>{PAGE_STYLES}</style>
        <div className="ps-spinner" />
        <p style={S.verifyingText}>Verifying your payment…</p>
      </div>
    );
  }

  const isSuccess = success && !error;

  return (
    <div style={{ ...S.page, ...S.pageBg(isSuccess) }}>
      <style>{PAGE_STYLES}</style>

      {/* Blobs */}
      <div className="ps-blob-a" style={S.blob({
        width: 380, height: 380,
        background: isSuccess ? 'rgba(59,109,17,0.06)' : 'rgba(163,45,45,0.05)',
        top: -80, right: -80,
      })} />
      <div className="ps-blob-b" style={S.blob({
        width: 280, height: 280,
        background: isSuccess ? 'rgba(24,95,165,0.06)' : 'rgba(163,45,45,0.04)',
        bottom: -60, left: -60,
        borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
      })} />

      {/* Dot grid */}
      <div style={S.dotGrid(isSuccess)} />

      {/* Card */}
      <div style={S.card}>

        {/* Icon */}
        <div className="ps-icon" style={S.iconWrap(isSuccess)}>
          <div className="ps-ripple" style={S.rippleBg(isSuccess)} />
          {isSuccess ? <CheckIcon /> : <FailIcon />}
        </div>

        {/* Title */}
        <h1 className="ps-title" style={S.title}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>

        {/* Subtitle */}
        <p className="ps-body" style={S.subtitle}>
          {isSuccess
            ? 'Your admission has been confirmed. You can view all details in your applications dashboard.'
            : 'Something went wrong while processing your payment.'}
        </p>

        {/* Error box */}
        {!isSuccess && error && (
          <div className="ps-body" style={S.errorBox}>
            {error}
          </div>
        )}

        {/* Meta info (success only) */}
        {isSuccess && (
          <div className="ps-meta" style={S.metaBox}>
            <div style={S.metaRow}>
              <span style={S.metaLabel}>Order ID</span>
              <span style={S.metaValue}>{orderId}</span>
            </div>
            <div style={S.divider} />
            <div style={S.metaRow}>
              <span style={S.metaLabel}>Payment ID</span>
              <span style={S.metaValue}>{paymentId}</span>
            </div>
            <div style={S.divider} />
            <div style={S.metaRow}>
              <span style={S.metaLabel}>Status</span>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '3px 10px',
                borderRadius: 100, background: '#EAF3DE', color: '#27500A',
              }}>
                Confirmed
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ps-actions" style={S.btnRow}>
          {isSuccess ? (
            <>
              <Link to="/student/applications" className="ps-primary-btn" style={S.primaryBtn}>
                View my applications <ArrowRight />
              </Link>
              <Link to="/student" className="ps-ghost-btn" style={S.ghostBtn}>
                Back to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/student/applications" className="ps-primary-btn" style={S.primaryBtn}>
                View applications <ArrowRight />
              </Link>
              <Link to="/student" className="ps-ghost-btn" style={S.ghostBtn}>
                Back to dashboard
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;