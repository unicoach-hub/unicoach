// CourseFinder full-catalogue harvester.
// Iterates every destination country, pulls all courses via the authenticated
// /cf/v3/search-program/courses endpoint, writes one raw file per country.
// Usage: node scripts/cf_harvest.js
const fs = require('fs');
const path = require('path');

const ROOT = process.env.CF_DATA_DIR || path.resolve(__dirname, '.cfdata');
const RAW = path.join(ROOT, 'raw');
fs.mkdirSync(RAW, { recursive: true });

// ---- creds ----
let raw = fs.readFileSync(path.join(ROOT, '.cf_creds.json'), 'utf8');
let creds = JSON.parse(raw);
if (typeof creds === 'string') creds = JSON.parse(creds); // in case it was double-encoded
const TOKEN = creds.token, UID = creds.userId;
if (!TOKEN) { console.error('No token'); process.exit(1); }

const COUNTRY_CODES = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25,26,32,35,37,38,39,40,41,45,46,48,49,50,51,52,53,54,55,57,58,59,60,61,62,63];
const INTAKES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Spring","Summer","Fall","Winter"];
const YEAR = "2027";
const NAT = 99; // nationality used only for eligibility routing; course attributes are nationality-independent

const H = {
  'Authorization': 'Bearer ' + TOKEN,
  'Content-Type': 'application/json',
  'x-userid': UID,
  'accept': 'application/json, text/plain, */*'
};
const URL = 'https://api.coursefinder.ai/cf/v3/search-program/courses';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const logFile = path.join(ROOT, 'harvest.log');
function log(m){ const line = `[${new Date().toISOString()}] ${m}`; console.log(line); fs.appendFileSync(logFile, line+'\n'); }

async function fetchCountry(code, attempt=1){
  const body = JSON.stringify({ filters: { intake: INTAKES, year: YEAR, 'student-nationality-id': NAT, country: [code] } });
  try {
    const t0 = Date.now();
    const r = await fetch(URL, { method:'POST', headers:H, body });
    if (r.status === 401 || r.status === 403) { log(`AUTH FAIL (${r.status}) on country ${code} — token likely expired`); return { auth:false }; }
    if (!r.ok) throw new Error('HTTP '+r.status);
    const j = await r.json();
    const data = j.data || [];
    const out = { country: code, 'search-id': j['search-id'], 'sponsored-universities': j['sponsored-universities']||[], count: data.length, data };
    fs.writeFileSync(path.join(RAW, `country-${code}.json`), JSON.stringify(out));
    log(`country ${code}: ${data.length} courses (${(Date.now()-t0)}ms)`);
    return { ok:true, count:data.length };
  } catch(e){
    if (attempt <= 4){ log(`country ${code} attempt ${attempt} failed: ${e.message} — retrying`); await sleep(2000*attempt); return fetchCountry(code, attempt+1); }
    log(`country ${code} GIVEUP: ${e.message}`); return { ok:false };
  }
}

(async () => {
  log(`=== harvest start · ${COUNTRY_CODES.length} countries · year ${YEAR} ===`);
  let total = 0;
  const summary = {};
  for (const code of COUNTRY_CODES){
    const existing = path.join(RAW, `country-${code}.json`);
    if (fs.existsSync(existing)) { const c = JSON.parse(fs.readFileSync(existing,'utf8')).count; summary[code]=c; total+=c; log(`country ${code}: cached (${c})`); continue; }
    const res = await fetchCountry(code);
    if (res && res.auth === false) { log('STOPPING — auth expired. Re-save token and re-run (cached countries are skipped).'); break; }
    if (res && res.ok) { summary[code]=res.count; total+=res.count; }
    await sleep(600); // be gentle
  }
  fs.writeFileSync(path.join(ROOT,'harvest-summary.json'), JSON.stringify({ year:YEAR, totalRaw: total, perCountry: summary }, null, 2));
  log(`=== harvest done · ${total} raw course rows across ${Object.keys(summary).length} countries (pre-dedupe) ===`);
})();
