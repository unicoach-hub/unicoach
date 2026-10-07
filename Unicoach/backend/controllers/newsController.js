const News = require('../models/News');

const escapeRegex = require('../utils/escapeRegex');
/**
 * GET /api/news
 * Retrieve all published news (excluding future scheduled news)
 */
exports.getAllNews = async (req, res) => {
  try {
    const now = new Date();
    const news = await News.find({
      published: true,
      $or: [
        { publishDate: { $exists: false } },
        { publishDate: null },
        { publishDate: { $lte: now } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name email');
    return res.json(news);
  } catch (err) {
    console.error('Error fetching news:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/news/:slug
 * Retrieve details for a specific news item by slug
 */
exports.getNewsBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug || '';
    const cleanSlug = rawSlug.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
    const now = new Date();

    const newsItem = await News.findOne({
      $or: [
        { slug: cleanSlug },
        { slug: rawSlug },
        { slug: `/${cleanSlug}` },
        { slug: new RegExp(`^/?${escapeRegex(cleanSlug, 200)}$`, 'i') }
      ],
      published: true,
      $and: [
        {
          $or: [
            { publishDate: { $exists: false } },
            { publishDate: null },
            { publishDate: { $lte: now } }
          ]
        }
      ]
    }).populate('author', 'name email');

    if (!newsItem) {
      return res.status(404).json({ message: 'News not found' });
    }
    return res.json(newsItem);
  } catch (err) {
    console.error('Error fetching news details:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
