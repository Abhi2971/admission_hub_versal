import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentSignup } from '../../services/auth';
import Alert from '../common/Alert';

/* ─── Shared design tokens (same as Login) ────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100vh',
    background: '#f4f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  wrap: { width: '100%', maxWidth: 420 },
  brand: { textAlign: 'center', marginBottom: '1.5rem' },
  brandIcon: {
    width: 48, height: 48, borderRadius: 14,
    background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
    fontSize: 22, color: '#E6F1FB', fontWeight: 700,
  },
  brandTitle: { fontSize: 20, fontWeight: 500, color: '#111', margin: 0 },
  brandSub:   { fontSize: 13, color: '#6b7280', marginTop: 4 },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '1.75rem',
    marginBottom: 12,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fieldGroup: { marginBottom: 14 },
  label: {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: '#374151', marginBottom: 6,
  },
  required: { color: '#A32D2D', marginLeft: 3 },
  input: {
    width: '100%', padding: '9px 11px', fontSize: 13,
    border: '1px solid #d1d5db', borderRadius: 8,
    background: '#fff', color: '#111', outline: 'none',
    boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  },
  hint: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  strengthBar: { height: 4, borderRadius: 100, background: '#e5e7eb', marginTop: 6, overflow: 'hidden' },
  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '16px 0' },
  btnSubmit: (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '10px 16px',
    fontSize: 13, fontWeight: 500, borderRadius: 8,
    border: '1px solid #185FA5',
    background: disabled ? '#93c5fd' : '#185FA5',
    color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
  }),
  footer: { textAlign: 'center' },
  footerText: { fontSize: 13, color: '#6b7280' },
  footerLink: { fontSize: 13, color: '#185FA5', textDecoration: 'none', fontWeight: 500 },
};

/* ─── Password strength ───────────────────────────────────────────────────── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',         color: '#e5e7eb' },
    { label: 'Weak',     color: '#A32D2D' },
    { label: 'Fair',     color: '#BA7517' },
    { label: 'Good',     color: '#185FA5' },
    { label: 'Strong',   color: '#3B6D11' },
  ];
  return { score, ...map[score] };
};

/* ─── Focus-aware input ───────────────────────────────────────────────────── */
const Field = ({ id, label, type = 'text', value, onChange, required, placeholder, hint, pattern }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>
        {label}{required && <span style={S.required}>*</span>}
      </label>
      <input
        id={id} name={id} type={type} value={value}
        onChange={onChange} required={required}
        placeholder={placeholder} pattern={pattern}
        style={{ ...S.input, borderColor: focused ? '#185FA5' : '#d1d5db' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <div style={S.hint}>{hint}</div>}
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    setLoading(true);
    try {
      await studentSignup(formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const strength  = getStrength(formData.password);
  const isDisabled = loading || !formData.name.trim() || !formData.email.trim()
    || !formData.mobile.trim() || !formData.password.trim() || !formData.confirmPassword.trim();
  const passwordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Brand ── */}
        <div style={S.brand}>
          <div style={S.brandIcon}>A</div>
          <h1 style={S.brandTitle}>Create your account</h1>
          <p style={S.brandSub}>Join the Admission Platform as a student</p>
        </div>

        {/* ── Card ── */}
        <div style={S.card}>
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <Field id="name" label="Full name" value={formData.name}
              onChange={handleChange} required placeholder="Rahul Sharma" />

            {/* Email + Mobile in two columns */}
            <div style={S.twoCol}>
              <Field id="email" label="Email" type="email" value={formData.email}
                onChange={handleChange} required placeholder="you@example.com" />
              <Field id="mobile" label="Mobile" type="tel" value={formData.mobile}
                onChange={handleChange} required placeholder="9876543210"
                pattern="[0-9]{10}" hint="10-digit number" />
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <label htmlFor="password" style={S.label}>
                Password<span style={S.required}>*</span>
              </label>
              <input
                id="password" name="password" type="password"
                value={formData.password} onChange={handleChange}
                required placeholder="Min. 8 characters"
                style={{
                  ...S.input,
                  borderColor: formData.password
                    ? (strength.score >= 3 ? '#3B6D11' : '#d1d5db')
                    : '#d1d5db',
                }}
              />
              {/* Strength bar */}
              {formData.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={S.strengthBar}>
                    <div style={{
                      height: '100%', borderRadius: 100,
                      width: `${(strength.score / 4) * 100}%`,
                      background: strength.color,
                      transition: 'width 0.3s, background 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: strength.color, marginTop: 3, fontWeight: 500 }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={S.fieldGroup}>
              <label htmlFor="confirmPassword" style={S.label}>
                Confirm password<span style={S.required}>*</span>
              </label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={formData.confirmPassword} onChange={handleChange}
                required placeholder="Re-enter your password"
                style={{
                  ...S.input,
                  borderColor: passwordMismatch ? '#A32D2D' : '#d1d5db',
                }}
              />
              {passwordMismatch && (
                <div style={{ ...S.hint, color: '#A32D2D' }}>Passwords do not match</div>
              )}
            </div>

            <hr style={S.divider} />

            <button type="submit" disabled={isDisabled} style={S.btnSubmit(isDisabled)}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>
        </div>

        {/* ── Login link ── */}
        <div style={S.footer}>
          <span style={S.footerText}>Already have an account? </span>
          <Link to="/login" style={S.footerLink}>Sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;