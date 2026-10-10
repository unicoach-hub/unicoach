// Lead tags. Auto tags are worked out from what the lead did (source, events, country, intake) and are
// recomputed whenever the lead is saved; manual tags (lead.tags) are added by the team in the admin panel.

const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

// Free-text sources from the site's forms → one readable tag
const SOURCE_TAGS = [
  [/^event:/i, null], // handled as an event tag below
  [/mentor/i, 'Booked mentor'],
  [/^signup/i, 'Signed up'],
  [/eligib/i, 'Source: Eligibility check'],
  [/booking|consult/i, 'Source: Consultation form'],
  [/premium|counsel/i, 'Source: Premium counselling'],
  [/import/i, 'Source: Imported'],
  [/shortlist/i, 'Source: Shortlister'],
  [/scholar/i, 'Source: Scholarships'],
];

const sourceTag = (source) => {
  const s = clean(source);
  if (!s) return null;
  const hit = SOURCE_TAGS.find(([re]) => re.test(s));
  if (hit) return hit[1];
  return `Source: ${s.slice(0, 40)}`;
};

const eventTag = (title) => `Event: ${clean(title).slice(0, 70)}`;

function deriveAutoTags(lead) {
  const tags = new Set();
  [lead.source, lead.latestSource].forEach((src) => {
    const s = clean(src);
    if (/^event:/i.test(s)) tags.add(eventTag(s.replace(/^event:\s*/i, '')));
    const t = sourceTag(s);
    if (t) tags.add(t);
  });
  // Every event the lead registered for (kept in the activity log)
  (lead.activities || []).forEach((a) => {
    const m = /Registered for event: "([^"]+)"/.exec(a?.comment || '');
    if (m) tags.add(eventTag(m[1]));
  });
  const country = clean(lead.dreamCountry);
  if (country && !/^undecided$/i.test(country)) tags.add(`Country: ${country}`);
  const intake = clean(lead.preferredIntake);
  if (intake) tags.add(`Intake: ${intake}`);
  if (lead.verified) tags.add('Verified');
  if (lead.aiScoring?.category && lead.aiScoring?.scoredAt) tags.add(`AI: ${lead.aiScoring.category}`);
  return [...tags];
}

// Manual tags: trimmed, short, unique, never pretending to be an auto tag
function cleanManualTags(list) {
  const out = [];
  (Array.isArray(list) ? list : []).forEach((t) => {
    const v = clean(t).slice(0, 40);
    if (v && !out.some((x) => x.toLowerCase() === v.toLowerCase())) out.push(v);
  });
  return out.slice(0, 30);
}

module.exports = { deriveAutoTags, cleanManualTags, eventTag };

// Recompute auto tags for leads written without .save() (e.g. bulk import)
async function refreshAutoTags(filter) {
  const Lead = require('../models/Lead');
  const leads = await Lead.find(filter).select('source latestSource activities.comment dreamCountry preferredIntake verified aiScoring').lean();
  if (!leads.length) return 0;
  await Lead.bulkWrite(leads.map((l) => ({ updateOne: { filter: { _id: l._id }, update: { $set: { autoTags: deriveAutoTags(l) } } } })));
  return leads.length;
}

module.exports.refreshAutoTags = refreshAutoTags;
