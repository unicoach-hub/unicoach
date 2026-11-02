const riya = require('../services/riyaCalls');

// Vobiz callbacks for Riya on ElevenLabs (services/riyaCalls). Shared secret in ?key=, our call id in ?call=
const paramsOf = (req) => {
  const { key, call, ...query } = req.query || {};
  return { ...query, ...(req.body || {}) };
};

/** GET|POST /api/webhooks/riya/answer: XML that streams the call audio to our bridge */
exports.answer = async (req, res) => {
  if (!riya.secretMatches(req.query.key)) return res.status(401).type('text/plain').send('Unauthorized');
  try {
    const xml = await riya.answerCall(paramsOf(req), String(req.query.call || ''));
    return res.type('application/xml').send(xml);
  } catch (err) {
    console.error('[Riya] answer error:', err);
    return res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
  }
};

/** GET|POST /api/webhooks/riya/recording: Vobiz's recording of the call */
exports.recording = async (req, res) => {
  if (!riya.secretMatches(req.query.key)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await riya.recordRecording(paramsOf(req), String(req.query.call || ''));
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Riya] recording error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/** GET|POST /api/webhooks/riya/hangup */
exports.hangup = async (req, res) => {
  if (!riya.secretMatches(req.query.key)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await riya.recordHangup(paramsOf(req), String(req.query.call || ''));
    return res.json({ ok: true });
  } catch (err) {
    console.error('[Riya] hangup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
