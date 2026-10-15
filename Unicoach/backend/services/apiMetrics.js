// Collects request numbers for the Developer Dashboard without slowing requests down:
// counts are kept in memory and written to MongoDB once a minute as a few small upserts.
//
// 1. Our own API: route pattern (e.g. GET /api/blogs/:slug), status and time taken.
// 2. Calls we make to other services (OpenAI, Groq, Resend, Meta, Razorpay…): counted by host,
//    by wrapping the global fetch.
const mongoose = require('mongoose');

const buckets = new Map(); // `${minuteMs}|${key}` → { count, errors, clientErrors, totalMs, maxMs }
const FLUSH_MS = 60 * 1000;

const minuteOf = (t) => Math.floor(t / 60000) * 60000;

function record(key, { status = 200, ms = 0, failed = false }) {
  const id = `${minuteOf(Date.now())}|${key}`;
  let b = buckets.get(id);
  if (!b) {
    b = { count: 0, errors: 0, clientErrors: 0, totalMs: 0, maxMs: 0 };
    buckets.set(id, b);
  }
  b.count += 1;
  if (failed || status >= 500) b.errors += 1;
  else if (status >= 400) b.clientErrors += 1;
  b.totalMs += ms;
  if (ms > b.maxMs) b.maxMs = ms;
}

// "/api/blogs/how-to-apply-123" → "/api/blogs/:id" when Express gives us no route pattern
const normalisePath = (p) => String(p || '').split('?')[0]
  .replace(/\/[a-f0-9]{24}(?=\/|$)/gi, '/:id')
  .replace(/\/\d+(?=\/|$)/g, '/:n')
  .replace(/\/[^/]{40,}(?=\/|$)/g, '/:token')
  .slice(0, 120);

/** Express middleware: put it before the routes */
function requestMetrics(req, res, next) {
  if (!req.originalUrl.startsWith('/api/')) return next();
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const pattern = req.route?.path ? `${req.baseUrl || ''}${req.route.path === '/' ? '' : req.route.path}` : normalisePath(req.originalUrl);
    record(`${req.method} ${pattern || '/'}`, { status: res.statusCode, ms: Math.round(ms) });
  });
  next();
}

/** Count outgoing calls by host (fetch is what OpenAI, Resend and our own code use) */
function trackOutgoingFetch() {
  if (typeof global.fetch !== 'function' || global.fetch.__metered) return;
  const original = global.fetch;
  const metered = async (input, init) => {
    let host = '';
    try { host = new URL(typeof input === 'string' ? input : input.url).hostname; } catch { /* relative or odd input */ }
    const start = Date.now();
    try {
      const res = await original(input, init);
      if (host && !/^(localhost|127\.|10\.|192\.168\.)/.test(host)) record(`ext:${host}`, { status: res.status, ms: Date.now() - start });
      return res;
    } catch (err) {
      if (host) record(`ext:${host}`, { failed: true, ms: Date.now() - start });
      throw err;
    }
  };
  metered.__metered = true;
  global.fetch = metered;
}

async function flush() {
  if (!buckets.size || mongoose.connection.readyState !== 1) return;
  const now = minuteOf(Date.now());
  const ops = [];
  for (const [id, b] of buckets) {
    const [minuteMs, key] = [Number(id.slice(0, id.indexOf('|'))), id.slice(id.indexOf('|') + 1)];
    if (minuteMs === now) continue; // still filling
    ops.push({
      updateOne: {
        filter: { minute: new Date(minuteMs), key },
        update: { $inc: { count: b.count, serverErrors: b.errors, clientErrors: b.clientErrors, totalMs: b.totalMs }, $max: { maxMs: b.maxMs } },
        upsert: true,
      },
    });
    buckets.delete(id);
  }
  if (!ops.length) return;
  try {
    await require('../models/ApiStat').bulkWrite(ops, { ordered: false });
  } catch (err) {
    console.warn('[Metrics] flush failed:', err.message);
  }
}

let timer = null;
function startMetrics() {
  if (timer) return;
  trackOutgoingFetch();
  timer = setInterval(flush, FLUSH_MS);
  if (timer.unref) timer.unref();
}

module.exports = { requestMetrics, startMetrics, flush, normalisePath };
