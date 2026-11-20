/**
 * WhatsApp reminders for 1:1 mentor sessions.
 *
 * Both sides hear twice: a day before and an hour before. Each of those four reminders is claimed
 * atomically (the flag is written before the message goes out), so a restart, a slow Meta call or a
 * second server can never send the same one twice.
 *
 * When a send cannot happen for a reason that may pass — the Meta template is still awaiting
 * approval, WhatsApp is disconnected, Meta returned an error — the claim is released so the next
 * tick tries again. A reason that will not change, such as no phone number or a STOP reply, keeps
 * the claim: retrying it every five minutes until the session starts would achieve nothing.
 *
 * Production only, because development shares the live database and would message real people.
 */

const UnicoachBooking = require('../models/UnicoachBooking');
const { sendTemplateMessage } = require('../../services/whatsappSend');

const TICK_MS = 5 * 60 * 1000;
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// Only a session that is still going ahead gets a reminder
const LIVE_STATES = ['CONFIRMED', 'IN_PROGRESS'];

// How close to the mark a session has to be. The worker ticks every 5 minutes, so each window is a
// little wider than the gap between ticks; the claim stops the overlap from sending twice.
const WINDOWS = [
  { key: 'dayBefore', from: 23 * HOUR, to: 24 * HOUR + 10 * MIN, label: 'a day before' },
  { key: 'hourBefore', from: 50 * MIN, to: 70 * MIN, label: 'an hour before' },
];

const istDayTime = (d) => new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
});
const istTime = (d) => new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit',
});

/** The "When:" line, written the way a person would say it at that moment. */
const whenPhrase = (startUtc, windowKey) => (windowKey === 'hourBefore'
  ? `in about an hour, at ${istTime(startUtc)}`
  : `tomorrow, ${istDayTime(startUtc)}`);

/**
 * Claim one reminder for one booking. Returns the booking only if this process is the one that
 * should send it; a second caller gets null because the flag is already set.
 */
const claim = (bookingId, field) => UnicoachBooking.findOneAndUpdate(
  { _id: bookingId, [`reminders.${field}`]: { $exists: false } },
  { $set: { [`reminders.${field}`]: new Date() } },
  { new: true },
).populate('mentorId', 'name phone').populate('serviceId', 'title').lean();

/** Give the claim back, so the next tick can try this reminder again. */
const release = (bookingId, field) => UnicoachBooking.updateOne(
  { _id: bookingId },
  { $unset: { [`reminders.${field}`]: 1 } },
);

/** Skips worth trying again later, as opposed to ones that will never change. */
const worthRetrying = (res) => Boolean(
  res.error || (res.skipped && /not approved|not connected|not found/i.test(res.skipped)),
);

/** Every booking starting inside one window that has not had that reminder yet. */
const dueBookings = async (now, win) => UnicoachBooking.find({
  state: { $in: LIVE_STATES },
  startUtc: { $gte: new Date(now.getTime() + win.from), $lte: new Date(now.getTime() + win.to) },
  $or: [
    { [`reminders.${win.key}Mentor`]: { $exists: false } },
    { [`reminders.${win.key}Student`]: { $exists: false } },
  ],
}).select('_id').lean();

/** Send both sides' reminders for one booking in one window. */
async function remindOne(bookingId, win) {
  const results = [];

  for (const audience of ['Mentor', 'Student']) {
    const field = `${win.key}${audience}`;
    const booking = await claim(bookingId, field);
    if (!booking) continue; // already sent, or someone else is sending it

    const mentorName = booking.mentorId?.name || 'there';
    const studentName = booking.studentName || 'there';
    const values = {
      mentor_name: mentorName,
      student_name: studentName,
      service_title: booking.serviceId?.title || '1:1 session',
      session_when: whenPhrase(booking.startUtc, win.key),
      booking_ref: booking.bookingRef || '',
    };

    const to = audience === 'Mentor' ? booking.mentorId?.phone : booking.studentPhone;
    const res = await sendTemplateMessage({
      templateName: audience === 'Mentor' ? 'mentor_session_reminder' : 'student_session_reminder',
      to,
      values,
      meta: { name: audience === 'Mentor' ? mentorName : studentName, sentBy: 'session reminder' },
    });

    if (worthRetrying(res)) {
      await release(bookingId, field);
      console.warn(`[SessionReminder] ${booking.bookingRef} ${field} will retry: ${res.error || res.skipped}`);
    } else if (res.skipped) {
      console.log(`[SessionReminder] ${booking.bookingRef} ${field} skipped for good: ${res.skipped}`);
    }
    results.push({ bookingRef: booking.bookingRef, field, retrying: worthRetrying(res), ...res });
  }

  return results;
}

/** One pass over every window. Exported so a test (or an admin button) can run it directly. */
async function sendDue(now = new Date()) {
  const all = [];
  for (const win of WINDOWS) {
    const due = await dueBookings(now, win);
    for (const b of due) {
      // eslint-disable-next-line no-await-in-loop
      all.push(...await remindOne(b._id, win));
    }
  }
  return all;
}

let timer = null;

function startWorker() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SessionReminder] not production: WhatsApp reminders are off');
    return;
  }
  if (timer) return;
  const tick = () => sendDue().catch((err) => console.error('[SessionReminder] tick failed:', err.message));
  timer = setInterval(tick, TICK_MS);
  tick();
  console.log('[SessionReminder] WhatsApp session reminders are on (every 5 minutes)');
}

function stopWorker() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { sendDue, remindOne, startWorker, stopWorker, whenPhrase, WINDOWS, TICK_MS };
