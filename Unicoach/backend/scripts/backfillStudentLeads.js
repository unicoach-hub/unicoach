// Every registered student gets a lead, so All Leads is the one place to manage them.
// Students the team already moved past Walk-in are linked (userId) and marked converted.
// Usage: node scripts/backfillStudentLeads.js           (dry run)
//        node scripts/backfillStudentLeads.js --apply
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');

const tail = (p) => String(p || '').replace(/\D/g, '').slice(-10);

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const users = await User.find({ role: { $ne: 'admin' } }).select('name email phone journeyStage stageHistory dreamCountry createdAt').lean();
  let created = 0, linked = 0;
  // test / internal accounts are not real leads
  const SKIP = /@example\.com$|^unicoachedu@gmail\.com$/i;
  for (const u of users) {
    if (SKIP.test(u.email || '')) continue;
    const or = [];
    if (u.email) or.push({ email: String(u.email).toLowerCase() });
    if (tail(u.phone).length === 10) or.push({ phone: { $regex: `${tail(u.phone)}$` } });
    const started = (u.journeyStage && u.journeyStage !== 'registered') || (u.stageHistory || []).length > 0;
    const lead = or.length ? await Lead.findOne({ $or: or }) : null;
    if (lead) {
      if (started && !lead.userId) {
        console.log('link', u.email || u.phone, '->', lead._id);
        if (apply) { lead.userId = u._id; if (lead.status !== 'converted') lead.status = 'converted'; await lead.save(); }
        linked += 1;
      }
      continue;
    }
    console.log('create', u.name, u.email || u.phone, started ? '(journey started)' : '');
    if (apply) {
      await Lead.create({
        name: u.name || 'Student',
        email: u.email || '',
        phone: u.phone || 'Not provided',
        source: 'Website account',
        status: started ? 'converted' : 'new',
        dreamCountry: u.dreamCountry || 'Undecided',
        ...(started ? { userId: u._id } : {}),
        createdAt: u.createdAt,
      });
    }
    created += 1;
  }
  console.log(`${apply ? 'Applied' : 'Dry run'}: ${created} leads to create, ${linked} to link (of ${users.length} students)`);
  await mongoose.disconnect();
})();
