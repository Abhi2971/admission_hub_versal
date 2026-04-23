import React, { useState, useEffect } from 'react';
import { getSeatAllocations, getSeatAllocation, createSeatAllocation, getCollegeCourses } from '../../services/admin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const CATEGORIES = [
  { key: 'general', label: 'General', color: '#3B82F6' },
  { key: 'obc', label: 'OBC', color: '#10B981' },
  { key: 'sc', label: 'SC', color: '#F59E0B' },
  { key: 'st', label: 'ST', color: '#8B5CF6' },
  { key: 'ews', label: 'EWS', color: '#06B6D4' },
  { key: 'pwd', label: 'PWD', color: '#EC4899' },
  { key: 'nri', label: 'NRI', color: '#6366F1' },
  { key: 'management', label: 'Management', color: '#F97316' },
];

const SeatAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    general: 0, obc: 0, sc: 0, st: 0, ews: 0, pwd: 0, nri: 0, management: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allocRes, coursesRes] = await Promise.all([
        getSeatAllocations(),
        getCollegeCourses()
      ]);
      setAllocations(allocRes.data?.seat_allocations || []);
      // Handle both array and object response formats
      setCourses(coursesRes.data?.courses || coursesRes.data || []);
    } catch (err) {
      console.error('Error fetching seat allocations:', err);
      setError('Failed to load seat allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId) => {
    setSelectedCourse(courseId);
    setEditMode(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await getSeatAllocation(courseId);
      const data = res.data;
      
      if (data.allocations && Object.keys(data.allocations).length > 0) {
        setFormData({
          general: data.allocations.general || 0,
          obc: data.allocations.obc || 0,
          sc: data.allocations.sc || 0,
          st: data.allocations.st || 0,
          ews: data.allocations.ews || 0,
          pwd: data.allocations.pwd || 0,
          nri: data.allocations.nri || 0,
          management: data.allocations.management || 0,
        });
      } else {
        const totalSeats = data.total_seats || 60;
        setFormData({
          general: Math.floor(totalSeats * 0.40),
          obc: Math.floor(totalSeats * 0.27),
          sc: Math.floor(totalSeats * 0.15),
          st: Math.floor(totalSeats * 0.075),
          ews: Math.floor(totalSeats * 0.10),
          pwd: Math.floor(totalSeats * 0.05),
          nri: Math.floor(totalSeats * 0.03),
          management: Math.floor(totalSeats * 0.05),
        });
      }
    } catch (err) {
      setError('Failed to load course allocation');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseInt(value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    setError('');
    setSuccess('');
    
    const totalAllocated = Object.values(formData).reduce((a, b) => a + b, 0);
    const course = courses.find(c => c._id === selectedCourse);
    
    if (totalAllocated > (course?.seats || 0)) {
      setError(`Total allocated seats (${totalAllocated}) exceeds course seats (${course?.seats})`);
      return;
    }

    try {
      await createSeatAllocation(selectedCourse, formData);
      setSuccess('Seat allocation saved successfully');
      fetchData();
      setEditMode(false);
      setSelectedCourse(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save seat allocation');
    }
  };

  if (loading) return <Loader size="lg" />;

  const getCourseName = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course?.course_name || 'Unknown';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Seat Allocation Rules</h1>
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      </div>

      <p style={styles.description}>
        Define category-wise seat distribution for each course. The total allocated seats should not exceed the course's total seats.
      </p>

      {!editMode ? (
        <div style={styles.grid}>
          {courses.map((course) => {
            const allocation = allocations.find(a => a.course_id === course._id);
            const hasAllocation = allocation && Object.keys(allocation.allocations || {}).length > 0;
            
            return (
              <div key={course._id} style={styles.courseCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.courseName}>{course.course_name}</h3>
                  <span style={styles.seatsBadge}>{course.seats} seats</span>
                </div>
                
                {hasAllocation ? (
                  <div style={styles.allocationPreview}>
                    {CATEGORIES.map(cat => (
                      <div key={cat.key} style={styles.previewItem}>
                        <span style={{ ...styles.dot, backgroundColor: cat.color }}></span>
                        <span style={styles.previewLabel}>{cat.label}:</span>
                        <span style={styles.previewValue}>{allocation.allocations[cat.key] || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.noAllocation}>No allocation set</p>
                )}
                
                <button
                  onClick={() => handleCourseSelect(course._id)}
                  style={styles.editButton}
                >
                  {hasAllocation ? 'Edit Allocation' : 'Set Allocation'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {getCourseName(selectedCourse)} - Seat Allocation
            </h2>
            <button onClick={() => { setEditMode(false); setSelectedCourse(null); }} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              {CATEGORIES.map((cat) => (
                <div key={cat.key} style={styles.formGroup}>
                  <label style={{ ...styles.label, color: cat.color }}>
                    {cat.label} Seats
                  </label>
                  <input
                    type="number"
                    name={cat.key}
                    value={formData[cat.key]}
                    onChange={handleChange}
                    min="0"
                    style={{ ...styles.input, borderColor: cat.color }}
                  />
                </div>
              ))}
            </div>
            
            <div style={styles.totalSection}>
              <span style={styles.totalLabel}>Total Allocated:</span>
              <span style={{
                ...styles.totalValue,
                color: Object.values(formData).reduce((a, b) => a + b, 0) > 
                  (courses.find(c => c._id === selectedCourse)?.seats || 0) ? '#DC2626' : '#059669'
              }}>
                {Object.values(formData).reduce((a, b) => a + b, 0)} / {courses.find(c => c._id === selectedCourse)?.seats || 0}
              </span>
            </div>
            
            <button type="submit" style={styles.submitButton}>
              Save Allocation
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '1.5rem 2rem',
    backgroundColor: '#F3F4F6',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  description: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  courseName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  seatsBadge: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  allocationPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  previewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  previewLabel: {
    color: '#6B7280',
  },
  previewValue: {
    fontWeight: '600',
    color: '#111827',
  },
  noAllocation: {
    fontSize: '13px',
    color: '#9CA3AF',
    marginBottom: '12px',
  },
  editButton: {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  totalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '700',
  },
  submitButton: {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default SeatAllocation;
