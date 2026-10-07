const mongoose = require('mongoose');

const pipelineStageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  order: { type: Number, default: 0 }
}, { _id: true });

const pipelineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  stages: [pipelineStageSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pipeline', pipelineSchema);
