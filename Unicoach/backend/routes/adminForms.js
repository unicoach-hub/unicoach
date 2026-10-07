const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminFormController = require('../controllers/adminFormController');

router.use(verifyToken, requireAdmin);

// Routes
router.get('/', adminFormController.getAllForms);
router.get('/:id', adminFormController.getFormById);
router.post('/', adminFormController.createForm);
router.put('/:id', adminFormController.updateForm);
router.delete('/:id', adminFormController.deleteForm);

module.exports = router;
