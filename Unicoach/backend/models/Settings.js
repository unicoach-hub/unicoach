const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'UniCoach' },
  supportEmail: { type: String, default: 'support@unicoach.com' },
  supportPhone: { type: String, default: '+91 9876543210' },

  // Twilio & Meta WABA
  twilioAccountSid: { type: String, default: '' },
  twilioAuthToken: { type: String, default: '' },
  twilioPhoneNumber: { type: String, default: '' },
  wabaAccessToken: { type: String, default: '' },
  wabaPhoneNumberId: { type: String, default: '' },
  wabaAccountId: { type: String, default: '' },
  wabaSenderNumber: { type: String, default: '' },

  // SMTP Email
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  smtpFrom: { type: String, default: '' },

  // 📸 Meta / Instagram
  metaAppId: { type: String, default: '' },
  metaAppSecret: { type: String, default: '' },
  metaPageAccessToken: { type: String, default: '' },
  instagramAccountId: { type: String, default: '' },

  // ▶️ YouTube
  youtubeApiKey: { type: String, default: '' },
  youtubeClientId: { type: String, default: '' },
  youtubeClientSecret: { type: String, default: '' },

  // 💼 LinkedIn
  linkedinClientId: { type: String, default: '' },
  linkedinClientSecret: { type: String, default: '' },
  linkedinOrgId: { type: String, default: '' },

  // 🐦 Twitter (X)
  twitterApiKey: { type: String, default: '' },
  twitterApiSecret: { type: String, default: '' },
  twitterAccessToken: { type: String, default: '' },
  twitterAccessSecret: { type: String, default: '' },

  // ✈️ Telegram
  telegramBotToken: { type: String, default: '' },
  telegramChatId: { type: String, default: '' },

  // 🔗 Social Webhook Bridge (Buffer / Zapier / Make)
  socialWebhookUrl: { type: String, default: '' },

  // ❓ Quora
  quoraSpaceUrl: { type: String, default: '' },

  // 🤖 AI Caption Assistant Key
  geminiApiKey: { type: String, default: '' },

  // ☁️ Cloudinary Media Storage
  cloudinaryCloudName: { type: String, default: '' },
  cloudinaryApiKey: { type: String, default: '' },
  cloudinaryApiSecret: { type: String, default: '' },

  // 💳 Payment Gateways (Razorpay & PayPal)
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  razorpayWebhookSecret: { type: String, default: '' },
  paypalClientId: { type: String, default: '' },
  paypalClientSecret: { type: String, default: '' },
  paypalMode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
