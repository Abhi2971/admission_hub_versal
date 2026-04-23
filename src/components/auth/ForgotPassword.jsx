import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPasswordRequest, resetPasswordConfirm } from '../../services/auth';
import Alert from '../common/Alert';

const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    background: '#f4f5f7',
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

  /* Step indicator */
  stepRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 20,
  },
  stepDot: (active, done) => ({
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 500,
    background: done ? '#EAF3DE' : active ? '#185FA5' : '#f3f4f6',
    color:      done ? '#27500A' : active ? '#fff'    : '#9ca3af',
    border:     active ? '1px solid #185FA5' : '1px solid transparent',
  }),
  stepLine: { flex: 1, height: 1, background: '#e5e7eb', maxWidth: 40 },
  stepLabel: (active) => ({
    fontSize: 11, color: active ? '#185FA5' : '#9ca3af',
    fontWeight: active ? 500 : 400,
  }),

  fieldGroup: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: {
    width: '100%', padding: '9px 11px', fontSize: 13,
    border: '1px solid #d1d5db', borderRadius: 8,
    background: '#fff', color: '#111', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  },
  hint: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '16px 0' },
  btnSubmit: (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '10px 16px', fontSize: 13, fontWeight: 500,
    borderRadius: 8, border: '1px solid #185FA5',
    background: disabled ? '#93c5fd' : '#185FA5',
    color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  }),
  footer: { textAlign: 'center' },
  footerLink: { fontSize: 13, color: '#185FA5', textDecoration: 'none', fontWeight: 500 },
  successBox: {
    background: '#EAF3DE', border: '1px solid #c3dfa0',
    borderRadius: 10, padding: '1rem 1.25rem',
    fontSize: 13, color: '#27500A', lineHeight: 1.6,
    textAlign: 'center', marginBottom: 16,
  },
};

const Field = ({ id, label, type = 'text', value, onChange, required, placeholder, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>{label}</label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        style={{ ...S.input, borderColor: focused ? '#185FA5' : '#d1d5db' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <div style={S.hint}>{hint}</div>}
    </div>
  );
};

const ForgotPassword = () => {
  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [message,         setMessage]         = useState('');
  const [loading,         setLoading]         = useState(false);
  const [done,            setDone]            = useState(false);

  const passwordMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPasswordRequest(email);
      setMessage(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPasswordConfirm({ email, otp, new_password: newPassword });
      setDone(true);
      setTimeout(() => window.location.href = '/login', 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Brand ── */}
        <div style={S.brand}>
          <div style={S.brandIcon}>A</div>
          <h1 style={S.brandTitle}>Reset your password</h1>
          <p style={S.brandSub}>Follow the steps to regain access</p>
        </div>

        <div style={S.card}>
          {/* ── Step indicator ── */}
          <div style={S.stepRow}>
            {[
              { n: 1, label: 'Email' },
              { n: 2, label: 'OTP' },
            ].map(({ n, label }, i, arr) => (
              <React.Fragment key={n}>
                <div style={{ textAlign: 'center' }}>
                  <div style={S.stepDot(step === n, step > n)}>
                    {step > n ? '✓' : n}
                  </div>
                  <div style={{ ...S.stepLabel(step === n), marginTop: 3 }}>{label}</div>
                </div>
                {i < arr.length - 1 && <div style={S.stepLine} />}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div style={{ marginBottom: 14 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {/* ── Success state ── */}
          {done ? (
            <div>
              <div style={S.successBox}>
                ✓ Password reset successfully. Redirecting to sign in…
              </div>
              <Link to="/login" style={{
                display: 'block', textAlign: 'center',
                fontSize: 13, color: '#185FA5', textDecoration: 'none', fontWeight: 500,
              }}>
                Sign in now →
              </Link>
            </div>
          ) : step === 1 ? (
            /* ── Step 1: Email ── */
            <form onSubmit={handleRequest}>
              <Field
                id="email" label="Email address" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com"
                hint="We'll send a 6-digit OTP to this address"
              />
              <hr style={S.divider} />
              <button type="submit" disabled={loading || !email.trim()} style={S.btnSubmit(loading || !email.trim())}>
                {loading ? 'Sending OTP…' : 'Send OTP →'}
              </button>
            </form>
          ) : (
            /* ── Step 2: OTP + new password ── */
            <form onSubmit={handleReset}>
              {message && (
                <div style={{ ...S.successBox, marginBottom: 14 }}>{message}</div>
              )}
              <Field
                id="otp" label="OTP code" value={otp}
                onChange={e => setOtp(e.target.value)}
                required placeholder="Enter 6-digit OTP"
                hint={`Check your inbox at ${email}`}
              />
              <Field
                id="newPassword" label="New password" type="password"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                required placeholder="Min. 8 characters"
              />
              <div style={S.fieldGroup}>
                <label htmlFor="confirmPassword" style={S.label}>Confirm new password</label>
                <input
                  id="confirmPassword" type="password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required placeholder="Re-enter new password"
                  style={{ ...S.input, borderColor: passwordMismatch ? '#A32D2D' : '#d1d5db' }}
                />
                {passwordMismatch && (
                  <div style={{ ...S.hint, color: '#A32D2D' }}>Passwords do not match</div>
                )}
              </div>
              <hr style={S.divider} />
              <button
                type="submit"
                disabled={loading || !otp.trim() || !newPassword.trim() || !!passwordMismatch}
                style={S.btnSubmit(loading || !otp.trim() || !newPassword.trim() || !!passwordMismatch)}
              >
                {loading ? 'Resetting…' : 'Reset password →'}
              </button>
            </form>
          )}
        </div>

        <div style={S.footer}>
          <Link to="/login" style={S.footerLink}>← Back to sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;