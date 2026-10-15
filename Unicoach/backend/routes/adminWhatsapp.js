const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/whatsappController');

router.use(verifyToken, requireAdmin);

router.get('/status', c.getStatus);
router.post('/embedded-signup', c.completeSignup);
router.post('/disconnect', c.disconnect);
router.get('/events', c.listEvents);

module.exports = router;
