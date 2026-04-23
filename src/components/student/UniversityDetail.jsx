import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../common/Loader';

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'https://admission-hub-render.onrender.com';

  const fetchUniversity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/universities/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUniversity(data);
      }
    } catch (error) {
      console.error('Error fetching university:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, id]);

  useEffect(() => {
    fetchUniversity();
  }, [fetchUniversity]);

  const S = {
    container: {
      padding: '24px',
      maxWidth: '1000px',
      margin: '0 auto'
    },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
      marginBottom: '24px'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      padding: '32px',
      marginBottom: '24px'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginBottom: '24px'
    },
    logo: {
      width: '80px',
      height: '80px',
      borderRadius: '16px',
      backgroundColor: '#185FA5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '36px',
      fontWeight: '700',
      flexShrink: 0
    },
    titleSection: {
      flex: 1
    },
    name: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#111827',
      margin: '0 0 8px 0'
    },
    code: {
      fontSize: '15px',
      color: '#6B7280',
      margin: 0
    },
    badges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    badge: (color) => ({
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: color + '20',
      color: color
    }),
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px'
    },
    stat: {
      backgroundColor: '#F9FAFB',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#185FA5',
      margin: '0 0 4px 0'
    },
    statLabel: {
      fontSize: '13px',
      color: '#6B7280',
      margin: 0
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginTop: '24px'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#F9FAFB',
      borderRadius: '10px'
    },
    infoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      backgroundColor: '#EEF2FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#185FA5'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#6B7280',
      margin: '0 0 2px 0'
    },
    infoValue: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      padding: '24px',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 20px 0'
    },
    collegesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px'
    },
    collegeCard: {
      backgroundColor: '#F9FAFB',
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textDecoration: 'none',
      display: 'block'
    },
    collegeName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px 0'
    },
    collegeCode: {
      fontSize: '13px',
      color: '#6B7280',
      margin: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#6B7280'
    }
  };

  if (loading) {
    return (
      <div style={S.container}>
        <Loader size="lg" />
      </div>
    );
  }

  if (!university) {
    return (
      <div style={S.container}>
        <div style={S.emptyState}>
          <p>University not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.container}>
      <button style={S.backBtn} onClick={() => navigate('/student/universities')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Universities
      </button>

      <div style={S.header}>
        <div style={S.headerTop}>
          <div style={S.logo}>
            {university.name?.charAt(0) || 'U'}
          </div>
          <div style={S.titleSection}>
            <h1 style={S.name}>{university.name}</h1>
            <p style={S.code}>{university.code}</p>
            <div style={S.badges}>
              {university.has_active_plan && (
                <span style={S.badge('#059669')}>Active Plan</span>
              )}
              {university.features?.ai_enabled && (
                <span style={S.badge('#185FA5')}>AI Powered</span>
              )}
            </div>
          </div>
        </div>

        <div style={S.stats}>
          <div style={S.stat}>
            <p style={S.statValue}>{university.college_count || 0}</p>
            <p style={S.statLabel}>Colleges</p>
          </div>
          <div style={S.stat}>
            <p style={S.statValue}>{university.description?.split(' ').length || 0}</p>
            <p style={S.statLabel}>Words in Description</p>
          </div>
          <div style={S.stat}>
            <p style={S.statValue}>{university.features?.max_colleges || '∞'}</p>
            <p style={S.statLabel}>Max Colleges</p>
          </div>
          <div style={S.stat}>
            <p style={S.statValue}>{university.features?.support_level || 'N/A'}</p>
            <p style={S.statLabel}>Support Level</p>
          </div>
        </div>

        <div style={S.infoGrid}>
          {university.city && (
            <div style={S.infoItem}>
              <div style={S.infoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p style={S.infoLabel}>Location</p>
                <p style={S.infoValue}>{university.city}{university.state ? `, ${university.state}` : ''}</p>
              </div>
            </div>
          )}
          {university.website && (
            <div style={S.infoItem}>
              <div style={S.infoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <p style={S.infoLabel}>Website</p>
                <p style={S.infoValue}>{university.website}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {university.description && (
        <div style={S.section}>
          <h2 style={S.sectionTitle}>About</h2>
          <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.7', margin: 0 }}>
            {university.description}
          </p>
        </div>
      )}

      <div style={S.section}>
        <h2 style={S.sectionTitle}>Affiliated Colleges ({university.colleges?.length || 0})</h2>
        {university.colleges && university.colleges.length > 0 ? (
          <div style={S.collegesGrid}>
            {university.colleges.map(college => (
              <Link to={`/student/colleges/${college._id}`} key={college._id} style={S.collegeCard}>
                <h3 style={S.collegeName}>{college.name}</h3>
                <p style={S.collegeCode}>{college.code}</p>
                {college.city && (
                  <p style={{ ...S.collegeCode, marginTop: '8px' }}>
                    📍 {college.city}, {college.state}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div style={S.emptyState}>
            <p>No colleges affiliated with this university yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityDetail;
