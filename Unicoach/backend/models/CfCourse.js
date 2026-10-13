// CfCourse — the accurate CourseFinder catalogue (collection: cf_courses).
// Populated by scripts/coursefinder/cf_ingest.js. strict:false keeps the full
// CourseFinder payload under `cf` for exact 1:1 engine fidelity, while the typed
// top-level fields power fast indexed queries.
const mongoose = require('mongoose');

const CfCourseSchema = new mongoose.Schema({
  cfId: { type: Number, unique: true, index: true },
  courseName: { type: String, index: true },
  courseCode: String,
  universityName: { type: String, index: true },
  countryName: String,
  city: String,
  degreeLevel: String,
  discipline: String,
  duration: String,
  annualFee: { amount: Number, currency: String, inrAmount: Number },
  applicationFee: { amount: Number, currency: String, isWaived: Boolean },
  initialDeposit: { amount: Number, currency: String },
  minIeltsScore: Number,
  minToeflScore: Number,
  minPteScore: Number,
  minGpaPercent: Number,
  academicRequirement: String,
  greRequired: Boolean,
  workExpRequirement: String,
  intakes: [String],
  applicationDeadline: String,
  scholarships: [{ name: String, discount: String, criteria: String }],
  isStem: Boolean,
  hasInternship: Boolean,
  sourceUrl: { type: String, index: true },
  syncStatus: String,
  source: { type: String, default: 'coursefinder' },

  // CourseFinder refs / engine keys
  cfUniversityId: { type: Number, index: true },
  cfCountryId: { type: Number, index: true },
  cfStudyLevelId: { type: Number, index: true },
  highlightIds: { type: [Number], index: true },
  eligibleCountryIds: { type: [Number], index: true },
  eligibleStateIds: [Number],

  // full/slim CourseFinder payload (strict:false preserves every field)
  cf: mongoose.Schema.Types.Mixed,
}, { timestamps: true, strict: false, collection: 'cf_courses' });

CfCourseSchema.index({ cfCountryId: 1, cfStudyLevelId: 1 });
CfCourseSchema.index({ courseName: 'text', universityName: 'text' });

module.exports = mongoose.models.CfCourse || mongoose.model('CfCourse', CfCourseSchema);
