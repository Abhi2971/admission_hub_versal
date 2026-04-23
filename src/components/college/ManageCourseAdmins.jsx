import React, { useState, useEffect } from 'react';
import { createCourseAdmin, getCourseAdmins } from '../../services/admin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const ManageCourseAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await getCourseAdmins();
      setAdmins(response.data);
    } catch (err) {
      setError('Failed to load course admins');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createCourseAdmin(formData);
      setSuccess('Course admin created. Login credentials sent to email.');
      setFormData({ name: '', email: '', mobile: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.error || 'Creation failed');
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px', color: '#185FA5' }}>
        Manage Course Admins
      </h1>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '24px', backgroundColor: '#185FA5', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Course Admin'}
      </button>

      {showForm && (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
            New Course Admin
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151' }}
              />
            </div>
            <button type="submit" style={{ backgroundColor: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              Create
            </button>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Mobile</th>
            </tr>
          </thead>
          <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
            {admins.map(admin => (
              <tr key={admin._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>{admin.name}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{admin.email}</td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>{admin.mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourseAdmins;
