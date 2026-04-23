import React, { useState, useEffect } from 'react';
import { getCourseAdminCourses } from '../../services/courseAdmin';
import Alert from '../common/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManualEntry = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('addStudent');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    father_name: '',
    mother_name: '',
    aadhar: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourseAdminCourses();
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/admin/add-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Student added successfully! Student ID: ${data.student_id}`);
        setFormData({
          name: '', email: '', mobile: '', dob: '', gender: '',
          address: '', city: '', state: '', pincode: '',
          father_name: '', mother_name: '', aadhar: '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add student');
      }
    } catch (err) {
      setError('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('access_token');
    const appData = {
      student_id: formData.student_id,
      course_id: formData.course_id,
      category: formData.category || 'general',
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/manual-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appData)
      });

      if (res.ok) {
        setSuccess('Application created successfully!');
        setFormData({ ...formData, student_id: '', course_id: '', category: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create application');
      }
    } catch (err) {
      setError('Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '1.5rem 2rem',
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '24px',
      padding: '1rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
      padding: '6px',
      borderRadius: '12px',
      width: 'fit-content',
      border: '1px solid rgba(226,232,240,0.8)',
    },
    tab: (active) => ({
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      background: active ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'transparent',
      color: active ? '#FFFFFF' : '#64748b',
      border: 'none',
      transition: 'all 0.2s ease',
    }),
    card: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
    },
    input: {
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      color: '#1E293B',
      transition: 'all 0.2s ease',
    },
    select: {
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '10px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      color: '#1E293B',
      cursor: 'pointer',
    },
    fullWidth: {
      gridColumn: 'span 2',
    },
    submitBtn: {
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px',
      boxShadow: '0 4px 14px rgba(20,184,166,0.4)',
    },
    infoBox: {
      padding: '16px',
      backgroundColor: '#F0FDF4',
      border: '1px solid #BBF7D0',
      borderRadius: '10px',
      marginBottom: '20px',
    },
    infoText: {
      fontSize: '14px',
      color: '#166534',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manual Entry</h1>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={5000} />}

      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'addStudent')} onClick={() => setActiveTab('addStudent')}>
          Add Student
        </button>
        <button style={styles.tab(activeTab === 'addApplication')} onClick={() => setActiveTab('addApplication')}>
          Add Application
        </button>
      </div>

      <div style={styles.card}>
        {activeTab === 'addStudent' && (
          <form onSubmit={handleStudentSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Student Name *</label>
                <input style={styles.input} name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="student@example.com" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile *</label>
                <input style={styles.input} name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="10-digit mobile number" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input style={styles.input} type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Gender</label>
                <select style={styles.select} name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Aadhar Number</label>
                <input style={styles.input} name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="12-digit Aadhar" />
              </div>
              <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                <label style={styles.label}>Address</label>
                <input style={styles.input} name="address" value={formData.address} onChange={handleChange} placeholder="Full address" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input style={styles.input} name="city" value={formData.city} onChange={handleChange} placeholder="City" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>State</label>
                <input style={styles.input} name="state" value={formData.state} onChange={handleChange} placeholder="State" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Pincode</label>
                <input style={styles.input} name="pincode" value={formData.pincode} onChange={handleChange} placeholder="6-digit pincode" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Father's Name</label>
                <input style={styles.input} name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Father's name" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Mother's Name</label>
                <input style={styles.input} name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mother's name" />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        )}

        {activeTab === 'addApplication' && (
          <form onSubmit={handleApplicationSubmit}>
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                ℹ️ To add an application, you first need to create a student account, then use the Student ID to create an application.
              </p>
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Student ID *</label>
                <input style={styles.input} name="student_id" value={formData.student_id} onChange={handleChange} required placeholder="Enter student ID" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Course *</label>
                <select style={styles.select} name="course_id" value={formData.course_id} onChange={handleChange} required>
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.course_name} - {course.department}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.select} name="category" value={formData.category} onChange={handleChange}>
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="ews">EWS</option>
                  <option value="pwd">PWD</option>
                  <option value="nri">NRI</option>
                  <option value="management">Management</option>
                </select>
              </div>
            </div>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManualEntry;
