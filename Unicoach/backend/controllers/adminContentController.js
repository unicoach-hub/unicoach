const fs = require('fs');
const Blog = require('../models/Blog');
const News = require('../models/News');
const Event = require('../models/Event');
const Digest = require('../models/Digest');
const { parseDocx } = require('../utils/docxParser');
const { clearCache } = require('../utils/cache');

// Dynamic model helper map
const models = {
  blog: Blog,
  news: News,
  event: Event,
  digest: Digest
};

// Helper function to compile block sections into static HTML
function compileSectionsToHtml(sections) {
  if (!Array.isArray(sections)) return '';
  return sections.map(section => {
    const alignClass = section.align && section.align !== 'left' ? `ql-align-${section.align}` : '';
    const alignAttr = alignClass ? ` class="${alignClass}"` : '';
    
    switch (section.type) {
      case 'heading':
        return `<h${section.level || 2}${alignAttr}>${section.content || ''}</h${section.level || 2}>`;
      case 'paragraph':
        const formattedContent = (section.content || '').replace(/\n/g, '<br>');
        return `<p${alignAttr}>${formattedContent}</p>`;
      case 'image':
        if (!section.url) return '';
        const imgAlignClass = section.align && section.align !== 'left' ? ` ql-align-${section.align}` : '';
        return `<div class="content-img-wrapper${imgAlignClass}"><img src="${section.url}" alt="${section.caption || 'Image'}" />${section.caption ? `<span class="content-img-caption">${section.caption}</span>` : ''}</div>`;
      case 'faq':
        const faqAnswer = (section.answer || '').replace(/\n/g, '<br>');
        // Light styling: blog articles render on a white card
        return `<details class="blog-faq-item group border border-slate-200 rounded-2xl bg-slate-50 p-4 transition-all duration-350 [&_summary::-webkit-details-marker]:hidden mb-4"><summary class="flex items-center justify-between cursor-pointer font-bold text-slate-900 text-base outline-none list-none select-none"><span>${section.question || ''}</span><span class="ml-1.5 flex-shrink-0 rounded-full bg-white border border-slate-200 p-1 text-slate-500 group-open:rotate-180 transition-transform duration-250"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></span></summary><div class="mt-3 text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-3">${faqAnswer}</div></details>`;
      default:
        return '';
    }
  }).join('\n');
}

const SPEAKER_LINK_KEYS = Event.SPEAKER_LINK_KEYS || ['linkedin', 'instagram', 'twitter', 'youtube', 'website'];
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const cleanText = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Event fields the admin controls for the site (homepage card + registration link). Only keys present
// in the body are returned, so a partial update never resets the others.
function readEventSiteFields(body = {}) {
  const fields = {};
  if (has(body, 'registrationLink')) fields.registrationLink = cleanText(body.registrationLink, 2000);
  // Joining link (Zoom/Meet) for registered people; http(s) only
  if (has(body, 'joiningLink')) {
    const link = cleanText(body.joiningLink, 500);
    fields.joiningLink = /^https?:\/\//i.test(link) ? link : '';
  }
  if (has(body, 'country')) fields.country = Event.EVENT_COUNTRIES.includes(body.country) ? body.country : '';
  if (has(body, 'speakerRole')) fields.speakerRole = cleanText(body.speakerRole, 120);
  if (has(body, 'speakerPhoto')) {
    const photo = cleanText(body.speakerPhoto, 2000);
    // Image URL or /uploads path only (no javascript:, data: ...)
    fields.speakerPhoto = /^[a-z][a-z0-9+.-]*:/i.test(photo) && !/^https?:\/\//i.test(photo) ? '' : photo;
  }
  if (has(body, 'ctaLabel')) fields.ctaLabel = cleanText(body.ctaLabel, 40);
  if (has(body, 'speakerBio')) fields.speakerBio = cleanText(body.speakerBio, 1000);
  if (has(body, 'speakerLinks')) {
    const links = body.speakerLinks && typeof body.speakerLinks === 'object' && !Array.isArray(body.speakerLinks) ? body.speakerLinks : {};
    // Absolute http(s) URLs only; anything else (javascript:, data:, bare text) is dropped
    fields.speakerLinks = Object.fromEntries(SPEAKER_LINK_KEYS.map((key) => {
      const url = cleanText(links[key], 500);
      return [key, /^https?:\/\/[^\s<>"']+$/i.test(url) ? url : ''];
    }));
  }
  if (has(body, 'whoShouldAttend')) {
    const raw = Array.isArray(body.whoShouldAttend)
      ? body.whoShouldAttend
      : (typeof body.whoShouldAttend === 'string' ? body.whoShouldAttend.split('\n') : []);
    fields.whoShouldAttend = raw.map((item) => cleanText(item, 200)).filter(Boolean).slice(0, 12);
  }
  if (has(body, 'showOnHomepage')) fields.showOnHomepage = body.showOnHomepage !== false && body.showOnHomepage !== 'false';
  if (has(body, 'homepageOrder')) {
    const raw = body.homepageOrder;
    const order = (typeof raw === 'number' || (typeof raw === 'string' && raw.trim())) ? Number(raw) : NaN;
    fields.homepageOrder = Number.isInteger(order) && order >= 1 && order <= 999 ? order : null; // null = no fixed position
  }
  return fields;
}

// Helper function to find a document across all collections by ID
async function getModelByDocId(id) {
  const [blog, news, event, digest] = await Promise.all([
    Blog.findById(id),
    News.findById(id),
    Event.findById(id),
    Digest.findById(id)
  ]);
  if (blog) return { model: Blog, doc: blog, type: 'blog' };
  if (news) return { model: News, doc: news, type: 'news' };
  if (event) return { model: Event, doc: event, type: 'event' };
  if (digest) return { model: Digest, doc: digest, type: 'digest' };
  return null;
}

/**
 * GET /api/admin/content
 * Retrieve all content (optionally filter by type and published)
 */
exports.getAllContent = async (req, res) => {
  try {
    const { type, published, limit } = req.query;
    const filter = {};
    if (published !== undefined) filter.published = published === 'true';

    if (type) {
      const Model = models[type];
      if (!Model) return res.status(400).json({ message: 'Invalid content type' });
      const query = Model.find(filter).sort({ createdAt: -1 });
      if (type !== 'digest') query.populate('author', 'name email');
      const items = await query;
      const itemsWithType = items.map(item => ({ ...item.toObject(), type }));
      return res.json(itemsWithType);
    }

    const limitVal = limit ? parseInt(limit) : 20;
    const [blogs, news, events, digests] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).limit(limitVal).populate('author', 'name email'),
      News.find(filter).sort({ createdAt: -1 }).limit(limitVal).populate('author', 'name email'),
      Event.find(filter).sort({ createdAt: -1 }).limit(limitVal).populate('author', 'name email'),
      Digest.find(filter).sort({ createdAt: -1 }).limit(limitVal)
    ]);

    const itemsWithType = [
      ...blogs.map(b => ({ ...b.toObject(), type: 'blog' })),
      ...news.map(n => ({ ...n.toObject(), type: 'news' })),
      ...events.map(e => ({ ...e.toObject(), type: 'event' })),
      ...digests.map(d => ({ ...d.toObject(), type: 'digest' }))
    ];

    itemsWithType.sort((a, b) => b.createdAt - a.createdAt);
    return res.json(itemsWithType.slice(0, limitVal));
  } catch (err) {
    console.error('Error fetching admin content:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/content/:id
 * Retrieve single content item by ID
 */
exports.getContentById = async (req, res) => {
  try {
    const result = await getModelByDocId(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    return res.json({ ...result.doc.toObject(), type: result.type });
  } catch (err) {
    console.error('Error fetching content by ID:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/content/import-docx
 * Upload & parse a docx file into structured sections
 */
exports.importDocx = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const parsedData = await parseDocx(req.file.path);
    
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return res.json(parsedData);
  } catch (err) {
    console.error('Docx parse error:', err);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({ error: 'Failed to parse document: ' + err.message });
  }
};

/**
 * POST /api/admin/content
 * Create new content
 */
exports.createContent = async (req, res) => {
  try {
    const { title, slug, type, body, sections, imageUrl, eventStart, eventEnd, location, metaTitle, metaDescription, published, publishDate, category } = req.body;
    const Model = models[type];
    if (!Model) return res.status(400).json({ message: 'Invalid content type' });

    const finalBody = sections ? compileSectionsToHtml(sections) : (body || '');

    const fields = {
      title,
      slug: slug || undefined,
      body: finalBody,
      sections: sections || [],
      imageUrl,
      author: req.user.id,
      metaTitle,
      metaDescription,
      published,
      publishDate,
      category
    };

    if (type === 'event') {
      fields.eventStart = eventStart;
      fields.eventEnd = eventEnd;
      fields.location = location;
      fields.description = req.body.description;
      fields.category = req.body.category;
      fields.speaker = req.body.speaker;
      fields.tags = req.body.tags;
      Object.assign(fields, readEventSiteFields(req.body));
    }

    if (type === 'digest') {
      fields.description = req.body.description;
      fields.category = req.body.category;
      fields.isVideo = req.body.isVideo;
      fields.videoUrl = req.body.videoUrl;
      fields.length = req.body.length;
      fields.isSpotlight = req.body.isSpotlight;
    }

    const content = new Model(fields);
    await content.save();
    await clearCache();
    return res.status(201).json({ ...content.toObject(), type });
  } catch (err) {
    console.error('Error creating content:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/content/:id
 * Update existing content
 */
exports.updateContent = async (req, res) => {
  try {
    const result = await getModelByDocId(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });

    const updates = { ...req.body };
    if (updates.sections) {
      updates.body = compileSectionsToHtml(updates.sections);
    }
    if (result.type === 'event') {
      Object.assign(updates, readEventSiteFields(req.body));
      // Registrations come only from the public register endpoint: an edit must never overwrite them
      delete updates.attendees;
      delete updates.registrationCount;
    }
    const content = await result.model.findByIdAndUpdate(req.params.id, updates, { new: true });
    await clearCache();
    return res.json({ ...content.toObject(), type: result.type });
  } catch (err) {
    console.error('Error updating content:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/content/:id
 * Delete content
 */
exports.deleteContent = async (req, res) => {
  try {
    const result = await getModelByDocId(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });

    await result.model.findByIdAndDelete(req.params.id);
    await clearCache();
    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting content:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
