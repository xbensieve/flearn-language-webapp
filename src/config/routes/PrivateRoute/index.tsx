import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../utils/AuthContext';

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('admin' | 'staff' | 'teacher' | 'learner')[];
}> = ({ children, allowedRoles }) => {
  const { auth } = useAuth();
  const { isAuthenticated, role, loading } = auth;

  // Remove or adjust useEffect if not needed
  /*
  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, role, navigate]);
  */

  if (loading) {
    return <div>Loading...</div>; // Consider using an AntD spinner here
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <Navigate to='/unauthorized' replace />;
};

export default PrivateRoute;
