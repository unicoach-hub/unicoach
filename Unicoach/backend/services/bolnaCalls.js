const Lead = require('../models/Lead');

/**
 * Bolna AI calls: Riya (the Bolna agent) calls a new website lead a minute after the form,
 * and Bolna's webhook (controllers/bolnaController) writes the call result back onto the lead.
 *
 * Needs BOLNA_API_KEY + BOLNA_AGENT_ID, and BOLNA_AUTO_CALL=true to actually dial.
 * Optional BOLNA_FROM_NUMBER (E.164) picks the caller number; otherwise Bolna uses the agent's default.
 * startLeadCall never throws and never delays the response (callers do not await it).
 */

const BOLNA_CALL_URL = 'https://api.bolna.ai/call';
const AGENT_NAME = 'AI Agent (Riya)';

// Calling window in IST, the same as Riya's "Outbound call timing restrictions" in Bolna
const WINDOW_START_HOUR = 9;
const WINDOW_END_HOUR = 21;
const NEXT_DAY_HOUR = 10; // a lead that comes in at night is called at 10 AM
const LAST_CALL_MINUTES_BEFORE_END = 15; // a 6-minute call should not run past the window
const FIRST_CALL_DELAY_MINUTES = 1; // gives the student a moment to put the phone down after the form
const REPEAT_CALL_GAP_HOURS = 24; // two forms from one number in a day → one call

const IST_OFFSET_MIN = 330;
const toIst = (date) => new Date(date.getTime() + IST_OFFSET_MIN * 60000);
const fromIst = (istDate) => new Date(istDate.getTime() - IST_OFFSET_MIN * 60000);

// ISO string with the +05:30 offset, the format Bolna's scheduled_at expects
const toIstIso = (date) => `${toIst(date).toISOString().slice(0, 19)}+05:30`;

/** When to place the first call for a lead created at `now`. */
function nextCallTime(now = new Date()) {
  const earliest = new Date(now.getTime() + FIRST_CALL_DELAY_MINUTES * 60000);
  const ist = toIst(earliest);
  const minutesOfDay = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const lastStart = WINDOW_END_HOUR * 60 - LAST_CALL_MINUTES_BEFORE_END;
  if (minutesOfDay >= WINDOW_START_HOUR * 60 && minutesOfDay <= lastStart) return earliest;

  const target = new Date(ist);
  if (minutesOfDay > lastStart) target.setUTCDate(target.getUTCDate() + 1);
  target.setUTCHours(NEXT_DAY_HOUR, 0, 0, 0);
  return fromIst(target);
}

const isKnown = (value) => {
  const v = String(value || '').trim();
  return v && !/^(undecided|not specified|unsure|n\/a|na|none)$/i.test(v) ? v : '';
};

// Values the agent prompt reads as {{name}}, {{target_country}} ... (see ai-call-agent/riya-prompt-fixes.md)
function buildUserData(lead) {
  return {
    lead_id: String(lead._id),
    name: String(lead.name || '').trim().split(/\s+/)[0] || '',
    source: String(lead.latestSource || lead.source || '').replace(/^Form:\s*/i, ''),
    target_country: isKnown(lead.dreamCountry),
    intake_year: isKnown(lead.preferredIntake),
    education_level: isKnown(lead.highestEducation),
    city: isKnown(lead.currentCity),
  };
}

const isIndianMobile = (phone) => /^\+91[6-9]\d{9}$/.test(String(phone || ''));

/**
 * Queue Riya's call for a lead that was just saved. Skips numbers that asked not to be called
 * and numbers already called in the last day.
 * @param {object} lead  a saved Lead document
 */
function startLeadCall(lead) {
  const apiKey = process.env.BOLNA_API_KEY;
  const agentId = process.env.BOLNA_AGENT_ID;
  if (process.env.BOLNA_AUTO_CALL !== 'true' || !apiKey || !agentId) return;
  if (!lead?._id || !isIndianMobile(lead.phone)) return;

  queueCall(lead, { apiKey, agentId }).catch((err) => console.warn('[Bolna] call not queued:', err.message));
}

async function queueCall(lead, { apiKey, agentId }) {
  const since = new Date(Date.now() - REPEAT_CALL_GAP_HOURS * 3600000);
  const blocker = await Lead.findOne({
    _id: { $ne: lead._id },
    phone: lead.phone,
    $or: [{ tags: 'do-not-call' }, { 'aiCall.queuedAt': { $gte: since } }],
  }).select('_id tags').lean();
  if (blocker) return;

  const callAt = nextCallTime();
  const body = {
    agent_id: agentId,
    recipient_phone_number: lead.phone,
    scheduled_at: toIstIso(callAt),
    user_data: buildUserData(lead),
    retry_config: {
      enabled: true,
      max_retries: 2,
      retry_on_statuses: ['no-answer', 'busy'],
      retry_intervals_minutes: [60, 240],
    },
  };
  if (process.env.BOLNA_FROM_NUMBER) body.from_phone_number = process.env.BOLNA_FROM_NUMBER;

  const res = await fetch(BOLNA_CALL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.execution_id) {
    throw new Error(`Bolna ${res.status}: ${String(data.message || JSON.stringify(data)).slice(0, 200)}`);
  }

  const timeIst = toIst(callAt).toISOString().slice(11, 16);
  await Lead.updateOne({ _id: lead._id }, {
    $set: {
      'aiCall.executionId': data.execution_id,
      'aiCall.status': data.status || 'queued',
      'aiCall.queuedAt': new Date(),
      'aiCall.scheduledFor': callAt,
    },
    $push: {
      activities: {
        type: 'note',
        comment: `AI call by Riya queued for ${timeIst} IST`,
        date: new Date(),
        performedBy: 'System',
      },
    },
  });
}

/* ───────────────────────── Webhook result → lead ───────────────────────── */

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

  const detailLabels = [
    ['country', 'Country'], ['course', 'Course'], ['intake', 'Intake'], ['education', 'Education'],
    ['english_test', 'English test'], ['budget', 'Budget'], ['counsellor_call_time', 'Counsellor call time'],
    ['callback_time', 'Callback'], ['language', 'Language'], ['interest', 'Interest'],
  ];
  const details = detailLabels.filter(([key]) => fields[key]).map(([key, label]) => `${label}: ${fields[key]}`);
  const minutes = durationSec >= 60 ? `${Math.round(durationSec / 60)} min` : `${durationSec}s`;
  const comment = [
    `AI call by Riya (${minutes}): ${OUTCOME_LABELS[outcome]}`,
    summary,
    details.join(' · '),
    recordingUrl ? `Recording: ${recordingUrl}` : '',
  ].filter(Boolean).join('\n');
  lead.activities.push({ type: 'call', comment: comment.slice(0, 4000), date: new Date(), performedBy: AGENT_NAME });
  return true;
}

module.exports = { startLeadCall, nextCallTime, buildUserData, readExtractions, applyCallResult, toIstIso };
