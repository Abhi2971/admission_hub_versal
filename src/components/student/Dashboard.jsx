import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStudentProfile, getStudentApplications } from '../../services/student';
import { getCreditBalance } from '../../services/credits';
import { getCourses } from '../../services/courses';
import { useAccess } from '../../context/AccessContext';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
  const { has_ai_access } = useAccess();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [credits, setCredits] = useState(0);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [milestones, setMilestones] = useState([]);

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
      const [profileRes, appsRes, creditRes, coursesRes] = await Promise.all([
        getStudentProfile(),
        getStudentApplications(),
        getCreditBalance(),
        getCourses({ per_page: 6 })
      ]);
      setProfile(profileRes.data);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
      setCredits(creditRes.data.balance);
      setFeaturedCourses(coursesRes.data.courses || []);
      
      const apps = Array.isArray(appsRes.data) ? appsRes.data : [];
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
        offerRate: apps.length > 0 ? Math.round(((statusCounts.offered + statusCounts.confirmed) / apps.length) * 100) : 0
      });

      setMilestones([
        { id: 1, title: 'Complete Profile', done: !!profileRes.data.name, icon: '👤' },
        { id: 2, title: 'Browse Courses', done: true, icon: '📚' },
        { id: 3, title: 'Submit Applications', done: apps.length > 0, icon: '📝' },
        { id: 4, title: 'Upload Documents', done: apps.some(a => a.documents?.length > 0), icon: '📄' },
        { id: 5, title: 'Confirm Admission', done: statusCounts.confirmed > 0, icon: '🎓' },
      ]);
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

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

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
    shortlisted: { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', label: 'Shortlisted' },
    offered: { bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', label: 'Offered' },
    confirmed: { bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#0d9488', label: 'Confirmed' },
    rejected: { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', label: 'Rejected' },
  };

  const quickLinks = [
    { icon: '📚', label: 'Browse Courses', path: '/student/courses', desc: 'Find courses', color: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
    { icon: '🏛️', label: 'Colleges', path: '/student/colleges', desc: 'Explore', color: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
    { icon: '🏢', label: 'Universities', path: '/student/universities', desc: 'Browse', color: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
    { icon: '📝', label: 'Applications', path: '/student/applications', desc: 'Track status', color: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
    { icon: '👤', label: 'Edit Profile', path: '/student/profile', desc: 'Update info', color: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
    { icon: '📄', label: 'Documents', path: '/student/documents', desc: 'Upload docs', color: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.greeting}>{greeting()}, {profile?.name?.split(' ')[0] || 'Student'}</h1>
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
          <div style={styles.creditBadge}>
            <span style={styles.creditIcon}>⚡</span>
            <span style={styles.creditText}>{credits}</span>
          </div>
          <div style={styles.avatar}>{initials}</div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Progress Tracker */}
      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <h2 style={styles.progressTitle}>Your Admission Journey</h2>
          <span style={styles.progressStep}>{milestones.filter(m => m.done).length}/{milestones.length} Complete</span>
        </div>
        <div style={styles.progressTrack}>
          {milestones.map((milestone, index) => (
            <div key={milestone.id} style={styles.milestoneWrap}>
              <div style={{
                ...styles.milestoneIcon,
                backgroundColor: milestone.done ? '#D1FAE5' : '#F3F4F6',
                color: milestone.done ? '#047857' : '#9CA3AF',
                border: milestone.done ? '2px solid #10B981' : '2px solid #E5E7EB',
              }}>
                {milestone.done ? '✓' : milestone.icon}
              </div>
              {index < milestones.length - 1 && (
                <div style={{
                  ...styles.milestoneLine,
                  backgroundColor: milestone.done ? '#10B981' : '#E5E7EB',
                }} />
              )}
              <span style={{
                ...styles.milestoneLabel,
                color: milestone.done ? '#374151' : '#9CA3AF',
                fontWeight: milestone.done ? '500' : '400',
              }}>
                {milestone.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#EFF6FF' }}>
            <span style={styles.statIcon}>📋</span>
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statNumber}>{stats?.total || 0}</span>
            <span style={styles.statLabel}>Total Applications</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#ECFDF5' }}>
            <span style={styles.statIcon}>✅</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#059669' }}>{stats?.offerRate || 0}%</span>
            <span style={styles.statLabel}>Success Rate</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#EDE9FE' }}>
            <span style={styles.statIcon}>🏆</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#7C3AED' }}>{stats?.confirmed || 0}</span>
            <span style={styles.statLabel}>Confirmed</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, backgroundColor: '#FEF3C7' }}>
            <span style={styles.statIcon}>⏳</span>
          </div>
          <div style={styles.statInfo}>
            <span style={{ ...styles.statNumber, color: '#D97706' }}>{stats?.offered || 0}</span>
            <span style={styles.statLabel}>Offers Pending</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Profile Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Your Profile</h2>
              <Link to="/student/profile" style={styles.editLink}>Edit</Link>
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileAvatar}>{initials}</div>
              <div style={styles.profileDetails}>
                <h3 style={styles.profileName}>{profile?.name || 'Student'}</h3>
                <p style={styles.profileEmail}>{profile?.email || 'No email'}</p>
                <p style={styles.profileMobile}>{profile?.mobile || 'No mobile'}</p>
              </div>
            </div>
            <div style={styles.profileStats}>
              <div style={styles.profileStat}>
                <span style={styles.profileStatValue}>{profile?.preferred_course || 'Not set'}</span>
                <span style={styles.profileStatLabel}>Preferred Course</span>
              </div>
              <div style={styles.profileStat}>
                <span style={styles.profileStatValue}>{profile?.location || 'Not set'}</span>
                <span style={styles.profileStatLabel}>Location</span>
              </div>
            </div>
            <Link to="/student/credits/purchase" style={styles.buyCreditsLink}>
              <span style={styles.buyCreditsIcon}>⚡</span>
              <span>Buy more credits</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
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
          {/* Featured Courses */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Featured Courses</h2>
              <Link to="/student/courses" style={styles.viewAllLink}>Browse All</Link>
            </div>
            <div style={styles.coursesGrid}>
              {featuredCourses.slice(0, 4).map((course, i) => {
                const isApplied = applications.some(app => 
                  app.course_id === course._id || app.courseId === course._id
                );
                return (
                  <div key={course._id || i} style={styles.courseCard}>
                    <div style={styles.courseHeader}>
                      <div style={styles.courseIcon}>{(course.course_name || 'C')[0].toUpperCase()}</div>
                      <span style={styles.courseDomain}>{course.domain || 'General'}</span>
                    </div>
                    <h3 style={styles.courseName}>{course.course_name}</h3>
                    <p style={styles.courseCollege}>{course.college_name}</p>
                    <div style={styles.courseMeta}>
                      <span style={styles.courseFees}>₹{course.fees?.toLocaleString()}</span>
                      {isApplied ? (
                        <span style={styles.courseAppliedBtn}>Applied</span>
                      ) : (
                        <Link 
                          to={`/apply?courseId=${course._id}`} 
                          style={styles.courseApplyBtn}
                        >
                          Apply Now
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Status */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Application Status</h2>
              <Link to="/student/applications" style={styles.viewAllLink}>View All</Link>
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
              <Link to="/student/applications" style={styles.viewAllLink}>View All</Link>
            </div>
            {recentApps.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>📭</span>
                <p style={styles.emptyText}>No applications yet</p>
                <Link to="/student/courses" style={styles.browseLink}>Browse Courses</Link>
              </div>
            ) : (
              <div style={styles.appList}>
                {recentApps.map((app, i) => {
                  const status = statusConfig[app.status] || statusConfig.applied;
                  return (
                    <div key={app._id || i} style={styles.appItem}>
                      <div style={{ ...styles.appIcon, background: status.bg, color: status.color }}>
                        {(app.course_name || app.college_name || 'C')[0].toUpperCase()}
                      </div>
                      <div style={styles.appInfo}>
                        <span style={styles.appCourse}>{app.course_name || 'Course'}</span>
                        <span style={styles.appCollege}>{app.college_name || 'College'}</span>
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

          {/* AI Advisor Promo */}
          {has_ai_access ? (
            <div style={styles.aiPromo}>
              <div style={styles.aiPromoContent}>
                <div style={styles.aiPromoIcon}>🤖</div>
                <div>
                  <h3 style={styles.aiPromoTitle}>AI Advisor</h3>
                  <p style={styles.aiPromoText}>Get personalized course recommendations and admission guidance</p>
                </div>
              </div>
              <Link to="/student/ai" style={styles.aiPromoBtn}>
                Chat Now
              </Link>
            </div>
          ) : (
            <div style={{ ...styles.aiPromo, background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }}>
              <div style={styles.aiPromoContent}>
                <div style={styles.aiPromoIcon}>🔒</div>
                <div>
                  <h3 style={styles.aiPromoTitle}>Unlock AI Advisor</h3>
                  <p style={styles.aiPromoText}>Get AI-powered course recommendations and admission guidance</p>
                </div>
              </div>
              <Link to="/student/credits/purchase" style={{ ...styles.aiPromoBtn, backgroundColor: '#fff', color: '#4B5563' }}>
                Enable Now
              </Link>
            </div>
          )}
        </div>
      </div>
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
  creditBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    border: '1px solid #f59e0b',
    borderRadius: '24px',
    padding: '8px 16px',
    boxShadow: '0 2px 10px rgba(245,158,11,0.2)',
  },
  creditIcon: {
    fontSize: '16px',
  },
  creditText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#92400e',
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
  progressCard: {
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    border: '1px solid rgba(226,232,240,0.8)',
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  progressTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  progressStep: {
    fontSize: '13px',
    color: '#0ea5e9',
    fontWeight: '600',
  },
  progressTrack: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  milestoneWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  milestoneIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },
  milestoneLine: {
    position: 'absolute',
    top: '22px',
    left: 'calc(50% + 22px)',
    width: 'calc(100% - 44px)',
    height: '3px',
    borderRadius: '2px',
  },
  milestoneLabel: {
    fontSize: '11px',
    marginTop: '10px',
    textAlign: 'center',
    maxWidth: '80px',
    fontWeight: '500',
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
  buyCreditsLink: {
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
  buyCreditsIcon: {
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
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  courseCard: {
    padding: '14px',
    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  courseIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 10px rgba(14,165,233,0.3)',
  },
  courseDomain: {
    fontSize: '10px',
    padding: '4px 10px',
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#1d4ed8',
    borderRadius: '20px',
    fontWeight: '600',
  },
  courseName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  courseCollege: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  courseMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  courseFees: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#10b981',
  },
  courseApplyBtn: {
    fontSize: '12px',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: '#FFFFFF',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    boxShadow: '0 4px 10px rgba(14,165,233,0.3)',
  },
  courseAppliedBtn: {
    fontSize: '12px',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    color: '#059669',
    borderRadius: '8px',
    fontWeight: '600',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
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
  browseLink: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#0ea5e9',
    textDecoration: 'none',
    fontWeight: '600',
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

export default StudentDashboard;
