const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminUniversityController = require('../controllers/adminUniversityController');

router.use(verifyToken, requireAdmin);

// Country CRUD Routes
router.get('/countries', adminUniversityController.getAllCountries);
router.get('/countries/:id', adminUniversityController.getCountryById);
router.post('/countries', adminUniversityController.createCountry);
router.put('/countries/:id', adminUniversityController.updateCountry);
router.delete('/countries/:id', adminUniversityController.deleteCountry);

// University CRUD Routes
router.get('/universities', adminUniversityController.getAllUniversities);
router.get('/universities/:id', adminUniversityController.getUniversityById);
router.post('/universities', adminUniversityController.createUniversity);
router.put('/universities/:id', adminUniversityController.updateUniversity);
router.delete('/universities/:id', adminUniversityController.deleteUniversity);

// Dataset seeding
router.post('/seed-dataset', adminUniversityController.seedDataset);

module.exports = router;
