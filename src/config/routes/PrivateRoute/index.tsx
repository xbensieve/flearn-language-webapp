import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../utils/AuthContext';

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('admin' | 'manager' | 'teacher' | 'learner')[];
}> = ({ children, allowedRoles }) => {
  const { auth } = useAuth();
  const { isAuthenticated, roles, loading } = auth;

  // Remove or adjust useEffect if not needed
  /*
  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, role, navigate]);
  */

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (roles && roles.some((role) => allowedRoles.includes(role))) {
    return <>{children}</>;
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
};

export default PrivateRoute;
