const express = require('express');
const router = express.Router();
const c = require('../controllers/consultationController');

// Public: paid consultation calls with the UniCoach team (/book-consultation)
router.get('/config', c.getConfig);
router.post('/', c.create);
router.post('/:ref/verify', c.verify);

module.exports = router;
