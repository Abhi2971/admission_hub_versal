import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from '../../context/AccessContext';
import Alert from '../common/Alert';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
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
  wrap: {
    width: '100%',
    maxWidth: 400,
  },

  /* Brand */
  brand: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  brandIcon: {
    width: 48, height: 48,
    borderRadius: 14,
    background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
    fontSize: 22, color: '#E6F1FB', fontWeight: 700,
  },
  brandTitle: { fontSize: 20, fontWeight: 500, color: '#111', margin: 0 },
  brandSub:   { fontSize: 13, color: '#6b7280', marginTop: 4 },

  /* Card */
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '1.75rem',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 500, color: '#111',
    marginBottom: 20, textAlign: 'center',
  },

  /* Fields */
  fieldGroup: { marginBottom: 14 },
  label: {
    display: 'block',
    fontSize: 12, fontWeight: 500,
    color: '#374151', marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '9px 11px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    color: '#111',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  },

  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '18px 0' },

  /* Submit */
  btnSubmit: (disabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px 16px',
    fontSize: 13, fontWeight: 500,
    borderRadius: 8,
    border: '1px solid #185FA5',
    background: disabled ? '#93c5fd' : '#185FA5',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  }),

  /* Footer links */
  footer: { textAlign: 'center' },
  footerText: { fontSize: 13, color: '#6b7280' },
  footerLink: { fontSize: 13, color: '#185FA5', textDecoration: 'none', fontWeight: 500 },
  forgotLink: {
    display: 'block',
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    textDecoration: 'none',
    marginTop: 14,
  },
};

/* ─── Focus-aware input ───────────────────────────────────────────────────── */
const Field = ({ id, label, type = 'text', value, onChange, required, placeholder, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={S.fieldGroup}>
      <label htmlFor={id} style={S.label}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ ...S.input, borderColor: focused ? '#185FA5' : '#d1d5db' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const { refreshAccess } = useAccess();
  const navigate   = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData);
    setLoading(false);
    if (result.success) {
      await refreshAccess();
      const role = result.user?.role;
      if      (role === 'student')          navigate('/student');
      else if (role === 'college_admin')   navigate('/admin');
      else if (role === 'course_admin')   navigate('/course-admin');
      else if (role === 'university_admin') navigate('/university-admin');
      else if (role === 'super_admin')    navigate('/superadmin');
      else if (role === 'global_support' || role === 'local_support') {
        navigate('/admin'); // Support users go to admin dashboard
      }
      else                                 navigate('/');
    } else {
      setError(result.error);
    }
  };

  const isDisabled = loading || !formData.email.trim() || !formData.password.trim();

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Brand ── */}
        <div style={S.brand}>
          <div style={S.brandIcon}>A</div>
          <h1 style={S.brandTitle}>Admission Platform</h1>
          <p style={S.brandSub}>Sign in to continue to your dashboard</p>
        </div>

        {/* ── Card ── */}
        <div style={S.card}>
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field
              id="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <Link to="/forgot-password" style={S.forgotLink}>
              Forgot password?
            </Link>

            <hr style={S.divider} />

            <button type="submit" disabled={isDisabled} style={S.btnSubmit(isDisabled)}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        {/* ── Sign up link ── */}
        <div style={S.footer}>
          <span style={S.footerText}>Don't have an account? </span>
          <Link to="/signup" style={S.footerLink}>Create one</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;