// Verifies the /api/search engine (cfSearchController) against the LIVE cf_courses data.
// Boots the real controller with mock req/res so we exercise the exact code the API serves.
//   MONGO_URI=... node scripts/coursefinder/verify_engine.js
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('connected:', mongoose.connection.name);
  const ctrl = require('../../controllers/cfSearchController');

  const run = (fn, req) => new Promise((resolve) => {
    const res = { _code: 200, status(c) { this._code = c; return this; }, json(p) { resolve({ code: this._code, body: p }); } };
    fn(req, res);
  });

  // 1) config
  const cfg = await run(ctrl.getConfig, { query: {} });
  console.log('\n[config] levels:', (cfg.body.programLevels || []).length, '| studyAreas:', (cfg.body.studyAreas || []).length,
    '| requirements:', (cfg.body.requirements || []).length, '| countries:', (cfg.body.countries || []).length, '| highlights:', (cfg.body.highlights || []).length);

  // 2) search — Data Science in the UK, PG level
  const s1 = await run(ctrl.searchCourses, { body: { filters: { searchText: 'data science', country: [4], programLevel: [2] }, page: 1, pageSize: 3 } });
  console.log('\n[search: "data science" / UK / PG]');
  console.log('  total:', s1.body.total, '| totalPages:', s1.body.totalPages, '| universities:', s1.body.universitiesCount);
  console.log('  highlightCounts (sample):', JSON.stringify(Object.fromEntries(Object.entries(s1.body.highlightCounts || {}).slice(0, 6))));
  console.log('  first 3:', (s1.body.data || []).map(c => `${c.courseName} @ ${c.universityName}`).join(' | '));

  // 3) scholarship quick-filter (highlight id 2) over UK
  const s2 = await run(ctrl.searchCourses, { body: { filters: { country: [4], highlights: [2] }, page: 1, pageSize: 1 } });
  console.log('\n[filter: UK + Scholarship Available] total:', s2.body.total);

  // 4) suggest
  const sug = await run(ctrl.suggest, { query: { keyword: 'comput' } });
  console.log('\n[suggest "comput"]:', JSON.stringify((sug.body.data || []).slice(0, 4)));

  // 5) eligibility — India / Grade 12 / 75% out of 100, UK, over scholarship set
  const el = await run(ctrl.evaluateEligibility, {
    body: {
      filters: { country: [4], highlights: [2] },
      profile: { nationalityId: 99, highestQualificationId: 8, gradingSystem: 'OutOf100', score: 75, englishExam: 'later', backlogs: 0, workExperience: 0 },
      bucket: 'eligible', page: 1, pageSize: 2,
    },
  });
  console.log('\n[eligibility: India/Grade12/75 over UK+Scholarship]');
  console.log('  counts:', JSON.stringify(el.body.counts), '| sample eligible:', (el.body.data || []).map(c => c.courseName).slice(0, 2).join(' | '));

  // 6) a course detail
  const first = (s1.body.data || [])[0];
  if (first) {
    const d = await run(ctrl.getCourseDetail, { params: { cfId: first.cfId } });
    console.log('\n[detail cfId', first.cfId + ']', d.body.data ? `${d.body.data.name} — english tests: ${(d.body.data.testRequirements?.english || []).length}` : 'NOT FOUND');
  }

  console.log('\n=== ENGINE VERIFY OK ===');
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error('VERIFY FAILED:', e); process.exit(1); });
