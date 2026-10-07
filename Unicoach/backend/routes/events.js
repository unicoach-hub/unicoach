const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET /api/events - Retrieve all published events
router.get('/', eventController.getAllEvents);

// GET /api/events/:id - Retrieve details for a specific event by ID or slug
router.get('/:id', eventController.getEventByIdOrSlug);

// POST /api/events/:id/register - Register a student for a webinar / event
router.post('/:id/register', eventController.registerForEvent);

module.exports = router;
