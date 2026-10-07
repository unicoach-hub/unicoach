const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - Retrieve all published news
router.get('/', newsController.getAllNews);

// GET /api/news/:slug - Retrieve details for a specific news item by slug
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;
