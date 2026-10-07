const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const supportRequestController = require('../controllers/supportRequestController');

// Public inquiry submit endpoint (Students / Visitors)
router.post('/', supportRequestController.createSupportRequest);

// Protected Admin Support Management Routes
router.post('/test-smtp', verifyToken, requireAdmin, supportRequestController.testSmtp);
router.get('/', verifyToken, requireAdmin, supportRequestController.getAllSupportRequests);
router.patch('/:id/status', verifyToken, requireAdmin, supportRequestController.updateSupportRequestStatus);
router.post('/:id/ai-reply', verifyToken, requireAdmin, supportRequestController.generateAiReply);
router.post('/:id/send-email', verifyToken, requireAdmin, supportRequestController.sendSupportEmail);
router.delete('/:id', verifyToken, requireAdmin, supportRequestController.deleteSupportRequest);
router.get('/export/csv', verifyToken, requireAdmin, supportRequestController.exportSupportRequestsCsv);

module.exports = router;
