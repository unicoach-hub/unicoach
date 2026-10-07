/**
 * Reserved Slug / Handle Validator (Pillar #8)
 * 
 * Prevents system route hijacking by banning keywords like @admin, @api, @checkout.
 * Enforces strict URL-safe regex.
 */

const RESERVED_SLUGS = new Set([
  'admin', 'administrator', 'api', 'app', 'auth', 'authorize',
  'billing', 'blog', 'blogs', 'book', 'booking', 'bookings',
  'calendar', 'cancel', 'checkout', 'client', 'config', 'contact',
  'dashboard', 'dev', 'developer', 'docs', 'download',
  'email', 'events', 'faq', 'feed', 'feedback', 'files',
  'health', 'help', 'home', 'inbox', 'info', 'internal',
  'join', 'lead', 'leads', 'legal', 'login', 'logout',
  'mail', 'manage', 'manager', 'me', 'media', 'meet', 'meeting',
  'mentor', 'mentors', 'messages', 'news', 'notifications',
  'oauth', 'order', 'orders', 'panel', 'pay', 'payment', 'payments',
  'portal', 'pricing', 'privacy', 'profile', 'public',
  'receipt', 'refund', 'register', 'root', 'routes',
  'sales', 'scholarship', 'scholarships', 'search', 'security',
  'service', 'services', 'session', 'sessions', 'settings', 'shortlist',
  'signin', 'signup', 'slug', 'slot', 'slots', 'sop', 'ssl',
  'staff', 'status', 'stripe', 'student', 'students', 'subscribe',
  'support', 'terms', 'test', 'thank-you', 'tools',
  'unicoach', 'unicoach', 'university', 'universities', 'upload', 'uploads',
  'user', 'users', 'verification', 'verify', 'wallet', 'webhook', 'webhooks'
]);

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const validateHandle = (handle) => {
  if (!handle || typeof handle !== 'string') {
    return { valid: false, message: 'Handle is required.' };
  }

  const cleanHandle = handle.toLowerCase().replace(/^@/, '').trim();

  if (!HANDLE_REGEX.test(cleanHandle)) {
    return { 
      valid: false, 
      message: 'Handle must be between 3 and 30 characters and contain only letters, numbers, and underscores.' 
    };
  }

  if (RESERVED_SLUGS.has(cleanHandle)) {
    return { 
      valid: false, 
      message: `'${cleanHandle}' is a reserved system keyword and cannot be used as a handle.` 
    };
  }

  return { valid: true, cleanHandle };
};

const handleValidatorMiddleware = (req, res, next) => {
  const handle = req.params.handle || req.body.handle;
  const result = validateHandle(handle);

  if (!result.valid) {
    return res.status(400).json({ error: result.message });
  }

  req.validatedHandle = result.cleanHandle;
  next();
};

module.exports = {
  validateHandle,
  handleValidatorMiddleware,
  RESERVED_SLUGS
};
