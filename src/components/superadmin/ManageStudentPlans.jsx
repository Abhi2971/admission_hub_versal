import React, { useState, useEffect } from 'react';
import { getStudentPlans, createStudentPlan, updateStudentPlan, deleteStudentPlan } from '../../services/superadmin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const ManageStudentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    price: '',
    credits: '',
    description: '',
    features: '',
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getStudentPlans();
      setPlans(response.data);
    } catch (err) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      plan_name: '',
      price: '',
      credits: '',
      description: '',
      features: '',
      is_active: true
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const dataToSend = {
      ...formData,
      price: parseFloat(formData.price),
      credits: parseInt(formData.credits),
      features: formData.features ? formData.features.split(',').map(f => f.trim()) : []
    };
    try {
      if (editingPlan) {
        await updateStudentPlan(editingPlan._id, dataToSend);
        setSuccess('Plan updated successfully');
      } else {
        await createStudentPlan(dataToSend);
        setSuccess('Plan created successfully');
      }
      resetForm();
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      price: plan.price,
      credits: plan.credits,
      description: plan.description || '',
      features: plan.features ? plan.features.join(', ') : '',
      is_active: plan.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteStudentPlan(planId);
      setSuccess('Plan deleted');
      fetchPlans();
    } catch (err) {
      setError('Delete failed');
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Manage Student Credit Plans</h1>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      
      <button
        onClick={() => setShowForm(!showForm)}
        style={styles.addButton}
      >
        {showForm ? 'Cancel' : 'Add New Plan'}
      </button>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plan Name</label>
                <input
                  type="text"
                  name="plan_name"
                  value={formData.plan_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Credits</label>
                <input
                  type="number"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                  min="1"
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>Features (comma separated)</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="e.g., AI Chat, Recommendations"
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  Active
                </label>
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingPlan ? 'Update' : 'Create'}
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
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Credits</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan._id} style={styles.tr}>
                <td style={styles.tdBold}>{plan.plan_name}</td>
                <td style={styles.td}>₹{plan.price}</td>
                <td style={styles.td}>{plan.credits}</td>
                <td style={styles.td}>{plan.description}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: plan.is_active ? '#D1FAE5' : '#FEE2E2',
                    color: plan.is_active ? '#047857' : '#B91C1C'
                  }}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.tdActions}>
                  <button onClick={() => handleEdit(plan)} style={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(plan._id)} style={styles.deleteButton}>Delete</button>
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
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0F172A',
    margin: '0 0 1rem 0',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
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
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
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
    marginRight: '12px',
  },
  deleteButton: {
    color: '#DC2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default ManageStudentPlans;
