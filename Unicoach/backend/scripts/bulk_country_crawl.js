const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Country = require('../models/Country');
const Course = require('../models/Course');
const { syncSingleCourseFromUrl, discoverCourseUrlsFromCatalog } = require('../services/courseCrawlerService');

async function runBulkCrawl() {
  const args = process.argv.slice(2);
  let targetCountry = 'Ireland';
  let limitPerUni = 3;

  for (const arg of args) {
    if (arg.startsWith('--country=')) targetCountry = arg.split('=')[1].replace(/['"]/g, '');
    if (arg.startsWith('--limit=')) limitPerUni = parseInt(arg.split('=')[1], 10) || 3;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`\n======================================================`);
  console.log(`🚀 UniCoach Autonomous Bulk Course Crawler`);
  console.log(`🌍 Target Country: ${targetCountry} | Courses/Uni Limit: ${limitPerUni}`);
  console.log(`======================================================\n`);

  const countryDoc = await Country.findOne({ name: { $regex: new RegExp(`^${targetCountry}$`, 'i') } });
  if (!countryDoc) {
    console.error(`Country "${targetCountry}" not found in database.`);
    process.exit(1);
  }

  const unis = await University.find({ 
    country: countryDoc._id,
    website: { $exists: true, $ne: '' }
  }).lean();

  console.log(`Found ${unis.length} universities in ${targetCountry} with recorded websites.\n`);

  let totalSynced = 0;
  let totalErrors = 0;

  for (let i = 0; i < unis.length; i++) {
    const uni = unis[i];
    console.log(`[${i + 1}/${unis.length}] Scanning: ${uni.name}`);
    console.log(`   Official Domain: ${uni.website}`);

    let site = uni.website.trim().replace(/\/+$/, '');
    if (!site.startsWith('http')) site = 'https://' + site;

    // Common catalog path patterns
    const catalogCandidates = [
      `${site}/courses/postgraduate/a-z-of-pg-courses/`,
      `${site}/courses/postgraduate/`,
      `${site}/courses/`,
      `${site}/study/postgraduate/taught/`,
      `${site}/study/postgraduate/courses/`,
      `${site}/study/courses/`,
      `${site}/programmes/`
    ];

    let discoveredCourses = [];

    for (const catUrl of catalogCandidates) {
      try {
        const found = await discoverCourseUrlsFromCatalog(catUrl);
        if (found.length > 0) {
          discoveredCourses = found;
          console.log(`   ✓ Found course catalog at: ${catUrl} (${found.length} courses discovered)`);
          break;
        }
      } catch {
        // Continue to next candidate
      }
    }

    if (discoveredCourses.length === 0) {
      console.log(`   ⚠️ No direct course catalog detected. Skipping to next university.`);
      continue;
    }

    const batch = discoveredCourses.slice(0, limitPerUni);
    console.log(`   ⏳ AI Extracting ${batch.length} course(s)...`);

    for (const item of batch) {
      try {
        const course = await syncSingleCourseFromUrl(item.url, uni._id);
        console.log(`      ✅ [${course.degreeLevel}] ${course.courseName} | ${course.annualFee.currency} ${course.annualFee.amount.toLocaleString()} (₹${course.annualFee.inrAmount.toLocaleString()})`);
        totalSynced++;
        await new Promise(r => setTimeout(r, 1500)); // Polite crawling delay
      } catch (err) {
        console.log(`      ❌ ${item.url}: ${err.message}`);
        totalErrors++;
      }
    }

    console.log('');
  }

  const finalCount = await Course.countDocuments();
  console.log(`======================================================`);
  console.log(`🎉 Bulk Crawl Complete!`);
  console.log(`✅ Newly Synced Courses: ${totalSynced}`);
  console.log(`❌ Skipped/Failed: ${totalErrors}`);
  console.log(`📊 Total Courses in UniCoach DB: ${finalCount}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

runBulkCrawl().catch(err => {
  console.error('Fatal bulk crawl error:', err);
  process.exit(1);
});
