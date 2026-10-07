const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const featureController = require('../controllers/featureController');
const { handleValidatorMiddleware } = require('../middlewares/slugValidator');
const { mentorAuth } = require('../middlewares/mentorAuth');
const { uploadResource } = require('../services/uploadService');

// Resolve logged-in user's own mentor profile
router.get('/me', mentorAuth, mentorController.getMyProfile);

// Onboard / Update Mentor Profile (Authenticated)
router.post('/', mentorAuth, mentorController.createOrUpdateMentor);

// Dashboard Overview (Protected by verified ownership)
router.get('/:handle/dashboard', handleValidatorMiddleware, mentorAuth, mentorController.getDashboardOverview);

// Manage Offerings / Services
router.post('/:handle/services', handleValidatorMiddleware, mentorAuth, mentorController.createService);
router.put('/:handle/services/:serviceId', handleValidatorMiddleware, mentorAuth, mentorController.updateService);
router.delete('/:handle/services/:serviceId', handleValidatorMiddleware, mentorAuth, mentorController.deleteService);

// Publish & Manage Availability Slots (Full Calendar CRUD)
router.post('/:handle/publish-slots', handleValidatorMiddleware, mentorAuth, mentorController.publishSlots);
router.post('/:handle/single-slot', handleValidatorMiddleware, mentorAuth, mentorController.createSingleSlot);
router.post('/:handle/copy-slots', handleValidatorMiddleware, mentorAuth, mentorController.copySlots);
router.patch('/:handle/slots/:slotId/toggle', handleValidatorMiddleware, mentorAuth, mentorController.toggleSlotStatus);
router.delete('/:handle/slots-by-date', handleValidatorMiddleware, mentorAuth, mentorController.deleteSlotsByDate);
router.delete('/:handle/slots/:slotId', handleValidatorMiddleware, mentorAuth, mentorController.deleteSlot);

// Update Booking Lifecycle (Mark Completed / Cancelled)
router.patch('/:handle/bookings/:bookingId/status', handleValidatorMiddleware, mentorAuth, mentorController.updateBookingStatus);

// Send 1-Click Meeting Invite Email to Student
router.post('/:handle/bookings/:bookingId/send-invite-email', handleValidatorMiddleware, mentorAuth, mentorController.sendBookingInviteEmail);

// Update / Customize Meeting Link (Google Meet / Zoom / Custom)
router.patch('/:handle/bookings/:bookingId/meeting-link', handleValidatorMiddleware, mentorAuth, mentorController.updateMeetingLink);

// File Upload for Digital Resources (PDF, ZIP, DOCX)
router.post('/:handle/upload-resource', handleValidatorMiddleware, mentorAuth, uploadResource.single('file'), mentorController.uploadResourceFile);

// Storefront Photo / Banner Upload (Avatar & Cover Image)
router.post('/:handle/upload-photo', handleValidatorMiddleware, mentorAuth, uploadResource.single('photo'), mentorController.uploadProfilePhoto);

// Priority DM Inbox & Answering
router.get('/:handle/priority-dms', handleValidatorMiddleware, mentorAuth, mentorController.getPriorityDMs);
router.post('/:handle/priority-dms/:bookingId/answer', handleValidatorMiddleware, mentorAuth, mentorController.answerPriorityDM);

// Real-Time Financial Ledger & Balances
router.get('/:handle/ledger', handleValidatorMiddleware, mentorAuth, mentorController.getMentorLedger);

// Coupon / Promo Code Management
router.post('/:handle/coupons', handleValidatorMiddleware, mentorAuth, featureController.createCoupon);
router.get('/:handle/coupons', handleValidatorMiddleware, mentorAuth, featureController.getCoupons);
router.delete('/:handle/coupons/:couponId', handleValidatorMiddleware, mentorAuth, featureController.deleteCoupon);

// Creator Payouts & Withdrawals
router.put('/:handle/payout-details', handleValidatorMiddleware, mentorAuth, mentorController.updatePayoutDetails);
router.post('/:handle/payouts/request', handleValidatorMiddleware, mentorAuth, mentorController.requestPayout);
router.get('/:handle/payouts', handleValidatorMiddleware, mentorAuth, mentorController.getPayouts);

// Creator / Mentor Announcements & Admin Alerts
router.get('/:handle/notifications', handleValidatorMiddleware, mentorAuth, mentorController.getMentorNotifications);
router.patch('/:handle/notifications/:notificationId/read', handleValidatorMiddleware, mentorAuth, mentorController.markNotificationRead);
router.patch('/:handle/notifications/read-all', handleValidatorMiddleware, mentorAuth, mentorController.markAllNotificationsRead);

module.exports = router;
