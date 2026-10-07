const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// GET /api/blogs - Retrieve all published blogs
router.get('/', blogController.getAllBlogs);

// GET /api/blogs/:slug - Retrieve details for a specific blog by slug
router.get('/:slug', blogController.getBlogBySlug);

module.exports = router;
