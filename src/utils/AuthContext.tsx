import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  exp: number;
  iss: string;
  aud: string;
}

interface AuthUser {
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | 'teacher' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthUser>({
  isAuthenticated: false,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthUser>({
    isAuthenticated: false,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const now = Date.now() / 1000;

        if (decoded.exp && decoded.exp > now) {
          setAuth({
            isAuthenticated: true,
            role: decoded[
              'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ].toLowerCase() as 'admin' | 'staff' | 'teacher',
            loading: false,
          });
          return;
        }
      } catch {
        // ignore
      }
      localStorage.removeItem('accessToken');
    }
    setAuth({ isAuthenticated: false, role: null, loading: false });
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
