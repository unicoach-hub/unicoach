const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  body: { type: String }, // compiled from sections on save
  sections: { type: Array, default: [] }, // Gutenberg-like blocks
  imageUrl: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: Boolean, default: false },
  publishDate: { type: Date },
  category: { type: String, default: 'General' },
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

blogSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = slugify(this.title || '', { lower: true, strict: true });
  } else {
    this.slug = this.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
