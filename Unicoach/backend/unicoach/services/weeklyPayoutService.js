const UnicoachBooking = require('../models/UnicoachBooking');

/**
 * Weekly mentor payouts (every Monday) while Razorpay Route is off.
 * UniCoach keeps 0% commission: the mentor gets what the student paid minus Razorpay's fee + GST.
 *
 * A paid booking is READY for the next payout once the work is done and the complaint window is over:
 *  - 1:1 call: 48 hours after the session ends
 *  - Priority DM / SOP review: 48 hours after it is marked completed (answered / delivered)
 *  - Digital product: straight away
 * Until then it is UPCOMING. Refunded / cancelled bookings never count. Bookings already paid out
 * (or handled by Route) are skipped.
 */
const COMPLAINT_WINDOW_HOURS = 48;
const RAZORPAY_FEE_ESTIMATE = 0.0236; // 2% + 18% GST, used only if the real fee isn't known yet
const PAYOUT_WEEKDAY = 1; // Monday

const ROUTE_HANDLED = ['ON_HOLD', 'RELEASED', 'REVERSED'];
const NOT_PAYABLE_STATES = ['CREATED', 'PAYMENT_PENDING', 'CANCELLED', 'REFUNDED'];

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

function netOf(b) {
  const net = Number(b.settlement?.mentorNetINR) || 0;
  if (net > 0) return { amount: round2(net), estimated: false };
  return { amount: round2(Number(b.amountPaid || 0) * (1 - RAZORPAY_FEE_ESTIMATE)), estimated: true };
}

function payoutState(b, now = new Date()) {
  if (!(Number(b.amountPaid) > 0) || !b.payment?.paymentId) return 'NONE';
  if (NOT_PAYABLE_STATES.includes(b.state)) return 'NONE';
  if (ROUTE_HANDLED.includes(b.settlement?.status)) return 'NONE';
  if (b.weeklyPayout?.payoutId) return 'PAID';
  const type = b.serviceId?.type;
  if (type === 'DIGITAL_ASSET') return 'READY';
  const windowMs = COMPLAINT_WINDOW_HOURS * 3600 * 1000;
  const end = b.endUtc || b.startUtc;
  if (end) return now - new Date(end) >= windowMs ? 'READY' : 'UPCOMING';
  // Priority DM / SOP review: ready 48h after the mentor completed it
  if (b.state === 'COMPLETED') return now - new Date(b.updatedAt || b.createdAt) >= windowMs ? 'READY' : 'UPCOMING';
  return 'UPCOMING';
}

function nextPayoutDate(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const add = (PAYOUT_WEEKDAY - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + add);
  return d;
}

/** Paid bookings for one mentor (or all), each tagged with payoutState and net amount */
async function payableBookings(match = {}) {
  const rows = await UnicoachBooking.find({ ...match, amountPaid: { $gt: 0 }, 'payment.paymentId': { $nin: ['', null] } })
    .select('bookingRef mentorId serviceId studentName state startUtc endUtc amountPaid payment.paymentId settlement weeklyPayout createdAt updatedAt')
    .populate('serviceId', 'title type')
    .sort({ startUtc: 1, createdAt: 1 })
    .limit(5000)
    .lean();
  const now = new Date();
  return rows
    .map((b) => ({ ...b, payoutState: payoutState(b, now), net: netOf(b) }))
    .filter((b) => b.payoutState !== 'NONE');
}

module.exports = { payableBookings, payoutState, netOf, nextPayoutDate, COMPLAINT_WINDOW_HOURS };
