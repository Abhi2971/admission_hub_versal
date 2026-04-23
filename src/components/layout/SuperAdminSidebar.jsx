import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SuperAdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/superadmin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      ]
    },
    {
      title: 'Data Management',
      items: [
        { path: '/superadmin/universities', label: 'Universities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { path: '/superadmin/colleges', label: 'Colleges', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { path: '/superadmin/students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { path: '/superadmin/admins', label: 'Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      ]
    },
    {
      title: 'Plans Management',
      items: [
        { path: '/superadmin/plans', label: 'All Plans', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      ]
    },
    {
      title: 'Support',
      items: [
        { path: '/superadmin/support', label: 'Support Tickets', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/superadmin/analytics', label: 'Platform Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ]
    },
    {
      title: 'AI Tools',
      items: [
        { path: '/superadmin/ai', label: 'AI Assistant', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', highlight: true },
      ]
    },
  ];

  const getIcon = (path) => {
    const item = menuSections.flatMap(s => s.items).find(i => i.path === path);
    if (!item) return null;
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={item.icon} />
      </svg>
    );
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>👑</div>
          <div>
            <h1 style={styles.logoTitle}>Super Admin</h1>
            <p style={styles.logoSubtitle}>{user?.name || 'Administrator'}</p>
          </div>
        </div>
      </div>

      <div style={styles.roleBadge}>
        <span style={styles.roleIcon}>⚡</span>
        <span style={styles.roleText}>Platform Owner</span>
      </div>

      <div style={styles.menu}>
        {menuSections.map((section, idx) => (
          <div key={idx} style={styles.menuSection}>
            <h3 style={styles.menuSectionTitle}>{section.title}</h3>
            {section.items.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.menuItem,
                  ...(isActive(item.path) ? styles.menuItemActive : {}),
                  ...(item.highlight && !isActive(item.path) ? styles.menuItemHighlight : {}),
                }}
              >
                <span style={isActive(item.path) ? styles.menuItemIconActive : styles.menuItemIcon}>
                  {getIcon(item.path)}
                </span>
                <span style={isActive(item.path) ? styles.menuItemTextActive : styles.menuItemText}>
                  {item.label}
                </span>
                {item.highlight && !isActive(item.path) && (
                  <span style={styles.aiBadge}>AI</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={logout} style={styles.logoutBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
        <div style={styles.avatar}>{initials}</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0F172A',
    color: '#F9FAFB',
  },
  header: {
    padding: '20px 16px',
    borderBottom: '1px solid #1E293B',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
    margin: 0,
  },
  logoSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: '2px 0 0 0',
  },
  roleBadge: {
    margin: '12px 16px 0',
    padding: '8px 12px',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleIcon: {
    fontSize: '14px',
  },
  roleText: {
    fontSize: '12px',
    color: '#A78BFA',
    fontWeight: '500',
  },
  menu: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 8px',
  },
  menuSection: {
    marginBottom: '20px',
  },
  menuSectionTitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    padding: '0 12px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#94A3B8',
    marginBottom: '2px',
    transition: 'all 0.15s',
  },
  menuItemActive: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
  },
  menuItemHighlight: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    border: '1px solid rgba(124, 58, 237, 0.2)',
  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748B',
  },
  menuItemIconActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  menuItemText: {
    fontSize: '13px',
    fontWeight: '500',
  },
  menuItemTextActive: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiBadge: {
    marginLeft: 'auto',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontSize: '9px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoutBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#94A3B8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
  },
};

export default SuperAdminSidebar;
