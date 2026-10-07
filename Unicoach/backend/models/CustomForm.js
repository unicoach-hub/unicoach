const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'email', 'phone', 'select', 'textarea', 'number', 'date'], default: 'text' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  options: [String] // For select/dropdown fields
}, { _id: true });

const customFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  pipeline: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true },
  fields: [formFieldSchema],
  headerTitle: { type: String, default: 'Submit Your Details' },
  headerDescription: { type: String, default: '' },
  successMessage: { type: String, default: 'Thank you! Your response has been recorded.' },
  active: { type: Boolean, default: true },
  submissionCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CustomForm', customFormSchema);
