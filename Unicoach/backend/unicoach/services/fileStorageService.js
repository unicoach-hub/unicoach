const fs = require('fs');
const { cloudinary, configureCloudinary } = require('../../utils/cloudinary');

/**
 * UniCoach file storage on Cloudinary.
 *
 * - public:  profile photos / banners, served straight from the CDN
 * - private: paid digital products and verification documents, stored as Cloudinary
 *            "authenticated" assets that only open through a short-lived signed link
 *
 * The stored value is still the Cloudinary secure_url (so existing fileUrl fields keep working
 * as identifiers), but for private assets that URL returns 401 on its own.
 *
 * When Cloudinary is not configured (local dev without keys) files stay on local disk.
 */

const CLOUDINARY_URL_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/(upload|authenticated|private)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/;

const removeTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('Temp upload cleanup warning:', err.message);
  }
};

/**
 * Move a multer upload into storage. Returns { url, provider }.
 * Throws an Error with a user-facing message when Cloudinary rejects the file.
 */
const storeUpload = async (file, { visibility = 'public', folder = 'unicoach/mentors' } = {}) => {
  const isConfigured = await configureCloudinary();
  if (!isConfigured) {
    console.warn(`⚠️ Cloudinary not configured: keeping ${visibility} UniCoach upload on local disk (${file.filename}).`);
    return { url: `/uploads/unicoach/${file.filename}`, provider: 'local' };
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      type: visibility === 'private' ? 'authenticated' : 'upload',
      use_filename: true,
      unique_filename: true
    });
    // Cloudinary signs authenticated URLs with a permanent signature; drop it so the stored URL
    // opens nothing on its own and access always goes through getAccessUrl's expiring link
    const url = visibility === 'private' ? result.secure_url.replace(/\/s--[^/]+--\//, '/') : result.secure_url;
    return { url, provider: 'cloudinary' };
  } catch (err) {
    console.error('Cloudinary upload error:', err.message || err);
    const tooLarge = /file size too large/i.test(err.message || '');
    const friendly = new Error(tooLarge
      ? 'File is too large. Please upload a file under 10 MB.'
      : 'Could not store the file right now. Please try again.');
    friendly.statusCode = tooLarge ? 413 : 502;
    throw friendly;
  } finally {
    removeTempFile(file.path);
  }
};

/** Parse a Cloudinary delivery URL into the parts needed for signing. Null for anything else. */
const parseCloudinaryUrl = (url) => {
  const match = typeof url === 'string' ? url.match(CLOUDINARY_URL_PATTERN) : null;
  if (!match) return null;
  const [, resourceType, deliveryType, rest] = match;
  const decoded = decodeURIComponent(rest);
  if (resourceType === 'raw') return { resourceType, deliveryType, publicId: decoded, format: '' };
  const dot = decoded.lastIndexOf('.');
  return {
    resourceType,
    deliveryType,
    publicId: dot > 0 ? decoded.slice(0, dot) : decoded,
    format: dot > 0 ? decoded.slice(dot + 1) : ''
  };
};

const isPrivateAsset = (url) => {
  const parsed = parseCloudinaryUrl(url);
  return Boolean(parsed && parsed.deliveryType !== 'upload');
};

/**
 * A URL that actually opens the file. Private Cloudinary assets get a signed link that expires
 * after `expiresInSeconds`; public files and external links (Drive, Notion...) come back unchanged.
 */
const getAccessUrl = async (url, { expiresInSeconds = 300, attachment = false } = {}) => {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed || parsed.deliveryType === 'upload') return url;
  await configureCloudinary();
  return cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
    resource_type: parsed.resourceType,
    type: parsed.deliveryType,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    attachment
  });
};

module.exports = { storeUpload, parseCloudinaryUrl, isPrivateAsset, getAccessUrl };
