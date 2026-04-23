import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import Loader from '../common/Loader';
import DashboardLayout from './DashboardLayout';
import StudentSidebar from './StudentSidebar';
import AdminSidebar from './AdminSidebar';
import SuperAdminSidebar from './SuperAdminSidebar';
import CourseAdminSidebar from './CourseAdminSidebar';
import UniversityAdminSidebar from './UniversityAdminSidebar';

const ProtectedRouteWithLayout = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { loading: subLoading } = useSubscription();

  const showLoader = authLoading || 
    ((user?.role === 'college_admin' || user?.role === 'course_admin' || user?.role === 'university_admin') && subLoading);

  if (showLoader) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      'student': '/student',
      'college_admin': '/admin',
      'course_admin': '/course-admin',
      'university_admin': '/university-admin',
      'super_admin': '/superadmin',
    };
    const redirectPath = roleRoutes[user?.role];
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to="/" replace />;
  }

  let sidebar = null;
  if (user?.role === 'student') {
    sidebar = <StudentSidebar />;
  } else if (user?.role === 'college_admin') {
    sidebar = <AdminSidebar />;
  } else if (user?.role === 'course_admin') {
    sidebar = <CourseAdminSidebar />;
  } else if (user?.role === 'university_admin') {
    sidebar = <UniversityAdminSidebar />;
  } else if (user?.role === 'super_admin') {
    sidebar = <SuperAdminSidebar />;
  }

  return (
    <DashboardLayout sidebar={sidebar}>
      {children}
    </DashboardLayout>
  );
};

export default ProtectedRouteWithLayout;
