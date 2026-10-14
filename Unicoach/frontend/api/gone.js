// Leftover URLs from the old WordPress site (wp-*, feeds, tag/category/author archives, ?p= links).
// "410 Gone" tells Google these pages were removed on purpose, so it drops them from search faster
// than a soft 404 (the React app used to answer every unknown URL with the homepage).
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.status(410).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed | UniCoach</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;color:#0f172a">
<h1 style="font-size:24px">This page is no longer available</h1><p>It belonged to our old website. Everything you need is on the new UniCoach site.</p>
<p><a href="https://www.unicoach.com/" style="color:#DE5C2B;font-weight:700">Go to UniCoach →</a></p></body></html>`);
}
