const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachService = require('../models/UnicoachService');
const UnicoachSlot = require('../models/UnicoachSlot');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachLedger = require('../models/UnicoachLedger');
const UnicoachCoupon = require('../models/UnicoachCoupon');
const UnicoachReview = require('../models/UnicoachReview');
const UnicoachPayout = require('../models/UnicoachPayout');
const UnicoachNotification = require('../models/UnicoachNotification');
const { getAccessUrl } = require('../services/fileStorageService');

// Private files (verification docs, paid products) open for admins through 1-hour signed links
const ADMIN_LINK_TTL_SECONDS = 3600;
const {
  ensureLinkedAccount,
  refreshLinkedAccountStatus,
  createMentorTransfer,
  refundBooking
} = require('../services/routeService');

/**
 * Open the mentor's Razorpay Route payout account right after approval.
 * Never blocks approval: problems are stored on mentor.routeAccount and shown to the admin.
 */
const setupPayoutAccountAfterApproval = async (mentor) => {
  try {
    const result = await ensureLinkedAccount(mentor);
    if (result.ok) return `Payout account ${result.status === 'ACTIVATED' ? 'activated' : 'created (' + result.status + ')'}.`;
    return `Payout account not created yet: ${result.reason}`;
  } catch (err) {
    return `Payout account not created yet: ${err.message}`;
  }
};

/**
 * GET /api/admin/unicoach/overview
 * Platform-wide KPI & financial metrics for administrators
 */
const getPlatformOverview = async (req, res) => {
  try {
    const totalMentors = await UnicoachMentor.countDocuments();
    const verifiedMentors = await UnicoachMentor.countDocuments({ isVerified: true });
    const activeMentors = await UnicoachMentor.countDocuments({ active: true });

    const totalServices = await UnicoachService.countDocuments({ active: true });
    const totalSlots = await UnicoachSlot.countDocuments();
    const availableSlots = await UnicoachSlot.countDocuments({ status: 'AVAILABLE' });

    const totalBookings = await UnicoachBooking.countDocuments();
    const completedBookings = await UnicoachBooking.countDocuments({ state: 'COMPLETED' });
    const confirmedBookings = await UnicoachBooking.countDocuments({ state: 'CONFIRMED' });
    const pendingBookings = await UnicoachBooking.countDocuments({ state: 'PAYMENT_PENDING' });

    // Payout metrics
    const pendingPayoutsCount = await UnicoachPayout.countDocuments({ status: { $in: ['REQUESTED', 'PROCESSING'] } });
    const totalDisbursedAgg = await UnicoachPayout.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amountINR' } } }
    ]);
    const totalDisbursedINR = totalDisbursedAgg[0]?.total || 0;

    // Financial calculations via aggregate & ledger
    const revenueAgg = await UnicoachBooking.aggregate([
      { $match: { state: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      {
        $group: {
          _id: null,
          totalGrossINR: { $sum: '$amountPaid' },
          totalDiscountGivenINR: { $sum: '$discountAmount' }
        }
      }
    ]);

    const totalGrossRevenueINR = revenueAgg[0]?.totalGrossINR || 0;
    const totalDiscountGivenINR = revenueAgg[0]?.totalDiscountGivenINR || 0;

    // Escrow held currently
    const escrowCredit = await UnicoachLedger.aggregate([
      { $match: { account: 'ESCROW', type: 'CREDIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const escrowDebit = await UnicoachLedger.aggregate([
      { $match: { account: 'ESCROW', type: 'DEBIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const inEscrowHeldINR = Math.max(0, (escrowCredit[0]?.total || 0) - (escrowDebit[0]?.total || 0));

    // Creator wallets available
    const walletCredit = await UnicoachLedger.aggregate([
      { $match: { account: 'CREATOR_WALLET', type: 'CREDIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const walletDebit = await UnicoachLedger.aggregate([
      { $match: { account: 'CREATOR_WALLET', type: 'DEBIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const creatorWalletAvailableINR = Math.max(0, (walletCredit[0]?.total || 0) - (walletDebit[0]?.total || 0));

    // Platform Commission earned (10%)
    const commissionCredit = await UnicoachLedger.aggregate([
      { $match: { account: 'PLATFORM_COMMISSION', type: 'CREDIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const platformCommissionEarnedINR = commissionCredit[0]?.total || 0;

    res.json({
      creators: {
        total: totalMentors,
        verified: verifiedMentors,
        active: activeMentors
      },
      catalog: {
        activeServices: totalServices,
        totalSlots,
        availableSlots
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings
      },
      finance: {
        totalGrossRevenueINR,
        totalDiscountGivenINR,
        inEscrowHeldINR,
        creatorWalletAvailableINR,
        platformCommissionEarnedINR,
        pendingPayoutsCount,
        totalDisbursedINR
      }
    });
  } catch (err) {
    console.error('Error fetching admin UniCoach overview:', err);
    res.status(500).json({ error: 'Failed to fetch platform overview' });
  }
};

/**
 * GET /api/admin/unicoach/mentors
 * Comprehensive list of all registered influencers/creators with revenue and service metrics
 */
const getAllMentors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.applicationStatus = req.query.status.toUpperCase();
    }
    if (req.query.verified !== undefined) {
      filter.isVerified = req.query.verified === 'true';
    }

    const mentors = await UnicoachMentor.find(filter).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      mentors.map(async (m) => {
        const services = await UnicoachService.find({ mentorId: m._id, active: true }).lean();
        const availableSlotsCount = await UnicoachSlot.countDocuments({ mentorId: m._id, status: 'AVAILABLE' });
        const bookingsCount = await UnicoachBooking.countDocuments({ mentorId: m._id });
        const completedBookingsCount = await UnicoachBooking.countDocuments({ mentorId: m._id, state: 'COMPLETED' });

        // Calculate mentor's gross earnings
        const bookingAgg = await UnicoachBooking.aggregate([
          { $match: { mentorId: m._id, state: { $in: ['CONFIRMED', 'COMPLETED'] } } },
          { $group: { _id: null, gross: { $sum: '$amountPaid' } } }
        ]);
        const grossEarningsINR = bookingAgg[0]?.gross || 0;

        // Mentor's creator wallet balance
        const wCredit = await UnicoachLedger.aggregate([
          { $match: { mentorId: m._id, account: 'CREATOR_WALLET', type: 'CREDIT' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const wDebit = await UnicoachLedger.aggregate([
          { $match: { mentorId: m._id, account: 'CREATOR_WALLET', type: 'DEBIT' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const walletBalanceINR = Math.max(0, (wCredit[0]?.total || 0) - (wDebit[0]?.total || 0));

        // In escrow for this mentor
        const eCredit = await UnicoachLedger.aggregate([
          { $match: { mentorId: m._id, account: 'ESCROW', type: 'CREDIT' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const eDebit = await UnicoachLedger.aggregate([
          { $match: { mentorId: m._id, account: 'ESCROW', type: 'DEBIT' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const inEscrowINR = Math.max(0, (eCredit[0]?.total || 0) - (eDebit[0]?.total || 0));

        return {
          ...m,
          verificationDocUrl: m.verificationDocUrl
            ? await getAccessUrl(m.verificationDocUrl, { expiresInSeconds: ADMIN_LINK_TTL_SECONDS })
            : '',
          services,
          servicesCount: services.length,
          availableSlotsCount,
          bookingsCount,
          completedBookingsCount,
          grossEarningsINR,
          walletBalanceINR,
          inEscrowINR
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching mentors for admin:', err);
    res.status(500).json({ error: 'Failed to fetch mentors list' });
  }
};

/**
 * PATCH /api/admin/unicoach/mentors/:mentorId/verify
 * Toggle verified badge for a creator
 */
const toggleMentorVerification = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { isVerified } = req.body;

    const mentor = await UnicoachMentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    mentor.isVerified = typeof isVerified === 'boolean' ? isVerified : !mentor.isVerified;

    if (mentor.isVerified) {
      mentor.applicationStatus = 'APPROVED';
      if (!mentor.badges.includes('Verified Creator')) {
        mentor.badges.unshift('Verified Creator');
      }
    } else {
      mentor.applicationStatus = 'PENDING';
      mentor.badges = mentor.badges.filter(b => b !== 'Verified Creator');
    }

    await mentor.save();

    const payoutAccountMessage = mentor.isVerified ? await setupPayoutAccountAfterApproval(mentor) : '';

    res.json({
      success: true,
      message: `Mentor @${mentor.handle} verification status updated to ${mentor.isVerified}. ${payoutAccountMessage}`.trim(),
      payoutAccountMessage,
      mentor
    });
  } catch (err) {
    console.error('Error toggling mentor verification:', err);
    res.status(500).json({ error: 'Failed to update verification status' });
  }
};

/**
 * PATCH /api/admin/unicoach/mentors/:mentorId/application
 * Approve or Reject a mentor application with official Blue Tick badge
 */
const updateMentorApplication = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { action, rejectionReason, adminNotes } = req.body;

    const mentor = await UnicoachMentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    if (action === 'APPROVE') {
      mentor.isVerified = true;
      mentor.applicationStatus = 'APPROVED';
      mentor.rejectionReason = '';
      if (adminNotes) mentor.adminNotes = adminNotes;
      if (!mentor.badges.includes('Verified Creator')) {
        mentor.badges.unshift('Verified Creator');
      }
      await mentor.save();
      const payoutAccountMessage = await setupPayoutAccountAfterApproval(mentor);
      return res.json({
        success: true,
        message: `Mentor @${mentor.handle} approved and verified with Blue Tick! Now visible on public marketplace. ${payoutAccountMessage}`,
        payoutAccountMessage,
        mentor
      });
    } else if (action === 'REJECT') {
      mentor.isVerified = false;
      mentor.applicationStatus = 'REJECTED';
      mentor.rejectionReason = rejectionReason || 'Application credentials could not be verified.';
      if (adminNotes) mentor.adminNotes = adminNotes;
      mentor.badges = mentor.badges.filter(b => b !== 'Verified Creator');
      await mentor.save();
      return res.json({
        success: true,
        message: `Mentor @${mentor.handle} application rejected.`,
        mentor
      });
    } else {
      return res.status(400).json({ error: "Invalid action. Must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    console.error('Error updating mentor application:', err);
    res.status(500).json({ error: 'Failed to update mentor application' });
  }
};

/**
 * PATCH /api/admin/unicoach/mentors/:mentorId/status
 * Enable or suspend a creator account
 */
const toggleMentorStatus = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { active } = req.body;

    const mentor = await UnicoachMentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    mentor.active = typeof active === 'boolean' ? active : !mentor.active;
    await mentor.save();

    res.json({
      success: true,
      message: `Mentor @${mentor.handle} active status set to ${mentor.active}`,
      mentor
    });
  } catch (err) {
    console.error('Error updating mentor status:', err);
    res.status(500).json({ error: 'Failed to update mentor status' });
  }
};

/**
 * DELETE /api/admin/unicoach/mentors/:mentorId
 * Permanently delete a creator/mentor and clean up services, slots, coupons, reviews
 */
const deleteMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await UnicoachMentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    // Clean up all related offerings, slots, reviews, coupons
    await UnicoachService.deleteMany({ mentorId });
    await UnicoachSlot.deleteMany({ mentorId });
    await UnicoachCoupon.deleteMany({ mentorId });
    await UnicoachReview.deleteMany({ mentorId });

    // Delete mentor record
    await UnicoachMentor.findByIdAndDelete(mentorId);

    res.json({
      success: true,
      message: `Mentor @${mentor.handle} (${mentor.name}) and all associated offerings have been deleted permanently.`
    });
  } catch (err) {
    console.error('Error deleting mentor:', err);
    res.status(500).json({ error: 'Failed to delete mentor' });
  }
};

/**
 * GET /api/admin/unicoach/bookings
 * Global list of all 1:1 sessions & orders across all creators
 */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await UnicoachBooking.find()
      .populate('mentorId', 'name handle email avatarUrl')
      .populate('serviceId', 'title type priceInINR')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    await Promise.all(bookings.map(async (b) => {
      if (b.digitalAssetDelivery?.fileUrl) {
        b.digitalAssetDelivery.fileUrl = await getAccessUrl(b.digitalAssetDelivery.fileUrl, { expiresInSeconds: ADMIN_LINK_TTL_SECONDS });
      }
    }));

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching admin bookings:', err);
    res.status(500).json({ error: 'Failed to fetch global bookings' });
  }
};

/**
 * GET /api/admin/unicoach/ledger
 * Complete double-entry bookkeeping ledger for transparency & audit
 */
const getPlatformLedger = async (req, res) => {
  try {
    const ledger = await UnicoachLedger.find()
      .populate('mentorId', 'name handle')
      .populate('bookingId', 'bookingRef studentName')
      .sort({ timestamp: -1 })
      .limit(300)
      .lean();

    res.json(ledger);
  } catch (err) {
    console.error('Error fetching admin ledger:', err);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
};

/**
 * GET /api/admin/unicoach/payouts
 * List all creator payout/withdrawal requests
 */
const getAllPayouts = async (req, res) => {
  try {
    const payouts = await UnicoachPayout.find()
      .populate('mentorId', 'name handle email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json(payouts);
  } catch (err) {
    console.error('Error fetching admin payouts:', err);
    res.status(500).json({ error: 'Failed to fetch payouts.' });
  }
};

/**
 * POST /api/admin/unicoach/payouts/:payoutId/process
 * Settle payout (mark PAID with UTR) or REJECT with refund to creator wallet
 */
const processPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { action, transactionRef, adminRemarks } = req.body;

    const payout = await UnicoachPayout.findById(payoutId).populate('mentorId');
    if (!payout) return res.status(404).json({ error: 'Payout request not found.' });

    if (payout.status === 'PAID') {
      return res.status(400).json({ error: 'Payout is already marked as PAID.' });
    }
    if (payout.status === 'REJECTED') {
      return res.status(400).json({ error: 'Payout is already marked as REJECTED.' });
    }

    if (action === 'APPROVE') {
      payout.status = 'PAID';
      payout.transactionRef = transactionRef || 'DIRECT_TRANSFER';
      payout.adminRemarks = adminRemarks || 'Disbursed by Admin';
      payout.processedAt = new Date();
      await payout.save();

      // Double-entry: Move funds from PAYOUT_HOLD to BANK_SETTLEMENT
      await UnicoachLedger.create([
        {
          payoutId: payout._id,
          mentorId: payout.mentorId._id,
          type: 'DEBIT',
          account: 'PAYOUT_HOLD',
          amount: payout.amountINR,
          currency: payout.currency || 'INR',
          description: `Disbursed payout ${payout.payoutRef} via ${payout.payoutMethod}`
        },
        {
          payoutId: payout._id,
          mentorId: payout.mentorId._id,
          type: 'CREDIT',
          account: 'BANK_SETTLEMENT',
          amount: payout.amountINR,
          currency: payout.currency || 'INR',
          description: `Bank disbursement for ${payout.payoutRef} (Ref: ${payout.transactionRef})`
        }
      ]);

      return res.json({
        success: true,
        message: `Payout of ₹${payout.amountINR} to @${payout.mentorId.handle} successfully marked as PAID.`,
        payout
      });
    } else if (action === 'REJECT') {
      payout.status = 'REJECTED';
      payout.adminRemarks = adminRemarks || 'Rejected by Admin';
      payout.processedAt = new Date();
      await payout.save();

      // Double-entry: Refund from PAYOUT_HOLD back to CREATOR_WALLET
      await UnicoachLedger.create([
        {
          payoutId: payout._id,
          mentorId: payout.mentorId._id,
          type: 'DEBIT',
          account: 'PAYOUT_HOLD',
          amount: payout.amountINR,
          currency: payout.currency || 'INR',
          description: `Reversal of payout hold ${payout.payoutRef}`
        },
        {
          payoutId: payout._id,
          mentorId: payout.mentorId._id,
          type: 'CREDIT',
          account: 'CREATOR_WALLET',
          amount: payout.amountINR,
          currency: payout.currency || 'INR',
          description: `Refunded to wallet after payout ${payout.payoutRef} rejection: ${payout.adminRemarks}`
        }
      ]);

      return res.json({
        success: true,
        message: `Payout request rejected and ₹${payout.amountINR} refunded back to creator's available wallet.`,
        payout
      });
    } else {
      return res.status(400).json({ error: "Invalid action. Must be 'APPROVE' or 'REJECT'." });
    }
  } catch (err) {
    console.error('Error processing payout:', err);
    res.status(500).json({ error: 'Failed to process payout.' });
  }
};

/**
 * GET /api/admin/unicoach/notifications
 * Get all notifications / broadcasts sent to creators
 */
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await UnicoachNotification.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching admin notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

/**
 * POST /api/admin/unicoach/notifications
 * Send a notification/broadcast to all or specific mentors
 */
const sendMentorNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      priority,
      targetType,
      targetMentorId,
      targetMentorHandle,
      targetMentorName,
      actionLink,
      actionText,
      senderAdmin
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Notification title is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Notification message is required.' });
    }

    let finalHandle = targetMentorHandle || '';
    let finalName = targetMentorName || '';
    let finalId = targetMentorId || null;

    if (targetType === 'SPECIFIC' && targetMentorId) {
      const mentor = await UnicoachMentor.findById(targetMentorId);
      if (mentor) {
        finalHandle = mentor.handle;
        finalName = mentor.name;
        finalId = mentor._id;
      }
    }

    const notification = await UnicoachNotification.create({
      title: title.trim(),
      message: message.trim(),
      category: category || 'ANNOUNCEMENT',
      priority: priority || 'NORMAL',
      targetType: targetType || 'ALL',
      targetMentorId: finalId,
      targetMentorHandle: finalHandle,
      targetMentorName: finalName,
      actionLink: actionLink?.trim() || '',
      actionText: actionText?.trim() || '',
      senderAdmin: senderAdmin || 'UniCoach Admin Team',
      readBy: []
    });

    res.status(201).json({
      success: true,
      message: targetType === 'ALL' ? 'Broadcast notification dispatched to all mentors successfully.' : `Notification sent to @${finalHandle} successfully.`,
      notification
    });
  } catch (err) {
    console.error('Error sending mentor notification:', err);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
};

/**
 * DELETE /api/admin/unicoach/notifications/:notificationId
 * Retract / delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await UnicoachNotification.findByIdAndDelete(notificationId);
    res.json({ success: true, message: 'Notification retracted successfully.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
};

/**
 * POST /api/admin/unicoach/mentors/:mentorId/route-account
 * Create / finish / refresh the mentor's Razorpay Route payout account
 */
const setupMentorRouteAccount = async (req, res) => {
  try {
    const mentor = await UnicoachMentor.findById(req.params.mentorId);
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });

    const result = mentor.routeAccount?.productId
      ? await refreshLinkedAccountStatus(mentor)
      : await ensureLinkedAccount(mentor);

    // If it just became active, push any bookings that were waiting for this account
    let retried = 0;
    if (mentor.routeAccount?.status === 'ACTIVATED') {
      const waiting = await UnicoachBooking.find({
        mentorId: mentor._id,
        'settlement.status': 'PENDING_ACCOUNT',
        state: { $in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] }
      }).select('_id');
      for (const b of waiting) {
        const r = await createMentorTransfer(b._id);
        if (r.ok) retried += 1;
      }
    }

    return res.status(result.ok || result.skipped ? 200 : 400).json({
      success: Boolean(result.ok),
      routeAccount: mentor.routeAccount,
      transfersCompleted: retried,
      message: result.ok
        ? `Payout account status: ${mentor.routeAccount.status}${retried ? `. ${retried} pending booking(s) transferred.` : ''}`
        : (result.reason || 'Payout account could not be set up.')
    });
  } catch (err) {
    console.error('Error setting up mentor route account:', err);
    res.status(500).json({ error: 'Failed to set up mentor payout account.' });
  }
};

/**
 * POST /api/admin/unicoach/bookings/:bookingId/retry-transfer
 * Retry the automatic split for a booking whose transfer is pending / failed
 */
const retryBookingTransfer = async (req, res) => {
  try {
    const result = await createMentorTransfer(req.params.bookingId, null, { force: true });
    const booking = await UnicoachBooking.findById(req.params.bookingId).select('bookingRef settlement');
    return res.status(result.ok ? 200 : 400).json({
      success: Boolean(result.ok),
      message: result.ok ? 'Transfer to mentor created.' : (result.reason || 'Transfer could not be created.'),
      settlement: booking?.settlement
    });
  } catch (err) {
    console.error('Error retrying transfer:', err);
    res.status(500).json({ error: 'Failed to retry transfer.' });
  }
};

/**
 * POST /api/admin/unicoach/bookings/:bookingId/refund
 * Full refund to the student; reverses the mentor's (held) transfer
 */
const refundBookingByAdmin = async (req, res) => {
  try {
    const booking = await UnicoachBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const result = await refundBooking(booking._id, req.body?.reason || 'Refunded by UniCoach admin');
    if (!result.ok) return res.status(400).json({ success: false, error: result.reason });

    await UnicoachBooking.updateOne(
      { _id: booking._id },
      { $set: { state: 'REFUNDED', cancellationReason: req.body?.reason || 'Refunded by UniCoach admin' } }
    );
    if (booking.slotId) {
      await UnicoachSlot.updateOne({ _id: booking.slotId, bookingId: booking._id }, { $set: { status: 'AVAILABLE', bookingId: null } });
    }
    return res.json({ success: true, message: 'Refund initiated to the student.', refundId: result.refundId || null });
  } catch (err) {
    console.error('Error refunding booking:', err);
    res.status(500).json({ error: 'Failed to refund booking.' });
  }
};

module.exports = {
  setupMentorRouteAccount,
  retryBookingTransfer,
  refundBookingByAdmin,
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
  deleteNotification
};

