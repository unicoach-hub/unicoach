const mongoose = require('mongoose');
const slugify = require('slugify');

// Country shown on the homepage event card (Admin → Events dropdown). '' = not set: the site guesses from the title.
const EVENT_COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'France', 'Netherlands', 'Italy', 'New Zealand', 'Singapore', 'Dubai', 'Global'];

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  body: { type: String }, // compiled from sections on save
  sections: { type: Array, default: [] }, // Gutenberg-like blocks
  imageUrl: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: false },
  publishDate: { type: Date },
  // Event specific fields
  eventStart: { type: Date },
  eventEnd: { type: Date },
  location: { type: String },
  registrationLink: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, enum: ['webinar', 'fair', 'other'], default: 'webinar' },
  speaker: { type: String, default: '' },
  tags: { type: [String], default: [] },
  // Homepage card (all optional; the site falls back to its own defaults when empty)
  country: { type: String, enum: ['', ...EVENT_COUNTRIES], default: '' },
  speakerRole: { type: String, default: '' }, // e.g. 'Career Guide Expert, Ireland'
  speakerPhoto: { type: String, default: '' }, // URL or /uploads path
  ctaLabel: { type: String, default: '' }, // button text; the site defaults to 'Claim Free VIP Seat'
  // Event detail page (/events/:slug): host bio, host social links (http(s) only) and audience bullets
  speakerBio: { type: String, default: '', maxlength: 1000 },
  speakerLinks: {
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  whoShouldAttend: { type: [String], default: [] },
  showOnHomepage: { type: Boolean, default: true },
  homepageOrder: { type: Number }, // 1 = first card; events without a number keep the date order
  // Registrations & Attendees
  attendees: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    intake: { type: String, default: '2026' },
    registeredAt: { type: Date, default: Date.now }
  }],
  registrationCount: { type: Number, default: 0 },
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

eventSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = slugify(this.title || '', { lower: true, strict: true });
  } else {
    this.slug = this.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
module.exports.EVENT_COUNTRIES = EVENT_COUNTRIES;
module.exports.SPEAKER_LINK_KEYS = ['linkedin', 'instagram', 'twitter', 'youtube', 'website'];
