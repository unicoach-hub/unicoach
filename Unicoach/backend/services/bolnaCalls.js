const Lead = require('../models/Lead');
const AiCall = require('../models/AiCall');
const Settings = require('../models/Settings');
const { normalizePhone } = require('../utils/twilio');

/**
 * Bolna AI calls by Riya (the Bolna agent):
 *  - auto: a new website lead is called a minute after the form (startLeadCall)
 *  - manual / batch: the team starts a call from admin → AI Calls or a lead (queueCall)
 *  - inbound: students calling the Vobiz number; Bolna answers, the webhook logs it
 * Every call is an AiCall document; Bolna's webhook (recordExecution) fills in the result and
 * updates the lead.
 *
 * Server env: BOLNA_API_KEY (required), BOLNA_AGENT_ID / BOLNA_FROM_NUMBER (defaults for the admin
 * settings), BOLNA_AUTO_CALL=false blocks auto calls whatever the admin toggle says.
 * Admin → AI Calls → Settings: auto-call on/off, agent, caller number, calling hours, daily limit.
 */

const BOLNA_API = 'https://api.bolna.ai';
const AGENT_NAME = 'AI Agent (Riya)';

const NEXT_DAY_HOUR = 10; // a lead that comes in at night is called at 10 AM
const LAST_CALL_MINUTES_BEFORE_END = 15; // a 6-minute call should not run past the window
const FIRST_CALL_DELAY_MINUTES = 1; // gives the student a moment to put the phone down after the form
const REPEAT_CALL_GAP_HOURS = 24; // two forms from one number in a day → one call

const IST_OFFSET_MIN = 330;
const toIst = (date) => new Date(date.getTime() + IST_OFFSET_MIN * 60000);
const fromIst = (istDate) => new Date(istDate.getTime() - IST_OFFSET_MIN * 60000);

// ISO string with the +05:30 offset, the format Bolna's scheduled_at expects
const toIstIso = (date) => `${toIst(date).toISOString().slice(0, 19)}+05:30`;

const startOfIstDay = (now = new Date()) => {
  const ist = toIst(now);
  ist.setUTCHours(0, 0, 0, 0);
  return fromIst(ist);
};

/* ───────────────────────── Config ───────────────────────── */

const DEFAULT_WINDOW = { windowStartHour: 9, windowEndHour: 21 };

async function getConfig() {
  const settings = await Settings.findOne().select('aiCall').lean().catch(() => null);
  const a = settings?.aiCall || {};
  const env = process.env;
  return {
    apiKey: env.BOLNA_API_KEY || '',
    agentId: a.agentId || env.BOLNA_AGENT_ID || '',
    fromNumber: a.fromNumber || env.BOLNA_FROM_NUMBER || '',
    autoEnabled: a.autoEnabled === true && env.BOLNA_AUTO_CALL !== 'false',
    windowStartHour: Number.isFinite(a.windowStartHour) ? a.windowStartHour : DEFAULT_WINDOW.windowStartHour,
    windowEndHour: Number.isFinite(a.windowEndHour) ? a.windowEndHour : DEFAULT_WINDOW.windowEndHour,
    dailyAutoLimit: Number.isFinite(a.dailyAutoLimit) ? a.dailyAutoLimit : 100,
  };
}

/* ───────────────────────── Timing ───────────────────────── */

const minutesOfIstDay = (date) => {
  const ist = toIst(date);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
};

function isWithinWindow(date = new Date(), window = DEFAULT_WINDOW) {
  const m = minutesOfIstDay(date);
  return m >= window.windowStartHour * 60 && m <= window.windowEndHour * 60 - LAST_CALL_MINUTES_BEFORE_END;
}

/** When to place the first call for a lead created at `now`. */
function nextCallTime(now = new Date(), window = DEFAULT_WINDOW) {
  const earliest = new Date(now.getTime() + FIRST_CALL_DELAY_MINUTES * 60000);
  if (isWithinWindow(earliest, window)) return earliest;

  const ist = toIst(earliest);
  const target = new Date(ist);
  if (minutesOfIstDay(earliest) > window.windowStartHour * 60) target.setUTCDate(target.getUTCDate() + 1);
  target.setUTCHours(Math.max(NEXT_DAY_HOUR, window.windowStartHour), 0, 0, 0);
  return fromIst(target);
}

/* ───────────────────────── Placing calls ───────────────────────── */

const isKnown = (value) => {
  const v = String(value || '').trim();
  return v && !/^(undecided|not specified|unsure|n\/a|na|none)$/i.test(v) ? v : '';
};

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';

// Values the agent prompt reads as {{name}}, {{target_country}} ... (see ai-call-agent/riya-prompt-fixes.md)
function buildUserData(lead) {
  return {
    lead_id: String(lead._id),
    name: firstName(lead.name),
    source: String(lead.latestSource || lead.source || '').replace(/^Form:\s*/i, ''),
    target_country: isKnown(lead.dreamCountry),
    intake_year: isKnown(lead.preferredIntake),
    education_level: isKnown(lead.highestEducation),
    city: isKnown(lead.currentCity),
  };
}

const isIndianMobile = (phone) => /^\+91[6-9]\d{9}$/.test(String(phone || ''));
const isIndianNumber = (phone) => /^\+91\d{10}$/.test(String(phone || ''));

class CallError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function bolnaRequest(path, { method = 'GET', body, apiKey } = {}) {
  const res = await fetch(`${BOLNA_API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new CallError(`Bolna ${res.status}: ${String(data.message || JSON.stringify(data)).slice(0, 200)}`, 502);
  return data;
}

/**
 * Ask Bolna to call one number and keep an AiCall record (plus a note on the lead, if any).
 * @returns {Promise<object>} the AiCall document
 */
async function queueCall({ lead, phone, name, trigger, customInstructions = '', requestedBy = 'System', scheduledAt, config }) {
  const cfg = config || await getConfig();
  if (!cfg.apiKey || !cfg.agentId) throw new CallError('AI calling is not set up: BOLNA_API_KEY and an agent ID are needed', 503);

  const to = normalizePhone(String(phone || lead?.phone || ''));
  if (!isIndianNumber(to)) throw new CallError('Only Indian numbers (+91 and 10 digits) can be called');

  const userData = lead
    ? buildUserData(lead)
    : { lead_id: '', name: firstName(name), source: '', target_country: '', intake_year: '', education_level: '', city: '' };
  if (!lead && name) userData.name = firstName(name);
  userData.custom_instructions = String(customInstructions || '').trim().slice(0, 1000);

  const body = {
    agent_id: cfg.agentId,
    recipient_phone_number: to,
    user_data: userData,
    retry_config: {
      enabled: true,
      max_retries: 2,
      retry_on_statuses: ['no-answer', 'busy'],
      retry_intervals_minutes: [60, 240],
    },
  };
  if (scheduledAt) body.scheduled_at = toIstIso(scheduledAt);
  if (cfg.fromNumber) body.from_phone_number = cfg.fromNumber;

  const data = await bolnaRequest('/call', { method: 'POST', body, apiKey: cfg.apiKey });
  if (!data.execution_id) throw new CallError('Bolna did not return a call id', 502);

  const call = await AiCall.create({
    executionId: data.execution_id,
    leadId: lead?._id,
    direction: 'outbound',
    trigger,
    phone: to,
    name: String(lead?.name || name || '').trim(),
    agentId: cfg.agentId,
    status: data.status || 'queued',
    customInstructions: userData.custom_instructions,
    requestedBy,
    scheduledFor: scheduledAt || new Date(),
  });

  if (lead?._id) {
    const when = scheduledAt && scheduledAt.getTime() - Date.now() > 90000
      ? ` for ${toIst(scheduledAt).toISOString().slice(0, 16).replace('T', ' ')} IST`
      : '';
    await Lead.updateOne({ _id: lead._id }, {
      $set: {
        'aiCall.executionId': data.execution_id,
        'aiCall.status': call.status,
        'aiCall.queuedAt': new Date(),
        'aiCall.scheduledFor': call.scheduledFor,
      },
      $push: {
        activities: {
          type: 'note',
          comment: `AI call by Riya ${trigger === 'auto' ? 'queued' : `started by ${requestedBy}`}${when}`,
          date: new Date(),
          performedBy: 'System',
        },
      },
    });
  }
  return call;
}

/**
 * Auto call for a lead that was just saved by a website form. Skips numbers that asked not to be
 * called, numbers already called in the last day, and anything past the daily limit.
 * Never throws and never delays the response (callers do not await it).
 */
function startLeadCall(lead) {
  if (!process.env.BOLNA_API_KEY || process.env.BOLNA_AUTO_CALL === 'false') return;
  if (!lead?._id || !isIndianMobile(lead.phone)) return;
  autoCall(lead).catch((err) => console.warn('[Bolna] auto call not queued:', err.message));
}

async function autoCall(lead) {
  const config = await getConfig();
  if (!config.autoEnabled || !config.agentId) return;

  const since = new Date(Date.now() - REPEAT_CALL_GAP_HOURS * 3600000);
  const blocker = await Lead.findOne({
    _id: { $ne: lead._id },
    phone: lead.phone,
    $or: [{ tags: 'do-not-call' }, { 'aiCall.queuedAt': { $gte: since } }],
  }).select('_id').lean();
  if (blocker) return;

  const today = await AiCall.countDocuments({ trigger: 'auto', createdAt: { $gte: startOfIstDay() } });
  if (today >= config.dailyAutoLimit) return;

  await queueCall({ lead, trigger: 'auto', scheduledAt: nextCallTime(new Date(), config), config });
}

/** Full call record from Bolna (transcript, recording), for calls the webhook missed. */
async function fetchExecution(executionId) {
  const { apiKey } = await getConfig();
  if (!apiKey) throw new CallError('BOLNA_API_KEY is not set', 503);
  return bolnaRequest(`/executions/${encodeURIComponent(executionId)}`, { apiKey });
}

/* ───────────────────────── Webhook result → call + lead ───────────────────────── */

// Statuses after which Bolna sends nothing more for this attempt
const ANSWERED_STATUSES = ['completed', 'call-disconnected'];
const UNANSWERED_STATUSES = ['no-answer', 'busy', 'failed', 'error', 'canceled', 'stopped', 'balance-low'];

const OUTCOMES = ['consultation_yes', 'callback', 'not_interested', 'do_not_call', 'wrong_number', 'no_conversation'];

const OUTCOME_LABELS = {
  consultation_yes: 'Wants a free counsellor call',
  callback: 'Asked for a callback',
  not_interested: 'Not interested',
  do_not_call: 'Asked not to be called',
  wrong_number: 'Wrong number',
  no_conversation: 'No real conversation',
};

/**
 * Bolna nests extractions as { "<Category>": { "<name>": { objective, subjective, ... } } }.
 * Flattens them to { name: "value" }, whatever the category is called.
 */
function readExtractions(extracted) {
  const out = {};
  const valueOf = (v) => {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v).trim();
    const pick = v.objective ?? v.subjective ?? v.value;
    return pick == null || typeof pick === 'object' ? '' : String(pick).trim();
  };
  const walk = (obj) => {
    Object.entries(obj || {}).forEach(([key, v]) => {
      const isLeaf = v == null || typeof v !== 'object' || 'objective' in v || 'subjective' in v || 'value' in v;
      if (isLeaf) {
        const value = valueOf(v);
        if (value && !/^(null|none|n\/a|not mentioned|unknown)$/i.test(value)) out[key.trim().toLowerCase()] = value;
      } else {
        walk(v);
      }
    });
  };
  walk(extracted);
  return out;
}

const yes = (v) => /^(yes|true|y|haan|ha)\b/i.test(String(v || '').trim());

function pickOutcome(fields, durationSec) {
  const raw = String(fields.outcome || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (OUTCOMES.includes(raw)) return raw;
  if (!durationSec) return 'no_conversation';
  if (yes(fields.wants_counsellor)) return 'consultation_yes';
  if (fields.callback_time) return 'callback';
  return 'no_conversation';
}

// The team's own progress on a lead is never moved back by the AI
const AI_CAN_SET_STATUS = ['new', 'contacted'];

/**
 * Apply a finished Bolna execution to a lead document (not saved here).
 * @returns {boolean} whether anything changed
 */
function applyCallResult(lead, payload) {
  const status = String(payload.status || '');
  const executionId = String(payload.id || '');
  if (!lead.aiCall) lead.aiCall = {};
  const sameCallDone = lead.aiCall.executionId === executionId && lead.aiCall.endedAt;

  if (UNANSWERED_STATUSES.includes(status)) {
    if (sameCallDone && lead.aiCall.status === status) return false;
    Object.assign(lead.aiCall, { executionId, status, endedAt: new Date() });
    lead.activities.push({ type: 'call', comment: `AI call by Riya not answered (${status})`, date: new Date(), performedBy: AGENT_NAME });
    return true;
  }

  if (!ANSWERED_STATUSES.includes(status)) {
    if (lead.aiCall.status === status && lead.aiCall.executionId === executionId) return false;
    if (sameCallDone) return false; // a late in-progress update after the result
    Object.assign(lead.aiCall, { executionId, status });
    return true;
  }

  if (sameCallDone && ANSWERED_STATUSES.includes(lead.aiCall.status)) return false; // Bolna re-sent the result

  const fields = readExtractions(payload.extracted_data);
  const durationSec = Math.round(Number(payload.conversation_duration) || 0);
  const outcome = pickOutcome(fields, durationSec);
  const recordingUrl = payload.telephony_data?.recording_url || '';
  const summary = String(payload.summary || '').trim();

  Object.assign(lead.aiCall, {
    executionId, status, outcome, durationSec, recordingUrl, summary: summary.slice(0, 2000), endedAt: new Date(),
  });

  if (durationSec > 0) lead.phoneCall = 'done';

  const setStatus = (next) => { if (AI_CAN_SET_STATUS.includes(lead.status)) lead.status = next; };
  const addTag = (tag) => { if (!(lead.tags || []).includes(tag)) lead.tags = [...(lead.tags || []), tag]; };

  if (outcome === 'consultation_yes') {
    setStatus('interested');
    if (!lead.followUp) lead.followUp = 'interested';
    addTag('AI call: wants counsellor');
  } else if (outcome === 'callback') {
    setStatus('contacted');
    const when = Date.parse(fields.callback_time || '');
    if (!Number.isNaN(when) && when > Date.now()) lead.nextFollowUpDate = new Date(when);
  } else if (outcome === 'not_interested') {
    setStatus('not_interested');
  } else if (outcome === 'do_not_call') {
    setStatus('not_interested');
    addTag('do-not-call');
  } else if (outcome === 'wrong_number') {
    setStatus('closed');
    addTag('Wrong number');
  } else if (durationSec > 0) {
    setStatus('contacted');
  }

  // Fill only what the lead does not have yet
  if (fields.country && !isKnown(lead.dreamCountry) && !/unsure/i.test(fields.country)) lead.dreamCountry = fields.country.slice(0, 80);
  if (fields.course && !lead.course) lead.course = fields.course.slice(0, 120);
  if (fields.education && !isKnown(lead.highestEducation)) lead.highestEducation = fields.education.slice(0, 120);
  if (fields.name && /^inbound caller$/i.test(lead.name || '')) lead.name = fields.name.slice(0, 80);

  const detailLabels = [
    ['country', 'Country'], ['course', 'Course'], ['intake', 'Intake'], ['education', 'Education'],
    ['english_test', 'English test'], ['budget', 'Budget'], ['counsellor_call_time', 'Counsellor call time'],
    ['callback_time', 'Callback'], ['language', 'Language'], ['interest', 'Interest'],
  ];
  const details = detailLabels.filter(([key]) => fields[key]).map(([key, label]) => `${label}: ${fields[key]}`);
  const minutes = durationSec >= 60 ? `${Math.round(durationSec / 60)} min` : `${durationSec}s`;
  const isInbound = payload.telephony_data?.call_type === 'inbound';
  const comment = [
    `${isInbound ? 'Inbound call answered by Riya' : 'AI call by Riya'} (${minutes}): ${OUTCOME_LABELS[outcome]}`,
    summary,
    details.join(' · '),
    recordingUrl ? `Recording: ${recordingUrl}` : '',
  ].filter(Boolean).join('\n');
  lead.activities.push({ type: 'call', comment: comment.slice(0, 4000), date: new Date(), performedBy: AGENT_NAME });
  return true;
}

const callerPhone = (payload) => {
  const t = payload.telephony_data || {};
  const raw = t.call_type === 'inbound' ? t.from_number || payload.user_number : t.to_number || payload.user_number;
  return normalizePhone(String(raw || ''));
};

// Outbound calls carry our lead_id; inbound calls are matched by the caller's number
async function findLead(payload, call) {
  const ids = [payload.context_details?.recipient_data?.lead_id, call?.leadId].map((v) => String(v || ''));
  for (const id of ids) {
    if (/^[a-f0-9]{24}$/i.test(id)) {
      const lead = await Lead.findById(id);
      if (lead) return lead;
    }
  }
  const lead = await Lead.findOne({ 'aiCall.executionId': String(payload.id) });
  if (lead) return lead;
  const phone = callerPhone(payload);
  if (!/^\+\d{11,14}$/.test(phone)) return null;
  return Lead.findOne({ phone }).sort({ createdAt: -1 });
}

/**
 * Store one Bolna webhook update: the AiCall record and the lead.
 * An inbound caller who is not a lead yet becomes one once they have actually talked to Riya.
 */
async function recordExecution(payload) {
  const executionId = String(payload.id || '');
  const status = String(payload.status || '');
  const isInbound = payload.telephony_data?.call_type === 'inbound';
  const phone = callerPhone(payload);

  let call = await AiCall.findOne({ executionId });
  if (!call) {
    call = new AiCall({
      executionId,
      direction: isInbound ? 'inbound' : 'outbound',
      trigger: isInbound ? 'inbound' : 'manual',
      phone,
      agentId: String(payload.agent_id || ''),
      requestedBy: isInbound ? 'Caller' : 'Bolna dashboard',
    });
  }

  const isFinal = ANSWERED_STATUSES.includes(status) || UNANSWERED_STATUSES.includes(status);
  const fields = readExtractions(payload.extracted_data);
  const durationSec = Math.round(Number(payload.conversation_duration) || 0);
  call.status = status;
  if (ANSWERED_STATUSES.includes(status)) {
    Object.assign(call, {
      outcome: pickOutcome(fields, durationSec),
      durationSec,
      recordingUrl: payload.telephony_data?.recording_url || '',
      transcript: String(payload.transcript || '').slice(0, 100000),
      summary: String(payload.summary || '').trim().slice(0, 4000),
      extracted: fields,
      hangupBy: String(payload.telephony_data?.hangup_by || ''),
    });
  }
  if (isFinal) {
    call.endedAt = call.endedAt || new Date();
    if (payload.error_message) call.error = String(payload.error_message).slice(0, 500);
  }

  let lead = await findLead(payload, call);
  if (!lead && isInbound && ANSWERED_STATUSES.includes(status) && durationSec > 0 && isIndianNumber(phone)) {
    lead = new Lead({
      name: fields.name || 'Inbound caller',
      phone,
      email: '',
      source: 'Inbound call',
      latestSource: 'Inbound call',
      verified: false,
      status: 'new',
      activities: [{ type: 'note', comment: 'Called the Unicoach number; Riya answered', date: new Date(), performedBy: 'System' }],
    });
  }

  if (lead) {
    if (applyCallResult(lead, payload) || lead.isNew) await lead.save();
    call.leadId = lead._id;
    if (!call.name) call.name = lead.name;
  }
  await call.save();
  return { call, lead };
}

module.exports = {
  startLeadCall,
  queueCall,
  getConfig,
  isWithinWindow,
  nextCallTime,
  buildUserData,
  readExtractions,
  applyCallResult,
  recordExecution,
  fetchExecution,
  toIstIso,
  CallError,
  OUTCOME_LABELS,
};
