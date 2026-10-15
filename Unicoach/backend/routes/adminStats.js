const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminStatsController = require('../controllers/adminStatsController');

router.use(verifyToken, requireAdmin);

// GET /api/admin/stats
router.get('/', adminStatsController.getAdminStats);
router.get('/attention', adminStatsController.getAttention);

module.exports = router;
