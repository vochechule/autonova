import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ PŘIDÁNO - AbortController
    const abortController = new AbortController();
    
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data
      fetch('http://localhost:3000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: abortController.signal, // ✅ PŘIDÁNO
      })
        .then(res => {
          // ✅ PŘIDÁNO - Check if aborted
          if (abortController.signal.aborted) {
            return;
          }
          
          if (res.ok) {
            return res.json();
          }
          
          // ✅ OPRAVENO - Only remove token for 401, not other errors
          if (res.status === 401) {
            throw new Error('Unauthorized');
          }
          
          throw new Error('Failed to fetch user');
        })
        .then(data => {
          // ✅ PŘIDÁNO - Check if aborted before setting state
          if (!abortController.signal.aborted) {
            setUser(data);
          }
        })
        .catch((error) => {
          // ✅ PŘIDÁNO - Ignore aborted requests
          if (error.name === 'AbortError') {
            return;
          }
          
          // ✅ OPRAVENO - Only remove token for auth errors, not network errors
          if (error.message === 'Unauthorized') {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            console.warn('useAuth: Network or other error, keeping token:', error.message);
            // Don't remove token for network errors - just set user to null
            setUser(null);
          }
        })
        .finally(() => {
          // ✅ PŘIDÁNO - Only set loading false if not aborted
          if (!abortController.signal.aborted) {
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    // ✅ PŘIDÁNO - Cleanup function
    return () => {
      abortController.abort();
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    
    // ✅ OPRAVENO - Add error handling for login fetch too
    fetch('http://localhost:3000/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Failed to fetch user after login');
      })
      .then(data => setUser(data))
      .catch(error => {
        console.error('Login fetch error:', error);
        // Don't remove token here - user just logged in
      });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    
    // ✅ PŘIDÁNO - Trigger auth change event
    window.dispatchEvent(new Event('authChange'));
  };

  const getToken = () => localStorage.getItem('token');

  return {
    user,
    loading,
    login,
    logout,
    getToken,
    isAuthenticated: !!user,
  };
}