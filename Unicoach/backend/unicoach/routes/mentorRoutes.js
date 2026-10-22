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

// Students who signed up through this mentor's referral link (name, stage, dates only)
router.get('/:handle/referrals', handleValidatorMiddleware, mentorAuth, async (req, res) => {
  try {
    const User = require('../../models/User');
    const { PHASES, normalizeStage, publicStages } = require('../../config/studentStages');
    const students = await User.find({ referredBy: req.mentor._id, role: 'user' })
      .select('name dreamCountry preferredIntake journeyStage stageUpdatedAt referredAt createdAt')
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();
    return res.json({
      handle: req.mentor.handle,
      stages: publicStages(),
      phases: PHASES,
      students: students.map((s) => ({
        _id: s._id,
        name: s.name,
        dreamCountry: s.dreamCountry || '',
        preferredIntake: s.preferredIntake || '',
        journeyStage: normalizeStage(s.journeyStage),
        stageUpdatedAt: s.stageUpdatedAt || s.referredAt || s.createdAt,
        joinedAt: s.referredAt || s.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error loading mentor referrals:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Form links the mentor can share (each carries ?ref=<handle>) and every submission that came through them
router.get('/:handle/form-referrals', handleValidatorMiddleware, mentorAuth, async (req, res) => {
  try {
    const CustomForm = require('../../models/CustomForm');
    const FormSubmission = require('../../models/FormSubmission');
    const [forms, subs] = await Promise.all([
      CustomForm.find({ active: true }).select('name slug headerTitle').sort({ createdAt: -1 }).lean(),
      FormSubmission.find({ referredBy: req.mentor._id })
        .select('form data currentStage submittedAt')
        .populate('form', 'name')
        .sort({ submittedAt: -1 })
        .limit(5000)
        .lean(),
    ]);
    return res.json({
      handle: req.mentor.handle,
      forms: forms.map((f) => ({ name: f.headerTitle || f.name, slug: f.slug })),
      submissions: subs.map((s) => ({
        _id: s._id,
        formName: s.form?.name || 'Form',
        stage: s.currentStage,
        submittedAt: s.submittedAt,
        data: s.data || {},
      })),
    });
  } catch (err) {
    console.error('Error loading mentor form referrals:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

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
