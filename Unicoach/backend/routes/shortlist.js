const express = require('express');
const router = express.Router();
const shortlistController = require('../controllers/shortlistController');
const { verifyToken } = require('../middleware/auth');

// POST /api/shortlist - Comprehensive University Matching Endpoint
router.post('/', shortlistController.generateShortlist);

// GET /api/shortlist/filter-options?country=Ireland - values for the advanced filters, built from real data
router.get('/filter-options', shortlistController.getFilterOptions);

// The signed-in student's saved step-1 profile
router.get('/profile', verifyToken, shortlistController.getMyShortlistProfile);
router.put('/profile', verifyToken, shortlistController.saveMyShortlistProfile);

module.exports = router;
