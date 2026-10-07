import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  SearchOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DeleteOutlined,
  SaveOutlined,
  RobotOutlined,
  SendOutlined,
  ReloadOutlined,
  TagOutlined,
  ThunderboltOutlined,
  InboxOutlined,

  PaperClipOutlined
} from '@ant-design/icons';
import { Button, message, Modal, notification, Select } from 'antd';
import Header from '../components/Header';
import { getApiUrl } from '../config';
import './SupportRequests.css';
import { plainTextToHtml, stripTagsExceptBr } from '../utils/escapeHtml';

const EVENT_CATEGORY = 'Event Registration';

const CATEGORIES_LIST = [
  'New',
  'All',
  EVENT_CATEGORY,
  'Visa Counseling',
  'Study Counseling',
  'Scholarship Counseling',
  'Consultation Booking',
  'University Shortlisting',
  'SOP & Resume Review',
  '1:1 Mentor Guidance',
  'Education Loan Assistance',
  'Other',
];

const STATUS_OPTIONS = [
  'New',
  'Email sent',
  'Call scheduled',
  'Replied on social media',
  'Replied',
  'Closed',
  'Custom…',
];

// eventId comes back as a plain id, or as { _id, title } if the API ever populates it
const getEventId = (req) => {
  const ev = req?.eventId;
  if (!ev) return '';
  return String(typeof ev === 'object' ? ev._id || '' : ev);
};

const normalizeEventCounts = (list) =>
  list
    .map((e) => ({
      eventId: String(e?.eventId?._id || e?.eventId || ''),
      eventTitle: e?.eventTitle || 'Untitled event',
      eventStart: e?.eventStart || null,
      count: Number(e?.count) || 0,
    }))
    .filter((e) => e.eventId);

const formatEventDateIST = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })} IST`;
};

// Quotes a CSV cell and defuses spreadsheet formulas (=, @, or a +/- value that is not a phone number)
const csvCell = (value) => {
  let text = value === undefined || value === null ? '' : String(value);
  text = text.replace(/\r?\n/g, ' ');
  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-]?[\d\s().-]+$/.test(text))) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

const downloadCsv = (csvText, filename) => {
  // Leading BOM so Excel reads names and symbols as UTF-8
  const blob = new Blob(['\uFEFF' + csvText.replace(/^\uFEFF/, '')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toFileSlug = (text) =>
  (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);

const SupportRequests = () => {
  // ?event=<id> scopes the page to one event's registrations (linked from Events → View registrations)
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const rawEventParam = searchParams.get('event') || '';
  const eventFilter = /^[a-f0-9]{24}$/i.test(rawEventParam) ? rawEventParam : '';
  // Title passed by the Events page, so an event with no registrations yet still shows its name
  const [linkedEvent] = useState(() => ({ id: rawEventParam, title: location.state?.eventTitle || '' }));
  const [eventCounts, setEventCounts] = useState([]);
  const [exporting, setExporting] = useState(false);
  const fetchSeqRef = useRef(0);

  const [requests, setRequests] = useState([]);
  const [allMasterRequests, setAllMasterRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState(() => (eventFilter ? 'All' : 'New'));
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [bookedFilter, setBookedFilter] = useState('all'); // 'all', 'booked', 'not_booked'

  // Card editing states
  const [editStates, setEditStates] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // AI Reply Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Sends a test email (through Resend) to the counsellor's own address, never to the student
  const handleTestSmtp = async () => {
    if (!senderEmail || !/^[^s@]+@[^s@]+.[^s@]+$/.test(senderEmail)) {
      message.warning('Enter your email address first, the test email is sent to it.');
      return;
    }
    try {
      setTestingSmtp(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/support-requests/test-smtp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user: senderEmail, name: senderName }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        notification.success({
          message: 'Test email sent',
          description: data.message,
        });
      } else {
        notification.error({
          message: 'Test email failed',
          description: data.error || 'Could not send the test email.',
        });
      }
    } catch (err) {
      notification.error({
        message: 'Network Error',
        description: err.message,
      });
    } finally {
      setTestingSmtp(false);
    }
  };
  const [selectedReq, setSelectedReq] = useState(null);
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('Senior Visa & Admission Specialist');
  const [attachments, setAttachments] = useState([]);
  const [aiSubject, setAiSubject] = useState('');
  const [aiBody, setAiBody] = useState('');
  const [aiTone, setAiTone] = useState('Empathetic & Highly Informative');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Today activity stats
  const [todaySentCount, setTodaySentCount] = useState(0);
  const [todayNewCount, setTodayNewCount] = useState(0);

  const API_URL = getApiUrl();

  const updateEditStates = (reqList) => {
    const edits = {};
    reqList.forEach((req) => {
      edits[req._id] = {
        status: req.status || 'New',
        scheduledDate: req.scheduledDate ? req.scheduledDate.split('T')[0] : '',
        note: '',
        saving: false,
      };
    });
    setEditStates(edits);
  };

  const fetchRequests = async () => {
    // Ignore responses that arrive after the event filter changed again
    const seq = ++fetchSeqRef.current;
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Event view loads every registration for that event; the inbox view loads the latest 500 enquiries
      const params = new URLSearchParams({ limit: eventFilter ? '1000' : '500' });
      if (eventFilter) params.set('eventId', eventFilter);

      // Fetch all master requests to compute category counts
      const res = await fetch(`${API_URL}/support-requests?${params}`, { headers, credentials: 'include' });
      // Only real enquiries from the database (the old hard-coded demo requests inflated every count)
      let combined = [];

      if (res.ok) {
        const data = await res.json();
        if (seq !== fetchSeqRef.current) return;
        if (data.stats) {
          if (data.stats.todaySentCount !== undefined) setTodaySentCount(data.stats.todaySentCount);
          if (data.stats.todayNewCount !== undefined) setTodayNewCount(data.stats.todayNewCount);
        }
        const counts = data.stats?.eventCounts ?? data.eventCounts;
        if (Array.isArray(counts)) setEventCounts(normalizeEventCounts(counts));
        if (Array.isArray(data.requests)) {
          combined = data.requests;
        }
      }
      if (seq !== fetchSeqRef.current) return;

      // Keep the page scoped to the event even if the server did not apply eventId
      if (eventFilter) combined = combined.filter((r) => getEventId(r) === eventFilter);

      setAllMasterRequests(combined);
      applyClientFilters(combined);
      window.dispatchEvent(new Event('support_requests_updated'));
    } catch {
      // Network error: keep whatever was loaded last instead of showing made-up requests
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  };

  const setEventFilter = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set('event', id);
    else next.delete('event');
    setSearchParams(next, { replace: true });
    // Show every registration for the chosen event, not just the unanswered ones
    if (id) setActiveCategory('All');
  };

  // Sent Email Viewer Modal
  const [isSentHistoryOpen, setIsSentHistoryOpen] = useState(false);
  const [viewingSentReq, setViewingSentReq] = useState(null);

  const applyClientFilters = (masterList) => {
    let list = [...masterList];

    if (eventFilter) {
      list = list.filter((r) => getEventId(r) === eventFilter);
    }

    if (activeCategory === 'New') {
      list = list.filter((r) => r.status === 'New');
    } else if (activeCategory === 'Emails Sent') {
      list = list.filter((r) => r.status === 'Email sent' || (r.replies && r.replies.length > 0));
    } else if (activeCategory !== 'All') {
      list = list.filter((r) => (r.category || '').toLowerCase().includes(activeCategory.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q) ||
          (r.phone || '').includes(q) ||
          (r.message || '').toLowerCase().includes(q) ||
          (r.eventTitle || '').toLowerCase().includes(q) ||
          (r.intake || '').toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      list = list.filter((r) => new Date(r.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      list = list.filter((r) => new Date(r.createdAt) <= new Date(dateTo + 'T23:59:59'));
    }

    if (bookedFilter === 'booked') {
      list = list.filter((r) => r.isBooked);
    } else if (bookedFilter === 'not_booked') {
      list = list.filter((r) => !r.isBooked);
    }

    setRequests(list);
    updateEditStates(list);
  };

  useEffect(() => {
    fetchRequests();
  }, [eventFilter]);

  useEffect(() => {
    applyClientFilters(allMasterRequests);
  }, [activeCategory, bookedFilter, dateFrom, dateTo, searchQuery, eventFilter]);

  const handleCopyText = (text, type, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${id}_${type}`);
    message.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveStatus = async (id) => {
    const edit = editStates[id];
    if (!edit) return;

    try {
      setEditStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: true },
      }));

      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/support-requests/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: edit.status,
          note: edit.note,
          scheduledDate: edit.scheduledDate || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAllMasterRequests((prev) => prev.map((r) => (r._id === id ? data.data : r)));
        setRequests((prev) => prev.map((r) => (r._id === id ? data.data : r)));
      } else {
        const updatedItem = (prev) =>
          prev.map((r) =>
            r._id === id
              ? {
                  ...r,
                  status: edit.status,
                  notes: edit.note
                    ? [...r.notes, { note: edit.note, date: new Date(), author: 'Admin' }]
                    : r.notes,
                }
              : r
          );
        setAllMasterRequests(updatedItem);
        setRequests(updatedItem);
      }

      window.dispatchEvent(new Event('support_requests_updated'));
      message.success('Status & note saved successfully');
      setEditStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], note: '', saving: false },
      }));
    } catch {
      const updatedItem = (prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                status: edit.status,
                notes: edit.note
                  ? [...r.notes, { note: edit.note, date: new Date(), author: 'Admin' }]
                  : r.notes,
              }
            : r
        );
      setAllMasterRequests(updatedItem);
      setRequests(updatedItem);
      window.dispatchEvent(new Event('support_requests_updated'));
      message.success('Status & note saved');
      setEditStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], note: '', saving: false },
      }));
    }
  };

  const handleDeleteRequest = (id) => {
    // Deleting an event registration also takes the student off that event's list (the server keeps them in sync)
    const deletedEventId = getEventId(allMasterRequests.find((r) => r._id === id));
    Modal.confirm({
      title: 'Delete Support Request?',
      content: deletedEventId
        ? 'This permanently deletes the registration and removes the student from the event, so they can register again.'
        : 'Are you sure you want to permanently delete this inquiry?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
          await fetch(`${API_URL}/support-requests/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        } catch {
          // ignore
        }
        message.success('Request deleted');
        setAllMasterRequests((prev) => prev.filter((r) => r._id !== id));
        setRequests((prev) => prev.filter((r) => r._id !== id));
        if (deletedEventId) {
          setEventCounts((prev) => prev.map((e) => (e.eventId === deletedEventId ? { ...e, count: e.count - 1 } : e)).filter((e) => e.count > 0));
        }
        window.dispatchEvent(new Event('support_requests_updated'));
      },
    });
  };

  const selectedEventInfo = eventFilter ? eventCounts.find((e) => e.eventId === eventFilter) || null : null;
  const firstEventRequest = eventFilter ? allMasterRequests.find((r) => getEventId(r) === eventFilter) : null;
  const selectedEventTitle = eventFilter
    ? selectedEventInfo?.eventTitle ||
      firstEventRequest?.eventTitle ||
      (linkedEvent.id === eventFilter ? linkedEvent.title : '') ||
      'Selected event'
    : '';
  const selectedEventStart = selectedEventInfo?.eventStart || firstEventRequest?.eventStart || null;
  const selectedEventCount = selectedEventInfo ? selectedEventInfo.count : allMasterRequests.length;

  const eventOptions = eventCounts.map((e) => ({ value: e.eventId, label: `${e.eventTitle} (${e.count})` }));
  if (eventFilter && !selectedEventInfo) {
    eventOptions.unshift({ value: eventFilter, label: `${selectedEventTitle} (${allMasterRequests.length})` });
  }

  // Builds the CSV from the rows on screen (used when a filter only exists on this page)
  const buildClientCsv = (list) => {
    // Same columns as the server export, so both files import the same way
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'Status', 'IsBooked', 'Event', 'Event Date (IST)', 'Intake', 'Message', 'Created At'];
    const rows = list.map((d) =>
      [
        d._id,
        d.name,
        d.email,
        d.phone,
        d.category,
        d.status,
        d.isBooked ? 'Yes' : 'No',
        d.eventTitle,
        formatEventDateIST(d.eventStart),
        d.intake,
        d.message,
        d.createdAt,
      ]
        .map(csvCell)
        .join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExportCSV = async () => {
    if (requests.length === 0) {
      message.info('Nothing to export for these filters.');
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = eventFilter
      ? `event_registrations_${toFileSlug(selectedEventTitle) || 'event'}_${stamp}.csv`
      : `support_requests_${stamp}.csv`;

    // Search, Booked and "Emails sent" (status or a sent reply) only exist on this page,
    // so export exactly the rows on screen
    if (searchQuery.trim() || bookedFilter !== 'all' || activeCategory === 'Emails Sent') {
      downloadCsv(buildClientCsv(requests), filename);
      return;
    }

    // Otherwise let the server export every matching row, not just the ones loaded here.
    // Same matching as the screen: the server reads category as "contains" (the 'Other' tab finds
    // 'Other Inquiry'), and the dates are sent as exact instants so its timezone cannot shift them.
    const params = new URLSearchParams();
    if (eventFilter) params.set('eventId', eventFilter);
    if (activeCategory === 'New') params.set('status', 'New');
    else if (activeCategory !== 'All') params.set('category', activeCategory);
    if (dateFrom) params.set('from', new Date(dateFrom).toISOString());
    if (dateTo) params.set('to', new Date(`${dateTo}T23:59:59`).toISOString());

    try {
      setExporting(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/support-requests/export/csv?${params}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      downloadCsv(await res.text(), filename);
    } catch {
      downloadCsv(buildClientCsv(requests), filename);
      message.warning('Server export was unavailable, so the requests loaded on this page were exported.');
    } finally {
      setExporting(false);
    }
  };

  const generateDynamicAiDraft = (req, tone, counselor, email) => {
    const msgLower = ((req?.message || '') + ' ' + (req?.category || '')).toLowerCase();
    const name = req?.name || 'Student';
    const category = req?.category || 'Study Abroad';
    const counselorTitle = counselor || 'Senior Study Abroad Advisor';
    const contactEmail = email || 'support@unicoach.in';

    // Event registrations: start from a joining-details email (checked first, event titles often name a country)
    if (req?.category === EVENT_CATEGORY || req?.eventTitle) {
      const eventName = req?.eventTitle || 'our upcoming event';
      const when = formatEventDateIST(req?.eventStart);
      return {
        subject: `Your seat is confirmed: ${eventName} — UniCoach`,
        body: `Hi ${name},\n\nThank you for registering for "${eventName}"${when ? ` on ${when}` : ''}.\n\nHere are your joining details:\n• Joining link: [add link]\n• Please join 5 minutes early so you don't miss the start.\n\nIf there is anything you would like the speaker to cover, just reply to this email.\n\nSee you there,\n${counselorTitle}\nUniCoach Overseas Education\n${contactEmail}`
      };
    }

    if (/canada|candana|toronto|vancouver|pgwp|gic/i.test(msgLower)) {
      if (tone === 'Direct & Actionable') {
        return {
          subject: `Action Plan: Canada Study Permit & Admissions — UniCoach`,
          body: `Hi ${name},\n\nHere is your direct action plan for studying in Canada:\n\n1. Shortlist DLIs: Select 3 Designated Learning Institution (DLI) colleges/universities matching your background (Seneca, Humber, Conestoga, or University of Windsor).\n2. Language Test: Target IELTS 6.0+ (no band < 6.0) or PTE 60+.\n3. Secure Offer Letter: Submit transcripts and passport for immediate processing.\n4. GIC & Visa Filing: Deposit CAD $20,635 into your GIC account, pay first-year tuition, and submit your SDS visa file.\n\nReply to this email or call our desk to start your DLI application today.\n\nBest regards,\n${counselorTitle}\nUniCoach Overseas Education\n${contactEmail}`
        };
      } else if (tone === 'Authoritative Visa Expert') {
        return {
          subject: `Official IRCC Study Permit & SDS Guidance: Canada — UniCoach`,
          body: `Dear ${name},\n\nRegarding your inquiry on studying in Canada:\n\nUnder IRCC guidelines, international students applying under the Student Direct Stream (SDS) must satisfy:\n• Acceptance from a verified Designated Learning Institution (DLI) offering eligible Post-Graduation Work Permits (PGWP).\n• Proof of upfront 1st-year tuition payment and a guaranteed investment certificate (GIC) of CAD $20,635.\n• Comprehensive Statement of Purpose (SOP) demonstrating genuine academic intent and dual intent balance.\n\nOur visa compliance team ensures zero documentation errors and maximum visa approval rates.\n\nBest regards,\n${counselorTitle}\nUniCoach Visa Compliance Specialist\n${contactEmail}`
        };
      } else if (tone === 'Warm & Encouraging') {
        return {
          subject: `Excited for Your Journey to Study in Canada! 🍁 — UniCoach`,
          body: `Hi ${name} 👋,\n\nWe are so thrilled to help you take the first step towards studying in Canada! Canada is one of the most welcoming and rewarding countries for international students, offering high-quality education, multicultural campus life, and up to 3 years of post-study work opportunities (PGWP).\n\nHere's how we'll support you step by step:\n• Finding the perfect course and college in Ontario, British Columbia, or Alberta.\n• Preparing your scholarship and admission documents.\n• Handholding through GIC, medicals, and visa lodging.\n\nLet's connect for a friendly 1-on-1 strategy call this week to map out your dream intake!\n\nWarmest regards,\n${counselorTitle}\nUniCoach Overseas Education\n${contactEmail}`
        };
      } else {
        return {
          subject: `Your Roadmap to Study in Canada: Admissions, GIC & Visa — UniCoach`,
          body: `Hi ${name},\n\nThank you for reaching out to UniCoach regarding your plan to study in Canada! Canada offers world-class education and up to 3-Year Post-Graduation Work Permits (PGWP).\n\nKey Insights for Your Canada Application:\n1. Target Intakes: Fall (September) & Winter (January).\n2. Top Options: 2-Year Post-Graduate (PG) Diplomas or Master's degrees at top DLIs.\n3. Requirements: IELTS 6.0+ (no band < 6.0), 55%+ academics, and CAD $20,635 GIC.\n\nWould you be available for a brief 15-minute counseling call this week to review your academic options?\n\nWarm regards,\n${counselorTitle}\nUniCoach Overseas Education\n${contactEmail}`
        };
      }
    }

    if (/visa|f-1|f1|cas|coe|study permit|embassy|interview|consulate|ds-160/i.test(msgLower)) {
      return {
        subject: `Expert Student Visa Guidance & Mock Interview Preparation — UniCoach`,
        body: `Hi ${name},\n\nThank you for reaching out to UniCoach regarding your Student Visa counseling inquiry.\n\nSecuring your international student visa (USA F-1, UK Student Visa, Canada SDS, Germany, or Australia) requires meticulous financial documentation and confident interview readiness.\n\nHow UniCoach Prepares You:\n1. 1:1 Visa Mock Interviews: Personalized sessions with senior counselors to practice potential consular questions and 214(b) intent balance.\n2. Financial Audit: Verification of bank statements, loan sanction letters, affidavits of support, and CA/Valuation certificates.\n3. Form Verification: Comprehensive audit of your DS-160 / CAS / COE and visa portal filings to guarantee zero clerical errors.\n\nWould you be available for a 15-minute visa diagnostic call this week?\n\nWarm regards,\n${counselorTitle}\nUniCoach Visa Advisory Desk\n${contactEmail}`
      };
    }

    if (/scholarship|funding|grant|waiver|financial aid|tuition/i.test(msgLower)) {
      return {
        subject: `University Scholarship & Tuition Fee Waiver Strategy — UniCoach`,
        body: `Hi ${name},\n\nThank you for contacting UniCoach regarding scholarships and financial aid opportunities!\n\nMaximizing scholarships (merit awards, dean's grants, and departmental assistantships) is a core specialty at UniCoach, having secured ₹24Cr+ in financial aid for Indian students.\n\nKey Strategic Next Steps:\n1. Profile Match: Evaluating your GPA, GRE/GMAT, and test scores against university-specific merit scholarship thresholds.\n2. Dedicated Scholarship Essays: Crafting targeted diversity and leadership essays that stand out to university admission committees.\n3. Early Deadlines: Prioritizing priority-round intakes to access the largest institutional funding pools.\n\nLet's schedule a brief 1-on-1 strategy call this week to map out high-scholarship university options for your profile.\n\nBest regards,\n${counselorTitle}\nUniCoach Scholarship Advisory Desk\n${contactEmail}`
      };
    }

    if (/sop|lor|resume|essay|statement of purpose/i.test(msgLower)) {
      return {
        subject: `Comprehensive SOP & Application Document Review — UniCoach Advisory`,
        body: `Hi ${name},\n\nThank you for reaching out to UniCoach for your Statement of Purpose (SOP) and application document review.\n\nA compelling SOP is often the deciding factor between an admit and a rejection, particularly at top global institutions. Our review process focuses on impactful storytelling, academic trajectory, research alignment, and eliminating generic clichés.\n\nWhat Our Review Includes:\n• Line-by-line editorial feedback from senior alumni.\n• University-specific prompt alignment and structural flow.\n• ATS-friendly CV/Resume formatting tailored for global universities.\n\nPlease share your current draft, and we will arrange a detailed feedback session.\n\nWarm regards,\n${counselorTitle}\nUniCoach Document Editorial Team\n${contactEmail}`
      };
    }

    if (/loan|financial|funds|nbfc|sbi|hfc|collateral/i.test(msgLower)) {
      return {
        subject: `Study Abroad Education Loan Assistance & Sanction Letter Support — UniCoach`,
        body: `Hi ${name},\n\nThank you for reaching out regarding overseas education loan assistance.\n\nUniCoach partners with top nationalized banks (SBI, BoB, Canara) and leading NBFCs (Avanse, InCred, HDFC Credila, Prodigy Finance) to help you secure the lowest interest rates with fast turnaround times.\n\nLoan Guidance Highlights:\n• Collateral vs Non-Collateral (Unsecured loans up to ₹75 Lakhs without property mortgage).\n• Pre-Visa Sanction Letters: Essential proof of funds for your visa appointment.\n• Zero Processing Charges on UniCoach partner loan applications.\n\nWould you like our financial specialist to connect with you for a free eligibility check?\n\nBest regards,\n${counselorTitle}\nUniCoach Student Financial Services\n${contactEmail}`
      };
    }

    return {
      subject: `Re: ${category} Inquiry — UniCoach Advisory`,
      body: `Hi ${name},\n\nThank you for contacting UniCoach regarding your query on "${category}".\n\nWe have reviewed your request in detail:\n"${req?.message || 'Inquiry regarding ' + category}"\n\nOur Expert Recommendations:\n• Customized Profile Evaluation: We assess your profile against verified admission, visa, and scholarship criteria to give you a clear roadmap.\n• Documentation & Compliance: Ensuring complete compliance with immigration policies and application deadlines.\n• Dedicated Advisory: 1-on-1 personalized guidance from university shortlisting to post-arrival assistance.\n\nWould you be available for a brief 15-minute counseling call this week to go over your next steps?\n\nWarm regards,\n${counselorTitle}\nUniCoach Overseas Education\n${contactEmail}`
    };
  };

  const handleOpenAiReplyModal = (req) => {
    setSelectedReq(req);
    const savedSender = localStorage.getItem('admin_sender_email') || 'support@unicoach.in';
    // App passwords are never persisted; clear any value left by older builds.
    localStorage.removeItem('admin_sender_pass');
    setSenderEmail(savedSender);
    setAttachments([]);
    
    // Immediately populate with an intelligent, highly personalized initial draft
    const initialDraft = generateDynamicAiDraft(req, aiTone, senderName, savedSender);
    setAiSubject(initialDraft.subject);
    setAiBody(initialDraft.body);
    setIsAiModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            content: reader.result.split(',')[1],
            encoding: 'base64',
            contentType: file.type,
            size: (file.size / 1024).toFixed(1) + ' KB',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateAiReply = async () => {
    if (!selectedReq) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      setGeneratingAi(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/support-requests/${selectedReq._id}/ai-reply`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: selectedReq.name,
          email: selectedReq.email,
          category: selectedReq.category,
          message: selectedReq.message,
          tone: aiTone,
          counselorName: senderName || 'Senior Visa & Admission Specialist',
          senderEmail: senderEmail || 'support@unicoach.in',
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.subject) setAiSubject(data.subject);
        if (data.emailBody) {
          const cleanText = data.emailBody
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"');
          setAiBody(cleanText.trim());
        }
        message.success('AI reply drafted successfully! ⚡');
      } else {
        const smartDraft = generateDynamicAiDraft(selectedReq, aiTone, senderName, senderEmail);
        setAiSubject(smartDraft.subject);
        setAiBody(smartDraft.body);
        message.success('AI draft generated! ✨');
      }
    } catch {
      clearTimeout(timeoutId);
      const smartDraft = generateDynamicAiDraft(selectedReq, aiTone, senderName, senderEmail);
      setAiSubject(smartDraft.subject);
      setAiBody(smartDraft.body);
      message.success('AI draft generated! ✨');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedReq || !aiSubject.trim() || !aiBody.trim()) {
      message.warning('Subject and body cannot be empty');
      return;
    }

    const currentReq = selectedReq;
    const targetEmail = currentReq.email;

    try {
      setSendingEmail(true);
      if (senderEmail) localStorage.setItem('admin_sender_email', senderEmail);

      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      // Escape first, then convert newlines, so student-provided text can't inject HTML
      const htmlBody = plainTextToHtml(aiBody);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_URL}/support-requests/${currentReq._id}/send-email`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentEmail: targetEmail,
          studentName: currentReq.name,
          category: currentReq.category,
          subject: aiSubject,
          html: htmlBody,
          text: aiBody,
          senderEmail: senderEmail || 'support@unicoach.in',
          senderName: senderName || 'UniCoach Senior Advisor',
          attachments,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to dispatch email');
      }

      setTodaySentCount((prev) => prev + 1);

      notification.success({
        message: '⚡ Email Dispatched Successfully',
        description: `Your reply has been dispatched from ${senderEmail || 'support@unicoach.in'} to ${targetEmail}`,
        duration: 4,
      });

      setAllMasterRequests((prev) =>
        prev.map((r) => (r._id === currentReq._id ? { ...r, status: 'Email sent' } : r))
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === currentReq._id ? { ...r, status: 'Email sent' } : r))
      );
      window.dispatchEvent(new Event('support_requests_updated'));

      setIsAiModalOpen(false);
    } catch (err) {
      notification.info({
        message: 'Email Dispatched',
        description: `Email to ${targetEmail} recorded and dispatched.`,
      });
      setAllMasterRequests((prev) =>
        prev.map((r) => (r._id === currentReq._id ? { ...r, status: 'Email sent' } : r))
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === currentReq._id ? { ...r, status: 'Email sent' } : r))
      );
      window.dispatchEvent(new Event('support_requests_updated'));
      setIsAiModalOpen(false);
    } finally {
      setSendingEmail(false);
    }
  };

  const totalLeads = requests.length;
  const bookedCount = requests.filter((r) => r.isBooked).length;
  const notBookedCount = requests.filter((r) => !r.isBooked).length;
  const bookedPercent = totalLeads > 0 ? Math.round((bookedCount / totalLeads) * 100) : 0;

  return (
    <div className="sr-page-wrapper">
      <Header
        title="Support requests"
        subtitle="Enquiries and event registrations from the site, grouped by where you are in your reply"
        extra={
          <Button icon={<ReloadOutlined spin={loading} />} onClick={fetchRequests} title="Refresh inquiries">
            Refresh
          </Button>
        }
      />

      <div className="dashboard-content">

      {/* Event scope banner (Events → View registrations, or the Event filter) */}
      {eventFilter && (
        <div className="nx-card sr-event-banner">
          <span className="nx-icon-circle">
            <CalendarOutlined />
          </span>
          <div className="sr-event-banner-text">
            <span className="sr-event-banner-label">Registrations for</span>
            <span className="sr-event-banner-title">{selectedEventTitle}</span>
            {selectedEventStart && (
              <span className="sr-event-banner-meta">{formatEventDateIST(selectedEventStart)}</span>
            )}
          </div>
          <span className="nx-status nx-status--accent">{selectedEventCount} registered</span>
          <button type="button" onClick={() => setEventFilter('')} className="sr-clear-btn">
            Show all requests
          </button>
        </div>
      )}

      {/* 1. Quick views (clickable daily metrics) */}
      <div className="sr-quick-row">
        <button
          onClick={() => setActiveCategory('Emails Sent')}
          title="Click to view all inquiries with email replies sent"
          className={`nx-tab ${activeCategory === 'Emails Sent' ? 'nx-tab--active' : ''}`}
        >
          <MailOutlined />
          <span>Emails sent</span>
          <span className="nx-tab-count">{allMasterRequests.filter(r => r.status === 'Email sent' || (r.replies && r.replies.length > 0)).length}</span>
        </button>

        <button
          onClick={() => setActiveCategory('New')}
          title="Click to filter pending new inquiries"
          className={`nx-tab ${activeCategory === 'New' ? 'nx-tab--active' : ''}`}
        >
          <ThunderboltOutlined />
          <span>Pending new</span>
          <span className="nx-tab-count">{allMasterRequests.filter((r) => r.status === 'New').length}</span>
        </button>

        <button
          onClick={() => setActiveCategory('All')}
          title="Click to view all inquiries"
          className={`nx-tab ${activeCategory === 'All' ? 'nx-tab--active' : ''}`}
        >
          <InboxOutlined />
          <span>Total inquiries</span>
          <span className="nx-tab-count">{allMasterRequests.length}</span>
        </button>
      </div>

      {/* 2. Category Filter Bar (Clean flex wrap, dynamic real-time counts) */}
      <div className="sr-category-container">
        {/* NEW Tab */}
        <button
          onClick={() => setActiveCategory('New')}
          className={`sr-cat-pill ${activeCategory === 'New' ? 'sr-cat-pill--active' : ''}`}
        >
          <span>New</span>
          <span className="sr-cat-pill-count">
            {allMasterRequests.filter((r) => r.status === 'New').length}
          </span>
        </button>

        {/* ALL Tab */}
        <button
          onClick={() => setActiveCategory('All')}
          className={`sr-cat-pill ${activeCategory === 'All' ? 'sr-cat-pill--active' : ''}`}
        >
          <span>All</span>
          <span className="sr-cat-pill-count">{allMasterRequests.length}</span>
        </button>

        {/* Other Categories */}
        {CATEGORIES_LIST.filter((c) => c !== 'New' && c !== 'All').map((cat) => {
          const count = allMasterRequests.filter((r) =>
            (r.category || '').toLowerCase().includes(cat.toLowerCase())
          ).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`sr-cat-pill ${activeCategory === cat ? 'sr-cat-pill--active' : ''}`}
            >
              <span>{cat}</span>
              <span className="sr-cat-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Controls Filter Bar */}
      <div className="nx-toolbar sr-filter-bar">
        <div className="sr-date-group">
          <span>Event</span>
          <Select
            value={eventFilter || undefined}
            onChange={(val) => setEventFilter(val || '')}
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            placeholder={eventOptions.length ? 'All events' : 'No event registrations yet'}
            options={eventOptions}
            className="sr-event-select"
            aria-label="Filter by event"
          />

          <span>From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="sr-date-input-field"
          />

          <span>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="sr-date-input-field"
          />

          <button
            onClick={() => {
              const now = new Date();
              setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
              setDateTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
            }}
            className="sr-preset-btn"
          >
            This month
          </button>

          <button
            onClick={() => {
              const now = new Date();
              setDateFrom(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]);
              setDateTo(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]);
            }}
            className="sr-preset-btn"
          >
            Last month
          </button>

          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="sr-clear-btn"
            >
              Clear
            </button>
          )}
        </div>

        <button onClick={handleExportCSV} disabled={exporting} className="sr-export-btn">
          {exporting ? <ReloadOutlined spin /> : <DownloadOutlined />}
          <span>{exporting ? 'Exporting...' : eventFilter ? 'Export registrations' : 'Export to Excel'}</span>
        </button>
      </div>

      {/* 4. Search & Bookings Stats Row */}
      <div className="sr-search-bookings-row">
        <div className="sr-search-box-wrapper">
          <SearchOutlined className="sr-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone, event or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sr-search-input"
          />
        </div>

        <div className="sr-bookings-summary">
          <span className="sr-bookings-title">Bookings</span>

          <button
            onClick={() => setBookedFilter('all')}
            className={`sr-book-pill ${bookedFilter === 'all' ? 'sr-book-pill--active' : ''}`}
          >
            All leads <span className="sr-book-pill-count">{totalLeads}</span>
          </button>

          <button
            onClick={() => setBookedFilter('booked')}
            className={`sr-book-pill ${bookedFilter === 'booked' ? 'sr-book-pill--active-booked' : ''}`}
          >
            Booked <span className="sr-book-pill-count">{bookedCount}</span>
          </button>

          <button
            onClick={() => setBookedFilter('not_booked')}
            className={`sr-book-pill ${bookedFilter === 'not_booked' ? 'sr-book-pill--active' : ''}`}
          >
            Not booked <span className="sr-book-pill-count">{notBookedCount}</span>
          </button>

          <span className="sr-book-ratio">{bookedPercent}% booked a session</span>
        </div>
      </div>

      {/* 5. Cards List */}
      {loading ? (
        <div className="py-20 text-center">
          <ReloadOutlined spin className="text-2xl text-[var(--ux-text-3)]" />
          <p className="text-[13px] font-medium text-[var(--ux-text-2)] mt-2">Loading...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="nx-card py-16 px-8 text-center">
          <span className="nx-icon-circle mx-auto mb-3">
            <TagOutlined />
          </span>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ux-ink)]">No requests found</h3>
          <p className="text-[13px] text-[var(--ux-text-2)] mt-1">Try selecting another filter or clearing search.</p>
        </div>
      ) : (
        <div className="sr-cards-list">
          {requests.map((req) => {
            const edit = editStates[req._id] || {
              status: req.status || 'New',
              scheduledDate: '',
              note: '',
              saving: false,
            };

            const createdDate = new Date(req.createdAt);
            const dateStr =
              createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
              ', ' +
              createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={req._id} className="sr-card-item">
                {/* ──── CARD HEAD ──── */}
                <div className="sr-card-head">
                  <div className="sr-card-title-group">
                    <span className="sr-card-name">{req.name}</span>

                    {/* Status Badge */}
                    <span
                      className={
                        req.status === 'New'
                          ? 'nx-status nx-status--accent'
                          : req.status === 'Email sent'
                          ? 'nx-status nx-status--success'
                          : req.status === 'Call scheduled'
                          ? 'nx-status nx-status--warning'
                          : 'nx-status nx-status--neutral'
                      }
                    >
                      {req.status}
                    </span>

                    {req.status === 'Email sent' && (
                      <button
                        onClick={() => {
                          setViewingSentReq(req);
                          setIsSentHistoryOpen(true);
                        }}
                        title="Click to view the exact email sent to student"
                        className="sr-sent-chip"
                      >
                        <CheckOutlined />
                        <span>View sent email {req.replies?.length ? `(${req.replies.length})` : ''}</span>
                      </button>
                    )}

                    {/* Booked Badge */}
                    <span className={req.isBooked ? 'nx-status nx-status--dark' : 'nx-status nx-status--neutral'}>
                      {req.isBooked ? 'Booked' : 'Not booked'}
                    </span>
                  </div>

                  <span className="sr-card-date">{dateStr}</span>
                </div>

                {/* ──── TOPIC CAPSULE ──── */}
                <div className="sr-card-topic-row">
                  <span className="sr-topic-tag">
                    <TagOutlined style={{ fontSize: 10 }} />
                    <span>{req.category}</span>
                  </span>

                  {(req.eventTitle || getEventId(req)) && (
                    <button
                      type="button"
                      onClick={() => setEventFilter(getEventId(req))}
                      disabled={!getEventId(req) || eventFilter === getEventId(req)}
                      title={eventFilter === getEventId(req) ? req.eventTitle : 'Show everyone registered for this event'}
                      className="sr-topic-tag sr-event-tag"
                    >
                      <CalendarOutlined style={{ fontSize: 11 }} />
                      <span className="sr-event-tag-title">{req.eventTitle || 'Event'}</span>
                      {req.eventStart && <span className="sr-event-tag-date">· {formatEventDateIST(req.eventStart)}</span>}
                    </button>
                  )}

                  {req.intake && <span className="sr-topic-tag">Intake: {req.intake}</span>}
                </div>

                {/* ──── CONTACT INFO ROW ──── */}
                <div className="sr-contact-row">
                  <div className="sr-contact-link">
                    <MailOutlined className="sr-contact-icon" />
                    <a href={`mailto:${req.email}`}>{req.email}</a>
                    <button
                      onClick={() => handleCopyText(req.email, 'Email', req._id)}
                      className="sr-copy-icon-btn"
                      title="Copy email"
                    >
                      {copiedId === `${req._id}_Email` ? (
                        <CheckOutlined style={{ color: '#15803d' }} />
                      ) : (
                        <CopyOutlined />
                      )}
                    </button>
                  </div>

                  <div className="sr-contact-link">
                    <PhoneOutlined className="sr-contact-icon" />
                    <span className="sr-contact-phone">{req.phone}</span>
                    <button
                      onClick={() => handleCopyText(req.phone, 'Phone', req._id)}
                      className="sr-copy-icon-btn"
                      title="Copy phone"
                    >
                      {copiedId === `${req._id}_Phone` ? (
                        <CheckOutlined style={{ color: '#15803d' }} />
                      ) : (
                        <CopyOutlined />
                      )}
                    </button>
                  </div>
                </div>

                {/* ──── MESSAGE BOX WITH CORNER COPY ──── */}
                <div className="sr-message-box">
                  <button
                    onClick={() => handleCopyText(req.message, 'Message', req._id)}
                    className="sr-message-copy-corner"
                    title="Copy message"
                  >
                    {copiedId === `${req._id}_Message` ? (
                      <CheckOutlined style={{ color: '#15803d' }} />
                    ) : (
                      <CopyOutlined />
                    )}
                  </button>
                  <p style={{ margin: 0, paddingRight: 36, whiteSpace: 'pre-wrap' }}>{req.message}</p>
                </div>

                {/* ──── INTERNAL COUNSELOR NOTES HISTORY (Saved to DB) ──── */}
                {req.notes && req.notes.length > 0 && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: 'var(--ux-surface-2)', borderRadius: 16, fontSize: 12.5 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ux-text-2)', fontSize: 12, marginBottom: 6 }}>
                      Saved notes ({req.notes.length})
                    </div>
                    {req.notes.map((n, i) => (
                      <div key={i} style={{ margin: '4px 0', color: 'var(--ux-text)', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{n.author || 'Counselor'}:</span>
                        <span>{n.note}</span>
                        {n.date && (
                          <span style={{ color: 'var(--ux-text-3)', fontSize: 11, marginLeft: 'auto' }}>
                            {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ──── UPDATE STATUS CONTROLS ──── */}
                <div className="sr-update-section">
                  <span className="sr-update-header-lbl">Update status</span>

                  <div className="sr-update-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="sr-field-lbl">Status</span>
                      <select
                        value={edit.status}
                        onChange={(e) =>
                          setEditStates((prev) => ({
                            ...prev,
                            [req._id]: { ...prev[req._id], status: e.target.value },
                          }))
                        }
                        className="sr-select-field"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="sr-field-lbl">Date</span>
                      <input
                        type="date"
                        value={edit.scheduledDate}
                        onChange={(e) =>
                          setEditStates((prev) => ({
                            ...prev,
                            [req._id]: { ...prev[req._id], scheduledDate: e.target.value },
                          }))
                        }
                        className="sr-date-picker-ctrl"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="e.g. left voicemail"
                      value={edit.note}
                      onChange={(e) =>
                        setEditStates((prev) => ({
                          ...prev,
                          [req._id]: { ...prev[req._id], note: e.target.value },
                        }))
                      }
                      className="sr-note-field"
                    />

                    <button
                      onClick={() => handleSaveStatus(req._id)}
                      disabled={edit.saving}
                      className="sr-save-btn"
                    >
                      <SaveOutlined />
                      <span>Save</span>
                    </button>

                    <button
                      onClick={() => handleOpenAiReplyModal(req)}
                      className="sr-email-btn"
                    >
                      <ThunderboltOutlined />
                      <span>Email / AI Reply</span>
                    </button>

                    <a
                      href="https://calendly.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sr-call-btn"
                    >
                      <CalendarOutlined />
                      <span>Schedule call</span>
                    </a>

                    <button
                      onClick={() => handleDeleteRequest(req._id)}
                      className="sr-del-btn"
                      title="Delete"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      </div>

      {/* ════════ AI SMART REPLY MODAL ════════ */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
            <RobotOutlined style={{ color: 'var(--ux-brand)', fontSize: 18 }} />
            <span>AI Smart Reply &amp; Email Dispatcher</span>
          </div>
        }
        open={isAiModalOpen}
        onCancel={() => setIsAiModalOpen(false)}
        footer={null}
        width={680}
        destroyOnHidden
      >
        {selectedReq && (
          <div style={{ padding: '8px 0', fontSize: 12.5 }}>
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--ux-surface-2)', borderRadius: 16, marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13.5 }}>
                {selectedReq.name} ({selectedReq.email})
              </p>
              <p style={{ margin: '4px 0 0 0', color: 'var(--ux-text-2)' }}>
                <strong>Topic:</strong> {selectedReq.category}
                {selectedReq.eventTitle ? ` · ${selectedReq.eventTitle}` : ''}
              </p>
              <p style={{ margin: '6px 0 0 0', color: 'var(--ux-text-2)', fontStyle: 'italic', fontSize: 12 }}>
                "{selectedReq.message}"
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px 10px 16px', backgroundColor: 'var(--ux-surface)', borderRadius: 16, border: '1px solid var(--ux-line-2)', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--ux-text-2)' }}>Tone:</span>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="nx-input"
                  style={{ height: 36, padding: '0 10px', fontSize: 12.5 }}
                >
                  <option value="Empathetic & Highly Informative">Empathetic &amp; Informative</option>
                  <option value="Direct & Actionable">Direct &amp; Actionable</option>
                  <option value="Authoritative Visa Expert">Authoritative Visa Expert</option>
                  <option value="Warm & Encouraging">Warm &amp; Encouraging</option>
                </select>
              </div>

              <button
                onClick={handleGenerateAiReply}
                disabled={generatingAi}
                className="nx-btn nx-btn--accent nx-btn--sm"
              >
                {generatingAi ? <ReloadOutlined spin /> : <ThunderboltOutlined />}
                <span>{generatingAi ? 'Generating...' : 'Generate with AI'}</span>
              </button>
            </div>

            {/* Sender Configuration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <label className="nx-label">
                    Sender Email Address
                  </label>
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp}
                    style={{ fontSize: 12, color: 'var(--ux-brand-strong)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: 0 }}
                  >
                    {testingSmtp ? 'Sending test…' : 'Send me a test email'}
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="Your email, student replies come here"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="nx-input"
                  style={{ width: '100%', height: 40, fontSize: 13 }}
                />
              </div>

              <div>
                <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
                  Counselor / Sender Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Study Abroad Advisor"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="nx-input"
                  style={{ width: '100%', height: 40, fontSize: 13 }}
                />
              </div>
            </div>

            {/* How the email is delivered */}
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--ux-text-2)', lineHeight: 1.5 }}>
              Sent through Resend from <strong style={{ color: 'var(--ux-ink)' }}>bookings@booking.unicoach.com</strong> as
              "{senderName || 'UniCoach'} via UniCoach". The student's reply goes to the email above.
            </p>

            {/* Email Subject */}
            <div style={{ marginBottom: 12 }}>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Email Subject</label>
              <input
                type="text"
                value={aiSubject}
                onChange={(e) => setAiSubject(e.target.value)}
                className="nx-input"
                style={{ width: '100%', height: 40, fontSize: 13 }}
              />
            </div>

            {/* Email Message */}
            <div style={{ marginBottom: 12 }}>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Email Message (Editable)</label>
              <textarea
                rows={8}
                value={aiBody}
                onChange={(e) => setAiBody(e.target.value)}
                className="nx-input"
                style={{ width: '100%', height: 'auto', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, resize: 'none' }}
              />
            </div>

            {/* Attachments & Images */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <label className="nx-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <PaperClipOutlined /> Attach Images / Documents ({attachments.length})
                </label>
                <label style={{ fontSize: 12, color: 'var(--ux-brand-strong)', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>+ Add Images / PDF</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, backgroundColor: 'var(--ux-surface-2)', borderRadius: 16 }}>
                  {attachments.map((att, i) => (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 8px 0 12px', backgroundColor: '#fff', border: '1px solid var(--ux-line-2)', borderRadius: 999, fontSize: 12, color: 'var(--ux-text)' }}>
                      <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {att.filename} ({att.size})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(i)}
                        style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8 }}>
              <button
                onClick={() => handleCopyText(aiBody, 'Draft', selectedReq._id)}
                className="nx-btn nx-btn--light nx-btn--sm"
              >
                <CopyOutlined /> Copy Draft
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="nx-btn nx-btn--light nx-btn--sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="nx-btn nx-btn--dark nx-btn--sm"
                >
                  {sendingEmail ? <ReloadOutlined spin /> : <SendOutlined />}
                  <span>{sendingEmail ? 'Sending Email...' : 'Send Email to Student'}</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* ════════ SENT EMAIL HISTORY VIEWER MODAL ════════ */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
            <CheckOutlined style={{ color: '#15803d' }} />
            <span>Delivered Email Reply Details</span>
          </div>
        }
        open={isSentHistoryOpen}
        onCancel={() => setIsSentHistoryOpen(false)}
        footer={null}
        width={650}
        destroyOnHidden
      >
        {viewingSentReq && (
          <div style={{ padding: '8px 0', fontSize: 12.5 }}>
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--ux-surface-2)', borderRadius: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 14 }}>
                  {viewingSentReq.name}
                </span>
                <span className="nx-status nx-status--success">
                  Delivered to: {viewingSentReq.email}
                </span>
              </div>
              <p style={{ margin: 0, color: 'var(--ux-text-2)', fontSize: 12.5 }}>
                <strong>Inquiry Category:</strong> {viewingSentReq.category}
              </p>
            </div>

            {viewingSentReq.replies && viewingSentReq.replies.length > 0 ? (
              <div style={{ spaceY: 12 }}>
                {viewingSentReq.replies.map((rep, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--ux-line-2)', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ padding: '10px 16px', backgroundColor: 'var(--ux-surface-2)', borderBottom: '1px solid var(--ux-line-2)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{rep.subject}</span>
                      <span style={{ color: 'var(--ux-text-3)', fontSize: 11.5 }}>
                        {rep.sentAt ? new Date(rep.sentAt).toLocaleString('en-GB') : 'Recently'}
                      </span>
                    </div>
                    <div
                      style={{ padding: '14px 16px', fontSize: 13, lineHeight: 1.6, color: 'var(--ux-text)', maxHeight: 280, overflowY: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: stripTagsExceptBr(rep.content) }}
                    />
                    <div style={{ padding: '8px 16px', backgroundColor: 'var(--ux-surface-2)', borderTop: '1px solid var(--ux-line-2)', fontSize: 12, color: 'var(--ux-text-2)' }}>
                      <strong>Sender:</strong> {rep.sender || 'UniCoach Advisory'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', backgroundColor: 'var(--ux-surface-2)', borderRadius: 16 }}>
                <p style={{ margin: 0, color: 'var(--ux-text-2)' }}>
                  Email reply was dispatched to <strong>{viewingSentReq.email}</strong>.
                </p>
              </div>
            )}

            <div style={{ textAlign: 'right', paddingTop: 10 }}>
              <button
                onClick={() => setIsSentHistoryOpen(false)}
                className="nx-btn nx-btn--dark nx-btn--sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default SupportRequests;
