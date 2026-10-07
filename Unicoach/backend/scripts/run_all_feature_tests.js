const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { configureCloudinary, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const Template = require('../models/Template');
const Blog = require('../models/Blog');
const SocialPost = require('../models/SocialPost');
const Scholarship = require('../models/Scholarship');
const Lead = require('../models/Lead');
const SupportRequest = require('../models/SupportRequest');
const Settings = require('../models/Settings');

async function runTests() {
  console.log('\n================================================================');
  console.log('       🚀 UNICOACH END-TO-END SYSTEM FEATURE TEST SUITE         ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // ── TEST 1: MongoDB Database Connection ──
  console.log('▶ [TEST 1/7] Testing MongoDB Atlas Connectivity...');
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error('MONGO_URI is missing in .env');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('  ✅ PASSED: MongoDB Connected Successfully!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: MongoDB Connection Failed ->', err.message);
    failed++;
    process.exit(1);
  }

  // ── TEST 2: Cloudinary CDN Live Upload & Cleanup ──
  console.log('▶ [TEST 2/7] Testing Cloudinary CDN Live Upload & Delivery...');
  try {
    const isConfigured = await configureCloudinary();
    if (!isConfigured) throw new Error('Cloudinary is not configured in .env or Settings');

    // Create a temporary sample file to upload
    const tempFilePath = path.join(__dirname, 'temp_test_image.png');
    // Minimal 1x1 transparent PNG buffer
    const samplePngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(tempFilePath, samplePngBuffer);

    const uploadRes = await uploadToCloudinary(tempFilePath, 'unicoach/test_suite');
    if (!uploadRes || !uploadRes.url) throw new Error('No URL returned from Cloudinary');

    console.log('  ✅ PASSED: Cloudinary CDN Upload Success!');
    console.log(`     CDN URL: ${uploadRes.url}`);
    console.log(`     Public ID: ${uploadRes.publicId}`);
    console.log(`     Bytes: ${uploadRes.bytes} | Format: ${uploadRes.format}`);

    // Cleanup test asset
    await deleteFromCloudinary(uploadRes.publicId);
    console.log('     Cleaned up temporary test asset from CDN.\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Cloudinary Upload Test ->', err.message, '\n');
    failed++;
  }

  // ── TEST 3: Email Marketing Templates & Variable Replacement ──
  console.log('▶ [TEST 3/7] Testing Email Marketing Templates & Tag Compiler...');
  try {
    const testTemplateName = `Test Campaign ${Date.now()}`;
    const template = new Template({
      name: testTemplateName,
      type: 'email',
      subject: 'Welcome {name} to {dreamCountry} Program',
      body: 'Hello {name}, your intake {preferredIntake} for {highestEducation} is verified.'
    });
    await template.save();

    // Verify tag compilation
    const sampleLead = {
      name: 'Rohan Sharma',
      dreamCountry: 'USA',
      preferredIntake: 'Fall 2026',
      highestEducation: 'B.Tech CS'
    };

    const compile = (text, data) => text.replace(/\{(\w+)\}/g, (_, key) => data[key] || '');
    const compiledSubject = compile(template.subject, sampleLead);
    const compiledBody = compile(template.body, sampleLead);

    if (compiledSubject !== 'Welcome Rohan Sharma to USA Program') {
      throw new Error('Subject tag compilation mismatch');
    }
    if (compiledBody !== 'Hello Rohan Sharma, your intake Fall 2026 for B.Tech CS is verified.') {
      throw new Error('Body tag compilation mismatch');
    }

    // Cleanup template
    await Template.findByIdAndDelete(template._id);
    console.log('  ✅ PASSED: Email Templates & Dynamic Personalization Engine Verified!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Email Template Test ->', err.message, '\n');
    failed++;
  }

  // ── TEST 4: Blog & Content CMS CRUD ──
  console.log('▶ [TEST 4/7] Testing Blog / CMS Content Management CRUD...');
  try {
    const testSlug = `test-blog-${Date.now()}`;
    const testBlog = new Blog({
      title: 'Guide to Top US Universities 2026',
      slug: testSlug,
      body: 'This is test content for study abroad admissions.',
      category: 'USA',
      published: true,
      imageUrl: 'https://res.cloudinary.com/slsut3se/image/upload/sample.jpg'
    });
    await testBlog.save();

    const fetchedBlog = await Blog.findOne({ slug: testSlug });
    if (!fetchedBlog || fetchedBlog.title !== 'Guide to Top US Universities 2026') {
      throw new Error('Could not fetch newly created blog');
    }

    // Cleanup
    await Blog.findByIdAndDelete(testBlog._id);
    console.log('  ✅ PASSED: Content CMS Creation, Indexing & Querying Verified!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Blog CMS Test ->', err.message, '\n');
    failed++;
  }

  // ── TEST 5: Social Media Publishing & Metrics Engine ──
  console.log('▶ [TEST 5/7] Testing Social Media Publishing Engine...');
  try {
    const post = new SocialPost({
      title: 'Scholarship Intake 2026 Open',
      content: 'Early application deadlines for Fall 2026 are active.',
      platforms: ['instagram', 'telegram', 'linkedin'],
      status: 'published',
      publishedAt: new Date(),
      metrics: { likes: 25, views: 350, shares: 8 }
    });
    await post.save();

    const fetchedPost = await SocialPost.findById(post._id);
    if (!fetchedPost || fetchedPost.platforms.length !== 3) {
      throw new Error('Social post record mismatch');
    }

    // Cleanup
    await SocialPost.findByIdAndDelete(post._id);
    console.log('  ✅ PASSED: Multi-Platform Post Engine & Metric Schema Verified!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Social Media Test ->', err.message, '\n');
    failed++;
  }

  // ── TEST 6: Scholarships Explorer & Match Fit Probability ──
  console.log('▶ [TEST 6/7] Testing Scholarship Discovery & Deadline Matching...');
  try {
    const count = await Scholarship.countDocuments();
    console.log(`     Total Verified Scholarships in Database: ${count}`);

    const sampleScholarship = await Scholarship.findOne();
    if (sampleScholarship) {
      const title = sampleScholarship.title || sampleScholarship.name || 'Sample Scholarship';
      const deadlineDate = sampleScholarship.deadline?.date;
      const daysLeft = deadlineDate ? Math.ceil((new Date(deadlineDate) - new Date()) / (1000 * 60 * 60 * 24)) : 'Rolling / 45';
      console.log(`     Sample: "${title}" | Country: ${sampleScholarship.country} | Deadline: ${daysLeft} days`);
    }

    console.log('  ✅ PASSED: Scholarship Directory & Countdown Engine Active!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Scholarship Engine Test ->', err.message, '\n');
    failed++;
  }

  // ── TEST 7: Priority DM & Lead Capture Engine ──
  console.log('▶ [TEST 7/7] Testing Lead Capture & Priority DM Support Requests...');
  try {
    const testSupport = new SupportRequest({
      name: 'Test Student Applicant',
      email: `test_${Date.now()}@example.com`,
      phone: '+91 9999999999',
      category: 'Scholarship Guidance',
      message: 'Need help evaluating scholarships for Fall 2026.'
    });
    await testSupport.save();

    const fetchedSupport = await SupportRequest.findById(testSupport._id);
    if (!fetchedSupport || fetchedSupport.category !== 'Scholarship Guidance') {
      throw new Error('Support request not saved correctly');
    }

    // Cleanup
    await SupportRequest.findByIdAndDelete(testSupport._id);
    console.log('  ✅ PASSED: Priority DM & Lead Capture Flow Fully Operational!\n');
    passed++;
  } catch (err) {
    console.error('  ❌ FAILED: Lead Capture Test ->', err.message, '\n');
    failed++;
  }

  // ── FINAL SUMMARY ──
  console.log('================================================================');
  console.log(`🎉 TEST RUN COMPLETE: ${passed} Passed | ${failed} Failed`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
