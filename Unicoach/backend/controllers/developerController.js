// Developer Dashboard (owner only): server health, API traffic, database, sign-ups, outside services, Coolify.
const os = require('os');
const fs = require('fs');
const mongoose = require('mongoose');
const ApiStat = require('../models/ApiStat');

const RANGES = { '24h': 24 * 3600e3, '7d': 7 * 86400e3, '30d': 30 * 86400e3 };
const rangeMs = (r) => RANGES[r] || RANGES['24h'];
const mb = (bytes) => Math.round(bytes / 1048576);

// Friendly names for outside services we call
const SERVICE_NAMES = [
  [/openai\.com$/, 'OpenAI'], [/groq\.com$/, 'Groq'], [/resend\.(com|dev)$/, 'Resend (email)'],
  [/graph\.facebook\.com$/, 'Meta (WhatsApp / Ads)'], [/razorpay\.com$/, 'Razorpay'], [/cloudinary\.com$/, 'Cloudinary'],
  [/firecrawl\.dev$/, 'Firecrawl'], [/googleapis\.com$/, 'Google'], [/generativelanguage/, 'Gemini'],
  [/twilio\.com$/, 'Twilio'], [/anthropic\.com$/, 'Anthropic'], [/paypal\.com$/, 'PayPal'],
];
const serviceName = (host) => (SERVICE_NAMES.find(([re]) => re.test(host)) || [null, host])[1];

function containerMemory() {
  // Docker/cgroup limits, when the backend runs in a container (Coolify)
  for (const [usedPath, maxPath] of [['/sys/fs/cgroup/memory.current', '/sys/fs/cgroup/memory.max'], ['/sys/fs/cgroup/memory/memory.usage_in_bytes', '/sys/fs/cgroup/memory/memory.limit_in_bytes']]) {
    try {
      const used = Number(fs.readFileSync(usedPath, 'utf8').trim());
      const maxRaw = fs.readFileSync(maxPath, 'utf8').trim();
      const max = maxRaw === 'max' ? 0 : Number(maxRaw);
      if (used) return { usedMb: mb(used), limitMb: max && max < 1e15 ? mb(max) : null };
    } catch { /* not in a container */ }
  }
  return null;
}

let lastCpu = { usage: process.cpuUsage(), at: process.hrtime.bigint() };
function processCpuPercent() {
  const now = process.hrtime.bigint();
  const usage = process.cpuUsage(lastCpu.usage);
  const elapsedUs = Number(now - lastCpu.at) / 1000;
  lastCpu = { usage: process.cpuUsage(), at: now };
  return elapsedUs ? Math.round(((usage.user + usage.system) / elapsedUs) * 1000) / 10 : 0;
}

// Memory the machine can still hand out. Linux "free" leaves out reclaimable cache, so use MemAvailable;
// on a Mac (local testing) there is no honest number, so we say so instead of showing a scary red bar.
function hostMemory() {
  const total = os.totalmem();
  try {
    const info = fs.readFileSync('/proc/meminfo', 'utf8');
    const avail = Number((/MemAvailable:\s+(\d+)/.exec(info) || [])[1]) * 1024;
    if (avail) return { total: mb(total), available: mb(avail), exact: true };
  } catch { /* not Linux */ }
  return { total: mb(total), available: mb(os.freemem()), exact: false };
}

function disk() {
  try {
    const s = fs.statfsSync('/');
    const total = s.blocks * s.bsize;
    const free = s.bavail * s.bsize;
    return { totalGb: Math.round((total / 1073741824) * 10) / 10, usedGb: Math.round(((total - free) / 1073741824) * 10) / 10, percent: Math.round(((total - free) / total) * 100) };
  } catch {
    return null;
  }
}

// Model files (the UniCoach mentor models live on their own connection, so require them directly)
const MODELS = {
  User: () => require('../models/User'),
  Lead: () => require('../models/Lead'),
  Mentor: () => require('../unicoach/models/UnicoachMentor'),
  Booking: () => require('../unicoach/models/UnicoachBooking'),
};
async function countSince(model, since, extra = {}) {
  try {
    return await MODELS[model]().countDocuments({ createdAt: { $gte: since }, ...extra });
  } catch {
    return null;
  }
}

/** GET /api/admin/dev/overview */
exports.overview = async (req, res) => {
  try {
    const now = Date.now();
    const day = new Date(now - 86400e3);
    const week = new Date(now - 7 * 86400e3);
    const month = new Date(now - 30 * 86400e3);
    const db = mongoose.connection.db;
    const [dbStats, traffic] = await Promise.all([
      db.stats().catch(() => null),
      ApiStat.aggregate([
        { $match: { minute: { $gte: day }, key: { $not: /^ext:/ } } },
        { $group: { _id: null, count: { $sum: '$count' }, errors: { $sum: '$serverErrors' }, totalMs: { $sum: '$totalMs' } } },
      ]),
    ]);
    const signups = {};
    for (const [label, model, extra] of [['users', 'User', { role: 'user' }], ['leads', 'Lead', {}], ['mentorApplications', 'Mentor', {}], ['bookings', 'Booking', {}]]) {
      signups[label] = {
        day: await countSince(model, day, extra),
        week: await countSince(model, week, extra),
        month: await countSince(model, month, extra),
      };
    }
    const t = traffic[0] || { count: 0, errors: 0, totalMs: 0 };
    return res.json({
      server: {
        uptimeSec: Math.round(process.uptime()),
        node: process.version,
        env: process.env.NODE_ENV || 'development',
        cpuPercent: processCpuPercent(),
        loadAvg: os.loadavg().map((n) => Math.round(n * 100) / 100),
        cpus: os.cpus().length,
        processMemMb: mb(process.memoryUsage().rss),
        heapMb: mb(process.memoryUsage().heapUsed),
        container: containerMemory(),
        hostMemMb: hostMemory(),
        host: os.hostname(),
        platform: process.platform,
        disk: disk(),
      },
      database: dbStats ? {
        name: dbStats.db,
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataMb: mb(dbStats.dataSize),
        storageMb: mb(dbStats.storageSize),
        indexMb: mb(dbStats.indexSize),
        connected: mongoose.connection.readyState === 1,
      } : { connected: mongoose.connection.readyState === 1 },
      traffic24h: { requests: t.count, errors: t.errors, avgMs: t.count ? Math.round(t.totalMs / t.count) : 0 },
      signups,
      coolifyConfigured: !!(process.env.COOLIFY_URL && process.env.COOLIFY_API_TOKEN),
    });
  } catch (err) {
    console.error('[Dev] overview failed:', err);
    return res.status(500).json({ message: 'Could not load the overview' });
  }
};

/** GET /api/admin/dev/traffic?range=24h|7d|30d */
exports.traffic = async (req, res) => {
  try {
    const span = rangeMs(req.query.range);
    const since = new Date(Date.now() - span);
    const bucketMs = span <= RANGES['24h'] ? 3600e3 : 86400e3;
    const ours = { minute: { $gte: since }, key: { $not: /^ext:/ } };
    const [series, endpoints] = await Promise.all([
      ApiStat.aggregate([
        { $match: ours },
        { $group: { _id: { $subtract: [{ $toLong: '$minute' }, { $mod: [{ $toLong: '$minute' }, bucketMs] }] }, count: { $sum: '$count' }, errors: { $sum: '$serverErrors' }, clientErrors: { $sum: '$clientErrors' } } },
        { $sort: { _id: 1 } },
      ]),
      ApiStat.aggregate([
        { $match: ours },
        { $group: { _id: '$key', count: { $sum: '$count' }, errors: { $sum: '$serverErrors' }, clientErrors: { $sum: '$clientErrors' }, totalMs: { $sum: '$totalMs' }, maxMs: { $max: '$maxMs' } } },
        { $sort: { count: -1 } },
        { $limit: 200 },
      ]),
    ]);
    return res.json({
      bucket: bucketMs === 3600e3 ? 'hour' : 'day',
      series: series.map((s) => ({ t: s._id, count: s.count, errors: s.errors, clientErrors: s.clientErrors })),
      endpoints: endpoints.map((e) => ({ key: e._id, count: e.count, errors: e.errors, clientErrors: e.clientErrors, avgMs: e.count ? Math.round(e.totalMs / e.count) : 0, maxMs: e.maxMs })),
    });
  } catch (err) {
    console.error('[Dev] traffic failed:', err);
    return res.status(500).json({ message: 'Could not load traffic' });
  }
};

/** GET /api/admin/dev/services?range= — calls we make to OpenAI, Resend, Meta … */
exports.services = async (req, res) => {
  try {
    const since = new Date(Date.now() - rangeMs(req.query.range));
    const rows = await ApiStat.aggregate([
      { $match: { minute: { $gte: since }, key: /^ext:/ } },
      { $group: { _id: '$key', count: { $sum: '$count' }, errors: { $sum: '$serverErrors' }, clientErrors: { $sum: '$clientErrors' }, totalMs: { $sum: '$totalMs' } } },
      { $sort: { count: -1 } },
    ]);
    // Several hosts can belong to one service (api.openai.com, files.openai.com …)
    const byService = {};
    for (const r of rows) {
      const host = r._id.slice(4);
      const name = serviceName(host);
      const s = byService[name] || (byService[name] = { name, hosts: [], count: 0, errors: 0, clientErrors: 0, totalMs: 0 });
      s.hosts.push(host);
      s.count += r.count;
      s.errors += r.errors;
      s.clientErrors += r.clientErrors;
      s.totalMs += r.totalMs;
    }
    const configured = {
      OpenAI: !!process.env.OPENAI_API_KEY,
      Groq: !!process.env.GROQ_API_KEY,
      'Resend (email)': !!process.env.RESEND_API_KEY,
      Firecrawl: !!process.env.FIRECRAWL_API_KEY,
      Razorpay: !!process.env.RAZORPAY_KEY_ID,
    };
    return res.json({
      services: Object.values(byService).map((s) => ({ ...s, avgMs: s.count ? Math.round(s.totalMs / s.count) : 0 })),
      configured,
    });
  } catch (err) {
    console.error('[Dev] services failed:', err);
    return res.status(500).json({ message: 'Could not load services' });
  }
};

/** GET /api/admin/dev/database — every collection with its size */
exports.database = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const cols = await db.listCollections({}, { nameOnly: true }).toArray();
    const out = [];
    for (const c of cols) {
      try {
        const [s] = await db.collection(c.name).aggregate([{ $collStats: { storageStats: {} } }]).toArray();
        const st = s?.storageStats || {};
        out.push({ name: c.name, count: st.count || 0, sizeMb: Math.round((st.size || 0) / 10485.76) / 100, storageMb: Math.round((st.storageSize || 0) / 10485.76) / 100, indexMb: Math.round((st.totalIndexSize || 0) / 10485.76) / 100, indexes: st.nindexes || 0 });
      } catch {
        out.push({ name: c.name, count: await db.collection(c.name).estimatedDocumentCount().catch(() => 0) });
      }
    }
    out.sort((a, b) => (b.storageMb || 0) - (a.storageMb || 0));
    return res.json(out);
  } catch (err) {
    console.error('[Dev] database failed:', err);
    return res.status(500).json({ message: 'Could not load collections' });
  }
};

/** GET /api/admin/dev/coolify — server, apps, databases and backups from Coolify (read-only token) */
exports.coolify = async (req, res) => {
  const base = (process.env.COOLIFY_URL || '').replace(/\/+$/, '');
  const token = process.env.COOLIFY_API_TOKEN;
  if (!base || !token) return res.json({ configured: false });
  const get = async (path) => {
    const r = await fetch(`${base}/api/v1${path}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw Object.assign(new Error(`Coolify ${path}: ${r.status}`), { status: r.status });
    return r.json();
  };
  try {
    const [servers, apps, dbs] = await Promise.all([get('/servers'), get('/applications').catch(() => []), get('/databases').catch(() => [])]);
    const backups = [];
    for (const d of (Array.isArray(dbs) ? dbs : []).slice(0, 10)) {
      try {
        const list = await get(`/databases/${d.uuid}/backups`);
        for (const b of (Array.isArray(list) ? list : [])) {
          const execs = b.executions || [];
          const last = execs.sort((x, y) => new Date(y.created_at) - new Date(x.created_at))[0];
          backups.push({ database: d.name, frequency: b.frequency, enabled: b.enabled, lastAt: last?.created_at || null, lastStatus: last?.status || null, lastSize: last?.size || null });
        }
      } catch { /* backups endpoint differs between Coolify versions */ }
    }
    return res.json({
      configured: true,
      servers: (Array.isArray(servers) ? servers : []).map((s) => ({ name: s.name, ip: s.ip, reachable: s.settings?.is_reachable ?? s.is_reachable, usable: s.settings?.is_usable ?? s.is_usable })),
      apps: (Array.isArray(apps) ? apps : []).map((a) => ({ name: a.name, status: a.status, fqdn: a.fqdn, lastOnline: a.last_online_at, updatedAt: a.updated_at })),
      databases: (Array.isArray(dbs) ? dbs : []).map((d) => ({ name: d.name, type: d.database_type || d.type, status: d.status, public: !!d.is_public })),
      backups,
    });
  } catch (err) {
    console.warn('[Dev] Coolify failed:', err.message);
    return res.json({ configured: true, error: err.status === 401 ? 'Coolify rejected the token (check COOLIFY_API_TOKEN)' : `Could not reach Coolify: ${err.message}` });
  }
};

// ---------------------------------------------------------------- Permit watch
// Who gets the Irish employment-permit alerts. Several people can be on the list, and the owner
// edits it here instead of in the environment, so adding a teammate needs no deploy.
const PermitWatchConfig = require('../models/PermitWatchConfig');

const cleanEmails = (list) => [...new Set((Array.isArray(list) ? list : [])
  .map((e) => String(e || '').trim().toLowerCase())
  .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)))].slice(0, 20);

// Indian numbers arrive as 10 digits; anything else keeps its own country code
const cleanPhones = (list) => [...new Set((Array.isArray(list) ? list : [])
  .map((p) => String(p || '').replace(/[^\d+]/g, ''))
  .filter((p) => p.replace(/\D/g, '').length >= 10)
  .map((p) => require('../utils/twilio').normalizePhone(p)))].slice(0, 20);

// Only real web links, http(s) and nothing else, so a typo can never make the watcher fetch
// something odd. The label is free text; an empty one is filled in from the URL at run time.
const cleanPages = (list) => {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).map((p) => {
    const url = String(p?.url || '').trim();
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return null;
    }
    if (!/^https?:$/.test(parsed.protocol)) return null;
    const key = parsed.toString().replace(/\/+$/, '').toLowerCase();
    if (seen.has(key)) return null;
    seen.add(key);
    const every = Number(p?.everyMinutes);
    return {
      url: parsed.toString(),
      label: String(p?.label || '').trim().slice(0, 120),
      everyMinutes: every > 0 ? Math.max(1, Math.min(1440, every)) : null,
      enabled: p?.enabled !== false,
    };
  }).filter(Boolean).slice(0, 50);
};

exports.permitWatch = async (req, res) => {
  try {
    const cfg = await PermitWatchConfig.get();
    const svc = require('../services/permitWatchService');
    const fileCfg = svc.loadConfig();
    const { emails, phones } = await svc.recipients();
    const watched = await svc.watchedPages(fileCfg, cfg);

    res.json({
      ...cfg,
      // What the next pass will actually use, environment included
      effective: {
        emails,
        phones,
        newsIntervalMinutes: Number(cfg.newsIntervalMinutes) > 0 ? Number(cfg.newsIntervalMinutes) : fileCfg.newsIntervalMinutes,
        intervalMinutes: Number(cfg.intervalMinutes) > 0 ? Number(cfg.intervalMinutes) : fileCfg.intervalMinutes,
        pagesWatched: watched.length,
        fromConfigFile: fileCfg.pages.length,
        fromSitemap: watched.filter((p) => p.discovered).length,
        fromEnvEmails: emails.filter((e) => !(cfg.emails || []).map((x) => x.toLowerCase()).includes(e)),
      },
      // Everything being watched, so the panel can show where each link came from.
      // Only the "admin" ones are editable there; the rest are the built-in list and the sitemap.
      watched: watched.map((p) => ({
        label: p.label,
        url: p.url,
        everyMinutes: p.everyMinutes || null,
        source: p.fromAdmin ? 'admin' : p.discovered ? 'sitemap' : 'built-in',
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePermitWatch = async (req, res) => {
  try {
    const { emails, phones, pages, enabled, newsIntervalMinutes, intervalMinutes } = req.body || {};
    const set = {
      emails: cleanEmails(emails),
      phones: cleanPhones(phones),
      pages: cleanPages(pages),
      enabled: enabled !== false,
      updatedBy: req.user?.email || req.user?.name || '',
    };
    const news = Number(newsIntervalMinutes);
    const slow = Number(intervalMinutes);
    set.newsIntervalMinutes = news > 0 ? Math.max(1, Math.min(1440, news)) : null;
    set.intervalMinutes = slow > 0 ? Math.max(1, Math.min(1440, slow)) : null;

    await PermitWatchConfig.updateOne({ key: 'default' }, { $set: set }, { upsert: true });
    res.json({ ok: true, ...set });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Sends one test alert to everyone on the list, so the owner can see it arrive. */
exports.testPermitWatch = async (req, res) => {
  try {
    const svc = require('../services/permitWatchService');
    const { emails, phones } = await svc.recipients();
    if (!emails.length && !phones.length) return res.status(400).json({ message: 'Add an email or a WhatsApp number first' });

    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // The pages everyone on the list is watching, so the test mail is useful on its own:
    // the portal first, then the pages where announcements land.
    const pages = svc.loadConfig().pages;
    const pick = (re) => pages.find((p) => re.test(p.url));
    const headline = [pick(/employmentpermits\.enterprise\.gov\.ie/), pick(/latest-updates/), pick(/department-news/)]
      .filter(Boolean);
    const links = headline
      .map((p) => `<li style="margin-bottom:6px"><a href="${esc(p.url)}" style="color:#14837E">${esc(p.label)}</a></li>`)
      .join('');
    const portalUrl = (headline[0] || pages[0] || {}).url || '';

    const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#F4F4F2;margin:0">
      <div style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #DDD8D0;border-radius:12px;padding:26px">
        <p style="margin:0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#14837E;font-weight:700">Test alert</p>
        <h1 style="margin:8px 0 10px;font-size:20px;color:#16130F">Irish permit watch is set up</h1>
        <p style="margin:0 0 14px;font-size:14px;color:#3D3830">You are on the alert list. A real alert names the page, links straight to it and shows exactly what changed.</p>
        <p style="margin:0 0 6px;font-size:13.5px;font-weight:700;color:#16130F">Watching ${pages.length} pages, including:</p>
        <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.5">${links}</ul>
        ${portalUrl ? svc.openButton(portalUrl, 'Open the permits portal') : ''}
        <p style="margin:20px 0 0;font-size:12px;color:#8A8278">Sent ${when} IST from admin → Developer.</p>
      </div></body></html>`;

    const waText = ['🇮🇪 Test: Irish permit watch chaalu hai. Asli alert aise hi aayega — page ka naam, link aur kya badla.']
      .concat(headline.map((p) => `${p.label}\n${p.url}`))
      .join('\n\n');

    const emailed = await svc.deliver({ subject: 'Test: Irish permit watch', html, emails });
    const whatsapped = await svc.sendWhatsApp(waText, { phones });
    res.json({ ok: true, emailed, whatsapped, emails, phones });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/** Runs a pass now instead of waiting for the next tick. */
exports.runPermitWatch = async (req, res) => {
  try {
    const results = await require('../services/permitWatchService').runOnce({ all: req.query.all === 'true' });
    const count = (s) => results.filter((r) => r.status === s).length;
    res.json({ ok: true, checked: results.length, changed: count('changed'), unchanged: count('unchanged'), baseline: count('baseline'), failed: count('failed') + count('error') });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
