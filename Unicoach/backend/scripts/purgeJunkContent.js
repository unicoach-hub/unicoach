// backend/scripts/purgeJunkContent.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function purgeJunk() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('No MONGO_URI in .env, skipping live DB purge');
    return;
  }

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');

    const Blog = require('../models/Blog');
    const Event = require('../models/Event');

    // 1. Purge junk test blogs identified in audit
    const junkBlogRegex = /sdfdsfs|demo blog for testing|testing 27/i;
    const blogsToDelete = await Blog.find({ title: { $regex: junkBlogRegex } });
    console.log('Junk blogs found:', blogsToDelete.map(b => b.title));
    const delBlogRes = await Blog.deleteMany({ title: { $regex: junkBlogRegex } });
    console.log(`Deleted ${delBlogRes.deletedCount} junk blogs.`);

    // 2. Purge junk test events identified in audit
    const junkEventRegex = /1-1 section|sagar/i;
    const eventsToDelete = await Event.find({ 
      $or: [
        { title: { $regex: junkEventRegex } },
        { speaker: { $regex: junkEventRegex } }
      ]
    });
    console.log('Junk events found:', eventsToDelete.map(e => `${e.title} (${e.speaker})`));
    const delEventRes = await Event.deleteMany({
      $or: [
        { title: { $regex: junkEventRegex } },
        { speaker: { $regex: junkEventRegex } }
      ]
    });
    console.log(`Deleted ${delEventRes.deletedCount} junk events.`);

    await mongoose.disconnect();
    console.log('Clean disconnect complete.');
  } catch (err) {
    console.error('Purge error:', err.message);
  }
}

purgeJunk();
