// Test run of the course agent: reads the database (never writes) and saves what it found to a JSON file.
// Usage: node scripts/courseAgentTest.js "Dublin City University" 5 "msc computing" out.json
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const University = require('../models/University');
require('../models/Country');
const { runForUniversity } = require('../services/courseAgent');

(async () => {
  const [name, limit = '5', search = 'postgraduate masters course', out = 'course-agent-result.json'] = process.argv.slice(2);
  if (!name) throw new Error('Give a university name');
  await mongoose.connect(process.env.MONGO_URI);
  const uni = await University.findOne({ name }).populate('country', 'name').lean();
  await mongoose.disconnect();
  if (!uni) throw new Error(`No university named "${name}"`);
  const result = await runForUniversity(
    { name: uni.name, website: uni.website, countryName: uni.country?.name },
    { limit: Number(limit), search, onProgress: (m) => console.log(m) }
  );
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(`\nSaved ${result.courses.length} courses (${result.skipped.length} pages skipped) to ${out}`);
})().catch((e) => {
  console.error('Agent failed:', e.message);
  process.exit(1);
});
