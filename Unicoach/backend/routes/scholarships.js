const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const scholarshipController = require('../controllers/scholarshipController');

// Public Explorer & Analytics
router.get('/', scholarshipController.getAllScholarships);
router.get('/stats', scholarshipController.getScholarshipStats);
router.post('/calculate-match', scholarshipController.calculateMatch);

// User Shortlist (Authenticated)
router.get('/my/shortlist', verifyToken, scholarshipController.getMyShortlist);
router.post('/toggle', verifyToken, scholarshipController.toggleShortlist);
router.put('/stage/:id', verifyToken, scholarshipController.updateStage);
router.delete('/my/shortlist/:id', verifyToken, scholarshipController.deleteFromShortlist);

// Single Scholarship Detail
router.get('/:id', scholarshipController.getScholarshipById);

// Admin Management (Protected)
router.post('/', verifyToken, requireAdmin, scholarshipController.createScholarship);
router.put('/:id', verifyToken, requireAdmin, scholarshipController.updateScholarship);
router.delete('/:id', verifyToken, requireAdmin, scholarshipController.deleteScholarship);
router.patch('/:id/toggle-featured', verifyToken, requireAdmin, scholarshipController.toggleFeatured);

module.exports = router;
