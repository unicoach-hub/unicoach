require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Scholarship = require('../models/Scholarship');
const fs = require('fs');
const path = require('path');

async function syncAndClean() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const masterPath = path.join(__dirname, '../../verified_scholarship_datasets/master_all_scholarships.json');
    const master = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));
    const validIds = master.map(m => m.id);

    const totalBefore = await Scholarship.countDocuments();
    console.log('Total scholarships in DB before cleanup:', totalBefore);

    const deleteResult = await Scholarship.deleteMany({ customId: { $nin: validIds } });
    console.log('Stale records purged:', deleteResult.deletedCount);

    const finalCount = await Scholarship.countDocuments();
    console.log('Final 100% verified scholarships in MongoDB:', finalCount);

    // Verify a sample record
    const sample = await Scholarship.findOne({ customId: 'uk_imperial_presidents' });
    console.log('\nSample Verified Record in DB (Imperial):');
    console.log('Title:', sample.title);
    console.log('FundingType:', sample.fundingType);
    console.log('CoverageLevel:', sample.coverageLevel);
    console.log('ProviderType:', sample.providerType);
    console.log('Amount:', sample.amount);
    console.log('Evidence items:', sample.evidence.length);
    console.log('FieldStatus:', sample.fieldStatus);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

syncAndClean();
