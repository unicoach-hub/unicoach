// backend/controllers/uploadController.js - Cloudinary Cloud Media & Document Storage
const fs = require('fs');
const { uploadToCloudinary } = require('../utils/cloudinary');

/**
 * POST /api/upload
 * Handles file uploads directly to Cloudinary CDN (Images, Videos, PDFs, Academic Documents)
 * with graceful fallback to local /uploads if Cloudinary credentials are not configured yet.
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const localFilePath = req.file.path;
    const mimetype = req.file.mimetype || '';
    const folder = req.body.folder || (mimetype.includes('pdf') || mimetype.includes('document') ? 'documents' : 'media');

    let fileUrl = `/uploads/${req.file.filename}`;
    let isCdn = false;
    let details = { filename: req.file.filename };

    // 1. Upload to Cloudinary
    try {
      const cloudinaryData = await uploadToCloudinary(localFilePath, `unicoach/${folder}`);
      if (cloudinaryData && cloudinaryData.url) {
        fileUrl = cloudinaryData.url;
        isCdn = true;
        details = cloudinaryData;

        // Clean up temporary local staging file
        if (fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (e) {}
        }
      }
    } catch (cdnErr) {
      console.warn('Cloudinary upload warning (persisting to local disk):', cdnErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      isCdn,
      provider: isCdn ? 'cloudinary' : 'local',
      details
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Server error during file upload' });
  }
};
