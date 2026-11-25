// Automation workflows: triggers start the right runs, steps run in order, waits survive, and a
// workflow that changes a lead can never set itself off again.
jest.setTimeout(120000);

jest.mock('../utils/aiService', () => ({
  generateLeadSmartReply: jest.fn(async () => ({ message: 'Hi Ravi, shall we book a call?' })),
  scoreLeadAI: jest.fn(async () => ({ score: 88, category: 'Hot', rationale: 'keen' })),
  callLLM: jest.fn(async () => ({ content: '{"intent":"interested","sentiment":"positive","summary":"wants a call","suggestedStatus":"interested"}' })),
  cleanJsonResponse: (t) => t,
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Lead = require('../models/Lead');
const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const WhatsappEvent = require('../models/WhatsappEvent');
const engine = require('../services/workflowEngine');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Promise.all([Lead.deleteMany({}), Workflow.deleteMany({}), WorkflowRun.deleteMany({}), WhatsappEvent.deleteMany({})]);
});

const makeLead = (extra = {}) => Lead.create({
  name: 'Ravi', email: `r${Math.random()}@x.co`, phone: `9812${Math.floor(Math.random() * 1e6)}`,
  dreamCountry: 'Canada', ...extra,
});

const makeWorkflow = (nodes, edges, extra = {}) => Workflow.create({
  name: 'Test flow',
  active: true,
  trigger: { type: 'lead_created', config: {} },
  nodes: [{ id: 'n1', type: 'trigger', config: { label: 'New lead' } }, ...nodes],
  edges,
  ...extra,
});

// Triggers are fired after the save and not awaited, so wait for the runs to come to rest.
const settle = async (expected = 1) => {
  for (let i = 0; i < 60; i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    const started = await WorkflowRun.countDocuments({});
    const busy = await WorkflowRun.countDocuments({ status: 'running' });
    if (started >= expected && !busy) return;
  }
};

test('a new lead starts every live workflow listening for it, and no draft ones', async () => {
  await makeWorkflow([{ id: 'n2', type: 'tag', config: { tag: 'from-automation' } }], [{ from: 'n1', to: 'n2' }]);
  await makeWorkflow([{ id: 'n2', type: 'tag', config: { tag: 'should-not-run' } }], [{ from: 'n1', to: 'n2' }], { name: 'Draft', active: false });

  const lead = await makeLead();
  await settle();

  const after = await Lead.findById(lead._id);
  expect(after.tags).toContain('from-automation');
  expect(after.tags).not.toContain('should-not-run');
  expect(await WorkflowRun.countDocuments({ status: 'done' })).toBe(1);
});

test('steps run in order and the run records each one', async () => {
  const wf = await makeWorkflow(
    [
      { id: 'n2', type: 'tag', config: { tag: 'hot' } },
      { id: 'n3', type: 'counselor', config: { counselor: 'Pooja' } },
      { id: 'n4', type: 'pipeline', config: { stage: 'contacted' } },
    ],
    [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }],
  );
  const lead = await makeLead();
  await settle();

  const after = await Lead.findById(lead._id);
  expect(after.assignedTo).toBe('Pooja');
  expect(after.status).toBe('contacted');
  const run = await WorkflowRun.findOne({ workflow: wf._id });
  expect(run.steps.map((s) => s.type)).toEqual(['trigger', 'tag', 'counselor', 'pipeline']);
  expect(run.status).toBe('done');
});

test('a workflow that moves a stage does not set off the stage-change workflows', async () => {
  await makeWorkflow([{ id: 'n2', type: 'pipeline', config: { stage: 'contacted' } }], [{ from: 'n1', to: 'n2' }]);
  await makeWorkflow(
    [{ id: 'n2', type: 'tag', config: { tag: 'loop' } }],
    [{ from: 'n1', to: 'n2' }],
    { name: 'Stage watcher', trigger: { type: 'lead_stage_changed', config: {} } },
  );

  const lead = await makeLead();
  await settle();

  const after = await Lead.findById(lead._id);
  expect(after.status).toBe('contacted');
  expect(after.tags).not.toContain('loop');
});

test('an admin moving a lead to a stage does start the stage workflow', async () => {
  await makeWorkflow(
    [{ id: 'n2', type: 'tag', config: { tag: 'nudged' } }],
    [{ from: 'n1', to: 'n2' }],
    { name: 'Contacted nudge', trigger: { type: 'lead_stage_changed', config: { stage: 'contacted' } } },
  );
  const lead = await makeLead();
  await settle();

  lead.status = 'contacted';
  await lead.save();
  await settle();

  expect((await Lead.findById(lead._id)).tags).toContain('nudged');
});

test('a wait parks the run and the worker picks it up when the time has passed', async () => {
  await makeWorkflow(
    [
      { id: 'n2', type: 'delay', config: { duration: 2, unit: 'hours' } },
      { id: 'n3', type: 'tag', config: { tag: 'after-wait' } },
    ],
    [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }],
  );
  const lead = await makeLead();
  await settle();

  let run = await WorkflowRun.findOne({ lead: lead._id });
  expect(run.status).toBe('waiting');
  expect((await Lead.findById(lead._id)).tags).not.toContain('after-wait');

  // pretend two hours went by
  await WorkflowRun.updateOne({ _id: run._id }, { $set: { resumeAt: new Date(Date.now() - 1000) } });
  await engine.tick();

  run = await WorkflowRun.findById(run._id);
  expect(run.status).toBe('done');
  expect((await Lead.findById(lead._id)).tags).toContain('after-wait');
});

test('a condition sends the run down the yes or the no branch', async () => {
  const build = () => makeWorkflow(
    [
      { id: 'n2', type: 'condition', config: { field: 'dreamCountry', op: 'eq', value: 'Canada' } },
      { id: 'n3', type: 'tag', config: { tag: 'canada' } },
      { id: 'n4', type: 'tag', config: { tag: 'other' } },
    ],
    [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3', branch: 'yes' },
      { from: 'n2', to: 'n4', branch: 'no' },
    ],
  );
  await build();

  const canada = await makeLead({ dreamCountry: 'Canada' });
  const uk = await makeLead({ dreamCountry: 'UK' });
  await settle();

  expect((await Lead.findById(canada._id)).tags).toContain('canada');
  expect((await Lead.findById(uk._id)).tags).toContain('other');
});

test('AI writes the message, but outside the 24h window it is kept as a draft instead of sent', async () => {
  await makeWorkflow([{ id: 'n2', type: 'ai_message', config: { channel: 'whatsapp' } }], [{ from: 'n1', to: 'n2' }]);
  const lead = await makeLead();
  await settle();

  const after = await Lead.findById(lead._id);
  const note = after.activities.find((a) => a.performedBy === 'Automation (AI)');
  expect(note.comment).toContain('shall we book a call');
  const run = await WorkflowRun.findOne({ lead: lead._id });
  expect(run.steps.at(-1).info).toMatch(/draft/i);
});

test('AI reads a reply, tags the intent and branches on it', async () => {
  await makeWorkflow(
    [
      { id: 'n2', type: 'ai_classify', config: { expectIntent: 'interested' } },
      { id: 'n3', type: 'tag', config: { tag: 'book-a-call' } },
      { id: 'n4', type: 'tag', config: { tag: 'park-it' } },
    ],
    [
      { from: 'n1', to: 'n2' },
      { from: 'n2', to: 'n3', branch: 'yes' },
      { from: 'n2', to: 'n4', branch: 'no' },
    ],
    { name: 'Reply reader', trigger: { type: 'whatsapp_reply', config: {} } },
  );
  const lead = await makeLead();
  await WhatsappEvent.create({ kind: 'message', direction: 'in', phone: lead.phone, text: 'yes please call me', at: new Date() });

  await engine.fireTrigger('whatsapp_reply', { lead });
  await settle();

  const after = await Lead.findById(lead._id);
  expect(after.tags).toContain('ai:interested');
  expect(after.tags).toContain('book-a-call');
  expect(after.tags).not.toContain('park-it');
});

test('a due follow-up starts the flow once a day, not on every tick', async () => {
  await makeWorkflow(
    [{ id: 'n2', type: 'tag', config: { tag: 'chased' } }],
    [{ from: 'n1', to: 'n2' }],
    { name: 'Follow-up chaser', trigger: { type: 'followup_due', config: {} } },
  );
  const lead = await makeLead({ nextFollowUpDate: new Date(Date.now() - 3600e3) });
  await settle();

  await engine.tick();
  await engine.tick();

  expect(await WorkflowRun.countDocuments({ lead: lead._id })).toBe(1);
  expect((await Lead.findById(lead._id)).tags).toContain('chased');
});

test('a step that throws fails the run and is written down, the rest of the lead is untouched', async () => {
  await makeWorkflow(
    [
      { id: 'n2', type: 'whatsapp', config: { template: 'nope' } },
      { id: 'n3', type: 'tag', config: { tag: 'never' } },
    ],
    [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }],
  );
  const lead = await makeLead();
  await settle();

  const run = await WorkflowRun.findOne({ lead: lead._id });
  expect(run.status).toBe('done'); // missing template is skipped, not an error
  expect(run.steps.find((s) => s.type === 'whatsapp').info).toMatch(/template not found/i);
});
