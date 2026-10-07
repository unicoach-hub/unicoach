const express = require('express');
const router = express.Router();
const digestController = require('../controllers/digestController');

// GET /api/digest - Retrieve all published digests
router.get('/', digestController.getAllDigests);

module.exports = router;
