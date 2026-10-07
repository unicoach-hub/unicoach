const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  price: { type: Number, default: 0.02 }, // price in USD
  messageSid: { type: String },
  type: { type: String, default: 'otp' }, // otp | bulk
}, { timestamps: true });

smsLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SmsLog', smsLogSchema);
