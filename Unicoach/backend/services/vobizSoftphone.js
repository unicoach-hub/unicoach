const crypto = require('crypto');
const AiCall = require('../models/AiCall');
const Lead = require('../models/Lead');
const SoftphoneEndpoint = require('../models/SoftphoneEndpoint');
const { normalizePhone } = require('../utils/twilio');

/**
 * Team softphone on Vobiz (second number, separate from Riya's): each admin-panel user gets a Vobiz
 * SIP endpoint and calls from the browser (vobiz-webrtc-sdk). Vobiz asks our Answer URL what to do:
 *  - a call from a browser endpoint → dial the student's number, caller ID = the team number
 *  - a call to the team number → ring every team endpoint
 * Every call is recorded (and transcribed by Vobiz) and logged as an AiCall with kind 'human'.
 *
 * Server env: VOBIZ_AUTH_ID, VOBIZ_AUTH_TOKEN, VOBIZ_APP_ID (the Vobiz application whose Answer URL
 * points here), VOBIZ_TEAM_NUMBER (E.164), VOBIZ_WEBHOOK_SECRET (16+ chars, sent as ?key= by Vobiz),
 * API_PUBLIC_URL (default https://api.unicoach.com) for the callback URLs we hand to Vobiz.
 */

const VOBIZ_API = 'https://api.vobiz.ai/api/v1';
const SIP_DOMAIN = 'registrar.vobiz.ai';

const env = () => ({
  authId: process.env.VOBIZ_AUTH_ID || '',
  authToken: process.env.VOBIZ_AUTH_TOKEN || '',
  appId: process.env.VOBIZ_APP_ID || '',
  teamNumber: process.env.VOBIZ_TEAM_NUMBER || '',
  secret: process.env.VOBIZ_WEBHOOK_SECRET || '',
  publicUrl: (process.env.API_PUBLIC_URL || 'https://api.unicoach.com').replace(/\/$/, ''),
});

const isConfigured = () => {
  const e = env();
  return Boolean(e.authId && e.authToken && e.appId && e.teamNumber && e.secret.length >= 16);
};

class SoftphoneError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const authHeaders = () => ({ 'X-Auth-ID': env().authId, 'X-Auth-Token': env().authToken });

async function vobizRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${VOBIZ_API}/Account/${encodeURIComponent(env().authId)}${path}`, {
    method,
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new SoftphoneError(`Vobiz ${res.status}: ${String(data.message || data.error || JSON.stringify(data)).slice(0, 200)}`, 502);
  return data;
}

/* ───────────────────────── Endpoints (one per admin user) ───────────────────────── */

const ownerKey = (req) => (req.user?.role === 'staff' ? `staff:${req.staff?._id || req.user.id}` : `admin:${req.user?.id}`);

// SIP username/password for the signed-in user, created on Vobiz the first time
async function getOrCreateEndpoint(req, displayName) {
  if (!isConfigured()) throw new SoftphoneError('The softphone is not set up on the server yet', 503);
  const owner = ownerKey(req);
  const existing = await SoftphoneEndpoint.findOne({ owner }).lean();
  if (existing) return existing;

  const username = `uc${crypto.randomBytes(4).toString('hex')}`;
  const password = `${crypto.randomBytes(9).toString('base64url')}A1`;
  const created = await vobizRequest('/Endpoint/', {
    method: 'POST',
    body: { username, password, alias: String(displayName || 'Unicoach team').slice(0, 40), application: env().appId },
  });
  return SoftphoneEndpoint.create({
    owner,
    name: String(displayName || '').slice(0, 80),
    // Vobiz may add a suffix to the username, like Plivo does; keep the one it returns
    username: created.username || username,
    password,
    endpointId: String(created.endpoint_id || created.id || ''),
  });
}

/* ───────────────────────── Answer URL → XML ───────────────────────── */

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

// "sip:+919812345678@registrar.vobiz.ai" → "+919812345678"; "919812345678" → "+919812345678"
const numberFrom = (value) => {
  const raw = String(value || '').replace(/^sips?:/i, '').split('@')[0];
  const digits = raw.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 10 ? normalizePhone(digits) : '';
};

const sipUser = (value) => {
  const m = /^sips?:([^@]+)@/i.exec(String(value || ''));
  return m ? m[1] : '';
};

const callbackUrl = (path) => `${env().publicUrl}/api/webhooks/vobiz/${path}?key=${encodeURIComponent(env().secret)}`;

const recordXml = () => `<Record recordSession="true" fileFormat="mp3" maxLength="7200" playBeep="false" `
  + `callbackUrl="${xmlEscape(callbackUrl('recording'))}" callbackMethod="POST" `
  + `transcriptionType="auto" transcriptionUrl="${xmlEscape(callbackUrl('transcription'))}" transcriptionMethod="POST"/>`;

const findLeadByPhone = (phone) => (phone ? Lead.findOne({ phone }).sort({ createdAt: -1 }).select('_id name phone').lean() : null);

/**
 * Build the XML answer for one Vobiz call and log the call.
 * @param {object} p  Vobiz request params (From, To, CallUUID, X-PH-LeadId, ...)
 * @returns {Promise<string>} XML
 */
async function answerCall(p) {
  const { teamNumber } = env();
  const callUuid = String(p.CallUUID || p.call_uuid || '');
  const fromUser = sipUser(p.From);

  // Outgoing: a team member dialled from the browser
  if (fromUser) {
    const endpoint = await SoftphoneEndpoint.findOne({ username: fromUser }).lean();
    const to = numberFrom(p.To);
    if (!endpoint || !/^\+91\d{10}$/.test(to)) {
      return '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup reason="rejected"/></Response>';
    }
    const leadIdHeader = String(p['X-PH-LeadId'] || p['X-PH-Leadid'] || p['X-Ph-Leadid'] || '');
    const lead = /^[a-f0-9]{24}$/i.test(leadIdHeader)
      ? await Lead.findById(leadIdHeader).select('_id name phone').lean()
      : await findLeadByPhone(to);
    if (callUuid) {
      await AiCall.updateOne({ executionId: callUuid }, {
        $setOnInsert: {
          executionId: callUuid, kind: 'human', direction: 'outbound', trigger: 'softphone', phone: to,
          name: lead?.name || '', leadId: lead?._id, staffName: endpoint.name, requestedBy: endpoint.name, status: 'ringing',
        },
      }, { upsert: true });
    }
    return '<?xml version="1.0" encoding="UTF-8"?><Response>'
      + recordXml()
      + `<Dial callerId="${xmlEscape(teamNumber)}" timeout="45" callbackUrl="${xmlEscape(callbackUrl('dial'))}" callbackMethod="POST">`
      + `<Number>${xmlEscape(to)}</Number></Dial></Response>`;
  }

  // Incoming: someone called the team number → ring everyone's softphone
  const from = numberFrom(p.From);
  const endpoints = await SoftphoneEndpoint.find().select('username').lean();
  const lead = await findLeadByPhone(from);
  if (callUuid) {
    await AiCall.updateOne({ executionId: callUuid }, {
      $setOnInsert: {
        executionId: callUuid, kind: 'human', direction: 'inbound', trigger: 'softphone', phone: from,
        name: lead?.name || '', leadId: lead?._id, requestedBy: 'Caller', status: 'ringing',
      },
    }, { upsert: true });
  }
  if (!endpoints.length) return '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup reason="busy"/></Response>';
  const users = endpoints.map((e) => `<User>sip:${xmlEscape(e.username)}@${SIP_DOMAIN}</User>`).join('');
  return '<?xml version="1.0" encoding="UTF-8"?><Response>'
    + recordXml()
    + `<Dial timeout="30" callbackUrl="${xmlEscape(callbackUrl('dial'))}" callbackMethod="POST">${users}</Dial></Response>`;
}

/* ───────────────────────── Callbacks ───────────────────────── */

// Dial events: who picked up an incoming call
async function recordDialEvent(p) {
  const callUuid = String(p.CallUUID || '');
  if (!callUuid) return;
  const event = String(p.DialAction || p.DialBLegStatus || p.Event || '').toLowerCase();
  const user = sipUser(p.DialBLegTo || p.DialBLegUUIDTo || '');
  if (!user || !/answer/.test(event)) return;
  const endpoint = await SoftphoneEndpoint.findOne({ username: user }).select('name').lean();
  if (endpoint) await AiCall.updateOne({ executionId: callUuid, staffName: '' }, { $set: { staffName: endpoint.name, status: 'in-progress' } });
}

// Application hangup URL: final status and length; notes the call on the lead
async function recordHangup(p) {
  const callUuid = String(p.CallUUID || '');
  if (!callUuid) return null;
  const call = await AiCall.findOne({ executionId: callUuid });
  if (!call || call.endedAt) return call;

  const seconds = Math.round(Number(p.BillDuration || p.Duration || 0)) || 0;
  const cause = String(p.HangupCause || p.HangupCauseName || '').toLowerCase();
  call.durationSec = seconds;
  call.status = seconds > 0 ? 'completed' : /busy/.test(cause) ? 'busy' : /no.?answer|timeout|cancel/.test(cause) ? 'no-answer' : 'failed';
  call.endedAt = new Date();
  await call.save();

  if (call.leadId) {
    const minutes = seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds}s`;
    const who = call.staffName || 'Team';
    const text = call.direction === 'inbound'
      ? (seconds > 0 ? `Called the team number, answered by ${who} (${minutes})` : 'Called the team number, nobody answered')
      : (seconds > 0 ? `Called by ${who} from the admin softphone (${minutes})` : `${who} called from the admin softphone, not answered (${call.status})`);
    await Lead.updateOne({ _id: call.leadId }, {
      $push: { activities: { type: 'call', comment: text, date: new Date(), performedBy: who } },
      ...(seconds > 0 ? { $set: { phoneCall: 'done' } } : {}),
    });
  }
  return call;
}

async function recordRecording(p) {
  const callUuid = String(p.CallUUID || p.call_uuid || '');
  const url = String(p.RecordUrl || p.record_url || p.recording_url || '');
  if (!callUuid || !url) return;
  await AiCall.updateOne({ executionId: callUuid }, {
    $set: { recordingUrl: url, recordingId: String(p.RecordingID || p.recording_id || '') },
  });
}

async function recordTranscription(p) {
  const text = String(p.transcription || p.Transcription || p.text || p.transcript || '').trim();
  const callUuid = String(p.call_uuid || p.CallUUID || '');
  const recordingId = String(p.recording_id || p.RecordingID || '');
  if (!text || (!callUuid && !recordingId)) {
    console.warn('[Vobiz] transcription callback not understood:', Object.keys(p).join(', '));
    return;
  }
  const filter = callUuid ? { executionId: callUuid } : { recordingId };
  await AiCall.updateOne(filter, { $set: { transcript: text.slice(0, 100000) } });
}

/** Stream a Vobiz recording (Vobiz wants the account headers, the browser can't send them). */
async function fetchRecording(url) {
  if (!/^https:\/\/[a-z0-9.-]*vobiz\.ai\//i.test(url)) throw new SoftphoneError('Not a Vobiz recording', 400);
  const res = await fetch(url, { headers: authHeaders(), signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new SoftphoneError(`Vobiz recording ${res.status}`, 502);
  return res;
}

const secretMatches = (given) => {
  const expected = env().secret;
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(expected);
  return expected.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = {
  isConfigured,
  getOrCreateEndpoint,
  answerCall,
  recordDialEvent,
  recordHangup,
  recordRecording,
  recordTranscription,
  fetchRecording,
  secretMatches,
  numberFrom,
  SoftphoneError,
  SIP_DOMAIN,
};
