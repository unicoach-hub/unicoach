const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const writingController = require('../controllers/writingController');

// Apply verifyToken middleware to all routes here
router.use(verifyToken);

// Typing & Writing Session
router.post('/session', writingController.saveWritingSession);
router.get('/history', writingController.getWritingHistory);
router.get('/stats', writingController.getWritingStats);
router.delete('/session/:id', writingController.deleteWritingSession);
router.delete('/history', writingController.clearWritingHistory);

// Student Profile & Checklist
router.put('/profile', writingController.updateStudentProfile);
router.put('/checklist', writingController.updateChecklist);

// IELTS Attempts
router.post('/ielts', writingController.saveIeltsAttempt);
router.get('/ielts/history', writingController.getIeltsHistory);
// '/ielts/history' must be registered before '/ielts/:id', otherwise "history" is treated as an id
router.delete('/ielts/history', writingController.clearIeltsHistory);
router.delete('/ielts/:id', writingController.deleteIeltsAttempt);

module.exports = router;
