import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://admission-hub-render.onrender.com';

const ManageUniversityPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: '', price: 0, billing_period: 'monthly', description: '',
    features: { ai_enabled: false, ai_credits: 0, max_colleges: -1 }
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/plans?type=university`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const data = {
      ...formData,
      plan_type: 'university',
      features: formData.features
    };
    try {
      const res = await fetch(`${API_URL}/api/plans/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowModal(false);
        fetchPlans();
        setFormData({ plan_name: '', price: 0, billing_period: 'monthly', description: '', features: { ai_enabled: false, ai_credits: 0, max_colleges: -1 } });
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const handleToggleActive = async (planId, currentStatus) => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`${API_URL}/api/plans/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchPlans();
    } catch (error) {
      console.error('Error toggling plan:', error);
    }
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1F2937', margin: 0 },
    section: { background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', borderBottom: '2px solid #E5E7EB' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #E5E7EB' },
    badge: (color) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', backgroundColor: color + '20', color }),
    btn: (variant) => ({ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: variant === 'primary' ? '#7C3AED' : variant === 'danger' ? '#EF4444' : '#E5E7EB', color: variant === 'outline' ? '#374151' : 'white', marginLeft: '8px' }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#111111' },
    checkbox: { marginRight: '8px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }
  };

  if (loading) return <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>Loading plans...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>University Plans</h1>
        <button style={styles.btn('primary')} onClick={() => setShowModal(true)}>+ Create University Plan</button>
      </div>

      <div style={styles.section}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plan Name</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Billing</th>
              <th style={styles.th}>AI Enabled</th>
              <th style={styles.th}>Max Colleges</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td style={styles.td}><strong>{p.plan_name}</strong></td>
                <td style={styles.td}>₹{p.price}</td>
                <td style={styles.td}>{p.billing_period}</td>
                <td style={styles.td}><span style={styles.badge(p.features?.ai_enabled ? '#10B981' : '#6B7280')}>{p.features?.ai_enabled ? 'Yes' : 'No'}</span></td>
                <td style={styles.td}>{p.features?.max_colleges === -1 ? 'Unlimited' : p.features?.max_colleges}</td>
                <td style={styles.td}><span style={styles.badge(p.is_active ? '#10B981' : '#EF4444')}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={styles.td}>
                  <button style={styles.btn('outline')} onClick={() => handleToggleActive(p.id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr><td colSpan="7" style={{ ...styles.td, textAlign: 'center', color: '#6B7280' }}>No university plans created yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Create University Plan</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plan Name *</label>
                <input style={styles.input} value={formData.plan_name} onChange={e => setFormData({...formData, plan_name: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input style={styles.input} type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Billing Period *</label>
                  <select style={styles.input} value={formData.billing_period} onChange={e => setFormData({...formData, billing_period: e.target.value})}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.input} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" style={styles.checkbox} checked={formData.features.ai_enabled} onChange={e => setFormData({...formData, features: {...formData.features, ai_enabled: e.target.checked}})} />
                  AI Enabled
                </label>
              </div>
              {formData.features.ai_enabled && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>AI Credits</label>
                  <input style={styles.input} type="number" value={formData.features.ai_credits} onChange={e => setFormData({...formData, features: {...formData.features, ai_credits: parseInt(e.target.value)}})} />
                </div>
              )}
              <div style={styles.formGroup}>
                <label style={styles.label}>Max Colleges (-1 for unlimited)</label>
                <input style={styles.input} type="number" value={formData.features.max_colleges} onChange={e => setFormData({...formData, features: {...formData.features, max_colleges: parseInt(e.target.value)}})} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btn('outline')} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={styles.btn('primary')}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUniversityPlans;
