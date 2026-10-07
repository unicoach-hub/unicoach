const cloudinary = require('cloudinary').v2;
const Settings = require('../models/Settings');
const fs = require('fs');
require('dotenv').config();

/**
 * Configure Cloudinary dynamically from DB Settings or process.env
 */
async function configureCloudinary() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const settings = await Settings.findOne();
      if (settings && settings.cloudinaryCloudName && settings.cloudinaryApiKey && settings.cloudinaryApiSecret) {
        cloudName = settings.cloudinaryCloudName;
        apiKey = settings.cloudinaryApiKey;
        apiSecret = settings.cloudinaryApiSecret;
      }
    }
  } catch (err) {
    console.warn('Could not read Cloudinary from Settings DB:', err.message);
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  }

  return false;
}

/**
 * Upload a local file path to Cloudinary with automatic format & quality optimization
 * @param {string} filePath - Absolute path to local file
 * @param {string} folder - Destination folder on Cloudinary (e.g. 'unicoach/blogs')
 */
async function uploadToCloudinary(filePath, folder = 'unicoach/uploads') {
  const isConfigured = await configureCloudinary();
  if (!isConfigured) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    // Optionally cleanup local temp file after successful CDN upload
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanErr) {
      console.warn('Temp file cleanup warning:', cleanErr.message);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Delete an asset from Cloudinary by public ID
 */
async function deleteFromCloudinary(publicId) {
  const isConfigured = await configureCloudinary();
  if (!isConfigured || !publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return null;
  }
}

module.exports = {
  cloudinary,
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
