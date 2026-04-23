import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCollegeApplications, getCollegeCourses, getMyCollege } from '../../services/admin';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAccess } from '../../context/AccessContext';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = ({ tab = 'overview' }) => {
  const { hasActive, subscription } = useSubscription();
  const { has_ai_access } = useAccess();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myCollege, setMyCollege] = useState(null);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  // Update activeTab when tab prop changes
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data.slice(0, 3) : []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [collegeRes, appsRes, coursesRes] = await Promise.all([
        getMyCollege(),
        getCollegeApplications({ page: 1, per_page: 50 }),
        getCollegeCourses(),
      ]);
      
      setMyCollege(collegeRes.data);
      setApplications(Array.isArray(appsRes.data.applications) ? appsRes.data.applications : []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      
      const apps = Array.isArray(appsRes.data.applications) ? appsRes.data.applications : [];
      const statusCounts = {
        applied: apps.filter(a => a.status === 'applied').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        offered: apps.filter(a => a.status === 'offered').length,
        confirmed: apps.filter(a => a.status === 'confirmed').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
      };
      
      setStats({
        total: apps.length,
        ...statusCounts,
        pendingRate: apps.length > 0 ? Math.round((statusCounts.applied / apps.length) * 100) : 0,
        conversionRate: apps.length > 0 ? Math.round(((statusCounts.offered + statusCounts.confirmed) / apps.length) * 100) : 0
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh the page.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, [fetchData, fetchNotifications]);

  if (loading) return <Loader size="lg" />;

  const initials = myCollege?.name
    ? myCollege.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CA';

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
    .slice(0, 5);

  const statusConfig = {
    applied: { bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8', label: 'Applied' },
    under_review: { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', label: 'Under Review' },
    shortlisted: { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', label: 'Shortlisted' },
    offered: { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', label: 'Offered' },
    confirmed: { bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#0d9488', label: 'Confirmed' },
    rejected: { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', label: 'Rejected' },
  };

  const quickLinks = [
    { icon: '📚', label: 'Manage Courses', path: '/admin/courses', desc: 'Add & edit', color: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
    { icon: '📝', label: 'Applications', path: '/admin/applications', desc: 'Review apps', color: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
    { icon: '👥', label: 'Dept Admins', path: '/admin/dept-admins', desc: 'Manage team', color: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
    { icon: '🏛️', label: 'My College', path: '/admin/my-college', desc: 'College info', color: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
    { icon: '📊', label: 'Analytics', path: '/admin/analytics', desc: 'View stats', color: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
    { icon: '🤖', label: 'AI Assistant', path: '/admin/ai', desc: 'Get help', color: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatNotifTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN');
  };

  const getPlanBadge = () => {
    if (!subscription || subscription.status !== 'active') {
      return { label: 'No Plan', color: '#dc2626', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)' };
    }
    const planColors = {
      'Basic': { label: 'Basic', color: '#6b7280', bg: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' },
      'Pro': { label: 'Pro', color: '#7c3aed', bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
      'Enterprise': { label: 'Enterprise', color: '#059669', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
    };
    const planName = subscription.plan?.name || 'Basic';
    return planColors[planName] || planColors['Basic'];
  };

  const planBadge = getPlanBadge();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.greeting}>{greeting()}, Admin</h1>
          <p style={styles.date}>{today}</p>
        </div>
        <div style={styles.headerRight}>
          <Link to="/notifications" style={styles.notificationBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
          <div style={{ ...styles.membershipBadge, background: planBadge.bg }}>
            <span style={{ ...styles.membershipIcon, color: planBadge.color }}>👑</span>
            <span style={{ ...styles.membershipText, color: planBadge.color }}>{planBadge.label}</span>
          </div>
          <div style={styles.avatar}>{initials}</div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#EFF6FF' }}>
            <span style={styles.statIcon}>📚</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statNumber}>{courses.length}</span>
            <span style={styles.statLabel}>Total Courses</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#ECFDF5' }}>
            <span style={styles.statIcon}>📝</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#059669' }}>{stats?.total || 0}</span>
            <span style={styles.statLabel}>Applications</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#FEF3C7' }}>
            <span style={styles.statIcon}>⏳</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#D97706' }}>{stats?.applied || 0}</span>
            <span style={styles.statLabel}>Pending Review</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#EDE9FE' }}>
            <span style={styles.statIcon}>✅</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#7C3AED' }}>{stats?.confirmed || 0}</span>
            <span style={styles.statLabel}>Confirmed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }} 
          onClick={() => { setActiveTab('overview'); navigate('/admin'); }}
        >
          Overview
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'applications' ? styles.tabActive : {}) }} 
          onClick={() => { setActiveTab('applications'); navigate('/admin/applications'); }}
        >
          Applications
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'courses' ? styles.tabActive : {}) }} 
          onClick={() => { setActiveTab('courses'); navigate('/admin/courses'); }}
        >
          Courses
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'overview' && (
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* College Info Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>My College</h2>
              <Link to="/admin/my-college" style={styles.editLink}>Edit</Link>
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileAvatar}>{initials}</div>
              <div style={styles.profileDetails}>
                <h3 style={styles.profileName}>{myCollege?.name || 'College'}</h3>
                <p style={styles.profileEmail}>{myCollege?.city}, {myCollege?.state}</p>
                <p style={styles.profileMobile}>{myCollege?.contact_email}</p>
              </div>
            </div>
            <div style={styles.profileStats}>
              <div style={styles.profileStat}>
                <span style={styles.profileStatValue}>{myCollege?.contact_phone || 'Not set'}</span>
                <span style={styles.profileStatLabel}>Phone</span>
              </div>
              <div style={styles.profileStat}>
                <span style={styles.profileStatValue}>{courses.length}</span>
                <span style={styles.profileStatLabel}>Active Courses</span>
              </div>
            </div>
            {!hasActive && (
              <Link to="/admin/subscription" style={styles.upgradeLink}>
                <span style={styles.upgradeIcon}>👑</span>
                <span>Upgrade Plan</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            )}
          </div>

          {/* Quick Actions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Quick Actions</h2>
            </div>
            <div style={styles.quickActions}>
              {quickLinks.map((link, i) => (
                <Link key={i} to={link.path} style={styles.quickAction}>
                  <div style={{ ...styles.quickIcon, backgroundColor: link.color }}>{link.icon}</div>
                  <div style={styles.quickInfo}>
                    <span style={styles.quickLabel}>{link.label}</span>
                    <span style={styles.quickDesc}>{link.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications Preview */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Updates</h2>
              <Link to="/notifications" style={styles.viewAllLink}>View All</Link>
            </div>
            <div style={styles.notifList}>
              {notifications.length === 0 ? (
                <div style={{ ...styles.notifItem, justifyContent: 'center', color: '#6B7280' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map(notif => (
                  <Link to="/notifications" key={notif._id || notif.id} style={{
                    ...styles.notifItem,
                    backgroundColor: notif.read ? '#FFFFFF' : '#EFF6FF',
                    textDecoration: 'none',
                  }}>
                    <div style={{
                      ...styles.notifDot,
                      backgroundColor: notif.read ? '#D1D5DB' : '#185FA5',
                    }} />
                    <div style={styles.notifContent}>
                      <span style={styles.notifMessage}>{notif.title || notif.message || 'New notification'}</span>
                      <span style={styles.notifTime}>{formatNotifTime(notif.created_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Application Status */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Application Status</h2>
              <Link to="/admin/applications" style={styles.viewAllLink}>View All</Link>
            </div>
            <div style={styles.statusGrid}>
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} style={styles.statusItem}>
                  <div style={{ ...styles.statusDot, background: config.color }} />
                  <span style={styles.statusLabel}>{config.label}</span>
                  <span style={{ ...styles.statusCount, color: config.color }}>
                    {stats?.[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Applications</h2>
              <Link to="/admin/applications" style={styles.viewAllLink}>View All</Link>
            </div>
            {recentApps.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No applications yet</p>
              </div>
            ) : (
              <div style={styles.appList}>
                {recentApps.map((app, i) => {
                  const status = statusConfig[app.status] || statusConfig.applied;
                  return (
                    <div key={app._id || i} style={styles.appItem}>
                      <div style={{ ...styles.appIcon, background: status.bg, color: status.color }}>
                        {(app.student_name || 'S')[0].toUpperCase()}
                      </div>
                      <div style={styles.appInfo}>
                        <span style={styles.appCourse}>{app.student_name || 'Student'}</span>
                        <span style={styles.appCollege}>{app.course_name || 'Course'}</span>
                      </div>
                      <div style={{ ...styles.appStatus, background: status.bg, color: status.color }}>
                        {status.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Assistant Promo */}
          {has_ai_access ? (
            <div style={styles.aiPromo}>
              <div style={styles.aiPromoContent}>
                <div style={styles.aiPromoIcon}>🤖</div>
                <div>
                  <h3 style={styles.aiPromoTitle}>AI Assistant</h3>
                  <p style={styles.aiPromoText}>Get AI-powered insights for your college</p>
                </div>
              </div>
              <Link to="/admin/ai" style={styles.aiPromoBtn}>
                Open Chat
              </Link>
            </div>
          ) : (
            <div style={{ ...styles.aiPromo, background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }}>
              <div style={styles.aiPromoContent}>
                <div style={styles.aiPromoIcon}>🔒</div>
                <div>
                  <h3 style={styles.aiPromoTitle}>Unlock AI Assistant</h3>
                  <p style={styles.aiPromoText}>Get AI-powered insights for your college admissions</p>
                </div>
              </div>
              <Link to="/admin/subscription" style={{ ...styles.aiPromoBtn, backgroundColor: '#fff', color: '#4B5563' }}>
                Enable Now
              </Link>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Applications Tab Content */}
      {activeTab === 'applications' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📝 Applications ({applications.length})</h2>
          </div>
          {applications.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No applications yet</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Applied</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 20).map(app => (
                  <tr key={app._id} style={{ transition: 'background 0.2s' }}>
                    <td style={styles.td}><strong>{app.student_name || 'N/A'}</strong></td>
                    <td style={styles.td}>{app.course_name || 'N/A'}</td>
                    <td style={styles.td}>
                      <span style={styles.badgeStatus(app.status)}>
                        {app.status?.replace('_', ' ').toUpperCase() || 'APPLIED'}
                      </span>
                    </td>
                    <td style={styles.td}>{app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}</td>
                    <td style={styles.td}>
                      <Link to={`/admin/applications/${app._id}/documents`} style={styles.viewBtn}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Courses Tab Content */}
      {activeTab === 'courses' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>📚 Courses ({courses.length})</h2>
            <Link to="/admin/courses" style={styles.addBtn}>+ Add Course</Link>
          </div>
          {courses.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📚</span>
              <p style={styles.emptyText}>No courses added yet</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Domain</th>
                  <th style={styles.th}>Seats</th>
                  <th style={styles.th}>Fees</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id} style={{ transition: 'background 0.2s' }}>
                    <td style={styles.td}><strong>{course.course_name}</strong></td>
                    <td style={styles.td}>{course.department}</td>
                    <td style={styles.td}><span style={styles.badge('#185FA5')}>{course.domain}</span></td>
                    <td style={styles.td}><span style={{ fontWeight: '600', color: course.available_seats < 10 ? '#dc2626' : '#059669' }}>{course.available_seats}</span>/{course.seats}</td>
                    <td style={styles.td}>₹{course.fees?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '1.5rem 2rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    background: '#ffffff',
    padding: '8px',
    borderRadius: '12px',
    width: 'fit-content',
    border: '1px solid #e2e8f0',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    background: 'transparent',
    color: '#64748b',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
  },
  section: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  viewBtn: {
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  badgeStatus: (status) => {
    const colors = { 
      applied: '#3B82F6', 
      under_review: '#F59E0B', 
      shortlisted: '#10B981', 
      rejected: '#EF4444', 
      offered: '#8B5CF6', 
      confirmed: '#059669' 
    };
    return { 
      padding: '6px 12px', 
      borderRadius: '20px', 
      fontSize: '11px', 
      fontWeight: '600',
      background: `linear-gradient(135deg, ${colors[status] || '#6B7280'}15, ${colors[status] || '#6B7280'}10)`, 
      color: colors[status] || '#6B7280',
    };
  },
  badge: (color) => ({
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    background: `linear-gradient(135deg, ${color}15, ${color}10)`,
    color,
  }),
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(226,232,240,0.8)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  greeting: {
    fontSize: '26px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  date: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  notificationBtn: {
    position: 'relative',
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(244,63,94,0.5)',
  },
  membershipBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid',
    borderRadius: '24px',
    padding: '8px 16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  membershipIcon: {
    fontSize: '16px',
  },
  membershipText: {
    fontSize: '14px',
    fontWeight: '700',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#FFFFFF',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },
  errorBanner: {
    marginBottom: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  statIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '26px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0ea5e9',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
    fontWeight: '500',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '16px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  editLink: {
    fontSize: '13px',
    color: '#0ea5e9',
    textDecoration: 'none',
    fontWeight: '600',
  },
  viewAllLink: {
    fontSize: '13px',
    color: '#0ea5e9',
    textDecoration: 'none',
    fontWeight: '600',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  profileAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  profileEmail: {
    fontSize: '13px',
    color: '#0ea5e9',
    margin: '2px 0 0 0',
    fontWeight: '500',
  },
  profileMobile: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  profileStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  profileStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileStatValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileStatLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  upgradeLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '12px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  upgradeIcon: {
    fontSize: '16px',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  quickIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  quickInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  quickLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  quickDesc: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  notifList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  notifDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  notifContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  notifMessage: {
    fontSize: '13px',
    color: '#334155',
    fontWeight: '500',
  },
  notifTime: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  statusLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  statusCount: {
    fontSize: '20px',
    fontWeight: '700',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.5rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '42px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  appList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  appItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  appIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  appInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  appCourse: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  appCollege: {
    fontSize: '11px',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  appStatus: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  aiPromo: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #d946ef 100%)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  aiPromoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  aiPromoIcon: {
    fontSize: '36px',
  },
  aiPromoTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
  },
  aiPromoText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.9)',
    margin: '4px 0 0 0',
  },
  aiPromoBtn: {
    backgroundColor: '#FFFFFF',
    color: '#8b5cf6',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
  },
};

export default AdminDashboard;
