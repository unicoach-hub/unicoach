const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  validate, 
  userRegisterSchema, 
  userLoginSchema, 
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema 
} = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

// Get current user session via HttpOnly cookie or token
router.get('/me', verifyToken, authController.getMe);

// Register - expects { name, email, password, phone? }
router.post('/register', validate(userRegisterSchema), authController.register);

// Login - expects { email, password }
router.post('/login', validate(userLoginSchema), authController.login);

// Google 1-Click Login / Register - expects { credential }
router.post('/google', validate(googleAuthSchema), authController.googleLogin);

// Forgot Password - expects { email } -> dispatches reset link via SMTP
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// Reset Password - expects { token, id, newPassword }
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
