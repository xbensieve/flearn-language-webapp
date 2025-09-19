import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthUser {
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | 'teacher' | 'learner' | null;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthUser;
  updateAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  auth: { isAuthenticated: false, role: null, loading: true },
  updateAuth: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthUser>({
    isAuthenticated: false,
    role: null,
    loading: true,
  });

  const updateAuth = () => {
    const token = localStorage.getItem('FLEARN_ACCESS_TOKEN');
    const storedRole = localStorage.getItem('FLEARN_USER_ROLE');

    if (token && storedRole) {
      // Validate role to ensure it’s one of the allowed values
      const validRoles = ['admin', 'staff', 'teacher', 'learner'];
      const role = validRoles.includes(storedRole.toLowerCase())
        ? (storedRole.toLowerCase() as 'admin' | 'staff' | 'teacher', 'learner')
        : null;

      if (role) {
        setAuth({
          isAuthenticated: true,
          role,
          loading: false,
        });
        return;
      }
    }

    // If token or valid role is missing, clear storage and set unauthenticated
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_USER_ROLE');
    setAuth({ isAuthenticated: false, role: null, loading: false });
  };

  useEffect(() => {
    updateAuth(); // Run on mount
  }, []);

  return <AuthContext.Provider value={{ auth, updateAuth }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
