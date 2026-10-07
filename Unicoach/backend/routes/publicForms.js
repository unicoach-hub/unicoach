const express = require('express');
const router = express.Router();
const publicFormController = require('../controllers/publicFormController');

// GET form by slug (PUBLIC — no auth)
router.get('/:slug', publicFormController.getFormBySlug);

// POST submit form (PUBLIC — no auth)
router.post('/:slug/submit', publicFormController.submitForm);

module.exports = router;
