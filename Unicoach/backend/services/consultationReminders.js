// Reminder emails for counsellor calls (Consultation): the student hears a day before and an hour
// before, and the team gets a heads-up 30 minutes before with the student's number.
// Each reminder is claimed atomically (reminders.* set before sending), so a restart or two
// servers never send it twice. Production only: local development shares the live database.
const Consultation = require('../models/Consultation');
const { sendEmail } = require('../utils/email');
const escapeHtml = require('../utils/escapeHtml');
const { sendTeamAlert } = require('../utils/teamAlert');

const TICK_MS = 5 * 60 * 1000;
const HOUR = 3600 * 1000;
const MIN = 60 * 1000;

const istWhen = (d) => new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
});
const istTime = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' });
const site = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');

const studentHtml = (c, { heading, line }) => `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;color:#1e293b">
  <img src="https://www.unicoach.com/logo-black.png" alt="UniCoach" width="130" style="display:block;width:130px;height:auto;border:0;margin:0 0 18px" />
  <h2 style="margin:0 0 12px;font-size:19px">${heading}</h2>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.6">Hi ${escapeHtml(c.name)}, ${line}</p>
  <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;font-size:14px">
    <tr><td style="padding:8px 12px;color:#64748b">When</td><td style="padding:8px 12px;font-weight:700">${istWhen(c.startsAt)} (India time)</td></tr>
    <tr><td style="padding:8px 12px;color:#64748b">Call on</td><td style="padding:8px 12px;font-weight:700">${escapeHtml(c.phone)}</td></tr>
    <tr><td style="padding:8px 12px;color:#64748b">Call</td><td style="padding:8px 12px">${escapeHtml(c.serviceLabel)}, ${c.durationMin} minutes</td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:14px;line-height:1.6">Keep your phone close and your marksheets, test scores and questions handy. Can't make it? Just reply to this email and we will move the call.</p>
  <p style="margin:16px 0 0;font-size:13px;color:#64748b">Booking ${escapeHtml(c.ref)} · <a href="${site()}" style="color:#DE5C2B">unicoach.com</a></p>
</div>`;

// Claim one reminder: returns the booking only if this server is the one that should send it
const claim = (filter, field) => Consultation.findOneAndUpdate(
  { ...filter, status: 'confirmed', [`reminders.${field}`]: { $exists: false } },
  { $set: { [`reminders.${field}`]: new Date() } },
  { new: true },
).lean();

async function sendDue() {
  const now = Date.now();
  let sent = 0;

  // Day before: calls 3–24 hours away that were booked at least 12 hours ahead
  // (someone who booked this morning for tonight doesn't need a "tomorrow" email)
  for (;;) {
    const c = await claim({
      email: { $nin: ['', null] },
      startsAt: { $gt: new Date(now + 3 * HOUR), $lte: new Date(now + 24 * HOUR) },
      $expr: { $gte: [{ $subtract: ['$startsAt', '$createdAt'] }, 12 * HOUR] },
    }, 'dayBefore');
    if (!c) break;
    await sendEmail({
      to: c.email,
      subject: `Reminder: your UniCoach call is on ${istWhen(c.startsAt)}`,
      html: studentHtml(c, {
        heading: 'Your counsellor call is coming up',
        line: `this is a reminder for your free call with a UniCoach counsellor. We will call you at ${istTime(c.startsAt)}.`,
      }),
      kind: 'counselling',
    }).catch((e) => console.error(`[ConsultReminders] ${c.ref} day-before failed:`, e.message));
    sent += 1;
  }

  // An hour before: calls up to 75 minutes away that were booked at least 2 hours ahead
  for (;;) {
    const c = await claim({
      email: { $nin: ['', null] },
      startsAt: { $gt: new Date(now), $lte: new Date(now + 75 * MIN) },
      $expr: { $gte: [{ $subtract: ['$startsAt', '$createdAt'] }, 2 * HOUR] },
    }, 'hourBefore');
    if (!c) break;
    await sendEmail({
      to: c.email,
      subject: `Your UniCoach call is at ${istTime(c.startsAt)} today`,
      html: studentHtml(c, {
        heading: 'Your call starts in about an hour',
        line: `our counsellor will call you at <b>${istTime(c.startsAt)}</b> today.`,
      }),
      kind: 'counselling',
    }).catch((e) => console.error(`[ConsultReminders] ${c.ref} hour-before failed:`, e.message));
    sent += 1;
  }

  // Team: 30 minutes before every confirmed call (with or without the student's email)
  for (;;) {
    const c = await claim({ startsAt: { $gt: new Date(now), $lte: new Date(now + 35 * MIN) } }, 'team');
    if (!c) break;
    sendTeamAlert({
      subject: `${istTime(c.startsAt)} par call: ${c.name} (${c.phone})`,
      heading: `${istTime(c.startsAt)} par counsellor call hai`,
      details: {
        Naam: c.name, Phone: c.phone, Email: c.email, Service: c.serviceLabel, Notes: c.notes,
        'Kisne book kiya': c.source === 'AI call' ? 'Nitya (AI call)' : 'Website', Ref: c.ref,
      },
      adminPath: '/crm/consultations',
      replyTo: c.email,
    });
    sent += 1;
  }
  return sent;
}

let timer = null;
let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    const n = await sendDue();
    if (n) console.log(`[ConsultReminders] sent ${n} reminder(s)`);
  } catch (err) {
    console.error('[ConsultReminders] worker error:', err.message);
  } finally {
    running = false;
  }
}

function startWorker() {
  if (timer || process.env.NODE_ENV !== 'production' || process.env.DISABLE_CONSULT_REMINDERS === 'true') return;
  timer = setInterval(tick, TICK_MS);
  if (timer.unref) timer.unref();
  setTimeout(tick, 90 * 1000).unref?.();
}

module.exports = { sendDue, startWorker, studentHtml };
