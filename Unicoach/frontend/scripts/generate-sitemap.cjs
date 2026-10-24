/**
 * Builds public/sitemap-pages.xml and public/robots.txt from the routes declared in src/App.jsx.
 * /sitemap.xml itself is served by api/sitemap.js, which adds blogs, news and events from the database.
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
  /^\/unicoach\/(dashboard|apply|join|application-status)(\/|$)/,
  /^\/(onboarding|unsubscribe)$/,
  /^\/(book-consultation|privacy|terms-of-service|ielts-evaluator|sop-generator|study-roadmap|visa-prep|course-details)$/,
  /^\/admin/,
  // Redirect to /search-programs (see vercel.json); listing them would duplicate that page
  /^\/(universities|scholarships)$/,
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

// Account pages and the API are not for search engines or AI crawlers
const PRIVATE_PATHS = ['/api/', '/dashboard', '/unicoach/dashboard', '/reset-password'];

// AI search and assistant crawlers we want to read the site (so UniCoach can be cited in answers).
// A crawler that matches its own group ignores the "*" group, so each group repeats the Disallows.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI / ChatGPT search
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', // Anthropic / Claude
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Google-Extended', // Gemini and Google AI products
  'Bingbot', // Bing, which also powers Copilot and ChatGPT search results
  'Applebot', 'Applebot-Extended', // Apple / Siri / Apple Intelligence
  'Meta-ExternalAgent', 'DuckAssistBot', 'MistralAI-User', 'CCBot',
];

const group = (agents) => [
  ...agents.map((a) => `User-agent: ${a}`),
  'Allow: /',
  ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`),
  '',
];

const robots = [
  `# robots.txt for UniCoach (${SITE_URL})`,
  '',
  ...group(['*']),
  '# AI search engines and assistants: allowed, so UniCoach can be found and cited in AI answers',
  ...group(AI_CRAWLERS),
  `# Site summary for AI tools: ${SITE_URL}/llms.txt`,
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

fs.writeFileSync(path.join(root, 'public', 'sitemap-pages.xml'), xml);
fs.writeFileSync(path.join(root, 'public', 'robots.txt'), robots);
console.log(`sitemap-pages.xml: ${unique.length} URLs on ${SITE_URL}`);
