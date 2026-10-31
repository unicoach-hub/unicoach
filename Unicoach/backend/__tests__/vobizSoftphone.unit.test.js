// Team softphone on Vobiz: the Answer URL XML, call logging and callbacks (no DB, no network)
const mockEndpointFindOne = jest.fn();
const mockEndpointFind = jest.fn();
const mockCallUpdateOne = jest.fn();
const mockCallFindOne = jest.fn();
const mockLeadFindOne = jest.fn();
const mockLeadFindById = jest.fn();
const mockLeadUpdateOne = jest.fn();

jest.mock('../models/SoftphoneEndpoint', () => ({
  findOne: (...a) => mockEndpointFindOne(...a),
  find: (...a) => mockEndpointFind(...a),
}));
jest.mock('../models/AiCall', () => ({
  updateOne: (...a) => mockCallUpdateOne(...a),
  findOne: (...a) => mockCallFindOne(...a),
}));
jest.mock('../models/Lead', () => ({
  findOne: (...a) => mockLeadFindOne(...a),
  findById: (...a) => mockLeadFindById(...a),
  updateOne: (...a) => mockLeadUpdateOne(...a),
}));

const vobiz = require('../services/vobizSoftphone');

const lean = (v) => ({ lean: async () => v });
const chain = (v) => ({ sort: () => ({ select: () => lean(v) }), select: () => lean(v), lean: async () => v });

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(process.env, {
    VOBIZ_AUTH_ID: 'MA_TEST', VOBIZ_AUTH_TOKEN: 'tok', VOBIZ_APP_ID: 'app1',
    VOBIZ_TEAM_NUMBER: '+918065300000', VOBIZ_WEBHOOK_SECRET: 'a-long-vobiz-secret-1', API_PUBLIC_URL: 'https://api.example.com',
  });
  mockCallUpdateOne.mockResolvedValue({});
  mockLeadUpdateOne.mockResolvedValue({});
});

describe('numberFrom', () => {
  test('reads numbers from SIP URIs and bare digits', () => {
    expect(vobiz.numberFrom('sip:+919812345678@registrar.vobiz.ai')).toBe('+919812345678');
    expect(vobiz.numberFrom('919812345678')).toBe('+919812345678');
    expect(vobiz.numberFrom('9812345678')).toBe('+919812345678');
    expect(vobiz.numberFrom('sip:uc12ab@registrar.vobiz.ai')).toBe('');
  });
});

describe('answerCall', () => {
  test('a call from a team softphone dials the student with the team number, recorded', async () => {
    mockEndpointFindOne.mockReturnValue(lean({ username: 'uc12ab', name: 'Sagar' }));
    mockLeadFindById.mockReturnValue({ select: () => lean({ _id: '64b7f0c2a1b2c3d4e5f60718', name: 'Aarav' }) });

    const xml = await vobiz.answerCall({
      From: 'sip:uc12ab@registrar.vobiz.ai', To: 'sip:+919812345678@registrar.vobiz.ai',
      CallUUID: 'cu-1', 'X-PH-LeadId': '64b7f0c2a1b2c3d4e5f60718',
    });

    expect(xml).toContain('<Dial callerId="+918065300000"');
    expect(xml).toContain('<Number>+919812345678</Number>');
    expect(xml).toContain('recordSession="true"');
    expect(xml).toContain('https://api.example.com/api/webhooks/vobiz/recording?key=a-long-vobiz-secret-1');
    expect(mockCallUpdateOne.mock.calls[0][1].$setOnInsert).toMatchObject({
      executionId: 'cu-1', kind: 'human', direction: 'outbound', phone: '+919812345678', staffName: 'Sagar', name: 'Aarav',
    });
  });

  test('an unknown endpoint or a non-Indian number is rejected', async () => {
    mockEndpointFindOne.mockReturnValue(lean(null));
    const xml = await vobiz.answerCall({ From: 'sip:stranger@registrar.vobiz.ai', To: '+919812345678', CallUUID: 'cu-2' });
    expect(xml).toContain('<Hangup');
    expect(xml).not.toContain('<Dial');
  });

  test('a call to the team number rings every team softphone', async () => {
    mockEndpointFind.mockReturnValue({ select: () => lean([{ username: 'uc1' }, { username: 'uc2' }]) });
    mockLeadFindOne.mockReturnValue(chain(null));

    const xml = await vobiz.answerCall({ From: '919812345678', To: '918065300000', CallUUID: 'cu-3' });

    expect(xml).toContain('<User>sip:uc1@registrar.vobiz.ai</User><User>sip:uc2@registrar.vobiz.ai</User>');
    expect(mockCallUpdateOne.mock.calls[0][1].$setOnInsert).toMatchObject({ direction: 'inbound', phone: '+919812345678' });
  });
});

describe('callbacks', () => {
  test('hangup stores the length and notes the call on the lead', async () => {
    const call = {
      executionId: 'cu-1', direction: 'outbound', staffName: 'Sagar', leadId: 'lead-1', save: jest.fn(),
    };
    mockCallFindOne.mockResolvedValue(call);

    await vobiz.recordHangup({ CallUUID: 'cu-1', BillDuration: '125', HangupCause: 'NORMAL_CLEARING' });

    expect(call).toMatchObject({ status: 'completed', durationSec: 125 });
    const [, update] = mockLeadUpdateOne.mock.calls[0];
    expect(update.$push.activities.comment).toBe('Called by Sagar from the admin softphone (2 min)');
    expect(update.$set.phoneCall).toBe('done');
  });

  test('an unanswered call is marked no-answer', async () => {
    const call = { executionId: 'cu-4', direction: 'outbound', staffName: 'Sagar', save: jest.fn() };
    mockCallFindOne.mockResolvedValue(call);
    await vobiz.recordHangup({ CallUUID: 'cu-4', BillDuration: '0', HangupCause: 'NO_ANSWER' });
    expect(call.status).toBe('no-answer');
  });

  test('recording and transcription land on the call', async () => {
    await vobiz.recordRecording({ CallUUID: 'cu-1', RecordUrl: 'https://media.vobiz.ai/r/1.mp3', RecordingID: 'rec-1' });
    expect(mockCallUpdateOne).toHaveBeenLastCalledWith({ executionId: 'cu-1' }, { $set: { recordingUrl: 'https://media.vobiz.ai/r/1.mp3', recordingId: 'rec-1' } });

    await vobiz.recordTranscription({ recording_id: 'rec-1', transcription: 'Hello, kya main Aarav se baat kar raha hoon?' });
    expect(mockCallUpdateOne).toHaveBeenLastCalledWith({ recordingId: 'rec-1' }, { $set: { transcript: 'Hello, kya main Aarav se baat kar raha hoon?' } });
  });

  test('the webhook secret must match', () => {
    expect(vobiz.secretMatches('a-long-vobiz-secret-1')).toBe(true);
    expect(vobiz.secretMatches('nope')).toBe(false);
  });
});
