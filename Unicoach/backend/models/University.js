const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  city: { type: String },
  logo: { type: String },
  website: { type: String },
  rank: { type: String },
  tuition: { type: String },
  type: { type: String, enum: ['PUBLIC', 'PRIVATE', 'Public', 'Private'], default: 'PUBLIC' },
  description: { type: String },
  eligibility: { type: String },
  categoryTags: { type: [String], default: [] },

  // Structured Shortlisting & Recommendation Parameters
  // No placeholder values: a field without an official value stays empty and the site shows "Check official site"
  tuitionFeeUSD: { type: Number },
  // Master's/graduate tuition + fees per year when an official source has it (US: IPEDS)
  graduateTuitionUSD: { type: Number },
  // Where the numbers came from and when (set by scripts/dataSync/*), e.g. { provider: 'College Scorecard', syncedAt }
  dataSource: { type: mongoose.Schema.Types.Mixed },
  minGpaPercent: { type: Number, default: 60 },
  minIeltsScore: { type: Number, default: 6.5 },
  minGreScore: { type: Number, default: 0 },
  greRequired: { type: Boolean, default: false },
  acceptanceRate: { type: mongoose.Schema.Types.Mixed },

  // Explicit Admission Eligibility Criteria (Cards & Shortlists)
  minScore: { type: String, default: 'GPA 3.0+' },
  ieltsScore: { type: String, default: 'IELTS 6.0+' },
  greExam: { type: String, default: 'GRE Waived' },
  workExp: { type: String, default: 'Freshers Eligible' },

  courses: { type: [String], default: [] },
  degreeLevels: { type: [String], default: ["Bachelor's", "Master's"] },
  rankingNum: { type: Number, default: 500 },
  // Set only when rankingNum was imported from an official ranking file, e.g. 'QS World University Rankings 2027'.
  // The site shows a rank only when this is present.
  rankingSource: { type: String },
  // Set only when the admission requirements (minGpaPercent, minIeltsScore, minGreScore, greRequired, minScore,
  // ieltsScore, workExp) were taken from the university's official page and reviewed. Without it the site treats
  // those fields as unknown (they otherwise hold schema defaults).
  requirementsSource: { type: String },
  // University-wide minimum English requirement for international graduate applicants, taken from the university's
  // central admissions page (scripts/dataSync/englishRequirementsSync.js). Independent of requirementsSource, so the
  // placeholder GPA/GRE fields never become "official" through it. Absent when requirements vary by programme.
  englishRequirement: {
    ieltsOverall: { type: Number },
    ieltsMinBand: { type: Number },
    toeflIbt: { type: Number },
    sourceUrl: { type: String },
    quotes: { type: [String], default: undefined },
    checkedAt: { type: Date },
    runId: { type: String }
  },
  // false hides the record from the public site (set by scripts/dataSync/* when an official register
  // shows it is not a real/eligible institution or is a duplicate) without deleting it.
  isActive: { type: Boolean, default: true },
  scholarshipAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Compound indexes for high-speed search and filtering
universitySchema.index({ name: 1, country: 1, city: 1 }, { unique: true });
universitySchema.index({ country: 1, rankingNum: 1 });
universitySchema.index({ tuitionFeeUSD: 1, rankingNum: 1 });
universitySchema.index({ courses: 1 });

module.exports = mongoose.model('University', universitySchema);
