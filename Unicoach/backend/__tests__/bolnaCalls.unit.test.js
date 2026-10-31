// Bolna AI calls: when Riya calls, what she is told, and how her result lands on the lead (no DB, no network)
const mockLeadFindOne = jest.fn();
const mockLeadFindById = jest.fn();
const mockLeadUpdateOne = jest.fn();
const mockAiCallFindOne = jest.fn();
const mockAiCallCreate = jest.fn();
const mockAiCallCount = jest.fn();
const mockAiCallSaved = [];
let mockSettings = null;

jest.mock('../models/Lead', () => ({
  findOne: (...a) => mockLeadFindOne(...a),
  findById: (...a) => mockLeadFindById(...a),
  updateOne: (...a) => mockLeadUpdateOne(...a),
}));
jest.mock('../models/AiCall', () => {
  function AiCall(data) {
    Object.assign(this, data);
    this.save = jest.fn(async () => { mockAiCallSaved.push(this); return this; });
  }
  AiCall.findOne = (...a) => mockAiCallFindOne(...a);
  AiCall.create = (...a) => mockAiCallCreate(...a);
  AiCall.countDocuments = (...a) => mockAiCallCount(...a);
  return AiCall;
});
jest.mock('../models/Settings', () => ({
  findOne: () => ({ select: () => ({ lean: () => ({ catch: () => Promise.resolve(mockSettings) }) }) }),
}));

const { nextCallTime, buildUserData, readExtractions, applyCallResult, startLeadCall, toIstIso } = require('../services/bolnaCalls');
const { receiveWebhook } = require('../controllers/bolnaController');

// IST wall-clock time → the real instant
const ist = (iso) => new Date(`${iso}+05:30`);

const makeLead = (over = {}) => ({
  _id: '64b7f0c2a1b2c3d4e5f60718',
  name: 'Aarav Sharma',
  phone: '+919812345678',
  dreamCountry: 'Undecided',
  preferredIntake: '2026',
  highestEducation: 'Not specified',
  currentCity: 'Panipat',
  source: 'Form: Education Loan Enquiry',
  status: 'new',
  followUp: '',
  tags: [],
  activities: [],
  aiCall: {},
  ...over,
});

const completed = (extracted, over = {}) => ({
  id: 'exec-1',
  status: 'completed',
  conversation_duration: 142,
  summary: 'Student wants an MBA in Canada.',
  extracted_data: { 'Lead details': extracted },
  telephony_data: { recording_url: 'https://rec.example/1.mp3', call_type: 'outbound' },
  ...over,
});

describe('nextCallTime', () => {
  test('inside the window the call goes out a minute later', () => {
    expect(toIstIso(nextCallTime(ist('2026-10-31T11:00:00')))).toBe('2026-10-31T11:01:00+05:30');
  });

  test('a late-night lead is called at 10 AM the next day', () => {
    expect(toIstIso(nextCallTime(ist('2026-10-31T22:30:00')))).toBe('2026-11-01T10:00:00+05:30');
  });

  test('an early-morning lead is called at 10 AM the same day', () => {
    expect(toIstIso(nextCallTime(ist('2026-10-31T06:15:00')))).toBe('2026-10-31T10:00:00+05:30');
  });

  test('no call starts in the last 15 minutes of the window', () => {
    expect(toIstIso(nextCallTime(ist('2026-10-31T20:50:00')))).toBe('2026-11-01T10:00:00+05:30');
  });
});

describe('buildUserData', () => {
  test('sends first name and only real values, never "Undecided"', () => {
    expect(buildUserData(makeLead())).toEqual({
      lead_id: '64b7f0c2a1b2c3d4e5f60718',
      name: 'Aarav',
      source: 'Education Loan Enquiry',
      target_country: '',
      intake_year: '2026',
      education_level: '',
      city: 'Panipat',
    });
  });
});

describe('readExtractions', () => {
  test('flattens Bolna categories and prefers the objective value', () => {
    expect(readExtractions({
      'Lead details': {
        country: { objective: 'Canada', subjective: 'Canada, maybe UK' },
        budget: { subjective: '25 lakh' },
        callback_time: { objective: null },
        interest: { objective: 'not mentioned' },
      },
      Outcome: { outcome: { objective: 'consultation_yes' } },
    })).toEqual({ country: 'Canada', budget: '25 lakh', outcome: 'consultation_yes' });
  });
});

describe('applyCallResult', () => {
  test('a student who wants a counsellor becomes interested, with details filled in', () => {
    const lead = makeLead();
    const changed = applyCallResult(lead, completed({
      outcome: { objective: 'consultation_yes' },
      country: { objective: 'Canada' },
      course: { objective: 'MBA' },
      budget: { objective: '25 lakh' },
    }));
    expect(changed).toBe(true);
    expect(lead.status).toBe('interested');
    expect(lead.followUp).toBe('interested');
    expect(lead.phoneCall).toBe('done');
    expect(lead.dreamCountry).toBe('Canada');
    expect(lead.course).toBe('MBA');
    expect(lead.tags).toContain('AI call: wants counsellor');
    expect(lead.aiCall).toMatchObject({ executionId: 'exec-1', outcome: 'consultation_yes', durationSec: 142 });
    expect(lead.activities).toHaveLength(1);
    expect(lead.activities[0].comment).toMatch(/Wants a free counsellor call/);
    expect(lead.activities[0].comment).toMatch(/Budget: 25 lakh/);
    expect(lead.activities[0].comment).toMatch(/Recording: https:\/\/rec\.example\/1\.mp3/);
  });

  test('the same result sent twice is logged once', () => {
    const lead = makeLead();
    const payload = completed({ outcome: { objective: 'callback' } });
    applyCallResult(lead, payload);
    expect(applyCallResult(lead, payload)).toBe(false);
    expect(lead.activities).toHaveLength(1);
  });

  test('do-not-call is tagged so Riya never calls again', () => {
    const lead = makeLead();
    applyCallResult(lead, completed({ outcome: { objective: 'do_not_call' } }));
    expect(lead.status).toBe('not_interested');
    expect(lead.tags).toContain('do-not-call');
  });

  test("the team's progress is never moved back", () => {
    const lead = makeLead({ status: 'converted', dreamCountry: 'UK' });
    applyCallResult(lead, completed({ outcome: { objective: 'not_interested' }, country: { objective: 'Canada' } }));
    expect(lead.status).toBe('converted');
    expect(lead.dreamCountry).toBe('UK');
  });

  test('an unanswered call is noted without touching the lead status', () => {
    const lead = makeLead();
    applyCallResult(lead, { id: 'exec-2', status: 'no-answer' });
    expect(lead.status).toBe('new');
    expect(lead.aiCall.status).toBe('no-answer');
    expect(lead.activities[0].comment).toMatch(/not answered \(no-answer\)/);
  });

  test('no extraction and no talk means no conversation', () => {
    const lead = makeLead();
    applyCallResult(lead, completed({}, { conversation_duration: 0 }));
    expect(lead.aiCall.outcome).toBe('no_conversation');
    expect(lead.phoneCall).toBeUndefined();
    expect(lead.status).toBe('new');
  });
});

describe('startLeadCall', () => {
  const env = { ...process.env };
  afterEach(() => { process.env = { ...env }; delete global.fetch; jest.clearAllMocks(); });

  test('does nothing until auto-call is switched on in admin', async () => {
    global.fetch = jest.fn();
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    mockSettings = { aiCall: { autoEnabled: false } };
    startLeadCall(makeLead());
    await new Promise((r) => setImmediate(r));
    expect(mockLeadFindOne).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('BOLNA_AUTO_CALL=false blocks auto calls even when the admin toggle is on', async () => {
    global.fetch = jest.fn();
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    process.env.BOLNA_AUTO_CALL = 'false';
    mockSettings = { aiCall: { autoEnabled: true } };
    startLeadCall(makeLead());
    await new Promise((r) => setImmediate(r));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('queues the call and logs it on the lead', async () => {
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    mockSettings = { aiCall: { autoEnabled: true } };
    mockLeadFindOne.mockReturnValue({ select: () => ({ lean: async () => null }) });
    mockAiCallCount.mockResolvedValue(0);
    mockAiCallCreate.mockImplementation(async (d) => d);
    global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ status: 'queued', execution_id: 'exec-9' }) }));
    mockLeadUpdateOne.mockResolvedValue({});

    startLeadCall(makeLead());
    for (let i = 0; i < 6; i += 1) await new Promise((r) => setImmediate(r));

    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.bolna.ai/call');
    expect(init.headers.Authorization).toBe('Bearer key');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ agent_id: 'agent', recipient_phone_number: '+919812345678' });
    expect(body.user_data.name).toBe('Aarav');
    expect(body.user_data.custom_instructions).toBe('');
    expect(mockAiCallCreate.mock.calls[0][0]).toMatchObject({ executionId: 'exec-9', trigger: 'auto', phone: '+919812345678' });
    expect(mockLeadUpdateOne.mock.calls[0][1].$set['aiCall.executionId']).toBe('exec-9');
  });

  test('stops at the daily auto-call limit', async () => {
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    mockSettings = { aiCall: { autoEnabled: true, dailyAutoLimit: 5 } };
    mockLeadFindOne.mockReturnValue({ select: () => ({ lean: async () => null }) });
    mockAiCallCount.mockResolvedValue(5);
    global.fetch = jest.fn();

    startLeadCall(makeLead());
    for (let i = 0; i < 6; i += 1) await new Promise((r) => setImmediate(r));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('skips a number that asked not to be called or was called today', async () => {
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    mockSettings = { aiCall: { autoEnabled: true } };
    mockLeadFindOne.mockReturnValue({ select: () => ({ lean: async () => ({ _id: 'other', tags: ['do-not-call'] }) }) });
    global.fetch = jest.fn();

    startLeadCall(makeLead());
    for (let i = 0; i < 6; i += 1) await new Promise((r) => setImmediate(r));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('skips numbers that are not Indian mobiles', () => {
    process.env.BOLNA_API_KEY = 'key';
    process.env.BOLNA_AGENT_ID = 'agent';
    startLeadCall(makeLead({ phone: '+447700900123' }));
    expect(mockLeadFindOne).not.toHaveBeenCalled();
  });
});

describe('POST /api/webhooks/bolna', () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };
  const makeReq = (secret, body) => ({ get: (h) => (h === 'x-unicoach-secret' ? secret : undefined), body });

  beforeEach(() => { process.env.BOLNA_WEBHOOK_SECRET = 'a-long-test-secret-123'; jest.clearAllMocks(); });

  test('rejects a wrong secret', async () => {
    const res = makeRes();
    await receiveWebhook(makeReq('nope', {}), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('finds the lead by lead_id and saves the result and the call', async () => {
    const lead = { ...makeLead(), save: jest.fn() };
    mockLeadFindById.mockResolvedValue(lead);
    mockAiCallFindOne.mockResolvedValue(null);
    mockAiCallSaved.length = 0;
    const res = makeRes();
    await receiveWebhook(makeReq('a-long-test-secret-123', completed(
      { outcome: { objective: 'consultation_yes' } },
      { context_details: { recipient_data: { lead_id: '64b7f0c2a1b2c3d4e5f60718' } } },
    )), res);
    expect(mockLeadFindById).toHaveBeenCalledWith('64b7f0c2a1b2c3d4e5f60718');
    expect(lead.save).toHaveBeenCalled();
    expect(lead.status).toBe('interested');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockAiCallSaved[0]).toMatchObject({
      executionId: 'exec-1', outcome: 'consultation_yes', durationSec: 142, recordingUrl: 'https://rec.example/1.mp3',
    });
    expect(String(mockAiCallSaved[0].leadId)).toBe('64b7f0c2a1b2c3d4e5f60718');
  });
});
