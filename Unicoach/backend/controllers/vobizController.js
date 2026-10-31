const { Readable } = require('stream');
const AiCall = require('../models/AiCall');
const { scopedStaffId } = require('../utils/leadAccess');
const Lead = require('../models/Lead');
const vobiz = require('../services/vobizSoftphone');

// Vobiz sends form params (POST) or query params (GET); the shared secret comes as ?key=
const paramsOf = (req) => {
  const { key, ...query } = req.query || {};
  return { ...query, ...(req.body || {}) };
};

const HANDLERS = {
  dial: vobiz.recordDialEvent,
  hangup: vobiz.recordHangup,
  recording: vobiz.recordRecording,
  transcription: vobiz.recordTranscription,
};

/** GET|POST /api/webhooks/vobiz/answer: XML telling Vobiz how to connect the call */
exports.answer = async (req, res) => {
  if (!vobiz.secretMatches(req.query.key)) return res.status(401).type('text/plain').send('Unauthorized');
  try {
    const xml = await vobiz.answerCall(paramsOf(req));
    return res.type('application/xml').send(xml);
  } catch (err) {
    console.error('[Vobiz] answer error:', err);
    return res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>');
  }
};

/** GET|POST /api/webhooks/vobiz/:event  (dial, hangup, recording, transcription) */
exports.callback = async (req, res) => {
  if (!vobiz.secretMatches(req.query.key)) return res.status(401).json({ error: 'Unauthorized' });
  const handler = HANDLERS[req.params.event];
  if (!handler) return res.status(404).json({ error: 'Unknown event' });
  try {
    await handler(paramsOf(req));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(`[Vobiz] ${req.params.event} error:`, err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/** GET /api/admin/softphone/me: SIP login for the signed-in user's browser softphone */
exports.myEndpoint = async (req, res) => {
  try {
    if (!vobiz.isConfigured()) return res.json({ enabled: false });
    const name = req.user?.role === 'staff' ? req.staff?.name || 'Staff' : req.user?.name || 'Admin';
    const ep = await vobiz.getOrCreateEndpoint(req, name);
    return res.json({
      enabled: true,
      username: ep.username,
      password: ep.password,
      teamNumber: process.env.VOBIZ_TEAM_NUMBER || '',
    });
  } catch (err) {
    if (err instanceof vobiz.SoftphoneError) return res.status(err.status).json({ message: err.message });
    console.error('[Softphone] endpoint error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/** GET /api/admin/ai-calls/:id/recording: plays a softphone recording through the server */
exports.streamRecording = async (req, res) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return res.status(404).json({ message: 'Not found' });
    const filter = { _id: req.params.id };
    const staffId = scopedStaffId(req);
    if (staffId) filter.leadId = { $in: await Lead.find({ assignedTo: staffId }).distinct('_id') };
    const call = await AiCall.findOne(filter).select('recordingUrl kind').lean();
    if (!call?.recordingUrl) return res.status(404).json({ message: 'No recording' });
    if (call.kind !== 'human') return res.redirect(call.recordingUrl);

    const upstream = await vobiz.fetchRecording(call.recordingUrl);
    res.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    res.set('Cache-Control', 'private, max-age=3600');
    return Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    if (err instanceof vobiz.SoftphoneError) return res.status(err.status).json({ message: err.message });
    console.error('[Softphone] recording error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
