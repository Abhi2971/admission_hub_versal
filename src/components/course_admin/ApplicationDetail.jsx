import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseAdminApplication } from '../../services/courseAdmin';
import Alert from '../common/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CourseAdminApplicationDetail = () => {
  const { appId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await getCourseAdminApplication(appId);
      setApplication(res.data.application || res.data);
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusConfig = {
    applied: { bg: '#DBEAFE', color: '#1E40AF', label: 'Applied' },
    under_review: { bg: '#FEF3C7', color: '#B45309', label: 'Under Review' },
    shortlisted: { bg: '#FEF3C7', color: '#B45309', label: 'Shortlisted' },
    offered: { bg: '#D1FAE5', color: '#047857', label: 'Offered' },
    confirmed: { bg: '#EDE9FE', color: '#5B21B6', label: 'Confirmed' },
    rejected: { bg: '#FEE2E2', color: '#B91C1C', label: 'Rejected' },
  };

  const styles = {
    container: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '1.5rem 2rem',
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
    },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
      marginBottom: '24px',
      textDecoration: 'none',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    statusBadge: (status) => {
      const config = statusConfig[status] || statusConfig.applied;
      return {
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        background: config.bg,
        color: config.color,
      };
    },
    card: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #F3F4F6',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    infoLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    infoValue: {
      fontSize: '15px',
      color: '#111827',
      fontWeight: '500',
    },
    section: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
    },
    docList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    docCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#F9FAFB',
      borderRadius: '10px',
      border: '1px solid #E5E7EB',
    },
    docInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    docName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      textTransform: 'capitalize',
    },
    docMeta: {
      fontSize: '12px',
      color: '#6B7280',
    },
    docStatus: (status) => ({
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 12px',
      borderRadius: '20px',
      backgroundColor: status === 'verified' ? '#D1FAE5' : status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
      color: status === 'verified' ? '#059669' : status === 'rejected' ? '#DC2626' : '#D97706',
    }),
    viewBtn: {
      padding: '8px 16px',
      backgroundColor: '#185FA5',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6B7280',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={styles.container}>
        <Link to="/course-admin/applications" style={styles.backBtn}>
          ← Back to Applications
        </Link>
        <Alert type="error" message={error || 'Application not found'} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to="/course-admin/applications" style={styles.backBtn}>
        ← Back to Applications
      </Link>

      <div style={styles.header}>
        <h1 style={styles.title}>Application Details</h1>
        <span style={styles.statusBadge(application.status)}>
          {statusConfig[application.status]?.label || application.status}
        </span>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Student Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Name</span>
            <span style={styles.infoValue}>{application.student_name || 'N/A'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{application.student_email || 'N/A'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Mobile</span>
            <span style={styles.infoValue}>{application.student_mobile || 'N/A'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Applied On</span>
            <span style={styles.infoValue}>
              {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Course Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Course</span>
            <span style={styles.infoValue}>{application.course_name || 'N/A'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>College</span>
            <span style={styles.infoValue}>{application.college_name || 'N/A'}</span>
          </div>
          {application.category && (
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Category</span>
              <span style={styles.infoValue}>{application.category}</span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Uploaded Documents</h2>
        {application.documents && application.documents.length > 0 ? (
          <div style={styles.docList}>
            {application.documents.map((doc, index) => (
              <div key={doc._id || index} style={styles.docCard}>
                <div style={styles.docInfo}>
                  <span style={styles.docName}>
                    {doc.document_type?.replace(/_/g, ' ') || `Document ${index + 1}`}
                  </span>
                  <span style={styles.docMeta}>
                    Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={styles.docStatus(doc.verification_status)}>
                    {doc.verification_status || 'pending'}
                  </span>
                  {doc.file_url && (
                    <a
                      href={`${API_URL}${doc.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.viewBtn}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAdminApplicationDetail;
