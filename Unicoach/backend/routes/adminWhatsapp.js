const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/whatsappController');
const inbox = require('../controllers/whatsappInboxController');

router.use(verifyToken, requireAdmin);

router.get('/status', c.getStatus);
router.post('/embedded-signup', c.completeSignup);
router.post('/manual-connect', c.manualConnect);
router.post('/disconnect', c.disconnect);
router.get('/events', c.listEvents);

// Inbox
router.get('/conversations', inbox.listConversations);
router.get('/conversations/:phone', inbox.getConversation);
router.post('/conversations/:phone/send', inbox.sendMessage);
router.post('/conversations/:phone/bot', inbox.setBot);
router.get('/templates', inbox.listTemplates);

module.exports = router;
