const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/consultationController');

router.use(verifyToken, requireAdmin);
router.get('/', c.adminList);
router.get('/availability', c.adminGetAvailability);
router.put('/availability', c.adminSaveAvailability);
router.patch('/:id', c.adminUpdate);

module.exports = router;
