import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCourseAdminApplications, updateCourseAdminApplicationStatus } from '../../services/courseAdmin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const ReviewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getCourseAdminApplications(params);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (appId, status) => {
    try {
      await updateCourseAdminApplicationStatus(appId, { status });
      setSuccess(`Application ${status} successfully`);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    }
  };

  const handleReject = async (appId) => {
    try {
      await updateCourseAdminApplicationStatus(appId, { status: 'rejected' });
      setSuccess('Application rejected');
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.error || 'Rejection failed');
    }
  };

  const statusConfig = {
    applied: { bg: '#DBEAFE', color: '#1E40AF', label: 'Applied' },
    shortlisted: { bg: '#FEF3C7', color: '#B45309', label: 'Shortlisted' },
    offered: { bg: '#D1FAE5', color: '#047857', label: 'Offered' },
    confirmed: { bg: '#EDE9FE', color: '#5B21B6', label: 'Confirmed' },
    rejected: { bg: '#FEE2E2', color: '#B91C1C', label: 'Rejected' },
  };

  const filterButtons = ['all', 'applied', 'shortlisted', 'offered', 'confirmed', 'rejected'];

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Review Applications</h1>

      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />
      )}

      <div style={styles.filterBar}>
        {filterButtons.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterButton,
              ...(filter === status ? styles.filterButtonActive : {}),
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📭</span>
          <p style={styles.emptyText}>No applications found.</p>
        </div>
      ) : (
        <div style={styles.appList}>
          {applications.map((app) => {
            const status = statusConfig[app.status] || statusConfig.applied;
            return (
              <div key={app._id} style={styles.appCard}>
                <div style={styles.appHeader}>
                  <div style={styles.appInfo}>
                    <h2 style={styles.appName}>{app.student_name}</h2>
                    <p style={styles.appCourse}>{app.course_name}</p>
                    <p style={styles.appDate}>
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                    <p style={styles.appContact}>
                      Email: {app.student_email} | Mobile: {app.student_mobile}
                    </p>
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                </div>

                <div style={styles.appActions}>
                  <Link to={`/course-admin/applications/${app._id}`} style={styles.docLink}>
                    View Details
                  </Link>

                  {app.status === 'applied' && (
                    <>
                      <button
                        onClick={() => handleApprove(app._id, 'under_review')}
                        style={styles.shortlistButton}
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => handleApprove(app._id, 'shortlisted')}
                        style={styles.shortlistButton}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        style={styles.rejectButton}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => handleApprove(app._id, 'shortlisted')}
                        style={styles.shortlistButton}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        style={styles.rejectButton}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => handleApprove(app._id, 'offered')}
                        style={styles.offerButton}
                      >
                        Offer Admission
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        style={styles.rejectButton}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {app.status === 'offered' && (
                    <span style={styles.awaitingText}>Awaiting student confirmation</span>
                  )}

                  {app.status === 'confirmed' && (
                    <span style={styles.confirmedText}>Admission confirmed</span>
                  )}

                  {app.status === 'rejected' && (
                    <span style={styles.rejectedText}>Rejected</span>
                  )}
                </div>
              </div>
            );
          })}
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
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem 0',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: '#E5E7EB',
    color: '#374151',
  },
  filterButtonActive: {
    backgroundColor: '#185FA5',
    color: '#FFFFFF',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  appList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  appHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  appCourse: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  appDate: {
    fontSize: '13px',
    color: '#9CA3AF',
    margin: '0 0 4px 0',
  },
  appContact: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  appActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  docLink: {
    color: '#7C3AED',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  shortlistButton: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  offerButton: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  awaitingText: {
    color: '#059669',
    fontSize: '14px',
    fontWeight: '500',
  },
  confirmedText: {
    color: '#7C3AED',
    fontSize: '14px',
    fontWeight: '500',
  },
  rejectedText: {
    color: '#DC2626',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default ReviewApplications;
