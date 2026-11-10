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

// Anonymous website visitors (controllers/visitorController)
const visitors = require('../controllers/visitorController');
router.get('/visitors', visitors.list);
router.get('/visitors/summary', visitors.summary);
router.get('/visitors/:id', visitors.detail);

// Database backups (controllers/backupController)
const backups = require('../controllers/backupController');
router.get('/backups', backups.status);
router.post('/backups/run', backups.runNow);
router.get('/backups/download', backups.download);

module.exports = router;
