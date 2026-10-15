const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/campaignController');

router.use(verifyToken, requireAdmin);

router.get('/', c.list);
router.post('/preview', c.preview);
router.post('/', c.create);
router.get('/:id', c.get);
router.post('/:id/pause', c.pause);
router.post('/:id/resume', c.resume);
router.post('/:id/cancel', c.cancel);

module.exports = router;
