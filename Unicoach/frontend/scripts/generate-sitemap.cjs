/**
 * Builds public/sitemap.xml and public/robots.txt from the routes declared in src/App.jsx.
 * Runs before every production build (npm "prebuild"), so new pages are listed automatically.
 *
 *   node scripts/generate-sitemap.cjs            -> https://www.unicoach.com
 *   SITE_URL=https://example.com node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
const root = path.join(__dirname, '..');
const appSource = fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8');

// Pages that must not be indexed, and aliases that would duplicate another page
const EXCLUDE = [
  /^\/(dashboard|login|signin|register|signup|reset-password|priority-dm)(\/|$)/,
  /^\/unicoach\/(dashboard|apply|join)(\/|$)/,
  /^\/(book-consultation|privacy|terms-of-service|ielts-evaluator|sop-generator|study-roadmap|visa-prep|course-details)$/,
  /^\/admin/,
];

const routes = [...appSource.matchAll(/path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p.startsWith('/') && !p.includes(':') && !p.includes('*'))
  .filter((p) => !EXCLUDE.some((re) => re.test(p)));
const unique = [...new Set(routes)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const priorityFor = (p) => {
  if (p === '/') return '1.0';
  const depth = p.split('/').filter(Boolean).length;
  if (['/universities', '/scholarships', '/unicoach', '/study-abroad', '/exams', '/education-loan', '/visa-assistance', '/contact'].includes(p)) return '0.9';
  return depth === 1 ? '0.8' : depth === 2 ? '0.7' : '0.6';
};

const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...unique.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><priority>${priorityFor(p)}</priority></url>`),
  '</urlset>',
  '',
].join('\n');

const robots = [
  `# robots.txt for UniCoach (${SITE_URL})`,
  'User-agent: *',
  'Allow: /',
  '',
  '# Account pages and the API are not for search engines',
  'Disallow: /api/',
  'Disallow: /dashboard',
  'Disallow: /unicoach/dashboard',
  'Disallow: /reset-password',
  '',
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml);
fs.writeFileSync(path.join(root, 'public', 'robots.txt'), robots);
console.log(`sitemap.xml: ${unique.length} URLs on ${SITE_URL}`);
