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
    // 3. Anywhere else (admin.unicoach.com, the admin's vercel.app preview…) links go to the public
    //    site. Using the admin's own host made shared /f/ links open the admin instead of the form.
  }

  return 'https://www.unicoach.com';
};

export const getApiUrl = () => {
  // The old Render backend is retired: an env value still pointing there is ignored
  const isRetired = (u) => typeof u === 'string' && /unicoach-1\.onrender\.com/i.test(u);
  const envUrl = [import.meta.env.VITE_BACKEND_URL, import.meta.env.VITE_API_URL].find((u) => u && !isRetired(u));
  const fallbackApiUrl = 'https://api.unicoach.com/api';

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
