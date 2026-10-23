// Admin API for WhatsApp chatbot flows (flow builder)
const mongoose = require('mongoose');
const ChatFlow = require('../models/ChatFlow');
const { validateFlow } = require('../services/chatbotEngine');

const MAX_NODES = 80;

// Keep only what the engine uses, so a crafted request can't store anything odd
const cleanNodes = (nodes) => (Array.isArray(nodes) ? nodes.slice(0, MAX_NODES) : []).map((n) => ({
  id: String(n.id).slice(0, 40),
  type: String(n.type).slice(0, 20),
  position: { x: Number(n.position?.x) || 0, y: Number(n.position?.y) || 0 },
  data: n.data && typeof n.data === 'object' ? JSON.parse(JSON.stringify(n.data)) : {},
}));
const cleanEdges = (edges) => (Array.isArray(edges) ? edges.slice(0, MAX_NODES * 10) : []).map((e) => ({
  id: String(e.id).slice(0, 80),
  source: String(e.source).slice(0, 40),
  sourceHandle: e.sourceHandle ? String(e.sourceHandle).slice(0, 40) : null,
  target: String(e.target).slice(0, 40),
}));
const keywordsOf = (nodes) => {
  const start = nodes.find((n) => n.type === 'start');
  return [...new Set((start?.data?.keywords || []).map((k) => String(k).toLowerCase().trim()).filter(Boolean))].slice(0, 30);
};

exports.list = async (req, res) => {
  try {
    const flows = await ChatFlow.find().select('name active isDefault keywords matchType runs updatedAt').sort({ updatedAt: -1 }).lean();
    return res.json(flows);
  } catch (err) {
    console.error('[Flows] list failed:', err);
    return res.status(500).json({ message: 'Could not load flows' });
  }
};

exports.get = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Not found' });
  const flow = await ChatFlow.findById(req.params.id).lean();
  if (!flow) return res.status(404).json({ message: 'Not found' });
  return res.json(flow);
};

exports.create = async (req, res) => {
  try {
    const flow = await ChatFlow.create({
      name: String(req.body?.name || 'New chatbot').slice(0, 80),
      nodes: [{ id: 'start', type: 'start', position: { x: 60, y: 160 }, data: { keywords: ['hi', 'hello'] } }],
      edges: [],
      keywords: ['hi', 'hello'],
      updatedBy: req.user?.name || 'Admin',
    });
    return res.status(201).json(flow);
  } catch (err) {
    console.error('[Flows] create failed:', err);
    return res.status(500).json({ message: 'Could not create the flow' });
  }
};

/** PUT /:id — save the drawing; switching it on checks the flow first */
exports.update = async (req, res) => {
  try {
    const flow = await ChatFlow.findById(req.params.id);
    if (!flow) return res.status(404).json({ message: 'Not found' });
    const b = req.body || {};
    if (b.name !== undefined) flow.name = String(b.name).slice(0, 80) || flow.name;
    if (b.nodes !== undefined) {
      flow.nodes = cleanNodes(b.nodes);
      flow.keywords = keywordsOf(flow.nodes);
      const start = flow.nodes.find((n) => n.type === 'start');
      flow.matchType = start?.data?.matchType === 'contains' ? 'contains' : 'exact';
    }
    if (b.edges !== undefined) flow.edges = cleanEdges(b.edges);
    if (b.isDefault !== undefined) flow.isDefault = !!b.isDefault;
    if (b.active !== undefined) flow.active = !!b.active;
    flow.updatedBy = req.user?.name || 'Admin';

    if (flow.active) {
      const problems = validateFlow(flow);
      if (problems.length) return res.status(400).json({ message: 'Fix these before switching it on', problems });
      // Two live flows can't own the same keyword
      const others = await ChatFlow.find({ _id: { $ne: flow._id }, active: true }).select('name keywords isDefault').lean();
      const clash = others.find((o) => (o.keywords || []).some((k) => flow.keywords.includes(k)));
      if (clash) return res.status(400).json({ message: `Keyword already used by the live flow "${clash.name}"`, problems: [] });
      if (flow.isDefault) await ChatFlow.updateMany({ _id: { $ne: flow._id }, isDefault: true }, { $set: { isDefault: false } });
    }
    await flow.save();
    return res.json(flow);
  } catch (err) {
    console.error('[Flows] save failed:', err);
    return res.status(500).json({ message: 'Could not save the flow' });
  }
};

exports.remove = async (req, res) => {
  try {
    await ChatFlow.deleteOne({ _id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    console.error('[Flows] delete failed:', err);
    return res.status(500).json({ message: 'Could not delete' });
  }
};

/** POST /api/admin/chat-flows/templates/:key — add a ready-made flow (switched off, to review first) */
exports.fromTemplate = async (req, res) => {
  try {
    const { TEMPLATES } = require('../config/chatFlowTemplates');
    const make = TEMPLATES[req.params.key];
    if (!make) return res.status(404).json({ message: 'Unknown template' });
    const t = make();
    const nodes = cleanNodes(t.nodes);
    const flow = await ChatFlow.create({
      name: t.name,
      active: false,
      isDefault: !!t.isDefault,
      nodes,
      edges: cleanEdges(t.edges),
      keywords: keywordsOf(nodes),
      matchType: nodes.find((n) => n.type === 'start')?.data?.matchType === 'contains' ? 'contains' : 'exact',
      updatedBy: req.user?.name || 'Admin',
    });
    return res.status(201).json(flow);
  } catch (err) {
    console.error('[Flows] template failed:', err);
    return res.status(500).json({ message: 'Could not add the template' });
  }
};
