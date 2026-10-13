// CfUniversity — universities derived from the CourseFinder catalogue (collection: cf_universities).
const mongoose = require('mongoose');

const CfUniversitySchema = new mongoose.Schema({
  cfUniversityId: { type: Number, unique: true, index: true },
  name: { type: String, index: true },
  cfCountryId: { type: Number, index: true },
  countryName: String,
  city: String,
  state: String,
  logo: String,
  rankings: { usNews: Number, qs: Number, webometricsNational: Number, webometricsWorld: Number },
  averageScholarship: String,
  source: { type: String, default: 'coursefinder' },
}, { timestamps: true, strict: false, collection: 'cf_universities' });

module.exports = mongoose.models.CfUniversity || mongoose.model('CfUniversity', CfUniversitySchema);
