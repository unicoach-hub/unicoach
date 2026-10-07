const Digest = require('../models/Digest');

/**
 * GET /api/digest
 * Retrieve all published digests (excluding future scheduled items)
 */
exports.getAllDigests = async (req, res) => {
  try {
    const now = new Date();
    const digests = await Digest.find({
      published: true,
      $or: [
        { publishDate: { $exists: false } },
        { publishDate: null },
        { publishDate: { $lte: now } }
      ]
    }).sort({ createdAt: -1 });
    return res.json(digests);
  } catch (err) {
    console.error('Error fetching digests:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
