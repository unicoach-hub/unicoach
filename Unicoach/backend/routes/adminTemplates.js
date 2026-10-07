const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminTemplateController = require('../controllers/adminTemplateController');

router.use(verifyToken, requireAdmin);

router.get('/', adminTemplateController.getAllTemplates);
router.post('/', adminTemplateController.createTemplate);
router.put('/:id', adminTemplateController.updateTemplate);
router.post('/:id/sync-meta', adminTemplateController.syncMeta);
router.delete('/:id', adminTemplateController.deleteTemplate);

module.exports = router;
