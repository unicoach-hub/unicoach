const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminLeadController = require('../controllers/adminLeadController');

router.use(verifyToken, requireAdmin);

// Routes
router.get('/', adminLeadController.getAllLeads);
router.get('/tags', adminLeadController.getTags);
router.post('/bulk-tags', adminLeadController.bulkTags);
router.post('/import', adminLeadController.importLeads);
router.get('/:id', adminLeadController.getLeadById);
router.put('/:id', adminLeadController.updateLead);
router.patch('/:id/tags', adminLeadController.setTags);
router.post('/:id/activity', adminLeadController.addActivity);
router.post('/:id/send-email', adminLeadController.sendLeadEmail);
router.post('/:id/log-whatsapp', adminLeadController.logWhatsApp);
router.delete('/:id', adminLeadController.deleteLead);

module.exports = router;
