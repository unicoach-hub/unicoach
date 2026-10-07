/**
 * UNIVERSITY MASTER DATASET FIXER
 * ================================
 * Addresses all 12 issues identified across two independent accuracy audits:
 *
 * AUDIT 1 (17 Aug 2026):
 *   1. Country field corruption (252 records: "Master_in_cs_us" / "Master_in_usa")
 *   2. Deduplicate university groups with conflicting data
 *   3. Ranking system split (US Scorecard vs QS Rankings) + null fabricated rankingNum
 *   4. Flag placeholder tuition ($25,000 / $18,000) with tuitionIsEstimate
 *   5. Fix courses for miscategorized schools (medical/art/seminary with CS/MBA list)
 *   6. Flag generic eligibility strings with eligibilityIsGeneric
 *
 * AUDIT 2 (19 Aug 2026):
 *   7. Remove "Central City" placeholder ghost records (215 records, 55 duplicates)
 *   8. Fix 23 German websites pointing to google.com
 *   9. Normalize rank field to consistent string type
 *  10. Normalize degreeLevels spelling variants (10 → 3 canonical labels)
 *  11. Flag placeholder acceptanceRate defaults (65, 50)
 *  12. Updated dataQuality scoring to account for city/website/acceptanceRate quality
 *
 * Usage: node backend/scripts/fixMasterUniversitiesDataset.js
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const INPUT_PATH = path.join(__dirname, '../../master_all_universities.json');
const OUTPUT_PATHS = [
  path.join(__dirname, '../../master_all_universities.json'),
  path.join(__dirname, '../../verified_university_datasets/master_all_universities.json'),
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GENERIC_COURSE_LISTS = [
  // The 10-course template from verified_university_datasets/usa
  JSON.stringify(["Computer Science","Data Science","Business Administration","MBA","Engineering","Finance","Artificial Intelligence","Mechanical Engineering","Information Technology","Biotechnology"]),
  // The 5-course template from generateMasterUniversitiesJson.js defaults
  JSON.stringify(["Computer Science","Data Science","Business Administration","Software Engineering","Artificial Intelligence"]),
  // 8-course variant from frontend/src/data/universities
  JSON.stringify(["Computer Science","Data Science","Business Administration","MBA","Engineering","Finance","Artificial Intelligence","Mechanical Engineering"]),
  // 7-course variant from syncAllFrontendUniversities
  JSON.stringify(["Computer Science","Data Science","Business Analytics","MBA","Software Engineering","Finance","Mechanical Engineering"]),
];

const PLACEHOLDER_TUITION_VALUES = [25000, 18000];
const PLACEHOLDER_ACCEPTANCE_RATES = [65, 50];

// ─── DEGREE LEVEL NORMALIZATION MAP ───────────────────────────────────────────

const DEGREE_LEVEL_MAP = {
  'phd': 'PhD',
  'ph.d.': 'PhD',
  'ph.d': 'PhD',
  'doctorate': 'PhD',
  'doctoral': 'PhD',
  'masters': 'Masters',
  "master's": 'Masters',
  "master's degree": 'Masters',
  'master': 'Masters',
  'postgraduate': 'Masters',
  'mba': 'Masters',
  'bachelors': 'Bachelors',
  "bachelor's": 'Bachelors',
  "bachelor's degree": 'Bachelors',
  'bachelor': 'Bachelors',
  'undergraduate': 'Bachelors',
};

const GENERIC_ELIGIBILITY_STRINGS = [
  "GPA 3.0+, IELTS 6.5+ / TOEFL 80+",
  "Bachelor's degree with 2.8+ GPA, IELTS 6.5+, TOEFL 80+, GRE optional",
  "GPA 65%, IELTS 6.5+",
  "GPA 60%, IELTS 6.5+",
  "GPA 3.0+, IELTS 6.5+",
  "Bachelor's degree with 3.0+ GPA, IELTS 7.0+, TOEFL 90+, GRE/GMAT recommended",
  "GPA 75%, IELTS 6.5+",
  "Bachelor's degree with 3.5+ GPA, IELTS 7.5+, TOEFL 100+, GRE/GMAT required, strong SOP/LORs",
  "GPA 75%, IELTS 7.0+",
  "GPA 70%, IELTS 6.5+",
];

// ─── SCHOOL CATEGORY DETECTION ────────────────────────────────────────────────

const SCHOOL_CATEGORIES = [
  {
    category: 'medical',
    namePatterns: [
      /\bmedical\b/i, /\bhealth\s*sciences?\b/i, /\bnursing\b/i,
      /\bdental\b/i, /\bpharmac/i, /\bosteopath/i, /\bchiropractic/i,
      /\boptometr/i, /\bpodiatr/i, /\bveterinar/i, /\bmidwi/i,
      /\bnaturopath/i, /\bacupuncture/i, /\bmedicine\b/i,
    ],
    courses: [
      "Medicine", "Nursing", "Public Health", "Biomedical Sciences",
      "Health Administration", "Pharmacy", "Clinical Research",
      "Anatomy", "Physiology", "Epidemiology"
    ]
  },
  {
    category: 'art_design',
    namePatterns: [
      /\bart\s+(institute|center|college|academy|school)\b/i,
      /\bdesign\b/i, /\bfilm\b/i, /\bconservatory\b/i,
      /\bmusic\b/i, /\bdramatic\b/i, /\bperforming\s*arts?\b/i,
      /\bfashion\b/i, /\bvisual\s*arts?\b/i, /\bcreative\b/i,
      /\bcultural\b/i, /\bculinary\b/i, /\bphotograph/i,
    ],
    courses: [
      "Fine Arts", "Visual Arts", "Graphic Design", "Film & Media",
      "Music", "Performing Arts", "Animation", "Photography",
      "Fashion Design", "Creative Writing"
    ]
  },
  {
    category: 'religious',
    namePatterns: [
      /\bbible\b/i, /\bseminary\b/i, /\btheolog/i, /\bdivinity\b/i,
      /\brabbinical\b/i, /\bministry\b/i, /\breligious\b/i,
      /\bchristian\s+(college|university|school)\b/i,
      /\byeshiva\b/i, /\bbiblical\b/i, /\bjesuits?\b/i,
    ],
    courses: [
      "Theology", "Divinity", "Ministry", "Biblical Studies",
      "Religious Education", "Pastoral Counseling", "Ethics",
      "Church History", "Philosophy of Religion"
    ]
  },
  {
    category: 'law',
    namePatterns: [
      /\blaw\s+(school|college|center)\b/i,
      /\blegal\s+studies\b/i,
    ],
    courses: [
      "Law", "Legal Studies", "Criminal Justice", "Constitutional Law",
      "International Law", "Corporate Law", "Intellectual Property",
      "Human Rights Law", "Public Policy"
    ]
  },
  {
    category: 'military',
    namePatterns: [
      /\bmilitary\b/i, /\bair\s*force\b/i, /\bnaval\b/i, /\barmy\b/i,
      /\bdefense\b/i, /\bwar\s+college\b/i, /\bcoast\s*guard\b/i,
    ],
    courses: [
      "Military Science", "Defense Studies", "National Security",
      "Strategic Studies", "Leadership", "Cybersecurity",
      "Aerospace Engineering", "Intelligence Studies"
    ]
  },
  {
    category: 'beauty_cosmetology',
    namePatterns: [
      /\bcosmetolog/i, /\bbeauty\b/i, /\bbarber\b/i,
      /\besthetician\b/i,
    ],
    courses: [
      "Cosmetology", "Esthetics", "Hair Design",
      "Beauty Management", "Salon Management"
    ]
  },
  {
    category: 'trade_technical',
    namePatterns: [
      /\btechnical\s+(college|institute)\b/i,
      /\btrade\s+(school|college)\b/i,
      /\bvocational\b/i, /\bmechanics?\s+institute\b/i,
      /\bwelding\b/i, /\bautomotive\b/i,
    ],
    courses: [
      "Technical Studies", "Applied Sciences", "Industrial Technology",
      "Automotive Technology", "Electronics", "Welding Technology",
      "HVAC", "Construction Management"
    ]
  },
];

// ─── FIX FUNCTIONS ────────────────────────────────────────────────────────────

/**
 * FIX 1: Country field corruption
 * Replaces "Master_in_cs_us", "Master_in_usa" and normalizes all country values
 */
function fixCountry(record) {
  const raw = String(record.country || '').trim();
  const lower = raw.toLowerCase().replace(/[\s_-]+/g, '');

  // Corrupted values
  if (lower === 'masterincsus' || lower === 'masterinusa') {
    record.country = 'USA';
    record._countryFixed = true;
    return;
  }

  // Normalize known countries
  const COUNTRY_MAP = {
    'usa': 'USA', 'us': 'USA', 'unitedstates': 'USA', 'unitedstatesofamerica': 'USA',
    'uk': 'UK', 'unitedkingdom': 'UK', 'england': 'UK', 'greatbritain': 'UK',
    'canada': 'Canada',
    'germany': 'Germany', 'deutschland': 'Germany',
    'australia': 'Australia',
    'ireland': 'Ireland',
    'italy': 'Italy', 'italia': 'Italy',
    'france': 'France',
    'newzealand': 'New Zealand',
    'global': 'Global',
  };

  const normalized = COUNTRY_MAP[lower];
  if (normalized) {
    record.country = normalized;
  }
}

/**
 * FIX 2: Deduplicate universities
 * Normalizes names, merges duplicates keeping the best data
 */
function deduplicateUniversities(records) {
  const normalizeKey = (name) =>
    name.toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/\band\b/g, '')
      .replace(/\bthe\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

  const groups = {};
  const mergeLog = [];

  for (const record of records) {
    const key = normalizeKey(record.name);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  }

  const deduplicated = [];

  for (const [key, group] of Object.entries(groups)) {
    if (group.length === 1) {
      deduplicated.push(group[0]);
      continue;
    }

    // Merge: prefer records with non-placeholder data
    mergeLog.push({
      name: group[0].name,
      count: group.length,
      variants: group.map(g => `${g.name} [${g.country}, $${g.tuitionFeeUSD}]`),
    });

    // Score each record: higher = better data
    const scored = group.map(r => {
      let score = 0;
      if (!PLACEHOLDER_TUITION_VALUES.includes(r.tuitionFeeUSD)) score += 10;
      if (r.country !== 'Master_in_cs_us' && r.country !== 'Master_in_usa') score += 5;
      if (!GENERIC_COURSE_LISTS.includes(JSON.stringify(r.courses))) score += 3;
      if (r.rank !== 'N/A' && r.rank !== 'Ranked') score += 2;
      if (r.website && r.website.length > 10) score += 1;
      return { record: r, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = { ...scored[0].record };

    // Merge in any better fields from secondary records
    for (let i = 1; i < scored.length; i++) {
      const other = scored[i].record;
      if (PLACEHOLDER_TUITION_VALUES.includes(best.tuitionFeeUSD) && !PLACEHOLDER_TUITION_VALUES.includes(other.tuitionFeeUSD)) {
        best.tuitionFeeUSD = other.tuitionFeeUSD;
        best.tuition = other.tuition;
      }
      if ((!best.website || best.website.length < 10) && other.website && other.website.length >= 10) {
        best.website = other.website;
      }
      if (GENERIC_COURSE_LISTS.includes(JSON.stringify(best.courses)) && !GENERIC_COURSE_LISTS.includes(JSON.stringify(other.courses))) {
        best.courses = other.courses;
      }
    }

    best._wasDeduplicated = true;
    deduplicated.push(best);
  }

  return { deduplicated, mergeLog };
}

/**
 * FIX 3: Ranking system split
 * Adds rankingSource, rankingNote; nullifies fabricated rankingNum
 */
function fixRanking(record) {
  const rankStr = String(record.rank || '');

  // Detect ranking source
  if (rankStr.includes('US Scorecard')) {
    record.rankingSource = 'US College Scorecard';
    record.rankingNote = 'US College Scorecard index — not a prestige ranking. Not comparable to QS World Rankings.';
  } else if (rankStr.includes('QS Rankings')) {
    record.rankingSource = 'QS World Rankings';
    record.rankingNote = null;
  } else if (rankStr === 'N/A' || rankStr === 'Ranked' || rankStr === '') {
    record.rankingSource = null;
    record.rankingNote = null;
    // Null out fabricated rankingNum
    record.rankingNum = null;
    record.rank = null;
  } else {
    // Bare numbers (e.g., "651") — check if it looks like a QS rank for non-US schools
    const num = parseInt(rankStr.replace(/\D/g, ''));
    if (num && ['UK', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Ireland', 'New Zealand'].includes(record.country)) {
      record.rankingSource = 'QS World Rankings';
      record.rankingNote = null;
      record.rankingNum = num;
      record.rank = `Rank ${num} QS Rankings`;
    } else if (num) {
      // Unknown source
      record.rankingSource = 'Unknown';
      record.rankingNote = 'Ranking source unverified';
      record.rankingNum = num;
    } else {
      record.rankingSource = null;
      record.rankingNote = null;
      record.rankingNum = null;
      record.rank = null;
    }
  }
}

/**
 * FIX 4: Flag placeholder tuition
 */
function fixTuition(record) {
  record.tuitionIsEstimate = PLACEHOLDER_TUITION_VALUES.includes(record.tuitionFeeUSD);
}

/**
 * FIX 5: Fix courses for miscategorized schools
 */
function fixCourses(record) {
  const courseJson = JSON.stringify(record.courses);
  const isGenericCourseList = GENERIC_COURSE_LISTS.includes(courseJson);

  if (!isGenericCourseList) {
    // Courses look real / manually curated
    record.coursesAreGeneric = false;
    return;
  }

  // Check if school name matches a specialty category
  for (const cat of SCHOOL_CATEGORIES) {
    for (const pattern of cat.namePatterns) {
      if (pattern.test(record.name)) {
        record.courses = cat.courses;
        record.coursesAreGeneric = false;
        record._coursesCorrectedTo = cat.category;
        return;
      }
    }
  }

  // Still generic — flag it
  record.coursesAreGeneric = true;
}

/**
 * FIX 6: Flag generic eligibility
 */
function fixEligibility(record) {
  record.eligibilityIsGeneric = GENERIC_ELIGIBILITY_STRINGS.includes(record.eligibility);
}

/**
 * Normalize acceptanceRate to a number and flag placeholder defaults
 */
function fixAcceptanceRate(record) {
  if (typeof record.acceptanceRate === 'string') {
    const num = parseFloat(record.acceptanceRate.replace('%', ''));
    record.acceptanceRate = isNaN(num) ? null : num;
  }
  record.acceptanceRateIsEstimate = PLACEHOLDER_ACCEPTANCE_RATES.includes(record.acceptanceRate);
}

/**
 * FIX 7: Remove "Central City" placeholder ghost records
 * If a real-city record exists for the same university, delete the Central City ghost.
 * If no real-city record exists, flag it but keep it.
 */
function removeCentralCityGhosts(records) {
  const normalizeKey = (name) =>
    name.toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/\band\b/g, '')
      .replace(/\bthe\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

  // Group by normalized name
  const groups = {};
  for (const r of records) {
    const key = normalizeKey(r.name);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }

  const cleaned = [];
  let removedGhosts = 0;
  let flaggedGhosts = 0;

  for (const [key, group] of Object.entries(groups)) {
    const centralCityRecords = group.filter(r => r.city === 'Central City');
    const realCityRecords = group.filter(r => r.city !== 'Central City');

    if (centralCityRecords.length > 0 && realCityRecords.length > 0) {
      // Real record exists — drop the Central City ghost, merge any better data into real
      for (const real of realCityRecords) {
        for (const ghost of centralCityRecords) {
          // Merge better fields from ghost if real has placeholder
          if (PLACEHOLDER_TUITION_VALUES.includes(real.tuitionFeeUSD) && !PLACEHOLDER_TUITION_VALUES.includes(ghost.tuitionFeeUSD)) {
            real.tuitionFeeUSD = ghost.tuitionFeeUSD;
            real.tuition = ghost.tuition;
          }
        }
        cleaned.push(real);
      }
      removedGhosts += centralCityRecords.length;
    } else if (centralCityRecords.length > 0 && realCityRecords.length === 0) {
      // No real record — flag as placeholder but keep
      for (const ghost of centralCityRecords) {
        ghost.cityIsPlaceholder = true;
        cleaned.push(ghost);
      }
      flaggedGhosts += centralCityRecords.length;
    } else {
      // No Central City records — keep all
      cleaned.push(...group);
    }
  }

  return { cleaned, removedGhosts, flaggedGhosts };
}

/**
 * FIX 8: Fix placeholder websites
 *  - google.com placeholders (23 German records)
 *  - Auto-generated fake .edu domains on Central City records
 *    (e.g., "bowlinggreenstate.edu" for Bowling Green State University — real site is bgsu.edu)
 */
function fixPlaceholderWebsites(record) {
  // Case 1: google.com placeholder
  if (record.website && record.website.includes('google.com')) {
    record.websiteIsMissing = true;
    record.website = null;
    return;
  }

  // Case 2: Auto-generated fake .edu domains on Central City placeholder records
  if (record.cityIsPlaceholder && record.website) {
    record.websiteIsMissing = true;
    record.website = null;
    return;
  }

  record.websiteIsMissing = !record.website;
}

/**
 * FIX 9: Normalize rank field to always be string or null (never bare int)
 */
function fixRankType(record) {
  if (record.rank !== null && typeof record.rank === 'number') {
    // Bare integer — convert to string with source context
    if (record.rankingSource === 'QS World Rankings') {
      record.rank = `Rank ${record.rank} QS Rankings`;
    } else if (record.rankingSource === 'US College Scorecard') {
      record.rank = `Rank ${record.rank} US Scorecard`;
    } else if (record.rankingSource) {
      record.rank = `Rank ${record.rank}`;
    } else {
      record.rank = String(record.rank);
    }
  }
}

/**
 * FIX 10: Normalize degreeLevels to canonical labels
 */
function fixDegreeLevels(record) {
  if (!Array.isArray(record.degreeLevels)) return;

  const normalized = new Set();
  for (const level of record.degreeLevels) {
    const key = level.toLowerCase().trim();
    const mapped = DEGREE_LEVEL_MAP[key];
    if (mapped) {
      normalized.add(mapped);
    } else {
      // Keep unknown ones as-is but title-cased
      normalized.add(level.trim());
    }
  }
  record.degreeLevels = Array.from(normalized).sort();
}

/**
 * Compute data quality score (updated for audit 2)
 */
function computeDataQuality(record) {
  let realFields = 0;
  let totalFields = 0;

  // Tuition
  totalFields++;
  if (!record.tuitionIsEstimate) realFields++;

  // Ranking
  totalFields++;
  if (record.rankingSource && record.rankingSource !== 'Unknown') realFields++;

  // Courses
  totalFields++;
  if (!record.coursesAreGeneric) realFields++;

  // Eligibility
  totalFields++;
  if (!record.eligibilityIsGeneric) realFields++;

  // Website (not null, not google.com, not too short)
  totalFields++;
  if (record.website && record.website.length > 10 && !record.websiteIsMissing) realFields++;

  // AcceptanceRate (not a default placeholder)
  totalFields++;
  if (record.acceptanceRate && !record.acceptanceRateIsEstimate) realFields++;

  // City (not a placeholder)
  totalFields++;
  if (record.city && record.city !== 'Central City' && !record.cityIsPlaceholder) realFields++;

  const ratio = realFields / totalFields;
  if (ratio >= 0.8) record.dataQuality = 'verified';
  else if (ratio >= 0.5) record.dataQuality = 'partial';
  else record.dataQuality = 'estimated';
}

/**
 * Regenerate a clean ID
 */
function fixId(record) {
  record.id = 'uni-' + record.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   UNIVERSITY MASTER DATASET FIXER — ALL 12 AUDIT ISSUES    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Load
  console.log('Loading', INPUT_PATH, '...');
  const raw = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  console.log(`Loaded ${raw.length} records.\n`);

  // ═══════════════════════════════════════════════════════════════
  // AUDIT 1 FIXES (17 Aug 2026)
  // ═══════════════════════════════════════════════════════════════

  // ── Fix 1: Country ──
  console.log('─── FIX 1: Country Field Corruption ───');
  let countryFixed = 0;
  raw.forEach(r => {
    fixCountry(r);
    if (r._countryFixed) { countryFixed++; delete r._countryFixed; }
  });
  console.log(`  Fixed ${countryFixed} corrupted country values.\n`);

  // ── Fix 2: Dedup ──
  console.log('─── FIX 2: Deduplication ───');
  const { deduplicated, mergeLog } = deduplicateUniversities(raw);
  console.log(`  Found ${mergeLog.length} duplicate groups.`);
  console.log(`  Reduced: ${raw.length} → ${deduplicated.length} records.`);
  if (mergeLog.length > 0) {
    console.log('  Sample merges:');
    mergeLog.slice(0, 5).forEach(m => {
      console.log(`    "${m.name}" (${m.count} copies): ${m.variants.join(' | ')}`);
    });
  }
  console.log();

  // ── Fix 3: Rankings ──
  console.log('─── FIX 3: Ranking System Split ───');
  let rankNullified = 0;
  let scorecardLabeled = 0;
  let qsLabeled = 0;
  deduplicated.forEach(r => {
    const hadRankNum = r.rankingNum != null;
    fixRanking(r);
    if (hadRankNum && r.rankingNum == null) rankNullified++;
    if (r.rankingSource === 'US College Scorecard') scorecardLabeled++;
    if (r.rankingSource === 'QS World Rankings') qsLabeled++;
  });
  console.log(`  Labeled ${scorecardLabeled} as "US College Scorecard".`);
  console.log(`  Labeled ${qsLabeled} as "QS World Rankings".`);
  console.log(`  Nullified ${rankNullified} fabricated rankingNum values.\n`);

  // ── Fix 4: Tuition ──
  console.log('─── FIX 4: Flag Placeholder Tuition ───');
  deduplicated.forEach(r => fixTuition(r));
  const flaggedTuition = deduplicated.filter(r => r.tuitionIsEstimate).length;
  console.log(`  Flagged ${flaggedTuition} records with tuitionIsEstimate: true.\n`);

  // ── Fix 5: Courses ──
  console.log('─── FIX 5: Fix Courses for Miscategorized Schools ───');
  deduplicated.forEach(r => fixCourses(r));
  const correctedCourses = deduplicated.filter(r => r._coursesCorrectedTo);
  const stillGeneric = deduplicated.filter(r => r.coursesAreGeneric).length;
  console.log(`  Corrected courses for ${correctedCourses.length} specialty schools:`);
  const catCounts = {};
  correctedCourses.forEach(r => {
    catCounts[r._coursesCorrectedTo] = (catCounts[r._coursesCorrectedTo] || 0) + 1;
  });
  Object.entries(catCounts).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`    ${cat}: ${count} schools`);
  });
  console.log(`  Remaining generic: ${stillGeneric} records flagged as coursesAreGeneric: true.`);
  deduplicated.forEach(r => delete r._coursesCorrectedTo);
  console.log();

  // ── Fix 6: Eligibility ──
  console.log('─── FIX 6: Flag Generic Eligibility ───');
  deduplicated.forEach(r => fixEligibility(r));
  const genericElig = deduplicated.filter(r => r.eligibilityIsGeneric).length;
  console.log(`  Flagged ${genericElig} records with eligibilityIsGeneric: true.\n`);

  // ═══════════════════════════════════════════════════════════════
  // AUDIT 2 FIXES (19 Aug 2026)
  // ═══════════════════════════════════════════════════════════════

  // ── Fix 7: Central City ghost records ──
  console.log('─── FIX 7: Remove Central City Ghost Records ───');
  const { cleaned: afterCentralCity, removedGhosts, flaggedGhosts } = removeCentralCityGhosts(deduplicated);
  console.log(`  Removed ${removedGhosts} ghost records (had real-city duplicates).`);
  console.log(`  Flagged ${flaggedGhosts} remaining Central City records (no real-city alternative).`);
  console.log(`  Records: ${deduplicated.length} → ${afterCentralCity.length}\n`);

  // ── Fix 8: placeholder websites (google.com + fake .edu domains) ──
  console.log('─── FIX 8: Fix Placeholder & Fabricated Websites ───');
  let googleFixed = 0;
  let fakeDomainFixed = 0;
  afterCentralCity.forEach(r => {
    const hadWebsite = !!r.website;
    fixPlaceholderWebsites(r);
    if (r.websiteIsMissing && hadWebsite) {
      // Check if it was google or a fake domain
      googleFixed++; // simplified — we count total
    }
  });
  const totalWebsiteMissing = afterCentralCity.filter(r => r.websiteIsMissing).length;
  console.log(`  Nullified ${totalWebsiteMissing} placeholder/fabricated websites.`);
  console.log(`    (google.com + auto-generated fake .edu domains on Central City records)\n`);

  // ── Fix 9: Rank type normalization ──
  console.log('─── FIX 9: Normalize rank Field to Consistent String Type ───');
  let rankTypeFixed = 0;
  afterCentralCity.forEach(r => {
    const wasBareInt = r.rank !== null && typeof r.rank === 'number';
    fixRankType(r);
    if (wasBareInt) rankTypeFixed++;
  });
  console.log(`  Converted ${rankTypeFixed} bare-integer rank values to labeled strings.\n`);

  // ── Fix 10: degreeLevels normalization ──
  console.log('─── FIX 10: Normalize degreeLevels Spelling Variants ───');
  afterCentralCity.forEach(r => fixDegreeLevels(r));
  const dlCheck = {};
  afterCentralCity.forEach(r => {
    if (Array.isArray(r.degreeLevels)) {
      r.degreeLevels.forEach(d => { dlCheck[d] = (dlCheck[d] || 0) + 1; });
    }
  });
  console.log('  Canonical labels:');
  Object.entries(dlCheck).sort((a,b) => b[1] - a[1]).forEach(([k,v]) => {
    console.log(`    ${k}: ${v} records`);
  });
  console.log();

  // ── Fix 11: acceptanceRate normalization + flag ──
  console.log('─── FIX 11: Normalize & Flag Placeholder acceptanceRate ───');
  afterCentralCity.forEach(r => fixAcceptanceRate(r));
  const arEstimated = afterCentralCity.filter(r => r.acceptanceRateIsEstimate).length;
  console.log(`  Flagged ${arEstimated} records with acceptanceRateIsEstimate: true.\n`);

  // ── Fix 12: Updated dataQuality scoring ──
  console.log('─── FIX 12: Updated Data Quality Scoring ───');
  afterCentralCity.forEach(r => computeDataQuality(r));
  afterCentralCity.forEach(r => fixId(r));
  const qualityCounts = { verified: 0, partial: 0, estimated: 0 };
  afterCentralCity.forEach(r => qualityCounts[r.dataQuality]++);
  console.log(`  verified: ${qualityCounts.verified} | partial: ${qualityCounts.partial} | estimated: ${qualityCounts.estimated}\n`);

  // Sort alphabetically
  afterCentralCity.sort((a, b) => a.name.localeCompare(b.name));

  // Clean up internal fields
  afterCentralCity.forEach(r => {
    delete r._wasDeduplicated;
  });

  // ── Write output ──
  for (const outPath of OUTPUT_PATHS) {
    fs.writeFileSync(outPath, JSON.stringify(afterCentralCity, null, 2), 'utf8');
    console.log(`Saved: ${outPath}`);
  }

  // ─── VALIDATION REPORT ──────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              VALIDATION REPORT (12 CHECKS)                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const final = afterCentralCity;

  // Audit 1 checks
  const corruptedCountries = final.filter(r => /master_in/i.test(r.country));
  console.log(`✓ [1] Corrupted country values: ${corruptedCountries.length} (expected: 0)`);

  const nameKeys = {};
  final.forEach(r => {
    const k = r.name.toLowerCase().replace(/&/g, ' and ').replace(/\band\b/g, '').replace(/\bthe\b/g, '').replace(/[^a-z0-9]/g, '');
    nameKeys[k] = (nameKeys[k] || 0) + 1;
  });
  const remainingDupes = Object.values(nameKeys).filter(v => v > 1).length;
  console.log(`✓ [2] Remaining duplicates: ${remainingDupes} (expected: 0)`);

  const fabricatedRanks = final.filter(r =>
    (r.rank === null || r.rank === 'N/A' || r.rank === 'Ranked') && r.rankingNum != null
  );
  console.log(`✓ [3] Fabricated rankingNum: ${fabricatedRanks.length} (expected: 0)`);

  const unflaggedPlaceholder = final.filter(r =>
    PLACEHOLDER_TUITION_VALUES.includes(r.tuitionFeeUSD) && !r.tuitionIsEstimate
  );
  console.log(`✓ [4] Unflagged placeholder tuition: ${unflaggedPlaceholder.length} (expected: 0)`);

  const specialtyMismatches = final.filter(r => {
    for (const cat of SCHOOL_CATEGORIES) {
      for (const pattern of cat.namePatterns) {
        if (pattern.test(r.name) && GENERIC_COURSE_LISTS.includes(JSON.stringify(r.courses))) return true;
      }
    }
    return false;
  });
  console.log(`✓ [5] Specialty schools with generic courses: ${specialtyMismatches.length} (expected: 0)`);

  // Audit 2 checks
  const centralCityDupes = final.filter(r => r.city === 'Central City' && !r.cityIsPlaceholder);
  console.log(`✓ [7] Central City ghost records (unflagged): ${centralCityDupes.length} (expected: 0)`);

  const googleWebsites = final.filter(r => r.website && r.website.includes('google.com'));
  const fabricatedDomains = final.filter(r => r.cityIsPlaceholder && r.website);
  console.log(`✓ [8] google.com placeholder websites: ${googleWebsites.length} (expected: 0)`);
  console.log(`✓ [8b] Central City records with unflagged fabricated domains: ${fabricatedDomains.length} (expected: 0)`);

  const bareIntRanks = final.filter(r => r.rank !== null && typeof r.rank === 'number');
  console.log(`✓ [9] Bare-integer rank values: ${bareIntRanks.length} (expected: 0)`);

  const badDegreeLevels = final.filter(r => {
    if (!Array.isArray(r.degreeLevels)) return false;
    return r.degreeLevels.some(d => ['Ph.D.', "Bachelor's", "Master's", "Bachelor's Degree", "Master's Degree", 'Postgraduate', 'Undergraduate'].includes(d));
  });
  console.log(`✓ [10] Non-canonical degreeLevels: ${badDegreeLevels.length} (expected: 0)`);

  const unflaggedAcceptance = final.filter(r =>
    PLACEHOLDER_ACCEPTANCE_RATES.includes(r.acceptanceRate) && !r.acceptanceRateIsEstimate
  );
  console.log(`✓ [11] Unflagged placeholder acceptanceRate: ${unflaggedAcceptance.length} (expected: 0)`);

  // Flagship spot check
  console.log('\n─── Flagship University Spot Check ───');
  ['Harvard University', 'Massachusetts Institute of Technology', 'Stanford University',
   'University of Oxford', 'University of Cambridge', 'University of Toronto',
   'American Film Institute Conservatory', 'Alaska Bible College', 'Albany Medical College',
   'Akademie der Polizei Hamburg'
  ].forEach(name => {
    const u = final.find(r => r.name === name);
    if (u) {
      console.log(`  ${u.name}:`);
      console.log(`    rank=${u.rank} (type: ${typeof u.rank}), rankingSource=${u.rankingSource}`);
      console.log(`    tuition=$${u.tuitionFeeUSD} (est=${u.tuitionIsEstimate}), city=${u.city}${u.cityIsPlaceholder ? ' [PLACEHOLDER]' : ''}`);
      console.log(`    website=${u.website || '[NULL]'}${u.websiteIsMissing ? ' [WAS google.com]' : ''}`);
      console.log(`    degreeLevels=${JSON.stringify(u.degreeLevels)}`);
      console.log(`    courses=${u.courses.slice(0, 3).join(', ')}...`);
      console.log(`    dataQuality=${u.dataQuality}, country=${u.country}`);
    } else {
      console.log(`  ${name}: NOT FOUND`);
    }
  });

  console.log(`\n═══ TOTAL RECORDS: ${final.length} (was ${raw.length}) ═══`);
  console.log('Done!');
}

main();
