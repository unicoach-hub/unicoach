/**
 * One-time setup of the ElevenLabs agent for phone calls through our Vobiz bridge (services/riyaCalls):
 *  - audio in and out as μ-law 8 kHz (what Vobiz streams, so the bridge passes audio through untouched)
 *  - data collection fields that bolnaCalls.applyCallResult reads (outcome, callback_time, country, ...)
 *  - allows the first-message override (inbound callers we don't know get a different greeting)
 *
 * Usage (backend folder, ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in .env):
 *   node scripts/setupElevenRiya.js          shows what is set now
 *   node scripts/setupElevenRiya.js --apply  updates the agent
 * Touches only the ElevenLabs agent, not the database.
 */
require('dotenv').config();

const API = 'https://api.elevenlabs.io';
const apiKey = process.env.ELEVENLABS_API_KEY;
const agentId = process.argv.find((a) => a.startsWith('agent_')) || process.env.ELEVENLABS_AGENT_ID;
const apply = process.argv.includes('--apply');

const DATA_COLLECTION = {
  outcome: 'Result of the call. Exactly one of: consultation_yes (agreed to a free counsellor call), callback (busy, asked to be called later), not_interested, do_not_call (asked never to be called again), wrong_number, no_conversation (no real talk happened).',
  wants_counsellor: 'yes if the student agreed to a free 1:1 counsellor call, otherwise no.',
  counsellor_call_time: 'Day and time the student chose for the counsellor call, as they said it (e.g. "Saturday 5 pm").',
  callback_time: 'If the student asked to be called back: that date and time as ISO 8601 with +05:30 (India time), e.g. 2026-11-03T17:00:00+05:30. Empty otherwise.',
  name: "Student's name, if they said it.",
  country: 'Country or countries the student wants to study in.',
  course: 'Course, subject or career the student is interested in.',
  intake: 'When they want to start (month and year).',
  education: 'Current or last education, with marks / CGPA if said.',
  english_test: 'IELTS / PTE / TOEFL / Duolingo status and score, if mentioned.',
  budget: 'Yearly budget and whether they need an education loan.',
  language: 'Main language the student spoke (Hindi, English, Hinglish, ...).',
  interest: 'One line on how interested the student sounded and anything the counsellor should know.',
};

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'xi-api-key': apiKey, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data).slice(0, 600)}`);
  return data;
}

const show = (agent) => {
  const c = agent.conversation_config || {};
  const p = agent.platform_settings || {};
  console.log('Agent:', agent.name, `(${agent.agent_id})`);
  console.log('  input audio :', c.asr?.user_input_audio_format);
  console.log('  output audio:', c.tts?.agent_output_audio_format);
  console.log('  data collection:', Object.keys(p.data_collection || {}).join(', ') || '(none)');
  console.log('  first message override allowed:', Boolean(p.overrides?.conversation_config_override?.agent?.first_message));
};

(async () => {
  if (!apiKey || !agentId) throw new Error('Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in .env (or pass agent_… as an argument)');
  const agent = await call(`/v1/convai/agents/${agentId}`);
  show(agent);
  if (!apply) {
    console.log('\nNothing changed. Run with --apply to update the agent.');
    return;
  }

  const overrides = agent.platform_settings?.overrides || {};
  const configOverride = overrides.conversation_config_override || {};
  const dataCollection = { ...(agent.platform_settings?.data_collection || {}) };
  Object.entries(DATA_COLLECTION).forEach(([key, description]) => { dataCollection[key] = { type: 'string', description }; });

  await call(`/v1/convai/agents/${agentId}`, {
    method: 'PATCH',
    body: {
      conversation_config: {
        asr: { user_input_audio_format: 'ulaw_8000' },
        tts: { agent_output_audio_format: 'ulaw_8000' },
      },
      platform_settings: {
        data_collection: dataCollection,
        overrides: {
          ...overrides,
          conversation_config_override: {
            ...configOverride,
            agent: { ...(configOverride.agent || {}), first_message: true },
          },
        },
      },
    },
  });
  console.log('\nUpdated. Now:');
  show(await call(`/v1/convai/agents/${agentId}`));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
