'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getToken, removeToken, clearTokens } from '@/utils/auth';

interface DecodedToken {
  id: number;
  sub?: number;
  email: string;
  role: 'USER' | 'ADMIN' | 'SA';
  name?: string;
  exp?: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  setUser: (user: DecodedToken | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed: DecodedToken = JSON.parse(savedUser);
        parsed.id = parsed.id ?? parsed.sub ?? 0;
        setUser(parsed);
        return;
      }

      const token = getToken('accessToken');
      if (!token) return;

      const decoded = jwtDecode<DecodedToken>(token);

      decoded.id = decoded.id ?? decoded.sub ?? 0;

      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        clearTokens();
        removeToken('user');
        setUser(null);
        return;
      }

      setUser(decoded);
      localStorage.setItem('user', JSON.stringify(decoded));
    } catch {
      setUser(null);
    }
  }, []);

  const logout = () => {
    clearTokens();
    removeToken('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
