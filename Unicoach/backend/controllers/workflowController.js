const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const Lead = require('../models/Lead');
const engine = require('../services/workflowEngine');

const adminName = (req) => req.admin?.name || req.user?.name || req.user?.email || 'Admin';

// The steps the builder may offer. The admin page reads this so the two can never drift apart.
const NODE_CATALOG = [
  { type: 'email', label: 'Send Email', group: 'message', fields: ['subject', 'body'] },
  { type: 'whatsapp', label: 'Send WhatsApp Template', group: 'message', fields: ['template', 'params'] },
  { type: 'ai_message', label: 'AI: Write & Send Message', group: 'ai', fields: ['channel', 'goal', 'customPrompt'] },
  { type: 'ai_classify', label: 'AI: Read Student Reply', group: 'ai', fields: ['expectIntent', 'apply'] },
  { type: 'ai_score', label: 'AI: Score Lead', group: 'ai', fields: [] },
  { type: 'pipeline', label: 'Move Pipeline Stage', group: 'crm', fields: ['stage'] },
  { type: 'counselor', label: 'Assign Counselor', group: 'crm', fields: ['counselor'] },
  { type: 'tag', label: 'Add Tag', group: 'crm', fields: ['tag'] },
  { type: 'note', label: 'Add Note', group: 'crm', fields: ['message'] },
  { type: 'delay', label: 'Wait / Delay', group: 'flow', fields: ['duration', 'unit'] },
  { type: 'condition', label: 'If / Condition', group: 'flow', fields: ['field', 'op', 'value'] },
  { type: 'webhook', label: 'Webhook', group: 'flow', fields: ['url'] },
];

const TRIGGER_CATALOG = [
  { type: 'lead_created', label: 'New lead comes in', fields: ['source'] },
  { type: 'lead_stage_changed', label: 'Lead moves to a stage', fields: ['stage'] },
  { type: 'followup_due', label: 'Follow-up date is due', fields: [] },
  { type: 'no_reply', label: 'Lead went quiet for N days', fields: ['days'] },
  { type: 'whatsapp_reply', label: 'Student replies on WhatsApp', fields: [] },
  { type: 'manual', label: 'Only when I run it by hand', fields: [] },
];

exports.catalog = async (_req, res) => res.json({ nodes: NODE_CATALOG, triggers: TRIGGER_CATALOG });

exports.list = async (_req, res) => {
  try {
    const workflows = await Workflow.find().sort({ updatedAt: -1 }).lean();
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const wf = await Workflow.findById(req.params.id).lean();
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    const runs = await WorkflowRun.find({ workflow: wf._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ ...wf, recentRuns: runs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description = '', trigger } = req.body;
    if (!String(name || '').trim()) return res.status(400).json({ error: 'Name is required' });
    const wf = await Workflow.create({
      name: String(name).trim(),
      description,
      active: false,
      trigger: trigger || { type: 'lead_created', config: {} },
      nodes: [{ id: 'n1', type: 'trigger', x: 60, y: 40, config: { label: 'When a new lead comes in' } }],
      edges: [],
      createdBy: adminName(req),
    });
    res.status(201).json(wf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const allowed = ['name', 'description', 'nodes', 'edges', 'trigger', 'active'];
    const patch = { updatedBy: adminName(req) };
    for (const key of allowed) if (key in req.body) patch[key] = req.body[key];

    // Keep the trigger node's label in step with the trigger itself
    if (patch.trigger?.type && Array.isArray(patch.nodes)) {
      const label = TRIGGER_CATALOG.find((t) => t.type === patch.trigger.type)?.label;
      patch.nodes = patch.nodes.map((n) => (n.type === 'trigger' && label
        ? { ...n, config: { ...(n.config || {}), label: n.config?.label || label } }
        : n));
    }

    const wf = await Workflow.findByIdAndUpdate(req.params.id, { $set: patch }, { new: true, runValidators: true });
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const wf = await Workflow.findById(req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    wf.active = !wf.active;
    wf.updatedBy = adminName(req);
    await wf.save();
    res.json({ active: wf.active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const wf = await Workflow.findByIdAndDelete(req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    await WorkflowRun.deleteMany({ workflow: wf._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Run the workflow once against one real lead, whatever its trigger says. Messages really go out,
// so the admin page asks before calling this.
exports.testRun = async (req, res) => {
  try {
    const wf = await Workflow.findById(req.params.id).lean();
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    const { leadId } = req.body;
    if (!mongoose.isValidObjectId(leadId)) return res.status(400).json({ error: 'Pick a lead to test with' });
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const run = await engine.startRun({ ...wf, active: true }, lead, { context: { testRun: true } });
    res.json({ ok: true, run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.runs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.workflow && mongoose.isValidObjectId(req.query.workflow)) filter.workflow = req.query.workflow;
    if (req.query.status) filter.status = req.query.status;
    const runs = await WorkflowRun.find(filter).sort({ createdAt: -1 }).limit(Number(req.query.limit) || 50).lean();
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
