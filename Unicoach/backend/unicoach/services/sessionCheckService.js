const crypto = require('crypto');
const UnicoachBooking = require('../models/UnicoachBooking');
const { sendEmail } = require('../../utils/email');

/**
 * "Did your session happen?" for paid 1:1 calls.
 * A while after the call ends, the student gets an email with Yes / No links to a page on the site.
 * Yes: the mentor's payout is ready as soon as the mentor has marked the call completed.
 * No: the payout is held and the team gets an email; an admin decides from Mentor Payouts.
 * No reply: the payout becomes ready 48 hours after the email (see weeklyPayoutService).
 */
const ASK_AFTER_MIN = 15;          // wait this long after the scheduled end before asking
const ASK_WITHIN_DAYS = 7;         // never ask about calls older than this (e.g. when the worker was down)
const TICK_MS = 10 * 60 * 1000;
const ASKABLE_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const siteUrl = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
const teamInbox = () => process.env.SMTP_USER || 'unicoachedu@gmail.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function askEmailHtml(b) {
  const link = (a) => `${siteUrl()}/session-check/${b.sessionCheck.token}?a=${a}`;
  const btn = (href, label, bg) => `<a href="${href}" style="display:inline-block;padding:13px 26px;margin:4px 6px;border-radius:999px;background:${bg};color:#fff;font-weight:700;font-size:15px;text-decoration:none;border:2px solid #16130F">${label}</a>`;
  return `<!doctype html><html><body style="margin:0;background:#FFF6E5;font-family:Arial,Helvetica,sans-serif;color:#16130F">
  <div style="max-width:520px;margin:24px auto;background:#fff;border:3px solid #16130F;border-radius:18px;padding:28px">
    <p style="margin:0;color:#D0362E;font-weight:700;font-size:14px">Ek chhota sa sawaal</p>
    <h1 style="margin:6px 0 10px;font-size:24px;line-height:1.2">Did your session with ${esc(b.mentorId?.name || 'your mentor')} happen?</h1>
    <p style="margin:0 0 6px;font-size:15px;color:#3D3830">${esc(b.serviceId?.title || '1:1 session')} · ${esc(when(b.startUtc))} IST</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3830">One tap, so we only pay mentors for sessions that took place.</p>
    <div style="text-align:center">${btn(link('yes'), 'Yes, it happened', '#14837E')}${btn(link('no'), 'No, it did not', '#D0362E')}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#5B544A">If something went wrong, choose "No" and our team will contact you. Booking ${esc(b.bookingRef)}.</p>
  </div></body></html>`;
}

/** Ask about every paid 1:1 call that ended recently and hasn't been asked yet. Safe to run on several servers. */
async function askDueSessions(now = new Date()) {
  const due = await UnicoachBooking.find({
    state: { $in: ASKABLE_STATES },
    amountPaid: { $gt: 0 },
    'payment.paymentId': { $nin: ['', null] },
    endUtc: { $lte: new Date(now - ASK_AFTER_MIN * 60000), $gte: new Date(now - ASK_WITHIN_DAYS * 86400000) },
    'sessionCheck.askedAt': null,
  }).select('_id').limit(50).lean();

  let sent = 0;
  for (const { _id } of due) {
    // Claim the booking first so two servers never email the same student
    const b = await UnicoachBooking.findOneAndUpdate(
      { _id, 'sessionCheck.askedAt': null },
      { $set: { 'sessionCheck.askedAt': new Date(), 'sessionCheck.token': crypto.randomBytes(24).toString('hex') } },
      { new: true }
    ).populate('mentorId', 'name').populate('serviceId', 'title');
    if (!b || !b.studentEmail) continue;
    try {
      await sendEmail({ kind: 'bookings', to: b.studentEmail, subject: `Did your session with ${b.mentorId?.name || 'your mentor'} happen?`, html: askEmailHtml(b) });
      sent += 1;
    } catch (err) {
      console.warn('[SessionCheck] email failed for', b.bookingRef, err.message);
    }
  }
  return sent;
}

/** Booking for a student's link, with what the page needs to show */
async function findByToken(token) {
  if (!/^[a-f0-9]{48}$/.test(String(token || ''))) return null;
  return UnicoachBooking.findOne({ 'sessionCheck.token': token })
    .populate('mentorId', 'name handle').populate('serviceId', 'title');
}

/** Save the student's answer. A "No" emails the team. Answers can't change once the mentor has been paid. */
async function recordAnswer(token, answer, note = '') {
  const b = await findByToken(token);
  if (!b) return { ok: false, status: 404, error: 'This link is not valid.' };
  const value = answer === 'yes' ? 'YES' : answer === 'no' ? 'NO' : null;
  if (!value) return { ok: false, status: 400, error: 'Choose yes or no.' };
  if (b.weeklyPayout?.payoutId) return { ok: false, status: 409, error: 'This session is already settled. Please contact the UniCoach team.' };

  const wasNo = b.sessionCheck?.studentAnswer === 'NO';
  const update = { studentAnswer: value, answeredAt: new Date(), note: String(note || '').trim().slice(0, 1000) };
  // Only these fields change; the paid check guards a payout recorded since the lookup
  const saved = await UnicoachBooking.updateOne(
    { _id: b._id, 'weeklyPayout.payoutId': null },
    { $set: Object.fromEntries(Object.entries(update).map(([k, v]) => [`sessionCheck.${k}`, v])) }
  );
  if (!saved.matchedCount) return { ok: false, status: 409, error: 'This session is already settled. Please contact the UniCoach team.' };
  Object.assign(b.sessionCheck, update);

  if (value === 'NO' && !wasNo) {
    sendEmail({
      kind: 'bookings',
      to: teamInbox(),
      subject: `Payout held: ${b.studentName} says the session with ${b.mentorId?.name || 'a mentor'} did not happen`,
      html: `<p><b>${esc(b.studentName)}</b> (${esc(b.studentEmail)}, ${esc(b.studentPhone)}) says their session did not happen.</p>
        <p>Mentor: ${esc(b.mentorId?.name)} (@${esc(b.mentorId?.handle)})<br>Service: ${esc(b.serviceId?.title)}<br>When: ${esc(when(b.startUtc))} IST<br>Booking: ${esc(b.bookingRef)} · paid ₹${esc(b.amountPaid)}</p>
        ${b.sessionCheck.note ? `<p>Student's note: ${esc(b.sessionCheck.note)}</p>` : ''}
        <p>The mentor's payout is on hold. Check with both sides, then release it or refund the student from Admin → Mentor Payouts.</p>`,
    }).catch((err) => console.warn('[SessionCheck] team alert failed:', err.message));
  }
  return { ok: true, booking: b };
}

let timer = null;
let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    const n = await askDueSessions();
    if (n) console.log(`[SessionCheck] asked ${n} student(s)`);
  } catch (err) {
    console.error('[SessionCheck] worker error:', err.message);
  } finally {
    running = false;
  }
}

/** Production only: local development shares the live database and must never email students */
function startWorker() {
  if (timer || process.env.NODE_ENV !== 'production' || process.env.DISABLE_SESSION_CHECK_WORKER === 'true') return;
  timer = setInterval(tick, TICK_MS);
  if (timer.unref) timer.unref();
  setTimeout(tick, 60 * 1000).unref?.();
}

module.exports = { askDueSessions, findByToken, recordAnswer, startWorker, askEmailHtml };
