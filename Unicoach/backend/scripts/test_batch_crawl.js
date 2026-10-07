const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Course = require('../models/Course');
const { syncCoursesFromCatalog } = require('../services/courseCrawlerService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const tcd = await University.findOne({ name: { $regex: /Trinity College Dublin/i } });
  if (!tcd) {
    console.error('Trinity College Dublin not found in DB');
    process.exit(1);
  }

  console.log(`Starting batch sync for ${tcd.name}...`);
  const catalogUrl = 'https://www.tcd.ie/courses/postgraduate/a-z-of-pg-courses/';
  
  const results = await syncCoursesFromCatalog(catalogUrl, tcd._id, 5);
  console.log('Batch results:', JSON.stringify(results, null, 2));

  const total = await Course.countDocuments({ university: tcd._id });
  console.log(`Total courses stored in DB for ${tcd.name}: ${total}`);

  // Fetch and display details of these courses
  const docs = await Course.find({ university: tcd._id }).lean();
  console.log('\n--- Synced Courses Sample ---');
  docs.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c.degreeLevel}] ${c.courseName}`);
    console.log(`   Discipline: ${c.discipline} | Duration: ${c.duration} | STEM: ${c.isStem}`);
    console.log(`   Tuition: ${c.annualFee.currency} ${c.annualFee.amount.toLocaleString()} (₹${c.annualFee.inrAmount.toLocaleString()})`);
    console.log(`   IELTS: ${c.minIeltsScore} (${c.ieltsRequirement})`);
    console.log(`   Deadline: ${c.applicationDeadline} | Intakes: ${c.intakes.join(', ')}`);
    console.log(`   Source: ${c.sourceUrl}\n`);
  });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Batch crawl error:', err);
  process.exit(1);
});
