const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/adminStudentController');

router.use(verifyToken, requireAdmin);

router.get('/', c.listStudents);
router.get('/mentor-summary', c.mentorSummary);
router.get('/mentors', c.listMentorsForFilter);
router.get('/:id', c.getStudent);
router.patch('/:id/stage', c.updateStage);
router.get('/:id/documents.zip', c.downloadAllDocuments);
router.get('/:id/documents/:docId/file', c.openDocument);

module.exports = router;
