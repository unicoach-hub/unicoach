require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const University = require('../models/University');
const Country = require('../models/Country');

async function checkCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const totalUnis = await University.countDocuments();
    
    const countries = await Country.find();
    console.log(`=== TOTAL UNIVERSITIES IN DATABASE: ${totalUnis} ===\n`);

    for (const c of countries) {
      const count = await University.countDocuments({ country: c._id });
      console.log(`- ${c.name} (${c.code.toUpperCase()}): ${count} universities`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkCounts();
