const crypto = require('crypto');
const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { applyCallResult } = require('../services/bolnaCalls');

// Bolna has no signature, so the agent's webhook sends a custom header: x-unicoach-secret: <BOLNA_WEBHOOK_SECRET>
const secretMatches = (given) => {
  const expected = process.env.BOLNA_WEBHOOK_SECRET || '';
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(expected);
  return expected.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Outbound calls carry our lead_id; inbound calls are matched by the caller's number
async function findLead(payload) {
  const leadId = payload.context_details?.recipient_data?.lead_id;
  if (leadId && /^[a-f0-9]{24}$/i.test(String(leadId))) {
    const lead = await Lead.findById(leadId);
    if (lead) return lead;
  }
  if (payload.id) {
    const lead = await Lead.findOne({ 'aiCall.executionId': String(payload.id) });
    if (lead) return lead;
  }
  const isInbound = payload.telephony_data?.call_type === 'inbound';
  const phone = normalizePhone(String((isInbound ? payload.telephony_data?.from_number : payload.telephony_data?.to_number) || payload.user_number || ''));
  if (!/^\+\d{11,14}$/.test(phone)) return null;
  return Lead.findOne({ phone }).sort({ createdAt: -1 });
}

/**
 * POST /api/webhooks/bolna
 * Bolna posts here on every status change of a call. Always answers 200 for a valid secret,
 * so Bolna does not retry a payload we chose to ignore.
 */
exports.receiveWebhook = async (req, res) => {
  if (!secretMatches(req.get('x-unicoach-secret'))) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = req.body || {};
    if (!payload.id || !payload.status) return res.status(200).json({ ok: true, ignored: 'no execution' });

    const lead = await findLead(payload);
    if (!lead) {
      console.warn(`[Bolna] no lead for execution ${payload.id} (${payload.status})`);
      return res.status(200).json({ ok: true, ignored: 'no lead' });
    }

    if (applyCallResult(lead, payload)) await lead.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[Bolna] webhook error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
