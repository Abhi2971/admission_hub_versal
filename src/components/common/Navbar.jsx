import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const ROLE_LABELS = {
    student: 'Student',
    college_admin: 'Admin',
    super_admin: 'Super Admin',
  };

  const ROLE_DASHBOARD = {
    student: '/student',
    college_admin: '/admin',
    super_admin: '/superadmin',
  };

  const dashboardPath = ROLE_DASHBOARD[user?.role] || '/';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '1px solid rgba(226,232,240,0.8)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    }}>
      {/* Main Nav */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(14,165,233,0.4)',
          }}>
            A
          </div>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            AdmissionHub
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <Link
            to="/courses"
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: isActive('/courses') ? '#185FA5' : '#6b7280',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: isActive('/courses') ? '#f0f7ff' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            Courses
          </Link>
          <Link
            to="/colleges"
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: isActive('/colleges') ? '#185FA5' : '#6b7280',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: isActive('/colleges') ? '#f0f7ff' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            Colleges
          </Link>

          {isAuthenticated && (
            <>
              <div style={{
                width: 1,
                height: 20,
                backgroundColor: '#e5e7eb',
                margin: '0 8px',
              }} />
              <Link
                to={dashboardPath}
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: isActive(dashboardPath) ? '#185FA5' : '#6b7280',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: isActive(dashboardPath) ? '#f0f7ff' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                Dashboard
              </Link>
              {user?.role === 'student' && (
                <Link
                  to="/student/ai"
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: isActive('/student/ai') ? '#185FA5' : '#6b7280',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: isActive('/student/ai') ? '#f0f7ff' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  AI Advisor
                </Link>
              )}
            </>
          )}
        </div>

        {/* Auth Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'transparent',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </Link>

              {/* User Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px 6px 6px',
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #185FA5 0%, #0C447C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {getInitials(user?.name)}
                </div>
                <div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#374151',
                    lineHeight: 1.2,
                  }}>
                    {user?.name?.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 100,
                    backgroundColor: '#E6F1FB',
                    color: '#185FA5',
                    display: 'inline-block',
                    marginTop: 2,
                  }}>
                    {ROLE_LABELS[user?.role] || user?.role}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fecaca';
                  e.currentTarget.style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 20px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.15s',
                }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 20px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  backgroundColor: '#185FA5',
                  color: '#ffffff',
                  border: '1px solid #185FA5',
                  boxShadow: '0 2px 8px rgba(24, 95, 165, 0.25)',
                  transition: 'all 0.15s',
                }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
