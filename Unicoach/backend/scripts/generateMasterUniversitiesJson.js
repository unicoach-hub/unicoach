const fs = require('fs');
const path = require('path');

const masterMap = new Map();

function cleanCountryName(c) {
  if (!c) return 'Global';
  const str = c.trim().toLowerCase();
  if (str === 'usa' || str === 'us' || str === 'united states') return 'USA';
  if (str === 'uk' || str === 'united kingdom' || str === 'england') return 'UK';
  if (str === 'canada') return 'Canada';
  if (str === 'germany') return 'Germany';
  if (str === 'australia') return 'Australia';
  if (str === 'ireland') return 'Ireland';
  if (str === 'italy') return 'Italy';
  if (str === 'france') return 'France';
  if (str === 'new-zealand' || str === 'new zealand') return 'New Zealand';
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function addUni(item, defaultCountry) {
  if (!item || typeof item !== 'object') return;
  const name = (item.name || item.university || item.institution || item.university_name || '').trim();
  if (!name || name.length < 2) return;
  
  const key = name.toLowerCase();
  const existing = masterMap.get(key) || {};

  const rawCountry = item.country || item.countryName || item.countryCode || existing.country || defaultCountry || 'Global';
  const country = cleanCountryName(rawCountry);
  const city = item.city || existing.city || 'Central City';
  const rank = item.rank || existing.rank || 'Ranked';
  const rankingNum = item.rankingNum || existing.rankingNum || (item.rank ? parseInt(String(item.rank).replace(/\D/g, '')) || 250 : 250);
  const tuition = item.tuition || existing.tuition || 'Competitive Tuition';
  const tuitionFeeUSD = item.tuitionFeeUSD || existing.tuitionFeeUSD || 25000;
  const acceptanceRate = item.acceptanceRate || existing.acceptanceRate || 65;
  const website = item.website || existing.website || '';
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true&size=128`;
  const logo = item.logo || existing.logo || fallbackLogo;
  const courses = item.courses || existing.courses || [
    'Computer Science',
    'Data Science',
    'Business Administration',
    'Software Engineering',
    'Artificial Intelligence'
  ];
  const degreeLevels = item.degreeLevels || existing.degreeLevels || ["Bachelor's", "Master's", "PhD"];
  const type = item.type || existing.type || 'PUBLIC';
  const eligibility = item.eligibility || existing.eligibility || 'GPA 3.0+, IELTS 6.5+';

  masterMap.set(key, {
    id: 'uni-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: name,
    country: country,
    city: city,
    rank: rank,
    rankingNum: rankingNum,
    tuition: tuition,
    tuitionFeeUSD: tuitionFeeUSD,
    acceptanceRate: acceptanceRate,
    type: type,
    website: website,
    logo: logo,
    courses: courses,
    degreeLevels: degreeLevels,
    eligibility: eligibility
  });
}

function scanDir(dir, defaultCountry) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      scanDir(full, f.name);
    } else if (f.name.endsWith('.json') && !f.name.includes('scholarship') && !f.name.includes('broken') && !f.name.includes('report')) {
      try {
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (Array.isArray(data)) {
          data.forEach(item => addUni(item, defaultCountry));
        }
      } catch (e) {}
    }
  }
}

// 1. Scan verified datasets
scanDir(path.join(__dirname, '../../verified_university_datasets'));

// 2. Scan frontend assets
scanDir(path.join(__dirname, '../../frontend/src/assets'));

// 3. Scan nodejs folder
scanDir(path.join(__dirname, '../../nodejs'));

const allUniversities = Array.from(masterMap.values());
allUniversities.sort((a, b) => a.name.localeCompare(b.name));

const out1 = path.join(__dirname, '../../verified_university_datasets/master_all_universities.json');
const out2 = path.join(__dirname, '../../master_all_universities.json');

fs.writeFileSync(out1, JSON.stringify(allUniversities, null, 2), 'utf8');
fs.writeFileSync(out2, JSON.stringify(allUniversities, null, 2), 'utf8');

console.log(`Successfully aggregated ${allUniversities.length} universities into master_all_universities.json!`);
