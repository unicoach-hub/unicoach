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
