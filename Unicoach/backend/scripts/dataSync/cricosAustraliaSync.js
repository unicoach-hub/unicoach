/**
 * Sync Australian universities with CRICOS (Australian Government register of every course offered to
 * international students, updated monthly on data.gov.au). No API key needed.
 *
 *   node scripts/dataSync/cricosAustraliaSync.js                 # DRY RUN: download + match + report
 *   node scripts/dataSync/cricosAustraliaSync.js --apply         # write the changes from this run
 *   node scripts/dataSync/cricosAustraliaSync.js --revert <report.json>
 *
 * Gives per university: real course list (Bachelor / Masters / Doctoral), and the median yearly tuition for
 * Bachelor and Master's (coursework) courses, converted AUD → USD at today's ECB rate (frankfurter.app).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const DATASET = 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource';
const COURSES_CSV = `${DATASET}/48cacf69-2082-415e-9595-f17d0c3a4af0/download/cricos-courses.csv`;
const INSTITUTIONS_CSV = `${DATASET}/7f6941f3-5327-4db7-b556-5f16d77f63c1/download/cricos-institutions.csv`;
const UA = { 'User-Agent': 'UniCoach-DataSync/1.0 (+https://www.unicoach.com)' };

// RFC 4180 CSV → array of objects keyed by header
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.length > 1 || row[0]) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map((h) => h.replace(/^﻿/, '').trim());
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
}

async function download(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

const LEVEL = (courseLevel) => {
  if (/^Bachelor/i.test(courseLevel)) return 'Bachelors';
  if (/^Masters/i.test(courseLevel)) return 'Masters';
  if (/^Doctoral/i.test(courseLevel)) return 'PhD';
  return null;
};

const normName = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ')
  .replace(/\bthe\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  // unimelb.edu.au → unimelb.edu.au (3 labels for .edu.au / .com.au)
  return parts.length >= 3 && /^(edu|com|org|gov)$/.test(parts[parts.length - 2]) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
};
const money = (n, sym = '$') => `${sym}${Math.round(n).toLocaleString('en-US')}`;
const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const parseMoney = (v) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function audToUsd() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=AUD&to=USD', { headers: UA });
    const j = await res.json();
    if (j?.rates?.USD) return { rate: j.rates.USD, date: j.date };
  } catch (_) {}
  return { rate: 0.65, date: 'fallback' };
}

async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  for (const c of report.changes) {
    const set = {};
    const unset = { dataSource: '' };
    for (const [k, v] of Object.entries(c.diff)) {
      if (k === 'dataSource') continue;
      if (v.from === undefined) unset[k] = ''; else set[k] = v.from;
    }
    await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $unset: unset, ...(Object.keys(set).length ? { $set: set } : {}) });
  }
  console.log(`REVERTED ${report.changes.length} universities from ${reportFile}`);
  await mongoose.disconnect();
}

(async () => {
  const revertIdx = process.argv.indexOf('--revert');
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);

  console.log(`CRICOS → Australian universities (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const [coursesCsv, institutionsCsv, fx] = await Promise.all([download(COURSES_CSV), download(INSTITUTIONS_CSV), audToUsd()]);
  const courses = parseCsv(coursesCsv).filter((c) => (c.Expired || '').toLowerCase() !== 'yes');
  const institutions = parseCsv(institutionsCsv);
  console.log(`  CRICOS: ${institutions.length} providers, ${courses.length} active courses; AUD→USD ${fx.rate} (${fx.date})`);

  const coursesByProvider = new Map();
  for (const c of courses) {
    const code = c['CRICOS Provider Code'];
    if (!coursesByProvider.has(code)) coursesByProvider.set(code, []);
    coursesByProvider.get(code).push(c);
  }

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const au = await db.collection('countries').findOne({ name: 'Australia' });
  const ours = await db.collection('universities').find({ country: au._id })
    .project({ name: 1, city: 1, website: 1, tuitionFeeUSD: 1, graduateTuitionUSD: 1, tuition: 1, courses: 1, degreeLevels: 1 }).toArray();

  // Candidate providers: universities (by name) with degree-level courses
  const unis = institutions.filter((i) => /universit/i.test(`${i['Institution Name']} ${i['Trading Name']}`));
  const findProvider = (uni) => {
    const n = normName(uni.name);
    const d = regDomain(uni.website);
    const hits = unis.filter((i) => normName(i['Institution Name']) === n || normName(i['Trading Name']) === n
      || (d && regDomain(i.Website) === d));
    // A university can have several CRICOS providers (e.g. a college arm); prefer the one with most degree courses
    return hits.sort((a, b) => (coursesByProvider.get(b['CRICOS Provider Code']) || []).length
      - (coursesByProvider.get(a['CRICOS Provider Code']) || []).length)[0] || null;
  };

  const changes = [];
  const unmatched = [];
  const usedProviders = new Set();
  for (const uni of ours) {
    const provider = findProvider(uni);
    if (!provider) { unmatched.push(uni.name); continue; }
    const code = provider['CRICOS Provider Code'];
    usedProviders.add(code);
    const list = (coursesByProvider.get(code) || []).map((c) => ({ ...c, level: LEVEL(c['Course Level']) })).filter((c) => c.level);

    const yearly = (c) => {
      const fee = parseMoney(c['Tuition Fee']);
      const weeks = Number(c['Duration (Weeks)']) || 0;
      if (!fee || weeks < 20) return null;
      return fee / Math.max(1, weeks / 52);
    };
    const bachelorAud = median(list.filter((c) => c.level === 'Bachelors').map(yearly).filter(Boolean));
    const mastersAud = median(list.filter((c) => c.level === 'Masters' && /coursework|extended/i.test(c['Course Level'])).map(yearly).filter(Boolean));

    const proposed = {};
    if (list.length) {
      proposed.courses = [...new Set(list.map((c) => c['Course Name']))].sort().slice(0, 400);
      proposed.degreeLevels = ['Bachelors', 'Masters', 'PhD'].filter((l) => list.some((c) => c.level === l));
    }
    if (bachelorAud) proposed.tuitionFeeUSD = Math.round(bachelorAud * fx.rate);
    if (mastersAud) proposed.graduateTuitionUSD = Math.round(mastersAud * fx.rate);
    const parts = [];
    if (mastersAud) parts.push(`Master's ${money(mastersAud, 'A$')} (≈ ${money(mastersAud * fx.rate)})`);
    if (bachelorAud) parts.push(`Bachelor's ${money(bachelorAud, 'A$')} (≈ ${money(bachelorAud * fx.rate)})`);
    if (parts.length) proposed.tuition = `${parts.join(' · ')} per year, approx. (median of official CRICOS course fees)`;

    const diff = {};
    for (const [k, v] of Object.entries(proposed)) {
      if (JSON.stringify(uni[k]) !== JSON.stringify(v)) diff[k] = { from: uni[k], to: v };
    }
    diff.dataSource = { provider: 'CRICOS', providerCode: code, audUsd: fx.rate, fxDate: fx.date, syncedAt: new Date() };
    changes.push({
      id: String(uni._id), name: uni.name, cricos: provider['Institution Name'], providerCode: code,
      degreeCourses: list.length, diff,
    });
  }

  const missing = unis.filter((i) => !usedProviders.has(i['CRICOS Provider Code'])
    && (coursesByProvider.get(i['CRICOS Provider Code']) || []).some((c) => LEVEL(c['Course Level'])))
    .map((i) => i['Institution Name']);

  const summary = {
    ourAustraliaRecords: ours.length,
    matched: changes.length,
    unmatched,
    coursesReplaced: changes.filter((c) => c.diff.courses).length,
    bachelorTuition: changes.filter((c) => c.diff.tuitionFeeUSD).length,
    mastersTuition: changes.filter((c) => c.diff.graduateTuitionUSD).length,
    cricosUniversitiesNotInOurDb: missing.length,
  };
  const samples = changes.slice(0, 10).map((c) => ({
    ours: c.name, cricos: c.cricos, degreeCourses: c.degreeCourses,
    tuition: c.diff.tuition ? c.diff.tuition.to : 'same',
    courses: c.diff.courses ? `${(c.diff.courses.from || []).length} → ${c.diff.courses.to.length}` : 'same',
  }));

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `cricos-australia-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ summary, samples, missingFromOurDb: missing, changes }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('samples:', JSON.stringify(samples, null, 2));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    let written = 0;
    for (const c of changes) {
      const set = {};
      for (const [k, v] of Object.entries(c.diff)) set[k] = k === 'dataSource' ? v : v.to;
      await db.collection('universities').updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set });
      written += 1;
    }
    console.log(`APPLIED: ${written} universities updated`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
