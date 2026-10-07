const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminAuthController = require('../controllers/adminAuthController');

// Admin Login - expects { username, password }
router.post('/login', adminAuthController.adminLogin);

// GET Admin Profile info
router.get('/profile', verifyToken, requireAdmin, adminAuthController.getAdminProfile);

// Update Admin Profile (username, email, password)
router.put('/update-profile', verifyToken, requireAdmin, adminAuthController.updateAdminProfile);

// Test auth
router.get('/test', verifyToken, requireAdmin, adminAuthController.testAdminAuth);

// Admin Logout
router.post('/logout', adminAuthController.adminLogout);

module.exports = router;
