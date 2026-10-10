const UnicoachBooking = require('../models/UnicoachBooking');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyRazorpayWebhook,
  getPaymentConfig
} = require('../services/paymentService');
const { createMentorTransfer, refundBooking } = require('../services/routeService');
const { sendMetaEvent } = require('../../services/metaConversions');
const {
  isDirectServiceType,
  finalizeBookingPayment,
  serializeSessionBooking,
  serializeDirectResult
} = require('../services/bookingPaymentService');

const handleOf = (req) => (req.validatedHandle || req.params.handle || '').replace(/^@/, '').toLowerCase();

const findBookingForHandle = async (bookingRef, handle) => {
  const booking = await UnicoachBooking.findOne({ bookingRef }).populate('mentorId').populate('serviceId');
  if (!booking) return null;
  if (handle && booking.mentorId?.handle !== handle) return null;
  return booking;
};

const CONFIRMED_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

/**
 * A real, verified payment arrived for a booking that can no longer be confirmed (expired / cancelled).
 * Record the payment id on the booking, then refund it in full.
 */
const refundLatePayment = async (bookingId, { paymentId, orderId = '' }) => {
  const fresh = await UnicoachBooking.findById(bookingId);
  if (!fresh) return { ok: false, reason: 'Booking not found.' };
  if (fresh.state === 'PAYMENT_PENDING' || CONFIRMED_STATES.includes(fresh.state)) {
    return { ok: false, notApplicable: true, reason: `Booking is in '${fresh.state}' state.` };
  }
  if (fresh.refund?.refundId) return { ok: true, alreadyDone: true };

  const storedPaymentId = fresh.payment?.paymentId;
  if (storedPaymentId && storedPaymentId !== paymentId && !storedPaymentId.startsWith('free_')) {
    // A different payment is already recorded on this booking; don't overwrite it silently
    console.error(`❌ [Payment] Late payment ${paymentId} for ${fresh.bookingRef} but ${storedPaymentId} is already stored. Manual refund needed.`);
    return { ok: false, reason: 'Another payment is already recorded on this booking; refund requires manual review.' };
  }

  await UnicoachBooking.updateOne(
    { _id: fresh._id },
    {
      $set: {
        'payment.paymentId': paymentId,
        ...(orderId ? { 'payment.orderId': orderId } : {}),
        'payment.capturedAt': new Date()
      }
    }
  );

  const refund = await refundBooking(fresh._id, `Payment received after booking was ${fresh.state.toLowerCase()}`);
  if (refund.ok) {
    console.log(`↩️ [Payment] Refunded late payment ${paymentId} for ${fresh.state} booking ${fresh.bookingRef}`);
  } else {
    console.error(`❌ [Payment] Could not refund late payment ${paymentId} for ${fresh.bookingRef}: ${refund.reason}`);
  }
  return refund;
};

const lateRefundResponse = (refund) => ({
  status: refund.ok ? 'REFUNDED' : 'REFUND_PENDING',
  code: 'BOOKING_EXPIRED',
  error: refund.ok
    ? 'This booking expired; your payment has been refunded.'
    : 'This booking expired; we could not refund your payment automatically. Our team will refund you shortly.'
});

const buildConfirmedResponse = (result) => {
  const { booking, alreadyConfirmed, slotConflict } = result;
  if (slotConflict) {
    return {
      httpStatus: 409,
      body: {
        status: booking.state,
        error: booking.cancellationReason || 'This slot was booked by someone else. Your payment will be refunded.',
        booking: serializeSessionBooking(booking)
      }
    };
  }
  const isDirect = isDirectServiceType(booking.serviceId?.type);
  return {
    httpStatus: 200,
    body: {
      status: booking.state,
      message: alreadyConfirmed ? 'Booking was already confirmed.' : 'Payment verified and booking confirmed successfully!',
      booking: serializeSessionBooking(booking),
      ...(isDirect ? { directResult: serializeDirectResult(booking) } : {})
    }
  };
};

/**
 * POST /api/unicoach/@:handle/create-payment-order
 * Creates a Razorpay order for a PAYMENT_PENDING booking. Amount always comes from the booking in the DB.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const { bookingRef, gateway = 'RAZORPAY' } = req.body;
    if (!bookingRef) return res.status(400).json({ error: 'bookingRef is required.' });

    if (String(gateway).toUpperCase() !== 'RAZORPAY') {
      return res.status(400).json({ error: 'Only Razorpay payments are supported (UPI, cards, netbanking, international cards).' });
    }

    const booking = await findBookingForHandle(bookingRef, handleOf(req));
    if (!booking) return res.status(404).json({ error: 'Booking reference not found.' });

    if (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.state)) {
      return res.status(200).json({ status: 'ALREADY_CONFIRMED', message: 'This booking has already been paid and confirmed.' });
    }
    if (booking.state !== 'PAYMENT_PENDING') {
      return res.status(400).json({ error: `Cannot create payment order for booking in '${booking.state}' state.` });
    }

    if (booking.amountPaid === 0) {
      return res.json({ free: true, gateway: 'FREE', message: 'Free session — no payment required.' });
    }

    const config = await getPaymentConfig();
    const prefill = { name: booking.studentName, email: booking.studentEmail, contact: booking.studentPhone };

    // Re-use the order already created for this booking (a retry after closing the popup)
    if (booking.payment?.orderId && !booking.payment.orderId.startsWith('order_sim_') && config.razorpay.isConfigured) {
      return res.json({
        success: true,
        gateway: 'RAZORPAY',
        orderId: booking.payment.orderId,
        amount: Math.round(booking.amountPaid * 100),
        currency: 'INR',
        keyId: config.razorpay.keyId,
        simulated: false,
        prefill
      });
    }

    const order = await createRazorpayOrder({
      amountINR: booking.amountPaid,
      bookingRef: booking.bookingRef,
      notes: {
        mentorHandle: booking.mentorId?.handle || '',
        studentEmail: booking.studentEmail,
        service: booking.serviceId?.title || ''
      }
    });

    booking.payment = { ...(booking.payment?.toObject ? booking.payment.toObject() : booking.payment), orderId: order.orderId };
    await booking.save();

    return res.json({
      success: true,
      gateway: 'RAZORPAY',
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency || 'INR',
      keyId: order.keyId,
      simulated: order.simulated,
      prefill
    });
  } catch (err) {
    console.error('Error creating payment order:', err);
    return res.status(500).json({ error: err.message || 'Failed to create payment order.' });
  }
};

/**
 * POST /api/unicoach/@:handle/verify-payment
 * Verifies the Razorpay payment for the order stored on the booking, then confirms the booking
 * (which also auto-splits the money to the mentor via Route).
 */
const verifyPaymentAndConfirm = async (req, res) => {
  try {
    const { bookingRef, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!bookingRef) return res.status(400).json({ error: 'bookingRef is required.' });

    const booking = await findBookingForHandle(bookingRef, handleOf(req));
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (CONFIRMED_STATES.includes(booking.state)) {
      const { httpStatus, body } = buildConfirmedResponse({ booking: await UnicoachBooking.findById(booking._id).populate('mentorId').populate('serviceId'), alreadyConfirmed: true });
      return res.status(httpStatus).json(body);
    }

    let result;
    if (booking.amountPaid === 0) {
      result = await finalizeBookingPayment(bookingRef, { paymentId: `free_${Date.now()}` });
    } else {
      const storedOrderId = booking.payment?.orderId;
      if (razorpay_order_id && storedOrderId && razorpay_order_id !== storedOrderId) {
        return res.status(400).json({ error: 'Order id does not match this booking.' });
      }

      const verification = await verifyRazorpayPayment({
        orderId: storedOrderId,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        expectedAmountINR: booking.amountPaid
      });
      if (!verification.verified) {
        return res.status(400).json({ error: verification.error || 'Payment verification failed.' });
      }

      const paymentId = verification.simulated ? `pay_sim_${Date.now()}` : razorpay_payment_id;

      // Paid for a booking that expired / was cancelled meanwhile: refund instead of keeping the money
      if (booking.state !== 'PAYMENT_PENDING') {
        const refund = await refundLatePayment(booking._id, { paymentId, orderId: storedOrderId });
        return res.status(409).json(lateRefundResponse(refund));
      }

      try {
        result = await finalizeBookingPayment(bookingRef, {
          paymentId,
          orderId: storedOrderId,
          signature: razorpay_signature || '',
          paymentEntity: verification.payment
        });
      } catch (finalizeErr) {
        if (finalizeErr.status !== 409) throw finalizeErr;
        // State changed between our read and the confirm (e.g. cancelled in parallel)
        const refund = await refundLatePayment(booking._id, { paymentId, orderId: storedOrderId });
        if (refund.notApplicable) throw finalizeErr;
        return res.status(409).json(lateRefundResponse(refund));
      }
    }

    const { httpStatus, body } = buildConfirmedResponse(result);
    const paid = result.booking;
    if (httpStatus === 200 && !result.alreadyConfirmed && paid?.amountPaid > 0) {
      // Same event id as the website pixel (adTracking.js), so Meta counts this purchase once
      sendMetaEvent({
        eventName: 'Purchase',
        eventId: `purchase_${paid.bookingRef}`,
        user: { email: paid.studentEmail, phone: paid.studentPhone, name: paid.studentName },
        req,
        value: paid.amountPaid,
        customData: { content_name: paid.serviceId?.title, order_id: paid.bookingRef }
      });
    }
    return res.status(httpStatus).json(body);
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(err.status || 500).json({ error: err.message || 'Payment verification failed.' });
  }
};

/**
 * POST /api/unicoach/webhooks/razorpay
 * Backup confirmation when the student closes the tab before the browser calls verify-payment.
 * Signature is checked on the RAW body exactly as Razorpay sent it.
 */
const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = await verifyRazorpayWebhook(req.rawBody, signature);
    if (!isValid) {
      console.warn('❌ [Razorpay Webhook] Invalid or missing signature / secret');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;
    console.log(`🔔 [Razorpay Webhook] ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload?.payment?.entity;
      if (!payment) return res.json({ status: 'ignored' });
      // The Razorpay account can be shared with other businesses (e.g. VisaWebs): their payments also reach
      // this webhook. Without our bookingRef or an order id there is nothing to match, so never guess.
      if (!payment.notes?.bookingRef && !payment.order_id) return res.json({ status: 'ignored' });

      const booking = await UnicoachBooking.findOne(
        payment.notes?.bookingRef
          ? { bookingRef: payment.notes.bookingRef }
          : { 'payment.orderId': payment.order_id }
      );

      if (!booking) return res.json({ status: 'no_booking' });

      if (booking.payment?.orderId && booking.payment.orderId !== payment.order_id) {
        console.warn(`[Razorpay Webhook] Order mismatch for ${booking.bookingRef}`);
        return res.json({ status: 'order_mismatch' });
      }

      if (booking.state === 'PAYMENT_PENDING') {
        if (Number(payment.amount) !== Math.round(booking.amountPaid * 100)) {
          console.warn(`[Razorpay Webhook] Amount mismatch for ${booking.bookingRef}`);
          return res.json({ status: 'amount_mismatch' });
        }
        try {
          await finalizeBookingPayment(booking.bookingRef, {
            paymentId: payment.id,
            orderId: payment.order_id,
            paymentEntity: payment
          });
        } catch (finalizeErr) {
          if (finalizeErr.status !== 409) throw finalizeErr;
          const refund = await refundLatePayment(booking._id, { paymentId: payment.id, orderId: payment.order_id });
          if (refund.notApplicable) throw finalizeErr;
          return res.json({ status: refund.ok ? 'refunded_late_payment' : 'late_payment_refund_failed' });
        }
      } else if (CONFIRMED_STATES.includes(booking.state)) {
        if (!booking.settlement?.transferId && booking.amountPaid > 0
            && ['PENDING_CAPTURE', 'FAILED', 'NOT_APPLICABLE'].includes(booking.settlement?.status || 'NOT_APPLICABLE')) {
          // Confirmed earlier but the fee wasn't known yet: now we can split
          await createMentorTransfer(booking._id, payment);
        }
      } else if (booking.amountPaid > 0 && Number(payment.amount) === Math.round(booking.amountPaid * 100)) {
        // Captured payment for an expired / cancelled booking: give the money back
        const refund = await refundLatePayment(booking._id, { paymentId: payment.id, orderId: payment.order_id });
        return res.json({ status: refund.ok ? 'refunded_late_payment' : 'late_payment_refund_failed' });
      } else {
        console.error(`❌ [Razorpay Webhook] Captured payment ${payment.id} for ${booking.state} booking ${booking.bookingRef} with unexpected amount. Manual refund needed.`);
      }
    }

    if (event === 'refund.processed' || event === 'refund.failed') {
      const refund = payload?.refund?.entity;
      if (refund?.id) {
        await UnicoachBooking.updateOne({ 'refund.refundId': refund.id }, { $set: { 'refund.status': refund.status } });
      }
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook error:', err);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentAndConfirm,
  handleRazorpayWebhook
};
