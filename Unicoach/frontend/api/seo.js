/* global process */
// Server-rendered SEO shell for blog, news and event pages (Vercel function).
// The site is a client-side React app, so every URL used to send Google the same homepage <head>
// and almost no text. This serves the normal index.html with the page's own title, description,
// canonical, social tags, structured data and readable content inside #root. React replaces the
// #root content as soon as it loads, so visitors see the usual page.
//
// vercel.json rewrites /blogs/:slug, /news/:slug, /newsroom/:slug and /events/:slug here.

const SITE = 'https://www.unicoach.com';
const API = (process.env.SEO_API_URL || 'https://api.unicoach.com/api').replace(/\/+$/, '');

const TYPES = {
  blog: { api: 'blogs', path: 'blogs', schema: 'BlogPosting' },
  news: { api: 'news', path: 'news', schema: 'NewsArticle' },
  event: { api: 'events', path: 'events', schema: 'Event' },
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const stripHtml = (html) => String(html || '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);

const absolute = (url) => {
  if (!url) return `${SITE}/og-banner-v4.jpg`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Readable body for crawlers: the article body plus any structured sections, as plain HTML
const bodyHtml = (item) => {
  const parts = [];
  // Only allow simple text tags from the stored HTML
  const safe = (html) => String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/<(?!\/?(p|h2|h3|h4|ul|ol|li|strong|em|b|i|a|br|blockquote|table|thead|tbody|tr|th|td)\b)[^>]*>/gi, ' ');
  if (item.description) parts.push(`<p>${esc(item.description)}</p>`);
  if (item.body) parts.push(safe(item.body));
  for (const s of Array.isArray(item.sections) ? item.sections : []) {
    if (!s || !s.content) continue;
    if (s.type === 'heading') parts.push(`<h${s.level === 3 ? 3 : 2}>${esc(stripHtml(s.content))}</h${s.level === 3 ? 3 : 2}>`);
    else if (s.type === 'list' && Array.isArray(s.items)) parts.push(`<ul>${s.items.map((li) => `<li>${esc(stripHtml(li))}</li>`).join('')}</ul>`);
    else parts.push(`<p>${esc(stripHtml(s.content))}</p>`);
  }
  return parts.join('\n');
};

const setTag = (html, re, replacement) => (re.test(html) ? html.replace(re, replacement) : html.replace('</head>', `${replacement}\n</head>`));

async function loadShell(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const res = await fetch(`${proto}://${host}/index.html`);
  if (!res.ok) throw new Error(`index.html ${res.status}`);
  return res.text();
}

export default async function handler(req, res) {
  const type = TYPES[req.query.type] ? req.query.type : null;
  const slug = String(req.query.slug || '').slice(0, 200);
  let shell;
  try {
    shell = await loadShell(req);
  } catch {
    res.status(502).send('Temporarily unavailable');
    return;
  }

  let item = null;
  if (type && slug && /^[a-z0-9-_.]+$/i.test(slug)) {
    try {
      const r = await fetch(`${API}/${TYPES[type].api}/${encodeURIComponent(slug)}`, { headers: { accept: 'application/json' } });
      if (r.ok) item = await r.json();
    } catch {
      item = null;
    }
  }

  // Unknown or unpublished: same app shell, but tell search engines not to index it
  if (!item || item.published === false) {
    const html = setTag(shell, /<meta name="robots"[^>]*>/i, '<meta name="robots" content="noindex, follow" />');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(404).send(html);
    return;
  }

  const t = TYPES[type];
  const canonicalSlug = item.slug || slug;
  const url = `${SITE}/${t.path}/${canonicalSlug}`;
  const title = clip(item.metaTitle || `${item.title} | UniCoach`, 70);
  const description = clip(item.metaDescription || item.description || stripHtml(item.body) || item.title, 160);
  const image = absolute(item.imageUrl);
  const published = item.publishDate || item.createdAt;

  const ld = t.schema === 'Event'
    ? {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: item.title,
      description,
      image: [image],
      startDate: item.eventStart,
      endDate: item.eventEnd,
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: { '@type': 'VirtualLocation', url },
      organizer: { '@type': 'Organization', name: 'UniCoach', url: SITE },
      ...(item.speaker ? { performer: { '@type': 'Person', name: item.speaker } } : {}),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url },
    }
    : {
      '@context': 'https://schema.org',
      '@type': t.schema,
      headline: clip(item.title, 110),
      description,
      image: [image],
      datePublished: published,
      dateModified: item.updatedAt || published,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'UniCoach', url: SITE },
      publisher: { '@type': 'Organization', name: 'UniCoach', logo: { '@type': 'ImageObject', url: `${SITE}/logo-black.png` } },
    };

  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="title"[^>]*>/i, `<meta name="title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="description"[^>]*>/i, `<meta name="description" content="${esc(description)}" />`);
  html = setTag(html, /<meta name="robots"[^>]*>/i, '<meta name="robots" content="index, follow, max-image-preview:large" />');
  html = setTag(html, /<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${esc(url)}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="${t.schema === 'Event' ? 'website' : 'article'}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${esc(url)}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(description)}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${esc(image)}" />`);
  html = setTag(html, /<meta property="og:image:secure_url"[^>]*>/i, `<meta property="og:image:secure_url" content="${esc(image)}" />`);
  html = setTag(html, /<meta name="twitter:url"[^>]*>/i, `<meta name="twitter:url" content="${esc(url)}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${esc(description)}" />`);
  html = setTag(html, /<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${esc(image)}" />`);
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n</head>`);

  const article = `<article>
<h1>${esc(item.title)}</h1>
${published ? `<p><time datetime="${esc(new Date(published).toISOString())}">${esc(new Date(published).toDateString())}</time></p>` : ''}
<img src="${esc(image)}" alt="${esc(item.title)}" width="1200" height="630" />
${bodyHtml(item)}
<p><a href="${SITE}/${t.path === 'news' ? 'newsroom' : t.path}">More from UniCoach</a></p>
</article>`;
  html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${article}</div>`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  res.status(200).send(html);
}
