// What happened to the emails we sent: Resend calls this when one is delivered, opened, clicked,
// delayed, bounced or marked as spam. Each event is matched to its EmailLog row by Resend's own
// message id, so the row keeps the whole story long after Resend's 30-day logs are gone.
//
// Resend signs with Svix headers (svix-id, svix-timestamp, svix-signature) over the raw body,
// using the signing secret from the Resend dashboard (RESEND_WEBHOOK_SECRET, "whsec_…").
const crypto = require('crypto');
const EmailLog = require('../models/EmailLog');
const Lead = require('../models/Lead');

const TOLERANCE_SEC = 5 * 60;

// How far along the delivery an event is. A later event never moves the row backwards.
const RANK = { sent: 0, delayed: 1, delivered: 2, opened: 3, clicked: 4 };
// Problems always win, whatever came before
const PROBLEMS = new Set(['bounced', 'complained', 'failed']);

const STATUS_BY_EVENT = {
  'email.sent': 'sent',
  'email.scheduled': 'sent',
  'email.delivery_delayed': 'delayed',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.failed': 'failed',
};

/** True when the Svix signature on this request really comes from our Resend webhook. */
function signatureValid(req, secret) {
  const id = req.get('svix-id');
  const timestamp = req.get('svix-timestamp');
  const header = req.get('svix-signature');
  if (!id || !timestamp || !header) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SEC) return false;

  const body = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
  const key = Buffer.from(String(secret).replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');

  // the header holds one or more space-separated "v1,<signature>" pairs
  return String(header).split(' ').some((part) => {
    const sig = part.split(',')[1];
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

/** A bounce or a spam complaint says something about the lead, not just the email. */
async function markLead(email, status) {
  if (!email) return;
  const lead = await Lead.findOne({ email: String(email).toLowerCase().trim() });
  if (!lead) return;
  if (status === 'bounced' && !lead.tags.includes('email-bounced')) lead.tags.push('email-bounced');
  if (status === 'complained') {
    lead.unsubscribed = true;
    lead.unsubscribedAt = new Date();
    if (!lead.tags.includes('email-spam-complaint')) lead.tags.push('email-spam-complaint');
  }
  lead.activities.push({
    type: 'email',
    comment: status === 'bounced' ? 'Email bounced — the address does not accept our mail' : 'Marked our email as spam — unsubscribed',
    performedBy: 'Resend',
  });
  lead.$locals.skipWorkflowTriggers = true;
  await lead.save();
}

exports.receiveWebhook = async (req, res) => {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Webhook secret is not set' });
  if (!signatureValid(req, secret)) return res.status(401).json({ error: 'Bad signature' });

  // Answer Resend straight away; a slow handler makes it retry.
  res.json({ received: true });

  try {
    const type = req.body?.type;
    const data = req.body?.data || {};
    const status = STATUS_BY_EVENT[type];
    if (!status || !data.email_id) return;

    const at = req.body?.created_at ? new Date(req.body.created_at) : new Date();
    const info = data.bounce?.message || data.bounce?.subType || data.click?.link || '';
    const log = await EmailLog.findOne({ providerMessageId: data.email_id });

    if (!log) {
      // An email sent before this log existed (or by something else on the same Resend account)
      await EmailLog.create({
        to: [].concat(data.to || [])[0] || '',
        recipients: [].concat(data.to || []),
        subject: data.subject || '',
        provider: 'resend',
        providerMessageId: data.email_id,
        status,
        error: PROBLEMS.has(status) ? String(info).slice(0, 300) : '',
        events: [{ type: status, at, info: String(info).slice(0, 200) }],
        at,
      });
    } else {
      log.events.push({ type: status, at, info: String(info).slice(0, 200) });
      const forward = (RANK[status] ?? -1) > (RANK[log.status] ?? -1);
      if (PROBLEMS.has(status) || (forward && !PROBLEMS.has(log.status))) {
        log.status = status;
        if (PROBLEMS.has(status)) log.error = String(info).slice(0, 300);
      }
      await log.save();
    }

    if (PROBLEMS.has(status) && status !== 'failed') {
      await markLead([].concat(data.to || [])[0], status);
    }
  } catch (err) {
    console.error('[Resend webhook] could not record the event:', err.message);
  }
};

exports.signatureValid = signatureValid;
