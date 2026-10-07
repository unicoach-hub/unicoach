/**
 * Centralized Environment Configuration for Admin Panel
 * Handles Local Dev (localhost:5173 / localhost:5174 / localhost:5000)
 * and Production Deployment (custom domain / live URLs) automatically.
 */

// Frontend URL for shareable links, public forms, etc.
export const getFrontendUrl = () => {
  // 1. Explicit env variable (highest priority in production build)
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL.replace(/\/$/, '');
  }

  // 2. Local dev check
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5173`;
    }
    // 3. Production domain check: admin.unicoach.com -> www.unicoach.com (the site's canonical host)
    const rootDomain = hostname.replace(/^admin\./, '');
    return rootDomain === 'unicoach.com' ? 'https://www.unicoach.com' : `${protocol}//${rootDomain}`;
  }

  return 'https://www.unicoach.com';
};

export const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  const fallbackApiUrl = 'https://unicoach-1.onrender.com/api';

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // When running locally, ALWAYS prioritize local backend port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl.replace(/\/$/, '');
      }
      return 'http://localhost:5000/api';
    }

    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/$/, '');
    }
  }

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  return fallbackApiUrl;
};

// Shareable Form Link helper
export const getFormShareLink = (slug) => {
  return `${getFrontendUrl()}/f/${slug}`;
};
