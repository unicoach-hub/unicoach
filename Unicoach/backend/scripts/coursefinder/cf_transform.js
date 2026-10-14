// Transform harvested CourseFinder raw payloads -> UniCoach-ready docs.
// Memory-safe: processes one country file at a time, streams courses to NDJSON.
// Keeps the FULL CourseFinder payload under course.cf for exact 1:1 engine fidelity,
// plus maps UniCoach-native Course fields so existing features keep working.
// Usage: node --max-old-space-size=4096 scripts/cf_transform.js
const fs = require('fs');
const path = require('path');

const ROOT = process.env.CF_DATA_DIR || path.resolve(__dirname, '.cfdata');
const RAW = path.join(ROOT, 'raw');
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const NET = path.resolve(__dirname, '..', '..', 'data', 'coursefinder');
const filtersData = JSON.parse(fs.readFileSync(path.join(NET, 'filters-data.json'), 'utf8')).data;
const COUNTRY = Object.fromEntries((filtersData.country || []).map(c => [c.value, { name: c.label, currency: c.currencyCode }]));
const highlights = JSON.parse(fs.readFileSync(path.join(NET, 'highlights.json'), 'utf8')).data;

const num = v => { if (v === null || v === undefined || v === '') return undefined; const n = Number(String(v).replace(/[, ]/g,'')); return Number.isFinite(n) ? n : undefined; };
const firstConcentration = s => (s ? String(s).split(/;|,/)[0].trim() : undefined);
// ALL subject/study-area tags (deduped), so broad free-text search matches CourseFinder.
const allConcentrations = s => {
  if (!s) return undefined;
  const parts = String(s).split(/[;,/]|\band\b|\&/i).map(x => x.trim()).filter(x => x.length > 1);
  const seen = new Set(); const out = [];
  for (const p of parts) { const k = p.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(p); } }
  return out.length ? out : undefined;
};

function degreeLevel(studylvl, id) {
  const s = (studylvl || '').toLowerCase();
  if (s.includes('phd') || s.includes('doctor')) return 'PhD';
  if (s.includes('diploma') || s.includes('certificate') || s.includes('associate')) return 'Diploma';
  if (s.includes('pg') || s.includes('master') || s.includes('postgrad')) return "Master's";
  if (s.includes('ug') || s.includes('bachelor') || s.includes('undergrad')) return "Bachelor's";
  return 'Other';
}

function mapCourse(c) {
  const cur = c.CurrencyCode || c.TuitionFeeCurrency || (COUNTRY[c.CountryId]||{}).currency;
  const doc = {
    // --- UniCoach-native (keeps existing features working) ---
    courseName: c.Name,
    courseCode: c.Id ? String(c.Id) : undefined,
    universityName: c.universityName,
    countryName: c.universityCountry || (COUNTRY[c.CountryId]||{}).name,
    city: c.universityCity || undefined,
    degreeLevel: degreeLevel(c.Studylvl, c.StudyLevelId),
    discipline: firstConcentration(c.Concentration),
    disciplines: allConcentrations(c.Concentration),
    duration: c.Duration ? `${c.Duration} Months` : undefined,
    annualFee: { amount: num(c.Amount) || num(c.TutionFee) || 0, currency: cur, inrAmount: 0 },
    applicationFee: { amount: num(c.ApplicationFeeAmt) || 0, currency: c.ApplicationFeeCurrency || cur, isWaived: !!c.AppFeeWaiverAvailable },
    initialDeposit: { amount: num(c.DepositSortAmount) || 0, currency: c.DepositCurrency || cur },
    minIeltsScore: num(c.IeltsOverall),
    minToeflScore: num(c.ToeflScore),
    minPteScore: num(c.PteScore),
    minGpaPercent: num(c.EntryRequirementUgOutOf100) || num(c.EntryRequirementTwelfthOutOf100),
    academicRequirement: c.EntryRequirement || undefined,
    greRequired: !!c.GreRequired,
    workExpRequirement: c.WorkExp && num(c.WorkExp) ? `${c.WorkExp} years` : undefined,
    intakes: Array.isArray(c.DisplayIntakes) ? c.DisplayIntakes : [],
    applicationDeadline: c.ApplicationDeadline || undefined,
    scholarships: c.ScholarshipAvailable ? [{ name: 'Scholarship', discount: c.AverageScholarship || undefined, criteria: c.ScholarshipDeatil || undefined }] : [],
    isStem: !!c.IsStemCourse,
    hasInternship: !!c.InternshipAvailable,
    sourceUrl: `cf://course/${c.Id}`,   // synthetic unique key (list API has no per-course URL)
    syncStatus: 'ACTIVE',
    source: 'coursefinder',

    // --- CourseFinder-native refs for joins ---
    cfId: c.Id,
    cfUniversityId: c.UniversityId,
    cfCountryId: c.CountryId,
    cfStudyLevelId: c.StudyLevelId,
    highlightIds: c.Highlights ? String(c.Highlights).split(',').map(x=>parseInt(x,10)).filter(Boolean) : [],
    eligibleCountryIds: Array.isArray(c.EligibleCountryIds) ? c.EligibleCountryIds : [],
    eligibleStateIds: Array.isArray(c.EligibleStateIds) ? c.EligibleStateIds : [],

    // --- full CourseFinder payload for EXACT 1:1 engine behaviour ---
    cf: c
  };
  return doc;
}

(async () => {
  const files = fs.readdirSync(RAW).filter(f => /^country-\d+\.json$/.test(f));
  const coursesOut = fs.createWriteStream(path.join(OUT, 'courses.ndjson'));
  const unis = new Map();           // cfUniversityId -> uni doc
  const seen = new Set();           // cfId dedupe
  let total = 0, written = 0, dupes = 0;

  for (const f of files) {
    const code = parseInt(f.match(/\d+/)[0], 10);
    let payload;
    try { payload = JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8')); }
    catch (e) { console.error('skip', f, e.message); continue; }
    const data = payload.data || [];
    for (const c of data) {
      total++;
      if (seen.has(c.Id)) { dupes++; continue; }
      seen.add(c.Id);
      coursesOut.write(JSON.stringify(mapCourse(c)) + '\n');
      written++;
      if (!unis.has(c.UniversityId)) {
        unis.set(c.UniversityId, {
          cfUniversityId: c.UniversityId,
          name: c.universityName,
          cfCountryId: c.CountryId,
          countryName: c.universityCountry || (COUNTRY[c.CountryId]||{}).name,
          city: c.universityCity || undefined,
          state: c.universityState || undefined,
          logo: c['logo-url'] ? `cf://university-logo/${c.UniversityId}${c.universityLogoExtension||''}` : undefined,
          rankings: {
            usNews: num(c.USNewsRanking), qs: num(c.QSRanking),
            webometricsNational: num(c.WebomatricsNationalRanking), webometricsWorld: num(c.WebomatricsWorldRanking)
          },
          averageScholarship: c.universityAverageScholarship || undefined,
          source: 'coursefinder'
        });
      }
    }
    console.log(`country ${code}: +${data.length} rows (written ${written}, dupes ${dupes})`);
  }
  await new Promise(r => coursesOut.end(r));
  fs.writeFileSync(path.join(OUT, 'universities.json'), JSON.stringify([...unis.values()]));
  fs.writeFileSync(path.join(OUT, 'countries.json'), JSON.stringify(Object.entries(COUNTRY).map(([id,v]) => ({ cfId: Number(id), name: v.name, currency: v.currency }))));
  fs.writeFileSync(path.join(OUT, 'highlights.json'), JSON.stringify(highlights));
  fs.writeFileSync(path.join(OUT, 'transform-summary.json'), JSON.stringify({ rawRows: total, uniqueCourses: written, dupes, universities: unis.size }, null, 2));
  console.log(`\nDONE: ${written} unique courses, ${unis.size} universities (from ${total} raw rows, ${dupes} dupes)`);
})();
