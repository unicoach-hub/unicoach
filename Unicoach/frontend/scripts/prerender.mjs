/**
 * Prerenders every public route into static HTML after `vite build`.
 *
 * Why: the site is a client-side React app. Search engines that run JavaScript (Google) see the
 * page, but AI crawlers (GPTBot, ClaudeBot, PerplexityBot), Bing's first pass and link previews
 * (WhatsApp, LinkedIn) only read the raw HTML, which used to be an empty <div id="root">.
 *
 * How: serve dist/ locally, open each route from public/sitemap-pages.xml in headless Chrome, wait
 * for React to render, and save the finished HTML as dist/<route>.html (dist/index.html for "/").
 * Vercel (cleanUrls) and nginx (try_files $uri.html) serve that file for the route, and React
 * replaces the #root content as soon as the bundle loads, so visitors get the normal app.
 * Unknown routes fall back to dist/app-shell.html, the untouched SPA shell.
 *
 * Blog, news and event detail pages are rendered on request by api/seo.js and are skipped here.
 *
 *   node scripts/prerender.mjs                 (runs automatically in `npm run build`)
 *   PRERENDER=0 npm run build                  (skip)
 *   PRERENDER_ONLY=/,/study-abroad/usa node scripts/prerender.mjs
 *
 * It never fails the build: if Chrome cannot start, the site deploys as a plain SPA.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = 'https://www.unicoach.com';
// The production API (see src/config.js). During prerendering the page runs on 127.0.0.1, so its API
// calls (to this URL, or to the local API when no VITE_API_URL is set) are fetched here in Node and
// handed back to the page, which avoids CORS rules for the 127.0.0.1 origin.
const API_URL = (process.env.PRERENDER_API_URL || process.env.VITE_API_URL || 'https://api.unicoach.com/api').replace(/\/+$/, '');
const API_ORIGIN = new URL(API_URL).origin;
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY || 4);
const PAGE_TIMEOUT = 45000;

// Routes rendered elsewhere or not worth a static copy
const SKIP = [/^\/(blogs|news|newsroom|events)\/[^/]+$/];
const ALLOW_DETAIL = new Set(['/blogs/rhodes-scholarship']);
// Third-party scripts that must not run (or count a page view) while prerendering
const BLOCKED_HOSTS = /(google-analytics|googletagmanager|doubleclick|googleadservices|accounts\.google|facebook|fbcdn|clarity\.ms|hotjar|sentry\.io|razorpay|paypal)/i;

const log = (...a) => console.log('[prerender]', ...a);

function readRoutes() {
  if (process.env.PRERENDER_ONLY) return process.env.PRERENDER_ONLY.split(',').map((s) => s.trim()).filter(Boolean);
  const xml = fs.readFileSync(path.join(root, 'public', 'sitemap-pages.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname.replace(/\/+$/, '') || '/')
    .filter((p) => ALLOW_DETAIL.has(p) || !SKIP.some((re) => re.test(p)));
}

const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.lottie': 'application/zip', '.xml': 'application/xml', '.txt': 'text/plain' };

// Static server for dist/: real files as-is, every route gets the untouched SPA shell
function startServer(shell) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(dist, urlPath);
    const ext = path.extname(urlPath).toLowerCase();
    if (ext && ext !== '.html' && file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(shell);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function launchBrowser() {
  const puppeteer = (await import('puppeteer-core')).default;
  const candidates = [
    process.env.PRERENDER_CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const local = candidates.find((p) => fs.existsSync(p));
  if (local && !process.env.VERCEL) {
    return puppeteer.launch({ executablePath: local, headless: true, args: ['--no-sandbox'] });
  }
  // Vercel / AWS-style Linux build images: Chromium packaged with its own libraries
  const chromium = (await import('@sparticuz/chromium')).default;
  // --single-process suits one page per Lambda call; we render several pages at once
  const args = chromium.args.filter((a) => a !== '--single-process');
  return puppeteer.launch({ executablePath: await chromium.executablePath(), headless: true, args });
}

async function forwardApi(request) {
  const url = new URL(request.url());
  const target = `${API_URL}${url.pathname.replace(/^\/api/, '')}${url.search}`;
  const cors = { 'Access-Control-Allow-Origin': url.origin === 'null' ? '*' : request.headers().origin || '*', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': '*' };
  if (request.method() === 'OPTIONS') return request.respond({ status: 204, headers: cors });
  if (request.method() !== 'GET') return request.respond({ status: 503, headers: cors, body: '' });
  try {
    const r = await fetch(target, { signal: AbortSignal.timeout(25000), headers: { accept: 'application/json' } });
    const body = Buffer.from(await r.arrayBuffer());
    return request.respond({ status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('content-type') || 'application/json' }, body });
  } catch {
    return request.respond({ status: 503, headers: cors, body: '' });
  }
}

async function renderRoute(browser, origin, route, shellScripts) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 UniCoachPrerender');
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\/api\//.test(u) || u.startsWith(`${API_ORIGIN}/api/`)) return forwardApi(req);
    if (BLOCKED_HOSTS.test(new URL(u).hostname)) return req.abort();
    return req.continue();
  });
  try {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle2', timeout: PAGE_TIMEOUT }).catch(() => {});
    // Scroll through the page so lazy and in-view sections mount, then back to the top
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    }).catch(() => {});
    await page.waitForNetworkIdle({ idleTime: 600, timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 400));

    const html = await page.evaluate(({ srcs, texts }) => {
      const keepSrc = new Set(srcs);
      const keepText = new Set(texts);
      // Drop scripts the app or third parties injected at runtime; keep exactly the shell's own
      // scripts (the bundle, gtag) so the page boots the same way as before
      document.querySelectorAll('script').forEach((s) => {
        if (s.type === 'application/ld+json') return;
        const src = s.getAttribute('src');
        const keep = src ? keepSrc.has(src) : keepText.has(s.textContent.trim());
        if (!keep) s.remove();
      });
      document.querySelectorAll('#googleidentityservice_button_styles, iframe').forEach((el) => el.remove());
      document.documentElement.className = document.documentElement.className.split(/\s+/).filter((c) => c && !c.startsWith('lenis')).join(' ');
      if (!document.documentElement.className) document.documentElement.removeAttribute('class');
      document.documentElement.setAttribute('data-prerendered', 'true');
      return `<!doctype html>\n${document.documentElement.outerHTML}`;
    }, shellScripts);

    if (!shellScripts.srcs.filter((src) => src.startsWith('/assets/')).every((src) => html.includes(`src="${src}"`))) {
      throw new Error('app bundle script missing from snapshot');
    }
    const textLength = await page.evaluate(() => (document.getElementById('root')?.innerText || '').trim().length);
    if (textLength < 200) throw new Error(`only ${textLength} characters rendered`);
    return html;
  } finally {
    await page.close().catch(() => {});
  }
}

// Same link-preview overrides vite.config.js applies to the share pages (e.g. the mentor banner)
const SHARE_PAGES = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'share-pages.json'), 'utf8'));
function applySharePage(html, route) {
  const meta = SHARE_PAGES[route];
  if (!meta) return html;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const title = esc(meta.title);
  const description = esc(meta.description);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta (?:name|property)="(?:title|og:title|twitter:title)" content=")[^"]*"/g, `$1${title}"`)
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"/g, `$1${description}"`)
    .replace(/(<meta (?:name|property)="(?:og:image|og:image:secure_url|twitter:image)" content=")[^"]*"/g, `$1${meta.image}"`)
    .replace(/(<meta (?:name|property)="(?:og:image:alt|twitter:image:alt)" content=")[^"]*"/g, `$1${esc(meta.imageAlt)}"`)
    .replace(/(<link rel="image_src" href=")[^"]*"/, `$1${meta.image}"`);
}

async function main() {
  const indexFile = path.join(dist, 'index.html');
  if (!fs.existsSync(indexFile)) return log('dist/index.html missing, run vite build first');

  // Keep the pristine SPA shell: the fallback for unknown routes and for api/seo.js.
  // Written even when prerendering is skipped, because vercel.json and nginx.conf point at it.
  const shellFile = path.join(dist, 'app-shell.html');
  if (!fs.existsSync(shellFile)) fs.copyFileSync(indexFile, shellFile);
  const shell = fs.readFileSync(shellFile, 'utf8');
  if (process.env.PRERENDER === '0') return log('skipped (PRERENDER=0)');
  const shellTags = [...shell.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const shellScripts = {
    srcs: shellTags.map((m) => (m[1].match(/\bsrc="([^"]+)"/) || [])[1]).filter(Boolean),
    texts: shellTags.filter((m) => !/\bsrc=/.test(m[1])).map((m) => m[2].trim()),
  };

  const routes = readRoutes();
  const started = Date.now();
  let browser;
  let server;
  try {
    browser = await launchBrowser();
    server = await startServer(shell);
    const origin = `http://127.0.0.1:${server.address().port}`;
    // Wake the API (Render free instances sleep) so the first pages do not time out
    await fetch(`${API_URL}/blogs`, { signal: AbortSignal.timeout(60000) }).catch(() => {});

    const failed = [];
    let done = 0;
    const queue = [...routes];
    const worker = async () => {
      while (queue.length) {
        const route = queue.shift();
        try {
          let html = await renderRoute(browser, origin, route, shellScripts);
          html = applySharePage(html, route);
          const out = route === '/' ? indexFile : path.join(dist, `${route.slice(1)}.html`);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, html);
        } catch (err) {
          failed.push(`${route} (${err.message})`);
        }
        done += 1;
        if (done % 25 === 0) log(`${done}/${routes.length}`);
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, routes.length) }, worker));
    log(`${routes.length - failed.length}/${routes.length} routes prerendered in ${Math.round((Date.now() - started) / 1000)}s`);
    if (failed.length) log(`not prerendered (served as SPA): ${failed.join(', ')}`);
  } catch (err) {
    log(`skipped, the site deploys as a plain SPA: ${err.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) server.close();
  }
}

main();
