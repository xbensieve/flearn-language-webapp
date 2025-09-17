import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../utils/AuthContext';

const PrivateRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: ('admin' | 'staff' | 'teacher')[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // hoặc spinner antd
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return (
    <Navigate
      to="/unauthorized"
      replace
    />
  );
};

export default PrivateRoute;
