// Emails to mentors about their application: received (pending verification), approved, rejected.
// Each has a button to the status page, where the mentor signs in and sees where things stand.
// Sending never blocks the request that triggered it.
const { sendEmail } = require('../../utils/email');
const escapeHtml = require('../../utils/escapeHtml');

const SITE = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
const statusUrl = () => `${SITE()}/unicoach/application-status`;

const layout = ({ heading, intro, body = '', button, buttonUrl, tone = '#DE5C2B' }) => `
<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0">
  <div style="text-align:center;margin-bottom:22px">
    <img src="https://www.unicoach.com/logo-black.png" alt="UniCoach" width="150" style="display:inline-block;width:150px;max-width:150px;height:auto;border:0;outline:none;text-decoration:none" />
    <p style="color:#64748b;font-size:13px;margin-top:4px;font-weight:600">Mentor Program</p>
  </div>
  <h2 style="color:#1e293b;font-size:20px;font-weight:700;margin:0 0 12px">${heading}</h2>
  <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">${intro}</p>
  ${body}
  <div style="text-align:center;margin:28px 0">
    <a href="${buttonUrl}" style="background:${tone};color:#ffffff;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:14px;display:inline-block">${button}</a>
  </div>
  <p style="color:#94a3b8;font-size:12px;line-height:1.5;border-top:1px solid #f1f5f9;padding-top:18px;text-align:center">
    Questions? Reply to this email or write to <a href="mailto:unicoachedu@gmail.com" style="color:#DE5C2B;text-decoration:none">unicoachedu@gmail.com</a>.
  </p>
</div>`;

const steps = (items) => `<table style="border-collapse:collapse;margin:0 0 8px">${items.map(([done, text]) => `
  <tr><td style="padding:5px 0;font-size:13px;color:${done ? '#0f172a' : '#94a3b8'};font-weight:${done ? 600 : 500}">
    <span style="display:inline-block;width:20px;color:${done ? '#16a34a' : '#cbd5e1'}">${done ? '&#10003;' : '&#9675;'}</span>${text}
  </td></tr>`).join('')}</table>`;

const send = (to, subject, html, what) => {
  if (!to) return;
  sendEmail({ to, subject, html, kind: 'mentors' }).catch((e) => console.warn(`[Mentor email] ${what} failed (non-blocking):`, e.message));
};

/** Right after a mentor applies */
const sendApplicationReceived = (mentor) => send(
  mentor.email,
  'We received your UniCoach mentor application',
  layout({
    heading: `Thank you for applying, ${escapeHtml(mentor.name)}! 🙌`,
    intro: 'Your mentor application is in. Our team checks every profile by hand to keep UniCoach trustworthy for students. This usually takes 1–3 working days.',
    body: steps([
      [true, 'Application submitted'],
      [false, 'Verification by the UniCoach team (pending)'],
      [false, 'Profile goes live with the verified badge'],
    ]) + `<p style="color:#475569;font-size:13px;line-height:1.6;margin:8px 0 0">Your handle: <strong>@${escapeHtml(mentor.handle)}</strong>. Sign in with <strong>${escapeHtml(mentor.email)}</strong> to check your status at any time.</p>`,
    button: 'Check my application status',
    buttonUrl: statusUrl(),
  }),
  'application received',
);

/** When the admin approves the mentor */
const sendApproved = (mentor) => send(
  mentor.email,
  'You are now a verified UniCoach mentor 🎉',
  layout({
    heading: `Congratulations, ${escapeHtml(mentor.name)}! 🎉`,
    intro: 'Your mentor profile is approved and verified. Students can now find you on the UniCoach marketplace and book sessions with you.',
    body: steps([
      [true, 'Application submitted'],
      [true, 'Verified by the UniCoach team'],
      [true, 'Profile is live'],
    ]) + `<p style="color:#475569;font-size:13px;line-height:1.6;margin:8px 0 0">Your public page: <a href="${SITE()}/@${encodeURIComponent(mentor.handle)}" style="color:#DE5C2B">${SITE().replace(/^https?:\/\//, '')}/@${escapeHtml(mentor.handle)}</a>. Next: open your dashboard, check your services and prices, and add your available slots.</p>`,
    button: 'Open my mentor dashboard',
    buttonUrl: `${SITE()}/unicoach/dashboard/${encodeURIComponent(mentor.handle)}`,
    tone: '#16a34a',
  }),
  'approved',
);

/** When the admin rejects the application */
const sendRejected = (mentor) => send(
  mentor.email,
  'An update on your UniCoach mentor application',
  layout({
    heading: `Hi ${escapeHtml(mentor.name)}, an update on your application`,
    intro: 'Thank you for your interest in mentoring on UniCoach. We were not able to approve your application this time.',
    body: mentor.rejectionReason
      ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin:0 0 8px"><p style="margin:0;color:#991b1b;font-size:13px;line-height:1.6"><strong>Reason:</strong> ${escapeHtml(mentor.rejectionReason)}</p></div>
         <p style="color:#475569;font-size:13px;line-height:1.6;margin:8px 0 0">If you can fix this (for example, upload a clearer student ID or offer letter), reply to this email and we will review it again.</p>`
      : '<p style="color:#475569;font-size:13px;line-height:1.6;margin:0">Reply to this email if you would like us to review it again.</p>',
    button: 'View my application status',
    buttonUrl: statusUrl(),
    tone: '#0f172a',
  }),
  'rejected',
);

/** Monday payout sent to the mentor's bank */
const sendPayoutPaid = (mentor, payout, bookings) => send(
  mentor.email,
  `₹${payout.amountINR} sent to your bank (${payout.payoutRef})`,
  layout({
    heading: 'Your payout is on its way',
    intro: `Hi ${escapeHtml(mentor.name || 'there')}, we have sent <b>₹${payout.amountINR}</b> to your bank account for ${bookings.length} completed booking${bookings.length === 1 ? '' : 's'}.`,
    body: `<p style="color:#475569;font-size:14px;line-height:1.6">Payout reference: <b>${escapeHtml(payout.payoutRef)}</b>${payout.transactionRef ? `<br/>Bank reference (UTR): <b>${escapeHtml(payout.transactionRef)}</b>` : ''}<br/>Bookings: ${bookings.map((b) => escapeHtml(b.bookingRef)).join(', ')}</p>
<p style="color:#475569;font-size:14px;line-height:1.6">Bank transfers usually show up within a few hours. You can see every payout under Earnings in your mentor dashboard.</p>`,
    button: 'Open Earnings',
    buttonUrl: `${SITE()}/unicoach/dashboard`,
  }),
  'payout paid',
);

module.exports = { sendApplicationReceived, sendApproved, sendRejected, sendPayoutPaid };
