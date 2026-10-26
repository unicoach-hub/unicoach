// Backfill old form submissions into the main Lead CRM list.
// Like live submissions: one lead per submission, linked to the same person's other leads
// (duplicateGroupId). Existing leads are never edited. Safe to re-run: a submission that
// already has a lead (created live, or by an earlier run) is skipped.
// Usage: node scripts/backfillFormSubmissionLeads.js           (dry run)
//        node scripts/backfillFormSubmissionLeads.js --apply    (write to MongoDB)
require('dotenv').config();
const mongoose = require('mongoose');
const CustomForm = require('../models/CustomForm');
const FormSubmission = require('../models/FormSubmission');
const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { findLeadsByContact, linkLeadToDuplicates } = require('../utils/leadMatching');

const unique = (values) => [...new Set((values || []).filter(Boolean))];

const fieldValue = (data = {}, aliases = []) => {
  for (const [key, value] of Object.entries(data || {})) {
    const lowered = String(key).trim().toLowerCase();
    if (aliases.some((alias) => lowered.includes(alias.toLowerCase()))) {
      const text = String(value ?? '').trim();
      if (text) return text;
    }
  }
  return '';
};

const getName = (data) => fieldValue(data, ['name', 'full name', 'student name', 'first name', 'last name']) || 'New Lead';
const getEmail = (data) => fieldValue(data, ['email', 'e-mail']) || '';
const getPhone = (data) => fieldValue(data, ['phone', 'mobile', 'whatsapp', 'contact']) || '';
const getCountry = (data) => fieldValue(data, ['dream country', 'country']) || 'Undecided';
const getIntake = (data) => fieldValue(data, ['preferred intake', 'intake']) || '2026';
const getEducation = (data) => fieldValue(data, ['highest education', 'education', 'qualification']) || 'Not specified';
const getCity = (data) => fieldValue(data, ['current city', 'city']) || 'Not specified';

(async () => {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const submissions = await FormSubmission.find({})
    .populate('form', 'name headerTitle slug')
    .sort({ submittedAt: 1 })
    .lean();

  let created = 0;
  // Form leads made before submissions were marked (an earlier backfill or the live form): each covers one submission
  const unmarkedCredits = new Map();
  let skipped = 0;

  for (const sub of submissions) {
    const formName = sub.form?.headerTitle || sub.form?.name || sub.form?.slug || 'Custom form';
    const sourceLabel = `Form: ${formName}`;
    const mentorLabel = sub.referrerHandle ? `Mentor: ${sub.referrerHandle}` : null;
    const tags = unique([sourceLabel, mentorLabel].filter(Boolean));

    const rawName = getName(sub.data || {});
    const rawEmail = getEmail(sub.data || {});
    const rawPhone = getPhone(sub.data || {});
    const normalizedPhone = normalizePhone(rawPhone);
    const cleanEmail = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const dreamCountry = getCountry(sub.data || {});
    const preferredIntake = getIntake(sub.data || {});
    const highestEducation = getEducation(sub.data || {});
    const currentCity = getCity(sub.data || {});

    const leadQuery = {
      $or: [
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    };

    if (!leadQuery.$or.length) {
      console.log('skip-no-contact', formName, JSON.stringify(sub.data));
      skipped += 1;
      continue;
    }

    // Already has a lead? (an earlier backfill run, or the live form path when it was submitted)
    const marker = `[submission ${sub._id}]`;
    const submittedAt = sub.submittedAt ? new Date(sub.submittedAt) : null;
    const already = await Lead.findOne({
      $or: [
        { 'activities.comment': { $regex: marker.replace(/[[\]]/g, '\\$&') } },
        ...(submittedAt ? [{ ...leadQuery, source: sourceLabel, createdAt: { $gte: new Date(submittedAt - 120000), $lte: new Date(+submittedAt + 120000) } }] : []),
      ],
    }).select('_id').lean();
    if (already) {
      console.log(`skip-has-lead ${already._id} via ${sourceLabel}`);
      skipped += 1;
      continue;
    }
    const creditKey = `${sourceLabel}|${cleanEmail || normalizedPhone}`;
    if (!unmarkedCredits.has(creditKey)) {
      unmarkedCredits.set(creditKey, await Lead.countDocuments({
        ...leadQuery, source: sourceLabel, 'activities.comment': { $not: /\[submission / },
      }));
    }
    if (unmarkedCredits.get(creditKey) > 0) {
      unmarkedCredits.set(creditKey, unmarkedCredits.get(creditKey) - 1);
      console.log(`skip-covered ${rawName} via ${sourceLabel} (lead made by an earlier run)`);
      skipped += 1;
      continue;
    }

    const matchingLeads = await findLeadsByContact(Lead, { phone: normalizedPhone, email: cleanEmail });

    if (apply) {
      const lead = new Lead({
        name: rawName,
        email: cleanEmail,
        phone: normalizedPhone,
        dreamCountry,
        preferredIntake,
        highestEducation,
        currentCity,
        source: sourceLabel,
        latestSource: sourceLabel,
        tags,
        autoTags: tags,
        verified: Boolean(cleanEmail || normalizedPhone),
        status: 'new',
        totalInquiries: 1,
        lastInquiryAt: sub.submittedAt || new Date(),
        activities: [{
          type: 'note',
          comment: `Backfilled form submission via ${sourceLabel}${mentorLabel ? ` by ${mentorLabel}` : ''} ${marker}`,
          date: sub.submittedAt || new Date(),
          performedBy: 'System'
        }],
      });
      await linkLeadToDuplicates(Lead, lead, matchingLeads);
      await lead.save();
    }

    console.log(`create ${rawName}${matchingLeads.length ? ` (linked to ${matchingLeads.length} existing)` : ''} / ${cleanEmail || normalizedPhone || 'no-contact'} via ${sourceLabel}`);
    created += 1;
  }

  console.log(`${apply ? 'Applied' : 'Dry run'} => created=${created}, skipped=${skipped}, total=formSubmissions=${submissions.length}`);
  await mongoose.disconnect();
})();
