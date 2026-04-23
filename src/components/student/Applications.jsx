import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentApplications } from '../../services/student';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

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
    marginBottom: '1.75rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  title: { fontSize: 24, fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 },
  filterRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: 14,
    border: '1px solid rgba(226,232,240,0.8)',
  },
  filterBtn: (active) => ({
    fontSize: 13,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 20,
    border: active ? 'none' : '1px solid #e2e8f0',
    background: active ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    color: active ? '#ffffff' : '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: active ? '0 4px 14px rgba(14,165,233,0.4)' : 'none',
  }),
  grid: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  courseTitle: { fontSize: 17, fontWeight: 600, color: '#1e293b', margin: 0 },
  collegeName: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: 500 },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
    paddingTop: 14,
    borderTop: '1px solid #f1f5f9',
  },
  metaItem: { fontSize: 13, color: '#94a3b8' },
  metaVal: { fontSize: 13, color: '#334155', fontWeight: 600 },
  actionRow: {
    display: 'flex',
    gap: 10,
    paddingTop: 14,
    borderTop: '1px solid #f1f5f9',
  },
  btnLink: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    color: color === 'blue' ? '#ffffff' : '#ffffff',
    background: color === 'blue' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #10b981, #059669)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  }),
  empty: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 16,
    padding: '4rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 },
  emptyMsg: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
    marginBottom: '1.5rem',
  },
  summaryCard: (color) => ({
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: 14,
    padding: '1rem 1.25rem',
    textAlign: 'center',
    borderTop: `4px solid ${color}`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }),
  summaryNum: (color) => ({ fontSize: 28, fontWeight: 700, background: `linear-gradient(135deg, ${color}, ${color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }),
  summaryLbl: { fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 },
};

const STATUS_META = {
  applied:     { color: '#0ea5e9', bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', label: 'Applied' },
  shortlisted: { color: '#d97706', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', label: 'Shortlisted' },
  offered:     { color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', label: 'Offered' },
  confirmed:   { color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', label: 'Confirmed' },
  rejected:    { color: '#ef4444', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', label: 'Rejected' },
};

const FILTERS = ['all', 'applied', 'shortlisted', 'offered', 'confirmed', 'rejected'];

const StatusPill = ({ status }) => {
  const m = STATUS_META[status] || { color: '#374151', bg: '#f3f4f6', label: status };
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '4px 12px',
      borderRadius: 100, background: m.bg, color: m.color,
      flexShrink: 0,
    }}>
      {m.label}
    </span>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const response = await getStudentApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (error)   return <Alert type="error" message={error} onClose={() => setError('')} />;

  const counts = FILTERS.slice(1).reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {});

  const filtered = activeFilter === 'all'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  return (
    <div style={S.page}>
      {/* ── Top bar ── */}
      <div style={S.topbar}>
        <div>
          <h1 style={S.title}>My Applications</h1>
          <p style={S.sub}>{applications.length} total application{applications.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/student/courses" style={{ textDecoration: 'none' }}>
          <button style={S.btnPrimary}>Browse more courses →</button>
        </Link>
      </div>

      {/* ── Summary row ── */}
      {applications.length > 0 && (
        <div style={S.summaryRow}>
          {Object.entries(STATUS_META).map(([key, m]) => (
            <div
              key={key}
              style={S.summaryCard(m.color)}
              onClick={() => setActiveFilter(key)}
              title={`Filter by ${m.label}`}
            >
              <div style={S.summaryNum(m.color)}>{counts[key] ?? 0}</div>
              <div style={S.summaryLbl}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      {applications.length > 0 && (
        <div style={S.filterRow}>
          {FILTERS.map(f => (
            <button
              key={f}
              style={S.filterBtn(activeFilter === f)}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' ? `All (${applications.length})` : `${STATUS_META[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
      )}

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div style={S.empty}>
          <div style={S.emptyTitle}>
            {applications.length === 0 ? 'No applications yet' : `No ${activeFilter} applications`}
          </div>
          <div style={S.emptyMsg}>
            {applications.length === 0
              ? 'Start browsing courses and apply to get started.'
              : `You have no applications with status "${activeFilter}".`}
          </div>
          {applications.length === 0 && (
            <Link to="/student/courses" style={{ textDecoration: 'none' }}>
              <button style={S.btnPrimary}>Browse courses</button>
            </Link>
          )}
        </div>
      ) : (
        <div style={S.grid}>
          {filtered.map((app) => (
            <div key={app._id} style={S.card}>
              <div style={S.cardTop}>
                <div>
                  <p style={S.courseTitle}>{app.course_name}</p>
                  <p style={S.collegeName}>{app.college_name}</p>
                </div>
                <StatusPill status={app.status} />
              </div>

              <div style={S.metaRow}>
                <div>
                  <span style={S.metaItem}>Applied on &nbsp;</span>
                  <span style={S.metaVal}>
                    {new Date(app.applied_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                {app.fee && (
                  <div>
                    <span style={S.metaItem}>Fee &nbsp;</span>
                    <span style={S.metaVal}>₹{Number(app.fee).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {app.duration && (
                  <div>
                    <span style={S.metaItem}>Duration &nbsp;</span>
                    <span style={S.metaVal}>{app.duration}</span>
                  </div>
                )}
              </div>

              {app.status === 'offered' && (
                <div style={S.actionRow}>
                  <Link
                    to={`/student/documents?applicationId=${app._id}`}
                    style={S.btnLink('blue')}
                  >
                    View documents →
                  </Link>
                  <Link
                    to={`/apply?applicationId=${app._id}`}
                    style={S.btnLink('green')}
                  >
                    Confirm admission →
                  </Link>
                </div>
              )}

              {app.status === 'confirmed' && (
                <div style={S.actionRow}>
                  <Link
                    to={`/student/documents?applicationId=${app._id}`}
                    style={S.btnLink('blue')}
                  >
                    View documents →
                  </Link>
                  <Link
                    to={`/student/payments`}
                    style={S.btnLink('green')}
                  >
                    View payment →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentApplications;