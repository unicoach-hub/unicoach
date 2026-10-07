const express = require('express');
const router = express.Router();
const publicUniversityController = require('../controllers/publicUniversityController');

// GET all countries
router.get('/countries', publicUniversityController.getPublicCountries);

// GET single country by country code (e.g., 'usa', 'uk')
router.get('/countries/:code', publicUniversityController.getPublicCountryByCode);

// GET universities with filters
router.get('/universities', publicUniversityController.getPublicUniversities);

// GET one university (used by the course details page so it shows database data, not a bundled copy)
router.get('/universities/:id', publicUniversityController.getPublicUniversityById);

module.exports = router;
