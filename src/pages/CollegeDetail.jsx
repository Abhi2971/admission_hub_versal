import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCollegeDetails, getCollegeCourses } from '../services/college';
import { getStudentApplications } from '../services/student';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    backgroundColor: '#f4f5f7',
    minHeight: '100vh',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6b7280',
    textDecoration: 'none',
    marginBottom: '1.25rem',
  },

  /* Hero */
  hero: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 18,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: '#185FA5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 600,
    color: '#E6F1FB',
    flexShrink: 0,
  },
  heroName:     { fontSize: 20, fontWeight: 500, color: '#111', margin: 0, marginBottom: 4 },
  heroLocation: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  heroPillRow:  { display: 'flex', gap: 8, flexWrap: 'wrap' },
  codePill: {
    fontSize: 11, fontWeight: 500, padding: '3px 10px',
    borderRadius: 100, background: '#f3f4f6', color: '#374151',
  },
  websiteLink: {
    fontSize: 11, fontWeight: 500, padding: '3px 10px',
    borderRadius: 100, background: '#E6F1FB', color: '#0C447C',
    textDecoration: 'none',
  },

  /* Two-col layout */
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 14,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.25rem',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 500,
    color: '#9ca3af',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  /* Info rows */
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  infoLabel: { fontSize: 11, color: '#9ca3af' },
  infoValue: { fontSize: 13, color: '#374151' },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.7,
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid #f3f4f6',
  },

  /* Courses */
  coursesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  countPill: {
    fontSize: 11, fontWeight: 500, padding: '3px 10px',
    borderRadius: 100, background: '#E6F1FB', color: '#0C447C',
  },
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  courseCard: {
    background: '#fafafa',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  courseName: { fontSize: 13, fontWeight: 500, color: '#111' },
  courseMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
  },
  metaLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.3px' },
  metaValue: { fontSize: 12, color: '#374151' },
  seatPill: (pct) => ({
    fontSize: 11, fontWeight: 500, padding: '3px 10px',
    borderRadius: 100, display: 'inline-block', marginTop: 2,
    background: pct > 50 ? '#EAF3DE' : pct > 20 ? '#FAEEDA' : '#FCEBEB',
    color:      pct > 50 ? '#27500A' : pct > 20 ? '#633806' : '#A32D2D',
  }),
  courseFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #e5e7eb',
  },
  fee: { fontSize: 15, fontWeight: 500, color: '#111' },
  btnApply: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: '1px solid #185FA5',
    background: '#185FA5',
    color: '#E6F1FB',
    textDecoration: 'none',
  },
  btnApplied: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    color: '#059669',
  },
  empty: {
    fontSize: 13, color: '#9ca3af',
    textAlign: 'center', padding: '2rem',
    border: '1px solid #e5e7eb', borderRadius: 10,
    background: '#fff',
  },
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const CollegeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, coursesRes] = await Promise.all([
          getCollegeDetails(id),
          getCollegeCourses(id),
        ]);
        setCollege(collegeRes.data);
        setCourses(coursesRes.data);
        
        if (user?.role === 'student') {
          try {
            const appsRes = await getStudentApplications();
            setApplications(appsRes.data || []);
          } catch (err) {
            console.error('Error fetching applications:', err);
          }
        }
      } catch {
        setError('Failed to load college details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  if (loading) return <Loader size="lg" />;
  if (error)   return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div style={S.page}>
      <Link to="/student/colleges" style={S.backLink}>← Back to colleges</Link>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.heroIcon}>
          {(college.name || 'C')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={S.heroName}>{college.name}</h1>
          <p style={S.heroLocation}>
            {[college.address, college.city, college.state].filter(Boolean).join(', ')}
          </p>
          <div style={S.heroPillRow}>
            {college.code && (
              <span style={S.codePill}>Code: {college.code}</span>
            )}
            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                style={S.websiteLink}
              >
                Visit website ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={S.layout}>
        {/* Left: contact info */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Contact & info</div>

          {[
            { label: 'Email', value: college.contact_email },
            { label: 'Phone', value: college.contact_phone },
            { label: 'City',  value: college.city },
            { label: 'State', value: college.state },
          ].filter(r => r.value).map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                ...S.infoRow,
                ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}),
              }}
            >
              <span style={S.infoLabel}>{row.label}</span>
              <span style={S.infoValue}>{row.value}</span>
            </div>
          ))}

          {college.description && (
            <p style={S.description}>{college.description}</p>
          )}
        </div>

        {/* Right: courses */}
        <div style={S.card}>
          <div style={S.coursesHeader}>
            <div style={{ ...S.sectionTitle, marginBottom: 0 }}>Courses offered</div>
            <span style={S.countPill}>
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          </div>

          {courses.length === 0 ? (
            <div style={S.empty}>No courses listed for this college.</div>
          ) : (
            <div style={S.courseGrid}>
              {courses.map((course) => {
                const seatPct = course.seats
                  ? Math.round((course.available_seats / course.seats) * 100)
                  : 100;
                return (
                  <div key={course._id} style={S.courseCard}>
                    <div style={S.courseName}>{course.course_name}</div>

                    <div style={S.courseMeta}>
                      <div>
                        <div style={S.metaLabel}>Duration</div>
                        <div style={S.metaValue}>{course.duration || '—'}</div>
                      </div>
                      <div>
                        <div style={S.metaLabel}>Eligibility</div>
                        <div style={S.metaValue}>{course.eligibility || '—'}</div>
                      </div>
                    </div>

                    {course.seats != null && (
                      <span style={S.seatPill(seatPct)}>
                        {course.available_seats}/{course.seats} seats
                      </span>
                    )}

                    <div style={S.courseFooter}>
                      <span style={S.fee}>
                        ₹{course.fees.toLocaleString('en-IN')}
                      </span>
                      {user?.role === 'student' && (() => {
                        const isApplied = applications.some(app => 
                          app.course_id === course._id || app.courseId === course._id
                        );
                        return isApplied ? (
                          <span style={S.btnApplied}>Applied ✓</span>
                        ) : (
                          <Link to={`/apply?courseId=${course._id}`} style={S.btnApply}>
                            Apply →
                          </Link>
                        );
                      })()}
                      {!user?.role && (
                        <Link to={`/apply?courseId=${course._id}`} style={S.btnApply}>
                          Apply →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDetail;