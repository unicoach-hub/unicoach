const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminSocialController = require('../controllers/adminSocialController');

// Accounts
router.get('/accounts', verifyToken, requireAdmin, adminSocialController.getSocialAccounts);
router.post('/accounts/toggle', verifyToken, requireAdmin, adminSocialController.toggleSocialAccount);

// Posts
router.get('/posts', verifyToken, requireAdmin, adminSocialController.getSocialPosts);
router.post('/posts', verifyToken, requireAdmin, adminSocialController.createSocialPost);
router.delete('/posts/:id', verifyToken, requireAdmin, adminSocialController.deleteSocialPost);

// AI Assistant
router.post('/ai-caption', verifyToken, requireAdmin, adminSocialController.generateAiCaption);

// Comments
router.get('/comments', verifyToken, requireAdmin, adminSocialController.getSocialComments);
router.post('/comments/:id/reply', verifyToken, requireAdmin, adminSocialController.replySocialComment);

// Analytics
router.get('/analytics', verifyToken, requireAdmin, adminSocialController.getSocialAnalytics);

module.exports = router;
