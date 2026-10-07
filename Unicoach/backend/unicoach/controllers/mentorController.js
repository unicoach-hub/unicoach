const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachService = require('../models/UnicoachService');
const UnicoachSlot = require('../models/UnicoachSlot');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachLedger = require('../models/UnicoachLedger');
const UnicoachPayout = require('../models/UnicoachPayout');
const UnicoachNotification = require('../models/UnicoachNotification');
const { validateHandle } = require('../middlewares/slugValidator');
const { cleanSocialLinks } = require('../services/socialLinks');
const { generateDaySlots, getZonedDateToUtc } = require('../services/timezoneService');
const {
  PAN_PATTERN, IFSC_PATTERN, ACCOUNT_NUMBER_PATTERN, PINCODE_PATTERN,
  getPayoutKycProblems, syncSettlementBank, releaseMentorTransfer, refundBooking, isRouteEnabled
} = require('../services/routeService');

/**
 * POST /api/unicoach/mentors
 * Register or update mentor profile
 */
const createOrUpdateMentor = async (req, res) => {
  try {
    const { 
      name, 
      handle, 
      headline, 
      bio, 
      avatarUrl,
      coverImageUrl,
      country,
      university,
      course,
      ianaTimezone, 
      bufferMinutes, 
      noticePeriodHours, 
      socialLinks 
    } = req.body;

    const validation = validateHandle(handle);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const cleanHandle = validation.cleanHandle;

    // Saves that don't send socialLinks (e.g. onboarding) leave the stored links untouched
    let cleanLinks = null;
    if (socialLinks !== undefined) {
      const result = cleanSocialLinks(socialLinks);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      cleanLinks = result.links;
    }

    // Ownership comes ONLY from the authenticated user, never from req.body.email
    const user = req.currentUser;
    if (!user?._id) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Please log in to UniCoach.' });
    }
    const userEmail = (user.email || '').toLowerCase().trim();

    let ownMentor = await UnicoachMentor.findOne({ userId: user._id });
    if (!ownMentor && userEmail) {
      // Legacy profile with no owner yet whose email exactly matches the logged-in user's email
      ownMentor = await UnicoachMentor.findOne({
        email: userEmail,
        $or: [{ userId: null }, { userId: { $exists: false } }]
      });
    }

    // Check if handle is taken by another mentor
    const existing = await UnicoachMentor.findOne({ handle: cleanHandle });
    if (existing && (!ownMentor || existing._id.toString() !== ownMentor._id.toString())) {
      return res.status(409).json({ error: `Handle @${cleanHandle} is already taken by another creator.` });
    }

    if (!ownMentor) {
      if (!userEmail) {
        return res.status(400).json({ error: 'Your account needs an email address before creating a creator profile.' });
      }
      const emailTaken = await UnicoachMentor.findOne({ email: userEmail });
      if (emailTaken) {
        return res.status(409).json({ error: 'A creator profile with your email already exists and is linked to another account.' });
      }
    }

    const updateFields = {
      name,
      handle: cleanHandle,
      headline: headline || '',
      bio: bio || '',
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl?.trim() || '' }),
      ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl?.trim() || '' }),
      ...(country !== undefined && { country: country?.trim() || '' }),
      ...(university !== undefined && { university: university?.trim() || '' }),
      ...(course !== undefined && { course: course?.trim() || '' }),
      ianaTimezone: ianaTimezone || 'Asia/Kolkata',
      bufferMinutes: bufferMinutes ?? 10,
      noticePeriodHours: noticePeriodHours ?? 2,
      ...(cleanLinks && { socialLinks: cleanLinks })
    };

    let mentor;
    if (ownMentor) {
      // Never change an existing mentor's email from this endpoint; only link an unowned legacy profile
      if (!ownMentor.userId) updateFields.userId = user._id;
      mentor = await UnicoachMentor.findOneAndUpdate(
        { _id: ownMentor._id },
        { $set: updateFields },
        { new: true }
      );
    } else {
      mentor = await UnicoachMentor.create({ ...updateFields, email: userEmail, userId: user._id });
    }

    res.status(201).json({
      success: true,
      message: `Mentor @${mentor.handle} profile successfully saved!`,
      mentor
    });
  } catch (err) {
    console.error('Error saving mentor profile:', err);
    res.status(500).json({ error: 'Server error while saving mentor profile.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/services
 * Create a new mentorship offering (1:1 Call, SOP Review, Priority DM, etc.)
 */
const createService = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { 
      type, 
      title, 
      description, 
      durationMinutes, 
      priceInINR,
      digitalAsset,
      maxDeliveryHours,
      customQuestions,
      bundleCount
    } = req.body;

    if (!title || priceInINR === undefined) {
      return res.status(400).json({ error: 'Title and priceInINR are required.' });
    }

    // Bank / Payout details validation gate
    const hasPayoutDetails = Boolean(
      (mentor.defaultPayoutDetails?.accountNumber && mentor.defaultPayoutDetails?.ifscCode) ||
      mentor.defaultPayoutDetails?.upiId
    );
    if (!hasPayoutDetails) {
      return res.status(400).json({ 
        error: 'Please add your Bank Account or UPI payout details before creating or publishing services.',
        code: 'PAYOUT_DETAILS_REQUIRED'
      });
    }

    const service = new UnicoachService({
      mentorId: mentor._id,
      type: type || 'ONE_ON_ONE',
      title,
      description: description || '',
      durationMinutes: durationMinutes || 30,
      priceInINR,
      digitalAsset: digitalAsset || {},
      maxDeliveryHours: maxDeliveryHours || 48,
      bundleCount: bundleCount ? Number(bundleCount) : 1,
      customQuestions: Array.isArray(customQuestions) ? customQuestions : []
    });

    await service.save();

    res.status(201).json({
      success: true,
      service
    });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/publish-slots
 * Generate slots for specific dates considering mentor's buffer time
 */
const publishSlots = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { dateStr, dates, startTime, endTime, durationMinutes, ianaTimezone, serviceId } = req.body;
    const effectiveTimezone = ianaTimezone || mentor.ianaTimezone || 'Asia/Kolkata';

    // If a new timezone is provided by mentor, update profile
    if (effectiveTimezone && effectiveTimezone !== mentor.ianaTimezone) {
      mentor.ianaTimezone = effectiveTimezone;
      await mentor.save();
    }

    let targetServiceId = null;
    let targetServiceTitle = 'All 1:1 Services';
    if (serviceId && serviceId !== 'ALL') {
      const srv = await UnicoachService.findOne({ _id: serviceId, mentorId: mentor._id });
      if (srv) {
        targetServiceId = srv._id;
        targetServiceTitle = srv.title;
      }
    }

    const targetDates = Array.isArray(dates) && dates.length > 0
      ? dates
      : (dateStr ? [dateStr] : []);

    if (targetDates.length === 0) {
      return res.status(400).json({ error: 'dateStr (YYYY-MM-DD) or dates array is required.' });
    }

    let allDocs = [];
    for (const d of targetDates) {
      // Generate discrete slots with buffer time in mentor's exact IANA timezone
      const slotWindows = generateDaySlots({
        dateStr: d,
        startTime: startTime || '10:00',
        endTime: endTime || '18:00',
        durationMinutes: durationMinutes || 30,
        bufferMinutes: mentor.bufferMinutes || 10,
        ianaTimezone: effectiveTimezone
      });

      const docs = slotWindows.map(s => ({
        mentorId: mentor._id,
        startUtc: s.startUtc,
        endUtc: s.endUtc,
        status: 'AVAILABLE',
        serviceId: targetServiceId,
        serviceTitle: targetServiceTitle
      }));
      allDocs.push(...docs);
    }

    if (allDocs.length === 0) {
      return res.status(400).json({ error: 'No slots could be generated with the given time range.' });
    }

    // Insert ignoring duplicate startUtc errors via mongo bulkWrite
    const bulkOps = allDocs.map(doc => ({
      updateOne: {
        filter: { mentorId: doc.mentorId, startUtc: doc.startUtc },
        update: { $setOnInsert: doc },
        upsert: true
      }
    }));

    const result = await UnicoachSlot.bulkWrite(bulkOps);

    res.status(201).json({
      success: true,
      message: `Slots generated for ${targetDates.length} date(s) with ${mentor.bufferMinutes || 10}m buffer time.`,
      slotsInserted: result.upsertedCount,
      totalSlots: allDocs.length
    });
  } catch (err) {
    console.error('Error publishing slots:', err);
    res.status(500).json({ error: 'Failed to publish slots.' });
  }
};

/**
 * GET /api/unicoach/mentors/:handle/ledger
 * Real-time balance computed strictly from Double-Entry Ledger
 */
const getMentorLedger = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const entries = await UnicoachLedger.find({ mentorId: mentor._id }).sort({ timestamp: -1 });

    // Compute live balances
    let totalEscrowHeld = 0;
    let totalCreatorWallet = 0;

    for (const e of entries) {
      if (e.account === 'ESCROW') {
        totalEscrowHeld += (e.type === 'CREDIT' ? e.amount : -e.amount);
      } else if (e.account === 'CREATOR_WALLET') {
        totalCreatorWallet += (e.type === 'CREDIT' ? e.amount : -e.amount);
      }
    }

    res.json({
      mentorHandle: mentor.handle,
      financialSummary: {
        creatorWalletAvailableINR: Math.max(0, totalCreatorWallet),
        inEscrowHeldINR: Math.max(0, totalEscrowHeld),
        currency: 'INR'
      },
      auditLog: entries
    });
  } catch (err) {
    console.error('Error fetching ledger:', err);
    res.status(500).json({ error: 'Failed to retrieve ledger.' });
  }
};

/**
 * GET /api/unicoach/mentors/:handle/dashboard
 * Complete dashboard overview: stats, services, bookings, ledger summary
 */
const getDashboardOverview = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    // Services
    const services = await UnicoachService.find({ mentorId: mentor._id }).sort({ createdAt: -1 });

    // Active confirmed & in-progress bookings (includes 1:1 sessions, Priority DMs, SOP reviews)
    const activeBookings = await UnicoachBooking.find({
      mentorId: mentor._id,
      state: { $in: ['CONFIRMED', 'IN_PROGRESS'] }
    })
      .populate('serviceId', 'title durationMinutes priceInINR type description maxDeliveryHours')
      .sort({ createdAt: -1 });

    // Separate into scheduled 1:1 sessions (with valid future or recent startUtc) and async requests (Priority DM, SOP review)
    const now = Date.now();
    const scheduledCalls = activeBookings
      .filter(b => b.startUtc && !isNaN(new Date(b.startUtc).getTime()))
      .sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));

    const pendingRequests = activeBookings
      .filter(b => !b.startUtc || b.serviceId?.type === 'PRIORITY_DM' || b.serviceId?.type === 'SOP_REVIEW' || b.priorityDm?.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Next scheduled call (only upcoming future call or call starting in next hour)
    const nextSession = scheduledCalls.find(b => new Date(b.endUtc || b.startUtc).getTime() >= (now - 30 * 60 * 1000)) || null;

    // Ordered upcoming bookings: future scheduled calls first, then pending async requests
    const upcomingBookings = [
      ...scheduledCalls,
      ...pendingRequests.filter(r => !scheduledCalls.some(s => s._id.toString() === r._id.toString()))
    ];

    const pastBookings = await UnicoachBooking.find({
      mentorId: mentor._id,
      state: { $in: ['COMPLETED', 'CANCELLED', 'REFUNDED'] }
    })
      .populate('serviceId', 'title durationMinutes priceInINR type description maxDeliveryHours')
      .sort({ updatedAt: -1, startUtc: -1 })
      .limit(50);

    // Active slots count
    const totalActiveSlots = await UnicoachSlot.countDocuments({
      mentorId: mentor._id,
      status: 'AVAILABLE',
      startUtc: { $gte: new Date() }
    });

    // Active upcoming slots list for calendar management (up to 500 slots)
    const upcomingSlots = await UnicoachSlot.find({
      mentorId: mentor._id,
      startUtc: { $gte: new Date(Date.now() - 3600 * 1000) }
    }).sort({ startUtc: 1 }).limit(500).lean();

    // Unread notifications count
    const unreadNotificationsCount = await UnicoachNotification.countDocuments({
      isActive: true,
      $or: [
        { targetType: 'ALL' },
        { targetMentorHandle: handle.toLowerCase() }
      ],
      'readBy.mentorHandle': { $ne: handle.toLowerCase() }
    });

    // Earnings: every paid booking with its Razorpay split (fee + GST deducted, 0% UniCoach commission)
    const paidBookings = await UnicoachBooking.find({
      mentorId: mentor._id,
      amountPaid: { $gt: 0 },
      state: { $in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REFUNDED', 'CANCELLED'] }
    })
      .populate('serviceId', 'title type')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const earnings = paidBookings.map((b) => ({
      _id: b._id,
      bookingRef: b.bookingRef,
      serviceTitle: b.serviceId?.title || '',
      serviceType: b.serviceId?.type || '',
      studentName: b.studentName,
      state: b.state,
      paidAt: b.payment?.capturedAt || b.createdAt,
      startUtc: b.startUtc,
      grossINR: b.settlement?.grossINR || b.amountPaid,
      gatewayFeeINR: b.settlement?.gatewayFeeINR || 0,
      gatewayTaxINR: b.settlement?.gatewayTaxINR || 0,
      mentorNetINR: b.settlement?.mentorNetINR || 0,
      settlementStatus: b.settlement?.status || 'PENDING_CAPTURE',
      onHoldUntil: b.settlement?.onHoldUntil || null,
      releasedAt: b.settlement?.releasedAt || null,
      refundStatus: b.refund?.status || ''
    }));

    const earningsSummary = earnings.reduce((acc, e) => {
      if (e.state === 'REFUNDED') {
        acc.refundedINR += e.grossINR;
        return acc;
      }
      acc.grossINR += e.grossINR;
      acc.gatewayFeeINR += e.gatewayFeeINR;
      acc.gatewayTaxINR += e.gatewayTaxINR;
      if (e.settlementStatus === 'RELEASED') acc.releasedToBankINR += e.mentorNetINR;
      else if (e.settlementStatus === 'ON_HOLD') acc.onHoldINR += e.mentorNetINR;
      else if (e.settlementStatus !== 'REVERSED') acc.pendingSetupINR += e.grossINR;
      return acc;
    }, { grossINR: 0, gatewayFeeINR: 0, gatewayTaxINR: 0, releasedToBankINR: 0, onHoldINR: 0, pendingSetupINR: 0, refundedINR: 0 });
    for (const key of Object.keys(earningsSummary)) earningsSummary[key] = Math.round(earningsSummary[key] * 100) / 100;

    const payoutAccount = {
      routeEnabled: await isRouteEnabled(),
      status: mentor.routeAccount?.status || 'NOT_STARTED',
      lastError: mentor.routeAccount?.lastError || '',
      missingDetails: getPayoutKycProblems(mentor),
      bankLast4: (mentor.defaultPayoutDetails?.accountNumber || '').slice(-4),
      ifscCode: mentor.defaultPayoutDetails?.ifscCode || ''
    };

    res.json({
      mentor,
      services,
      earnings,
      earningsSummary,
      payoutAccount,
      upcomingBookings,
      pastBookings,
      nextSession,
      scheduledCalls,
      pendingRequests,
      upcomingSlots,
      stats: {
        totalBookingsCount: activeBookings.length + pastBookings.length,
        upcomingCount: scheduledCalls.length,
        pendingRequestsCount: pendingRequests.length,
        completedCount: pastBookings.filter(b => b.state === 'COMPLETED').length,
        totalGrossRevenueINR: earningsSummary.grossINR,
        // Kept for older dashboard widgets: "available" = released to bank, "escrow" = on hold until session done
        creatorWalletAvailableINR: earningsSummary.releasedToBankINR,
        inEscrowHeldINR: earningsSummary.onHoldINR,
        activeSlotsCount: totalActiveSlots,
        unreadNotificationsCount
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard overview:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
};

/**
 * PUT /api/unicoach/mentors/:handle/services/:serviceId
 */
const updateService = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { serviceId } = req.params;
    const { 
      title, 
      description, 
      durationMinutes, 
      priceInINR, 
      active,
      digitalAsset,
      maxDeliveryHours,
      customQuestions,
      bundleCount
    } = req.body;

    if (priceInINR !== undefined) {
      const price = Number(priceInINR);
      if (priceInINR === null || priceInINR === '' || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: 'priceInINR must be a non-negative number.' });
      }
    }

    const updated = await UnicoachService.findOneAndUpdate(
      { _id: serviceId, mentorId: mentor._id },
      {
        $set: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(durationMinutes && { durationMinutes }),
          ...(priceInINR !== undefined && { priceInINR }),
          ...(active !== undefined && { active }),
          ...(digitalAsset !== undefined && { digitalAsset }),
          ...(maxDeliveryHours !== undefined && { maxDeliveryHours }),
          ...(bundleCount !== undefined && { bundleCount: Number(bundleCount) }),
          ...(customQuestions !== undefined && { customQuestions })
        }
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Service not found.' });

    res.json({ success: true, service: updated });
  } catch (err) {
    console.error('Error updating service:', err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update service.' });
  }
};

/**
 * DELETE /api/unicoach/mentors/:handle/services/:serviceId
 */
const deleteService = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { serviceId } = req.params;
    await UnicoachService.findOneAndDelete({ _id: serviceId, mentorId: mentor._id });

    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
};

/**
 * PATCH /api/unicoach/mentors/:handle/bookings/:bookingId/status
 * COMPLETED -> lift the hold so Razorpay settles the mentor's share to their bank
 * CANCELLED -> full refund to the student (mentor's held transfer is reversed)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { bookingId } = req.params;
    const { status, reason } = req.body; // 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'

    const MENTOR_ALLOWED_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!MENTOR_ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${MENTOR_ALLOWED_STATUSES.join(', ')}.` });
    }

    const booking = await UnicoachBooking.findOne({ _id: bookingId, mentorId: mentor._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const { assertTransition } = require('../services/fsmService');
    assertTransition(booking.state, status);

    // A 1:1 session can only be marked complete once it has actually started
    if (status === 'COMPLETED' && booking.state !== 'COMPLETED' && booking.startUtc
        && Date.now() < new Date(booking.startUtc).getTime()) {
      return res.status(400).json({ error: 'This session has not started yet. You can mark it completed once the session has begun.' });
    }

    if (status === 'CANCELLED' && booking.amountPaid > 0 && booking.payment?.paymentId) {
      const refund = await refundBooking(booking._id, reason || `Cancelled by mentor @${mentor.handle}`);
      if (!refund.ok) {
        return res.status(409).json({ error: `Could not refund the student: ${refund.reason}` });
      }
      await UnicoachBooking.updateOne(
        { _id: booking._id },
        { $set: { state: 'REFUNDED', cancellationReason: reason || 'Cancelled by mentor. Full refund issued.' } }
      );
      if (booking.slotId) {
        await UnicoachSlot.updateOne({ _id: booking.slotId, bookingId: booking._id }, { $set: { status: 'AVAILABLE', bookingId: null } });
      }
      const updated = await UnicoachBooking.findById(booking._id);
      return res.json({ success: true, message: 'Booking cancelled and the student has been refunded in full.', booking: updated });
    }

    booking.state = status;
    if (status === 'CANCELLED') booking.cancellationReason = reason || 'Cancelled by mentor.';
    await booking.save();

    let payoutMessage = '';
    if (status === 'COMPLETED') {
      const release = await releaseMentorTransfer(booking._id);
      if (release.ok) payoutMessage = ' Your payout has been released to your bank account.';
    }

    const updated = await UnicoachBooking.findById(booking._id);
    res.json({ success: true, message: `Booking status updated to ${status}.${payoutMessage}`, booking: updated });
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to update booking status.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/bookings/:bookingId/send-invite-email
 * Dispatches a branded meeting email with Google Meet / Zoom link directly to student
 */
const sendBookingInviteEmail = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { bookingId } = req.params;
    const booking = await UnicoachBooking.findOne({ _id: bookingId, mentorId: mentor._id })
      .populate('serviceId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (!booking.studentEmail) {
      return res.status(400).json({ error: 'Student email is not available for this booking.' });
    }

    const { sendBookingConfirmationEmail } = require('../services/notificationService');
    const result = await sendBookingConfirmationEmail(booking, mentor, booking.serviceId);

    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to dispatch email.' });
    }

    return res.json({
      success: true,
      message: result.delivered
        ? `Invite email dispatched to ${booking.studentEmail}!`
        : `Meeting invite generated for ${booking.studentEmail}!`,
      delivered: result.delivered,
      warning: result.warning,
      sentTo: booking.studentEmail
    });
  } catch (err) {
    console.error('Error dispatching booking invite email:', err);
    return res.status(500).json({ error: err.message || 'Failed to send invite email.' });
  }
};

/**
 * PATCH /api/unicoach/mentors/:handle/bookings/:bookingId/meeting-link
 * Allows mentor to customize or paste their own Zoom / Google Meet URL
 */
const updateMeetingLink = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { bookingId } = req.params;
    const { joinUrl, platform } = req.body;

    if (!joinUrl || typeof joinUrl !== 'string' || !joinUrl.trim()) {
      return res.status(400).json({ error: 'A valid meeting link URL is required.' });
    }

    const trimmedUrl = joinUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Meeting URL must start with http:// or https://' });
    }

    const booking = await UnicoachBooking.findOne({ _id: bookingId, mentorId: mentor._id });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    let detectedPlatform = platform;
    if (!detectedPlatform) {
      if (trimmedUrl.includes('zoom.us')) detectedPlatform = 'ZOOM';
      else if (trimmedUrl.includes('meet.google.com')) detectedPlatform = 'GOOGLE_MEET';
      else detectedPlatform = 'CUSTOM';
    }

    booking.meeting = {
      platform: detectedPlatform,
      joinUrl: trimmedUrl,
      meetingId: booking.meeting?.meetingId || ''
    };

    await booking.save();

    return res.json({
      success: true,
      message: 'Meeting link updated successfully.',
      meeting: booking.meeting
    });
  } catch (err) {
    console.error('Error updating meeting link:', err);
    return res.status(500).json({ error: err.message || 'Failed to update meeting link.' });
  }
};

/**
 * DELETE /api/unicoach/mentors/:handle/slots/:slotId
 */
const deleteSlot = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { slotId } = req.params;
    const deleted = await UnicoachSlot.findOneAndDelete({
      _id: slotId,
      mentorId: mentor._id,
      status: { $in: ['AVAILABLE', 'BLOCKED'] } // Allow deleting unbooked or paused slots
    });

    if (!deleted) {
      return res.status(400).json({ error: 'Slot not found or cannot be deleted because it is already booked/held.' });
    }

    res.json({ success: true, message: 'Slot removed from calendar.' });
  } catch (err) {
    console.error('Error deleting slot:', err);
    res.status(500).json({ error: 'Failed to delete slot.' });
  }
};

/**
 * DELETE /api/unicoach/mentors/:handle/slots-by-date
 * Delete unbooked slots for a specific date or clear all upcoming unbooked slots
 */
const deleteSlotsByDate = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { dateStr, clearAll } = req.body || req.query;

    let filter = {
      mentorId: mentor._id,
      status: { $in: ['AVAILABLE', 'BLOCKED'] }
    };

    if (clearAll === true || clearAll === 'true') {
      filter.startUtc = { $gte: new Date(Date.now() - 3600 * 1000) };
    } else if (dateStr) {
      const dayStart = new Date(`${dateStr}T00:00:00.000`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999`);
      filter.startUtc = { $gte: dayStart, $lte: dayEnd };
    } else {
      return res.status(400).json({ error: 'Please provide dateStr (YYYY-MM-DD) or clearAll: true' });
    }

    const result = await UnicoachSlot.deleteMany(filter);

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: clearAll 
        ? `Cleared ${result.deletedCount} unbooked slot(s) across all upcoming dates.`
        : `Cleared ${result.deletedCount} unbooked slot(s) for ${dateStr}.`
    });
  } catch (err) {
    console.error('Error deleting slots by date:', err);
    res.status(500).json({ error: 'Failed to delete slots.' });
  }
};

/**
 * PATCH /api/unicoach/mentors/:handle/slots/:slotId/toggle
 * Toggle slot status between AVAILABLE and BLOCKED (Pause / Resume)
 */
const toggleSlotStatus = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { slotId } = req.params;
    const slot = await UnicoachSlot.findOne({ _id: slotId, mentorId: mentor._id });
    if (!slot) return res.status(404).json({ error: 'Slot not found.' });

    if (slot.status === 'BOOKED') {
      return res.status(400).json({ error: 'Cannot pause or modify a slot that has already been booked by a student.' });
    }
    if (slot.status === 'HELD') {
      return res.status(400).json({ error: 'This slot is currently being checked out by a student. Please wait.' });
    }

    const newStatus = slot.status === 'AVAILABLE' ? 'BLOCKED' : 'AVAILABLE';
    slot.status = newStatus;
    await slot.save();

    res.json({
      success: true,
      slot,
      newStatus,
      message: newStatus === 'BLOCKED' 
        ? 'Slot paused! It is now hidden from students.' 
        : 'Slot unpaused! It is now live for bookings.'
    });
  } catch (err) {
    console.error('Error toggling slot status:', err);
    res.status(500).json({ error: 'Failed to update slot status.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/single-slot
 * Manually add one specific slot for any date and time
 */
const createSingleSlot = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { dateStr, timeStr, durationMinutes = 30, ianaTimezone, serviceId } = req.body;
    if (!dateStr || !timeStr) {
      return res.status(400).json({ error: 'dateStr (YYYY-MM-DD) and timeStr (HH:MM) are required.' });
    }

    const effectiveTimezone = ianaTimezone || mentor.ianaTimezone || 'Asia/Kolkata';

    // If a new timezone is provided by mentor, update profile
    if (effectiveTimezone && effectiveTimezone !== mentor.ianaTimezone) {
      mentor.ianaTimezone = effectiveTimezone;
      await mentor.save();
    }

    let targetServiceId = null;
    let targetServiceTitle = 'All 1:1 Services';
    if (serviceId && serviceId !== 'ALL') {
      const srv = await UnicoachService.findOne({ _id: serviceId, mentorId: mentor._id });
      if (srv) {
        targetServiceId = srv._id;
        targetServiceTitle = srv.title;
      }
    }

    const startUtc = getZonedDateToUtc(dateStr, timeStr, effectiveTimezone);
    if (isNaN(startUtc.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time format.' });
    }

    const duration = Number(durationMinutes) || 30;
    const endUtc = new Date(startUtc.getTime() + duration * 60 * 1000);

    const existing = await UnicoachSlot.findOne({ mentorId: mentor._id, startUtc });
    if (existing) {
      return res.status(400).json({ error: 'A slot at this exact date & time already exists.' });
    }

    const slot = await UnicoachSlot.create({
      mentorId: mentor._id,
      startUtc,
      endUtc,
      status: 'AVAILABLE',
      serviceId: targetServiceId,
      serviceTitle: targetServiceTitle
    });

    res.status(201).json({
      success: true,
      slot,
      message: targetServiceId 
        ? `New slot reserved specifically for "${targetServiceTitle}"!` 
        : 'New slot added for all 1:1 services!'
    });
  } catch (err) {
    console.error('Error creating single slot:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A slot at this exact time already exists.' });
    }
    res.status(500).json({ error: 'Failed to add slot.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/copy-slots
 * Copy unbooked slots from sourceDate to targetDate
 */
const copySlots = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { sourceDateStr, targetDateStr } = req.body;
    if (!sourceDateStr || !targetDateStr) {
      return res.status(400).json({ error: 'Both sourceDateStr and targetDateStr are required.' });
    }

    const sourceStart = new Date(`${sourceDateStr}T00:00:00.000`);
    const sourceEnd = new Date(`${sourceDateStr}T23:59:59.999`);

    const sourceSlots = await UnicoachSlot.find({
      mentorId: mentor._id,
      startUtc: { $gte: sourceStart, $lte: sourceEnd }
    }).sort({ startUtc: 1 }).lean();

    if (sourceSlots.length === 0) {
      return res.status(400).json({ error: `No slots found on ${sourceDateStr} to copy.` });
    }

    const pad = (n) => String(n).padStart(2, '0');
    const bulkOps = sourceSlots.map(s => {
      const sStart = new Date(s.startUtc);
      const sEnd = new Date(s.endUtc);
      const durationMs = sEnd.getTime() - sStart.getTime();

      const timeStr = `${pad(sStart.getHours())}:${pad(sStart.getMinutes())}:${pad(sStart.getSeconds())}`;
      const targetStartUtc = new Date(`${targetDateStr}T${timeStr}`);
      const targetEndUtc = new Date(targetStartUtc.getTime() + durationMs);

      return {
        updateOne: {
          filter: { mentorId: mentor._id, startUtc: targetStartUtc },
          update: {
            $setOnInsert: {
              mentorId: mentor._id,
              startUtc: targetStartUtc,
              endUtc: targetEndUtc,
              status: 'AVAILABLE'
            }
          },
          upsert: true
        }
      };
    });

    const result = await UnicoachSlot.bulkWrite(bulkOps);

    res.json({
      success: true,
      copiedCount: result.upsertedCount,
      totalSourceSlots: sourceSlots.length,
      message: `Successfully copied schedule to ${targetDateStr}! (${result.upsertedCount} new slots created)`
    });
  } catch (err) {
    console.error('Error copying slots:', err);
    res.status(500).json({ error: 'Failed to copy slots to date.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/upload-resource
 * Zero-cost local file upload for digital guides/templates
 */
const uploadResourceFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a file to upload.' });
    }

    const path = require('path');
    const ext = path.extname(req.file.originalname).toUpperCase().replace('.', '');
    const sizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);

    const fileUrl = `/uploads/unicoach/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully!',
      digitalAsset: {
        fileUrl,
        fileName: req.file.originalname,
        fileType: ext || 'FILE',
        fileSize: `${sizeInMB} MB`
      }
    });
  } catch (err) {
    console.error('Error uploading resource file:', err);
    res.status(500).json({ error: 'Failed to upload resource file.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/upload-photo
 * Upload avatar or banner cover image for creator storefront
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image to upload.' });
    }

    const type = req.body.type || 'avatar'; // 'avatar' or 'cover' / 'banner'
    const fileUrl = `/uploads/unicoach/${req.file.filename}`;

    const handle = req.validatedHandle || req.params.handle;
    const mentor = req.mentor || await UnicoachMentor.findOne({ handle });

    if (mentor) {
      if (type === 'cover' || type === 'banner') {
        mentor.coverImageUrl = fileUrl;
      } else {
        mentor.avatarUrl = fileUrl;
      }
      await mentor.save();
    }

    res.status(200).json({
      success: true,
      message: `${type === 'cover' || type === 'banner' ? 'Banner' : 'Profile photo'} uploaded successfully!`,
      url: fileUrl,
      type
    });
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    res.status(500).json({ error: 'Failed to upload photo.' });
  }
};

/**
 * GET /api/unicoach/mentors/:handle/priority-dms
 * Creator Studio inbox for student priority questions with SLA timers
 */
const getPriorityDMs = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const dms = await UnicoachBooking.find({
      mentorId: mentor._id,
      'priorityDm.status': { $in: ['PENDING', 'ANSWERED', 'EXPIRED'] }
    })
      .populate('serviceId', 'title priceInINR maxDeliveryHours')
      .sort({ 'priorityDm.deliveryDueUtc': 1, createdAt: -1 });

    const now = Date.now();
    const formatted = dms.map(item => {
      const dueTime = item.priorityDm?.deliveryDueUtc ? new Date(item.priorityDm.deliveryDueUtc).getTime() : now;
      const msRemaining = Math.max(0, dueTime - now);
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        _id: item._id,
        bookingRef: item.bookingRef,
        studentName: item.studentName,
        studentEmail: item.studentEmail,
        studentPhone: item.studentPhone,
        serviceTitle: item.serviceId?.title || 'Priority Consultation',
        priceInINR: item.amountPaid,
        mentorEarning: item.mentorEarning,
        questionText: item.priorityDm?.questionText || '',
        contextText: item.priorityDm?.contextText || '',
        referenceUrl: item.priorityDm?.referenceUrl || '',
        status: item.priorityDm?.status || 'PENDING',
        deliveryDueUtc: item.priorityDm?.deliveryDueUtc,
        answeredAt: item.priorityDm?.answeredAt,
        answerText: item.priorityDm?.answerText || '',
        attachmentUrl: item.priorityDm?.attachmentUrl || '',
        createdAt: item.createdAt,
        isExpired: msRemaining === 0 && item.priorityDm?.status === 'PENDING',
        slaRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          formatted: `${hoursRemaining}h ${minutesRemaining}m`
        }
      };
    });

    const pending = formatted.filter(d => d.status === 'PENDING');
    const answered = formatted.filter(d => d.status === 'ANSWERED');

    res.json({
      total: formatted.length,
      pendingCount: pending.length,
      answeredCount: answered.length,
      pending,
      answered
    });
  } catch (err) {
    console.error('Error fetching priority DMs:', err);
    res.status(500).json({ error: 'Failed to retrieve Priority DMs.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/priority-dms/:bookingId/answer
 * Mentor answers the student's question, sets status to ANSWERED, marks booking COMPLETED, releases escrow
 */
const answerPriorityDM = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const { bookingId } = req.params;
    const { answerText, attachmentUrl } = req.body;

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ error: 'Answer text cannot be blank.' });
    }

    const booking = await UnicoachBooking.findOne({ _id: bookingId, mentorId: mentor._id }).populate('serviceId', 'type');
    if (!booking) return res.status(404).json({ error: 'Booking / Query not found.' });

    if (!['CONFIRMED', 'IN_PROGRESS'].includes(booking.state)) {
      return res.status(400).json({ error: `Cannot answer a booking in '${booking.state}' state. Only paid, active queries can be answered.` });
    }
    if (!['PRIORITY_DM', 'SOP_REVIEW'].includes(booking.serviceId?.type)) {
      return res.status(400).json({ error: 'Only Priority DM or SOP Review bookings can be answered here.' });
    }

    if (booking.priorityDm?.status === 'ANSWERED') {
      return res.status(400).json({ error: 'This question has already been answered.' });
    }

    // Update Priority DM payload
    booking.priorityDm.answerText = answerText.trim();
    booking.priorityDm.attachmentUrl = attachmentUrl?.trim() || '';
    booking.priorityDm.answeredAt = new Date();
    booking.priorityDm.status = 'ANSWERED';
    booking.state = 'COMPLETED';

    await booking.save();

    // Answer delivered: lift the hold on the mentor's Route transfer
    await releaseMentorTransfer(booking._id);

    res.json({
      success: true,
      message: 'Your answer has been sent to the student and your payout has been released to your bank account!',
      priorityDm: booking.priorityDm
    });
  } catch (err) {
    console.error('Error answering priority DM:', err);
    res.status(500).json({ error: err.message || 'Failed to submit answer.' });
  }
};

/**
 * POST /api/unicoach/mentors/:handle/payouts/request
 * Manual withdrawals are retired: every paid booking is transferred automatically to the
 * mentor's bank via Razorpay Route (Razorpay fee + GST deducted, 0% UniCoach commission).
 */
const requestPayout = async (req, res) => {
  res.status(410).json({
    error: 'Manual withdrawals are no longer needed. Your earnings are sent to your bank account automatically after each session (Razorpay fee + GST deducted, 0% UniCoach commission).',
    code: 'AUTO_PAYOUTS_ENABLED'
  });
};

/**
 * GET /api/unicoach/mentors/:handle/payouts
 * Get mentor's payout history and saved payout details
 */
const getPayouts = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const payouts = await UnicoachPayout.find({ mentorId: mentor._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      payouts,
      defaultPayoutDetails: mentor.defaultPayoutDetails || {}
    });
  } catch (err) {
    console.error('Error fetching payouts:', err);
    res.status(500).json({ error: 'Failed to fetch payouts.' });
  }
};

/**
 * PUT /api/unicoach/mentors/:handle/payout-details
 * Bank account + PAN + address used for the mentor's Razorpay Route payout account
 */
const updatePayoutDetails = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle;
    const mentor = await UnicoachMentor.findOne({ handle });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    const {
      accountHolderName, accountNumber, ifscCode, bankName,
      pan, addressLine1, addressLine2, city, state, postalCode, phone
    } = req.body;

    const cleanAccount = (accountNumber || '').replace(/\s/g, '');
    const cleanIfsc = (ifscCode || '').trim().toUpperCase();
    const cleanPan = (pan || '').trim().toUpperCase();

    if (!accountHolderName || !accountHolderName.trim()) {
      return res.status(400).json({ error: 'Bank Account Holder Name is required.' });
    }
    if (!ACCOUNT_NUMBER_PATTERN.test(cleanAccount)) {
      return res.status(400).json({ error: 'Bank Account Number must be 9 to 18 digits.' });
    }
    if (!IFSC_PATTERN.test(cleanIfsc)) {
      return res.status(400).json({ error: 'Invalid IFSC Code format. Example: HDFC0001234 or SBIN0004567.' });
    }
    if (!PAN_PATTERN.test(cleanPan)) {
      return res.status(400).json({ error: 'Invalid PAN format. Example: ABCDE1234F.' });
    }
    if (!addressLine1 || !addressLine1.trim() || !city || !city.trim() || !state || !state.trim()) {
      return res.status(400).json({ error: 'Address, city and state are required.' });
    }
    if (!PINCODE_PATTERN.test((postalCode || '').trim())) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit PIN code.' });
    }

    const bankChanged = mentor.defaultPayoutDetails?.accountNumber !== cleanAccount
      || mentor.defaultPayoutDetails?.ifscCode !== cleanIfsc
      || mentor.defaultPayoutDetails?.accountHolderName !== accountHolderName.trim();

    mentor.defaultPayoutDetails = {
      payoutMethod: 'BANK_TRANSFER',
      upiId: mentor.defaultPayoutDetails?.upiId || '',
      accountHolderName: accountHolderName.trim(),
      accountNumber: cleanAccount,
      ifscCode: cleanIfsc,
      bankName: (bankName || '').trim()
    };
    mentor.kyc = {
      pan: cleanPan,
      address: {
        street1: addressLine1.trim(),
        street2: (addressLine2 || '').trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim()
      }
    };
    if (phone && phone.replace(/\D/g, '').length >= 10) mentor.phone = phone.trim();

    await mentor.save();

    // Approved mentors: create the payout account, or push the new bank details to it
    let routeMessage = '';
    if (mentor.applicationStatus === 'APPROVED' && (bankChanged || !mentor.routeAccount?.accountId)) {
      const sync = await syncSettlementBank(mentor);
      if (sync.ok) routeMessage = ' Your payout account has been updated.';
      else if (!sync.skipped) routeMessage = ` Payout account update pending: ${sync.reason}`;
    }

    res.json({
      success: true,
      message: `Bank payout details successfully saved!${routeMessage}`,
      defaultPayoutDetails: mentor.defaultPayoutDetails,
      kyc: mentor.kyc,
      routeAccount: { status: mentor.routeAccount?.status || 'NOT_STARTED', lastError: mentor.routeAccount?.lastError || '' }
    });
  } catch (err) {
    console.error('Error updating payout details:', err);
    res.status(500).json({ error: 'Failed to update payout details.' });
  }
};

/**
 * GET /api/unicoach/mentors/me
 * Resolve the authenticated user's linked creator profile
 */
const getMyProfile = async (req, res) => {
  try {
    const user = req.currentUser;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Please log in to UniCoach.' });
    }

    // 1. Search by explicit userId link
    let mentor = await UnicoachMentor.findOne({ userId: user._id });

    // 2. Fallback: auto-link an UNOWNED legacy profile by exact email match only
    //    (never re-link a profile owned by another user; phone matches grant nothing)
    if (!mentor && user.email) {
      mentor = await UnicoachMentor.findOne({
        email: user.email.toLowerCase().trim(),
        $or: [{ userId: null }, { userId: { $exists: false } }]
      });
      if (mentor) {
        mentor.userId = user._id;
        await mentor.save();
      }
    }

    if (!mentor) {
      return res.json({
        success: true,
        hasProfile: false,
        user: { name: user.name, email: user.email, phone: user.phone }
      });
    }

    return res.json({
      success: true,
      hasProfile: true,
      mentor
    });
  } catch (err) {
    console.error('Error fetching my creator profile:', err);
    res.status(500).json({ error: 'Failed to retrieve creator profile.' });
  }
};

/**
 * GET /api/unicoach/mentors/:handle/notifications
 * Get all notifications relevant to this mentor
 */
const getMentorNotifications = async (req, res) => {
  try {
    const handle = (req.validatedHandle || req.params.handle || '').toLowerCase();
    
    // Find notifications that are broadcast to ALL or targeted specifically to this mentor handle
    const notifications = await UnicoachNotification.find({
      isActive: true,
      $or: [
        { targetType: 'ALL' },
        { targetMentorHandle: handle }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    const formatted = notifications.map(n => {
      const isRead = Array.isArray(n.readBy) && n.readBy.some(r => r.mentorHandle === handle);
      return {
        _id: n._id,
        title: n.title,
        message: n.message,
        category: n.category,
        priority: n.priority,
        targetType: n.targetType,
        actionLink: n.actionLink,
        actionText: n.actionText,
        senderAdmin: n.senderAdmin,
        createdAt: n.createdAt,
        isRead
      };
    });

    const unreadCount = formatted.filter(n => !n.isRead).length;

    res.json({
      success: true,
      notifications: formatted,
      unreadCount
    });
  } catch (err) {
    console.error('Error fetching mentor notifications:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

/**
 * PATCH /api/unicoach/mentors/:handle/notifications/:notificationId/read
 * Mark single notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    const handle = (req.validatedHandle || req.params.handle || '').toLowerCase();
    const { notificationId } = req.params;

    const notification = await UnicoachNotification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const alreadyRead = Array.isArray(notification.readBy) && notification.readBy.some(r => r.mentorHandle === handle);
    if (!alreadyRead) {
      notification.readBy.push({
        mentorHandle: handle,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification status.' });
  }
};

/**
 * PATCH /api/unicoach/mentors/:handle/notifications/read-all
 * Mark all notifications as read for this mentor
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const handle = (req.validatedHandle || req.params.handle || '').toLowerCase();

    await UnicoachNotification.updateMany(
      {
        isActive: true,
        $or: [
          { targetType: 'ALL' },
          { targetMentorHandle: handle }
        ],
        'readBy.mentorHandle': { $ne: handle }
      },
      {
        $push: {
          readBy: {
            mentorHandle: handle,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
};

module.exports = {
  getMyProfile,
  createOrUpdateMentor,
  createService,
  publishSlots,
  getMentorLedger,
  getDashboardOverview,
  updateService,
  deleteService,
  updateBookingStatus,
  sendBookingInviteEmail,
  updateMeetingLink,
  deleteSlot,
  deleteSlotsByDate,
  toggleSlotStatus,
  createSingleSlot,
  copySlots,
  uploadResourceFile,
  uploadProfilePhoto,
  getPriorityDMs,
  answerPriorityDM,
  requestPayout,
  getPayouts,
  updatePayoutDetails,
  getMentorNotifications,
  markNotificationRead,
  markAllNotificationsRead
};


