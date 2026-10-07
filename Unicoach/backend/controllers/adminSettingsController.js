const Settings = require('../models/Settings');

// Credential fields that must never be returned to the browser in clear text.
const SECRET_FIELDS = [
  'smtpPass',
  'twilioAuthToken',
  'wabaAccessToken',
  'metaAppSecret',
  'metaPageAccessToken',
  'youtubeApiKey',
  'youtubeClientSecret',
  'linkedinClientSecret',
  'twitterApiKey',
  'twitterApiSecret',
  'twitterAccessToken',
  'twitterAccessSecret',
  'telegramBotToken',
  'geminiApiKey',
  'cloudinaryApiSecret',
  'razorpayKeySecret',
  'razorpayWebhookSecret',
  'paypalClientSecret',
  'resendApiKey',
];

const MASK_PREFIX = '••••';

const maskValue = (value) => {
  if (!value) return '';
  const str = String(value);
  return MASK_PREFIX + (str.length > 8 ? str.slice(-4) : '');
};

// A value the client echoed back unchanged (masked) or left blank => keep the stored secret.
const isMaskedOrEmpty = (value) =>
  value === undefined || value === null || value === '' ||
  (typeof value === 'string' && value.startsWith(MASK_PREFIX));

const maskSettings = (settingsDoc) => {
  const obj = settingsDoc && typeof settingsDoc.toObject === 'function' ? settingsDoc.toObject() : { ...(settingsDoc || {}) };
  SECRET_FIELDS.forEach((field) => {
    const hasKey = 'has' + field.charAt(0).toUpperCase() + field.slice(1);
    obj[hasKey] = !!obj[field];
    if (field in obj) obj[field] = maskValue(obj[field]);
  });
  return obj;
};

exports.SECRET_FIELDS = SECRET_FIELDS;
exports.maskSettings = maskSettings;

/**
 * GET /api/admin/settings-manage
 */
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    return res.json(maskSettings(settings));
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/settings-manage
 */
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const PROTECTED_KEYS = ['_id', '__v', 'createdAt', 'updatedAt'];
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || PROTECTED_KEYS.includes(key)) return;
      // Ignore derived hasXxx flags sent back by the client
      if (/^has[A-Z]/.test(key) && SECRET_FIELDS.includes(key.charAt(3).toLowerCase() + key.slice(4))) return;
      // Never overwrite a stored secret with the mask or an empty value
      if (SECRET_FIELDS.includes(key) && isMaskedOrEmpty(updateData[key])) return;
      settings[key] = updateData[key];
    });

    await settings.save();
    return res.json({
      success: true,
      message: 'Platform Settings & Social Credentials saved securely!',
      settings: maskSettings(settings)
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/settings-manage/test-cloudinary
 */
exports.testCloudinary = async (req, res) => {
  try {
    const { cloudinaryCloudName, cloudinaryApiKey } = req.body;
    let { cloudinaryApiSecret } = req.body;
    // The browser only ever holds a masked secret; fall back to the stored one
    if (isMaskedOrEmpty(cloudinaryApiSecret)) {
      const stored = await Settings.findOne();
      cloudinaryApiSecret = stored ? stored.cloudinaryApiSecret : '';
    }
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret,
      secure: true
    });
    const result = await cloudinary.api.ping();
    return res.json({ success: true, message: 'Cloudinary CDN connected successfully!', status: result.status });
  } catch (err) {
    console.error('Cloudinary ping error:', err);
    return res.status(400).json({ success: false, error: err.message || 'Failed to authenticate with Cloudinary' });
  }
};
