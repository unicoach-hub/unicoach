const crypto = require('crypto');
const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachService = require('../models/UnicoachService');
const UnicoachSlot = require('../models/UnicoachSlot');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachCoupon = require('../models/UnicoachCoupon');
const UnicoachReview = require('../models/UnicoachReview');
const User = require('../../models/User');
const { acquireSlotLock, releaseSlotLock, checkSlotLock } = require('../services/lockService');
const { assertTransition } = require('../services/fsmService');
const { refreshMentorStats } = require('../services/mentorStatsService');
const { storeUpload, getAccessUrl } = require('../services/fileStorageService');
const { satisfiesNoticePeriod, getZonedDateToUtc } = require('../services/timezoneService');
const { createRazorpayOrder } = require('../services/paymentService');
const {
  PAN_PATTERN, IFSC_PATTERN, ACCOUNT_NUMBER_PATTERN, PINCODE_PATTERN
} = require('../services/routeService');
const {
  finalizeBookingPayment,
  serializeSessionBooking,
  serializeDirectResult
} = require('../services/bookingPaymentService');

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Atomically claim one use of a mentor's coupon (active, not expired, under maxUses).
 * Returns the coupon doc, or null if the coupon is invalid / exhausted.
 */
const claimCoupon = async (mentorId, couponCode) => {
  if (!couponCode || typeof couponCode !== 'string') return null;
  const cleanCode = couponCode.toUpperCase().trim();
  if (!cleanCode) return null;
  return UnicoachCoupon.findOneAndUpdate(
    {
      mentorId,
      code: cleanCode,
      active: true,
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gte: new Date() } }] },
        { $or: [{ maxUses: 0 }, { maxUses: null }, { $expr: { $lt: [{ $ifNull: ['$usedCount', 0] }, '$maxUses'] } }] }
      ]
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
};

/**
 * Give back a coupon use claimed by a booking that never got paid
 */
const releaseCoupon = async (mentorId, couponCode) => {
  if (!mentorId || !couponCode) return;
  await UnicoachCoupon.updateOne(
    { mentorId, code: couponCode, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  ).catch((e) => console.warn('Coupon release warning:', e.message));
};

const computeDiscount = (coupon, price) => {
  if (!coupon) return 0;
  return coupon.discountType === 'PERCENTAGE'
    ? Math.round((price * coupon.discountValue) / 100)
    : Math.min(price, coupon.discountValue);
};

// Private fields that must never leave the server on public endpoints
const PRIVATE_MENTOR_FIELDS = '-__v -createdAt -updatedAt -defaultPayoutDetails -kyc -routeAccount -adminNotes -verificationDocUrl -phone -email -userId -rejectionReason';

/**
 * GET /api/unicoach/@:handle
 * Fetch public mentor profile & active services with reviews and rating
 */

const getPublicProfile = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.toLowerCase().replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle, active: true })
      .select(PRIVATE_MENTOR_FIELDS);

    if (!mentor) {
      return res.status(404).json({ error: `Mentor @${handle} not found or profile is inactive.` });
    }

    const services = await UnicoachService.find({ mentorId: mentor._id, active: true })
      .select('type title description durationMinutes priceInINR currency maxDeliveryHours customQuestions');

    // Fetch verified reviews & star rating
    const recentReviews = await UnicoachReview.find({ mentorId: mentor._id }).sort({ createdAt: -1 }).limit(10);
    const totalReviews = await UnicoachReview.countDocuments({ mentorId: mentor._id });
    const allRatings = await UnicoachReview.find({ mentorId: mentor._id }).select('rating');
    const averageRating = totalReviews > 0
      ? (allRatings.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : 5.0;

    const isApproved = mentor.applicationStatus === 'APPROVED' && Boolean(mentor.isVerified);

    res.json({
      mentor,
      isApproved,
      isPendingApproval: !isApproved,
      applicationStatus: mentor.applicationStatus,
      services,
      ratingStats: {
        averageRating: Number(averageRating),
        totalReviews
      },
      recentReviews
    });
  } catch (err) {
    console.error('Error fetching mentor profile:', err);
    res.status(500).json({ error: 'Failed to fetch mentor profile.' });
  }
};



//


/**
 * GET /api/unicoach/@:handle/slots
 * Get available UTC slots for a mentor (respecting buffer, notice period, and active holds)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.toLowerCase().replace(/^@/, '');
    const mentor = await UnicoachMentor.findOne({ handle, active: true });
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found.' });
    }

    const { fromDate, toDate, serviceId } = req.query;
    const query = {
      mentorId: mentor._id,
      status: { $in: ['AVAILABLE', 'HELD'] },
      startUtc: { $gte: new Date(Date.now() + (mentor.noticePeriodHours * 3600 * 1000)) } // Filter notice period
    };

    if (fromDate) query.startUtc.$gte = new Date(Math.max(new Date(fromDate).getTime(), query.startUtc.$gte.getTime()));
    if (toDate) query.startUtc.$lte = new Date(toDate);

    // If student is booking a specific service, only return slots for that service OR open for all services
    if (serviceId && serviceId !== 'ALL') {
      query.$or = [
        { serviceId: null },
        { serviceId: { $exists: false } },
        { serviceId: serviceId }
      ];
    }

    const rawSlots = await UnicoachSlot.find(query).sort({ startUtc: 1 }).lean();

    // Check Redis for active 10-min locks
    const now = Date.now();
    const availableSlots = [];

    for (const slot of rawSlots) {
      const lockOwner = await checkSlotLock(slot._id.toString());
      const isHoldExpired = slot.heldUntil && new Date(slot.heldUntil).getTime() <= now;

      if (!lockOwner && (slot.status === 'AVAILABLE' || isHoldExpired)) {
        availableSlots.push({
          id: slot._id,
          startUtc: slot.startUtc,
          endUtc: slot.endUtc,
          durationMinutes: Math.round((new Date(slot.endUtc) - new Date(slot.startUtc)) / 60000),
          serviceId: slot.serviceId || null,
          serviceTitle: slot.serviceTitle || 'All 1:1 Services'
        });
      }
    }

    res.json({
      mentorHandle: mentor.handle,
      mentorTimezone: mentor.ianaTimezone || 'Europe/Dublin',
      totalAvailable: availableSlots.length,
      slots: availableSlots
    });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Failed to retrieve available slots.' });
  }
};

/**
 * POST /api/unicoach/@:handle/reserve-slot
 * Phase 1 of 2-Phase Booking (Pillar #1 & #5)
 * Places atomic Redis lock & sets status to HELD for 10 minutes
 */
const reserveSlot = async (req, res) => {
  let claimedCoupon = null;
  let bookingSaved = false;
  try {
    const handle = req.validatedHandle || req.params.handle.toLowerCase().replace(/^@/, '');
    const {
      slotId,
      serviceId,
      studentName,
      studentEmail,
      studentPhone,
      studentNotes,
      customAnswers,
      couponCode
    } = req.body;

    if (!slotId || !serviceId || !studentName || !studentEmail || !studentPhone) {
      return res.status(400).json({
        error: 'Missing required fields: slotId, serviceId, studentName, studentEmail, and studentPhone are required.'
      });
    }

    const mentor = await UnicoachMentor.findOne({ handle, active: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    if (mentor.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'This mentor profile is currently pending verification from UniCoach Admin and cannot accept bookings yet.',
        code: 'MENTOR_NOT_APPROVED'
      });
    }

    const service = await UnicoachService.findOne({ _id: serviceId, mentorId: mentor._id, active: true });
    if (!service) return res.status(404).json({ error: 'Selected service is not offered by this mentor.' });

    const slot = await UnicoachSlot.findOne({ _id: slotId, mentorId: mentor._id });
    if (!slot) return res.status(404).json({ error: 'Slot not found.' });

    // A slot published for a specific service can only be booked under that service
    if (slot.serviceId && slot.serviceId.toString() !== service._id.toString()) {
      return res.status(400).json({ error: 'This slot is not available for the selected service.' });
    }

    // Validate notice period
    if (!satisfiesNoticePeriod(slot.startUtc, mentor.noticePeriodHours)) {
      return res.status(400).json({
        error: `This slot cannot be booked because it violates the mentor's ${mentor.noticePeriodHours}-hour minimum notice period.`
      });
    }

    // Step 1: Distributed Lock Attempt (Pillar #1)
    const reservationToken = `resv_${crypto.randomUUID()}`;
    const lockAcquired = await acquireSlotLock(slot._id.toString(), reservationToken, 600); // 10 minutes

    if (!lockAcquired) {
      return res.status(409).json({
        status: 'UNAVAILABLE',
        error: 'Yeh slot abhi kisi dusre student ne select kar rakha hai. Please dusra time choose karein.'
      });
    }

    // Step 2: Database Atomic Update to HELD
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    const updatedSlot = await UnicoachSlot.findOneAndUpdate(
      {
        _id: slot._id,
        $or: [
          { status: 'AVAILABLE' },
          { status: 'HELD', heldUntil: { $lte: new Date() } }
        ]
      },
      {
        $set: {
          status: 'HELD',
          heldBy: reservationToken,
          heldUntil: tenMinutesFromNow
        }
      },
      { new: true }
    );

    if (!updatedSlot) {
      // Release lock if DB update fell through
      await releaseSlotLock(slot._id.toString(), reservationToken);
      return res.status(409).json({
        status: 'UNAVAILABLE',
        error: 'Yeh slot abhi kisi dusre student ne select kar rakha hai. Please dusra time choose karein.'
      });
    }

    // Coupon Validation & Discount Computation
    let finalAmount = service.priceInINR;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Atomic claim: enforces maxUses even under concurrent checkouts (released if the booking is cancelled)
    const coupon = couponCode ? await claimCoupon(mentor._id, couponCode) : null;
    if (coupon) {
      claimedCoupon = coupon;
      discountAmount = computeDiscount(coupon, service.priceInINR);
      finalAmount = Math.max(0, service.priceInINR - discountAmount);
      appliedCoupon = coupon;
    }

    // Step 3: Create draft booking in PAYMENT_PENDING state (Pillar #5)
    const bookingRef = `UM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const idempotencyKey = req.headers['idempotency-key'] || `resv_idemp_${crypto.randomUUID()}`;

    const commissionPercent = 0.00; // 0% platform fee - UniCoach currently takes 0 charges (100% goes to mentor)
    const platformCommission = Math.round(finalAmount * commissionPercent);
    const mentorEarning = finalAmount - platformCommission;

    const booking = new UnicoachBooking({
      bookingRef,
      mentorId: mentor._id,
      serviceId: service._id,
      slotId: slot._id,
      studentName,
      studentEmail,
      studentPhone,
      studentNotes: studentNotes || '',
      customAnswers: Array.isArray(customAnswers) ? customAnswers : [],
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      originalAmount: service.priceInINR,
      discountAmount,
      amountPaid: finalAmount,
      platformCommission,
      mentorEarning,
      startUtc: slot.startUtc,
      endUtc: slot.endUtc,
      state: 'PAYMENT_PENDING',
      idempotencyKey,
      currency: service.currency || 'INR'
    });

    await booking.save();
    bookingSaved = true;

    // Link booking to slot
    updatedSlot.bookingId = booking._id;
    await updatedSlot.save();

    res.status(200).json({
      status: 'RESERVED',
      message: 'Slot locked for 10 minutes. Complete payment to confirm.',
      bookingRef: booking.bookingRef,
      reservationToken,
      expiresAt: tenMinutesFromNow.toISOString(),
      expiresInSeconds: 600,
      checkoutSummary: {
        serviceTitle: service.title,
        originalPrice: service.priceInINR,
        discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        finalAmount,
        priceInINR: finalAmount,
        startUtc: slot.startUtc,
        mentorName: mentor.name
      }
    });
  } catch (err) {
    if (claimedCoupon && !bookingSaved) await releaseCoupon(claimedCoupon.mentorId, claimedCoupon.code);
    console.error('Error reserving slot:', err);
    res.status(500).json({ error: 'Server error while attempting to reserve slot.' });
  }
};

/**
 * POST /api/unicoach/@:handle/confirm-booking
 * Confirms FREE bookings only. Paid bookings must go through create-payment-order + verify-payment.
 */
const confirmBooking = async (req, res) => {
  try {
    const handle = req.validatedHandle || req.params.handle.toLowerCase().replace(/^@/, '');
    const { bookingRef } = req.body;
    if (!bookingRef) {
      return res.status(400).json({ error: 'bookingRef is required to confirm booking.' });
    }

    const booking = await UnicoachBooking.findOne({ bookingRef }).populate('mentorId', 'handle');
    if (!booking || booking.mentorId?.handle !== handle) {
      return res.status(404).json({ error: 'Booking reference not found.' });
    }

    if (booking.amountPaid > 0 && booking.state === 'PAYMENT_PENDING') {
      return res.status(402).json({ error: 'Payment is required to confirm this booking.', code: 'PAYMENT_REQUIRED' });
    }

    const result = await finalizeBookingPayment(bookingRef, { paymentId: `free_${Date.now()}` });
    if (result.slotConflict) {
      return res.status(409).json({ error: result.booking.cancellationReason, booking: serializeSessionBooking(result.booking) });
    }

    res.status(200).json({
      status: result.alreadyConfirmed ? 'ALREADY_CONFIRMED' : 'CONFIRMED',
      message: 'Booking confirmed! Calendar invite and joining details generated.',
      booking: serializeSessionBooking(result.booking)
    });
  } catch (err) {
    console.error('Error confirming booking:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error while confirming booking.' });
  }
};

/**
 * POST /api/unicoach/cancel-reservation
 * Early manual release of temporary lock
 */
const cancelReservation = async (req, res) => {
  try {
    const { slotId, reservationToken, bookingRef } = req.body;

    if (!reservationToken || typeof reservationToken !== 'string') {
      return res.status(400).json({ error: 'reservationToken is required to release a reservation.' });
    }

    if (bookingRef) {
      const booking = await UnicoachBooking.findOne({ bookingRef: String(bookingRef), state: 'PAYMENT_PENDING' });
      // Only slot reservations can be cancelled here, and only by the holder of the reservation token
      // (direct purchases have no slot/token, so they cannot be cancelled through this endpoint)
      if (booking && booking.slotId) {
        const slot = await UnicoachSlot.findOne({ _id: booking.slotId, heldBy: reservationToken });
        if (!slot) {
          return res.status(403).json({ error: 'Reservation token does not match this booking.' });
        }
        const cancelled = await UnicoachBooking.findOneAndUpdate(
          { _id: booking._id, state: 'PAYMENT_PENDING' },
          { state: 'CANCELLED', cancellationReason: 'Student canceled during reservation window' },
          { new: true }
        );
        await releaseSlotLock(slot._id.toString(), reservationToken);
        await UnicoachSlot.findOneAndUpdate(
          { _id: slot._id, heldBy: reservationToken, status: 'HELD' },
          { status: 'AVAILABLE', heldBy: null, heldUntil: null }
        );
        if (cancelled && cancelled.couponCode) {
          await releaseCoupon(cancelled.mentorId, cancelled.couponCode);
        }
      }
    } else if (slotId) {
      await releaseSlotLock(String(slotId), reservationToken);
      await UnicoachSlot.findOneAndUpdate(
        { _id: slotId, heldBy: reservationToken, status: 'HELD' },
        { status: 'AVAILABLE', heldBy: null, heldUntil: null }
      );
    }

    res.json({ success: true, message: 'Reservation released successfully.' });
  } catch (err) {
    console.error('Error canceling reservation:', err);
    res.status(500).json({ error: 'Failed to release reservation.' });
  }
};

/**
 * POST /api/unicoach/@:handle/purchase-direct
 * Direct checkout for Digital Products & Priority DMs (No slot selection needed)
 */
const purchaseDirectService = async (req, res) => {
  let claimedCoupon = null;
  let bookingSaved = false;
  try {
    const handle = req.validatedHandle || req.params.handle.toLowerCase().replace(/^@/, '');
    const {
      serviceId,
      studentName,
      studentEmail,
      studentPhone,
      studentNotes,
      customAnswers,
      couponCode,
      priorityDmQuery // { questionText, contextText, referenceUrl }
    } = req.body;

    if (!serviceId || !studentName || !studentEmail || !studentPhone) {
      return res.status(400).json({
        error: 'serviceId, studentName, studentEmail, and studentPhone are required.'
      });
    }

    const mentor = await UnicoachMentor.findOne({ handle, active: true });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });

    if (mentor.applicationStatus !== 'APPROVED') {
      return res.status(403).json({
        error: 'This mentor profile is currently pending verification from UniCoach Admin and cannot accept direct orders yet.',
        code: 'MENTOR_NOT_APPROVED'
      });
    }

    const service = await UnicoachService.findOne({ _id: serviceId, mentorId: mentor._id, active: true });
    if (!service) return res.status(404).json({ error: 'Service not found or inactive.' });

    if (service.type !== 'DIGITAL_ASSET' && service.type !== 'PRIORITY_DM' && service.type !== 'SOP_REVIEW') {
      return res.status(400).json({
        error: `Service type ${service.type} requires 1:1 slot booking via standard reservation flow.`
      });
    }

    // If Priority DM, validate question text
    if (service.type === 'PRIORITY_DM' && (!priorityDmQuery || !priorityDmQuery.questionText?.trim())) {
      return res.status(400).json({
        error: 'Please enter your question before proceeding with Priority DM.'
      });
    }

    // Coupon Validation & Discount Computation
    let finalAmount = service.priceInINR;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Atomic claim: enforces maxUses even under concurrent checkouts (released if the booking is cancelled)
    const coupon = couponCode ? await claimCoupon(mentor._id, couponCode) : null;
    if (coupon) {
      claimedCoupon = coupon;
      discountAmount = computeDiscount(coupon, service.priceInINR);
      finalAmount = Math.max(0, service.priceInINR - discountAmount);
      appliedCoupon = coupon;
    }

    const bookingRef = `UM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const idempotencyKey = req.headers['idempotency-key'] || `dir_idemp_${crypto.randomUUID()}`;

    const commissionPercent = 0.00; // 0% platform fee - UniCoach currently takes 0 charges (100% goes to mentor)
    const platformCommission = Math.round(finalAmount * commissionPercent);
    const mentorEarning = finalAmount - platformCommission;

    const isDigitalAsset = service.type === 'DIGITAL_ASSET';
    const isPriorityDm = service.type === 'PRIORITY_DM';

    // Created as PAYMENT_PENDING: nothing is delivered until Razorpay confirms the payment
    const booking = new UnicoachBooking({
      bookingRef,
      mentorId: mentor._id,
      serviceId: service._id,
      slotId: null,
      studentName,
      studentEmail,
      studentPhone,
      studentNotes: studentNotes || '',
      customAnswers: Array.isArray(customAnswers) ? customAnswers : [],
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      originalAmount: service.priceInINR,
      discountAmount,
      amountPaid: finalAmount,
      platformCommission,
      mentorEarning,
      state: 'PAYMENT_PENDING',
      idempotencyKey,
      currency: 'INR',
      priorityDm: isPriorityDm ? {
        questionText: priorityDmQuery.questionText.trim(),
        contextText: priorityDmQuery.contextText || '',
        referenceUrl: priorityDmQuery.referenceUrl || '',
        status: 'NONE'
      } : { status: 'NONE' },
      // File URL + download token are only attached in finalizeBookingPayment, after payment is confirmed
      digitalAssetDelivery: isDigitalAsset ? {
        fileName: service.digitalAsset?.fileName || service.title
      } : {}
    });

    await booking.save();
    bookingSaved = true;

    // Free product: confirm right away
    if (finalAmount === 0) {
      const result = await finalizeBookingPayment(bookingRef, { paymentId: `free_${Date.now()}` });
      return res.status(201).json(serializeDirectResult(result.booking));
    }

    res.status(201).json({
      success: true,
      status: 'PAYMENT_PENDING',
      bookingRef: booking.bookingRef,
      serviceType: service.type,
      serviceTitle: service.title,
      amountPaid: finalAmount,
      mentorName: mentor.name
    });
  } catch (err) {
    if (claimedCoupon && !bookingSaved) await releaseCoupon(claimedCoupon.mentorId, claimedCoupon.code);
    console.error('Error in purchaseDirectService:', err);
    res.status(500).json({ error: err.message || 'Failed to create order.' });
  }
};

/**
 * GET /api/unicoach/queries/:bookingRef
 * Student tracking endpoint to inspect their submitted Priority DM question & mentor's answer
 */
const getStudentQueryStatus = async (req, res) => {
  try {
    const { bookingRef } = req.params;
    const booking = await UnicoachBooking.findOne({ bookingRef })
      .populate('mentorId', 'name handle headline avatarUrl isVerified')
      .populate('serviceId', 'title type maxDeliveryHours priceInINR');

    if (!booking) {
      return res.status(404).json({ error: 'Query reference not found.' });
    }

    const now = Date.now();
    const dueTime = booking.priorityDm?.deliveryDueUtc ? new Date(booking.priorityDm.deliveryDueUtc).getTime() : now;
    const msRemaining = Math.max(0, dueTime - now);
    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

    const existingReview = await UnicoachReview.findOne({ bookingId: booking._id })
      .select('rating comment createdAt verifiedPurchase');

    res.json({
      bookingRef: booking.bookingRef,
      state: booking.state,
      mentor: booking.mentorId,
      service: booking.serviceId,
      durationMinutes: booking.durationMinutes || booking.serviceId?.durationMinutes || 30,
      startUtc: booking.startUtc,
      meeting: booking.meeting,
      review: existingReview || null,
      priorityDm: {
        ...(booking.priorityDm?.toObject ? booking.priorityDm.toObject() : (booking.priorityDm || {})),
        isExpired: msRemaining === 0 && booking.priorityDm?.status === 'PENDING',
        slaRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          formatted: `${hoursRemaining}h ${minutesRemaining}m`
        }
      },
      // Paid file is only revealed once the booking is actually paid/confirmed, and only as a
      // download token: the stored file URL never leaves the server
      digitalAssetDelivery: PAID_STATES.includes(booking.state) && booking.digitalAssetDelivery?.downloadToken
        ? {
          fileName: booking.digitalAssetDelivery.fileName,
          downloadToken: booking.digitalAssetDelivery.downloadToken,
          downloadCount: booking.digitalAssetDelivery.downloadCount || 0,
          maxDownloads: MAX_ASSET_DOWNLOADS
        }
        : null,
      createdAt: booking.createdAt
    });
  } catch (err) {
    console.error('Error fetching query status:', err);
    res.status(500).json({ error: 'Failed to retrieve query details.' });
  }
};

/**
 * GET /api/unicoach/directory
 * Public marketplace directory of verified mentors (Strictly isVerified === true)
 *
 * Query: search, country, serviceType, minRating, minPrice, maxPrice,
 *        sort (top_rated | most_reviewed | price_low | price_high | newest), page, limit
 */
const DIRECTORY_SORTS = {
  top_rated: { rankScore: -1, reviewCount: -1, createdAt: -1 },
  most_reviewed: { reviewCount: -1, rankScore: -1, createdAt: -1 },
  price_low: { startingPriceINR: 1, rankScore: -1 },
  price_high: { startingPriceINR: -1, rankScore: -1 },
  newest: { createdAt: -1 }
};
const SERVICE_TYPES = ['ONE_ON_ONE', 'SOP_REVIEW', 'PRIORITY_DM', 'DIGITAL_ASSET'];

const getPublicDirectory = async (req, res) => {
  try {
    const { search, country, serviceType } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const sortKey = DIRECTORY_SORTS[req.query.sort] ? req.query.sort : 'top_rated';
    const minRating = Number(req.query.minRating);
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const hasServiceType = typeof serviceType === 'string' && SERVICE_TYPES.includes(serviceType);

    const query = {
      isVerified: true,
      active: true
    };

    if (country && typeof country === 'string' && country !== 'ALL') {
      query.country = new RegExp(`^${escapeRegex(country.trim())}$`, 'i');
    }

    if (search && typeof search === 'string' && search.trim()) {
      const s = escapeRegex(search.trim().slice(0, 100));
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { handle: { $regex: s, $options: 'i' } },
        { headline: { $regex: s, $options: 'i' } },
        { bio: { $regex: s, $options: 'i' } },
        { university: { $regex: s, $options: 'i' } },
        { course: { $regex: s, $options: 'i' } }
      ];
    }

    if (hasServiceType) query.serviceTypes = serviceType;
    if (Number.isFinite(minRating) && minRating > 0) {
      query.ratingAvg = { $gte: Math.min(5, minRating) };
      query.reviewCount = { $gt: 0 };
    }
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined || sortKey.startsWith('price_')) {
      // Mentors without any active service have no price, so they drop out of price filters/sorts
      query.startingPriceINR = { $ne: null };
      if (Number.isFinite(minPrice) && minPrice > 0) query.startingPriceINR.$gte = minPrice;
      if (Number.isFinite(maxPrice) && maxPrice >= 0) query.startingPriceINR.$lte = maxPrice;
    }

    const [total, mentors, countries] = await Promise.all([
      UnicoachMentor.countDocuments(query),
      UnicoachMentor.find(query)
        .select('name handle headline bio avatarUrl coverImageUrl country university course graduationYear badges isVerified ratingAvg reviewCount startingPriceINR')
        .sort(DIRECTORY_SORTS[sortKey])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      // Country options for the filter dropdown (only needed on the first page)
      page === 1 ? UnicoachMentor.distinct('country', { isVerified: true, active: true, country: { $ne: '' } }) : null
    ]);

    const mentorIds = mentors.map((m) => m._id);
    const [services, completedCounts] = await Promise.all([
      UnicoachService.find({ mentorId: { $in: mentorIds }, active: true, ...(hasServiceType && { type: serviceType }) })
        .select('mentorId type title priceInINR durationMinutes maxDeliveryHours bundleCount')
        .lean(),
      UnicoachBooking.aggregate([
        { $match: { mentorId: { $in: mentorIds }, state: 'COMPLETED' } },
        { $group: { _id: '$mentorId', count: { $sum: 1 } } }
      ])
    ]);
    const completedByMentor = new Map(completedCounts.map((c) => [String(c._id), c.count]));

    const enriched = mentors.map((m) => {
      const mentorServices = services.filter((s) => String(s.mentorId) === String(m._id));
      return {
        ...m,
        services: mentorServices,
        totalServices: mentorServices.length,
        startingPriceINR: m.startingPriceINR ?? 0,
        rating: m.reviewCount > 0 ? m.ratingAvg : null, // null = "New", no reviews yet
        reviewCount: m.reviewCount || 0,
        completedSessions: completedByMentor.get(String(m._id)) || 0
      };
    });

    res.json({
      success: true,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      sort: sortKey,
      ...(countries && { countries: countries.filter(Boolean).sort() }),
      mentors: enriched
    });
  } catch (err) {
    console.error('Error fetching public mentors directory:', err);
    res.status(500).json({ error: 'Failed to fetch mentors directory' });
  }
};

/**
 * POST /api/unicoach/apply
 * Public application portal for influencers/seniors to join UniCoach as a mentor
 */
const applyAsMentor = async (req, res) => {
  try {
    const { validateHandle } = require('../middlewares/slugValidator');
    const {
      name,
      email,
      phone,
      handle,
      headline,
      bio,
      university,
      country,
      course,
      graduationYear,
      linkedinUrl,
      verificationDocUrl,
      ianaTimezone,
      payoutMethod,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      pan,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode
    } = req.body;

    if (!name || !email || !handle) {
      return res.status(400).json({ error: 'Name, Email, and Handle are required.' });
    }

    // Payout details: students' payments are auto-transferred to this bank account via Razorpay Route
    const cleanPan = (pan || '').trim().toUpperCase();
    const cleanIfsc = (ifscCode || '').trim().toUpperCase();
    const cleanAccount = (accountNumber || '').replace(/\s/g, '');
    const payoutErrors = [];
    if (!accountHolderName || !accountHolderName.trim()) payoutErrors.push('account holder name');
    if (!ACCOUNT_NUMBER_PATTERN.test(cleanAccount)) payoutErrors.push('valid bank account number (9-18 digits)');
    if (!IFSC_PATTERN.test(cleanIfsc)) payoutErrors.push('valid IFSC code');
    if (!PAN_PATTERN.test(cleanPan)) payoutErrors.push('valid PAN (e.g. ABCDE1234F)');
    if (!addressLine1 || !city || !state) payoutErrors.push('address, city and state');
    if (!PINCODE_PATTERN.test((postalCode || '').trim())) payoutErrors.push('6-digit PIN code');
    if (!phone || phone.replace(/\D/g, '').length < 10) payoutErrors.push('phone number');
    if (payoutErrors.length > 0) {
      return res.status(400).json({ error: `Please provide your payout details: ${payoutErrors.join(', ')}.` });
    }

    const val = validateHandle(handle);
    if (!val.valid) {
      return res.status(400).json({ error: val.message });
    }
    const cleanHandle = val.cleanHandle;

    // Check handle collision
    const existingHandle = await UnicoachMentor.findOne({ handle: cleanHandle });
    if (existingHandle) {
      return res.status(409).json({ error: `Handle @${cleanHandle} is already registered.` });
    }

    // Check email collision
    const existingEmail = await UnicoachMentor.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({ error: `A mentor with email ${email} already exists.` });
    }

    // Try linking to an existing UniCoach user account, or auto-create one for this mentor
    let linkedUserId = req.user?.id || null;
    if (!linkedUserId) {
      const userConditions = [{ email: email.toLowerCase().trim() }];
      if (phone) {
        userConditions.push({ phone: phone.trim() });
        const barePhone = phone.replace(/^\+91/, '').trim();
        userConditions.push({ phone: barePhone });
      }
      let matchedUser = await User.findOne({ $or: userConditions });
      if (!matchedUser) {
        matchedUser = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone ? phone.trim() : undefined,
          role: 'user'
        });
        await matchedUser.save().catch((e) => console.warn('Could not auto-create user for mentor:', e.message));
      }
      if (matchedUser) {
        linkedUserId = matchedUser._id;
      }
    }

    // Mentor's own time zone (sent by the apply form from their browser); slots are created in it
    const isValidTimezone = (tz) => {
      try { return Boolean(tz) && Boolean(new Intl.DateTimeFormat('en-US', { timeZone: tz })); } catch { return false; }
    };
    const mentorTimezone = typeof ianaTimezone === 'string' && isValidTimezone(ianaTimezone.trim()) ? ianaTimezone.trim() : 'Asia/Kolkata';

    const mentor = new UnicoachMentor({
      userId: linkedUserId || undefined,
      ianaTimezone: mentorTimezone,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      handle: cleanHandle,
      headline: headline ? headline.trim() : `${course || 'Student'} at ${university || 'University'}`,
      bio: bio ? bio.trim() : '',
      university: university ? university.trim() : '',
      country: country ? country.trim() : '',
      course: course ? course.trim() : '',
      graduationYear: graduationYear ? graduationYear.trim() : '',
      verificationDocUrl: verificationDocUrl ? verificationDocUrl.trim() : '',
      socialLinks: {
        linkedin: linkedinUrl ? linkedinUrl.trim() : ''
      },
      defaultPayoutDetails: {
        payoutMethod: 'BANK_TRANSFER',
        upiId: upiId ? upiId.trim() : '',
        accountHolderName: accountHolderName.trim(),
        accountNumber: cleanAccount,
        ifscCode: cleanIfsc,
        bankName: bankName ? bankName.trim() : ''
      },
      kyc: {
        pan: cleanPan,
        address: {
          street1: addressLine1.trim(),
          street2: (addressLine2 || '').trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim()
        }
      },
      isVerified: false,
      applicationStatus: 'PENDING',
      active: true,
      badges: ['Applicant']
    });

    await mentor.save();

    // Automatically seed services configured during application or default starter pack
    const starterServices = Array.isArray(req.body.initialServices) && req.body.initialServices.length > 0
      ? req.body.initialServices
      : [
        {
          type: 'ONE_ON_ONE',
          title: `30-Min 1:1 Study Abroad Consultation`,
          description: `Discuss university selection, admission chances at ${university || 'top universities'}, documents checklist, and visa process.`,
          durationMinutes: 30,
          priceInINR: req.body.oneOnOnePrice ? Number(req.body.oneOnOnePrice) : 499
        },
        {
          type: 'SOP_REVIEW',
          title: `Statement of Purpose (SOP) & Resume Review`,
          description: `Line-by-line inspection and feedback on your SOP or motivation letter within 48 hours.`,
          durationMinutes: 30,
          priceInINR: req.body.sopPrice ? Number(req.body.sopPrice) : 899,
          maxDeliveryHours: 48
        },
        {
          type: 'PRIORITY_DM',
          title: `Priority DM & Chat Mentorship`,
          description: `Direct 1-on-1 Q&A on university selection, visa queries, and student life abroad with guaranteed response within 24 hours.`,
          durationMinutes: 15,
          priceInINR: req.body.priorityDmPrice ? Number(req.body.priorityDmPrice) : 199,
          maxDeliveryHours: 24
        }
      ];

    for (const s of starterServices) {
      if (s.enabled !== false) {
        await UnicoachService.create({
          mentorId: mentor._id,
          type: s.type || 'ONE_ON_ONE',
          title: s.title,
          description: s.description || '',
          durationMinutes: s.durationMinutes || 30,
          priceInINR: Number(s.priceInINR) || 499,
          maxDeliveryHours: s.maxDeliveryHours || 48,
          active: true
        });
      }
    }
    await refreshMentorStats(mentor._id);

    // Automatically generate 10 upcoming booking slots for the next 5 days: 5 PM and 6 PM in the mentor's own time zone
    const now = new Date();
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const dateStr = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-CA', { timeZone: mentorTimezone }); // YYYY-MM-DD in the mentor's calendar
      const slotDate1 = getZonedDateToUtc(dateStr, '17:00', mentorTimezone);
      const slotEnd1 = new Date(slotDate1.getTime() + 30 * 60 * 1000);

      const slotDate2 = getZonedDateToUtc(dateStr, '18:00', mentorTimezone);
      const slotEnd2 = new Date(slotDate2.getTime() + 30 * 60 * 1000);

      await UnicoachSlot.create({
        mentorId: mentor._id,
        startUtc: slotDate1,
        endUtc: slotEnd1,
        status: 'AVAILABLE',
        active: true
      });
      await UnicoachSlot.create({
        mentorId: mentor._id,
        startUtc: slotDate2,
        endUtc: slotEnd2,
        status: 'AVAILABLE',
        active: true
      });
    }

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for @${mentor.handle}! Our team will review your verification documents. Once approved by Admin, you will be granted the Blue Tick badge and your profile will go live on the public marketplace.`,
      mentor: {
        _id: mentor._id,
        name: mentor.name,
        handle: mentor.handle,
        email: mentor.email,
        applicationStatus: mentor.applicationStatus,
        isVerified: mentor.isVerified
      }
    });
  } catch (err) {
    console.error('Error applying as mentor:', err);
    res.status(500).json({ error: err.message || 'Failed to submit mentor application' });
  }
};

const PAID_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
const MAX_ASSET_DOWNLOADS = 10;

/**
 * GET /api/unicoach/download/:token
 * Paid digital product download: checks the booking is paid, counts the download and redirects
 * to a link that expires in 5 minutes (so a shared link stops working almost immediately).
 */
const downloadDigitalAsset = async (req, res) => {
  try {
    const token = String(req.params.token || '');
    if (!/^dl_[0-9a-f-]{36}$/i.test(token)) return res.status(404).json({ error: 'Download link not found.' });

    // Atomic check-and-increment so parallel clicks can't exceed the limit
    const booking = await UnicoachBooking.findOneAndUpdate(
      {
        'digitalAssetDelivery.downloadToken': token,
        state: { $in: PAID_STATES },
        'digitalAssetDelivery.downloadCount': { $lt: MAX_ASSET_DOWNLOADS }
      },
      { $inc: { 'digitalAssetDelivery.downloadCount': 1 } },
      { new: true }
    ).select('digitalAssetDelivery state').lean();

    if (!booking) {
      const exists = await UnicoachBooking.exists({ 'digitalAssetDelivery.downloadToken': token, state: { $in: PAID_STATES } });
      return exists
        ? res.status(429).json({ error: `Download limit reached (${MAX_ASSET_DOWNLOADS}). Please contact support if you need the file again.` })
        : res.status(404).json({ error: 'Download link not found or payment not confirmed yet.' });
    }

    const fileUrl = booking.digitalAssetDelivery?.fileUrl;
    if (!fileUrl) return res.status(404).json({ error: 'The mentor has not attached a file to this product yet.' });

    const target = fileUrl.startsWith('/uploads/')
      ? `${req.protocol}://${req.get('host')}${fileUrl}` // legacy local-disk file
      : await getAccessUrl(fileUrl, { expiresInSeconds: 300, attachment: true });

    res.set('Cache-Control', 'no-store');
    res.redirect(302, target);
  } catch (err) {
    console.error('Error serving digital asset download:', err);
    res.status(500).json({ error: 'Failed to prepare your download.' });
  }
};

/**
 * POST /api/unicoach/upload-verification-doc
 * Applicant student ID / offer letter: stored privately, viewable only by admins via signed links
 */
const uploadVerificationDoc = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a document or student ID image to upload.' });
    }

    const { url: fileUrl } = await storeUpload(req.file, { visibility: 'private', folder: 'unicoach/verification' });

    res.status(200).json({
      success: true,
      message: 'Verification document uploaded successfully!',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
    });
  } catch (err) {
    console.error('Error uploading verification doc:', err);
    res.status(err.statusCode || 500).json({ error: err.statusCode ? err.message : 'Failed to upload verification document.' });
  }
};

/**
 * GET /api/unicoach/course-mentor/:handle/sessions
 * Real 1:1 session options & prices for the course-page booking modal (prices come from the DB)
 */
const getCourseMentorSessions = async (req, res) => {
  try {
    const cleanHandle = (req.params.handle || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '');
    const mentor = cleanHandle ? await UnicoachMentor.findOne({ handle: cleanHandle, active: true }) : null;
    if (!mentor || mentor.applicationStatus !== 'APPROVED') {
      return res.json({ bookable: false, sessions: [] });
    }
    const services = await UnicoachService.find({ mentorId: mentor._id, type: 'ONE_ON_ONE', active: true })
      .select('title description durationMinutes priceInINR')
      .sort({ durationMinutes: 1 })
      .lean();
    res.json({
      bookable: services.length > 0,
      mentorName: mentor.name,
      mentorHandle: mentor.handle,
      sessions: services.map((svc) => ({
        serviceId: svc._id,
        title: svc.title,
        description: svc.description || '',
        durationMinutes: svc.durationMinutes,
        priceInINR: svc.priceInINR
      }))
    });
  } catch (err) {
    console.error('Error fetching course mentor sessions:', err);
    res.status(500).json({ error: 'Failed to load sessions.' });
  }
};

/**
 * Convert "06:00 PM" → "18:00"
 */
const to24HourTime = (timeStr = '') => {
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = (match[3] || '').toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

/**
 * POST /api/unicoach/book-course-mentor
 * Course-page "Book Call": creates a PAYMENT_PENDING booking for a REAL approved mentor and returns a
 * Razorpay order. Price always comes from the mentor's service in the DB, never from the browser.
 * The browser then opens Razorpay checkout and calls POST /@:handle/verify-payment.
 */
const bookCourseMentorDirect = async (req, res) => {
  try {
    const {
      mentorHandle,
      durationMinutes,
      selectedDate,
      selectedTime,
      studentName,
      studentEmail,
      studentPhone,
      studentNotes,
      courseName,
      universityName
    } = req.body;

    if (!studentName || !studentEmail || !studentPhone) {
      return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    const cleanHandle = (mentorHandle || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_-]/g, '');
    const mentor = cleanHandle ? await UnicoachMentor.findOne({ handle: cleanHandle, active: true }) : null;
    if (!mentor || mentor.applicationStatus !== 'APPROVED') {
      return res.status(404).json({
        error: 'This mentor is not accepting paid bookings yet. Please choose another mentor or request a free callback.',
        code: 'MENTOR_NOT_BOOKABLE'
      });
    }

    const oneOnOneServices = await UnicoachService.find({ mentorId: mentor._id, type: 'ONE_ON_ONE', active: true })
      .sort({ durationMinutes: 1 });
    const service = oneOnOneServices.find((svc) => svc.durationMinutes === Number(durationMinutes)) || oneOnOneServices[0];
    if (!service) {
      return res.status(404).json({ error: 'This mentor has no 1:1 session available right now.', code: 'NO_SERVICE' });
    }

    // Session time in the student's chosen date/time (India time)
    const time24 = to24HourTime(selectedTime);
    let startUtc = (selectedDate && time24) ? getZonedDateToUtc(selectedDate, time24, 'Asia/Kolkata') : null;
    if (!startUtc || isNaN(startUtc.getTime()) || startUtc.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Please choose a valid future date and time for your session.' });
    }
    const endUtc = new Date(startUtc.getTime() + service.durationMinutes * 60 * 1000);

    const bookingRef = `UM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const idempotencyKey = req.headers['idempotency-key'] || `idem_${crypto.randomUUID()}`;
    const amount = service.priceInINR;

    const booking = await UnicoachBooking.create({
      bookingRef,
      idempotencyKey,
      mentorId: mentor._id,
      serviceId: service._id,
      studentName,
      studentEmail: studentEmail.toLowerCase().trim(),
      studentPhone,
      studentNotes: studentNotes || `Guidance for ${courseName || 'Selected Course'} at ${universityName || 'Target University'}`,
      startUtc,
      endUtc,
      state: 'PAYMENT_PENDING',
      originalAmount: amount,
      discountAmount: 0,
      amountPaid: amount,
      platformCommission: 0,
      mentorEarning: amount,
      currency: 'INR'
    });

    // Record CRM Lead so admin sees it in Leads CRM
    try {
      const Lead = require('../../models/Lead');
      await Lead.findOneAndUpdate(
        { email: studentEmail.toLowerCase().trim() },
        {
          $set: {
            name: studentName,
            phone: studentPhone,
            status: 'qualified',
            source: '1:1 Mentor Booking',
            lastInquiryAt: new Date(),
            notes: `Started 1:1 booking with ${mentor.name} (${service.title}) for ${courseName || ''} at ${universityName || ''}. Ref: ${bookingRef}`
          },
          $inc: { totalInquiries: 1 },
          $push: {
            interestedUniversities: {
              name: universityName || mentor.university || 'Target Uni',
              course: courseName || '1:1 Mentorship',
              source: '1:1 Mentor Booking',
              date: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );
    } catch (crmErr) {
      console.warn('CRM Lead upsert warning:', crmErr.message);
    }

    if (amount === 0) {
      const result = await finalizeBookingPayment(bookingRef, { paymentId: `free_${Date.now()}` });
      return res.status(200).json({ success: true, status: 'CONFIRMED', free: true, booking: serializeSessionBooking(result.booking) });
    }

    const order = await createRazorpayOrder({
      amountINR: amount,
      bookingRef,
      notes: { mentorHandle: mentor.handle, studentEmail: booking.studentEmail, service: service.title }
    });
    booking.payment = { orderId: order.orderId };
    await booking.save();

    return res.status(200).json({
      success: true,
      status: 'PAYMENT_PENDING',
      bookingRef,
      mentorHandle: mentor.handle,
      mentorName: mentor.name,
      serviceTitle: service.title,
      durationMinutes: service.durationMinutes,
      amount,
      payment: {
        gateway: 'RAZORPAY',
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency || 'INR',
        keyId: order.keyId,
        simulated: order.simulated,
        prefill: { name: studentName, email: booking.studentEmail, contact: studentPhone }
      }
    });
  } catch (err) {
    console.error('Error in bookCourseMentorDirect:', err);
    res.status(500).json({ error: err.message || 'Server error while booking mentor session.' });
  }
};

module.exports = {
  getPublicProfile,
  getAvailableSlots,
  reserveSlot,
  confirmBooking,
  cancelReservation,
  purchaseDirectService,
  getStudentQueryStatus,
  getPublicDirectory,
  applyAsMentor,
  uploadVerificationDoc,
  downloadDigitalAsset,
  bookCourseMentorDirect,
  getCourseMentorSessions
};

