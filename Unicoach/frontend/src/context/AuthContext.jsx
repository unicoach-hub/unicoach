import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { clearUserStorage } from '../utils/userStorage';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const API_URL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalOptions, setLoginModalOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Session Handshake: Verify HttpOnly Cookie Session with Backend
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // Optimistic UI hydration if user metadata exists in storage
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {}
        }

        // Validate real session against backend via HttpOnly cookie
        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Automatically passes HttpOnly token cookie
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
            setToken('cookie-session');
            localStorage.setItem('user_info', JSON.stringify(data.user));
          }
        } else if (res.status === 401 || res.status === 403) {
          // Session expired or no valid cookie
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_info');
          }
        }
      } catch (err) {
        console.warn('Session verification fallback (offline or network error):', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const openLoginModal = (options = null) => {
    setLoginModalOptions(options);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setLoginModalOptions(null);
  };

  /**
   * Log in with Email + Password
   */
  const loginWithEmail = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token || 'cookie-session');
        setUser(data.user);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setLoginModalOpen(false);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Network error occurred during login' };
    }
  };

  /**
   * Register with Email + Password
   */
  const registerWithEmail = async ({ name, email, password, phone }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          setToken(data.token || 'cookie-session');
          setUser(data.user);
          localStorage.setItem('user_info', JSON.stringify(data.user));
          setLoginModalOpen(false);
        }
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Network error occurred during registration' };
    }
  };

  /**
   * Send Password Reset Link to Email
   */
  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to send password reset link' };
    } catch (err) {
      return { success: false, message: 'Network error occurred' };
    }
  };

  /**
   * Reset Password with Token & ID
   */
  const resetPassword = async ({ token, id, newPassword }) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to reset password' };
    } catch (err) {
      return { success: false, message: 'Network error occurred' };
    }
  };

  /**
   * 1-Click Google OAuth Sign-In
   */
  const loginWithGoogle = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token || 'cookie-session');
        setUser(data.user);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setLoginModalOpen(false);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Google sign-in failed' };
    } catch (err) {
      return { success: false, message: 'Network error during Google sign-in' };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user_info', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Backend logout call failed:', e);
    } finally {
      setToken(null);
      setUser(null);
      // Drop every per-user key (auth, lead, shortlists, mentor handle, AI history) so the next
      // person on this device doesn't inherit the previous user's data
      clearUserStorage();
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loginModalOpen, loginModalOptions, loading,
      openLoginModal, closeLoginModal,
      loginWithEmail, registerWithEmail, forgotPassword, resetPassword, loginWithGoogle,
      logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
