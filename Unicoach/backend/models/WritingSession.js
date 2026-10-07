const mongoose = require('mongoose');

const writingSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['typing-test', 'creative-writing'], default: 'typing-test' },
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  score: { type: Number, required: true },
  textTitle: { type: String, default: 'Study Abroad Essay' },
  charactersTyped: { type: Number },
  timeSpent: { type: Number }, // in seconds
}, { timestamps: true });

module.exports = mongoose.model('WritingSession', writingSessionSchema);
