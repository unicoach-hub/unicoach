require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unicoach';

mongoose.connect(mongoURI).then(async () => {
  console.log('Connected to DB');
  let admin = await User.findOne({ role: 'admin' }) || await User.findOne();
  
  const australiaEvent = {
    title: 'Study in Australia 2026: Complete Roadmap to Go8 Universities, Visas & PR',
    slug: 'study-in-australia-2026-go8-roadmap',
    body: '<p>Meet your Australia expert Manan in this exclusive masterclass covering Group of Eight (Go8) university admissions, scholarships up to 100%, Post-Study Work rights, and PR pathways.</p>',
    sections: [
      { type: 'heading', level: 2, content: 'What You Will Learn' },
      { type: 'paragraph', content: 'Step-by-step guidance on Go8 applications, GTE/GS requirements, streamlined visa processing, and high-demand occupation lists.' }
    ],
    imageUrl: '/events/australia.webp',
    author: admin ? admin._id : null,
    published: true,
    publishDate: new Date(),
    eventStart: new Date(Date.now() + 86400000 * 3),
    eventEnd: new Date(Date.now() + 86400000 * 3 + 3600000 * 2),
    location: 'Online Masterclass',
    registrationLink: 'https://unicoach.com/register/australia-masterclass',
    description: 'Meet your Australia expert Manan. Learn about Go8 admissions, Post-Study Work Visas, and high-value scholarships.',
    category: 'webinar',
    speaker: 'Manan (Australia Expert)',
    tags: ['Australia', 'Go8', 'Scholarships', 'Visas'],
    registrationCount: 620
  };

  // Check if already exists by slug or title
  const existing = await Event.findOne({ 
    $or: [
      { slug: 'study-in-australia-2026-go8-roadmap' },
      { title: /Australia/i }
    ] 
  });

  if (existing) {
    existing.imageUrl = '/events/australia.webp';
    existing.speaker = 'Manan (Australia Expert)';
    existing.published = true;
    await existing.save();
    console.log('Updated existing Australia event:', existing._id);
  } else {
    const created = await Event.create(australiaEvent);
    console.log('Created new Australia event:', created._id);
  }

  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
