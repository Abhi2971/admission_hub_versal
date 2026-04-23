import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getColleges } from '../services/college';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    minHeight: '100vh',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  title: { fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  sub:   { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 },
  filterCard: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr auto',
    gap: 12,
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  input: {
    padding: '12px 16px',
    fontSize: 14,
    border: '2px solid #e2e8f0',
    borderRadius: 10,
    background: '#ffffff',
    color: '#1e293b',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  btnSearch: {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 14,
    borderBottom: '1px solid #f1f5f9',
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#1d4ed8',
    boxShadow: '0 4px 12px rgba(29,78,216,0.2)',
  },
  collegeName: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 },
  location:    { fontSize: 13, color: '#64748b', fontWeight: 500 },
  codePill: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    color: '#475569',
    marginTop: 6,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.6,
    flex: 1,
    marginBottom: 14,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  btnDetails: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    textDecoration: 'none',
    width: '100%',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
    transition: 'all 0.2s ease',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: '2rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
  },
  btnPage: (disabled) => ({
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: disabled ? '1px solid #e2e8f0' : 'none',
    background: disabled ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: disabled ? '#94a3b8' : '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: disabled ? 'none' : '0 4px 14px rgba(14,165,233,0.4)',
  }),
  pageInfo: { fontSize: 14, color: '#64748b', padding: '0 12px', fontWeight: 500 },
  empty: {
    gridColumn: 'span 3',
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
    fontSize: 14,
    color: '#94a3b8',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Colleges = ({ basePath = '/colleges' }) => {
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [filters,  setFilters]  = useState({ city: '', state: '', search: '' });
  const [focused,  setFocused]  = useState('');
  const filtersRef = useRef(filters);

  filtersRef.current = filters;

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10, ...filtersRef.current };
      const response = await getColleges(params);
      setColleges(response.data.colleges);
      setTotal(response.data.total);
    } catch {
      setError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchColleges(); }, [fetchColleges]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setPage(1);
    fetchColleges(); 
  };

  const totalPages = Math.ceil(total / 10);

  if (loading && page === 1) return <Loader size="lg" />;

  return (
    <div style={S.page}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Top bar ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.title}>Colleges</h1>
          <p style={S.sub}>{total} college{total !== 1 ? 's' : ''} listed</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <form onSubmit={handleSearch} style={S.filterCard}>
        {[
          { name: 'search', placeholder: 'Search colleges…' },
          { name: 'city',   placeholder: 'City' },
          { name: 'state',  placeholder: 'State' },
        ].map(f => (
          <input
            key={f.name}
            type="text"
            name={f.name}
            value={filters[f.name]}
            onChange={handleFilterChange}
            placeholder={f.placeholder}
            style={{
              ...S.input,
              borderColor: focused === f.name ? '#185FA5' : '#d1d5db',
            }}
            onFocus={() => setFocused(f.name)}
            onBlur={() => setFocused('')}
          />
        ))}
        <button type="submit" style={S.btnSearch}>Apply filters</button>
      </form>

      {/* ── Grid ── */}
      <div style={S.grid}>
        {colleges.length === 0 && !loading ? (
          <div style={S.empty}>No colleges found. Try adjusting your filters.</div>
        ) : (
          colleges.map((college) => (
            <div key={college._id} style={S.card}>
              <div style={S.cardTop}>
                <div style={S.iconBox}>
                  {(college.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <div style={S.collegeName}>{college.name}</div>
                  <div style={S.location}>{college.city}, {college.state}</div>
                  {college.university_name && (
                    <span style={{ ...S.codePill, background: '#EEF2FF', color: '#185FA5' }}>
                      {college.university_name}
                    </span>
                  )}
                </div>
              </div>

              {college.description && (
                <p style={S.description}>{college.description}</p>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                {college.code && (
                  <span style={{ ...S.codePill, fontSize: '10px' }}>Code: {college.code}</span>
                )}
                {college.course_count > 0 && (
                  <span style={{ ...S.codePill, fontSize: '10px', background: '#ECFDF5', color: '#059669' }}>
                    {college.course_count} courses
                  </span>
                )}
              </div>

              <Link to={`${basePath}/${college._id}`} style={S.btnDetails}>
                View details →
              </Link>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {total > 10 && (
        <div style={S.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={S.btnPage(page === 1)}
          >
            ← Previous
          </button>
          <span style={S.pageInfo}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            style={S.btnPage(page >= totalPages)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Colleges;