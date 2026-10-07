const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/cache');

// Scheduler status
router.get('/scheduler-status', courseController.getSchedulerStatus);

// Public endpoints (with 5 min cache for high read throughput)
router.get('/', cacheMiddleware(300), courseController.getPublicCourses);
router.get('/university/:universityId', cacheMiddleware(300), courseController.getUniversityCourses);
router.get('/:id', cacheMiddleware(300), courseController.getCourseById);
router.post('/trigger-scheduler', verifyToken, requireAdmin, courseController.adminTriggerSchedulerSweep);
router.post('/', verifyToken, requireAdmin, courseController.adminCreateCourse);
router.post('/discover-catalog', verifyToken, requireAdmin, courseController.adminDiscoverCatalog);
router.post('/sync-url', verifyToken, requireAdmin, courseController.adminSyncCourseUrl);
router.post('/batch-sync-catalog', verifyToken, requireAdmin, courseController.adminBatchSyncCatalog);
router.put('/:id', verifyToken, requireAdmin, courseController.adminUpdateCourse);
router.delete('/:id', verifyToken, requireAdmin, courseController.adminDeleteCourse);

module.exports = router;
