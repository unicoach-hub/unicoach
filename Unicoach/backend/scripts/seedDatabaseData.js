// scripts/seedDatabaseData.js
// Seed realistic Events, News, Digests, and Blogs into the database.
// Usage: node scripts/seedDatabaseData.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
const News = require('../models/News');
const Event = require('../models/Event');
const Digest = require('../models/Digest');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unicoach';

console.log('Connecting to database:', mongoURI);

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Connected to database successfully.');

    // 1. Find or create an admin user to act as the author
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ username: 'admin' });
    }
    if (!admin) {
      console.log('No admin user found. Creating a default admin user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      admin = new User({
        name: 'UniCoach Advisor',
        username: 'admin',
        passwordHash,
        role: 'admin',
      });
      await admin.save();
      console.log('Default admin user created.');
    }

    console.log(`Using admin user "${admin.name}" (${admin._id}) as author.`);

    // Clear existing events, news, digests, and blogs (only those seeded or all?)
    // Let's clear all of them to have a clean, fresh setup as requested.
    await Event.deleteMany({});
    await News.deleteMany({});
    await Digest.deleteMany({});
    console.log('Cleared existing Events, News, and Digests.');

    // Seed Events
    const events = [
      {
        title: 'Study in Germany 2027: Complete Roadmap from University Selection to Admission',
        slug: 'study-in-germany-2027-roadmap',
        body: '<p>Join our expert-led masterclass on studying in Germany. We will cover public vs private universities, English-taught programs, blocking accounts (Sperrkonto), and visa application timelines for 2027.</p>',
        sections: [
          { type: 'heading', level: 2, content: 'Agenda of the Session' },
          { type: 'paragraph', content: 'We will walk you through the step-by-step process of securing admissions in tuition-free German public universities, including APS certification requirements.' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        author: admin._id,
        published: true,
        publishDate: new Date(),
        eventStart: new Date(Date.now() + 86400000 * 2), // 2 days from now
        eventEnd: new Date(Date.now() + 86400000 * 2 + 3600000 * 2), // 2 hours duration
        location: 'Online Webinar',
        registrationLink: 'https://unicoach.com/register/germany-roadmap',
        description: 'Get details on free public universities, APS certificates, blocking accounts, and admission requirements for Germany in 2027.',
        category: 'webinar',
        speaker: 'Joshua Vasudevan (PhD Researcher, UK)',
        tags: ['Germany', 'Free Education', 'APS Certification']
      },
      {
        title: 'UK 2026 Masters Roadmap: Scholarships, Jobs & Visa Guidelines',
        slug: 'uk-2026-masters-roadmap',
        body: '<p>A complete interactive session detailing the admission process for UK Masters programs in 2026. Learn about the Graduate Route visa, post-study work permits, and exclusive scholarships.</p>',
        sections: [
          { type: 'heading', level: 2, content: 'Why Study in the UK?' },
          { type: 'paragraph', content: 'The UK continues to be a top destination with 1-year master courses and standard 2-year post-study work rights.' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80',
        author: admin._id,
        published: true,
        publishDate: new Date(),
        eventStart: new Date(Date.now() + 86400000 * 5), // 5 days from now
        eventEnd: new Date(Date.now() + 86400000 * 5 + 3600000), // 1 hour duration
        location: 'Online Zoom',
        registrationLink: 'https://unicoach.com/register/uk-masters',
        description: 'Comprehensive guide covering top Russell Group colleges, IELTS waivers, Chevening scholarship timelines, and job options.',
        category: 'webinar',
        speaker: 'Tanisha Mandre (MSc Imperial College, Google Engineer)',
        tags: ['UK', 'Scholarships', 'Masters', 'Graduate Route']
      }
    ];
    await Event.insertMany(events);
    console.log('Seeded 2 Events.');

    // Seed News
    const news = [
      {
        title: 'UniCoach Announces Expansion of Offline Student Centers with 15 New Hubs in 2026',
        slug: 'unicoach-expands-offline-centers-2026',
        body: '<p>UniCoach is proud to announce the official rollout of 15 premium physical counseling hubs across major Tier 2 and Tier 3 cities in India. This offline expansion aims to bring hybrid counseling, physical mock test centers, and in-person visa assistance closer to study abroad aspirants.</p>',
        sections: [
          { type: 'heading', level: 2, content: 'Bringing Personalized Counseling Near You' },
          { type: 'paragraph', content: 'Our new hubs will feature physical interactive zones, IELTS coaching labs, and monthly university recruitment fairs where reps from UK, US, and Canada will meet students face-to-face.' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        author: admin._id,
        published: true,
        publishDate: new Date(),
        category: 'Corporate Update',
        metaTitle: 'UniCoach Opens 15 Offline Counseling Hubs in 2026',
        metaDescription: 'Study abroad advisor UniCoach is launching 15 new physical mock test and university counselling hubs across India in 2026.'
      },
      {
        title: 'New Student Visa Rules for UK and Germany: What You Need to Know for Fall 2026',
        slug: 'student-visa-rules-uk-germany-fall-2026',
        body: '<p>The UK and Germany have updated their financial requirements and application processing regulations for student visas starting Fall 2026. This release outlines the details of the block account amount increase in Germany and the updated sponsorship guidelines in the UK.</p>',
        sections: [
          { type: 'heading', level: 2, content: 'Key Visa Updates' },
          { type: 'paragraph', content: 'German student blocking account requirements are set to increase to 11,900 EUR per year, and UK immigration services require stricter bank statement audits.' }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        author: admin._id,
        published: true,
        publishDate: new Date(),
        category: 'Visa News',
        metaTitle: 'Visa Rule Updates for UK & Germany Fall 2026 - UniCoach',
        metaDescription: 'Stay informed on the latest immigration changes. Learn about the new block account thresholds for Germany and sponsorship checks for the UK.'
      }
    ];
    await News.insertMany(news);
    console.log('Seeded 2 News items.');

    // Seed UniCoach Digests
    const digests = [
      {
        title: 'How I Got a Fully-Funded Scholarship to study Data Science at Stanford University',
        description: 'Meet Rohit Sen, a UniCoach alumnus who shares his application strategy, Statement of Purpose (SOP) hacks, and tips for matching with assistantships to get a full tuition waiver.',
        category: 'reviews',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
        isVideo: true,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        length: '8:42',
        isSpotlight: true,
        published: true
      },
      {
        title: 'Ultimate Student Accommodation Guide for Munich: Cost & Location Analysis',
        description: 'An expert breakdown of public student dorms (Studentenwerk), private shared apartments (WG), and cost metrics across popular boroughs in Munich, Germany.',
        category: 'insights',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
        isVideo: false,
        videoUrl: '',
        length: '5 Min Read',
        isSpotlight: true,
        published: true
      }
    ];
    await Digest.insertMany(digests);
    console.log('Seeded 2 UniCoach Digest items.');

    // Seed Blogs (with category)
    // Find or create some blogs if needed
    const existingBlogsCount = await Blog.countDocuments();
    if (existingBlogsCount === 0) {
      console.log('Seeding default blogs...');
      const blogs = [
        {
          title: 'Rhodes Scholarship 2026: Application Requirements, Timelines & Interview Tips',
          slug: 'rhodes-scholarship-guide',
          body: '<p>Detailed roadmap on securing the prestigious Rhodes Scholarship for studying at the University of Oxford. Covers letter of recommendation profiles, essay drafting, and final interview prep.</p>',
          sections: [
            { type: 'heading', level: 2, content: 'Eligibility Criteria' },
            { type: 'paragraph', content: 'Applicants must show outstanding intellect, character, leadership potential, and commitment to public service.' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
          author: admin._id,
          published: true,
          publishDate: new Date(),
          category: 'Study Abroad',
          metaTitle: 'Complete Guide to Rhodes Scholarship 2026 - UniCoach',
          metaDescription: 'A step-by-step roadmap to applying for the Rhodes Scholarship at Oxford, including timelines, requirements, and expert interview advice.'
        },
        {
          title: 'IELTS Speaking Section Band 8.0: Mock Tests & Practical Scoring Frameworks',
          slug: 'ielts-speaking-band-8-framework',
          body: '<p>Master the speaking test format. Understand how lexical resource, grammatical range, coherence, and pronunciation map into a Band 8.0+ scorecard.</p>',
          sections: [
            { type: 'heading', level: 2, content: 'Vocabulary & Fluency Tips' },
            { type: 'paragraph', content: 'Focus on natural transition phrases and avoid using repetitive words during your cue card session.' }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
          author: admin._id,
          published: true,
          publishDate: new Date(),
          category: 'Exams (IELTS/PTE)',
          metaTitle: 'How to Get a Band 8.0 in IELTS Speaking - UniCoach Prep',
          metaDescription: 'Get access to expert cues, mock test structures, and pronunciation drills to score a Band 8.0 or above in the IELTS speaking module.'
        }
      ];
      await Blog.insertMany(blogs);
      console.log('Seeded 2 Blogs.');
    } else {
      // Ensure existing blogs have correct categories
      await Blog.updateMany({ category: { $exists: false } }, { category: 'Study Abroad' });
      console.log('Ensured all existing blogs have a category.');
    }

    console.log('\x1b[32mDatabase seeding completed successfully!\x1b[0m');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
