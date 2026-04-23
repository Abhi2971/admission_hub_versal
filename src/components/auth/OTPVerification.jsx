import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyOtp } from '../../services/auth';
import Alert from '../common/Alert';

const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh', background: '#f4f5f7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
  },
  wrap: { width: '100%', maxWidth: 400 },
  brand: { textAlign: 'center', marginBottom: '1.5rem' },
  brandIcon: {
    width: 48, height: 48, borderRadius: 14, background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px', fontSize: 22, color: '#E6F1FB', fontWeight: 700,
  },
  brandTitle: { fontSize: 20, fontWeight: 500, color: '#111', margin: 0 },
  brandSub:   { fontSize: 13, color: '#6b7280', marginTop: 4 },
  card: {
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 14, padding: '1.75rem', marginBottom: 12,
  },
  emailBadge: {
    display: 'block', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 500,
    padding: '4px 12px', borderRadius: 100,
    background: '#E6F1FB', color: '#0C447C',
    margin: '0 auto 20px', textAlign: 'center',
  },

  /* OTP boxes */
  otpRow: {
    display: 'flex', gap: 8, justifyContent: 'center',
    marginBottom: 20,
  },
  otpBox: (focused, filled) => ({
    width: 44, height: 52,
    textAlign: 'center',
    fontSize: 20, fontWeight: 500,
    border: `1px solid ${focused ? '#185FA5' : filled ? '#3B6D11' : '#d1d5db'}`,
    borderRadius: 8,
    outline: 'none',
    background: filled ? '#EAF3DE' : '#fff',
    color: filled ? '#27500A' : '#111',
    fontFamily: "'DM Mono', monospace",
    transition: 'border-color 0.15s, background 0.15s',
    caretColor: '#185FA5',
  }),

  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '16px 0' },
  btnSubmit: (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 500,
    borderRadius: 8, border: '1px solid #185FA5',
    background: disabled ? '#93c5fd' : '#185FA5',
    color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  }),
  resendRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 14, fontSize: 13,
  },
  resendLabel: { color: '#9ca3af' },
  resendBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#185FA5', fontWeight: 500, padding: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  footer: { textAlign: 'center' },
  footerLink: { fontSize: 13, color: '#185FA5', textDecoration: 'none', fontWeight: 500 },
};

const OTPVerification = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [digits,  setDigits]  = useState(Array(6).fill(''));
  const [focused, setFocused] = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [email,   setEmail]   = useState('');
  const [resent,  setResent]  = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      inputRefs.current[0]?.focus();
    } else {
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleDigitChange = (i, val) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const otp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
      setDigits(Array(6).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResent(true);
    setDigits(Array(6).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Brand ── */}
        <div style={S.brand}>
          <div style={S.brandIcon}>A</div>
          <h1 style={S.brandTitle}>Verify your email</h1>
          <p style={S.brandSub}>Enter the 6-digit code we sent you</p>
        </div>

        <div style={S.card}>
          {/* Email badge */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={S.emailBadge}>{email}</span>
          </div>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}
          {resent && (
            <div style={{ marginBottom: 14 }}>
              <Alert type="success" message="OTP resent to your email" onClose={() => setResent(false)} autoClose={3000} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Custom OTP boxes */}
            <div style={S.otpRow} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onFocus={() => setFocused(i)}
                  onBlur={() => setFocused(null)}
                  style={S.otpBox(focused === i, !!d)}
                />
              ))}
            </div>

            <hr style={S.divider} />

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              style={S.btnSubmit(loading || otp.length < 6)}
            >
              {loading ? 'Verifying…' : 'Verify email →'}
            </button>
          </form>

          <div style={S.resendRow}>
            <span style={S.resendLabel}>Didn't receive the code?</span>
            <button style={S.resendBtn} onClick={handleResend} type="button">
              Resend OTP
            </button>
          </div>
        </div>

        <div style={S.footer}>
          <Link to="/signup" style={S.footerLink}>← Back to sign up</Link>
        </div>

      </div>
    </div>
  );
};

export default OTPVerification;