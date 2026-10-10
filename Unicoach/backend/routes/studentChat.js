const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { handleUpload } = require('../services/studentFile');
const studentChatController = require('../controllers/studentChatController');

// Signed-in students only (not admin or staff tokens)
const studentOnly = (req, res, next) =>
  req.user?.role === 'user' ? next() : res.status(403).json({ message: 'Students only' });

router.use(verifyToken, studentOnly);

router.get('/', studentChatController.getMyFile);
router.get('/unread', studentChatController.getUnread);
router.post('/messages', handleUpload, studentChatController.sendMessage);
router.get('/documents/:id/file', studentChatController.openDocument);

module.exports = router;
