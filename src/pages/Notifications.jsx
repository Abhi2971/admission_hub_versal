import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <Loader size="lg" />;

  const S = {
    container: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '1.5rem 2rem',
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    backBtn: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
    },
    subtitle: {
      fontSize: '13px',
      color: '#6B7280',
      margin: '4px 0 0 0',
    },
    markAllBtn: {
      padding: '10px 20px',
      backgroundColor: '#185FA5',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    content: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
    },
    notifItem: (unread) => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #F3F4F6',
      backgroundColor: unread ? '#F8FAFC' : '#FFFFFF',
      borderLeft: unread ? '4px solid #185FA5' : '4px solid transparent',
    }),
    iconWrap: (type) => ({
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0,
      backgroundColor: type === 'offer' ? '#ECFDF5' : type === 'reminder' ? '#FEF3C7' : '#EFF6FF',
    }),
    contentWrap: {
      flex: 1,
      minWidth: 0,
    },
    notifTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
    },
    notifMessage: {
      fontSize: '13px',
      color: '#6B7280',
      margin: '4px 0 0 0',
      lineHeight: 1.5,
    },
    notifTime: {
      fontSize: '12px',
      color: '#9CA3AF',
      margin: '8px 0 0 0',
    },
    markReadBtn: {
      fontSize: '12px',
      color: '#185FA5',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      marginTop: '8px',
    },
    emptyState: {
      padding: '3rem',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px 0',
    },
    emptyText: {
      fontSize: '14px',
      color: '#6B7280',
      margin: 0,
    },
  };

  const getIcon = (type) => {
    switch (type) {
      case 'offer': return '🎉';
      case 'reminder': return '⏰';
      case 'info': return 'ℹ️';
      default: return '📬';
    }
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <button 
            style={S.backBtn}
            onClick={() => navigate(-1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1 style={S.title}>Notifications</h1>
            <p style={S.subtitle}>{unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button style={S.markAllBtn} onClick={handleMarkAllRead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Mark All Read
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div style={S.content}>
        {notifications.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>🔔</div>
            <h3 style={S.emptyTitle}>No notifications yet</h3>
            <p style={S.emptyText}>You'll see updates about your applications here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif._id || notif.id} style={S.notifItem(!notif.read)}>
              <div style={S.iconWrap(notif.type)}>
                {getIcon(notif.type)}
              </div>
              <div style={S.contentWrap}>
                <h3 style={S.notifTitle}>{notif.title || 'Notification'}</h3>
                <p style={S.notifMessage}>{notif.message}</p>
                <p style={S.notifTime}>{notif.time || notif.created_at}</p>
                {!notif.read && (
                  <button 
                    style={S.markReadBtn}
                    onClick={() => setNotifications(prev => 
                      prev.map(n => (n._id || n.id) === (notif._id || notif.id) ? { ...n, read: true } : n)
                    )}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
