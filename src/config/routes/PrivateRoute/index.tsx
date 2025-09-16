import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// Placeholder for auth hook
interface User {
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | 'teacher' | null;
}

const useAuth = (): User => {
  // Replace with your actual auth logic (e.g., from context)
  return { isAuthenticated: true, role: 'admin' }; // Example
};

const PrivateRoute: React.FC<{
  children: ReactNode;
  allowedRoles: ('admin' | 'staff' | 'teacher')[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default PrivateRoute;