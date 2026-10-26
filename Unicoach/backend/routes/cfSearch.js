// CourseFinder engine routes — mounted at /api/search
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cfSearchController');
const { cacheMiddleware } = require('../utils/cache');
const { verifyToken } = require('../middleware/auth');

router.get('/config', cacheMiddleware(3600), ctrl.getConfig);
router.get('/highlights', cacheMiddleware(3600), ctrl.getHighlights);
router.get('/suggest', ctrl.suggest);
router.post('/courses', ctrl.searchCourses);
router.post('/universities', ctrl.getUniversities);
// Searching is open to everyone; downloading the full result set needs a (free) account
router.post('/export', verifyToken, ctrl.exportCourses);
router.get('/courses/:cfId', cacheMiddleware(300), ctrl.getCourseDetail);
router.post('/eligibility', ctrl.evaluateEligibility);

module.exports = router;
