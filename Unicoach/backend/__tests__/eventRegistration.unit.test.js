// Event registrations land in Admin → Requests; admin controls the homepage event card (no DB: models mocked, no email sent)
const mockEvents = [];
const mockEventFindOne = jest.fn();
const mockEventUpdateOne = jest.fn();
const mockEventFindById = jest.fn();
const mockEventFindByIdAndUpdate = jest.fn();
const mockEventCreated = [];
const mockSupportCreate = jest.fn();
const mockSupportFind = jest.fn();
const mockSupportCount = jest.fn();
const mockSupportDelete = jest.fn();
const mockLeadFindOne = jest.fn();
const mockLeadSaved = [];
const mockSendEmail = jest.fn();
const mockScoreLeadAI = jest.fn();

jest.mock('../models/Event', () => {
  function Event(data) {
    Object.assign(this, data);
    mockEventCreated.push(data);
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = () => ({ ...data });
  }
  Event.findOne = (...a) => ({ select: () => mockEventFindOne(...a) });
  Event.updateOne = (...a) => mockEventUpdateOne(...a);
  Event.findById = (...a) => mockEventFindById(...a);
  Event.findByIdAndUpdate = (...a) => mockEventFindByIdAndUpdate(...a);
  Event.EVENT_COUNTRIES = jest.requireActual('../models/Event').EVENT_COUNTRIES;
  return Event;
});
jest.mock('../models/Lead', () => {
  function Lead(data) {
    Object.assign(this, data);
    this.save = jest.fn(async () => { mockLeadSaved.push(this); return this; });
  }
  Lead.findOne = (...a) => mockLeadFindOne(...a);
  return Lead;
});
jest.mock('../models/SupportRequest', () => ({
  create: (...a) => mockSupportCreate(...a),
  find: (...a) => mockSupportFind(...a),
  countDocuments: (...a) => mockSupportCount(...a),
  findByIdAndDelete: (...a) => mockSupportDelete(...a),
}));
jest.mock('../models/Blog', () => ({ findById: async () => null }));
jest.mock('../models/News', () => ({ findById: async () => null }));
jest.mock('../models/Digest', () => ({ findById: async () => null }));
jest.mock('../utils/twilio', () => ({ normalizePhone: (p) => p.replace(/[^\d+]/g, '') }));
jest.mock('../utils/aiService', () => ({
  scoreLeadAI: (...a) => mockScoreLeadAI(...a),
  callLLM: jest.fn(),
  cleanJsonResponse: jest.fn(),
}));
jest.mock('../utils/email', () => ({ sendEmail: (...a) => mockSendEmail(...a) }));
jest.mock('../utils/cache', () => ({ clearCache: jest.fn() }));
jest.mock('../utils/docxParser', () => ({ parseDocx: jest.fn() }));

const mongoose = require('mongoose');
const { registerForEvent } = require('../controllers/eventController');
const { getAllSupportRequests, exportSupportRequestsCsv, deleteSupportRequest } = require('../controllers/supportRequestController');
const { createContent, updateContent } = require('../controllers/adminContentController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn();
  res.send = jest.fn(() => res);
  return res;
};
const flush = () => new Promise((resolve) => setImmediate(resolve));
const body = (res) => res.json.mock.calls[0][0];

const EVENT_ID = new mongoose.Types.ObjectId();
const irelandEvent = {
  _id: EVENT_ID,
  title: 'Ireland Career Webinar',
  slug: 'ireland-career-webinar',
  eventStart: new Date('2026-10-20T13:00:00Z'), // 6:30 pm IST
  eventEnd: new Date('2026-10-20T14:00:00Z'),
  location: 'Online (Zoom)',
  country: 'Ireland',
  published: true,
};
const draftEvent = { ...irelandEvent, _id: new mongoose.Types.ObjectId(), slug: 'draft-event', published: false };
const endedEvent = {
  ...irelandEvent,
  _id: new mongoose.Types.ObjectId(),
  slug: 'ended-event',
  eventStart: new Date('2026-10-01T13:00:00Z'),
  eventEnd: new Date('2026-10-01T14:00:00Z'),
};
const startedNoEndEvent = { ...endedEvent, _id: new mongoose.Types.ObjectId(), slug: 'started-no-end', eventEnd: undefined };
const undatedEvent = { ...irelandEvent, _id: new mongoose.Types.ObjectId(), slug: 'date-tba', eventStart: undefined, eventEnd: undefined };
// "Now" for every test, so the fixed event dates above stay upcoming / ended
const NOW = new Date('2026-10-05T10:00:00Z').getTime();

const student = { name: 'Priya Sharma', email: 'Priya@Example.com ', phone: '+91 98765 43210', intake: 'Fall 2027' };
const register = async (id, data = student) => {
  const res = makeRes();
  await registerForEvent({ params: { id }, body: data }, res);
  return res;
};

let warnSpy;
let errorSpy;
let nowSpy;
beforeEach(() => {
  [mockEventFindOne, mockEventUpdateOne, mockEventFindById, mockEventFindByIdAndUpdate, mockSupportCreate,
    mockSupportFind, mockSupportCount, mockSupportDelete, mockLeadFindOne, mockSendEmail, mockScoreLeadAI].forEach((m) => m.mockReset());
  mockEvents.length = 0;
  mockEvents.push(irelandEvent, draftEvent, endedEvent, startedNoEndEvent, undatedEvent);
  mockEventCreated.length = 0;
  mockLeadSaved.length = 0;

  // Behaves like the DB for the query the controller builds: id or slug match, and only published events
  mockEventFindOne.mockImplementation(async (query) => mockEvents.find((ev) => {
    const matches = query.$or.some((c) => (c._id && String(c._id) === String(ev._id)) || c.slug === ev.slug);
    return matches && (query.published !== true || ev.published);
  }) || null);
  mockEventUpdateOne.mockResolvedValue({ acknowledged: true, matchedCount: 1, modifiedCount: 1 });
  mockSupportCreate.mockResolvedValue({ _id: 'req1' });
  mockLeadFindOne.mockResolvedValue(null);
  mockScoreLeadAI.mockResolvedValue({ score: 82, category: 'Hot', rationale: 'Upcoming intake' });
  mockSendEmail.mockResolvedValue({ messageId: 'm1' });

  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  nowSpy.mockRestore();
});

describe('POST /api/events/:id/register', () => {
  test.each([
    ['missing name', { ...student, name: '   ' }],
    ['name over 100 chars', { ...student, name: 'x'.repeat(101) }],
    ['invalid email', { ...student, email: 'priya@' }],
    ['non-string email', { ...student, email: { $gt: '' } }],
    ['phone too short', { ...student, phone: '12345' }],
    ['phone too long', { ...student, phone: '+91 98765 43210 1234567' }],
    ['phone without digits', { ...student, phone: 'call me later' }],
  ])('400 for %s, without touching the event', async (_label, data) => {
    const res = await register(irelandEvent.slug, data);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(typeof body(res).error).toBe('string');
    expect(mockEventFindOne).not.toHaveBeenCalled();
    expect(mockSupportCreate).not.toHaveBeenCalled();
  });

  test('404 for an unknown event (no generic webinar fallback)', async () => {
    const res = await register('no-such-event');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(body(res)).toEqual({ error: 'Event not found' });
    expect(mockEventUpdateOne).not.toHaveBeenCalled();
    expect(mockSupportCreate).not.toHaveBeenCalled();
    expect(mockLeadFindOne).not.toHaveBeenCalled();
  });

  test('404 for an unpublished event; the lookup only matches published, already-live events', async () => {
    const res = await register(String(draftEvent._id));
    expect(res.status).toHaveBeenCalledWith(404);
    const query = mockEventFindOne.mock.calls[0][0];
    expect(query.published).toBe(true);
    expect(JSON.stringify(query.$and)).toContain('publishDate');
    expect(mockSupportCreate).not.toHaveBeenCalled();
  });

  test.each([
    ['ended (end time passed)', endedEvent],
    ['started, with no end time', startedNoEndEvent],
  ])('410 for an event that has %s: no seat, request, lead or email', async (_label, ev) => {
    const res = await register(ev.slug);
    await flush();
    expect(res.status).toHaveBeenCalledWith(410);
    expect(body(res)).toEqual({ error: 'This event has ended' });
    expect(mockEventUpdateOne).not.toHaveBeenCalled();
    expect(mockSupportCreate).not.toHaveBeenCalled();
    expect(mockLeadFindOne).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test('an event with no date yet stays open for registration', async () => {
    const res = await register(undatedEvent.slug);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockSupportCreate.mock.calls[0][0].message).toContain('Date & time: Not scheduled yet');
  });

  test('first registration: seat on the event + Event Registration request + lead + email, 201', async () => {
    const res = await register(irelandEvent.slug);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(body(res)).toEqual({
      success: true,
      alreadyRegistered: false,
      message: 'Successfully registered for "Ireland Career Webinar"!',
      event: {
        _id: EVENT_ID,
        title: 'Ireland Career Webinar',
        slug: 'ireland-career-webinar',
        eventStart: irelandEvent.eventStart,
        eventEnd: irelandEvent.eventEnd,
        location: 'Online (Zoom)',
      },
    });

    // Atomic seat: only added when this email is not registered yet
    const [filter, update] = mockEventUpdateOne.mock.calls[0];
    expect(filter).toEqual({ _id: EVENT_ID, 'attendees.email': { $ne: 'priya@example.com' } });
    expect(update.$inc).toEqual({ registrationCount: 1 });
    expect(update.$push.attendees).toMatchObject({ name: 'Priya Sharma', email: 'priya@example.com', phone: '+919876543210', intake: 'Fall 2027' });

    expect(mockSupportCreate).toHaveBeenCalledTimes(1);
    const request = mockSupportCreate.mock.calls[0][0];
    expect(request).toMatchObject({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876543210',
      category: 'Event Registration',
      eventId: EVENT_ID,
      eventTitle: 'Ireland Career Webinar',
      eventStart: irelandEvent.eventStart,
      intake: 'Fall 2027',
      status: 'New',
    });
    expect(request.message).toContain('Event: Ireland Career Webinar');
    expect(request.message).toContain('Date & time: 20 Oct 2026, 6:30 pm IST');
    expect(request.message).toContain('\nIntake: Fall 2027');
    expect(request.message).toContain(`Event ID: ${EVENT_ID}`);

    await flush();
    expect(mockLeadSaved).toHaveLength(1);
    const lead = mockLeadSaved[0];
    expect(lead).toMatchObject({
      name: 'Priya Sharma', email: 'priya@example.com', phone: '+919876543210',
      source: 'Event: Ireland Career Webinar', latestSource: 'Event: Ireland Career Webinar',
      preferredIntake: 'Fall 2027', dreamCountry: 'Ireland',
    });
    expect(mockScoreLeadAI).toHaveBeenCalledWith({ lead });
    expect(lead.aiScoring).toMatchObject({ score: 82, category: 'Hot' });

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const mail = mockSendEmail.mock.calls[0][0];
    expect(mail.to).toBe('priya@example.com');
    expect(mail.subject).toBe("You're registered: Ireland Career Webinar");
    expect(mail.html).toContain('20 Oct 2026, 6:30 pm IST');
    expect(mail.html).toContain("We'll share the joining details with you before the event.");
  });

  test('registration by ObjectId works, and user text in the email is escaped', async () => {
    const res = await register(String(EVENT_ID), { ...student, name: 'Priya <img src=x onerror=alert(1)>' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockEventFindOne.mock.calls[0][0].$or).toContainEqual({ _id: String(EVENT_ID) });
    await flush();
    const { html } = mockSendEmail.mock.calls[0][0];
    expect(html).toContain('Priya &lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img');
  });

  test('duplicate email: 200 alreadyRegistered, no second request, lead or email', async () => {
    mockEventUpdateOne.mockResolvedValue({ acknowledged: true, matchedCount: 0, modifiedCount: 0 });
    const res = await register(irelandEvent.slug);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(body(res)).toMatchObject({ success: true, alreadyRegistered: true, event: { _id: EVENT_ID, title: 'Ireland Career Webinar' } });
    expect(mockSupportCreate).not.toHaveBeenCalled();
    expect(mockLeadFindOne).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test('existing lead keeps its identity and gets the event as latest enquiry', async () => {
    const existing = {
      _id: 'lead1', name: 'Priya S', email: 'priya@example.com', phone: '+919876543210', source: 'Login - Google',
      dreamCountry: 'Canada', totalInquiries: 2, status: 'closed', activities: [], save: jest.fn(),
    };
    mockLeadFindOne.mockResolvedValue(existing);
    await register(irelandEvent.slug);
    await flush();

    expect(mockLeadFindOne.mock.calls[0][0]).toEqual({ $or: [{ phone: '+919876543210' }, { email: 'priya@example.com' }] });
    expect(existing).toMatchObject({
      name: 'Priya S', source: 'Login - Google', dreamCountry: 'Canada',
      latestSource: 'Event: Ireland Career Webinar', totalInquiries: 3, status: 'new', preferredIntake: 'Fall 2027',
    });
    expect(existing.activities[0].comment).toBe('Registered for event: "Ireland Career Webinar" (20 Oct 2026, 6:30 pm IST)');
    expect(existing.save).toHaveBeenCalled();
  });

  test.each([
    ['rejects', () => mockSendEmail.mockRejectedValue(new Error('Resend down'))],
    ['throws', () => mockSendEmail.mockImplementation(() => { throw new Error('not configured'); })],
    ['never settles', () => mockSendEmail.mockReturnValue(new Promise(() => {}))],
  ])('email that %s does not fail or delay the registration', async (_label, setup) => {
    setup();
    const res = await register(irelandEvent.slug);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(body(res).success).toBe(true);
    expect(mockSupportCreate).toHaveBeenCalledTimes(1);
    await flush();
    expect(mockLeadSaved).toHaveLength(1);
  });

  test('CRM lead failure does not fail the registration', async () => {
    mockLeadFindOne.mockRejectedValue(new Error('lead lookup failed'));
    const res = await register(irelandEvent.slug);
    await flush();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  test('if the Requests entry cannot be saved, the seat is released and the API returns 500', async () => {
    mockSupportCreate.mockRejectedValue(new Error('write failed'));
    const res = await register(irelandEvent.slug);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(body(res)).toEqual({ error: 'Failed to register for event' });
    const [filter, update] = mockEventUpdateOne.mock.calls[1];
    expect(filter).toEqual({ _id: EVENT_ID });
    expect(update).toEqual({ $pull: { attendees: { email: 'priya@example.com' } }, $inc: { registrationCount: -1 } });
    await flush();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('Support Requests admin API: event filter and export', () => {
  const OTHER_ID = new mongoose.Types.ObjectId();
  const allDocs = [
    { category: 'Consultation Booking', status: 'New' },
    { category: 'Event Registration', status: 'New', eventId: OTHER_ID, eventTitle: 'UK Tech Jobs', eventStart: new Date('2026-09-01T12:00:00Z') },
    { category: 'Event Registration', status: 'New', eventId: EVENT_ID, eventTitle: 'Ireland Career Webinar', eventStart: irelandEvent.eventStart },
    { category: 'Event Registration', status: 'Replied', eventId: EVENT_ID, eventTitle: 'Ireland Career Webinar', eventStart: irelandEvent.eventStart },
  ];

  const mockList = (requests) => {
    mockSupportFind.mockImplementation((query, projection) => (projection
      ? Promise.resolve(allDocs)
      : { sort: () => ({ skip: () => ({ limit: () => Promise.resolve(requests) }) }) }));
    mockSupportCount.mockResolvedValue(0);
  };

  test('?eventId filters the list; eventCounts lists every event, newest event first', async () => {
    mockList([allDocs[2], allDocs[3]]);
    const res = makeRes();
    await getAllSupportRequests({ query: { eventId: String(EVENT_ID), category: 'Event Registration' } }, res);

    const listQuery = mockSupportFind.mock.calls.find((c) => !c[1])[0];
    expect(listQuery).toEqual({ category: /Event Registration/i, eventId: String(EVENT_ID) });

    const data = body(res);
    expect(data.requests).toHaveLength(2);
    const expected = [
      { eventId: String(EVENT_ID), eventTitle: 'Ireland Career Webinar', eventStart: irelandEvent.eventStart, count: 2 },
      { eventId: String(OTHER_ID), eventTitle: 'UK Tech Jobs', eventStart: allDocs[1].eventStart, count: 1 },
    ];
    expect(data.eventCounts).toEqual(expected);
    expect(data.stats.eventCounts).toEqual(expected);
    expect(data.stats.categoryCounts).toEqual({ 'Consultation Booking': 1, 'Event Registration': 3 });
  });

  test('no eventId (or "all") means no event filter; a malformed eventId is a 400', async () => {
    mockList([]);
    await getAllSupportRequests({ query: { eventId: 'all' } }, makeRes());
    expect(mockSupportFind.mock.calls.find((c) => !c[1])[0]).toEqual({});

    const bad = makeRes();
    await getAllSupportRequests({ query: { eventId: 'not-an-id' } }, bad);
    expect(bad.status).toHaveBeenCalledWith(400);
  });

  test('CSV export filters by event and adds Event, Event Date (IST) and Intake columns', async () => {
    const docs = [{
      _id: 'r1', name: '=HYPERLINK("http://evil")', email: 'priya@example.com', phone: '+919876543210',
      category: 'Event Registration', status: 'New', isBooked: false, eventTitle: 'Ireland Career Webinar',
      eventStart: irelandEvent.eventStart, intake: 'Fall 2027', message: 'Event: Ireland Career Webinar\nIntake: Fall 2027',
      createdAt: new Date('2026-10-05T10:00:00Z'),
    }];
    mockSupportFind.mockReturnValue({ sort: () => Promise.resolve(docs) });

    const res = makeRes();
    await exportSupportRequestsCsv({ query: { eventId: String(EVENT_ID), category: 'Event Registration' } }, res);

    expect(mockSupportFind.mock.calls[0][0]).toEqual({ category: /Event Registration/i, eventId: String(EVENT_ID) });
    expect(res.send.mock.calls[0][0].charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM for Excel
    const csv = res.send.mock.calls[0][0].replace(/^\uFEFF/, '');
    const [header, row] = csv.split('\n');
    expect(header).toBe('ID,Name,Email,Phone,Category,Status,IsBooked,Event,Event Date (IST),Intake,Message,Created At');
    expect(row).toBe([
      'r1', '"\'=HYPERLINK(""http://evil"")"', '"priya@example.com"', '"+919876543210"', '"Event Registration"', '"New"', 'No',
      '"Ireland Career Webinar"', '"2026-10-20 18:30"', '"Fall 2027"', '"Event: Ireland Career Webinar Intake: Fall 2027"',
      '2026-10-05T10:00:00.000Z',
    ].join(','));
  });

  test('CSV export rejects a malformed eventId', async () => {
    const res = makeRes();
    await exportSupportRequestsCsv({ query: { eventId: '{"$ne":null}' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockSupportFind).not.toHaveBeenCalled();
  });

  test('CSV export matches categories like the admin tabs: the "Other" tab exports "Other Inquiry"', async () => {
    mockSupportFind.mockReturnValue({ sort: () => Promise.resolve([]) });
    await exportSupportRequestsCsv({ query: { category: 'Other' } }, makeRes());
    const { category } = mockSupportFind.mock.calls[0][0];
    expect(category.test('Other Inquiry')).toBe(true);
    expect(category.test('other inquiry')).toBe(true);
    expect(category.test('Visa Counseling')).toBe(false);

    // Special characters are literal, and a non-string (e.g. ?category[$ne]=x) is not a filter
    await exportSupportRequestsCsv({ query: { category: 'SOP & Resume (Review)' } }, makeRes());
    expect(mockSupportFind.mock.calls[1][0].category.test('SOP & Resume (Review)')).toBe(true);
    await exportSupportRequestsCsv({ query: { category: { $ne: 'x' } } }, makeRes());
    expect(mockSupportFind.mock.calls[2][0]).toEqual({});
  });
});

describe('Deleting an event registration request', () => {
  test('also takes the student off the event, so the count matches and they can register again', async () => {
    mockSupportDelete.mockResolvedValue({ _id: 'r1', email: 'priya@example.com', category: 'Event Registration', eventId: EVENT_ID });
    mockEventUpdateOne.mockResolvedValue({ modifiedCount: 1 });
    const res = makeRes();
    await deleteSupportRequest({ params: { id: 'r1' } }, res);

    expect(mockEventUpdateOne).toHaveBeenCalledWith(
      { _id: EVENT_ID, 'attendees.email': 'priya@example.com' },
      { $pull: { attendees: { email: 'priya@example.com' } }, $inc: { registrationCount: -1 } }
    );
    expect(body(res)).toMatchObject({ success: true });
  });

  test('other requests leave events alone; a failed seat release still reports the delete', async () => {
    mockSupportDelete.mockResolvedValue({ _id: 'r2', email: 'a@b.com', category: 'Visa Counseling' });
    await deleteSupportRequest({ params: { id: 'r2' } }, makeRes());
    expect(mockEventUpdateOne).not.toHaveBeenCalled();

    mockSupportDelete.mockResolvedValue({ _id: 'r3', email: 'a@b.com', eventId: EVENT_ID });
    mockEventUpdateOne.mockRejectedValue(new Error('db down'));
    const res = makeRes();
    await deleteSupportRequest({ params: { id: 'r3' } }, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(body(res)).toMatchObject({ success: true });
  });

  test('404 when the request does not exist', async () => {
    mockSupportDelete.mockResolvedValue(null);
    const res = makeRes();
    await deleteSupportRequest({ params: { id: 'missing' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(mockEventUpdateOne).not.toHaveBeenCalled();
  });
});

describe('Admin → Events saves the homepage card fields', () => {
  const cardFields = {
    country: 'Ireland',
    speakerRole: '  Career Guide Expert, Ireland ',
    speakerPhoto: '/uploads/speakers/aoife.jpg',
    ctaLabel: 'Save my seat',
    showOnHomepage: false,
    homepageOrder: 2,
    registrationLink: '   ',
  };

  test('create stores the new event fields (cleaned)', async () => {
    const res = makeRes();
    await createContent({ user: { id: 'admin1' }, body: { type: 'event', title: 'Ireland Career Webinar', sections: [], ...cardFields } }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockEventCreated[0]).toMatchObject({
      country: 'Ireland',
      speakerRole: 'Career Guide Expert, Ireland',
      speakerPhoto: '/uploads/speakers/aoife.jpg',
      ctaLabel: 'Save my seat',
      showOnHomepage: false,
      homepageOrder: 2,
      registrationLink: '', // blank link = collect registrations on UniCoach
    });
  });

  test('create drops invalid values instead of failing', async () => {
    await createContent({
      user: { id: 'admin1' },
      body: {
        type: 'event', title: 'X', sections: [], country: 'Atlantis', speakerPhoto: 'javascript:alert(1)',
        ctaLabel: 'y'.repeat(60), homepageOrder: '', showOnHomepage: 'true',
      },
    }, makeRes());
    expect(mockEventCreated[0]).toMatchObject({ country: '', speakerPhoto: '', ctaLabel: 'y'.repeat(40), homepageOrder: null, showOnHomepage: true });
  });

  test('update saves the fields and never overwrites registrations', async () => {
    mockEventFindById.mockResolvedValue({ _id: EVENT_ID });
    mockEventFindByIdAndUpdate.mockImplementation(async (_id, updates) => ({ toObject: () => ({ _id: EVENT_ID, ...updates }) }));

    const res = makeRes();
    await updateContent({
      params: { id: String(EVENT_ID) },
      body: { type: 'event', title: 'Ireland Career Webinar', ...cardFields, homepageOrder: '1', attendees: [], registrationCount: 0 },
    }, res);

    const [id, updates] = mockEventFindByIdAndUpdate.mock.calls[0];
    expect(id).toBe(String(EVENT_ID));
    expect(updates).toMatchObject({
      country: 'Ireland', speakerRole: 'Career Guide Expert, Ireland', speakerPhoto: '/uploads/speakers/aoife.jpg',
      ctaLabel: 'Save my seat', showOnHomepage: false, homepageOrder: 1, registrationLink: '',
    });
    expect(updates).not.toHaveProperty('attendees');
    expect(updates).not.toHaveProperty('registrationCount');
    expect(body(res)).toMatchObject({ type: 'event', country: 'Ireland' });
  });

  test('a partial update only touches the fields it sends; clearing the order sets null', async () => {
    mockEventFindById.mockResolvedValue({ _id: EVENT_ID });
    mockEventFindByIdAndUpdate.mockResolvedValue({ toObject: () => ({}) });
    await updateContent({ params: { id: String(EVENT_ID) }, body: { showOnHomepage: true, homepageOrder: null } }, makeRes());
    expect(mockEventFindByIdAndUpdate.mock.calls[0][1]).toEqual({ showOnHomepage: true, homepageOrder: null });
  });
});

describe('Event detail page fields (host bio, social links, who should attend)', () => {
  test('create keeps http(s) host links only, trims the bio to 1000 chars and cleans the audience list', async () => {
    await createContent({
      user: { id: 'admin1' },
      body: {
        type: 'event', title: 'UK Masters Webinar', sections: [],
        speakerBio: `  ${'b'.repeat(1200)}`,
        speakerLinks: {
          linkedin: ' https://www.linkedin.com/in/aoife ',
          instagram: 'javascript:alert(1)',
          twitter: 'x.com/aoife', // no scheme: dropped
          youtube: 'http://youtube.com/@aoife',
          website: 'data:text/html,hi',
          extra: 'https://evil.example',
        },
        whoShouldAttend: ['  Final-year students ', '', 42, 'Working professionals'],
      },
    }, makeRes());

    const saved = mockEventCreated[0];
    expect(saved.speakerBio).toBe('b'.repeat(1000));
    expect(saved.speakerLinks).toEqual({
      linkedin: 'https://www.linkedin.com/in/aoife',
      instagram: '',
      twitter: '',
      youtube: 'http://youtube.com/@aoife',
      website: '',
    });
    expect(saved.whoShouldAttend).toEqual(['Final-year students', 'Working professionals']);
  });

  test('update accepts the audience as one-per-line text and leaves unsent fields alone', async () => {
    mockEventFindById.mockResolvedValue({ _id: EVENT_ID });
    mockEventFindByIdAndUpdate.mockResolvedValue({ toObject: () => ({}) });
    await updateContent({
      params: { id: String(EVENT_ID) },
      body: { whoShouldAttend: 'Class 12 students\n\n  Parents  ', speakerLinks: 'not-an-object' },
    }, makeRes());
    expect(mockEventFindByIdAndUpdate.mock.calls[0][1]).toEqual({
      whoShouldAttend: ['Class 12 students', 'Parents'],
      speakerLinks: { linkedin: '', instagram: '', twitter: '', youtube: '', website: '' },
    });
  });

  test('GET /api/events/:idOrSlug returns the detail fields and never the attendee list', async () => {
    const Event = require('../models/Event');
    const { getEventByIdOrSlug } = require('../controllers/eventController');
    const doc = {
      _id: EVENT_ID, slug: 'uk-masters-webinar', title: 'UK Masters Webinar',
      speakerBio: 'Bio', speakerLinks: { linkedin: 'https://linkedin.com/in/a' }, whoShouldAttend: ['Students'],
    };
    const select = jest.fn(() => ({ populate: async () => doc }));
    const original = Event.findOne;
    Event.findOne = jest.fn(() => ({ select }));
    try {
      const res = makeRes();
      await getEventByIdOrSlug({ params: { id: 'uk-masters-webinar' } }, res);
      expect(select).toHaveBeenCalledWith('-attendees');
      expect(Event.findOne.mock.calls[0][0]).toMatchObject({ published: true });
      expect(body(res)).toMatchObject({ speakerBio: 'Bio', whoShouldAttend: ['Students'] });
    } finally {
      Event.findOne = original;
    }
  });
});
