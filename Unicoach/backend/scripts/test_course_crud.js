const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const University = require('../models/University');
const Course = require('../models/Course');

async function testCRUD() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Find or create test university (e.g. American Center for Education in Singapore like in user's image)
  let uni = await University.findOne({ name: /American Center for Education/i });
  if (!uni) {
    const Country = require('../models/Country');
    let singapore = await Country.findOne({ name: /Singapore/i });
    if (!singapore) {
      singapore = await Country.create({ name: 'Singapore', code: 'singapore', cities: ['Singapore'] });
    }
    uni = await University.create({
      name: 'American Center for Education',
      country: singapore._id,
      city: 'Singapore',
      type: 'PRIVATE',
      tuitionFeeUSD: 12000,
      courses: []
    });
  }
  console.log(`Using University: ${uni.name} (ID: ${uni._id})`);

  // Simulate KC Overseas Course creation:
  // "OTHM Level 7 Diploma in Strategic Management and Leadership (E-learning)"
  // Duration: 8 months
  // Tuition: SGD 10,800
  // Application Fee: SGD 109
  // Intakes: Open, Mar, May, Jul, Sep, Nov
  console.log('\n--- 1. Creating Course 1 (8 Months) ---');
  const course1 = await Course.findOneAndUpdate(
    { sourceUrl: 'https://ace.edu.sg/othm-level-7-diploma-8m' },
    {
      courseName: 'OTHM Level 7 Diploma in Strategic Management and Leadership (E-learning) awarded by OTHM Qualifications and regulated by Ofqual, UK',
      university: uni._id,
      universityName: uni.name,
      country: uni.country,
      countryName: 'Singapore',
      city: 'Singapore',
      degreeLevel: 'Diploma',
      duration: '8 months',
      annualFee: {
        amount: 10800,
        currency: 'SGD',
        inrAmount: Math.round(10800 * 66.0) // ~7,12,800 INR
      },
      applicationFee: {
        amount: 109,
        currency: 'SGD',
        isWaived: false
      },
      intakes: ['Open', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      minIeltsScore: 6.0,
      ieltsRequirement: '6.0 overall',
      sourceUrl: 'https://ace.edu.sg/othm-level-7-diploma-8m',
      syncStatus: 'ACTIVE'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Sync to university
  await University.findByIdAndUpdate(uni._id, {
    $addToSet: { courses: course1.courseName }
  });

  console.log('Course 1 saved:', {
    name: course1.courseName,
    duration: course1.duration,
    fee: `${course1.annualFee.currency} ${course1.annualFee.amount} (₹${course1.annualFee.inrAmount})`,
    appFee: `${course1.applicationFee.currency} ${course1.applicationFee.amount}`,
    intakes: course1.intakes
  });

  console.log('\n--- 2. Creating Course 2 (12 Months) ---');
  const course2 = await Course.findOneAndUpdate(
    { sourceUrl: 'https://ace.edu.sg/othm-level-7-diploma-12m' },
    {
      courseName: 'OTHM Level 7 Diploma in Strategic Management and Leadership awarded by OTHM Qualifications and regulated by Ofqual, UK',
      university: uni._id,
      universityName: uni.name,
      country: uni.country,
      countryName: 'Singapore',
      city: 'Singapore',
      degreeLevel: 'Diploma',
      duration: '12 months',
      annualFee: {
        amount: 15600,
        currency: 'SGD',
        inrAmount: Math.round(15600 * 66.0) // ~10,29,600 INR
      },
      applicationFee: {
        amount: 109,
        currency: 'SGD',
        isWaived: false
      },
      intakes: ['Open', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      minIeltsScore: 6.0,
      sourceUrl: 'https://ace.edu.sg/othm-level-7-diploma-12m',
      syncStatus: 'ACTIVE'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await University.findByIdAndUpdate(uni._id, {
    $addToSet: { courses: course2.courseName }
  });

  console.log('Course 2 saved:', {
    name: course2.courseName,
    duration: course2.duration,
    fee: `${course2.annualFee.currency} ${course2.annualFee.amount} (₹${course2.annualFee.inrAmount})`,
    appFee: `${course2.applicationFee.currency} ${course2.applicationFee.amount}`,
    intakes: course2.intakes
  });

  const updatedUni = await University.findById(uni._id);
  console.log('\nParent University courses array:', updatedUni.courses);

  await mongoose.disconnect();
  console.log('\nDone test!');
}

testCRUD().catch(console.error);
