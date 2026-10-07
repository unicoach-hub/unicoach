const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../../middleware/auth');
const {
  getPlatformOverview,
  getAllMentors,
  toggleMentorVerification,
  updateMentorApplication,
  toggleMentorStatus,
  deleteMentor,
  getAllBookings,
  getPlatformLedger,
  getAllPayouts,
  processPayout,
  getAllNotifications,
  sendMentorNotification,
  deleteNotification,
  setupMentorRouteAccount,
  retryBookingTransfer,
  refundBookingByAdmin
} = require('../controllers/adminUnicoachController');

// Every UniCoach admin endpoint (mentor approval, payouts, bookings, PII) requires an admin session
router.use(verifyToken, requireAdmin);

// Subsystem health diagnostic
router.get('/health', (req, res) => {
  res.json({
    subsystem: 'UniCoach Admin Management Suite',
    status: 'ACTIVE',
    timestamp: new Date().toISOString()
  });
});

// Admin KPI & Revenue Overview
router.get('/overview', getPlatformOverview);

// Mentors Directory & Control
router.get('/mentors', getAllMentors);
router.patch('/mentors/:mentorId/verify', toggleMentorVerification);
router.patch('/mentors/:mentorId/application', updateMentorApplication);
router.patch('/mentors/:mentorId/status', toggleMentorStatus);
router.delete('/mentors/:mentorId', deleteMentor);

// Razorpay Route linked account (create / retry / refresh status)
router.post('/mentors/:mentorId/route-account', setupMentorRouteAccount);

// Global Bookings & Sessions
router.get('/bookings', getAllBookings);
router.post('/bookings/:bookingId/retry-transfer', retryBookingTransfer);
router.post('/bookings/:bookingId/refund', refundBookingByAdmin);

// Platform Double-Entry Ledger Audit
router.get('/ledger', getPlatformLedger);

// Creator Payout Requests & Settlement
router.get('/payouts', getAllPayouts);
router.post('/payouts/:payoutId/process', processPayout);

// Creator / Mentor Broadcast & Notifications
router.get('/notifications', getAllNotifications);
router.post('/notifications', sendMentorNotification);
router.delete('/notifications/:notificationId', deleteNotification);

module.exports = router;
