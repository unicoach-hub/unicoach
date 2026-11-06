// backend/utils/teamAlert.js - One email to the UniCoach team for every new response on the website
// (forms, consultation bookings, support requests, event sign-ups, new accounts, mentor applications).
// The inbox is TEAM_ALERT_EMAIL (comma-separated for more than one person), default sagar@visawebs.com.
// Never throws and never delays the student's request.
const { sendEmail } = require('./email');
const { escapeHtml } = require('./escapeHtml');

const teamInbox = () => process.env.TEAM_ALERT_EMAIL || 'sagar@visawebs.com';
const adminUrl = () => (process.env.ADMIN_URL || 'https://admin.unicoach.com').replace(/\/+$/, '');

const istNow = () => new Date().toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
});

/**
 * @param {object} a
 * @param {string} a.subject   email subject, e.g. "Naya lead: Rahul (Check Eligibility)"
 * @param {string} a.heading   first line inside the email
 * @param {object} a.details   label → value; empty values are skipped
 * @param {string} [a.adminPath] admin page to open, e.g. '/crm/leads'
 * @param {string} [a.replyTo] the student's email, so replying goes straight to them
 */
function sendTeamAlert({ subject, heading, details = {}, adminPath, replyTo }) {
  try {
    const rows = Object.entries(details)
      .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .map(([k, v]) => `<tr>
        <td style="padding:7px 12px;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
        <td style="padding:7px 12px;color:#0f172a;font-size:13px;font-weight:600;white-space:pre-line">${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v))}</td>
      </tr>`).join('');
    const button = adminPath
      ? `<p style="margin:22px 0 0"><a href="${adminUrl()}${adminPath}" style="background:#DE5C2B;color:#fff;font-weight:700;text-decoration:none;padding:11px 22px;border-radius:10px;font-size:14px;display:inline-block">Admin mein kholo →</a></p>`
      : '';
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px">
      <p style="margin:0 0 4px;color:#DE5C2B;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Website alert · ${istNow()}</p>
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:19px">${escapeHtml(heading)}</h2>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px">${rows}</table>
      ${button}
      ${replyTo ? '<p style="margin:18px 0 0;color:#94a3b8;font-size:12px">Is email ka reply seedha student ko jaayega.</p>' : ''}
    </div>`;
    sendEmail({
      kind: 'updates',
      to: teamInbox(),
      subject: String(subject).replace(/[\r\n]+/g, ' ').slice(0, 180),
      html,
      ...(replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? { replyTo } : {}),
    }).catch((e) => console.warn('[TeamAlert] email failed:', e.message));
  } catch (e) {
    console.warn('[TeamAlert] skipped:', e.message);
  }
}

module.exports = { sendTeamAlert, teamInbox };
