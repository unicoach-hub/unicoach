import axios from 'axios';
import { message } from 'antd';
import { getApiUrl } from '../config';

const API = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/admin/auth/login') || err.config?.url?.includes('/admin/auth/profile');
    const isAlreadyOnLogin = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname.endsWith('/login'));

    // 403 = signed in but this role isn't allowed to do it: tell the user, keep them signed in
    const isLoggedInCall = !isAuthEndpoint && Boolean(localStorage.getItem('admin_user'));
    if (err.response?.status === 403 && isLoggedInCall) {
      message.warning({
        key: 'no-permission',
        content: err.response.data?.message || "You don't have permission to do this.",
      });
      return Promise.reject(err);
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');

      // CRITICAL: Prevent infinite page-reload loop!
      // NEVER redirect if user is already on /login, or if this is the initial profile check or login form submit.
      if (!isAuthEndpoint && !isAlreadyOnLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default API;
