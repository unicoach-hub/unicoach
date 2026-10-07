const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Course = require('../models/Course');
const { syncCoursesFromCatalog, syncSingleCourseFromUrl } = require('../services/courseCrawlerService');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Find Trinity College Dublin
  const tcd = await University.findOne({ name: { $regex: /Trinity College Dublin/i } });
  if (!tcd) {
    console.error('Trinity College Dublin not found in DB');
    process.exit(1);
  }
  console.log(`Found University: ${tcd.name} (ID: ${tcd._id})`);

  console.log('\n--- Test 1: Direct Single Course Sync ---');
  const sampleCourseUrl = 'https://www.tcd.ie/courses/postgraduate/courses/accounting-and-analytics-mscpgraddip/';
  console.log(`Syncing: ${sampleCourseUrl}`);
  
  const singleCourse = await syncSingleCourseFromUrl(sampleCourseUrl, tcd._id);
  console.log('✅ Successfully extracted and upserted course:');
  console.log(JSON.stringify({
    courseName: singleCourse.courseName,
    degreeLevel: singleCourse.degreeLevel,
    discipline: singleCourse.discipline,
    duration: singleCourse.duration,
    annualFee: singleCourse.annualFee,
    ielts: singleCourse.minIeltsScore,
    ieltsRequirement: singleCourse.ieltsRequirement,
    deadline: singleCourse.applicationDeadline,
    intakes: singleCourse.intakes,
    isStem: singleCourse.isStem,
    scholarships: singleCourse.scholarships
  }, null, 2));

  console.log('\n--- Test 2: Checking Course count in DB ---');
  const totalCourses = await Course.countDocuments();
  console.log(`Total courses currently in DB: ${totalCourses}`);

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
