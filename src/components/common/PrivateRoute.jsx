import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    if (user?.role === 'college_admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'super_admin') return <Navigate to="/superadmin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;