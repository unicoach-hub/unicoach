const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminSettingsController = require('../controllers/adminSettingsController');

router.use(verifyToken, requireAdmin);

router.get('/', adminSettingsController.getSettings);
router.put('/', adminSettingsController.updateSettings);
router.post('/test-cloudinary', adminSettingsController.testCloudinary);

module.exports = router;
