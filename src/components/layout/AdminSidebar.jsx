import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccess } from '../../context/AccessContext';

const SIDEBAR_WIDTH = 260;

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const { has_ai_access, ai_credits, subscription } = useAccess();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/admin', label: 'Dashboard', icon: 'home' },
      ]
    },
    {
      title: 'College',
      items: [
        { path: '/admin/my-college', label: 'My College', icon: 'building' },
        { path: '/admin/analytics', label: 'Analytics', icon: 'chart' },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/admin/courses', label: 'Courses', icon: 'book' },
        { path: '/admin/seat-allocation', label: 'Seat Allocation', icon: 'seat' },
        { path: '/admin/applications', label: 'Applications', icon: 'file' },
      ]
    },
    {
      title: 'Account',
      items: [
        { path: '/admin/subscription', label: 'Subscription', icon: 'card' },
      ]
    },
    ...(has_ai_access ? [{
      title: 'AI Tools',
      items: [
        { path: '/admin/ai', label: 'AI Assistant', icon: 'ai', highlight: true },
      ]
    }] : [])
  ];

  const filteredMenuSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.requiresSubscription || subscription)
  }));

  const getIcon = (type, active) => {
    const color = active ? '#0ea5e9' : '#64748b';
    const icons = {
      home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      building: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
      ),
      chart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
      book: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
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
      edit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
      seat: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <rect x="3" y="12" width="18" height="8" rx="2"/>
          <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
          <path d="M7 12V8"/>
          <path d="M17 12V8"/>
        </svg>
      ),
      logout: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
    };
    return icons[type] || icons.home;
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CA';

  return (
    <div style={{
      width: SIDEBAR_WIDTH,
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
        padding: '16px 20px',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
          }}>
            C
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              College
            </div>
            <div style={{
              fontSize: 11,
              color: '#64748b',
            }}>
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Badge */}
      {subscription && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(2,132,199,0.1))',
          border: '1px solid rgba(14,165,233,0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>✨</span>
          <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, flex: 1 }}>{subscription.plan_name || 'Active'}</span>
          {has_ai_access && (
            <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>
              🤖 {ai_credits === -1 ? '∞' : ai_credits}
            </span>
          )}
        </div>
      )}
      {!subscription && (
        <Link to="/admin/subscription" style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.1))',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
        }}>
          <span style={{ fontSize: '14px' }}>⚠️</span>
          <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>No subscription</span>
        </Link>
      )}

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 8px',
      }}>
        {filteredMenuSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              padding: '0 16px',
            }}>{section.title}</h3>
            {section.items.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    marginBottom: 4,
                    borderRadius: 12,
                    textDecoration: 'none',
                    color: active ? '#0ea5e9' : '#475569',
                    background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.05))' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                    border: active ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIcon(item.icon, active)}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.highlight && !active && (
                    <span style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 8,
                    }}>
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(226,232,240,0.8)',
        background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
      }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            marginBottom: 8,
            borderRadius: 12,
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: 14,
            fontWeight: 500,
            width: '100%',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon('logout', false)}
          </span>
          <span>Sign Out</span>
        </button>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          borderRadius: 14,
          border: '1px solid rgba(226,232,240,0.8)',
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name?.split(' ')[0] || 'Admin'}
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
      </div>
    </div>
  );
};

export default AdminSidebar;
