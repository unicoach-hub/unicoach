const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { validate, leadSubmitSchema } = require('../middleware/validate');

// POST /api/leads/submit - Submit eligibility / consultation form with Zod schema validation (saved at once, no OTP)
router.post('/submit', validate(leadSubmitSchema), leadController.submitLead);

// POST /api/leads/book-consultation - Direct consultation booking from website into CRM
router.post('/book-consultation', leadController.bookConsultation);
// Unsubscribe link from promotional emails (signed, so it only works for that lead)
router.post('/unsubscribe', require('../controllers/adminMessagingController').unsubscribeLead);

// No OTP step for students: /submit saves the lead immediately (verify-otp / resend-otp were removed)

module.exports = router;

