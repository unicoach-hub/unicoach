const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminUserController = require('../controllers/adminUserController');

router.use(verifyToken, requireAdmin);

router.get('/', adminUserController.getAllUsers);
router.get('/count', adminUserController.getUserCount);
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
