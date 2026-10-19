const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'email', 'phone', 'select', 'textarea', 'number', 'date', 'radio', 'checkbox', 'yesno', 'country', 'intake', 'url', 'rating', 'time', 'consent', 'heading'], default: 'text' },
  helpText: { type: String, default: '' }, // small hint under the field
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  options: [String] // For select / radio / checkbox fields
}, { _id: true });

const customFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  pipeline: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline', required: true },
  fields: [formFieldSchema],
  headerTitle: { type: String, default: 'Submit Your Details' },
  headerDescription: { type: String, default: '' },
  headerImage: { type: String, default: '' }, // optional banner shown above the heading
  successMessage: { type: String, default: 'Thank you! Your response has been recorded.' },
  active: { type: Boolean, default: true },
  submissionCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CustomForm', customFormSchema);
