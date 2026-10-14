// Ingest transformed CourseFinder docs into UniCoach's MongoDB.
// Streaming + idempotent (upsert by cfId). Re-runnable safely.
//   MONGO_URI=... [DB=unicoach] [SLIM=1] node scripts/cf_ingest.js
// SLIM=1 drops the heavy raw `cf` payload (keeps all engine-relevant fields) ~ fits small clusters.
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MongoClient } = require('mongodb');

const URI = process.env.MONGO_URI;
if (!URI) { console.error('Set MONGO_URI'); process.exit(1); }
const DBNAME = process.env.DB || undefined; // if omitted, uses db in the URI
const SLIM = process.env.SLIM === '1';
// Where cf_transform.js wrote courses.ndjson / universities.json (override with CF_OUT_DIR).
const OUT = process.env.CF_OUT_DIR || path.resolve(__dirname, '.cfdata', 'out');

// LEAN cf fields for SLIM mode — engine (search + eligibility + sort) critical only.
// Long prose (Concentration, EntryRequirement*, Remarks, ScholarshipDeatil, TutionFee text,
// IntakesAndDeadlines/Closed, *Remarks, ESLELPDetail) is intentionally DROPPED to fit a
// free 512MB M0 cluster. Numeric grade bands, scores, flags and ids are all retained.
const CF_KEEP = ['Id','Name','StudyLevelId','Studylvl','Duration','Campus','CountryId','IsOnlineCourse','backlog',
 'Highlights','ApplicationDeadline','AppFeeWaiverAvailable','ApplicationFeeAmt','Amount','WithoutEnglishProficiency',
 'WithoutMaths','IsStemCourse','ScholarshipAvailable','InternshipAvailable','FifteenYearsEducation','ElpAvailable','EslAvailable',
 'AverageScholarship','UniversityId','universityName','universityCity','universityState',
 'universityCountry','CurrencyCode','Currency','USNewsRanking','QSRanking','WebomatricsNationalRanking','WebomatricsWorldRanking','universityLogoExtension','UniversityOrder',
 'PteScore','PteNoSectionLessThan','ToeflScore','ToeflNoSectionLessThan','IeltsOverall','IeltsNoBandLessThan','DETScore','GreScore','GmatScore','ActScore','SatScore',
 'EntryRequirementTwelfthOutOf100','EntryRequirementTwelfthOutOf45',
 'EntryRequirementTwelfthOutOf10','EntryRequirementTwelfthOutOf7','EntryRequirementTwelfthOutOf5','EntryRequirementTwelfthOutOf4',
 'EntryRequirementUgOutOf100','EntryRequirementUgOutOf10','EntryRequirementUgOutOf7','EntryRequirementUgOutOf5','EntryRequirementUgOutOf4','WorkExp',
 'EligibleCountryIds','EligibleStateIds','IeltsRequired','ToeflRequired','PteRequired','SatRequired','ActRequired','GreRequired','GmatRequired','DETRequired',
 'EnglishMarks12Score','IsMOIWaiver','TuitionFeeCurrency','ApplicationFeeCurrency','DepositCurrency','DisplayIntakes',
 'CohortCountryCode','DepositSortAmount','ApplicationCount12Mo'];

function slimCf(cf){ const o={}; for(const k of CF_KEEP) if(cf[k]!==undefined) o[k]=cf[k]; return o; }

(async () => {
  const client = new MongoClient(URI, { maxPoolSize: 10 });
  await client.connect();
  const db = client.db(DBNAME);
  console.log('connected to', db.databaseName, SLIM ? '(SLIM mode)' : '(full cf payload)');

  // RESET=1 drops the cf_* collections first (reclaims space for a clean re-load on tight clusters)
  if (process.env.RESET === '1') {
    for (const c of ['cf_courses','cf_universities','cf_highlights','cf_countries']) {
      await db.collection(c).drop().catch(() => {});
    }
    console.log('RESET: dropped cf_* collections');
  }

  // ---- countries ----
  const countries = JSON.parse(fs.readFileSync(path.join(OUT,'countries.json'),'utf8'));
  await db.collection('cf_countries').createIndex({ cfId: 1 }, { unique: true });
  await db.collection('cf_countries').bulkWrite(countries.map(c => ({ updateOne:{ filter:{cfId:c.cfId}, update:{$set:c}, upsert:true } })));
  console.log('countries:', countries.length);

  // ---- highlights ----
  const highlights = JSON.parse(fs.readFileSync(path.join(OUT,'highlights.json'),'utf8'));
  await db.collection('cf_highlights').createIndex({ id: 1 }, { unique: true });
  await db.collection('cf_highlights').bulkWrite(highlights.map(h => ({ updateOne:{ filter:{id:h.id}, update:{$set:h}, upsert:true } })));
  console.log('highlights:', highlights.length);

  // ---- universities ----
  const unis = JSON.parse(fs.readFileSync(path.join(OUT,'universities.json'),'utf8'));
  const Uni = db.collection('cf_universities');
  await Uni.createIndex({ cfUniversityId: 1 }, { unique: true });
  for (let i=0;i<unis.length;i+=1000){
    const batch = unis.slice(i,i+1000);
    await Uni.bulkWrite(batch.map(u => ({ updateOne:{ filter:{cfUniversityId:u.cfUniversityId}, update:{$set:u}, upsert:true } })));
  }
  console.log('universities:', unis.length);

  // ---- courses (streaming NDJSON) ----
  const Course = db.collection('cf_courses');
  await Course.createIndex({ cfId: 1 }, { unique: true });
  await Course.createIndex({ cfCountryId: 1, cfStudyLevelId: 1 });
  await Course.createIndex({ cfUniversityId: 1 });
  await Course.createIndex({ highlightIds: 1 });
  await Course.createIndex({ disciplines: 1 }); // broad free-text subject matching (CourseFinder parity)
  await Course.createIndex({ studyAreaIds: 1 }); // study-area (CategoryId) broad discipline matching
  // NOTE: no $text index — the engine matches by regex (buildMatch/suggest), so a text
  // index is unused dead weight (~tens of MB) that blows the M0 quota.

  const rl = readline.createInterface({ input: fs.createReadStream(path.join(OUT,'courses.ndjson')), crlfDelay: Infinity });
  let batch = [], n = 0;
  async function flush(){ if(!batch.length) return; await Course.bulkWrite(batch, { ordered:false }); batch=[]; }
  for await (const line of rl){
    if(!line.trim()) continue;
    const doc = JSON.parse(line);
    if (SLIM && doc.cf) doc.cf = slimCf(doc.cf);
    if (SLIM) {
      // drop native long-text duplicates (academicRequirement == cf.EntryRequirement, scholarship criteria == cf.ScholarshipDeatil)
      delete doc.academicRequirement;
      if (Array.isArray(doc.scholarships)) doc.scholarships = doc.scholarships.map(s => ({ name: s.name, discount: s.discount }));
    }
    batch.push({ updateOne:{ filter:{ cfId: doc.cfId }, update:{ $set: doc }, upsert:true } });
    if (batch.length >= 1000){ await flush(); n+=1000; if(n%10000===0) console.log('courses upserted:', n); }
  }
  await flush();
  const total = await Course.countDocuments();
  console.log('DONE. cf_courses in db:', total);
  await client.close();
})().catch(e => { console.error(e); process.exit(1); });
