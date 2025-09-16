'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  getToken: () => string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          // ✅ If token is invalid, remove it
          localStorage.removeItem('token');
          throw new Error('Invalid token');
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token'); // ✅ Clean up invalid token
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  const refreshUser = () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    
    setLoading(true);
    fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('token');
          throw new Error('Invalid token');
        }
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    window.dispatchEvent(new Event('authChange')); // ✅ Notify other components
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false); // ✅ Immediately set loading to false
    window.dispatchEvent(new Event('authChange')); // ✅ Notify other components
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user && !loading, // ✅ Only authenticated if user exists and not loading
      getToken, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}