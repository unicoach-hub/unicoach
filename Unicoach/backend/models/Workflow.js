const mongoose = require('mongoose');

// One automation the admin drew in Automation → Workflows.
//
// A workflow is a trigger (what starts it) plus a chain of steps. The steps live in `nodes` with the
// lines between them in `edges`, exactly as the builder shows them, so the canvas and the engine
// read the same thing. A condition step has two lines out, marked branch 'yes' and 'no'.
const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, default: 60 },
  y: { type: Number, default: 40 },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  branch: { type: String, enum: ['', 'yes', 'no'], default: '' },
}, { _id: false });

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  active: { type: Boolean, default: false, index: true },

  // What starts it. Kept here as well as on the trigger node so the engine can query on it.
  trigger: {
    type: {
      type: String,
      enum: ['lead_created', 'lead_stage_changed', 'followup_due', 'no_reply', 'whatsapp_reply', 'manual'],
      default: 'manual',
      index: true,
    },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },

  nodes: { type: [nodeSchema], default: [] },
  edges: { type: [edgeSchema], default: [] },

  stats: {
    runs: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    lastRunAt: { type: Date },
  },
  lastError: { type: String, default: '' },

  createdBy: { type: String, default: '' },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.Workflow || mongoose.model('Workflow', workflowSchema);
