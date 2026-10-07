const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const aiController = require('../controllers/aiController');

const { JWT_SECRET } = require('../config/jwt');

// Optional Authentication Middleware
const optionalAuth = async (req, res, next) => {
  try {
    // Same session sources as the rest of the API: a real Bearer token, else the login cookie
    const authHeader = req.headers.authorization;
    const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const usableBearer = bearer && !['null', 'undefined', 'cookie-session'].includes(bearer) ? bearer : null;
    const token = usableBearer || (req.cookies && req.cookies.token);
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash -otp');
    }
  } catch (e) {
    // Continue without req.user if token is expired or invalid
  }
  next();
};

const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public Student AI Tools (with optional user context)
router.post('/grade-ielts', optionalAuth, aiController.gradeIelts);
router.post('/generate-sop', optionalAuth, aiController.generateSop);
router.post('/chat', optionalAuth, aiController.chat);
router.post('/unibot-chat', optionalAuth, aiController.chat);
router.post('/explain-scholarship', optionalAuth, aiController.explainScholarship);
router.post('/evaluate-visa', optionalAuth, aiController.evaluateVisa);
// Duolingo practice writing feedback: sign-in required (each call uses paid AI credits)
router.post('/evaluate-det-writing', verifyToken, aiController.evaluateDetWriting);
router.post('/generate-roadmap', optionalAuth, aiController.generateRoadmap);
router.post('/explain-university', optionalAuth, aiController.explainUniversity);

// Admin-Only Internal AI Tools (Protected with JWT + Admin Role)
router.post('/generate-blog', verifyToken, requireAdmin, aiController.generateBlog);
router.post('/score-lead', verifyToken, requireAdmin, aiController.scoreLead);
router.post('/suggest-lead-reply', verifyToken, requireAdmin, aiController.suggestLeadReply);
router.post('/batch-score-leads', verifyToken, requireAdmin, aiController.batchScoreLeads);

module.exports = router;
