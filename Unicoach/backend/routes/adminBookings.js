const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminBookingController = require('../controllers/adminBookingController');

router.use(verifyToken, requireAdmin);

// Booking Events
router.get('/events', adminBookingController.getAllBookingEvents);
router.post('/events', adminBookingController.createBookingEvent);
router.put('/events/:id', adminBookingController.updateBookingEvent);
router.delete('/events/:id', adminBookingController.deleteBookingEvent);

// Booked Slots
router.get('/slots', adminBookingController.getAllBookedSlots);
router.put('/slots/:id', adminBookingController.updateBookedSlot);
router.delete('/slots/:id', adminBookingController.deleteBookedSlot);

module.exports = router;
