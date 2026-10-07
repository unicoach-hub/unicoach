import { API_BASE_URL } from '../../config';

const UNICOACH_BASE_URL = `${API_BASE_URL}/unicoach`;

/**
 * Helper to generate unique Idempotency Keys (Pillar #3)
 */
const generateIdempotencyKey = (prefix = 'idemp') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Fetch Public Mentor Profile & Offerings
 */
export const getMentorProfile = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch mentor profile' }));
    throw new Error(error.error || 'Mentor not found');
  }
  return await res.json();
};

/**
 * Fetch Available Slots for Mentor
 */
export const getAvailableSlots = async (handle, fromDate = null, toDate = null, serviceId = null) => {
  const clean = handle.replace(/^@/, '').trim();
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (serviceId && serviceId !== 'ALL') params.append('serviceId', serviceId);

  const url = `${UNICOACH_BASE_URL}/@${clean}/slots?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch available slots' }));
    throw new Error(error.error || 'Failed to fetch slots');
  }
  return await res.json();
};

/**
 * Phase 1: Reserve Slot (10-minute hold with atomic Redis lock)
 */
export const reserveSlot = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const idempotencyKey = generateIdempotencyKey('resv');

  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/reserve-slot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'This slot is no longer available. Please choose another slot.');
  }
  return data;
};

/**
 * Phase 2: Confirm Booking & Capture Payment
 */
export const confirmBooking = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const idempotencyKey = generateIdempotencyKey('conf');

  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/confirm-booking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to confirm booking.');
  }
  return data;
};

/**
 * Phase 2A: Create Payment Order with Gateway (Razorpay / PayPal)
 */
export const createPaymentOrder = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/create-payment-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create payment order');
  return data;
};

/**
 * Phase 2B: Cryptographically Verify Payment and Confirm Booking
 */
export const verifyPayment = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const idempotencyKey = generateIdempotencyKey('vpay');
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Payment verification failed'), { status: res.status });
  return data;
};

/**
 * Early release of reservation lock
 */
export const cancelReservation = async (payload) => {
  try {
    const res = await fetch(`${UNICOACH_BASE_URL}/cancel-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('Failed to cancel reservation cleanly:', err);
  }
};

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return headers;
};

/**
 * ── Creator Dashboard APIs (100% In-House, Zero 3rd Party) ──
 */

export const getMyMentorProfile = async () => {
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/me`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.message || err.error || 'Please log in to your account.');
  }
  return await res.json();
};

export const getMentorDashboard = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/dashboard`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch dashboard' }));
    throw new Error(err.message || err.error || 'Failed to fetch dashboard data');
  }
  return await res.json();
};

export const updateMentorProfile = async (payload) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
};

export const createMentorService = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/services`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create service');
  return data;
};

export const updateMentorService = async (handle, serviceId, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/services/${serviceId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update service');
  return data;
};

export const deleteMentorService = async (handle, serviceId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/services/${serviceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete service');
  return data;
};

export const publishMentorSlots = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/publish-slots`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to publish slots');
  return data;
};

export const deleteMentorSlot = async (handle, slotId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/slots/${slotId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete slot');
  return data;
};

export const createMentorSingleSlot = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/single-slot`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create slot');
  return data;
};

export const copyMentorSlots = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/copy-slots`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to copy slots');
  return data;
};

export const toggleMentorSlotStatus = async (handle, slotId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/slots/${slotId}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update slot status');
  return data;
};

export const deleteMentorSlotsByDate = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/slots-by-date`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to clear slots');
  return data;
};

export const updateBookingStatus = async (handle, bookingId, status) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update booking status');
  return data;
};

export const sendBookingInviteEmail = async (handle, bookingId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/bookings/${bookingId}/send-invite-email`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to dispatch invite email');
  return data;
};

export const updateBookingMeetingLink = async (handle, bookingId, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/bookings/${bookingId}/meeting-link`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update meeting link');
  return data;
};

/**
 * ── Promo Codes / Coupons APIs ──
 */

export const validateCoupon = async (handle, code, serviceId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/validate-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, serviceId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Invalid promo code');
  return data;
};

export const createMentorCoupon = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/coupons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create promo code');
  return data;
};

export const getMentorCoupons = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/coupons`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch coupons');
  return await res.json();
};

export const deleteMentorCoupon = async (handle, couponId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/coupons/${couponId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete coupon');
  return data;
};

/**
 * ── Verified Reviews APIs ──
 */

export const submitReview = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit review');
  return data;
};

export const getMentorReviews = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/reviews`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return await res.json();
};

/**
 * ── Digital Products & Priority DM APIs ──
 */

export const purchaseDirectService = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const idempotencyKey = generateIdempotencyKey('dir');

  const res = await fetch(`${UNICOACH_BASE_URL}/@${clean}/purchase-direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete direct purchase.');
  return data;
};

export const getStudentQueryStatus = async (bookingRef) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/queries/${bookingRef}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to retrieve query details.');
  }
  return await res.json();
};

export const uploadResourceFile = async (handle, fileFormData) => {
  const clean = handle.replace(/^@/, '').trim();
  const headers = {};
  try {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {}

  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/upload-resource`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: fileFormData // multipart/form-data
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload resource.');
  return data;
};

export const uploadMentorPhoto = async (handle, file, type = 'avatar') => {
  const clean = handle.replace(/^@/, '').trim();
  const headers = {};
  try {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {}

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('type', type);

  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/upload-photo`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image.');
  return data;
};

export const getMentorPriorityDMs = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/priority-dms`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch Priority DMs');
  return await res.json();
};

export const answerPriorityDM = async (handle, bookingId, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/priority-dms/${bookingId}/answer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit answer.');
  return data;
};

/**
 * Course-page booking: real 1:1 session options & prices for a mentor (from the DB)
 * → { bookable, mentorName, mentorHandle, sessions: [{ serviceId, title, description, durationMinutes, priceInINR }] }
 */
export const getCourseMentorSessions = async (handle) => {
  const clean = String(handle || '').replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/course-mentor/${encodeURIComponent(clean)}/sessions`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load mentor sessions.');
  return data;
};

/**
 * Course-page booking: creates a PAYMENT_PENDING booking and a Razorpay order.
 * payload: { mentorHandle, durationMinutes, selectedDate (YYYY-MM-DD), selectedTime ("06:00 PM"),
 *            studentName, studentEmail, studentPhone, studentNotes, courseName, universityName }
 * → { status: 'PAYMENT_PENDING', bookingRef, amount, payment: { orderId, amount, currency, keyId, simulated, prefill } }
 *   or { status: 'CONFIRMED', free: true, booking } for a free session
 */
export const bookCourseMentor = async (payload) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/book-course-mentor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': generateIdempotencyKey('cmb')
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Failed to start booking.'), { code: data.code });
  return data;
};

/**
 * Verify a Razorpay payment by booking reference only (no mentor handle needed).
 * payload: { bookingRef, razorpay_order_id?, razorpay_payment_id?, razorpay_signature? }
 * → { status, booking: { bookingRef, studentName, studentEmail, mentorName, mentorEmail, serviceTitle, startUtc, endUtc, meetingUrl, amountPaid }, directResult? }
 */
export const verifyPaymentByRef = async (payload) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': generateIdempotencyKey('vref')
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Payment verification failed'), { status: res.status });
  return data;
};

/**
 * Fetch Creator Payout History & Saved Details
 */
export const getCreatorPayouts = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/payouts`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch payouts history.');
  return await res.json();
};

/**
 * Configure / Update Creator Default Payout Bank Details
 */
export const updateMentorPayoutDetails = async (handle, payload) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/payout-details`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update bank payout details.');
  return data;
};

/**
 * Admin: Fetch All Payout Requests
 */
export const getAdminPayouts = async () => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE_URL}/admin/unicoach/payouts`, { headers });
  if (!res.ok) throw new Error('Failed to fetch admin payouts.');
  return await res.json();
};

/**
 * Admin: Process Payout Request (Approve / Reject)
 */
export const processAdminPayout = async (payoutId, payload) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(`${API_BASE_URL}/admin/unicoach/payouts/${payoutId}/process`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to process payout.');
  return data;
};

/**
 * ── Public Marketplace Directory (Only Verified Mentors) ──
 */
export const getPublicMentorsDirectory = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.country && filters.country !== 'ALL') params.append('country', filters.country);
  if (filters.serviceType && filters.serviceType !== 'ALL') params.append('serviceType', filters.serviceType);
  if (filters.page) params.append('page', filters.page);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${UNICOACH_BASE_URL}/directory${queryString}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch directory' }));
    throw new Error(err.error || 'Failed to fetch mentors directory');
  }
  return await res.json();
};

/**
 * ── Mentor Application / Onboarding ──
 */
export const submitMentorApplication = async (payload) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit application');
  return data;
};

/**
 * ── Upload Verification Document / Student ID ──
 */
export const uploadMentorVerificationDoc = async (formData) => {
  const res = await fetch(`${UNICOACH_BASE_URL}/upload-verification-doc`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload verification document');
  return data;
};

/**
 * ── Mentor Announcements & Notifications ──
 */
export const getMentorNotifications = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/notifications`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to fetch notifications' }));
    throw new Error(err.error || 'Failed to fetch notifications');
  }
  return await res.json();
};

export const markMentorNotificationRead = async (handle, notificationId) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to mark notification as read' }));
    throw new Error(err.error || 'Failed to mark notification as read');
  }
  return await res.json();
};

export const markAllMentorNotificationsRead = async (handle) => {
  const clean = handle.replace(/^@/, '').trim();
  const res = await fetch(`${UNICOACH_BASE_URL}/mentors/${clean}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to mark all as read' }));
    throw new Error(err.error || 'Failed to mark all as read');
  }
  return await res.json();
};


