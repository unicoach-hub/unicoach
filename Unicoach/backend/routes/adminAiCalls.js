const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, requireOwner } = require('../middleware/auth');
const c = require('../controllers/adminAiCallController');

router.use(verifyToken, requireAdmin);

router.get('/', c.listCalls);
router.get('/stats', c.getStats);
router.get('/settings', c.getSettings);
router.put('/settings', c.updateSettings);
router.post('/', c.startCall);
router.post('/batch', c.startBatch);
router.post('/delete', requireOwner, c.deleteCalls);
router.get('/:id', c.getCall);
router.get('/:id/recording', require('../controllers/vobizController').streamRecording);
router.post('/:id/sync', c.syncCall);
router.delete('/:id', requireOwner, c.deleteCalls);

module.exports = router;
