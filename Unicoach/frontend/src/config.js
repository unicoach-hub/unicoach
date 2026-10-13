/**
 * Centralized Environment Configuration for Frontend Web App.
 * Every API call in the app must use API_BASE_URL from this file (no inline fallbacks).
 *
 * Resolution order:
 * 1. VITE_API_URL (or legacy VITE_BACKEND_URL / VITE_API_BASE_URL) when set. A loopback URL
 *    (localhost / 127.0.0.1) is ignored unless the page itself is served from loopback, so a
 *    developer .env baked into a production build can never point real users at localhost.
 * 2. Served from one of our domains AND VITE_USE_API_SUBDOMAIN=true -> https://api.<that domain>/api
 *    (www.unicoach.com -> https://api.unicoach.com/api); otherwise our domains fall through to 4.
 * 3. Served from localhost / 127.0.0.1         -> http://localhost:5000/api
 * 4. Anything else (e.g. *.vercel.app)          -> https://api.unicoach.com/api (VPS backend)
 *
 * The result is normalised: no trailing slash and always ending in '/api'.
 */

const LOCAL_API_URL = 'http://localhost:5000/api';
// Production lives on unicoach.com; unicoach.in keeps working as a second domain
const SITE_DOMAINS = ['unicoach.com', 'unicoach.in'];
// Backend moved from Render to the VPS (Coolify) at api.unicoach.com
const FALLBACK_API_URL = 'https://api.unicoach.com/api';
// The retired Render backend: an old VITE_API_URL still pointing there is ignored
const RETIRED_API_HOST = /unicoach-1\.onrender\.com/i;

// Canonical public address used for SEO (canonical links, sitemap). Google indexed the www host.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.unicoach.com').replace(/\/+$/, '');

const LOOPBACK_PATTERN = /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i;

export const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const isLoopbackHost = (hostname) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';

const getSiteDomain = (hostname) => SITE_DOMAINS.find((d) => hostname === d || hostname.endsWith(`.${d}`));

export const getApiBaseUrl = () => {
  const envUrl = normalizeApiUrl(
    [import.meta.env.VITE_API_URL, import.meta.env.VITE_BACKEND_URL, import.meta.env.VITE_API_BASE_URL]
      .find((u) => u && !RETIRED_API_HOST.test(u))
  );

  if (typeof window === 'undefined') {
    return envUrl || LOCAL_API_URL;
  }

  const hostname = window.location.hostname;
  const servedFromLoopback = isLoopbackHost(hostname);
  const envIsLoopback = Boolean(envUrl) && LOOPBACK_PATTERN.test(envUrl);

  // Explicit configuration wins, except a loopback API on a real (non-loopback) host.
  if (envUrl && (servedFromLoopback || !envIsLoopback)) {
    return envUrl;
  }

  // Our own domains (unicoach.com and unicoach.in) both use the VPS backend at api.unicoach.com
  if (getSiteDomain(hostname)) {
    return FALLBACK_API_URL;
  }

  if (servedFromLoopback) {
    return LOCAL_API_URL;
  }

  return FALLBACK_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();
