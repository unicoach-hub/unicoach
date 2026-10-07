const express = require('express');
const router = express.Router();
const publicBookingController = require('../controllers/publicBookingController');

// GET public booking event by slug
router.get('/:slug', publicBookingController.getPublicBookingEvent);

// GET already booked slots for a specific date
router.get('/:slug/booked-slots', publicBookingController.getBookedSlots);

// POST book time slot
router.post('/:slug/book', publicBookingController.bookSlot);

module.exports = router;
