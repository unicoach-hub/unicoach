// Anonymous website visitors: the beacon the site sends (POST /api/t) and the owner's
// Admin → Developer → Visitors page. See frontend/src/utils/visitorTracking.js for what the browser sends.
const Visitor = require('../models/Visitor');
const VisitorEvent = require('../models/VisitorEvent');
const Lead = require('../models/Lead');

const RETENTION_MS = 90 * 24 * 3600 * 1000;
const ID_RX = /^[a-z0-9_-]{8,64}$/i;
const TYPES = new Set(['pv', 'pe', 'err', 'api', 'rage', 'fs', 'fa', 'cv']);
// Crawlers, link previews, uptime checks and headless browsers (our own prerender uses Puppeteer)
const BOT_RX = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|lighthouse|pagespeed|puppeteer|playwright|phantom|python|curl|wget|axios|node-fetch|monitor|uptime/i;

let geoip = null;
const lookupCity = (ip) => {
  try {
    if (!geoip) geoip = require('geoip-lite');
    const g = ip && geoip.lookup(String(ip).replace(/^::ffff:/, ''));
    return g ? { city: g.city || '', region: g.region || '', country: g.country || '' } : null;
  } catch {
    return null;
  }
};

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined;
};
const cleanPath = (p) => str(p, 300).split('#')[0] || '/';

const parseBody = (req) => {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  try {
    return JSON.parse(typeof req.body === 'string' ? req.body : '');
  } catch {
    return null;
  }
};

const KIND_LABELS = [
  [/\/leads\/book-consultation/, 'Consultation request'],
  [/\/leads\/submit/, 'Lead form'],
  [/\/consultations$/, 'Counsellor call booked'],
  [/\/forms\//, 'Custom form'],
  [/\/bookings\//, 'Slot booking'],
  [/\/events\//, 'Event registration'],
  [/\/support-requests/, 'Support request'],
  [/\/auth\/(register|google)/, 'New account'],
  [/\/unicoach\/apply/, 'Mentor application'],
];
const kindLabel = (k) => (KIND_LABELS.find(([re]) => re.test(k)) || [null, 'Form'])[1];

/**
 * POST /api/t (public, sent with navigator.sendBeacon as text/plain)
 * { v: visitorId, s: sessionId, n: true when this is a new session, d: { device, os, browser, sw, lang },
 *   src: "instagram / paid · summer", lp: landing page, e: [{ i, t, p, ti, du, sc, x, k, em, nm, at }] }
 * Always answers 204 quickly: tracking never shows an error to a visitor.
 */
exports.track = async (req, res) => {
  res.status(204).end();
  try {
    const ua = String(req.headers['user-agent'] || '');
    if (!ua || BOT_RX.test(ua)) return;
    const b = parseBody(req);
    if (!b || !ID_RX.test(String(b.v || '')) || !Array.isArray(b.e) || !b.e.length) return;
    const visitorId = String(b.v);
    const sessionId = ID_RX.test(String(b.s || '')) ? String(b.s) : '';
    const events = b.e.slice(0, 40).filter((e) => e && TYPES.has(e.t));
    if (!events.length) return;

    const now = new Date();
    const inc = { pageviews: 0, timeSec: 0, 'issues.errors': 0, 'issues.apiFails': 0, 'issues.rageClicks': 0, 'issues.formStarts': 0, 'issues.formAbandons': 0, conversions: 0 };
    const docs = [];
    const pageEnds = [];
    let lastPage = '';
    let conversion = null;

    for (const e of events) {
      const at = new Date(Number(e.at) || now);
      const when = Math.abs(at - now) < 24 * 3600e3 ? at : now;
      const path = cleanPath(e.p);
      const id = ID_RX.test(String(e.i || '')) ? `${visitorId}:${e.i}` : undefined;
      if (e.t === 'pe') {
        const du = num(e.du, 0, 4 * 3600);
        if (id && du !== undefined) pageEnds.push({ id, du, sc: num(e.sc, 0, 100) });
        continue;
      }
      if (e.t === 'pv') { inc.pageviews += 1; lastPage = path; }
      if (e.t === 'err') inc['issues.errors'] += 1;
      if (e.t === 'api') inc['issues.apiFails'] += 1;
      if (e.t === 'rage') inc['issues.rageClicks'] += 1;
      if (e.t === 'fs') inc['issues.formStarts'] += 1;
      if (e.t === 'fa') inc['issues.formAbandons'] += 1;
      if (e.t === 'cv') {
        inc.conversions += 1;
        conversion = { label: kindLabel(str(e.k, 120)), email: str(e.em, 160).trim().toLowerCase(), name: str(e.nm, 120).trim() };
      }
      docs.push({
        ...(id ? { _id: id } : { _id: `${visitorId}:${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 8)}` }),
        visitorId, sessionId, type: e.t, path, at: when,
        title: str(e.ti, 160),
        detail: e.t === 'cv' ? (conversion?.label || '') : str(e.x, 300),
      });
    }

    if (docs.length) await VisitorEvent.insertMany(docs, { ordered: false }).catch(() => {}); // a resent beacon only duplicates ids

    // Time on page: the "page ended" beacon fills in the page view it belongs to
    for (const pe of pageEnds) {
      const r = await VisitorEvent.updateOne(
        { _id: pe.id, visitorId, type: 'pv' },
        { $inc: { durationSec: pe.du }, ...(pe.sc !== undefined ? { $max: { scroll: pe.sc } } : {}) },
      );
      if (r.modifiedCount) inc.timeSec += pe.du;
    }

    const existing = await Visitor.findById(visitorId).select('lastSessionId city converted').lean();
    const newSession = Boolean(sessionId) && existing?.lastSessionId !== sessionId;
    const d = b.d && typeof b.d === 'object' ? b.d : {};
    const set = {
      lastSeen: now,
      expireAt: new Date(now.getTime() + RETENTION_MS),
      ...(sessionId ? { lastSessionId: sessionId } : {}),
      ...(lastPage ? { lastPage } : {}),
      ...(str(b.src, 160) ? { lastSource: str(b.src, 160) } : {}),
    };
    if (!existing?.city) Object.assign(set, lookupCity(req.ip) || {});
    if (conversion) {
      set.converted = true;
      set.lastConversion = conversion.label;
      const lead = conversion.email ? await Lead.findOne({ email: conversion.email }).sort({ createdAt: -1 }).select('name').lean() : null;
      if (lead) set.leadId = lead._id;
      if (lead?.name || conversion.name) set.leadName = lead?.name || conversion.name;
    }
    const $inc = { ...Object.fromEntries(Object.entries(inc).filter(([, v]) => v)), ...(newSession ? { sessions: 1 } : {}) };
    await Visitor.updateOne(
      { _id: visitorId },
      {
        $set: set,
        ...(Object.keys($inc).length ? { $inc } : {}),
        $setOnInsert: {
          firstSeen: now,
          device: str(d.device, 20), os: str(d.os, 40), browser: str(d.browser, 40),
          screen: num(d.sw, 0, 10000), lang: str(d.lang, 20),
          firstSource: str(b.src, 160) || 'direct', landingPage: cleanPath(b.lp),
        },
        ...(conversion && !existing?.converted ? { $min: { convertedAt: now } } : {}),
      },
      { upsert: true },
    );
  } catch (err) {
    if (err?.code !== 11000) console.warn('[Visitors] track failed:', err.message);
  }
};

/* ───────────── Admin → Developer → Visitors (owner only) ───────────── */

const sinceDays = (q) => new Date(Date.now() - (Math.min(90, Math.max(1, Number(q) || 30)) * 86400e3));

const VIEWS = {
  // Came back at least twice and never filled a form: the people to retarget
  returning: { converted: { $ne: true }, sessions: { $gte: 2 } },
  issues: { $or: [{ 'issues.errors': { $gt: 0 } }, { 'issues.apiFails': { $gt: 0 } }, { 'issues.rageClicks': { $gt: 0 } }, { 'issues.formAbandons': { $gt: 0 } }] },
  converted: { converted: true },
  all: {},
};

/** GET /api/admin/dev/visitors?view=returning&days=30&page=1&q=delhi */
exports.list = async (req, res) => {
  try {
    const view = VIEWS[req.query.view] ? req.query.view : 'returning';
    const filter = { ...VIEWS[view], lastSeen: { $gte: sinceDays(req.query.days) } };
    const q = String(req.query.q || '').trim().slice(0, 60);
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = [{ $or: [{ city: rx }, { lastSource: rx }, { firstSource: rx }, { leadName: rx }, { lastPage: rx }, { landingPage: rx }, { _id: rx }] }];
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const sort = view === 'returning' ? { sessions: -1, lastSeen: -1 } : { lastSeen: -1 };
    const [rows, total] = await Promise.all([
      Visitor.find(filter).sort(sort).skip((page - 1) * 50).limit(50).lean(),
      Visitor.countDocuments(filter),
    ]);
    return res.json({ rows, total, page });
  } catch (err) {
    console.error('[Visitors] list failed:', err);
    return res.status(500).json({ message: 'Could not load visitors' });
  }
};

/** GET /api/admin/dev/visitors/summary?days=30 */
exports.summary = async (req, res) => {
  try {
    const since = sinceDays(req.query.days);
    const seen = { lastSeen: { $gte: since } };
    const [totals] = await Visitor.aggregate([
      { $match: seen },
      { $group: {
        _id: null,
        visitors: { $sum: 1 },
        returning: { $sum: { $cond: [{ $gte: ['$sessions', 2] }, 1, 0] } },
        returningNoForm: { $sum: { $cond: [{ $and: [{ $gte: ['$sessions', 2] }, { $ne: ['$converted', true] }] }, 1, 0] } },
        converted: { $sum: { $cond: ['$converted', 1, 0] } },
        pageviews: { $sum: '$pageviews' },
        withIssues: { $sum: { $cond: [{ $gt: [{ $add: ['$issues.errors', '$issues.apiFails', '$issues.rageClicks'] }, 0] }, 1, 0] } },
        formAbandons: { $sum: '$issues.formAbandons' },
      } },
    ]);

    const group = (field) => Visitor.aggregate([
      { $match: seen },
      { $group: { _id: { $ifNull: [`$${field}`, ''] }, visitors: { $sum: 1 }, converted: { $sum: { $cond: ['$converted', 1, 0] } } } },
      { $sort: { visitors: -1 } },
      { $limit: 12 },
    ]);

    // Pages: views, people, time on page, how many of those people later filled a form, how often it was the last page
    const pages = VisitorEvent.aggregate([
      { $match: { type: 'pv', at: { $gte: since } } },
      { $group: {
        _id: '$path',
        views: { $sum: 1 },
        people: { $addToSet: '$visitorId' },
        avgSec: { $avg: '$durationSec' },
        avgScroll: { $avg: '$scroll' },
      } },
      { $sort: { views: -1 } },
      { $limit: 40 },
    ]).allowDiskUse(true);

    const exits = VisitorEvent.aggregate([
      { $match: { type: 'pv', at: { $gte: since }, sessionId: { $ne: '' } } },
      { $sort: { at: 1 } },
      { $group: { _id: '$sessionId', last: { $last: '$path' }, views: { $sum: 1 } } },
      { $group: { _id: '$last', exits: { $sum: 1 }, bounces: { $sum: { $cond: [{ $eq: ['$views', 1] }, 1, 0] } } } },
      { $sort: { exits: -1 } },
      { $limit: 15 },
      { $project: { _id: 0, path: '$_id', exits: 1, bounces: 1 } },
    ]).allowDiskUse(true);

    const issues = VisitorEvent.aggregate([
      { $match: { type: { $in: ['err', 'api', 'rage', 'fa'] }, at: { $gte: since } } },
      { $group: { _id: { path: '$path', type: '$type', detail: '$detail' }, count: { $sum: 1 }, people: { $addToSet: '$visitorId' }, lastAt: { $max: '$at' } } },
      { $sort: { count: -1 } },
      { $limit: 40 },
      { $project: { _id: 0, path: '$_id.path', type: '$_id.type', detail: '$_id.detail', count: 1, visitors: { $size: '$people' }, lastAt: 1 } },
    ]);

    const [sources, cities, devices, pageGroups, exitRows, issueRows, convertedIds] = await Promise.all([
      group('firstSource'), group('city'), group('device'), pages, exits, issues,
      Visitor.distinct('_id', { converted: true, lastSeen: { $gte: since } }),
    ]);
    const conv = new Set(convertedIds);
    const pageRows = pageGroups.map((g) => ({
      path: g._id,
      views: g.views,
      visitors: g.people.length,
      converted: g.people.filter((id) => conv.has(id)).length,
      avgSec: g.avgSec == null ? null : Math.round(g.avgSec),
      avgScroll: g.avgScroll == null ? null : Math.round(g.avgScroll),
    }));
    return res.json({
      totals: totals || { visitors: 0, returning: 0, returningNoForm: 0, converted: 0, pageviews: 0, withIssues: 0, formAbandons: 0 },
      sources, cities, devices, pages: pageRows, exits: exitRows, issues: issueRows,
    });
  } catch (err) {
    console.error('[Visitors] summary failed:', err);
    return res.status(500).json({ message: 'Could not load the visitor summary' });
  }
};

/** GET /api/admin/dev/visitors/:id — the visitor and everything they did, newest first */
exports.detail = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!ID_RX.test(id)) return res.status(404).json({ message: 'Not found' });
    const [visitor, events] = await Promise.all([
      Visitor.findById(id).lean(),
      VisitorEvent.find({ visitorId: id }).sort({ at: -1 }).limit(400).lean(),
    ]);
    if (!visitor) return res.status(404).json({ message: 'Not found' });
    return res.json({ visitor, events });
  } catch (err) {
    console.error('[Visitors] detail failed:', err);
    return res.status(500).json({ message: 'Could not load this visitor' });
  }
};
