const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');

// Ensure directory exists
const unicoachUploadDir = path.join(__dirname, '../../uploads/unicoach');
if (!fs.existsSync(unicoachUploadDir)) {
  fs.mkdirSync(unicoachUploadDir, { recursive: true });
}

// Multer disk storage: a temp file that fileStorageService moves to Cloudinary (local fallback without keys)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, unicoachUploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize original filename and add timestamp prefix
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    // Unguessable name: uploaded student IDs / offer letters must not be discoverable by URL guessing
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    cb(null, `unm_${baseName}_${uniqueSuffix}${ext}`);
  }
});

// File filter for safe formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.zip', '.doc', '.docx', '.epub', '.txt', '.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${ext}). Allowed formats: PDF, ZIP, DOC, DOCX, EPUB, TXT, PNG, JPG`), false);
  }
};

const uploadResource = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB: Cloudinary free plan's per-file limit
  },
  fileFilter
});

module.exports = {
  uploadResource,
  unicoachUploadDir
};
