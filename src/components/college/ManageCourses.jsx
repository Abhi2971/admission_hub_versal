import React, { useState, useEffect } from 'react';
import { getCollegeCourses, createCourse, updateCourse, deleteCourse } from '../../services/admin';
import { useSubscription } from '../../context/SubscriptionContext';
import { DOCUMENT_TYPES } from '../../utils/constants';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import SubscriptionRequired from '../common/SubscriptionRequired';

const ManageCourses = () => {
  const { hasActive, plan, usage } = useSubscription();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    domain: '',
    description: '',
    duration: '',
    eligibility: '',
    seats: '',
    fees: '',
    required_documents: [],
  });

  useEffect(() => {
    if (hasActive) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [hasActive]);

  const fetchCourses = async () => {
    try {
      const response = await getCollegeCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const current = prev.required_documents || [];
      if (checked) {
        return { ...prev, required_documents: [...current, value] };
      } else {
        return { ...prev, required_documents: current.filter(d => d !== value) };
      }
    });
  };

  const resetForm = () => {
    setFormData({
      course_name: '',
      domain: '',
      description: '',
      duration: '',
      eligibility: '',
      seats: '',
      fees: '',
      required_documents: [],
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasActive) {
      setError('Active subscription required');
      return;
    }
    if (!editingCourse && usage && plan && usage.courses >= plan.max_courses) {
      setError(`Course limit reached (max ${plan.max_courses})`);
      return;
    }
    setError('');
    setSuccess('');

    const dataToSend = {
      course_name: formData.course_name,
      domain: formData.domain,
      description: formData.description,
      duration: formData.duration,
      eligibility: formData.eligibility,
      seats: formData.seats,
      fees: formData.fees,
      required_documents: formData.required_documents,
    };

    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, dataToSend);
        setSuccess('Course updated successfully');
      } else {
        await createCourse(dataToSend);
        setSuccess('Course created successfully');
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      domain: course.domain,
      description: course.description || '',
      duration: course.duration,
      eligibility: course.eligibility,
      seats: course.seats,
      fees: course.fees,
      required_documents: course.required_documents || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      setSuccess('Course deleted');
      fetchCourses();
    } catch (err) {
      setError('Delete failed');
    }
  };

  if (!hasActive) return <SubscriptionRequired feature="manage courses" />;
  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  const canAddCourse = usage && plan && usage.courses < plan.max_courses;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Courses</h1>
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
        {plan && (
          <div style={styles.usageBanner}>
            <span style={styles.usageText}>
              Course usage: {usage?.courses || 0} / {plan.max_courses}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        disabled={!canAddCourse}
        style={{
          ...styles.addButton,
          ...(canAddCourse ? {} : styles.addButtonDisabled),
        }}
        title={!canAddCourse ? 'Course limit reached' : ''}
      >
        {showForm ? 'Cancel' : 'Add New Course'}
      </button>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{editingCourse ? 'Edit Course' : 'New Course'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Course Name</label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Domain</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  required
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
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 4 years"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Eligibility</label>
                <input
                  type="text"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  placeholder="e.g., 10+2 with PCM"
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Total Seats</label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  required
                  min="1"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fees (INR)</label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                <label style={styles.label}>Required Documents</label>
                <div style={styles.docGrid}>
                  {DOCUMENT_TYPES.map(docType => (
                    <label key={docType} style={styles.docLabel}>
                      <input
                        type="checkbox"
                        name="required_documents"
                        value={docType}
                        checked={formData.required_documents?.includes(docType) || false}
                        onChange={handleCheckboxChange}
                        style={styles.checkbox}
                      />
                      <span style={styles.docText}>{docType.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
                <p style={styles.docHint}>
                  Select the documents students must upload for this course.
                </p>
              </div>
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.submitButton}>
                {editingCourse ? 'Update' : 'Create'}
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
              <th style={styles.th}>Course Name</th>
              <th style={styles.th}>Domain</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Seats</th>
              <th style={styles.th}>Available</th>
              <th style={styles.th}>Fees</th>
              <th style={styles.th}>Docs</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} style={styles.tr}>
                <td style={styles.tdBold}>{course.course_name}</td>
                <td style={styles.td}>{course.domain}</td>
                <td style={styles.td}>{course.duration}</td>
                <td style={styles.td}>{course.seats}</td>
                <td style={styles.td}>{course.available_seats}</td>
                <td style={styles.td}>₹{course.fees.toLocaleString()}</td>
                <td style={styles.td}>
                  {course.required_documents?.length > 0 ? (
                    <span style={styles.docsBadge}>
                      {course.required_documents.length} doc{course.required_documents.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={styles.noDocs}>None</span>
                  )}
                </td>
                <td style={styles.tdActions}>
                  <button onClick={() => handleEdit(course)} style={styles.editButton}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(course._id)} style={styles.deleteButton}>
                    Delete
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
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
    margin: 0,
  },
  usageBanner: {
    backgroundColor: '#EFF6FF',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  usageText: {
    fontSize: '13px',
    color: '#1E40AF',
  },
  addButton: {
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  addButtonDisabled: {
    backgroundColor: '#D1D5DB',
    color: '#6B7280',
    cursor: 'not-allowed',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
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
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#374151',
    resize: 'vertical',
  },
  docGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  docLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  docText: {
    fontSize: '13px',
    color: '#374151',
    textTransform: 'capitalize',
  },
  docHint: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '8px',
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
    backgroundColor: '#6B7280',
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
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#F9FAFB',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #E5E7EB',
  },
  tdBold: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#6B7280',
  },
  docsBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#D1FAE5',
    color: '#047857',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  noDocs: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  tdActions: {
    padding: '12px 16px',
  },
  editButton: {
    color: '#185FA5',
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

export default ManageCourses;
