const Blog = require('../models/Blog');

const escapeRegex = require('../utils/escapeRegex');
/**
 * GET /api/blogs
 * Retrieve all published blogs (excluding future scheduled blogs)
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const now = new Date();
    const blogs = await Blog.find({
      published: true,
      $or: [
        { publishDate: { $exists: false } },
        { publishDate: null },
        { publishDate: { $lte: now } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name email');
    return res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/blogs/:slug
 * Retrieve details for a specific blog by slug
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug || '';
    const cleanSlug = rawSlug.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
    const now = new Date();

    const blog = await Blog.findOne({
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

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    return res.json(blog);
  } catch (err) {
    console.error('Error fetching blog details:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
