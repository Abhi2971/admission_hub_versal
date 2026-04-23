import React, { useState, useEffect } from 'react';
import { getMyCollege } from '../../services/admin';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const MyCollege = () => {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCollege();
  }, []);

  const fetchCollege = async () => {
    try {
      const res = await getMyCollege();
      setCollege(res.data.college || res.data);
    } catch (err) {
      setError('Failed to load college details');
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
      padding: '1.5rem 2rem',
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    heroCard: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      borderRadius: '24px',
      padding: '40px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    heroLogo: {
      width: '100px',
      height: '100px',
      borderRadius: '24px',
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      fontWeight: '700',
      color: '#0ea5e9',
      marginBottom: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    },
    heroName: {
      fontSize: '36px',
      fontWeight: '700',
      margin: 0,
    },
    heroCode: {
      fontSize: '16px',
      opacity: 0.9,
      marginTop: '8px',
    },
    heroLocation: {
      fontSize: '15px',
      opacity: 0.9,
      marginTop: '16px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #F1F5F9',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid #F1F5F9',
    },
    infoLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '600',
    },
    badge: {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
      color: '#059669',
    },
    description: {
      fontSize: '14px',
      color: '#475569',
      lineHeight: '1.7',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    statCard: {
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0ea5e9',
    },
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
    },
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My College</h1>
      </div>

      <div style={styles.heroCard}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '40%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={styles.heroLogo}>
            {(college?.name || 'C').charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.heroName}>{college?.name || 'College Name'}</h2>
          {college?.code && <p style={styles.heroCode}>Code: {college.code}</p>}
          <p style={styles.heroLocation}>
            📍 {college?.address}, {college?.city}, {college?.state} - {college?.pincode}
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📞 Contact Information</h3>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{college?.contact_email || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Phone</span>
            <span style={styles.infoValue}>{college?.contact_phone || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Website</span>
            <span style={styles.infoValue}>
              {college?.website ? (
                <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
                  {college.website} ↗
                </a>
              ) : 'N/A'}
            </span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={styles.infoLabel}>Status</span>
            <span style={styles.badge}>Active</span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🏛️ Institution Details</h3>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>University</span>
            <span style={styles.infoValue}>{college?.university_name || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Type</span>
            <span style={styles.infoValue}>{college?.type || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Established</span>
            <span style={styles.infoValue}>{college?.established_year || 'N/A'}</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={styles.infoLabel}>Approval</span>
            <span style={styles.infoValue}>{college?.approval || 'N/A'}</span>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <h3 style={styles.cardTitle}>📝 About</h3>
          <p style={styles.description}>
            {college?.description || 'No description available'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyCollege;
