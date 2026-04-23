import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_WIDTH = 260;

const CourseAdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/course-admin', label: 'Dashboard', icon: 'home' },
      ]
    },
    {
      title: 'My Department',
      items: [
        { path: '/course-admin/my-department', label: 'Department Info', icon: 'building' },
      ]
    },
    {
      title: 'Course Management',
      items: [
        { path: '/course-admin/courses', label: 'My Courses', icon: 'book' },
      ]
    },
    {
      title: 'Admissions',
      items: [
        { path: '/course-admin/applications', label: 'Applications', icon: 'file' },
        { path: '/course-admin/manual-entry', label: 'Manual Entry', icon: 'edit' },
      ]
    },
    {
      title: 'AI Tools',
      items: [
        { path: '/course-admin/ai', label: 'AI Assistant', icon: 'ai', highlight: true },
      ]
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
      building: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
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
      ai: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
          <path d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/>
          <path d="M8 10h8"/>
          <path d="M8 14h4"/>
          <rect x="3" y="14" width="18" height="8" rx="2"/>
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

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DA';

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
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(20,184,166,0.4)',
          }}>
            D
          </div>
          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Department
            </div>
            <div style={{
              fontSize: 11,
              color: '#64748b',
            }}>
              Course Admin
            </div>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{
        margin: '12px 16px 0',
        padding: '10px 14px',
        background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(13,148,136,0.1))',
        border: '1px solid rgba(20,184,166,0.2)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '14px' }}>📋</span>
        <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>Course Management</span>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 8px',
      }}>
        {menuSections.map((section, idx) => (
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
                    background: active ? 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(13,148,136,0.05))' : 'transparent',
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                    border: active ? '1px solid rgba(20,184,166,0.2)' : '1px solid transparent',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIcon(item.icon, active)}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.highlight && !active && (
                    <span style={{
                      background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
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
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(20,184,166,0.4)',
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

export default CourseAdminSidebar;
