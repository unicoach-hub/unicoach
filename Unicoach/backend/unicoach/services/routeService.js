const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachBooking = require('../models/UnicoachBooking');
const UnicoachLedger = require('../models/UnicoachLedger');
const { getPaymentConfig, getRazorpayInstance } = require('./paymentService');

/**
 * Razorpay Route: every paid booking is split automatically.
 * UniCoach takes 0% commission. The mentor receives (amount - Razorpay fee - GST on fee).
 *
 * Lifecycle:
 *  1. Admin approves mentor   -> ensureLinkedAccount() opens a Route linked account with the mentor's bank + PAN
 *  2. Student pays (captured) -> createMentorTransfer() moves the net amount to the mentor, ON HOLD
 *  3. Session done / DM answered -> releaseMentorTransfer() lifts the hold, Razorpay settles to mentor's bank
 *  4. Cancelled before that   -> refundBooking() refunds the student and reverses the mentor transfer
 */

// Release automatically this long after a 1:1 session ends, even if the mentor forgets to mark it complete
const SESSION_AUTO_RELEASE_HOURS = 72;

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_PATTERN = /^[0-9]{9,18}$/;
const PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

const toPaise = (inr) => Math.round(Number(inr || 0) * 100);
const toINR = (paise) => Math.round(Number(paise || 0)) / 100;

async function isRouteEnabled() {
  const config = await getPaymentConfig();
  return config.razorpay.isConfigured && process.env.RAZORPAY_ROUTE_ENABLED === 'true';
}

const describeRazorpayError = (err) =>
  err?.error?.description || err?.error?.reason || err?.message || 'Unknown Razorpay error';

/**
 * Returns a list of human readable problems with the mentor's payout KYC (empty = ready for Route)
 */
function getPayoutKycProblems(mentor) {
  const bank = mentor.defaultPayoutDetails || {};
  const kyc = mentor.kyc || {};
  const address = kyc.address || {};
  const problems = [];

  if (!bank.accountHolderName) problems.push('Bank account holder name');
  if (!ACCOUNT_NUMBER_PATTERN.test(bank.accountNumber || '')) problems.push('Valid bank account number (9-18 digits)');
  if (!IFSC_PATTERN.test((bank.ifscCode || '').toUpperCase())) problems.push('Valid IFSC code');
  if (!PAN_PATTERN.test((kyc.pan || '').toUpperCase())) problems.push('Valid PAN');
  if (!address.street1) problems.push('Address line');
  if (!address.city) problems.push('City');
  if (!address.state) problems.push('State');
  if (!PINCODE_PATTERN.test(address.postalCode || '')) problems.push('6-digit PIN code');
  if ((mentor.phone || '').replace(/\D/g, '').length < 10) problems.push('Phone number');

  return problems;
}

const mapActivationStatus = (status) => {
  switch (status) {
    case 'activated': return 'ACTIVATED';
    case 'needs_clarification': return 'NEEDS_CLARIFICATION';
    case 'under_review': return 'UNDER_REVIEW';
    case 'suspended': return 'SUSPENDED';
    default: return 'CREATED';
  }
};

const settlementPayload = (mentor) => ({
  settlements: {
    account_number: mentor.defaultPayoutDetails.accountNumber,
    ifsc_code: mentor.defaultPayoutDetails.ifscCode.toUpperCase(),
    beneficiary_name: mentor.defaultPayoutDetails.accountHolderName
  },
  tnc_accepted: true
});

/**
 * Create (or finish creating) the mentor's Razorpay Route linked account.
 * Safe to call repeatedly: each step is skipped once its id is stored.
 */
async function ensureLinkedAccount(mentorOrId) {
  const mentor = mentorOrId?._id ? mentorOrId : await UnicoachMentor.findById(mentorOrId);
  if (!mentor) throw new Error('Mentor not found.');

  if (!(await isRouteEnabled())) {
    return { ok: false, skipped: true, reason: 'Razorpay Route is not enabled (RAZORPAY_ROUTE_ENABLED / keys).' };
  }

  const problems = getPayoutKycProblems(mentor);
  if (problems.length > 0) {
    mentor.routeAccount = {
      ...(mentor.routeAccount?.toObject ? mentor.routeAccount.toObject() : mentor.routeAccount),
      lastError: `Missing payout details: ${problems.join(', ')}`,
      updatedAt: new Date()
    };
    await mentor.save();
    return { ok: false, reason: mentor.routeAccount.lastError };
  }

  const instance = await getRazorpayInstance();
  const route = mentor.routeAccount || {};
  const address = mentor.kyc.address;

  try {
    if (!route.accountId) {
      const account = await instance.accounts.create({
        email: mentor.email,
        phone: (mentor.phone || '').replace(/\D/g, '').slice(-10),
        type: 'route',
        reference_id: mentor._id.toString().slice(-20),
        legal_business_name: mentor.defaultPayoutDetails.accountHolderName,
        business_type: 'individual',
        contact_name: mentor.name,
        profile: {
          category: process.env.RAZORPAY_ROUTE_CATEGORY || 'education',
          subcategory: process.env.RAZORPAY_ROUTE_SUBCATEGORY || 'coaching',
          addresses: {
            registered: {
              street1: address.street1,
              street2: address.street2 || address.city,
              city: address.city,
              state: address.state.toUpperCase(),
              postal_code: address.postalCode,
              country: 'IN'
            }
          }
        }
      });
      route.accountId = account.id;
    }

    if (!route.stakeholderId) {
      const stakeholder = await instance.stakeholders.create(route.accountId, {
        name: mentor.defaultPayoutDetails.accountHolderName,
        email: mentor.email,
        kyc: { pan: mentor.kyc.pan.toUpperCase() }
      });
      route.stakeholderId = stakeholder.id;
    }

    if (!route.productId) {
      const product = await instance.products.requestProductConfiguration(route.accountId, {
        product_name: 'route',
        tnc_accepted: true
      });
      route.productId = product.id;
    }

    const product = await instance.products.edit(route.accountId, route.productId, settlementPayload(mentor));

    mentor.routeAccount = {
      accountId: route.accountId,
      stakeholderId: route.stakeholderId,
      productId: route.productId,
      status: mapActivationStatus(product.activation_status),
      lastError: '',
      updatedAt: new Date()
    };
    await mentor.save();
    return { ok: true, status: mentor.routeAccount.status, accountId: route.accountId };
  } catch (err) {
    const message = describeRazorpayError(err);
    console.error(`❌ [RouteService] Linked account setup failed for @${mentor.handle}:`, message);
    mentor.routeAccount = {
      accountId: route.accountId || '',
      stakeholderId: route.stakeholderId || '',
      productId: route.productId || '',
      status: route.accountId ? (route.status || 'CREATED') : 'FAILED',
      lastError: message,
      updatedAt: new Date()
    };
    await mentor.save();
    return { ok: false, reason: message };
  }
}

/**
 * Push updated bank details to an existing linked account (mentor edited their bank).
 */
async function syncSettlementBank(mentor) {
  if (!(await isRouteEnabled())) return { ok: false, skipped: true };
  if (!mentor.routeAccount?.accountId || !mentor.routeAccount?.productId) {
    return ensureLinkedAccount(mentor);
  }
  try {
    const instance = await getRazorpayInstance();
    const product = await instance.products.edit(
      mentor.routeAccount.accountId,
      mentor.routeAccount.productId,
      settlementPayload(mentor)
    );
    mentor.routeAccount.status = mapActivationStatus(product.activation_status);
    mentor.routeAccount.lastError = '';
    mentor.routeAccount.updatedAt = new Date();
    await mentor.save();
    return { ok: true, status: mentor.routeAccount.status };
  } catch (err) {
    mentor.routeAccount.lastError = describeRazorpayError(err);
    mentor.routeAccount.updatedAt = new Date();
    await mentor.save();
    return { ok: false, reason: mentor.routeAccount.lastError };
  }
}

/**
 * Refresh activation status of the linked account from Razorpay.
 */
async function refreshLinkedAccountStatus(mentor) {
  if (!(await isRouteEnabled()) || !mentor.routeAccount?.accountId || !mentor.routeAccount?.productId) {
    return { ok: false, skipped: true, status: mentor.routeAccount?.status || 'NOT_STARTED' };
  }
  try {
    const instance = await getRazorpayInstance();
    const product = await instance.products.fetch(mentor.routeAccount.accountId, mentor.routeAccount.productId);
    mentor.routeAccount.status = mapActivationStatus(product.activation_status);
    mentor.routeAccount.lastError = '';
    mentor.routeAccount.updatedAt = new Date();
    await mentor.save();
    return { ok: true, status: mentor.routeAccount.status };
  } catch (err) {
    return { ok: false, reason: describeRazorpayError(err), status: mentor.routeAccount.status };
  }
}

/**
 * How long the mentor's share stays on hold for this booking (null = no automatic release).
 */
function computeHoldUntil(booking, serviceType) {
  if (serviceType === 'DIGITAL_ASSET') return { onHold: false, until: null };
  if (booking.endUtc || booking.startUtc) {
    const base = new Date(booking.endUtc || booking.startUtc).getTime();
    return { onHold: true, until: new Date(base + SESSION_AUTO_RELEASE_HOURS * 3600 * 1000) };
  }
  // Priority DM / SOP review: held until the mentor delivers the answer
  return { onHold: true, until: null };
}

/**
 * Split a captured payment: transfer (amount - fee - GST) to the mentor's linked account.
 * Idempotent: an atomic status claim makes sure only one caller creates the transfer.
 */
async function createMentorTransfer(bookingId, paymentEntity = null, { force = false } = {}) {
  if (force) {
    // Admin retry: clear a stale in-progress marker left by a crashed attempt
    await UnicoachBooking.updateOne(
      { _id: bookingId, 'settlement.transferId': { $in: ['', null] }, 'settlement.lastError': 'CREATING' },
      { $set: { 'settlement.lastError': '' } }
    );
  }
  const booking = await UnicoachBooking.findById(bookingId).populate('mentorId').populate('serviceId');
  if (!booking) return { ok: false, reason: 'Booking not found.' };
  if (!booking.payment?.paymentId || booking.amountPaid <= 0) return { ok: false, reason: 'Nothing to transfer.' };
  if (booking.settlement?.transferId) return { ok: true, alreadyDone: true };
  if (['REFUNDED', 'CANCELLED'].includes(booking.state)) return { ok: false, reason: 'Booking was cancelled.' };

  const routeOn = await isRouteEnabled();
  const instance = await getRazorpayInstance();

  // Payment entity gives us the exact fee & GST Razorpay deducted
  let payment = paymentEntity;
  if (!payment && instance && !booking.payment.paymentId.includes('_sim_')) {
    try {
      payment = await instance.payments.fetch(booking.payment.paymentId);
    } catch (err) {
      console.warn('[RouteService] Could not fetch payment for fee breakdown:', describeRazorpayError(err));
    }
  }

  const grossPaise = toPaise(booking.amountPaid);
  const feePaise = payment?.fee != null ? Number(payment.fee) : null; // fee is inclusive of GST
  const taxPaise = payment?.tax != null ? Number(payment.tax) : 0;

  const breakdown = {
    'settlement.grossINR': booking.amountPaid,
    'settlement.gatewayFeeINR': feePaise != null ? toINR(feePaise - taxPaise) : 0,
    'settlement.gatewayTaxINR': feePaise != null ? toINR(taxPaise) : 0,
    'settlement.mentorNetINR': feePaise != null ? toINR(grossPaise - feePaise) : 0
  };

  const markStatus = async (status, lastError = '') => {
    await UnicoachBooking.updateOne(
      { _id: booking._id, 'settlement.transferId': { $in: ['', null] } },
      { $set: { ...breakdown, 'settlement.status': status, 'settlement.lastError': lastError, mentorEarning: breakdown['settlement.mentorNetINR'] } }
    );
    return { ok: false, status, reason: lastError };
  };

  if (!routeOn) return markStatus('ROUTE_DISABLED', 'Razorpay Route is not enabled yet.');
  if (feePaise == null || (payment && payment.status !== 'captured')) {
    return markStatus('PENDING_CAPTURE', 'Waiting for Razorpay to capture the payment.');
  }

  const mentor = booking.mentorId;
  if (!mentor?.routeAccount?.accountId || mentor.routeAccount.status !== 'ACTIVATED') {
    return markStatus('PENDING_ACCOUNT', `Mentor payout account is ${mentor?.routeAccount?.status || 'NOT_STARTED'}.`);
  }

  const netPaise = grossPaise - feePaise;
  if (netPaise <= 0) return markStatus('FAILED', 'Net amount after Razorpay fee is zero.');

  // Atomic claim so a parallel webhook + verify call can't create two transfers
  const claimed = await UnicoachBooking.findOneAndUpdate(
    {
      _id: booking._id,
      'settlement.transferId': { $in: ['', null] },
      'settlement.status': { $nin: ['ON_HOLD', 'RELEASED', 'REVERSED'] },
      'settlement.lastError': { $ne: 'CREATING' }
    },
    { $set: { 'settlement.lastError': 'CREATING' } },
    { new: true }
  );
  if (!claimed) return { ok: true, alreadyInProgress: true };

  const { onHold, until } = computeHoldUntil(booking, booking.serviceId?.type);

  try {
    const result = await instance.payments.transfer(booking.payment.paymentId, {
      transfers: [{
        account: mentor.routeAccount.accountId,
        amount: netPaise,
        currency: 'INR',
        notes: { bookingRef: booking.bookingRef, mentorHandle: mentor.handle },
        linked_account_notes: ['bookingRef'],
        on_hold: onHold,
        ...(onHold && until ? { on_hold_until: Math.floor(until.getTime() / 1000) } : {})
      }]
    });
    const transfer = result?.items?.[0] || result;

    await UnicoachBooking.updateOne({ _id: booking._id }, {
      $set: {
        ...breakdown,
        mentorEarning: breakdown['settlement.mentorNetINR'],
        'settlement.status': onHold ? 'ON_HOLD' : 'RELEASED',
        'settlement.linkedAccountId': mentor.routeAccount.accountId,
        'settlement.transferId': transfer.id,
        'settlement.onHoldUntil': onHold ? until : null,
        'settlement.releasedAt': onHold ? null : new Date(),
        'settlement.lastError': ''
      }
    });

    await UnicoachLedger.create([
      {
        bookingId: booking._id, mentorId: mentor._id, type: 'DEBIT', account: 'ESCROW',
        amount: booking.amountPaid, currency: 'INR',
        description: `Split of ${booking.bookingRef} via Razorpay Route`
      },
      {
        bookingId: booking._id, mentorId: mentor._id, type: 'CREDIT', account: 'GATEWAY_FEE',
        amount: toINR(feePaise), currency: 'INR',
        description: `Razorpay fee ₹${breakdown['settlement.gatewayFeeINR']} + GST ₹${breakdown['settlement.gatewayTaxINR']} for ${booking.bookingRef}`
      },
      {
        bookingId: booking._id, mentorId: mentor._id, type: 'CREDIT', account: 'MENTOR_TRANSFER',
        amount: toINR(netPaise), currency: 'INR',
        description: `Transferred to @${mentor.handle} linked account ${mentor.routeAccount.accountId} (${transfer.id})`
      }
    ]);

    console.log(`✅ [RouteService] Transfer ${transfer.id}: ₹${toINR(netPaise)} → @${mentor.handle} (${onHold ? 'on hold' : 'released'})`);
    return { ok: true, transferId: transfer.id, onHold };
  } catch (err) {
    const message = describeRazorpayError(err);
    console.error(`❌ [RouteService] Transfer failed for ${booking.bookingRef}:`, message);
    await UnicoachBooking.updateOne({ _id: booking._id }, {
      $set: { ...breakdown, 'settlement.status': 'FAILED', 'settlement.lastError': message }
    });
    return { ok: false, reason: message };
  }
}

/**
 * Lift the hold so Razorpay settles the mentor's share to their bank.
 */
async function releaseMentorTransfer(bookingId) {
  const booking = await UnicoachBooking.findById(bookingId);
  if (!booking) return { ok: false, reason: 'Booking not found.' };
  if (booking.settlement?.status !== 'ON_HOLD' || !booking.settlement?.transferId) {
    return { ok: false, skipped: true, status: booking.settlement?.status };
  }

  try {
    const instance = await getRazorpayInstance();
    await instance.transfers.edit(booking.settlement.transferId, { on_hold: false });
    booking.settlement.status = 'RELEASED';
    booking.settlement.releasedAt = new Date();
    booking.settlement.lastError = '';
    await booking.save();
    return { ok: true };
  } catch (err) {
    booking.settlement.lastError = describeRazorpayError(err);
    await booking.save();
    return { ok: false, reason: booking.settlement.lastError };
  }
}

/**
 * Refund the student in full. With Route, reverse_all pulls the mentor's (held) transfer back too.
 */
async function refundBooking(bookingId, reason = 'Cancelled') {
  const booking = await UnicoachBooking.findById(bookingId);
  if (!booking) return { ok: false, reason: 'Booking not found.' };
  if (booking.refund?.refundId) return { ok: true, alreadyDone: true };
  if (booking.amountPaid <= 0 || !booking.payment?.paymentId || booking.payment.paymentId.includes('_sim_')
      || booking.payment.paymentId.startsWith('free_')) {
    return { ok: true, nothingToRefund: true };
  }
  if (booking.settlement?.status === 'RELEASED') {
    return { ok: false, reason: 'Mentor payout was already released; refund must be handled manually from the Razorpay dashboard.' };
  }

  try {
    const instance = await getRazorpayInstance();
    if (!instance) return { ok: false, reason: 'Razorpay is not configured.' };
    const refund = await instance.payments.refund(booking.payment.paymentId, {
      amount: toPaise(booking.amountPaid),
      reverse_all: 1,
      notes: { bookingRef: booking.bookingRef, reason: String(reason).slice(0, 250) }
    });
    booking.refund = { refundId: refund.id, amountINR: toINR(refund.amount), status: refund.status || 'pending' };
    booking.refundedAt = new Date();
    if (booking.settlement?.transferId) booking.settlement.status = 'REVERSED';
    await booking.save();
    return { ok: true, refundId: refund.id };
  } catch (err) {
    return { ok: false, reason: describeRazorpayError(err) };
  }
}

module.exports = {
  PAN_PATTERN,
  IFSC_PATTERN,
  ACCOUNT_NUMBER_PATTERN,
  PINCODE_PATTERN,
  isRouteEnabled,
  getPayoutKycProblems,
  ensureLinkedAccount,
  syncSettlementBank,
  refreshLinkedAccountStatus,
  createMentorTransfer,
  releaseMentorTransfer,
  refundBooking
};
