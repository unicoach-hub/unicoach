// Tutorial video kit: drives a real browser on the live site and records it as an MP4.
// In-page overlay (cursor, click ripple, step captions, highlight ring, intro/outro cards) is
// injected into the page so it is part of the recording. Frames come from the Chrome
// screencast (crisp, 1920 wide) and are stitched with their real timings by ffmpeg.
//
// Safety: every non-GET request is aborted unless allowPost matches it, and analytics /
// ad pixels are always blocked, so recordings never write data or fire Meta events.
import { chromium } from 'playwright';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const TRACKERS = /google-analytics|googletagmanager|facebook\.net|facebook\.com\/tr|clarity\.ms|doubleclick|hotjar|sentry/;

const OVERLAY = () => {
  const css = `
  #tut-cursor{position:fixed;left:-60px;top:-60px;width:30px;height:30px;z-index:2147483647;pointer-events:none;
    transition:left var(--d,.7s) cubic-bezier(.45,.05,.25,1),top var(--d,.7s) cubic-bezier(.45,.05,.25,1);filter:drop-shadow(0 3px 4px rgba(22,19,15,.35))}
  #tut-ripple{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border:3px solid #DE5C2B;border-radius:50%;z-index:2147483646;pointer-events:none;opacity:0}
  #tut-ripple.go{animation:tutr .55s ease-out}
  @keyframes tutr{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.5);opacity:0}}
  #tut-cap{position:fixed;left:50%;bottom:26px;transform:translate(-50%,24px);opacity:0;z-index:2147483645;pointer-events:none;
    display:flex;align-items:center;gap:14px;max-width:min(1040px,92vw);padding:12px 24px 12px 12px;background:#fff;border:2.5px solid #16130F;
    border-radius:18px;box-shadow:5px 5px 0 #16130F;transition:opacity .35s,transform .35s cubic-bezier(.2,.7,.2,1)}
  #tut-cap.on{opacity:1;transform:translate(-50%,0)}
  #tut-cap b{flex:none;width:40px;height:40px;border-radius:50%;background:#DE5C2B;color:#fff;display:grid;place-items:center;
    font:800 20px/1 Urbanist,sans-serif;border:2.5px solid #16130F}
  #tut-cap span{font:700 24px/1.2 Urbanist,sans-serif;color:#16130F;letter-spacing:-.01em}
  #tut-ring{position:fixed;z-index:2147483644;pointer-events:none;border:3px solid #DE5C2B;border-radius:14px;opacity:0;
    box-shadow:0 0 0 7px rgba(222,92,43,.18);transition:all .4s cubic-bezier(.2,.7,.2,1)}
  #tut-ring.on{opacity:1}
  #tut-card{position:fixed;inset:0;z-index:2147483640;background:#F6F3EC;display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;gap:18px;opacity:0;pointer-events:none;transition:opacity .5s}
  #tut-card.on{opacity:1}
  #tut-card img{height:54px}
  #tut-card .k{font:700 15px/1 Onest,sans-serif;letter-spacing:.16em;color:#C04A1D;padding:9px 16px;border:2px solid #16130F;border-radius:99px;background:#FCE38A;box-shadow:3px 3px 0 #16130F}
  #tut-card h1{margin:0;font:900 64px/1.02 Urbanist,sans-serif;letter-spacing:-.035em;color:#16130F;max-width:1000px}
  #tut-card p{margin:0;font:500 24px/1.4 Onest,sans-serif;color:#5B544A;max-width:820px}
  #tut-card .u{font:700 22px/1 Onest,sans-serif;color:#fff;background:#DE5C2B;padding:14px 26px;border-radius:99px;border:2.5px solid #16130F;box-shadow:4px 4px 0 #16130F}
  [aria-label="Open UniBot AI Counsellor"]{display:none!important}`;
  const ensure = () => {
    if (document.getElementById('tut-cursor')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const cur = document.createElement('div'); cur.id = 'tut-cursor';
    cur.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l15 9.5-6.6 1.4 3.9 7.3-3 1.6-3.9-7.4L4 19z" fill="#fff" stroke="#16130F" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const rip = document.createElement('div'); rip.id = 'tut-ripple';
    const cap = document.createElement('div'); cap.id = 'tut-cap'; cap.innerHTML = '<b></b><span></span>';
    const ring = document.createElement('div'); ring.id = 'tut-ring';
    const card = document.createElement('div'); card.id = 'tut-card';
    document.body.append(card, ring, cap, rip, cur);
  };
  window.__tut = {
    ensure,
    cursor(x, y, d) { ensure(); const c = document.getElementById('tut-cursor'); c.style.setProperty('--d', `${d}ms`); c.style.left = `${x - 4}px`; c.style.top = `${y - 3}px`; },
    ripple() { const c = document.getElementById('tut-cursor'); const r = document.getElementById('tut-ripple');
      r.style.left = `${parseFloat(c.style.left) + 4}px`; r.style.top = `${parseFloat(c.style.top) + 3}px`; r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); },
    caption(n, text) { ensure(); const cap = document.getElementById('tut-cap'); cap.querySelector('b').textContent = n; cap.querySelector('span').textContent = text; cap.classList.add('on'); },
    hideCaption() { document.getElementById('tut-cap')?.classList.remove('on'); },
    ring(x, y, w, h) { ensure(); const r = document.getElementById('tut-ring'); Object.assign(r.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }); r.classList.add('on'); },
    hideRing() { document.getElementById('tut-ring')?.classList.remove('on'); },
    card(html) { ensure(); const c = document.getElementById('tut-card'); c.innerHTML = html; c.classList.add('on'); },
    hideCard() { document.getElementById('tut-card')?.classList.remove('on'); },
    logo() { const img = [...document.querySelectorAll('header img, nav img')].find((i) => /logo/i.test(i.alt || '') || i.naturalWidth > 100); return img ? img.src : ''; },
  };
};

export async function record({ name, outDir, ffmpeg, width = 1280, height = 720, scale = 1.5, allowPost = null, mock = null, setup = null, run }) {
  const framesDir = join(outDir, `.frames-${name}`);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  await context.addInitScript(OVERLAY);
  if (setup) await context.addInitScript(setup.script, setup.arg);
  const blocked = [];
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (TRACKERS.test(url)) return route.abort();
    if (mock) {
      const hit = await mock(req);
      if (hit) return route.fulfill({ status: hit.status || 200, contentType: 'application/json', body: JSON.stringify(hit.body ?? hit) });
    }
    if (req.method() !== 'GET' && req.method() !== 'OPTIONS' && !(allowPost && allowPost.test(url))) {
      blocked.push(`${req.method()} ${url}`);
      return route.abort();
    }
    return route.continue();
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const stamps = [];
  let recording = false;
  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    if (recording) {
      writeFileSync(join(framesDir, `f${String(stamps.length).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
      // arrival time, not metadata.timestamp: Chrome's frame clock can jump back on busy pages
      stamps.push(Math.max(Date.now() / 1000, stamps.length ? stamps[stamps.length - 1] : 0));
    }
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });

  // a full page load ends the screencast, so start it again whenever the main frame navigates
  page.on('framenavigated', (f) => {
    if (recording && f === page.mainFrame()) {
      cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: width * scale, maxHeight: height * scale, everyNthFrame: 1 }).catch(() => {});
    }
  });
  const wait = (ms) => page.waitForTimeout(ms);
  const center = async (loc) => { const b = await loc.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2, b]; };
  const t = {
    page, wait,
    async start() {
      await page.evaluate(() => window.__tut.ensure());
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: width * scale, maxHeight: height * scale, everyNthFrame: 1 });
      recording = true;
    },
    async card(html, ms) { await page.evaluate((h) => window.__tut.card(h), html); if (ms) await wait(ms); },
    async hideCard(ms = 600) { await page.evaluate(() => window.__tut.hideCard()); await wait(ms); },
    async logo() { return page.evaluate(() => window.__tut.logo()); },
    async caption(n, text, ms = 400) { await page.evaluate(([a, b]) => window.__tut.caption(a, b), [String(n), text]); await wait(ms); },
    async hideCaption(ms = 300) { await page.evaluate(() => window.__tut.hideCaption()); await wait(ms); },
    async moveTo(target, d = 750) {
      const [x, y] = Array.isArray(target) ? target : await center(target);
      await page.evaluate(([a, b, c]) => window.__tut.cursor(a, b, c), [x, y, d]);
      await wait(d + 80);
    },
    async click(loc, { d = 750, real = true } = {}) {
      await t.moveTo(loc, d);
      await page.evaluate(() => window.__tut.ripple());
      if (real) await loc.click();
      await wait(350);
    },
    async type(loc, text, delay = 95) { await t.click(loc); await loc.pressSequentially(text, { delay }); },
    async ring(loc, pad = 8) {
      const b = await loc.boundingBox();
      await page.evaluate(([x, y, w, h]) => window.__tut.ring(x, y, w, h), [b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2]);
      await wait(450);
    },
    async hideRing(ms = 250) { await page.evaluate(() => window.__tut.hideRing()); await wait(ms); },
    async scrollTo(loc, block = 'center', ms = 1000) { await loc.evaluate((el, bl) => el.scrollIntoView({ behavior: 'smooth', block: bl }), block); await wait(ms); },
    // click up to n unchecked checkboxes in the main column (left of x is the filter sidebar)
    async tickBoxes(n, minX = 330) {
      let done = 0;
      for (let tries = 0; done < n && tries < 4; tries++) {
        const idx = await page.locator('input[type="checkbox"]').evaluateAll((els, mx) => {
          const k = els.findIndex((e) => { const r = e.getBoundingClientRect(); return !e.checked && r.width > 0 && r.left > mx && r.top > 150 && r.top < window.innerHeight - 120; });
          return k;
        }, minX);
        if (idx < 0) { await t.scrollBy(240, 800); continue; }
        await t.click(page.locator('input[type="checkbox"]').nth(idx), { d: 700 });
        await wait(450);
        done += 1;
      }
    },
    async scrollBy(dy, ms = 900) { await page.evaluate((v) => window.scrollBy({ top: v, behavior: 'smooth' }), dy); await wait(ms); },
  };

  await run(t);
  const end = Date.now() / 1000;
  recording = false;
  await cdp.send('Page.stopScreencast').catch(() => {});
  await browser.close();
  if (blocked.length) console.log(`[${name}] blocked writes:`, [...new Set(blocked)].slice(0, 10));

  // Stitch frames with their real timings, then encode a small H.264 MP4 + poster
  const lines = [];
  stamps.forEach((ts, i) => {
    const next = i + 1 < stamps.length ? stamps[i + 1] : end;
    lines.push(`file 'f${String(i).padStart(5, '0')}.jpg'`, `duration ${Math.max(0.001, next - ts).toFixed(4)}`);
  });
  lines.push(`file 'f${String(stamps.length - 1).padStart(5, '0')}.jpg'`);
  writeFileSync(join(framesDir, 'list.txt'), lines.join('\n'));
  const mp4 = join(outDir, `${name}.mp4`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(framesDir, 'list.txt'),
    '-vf', `fps=30,scale=${width}:${height}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
    '-movflags', '+faststart', '-an', mp4]);
  const poster = join(outDir, `${name}-poster.jpg`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '1.2', '-i', mp4, '-frames:v', '1', '-q:v', '4', poster]);
  rmSync(framesDir, { recursive: true, force: true });
  console.log(`[${name}] ${stamps.length} frames, ${(end - stamps[0]).toFixed(1)}s -> ${mp4}`);
  return { mp4, poster };
}

export const introCard = (logo, kicker, title, sub) =>
  `<img src="${logo}" alt=""><span class="k">${kicker}</span><h1>${title}</h1><p>${sub}</p>`;
export const outroCard = (logo, title, url, sub) =>
  `<img src="${logo}" alt=""><h1>${title}</h1><span class="u">${url}</span><p>${sub}</p>`;
