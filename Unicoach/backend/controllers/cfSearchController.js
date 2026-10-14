// CourseFinder engine — 1:1 search, faceting, highlights, detail & eligibility.
// Reads the accurate CourseFinder catalogue from cf_courses / cf_universities.
// Semantics mirror app.coursefinder.ai: base query + highlight/advanced facets +
// student-profile eligibility segmentation. Paging/facets are server-side (so no
// multi-MB payloads) while results match CourseFinder exactly.
const fs = require('fs');
const path = require('path');
const CfCourse = require('../models/CfCourse');
const CfUniversity = require('../models/CfUniversity');

const DATA = path.join(__dirname, '..', 'data', 'coursefinder');
const readJson = f => { try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); } catch { return null; } };
const HIGHLIGHTS = (readJson('highlights.json') || { data: [] }).data || readJson('highlights.json') || [];
const FILTERS = (readJson('filters-data.json') || {}).data || {};
const CONFIG = (readJson('search-config.json') || {}).data || {};

// ---- taxonomy constants (CourseFinder program-level IDs) ----
const UG_LEVELS = [8, 4, 1, 11, 20, 22, 12, 19, 102, 103, 10, 9]; // study levels a 12th-grade student can enter
const PG_LEVELS = [5, 2, 21, 13, 3];                               // study levels for graduates
const QUALIFICATION_LEVELS = {
  '8': UG_LEVELS,   // Grade 12 / equivalent
  '13': UG_LEVELS,  // SSE
  '1': PG_LEVELS,   // Undergraduate -> PG
  '2': PG_LEVELS,   // Postgraduate -> PG
};
// requirement-id -> mongo predicate (CourseFinder "Requirements" filter)
const REQUIREMENT_PREDICATE = {
  5:  { 'cf.IeltsRequired': true }, 7: { 'cf.ToeflRequired': true }, 8: { 'cf.PteRequired': true },
  29: { 'cf.DETRequired': true }, 1: { 'cf.SatRequired': true }, 2: { 'cf.ActRequired': true },
  3:  { 'cf.GreRequired': true }, 4: { 'cf.GmatRequired': true },
  32: { 'cf.WithoutEnglishProficiency': true }, 23: { greRequired: { $ne: true } },
  24: { 'cf.GmatRequired': { $ne: true } }, 31: { 'cf.WithoutMaths': true },
  100: { isStem: true }, 101: { 'applicationFee.isWaived': true },
  102: { 'cf.ScholarshipAvailable': true }, 103: { 'cf.FifteenYearsEducation': true },
  104: { 'cf.DisplayIntakes.0': { $exists: true } }, // Open Programs (has open intake)
};
const DURATION_BUCKET = { 1: [0, 12], 2: [12, 24], 3: [24, 36], 4: [36, 48], 5: [48, 100000] };

// CourseFinder "study-area" taxonomy (CategoryId 1..22). Typing a discipline surfaces its
// whole study area (near-100% course coverage), the way CourseFinder's broad search does.
const STUDY_AREA_TRIGGERS = [
  { id: 1,  terms: ['agriculture', 'forestry', 'fishery', 'farming', 'horticulture'] },
  { id: 2,  terms: ['architecture', 'building', 'construction', 'surveying', 'urban planning'] },
  { id: 3,  terms: ['arts', 'fine arts', 'design', 'music', 'fashion', 'film', 'photography', 'performing arts', 'graphic design', 'interior design', 'animation'] },
  { id: 4,  terms: ['business', 'commerce', 'management', 'administration', 'mba', 'bba', 'finance', 'accounting', 'accountancy', 'marketing', 'economics', 'supply chain', 'human resource', 'entrepreneurship'] },
  { id: 5,  terms: ['computer science', 'computing', 'information technology', 'software', 'data science', 'artificial intelligence', 'machine learning', 'cyber security', 'cybersecurity', 'information systems', 'data analytics'] },
  { id: 6,  terms: ['education', 'teaching', 'pedagogy', 'early childhood'] },
  { id: 7,  terms: ['engineering', 'mechanical', 'electrical', 'civil engineering', 'mechatronics', 'robotics', 'aerospace'] },
  { id: 8,  terms: ['environmental', 'environment', 'sustainability', 'ecology', 'climate'] },
  { id: 9,  terms: ['health', 'nursing', 'medicine', 'medical', 'pharmacy', 'dentistry', 'physiotherapy', 'public health', 'healthcare', 'midwifery', 'nutrition', 'radiography', 'optometry'] },
  { id: 10, terms: ['humanities', 'history', 'philosophy', 'languages', 'literature', 'linguistics', 'theology', 'religious studies'] },
  { id: 11, terms: ['journalism', 'media', 'communication', 'communications', 'public relations', 'broadcasting'] },
  { id: 12, terms: ['law', 'legal', 'llb', 'llm', 'laws'] },
  { id: 13, terms: ['life sciences', 'biology', 'biotechnology', 'biomedical', 'biochemistry', 'microbiology', 'genetics', 'zoology', 'botany'] },
  { id: 14, terms: ['manufacturing', 'processing', 'textiles'] },
  { id: 15, terms: ['mathematics', 'maths', 'statistics', 'actuarial'] },
  { id: 16, terms: ['hospitality', 'tourism', 'culinary', 'beauty', 'event management'] },
  { id: 17, terms: ['physics', 'chemistry', 'physical sciences', 'geology', 'astronomy', 'materials science'] },
  { id: 18, terms: ['security', 'policing', 'criminology', 'criminal justice', 'forensic'] },
  { id: 19, terms: ['psychology', 'sociology', 'social science', 'anthropology', 'political science', 'politics', 'international relations', 'behavioural science'] },
  { id: 20, terms: ['social work', 'social services', 'social care', 'counselling'] },
  { id: 21, terms: ['transport', 'logistics', 'aviation', 'maritime', 'shipping'] },
  { id: 22, terms: ['veterinary', 'animal science'] },
];
function matchedStudyAreas(text) {
  const t = ' ' + String(text).toLowerCase().trim() + ' ';
  const ids = [];
  for (const { id, terms } of STUDY_AREA_TRIGGERS)
    if (terms.some(term => t.includes(' ' + term + ' '))) ids.push(id);
  return ids;
}

// ---------- build the base match from a filters object ----------
function buildMatch(f = {}) {
  const m = {};
  const arr = v => (Array.isArray(v) ? v : v != null && v !== '' ? [v] : []);
  if (f.searchText) {
    const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const raw = String(f.searchText).trim().slice(0, 80);
    // Degree-acronym expansion to mirror CourseFinder (e.g. "MBA" also matches "Master of Business Administration").
    const SYN = { MBA: 'Master of Business Administration', LLM: 'Master of Laws', LLB: 'Bachelor of Laws',
      BBA: 'Bachelor of Business Administration', MIM: 'Master in Management', MPH: 'Master of Public Health',
      MPA: 'Master of Public Administration', MSW: 'Master of Social Work', MFA: 'Master of Fine Arts' };
    const alts = [raw];
    const syn = SYN[raw.toUpperCase()];
    if (syn) alts.push(syn);
    const rx = new RegExp('(' + alts.map(esc).join('|') + ')', 'i');
    // match name, university, first discipline, and the FULL subject-tag array (CourseFinder parity on broad terms)
    const orClauses = [{ courseName: rx }, { universityName: rx }, { discipline: rx }, { disciplines: rx }];
    // if the term maps to a CourseFinder study area, also surface that whole area (near-100% coverage)
    const saIds = matchedStudyAreas(raw);
    if (saIds.length) orClauses.push({ studyAreaIds: { $in: saIds } });
    (m.$and = m.$and || []).push({ $or: orClauses });
  }
  const country = arr(f.country).map(Number).filter(Boolean);
  if (country.length) m.cfCountryId = { $in: country };
  const levels = arr(f.programLevel).map(Number).filter(n => !Number.isNaN(n));
  if (levels.length) m.cfStudyLevelId = { $in: levels };
  const intake = arr(f.intake).filter(Boolean);
  if (intake.length) m['cf.DisplayIntakes'] = { $in: intake };
  const hl = arr(f.highlights).map(Number).filter(Boolean);
  if (hl.length) m.highlightIds = { $all: hl };
  if (f.eslElpAvailable === 'yes') m.$or = [{ 'cf.EslAvailable': true }, { 'cf.ElpAvailable': true }];
  const reqs = arr(f.requirements).map(Number);
  for (const r of reqs) if (REQUIREMENT_PREDICATE[r]) Object.assign(m, REQUIREMENT_PREDICATE[r]);
  const dur = arr(f.duration).map(Number).filter(Boolean);
  if (dur.length) {
    m.$and = m.$and || [];
    m.$and.push({ $or: dur.map(d => ({ 'cf.Duration': { $gte: DURATION_BUCKET[d][0], $lt: DURATION_BUCKET[d][1] } })) });
  }
  // explicit Study Area filter — accepts taxonomy ids (1..22) and/or free text
  const saFilter = arr(f.studyArea).concat(arr(f.disciplineArea));
  if (saFilter.length) {
    const ids = saFilter.map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 22);
    const texts = saFilter.filter(x => !(Number.isInteger(Number(x)) && Number(x) >= 1 && Number(x) <= 22));
    const or = [];
    if (ids.length) or.push({ studyAreaIds: { $in: ids } });
    for (const t of texts) { const drx = new RegExp(String(t).slice(0, 60), 'i'); or.push({ discipline: drx }, { disciplines: drx }); for (const id of matchedStudyAreas(t)) or.push({ studyAreaIds: id }); }
    if (or.length) (m.$and = m.$and || []).push({ $or: or });
  }
  return m;
}

// ---------- SORT ----------
function buildSort(sortBy) {
  switch (sortBy) {
    case 'tuition-low': return { 'annualFee.amount': 1 };
    case 'tuition-high': return { 'annualFee.amount': -1 };
    case 'ranking': return { 'cf.QSRanking': 1, 'cf.UniversityOrder': 1 };
    default: return { 'cf.UniversityOrder': 1, cfId: 1 }; // Featured
  }
}

// ========== ENDPOINTS ==========

// GET /api/search/config
exports.getConfig = (req, res) => res.json({
  config: CONFIG,
  programLevels: FILTERS['program-level'] || [],
  studyAreas: FILTERS['study-area'] || [],
  requirements: FILTERS['requirements'] || [],
  durations: FILTERS['duration'] || [],
  intakes: FILTERS['intake'] || [],
  years: FILTERS['year'] || [],
  countries: FILTERS['country'] || [],
  studentCountries: FILTERS['student-country'] || [],
  highlights: HIGHLIGHTS,
});

// GET /api/search/highlights  (optionally with live counts for current filters, body via query)
exports.getHighlights = async (req, res) => {
  try {
    res.json({ data: HIGHLIGHTS });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// map a cf_course -> the program shape expected by the frontend Excel exporter
function toExportProgram(c) {
  const cf = c.cf || {};
  const money = (m) => (m && m.amount ? `${m.currency || ''} ${Number(m.amount).toLocaleString()}`.trim() : 'Check official site');
  return {
    title: c.courseName,
    universityName: c.universityName,
    degreeLevel: c.degreeLevel,
    durationText: c.duration,
    tuitionPerYear: money(c.annualFee),
    applicationFee: c.applicationFee?.isWaived ? 'Waived' : money(c.applicationFee),
    initialDeposit: money(c.initialDeposit),
    intake: (c.intakes || []).join(', '),
    intakeYear: '2027',
    minIeltsScore: cf.IeltsOverall, minPteScore: cf.PteScore, minDetScore: cf.DETScore, gmatScore: cf.GmatScore,
    pteSubscore: cf.PteNoSectionLessThan,
    avgScholarship: cf.AverageScholarship,
    deadline: cf.ApplicationDeadline,
    concentration: cf.Concentration,
    requirements: cf.EntryRequirement,
    isStem: c.isStem,
    university: { name: c.universityName, countryName: c.countryName, city: c.universityCity || c.city, state: c.universityState },
  };
}

// POST /api/search/export  { filters }  -> all matching results (capped) ready for the Excel exporter
exports.exportCourses = async (req, res) => {
  try {
    const { filters = {} } = req.body || {};
    const CAP = 5000;
    const rows = await CfCourse.find(buildMatch(filters)).sort(buildSort('featured')).limit(CAP).lean();
    res.json({ data: rows.map(toExportProgram), total: rows.length, capped: rows.length >= CAP });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/search/suggest?keyword=
exports.suggest = async (req, res) => {
  try {
    const kw = (req.query.keyword || '').trim();
    if (kw.length < 2) return res.json({ data: [] });
    const rx = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [courses, unis] = await Promise.all([
      CfCourse.find({ courseName: rx }).limit(6).select('courseName').lean(),
      CfUniversity.find({ name: rx }).limit(6).select('name').lean(),
    ]);
    const out = [
      ...unis.map(u => ({ type: 'university', name: u.name })),
      ...courses.map(c => ({ type: 'course', name: c.courseName })),
    ].slice(0, 10);
    res.json({ data: out });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// POST /api/search/courses  { filters, sort, page, pageSize, groupBy }
// Returns paged results + total + per-highlight facet counts (1:1 with CourseFinder's quick-filter counts).
exports.searchCourses = async (req, res) => {
  try {
    const { filters = {}, sort = 'featured', page = 1, pageSize = 20 } = req.body || {};
    const match = buildMatch(filters);
    const skip = (Math.max(1, +page) - 1) * Math.min(100, +pageSize || 20);
    const limit = Math.min(100, +pageSize || 20);

    const projection = {
      cf: 0, // omit heavy payload from list; detail endpoint returns it
    };

    const [data, total, facetAgg, sponsored] = await Promise.all([
      CfCourse.find(match, projection).sort(buildSort(sort)).skip(skip).limit(limit).lean(),
      CfCourse.countDocuments(match),
      // highlight facet counts over the current (non-highlight) match
      CfCourse.aggregate([
        { $match: buildMatch({ ...filters, highlights: undefined }) },
        { $unwind: '$highlightIds' },
        { $group: { _id: '$highlightIds', count: { $sum: 1 } } },
      ]),
      CfCourse.aggregate([{ $match: match }, { $group: { _id: '$cfUniversityId' } }, { $count: 'universities' }]),
    ]);

    const highlightCounts = {};
    facetAgg.forEach(f => { highlightCounts[f._id] = f.count; });

    res.json({
      data,
      total,
      page: +page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      universitiesCount: (sponsored[0] || {}).universities || 0,
      highlightCounts,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET /api/search/courses/:cfId  — full detail (nested shape, like CourseFinder)
exports.getCourseDetail = async (req, res) => {
  try {
    const c = await CfCourse.findOne({ cfId: Number(req.params.cfId) }).lean();
    if (!c) return res.status(404).json({ error: 'Not found' });
    const uni = await CfUniversity.findOne({ cfUniversityId: c.cfUniversityId }).lean();
    const cf = c.cf || {};
    res.json({
      data: {
        id: c.cfId,
        name: c.courseName,
        concentration: cf.Concentration,
        duration: c.duration,
        campus: cf.Campus,
        intakes: cf.Intakes,
        intakesList: cf.DisplayIntakes,
        applicationDeadline: cf.ApplicationDeadline,
        applicationFee: c.applicationFee,
        tuitionFee: c.annualFee,
        deposit: c.initialDeposit,
        tuitionFeeRemarks: cf.Remarks,
        university: uni,
        testRequirements: {
          english: [
            cf.IeltsOverall != null && { test: 'IELTS Overall', score: cf.IeltsOverall },
            cf.IeltsNoBandLessThan != null && { test: 'IELTS No Band Less Than', score: cf.IeltsNoBandLessThan },
            cf.ToeflScore != null && { test: 'TOEFL iBT Overall', score: cf.ToeflScore },
            cf.PteScore != null && { test: 'PTE Overall', score: cf.PteScore },
            cf.DETScore != null && { test: 'DET', score: cf.DETScore },
          ].filter(Boolean),
          standardized: [
            cf.GreScore != null && { test: 'GRE', score: cf.GreScore },
            cf.GmatScore != null && { test: 'GMAT', score: cf.GmatScore },
            cf.SatScore != null && { test: 'SAT', score: cf.SatScore },
            cf.ActScore != null && { test: 'ACT', score: cf.ActScore },
          ].filter(Boolean),
        },
        entryRequirements: cf.EntryRequirement,
        remarks: cf.Remarks,
        scholarshipDetail: cf.ScholarshipDeatil,
        averageScholarship: cf.AverageScholarship,
        highlightIds: c.highlightIds,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ----- eligibility engine (pure) -----
function evaluate(course, p) {
  const cf = course.cf || {};
  const reasons = [];
  // 1) nationality routing (0 = open to all)
  const elig = course.eligibleCountryIds || [];
  if (p.nationalityId && elig.length && !elig.includes(0) && !elig.includes(Number(p.nationalityId)))
    reasons.push('Not open to applicants of your nationality');
  // 2) study level vs qualification
  const allowed = QUALIFICATION_LEVELS[String(p.highestQualificationId)] || [];
  if (allowed.length && course.cfStudyLevelId && !allowed.includes(course.cfStudyLevelId))
    reasons.push('Program level does not match your highest qualification');
  // 3) academic score vs threshold (for the entry level)
  const isPg = PG_LEVELS.includes(course.cfStudyLevelId);
  const band = p.gradingSystem; // 'OutOf100' | 'OutOf10' ...
  const key = isPg ? `EntryRequirementUg${band}` : `EntryRequirementTwelfth${band}`;
  const req = cf[key] != null ? Number(cf[key]) : null;
  if (req != null && p.score != null && Number(p.score) < req)
    reasons.push(`Academic score below requirement (needs ${req} ${band})`);
  // 4) backlogs
  if (p.backlogs != null && cf.backlog != null && Number(p.backlogs) > Number(cf.backlog))
    reasons.push(`Too many backlogs (max ${cf.backlog})`);
  // 5) work experience
  if (cf.WorkExp && Number(cf.WorkExp) > 0 && (p.workExperience == null || Number(p.workExperience) < Number(cf.WorkExp)))
    reasons.push(`Requires ${cf.WorkExp} year(s) work experience`);
  // 6) english (only when the student declares no test and course needs it & no MOI waiver)
  const needsEnglish = cf.IeltsRequired || cf.ToeflRequired || cf.PteRequired || cf.DETRequired;
  if (p.englishExam === 'none' && needsEnglish && !cf.IsMOIWaiver && !cf.WithoutEnglishProficiency)
    reasons.push('English proficiency required');
  return { eligible: reasons.length === 0, reasons };
}

// POST /api/search/eligibility  { filters, profile, page, pageSize, bucket }
// bucket: 'eligible' | 'non-eligible'. Returns segmented, paged results + counts.
exports.evaluateEligibility = async (req, res) => {
  try {
    const { filters = {}, profile = {}, bucket = 'eligible', page = 1, pageSize = 20 } = req.body || {};
    const match = buildMatch(filters);
    // Eligibility only applies to study levels matching the student's qualification.
    const allowed = QUALIFICATION_LEVELS[String(profile.highestQualificationId)];
    if (allowed) match.cfStudyLevelId = { $in: allowed };
    const courses = await CfCourse.find(match).lean(); // scoped set (already filtered by level + facets)
    const eligible = [], nonEligible = [];
    for (const c of courses) {
      const r = evaluate(c, profile);
      const row = { cfId: c.cfId, courseName: c.courseName, universityName: c.universityName,
        countryName: c.countryName, degreeLevel: c.degreeLevel, duration: c.duration,
        annualFee: c.annualFee, applicationFee: c.applicationFee, initialDeposit: c.initialDeposit,
        highlightIds: c.highlightIds, averageScholarship: (c.cf || {}).AverageScholarship,
        eligible: r.eligible, reasons: r.reasons };
      (r.eligible ? eligible : nonEligible).push(row);
    }
    const list = bucket === 'non-eligible' ? nonEligible : eligible;
    const start = (Math.max(1, +page) - 1) * (+pageSize || 20);
    res.json({
      counts: { eligible: eligible.length, nonEligible: nonEligible.length },
      bucket,
      data: list.slice(start, start + (+pageSize || 20)),
      total: list.length,
      page: +page,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
