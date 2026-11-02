const crypto = require('crypto');
const { WebSocket, WebSocketServer } = require('ws');
const AiCall = require('../models/AiCall');
const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { fromPhone, toPhone } = require('../utils/audioCodec');

/**
 * Riya on ElevenLabs Agents, over our own Vobiz number (no SIP trunk, no ElevenLabs India residency):
 *
 *   student's phone ⇄ Vobiz ⇄ <Stream> WebSocket ⇄ this server ⇄ ElevenLabs agent WebSocket
 *
 *  - Outbound: queueCall (bolnaCalls) creates an AiCall with status 'scheduled'. The worker dials it
 *    through the Vobiz Call API when it is due (inside calling hours, a few at a time).
 *  - Inbound: Riya's number on Vobiz has an application whose Answer URL is /api/webhooks/riya/answer.
 *  - Vobiz answers → our XML opens a bidirectional μ-law stream to /api/ws/riya → we open the
 *    ElevenLabs conversation with the student's details as dynamic variables and pass audio both ways.
 *  - When the call ends we read the conversation back from ElevenLabs (transcript, summary, data
 *    collection) and hand it to bolnaCalls.recordExecution, which updates the AiCall and the lead
 *    exactly like a Bolna call.
 *
 * Server env: ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID (default for admin → AI Calls → Settings),
 * VOBIZ_AUTH_ID, VOBIZ_AUTH_TOKEN, VOBIZ_WEBHOOK_SECRET (16+ chars), API_PUBLIC_URL,
 * RIYA_MAX_CONCURRENT (calls at once, default 4: keep it at or under the ElevenLabs plan's limit).
 * Riya's caller number is the "Caller number" in admin settings (or BOLNA_FROM_NUMBER).
 */

const ELEVEN_API = 'https://api.elevenlabs.io';
const VOBIZ_API = 'https://api.vobiz.ai/api/v1';
const WS_PATH = '/api/ws/riya';

const TICK_MS = 15000;
const RING_TIMEOUT_SEC = 40;
const MAX_CALL_SEC = 900;
const RETRY_MINUTES = [60, 240]; // after a no-answer / busy: 2 more tries
const FINALIZE_DELAYS_MS = [8000, 20000, 45000, 90000, 180000]; // ElevenLabs needs a moment for the analysis

// Spoken to callers we don't know yet (the agent's own first message asks for {{name}})
const INBOUND_FIRST_MESSAGE = 'नमस्ते, UniCoach से रिया बोल रही हूँ. बताइए, मैं आपकी क्या मदद कर सकती हूँ?';

const env = () => ({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  vobizId: process.env.VOBIZ_AUTH_ID || '',
  vobizToken: process.env.VOBIZ_AUTH_TOKEN || '',
  secret: process.env.VOBIZ_WEBHOOK_SECRET || '',
  publicUrl: (process.env.API_PUBLIC_URL || 'https://api.unicoach.com').replace(/\/$/, ''),
  maxConcurrent: Math.min(Math.max(parseInt(process.env.RIYA_MAX_CONCURRENT, 10) || 4, 1), 50),
});

const isConfigured = () => {
  const e = env();
  return Boolean(e.apiKey && e.vobizId && e.vobizToken && e.secret.length >= 16);
};

// Lazy: bolnaCalls requires this file for queueCall
const shared = () => require('./bolnaCalls');

const log = (...args) => console.log('[Riya]', ...args);
const warn = (...args) => console.warn('[Riya]', ...args);

/* ───────────────────────── HTTP helpers ───────────────────────── */

async function elevenRequest(path, { method = 'GET', body, raw = false } = {}) {
  const res = await fetch(`${ELEVEN_API}${path}`, {
    method,
    headers: { 'xi-api-key': env().apiKey, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(raw ? 30000 : 10000),
  });
  if (raw) {
    if (!res.ok) throw new (shared().CallError)(`ElevenLabs ${res.status}`, 502);
    return res;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail?.message || data.detail || data.message || JSON.stringify(data);
    throw new (shared().CallError)(`ElevenLabs ${res.status}: ${String(typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 200)}`, 502);
  }
  return data;
}

async function vobizRequest(path, { method = 'GET', body } = {}) {
  const e = env();
  const res = await fetch(`${VOBIZ_API}/Account/${encodeURIComponent(e.vobizId)}${path}`, {
    method,
    headers: { 'X-Auth-ID': e.vobizId, 'X-Auth-Token': e.vobizToken, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new (shared().CallError)(`Vobiz ${res.status}: ${String(data.message || data.error || JSON.stringify(data)).slice(0, 200)}`, 502);
  return data;
}

const secretMatches = (given) => {
  const expected = env().secret;
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(expected);
  return expected.length >= 16 && a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Per-call token for the stream URL, so the WebSocket can't be opened for a call that isn't live
const streamToken = (callId) => crypto.createHmac('sha256', env().secret).update(`stream:${callId}`).digest('hex').slice(0, 32);

const tokenMatches = (callId, given) => {
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(streamToken(callId));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const webhookUrl = (path, callId) => {
  const e = env();
  const q = new URLSearchParams({ key: e.secret });
  if (callId) q.set('call', String(callId));
  return `${e.publicUrl}/api/webhooks/riya/${path}?${q}`;
};

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

/* ───────────────────────── Creating calls ───────────────────────── */

/**
 * Store an outbound call for the worker (called by bolnaCalls.queueCall when the provider is ElevenLabs).
 * @returns {Promise<object>} the AiCall document
 */
async function createCall({ lead, to, userData, trigger, requestedBy, scheduledAt, config }) {
  if (!isConfigured()) {
    throw new (shared().CallError)('Riya on ElevenLabs is not set up: ELEVENLABS_API_KEY, VOBIZ_AUTH_ID, VOBIZ_AUTH_TOKEN and VOBIZ_WEBHOOK_SECRET are needed', 503);
  }
  if (!config.elevenAgentId) throw new (shared().CallError)('Add the ElevenLabs agent ID in AI Calls → Settings (or ELEVENLABS_AGENT_ID)', 503);
  if (!config.fromNumber) throw new (shared().CallError)("Add Riya's caller number in AI Calls → Settings", 503);

  const call = await AiCall.create({
    executionId: `riya_${crypto.randomBytes(10).toString('hex')}`,
    provider: 'elevenlabs',
    leadId: lead?._id,
    direction: 'outbound',
    trigger,
    phone: to,
    name: String(lead?.name || userData.name || '').trim(),
    agentId: config.elevenAgentId,
    status: 'scheduled',
    customInstructions: userData.custom_instructions || '',
    dynamicVars: userData,
    requestedBy,
    scheduledFor: scheduledAt || new Date(),
  });
  // Calls due now go out right away instead of on the next tick
  if (!scheduledAt || scheduledAt.getTime() <= Date.now() + 5000) setImmediate(() => tick().catch(() => {}));
  return call;
}

/* ───────────────────────── Worker: dial due calls ───────────────────────── */

const LIVE_STATUSES = ['dialing', 'ringing', 'in-progress'];

async function dial(call, config) {
  const data = await vobizRequest('/Call/', {
    method: 'POST',
    body: {
      from: config.fromNumber,
      to: call.phone,
      answer_url: webhookUrl('answer', call._id),
      answer_method: 'POST',
      hangup_url: webhookUrl('hangup', call._id),
      hangup_method: 'POST',
      ring_timeout: RING_TIMEOUT_SEC,
      time_limit: MAX_CALL_SEC,
    },
  });
  const requestUuid = String(data.request_uuid || data.requestUuid || '');
  await AiCall.updateOne({ _id: call._id }, { $set: { status: 'ringing', vobizRequestUuid: requestUuid } });
  log(`dialing ${call.phone} (${call._id})`);
}

let running = false;
async function tick() {
  if (running || !isConfigured()) return;
  running = true;
  try {
    const config = await shared().getConfig();
    const now = new Date();

    // Calls that never got a hangup callback (server restarted mid-call, Vobiz lost it)
    await AiCall.updateMany(
      { provider: 'elevenlabs', status: { $in: ['dialing', 'ringing'] }, updatedAt: { $lt: new Date(now - 10 * 60000) } },
      { $set: { status: 'failed', error: 'No answer or hangup event from Vobiz', endedAt: now } },
    );
    const stuck = await AiCall.find({
      provider: 'elevenlabs', status: 'in-progress', conversationId: { $ne: '' }, updatedAt: { $lt: new Date(now - (MAX_CALL_SEC + 300) * 1000) },
    }).limit(5);
    for (const c of stuck) await finalize(c._id).catch((err) => warn('finalize stuck call:', err.message));

    const live = await AiCall.countDocuments({ provider: 'elevenlabs', status: { $in: LIVE_STATUSES }, updatedAt: { $gte: new Date(now - 20 * 60000) } });
    let free = env().maxConcurrent - live;
    if (free <= 0) return;

    const due = await AiCall.find({ provider: 'elevenlabs', status: 'scheduled', scheduledFor: { $lte: now } })
      .sort({ scheduledFor: 1 }).limit(free * 2);
    for (const call of due) {
      if (free <= 0) break;
      // Auto calls and retries wait for calling hours; a time the team picked is kept
      const holdForWindow = call.trigger === 'auto' || call.attempts > 0;
      if (holdForWindow && !shared().isWithinWindow(now, config)) {
        await AiCall.updateOne({ _id: call._id, status: 'scheduled' }, { $set: { scheduledFor: shared().nextCallTime(now, config) } });
        continue;
      }
      const claimed = await AiCall.findOneAndUpdate(
        { _id: call._id, status: 'scheduled' },
        { $set: { status: 'dialing' }, $inc: { attempts: 1 } },
        { new: true },
      );
      if (!claimed) continue; // another server took it
      free -= 1;
      try {
        await dial(claimed, config);
      } catch (err) {
        warn(`dial ${claimed.phone} failed:`, err.message);
        await finishUnanswered(claimed, 'failed', err.message);
      }
    }
  } catch (err) {
    warn('worker error:', err.message);
  } finally {
    running = false;
  }
}

let timer = null;
function startWorker() {
  if (timer || process.env.DISABLE_RIYA_WORKER === 'true') return;
  timer = setInterval(() => tick().catch(() => {}), TICK_MS);
  if (timer.unref) timer.unref();
}

/* ───────────────────────── Vobiz callbacks ───────────────────────── */

const numberFrom = (value) => {
  const raw = String(value || '').replace(/^sips?:/i, '').split('@')[0];
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 ? normalizePhone(digits) : '';
};

const hangupXml = '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>';

/**
 * Answer URL: outbound calls carry ?call=<AiCall id>; a call without it is a student calling Riya's number.
 * @returns {Promise<string>} XML that opens the audio stream to our bridge
 */
async function answerCall(p, callId) {
  const callUuid = String(p.CallUUID || p.call_uuid || '');
  let call = null;

  if (callId && /^[a-f0-9]{24}$/i.test(callId)) {
    call = await AiCall.findOneAndUpdate(
      { _id: callId, provider: 'elevenlabs' },
      { $set: { status: 'in-progress', vobizCallUuid: callUuid } },
      { new: true },
    );
    if (!call) return hangupXml;
  } else {
    const config = await shared().getConfig();
    if (!config.elevenAgentId) return hangupXml;
    const from = numberFrom(p.From || p.from);
    const lead = /^\+\d{11,14}$/.test(from) ? await Lead.findOne({ phone: from }).sort({ createdAt: -1 }) : null;
    const userData = lead
      ? shared().buildUserData(lead)
      : { lead_id: '', name: '', source: '', target_country: '', intake_year: '', education_level: '', city: '' };
    userData.custom_instructions = '';
    call = await AiCall.findOneAndUpdate(
      { executionId: `riya_in_${callUuid || crypto.randomBytes(8).toString('hex')}` },
      {
        $setOnInsert: {
          provider: 'elevenlabs',
          direction: 'inbound',
          trigger: 'inbound',
          phone: from,
          name: lead?.name || '',
          leadId: lead?._id,
          agentId: config.elevenAgentId,
          requestedBy: 'Caller',
          dynamicVars: userData,
          scheduledFor: new Date(),
        },
        $set: { status: 'in-progress', vobizCallUuid: callUuid },
      },
      { upsert: true, new: true },
    );
  }

  const wsUrl = `${env().publicUrl.replace(/^http/, 'ws')}${WS_PATH}?call=${call._id}&token=${streamToken(call._id)}`;
  return '<?xml version="1.0" encoding="UTF-8"?><Response>'
    + `<Stream bidirectional="true" keepCallAlive="true" contentType="audio/x-mulaw;rate=8000">${xmlEscape(wsUrl)}</Stream>`
    + '</Response>';
}

const unansweredStatus = (cause) => (/busy/.test(cause) ? 'busy' : /no.?answer|timeout|cancel|not.?answer/.test(cause) ? 'no-answer' : 'failed');

/** Hangup URL: final status; a missed call is retried later, a finished one is read back from ElevenLabs */
async function recordHangup(p, callId) {
  const callUuid = String(p.CallUUID || p.call_uuid || '');
  const call = callId && /^[a-f0-9]{24}$/i.test(callId)
    ? await AiCall.findById(callId)
    : await AiCall.findOne({ provider: 'elevenlabs', vobizCallUuid: callUuid });
  if (!call || call.endedAt) return;

  const seconds = Math.round(Number(p.BillDuration || p.Duration || 0)) || 0;
  if (call.conversationId) {
    if (!call.durationSec) await AiCall.updateOne({ _id: call._id }, { $set: { durationSec: seconds } });
    scheduleFinalize(call._id);
    return;
  }
  if (seconds > 0) {
    // Picked up, but our stream never connected
    await finishUnanswered(call, 'failed', 'Answered, but the audio stream to the server did not connect');
    return;
  }
  const cause = String(p.HangupCause || p.HangupCauseName || p.CallStatus || '').toLowerCase();
  await finishUnanswered(call, unansweredStatus(cause), cause);
}

/** Retry a missed outbound call later, or record it as not answered on the lead */
async function finishUnanswered(call, status, reason = '') {
  const tries = call.attempts || 1;
  if (call.direction === 'outbound' && ['no-answer', 'busy'].includes(status) && tries <= RETRY_MINUTES.length) {
    const at = new Date(Date.now() + RETRY_MINUTES[tries - 1] * 60000);
    await AiCall.updateOne({ _id: call._id }, { $set: { status: 'scheduled', scheduledFor: at, error: `Try ${tries}: ${status}` } });
    if (call.leadId) {
      await Lead.updateOne({ _id: call.leadId }, {
        $push: { activities: { type: 'call', comment: `AI call by Riya not answered (${status}), trying again later`, date: new Date(), performedBy: 'AI Agent (Riya)' } },
      });
    }
    return;
  }
  if (reason) await AiCall.updateOne({ _id: call._id }, { $set: { error: String(reason).slice(0, 500) } });
  await shared().recordExecution({
    id: call.executionId,
    status,
    agent_id: call.agentId,
    telephony_data: { call_type: call.direction, to_number: call.phone, from_number: call.phone },
    context_details: { recipient_data: { lead_id: call.leadId ? String(call.leadId) : '' } },
  });
}

/* ───────────────────────── After the call: read it back from ElevenLabs ───────────────────────── */

const transcriptText = (items) => (items || [])
  .filter((t) => t && t.message)
  .map((t) => `${t.role === 'agent' ? 'assistant' : 'user'}: ${String(t.message).trim()}`)
  .join('\n');

/**
 * Pull the finished conversation and apply it to the AiCall and the lead.
 * @returns {Promise<boolean>} true when done, false when ElevenLabs is still processing
 */
const finalizing = new Set(); // the bridge and the hangup callback both ask for it

async function finalize(callId, { force = false } = {}) {
  const key = String(callId);
  if (finalizing.has(key)) return true;
  finalizing.add(key);
  try {
    return await readConversation(callId, force);
  } finally {
    finalizing.delete(key);
  }
}

async function readConversation(callId, force) {
  const call = await AiCall.findById(callId);
  if (!call?.conversationId) return true;
  if (!force && call.endedAt && call.status === 'completed') return true;
  const conv = await elevenRequest(`/v1/convai/conversations/${encodeURIComponent(call.conversationId)}`);
  const convStatus = String(conv.status || '');
  if (!['done', 'failed'].includes(convStatus)) return false;

  const seconds = Math.round(Number(conv.metadata?.call_duration_secs) || call.durationSec || 0);
  await shared().recordExecution({
    id: call.executionId,
    status: convStatus === 'failed' && !seconds ? 'failed' : 'completed',
    agent_id: call.agentId,
    conversation_duration: seconds,
    transcript: transcriptText(conv.transcript),
    summary: conv.analysis?.transcript_summary || '',
    extracted_data: conv.analysis?.data_collection_results || {},
    error_message: convStatus === 'failed' ? 'ElevenLabs marked the conversation as failed' : '',
    telephony_data: {
      call_type: call.direction,
      to_number: call.phone,
      from_number: call.phone,
      hangup_by: String(conv.metadata?.termination_reason || ''),
      recording_url: '',
    },
    context_details: { recipient_data: { lead_id: call.leadId ? String(call.leadId) : '' } },
  });
  if (conv.has_audio !== false) {
    await AiCall.updateOne({ _id: call._id }, { $set: { recordingUrl: `elevenlabs:${call.conversationId}` } });
  }
  return true;
}

function scheduleFinalize(callId, attempt = 0) {
  if (attempt >= FINALIZE_DELAYS_MS.length) return;
  const t = setTimeout(async () => {
    try {
      const done = await finalize(callId);
      if (!done) scheduleFinalize(callId, attempt + 1);
    } catch (err) {
      warn('finalize failed:', err.message);
      scheduleFinalize(callId, attempt + 1);
    }
  }, FINALIZE_DELAYS_MS[attempt]);
  if (t.unref) t.unref();
}

/** Recording of an ElevenLabs call (MP3), for the admin player */
async function fetchRecording(conversationId) {
  return elevenRequest(`/v1/convai/conversations/${encodeURIComponent(conversationId)}/audio`, { raw: true });
}

/* ───────────────────────── The bridge ───────────────────────── */

const DYNAMIC_KEYS = ['name', 'source', 'target_country', 'intake_year', 'education_level', 'city', 'custom_instructions'];

/**
 * One live call: Vobiz stream on one side, ElevenLabs conversation on the other.
 * Vobiz sends μ-law 8 kHz; ElevenLabs tells us its formats in conversation_initiation_metadata
 * (ulaw_8000 both ways is best: no conversion).
 */
function bridgeCall(phoneWs, call) {
  let streamId = '';
  let vobizCallUuid = call.vobizCallUuid || '';
  let eleven = null;
  let inputFormat = '';
  let outputFormat = '';
  const pending = []; // student audio that arrived before ElevenLabs was ready
  let playbackEndsAt = 0; // when Vobiz will have played everything we sent
  let closed = false;
  let triedWithoutOverride = false;

  const sendPhone = (msg) => { if (phoneWs.readyState === WebSocket.OPEN) phoneWs.send(JSON.stringify(msg)); };
  const sendEleven = (msg) => { if (eleven?.readyState === WebSocket.OPEN) eleven.send(JSON.stringify(msg)); };

  const vars = Object.fromEntries(DYNAMIC_KEYS.map((k) => [k, String(call.dynamicVars?.[k] || '')]));
  const unknownCaller = call.direction === 'inbound' && !vars.name;

  async function connectEleven(withOverride) {
    const { signed_url: signedUrl } = await elevenRequest(`/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(call.agentId)}`);
    if (closed) return;
    eleven = new WebSocket(signedUrl);
    let started = false;

    eleven.on('open', () => {
      const init = { type: 'conversation_initiation_client_data', dynamic_variables: vars };
      if (withOverride) init.conversation_config_override = { agent: { first_message: INBOUND_FIRST_MESSAGE } };
      eleven.send(JSON.stringify(init));
    });

    eleven.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      switch (msg.type) {
        case 'conversation_initiation_metadata': {
          const meta = msg.conversation_initiation_metadata_event || {};
          started = true;
          inputFormat = meta.user_input_audio_format || 'pcm_16000';
          outputFormat = meta.agent_output_audio_format || 'pcm_16000';
          AiCall.updateOne({ _id: call._id }, { $set: { conversationId: String(meta.conversation_id || ''), status: 'in-progress' } })
            .catch((err) => warn('save conversation id:', err.message));
          while (pending.length) sendEleven({ user_audio_chunk: fromPhone(pending.shift(), inputFormat).toString('base64') });
          break;
        }
        case 'audio': {
          const b64 = msg.audio_event?.audio_base_64;
          if (!b64 || !streamId) break;
          const ulaw = toPhone(Buffer.from(b64, 'base64'), outputFormat);
          sendPhone({ event: 'playAudio', streamId, media: { contentType: 'audio/x-mulaw', sampleRate: 8000, payload: ulaw.toString('base64') } });
          playbackEndsAt = Math.max(playbackEndsAt, Date.now()) + ulaw.length / 8; // 8 bytes per ms
          break;
        }
        case 'interruption':
          if (streamId) sendPhone({ event: 'clearAudio', streamId });
          playbackEndsAt = Date.now();
          break;
        case 'ping':
          setTimeout(() => sendEleven({ type: 'pong', event_id: msg.ping_event?.event_id }), Number(msg.ping_event?.ping_ms) || 0);
          break;
        default:
          break;
      }
    });

    eleven.on('close', (code, reason) => {
      // An agent that doesn't allow first-message overrides rejects the start; try once without it
      if (!started && withOverride && !triedWithoutOverride && !closed) {
        triedWithoutOverride = true;
        warn(`ElevenLabs refused the inbound override (${code} ${reason}); retrying without it`);
        connectEleven(false).catch((err) => { warn('ElevenLabs connect:', err.message); endPhone(); });
        return;
      }
      if (!started) warn(`ElevenLabs closed before the conversation started: ${code} ${reason}`);
      endPhone();
    });
    eleven.on('error', (err) => warn('ElevenLabs socket:', err.message));
  }

  // Riya finished (end_call) or ElevenLabs dropped: let the last words play, then hang up the phone
  function endPhone() {
    if (closed) return;
    closed = true;
    const wait = Math.min(Math.max(playbackEndsAt - Date.now(), 0) + 600, 15000);
    setTimeout(async () => {
      try {
        if (vobizCallUuid) await vobizRequest(`/Call/${encodeURIComponent(vobizCallUuid)}/`, { method: 'DELETE' });
      } catch (err) {
        if (!/404/.test(err.message)) warn('hangup:', err.message);
      }
      try { phoneWs.close(); } catch { /* already closed */ }
      scheduleFinalize(call._id);
    }, wait);
  }

  // What Vobiz actually sent, logged when the call ends (to debug one-way audio)
  const stats = { media: 0, bytes: 0, silent: 0, binary: 0, other: {}, tracks: {} };

  const studentAudio = (chunk) => {
    stats.media += 1;
    stats.bytes += chunk.length;
    if (chunk.every((b) => b === 0xff || b === 0x7f)) stats.silent += 1;
    if (inputFormat) sendEleven({ user_audio_chunk: fromPhone(chunk, inputFormat).toString('base64') });
    else if (pending.length < 250) pending.push(chunk); // up to 5 s while ElevenLabs connects
  };

  phoneWs.on('message', (raw, isBinary) => {
    if (isBinary) {
      stats.binary += 1;
      studentAudio(Buffer.from(raw));
      return;
    }
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.event === 'start') {
      streamId = msg.start?.streamId || msg.streamId || '';
      vobizCallUuid = msg.start?.callId || vobizCallUuid;
      log(`stream start ${call._id}: tracks=${JSON.stringify(msg.start?.tracks)} format=${JSON.stringify(msg.start?.mediaFormat)}`);
      connectEleven(unknownCaller).catch((err) => { warn('ElevenLabs connect:', err.message); endPhone(); });
    } else if (msg.event === 'media') {
      const payload = msg.media?.payload || msg.payload;
      const track = msg.media?.track || 'none';
      stats.tracks[track] = (stats.tracks[track] || 0) + 1;
      if (payload) studentAudio(Buffer.from(payload, 'base64')); // a bidirectional stream has one track
    } else {
      stats.other[msg.event || 'unknown'] = (stats.other[msg.event || 'unknown'] || 0) + 1;
    }
  });

  // The student hung up (Vobiz closes the stream; there is no stop event)
  phoneWs.on('close', () => {
    log(`stream end ${call._id}: in=${inputFormat} out=${outputFormat} ${JSON.stringify(stats)}`);
    const wasOpen = !closed;
    closed = true;
    try { eleven?.close(); } catch { /* already closed */ }
    if (wasOpen) scheduleFinalize(call._id);
  });
  phoneWs.on('error', (err) => warn('Vobiz socket:', err.message));
}

/** Accept Vobiz stream connections on /api/ws/riya (call from server.js after listen) */
function attachBridge(server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });
  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== WS_PATH) return; // not ours; other upgrade handlers may take it
    const callId = url.searchParams.get('call') || '';
    const reject = (code) => { socket.write(`HTTP/1.1 ${code}\r\n\r\n`); socket.destroy(); };
    if (!/^[a-f0-9]{24}$/i.test(callId) || !tokenMatches(callId, url.searchParams.get('token'))) return reject('401 Unauthorized');
    try {
      const call = await AiCall.findById(callId).lean();
      if (!call || call.endedAt) return reject('404 Not Found');
      wss.handleUpgrade(req, socket, head, (ws) => bridgeCall(ws, call));
    } catch (err) {
      warn('upgrade:', err.message);
      reject('500 Internal Server Error');
    }
  });
}

module.exports = {
  isConfigured,
  createCall,
  answerCall,
  recordHangup,
  finalize,
  fetchRecording,
  secretMatches,
  attachBridge,
  startWorker,
  tick,
  WS_PATH,
};
