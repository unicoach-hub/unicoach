// Staff permissions: which admin sections exist, and which section + action each admin API call needs.
// The owner (a User with role 'admin') can do everything; staff only what their role allows.
// Anything not mapped here is denied to staff (fail closed).

const ACTIONS = ['view', 'create', 'update', 'delete'];

// Sections shown in the role editor. `actions` lists what makes sense for that section.
const MODULES = [
  { key: 'dashboard', label: 'Dashboard', group: 'Overview', actions: ['view'] },
  { key: 'leads', label: 'Leads', group: 'Students & CRM', actions: ACTIONS },
  { key: 'crm', label: 'Pipelines, Forms & Calendar', group: 'Students & CRM', actions: ACTIONS },
  { key: 'students', label: 'Registered Users', group: 'Students & CRM', actions: ['view', 'delete'] },
  { key: 'support', label: 'Support Requests', group: 'Students & CRM', actions: ['view', 'update', 'delete'] },
  { key: 'inbox', label: 'Student Chat & Documents', group: 'Students & CRM', actions: ['view', 'create', 'update'] },
  { key: 'mentors', label: 'Mentors, Bookings & Payouts', group: 'Platform', actions: ACTIONS },
  { key: 'universities', label: 'Universities & Courses', group: 'Platform', actions: ACTIONS },
  { key: 'scholarships', label: 'Scholarships', group: 'Platform', actions: ACTIONS },
  { key: 'blogs', label: 'Blogs & Articles', group: 'Content', actions: ACTIONS },
  { key: 'news', label: 'News & Updates', group: 'Content', actions: ACTIONS },
  { key: 'events', label: 'Events & Webinars', group: 'Content', actions: ACTIONS },
  { key: 'digest', label: 'Video Digest', group: 'Content', actions: ACTIONS },
  { key: 'messaging', label: 'Email, WhatsApp & Templates', group: 'Growth', actions: ACTIONS },
  { key: 'social', label: 'Social Media', group: 'Growth', actions: ACTIONS },
  // Everyone has their own task list; this section is for managing the team's tasks
  { key: 'tasks', label: 'Team Tasks (see all, assign to others)', group: 'Team', actions: ACTIONS },
];

const MODULE_KEYS = MODULES.map((m) => m.key);
const CONTENT_MODULE_BY_TYPE = { blog: 'blogs', news: 'news', event: 'events', digest: 'digest' };

// Keep only known sections/actions; any action implies view (a page can't be used without seeing it)
const sanitizePermissions = (input) => {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const mod of MODULES) {
    const raw = input[mod.key];
    if (!raw || typeof raw !== 'object') continue;
    const perms = {};
    for (const action of mod.actions) if (raw[action] === true) perms[action] = true;
    if (Object.keys(perms).length) {
      perms.view = true;
      out[mod.key] = perms;
    }
  }
  return out;
};

const ACTION_BY_METHOD = { GET: 'view', HEAD: 'view', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };
const OBJECT_ID = /^[0-9a-f]{24}$/i;
const OWNER_ONLY = { ownerOnly: true };

// A POST that acts on an existing record (/:id/something) is an update, not a create
const defaultAction = (req) => {
  const action = ACTION_BY_METHOD[req.method];
  if (action === 'create' && req.path.split('/').some((seg, i, all) => OBJECT_ID.test(seg) && i < all.length - 1)) {
    return 'update';
  }
  return action;
};

const firstSegment = (path) => path.split('/').filter(Boolean)[0] || '';

// Content (blogs/news/events/digest) lives in four collections behind one route
const resolveContent = async (req) => {
  const action = defaultAction(req);
  const seg = firstSegment(req.path);
  if (!seg) {
    if (req.method === 'GET') {
      const mod = CONTENT_MODULE_BY_TYPE[req.query.type];
      return mod ? { module: mod, action } : { modules: Object.values(CONTENT_MODULE_BY_TYPE), action };
    }
    const mod = CONTENT_MODULE_BY_TYPE[req.body?.type];
    return mod ? { module: mod, action } : null;
  }
  if (seg === 'import-docx') return { anyOf: Object.values(CONTENT_MODULE_BY_TYPE), action: 'create' };
  if (!OBJECT_ID.test(seg)) return null;
  const [Blog, News, Event, Digest] = ['Blog', 'News', 'Event', 'Digest'].map((m) => require(`../models/${m}`));
  const found = await Promise.all([Blog, News, Event, Digest].map((M) => M.exists({ _id: seg })));
  const type = ['blog', 'news', 'event', 'digest'][found.findIndex(Boolean)];
  return type ? { module: CONTENT_MODULE_BY_TYPE[type], action } : { notFound: true };
};

// Returns { module, action } | { modules, action } (needs all) | { anyOf, action } | OWNER_ONLY | { notFound } | null (deny)
const resolveRequest = async (req) => {
  const base = req.baseUrl;
  const seg = firstSegment(req.path);
  const action = defaultAction(req);

  switch (base) {
    case '/api/admin/stats':
      return { module: 'dashboard', action: 'view' };
    case '/api/admin/content':
      return resolveContent(req);
    case '/api/admin/universities-manage':
      if (seg === 'seed-dataset') return OWNER_ONLY;
      return { module: 'universities', action };
    case '/api/courses':
      if (['trigger-scheduler', 'sync-url', 'batch-sync-catalog', 'discover-catalog'].includes(seg)) {
        return { module: 'universities', action: 'update' };
      }
      return { module: 'universities', action };
    case '/api/scholarships':
      return { module: 'scholarships', action };
    case '/api/admin/leads':
      if (seg === 'bulk-tags') return { module: 'leads', action: 'update' };
      return { module: 'leads', action };
    case '/api/ai':
      if (seg === 'generate-blog') return { module: 'blogs', action: 'create' };
      if (seg === 'suggest-lead-reply') return { module: 'leads', action: 'view' };
      if (seg === 'score-lead' || seg === 'batch-score-leads') return { module: 'leads', action: 'update' };
      return null;
    case '/api/admin/pipelines':
    case '/api/admin/forms':
    case '/api/admin/bookings':
      return { module: 'crm', action };
    case '/api/support-requests':
      if (seg === 'test-smtp') return OWNER_ONLY;
      return { module: 'support', action: seg === 'export' ? 'view' : action };
    case '/api/admin/users':
      return { module: 'students', action };
    case '/api/admin/templates':
      return { module: 'messaging', action };
    case '/api/admin/messaging':
      if (seg === 'verify-smtp' || seg === 'audience-preview') return { module: 'messaging', action: 'view' };
      return { module: 'messaging', action };
    case '/api/admin/social':
      return { module: 'social', action };
    case '/api/admin/student-inbox':
      // Reading = view; sending messages / requesting documents = create; reviewing and assigning = update
      if (req.method === 'GET') return { module: 'inbox', action: 'view' };
      if (req.method === 'POST') return { module: 'inbox', action: 'create' };
      if (req.method === 'PATCH') return { module: 'inbox', action: 'update' };
      return null;
    case '/api/admin/unicoach':
      return { module: 'mentors', action };
    default:
      // Settings (API keys, SMTP, payment config) and staff management stay with the owner
      return OWNER_ONLY;
  }
};

const can = (permissions, module, action) => Boolean(permissions?.[module]?.[action]);

module.exports = { ACTIONS, MODULES, MODULE_KEYS, sanitizePermissions, resolveRequest, can };
