require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

// Creates the "Ireland Career Roadmap 2027" masterclass (Rishi) as an UNPUBLISHED draft.
// Set the date/time in Admin → Events and publish it from there.
const SLUG = 'ireland-career-roadmap-2027';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await User.findOne({ role: 'admin' });
  const existing = await Event.findOne({ slug: SLUG });
  if (existing) {
    console.log('Event already exists, not changing it:', existing._id.toString(), 'published =', existing.published);
    process.exit(0);
  }

  const created = await Event.create({
    title: 'Ireland Career Roadmap 2027: From Job Search to Getting Settled',
    slug: SLUG,
    body: '<p>Meet Rishi, your Ireland career guide expert, in this masterclass on landing a job in Ireland and settling in after your studies.</p>',
    sections: [
      { type: 'heading', level: 2, content: 'What You Will Learn' },
      { type: 'paragraph', content: 'How the Irish job market works for international graduates, CV and LinkedIn tips for Irish employers, the Stamp 1G and Critical Skills work permit routes, and practical steps to get settled: housing, PPS number and banking.' }
    ],
    imageUrl: '/events/ireland-career.webp',
    author: admin ? admin._id : null,
    published: false,
    location: 'Online Masterclass',
    description: 'Meet Rishi, Career Guide Expert. Ireland job search strategy, Stamp 1G & work permits, and getting settled in 2027.',
    category: 'webinar',
    speaker: 'Rishi (Career Guide Expert, Ireland)',
    tags: ['Ireland', 'Careers', 'Jobs', 'Stamp 1G', 'Work Permit'],
    registrationCount: 0
  });

  console.log('Created draft event:', created._id.toString());
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
