const mongoose = require('mongoose');
const slugify = require('slugify');

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, unique: true },
  cities: { type: [String], default: [] },
  visaLinks: { type: [String], default: [] },
  courseLinks: { type: [String], default: [] }
}, { timestamps: true });

countrySchema.pre('save', function(next) {
  if (!this.code) {
    this.code = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Country', countrySchema);
