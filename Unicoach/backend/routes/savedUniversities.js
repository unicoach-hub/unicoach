const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const savedUniversityController = require('../controllers/savedUniversityController');

router.get('/', verifyToken, savedUniversityController.getSavedUniversities);
router.post('/toggle', verifyToken, savedUniversityController.toggleSavedUniversity);
router.delete('/:id', verifyToken, savedUniversityController.deleteSavedUniversity);
router.put('/:id/notes', verifyToken, savedUniversityController.updateSavedUniversityNotes);

module.exports = router;
