const express = require('express');
const router = express.Router();
const { verifyToken, requireOwner } = require('../middleware/auth');
const c = require('../controllers/developerController');

// The owner only: staff never see server and database details
router.use(verifyToken, requireOwner);

router.get('/overview', c.overview);
router.get('/traffic', c.traffic);
router.get('/services', c.services);
router.get('/database', c.database);
router.get('/coolify', c.coolify);

module.exports = router;
