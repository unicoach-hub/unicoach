import { useAuth } from '../context/AuthContext';

// Which admin section each page belongs to. Must match backend/config/staffPermissions.js.
// 'owner' pages (settings, staff) are only for the account owner.
const PAGE_SECTIONS = [
  ['/blogs', 'blogs'],
  ['/news', 'news'],
  ['/events', 'events'],
  ['/digest', 'digest'],
  ['/universities', 'universities'],
  ['/scholarships', 'scholarships'],
  ['/leads', 'leads'],
  ['/crm', 'crm'],
  ['/users', 'students'],
  ['/requests', 'support'],
  ['/students', 'inbox'],
  ['/unicoach', 'mentors'],
  ['/automation', 'messaging'],
  ['/templates', 'messaging'],
  ['/bulk-messaging', 'messaging'],
  ['/content', 'content'],
  ['/tasks', 'self'],
  ['/settings', 'owner'],
  ['/staff', 'owner'],
];

const CONTENT_SECTIONS = ['blogs', 'news', 'events', 'digest'];

export const isOwner = (user) => user?.role === 'admin';

export const can = (user, section, action = 'view') => {
  if (isOwner(user)) return true;
  if (user?.role !== 'staff' || section === 'owner') return false;
  if (section === 'self') return true; // everyone's own pages, e.g. their task list
  if (section === 'content') return CONTENT_SECTIONS.every((s) => Boolean(user.permissions?.[s]?.view));
  return Boolean(user.permissions?.[section]?.[action]);
};

export const sectionForPath = (pathname) => {
  if (pathname === '/' || pathname === '') return 'dashboard';
  const hit = PAGE_SECTIONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return hit ? hit[1] : 'owner';
};

// Form pages: /x/create needs create, /x/edit/:id needs update
export const actionForPath = (pathname) => {
  if (/\/create$/.test(pathname)) return 'create';
  if (/\/edit\//.test(pathname)) return 'update';
  return 'view';
};

export const canOpenPath = (user, pathname) => can(user, sectionForPath(pathname), actionForPath(pathname));

// Staff land on the first page they're allowed to open
const LANDING_ORDER = ['/', '/tasks', '/students/inbox', '/leads', '/crm/board', '/requests', '/blogs', '/news', '/events', '/digest', '/universities', '/scholarships', '/unicoach', '/users', '/automation/email', '/templates'];
export const firstAllowedPath = (user) => LANDING_ORDER.find((p) => canOpenPath(user, p)) || null;

// const { can } = usePermissions(); can('blogs', 'delete')
export const usePermissions = () => {
  const { user } = useAuth();
  return {
    user,
    owner: isOwner(user),
    can: (section, action = 'view') => can(user, section, action),
  };
};
