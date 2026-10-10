const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminMessagingController = require('../controllers/adminMessagingController');

router.use(verifyToken, requireAdmin);

router.get('/whatsapp-stats', adminMessagingController.getWhatsAppStats);
router.post('/verify-smtp', adminMessagingController.verifySmtp);
router.post('/send-bulk', adminMessagingController.sendBulk);
router.post('/audience-preview', adminMessagingController.previewAudience);
router.get('/email-status', adminMessagingController.getEmailStatus);
router.get('/waba-conversations', adminMessagingController.getWabaConversations);
router.post('/waba-conversations/:id/reply', adminMessagingController.replyWabaConversation);

module.exports = router;
