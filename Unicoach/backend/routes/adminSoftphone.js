const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { myEndpoint } = require('../controllers/vobizController');

router.use(verifyToken, requireAdmin);

router.get('/me', myEndpoint);

module.exports = router;
