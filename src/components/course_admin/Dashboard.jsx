import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://admission-hub-render.onrender.com';

const CourseAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    courses: [],
    applications: []
  });
  const [stats, setStats] = useState({
    courses: 0, applications: 0, pendingReview: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [coursesRes, appsRes] = await Promise.all([
        fetch(`${API_URL}/api/course-admin/courses`, { headers }),
        fetch(`${API_URL}/api/course-admin/applications`, { headers }).catch(() => ({ json: () => ({ applications: [] }) }))
      ]);

      const [coursesData, appsData] = await Promise.all([
        coursesRes.json(), appsRes.json()
      ]);

      setData({
        courses: coursesData.courses || [],
        applications: appsData.applications || []
      });

      const pending = (appsData.applications || []).filter(a => a.status === 'applied' || a.status === 'under_review').length;
      setStats({
        courses: coursesData.courses?.length || 0,
        applications: appsData.applications?.length || 0,
        pendingReview: pending
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/course-admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchAllData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    tabs: { display: 'flex', gap: '6px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8))', padding: '6px', borderRadius: '14px', width: 'fit-content', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    tab: (active) => ({ padding: '10px 20px', cursor: 'pointer', borderRadius: '10px', fontSize: '14px', fontWeight: '600', background: active ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'transparent', color: active ? '#FFFFFF' : '#64748b', border: 'none', boxShadow: active ? '0 4px 14px rgba(20,184,166,0.4)' : 'none', transition: 'all 0.2s ease' }),
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' },
    statValue: { fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    statLabel: { fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '500' },
    section: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(226,232,240,0.8)', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' },
    badge: (color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${color}20, ${color}10)`, color }),
    badgeStatus: (status) => {
      const colors = { applied: '#3B82F6', under_review: '#F59E0B', shortlisted: '#10B981', rejected: '#EF4444', offered: '#8B5CF6', confirmed: '#059669' };
      return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${colors[status]}20, ${colors[status]}10)`, color: colors[status] || '#6B7280' };
    },
    btn: (variant) => ({ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', border: 'none', background: variant === 'primary' ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : variant === 'danger' ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: variant === 'outline' ? '#475569' : 'white', marginLeft: '8px', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: variant !== 'outline' ? '0 4px 14px rgba(0,0,0,0.1)' : 'none' }),
    select: { padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#ffffff', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s ease' }
  };

  const renderOverview = () => (
    <>
      <div style={{ ...styles.section, background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)', animation: 'shimmer 3s ease-in-out infinite' }} />
        <h3 style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0', fontWeight: '600', letterSpacing: '1px' }}>MY DEPARTMENT</h3>
        <h2 style={{ fontSize: '26px', fontWeight: '700', margin: 0 }}>{stats.courses} Courses</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Department Admin Dashboard</p>
      </div>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><p style={styles.statValue}>{stats.courses}</p><p style={styles.statLabel}>Courses</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#3B82F6'}}>{stats.applications}</p><p style={styles.statLabel}>Applications</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#F59E0B'}}>{stats.pendingReview}</p><p style={styles.statLabel}>Pending Review</p></div>
      </div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Applications</h3>
        {data.applications.slice(0, 5).map(a => (
          <div key={a._id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{a.student_name || 'Student'}</strong><br/>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{a.course_name || 'Course'}</span>
            </div>
            <span style={styles.badgeStatus(a.status)}>{a.status}</span>
          </div>
        ))}
        {data.applications.length === 0 && <p style={{ color: '#6B7280' }}>No applications yet</p>}
      </div>
    </>
  );

  const renderCourses = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>My Courses ({data.courses.length})</h2>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Course Name</th><th style={styles.th}>Department</th><th style={styles.th}>Seats</th><th style={styles.th}>Fees</th><th style={styles.th}>Actions</th></tr></thead>
        <tbody>
          {data.courses.map(c => (
            <tr key={c._id}>
              <td style={styles.td}><strong>{c.course_name}</strong></td>
              <td style={styles.td}>{c.department}</td>
              <td style={styles.td}>{c.available_seats}/{c.seats}</td>
              <td style={styles.td}>₹{c.fees}</td>
              <td style={styles.td}><button style={styles.btn('outline')}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderApplications = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Applications ({data.applications.length})</h2>
      </div>
      {data.applications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No applications yet</p>
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Student</th><th style={styles.th}>Course</th><th style={styles.th}>Status</th><th style={styles.th}>Applied</th><th style={styles.th}>Update Status</th></tr></thead>
          <tbody>
            {data.applications.map(a => (
              <tr key={a._id}>
                <td style={styles.td}><strong>{a.student_name || 'N/A'}</strong></td>
                <td style={styles.td}>{a.course_name || 'N/A'}</td>
                <td style={styles.td}><span style={styles.badgeStatus(a.status)}>{a.status}</span></td>
                <td style={styles.td}>{a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A'}</td>
                <td style={styles.td}>
                  <select style={styles.select} value={a.status} onChange={e => handleUpdateStatus(a._id, e.target.value)}>
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="offered">Offered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) return <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Department Dashboard</h1>
        <span style={{ fontSize: '14px', color: '#6B7280' }}>Department Admin</span>
      </div>

      <div style={styles.tabs}>
        {['overview', 'courses', 'applications'].map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'courses' && renderCourses()}
      {activeTab === 'applications' && renderApplications()}
    </div>
  );
};

export default CourseAdminDashboard;
