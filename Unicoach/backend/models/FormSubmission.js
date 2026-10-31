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
  // Mentor whose share link (?ref=handle) brought this submission in
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UnicoachMentor', default: null },
  referrerHandle: { type: String, default: '' },
  // Snapshot of the form's owner email at submit time (see CustomForm.ownerEmail)
  ownerEmail: { type: String, default: '', lowercase: true, trim: true },
  tags: [String],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast pipeline + stage queries
formSubmissionSchema.index({ pipeline: 1, currentStage: 1 });
formSubmissionSchema.index({ form: 1 });
formSubmissionSchema.index({ referredBy: 1, submittedAt: -1 });
formSubmissionSchema.index({ ownerEmail: 1, submittedAt: -1 });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
