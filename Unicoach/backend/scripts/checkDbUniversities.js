require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const University = require('../models/University');
const Country = require('../models/Country');

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const total = await University.countDocuments();
    const countries = await Country.find({});
    console.log('--- MONGODB UNIVERSITIES REPORT ---');
    console.log('Total Universities in DB:', total);
    console.log('Countries in DB:', countries.map(c => ({ id: c._id, name: c.name, code: c.code })));

    const agg = await University.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } }
    ]);
    console.log('Universities per Country ObjectId in DB:');
    for (const a of agg) {
      const countryObj = countries.find(c => String(c._id) === String(a._id));
      console.log(`- ${countryObj ? countryObj.name : 'Unknown Country (' + a._id + ')'}: ${a.count} universities`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkDb();
