const mongoose = require('mongoose');

const savedUniversitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  universityId: { 
    type: String, 
    default: null 
  },
  name: { 
    type: String, 
    required: true 
  },
  countryName: { 
    type: String, 
    default: 'International' 
  },
  city: { 
    type: String, 
    default: '' 
  },
  logo: { 
    type: String, 
    default: '' 
  },
  rank: { 
    type: String, 
    default: ''
  },
  tuition: { 
    type: String, 
    default: '' 
  },
  tuitionFeeUSD: { 
    type: Number, 
    default: 0 
  },
  minGpaPercent: { 
    type: Number, 
    default: null 
  },
  minIeltsScore: { 
    type: Number, 
    default: null 
  },
  acceptanceRate: { 
    type: Number, 
    default: null 
  },
  categoryTag: { 
    type: String, 
    enum: ['safe', 'target', 'dream'], 
    default: 'target' 
  },
  matchScore: { 
    type: Number, 
    default: 80 
  },
  website: { 
    type: String, 
    default: '' 
  },
  eligibility: { 
    type: String, 
    default: '' 
  },
  notes: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

// Prevent duplicate saving of the same university for a single user
savedUniversitySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SavedUniversity', savedUniversitySchema);
