const mongoose = require('mongoose');

const ieltsAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  essay: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  aiEvaluation: {
    overallBand: Number,
    criteria: {
      taskAchievement: { score: Number, feedback: String },
      coherenceCohesion: { score: Number, feedback: String },
      lexicalResource: { score: Number, feedback: String },
      grammaticalAccuracy: { score: Number, feedback: String }
    },
    wordCountAnalysis: {
      count: Number,
      verdict: String,
      feedback: String
    },
    strengths: [String],
    improvements: [String],
    vocabularyUpgrades: [
      {
        original: String,
        improved: String,
        context: String
      }
    ],
    enhancedSampleParagraph: String,
    examinerSummary: String
  }
}, { timestamps: true });

module.exports = mongoose.model('IeltsAttempt', ieltsAttemptSchema);
