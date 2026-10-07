import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

import API from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyAdminSession = async () => {
      try {
        const hasStoredToken = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {}
        }

        // If user is already on /login and has no credentials, unblock loading immediately
        if (typeof window !== 'undefined' && window.location.pathname.includes('/login') && !hasStoredToken) {
          if (isMounted) setLoading(false);
          return;
        }

        // Verify session via HttpOnly cookie or token
        const res = await API.get('/admin/auth/profile');
        if (isMounted && res.data) {
          setUser(res.data);
          localStorage.setItem('admin_user', JSON.stringify(res.data));
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifyAdminSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await API.post('/admin/auth/logout');
    } catch (e) {
      console.warn('Admin logout call failed:', e);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_sender_pass');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
