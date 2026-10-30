// Tutorial video kit: drives a real browser on the live site and records it as an MP4.
// In-page overlay (cursor, click ripple, step captions, highlight ring, intro/outro cards) is
// injected into the page so it is part of the recording. Frames come from the Chrome
// screencast (crisp, 1920 wide) and are stitched with their real timings by ffmpeg.
//
// Safety: every non-GET request is aborted unless allowPost matches it, and analytics /
// ad pixels are always blocked, so recordings never write data or fire Meta events.
//
// Pacing for a voice-over: t.say() holds each step for as long as its line in voiceover-en.md takes.
// PACE=estimate: no audio, no captions; writes an .srt with each line's start and end so an editor can
// drop the voice clips in. VOICE_DIR (lines.json with audio files): mixes those clips into the MP4.
// EXPORT_WIDTH=1920 exports 1080p instead of 720p.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// The lines of one video's table in voiceover-en.md, keyed by step ('intro', '1', … 'outro')
function scriptLines(video) {
  const out = {};
  let on = false;
  for (const raw of readFileSync(join(HERE, 'voiceover-en.md'), 'utf8').split('\n')) {
    if (raw.startsWith('## ')) { on = raw.slice(3).trim() === video; continue; }
    if (!on || !raw.startsWith('|')) continue;
    const cells = raw.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 3 || cells[0] === 'Step' || /^-+$/.test(cells[0])) continue;
    out[cells[0]] = cells[2];
  }
  return out;
}

// Lines to pace a video by: estimated speaking time (PACE=estimate), or real audio from VOICE_DIR/lines.json
export function loadVoice(video) {
  if (process.env.PACE === 'estimate') {
    const lines = Object.fromEntries(Object.entries(scriptLines(video)).map(([step, text]) => {
      const words = text.split(/\s+/).filter(Boolean).length;
      return [step, { step, text, seconds: Math.round(Math.max(2.2, words / 2.4 + 0.6) * 100) / 100 }];
    }));
    return { lines, face: null, captions: false };
  }
  const dir = process.env.VOICE_DIR;
  if (!dir || !existsSync(join(dir, 'lines.json'))) return null;
  const all = JSON.parse(readFileSync(join(dir, 'lines.json'), 'utf8'));
  const lines = Object.fromEntries(Object.values(all).filter((v) => v.video === video).map((v) => [v.step, v]));
  const facePath = join(HERE, 'nitya-face.jpg');
  const face = existsSync(facePath) ? `data:image/jpeg;base64,${readFileSync(facePath).toString('base64')}` : null;
  return { lines, face };
}

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
  .tut-face{position:relative;flex:none;border-radius:50%}
  .tut-face img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;border:3px solid #16130F;background:#fff;box-sizing:border-box}
  .tut-face::after{content:'';position:absolute;inset:-7px;border-radius:50%;border:3px solid #DE5C2B;opacity:0;pointer-events:none}
  html[data-tut-speaking="1"] .tut-face::after{animation:tutpulse 1.15s ease-out infinite}
  @keyframes tutpulse{0%{transform:scale(.9);opacity:.95}100%{transform:scale(1.25);opacity:0}}
  #tut-cap .tut-face{width:66px;height:66px}
  #tut-cap .tut-face i{position:absolute;right:-5px;bottom:-5px;width:26px;height:26px;border-radius:50%;background:#DE5C2B;color:#fff;display:grid;place-items:center;
    font:800 13px/1 Urbanist,sans-serif;font-style:normal;border:2px solid #16130F;z-index:1}
  #tut-cap .tut-txt{display:flex;flex-direction:column;gap:5px;min-width:0}
  #tut-cap .tut-txt small{font:700 13px/1 Onest,sans-serif;color:#C04A1D;letter-spacing:.06em}
  #tut-cap .tut-txt span{font:700 22px/1.25 Urbanist,sans-serif}
  #tut-card .tut-face{width:150px;height:150px}
  #tut-card .tut-face img{width:100%;height:100%}
  [aria-label="Open UniBot AI Counsellor"]{display:none!important}
  figure:has(video){display:none!important}`;
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
    caption(n, text) {
      ensure();
      const cap = document.getElementById('tut-cap');
      cap.innerHTML = window.__tutFace
        ? `<div class="tut-face"><img alt="" src="${window.__tutFace}"><i></i></div><div class="tut-txt"><small>NITYA · UNICOACH</small><span></span></div>`
        : '<b></b><span></span>';
      cap.querySelector(window.__tutFace ? 'i' : 'b').textContent = n;
      cap.querySelector('span').textContent = text;
      cap.classList.add('on');
    },
    speak(ms) {
      const h = document.documentElement;
      h.dataset.tutSpeaking = '1';
      clearTimeout(window.__tutSpk);
      window.__tutSpk = setTimeout(() => { delete h.dataset.tutSpeaking; }, ms);
    },
    hideCaption() { document.getElementById('tut-cap')?.classList.remove('on'); },
    ring(x, y, w, h) { ensure(); const r = document.getElementById('tut-ring'); Object.assign(r.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }); r.classList.add('on'); },
    hideRing() { document.getElementById('tut-ring')?.classList.remove('on'); },
    card(html) {
      ensure();
      const c = document.getElementById('tut-card');
      c.innerHTML = html.replace('{{FACE}}', window.__tutFace ? `<div class="tut-face"><img alt="" src="${window.__tutFace}"></div>` : '');
      c.classList.add('on');
    },
    hideCard() { document.getElementById('tut-card')?.classList.remove('on'); },
    logo() { const img = [...document.querySelectorAll('header img, nav img')].find((i) => /logo/i.test(i.alt || '') || i.naturalWidth > 100); return img ? img.src : ''; },
  };
};

export async function record({ name, outDir, ffmpeg, width = 1280, height = 720, scale = 1.5, allowPost = null, mock = null, setup = null, voice = null, run }) {
  const framesDir = join(outDir, `.frames-${name}`);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  await context.addInitScript(OVERLAY);
  if (voice?.face) await context.addInitScript((f) => { window.__tutFace = f; }, voice.face);
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
  const marks = []; // { file, at } for every voice line, at = wall-clock seconds when it started
  let busyUntil = 0;
  const center = async (loc) => { const b = await loc.boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2, b]; };
  const t = {
    page, wait, voiced: Boolean(voice),
    async waitVoice(gap = 0) { const left = busyUntil - Date.now() + gap; if (left > 0) await wait(left); },
    // a step's caption: Nitya's line when there is voice (after the previous line ends), else the short caption
    async say(step, n, fallback) {
      const line = voice?.lines?.[step];
      if (!line) return t.caption(n, fallback);
      await t.waitVoice(250);
      if (voice.captions === false) await page.evaluate(() => window.__tut.hideCaption());
      else await page.evaluate(([a, b, ms]) => { window.__tut.caption(a, b); window.__tut.speak(ms); }, [String(n), line.text, line.seconds * 1000]);
      marks.push({ file: line.file, text: line.text, seconds: line.seconds, at: Date.now() / 1000 });
      busyUntil = Date.now() + line.seconds * 1000;
      await wait(350);
    },
    // a line spoken over the intro / outro card
    async sayCard(step) {
      const line = voice?.lines?.[step];
      if (!line) return;
      await t.waitVoice(250);
      await page.evaluate((ms) => window.__tut.speak(ms), line.seconds * 1000);
      marks.push({ file: line.file, text: line.text, seconds: line.seconds, at: Date.now() / 1000 });
      busyUntil = Date.now() + line.seconds * 1000;
    },
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

  // Lay the frames on an even 30 fps grid by their real arrival times (output frame k shows the latest frame
  // captured by k/30 s), so the video runs exactly as long as the recording did. ffmpeg's concat demuxer
  // rounds each frame's duration to 1/25 s, which stretched videos with many frames by several seconds.
  const FPS = 30;
  const seqDir = join(framesDir, 'seq');
  mkdirSync(seqDir);
  let j = 0;
  for (let k = 0, n = Math.ceil((end - stamps[0]) * FPS); k < n; k++) {
    const at = stamps[0] + k / FPS;
    while (j + 1 < stamps.length && stamps[j + 1] <= at) j += 1;
    symlinkSync(join(framesDir, `f${String(j).padStart(5, '0')}.jpg`), join(seqDir, `s${String(k).padStart(6, '0')}.jpg`));
  }
  const mp4 = join(outDir, `${name}.mp4`);
  const outW = Number(process.env.EXPORT_WIDTH || width);
  const outH = Math.round((outW * height) / width / 2) * 2;
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', '0', '-i', join(seqDir, 's%06d.jpg'),
    '-vf', `scale=${outW}:${outH}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', outW > width ? '20' : '24',
    '-movflags', '+faststart', '-an', mp4]);
  if (marks.length) {
    const total = (end - stamps[0]).toFixed(3);
    const timing = marks.map((m) => ({ file: m.file, text: m.text, seconds: m.seconds, ms: Math.max(0, Math.round((m.at - stamps[0]) * 1000)) }));
    writeFileSync(join(outDir, `${name}.voice.json`), JSON.stringify({ total: Number(total), lines: timing }, null, 1));
    // subtitles: where each line starts and ends, for whoever adds the voice
    const ts = (ms) => new Date(Math.round(ms)).toISOString().slice(11, 23).replace('.', ',');
    writeFileSync(join(outDir, `${name}.srt`), timing.map((m, i) => `${i + 1}\n${ts(m.ms)} --> ${ts(m.ms + m.seconds * 1000)}\n${m.text}\n`).join('\n'));
  }
  if (marks.length && marks.every((m) => m.file)) {
    // place each line where it started, even out loudness, pad to the video's length
    const total = (end - stamps[0]).toFixed(3);
    const timing = marks.map((m) => ({ file: m.file, ms: Math.max(0, Math.round((m.at - stamps[0]) * 1000)) }));
    const tmp = join(outDir, `${name}.voiced.mp4`);
    const args = ['-y', '-loglevel', 'error', '-i', mp4];
    timing.forEach((m) => args.push('-i', m.file));
    const parts = timing.map((m, i) => `[${i + 1}:a]aresample=48000,adelay=delays=${m.ms}:all=1[a${i}]`);
    // pad to the exact video length (apad + -shortest never ends on some ffmpeg builds)
    const graph = `${parts.join(';')};${timing.map((_, i) => `[a${i}]`).join('')}amix=inputs=${timing.length}:normalize=0:dropout_transition=0,`
      + `loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=${total},atrim=0:${total}[a]`;
    execFileSync(ffmpeg, [...args, '-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k',
      '-t', total, '-movflags', '+faststart', tmp]);
    renameSync(tmp, mp4);
  }
  const poster = join(outDir, `${name}-poster.jpg`);
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '1.2', '-i', mp4, '-frames:v', '1', '-q:v', '4', poster]);
  rmSync(framesDir, { recursive: true, force: true });
  console.log(`[${name}] ${stamps.length} frames, ${(end - stamps[0]).toFixed(1)}s, ${marks.length} voice lines -> ${mp4}`);
  return { mp4, poster };
}

export const introCard = (logo, kicker, title, sub) =>
  `<img src="${logo}" alt="">{{FACE}}<span class="k">${kicker}</span><h1>${title}</h1><p>${sub}</p>`;
export const outroCard = (logo, title, url, sub) =>
  `<img src="${logo}" alt="">{{FACE}}<h1>${title}</h1><span class="u">${url}</span><p>${sub}</p>`;
