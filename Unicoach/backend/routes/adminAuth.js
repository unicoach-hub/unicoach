const express = require('express');
const router = express.Router();
const { verifyToken, requireAdminSession } = require('../middleware/auth');
const adminAuthController = require('../controllers/adminAuthController');

// Admin Login - expects { username, password }
router.post('/login', adminAuthController.adminLogin);

// GET Admin Profile info
router.get('/profile', verifyToken, requireAdminSession, adminAuthController.getAdminProfile);

// Update Admin Profile (username, email, password)
router.put('/update-profile', verifyToken, requireAdminSession, adminAuthController.updateAdminProfile);

// Sections a staff role can be given access to
router.get('/sections', verifyToken, requireAdminSession, adminAuthController.getSections);

// Test auth
router.get('/test', verifyToken, requireAdminSession, adminAuthController.testAdminAuth);

// Admin Logout
router.post('/logout', adminAuthController.adminLogout);

module.exports = router;
