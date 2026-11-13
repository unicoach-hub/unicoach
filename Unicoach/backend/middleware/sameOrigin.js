/**
 * CSRF guard for the admin API.
 *
 * The admin cookie is SameSite=None (the panel and the API are on different domains), so a browser
 * attaches it to cross-site requests too. CORS does not help here: a plain <form> POST is a "simple
 * request", so it reaches the server and runs before the browser blocks the *response*. Without this
 * check, a page an admin merely visits could refund a booking or delete a mentor in their name.
 *
 * So every state-changing admin request must say where it came from, and it must be one of our own
 * origins. Requests with no Origin and no Referer are server-to-server or curl, which carry no
 * ambient cookie, so a Bearer token is required for those.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const originOf = (value) => {
  try {
    return new URL(value).origin.replace(/\/+$/, '');
  } catch {
    return null;
  }
};

/**
 * @param {Object} opts
 * @param {string[]} opts.allowedOrigins exact origins we trust
 * @param {RegExp} opts.trustedPattern extra pattern for our own domains and their subdomains
 */
const LOCALHOST = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const sameOriginOnly = ({ allowedOrigins = [], trustedPattern }) => {
  const allowed = new Set(allowedOrigins.filter(Boolean).map((o) => o.replace(/\/+$/, '')));
  const isOurs = (origin) => {
    if (!origin) return false;
    if (allowed.has(origin)) return true;
    if (trustedPattern && trustedPattern.test(origin)) return true;
    // Off the live server, a dev admin panel can sit on any local port (vite picks a free one)
    return process.env.NODE_ENV !== 'production' && LOCALHOST.test(origin);
  };

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const sent = req.get('origin') || req.get('referer');
    if (sent) {
      if (isOurs(originOf(sent))) return next();
      return res.status(403).json({ error: 'Request blocked: it did not come from the UniCoach admin panel.' });
    }

    // No Origin/Referer at all: a browser always sends one on a cross-site write, so this is a
    // script or server call. Allow it only with an explicit Bearer token, never on the cookie alone.
    const auth = req.get('authorization') || '';
    if (auth.startsWith('Bearer ') && auth.length > 'Bearer '.length) return next();

    return res.status(403).json({ error: 'Request blocked: missing origin. Use an Authorization header for API calls.' });
  };
};

module.exports = { sameOriginOnly };
