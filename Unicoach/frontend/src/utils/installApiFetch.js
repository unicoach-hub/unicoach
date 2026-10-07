import { API_BASE_URL } from '../config';

/**
 * Session fix for every call to our own backend.
 *
 * The login session lives in an HttpOnly cookie. Many components call the API with only
 * `Authorization: Bearer ${token}` where token is the placeholder 'cookie-session' after a reload,
 * and without `credentials: 'include'`, so the cookie was never sent and saves/dashboards got 401.
 *
 * This wraps window.fetch once: requests to our API origins always send the cookie, and
 * placeholder Bearer values are dropped so the backend falls back to the cookie.
 * Requests to any other origin are left untouched.
 */

const toOrigin = (url) => {
  try {
    return new URL(url, window.location.href).origin;
  } catch {
    return null;
  }
};

const API_ORIGINS = new Set(
  [API_BASE_URL, 'http://localhost:5000', 'http://127.0.0.1:5000', 'https://unicoach-1.onrender.com', 'https://api.unicoach.com', 'https://api.unicoach.in']
    .map(toOrigin)
    .filter(Boolean)
);

const PLACEHOLDER_TOKENS = new Set(['cookie-session', 'null', 'undefined', '']);

const isPlaceholderAuth = (value) => {
  if (typeof value !== 'string') return false;
  const match = value.match(/^Bearer\s*(.*)$/i);
  return Boolean(match) && PLACEHOLDER_TOKENS.has(match[1].trim());
};

const cleanHeaders = (headers) => {
  if (!headers) return headers;
  if (headers instanceof Headers) {
    if (isPlaceholderAuth(headers.get('Authorization'))) headers.delete('Authorization');
    return headers;
  }
  if (Array.isArray(headers)) {
    return headers.filter(([key, value]) => !(key.toLowerCase() === 'authorization' && isPlaceholderAuth(value)));
  }
  const next = { ...headers };
  Object.keys(next).forEach((key) => {
    if (key.toLowerCase() === 'authorization' && isPlaceholderAuth(next[key])) delete next[key];
  });
  return next;
};

export const installApiFetch = () => {
  if (typeof window === 'undefined' || window.__unicoachApiFetchInstalled) return;
  window.__unicoachApiFetchInstalled = true;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    const origin = url ? toOrigin(url) : null;
    const isOwnApi = origin && (API_ORIGINS.has(origin) || (origin === window.location.origin && new URL(url, window.location.href).pathname.startsWith('/api/')));

    if (!isOwnApi) return nativeFetch(input, init);

    const nextInit = {
      ...init,
      credentials: init.credentials && init.credentials !== 'same-origin' ? init.credentials : 'include',
      headers: cleanHeaders(init.headers),
    };
    return nativeFetch(input, nextInit);
  };
};
