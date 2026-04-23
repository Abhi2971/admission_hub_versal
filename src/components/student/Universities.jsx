import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const StudentUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(12);

  const API_URL = process.env.REACT_APP_API_URL || 'https://admission-hub-render.onrender.com';

  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        per_page: perPage,
        ...(search && { search })
      });
      const response = await fetch(`${API_URL}/api/universities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, perPage, search]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities();
  };

  const totalPages = Math.ceil(total / perPage);

  const S = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '24px',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0,
      fontWeight: 500,
    },
    searchBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      padding: '1.25rem',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    searchInput: {
      flex: 1,
      padding: '14px 18px',
      border: '2px solid #e2e8f0',
      borderRadius: 12,
      fontSize: '15px',
      outline: 'none',
      backgroundColor: '#FFFFFF',
      color: '#1e293b',
      transition: 'all 0.2s ease',
    },
    searchBtn: {
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      color: 'white',
      border: 'none',
      borderRadius: 12,
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
      transition: 'all 0.2s ease',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    card: {
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      borderRadius: 16,
      border: '1px solid rgba(226,232,240,0.8)',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'block',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '16px'
    },
    logo: {
      width: '60px',
      height: '60px',
      borderRadius: 14,
      background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
      color: 'white',
      fontSize: '24px',
      fontWeight: '700',
      flexShrink: 0
    },
    name: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 4px 0'
    },
    code: {
      fontSize: '13px',
      color: '#6B7280'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px'
    },
    stat: {
      backgroundColor: '#F9FAFB',
      padding: '12px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#185FA5',
      margin: '0 0 2px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6B7280',
      margin: 0
    },
    location: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#6B7280'
    },
    badges: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    badge: (color) => ({
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: color + '20',
      color: color
    }),
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      marginTop: '24px'
    },
    pageBtn: (active) => ({
      padding: '8px 16px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      backgroundColor: active ? '#185FA5' : 'white',
      color: active ? 'white' : '#374151',
      cursor: 'pointer',
      fontSize: '14px'
    }),
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6B7280'
    }
  };

  if (loading && universities.length === 0) {
    return (
      <div style={S.container}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>Explore Universities</h1>
        <p style={S.subtitle}>Browse universities and their affiliated colleges</p>
      </div>

      <form style={S.searchBar} onSubmit={handleSearch}>
        <input
          type="text"
          style={S.searchInput}
          placeholder="Search universities by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" style={S.searchBtn}>Search</button>
      </form>

      {universities.length === 0 ? (
        <div style={S.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
          <p style={{ fontSize: '16px' }}>No universities found</p>
        </div>
      ) : (
        <>
          <div style={S.grid}>
            {universities.map(uni => (
              <Link to={`/student/universities/${uni._id}`} key={uni._id} style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.logo}>
                    {uni.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 style={S.name}>{uni.name}</h3>
                    <span style={S.code}>{uni.code}</span>
                  </div>
                </div>
                
                <div style={S.stats}>
                  <div style={S.stat}>
                    <p style={S.statValue}>{uni.college_count || 0}</p>
                    <p style={S.statLabel}>Colleges</p>
                  </div>
                  <div style={S.stat}>
                    <p style={S.statValue}>{uni.has_active_plan ? 'Active' : 'Pending'}</p>
                    <p style={S.statLabel}>Plan Status</p>
                  </div>
                </div>

                <div style={S.location}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{uni.city}{uni.state ? `, ${uni.state}` : ''}</span>
                </div>

                {uni.features && (
                  <div style={{ ...S.location, marginTop: '12px' }}>
                    <div style={S.badges}>
                      {uni.features.ai_enabled && (
                        <span style={S.badge('#185FA5')}>AI Powered</span>
                      )}
                      {uni.features.analytics?.length > 0 && (
                        <span style={S.badge('#059669')}>Analytics</span>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={S.pagination}>
              <button
                style={S.pageBtn(false)}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', color: '#6B7280' }}>
                Page {page} of {totalPages}
              </span>
              <button
                style={S.pageBtn(false)}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentUniversities;
