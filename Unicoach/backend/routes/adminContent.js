const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminContentController = require('../controllers/adminContentController');

const uploadDisk = multer({ 
  dest: path.join(__dirname, '../uploads/temp'),
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Middleware applied to all routes
router.use(verifyToken, requireAdmin);

// Routes
router.get('/', adminContentController.getAllContent);
router.get('/:id', adminContentController.getContentById);
router.post('/import-docx', uploadDisk.single('file'), adminContentController.importDocx);
router.post('/', adminContentController.createContent);
router.put('/:id', adminContentController.updateContent);
router.delete('/:id', adminContentController.deleteContent);

module.exports = router;
