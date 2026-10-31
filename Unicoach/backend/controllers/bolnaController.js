const crypto = require('crypto');
const { recordExecution } = require('../services/bolnaCalls');

// Bolna has no signature, so the agent's webhook sends a custom header: x-unicoach-secret: <BOLNA_WEBHOOK_SECRET>
const secretMatches = (given) => {
  const expected = process.env.BOLNA_WEBHOOK_SECRET || '';
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(expected);
  return expected.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * POST /api/webhooks/bolna
 * Bolna posts here on every status change of a call (outbound and inbound). Always answers 200 for
 * a valid secret, so Bolna does not retry a payload we chose to ignore.
 */
exports.receiveWebhook = async (req, res) => {
  if (!secretMatches(req.get('x-unicoach-secret'))) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = req.body || {};
    if (!payload.id || !payload.status) return res.status(200).json({ ok: true, ignored: 'no execution' });

    const { lead } = await recordExecution(payload);
    return res.status(200).json({ ok: true, lead: lead ? String(lead._id) : null });
  } catch (err) {
    console.error('[Bolna] webhook error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
