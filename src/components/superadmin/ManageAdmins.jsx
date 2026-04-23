import React, { useState, useEffect } from 'react';
import { getAdmins, createAdmin, getColleges } from '../../services/superadmin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'college_admin',
    college_id: '',
    mobile: '',
  });

  useEffect(() => {
    Promise.all([fetchAdmins(), fetchColleges()]).finally(() => setLoading(false));
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await getAdmins();
      setAdmins(response.data);
    } catch (err) {
      setError('Failed to load admins');
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await getColleges();
      setColleges(response.data.colleges || []);
    } catch (err) {
      setError('Failed to load colleges');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'college_admin',
      college_id: '',
      mobile: '',
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createAdmin(formData);
      setSuccess('Admin created successfully');
      resetForm();
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Creation failed');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'super_admin') {
      return { bg: '#EDE9FE', color: '#7C3AED' };
    }
    return { bg: '#DBEAFE', color: '#1D4ED8' };
  };

  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'Super Admin';
    return 'College Admin';
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Admins</h1>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.addButton}
      >
        {showForm ? 'Cancel' : 'Add New Admin'}
      </button>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>New Admin</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  style={styles.input}
                >
                  <option value="college_admin">College Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {formData.role === 'college_admin' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>College *</label>
                  <select
                    name="college_id"
                    value={formData.college_id}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  >
                    <option value="">-- Select College --</option>
                    {colleges.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                Create
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>College</th>
              <th style={styles.th}>Mobile</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const roleBadge = getRoleBadge(admin.role);
              const college = admin.college_id ? colleges.find(c => c._id === admin.college_id) : null;
              return (
                <tr key={admin._id} style={styles.tr}>
                  <td style={styles.tdBold}>{admin.name}</td>
                  <td style={styles.td}>{admin.email}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.roleBadge, backgroundColor: roleBadge.bg, color: roleBadge.color }}>
                      {getRoleLabel(admin.role)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {college ? college.name : '-'}
                  </td>
                  <td style={styles.td}>{admin.mobile || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '1.5rem 2rem',
    backgroundColor: '#F1F5F9',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 1rem 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '1rem',
  },
  submitButton: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#64748B',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#F8FAFC',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #E2E8F0',
  },
  tdBold: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0F172A',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#64748B',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default ManageAdmins;
