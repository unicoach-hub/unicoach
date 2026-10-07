const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const formSubmissionSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomForm', required: true },
  pipeline: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true },
  currentStage: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // { "Full Name": "Sagar", "Email": "s@g.com" }
  notes: [noteSchema],
  assignedTo: { type: String, default: '' },
  tags: [String],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast pipeline + stage queries
formSubmissionSchema.index({ pipeline: 1, currentStage: 1 });
formSubmissionSchema.index({ form: 1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
