import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/courses';
import { getStudentApplications } from '../services/student';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';

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

  /* Filter bar */
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
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },

  /* Grid */
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
    gap: 0,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    paddingBottom: 14,
    borderBottom: '1px solid #f1f5f9',
    marginBottom: 14,
  },
  courseName: { fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 4 },
  collegeName:{ fontSize: 13, color: '#64748b', fontWeight: 500 },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 16px',
    marginBottom: 14,
  },
  metaItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 },
  metaValue: { fontSize: 13, color: '#334155', fontWeight: 500 },
  feeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTop: '1px solid #f1f5f9',
    marginTop: 'auto',
  },
  fee:      { fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  seatPill: (pct) => ({
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 20,
    background: pct > 50 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : pct > 20 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
    color:      pct > 50 ? '#059669' : pct > 20 ? '#d97706' : '#dc2626',
  }),
  domainPill: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 14px',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1d4ed8',
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(29,78,216,0.15)',
  },
  btnApply: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    padding: '12px 18px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    textDecoration: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },
  btnApplied: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    padding: '12px 18px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    color: '#059669',
    width: '100%',
  },

  /* Pagination */
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

  /* Empty */
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
const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filters, setFilters] = useState({ domain: '', college_id: '', search: '' });
  const [focused, setFocused] = useState('');
  const filtersRef = useRef(filters);

  filtersRef.current = filters;

  const fetchApplications = useCallback(async () => {
    if (user?.role === 'student') {
      try {
        const res = await getStudentApplications();
        setApplications(res.data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10, ...filtersRef.current };
      const response = await getCourses(params);
      setCourses(response.data.courses);
      setTotal(response.data.total);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setPage(1);
    fetchCourses(); 
  };

  const totalPages = Math.ceil(total / 10);

  if (loading && page === 1) return <Loader size="lg" />;

  return (
    <div style={S.page}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* ── Top bar ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.title}>Courses</h1>
          <p style={S.sub}>{total} course{total !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <form onSubmit={handleSearch} style={S.filterCard}>
        {[
          { name: 'search',    placeholder: 'Search courses…' },
          { name: 'domain',    placeholder: 'Domain (e.g. Engineering)' },
          { name: 'college_id',placeholder: 'College ID' },
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

      {/* ── Course grid ── */}
      <div style={S.grid}>
        {courses.length === 0 && !loading ? (
          <div style={S.empty}>No courses found. Try adjusting your filters.</div>
        ) : (
          courses.map((course) => {
            const seatPct = Math.round((course.available_seats / course.seats) * 100);
            return (
              <div key={course._id} style={S.card}>
                <div style={S.cardHeader}>
                  <span style={S.domainPill}>{course.domain}</span>
                  <div style={S.courseName}>{course.course_name}</div>
                  <div style={S.collegeName}>{course.college_name}</div>
                </div>

                <div style={S.metaGrid}>
                  <div style={S.metaItem}>
                    <span style={S.metaLabel}>Duration</span>
                    <span style={S.metaValue}>{course.duration}</span>
                  </div>
                  <div style={S.metaItem}>
                    <span style={S.metaLabel}>Eligibility</span>
                    <span style={S.metaValue}>{course.eligibility}</span>
                  </div>
                </div>

                <div style={S.feeRow}>
                  <span style={S.fee}>₹{course.fees.toLocaleString('en-IN')}</span>
                  <span style={S.seatPill(seatPct)}>
                    {course.available_seats}/{course.seats} seats
                  </span>
                </div>

                {user?.role === 'student' && (() => {
                  const isApplied = applications.some(app => 
                    app.course_id === course._id || app.courseId === course._id
                  );
                  return isApplied ? (
                    <span style={S.btnApplied}>Applied ✓</span>
                  ) : (
                    <Link to={`/apply?courseId=${course._id}`} style={S.btnApply}>
                      Apply now →
                    </Link>
                  );
                })()}
              </div>
            );
          })
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

export default Courses;