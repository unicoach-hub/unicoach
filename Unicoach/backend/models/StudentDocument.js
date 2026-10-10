const mongoose = require('mongoose');

// A document in a student's file. Either requested by the counselor (then uploaded by the student)
// or shared directly in chat. Files are private Cloudinary assets opened via short-lived signed links.
const studentDocumentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  // requested → uploaded → approved | reupload (→ uploaded again)
  status: { type: String, enum: ['requested', 'uploaded', 'approved', 'reupload'], default: 'requested' },
  from: { type: String, enum: ['student', 'staff'], default: 'student' },
  file: {
    url: { type: String },
    name: { type: String },
    size: { type: Number },
    mime: { type: String },
  },
  note: { type: String, default: '', maxlength: 500 }, // reason for re-upload
  requestedBy: { type: String, default: '' },
  reviewedBy: { type: String, default: '' },
  uploadedAt: { type: Date },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('StudentDocument', studentDocumentSchema);
