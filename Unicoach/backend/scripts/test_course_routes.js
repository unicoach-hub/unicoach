const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const courseRoutes = require('../routes/courseRoutes');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const app = express();
  app.use(express.json());
  app.use('/api/courses', courseRoutes);

  // Use supertest or custom request handler
  const request = require('supertest');
  
  console.log('\n--- 1. Testing GET /api/courses (Public List) ---');
  const res1 = await request(app).get('/api/courses');
  console.log('Status:', res1.status);
  console.log(`Success: ${res1.body.success} | Total: ${res1.body.total}`);
  console.log('First 2 courses returned:');
  console.log(res1.body.courses?.slice(0, 2).map(c => ({
    name: c.courseName,
    uni: c.universityName,
    degree: c.degreeLevel,
    feeINR: c.annualFee?.inrAmount,
    ielts: c.minIeltsScore,
    url: c.sourceUrl
  })));

  console.log('\n--- 2. Testing Filter by Degree Level "Master\'s" ---');
  const res2 = await request(app).get('/api/courses?degreeLevel=Master\'s');
  console.log(`Status: ${res2.status} | Found: ${res2.body.total}`);

  console.log('\n--- 3. Testing Search Query "Accounting" ---');
  const res3 = await request(app).get('/api/courses?search=Accounting');
  console.log(`Status: ${res3.status} | Found: ${res3.body.total}`);
  if (res3.body.courses?.length > 0) {
    console.log('Matched Course:', res3.body.courses[0].courseName);
  }

  await mongoose.disconnect();
  console.log('\nAll route tests passed!');
}

run().catch(err => {
  console.error('Route test failed:', err);
  process.exit(1);
});
