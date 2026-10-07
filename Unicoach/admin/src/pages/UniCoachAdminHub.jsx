import React, { useState, useEffect } from 'react';
import {
  Table, Switch, Modal, Input, Button, Tabs,
  message, Tooltip, Badge, Popconfirm, Card, Segmented, Dropdown,
  Select, Radio
} from 'antd';
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  TrophyOutlined,
  LockOutlined,
  VideoCameraOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  WalletOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  DownloadOutlined,
  CopyOutlined,
  LinkedinOutlined,
  FilePdfOutlined,
  LinkOutlined,
  DeleteOutlined,
  MoreOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  BankOutlined,
  NotificationOutlined,
  SendOutlined,
  BellOutlined,
  AlertOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';
import { getFrontendUrl } from '../config';

// --- Razorpay Route helpers ---------------------------------------------------

// Normalises API errors, with friendly copy for auth failures (all /admin/unicoach/* routes require admin auth).
const apiErrorMessage = (err, fallback) => {
  const status = err?.response?.status;
  if (status === 401) return 'Your admin session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action (admin access required).';
  return err?.response?.data?.message || err?.response?.data?.error || fallback;
};

const formatINR = (v) => `₹${(Number(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

// Never render a full account number / PAN in tables.
const maskAccountNumber = (acc) => {
  const s = String(acc || '').replace(/\s/g, '');
  if (!s) return '';
  return `••••${s.slice(-4)}`;
};

const maskPan = (pan) => {
  const s = String(pan || '').trim().toUpperCase();
  if (!s) return '';
  if (s.length <= 3) return '•'.repeat(s.length);
  return `${s.slice(0, 2)}${'•'.repeat(s.length - 3)}${s.slice(-1)}`;
};

// `tone` picks the nx-status pill variant: success | warning | danger | neutral
const ROUTE_ACCOUNT_STYLES = {
  ACTIVATED: { tone: 'success', label: 'Activated' },
  CREATED: { tone: 'warning', label: 'Created' },
  UNDER_REVIEW: { tone: 'warning', label: 'Under review' },
  NOT_STARTED: { tone: 'warning', label: 'Not started' },
  NEEDS_CLARIFICATION: { tone: 'danger', label: 'Needs clarification' },
  FAILED: { tone: 'danger', label: 'Failed' },
  SUSPENDED: { tone: 'danger', label: 'Suspended' }
};

const SETTLEMENT_STYLES = {
  NOT_APPLICABLE: { tone: 'neutral', label: 'Not applicable' },
  PENDING_CAPTURE: { tone: 'warning', label: 'Awaiting payment capture' },
  PENDING_ACCOUNT: { tone: 'warning', label: 'Waiting for mentor payout account' },
  ROUTE_DISABLED: { tone: 'neutral', label: 'Route disabled' },
  ON_HOLD: { tone: 'warning', label: 'Held until session completes' },
  RELEASED: { tone: 'success', label: 'Paid to mentor' },
  REVERSED: { tone: 'neutral', label: 'Reversed (refunded)' },
  FAILED: { tone: 'danger', label: 'Transfer failed' }
};

// Shared presentation bits (design-system tokens)
const INK = 'var(--ux-ink)';
const TEXT = 'var(--ux-text)';
const TEXT_2 = 'var(--ux-text-2)';
const TEXT_3 = 'var(--ux-text-3)';
const DANGER = '#dc2626';
const WARNING = '#b45309';
const FIELD_LABEL_STYLE = { display: 'block', fontSize: 12.5, fontWeight: 600, color: TEXT_2, marginBottom: 6 };
const INNER_BLOCK_STYLE = { background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', borderRadius: 16 };
const TOOLBAR_STYLE = { justifyContent: 'space-between', background: 'var(--ux-surface-2)', borderRadius: 18 };
const KPI_LABEL_STYLE = { fontSize: 13, fontWeight: 500, color: TEXT_2 };
const KPI_VALUE_STYLE = { fontSize: 30, fontWeight: 700, color: INK, letterSpacing: '-0.04em', lineHeight: 1 };
const KPI_UNIT_STYLE = { fontSize: 13, fontWeight: 500, color: TEXT_2, letterSpacing: 0, marginLeft: 8 };
const KPI_META_STYLE = { marginTop: 10, fontSize: 12.5, color: TEXT_2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' };
const SMALL_PILL_STYLE = { height: 20, fontSize: 11, width: 'fit-content' };

const RETRYABLE_SETTLEMENT_STATUSES = ['PENDING_ACCOUNT', 'FAILED', 'ROUTE_DISABLED', 'PENDING_CAPTURE'];
const REFUNDABLE_BOOKING_STATES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const UniCoachAdminHub = () => {
  const [activeTab, setActiveTab] = useState('mentors');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);

  // Mentors Data & Verification Controls
  const [mentors, setMentors] = useState([]);
  const [mentorSearch, setMentorSearch] = useState('');
  const [mentorStatusFilter, setMentorStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [selectedMentorForServices, setSelectedMentorForServices] = useState(null);
  const [selectedProofMentor, setSelectedProofMentor] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectMentor, setSelectedRejectMentor] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Bookings Data
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBookingForAnswers, setSelectedBookingForAnswers] = useState(null);
  const [selectedBookingForDm, setSelectedBookingForDm] = useState(null);
  const [bookingActionBusyId, setBookingActionBusyId] = useState(null);
  const [refundBooking, setRefundBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Razorpay Route linked-account setup
  const [routeAccountBusyId, setRouteAccountBusyId] = useState(null);

  // Ledger Data
  const [ledger, setLedger] = useState([]);
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Payouts Data (Free Direct Payout Management)
  const [payouts, setPayouts] = useState([]);
  const [payoutSearch, setPayoutSearch] = useState('');
  const [selectedPayoutForAction, setSelectedPayoutForAction] = useState(null);
  const [payoutActionType, setPayoutActionType] = useState('APPROVE');
  const [payoutTxnRef, setPayoutTxnRef] = useState('');
  const [payoutAdminRemarks, setPayoutAdminRemarks] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Mentor Broadcast & Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    category: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    targetType: 'ALL',
    targetMentorId: '',
    actionLink: '',
    actionText: ''
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [notificationSearch, setNotificationSearch] = useState('');
  const [notificationCategoryFilter, setNotificationCategoryFilter] = useState('ALL');

  const frontendUrl = getFrontendUrl();

  // Load Overview Data
  const loadOverview = async () => {
    try {
      const res = await API.get('/admin/unicoach/overview');
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to load UniCoach overview:', err);
    }
  };

  // Load Mentors
  const loadMentors = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/unicoach/mentors');
      setMentors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to load creators list'));
    } finally {
      setLoading(false);
    }
  };

  // Load Bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/unicoach/bookings');
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to load global bookings'));
    } finally {
      setLoading(false);
    }
  };

  // Load Ledger
  const loadLedger = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/unicoach/ledger');
      setLedger(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to load ledger entries'));
    } finally {
      setLoading(false);
    }
  };

  // Load Payouts
  const loadPayouts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/unicoach/payouts');
      setPayouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to load legacy payout requests'));
    } finally {
      setLoading(false);
    }
  };

  // Load Notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/unicoach/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send Broadcast / Direct Notification
  const handleSendBroadcast = async () => {
    if (!broadcastForm.title.trim()) {
      message.error('Please enter a notification title.');
      return;
    }
    if (!broadcastForm.message.trim()) {
      message.error('Please enter the notification message body.');
      return;
    }
    if (broadcastForm.targetType === 'SPECIFIC' && !broadcastForm.targetMentorId) {
      message.error('Please select the mentor who should receive this notification.');
      return;
    }

    setBroadcastSending(true);
    try {
      const res = await API.post('/admin/unicoach/notifications', broadcastForm);
      message.success(res.data.message || 'Notification dispatched successfully!');
      setIsBroadcastModalOpen(false);
      setBroadcastForm({
        title: '',
        message: '',
        category: 'ANNOUNCEMENT',
        priority: 'NORMAL',
        targetType: 'ALL',
        targetMentorId: '',
        actionLink: '',
        actionText: ''
      });
      loadNotifications();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to dispatch notification.'));
    } finally {
      setBroadcastSending(false);
    }
  };

  // Delete / Retract Notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await API.delete(`/admin/unicoach/notifications/${notificationId}`);
      message.success('Notification retracted successfully.');
      loadNotifications();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to retract notification.'));
    }
  };

  useEffect(() => {
    loadOverview();
    loadMentors();
    loadNotifications();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'mentors') loadMentors();
    else if (key === 'bookings') loadBookings();
    else if (key === 'ledger') loadLedger();
    else if (key === 'payouts') loadPayouts();
    else if (key === 'notifications') loadNotifications();
  };

  // Process Payout Action (Approve with UTR or Reject with Refund)
  const handleProcessPayoutSubmit = async () => {
    if (!selectedPayoutForAction) return;
    if (payoutActionType === 'APPROVE' && !payoutTxnRef.trim()) {
      message.warning('Please enter the Bank UTR / IMPS Reference number.');
      return;
    }
    setActionSubmitting(true);
    try {
      const res = await API.post(`/admin/unicoach/payouts/${selectedPayoutForAction._id}/process`, {
        action: payoutActionType,
        transactionRef: payoutTxnRef.trim(),
        adminRemarks: payoutAdminRemarks.trim()
      });
      message.success(res.data.message || 'Payout status updated successfully!');
      setSelectedPayoutForAction(null);
      setPayoutTxnRef('');
      setPayoutAdminRemarks('');
      loadPayouts();
      loadOverview();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to process payout.'));
    } finally {
      setActionSubmitting(false);
    }
  };

  // Show the backend's note on whether the mentor's Razorpay Route payout account was created.
  const showPayoutAccountMessage = (msg) => {
    if (!msg) return;
    message.info({ content: `Payout account: ${msg}`, duration: 8 });
  };

  // Create / refresh the mentor's Razorpay Route linked account
  const handleSetupRouteAccount = async (mentor) => {
    setRouteAccountBusyId(mentor._id);
    try {
      const res = await API.post(`/admin/unicoach/mentors/${mentor._id}/route-account`);
      const data = res?.data || {};
      const transfers = Number(data.transfersCompleted) || 0;
      const baseMsg = data.message || `Payout account status: ${data.routeAccount?.status || 'updated'}`;
      const fullMsg = transfers > 0 ? `${baseMsg} (${transfers} waiting booking transfer${transfers === 1 ? '' : 's'} pushed)` : baseMsg;
      if (data.routeAccount?.status === 'ACTIVATED') message.success({ content: fullMsg, duration: 6 });
      else message.info({ content: fullMsg, duration: 8 });
      loadMentors();
    } catch (err) {
      message.error({ content: apiErrorMessage(err, 'Failed to set up the payout account.'), duration: 8 });
      loadMentors();
    } finally {
      setRouteAccountBusyId(null);
    }
  };

  // Retry the Razorpay Route transfer for a booking
  const handleRetryTransfer = async (booking) => {
    setBookingActionBusyId(booking._id);
    try {
      const res = await API.post(`/admin/unicoach/bookings/${booking._id}/retry-transfer`);
      message.success({ content: res?.data?.message || 'Transfer retried.', duration: 6 });
    } catch (err) {
      message.error({ content: apiErrorMessage(err, 'Failed to retry the transfer.'), duration: 8 });
    } finally {
      setBookingActionBusyId(null);
      loadBookings();
    }
  };

  // Full refund to the student (reverses the mentor transfer)
  const handleRefundSubmit = async () => {
    if (!refundBooking) return;
    setRefundSubmitting(true);
    try {
      const res = await API.post(`/admin/unicoach/bookings/${refundBooking._id}/refund`, {
        reason: refundReason.trim()
      });
      message.success({ content: res?.data?.message || 'Refund initiated.', duration: 6 });
      setRefundBooking(null);
      setRefundReason('');
      loadBookings();
      loadOverview();
    } catch (err) {
      message.error({ content: apiErrorMessage(err, 'Failed to refund this booking.'), duration: 8 });
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Toggle Verification Badge
  const handleToggleVerification = async (mentor) => {
    try {
      const nextVal = !mentor.isVerified;
      const res = await API.patch(`/admin/unicoach/mentors/${mentor._id}/verify`, { isVerified: nextVal });
      message.success(`Creator @${mentor.handle} verification ${nextVal ? 'ENABLED' : 'REMOVED'}`);
      showPayoutAccountMessage(res?.data?.payoutAccountMessage);
      setMentors(prev => prev.map(m => m._id === mentor._id ? {
        ...m,
        isVerified: nextVal,
        applicationStatus: nextVal ? 'APPROVED' : 'PENDING'
      } : m));
      loadOverview();
      if (res?.data?.payoutAccountMessage) loadMentors();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to update verification status'));
    }
  };

  // Approve Application with Blue Tick
  const handleApproveApplication = async (mentor) => {
    try {
      const res = await API.patch(`/admin/unicoach/mentors/${mentor._id}/application`, {
        action: 'APPROVE'
      });
      message.success(res.data.message || `Mentor @${mentor.handle} approved & granted Blue Tick!`);
      showPayoutAccountMessage(res?.data?.payoutAccountMessage);
      setMentors(prev => prev.map(m => m._id === mentor._id ? {
        ...m,
        isVerified: true,
        applicationStatus: 'APPROVED',
        badges: m.badges?.includes('Verified Creator') ? m.badges : ['Verified Creator', ...(m.badges || [])]
      } : m));
      loadOverview();
      // Re-fetch so the new Razorpay Route payout-account status shows up.
      loadMentors();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to approve mentor'));
    }
  };

  // Reject Application
  const handleRejectApplication = async () => {
    if (!selectedRejectMentor) return;
    try {
      const res = await API.patch(`/admin/unicoach/mentors/${selectedRejectMentor._id}/application`, {
        action: 'REJECT',
        rejectionReason: rejectionReasonInput.trim()
      });
      message.warning(res.data.message || `Mentor @${selectedRejectMentor.handle} application rejected.`);
      setMentors(prev => prev.map(m => m._id === selectedRejectMentor._id ? {
        ...m,
        isVerified: false,
        applicationStatus: 'REJECTED',
        rejectionReason: rejectionReasonInput.trim()
      } : m));
      setIsRejectModalOpen(false);
      setSelectedRejectMentor(null);
      setRejectionReasonInput('');
      loadOverview();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to reject mentor'));
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (mentor) => {
    try {
      const nextVal = !mentor.active;
      await API.patch(`/admin/unicoach/mentors/${mentor._id}/status`, { active: nextVal });
      message.success(`Creator @${mentor.handle} ${nextVal ? 'ACTIVATED' : 'SUSPENDED'}`);
      setMentors(prev => prev.map(m => m._id === mentor._id ? { ...m, active: nextVal } : m));
      loadOverview();
    } catch (err) {
      message.error(apiErrorMessage(err, 'Failed to update creator account status'));
    }
  };

  // Delete Mentor Permanently
  const handleDeleteMentor = async (mentor) => {
    try {
      const res = await API.delete(`/admin/unicoach/mentors/${mentor._id}`);
      message.success(res.data.message || `Mentor @${mentor.handle} deleted permanently!`);
      setMentors(prev => prev.filter(m => m._id !== mentor._id));
      loadOverview();
    } catch (err) {
      console.error('Failed to delete mentor:', err);
      message.error(apiErrorMessage(err, 'Failed to delete creator.'));
    }
  };

  // Filtered lists
  const filteredMentors = mentors.filter(m => {
    const s = mentorSearch.toLowerCase();
    const matchesSearch =
      m.name?.toLowerCase().includes(s) ||
      m.handle?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) ||
      m.university?.toLowerCase().includes(s) ||
      m.country?.toLowerCase().includes(s) ||
      m.headline?.toLowerCase().includes(s);

    if (!matchesSearch) return false;

    if (mentorStatusFilter === 'PENDING') {
      return m.applicationStatus === 'PENDING' || (!m.isVerified && m.applicationStatus !== 'REJECTED');
    }
    if (mentorStatusFilter === 'APPROVED') {
      return m.isVerified || m.applicationStatus === 'APPROVED';
    }
    if (mentorStatusFilter === 'REJECTED') {
      return m.applicationStatus === 'REJECTED';
    }

    return true;
  });

  const pendingMentorsCount = mentors.filter(m => m.applicationStatus === 'PENDING' || (!m.isVerified && m.applicationStatus !== 'REJECTED')).length;
  const verifiedMentorsCount = mentors.filter(m => m.isVerified || m.applicationStatus === 'APPROVED').length;

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    if (!bookingSearch) return true;
    const s = bookingSearch.toLowerCase();
    return (
      b.bookingRef?.toLowerCase().includes(s) ||
      b.studentName?.toLowerCase().includes(s) ||
      b.studentEmail?.toLowerCase().includes(s) ||
      b.studentPhone?.toLowerCase().includes(s) ||
      b.mentorId?.name?.toLowerCase().includes(s) ||
      b.mentorId?.handle?.toLowerCase().includes(s) ||
      b.serviceId?.title?.toLowerCase().includes(s) ||
      b.state?.toLowerCase().includes(s)
    );
  });

  // Filtered Ledger
  const filteredLedger = ledger.filter(l => {
    if (!ledgerSearch) return true;
    const s = ledgerSearch.toLowerCase();
    return (
      l.account?.toLowerCase().includes(s) ||
      l.type?.toLowerCase().includes(s) ||
      l.description?.toLowerCase().includes(s) ||
      l.bookingId?.bookingRef?.toLowerCase().includes(s) ||
      l.mentorId?.name?.toLowerCase().includes(s) ||
      l.mentorId?.handle?.toLowerCase().includes(s)
    );
  });

  // Filtered Payouts
  const filteredPayouts = payouts.filter(p => {
    if (!payoutSearch) return true;
    const s = payoutSearch.toLowerCase();
    return (
      p.payoutRef?.toLowerCase().includes(s) ||
      p.mentorId?.name?.toLowerCase().includes(s) ||
      p.mentorId?.handle?.toLowerCase().includes(s) ||
      p.mentorId?.email?.toLowerCase().includes(s) ||
      p.payoutDetails?.upiId?.toLowerCase().includes(s) ||
      p.payoutDetails?.accountHolderName?.toLowerCase().includes(s) ||
      p.payoutDetails?.accountNumber?.toLowerCase().includes(s) ||
      p.transactionRef?.toLowerCase().includes(s) ||
      p.status?.toLowerCase().includes(s)
    );
  });

  // Mentor Table Columns
  const mentorColumns = [
    {
      title: 'Creator / Mentor',
      key: 'creator',
      width: 260,
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--ux-surface-3)',
            color: INK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {r.avatarUrl ? (
              <img src={r.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              r.name?.charAt(0)?.toUpperCase() || 'M'
            )}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, color: INK, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.name}</span>
              {r.isVerified && (
                <SafetyCertificateOutlined style={{ color: 'var(--ux-brand)', fontSize: 13, flexShrink: 0 }} title="Verified Creator (Blue Tick)" />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 12 }}>
              <a
                href={`${frontendUrl}/@${r.handle}`}
                target="_blank"
                rel="noreferrer"
                title="View Creator Page"
                style={{ color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}
              >
                @{r.handle} <ExportOutlined style={{ fontSize: 10 }} />
              </a>
              <span style={{ color: TEXT_3 }}>·</span>
              <span style={{ color: TEXT_2, fontSize: 11.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={r.email}>
                {r.email}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Academic & Destination',
      key: 'academic',
      width: 210,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: TEXT, fontSize: 12.5 }}>
            {r.university || <span style={{ color: TEXT_3, fontWeight: 500 }}>University not set</span>}
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {r.country && (
              <span className="nx-status nx-status--neutral" style={{ height: 20, fontSize: 11 }}>
                {r.country}
              </span>
            )}
            {(r.course || r.graduationYear) && (
              <span style={{ fontSize: 11.5, color: TEXT_2 }}>
                {[r.course, r.graduationYear ? `Batch '${String(r.graduationYear).slice(-2)}` : null].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Verification & ID',
      key: 'proof',
      width: 160,
      render: (_, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {r.verificationDocUrl ? (
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => setSelectedProofMentor(r)}
              style={{ width: 'max-content' }}
            >
              Inspect ID
            </Button>
          ) : (
            <span style={{ fontSize: 11.5, color: TEXT_3 }}>No doc attached</span>
          )}
          {r.socialLinks?.linkedin && (
            <a
              href={r.socialLinks.linkedin.startsWith('http') ? r.socialLinks.linkedin : `https://${r.socialLinks.linkedin}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11.5, color: INK, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
            >
              <LinkedinOutlined /> LinkedIn
            </a>
          )}
          {r.defaultPayoutDetails?.accountNumber ? (
            <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
              <BankOutlined /> Bank Linked
            </span>
          ) : r.defaultPayoutDetails?.upiId ? (
            <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
              UPI Linked
            </span>
          ) : (
            <span className="nx-status nx-status--warning" style={SMALL_PILL_STYLE}>
              No Bank Info
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      width: 130,
      render: (_, r) => {
        const isApproved = r.isVerified || r.applicationStatus === 'APPROVED';
        const isRejected = r.applicationStatus === 'REJECTED';
        if (isApproved) {
          return (
            <span className="nx-status nx-status--success">
              <CheckCircleOutlined style={{ fontSize: 11 }} /> Verified
            </span>
          );
        }
        if (isRejected) {
          return (
            <span className="nx-status nx-status--danger" title={r.rejectionReason}>
              <CloseCircleOutlined style={{ fontSize: 11 }} /> Rejected
            </span>
          );
        }
        return (
          <span className="nx-status nx-status--warning">
            <ClockCircleOutlined style={{ fontSize: 11 }} /> In Review
          </span>
        );
      }
    },
    {
      title: 'Payout account',
      key: 'routeAccount',
      width: 210,
      render: (_, r) => {
        const ra = r.routeAccount || {};
        const status = ra.status || 'NOT_STARTED';
        const style = ROUTE_ACCOUNT_STYLES[status] || { tone: 'neutral', label: status };
        const bank = r.defaultPayoutDetails || {};
        const maskedAcc = maskAccountNumber(bank.accountNumber);
        const maskedPan = maskPan(r.kyc?.pan);
        const tag = (
          <span className={`nx-status nx-status--${style.tone}`} style={{ width: 'fit-content' }}>
            {style.label}
          </span>
        );
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ra.lastError ? <Tooltip title={ra.lastError}>{tag}</Tooltip> : tag}
            {ra.lastError && (
              <span
                style={{ fontSize: 11, color: DANGER, maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={ra.lastError}
              >
                {ra.lastError}
              </span>
            )}
            <span style={{ fontSize: 11.5, color: TEXT_2, fontFamily: 'monospace' }}>
              {maskedAcc ? `${maskedAcc}${bank.ifscCode ? ` · ${bank.ifscCode}` : ''}` : <span style={{ color: TEXT_3, fontFamily: 'inherit' }}>No bank details</span>}
            </span>
            <span style={{ fontSize: 11.5, color: TEXT_2, fontFamily: 'monospace' }}>
              {maskedPan ? `PAN ${maskedPan}` : <span style={{ color: TEXT_3, fontFamily: 'inherit' }}>No PAN</span>}
            </span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={routeAccountBusyId === r._id}
              onClick={() => handleSetupRouteAccount(r)}
              style={{ fontSize: 12, width: 'fit-content', marginTop: 2 }}
            >
              {ra.accountId ? 'Refresh payout account' : 'Set up payout account'}
            </Button>
          </div>
        );
      }
    },
    {
      title: 'Services & Slots',
      key: 'services',
      width: 130,
      render: (_, r) => (
        <div>
          <button
            onClick={() => setSelectedMentorForServices(r)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: INK,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <EyeOutlined /> {r.servicesCount || 0} Offerings
          </button>
          <div style={{ fontSize: 11.5, color: TEXT_2, marginTop: 2 }}>
            {r.availableSlotsCount || 0} Slots Open
          </div>
        </div>
      )
    },
    {
      title: 'Financials',
      key: 'financials',
      width: 140,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: INK, fontSize: 13 }}>
            ₹{(r.grossEarningsINR || 0).toLocaleString('en-IN')} <span style={{ fontSize: 11, color: TEXT_3, fontWeight: 500 }}>gross</span>
          </div>
          <div style={{ fontSize: 12, color: TEXT, fontWeight: 600, marginTop: 2 }}>
            ₹{(r.walletBalanceINR || 0).toLocaleString('en-IN')} <span style={{ fontSize: 11, color: TEXT_3, fontWeight: 500 }}>wallet</span>
          </div>
        </div>
      )
    },
    {
      title: 'Active',
      key: 'active',
      width: 75,
      render: (_, r) => (
        <Tooltip title={r.active ? 'Account Active (Publicly visible)' : 'Account Suspended'}>
          <Switch
            size="small"
            checked={r.active}
            onChange={() => handleToggleStatus(r)}
          />
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_, r) => {
        const isApproved = r.isVerified || r.applicationStatus === 'APPROVED';
        const menuItems = [
          {
            key: 'proof',
            icon: <FilePdfOutlined />,
            label: 'Inspect Proof Document',
            disabled: !r.verificationDocUrl,
            onClick: () => setSelectedProofMentor(r)
          },
          {
            key: 'services',
            icon: <EyeOutlined />,
            label: 'View Offerings & Form',
            onClick: () => setSelectedMentorForServices(r)
          },
          {
            key: 'public',
            icon: <ExportOutlined />,
            label: 'View Public Profile',
            onClick: () => window.open(`${frontendUrl}/@${r.handle}`, '_blank')
          },
          {
            key: 'studio',
            icon: <VideoCameraOutlined />,
            label: 'Open Studio Dashboard',
            onClick: () => window.open(`${frontendUrl}/unicoach/dashboard/${r.handle}`, '_blank')
          },
          { type: 'divider' },
          isApproved ? {
            key: 'revoke',
            danger: true,
            icon: <CloseCircleOutlined />,
            label: 'Revoke Verification',
            onClick: () => {
              setSelectedRejectMentor(r);
              setIsRejectModalOpen(true);
            }
          } : {
            key: 'reject',
            danger: true,
            icon: <CloseCircleOutlined />,
            label: 'Reject Application',
            onClick: () => {
              setSelectedRejectMentor(r);
              setIsRejectModalOpen(true);
            }
          },
          {
            key: 'delete',
            danger: true,
            icon: <DeleteOutlined />,
            label: 'Delete Creator...',
            onClick: () => {
              Modal.confirm({
                title: `Permanently delete @${r.handle}?`,
                content: 'This will permanently remove this creator, their offerings, slots, reviews, and bookings.',
                okText: 'Yes, Delete',
                okType: 'danger',
                onOk: () => handleDeleteMentor(r)
              });
            }
          }
        ];

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isApproved ? (
              <Button
                type="primary"
                size="small"
                icon={<SafetyCertificateOutlined />}
                onClick={() => handleApproveApplication(r)}
              >
                Approve
              </Button>
            ) : null}

            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button size="small" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      }
    }
  ];

  // Bookings Table Columns
  const bookingColumns = [
    {
      title: 'Booking Ref',
      dataIndex: 'bookingRef',
      key: 'bookingRef',
      width: 140,
      render: (ref) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: INK, fontSize: 12.5 }}>{ref}</span>
    },
    {
      title: 'Student',
      key: 'student',
      width: 200,
      render: (_, r) => (
        <div>
          <strong style={{ color: INK, fontSize: 13.5, fontWeight: 600 }}>{r.studentName}</strong>
          <div style={{ fontSize: 11.5, color: TEXT_2 }}>{r.studentEmail}</div>
          {r.studentPhone && <div style={{ fontSize: 11.5, color: TEXT_3 }}>{r.studentPhone}</div>}
        </div>
      )
    },
    {
      title: 'Creator / Mentor',
      key: 'mentor',
      width: 180,
      render: (_, r) => (
        <div>
          <strong style={{ color: INK, fontSize: 13.5, fontWeight: 600 }}>{r.mentorId?.name || 'Mentor'}</strong>
          <div style={{ fontSize: 11.5, color: TEXT_2 }}>@{r.mentorId?.handle}</div>
        </div>
      )
    },
    {
      title: 'Service & Session',
      key: 'service',
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: TEXT, fontSize: 12.5 }}>
            {r.serviceId?.title || '1:1 Session'}
          </div>
          <div style={{ fontSize: 11.5, color: TEXT_2, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {r.priorityDm?.status && r.priorityDm.status !== 'NONE' ? (
              <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
                <MessageOutlined /> Priority DM
              </span>
            ) : r.digitalAssetDelivery?.fileName ? (
              <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
                <DownloadOutlined /> Digital Asset
              </span>
            ) : (
              <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
                <VideoCameraOutlined /> 1:1 Video
              </span>
            )}
            <span>
              {r.startUtc ? new Date(r.startUtc).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Direct Delivery'}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Paid',
      key: 'payment',
      width: 120,
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 700, color: INK, fontSize: 13.5 }}>
            {formatINR(r.settlement?.grossINR ?? r.amountPaid)}
          </span>
          {r.couponCode && (
            <div style={{ marginTop: 4 }}>
              <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE}>
                {r.couponCode} (-₹{r.discountAmount})
              </span>
            </div>
          )}
          {r.refund?.refundId && (
            <div style={{ marginTop: 4 }}>
              <span className="nx-status nx-status--neutral" style={SMALL_PILL_STYLE} title={r.refund.refundId}>
                Refunded {r.refund.amountINR != null ? formatINR(r.refund.amountINR) : ''}{r.refund.status ? ` · ${r.refund.status}` : ''}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Razorpay fee + GST',
      key: 'gatewayFee',
      width: 120,
      render: (_, r) => {
        const s = r.settlement || {};
        if (s.gatewayFeeINR == null && s.gatewayTaxINR == null) {
          return <span style={{ color: TEXT_3, fontSize: 12 }}>—</span>;
        }
        return (
          <Tooltip title={`Fee ${formatINR(s.gatewayFeeINR)} + GST ${formatINR(s.gatewayTaxINR)}`}>
            <span style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 600 }}>
              {formatINR((Number(s.gatewayFeeINR) || 0) + (Number(s.gatewayTaxINR) || 0))}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Mentor gets',
      key: 'mentorNet',
      width: 110,
      render: (_, r) => r.settlement?.mentorNetINR != null ? (
        <span style={{ fontWeight: 700, color: INK, fontSize: 13.5 }}>{formatINR(r.settlement.mentorNetINR)}</span>
      ) : <span style={{ color: TEXT_3, fontSize: 12 }}>—</span>
    },
    {
      title: 'Settlement',
      key: 'settlement',
      width: 180,
      render: (_, r) => {
        const s = r.settlement || {};
        const status = s.status || 'NOT_APPLICABLE';
        const style = SETTLEMENT_STYLES[status] || { tone: 'neutral', label: status };
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Tooltip title={s.lastError || (s.transferId ? `Transfer ${s.transferId}` : undefined)}>
              <span className={`nx-status nx-status--${style.tone}`} style={{ width: 'fit-content' }}>
                {style.label}
              </span>
            </Tooltip>
            {status === 'ON_HOLD' && s.onHoldUntil && (
              <span style={{ fontSize: 11, color: TEXT_2 }}>until {new Date(s.onHoldUntil).toLocaleString()}</span>
            )}
            {status === 'RELEASED' && s.releasedAt && (
              <span style={{ fontSize: 11, color: TEXT_2 }}>{new Date(s.releasedAt).toLocaleString()}</span>
            )}
            {s.lastError && (
              <span style={{ fontSize: 11, color: DANGER, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.lastError}>
                {s.lastError}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state) => {
        let tone = 'neutral';
        if (state === 'COMPLETED') tone = 'success';
        else if (state === 'CONFIRMED') tone = 'success';
        else if (state === 'PAYMENT_PENDING') tone = 'warning';
        else if (state === 'CANCELLED') tone = 'danger';
        return <span className={`nx-status nx-status--${tone}`}>{state}</span>;
      }
    },
    {
      title: 'Inspect & Links',
      key: 'actions',
      width: 160,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r.meeting?.joinUrl && (
            <Button
              size="small"
              type="primary"
              href={r.meeting.joinUrl}
              target="_blank"
              rel="noreferrer"
              icon={<VideoCameraOutlined />}
            >
              Meet
            </Button>
          )}
          {r.priorityDm?.questionText && (
            <Button
              size="small"
              icon={<MessageOutlined />}
              onClick={() => setSelectedBookingForDm(r)}
            >
              DM Query
            </Button>
          )}
          {r.digitalAssetDelivery?.fileUrl && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={r.digitalAssetDelivery.fileUrl}
              target="_blank"
            >
              File
            </Button>
          )}
          {r.customAnswers && r.customAnswers.length > 0 && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => setSelectedBookingForAnswers(r)}
            >
              Q&A ({r.customAnswers.length})
            </Button>
          )}
        </div>
      )
    },
    {
      title: 'Money actions',
      key: 'moneyActions',
      width: 150,
      render: (_, r) => {
        const settlementStatus = r.settlement?.status;
        const canRetry = RETRYABLE_SETTLEMENT_STATUSES.includes(settlementStatus);
        const canRefund =
          REFUNDABLE_BOOKING_STATES.includes(r.state) &&
          Boolean(r.payment?.paymentId) &&
          !r.refund?.refundId &&
          settlementStatus !== 'RELEASED';
        if (!canRetry && !canRefund) {
          return <span style={{ fontSize: 12, color: TEXT_3 }}>—</span>;
        }
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {canRetry && (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                loading={bookingActionBusyId === r._id}
                onClick={() => handleRetryTransfer(r)}
              >
                Retry transfer
              </Button>
            )}
            {canRefund && (
              <Button
                size="small"
                danger
                onClick={() => {
                  setRefundBooking(r);
                  setRefundReason('');
                }}
              >
                Refund
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  // Ledger Table Columns
  const ledgerColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (d) => <span style={{ fontSize: 12.5, color: TEXT_2 }}>{new Date(d).toLocaleString()}</span>
    },
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
      width: 160,
      render: (acc) => {
        // Account types are categories, not statuses: neutral chips, escrow/wallet emphasised
        let tone = 'neutral';
        if (acc === 'ESCROW') tone = 'accent';
        else if (acc === 'CREATOR_WALLET') tone = 'dark';
        else if (acc === 'PLATFORM_COMMISSION') tone = 'neutral';
        else if (acc === 'STUDENT') tone = 'neutral';
        return <span className={`nx-status nx-status--${tone}`}>{acc}</span>;
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type) => (
        <span className={`nx-status nx-status--${type === 'CREDIT' ? 'success' : 'danger'}`}>
          {type === 'CREDIT' ? '+ CREDIT' : '- DEBIT'}
        </span>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amt) => <span style={{ fontWeight: 700, color: INK }}>₹{(amt || 0).toLocaleString('en-IN')}</span>
    },
    {
      title: 'Booking Ref',
      key: 'bookingRef',
      width: 140,
      render: (_, r) => r.bookingId?.bookingRef ? (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: INK }}>{r.bookingId.bookingRef}</span>
      ) : <span style={{ color: TEXT_3 }}>-</span>
    },
    {
      title: 'Mentor',
      key: 'mentor',
      width: 160,
      render: (_, r) => r.mentorId?.name ? `${r.mentorId.name} (@${r.mentorId.handle})` : '-'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => <span style={{ fontSize: 12.5, color: TEXT_2 }}>{desc}</span>
    }
  ];

  // Payouts Table Columns
  const payoutColumns = [
    {
      title: 'Payout Ref',
      dataIndex: 'payoutRef',
      key: 'payoutRef',
      width: 130,
      render: (ref) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: INK }}>{ref}</span>
    },
    {
      title: 'Creator / Mentor',
      key: 'mentor',
      width: 180,
      render: (_, r) => (
        <div>
          <strong style={{ color: INK, fontWeight: 600 }}>{r.mentorId?.name || 'Mentor'}</strong>
          <div style={{ fontSize: 11.5, color: TEXT_2 }}>@{r.mentorId?.handle}</div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amountINR',
      key: 'amountINR',
      width: 120,
      render: (amt) => <span style={{ fontWeight: 700, color: INK, fontSize: 13.5 }}>₹{(amt || 0).toLocaleString('en-IN')}</span>
    },
    {
      title: 'Payout Method & Details',
      key: 'method',
      width: 220,
      render: (_, r) => (
        <div>
          <span className="nx-status nx-status--neutral">
            {r.payoutMethod === 'UPI' ? <><ThunderboltOutlined /> UPI</> : <><BankOutlined /> Bank Transfer</>}
          </span>
          {r.payoutMethod === 'UPI' ? (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12.5, color: INK }}>
                {r.payoutDetails?.upiId}
              </span>
              {r.payoutDetails?.upiId && (
                <Button
                  size="small"
                  type="text"
                  shape="circle"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(r.payoutDetails?.upiId);
                    message.success('UPI ID copied to clipboard!');
                  }}
                  title="Copy UPI ID"
                />
              )}
            </div>
          ) : (
            <div style={{ marginTop: 6, fontSize: 11.5, color: TEXT_2, lineHeight: 1.6 }}>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>Name:</strong> {r.payoutDetails?.accountHolderName}</div>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>A/C:</strong> {r.payoutDetails?.accountNumber}</div>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>IFSC:</strong> {r.payoutDetails?.ifscCode}</div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (st) => {
        let tone = 'neutral';
        if (st === 'PAID') tone = 'success';
        else if (st === 'REQUESTED' || st === 'PROCESSING') tone = 'warning';
        else if (st === 'REJECTED') tone = 'danger';
        return <span className={`nx-status nx-status--${tone}`}>{st}</span>;
      }
    },
    {
      title: 'Dates & Remarks',
      key: 'dates',
      width: 200,
      render: (_, r) => (
        <div style={{ fontSize: 11.5, color: TEXT_2, lineHeight: 1.6 }}>
          <div>Req: {new Date(r.createdAt || r.requestedAt).toLocaleString()}</div>
          {r.transactionRef && (
            <div style={{ color: INK, fontWeight: 600 }}>UTR: {r.transactionRef}</div>
          )}
          {r.adminRemarks && (
            <div style={{ color: TEXT_3, fontStyle: 'italic' }}>Note: {r.adminRemarks}</div>
          )}
        </div>
      )
    },
    {
      title: 'Disburse Action',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <div>
          {r.status === 'REQUESTED' || r.status === 'PROCESSING' ? (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedPayoutForAction(r);
                setPayoutActionType('APPROVE');
                setPayoutTxnRef('');
                setPayoutAdminRemarks('');
              }}
            >
              Disburse & Settle
            </Button>
          ) : (
            <span style={{ fontSize: 12, color: TEXT_3, fontStyle: 'italic' }}>Settled</span>
          )}
        </div>
      )
    }
  ];

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = !notificationSearch || (
      n.title?.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      n.message?.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      n.targetMentorHandle?.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      n.targetMentorName?.toLowerCase().includes(notificationSearch.toLowerCase())
    );
    const matchesCategory = notificationCategoryFilter === 'ALL' || n.category === notificationCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Notification Columns
  const notificationColumns = [
    {
      title: 'Title & Announcement',
      key: 'title',
      width: 320,
      render: (_, r) => {
        let categoryTone = 'neutral';
        let categoryText = 'Announcement';

        if (r.category === 'SYSTEM') { categoryTone = 'neutral'; categoryText = 'System Update'; }
        else if (r.category === 'PAYOUT') { categoryTone = 'neutral'; categoryText = 'Payout Notice'; }
        else if (r.category === 'URGENT') { categoryTone = 'danger'; categoryText = 'Urgent Notice'; }
        else if (r.category === 'GENERAL') { categoryTone = 'neutral'; categoryText = 'General Notice'; }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className={`nx-status nx-status--${categoryTone}`}>
                {categoryText}
              </span>
              {r.priority === 'URGENT' && (
                <span className="nx-status nx-status--danger">
                  <AlertOutlined /> CRITICAL
                </span>
              )}
              {r.priority === 'HIGH' && (
                <span className="nx-status nx-status--warning">
                  <ThunderboltOutlined /> HIGH
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, color: INK, fontSize: 13.5, marginTop: 2 }}>
              {r.title}
            </div>
            <div style={{ fontSize: 12, color: TEXT_2, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {r.message}
            </div>
            {r.actionLink && (
              <div style={{ fontSize: 11.5, color: TEXT_2, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <LinkOutlined /> {r.actionText || 'Action Link'}: <span style={{ textDecoration: 'underline' }}>{r.actionLink}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Target Audience',
      key: 'target',
      width: 190,
      render: (_, r) => (
        <div>
          {r.targetType === 'ALL' ? (
            <span className="nx-status nx-status--neutral">
              <TeamOutlined /> All Mentors ({mentors.length})
            </span>
          ) : (
            <div>
              <span className="nx-status nx-status--neutral">
                @{r.targetMentorHandle || 'mentor'}
              </span>
              {r.targetMentorName && (
                <div style={{ fontSize: 11.5, color: TEXT_2, marginTop: 4, fontWeight: 500 }}>
                  {r.targetMentorName}
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Views & Status',
      key: 'readBy',
      width: 130,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: INK, fontSize: 12.5 }}>
            <EyeOutlined style={{ color: TEXT_3, marginRight: 4 }} />
            {r.readBy?.length || 0} viewed
          </div>
          <div style={{ fontSize: 11.5, color: TEXT_3 }}>
            {r.targetType === 'ALL' ? `${Math.round(((r.readBy?.length || 0) / (mentors.length || 1)) * 100)}% reach` : (r.readBy?.length > 0 ? 'Read' : 'Unopened')}
          </div>
        </div>
      )
    },
    {
      title: 'Dispatched At',
      key: 'createdAt',
      width: 170,
      render: (_, r) => (
        <div style={{ fontSize: 11.5, color: TEXT_2 }}>
          <div style={{ fontWeight: 600, color: TEXT }}>
            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 11, color: TEXT_3 }}>
            {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {r.senderAdmin}
          </div>
        </div>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, r) => (
        <Popconfirm
          title="Retract Notification"
          description="Are you sure you want to delete and retract this notification? Mentors will no longer see it."
          onConfirm={() => handleDeleteNotification(r._id)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true, size: 'small' }}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            title="Retract / Delete"
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <Header
        title="UniCoach Creator Network & Revenue Suite"
        subtitle="Manage verified mentors, review applications, inspect student bookings, and monitor financial escrow."
        extra={
          <>
            <Button
              type="primary"
              icon={<NotificationOutlined />}
              onClick={() => setIsBroadcastModalOpen(true)}
            >
              Send Notification to Mentors
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadOverview();
                if (activeTab === 'mentors') loadMentors();
                else if (activeTab === 'bookings') loadBookings();
                else if (activeTab === 'ledger') loadLedger();
                else if (activeTab === 'payouts') loadPayouts();
                else if (activeTab === 'notifications') loadNotifications();
              }}
            >
              Refresh Data
            </Button>
          </>
        }
      />

      <div className="dashboard-content">
        {/* Streamlined Executive 4-Card KPI Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 16,
          marginBottom: 16
        }}>
          {/* 1. Creator Network */}
          <div className="nx-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={KPI_LABEL_STYLE}>
                Creator Network
              </span>
              <span className="nx-icon-circle">
                <TeamOutlined />
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={KPI_VALUE_STYLE}>
                {overview?.creators?.total || 0}
                <span style={KPI_UNIT_STYLE}>Mentors</span>
              </div>
              <div style={KPI_META_STYLE}>
                <span style={{ color: INK, fontWeight: 600 }}>
                  {overview?.creators?.verified || 0} Verified
                </span>
                <span style={{ color: TEXT_3 }}>·</span>
                <span style={{ color: pendingMentorsCount > 0 ? WARNING : TEXT_2, fontWeight: 600 }}>
                  {pendingMentorsCount} In Review
                </span>
              </div>
            </div>
          </div>

          {/* 2. Gross Merchandise Volume (GMV) */}
          <div className="nx-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={KPI_LABEL_STYLE}>
                Total Revenue & Bookings
              </span>
              <span className="nx-icon-circle">
                <DollarOutlined />
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={KPI_VALUE_STYLE}>
                ₹{(overview?.finance?.totalGrossRevenueINR || 0).toLocaleString('en-IN')}
                <span style={KPI_UNIT_STYLE}>Gross</span>
              </div>
              <div style={KPI_META_STYLE}>
                <span className="nx-status nx-status--accent" style={{ height: 22 }}>
                  0% platform commission
                </span>
                <span style={{ color: TEXT_2, fontWeight: 500 }}>
                  {overview?.bookings?.total || 0} Bookings
                </span>
              </div>
            </div>
          </div>

          {/* 3. Escrow & Wallets */}
          <div className="nx-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={KPI_LABEL_STYLE}>
                Treasury & Escrow
              </span>
              <span className="nx-icon-circle">
                <LockOutlined />
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={KPI_VALUE_STYLE}>
                ₹{(overview?.finance?.creatorWalletAvailableINR || 0).toLocaleString('en-IN')}
                <span style={KPI_UNIT_STYLE}>In Wallets</span>
              </div>
              <div style={KPI_META_STYLE}>
                <span style={{ color: INK, fontWeight: 600 }}>
                  ₹{(overview?.finance?.inEscrowHeldINR || 0).toLocaleString('en-IN')} in Escrow
                </span>
                <span style={{ color: TEXT_3 }}>·</span>
                <span style={{ color: TEXT_2, fontWeight: 500 }}>
                  ₹{(overview?.finance?.totalDisbursedINR || 0).toLocaleString('en-IN')} Disbursed
                </span>
              </div>
            </div>
          </div>

          {/* 4. Catalog & Payouts */}
          <div className="nx-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={KPI_LABEL_STYLE}>
                Offerings & Payouts
              </span>
              <span className="nx-icon-circle">
                <ThunderboltOutlined />
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={KPI_VALUE_STYLE}>
                {overview?.catalog?.activeServices || 0}
                <span style={KPI_UNIT_STYLE}>Active Services</span>
              </div>
              <div style={KPI_META_STYLE}>
                <span style={{ color: (overview?.finance?.pendingPayoutsCount || 0) > 0 ? WARNING : TEXT_2, fontWeight: 600 }}>
                  {overview?.finance?.pendingPayoutsCount || 0} Pending Legacy Payouts
                </span>
                <span style={{ color: TEXT_3 }}>·</span>
                <span style={{ color: TEXT_2, fontWeight: 500 }}>
                  {overview?.catalog?.availableSlots || 0} Open Slots
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Tabs & Data Table Card */}
        <div className="nx-card" style={{ padding: '16px 24px 24px', overflow: 'hidden', minWidth: 0 }}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarStyle={{ marginBottom: 20, borderBottom: '1px solid var(--ux-line-2)' }}
            items={[
              {
                key: 'mentors',
                label: (
                  <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined /> All Creators & Mentors
                    <span className="nx-tab-count">
                      {mentors.length}
                    </span>
                  </span>
                ),
                children: (
                  <div>
                    {/* Clean Mentors Toolbar */}
                    <div className="nx-toolbar" style={TOOLBAR_STYLE}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                        <Input
                          prefix={<SearchOutlined style={{ color: TEXT_3 }} />}
                          placeholder="Search creator name, @handle, university, or country..."
                          value={mentorSearch}
                          onChange={(e) => setMentorSearch(e.target.value)}
                          style={{ width: '100%', maxWidth: 360 }}
                          allowClear
                        />
                        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                          <Segmented
                            value={mentorStatusFilter}
                            onChange={setMentorStatusFilter}
                            options={[
                              { label: `All (${mentors.length})`, value: 'ALL' },
                              {
                                label: (
                                  <span style={{ color: pendingMentorsCount > 0 && mentorStatusFilter !== 'PENDING' ? WARNING : undefined, fontWeight: 600 }}>
                                    Review Queue ({pendingMentorsCount})
                                  </span>
                                ),
                                value: 'PENDING'
                              },
                              { label: `Verified (${verifiedMentorsCount})`, value: 'APPROVED' },
                              { label: 'Rejected', value: 'REJECTED' }
                            ]}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 500 }}>
                        Showing {filteredMentors.length} of {mentors.length} mentors
                      </div>
                    </div>

                    <Table
                      rowKey="_id"
                      columns={mentorColumns}
                      dataSource={filteredMentors}
                      loading={loading}
                      scroll={{ x: 1260 }}
                      pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
                    />
                  </div>
                )
              },
              {
                key: 'bookings',
                label: (
                  <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <VideoCameraOutlined /> 1:1 Sessions & Bookings
                    <span className="nx-tab-count">
                      {bookings.length}
                    </span>
                  </span>
                ),
                children: (
                  <div>
                    <div className="nx-toolbar" style={TOOLBAR_STYLE}>
                      <Input
                        prefix={<SearchOutlined style={{ color: TEXT_3 }} />}
                        placeholder="Search by booking ref, student name, or mentor..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        style={{ width: '100%', maxWidth: 340 }}
                        allowClear
                      />
                      <span style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 500 }}>
                        {filteredBookings.length} total bookings recorded
                      </span>
                    </div>
                    <Table
                      rowKey="_id"
                      columns={bookingColumns}
                      dataSource={filteredBookings}
                      loading={loading}
                      scroll={{ x: 1700 }}
                      pagination={{ pageSize: 12 }}
                    />
                  </div>
                )
              },
              {
                key: 'ledger',
                label: (
                  <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <LockOutlined /> Treasury & Audit Ledger
                    <span className="nx-tab-count">
                      {ledger.length}
                    </span>
                  </span>
                ),
                children: (
                  <div>
                    <div className="nx-toolbar" style={TOOLBAR_STYLE}>
                      <Input
                        prefix={<SearchOutlined style={{ color: TEXT_3 }} />}
                        placeholder="Search account, description, or booking ref..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        style={{ width: '100%', maxWidth: 340 }}
                        allowClear
                      />
                      <span style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 500 }}>
                        Double-entry ledger balance audit
                      </span>
                    </div>
                    <Table
                      rowKey="_id"
                      columns={ledgerColumns}
                      dataSource={filteredLedger}
                      loading={loading}
                      scroll={{ x: 1050 }}
                      pagination={{ pageSize: 15 }}
                    />
                  </div>
                )
              },
              {
                key: 'payouts',
                label: (
                  <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <WalletOutlined /> Legacy manual payouts
                    {(overview?.finance?.pendingPayoutsCount || 0) > 0 ? (
                      <span className="nx-status nx-status--warning" style={{ height: 20, fontSize: 11 }}>
                        {overview.finance.pendingPayoutsCount} Pending
                      </span>
                    ) : (
                      <span className="nx-tab-count">
                        {payouts.length}
                      </span>
                    )}
                  </span>
                ),
                children: (
                  <div>
                    <div style={{ ...INNER_BLOCK_STYLE, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', fontSize: 12.5, color: TEXT_2, marginBottom: 12 }}>
                      <InfoCircleOutlined style={{ color: INK, marginTop: 3 }} />
                      <span>New earnings are paid to mentors automatically via Razorpay Route. This list only covers older manual payout requests.</span>
                    </div>
                    <div className="nx-toolbar" style={TOOLBAR_STYLE}>
                      <Input
                        prefix={<SearchOutlined style={{ color: TEXT_3 }} />}
                        placeholder="Search payout ref, creator name, UPI ID, or UTR..."
                        value={payoutSearch}
                        onChange={(e) => setPayoutSearch(e.target.value)}
                        style={{ width: '100%', maxWidth: 360 }}
                        allowClear
                      />
                      <span style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 500 }}>
                        {filteredPayouts.length} disbursement records
                      </span>
                    </div>
                    <Table
                      rowKey="_id"
                      columns={payoutColumns}
                      dataSource={filteredPayouts}
                      loading={loading}
                      scroll={{ x: 1100 }}
                      pagination={{ pageSize: 12 }}
                    />
                  </div>
                )
              },
              {
                key: 'notifications',
                label: (
                  <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <NotificationOutlined /> Mentor Broadcasts & Alerts
                    <span className="nx-tab-count">
                      {notifications.length}
                    </span>
                  </span>
                ),
                children: (
                  <div>
                    {/* Toolbar */}
                    <div className="nx-toolbar" style={TOOLBAR_STYLE}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                        <Input
                          prefix={<SearchOutlined style={{ color: TEXT_3 }} />}
                          placeholder="Search announcement title, message, or mentor..."
                          value={notificationSearch}
                          onChange={(e) => setNotificationSearch(e.target.value)}
                          style={{ width: '100%', maxWidth: 360 }}
                          allowClear
                        />
                        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                          <Segmented
                            value={notificationCategoryFilter}
                            onChange={setNotificationCategoryFilter}
                            options={[
                              { label: 'All', value: 'ALL' },
                              { label: 'Announcements', value: 'ANNOUNCEMENT' },
                              { label: 'Urgent', value: 'URGENT' },
                              { label: 'Payouts', value: 'PAYOUT' },
                              { label: 'System', value: 'SYSTEM' },
                              { label: 'General', value: 'GENERAL' }
                            ]}
                          />
                        </div>
                      </div>

                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => setIsBroadcastModalOpen(true)}
                      >
                        Compose Notification
                      </Button>
                    </div>

                    <Table
                      rowKey="_id"
                      columns={notificationColumns}
                      dataSource={filteredNotifications}
                      loading={loading}
                      scroll={{ x: 1000 }}
                      pagination={{ pageSize: 10 }}
                      locale={{
                        emptyText: (
                          <div style={{ padding: '36px 0', textAlign: 'center', color: TEXT_2 }}>
                            <span className="nx-icon-circle" style={{ margin: '0 auto 10px' }}>
                              <NotificationOutlined />
                            </span>
                            <div style={{ fontWeight: 600, color: INK }}>No Notifications Sent Yet</div>
                            <div style={{ fontSize: 12.5, marginTop: 4 }}>
                              Broadcast policy announcements, session updates, or payout notices directly to mentors.
                            </div>
                            <Button
                              type="primary"
                              size="small"
                              icon={<SendOutlined />}
                              onClick={() => setIsBroadcastModalOpen(true)}
                              style={{ marginTop: 14 }}
                            >
                              Send First Broadcast
                            </Button>
                          </div>
                        )
                      }}
                    />
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      {/* Modal: Mentor Services & Intake Questions Inspector */}
      <Modal
        title={`Offerings & Intake Form: ${selectedMentorForServices?.name} (@${selectedMentorForServices?.handle})`}
        open={Boolean(selectedMentorForServices)}
        onCancel={() => setSelectedMentorForServices(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedMentorForServices(null)}>
            Close
          </Button>
        ]}
        width={700}
      >
        <div style={{ maxHeight: 450, overflowY: 'auto', paddingRight: 8 }}>
          {selectedMentorForServices?.services?.length === 0 ? (
            <p style={{ color: TEXT_2, textAlign: 'center', padding: '24px 0' }}>
              No active services currently published by this mentor.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedMentorForServices?.services?.map((svc) => (
                <div
                  key={svc._id}
                  style={{ ...INNER_BLOCK_STYLE, padding: 18 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <span className="nx-status nx-status--neutral">
                        {svc.type.replace(/_/g, ' ')}
                      </span>
                      <h4 style={{ margin: '8px 0 2px 0', fontSize: 14.5, fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>
                        {svc.title}
                      </h4>
                      {svc.description && (
                        <p style={{ fontSize: 12.5, color: TEXT_2, margin: 0 }}>{svc.description}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>
                        ₹{svc.priceInINR.toLocaleString('en-IN')}
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: TEXT_2 }}>
                        {svc.type === 'ONE_ON_ONE' ? `${svc.durationMinutes} mins` : 'Async Delivery'}
                      </span>
                    </div>
                  </div>

                  {/* Custom Intake Questions */}
                  {svc.customQuestions && svc.customQuestions.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ux-line)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_2 }}>
                        Intake Questions for Student ({svc.customQuestions.length}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                        {svc.customQuestions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            style={{
                              background: '#fff',
                              padding: '8px 12px',
                              borderRadius: 12,
                              border: '1px solid var(--ux-line-2)',
                              fontSize: 12.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8
                            }}
                          >
                            <span style={{ fontWeight: 500, color: TEXT }}>
                              {q.questionText} {q.required && <span style={{ color: DANGER }}>*</span>}
                            </span>
                            <span className="nx-status nx-status--neutral" style={{ height: 20, fontSize: 11, flexShrink: 0 }}>{q.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Student Answers Inspector */}
      <Modal
        title={`Student Intake Answers (${selectedBookingForAnswers?.studentName})`}
        open={Boolean(selectedBookingForAnswers)}
        onCancel={() => setSelectedBookingForAnswers(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedBookingForAnswers(null)}>
            Done
          </Button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          {selectedBookingForAnswers?.customAnswers?.map((qa, i) => (
            <div
              key={i}
              style={{ ...INNER_BLOCK_STYLE, padding: 14 }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_2, marginBottom: 4 }}>
                {qa.questionText}
              </div>
              {qa.answerText?.startsWith('http') ? (
                <a
                  href={qa.answerText}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--ux-brand-strong)', fontWeight: 600, wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {qa.answerText} <ExportOutlined />
                </a>
              ) : (
                <div style={{ fontSize: 13.5, color: INK, fontWeight: 500 }}>
                  {qa.answerText || 'No answer provided'}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal: Priority DM Inspector */}
      <Modal
        title={`Priority DM Query (${selectedBookingForDm?.studentName} → @${selectedBookingForDm?.mentorId?.handle || 'Mentor'})`}
        open={Boolean(selectedBookingForDm)}
        onCancel={() => setSelectedBookingForDm(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedBookingForDm(null)}>
            Done
          </Button>
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: TEXT_2 }}>Booking Reference: <strong style={{ color: INK, fontWeight: 600 }}>{selectedBookingForDm?.bookingRef}</strong></span>
            <span className={`nx-status nx-status--${selectedBookingForDm?.priorityDm?.status === 'ANSWERED' ? 'success' : 'warning'}`}>
              {selectedBookingForDm?.priorityDm?.status || 'PENDING'}
            </span>
          </div>

          <div style={{ ...INNER_BLOCK_STYLE, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_2, marginBottom: 4 }}>
              Student Question:
            </div>
            <div style={{ fontSize: 13.5, color: INK, fontWeight: 500, whiteSpace: 'pre-wrap' }}>
              {selectedBookingForDm?.priorityDm?.questionText}
            </div>
            {selectedBookingForDm?.priorityDm?.contextText && (
              <div style={{ fontSize: 12.5, color: TEXT_2, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ux-line)' }}>
                <strong style={{ color: TEXT, fontWeight: 600 }}>Context:</strong> {selectedBookingForDm.priorityDm.contextText}
              </div>
            )}
            {selectedBookingForDm?.priorityDm?.referenceUrl && (
              <div style={{ marginTop: 8 }}>
                <a href={selectedBookingForDm.priorityDm.referenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Attached Reference URL <ExportOutlined />
                </a>
              </div>
            )}
          </div>

          {selectedBookingForDm?.priorityDm?.status === 'ANSWERED' ? (
            <div style={{ background: '#fff', border: '1px solid var(--ux-line)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_2, marginBottom: 4 }}>
                Mentor's Answer:
              </div>
              <div style={{ fontSize: 13.5, color: INK, whiteSpace: 'pre-wrap' }}>
                {selectedBookingForDm.priorityDm.answerText}
              </div>
              {selectedBookingForDm?.priorityDm?.attachmentUrl && (
                <div style={{ marginTop: 8 }}>
                  <a href={selectedBookingForDm.priorityDm.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Attached Resource Link <ExportOutlined />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: '#fef3c7', borderRadius: 16, padding: '10px 14px', fontSize: 12.5, color: WARNING, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <ClockCircleOutlined style={{ marginTop: 3 }} />
              <span>Awaiting response from mentor within SLA deadline ({selectedBookingForDm?.priorityDm?.deliveryDueUtc ? new Date(selectedBookingForDm.priorityDm.deliveryDueUtc).toLocaleString() : '48 Hours'}).</span>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Process Payout (Approve with UTR / Reject with Refund) */}
      <Modal
        title={
          payoutActionType === 'APPROVE'
            ? `Disburse Payout (${selectedPayoutForAction?.payoutRef || ''})`
            : `Reject Payout Request (${selectedPayoutForAction?.payoutRef || ''})`
        }
        open={Boolean(selectedPayoutForAction)}
        onCancel={() => setSelectedPayoutForAction(null)}
        confirmLoading={actionSubmitting}
        okText={payoutActionType === 'APPROVE' ? 'Confirm Disbursed & Settle' : 'Confirm Rejection & Refund Wallet'}
        okButtonProps={{
          danger: payoutActionType === 'REJECT'
        }}
        onOk={handleProcessPayoutSubmit}
        width={540}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
          {/* Summary Box */}
          <div style={{ ...INNER_BLOCK_STYLE, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: INK }}>
                  {selectedPayoutForAction?.mentorId?.name || 'Creator'}
                </div>
                <div style={{ fontSize: 12.5, color: TEXT_2 }}>
                  @{selectedPayoutForAction?.mentorId?.handle || 'handle'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: TEXT_2, fontWeight: 500 }}>Amount:</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: INK, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  ₹{(selectedPayoutForAction?.amountINR || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Destination details */}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--ux-line)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_2, marginBottom: 6 }}>
                Disbursement Destination:
              </div>
              {selectedPayoutForAction?.payoutMethod === 'UPI' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid var(--ux-line)', padding: '10px 12px', borderRadius: 12 }}>
                  <div style={{ minWidth: 0, wordBreak: 'break-all' }}>
                    <span style={{ fontSize: 12, color: TEXT_2, fontWeight: 500 }}>UPI ID (VPA): </span>
                    <strong style={{ fontFamily: 'monospace', fontSize: 13, color: INK, fontWeight: 600 }}>
                      {selectedPayoutForAction?.payoutDetails?.upiId || 'N/A'}
                    </strong>
                  </div>
                  {selectedPayoutForAction?.payoutDetails?.upiId && (
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPayoutForAction?.payoutDetails?.upiId);
                        message.success('UPI ID copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid var(--ux-line)', padding: '10px 12px', borderRadius: 12, fontSize: 12.5, color: TEXT_2, lineHeight: 1.7 }}>
                  <div><strong style={{ color: TEXT, fontWeight: 600 }}>Account Holder:</strong> {selectedPayoutForAction?.payoutDetails?.accountHolderName || 'N/A'}</div>
                  <div><strong style={{ color: TEXT, fontWeight: 600 }}>A/C Number:</strong> {selectedPayoutForAction?.payoutDetails?.accountNumber || 'N/A'}</div>
                  <div><strong style={{ color: TEXT, fontWeight: 600 }}>IFSC Code:</strong> {selectedPayoutForAction?.payoutDetails?.ifscCode || 'N/A'} ({selectedPayoutForAction?.payoutDetails?.bankName || ''})</div>
                </div>
              )}
            </div>
          </div>

          {/* Action-specific fields */}
          {payoutActionType === 'APPROVE' ? (
            <div>
              <div style={{ ...INNER_BLOCK_STYLE, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', fontSize: 12.5, color: TEXT_2, marginBottom: 14 }}>
                <InfoCircleOutlined style={{ color: INK, marginTop: 3 }} />
                <span><strong style={{ color: INK, fontWeight: 600 }}>Instructions:</strong> Transfer <strong style={{ color: INK, fontWeight: 600 }}>₹{(selectedPayoutForAction?.amountINR || 0).toLocaleString('en-IN')}</strong> to the creator's account via your bank/UPI, then paste the Bank UTR / IMPS ref below to record settlement in the ledger.</span>
              </div>
              <label style={FIELD_LABEL_STYLE}>
                Bank UTR / Transaction Reference <span style={{ color: DANGER }}>*</span>
              </label>
              <Input
                placeholder="e.g. 423901928301 (12-digit UTR or Bank IMPS Ref)"
                value={payoutTxnRef}
                onChange={(e) => setPayoutTxnRef(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <label style={FIELD_LABEL_STYLE}>
                Internal Admin Remarks (Optional)
              </label>
              <Input
                placeholder="e.g. Disbursed via Netbanking"
                value={payoutAdminRemarks}
                onChange={(e) => setPayoutAdminRemarks(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <div style={{ background: '#fff1f0', borderRadius: 16, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', fontSize: 12.5, color: DANGER, marginBottom: 14 }}>
                <AlertOutlined style={{ marginTop: 3 }} />
                <span><strong>Reversal Notice:</strong> Rejecting this request will immediately refund <strong>₹{(selectedPayoutForAction?.amountINR || 0).toLocaleString('en-IN')}</strong> from <code>PAYOUT_HOLD</code> back into the creator's wallet.</span>
              </div>
              <label style={FIELD_LABEL_STYLE}>
                Rejection Reason / Remarks <span style={{ color: DANGER }}>*</span>
              </label>
              <Input.TextArea
                rows={3}
                placeholder="e.g. Invalid UPI ID or Account name mismatch. Please update details and re-request."
                value={payoutAdminRemarks}
                onChange={(e) => setPayoutAdminRemarks(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Proof Inspection Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SafetyCertificateOutlined style={{ color: INK }} />
            <span>Verification Proof: @{selectedProofMentor?.handle} ({selectedProofMentor?.name})</span>
          </div>
        }
        open={Boolean(selectedProofMentor)}
        onCancel={() => setSelectedProofMentor(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedProofMentor(null)}>
            Close
          </Button>,
          selectedProofMentor && !selectedProofMentor.isVerified && (
            <Button
              key="approve"
              type="primary"
              onClick={() => {
                handleApproveApplication(selectedProofMentor);
                setSelectedProofMentor(null);
              }}
            >
              Approve & Grant Blue Tick
            </Button>
          )
        ]}
        width={650}
      >
        {selectedProofMentor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...INNER_BLOCK_STYLE, padding: 16, fontSize: 13, color: TEXT_2, lineHeight: 1.7 }}>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>University:</strong> {selectedProofMentor.university || 'Not specified'}</div>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>Country:</strong> {selectedProofMentor.country || 'Not specified'}</div>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>Course / Degree:</strong> {selectedProofMentor.course || 'Not specified'}</div>
              <div><strong style={{ color: TEXT, fontWeight: 600 }}>Graduation Year:</strong> {selectedProofMentor.graduationYear || 'Not specified'}</div>
              {selectedProofMentor.socialLinks?.linkedin && (
                <div style={{ marginTop: 6 }}>
                  <strong style={{ color: TEXT, fontWeight: 600 }}>LinkedIn:</strong>{' '}
                  <a href={selectedProofMentor.socialLinks.linkedin.startsWith('http') ? selectedProofMentor.socialLinks.linkedin : `https://${selectedProofMentor.socialLinks.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'var(--ux-brand-strong)', wordBreak: 'break-all' }}>
                    {selectedProofMentor.socialLinks.linkedin}
                  </a>
                </div>
              )}
            </div>

            {/* Bank Account & Payout Details Section */}
            <div style={{ ...INNER_BLOCK_STYLE, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BankOutlined style={{ color: INK }} /> Bank Account & Payout Setup:
                </div>
                {selectedProofMentor.defaultPayoutDetails?.accountNumber ? (
                  <span className="nx-status nx-status--success">Direct Bank Transfer</span>
                ) : selectedProofMentor.defaultPayoutDetails?.upiId ? (
                  <span className="nx-status nx-status--neutral">Instant UPI (VPA)</span>
                ) : (
                  <span className="nx-status nx-status--warning">Not Provided</span>
                )}
              </div>

              {selectedProofMentor.defaultPayoutDetails?.accountNumber ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: TEXT_2 }}>Account Holder:</span>
                    <div style={{ fontWeight: 600, color: INK }}>{selectedProofMentor.defaultPayoutDetails.accountHolderName || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ color: TEXT_2 }}>Bank Name:</span>
                    <div style={{ fontWeight: 600, color: INK }}>{selectedProofMentor.defaultPayoutDetails.bankName || 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ color: TEXT_2 }}>Account Number:</span>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', color: INK }}>{selectedProofMentor.defaultPayoutDetails.accountNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: TEXT_2 }}>IFSC Code:</span>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', color: INK }}>{selectedProofMentor.defaultPayoutDetails.ifscCode}</div>
                  </div>
                </div>
              ) : selectedProofMentor.defaultPayoutDetails?.upiId ? (
                <div style={{ fontSize: 13, wordBreak: 'break-all' }}>
                  <span style={{ color: TEXT_2 }}>UPI Virtual Payment Address: </span>
                  <strong style={{ fontFamily: 'monospace', color: INK, fontSize: 14, fontWeight: 600 }}>{selectedProofMentor.defaultPayoutDetails.upiId}</strong>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: WARNING }}>
                  Mentor has not submitted any payout credentials yet. They will not be able to publish paid services until bank info is saved.
                </div>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13.5, color: INK }}>Uploaded Proof / Student ID Document:</div>
              {selectedProofMentor.verificationDocUrl?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                <img
                  src={selectedProofMentor.verificationDocUrl.startsWith('http') ? selectedProofMentor.verificationDocUrl : `${frontendUrl}${selectedProofMentor.verificationDocUrl}`}
                  alt="Student ID Proof"
                  style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 16, border: '1px solid var(--ux-line)' }}
                />
              ) : (
                <div style={{ ...INNER_BLOCK_STYLE, padding: 20, textAlign: 'center' }}>
                  <p style={{ marginBottom: 12, color: TEXT_2, fontSize: 13, wordBreak: 'break-all' }}>
                    Document link: {selectedProofMentor.verificationDocUrl}
                  </p>
                  <Button
                    type="primary"
                    href={selectedProofMentor.verificationDocUrl.startsWith('http') ? selectedProofMentor.verificationDocUrl : `${frontendUrl}${selectedProofMentor.verificationDocUrl}`}
                    target="_blank"
                    icon={<DownloadOutlined />}
                  >
                    Open / Download Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Prompt Modal */}
      <Modal
        title="Reject Mentor Application"
        open={isRejectModalOpen}
        onCancel={() => {
          setIsRejectModalOpen(false);
          setSelectedRejectMentor(null);
          setRejectionReasonInput('');
        }}
        onOk={handleRejectApplication}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <p style={{ color: TEXT_2, fontSize: 13.5 }}>
          Are you sure you want to reject the application for <strong style={{ color: INK }}>@{selectedRejectMentor?.handle}</strong>?
          Provide a reason below (sent to the mentor):
        </p>
        <Input.TextArea
          rows={3}
          placeholder="e.g. Student ID is expired or unreadable. Please provide current semester enrollment letter."
          value={rejectionReasonInput}
          onChange={(e) => setRejectionReasonInput(e.target.value)}
        />
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal
        title={`Refund booking ${refundBooking?.bookingRef || ''}?`}
        open={Boolean(refundBooking)}
        onCancel={() => {
          if (refundSubmitting) return;
          setRefundBooking(null);
          setRefundReason('');
        }}
        onOk={handleRefundSubmit}
        confirmLoading={refundSubmitting}
        okText="Yes, refund in full"
        okButtonProps={{ danger: true }}
      >
        <p style={{ color: TEXT_2, fontSize: 13.5 }}>
          This refunds <strong style={{ color: INK }}>{formatINR(refundBooking?.settlement?.grossINR ?? refundBooking?.amountPaid)}</strong> in full to{' '}
          <strong style={{ color: INK }}>{refundBooking?.studentName || 'the student'}</strong> and reverses the transfer to{' '}
          <strong style={{ color: INK }}>@{refundBooking?.mentorId?.handle || 'the mentor'}</strong>. This can't be undone.
        </p>
        <label style={FIELD_LABEL_STYLE}>
          Reason (optional)
        </label>
        <Input.TextArea
          rows={3}
          placeholder="e.g. Mentor did not attend the session."
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
        />
      </Modal>

      {/* Modal: Dispatch Notification / Broadcast to Mentors */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="nx-icon-circle">
              <SendOutlined />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>Dispatch Notification to Mentors</div>
              <div style={{ fontSize: 12.5, color: TEXT_2, fontWeight: 400 }}>Send platform announcements, payout alerts, or direct notices to creators.</div>
            </div>
          </div>
        }
        open={isBroadcastModalOpen}
        onCancel={() => setIsBroadcastModalOpen(false)}
        confirmLoading={broadcastSending}
        okText="Dispatch Notification"
        onOk={handleSendBroadcast}
        width={620}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          {/* Target Audience */}
          <div>
            <label style={FIELD_LABEL_STYLE}>
              Target Audience <span style={{ color: DANGER }}>*</span>
            </label>
            <Radio.Group
              value={broadcastForm.targetType}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, targetType: e.target.value, targetMentorId: '' })}
              style={{ marginBottom: broadcastForm.targetType === 'SPECIFIC' ? 8 : 0 }}
            >
              <Radio.Button value="ALL"><TeamOutlined /> All Mentors ({mentors.length} creators)</Radio.Button>
              <Radio.Button value="SPECIFIC">Specific Mentor</Radio.Button>
            </Radio.Group>

            {broadcastForm.targetType === 'SPECIFIC' && (
              <Select
                showSearch
                placeholder="Search mentor by name or @handle..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                value={broadcastForm.targetMentorId || undefined}
                onChange={(val) => {
                  const m = mentors.find(item => item._id === val);
                  setBroadcastForm({
                    ...broadcastForm,
                    targetMentorId: val,
                    targetMentorHandle: m?.handle || '',
                    targetMentorName: m?.name || ''
                  });
                }}
                style={{ width: '100%', marginTop: 8 }}
                options={mentors.map(m => ({
                  value: m._id,
                  label: `${m.name} (@${m.handle}) - ${m.university || 'Creator'}`
                }))}
              />
            )}
          </div>

          {/* Category & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={FIELD_LABEL_STYLE}>
                Category
              </label>
              <Select
                value={broadcastForm.category}
                onChange={(val) => setBroadcastForm({ ...broadcastForm, category: val })}
                style={{ width: '100%' }}
                options={[
                  { value: 'ANNOUNCEMENT', label: 'Announcement' },
                  { value: 'URGENT', label: 'Urgent Notice' },
                  { value: 'PAYOUT', label: 'Payout Notice' },
                  { value: 'SYSTEM', label: 'System Update' },
                  { value: 'GENERAL', label: 'General Notice' }
                ]}
              />
            </div>
            <div>
              <label style={FIELD_LABEL_STYLE}>
                Priority Level
              </label>
              <Select
                value={broadcastForm.priority}
                onChange={(val) => setBroadcastForm({ ...broadcastForm, priority: val })}
                style={{ width: '100%' }}
                options={[
                  { value: 'NORMAL', label: 'Normal Priority' },
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'URGENT', label: 'Critical / Urgent' },
                  { value: 'LOW', label: 'Low' }
                ]}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={FIELD_LABEL_STYLE}>
              Notification Title <span style={{ color: DANGER }}>*</span>
            </label>
            <Input
              placeholder="e.g. New Payout Settlement Schedule & Verification Perks"
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              maxLength={120}
            />
          </div>

          {/* Message */}
          <div>
            <label style={FIELD_LABEL_STYLE}>
              Message Content <span style={{ color: DANGER }}>*</span>
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Type your announcement or message to mentors here..."
              value={broadcastForm.message}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
            />
          </div>

          {/* Action Link & Text */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={FIELD_LABEL_STYLE}>
                Action Link (Optional)
              </label>
              <Input
                placeholder="e.g. /dashboard?tab=earnings or https://..."
                value={broadcastForm.actionLink}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, actionLink: e.target.value })}
              />
            </div>
            <div>
              <label style={FIELD_LABEL_STYLE}>
                Action Button Text (Optional)
              </label>
              <Input
                placeholder="e.g. View Earnings or Learn More"
                value={broadcastForm.actionText}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, actionText: e.target.value })}
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div style={{ ...INNER_BLOCK_STYLE, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_2, marginBottom: 8 }}>
              Mentor View Preview:
            </div>
            <div style={{
              background: '#ffffff',
              border: broadcastForm.priority === 'URGENT' ? '1px solid #fecaca' : '1px solid var(--ux-line-2)',
              borderRadius: 12,
              padding: '12px 14px',
              borderLeft: broadcastForm.priority === 'URGENT' ? `4px solid ${DANGER}` : '4px solid var(--ux-brand)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5, color: INK }}>
                  {broadcastForm.title || 'Notification Headline'}
                </span>
                <span className="nx-status nx-status--neutral" style={{ height: 20, fontSize: 11, flexShrink: 0 }}>
                  {broadcastForm.category}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: TEXT_2, lineHeight: 1.45 }}>
                {broadcastForm.message || 'The notification body text will appear like this inside the creator dashboard notification center.'}
              </div>
              {broadcastForm.actionText && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {broadcastForm.actionText} <ArrowRightOutlined style={{ fontSize: 10 }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UniCoachAdminHub;
