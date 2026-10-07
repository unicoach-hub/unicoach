/**
 * Sync US universities with the official College Scorecard API (US Dept. of Education).
 *
 *   node scripts/dataSync/scorecardUsaSync.js            # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/scorecardUsaSync.js --apply    # write the reviewed changes (asks nothing, so only
 *                                                         # run it after reading the dry-run report)
 *
 * Needs COLLEGE_SCORECARD_API_KEY (free, https://api.data.gov/signup) and MONGO_URI in backend/.env.
 * Reports go to backend/reports/ (git-ignored).
 *
 * What Scorecard gives (official, updated yearly): undergraduate tuition (out-of-state = what international
 * students pay at public universities), admission rate, city/state, website, public/private, and the real list
 * of programs per credential level. It has NO graduate tuition and NO GPA/IELTS requirements.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE = 'https://api.data.gov/ed/collegescorecard/v1/schools';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');

const FIELDS = [
  'id', 'school.name', 'school.alias', 'school.city', 'school.state', 'school.school_url', 'school.ownership',
  'latest.cost.tuition.out_of_state', 'latest.cost.tuition.in_state',
  'latest.admissions.admission_rate.overall', 'latest.student.size',
  'latest.programs.cip_4_digit.title', 'latest.programs.cip_4_digit.credential.level',
].join(',');

// Scorecard credential levels → our degree labels
const LEVELS = { 3: 'Bachelors', 5: 'Masters', 6: 'PhD' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Graduate (Master's) tuition + fees, out-of-state, from IPEDS via the Urban Institute Education Data API
// (no key). Keyed by IPEDS unitid, which is the same as the Scorecard id.
const IPEDS_YEAR = 2023;
async function fetchGraduateTuition() {
  let url = `https://educationdata.urban.org/api/v1/college-university/ipeds/academic-year-tuition/${IPEDS_YEAR}/?level_of_study=2&tuition_type=4`;
  const map = new Map();
  while (url) {
    let json;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const res = await fetch(url, { headers: { 'User-Agent': 'UniCoach-DataSync/1.0 (+https://www.unicoach.com)', Accept: 'application/json' } });
      if (res.ok) { json = await res.json(); break; }
      if (attempt === 3) throw new Error(`IPEDS HTTP ${res.status}`);
      await sleep(3000);
    }
    for (const r of json.results) if (r.tuition_fees_ft > 0) map.set(r.unitid, r.tuition_fees_ft);
    url = json.next;
  }
  return map;
}

async function fetchAllSchools() {
  const all = [];
  for (let page = 0; ; page += 1) {
    const url = `${BASE}?api_key=${API_KEY}&school.operating=1&school.degrees_awarded.highest__range=3..4&per_page=100&page=${page}&fields=${FIELDS}`;
    let json;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const res = await fetch(url);
      if (res.ok) { json = await res.json(); break; }
      if (attempt === 3) throw new Error(`Scorecard HTTP ${res.status} on page ${page}`);
      await sleep(2000 * attempt);
    }
    all.push(...json.results);
    const total = json.metadata.total;
    process.stdout.write(`\r  fetched ${all.length}/${total}`);
    if (all.length >= total || json.results.length === 0) break;
    await sleep(300);
  }
  process.stdout.write('\n');
  return all;
}

const normName = (s) => String(s || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/\bsaint\b/g, 'st')
  .replace(/[-–—]\s*main campus\b/g, '')
  .replace(/\bthe\b/g, ' ')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// "https://www.cs.mit.edu/path" → "mit.edu" (registrable part is enough for .edu and most US sites)
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return '';
  return parts.slice(-2).join('.');
};

const cleanTitle = (t) => String(t || '').replace(/\.\s*$/, '').trim();
const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

function proposeChanges(db, sc, graduateTuition) {
  const changes = {};
  const tuition = sc['latest.cost.tuition.out_of_state'] ?? sc['latest.cost.tuition.in_state'];
  if (typeof tuition === 'number' && tuition > 0) changes.tuitionFeeUSD = tuition;
  if (typeof graduateTuition === 'number' && graduateTuition > 0) changes.graduateTuitionUSD = graduateTuition;
  const parts = [];
  if (changes.graduateTuitionUSD) parts.push(`Master's ${money(changes.graduateTuitionUSD)}`);
  if (changes.tuitionFeeUSD) parts.push(`Bachelor's ${money(changes.tuitionFeeUSD)}`);
  if (parts.length) changes.tuition = `${parts.join(' · ')} per year (official US data)`;
  const rate = sc['latest.admissions.admission_rate.overall'];
  if (typeof rate === 'number') changes.acceptanceRate = Math.round(rate * 1000) / 10;
  const ownership = sc['school.ownership'];
  if (ownership) changes.type = ownership === 1 ? 'PUBLIC' : 'PRIVATE';
  if (sc['school.city']) changes.city = sc['school.city'];
  if (sc['school.school_url']) changes.website = `https://${String(sc['school.school_url']).replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;

  const programs = sc['latest.programs.cip_4_digit'] || [];
  const levels = new Set();
  const titles = new Set();
  for (const p of programs) {
    const label = LEVELS[p?.credential?.level];
    if (!label) continue;
    levels.add(label);
    if (p.title) titles.add(cleanTitle(p.title));
  }
  if (titles.size) changes.courses = [...titles].sort();
  if (levels.size) changes.degreeLevels = ['Bachelors', 'Masters', 'PhD'].filter((l) => levels.has(l));

  changes.dataSource = { provider: 'College Scorecard', scorecardId: sc.id, state: sc['school.state'], syncedAt: new Date() };

  // Only keep fields that actually differ
  const diff = {};
  for (const [k, v] of Object.entries(changes)) {
    if (k === 'dataSource') { diff[k] = v; continue; }
    if (JSON.stringify(db[k]) !== JSON.stringify(v)) diff[k] = { from: db[k], to: v };
  }
  return diff;
}

// Undo an applied sync: node scripts/dataSync/scorecardUsaSync.js --revert reports/scorecard-usa-<stamp>.json
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  for (const c of report.changes) {
    const set = {};
    const unset = { dataSource: '' };
    for (const [k, v] of Object.entries(c.diff)) {
      if (k === 'dataSource') continue;
      if (v.from === undefined) unset[k] = '';
      else set[k] = v.from;
    }
    const update = { $unset: unset };
    if (Object.keys(set).length) update.$set = set;
    await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, update);
    restored += 1;
  }
  console.log(`REVERTED: ${restored} universities restored from ${reportFile}`);
  await mongoose.disconnect();
}

(async () => {
  const revertIdx = process.argv.indexOf('--revert');
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);
  if (!API_KEY) throw new Error('COLLEGE_SCORECARD_API_KEY is missing in backend/.env');
  console.log(`College Scorecard → US universities (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);

  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const usa = await db.collection('countries').findOne({ name: 'USA' });
  if (!usa) throw new Error('Country "USA" not found');
  const ours = await db.collection('universities').find({ country: usa._id })
    .project({ name: 1, city: 1, website: 1, tuitionFeeUSD: 1, graduateTuitionUSD: 1, tuition: 1, acceptanceRate: 1, type: 1, courses: 1, degreeLevels: 1 })
    .toArray();
  console.log(`  our USA records: ${ours.length}`);

  const schools = await fetchAllSchools();
  const gradTuition = await fetchGraduateTuition();
  console.log(`  graduate tuition (IPEDS ${IPEDS_YEAR}): ${gradTuition.size} institutions`);

  const byDomain = new Map();
  const byName = new Map();
  for (const s of schools) {
    const d = regDomain(s['school.school_url']);
    if (d) byDomain.set(d, [...(byDomain.get(d) || []), s]);
    for (const n of [s['school.name'], ...String(s['school.alias'] || '').split(',')]) {
      const k = normName(n);
      if (k) byName.set(k, [...(byName.get(k) || []), s]);
    }
  }

  // Several schools can share a name ("Bethel University" exists in MN, TN, IN) or a domain (university
  // systems). Then city or website must decide; if nothing decides, skip rather than guess.
  const pick = (candidates, uni) => {
    if (!candidates || candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    const city = (uni.city || '').toLowerCase();
    const byCity = candidates.filter((c) => (c['school.city'] || '').toLowerCase() === city);
    if (byCity.length === 1) return byCity[0];
    const domain = regDomain(uni.website);
    const byDomain = domain ? candidates.filter((c) => regDomain(c['school.school_url']) === domain) : [];
    if (byDomain.length === 1) return byDomain[0];
    const n = normName(uni.name);
    const byExactName = (byDomain.length ? byDomain : candidates).filter((c) => normName(c['school.name']) === n);
    return byExactName.length === 1 ? byExactName[0] : null;
  };

  const matched = [];
  const unmatched = [];
  const usedScorecardIds = new Set();
  for (const uni of ours) {
    let sc = null;
    let how = '';
    const nameHit = pick(byName.get(normName(uni.name)), uni);
    const domainHit = pick(byDomain.get(regDomain(uni.website)), uni);
    if (nameHit && domainHit && nameHit.id === domainHit.id) { sc = nameHit; how = 'name+domain'; }
    else if (nameHit) { sc = nameHit; how = 'name'; }
    else if (domainHit) { sc = domainHit; how = 'domain'; }
    if (!sc || usedScorecardIds.has(sc.id)) { unmatched.push(uni); continue; }
    usedScorecardIds.add(sc.id);
    matched.push({ uni, sc, how, diff: proposeChanges(uni, sc, gradTuition.get(sc.id)) });
  }
  const notInDb = schools.filter((s) => !usedScorecardIds.has(s.id));

  // ---- Report ----
  const count = (field) => matched.filter((m) => m.diff[field]).length;
  const tuitionDiffs = matched.filter((m) => m.diff.tuitionFeeUSD && typeof m.diff.tuitionFeeUSD.from === 'number')
    .map((m) => Math.abs(m.diff.tuitionFeeUSD.to - m.diff.tuitionFeeUSD.from) / Math.max(1, m.diff.tuitionFeeUSD.to));
  tuitionDiffs.sort((a, b) => a - b);
  const median = tuitionDiffs.length ? tuitionDiffs[Math.floor(tuitionDiffs.length / 2)] : 0;
  const centralCityFixed = matched.filter((m) => m.uni.city === 'Central City' && m.diff.city).length;

  const summary = {
    ourUsaRecords: ours.length,
    scorecardSchools: schools.length,
    matched: matched.length,
    matchedBy: matched.reduce((acc, m) => ({ ...acc, [m.how]: (acc[m.how] || 0) + 1 }), {}),
    unmatchedInOurDb: unmatched.length,
    scorecardSchoolsMissingFromOurDb: notInDb.length,
    changes: {
      tuition: count('tuitionFeeUSD'),
      graduateTuitionAdded: count('graduateTuitionUSD'),
      tuitionWrongByMoreThan20pct: tuitionDiffs.filter((d) => d > 0.2).length,
      tuitionMedianError: `${Math.round(median * 100)}%`,
      acceptanceRate: count('acceptanceRate'),
      type: count('type'),
      city: count('city'),
      centralCityFixed,
      website: count('website'),
      courses: count('courses'),
      degreeLevels: count('degreeLevels'),
    },
  };

  const famous = ['Massachusetts Institute of Technology', 'Stanford University', 'Harvard University', 'New York University',
    'University of California-Berkeley', 'Northeastern University', 'Arizona State University Campus Immersion', 'University of Southern California'];
  const samples = matched.filter((m) => famous.includes(m.sc['school.name'])).slice(0, 8).map((m) => ({
    ours: m.uni.name, scorecard: m.sc['school.name'], matchedBy: m.how,
    tuition: m.diff.tuitionFeeUSD ? `${m.diff.tuitionFeeUSD.from} → ${m.diff.tuitionFeeUSD.to}` : 'same',
    masters: m.diff.graduateTuitionUSD ? m.diff.graduateTuitionUSD.to : 'n/a',
    acceptance: m.diff.acceptanceRate ? `${m.diff.acceptanceRate.from} → ${m.diff.acceptanceRate.to}` : 'same',
    city: m.diff.city ? `${m.diff.city.from} → ${m.diff.city.to}` : 'same',
    courses: m.diff.courses ? `${(m.diff.courses.from || []).length} template → ${m.diff.courses.to.length} official` : 'same',
  }));

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const reportPath = path.join(REPORT_DIR, `scorecard-usa-${stamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    summary, samples,
    unmatchedSample: unmatched.slice(0, 60).map((u) => ({ name: u.name, city: u.city, website: u.website })),
    missingFromOurDbSample: notInDb.slice(0, 60).map((s) => ({ name: s['school.name'], city: s['school.city'], state: s['school.state'] })),
    changes: matched.map((m) => ({ id: String(m.uni._id), name: m.uni.name, scorecard: m.sc['school.name'], matchedBy: m.how, diff: m.diff })),
  }, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  console.log('samples:', JSON.stringify(samples, null, 2));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    let written = 0;
    for (const m of matched) {
      const set = {};
      for (const [k, v] of Object.entries(m.diff)) set[k] = k === 'dataSource' ? v : v.to;
      if (Object.keys(set).length <= 1) continue; // only dataSource
      await db.collection('universities').updateOne({ _id: m.uni._id }, { $set: set });
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
