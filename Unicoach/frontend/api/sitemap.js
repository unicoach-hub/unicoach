/* global process */
// /sitemap.xml: the static app pages (built into sitemap-pages.xml by scripts/generate-sitemap.cjs)
// plus every published blog, news item and event from the database, so new posts appear without a redeploy.
const SITE = 'https://www.unicoach.com';
const API = (process.env.SEO_API_URL || 'https://api.unicoach.com/api').replace(/\/+$/, '');

const day = (d) => {
  const t = d ? new Date(d) : null;
  return t && !Number.isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
};

async function list(path) {
  try {
    const r = await fetch(`${API}/${path}`, { headers: { accept: 'application/json' } });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  let pages = '';
  try {
    const r = await fetch(`${proto}://${host}/sitemap-pages.xml`);
    if (r.ok) pages = (await r.text()).match(/<url>[\s\S]*?<\/url>/g)?.join('\n  ') || '';
  } catch {
    pages = '';
  }

  const [blogs, news, events] = await Promise.all([list('blogs'), list('news'), list('events')]);
  const entry = (path, item, priority) => (item?.slug && item.published !== false
    ? `<url><loc>${SITE}/${path}/${encodeURIComponent(item.slug)}</loc><lastmod>${day(item.updatedAt || item.publishDate)}</lastmod><priority>${priority}</priority></url>`
    : '');

  const dynamic = [
    ...blogs.map((b) => entry('blogs', b, '0.8')),
    ...news.map((n) => entry('news', n, '0.6')),
    ...events.map((e) => entry('events', e, '0.7')),
  ].filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages}
  ${dynamic.join('\n  ')}
</urlset>
`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}
