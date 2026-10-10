const mongoose = require('mongoose');
const Event = require('../models/Event');
const Lead = require('../models/Lead');
const SupportRequest = require('../models/SupportRequest');
const { normalizePhone } = require('../utils/twilio');
const { scoreLeadAI } = require('../utils/aiService');
const { sendEmail } = require('../utils/email');
const { escapeHtml } = require('../utils/escapeHtml');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only events the public site can see: published, and not scheduled for a later publish date
const publicVisibility = () => ({
  $or: [
    { publishDate: { $exists: false } },
    { publishDate: null },
    { publishDate: { $lte: new Date() } }
  ]
});

// Match an event by slug (with or without slashes) or by its ObjectId
function publicEventQuery(rawParam = '') {
  const cleanSlug = rawParam.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  const query = {
    $or: [
      { slug: cleanSlug },
      { slug: rawParam },
      { slug: `/${cleanSlug}` }
    ],
    published: true,
    $and: [publicVisibility()]
  };
  if (mongoose.isValidObjectId(rawParam)) {
    query.$or.push({ _id: rawParam });
  }
  return query;
}

// "5 Oct 2026, 6:30 pm IST": events are announced in Indian time
function formatIst(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const text = d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
  return `${text.replace(/\u202f/g, ' ')} IST`;
}

const eventSummary = (event) => ({
  _id: event._id,
  title: event.title,
  slug: event.slug,
  eventStart: event.eventStart,
  eventEnd: event.eventEnd,
  location: event.location
});

// Public "N registered" = real sign-ups (attendees on file), never a hand-edited number
async function withRealCounts(docs) {
  const list = Array.isArray(docs) ? docs : [docs];
  const counts = await Event.aggregate([
    { $match: { _id: { $in: list.map((e) => e._id) } } },
    { $project: { n: { $size: { $ifNull: ['$attendees', []] } } } },
  ]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  const out = list.map((e) => ({ ...(e.toObject ? e.toObject() : e), registrationCount: byId[String(e._id)] || 0 }));
  return Array.isArray(docs) ? out : out[0];
}

/**
 * GET /api/events
 * Retrieve all published events (excluding future scheduled events)
 */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ published: true, ...publicVisibility() })
      .sort({ eventStart: 1 })
      .select('-attendees -joiningLink') // public endpoint: never expose registrants' names, emails, phones
      .populate('author', 'name');
    return res.json(await withRealCounts(events));
  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/events/:id
 * Retrieve details for a specific event by ID or slug
 */
exports.getEventByIdOrSlug = async (req, res) => {
  try {
    const event = await Event.findOne(publicEventQuery(req.params.id || '')).select('-attendees -joiningLink').populate('author', 'name');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json(await withRealCounts(event));
  } catch (err) {
    console.error('Error fetching event details:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Validate the public registration form; returns { error } or the cleaned values
function readRegistration(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const intake = typeof body.intake === 'string' ? body.intake.trim().slice(0, 40) : '';

  if (!name || name.length > 100) return { error: 'Please enter your name (up to 100 characters).' };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };
  if (phone.length < 7 || phone.length > 20 || (phone.match(/\d/g) || []).length < 7) {
    return { error: 'Please enter a valid phone number.' };
  }
  return { name, email, phone, intake };
}

// CRM: a high-intent lead (new, or an existing one by phone/email gets this event as its latest enquiry)
async function recordEventLead({ name, email, phone, intake, event }) {
  const source = `Event: ${event.title}`.slice(0, 80);
  const when = formatIst(event.eventStart);
  const note = `Registered for event: "${event.title}"${when ? ` (${when})` : ''}`;
  const eventCountry = event.country && event.country !== 'Global' ? event.country : '';

  let lead = await Lead.findOne({ $or: [{ phone }, { email }] });
  if (lead) {
    // Unauthenticated form: never overwrite the lead's identity, only record the enquiry
    lead.totalInquiries = (lead.totalInquiries || 1) + 1;
    lead.lastInquiryAt = new Date();
    lead.latestSource = source;
    if (intake) lead.preferredIntake = intake;
    if (eventCountry && (!lead.dreamCountry || lead.dreamCountry === 'Undecided')) lead.dreamCountry = eventCountry;
    if (lead.status === 'closed') lead.status = 'new';
    lead.activities.push({ type: 'note', comment: note, date: new Date(), performedBy: 'Student' });
  } else {
    lead = new Lead({
      name,
      email,
      phone,
      ...(intake ? { preferredIntake: intake } : {}),
      ...(eventCountry ? { dreamCountry: eventCountry } : {}),
      source,
      latestSource: source,
      verified: true,
      status: 'new',
      totalInquiries: 1,
      lastInquiryAt: new Date(),
      notes: note,
      activities: [{ type: 'note', comment: note, date: new Date(), performedBy: 'System' }]
    });
  }

  try {
    const aiScore = await scoreLeadAI({ lead });
    if (aiScore && typeof aiScore.score === 'number' && ['Hot', 'Warm', 'Cold'].includes(aiScore.category)) {
      lead.aiScoring = { ...aiScore, scoredAt: new Date() };
    }
  } catch (e) {
    console.warn('AI lead scoring skipped for event registration:', e.message);
  }

  await lead.save();
}

function sendRegistrationEmail({ name, email, event }) {
  const when = formatIst(event.eventStart);
  const row = (label, value) => value
    ? `<tr><td style="padding: 6px 0; color: #71717a; font-size: 13px; width: 110px; vertical-align: top;">${label}</td><td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #18181b;">${escapeHtml(value)}</td></tr>`
    : '';

  return sendEmail({
    to: email,
    subject: `You're registered: ${String(event.title).replace(/[\r\n]+/g, ' ')}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e6e4dd; border-radius: 14px;">
        <div style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">UniCoach<span style="color: #DE5C2B;">.</span></div>
        <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
        <p>You are registered for <strong>${escapeHtml(event.title)}</strong>.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; background: #faf9f6; border-radius: 10px; padding: 12px 16px; margin: 16px 0;">
          ${row('Date &amp; time', when)}
          ${row('Where', event.location)}
        </table>
        <p>We'll share the joining details with you before the event.</p>
        <p style="margin-top: 24px; font-size: 13px; color: #71717a;">Questions? Just reply to this email.<br/><strong>UniCoach Advisory Team</strong></p>
      </div>
    `,
  });
}

/**
 * POST /api/events/:id/register
 * Register a student for a published event that has not ended (by ID or slug). Each new registration is
 * recorded on the event, lands in Admin → Requests (category 'Event Registration'),
 * and updates the CRM lead; the confirmation email never blocks or fails the request.
 */
exports.registerForEvent = async (req, res) => {
  try {
    const form = readRegistration(req.body);
    if (form.error) {
      return res.status(400).json({ error: form.error });
    }
    const { name, email, intake } = form;
    const phone = normalizePhone(form.phone);

    const event = await Event.findOne(publicEventQuery(String(req.params.id || ''))).select('-attendees -joiningLink');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    // Registration closes once the event is over (its end time, or its start time when no end is set)
    const closesAt = new Date(event.eventEnd || event.eventStart || NaN).getTime();
    if (Number.isFinite(closesAt) && closesAt < Date.now()) {
      return res.status(410).json({ error: 'This event has ended' });
    }

    // Atomic: adds the seat only when this email is not registered yet (safe against double clicks)
    const seat = await Event.updateOne(
      { _id: event._id, 'attendees.email': { $ne: email } },
      {
        $push: { attendees: { name, email, phone, intake: intake || 'Not specified', registeredAt: new Date() } },
        $inc: { registrationCount: 1 }
      }
    );
    if (!seat || !seat.modifiedCount) {
      return res.status(200).json({ success: true, alreadyRegistered: true, event: eventSummary(event) });
    }

    const when = formatIst(event.eventStart);
    try {
      await SupportRequest.create({
        name,
        email,
        phone,
        category: 'Event Registration',
        message: [
          `Event: ${event.title}`,
          `Date & time: ${when || 'Not scheduled yet'}`,
          event.location ? `Location: ${event.location}` : null,
          `Intake: ${intake || 'Not specified'}`,
          `Event ID: ${event._id}`
        ].filter(Boolean).join('\n'),
        eventId: event._id,
        eventTitle: event.title,
        eventStart: event.eventStart,
        intake,
        status: 'New'
      });
    } catch (srErr) {
      // Without the Requests entry the team would never see this sign-up: free the seat so the student can retry
      await Event.updateOne(
        { _id: event._id },
        { $pull: { attendees: { email } }, $inc: { registrationCount: -1 } }
      ).catch(() => {});
      throw srErr;
    }

    res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message: `Successfully registered for "${event.title}"!`,
      event: eventSummary(event)
    });

    // Follow-ups run after the response: a slow AI score or email provider never delays or fails the registration
    Promise.resolve()
      .then(() => recordEventLead({ name, email, phone, intake, event }))
      .catch((leadErr) => console.warn('Event registration: CRM lead update failed:', leadErr.message));
    Promise.resolve()
      .then(() => sendRegistrationEmail({ name, email, event }))
      .catch((mailErr) => console.warn('Event registration: confirmation email failed:', mailErr.message));
  } catch (err) {
    console.error('Event registration error:', err);
    return res.status(500).json({ error: 'Failed to register for event' });
  }
};
