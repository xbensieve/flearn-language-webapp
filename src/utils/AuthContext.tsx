import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'admin' | 'staff' | 'teacher' | 'learner';
export type UserRoles = UserRole[] | null;

const validRoles: UserRole[] = ['admin', 'staff', 'teacher', 'learner'];

interface AuthUser {
  isAuthenticated: boolean;
  roles: UserRoles;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthUser;
  updateAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  auth: { isAuthenticated: false, roles: null, loading: true },
  updateAuth: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthUser>({
    isAuthenticated: false,
    roles: null,
    loading: true,
  });

  const updateAuth = () => {
    const token = localStorage.getItem('FLEARN_ACCESS_TOKEN');
    const storedRolesJson = localStorage.getItem('FLEARN_USER_ROLES');

    if (token && storedRolesJson) {
      try {
        const storedRoles: string[] = JSON.parse(storedRolesJson);

        // Validate that all roles are valid and array is non-empty
        const validUserRoles = storedRoles
          .map((role) => role.toLowerCase())
          .filter((role) => validRoles.includes(role as UserRole));

        if (validUserRoles.length > 0) {
          // Cast to UserRoles after validation
          const roles: UserRoles = validUserRoles as UserRoles;
          setAuth({
            isAuthenticated: true,
            roles,
            loading: false,
          });
          return;
        }
      } catch (error) {
        // Invalid JSON, treat as invalid
        console.error('Invalid roles data in localStorage:', error);
      }
    }

    // If token or valid roles are missing/invalid, clear storage and set unauthenticated
    localStorage.removeItem('FLEARN_ACCESS_TOKEN');
    localStorage.removeItem('FLEARN_USER_ROLES');
    setAuth({ isAuthenticated: false, roles: null, loading: false });
  };

  useEffect(() => {
    updateAuth(); // Run on mount
  }, []);

  return <AuthContext.Provider value={{ auth, updateAuth }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
