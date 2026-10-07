const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Multer storage configuration (temp staging before cloud dispatch)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// Strict allowlist: the extension AND the declared type must both be safe.
// (SVG/HTML/JS/TXT are excluded: they can carry script and would be served from the API origin.)
const ALLOWED_FILE_TYPES = {
  '.jpg': /^image\/jpe?g$/, '.jpeg': /^image\/jpe?g$/, '.png': /^image\/png$/, '.gif': /^image\/gif$/,
  '.webp': /^image\/webp$/, '.avif': /^image\/avif$/,
  '.mp4': /^video\/mp4$/, '.webm': /^video\/webm$/, '.mov': /^video\/quicktime$/,
  '.pdf': /^application\/pdf$/,
  '.doc': /^application\/msword$/,
  '.docx': /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
  '.csv': /^(text\/csv|application\/vnd\.ms-excel)$/
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimePattern = ALLOWED_FILE_TYPES[ext];
  if (mimePattern && mimePattern.test(file.mimetype || '')) {
    return cb(null, true);
  }
  cb(new Error('Allowed formats: Images (JPG, PNG, WEBP, GIF, AVIF), Videos (MP4, WEBM, MOV), and Documents (PDF, DOC, DOCX, CSV)'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// POST /api/upload - Requires authenticated session (via HttpOnly cookie or token)
router.post('/', verifyToken, upload.single('file'), uploadController.uploadFile, (error, req, res, next) => {
  res.status(400).json({ error: error.message });
});

module.exports = router;
