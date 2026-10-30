// Made-up demo mentor for the mentor-dashboard tutorial. Not a real person or account.
// Shapes follow GET /api/unicoach/mentors/:handle/dashboard (backend/unicoach/controllers/mentorController.js).
const day = (d, h = 18, m = 0) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  t.setHours(h, m, 0, 0);
  return t.toISOString();
};
const plus = (iso, min) => new Date(new Date(iso).getTime() + min * 60000).toISOString();

export const USER = {
  _id: 'demo-ananya', id: 'demo-ananya', name: 'Ananya Rao', email: 'ananya.demo@example.com',
  role: 'mentor', isMentor: true, mentorHandle: 'ananya-demo',
};

const services = [
  { _id: 'svc1', mentorId: 'm1', type: 'ONE_ON_ONE', title: '1:1 call: Masters in Ireland', description: 'Courses, costs, part-time work and life in Dublin.', durationMinutes: 30, priceInINR: 499, isActive: true, customQuestions: [] },
  { _id: 'svc2', mentorId: 'm1', type: 'PRIORITY_DM', title: 'Priority DM', description: 'Ask anything, get a detailed reply within 48 hours.', durationMinutes: 0, priceInINR: 199, maxDeliveryHours: 48, isActive: true, customQuestions: [] },
  { _id: 'svc3', mentorId: 'm1', type: 'SOP_REVIEW', title: 'SOP review', description: 'Line-by-line feedback on your Statement of Purpose.', durationMinutes: 0, priceInINR: 799, maxDeliveryHours: 72, isActive: true, customQuestions: [] },
];
const svc = (i) => ({ _id: services[i]._id, title: services[i].title, durationMinutes: services[i].durationMinutes, priceInINR: services[i].priceInINR, type: services[i].type, description: services[i].description, maxDeliveryHours: services[i].maxDeliveryHours });

const booking = (ref, name, i, start, state = 'CONFIRMED', extra = {}) => ({
  _id: `b-${ref}`, bookingRef: ref, mentorId: 'm1', serviceId: svc(i), studentName: name,
  studentEmail: `${name.split(' ')[0].toLowerCase()}.demo@example.com`, state,
  startUtc: start, endUtc: start ? plus(start, services[i].durationMinutes || 30) : null,
  amountPaid: services[i].priceInINR, createdAt: day(-3), meetingLink: start ? 'https://meet.example.com/demo' : '',
  ...extra,
});

const scheduledCalls = [
  booking('UC-4821', 'Rohan Mehta', 0, day(1, 18)),
  booking('UC-4835', 'Sneha Iyer', 0, day(2, 20)),
  booking('UC-4840', 'Karan Gill', 0, day(4, 13)),
];
const pendingRequests = [
  booking('UC-4829', 'Priya Nair', 1, null, 'CONFIRMED', { priorityDm: { status: 'PENDING', question: 'Is a 7.4 CGPA enough for Trinity MSc Business Analytics?', dueAt: day(1, 22) } }),
  booking('UC-4833', 'Aditya Rao', 2, null, 'CONFIRMED', { priorityDm: { status: 'PENDING' } }),
];
const pastBookings = [
  booking('UC-4790', 'Meera Shah', 0, day(-2, 18), 'COMPLETED'),
  booking('UC-4781', 'Vikram Joshi', 1, null, 'COMPLETED'),
  booking('UC-4766', 'Tanvi Kulkarni', 0, day(-6, 20), 'COMPLETED'),
  booking('UC-4752', 'Arjun Das', 2, null, 'COMPLETED'),
];
const earnings = [...pastBookings, ...scheduledCalls, ...pendingRequests].map((b, k) => {
  const gross = b.amountPaid;
  const fee = Math.round(gross * 0.02 * 100) / 100;
  const net = Math.round((gross - fee * 1.18) * 100) / 100;
  const done = b.state === 'COMPLETED';
  return {
    bookingRef: b.bookingRef, serviceTitle: b.serviceId.title, serviceType: b.serviceId.type, studentName: b.studentName,
    state: b.state, paidAt: day(-8 + k), startUtc: b.startUtc, grossINR: gross, gatewayFeeINR: fee, gatewayTaxINR: Math.round(fee * 0.18 * 100) / 100,
    mentorNetINR: net, settlementStatus: done ? 'RELEASED' : 'ON_HOLD', onHoldUntil: done ? null : day(3), releasedAt: done ? day(-1) : null,
    refundStatus: '', payoutState: done ? 'READY' : 'UPCOMING', payoutNetINR: net, payoutRef: '', payoutPaidAt: null,
  };
});
const sum = (f) => Math.round(earnings.reduce((a, e) => a + f(e), 0) * 100) / 100;
const earningsSummary = {
  grossINR: sum((e) => e.grossINR), gatewayFeeINR: sum((e) => e.gatewayFeeINR), gatewayTaxINR: sum((e) => e.gatewayTaxINR),
  releasedToBankINR: sum((e) => (e.settlementStatus === 'RELEASED' ? e.mentorNetINR : 0)),
  onHoldINR: sum((e) => (e.settlementStatus === 'ON_HOLD' ? e.mentorNetINR : 0)), pendingSetupINR: 0, refundedINR: 0,
};
const upcomingSlots = [1, 2, 3, 4, 5, 6].flatMap((d) => [13, 18, 20].map((h) => ({
  _id: `s-${d}-${h}`, mentorId: 'm1', startUtc: day(d, h), endUtc: day(d, h, 30), status: 'AVAILABLE', serviceId: { _id: 'svc1', title: services[0].title, type: 'ONE_ON_ONE' },
})));

export const DASHBOARD = {
  mentor: {
    _id: 'm1', name: 'Ananya Rao', handle: 'ananya-demo', email: 'ananya.demo@example.com',
    headline: 'MSc Business Analytics @ Trinity College Dublin', bio: 'Moved from Pune to Dublin in 2024. Ask me about courses, costs, part-time jobs and settling in.',
    avatarUrl: '', coverImageUrl: '', country: 'Ireland', university: 'Trinity College Dublin', course: 'MSc Business Analytics',
    ianaTimezone: 'Asia/Kolkata', bufferMinutes: 10, noticePeriodHours: 2, isActive: true, status: 'APPROVED', applicationStatus: 'APPROVED',
    defaultPayoutDetails: { accountNumber: '50100012344821', ifscCode: 'HDFC0000123', accountHolderName: 'Ananya Rao' },
    socialLinks: { linkedin: 'https://www.linkedin.com/in/example', instagram: '' }, rating: 4.9, reviewsCount: 18,
  },
  services, earnings, earningsSummary,
  weeklyPayouts: { readyINR: sum((e) => (e.payoutState === 'READY' ? e.payoutNetINR : 0)), upcomingINR: sum((e) => (e.payoutState === 'UPCOMING' ? e.payoutNetINR : 0)), paidOutINR: 4210, nextPayoutDate: day(4, 10), request: null },
  payoutAccount: { routeEnabled: true, status: 'ACTIVE', lastError: '', missingDetails: [], bankLast4: '4821', ifscCode: 'HDFC0000123' },
  upcomingBookings: [...scheduledCalls, ...pendingRequests], pastBookings, nextSession: scheduledCalls[0], scheduledCalls, pendingRequests, upcomingSlots,
  stats: {
    totalBookingsCount: scheduledCalls.length + pendingRequests.length + pastBookings.length, upcomingCount: scheduledCalls.length,
    pendingRequestsCount: pendingRequests.length, completedCount: pastBookings.length, totalGrossRevenueINR: earningsSummary.grossINR,
    creatorWalletAvailableINR: earningsSummary.releasedToBankINR, inEscrowHeldINR: earningsSummary.onHoldINR, activeSlotsCount: upcomingSlots.length, unreadNotificationsCount: 2,
  },
};

// Every other mentor API gets a harmless empty answer of the right kind
export const mockMentorApi = (url, method) => {
  if (/\/auth\/me/.test(url)) return { success: true, user: USER };
  if (/\/unicoach\/mentors\/me\b/.test(url)) return { hasProfile: true, mentor: DASHBOARD.mentor };
  if (/\/dashboard(\?|$)/.test(url)) return DASHBOARD;
  if (/notifications/.test(url)) return { notifications: [], unreadCount: 2 };
  if (/payouts/.test(url)) return { payouts: [], summary: DASHBOARD.weeklyPayouts };
  if (/coupons/.test(url)) return { coupons: [] };
  if (/priority-dms|priorityDms|priority_dms/i.test(url)) return { dms: DASHBOARD.pendingRequests, bookings: DASHBOARD.pendingRequests };
  if (/referrals/.test(url)) return { referrals: [], stats: { total: 0 } };
  if (/reviews/.test(url)) return { reviews: [] };
  if (/slots/.test(url)) return method === 'GET' ? { slots: DASHBOARD.upcomingSlots } : { success: true, slots: [] };
  return { success: true, data: [] };
};
