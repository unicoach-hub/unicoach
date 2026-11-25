const mongoose = require('mongoose');

// One lead going through one workflow.
//
// A run keeps its place (`nodeId` = the step to do next). A "Wait" step parks the run with
// status 'waiting' and a `resumeAt`; the worker picks it up again when that time passes, so a
// server restart never loses a sequence halfway.
const stepSchema = new mongoose.Schema({
  nodeId: String,
  type: String,
  label: String,
  at: { type: Date, default: Date.now },
  ok: { type: Boolean, default: true },
  info: String,
}, { _id: false });

const workflowRunSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true },
  workflowName: { type: String, default: '' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  leadName: { type: String, default: '' },

  status: { type: String, enum: ['running', 'waiting', 'done', 'failed', 'stopped'], default: 'running', index: true },
  nodeId: { type: String, default: '' },
  resumeAt: { type: Date, index: true },

  // Anything a step produced that a later step may read (AI classification, scores …)
  context: { type: mongoose.Schema.Types.Mixed, default: {} },
  steps: { type: [stepSchema], default: [] },
  error: { type: String, default: '' },

  // Stops the same lead entering the same workflow twice for the same reason
  dedupeKey: { type: String },

  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
}, { timestamps: true });

workflowRunSchema.index({ workflow: 1, lead: 1, dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $gt: '' } } });
workflowRunSchema.index({ status: 1, resumeAt: 1 });

module.exports = mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', workflowRunSchema);
