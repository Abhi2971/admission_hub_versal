import React, { useState, useEffect } from 'react';
import { getColleges, createCollege, updateCollege } from '../../services/superadmin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const ManageColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await getColleges();
      setColleges(response.data.colleges || []);
    } catch (err) {
      setError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      contact_email: '',
      contact_phone: '',
      website: '',
      description: '',
    });
    setEditingCollege(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingCollege) {
        await updateCollege(editingCollege._id, formData);
        setSuccess('College updated successfully');
      } else {
        await createCollege(formData);
        setSuccess('College created successfully');
      }
      resetForm();
      fetchColleges();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (college) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      code: college.code,
      address: college.address,
      city: college.city,
      state: college.state,
      contact_email: college.contact_email,
      contact_phone: college.contact_phone,
      website: college.website || '',
      description: college.description || '',
    });
    setShowForm(true);
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Colleges</h1>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.addButton}
      >
        {showForm ? 'Cancel' : 'Add New College'}
      </button>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editingCollege ? 'Edit College' : 'New College'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>College Name *</label>
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
                <label style={styles.label}>College Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Phone *</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingCollege ? 'Update' : 'Create'}
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
              <th style={styles.th}>Code</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>State</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) => (
              <tr key={college._id} style={styles.tr}>
                <td style={styles.tdBold}>{college.name}</td>
                <td style={styles.td}>
                  <span style={styles.codeBadge}>{college.code}</span>
                </td>
                <td style={styles.td}>{college.city}</td>
                <td style={styles.td}>{college.state}</td>
                <td style={styles.td}>{college.contact_email}</td>
                <td style={styles.tdActions}>
                  <button onClick={() => handleEdit(college)} style={styles.editButton}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
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
  formGroupFull: {
    gridColumn: '1 / -1',
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
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1E293B',
    resize: 'vertical',
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
  codeBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#EDE9FE',
    color: '#7C3AED',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  tdActions: {
    padding: '12px 16px',
  },
  editButton: {
    color: '#7C3AED',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default ManageColleges;
