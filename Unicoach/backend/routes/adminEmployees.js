const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminEmployeeController = require('../controllers/adminEmployeeController');

router.use(verifyToken, requireAdmin);

router.get('/', adminEmployeeController.getAllEmployees);
router.post('/', adminEmployeeController.createEmployee);
router.put('/:id', adminEmployeeController.updateEmployee);
router.delete('/:id', adminEmployeeController.deleteEmployee);

module.exports = router;
