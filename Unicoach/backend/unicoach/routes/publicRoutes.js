const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { handleValidatorMiddleware } = require('../middlewares/slugValidator');
const idempotencyMiddleware = require('../middlewares/idempotency');

const featureController = require('../controllers/featureController');
const { uploadResource } = require('../services/uploadService');

// ── Public Directory / Marketplace (Only Verified Mentors) ──
router.get('/directory', bookingController.getPublicDirectory);

// ── Mentor Application / Onboarding ──
router.post('/apply', bookingController.applyAsMentor);
router.post('/upload-verification-doc', uploadResource.single('file'), bookingController.uploadVerificationDoc);

// ── Public Mentor Profile & Slots ──
router.get('/@:handle', handleValidatorMiddleware, bookingController.getPublicProfile);
router.get('/@:handle/slots', handleValidatorMiddleware, bookingController.getAvailableSlots);

// ── Promo Code / Coupon Validation ──
router.post('/@:handle/validate-coupon', handleValidatorMiddleware, featureController.validateCoupon);

// ── Verified Student Reviews ──
router.post('/@:handle/reviews', handleValidatorMiddleware, featureController.submitReview);
router.get('/@:handle/reviews', handleValidatorMiddleware, featureController.getReviews);

// ── 2-Phase Booking Flow (Pillar #1, #3, #5) ──
// Phase 1: 10-Minute Cart Hold & Temporary Redis Lock
router.post('/@:handle/reserve-slot', handleValidatorMiddleware, idempotencyMiddleware, bookingController.reserveSlot);

// Phase 2: Payment Verification, Confirmation & Escrow Ledger
router.post('/@:handle/confirm-booking', handleValidatorMiddleware, idempotencyMiddleware, bookingController.confirmBooking);

// ── Direct Instant Purchase (Digital Products & Priority DMs) ──
router.post('/@:handle/purchase-direct', handleValidatorMiddleware, idempotencyMiddleware, bookingController.purchaseDirectService);

// ── Paid Digital Product Download (token-gated, short-lived link) ──
router.get('/download/:token', bookingController.downloadDigitalAsset);

// ── Student Priority DM Status & Answer Tracking ──
router.get('/queries/:bookingRef', bookingController.getStudentQueryStatus);

// Early Cancel / Release Lock
router.post('/cancel-reservation', bookingController.cancelReservation);

// ── Direct Course Mentor Booking & Dual Notification ──
router.get('/course-mentor/:handle/sessions', bookingController.getCourseMentorSessions);
router.post('/book-course-mentor', bookingController.bookCourseMentorDirect);

// ── Payment Gateway Integration (Razorpay & PayPal) ──
const paymentController = require('../controllers/paymentController');
router.post('/@:handle/create-payment-order', handleValidatorMiddleware, paymentController.createPaymentOrder);
router.post('/@:handle/verify-payment', handleValidatorMiddleware, idempotencyMiddleware, paymentController.verifyPaymentAndConfirm);
router.post('/webhooks/razorpay', paymentController.handleRazorpayWebhook);

// Handle-less verify (course-page bookings: legacy mentor handles may contain '-')
router.post('/payments/verify', idempotencyMiddleware, paymentController.verifyPaymentAndConfirm);

module.exports = router;
