const crypto = require('crypto');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachSlot = require('../models/UnicoachSlot');
const UnicoachLedger = require('../models/UnicoachLedger');
const { releaseSlotLock } = require('./lockService');
const { createMentorTransfer, refundBooking } = require('./routeService');
const { sendBookingConfirmationEmail, sendDirectOrderConfirmationEmail } = require('./notificationService');

const DIRECT_SERVICE_TYPES = ['SOP_REVIEW', 'PRIORITY_DM', 'DIGITAL_ASSET'];
const EMAIL_WAIT_MS = 8000;

const isDirectServiceType = (type) => DIRECT_SERVICE_TYPES.includes(type);

const generateMeetLink = () => {
  const meetCode = `${crypto.randomBytes(3).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(3).toString('hex')}`;
  return { platform: 'GOOGLE_MEET', joinUrl: `https://meet.google.com/${meetCode}`, meetingId: meetCode };
};

const loadBooking = (filter) => UnicoachBooking.findOne(filter)
  .populate('mentorId')
  .populate('serviceId')
  .populate('slotId');

/**
 * The single place where a booking becomes CONFIRMED after payment (or for a free booking).
 * Called from the checkout verify endpoint, the Razorpay webhook, and free bookings.
 * Atomic: if verify + webhook race, only one of them performs the side effects.
 *
 * @returns {{ booking, alreadyConfirmed?: boolean, slotConflict?: boolean }}
 */
async function finalizeBookingPayment(bookingRef, { paymentId, orderId = '', signature = '', paymentEntity = null } = {}) {
  const set = {
    state: 'CONFIRMED',
    'payment.paymentId': paymentId,
    'payment.signature': signature,
    'payment.capturedAt': new Date()
  };
  if (orderId) set['payment.orderId'] = orderId;

  const claimed = await UnicoachBooking.findOneAndUpdate(
    { bookingRef, state: 'PAYMENT_PENDING' },
    { $set: set },
    { new: true }
  );

  if (!claimed) {
    const existing = await loadBooking({ bookingRef });
    if (!existing) throw Object.assign(new Error('Booking reference not found.'), { status: 404 });
    if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(existing.state)) {
      // Already confirmed by the other path; make sure the mentor split happened
      if (existing.amountPaid > 0 && !existing.settlement?.transferId && paymentEntity) {
        await createMentorTransfer(existing._id, paymentEntity);
      }
      return { booking: await loadBooking({ bookingRef }), alreadyConfirmed: true };
    }
    throw Object.assign(new Error(`Booking cannot be confirmed from state '${existing.state}'.`), { status: 409 });
  }

  const booking = await loadBooking({ _id: claimed._id });
  const serviceType = booking.serviceId?.type;

  // 1:1 slot: lock it permanently for this booking (the 10-min hold may have expired meanwhile)
  if (booking.slotId) {
    const heldBy = booking.slotId.heldBy;
    const slot = await UnicoachSlot.findOneAndUpdate(
      {
        _id: booking.slotId._id,
        $or: [
          { bookingId: booking._id },
          { status: 'AVAILABLE' },
          { status: 'HELD', heldUntil: { $lte: new Date() } }
        ]
      },
      { $set: { status: 'BOOKED', bookingId: booking._id, heldBy: null, heldUntil: null } },
      { new: true }
    );

    if (heldBy) await releaseSlotLock(booking.slotId._id.toString(), heldBy).catch(() => {});

    if (!slot) {
      // Someone else booked this slot after our hold expired: give the student their money back
      const refund = await refundBooking(booking._id, 'Slot was taken by another student before payment completed');
      booking.state = refund.ok ? 'REFUNDED' : 'CANCELLED';
      booking.cancellationReason = refund.ok
        ? 'Slot was no longer available. Full refund issued.'
        : `Slot was no longer available. Refund pending: ${refund.reason}`;
      await booking.save();
      return { booking, slotConflict: true };
    }
  }

  if (!isDirectServiceType(serviceType) && !booking.meeting?.joinUrl) {
    booking.meeting = generateMeetLink();
  }

  if (serviceType === 'PRIORITY_DM' || serviceType === 'SOP_REVIEW') {
    const hours = booking.serviceId?.maxDeliveryHours || 48;
    booking.priorityDm = {
      ...(booking.priorityDm?.toObject ? booking.priorityDm.toObject() : booking.priorityDm),
      status: serviceType === 'PRIORITY_DM' ? 'PENDING' : (booking.priorityDm?.status || 'NONE'),
      deliveryDueUtc: new Date(Date.now() + hours * 3600 * 1000)
    };
  }

  if (serviceType === 'DIGITAL_ASSET') {
    // Deliver the paid file only now that payment is confirmed
    const asset = booking.serviceId?.digitalAsset || {};
    booking.digitalAssetDelivery = {
      fileUrl: asset.fileUrl || asset.resourceLink || '',
      fileName: booking.digitalAssetDelivery?.fileName || asset.fileName || booking.serviceId?.title || '',
      downloadToken: `dl_${crypto.randomUUID()}`,
      downloadCount: 0
    };
    booking.state = 'COMPLETED';
  }

  booking.settlement = {
    ...(booking.settlement?.toObject ? booking.settlement.toObject() : booking.settlement),
    status: booking.amountPaid > 0 ? 'PENDING_CAPTURE' : 'NOT_APPLICABLE',
    grossINR: booking.amountPaid
  };

  await booking.save();

  // Coupon usage is claimed atomically at reserve/purchase time (bookingController), not here

  if (booking.amountPaid > 0) {
    await UnicoachLedger.create([
      {
        bookingId: booking._id, mentorId: booking.mentorId._id, type: 'DEBIT', account: 'STUDENT',
        amount: booking.amountPaid, currency: booking.currency || 'INR',
        description: `Payment ${paymentId} from ${booking.studentEmail} for ${booking.bookingRef}`
      },
      {
        bookingId: booking._id, mentorId: booking.mentorId._id, type: 'CREDIT', account: 'ESCROW',
        amount: booking.amountPaid, currency: booking.currency || 'INR',
        description: `Collected via Razorpay for ${booking.bookingRef}, pending split to mentor`
      }
    ]);

    // Auto-split to the mentor (fee + GST deducted). Failures are stored on the booking for admin retry.
    await createMentorTransfer(booking._id, paymentEntity).catch((err) => {
      console.error(`❌ [BookingPayment] Split failed for ${booking.bookingRef}:`, err.message);
    });
  }

  const sendEmails = isDirectServiceType(serviceType)
    ? sendDirectOrderConfirmationEmail(booking, booking.mentorId, booking.serviceId)
    : sendBookingConfirmationEmail(booking, booking.mentorId, booking.serviceId);
  await Promise.race([
    sendEmails.catch((err) => console.warn(`⚠️ [BookingPayment] Email warning for ${booking.bookingRef}:`, err.message)),
    new Promise((resolve) => setTimeout(resolve, EMAIL_WAIT_MS))
  ]);

  return { booking: await loadBooking({ _id: booking._id }) };
}

/**
 * Response shape for a confirmed 1:1 session
 */
function serializeSessionBooking(booking) {
  return {
    bookingRef: booking.bookingRef,
    state: booking.state,
    studentName: booking.studentName,
    studentEmail: booking.studentEmail,
    mentorName: booking.mentorId?.name,
    mentorEmail: booking.mentorId?.email,
    service: booking.serviceId?.title,
    serviceTitle: booking.serviceId?.title,
    startUtc: booking.startUtc,
    endUtc: booking.endUtc,
    meetingUrl: booking.meeting?.joinUrl || '',
    amountPaid: booking.amountPaid,
    paymentId: booking.payment?.paymentId,
    cancellationReason: booking.cancellationReason || ''
  };
}

/**
 * Response shape for a paid direct service (digital product / Priority DM / SOP review)
 */
function serializeDirectResult(booking) {
  const service = booking.serviceId || {};
  const isDigitalAsset = service.type === 'DIGITAL_ASSET';
  const isPriorityDm = service.type === 'PRIORITY_DM';
  return {
    success: true,
    status: booking.state,
    bookingRef: booking.bookingRef,
    serviceType: service.type,
    serviceTitle: service.title,
    amountPaid: booking.amountPaid,
    mentorName: booking.mentorId?.name,
    digitalAsset: isDigitalAsset ? {
      fileName: booking.digitalAssetDelivery?.fileName,
      downloadToken: booking.digitalAssetDelivery?.downloadToken,
      fileType: service.digitalAsset?.fileType || 'PDF',
      fileSize: service.digitalAsset?.fileSize || 'Instant File'
    } : null,
    priorityDm: isPriorityDm ? {
      status: booking.priorityDm?.status,
      deliveryDueUtc: booking.priorityDm?.deliveryDueUtc,
      maxDeliveryHours: service.maxDeliveryHours || 48,
      questionText: booking.priorityDm?.questionText
    } : null
  };
}

module.exports = {
  DIRECT_SERVICE_TYPES,
  isDirectServiceType,
  finalizeBookingPayment,
  serializeSessionBooking,
  serializeDirectResult
};
