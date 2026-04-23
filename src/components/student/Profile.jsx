import React, { useState, useEffect, useCallback } from 'react';
import { getStudentProfile, updateStudentProfile } from '../../services/student';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    minHeight: '100vh',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  title: { fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  sub:   { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 16,
    alignItems: 'start',
  },
  card: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 16,
  },

  /* Avatar block */
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 18,
    borderBottom: '1px solid #f1f5f9',
    marginBottom: 18,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(14,165,233,0.4)',
  },
  avatarName: { fontSize: 18, fontWeight: 600, color: '#1e293b', textAlign: 'center' },
  avatarEmail:{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 4 },

  /* Read-only info rows */
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  infoLabel: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },
  infoValue: { fontSize: 14, color: '#334155', fontWeight: 600 },

  /* Form */
  fieldGroup: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    border: '2px solid #e2e8f0',
    borderRadius: 10,
    background: '#ffffff',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  inputFocus: { borderColor: '#0ea5e9', boxShadow: '0 0 0 4px rgba(14,165,233,0.1)' },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '20px 0',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  /* Completeness bar */
  completenessWrap: { marginTop: 18 },
  completenessLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 500,
  },
  progressBar: {
    height: 8,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
    overflow: 'hidden',
  },
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const FIELDS = {
  personal: [
    { name: 'name',           label: 'Full Name',        required: true,  placeholder: 'Rahul Sharma' },
    { name: 'mobile',         label: 'Mobile',           required: false, placeholder: '9876500001' },
    { name: 'date_of_birth',  label: 'Date of Birth',    required: false, placeholder: 'DD/MM/YYYY' },
    { name: 'gender',         label: 'Gender',           required: false, placeholder: 'Male/Female/Other' },
    { name: 'father_name',    label: "Father's Name",    required: false, placeholder: "Father's name" },
    { name: 'mother_name',    label: "Mother's Name",    required: false, placeholder: "Mother's name" },
  ],
  education: [
    { name: 'qualification',      label: 'Qualification',      required: false, placeholder: '12th Pass - Science (PCM/PCB)' },
    { name: 'preferred_course',   label: 'Preferred Course',  required: false, placeholder: 'B.Tech Computer Science' },
    { name: 'year_of_passing',    label: 'Year of Passing',   required: false, placeholder: 'e.g. 2024' },
  ],
  address: [
    { name: 'address',      label: 'Address',      required: false, placeholder: 'Enter your address' },
    { name: 'city',         label: 'City',         required: false, placeholder: 'Pune' },
    { name: 'state',        label: 'State',        required: false, placeholder: 'Maharashtra' },
    { name: 'pincode',      label: 'Pincode',      required: false, placeholder: '411001' },
    { name: 'location',     label: 'Location',     required: false, placeholder: 'Pune' },
  ],
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

const calcCompleteness = (data) => {
  const keys = [
    'name', 'mobile', 'date_of_birth', 'gender', 'father_name', 'mother_name',
    'qualification', 'preferred_course', 'year_of_passing',
    'address', 'city', 'state', 'pincode', 'location'
  ];
  const filled = keys.filter(k => data[k] && String(data[k]).trim() !== '').length;
  return Math.round((filled / keys.length) * 100);
};

/* ─── Focus-aware input ───────────────────────────────────────────────────── */
const Field = ({ field, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const isDateField = field.name === 'date_of_birth';
  const inputType = isDateField ? 'date' : 'text';
  
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>
        {field.label}
        {field.required && <span style={{ color: '#A32D2D', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={inputType}
        name={field.name}
        value={value}
        onChange={onChange}
        required={field.required}
        placeholder={isDateField ? '' : field.placeholder}
        style={{ ...S.input, ...(focused ? S.inputFocus : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const StudentProfile = () => {
  const [profile,  setProfile]  = useState(null);
  const [formData, setFormData] = useState({
    name: '', mobile: '', date_of_birth: '', gender: '', father_name: '', mother_name: '',
    qualification: '', preferred_course: '', year_of_passing: '',
    address: '', city: '', state: '', pincode: '', location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getStudentProfile();
      setProfile(response.data);
      setFormData({
        name:             response.data.name             || '',
        mobile:           response.data.mobile           || '',
        date_of_birth:    response.data.date_of_birth    || '',
        gender:           response.data.gender           || '',
        father_name:      response.data.father_name      || '',
        mother_name:      response.data.mother_name      || '',
        qualification:    response.data.qualification    || '',
        preferred_course: response.data.preferred_course || '',
        year_of_passing:  response.data.year_of_passing  || '',
        address:          response.data.address          || '',
        city:             response.data.city             || '',
        state:            response.data.state            || '',
        pincode:          response.data.pincode          || '',
        location:         response.data.location         || '',
      });
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateStudentProfile(formData);
      setSuccess('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  const completeness = calcCompleteness(formData);
  const completenessColor =
    completeness === 100 ? '#3B6D11' : completeness >= 60 ? '#BA7517' : '#A32D2D';

  return (
    <div style={S.page}>
      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

      {/* ── Top bar ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.title}>Edit Profile</h1>
          <p style={S.sub}>Keep your details up to date for better recommendations</p>
        </div>
      </div>

      <div style={S.layout}>
        {/* ── Left: summary card ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Your account</div>

          <div style={S.avatarWrap}>
            <div style={S.avatar}>{getInitials(formData.name)}</div>
            <div style={S.avatarName}>{formData.name || 'Student'}</div>
            <div style={S.avatarEmail}>{profile?.email || ''}</div>
          </div>

          {[
            ['Mobile',         formData.mobile        || 'Not provided'],
            ['Role',           'Student'],
            ['Member since',   profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : '—'],
          ].map(([lbl, val], i, arr) => (
            <div key={lbl} style={{ ...S.infoRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
              <span style={S.infoLabel}>{lbl}</span>
              <span style={S.infoValue}>{val}</span>
            </div>
          ))}

          {/* Profile completeness */}
          <div style={S.completenessWrap}>
            <div style={S.completenessLabel}>
              <span>Profile completeness</span>
              <span style={{ fontWeight: 500, color: completenessColor }}>{completeness}%</span>
            </div>
            <div style={S.progressBar}>
              <div style={{
                height: '100%', borderRadius: 100,
                background: completenessColor,
                width: `${completeness}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </div>

        {/* ── Right: edit form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Personal Information */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Personal Information</div>
            <form onSubmit={handleSubmit}>
              <div style={S.twoCol}>
                <Field field={FIELDS.personal[0]} value={formData.name}      onChange={handleChange} />
                <Field field={FIELDS.personal[1]} value={formData.mobile}    onChange={handleChange} />
              </div>
              <div style={S.twoCol}>
                <Field field={FIELDS.personal[2]} value={formData.date_of_birth} onChange={handleChange} />
                <Field field={FIELDS.personal[3]} value={formData.gender}    onChange={handleChange} />
              </div>
              <div style={S.twoCol}>
                <Field field={FIELDS.personal[4]} value={formData.father_name}  onChange={handleChange} />
                <Field field={FIELDS.personal[5]} value={formData.mother_name}  onChange={handleChange} />
              </div>
            </form>
          </div>

          {/* Education Details */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Education Details</div>
            <form onSubmit={handleSubmit}>
              <Field field={FIELDS.education[0]} value={formData.qualification}    onChange={handleChange} />
              <div style={S.twoCol}>
                <Field field={FIELDS.education[1]} value={formData.preferred_course} onChange={handleChange} />
                <Field field={FIELDS.education[2]} value={formData.year_of_passing} onChange={handleChange} />
              </div>
            </form>
          </div>

          {/* Address & Location */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Address & Location</div>
            <form onSubmit={handleSubmit}>
              <Field field={FIELDS.address[0]} value={formData.address} onChange={handleChange} />
              <div style={S.twoCol}>
                <Field field={FIELDS.address[1]} value={formData.city}    onChange={handleChange} />
                <Field field={FIELDS.address[2]} value={formData.state}  onChange={handleChange} />
              </div>
              <div style={S.twoCol}>
                <Field field={FIELDS.address[3]} value={formData.pincode}  onChange={handleChange} />
                <Field field={FIELDS.address[4]} value={formData.location} onChange={handleChange} />
              </div>

              <hr style={S.divider} />

              <button
                type="submit"
                disabled={saving}
                style={{ ...S.btnPrimary, ...(saving ? S.btnDisabled : {}) }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;