const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'Counselor' },
  specialization: { type: String, default: 'Study Abroad Specialist' },
  branch: { type: String, default: 'Panipat Head Office' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
