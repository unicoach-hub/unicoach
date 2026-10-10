const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { handleUpload } = require('../services/studentFile');
const c = require('../controllers/adminStudentInboxController');

router.use(verifyToken, requireAdmin);

router.get('/', c.listConversations);
router.get('/students', c.searchStudents);
router.get('/unread', c.getUnread);
router.patch('/documents/:docId', c.reviewDocument);
router.get('/documents/:docId/file', c.openDocument);
router.get('/:studentId', c.getStudentFile);
router.post('/:studentId/messages', handleUpload, c.sendMessage);
router.post('/:studentId/requests', c.requestDocuments);
router.patch('/:studentId/assign', c.assignCounselor);

module.exports = router;
