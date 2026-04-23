import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAccess } from '../../context/AccessContext';
import { useSidebar } from '../../context/SidebarContext';
import { getCreditBalance } from '../../services/credits';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const StudentSidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { has_ai_access, ai_credits } = useAccess();
  const { collapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await getCreditBalance();
        setCreditBalance(res.data.balance);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path || 
    (path !== '/student' && location.pathname.startsWith(path + '/'));

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/student',
      icon: 'home',
    },
    {
      label: 'Browse Courses',
      path: '/student/courses',
      icon: 'book',
    },
    {
      label: 'Colleges',
      path: '/student/colleges',
      icon: 'building',
    },
    {
      label: 'Universities',
      path: '/student/universities',
      icon: 'graduation',
    },
    {
      label: 'Applications',
      path: '/student/applications',
      icon: 'file',
    },
    {
      label: 'Documents',
      path: '/student/documents',
      icon: 'document',
    },
    {
      label: 'Payments',
      path: '/student/payments',
      icon: 'card',
    },
    {
      label: has_ai_access ? 'AI Advisor' : 'Enable AI',
      path: has_ai_access ? '/student/ai' : '/student/credits/purchase',
      icon: 'ai',
      badge: has_ai_access ? (ai_credits === -1 ? '∞' : ai_credits) : null,
    },
    {
      label: 'Support',
      path: '/student/support',
      icon: 'help',
    },
  ];

  const bottomItems = [
    {
      label: 'Notifications',
      path: '/notifications',
      icon: 'bell',
      badge: unreadCount,
    },
    {
      label: 'Edit Profile',
      path: '/student/profile',
      icon: 'user',
    },
    {
      label: `${creditBalance} Credits`,
      path: '/student/credits/purchase',
      icon: 'credit',
    },
  ];

  const getIcon = (type, active) => {
    const color = active ? '#0ea5e9' : '#64748b';
    
    const icons = {
      home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      book: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      building: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
          <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/>
        </svg>
      ),
      graduation: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      file: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      document: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <path d="M9 15l2 2 4-4"/>
        </svg>
      ),
      card: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      ai: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
          <path d="M8 10h8"/>
          <path d="M8 14h4"/>
          <rect x="3" y="14" width="18" height="8" rx="2"/>
        </svg>
      ),
      help: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      bell: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
      credit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      user: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      logout: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      menu: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      ),
    };
    return icons[type] || icons.home;
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div style={{
      width: sidebarWidth,
      height: '100vh',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRight: '1px solid rgba(226,232,240,0.8)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '16px 8px' : '16px 20px',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        minHeight: 64,
        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      }}>
        {!collapsed && (
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
            }}>
              A
            </div>
            <span style={{
              fontSize: 17,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              AdmissionHub
            </span>
          </Link>
        )}
        {collapsed && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
          }}>
            A
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'transparent'; }}
          onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)'; e.target.style.color = '#64748b'; e.target.style.borderColor = '#e2e8f0'; }}
        >
          {collapsed ? getIcon('menu', false) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '8px',
      }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: 4,
                borderRadius: 12,
                textDecoration: 'none',
                color: active ? '#0ea5e9' : '#475569',
                background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1))' : 'transparent',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: active ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
                  e.currentTarget.style.color = '#0ea5e9';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getIcon(item.icon, active)}
              </span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span style={{
                      background: active ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                      color: active ? '#fff' : '#64748b',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 12,
                      minWidth: 20,
                      textAlign: 'center',
                      boxShadow: active ? '0 2px 8px rgba(14,165,233,0.3)' : 'none',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid rgba(226,232,240,0.8)',
        background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
      }}>
        {/* Bottom Items */}
        {bottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: 4,
                borderRadius: 12,
                textDecoration: 'none',
                color: active ? '#0ea5e9' : '#475569',
                background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1))' : 'transparent',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: 'all 0.2s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                border: active ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
                  e.currentTarget.style.color = '#0ea5e9';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getIcon(item.icon, active)}
              </span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge > 0 && (
                    <span style={{
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(244,63,94,0.3)',
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={logout}
          title={collapsed ? 'Sign Out' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '12px' : '12px 16px',
            marginTop: 8,
            borderRadius: 12,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: 14,
            fontWeight: 500,
            width: '100%',
            transition: 'all 0.2s ease',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #fee2e2)';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {getIcon('logout', false)}
          </span>
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* User Profile */}
        {!collapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px',
            marginTop: 12,
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            borderRadius: 14,
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
            }}>
              {initials}
            </div>
            <div style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1e293b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.name?.split(' ')[0] || 'Student'}
              </div>
              <div style={{
                fontSize: 12,
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSidebar;
