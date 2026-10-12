const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { handleUpload } = require('../services/studentFile');
const studentChatController = require('../controllers/studentChatController');

// Signed-in students only (not admin or staff tokens). Accounts that are also mentors sign in with
// role 'mentor' but are students too, so they get their chat as well.
const studentOnly = (req, res, next) =>
  ['user', 'mentor'].includes(req.user?.role) ? next() : res.status(403).json({ message: 'Students only' });

router.use(verifyToken, studentOnly);

router.get('/', studentChatController.getMyFile);
router.get('/unread', studentChatController.getUnread);
router.post('/messages', handleUpload, studentChatController.sendMessage);
router.get('/documents/:id/file', studentChatController.openDocument);

module.exports = router;
