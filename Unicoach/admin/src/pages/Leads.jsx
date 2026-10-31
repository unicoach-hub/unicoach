import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Select, message, Input, Modal, Tabs, Timeline, DatePicker, Button, Form, Popover, Tooltip, Progress, Badge, Spin, Popconfirm, Segmented } from 'antd';
import dayjs from 'dayjs';
import LeadJourneyView from '../components/LeadJourneyView';
import LeadStageBoard, { COLUMNS as STAGE_COLUMNS, columnOf } from '../components/LeadStageBoard';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import StudentDrawer from '../components/StudentDrawer';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { escapeHtml as esc, plainTextToHtml } from '../utils/escapeHtml';
import { usePermissions } from '../utils/permissions';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  ContactsOutlined, UserAddOutlined,
  WhatsAppOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  RobotOutlined,
  FireOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  BulbOutlined,
  CloseOutlined,
  CheckOutlined,
  PhoneOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BankOutlined,
  StarOutlined,
  RetweetOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ReadOutlined,
  SmileOutlined,
  EditOutlined,
  UnorderedListOutlined,
  AppstoreOutlined, NodeIndexOutlined
} from '@ant-design/icons';

const { Option } = Select;


const statusColors = {
  new: 'blue', contacted: 'cyan', qualified: 'green', converted: 'purple', closed: 'red',
};

// Sheet-style options the team picks on All Leads
const SHEET_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'converted', label: 'Converted' },
  { value: 'interested', label: 'Interested' },
  { value: 'fifty_fifty', label: '50 / 50' },
  { value: 'not_interested', label: 'Not Interested' },
];
const FOLLOW_UP_OPTIONS = [
  { value: '', label: '—' },
  { value: 'interested', label: 'Interested' },
  { value: 'fifty_fifty', label: '50 / 50' },
];
const PHONE_CALL_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'done', label: 'Done' },
];
const statusLabel = (s) => SHEET_STATUSES.find((o) => o.value === s)?.label || s;
const VIEW_TITLES = {
  converted: { title: 'Converted leads', subtitle: 'Leads marked Converted on All Leads' },
  interested: { title: 'Interested leads', subtitle: 'Leads with status Interested' },
  followup: { title: 'Follow-ups', subtitle: 'Leads with a follow-up date: upcoming, due today and missed' },
  not_interested: { title: 'Not interested', subtitle: 'Leads with status Not Interested' },
};
// Where each stat box goes
const VIEW_PATHS = { all: '/leads', converted: '/leads-converted', interested: '/leads-interested', followup: '/leads-followup', not_interested: '/leads-not-interested' };

// Presentation only: kit status-pill class per lead status
const statusChipClass = {
  new: 'nx-status--neutral', contacted: 'nx-status--accent', qualified: 'nx-status--dark', converted: 'nx-status--success', closed: 'nx-status--danger',
  interested: 'nx-status--accent', fifty_fifty: 'nx-status--warning', not_interested: 'nx-status--danger',
};
const StatusChip = ({ status, style }) => (
  <span className={`nx-status ${statusChipClass[status] || 'nx-status--neutral'}`} style={{ ...style }}>{statusLabel(status)}</span>
);

const countryFlags = {
  france: '🇫🇷',
  germany: '🇩🇪',
  'new zealand': '🇳🇿',
  canada: '🇨🇦',
  uk: '🇬🇧',
  'united kingdom': '🇬🇧',
  australia: '🇦🇺',
  usa: '🇺🇸',
  'united states': '🇺🇸',
  ireland: '🇮🇪',
  singapore: '🇸🇬',
};

const getCountryFlag = (country) => {
  if (!country) return '🌐';
  const cLower = country.toLowerCase().trim();
  return countryFlags[cLower] || '✈️';
};

const getStatusProgress = (status) => {
  switch (status) {
    case 'new': return { percent: 10, label: 'Intake Registered', icon: '📋' };
    case 'contacted': return { percent: 40, label: 'First Contact', icon: '📞' };
    case 'qualified': return { percent: 70, label: 'Profile Qualified', icon: '🔥' };
    case 'converted': return { percent: 92, label: 'Converted Success', icon: '🏆' };
    default: return { percent: 0, label: 'Archived', icon: '🛑' };
  }
};

const getTemperatureMeter = (status) => {
  switch (status) {
    case 'new': return { label: 'Cold Prospect', color: '#38bdf8', icon: '❄️', bg: '#0c4a6e' };
    case 'contacted': return { label: 'Warm Lead', color: '#fb923c', icon: '⚡', bg: '#7c2d12' };
    case 'qualified': return { label: 'Hot Lead', color: '#f87171', icon: '🔥', bg: '#7f1d1d' };
    case 'converted': return { label: 'Enrolled Client', color: '#34d399', icon: '🏆', bg: '#064e3b' };
    default: return { label: 'Closed / Inactive', color: '#94a3b8', icon: '🛑', bg: '#1e293b' };
  }
};

const getActivityHeader = (type) => {
  switch (type) {
    case 'email': return 'Email communication';
    case 'whatsapp': return 'WhatsApp message';
    case 'call': return 'Follow-up call note';
    case 'status_change': return 'Pipeline stage level-up';
    default: return 'Internal note';
  }
};

const whatsappTemplates = [
  {
    key: 'welcome',
    name: 'Welcome Message',
    text: (lead) => `Hi ${lead ? lead.name : ''}, thank you for choosing Unicoach! We received your request to study in ${lead ? lead.dreamCountry : ''} for the ${lead ? lead.preferredIntake : ''} intake. Could you please share your highest education document (${lead ? lead.highestEducation : ''}) so we can check your eligibility?`
  },
  {
    key: 'consultation',
    name: 'Schedule Call',
    text: (lead) => `Hi ${lead ? lead.name : ''}, this is Unicoach. We would love to schedule a free 1-on-1 counseling call with our country expert for ${lead ? lead.dreamCountry : ''}. Let us know if you are free today or tomorrow.`
  },
  {
    key: 'custom',
    name: 'Custom Text',
    text: (lead) => `Hi ${lead ? lead.name : ''}, `
  }
];

const emailTemplates = [
  {
    key: 'welcome',
    name: 'Welcome Onboard',
    subject: (lead) => `Welcome to Unicoach - Study in ${lead ? lead.dreamCountry : ''}!`,
    html: (lead) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #DE5C2B; border-bottom: 2px solid #DE5C2B; padding-bottom: 10px;">Welcome to Unicoach!</h2>
        <p>Dear ${esc(lead && lead.name)},</p>
        <p>Thank you for submitting your eligibility request to study abroad. We are excited to assist you in your journey to <strong>${esc(lead && lead.dreamCountry)}</strong>!</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <strong>Your submitted details:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Dream Country: ${esc(lead && lead.dreamCountry)}</li>
            <li>Preferred Intake: ${esc(lead && lead.preferredIntake)}</li>
            <li>Highest Education: ${esc(lead && lead.highestEducation)}</li>
            <li>Current City: ${esc(lead && lead.currentCity)}</li>
          </ul>
        </div>
        <p>Our expert study abroad counselor will get in touch with you shortly to analyze your profile and guide you on university shortlists, application processes, and visa guidelines.</p>
        <p>Best Regards,<br/><strong>Team Unicoach</strong></p>
      </div>
    `
  },
  {
    key: 'consultation',
    name: 'Book Counseling',
    subject: (lead) => `Schedule your Study Abroad counseling session with Unicoach`,
    html: (lead) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #DE5C2B; border-bottom: 2px solid #DE5C2B; padding-bottom: 10px;">Free Counseling Session</h2>
        <p>Dear ${esc(lead && lead.name)},</p>
        <p>We noticed you applied for eligibility checks. To help you shortlist the best universities in <strong>${esc(lead && lead.dreamCountry)}</strong>, we have scheduled a free 1-on-1 counseling session for you.</p>
        <p>Please reply to this email or contact us via phone at your earliest convenience to lock in a slot. Our counselors are available from Monday to Saturday, 10:00 AM to 7:00 PM.</p>
        <p>Best Regards,<br/><strong>Team Unicoach</strong></p>
      </div>
    `
  },
  {
    key: 'custom',
    name: 'Write Custom',
    subject: (lead) => `Update regarding your Unicoach profile`,
    html: (lead) => `<p>Dear ${esc(lead && lead.name)},</p><p>Write your message here...</p><p>Best Regards,<br/>Team Unicoach</p>`
  }
];

// Ad campaign that brought a lead (saved by the website's adTracking.js), e.g. "google / cpc · ielts-delhi"
const describeAdTouch = (touch) => {
  if (!touch) return '';
  if (touch.utm_source || touch.utm_campaign) {
    return [[touch.utm_source, touch.utm_medium].filter(Boolean).join(' / '), touch.utm_campaign].filter(Boolean).join(' · ');
  }
  if (touch.gclid || touch.gbraid || touch.wbraid) return 'Google Ads';
  if (touch.fbclid) return 'Meta Ads';
  if (touch.referrer) {
    try { return new URL(touch.referrer).hostname.replace(/^www\./, ''); } catch { return ''; }
  }
  return '';
};

// Leads nobody has acted on yet, from before today (today's arrivals are counted under "Today's leads")
const isPendingNew = (l) => (l.status || 'new') === 'new' && !dayjs(l.createdAt).isSame(dayjs(), 'day');
// Follow-up colour by due date: green = coming up, yellow = due today or up to 2 days late, red = 3+ days late
const FU_CLOSED = ['converted', 'closed', 'not_interested'];
const followUpBucket = (l) => {
  if (!l.nextFollowUpDate || FU_CLOSED.includes(l.status)) return null;
  const late = dayjs().startOf('day').diff(dayjs(l.nextFollowUpDate).startOf('day'), 'day');
  if (late < 0) return 'green';
  return late <= 2 ? 'yellow' : 'red';
};
const FU_BOXES = [
  { key: 'green', title: 'Upcoming', hint: 'Follow-up date is ahead', fg: '#047857', bg: '#ECFDF5', line: '#A7F3D0' },
  { key: 'yellow', title: 'Due today / slightly late', hint: 'Due today or up to 2 days late', fg: '#A16207', bg: '#FEFCE8', line: '#FDE68A' },
  { key: 'red', title: 'Missed', hint: '3 or more days late', fg: '#B91C1C', bg: '#FEF2F2', line: '#FECACA' },
];

const Leads = ({ view = 'all' }) => {
  const navigate = useNavigate();
  const cachedLeads = getCachedData(`/admin/leads:list:${view}:all:all:all`);
  const [data, setData] = useState(cachedLeads || []);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('default');
  // Quick filter from the "New leads" card or a follow-up box: '' | 'new' | 'fu_green' | 'fu_yellow' | 'fu_red'
  const [quickFilter, setQuickFilter] = useState('');
  // Stage picked in the All Leads dropdown (/leads?stage=applied): same stages as the Stage board
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFilter = view === 'all' ? searchParams.get('stage') || '' : '';
  // A stage covers every status, so picking one clears the status and quick filters
  useEffect(() => {
    if (!stageFilter) return;
    setStatusFilter((s) => (s === 'all' ? s : 'all'));
    setQuickFilter((q) => (q ? '' : q));
  }, [stageFilter]);
  const [loading, setLoading] = useState(!cachedLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all'); // all | due | call_done | call_pending
  const [counselorFilter, setCounselorFilter] = useState('all');
  // Counselors = active staff accounts; leads store the staff id in assignedTo
  const [counselors, setCounselors] = useState([]);
  const { user, can } = usePermissions();
  const ownLeadsOnly = user?.role === 'staff' && user?.leadScope !== 'all';
  const canReassign = can('leads', 'update') && !ownLeadsOnly;
  const counselorName = (value) => (!value || value === 'Unassigned' ? 'Unassigned' : counselors.find((c) => c._id === value)?.name || value);

  useEffect(() => {
    API.get('/admin/staff/assignable').then((res) => setCounselors(res.data || [])).catch(() => {});
  }, []);

  // Tags: auto ones (event, source, country, intake) come from the server; manual ones the team adds here
  const [tagFilter, setTagFilter] = useState([]);
  // Lead date (when they came in): [from, to] as dayjs, or null for all time
  const [dateRange, setDateRange] = useState(null);
  const [tagCatalog, setTagCatalog] = useState({ auto: [], manual: [] });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkTags, setBulkTags] = useState([]);
  const loadTagCatalog = () => API.get('/admin/leads/tags').then((r) => setTagCatalog(r.data || { auto: [], manual: [] })).catch(() => {});
  useEffect(() => { loadTagCatalog(); }, []);
  const manualTagOptions = tagCatalog.manual.map((t) => ({ value: t.tag, label: t.tag }));
  const allTagOptions = [
    { label: 'Added by the system', options: tagCatalog.auto.map((t) => ({ value: t.tag, label: `${t.tag} (${t.count})` })) },
    { label: 'Added by the team', options: tagCatalog.manual.map((t) => ({ value: t.tag, label: `${t.tag} (${t.count})` })) },
  ].filter((g) => g.options.length);

  const saveLeadTags = async (lead, tags) => {
    try {
      const { data: res } = await API.patch(`/admin/leads/${lead._id}/tags`, { tags });
      setData((list) => list.map((l) => (l._id === lead._id ? { ...l, tags: res.tags } : l)));
      loadTagCatalog();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not save tags');
    }
  };

  const applyBulkTags = async (mode) => {
    if (!bulkTags.length) {
      message.error('Type or pick a tag first');
      return;
    }
    try {
      await API.post('/admin/leads/bulk-tags', { ids: selectedRowKeys, [mode]: bulkTags });
      setData((list) => list.map((l) => {
        if (!selectedRowKeys.includes(l._id)) return l;
        const current = l.tags || [];
        const next = mode === 'add' ? [...new Set([...current, ...bulkTags])] : current.filter((t) => !bulkTags.includes(t));
        return { ...l, tags: next };
      }));
      message.success(mode === 'add' ? `Tag added to ${selectedRowKeys.length} leads` : `Tag removed from ${selectedRowKeys.length} leads`);
      setBulkTags([]);
      loadTagCatalog();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update tags');
    }
  };
  const [selectedLead, setSelectedLead] = useState(null);
  // Registered student account behind the open lead (onboarding details, stage, mentor)
  const [leadStudent, setLeadStudent] = useState(null);
  const [leadStudentLoading, setLeadStudentLoading] = useState(false);
  const [openStudentId, setOpenStudentId] = useState(null);
  // ?docs=review opens All Leads filtered to students whose documents need checking (old Student Documents page)
  const [docsFilter, setDocsFilter] = useState(() => new URLSearchParams(window.location.search).get('docs') || 'all');
  useEffect(() => {
    const email = selectedLead?.email;
    setLeadStudent(null);
    if (!email || !email.includes('@')) return;
    let alive = true;
    setLeadStudentLoading(true);
    API.get('/admin/students/lookup', { params: { email } })
      .then(({ data }) => alive && setLeadStudent(data.student))
      .catch(() => {})
      .finally(() => alive && setLeadStudentLoading(false));
    return () => { alive = false; };
  }, [selectedLead?.email]);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban' | 'journey'

  // Marketing states
  const [waMessage, setWaMessage] = useState('');
  const [waTemplateKey, setWaTemplateKey] = useState('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplateKey, setEmailTemplateKey] = useState('welcome');
  const [sendingEmail, setSendingEmail] = useState(false);

  // AI Assistant States
  const [scoringLeadId, setScoringLeadId] = useState(null);
  const [batchScoring, setBatchScoring] = useState(false);
  const [generatingAiReply, setGeneratingAiReply] = useState(false);
  const [aiGoal, setAiGoal] = useState('book_call');
  const [aiReplyTip, setAiReplyTip] = useState('');

  // Drag and Drop Pipeline states
  const [draggingId, setDraggingId] = useState(null);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  // Form instance for resetting
  const [activityForm] = Form.useForm();

  const handleScoreSingleLead = async (leadId) => {
    setScoringLeadId(leadId);
    try {
      const currentLead = data.find(l => l._id === leadId) || selectedLead;
      const { data: resData } = await API.post('/ai/score-lead', { 
        leadId,
        lead: currentLead 
      });
      if (resData?.scoring) {
        message.success(`AI Lead Score: ${resData.scoring.category} (${resData.scoring.score}/100)`);
        setData(prev => prev.map(l => l._id === leadId ? { ...l, aiScoring: resData.scoring } : l));
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(prev => ({ ...prev, aiScoring: resData.scoring }));
        }
      }
    } catch (err) {
      console.error('Lead scoring error:', err);
      const errMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to score lead with AI';
      message.error(errMsg);
    } finally {
      setScoringLeadId(null);
    }
  };

  const handleBatchScoreLeads = async () => {
    setBatchScoring(true);
    try {
      const { data: resData } = await API.post('/ai/batch-score-leads', { limit: 25 });
      message.success(`AI evaluated & scored ${resData?.processedCount || 0} leads!`);
      fetchLeads();
    } catch (err) {
      message.error('Batch AI scoring encountered an error');
    } finally {
      setBatchScoring(false);
    }
  };

  const handleGenerateAiReply = async (channel, goal = 'book_call') => {
    if (!selectedLead) return;
    setGeneratingAiReply(true);
    setAiReplyTip('');
    try {
      const { data: resData } = await API.post('/ai/suggest-lead-reply', {
        lead: selectedLead,
        channel,
        goal
      });
      if (resData?.reply) {
        if (channel === 'whatsapp') {
          setWaMessage(resData.reply.message);
          setWaTemplateKey('custom');
        } else if (channel === 'email') {
          setEmailSubject(resData.reply.subject || `Study in ${selectedLead.dreamCountry}: Your Next Steps`);
          // AI output is plain text: escape before rendering it as HTML in the preview
          setEmailBody(plainTextToHtml(resData.reply.message));
          setEmailTemplateKey('custom');
        }
        if (resData.reply.counselorTip) {
          setAiReplyTip(resData.reply.counselorTip);
        }
        message.success('AI Smart Reply generated!');
      }
    } catch (err) {
      message.error('Failed to generate AI reply');
    } finally {
      setGeneratingAiReply(false);
    }
  };

  const fetchPipelines = async () => {
    try {
      const { data } = await API.get('/admin/pipelines');
      setPipelines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching pipelines:', err);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchLeads = async (force = false) => {
    const cacheKey = `/admin/leads:list:${view}:${statusFilter}:${followUpFilter}:${counselorFilter}`;
    if (!getCachedData(cacheKey) || force) {
      setLoading(true);
    }
    try {
      const params = {};
      if (view !== 'all') params.view = view;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (followUpFilter === 'due') params.followUpFilter = 'due';
      if (counselorFilter !== 'all') params.assignedTo = counselorFilter;

      const { data } = await fetchWithCache(
        cacheKey,
        async () => (await API.get('/admin/leads', { params })).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) { 
      message.error('Failed to load leads'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchSingleLead = async (id) => {
    try {
      const { data } = await API.get(`/admin/leads/${id}`);
      setSelectedLead(data);
    } catch (err) {
      message.error('Failed to refresh lead details');
    }
  };

  const handleOpenLead = (record) => {
    setSelectedLead(record);
    if (record?._id) {
      fetchSingleLead(record._id);
    }
  };

  useEffect(() => { 
    fetchLeads(); 
  }, [statusFilter, followUpFilter, counselorFilter]);

  // The boxes always count every lead, also on the Converted / Follow-up pages
  const [allForCounts, setAllForCounts] = useState(null);
  useEffect(() => {
    if (view === 'all') { setAllForCounts(null); return; }
    API.get('/admin/leads').then(({ data: rows }) => setAllForCounts(Array.isArray(rows) ? rows : [])).catch(() => {});
  }, [view]);
  const countRows = view === 'all' ? data : (allForCounts || []);
  // Numbers for the All Leads dropdown: each list, and each stage of the Stage board
  const leadCounts = (() => {
    if (!countRows.length && loading) return undefined;
    const stages = Object.fromEntries(STAGE_COLUMNS.map((c) => [c.key, 0]));
    for (const l of countRows) { const k = columnOf(l); stages[k in stages ? k : 'new'] += 1; }
    const byStatus = (st) => countRows.filter((l) => l.status === st).length;
    return { lists: { all: countRows.length, converted: byStatus('converted'), interested: byStatus('interested'), not_interested: byStatus('not_interested') }, stages };
  })();

  // Set message templates whenever a lead is selected
  useEffect(() => {
    if (selectedLead) {
      const defaultWa = whatsappTemplates.find(t => t.key === 'welcome');
      setWaMessage(defaultWa ? defaultWa.text(selectedLead) : '');
      setWaTemplateKey('welcome');

      const defaultEmail = emailTemplates.find(t => t.key === 'welcome');
      setEmailSubject(defaultEmail ? defaultEmail.subject(selectedLead) : '');
      setEmailBody(defaultEmail ? defaultEmail.html(selectedLead) : '');
      setEmailTemplateKey('welcome');
      
      activityForm.resetFields();
    }
  }, [selectedLead]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/admin/leads/${id}`, { status: newStatus });
      message.success('Status updated');
      if (selectedLead && selectedLead._id === id) {
        fetchSingleLead(id);
      }
      fetchLeads();
    } catch (err) { 
      message.error('Update failed'); 
    }
  };

  const handleFieldChange = async (id, field, value) => {
    // Update the row right away, then save
    setData((rows) => rows.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
    try {
      await API.put(`/admin/leads/${id}`, { [field]: value });
      invalidateCache('/admin/leads');
      fetchLeads(true);
    } catch (err) {
      message.error('Update failed');
      fetchLeads(true);
    }
  };

  const handleCounselorChange = async (id, newCounselor) => {
    try {
      await API.put(`/admin/leads/${id}`, { assignedTo: newCounselor });
      message.success('Counselor assigned');
      if (selectedLead && selectedLead._id === id) {
        fetchSingleLead(id);
      }
      fetchLeads();
    } catch (err) {
      message.error('Assignment failed');
    }
  };

  const handleDelete = async (id) => {
    try { 
      await API.delete(`/admin/leads/${id}`); 
      message.success('Lead deleted'); 
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead(null);
      }
      fetchLeads(); 
    } catch (err) { 
      message.error('Delete failed'); 
    }
  };

  const handleLogActivity = async (values) => {
    try {
      const payload = {
        type: values.type || 'call',
        comment: values.comment,
        nextFollowUpDate: values.nextFollowUpDate ? values.nextFollowUpDate.toDate() : undefined,
        status: values.status
      };
      await API.post(`/admin/leads/${selectedLead._id}/activity`, payload);
      message.success('Activity logged successfully');
      activityForm.resetFields();
      fetchSingleLead(selectedLead._id);
      fetchLeads();
    } catch (err) {
      message.error('Failed to log activity');
    }
  };

  const handleWhatsAppSend = async (lead) => {
    try {
      // 1. Log in database
      await API.post(`/admin/leads/${lead._id}/log-whatsapp`, {
        templateName: waTemplateKey,
        messageContent: waMessage
      });
      message.success('WhatsApp interaction logged');
      
      // 2. Open WhatsApp Web Click-To-Chat URL
      const cleanedPhone = lead.phone.replace(/[^\d+]/g, '');
      const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(waMessage)}`;
      window.open(url, '_blank');
      
      // Refetch to update timeline
      fetchSingleLead(lead._id);
      fetchLeads();
    } catch (err) {
      message.error('Failed to log WhatsApp chat');
    }
  };

  const handleEmailSend = async (lead) => {
    setSendingEmail(true);
    try {
      await API.post(`/admin/leads/${lead._id}/send-email`, {
        subject: emailSubject,
        html: emailBody
      });
      message.success('Email request sent!');
      fetchSingleLead(lead._id);
      fetchLeads();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      message.warning('No leads to export');
      return;
    }
    
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Dream Country',
      'Preferred Intake',
      'Highest Education',
      'Current City',
      'Verified',
      'Status',
      'Source',
      'Notes',
      'Next Follow Up Date',
      'Created At'
    ];
    
    const rows = data.map(l => [
      l.name || '',
      l.email || '',
      l.phone || '',
      l.dreamCountry || '',
      l.preferredIntake || '',
      l.highestEducation || '',
      l.currentCity || '',
      l.verified ? 'true' : 'false',
      l.status || '',
      l.source || '',
      l.notes || '',
      l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toISOString() : '',
      l.createdAt ? new Date(l.createdAt).toISOString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `unicoach_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Leads exported to CSV successfully');
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        
        // Simple robust CSV parser
        const parseCSV = (str) => {
          const lines = [];
          let row = [""];
          let inQuotes = false;

          for (let i = 0; i < str.length; i++) {
            const char = str[i];
            const nextChar = str[i + 1];
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                row[row.length - 1] += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              row.push("");
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
              if (char === '\r' && nextChar === '\n') {
                i++;
              }
              lines.push(row);
              row = [""];
            } else {
              row[row.length - 1] += char;
            }
          }
          if (row.length > 1 || row[0] !== "") {
            lines.push(row);
          }
          return lines;
        };

        const parsedRows = parseCSV(text);
        if (parsedRows.length <= 1) {
          message.error('CSV file is empty or only contains headers');
          return;
        }

        const headers = parsedRows[0].map(h => h.trim().toLowerCase());
        const leadsToImport = [];

        const findColIndex = (names) => {
          return headers.findIndex(h => names.includes(h));
        };

        const nameIdx = findColIndex(['name', 'full name', 'lead name', 'student name']);
        const emailIdx = findColIndex(['email', 'email address', 'mail']);
        const phoneIdx = findColIndex(['phone', 'phone number', 'contact', 'mobile']);
        const countryIdx = findColIndex(['dream country', 'country', 'dreamcountry', 'preferred country']);
        const intakeIdx = findColIndex(['preferred intake', 'intake', 'preferredintake']);
        const eduIdx = findColIndex(['highest education', 'education', 'highesteducation', 'qualification']);
        const cityIdx = findColIndex(['current city', 'city', 'currentcity']);
        const statusIdx = findColIndex(['status', 'lead status']);
        const notesIdx = findColIndex(['notes', 'note', 'comment']);
        const verifiedIdx = findColIndex(['verified', 'is verified', 'isverified']);
        const dateIdx = findColIndex(['next follow up date', 'follow up date', 'followupdate']);

        if (nameIdx === -1 || emailIdx === -1 || phoneIdx === -1 || countryIdx === -1 || intakeIdx === -1 || eduIdx === -1 || cityIdx === -1) {
          message.error('CSV must contain headers for Name, Email, Phone, Dream Country, Preferred Intake, Highest Education, and Current City.');
          return;
        }

        for (let i = 1; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          if (row.length <= 1 && row[0] === '') continue;

          const name = row[nameIdx]?.trim();
          const email = row[emailIdx]?.trim();
          const phone = row[phoneIdx]?.trim();
          const dreamCountry = row[countryIdx]?.trim();
          const preferredIntake = row[intakeIdx]?.trim();
          const highestEducation = row[eduIdx]?.trim();
          const currentCity = row[cityIdx]?.trim();

          if (!name || !email || !phone || !dreamCountry || !preferredIntake || !highestEducation || !currentCity) {
            continue;
          }

          leadsToImport.push({
            name,
            email,
            phone,
            dreamCountry,
            preferredIntake,
            highestEducation,
            currentCity,
            status: statusIdx !== -1 ? row[statusIdx]?.trim() : 'new',
            notes: notesIdx !== -1 ? row[notesIdx]?.trim() : '',
            verified: verifiedIdx !== -1 ? (row[verifiedIdx]?.trim().toLowerCase() === 'true') : false,
            nextFollowUpDate: dateIdx !== -1 ? row[dateIdx]?.trim() : undefined,
          });
        }

        if (leadsToImport.length === 0) {
          message.warning('No valid leads found in CSV to import');
          return;
        }

        setLoading(true);
        const response = await API.post('/admin/leads/import', { leads: leadsToImport });
        setLoading(false);

        if (response.data?.success) {
          message.success(`Successfully imported ${response.data.count} leads!`);
          if (response.data.errors) {
            Modal.warning({
              title: 'Some rows skipped or failed',
              content: (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {response.data.errors.map((err, idx) => <p key={idx}>{err}</p>)}
                </div>
              )
            });
          }
          fetchLeads();
        } else {
          message.error('Failed to import leads');
        }
      } catch (err) {
        setLoading(false);
        message.error('Error processing CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const inRange = (l) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
    const t = dayjs(l.createdAt);
    return !t.isBefore(dateRange[0].startOf('day')) && !t.isAfter(dateRange[1].endOf('day'));
  };
  const filtered = data.filter(l =>
    (!stageFilter || columnOf(l) === stageFilter) &&
    (followUpFilter !== 'call_done' || (l.callCount || 0) > 0) &&
    (followUpFilter !== 'call_pending' || !(l.callCount || 0)) &&
    (!quickFilter || (quickFilter === 'new' ? isPendingNew(l) : followUpBucket(l) === quickFilter.slice(3))) &&
    (l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)) &&
    (!tagFilter.length || tagFilter.some((t) => (l.tags || []).includes(t) || (l.autoTags || []).includes(t))) &&
    inRange(l) &&
    (docsFilter === 'all' || (docsFilter === 'any' ? (l.documents?.total || 0) > 0 : (l.documents?.toReview || 0) > 0))
  );

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      defaultSortOrder: 'descend',
      render: (v) => v ? (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: '13px' }}>
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ color: 'var(--ux-text-2)', fontSize: '11.5px' }}>
            {new Date(v).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      ) : <span style={{ color: 'var(--ux-text-2)' }}>—</span>,
    },
    {
      title: 'Lead Ref.',
      key: 'leadRef',
      width: 150,
      render: (_, record) => {
        const full = record.latestSource || record.source || '—';
        // Shorter names for long sources; the full one stays in the tooltip
        const short = { 'Paid consultation booking': 'Paid consultation', 'Website Booking Form': 'Booking form' }[full] || full;
        // A mentor's share link (?ref=handle) tags the lead "mentor:<handle>"
        const mentorTag = [...(record.tags || []), ...(record.autoTags || [])].find((t) => /^mentor:/i.test(t));
        const mentorHandle = record.referralMentorHandle || (mentorTag ? mentorTag.slice(7).trim() : '');
        const mentorName = record.referralMentorName || record.referralMentor?.name || '';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            {/* A long source ("Event: Ireland Career Roadmap 2027: …") wraps to at most 2 lines in a square-cornered badge;
                fully rounded, the wrapped text turned it into a blob. The full name stays in the tooltip. */}
            <span className="nx-status nx-status--neutral" title={full}
              style={{ whiteSpace: 'normal', height: 'auto', minHeight: 24, lineHeight: 1.3, padding: '4px 8px', fontSize: 12, textAlign: 'left', maxWidth: '100%', borderRadius: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflowWrap: 'anywhere' }}>
              {short}
            </span>
            {mentorHandle && (
              <span title={`Came through ${mentorName ? `${mentorName} ` : ''}@${mentorHandle}'s referral link`}
                style={{ fontSize: 11.5, fontWeight: 600, color: '#9A3412', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 999, padding: '2px 8px' }}>
                Mentor: {mentorName || `@${mentorHandle}`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 190,
      render: (text, record) => (
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: '13.5px' }}>{text}</span>
            {!!record.duplicateLeads?.length && (
              <Popover
                trigger="click"
                placement="right"
                content={
                  <div style={{ minWidth: 210, maxWidth: 300 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      {record.duplicateLeads.length} linked lead{record.duplicateLeads.length === 1 ? '' : 's'}
                    </div>
                    {record.duplicateLeads.map((related) => (
                      <button
                        key={related._id}
                        type="button"
                        onClick={(event) => { event.stopPropagation(); handleOpenLead(related); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 0', borderTop: '1px solid var(--ux-line-2)', cursor: 'pointer' }}
                      >
                        <span style={{ display: 'block', color: 'var(--ux-ink)', fontSize: 12, fontWeight: 600 }}>{related.name || 'Unnamed lead'}</span>
                        <span style={{ display: 'block', color: 'var(--ux-text-2)', fontSize: 11 }}>
                          {related.latestSource || related.source || 'Unknown source'}
                          {related.createdAt ? ` · ${new Date(related.createdAt).toLocaleDateString('en-IN')}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                }
              >
                <button
                  type="button"
                  onClick={(event) => event.stopPropagation()}
                  className="nx-status nx-status--accent"
                  title="Open linked lead records"
                  style={{ height: 20, padding: '0 7px', fontSize: 10.5, gap: 4, cursor: 'pointer' }}
                >
                  <NodeIndexOutlined /> {record.duplicateLeads.length + 1} linked
                </button>
              </Popover>
            )}
          </div>
          <div style={{ color: 'var(--ux-text-2)', fontSize: 12, marginTop: 2 }}>{record.phone || 'No phone'}</div>
        </div>
      )
    },
    { title: 'Country', dataIndex: 'dreamCountry', key: 'dreamCountry', width: 140, render: (text) => <span className="nx-status nx-status--neutral">{getCountryFlag(text)} {text}</span> },
    {
      title: 'College', key: 'college', width: 170,
      render: (_, record) => {
        const fallback = record.interestedUniversities?.length ? record.interestedUniversities[record.interestedUniversities.length - 1].name : '';
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Input
              size="small"
              variant="borderless"
              defaultValue={record.college || fallback}
              placeholder="Add college"
              onBlur={(e) => e.target.value !== (record.college || fallback) && handleFieldChange(record._id, 'college', e.target.value.trim())}
              onPressEnter={(e) => e.target.blur()}
            />
          </div>
        );
      },
    },
    {
      title: 'Course', key: 'course', width: 160,
      render: (_, record) => {
        const fallback = record.interestedUniversities?.length ? record.interestedUniversities[record.interestedUniversities.length - 1].course || '' : '';
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Input
              size="small"
              variant="borderless"
              defaultValue={record.course || fallback}
              placeholder="Add course"
              onBlur={(e) => e.target.value !== (record.course || fallback) && handleFieldChange(record._id, 'course', e.target.value.trim())}
              onPressEnter={(e) => e.target.blur()}
            />
          </div>
        );
      },
    },
    { title: 'Intake', dataIndex: 'preferredIntake', key: 'preferredIntake', width: 110, render: (text) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13, fontWeight: 500 }}>{text}</span> },
    {
      title: 'Phone Call', dataIndex: 'phoneCall', key: 'phoneCall', width: 120,
      render: (v, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select value={v || 'pending'} size="small" style={{ width: 100 }} options={PHONE_CALL_OPTIONS} onChange={(val) => handleFieldChange(record._id, 'phoneCall', val)} />
        </div>
      ),
    },
    {
      // One column: how warm the lead is, and when to follow up next (colour shows if it is on track)
      title: 'Status & follow-up', dataIndex: 'status', key: 'status', width: 180,
      render: (status, record) => {
        const box = FU_BOXES.find((x) => x.key === followUpBucket(record));
        const v = record.nextFollowUpDate;
        return (
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Select value={status} size="small" onChange={(val) => handleStatusChange(record._id, val)} style={{ width: 150 }}>
              {SHEET_STATUSES.map((o) => <Option key={o.value} value={o.value}><StatusChip status={o.value} style={{ height: 22 }} /></Option>)}
              {!SHEET_STATUSES.some((o) => o.value === status) && <Option value={status}><StatusChip status={status} style={{ height: 22 }} /></Option>}
            </Select>
            {!['converted', 'closed', 'not_interested'].includes(status) && (
              <>
                <DatePicker size="small" format="D MMM YYYY" placeholder="Follow-up date" value={v ? dayjs(v) : null}
                  style={{ width: 150, ...(box ? { borderColor: box.line, background: box.bg } : {}) }}
                  onChange={(d) => handleFieldChange(record._id, 'nextFollowUpDate', d ? d.hour(10).toISOString() : null)} />
                {box && <span style={{ fontSize: 11, fontWeight: 700, color: box.fg }}>{box.key === 'green' ? 'Upcoming' : box.key === 'yellow' ? (dayjs().isSame(dayjs(v), 'day') ? 'Follow up today' : 'Slightly late') : 'Missed follow-up'}</span>}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: 'Counselor',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 160,
      render: (counselor, record) => (canReassign ? (
        <Select
          onClick={(e) => e.stopPropagation()}
          value={counselor || 'Unassigned'}
          size="small"
          onChange={(val) => handleCounselorChange(record._id, val)}
          style={{ width: 140 }}
          labelRender={({ value }) => counselorName(value)}
        >
          <Option value="Unassigned"><span style={{ color: 'var(--ux-text-3)' }}>Unassigned</span></Option>
          {counselors.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
        </Select>
      ) : <span style={{ color: 'var(--ux-text-2)' }}>{counselorName(counselor)}</span>)
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="action-btn-group">
          <button onClick={(e) => { e.stopPropagation(); handleOpenLead(record); }} className="action-btn action-btn--view" title="Open Lead Details"><EyeOutlined /></button>
          {can('leads', 'delete') && <Popconfirm
            title="Delete this lead?"
            description="This permanently removes the lead and its activity history."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={(e) => { e?.stopPropagation(); handleDelete(record._id); }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <button onClick={(e) => e.stopPropagation()} className="action-btn action-btn--delete" title="Delete Lead"><DeleteOutlined /></button>
          </Popconfirm>}
        </div>
      ),
    },
  ];

  // Excel-style header filters: tick one or more values per column; they combine with each other
  const uniq = (vals) => [...new Set(vals.filter((v) => v !== undefined && v !== null && v !== ''))].sort((x, y) => String(x).localeCompare(String(y)));
  const toFilters = (vals, label = (v) => v) => vals.map((v) => ({ text: label(v), value: v }));
  const lastUni = (l, key) => (l.interestedUniversities?.length ? l.interestedUniversities[l.interestedUniversities.length - 1][key] : '');
  const columnFilters = {
    leadRef: { filters: toFilters(uniq(data.map((l) => l.latestSource || l.source))), onFilter: (v, l) => (l.latestSource || l.source) === v },
    name: {
      filters: toFilters(uniq(data.map((l) => l.name))),
      filterSearch: true,
      onFilter: (v, l) => l.name === v,
    },
    dreamCountry: { filters: toFilters(uniq(data.map((l) => l.dreamCountry))), filterSearch: true, onFilter: (v, l) => l.dreamCountry === v },
    college: { filters: toFilters(uniq(data.map((l) => l.college || lastUni(l, 'name')))), filterSearch: true, onFilter: (v, l) => (l.college || lastUni(l, 'name')) === v },
    course: { filters: toFilters(uniq(data.map((l) => l.course || lastUni(l, 'course')))), filterSearch: true, onFilter: (v, l) => (l.course || lastUni(l, 'course')) === v },
    preferredIntake: { filters: toFilters(uniq(data.map((l) => l.preferredIntake))), filterSearch: true, onFilter: (v, l) => l.preferredIntake === v },
    phoneCall: { filters: PHONE_CALL_OPTIONS.map((o) => ({ text: o.label, value: o.value })), onFilter: (v, l) => (l.phoneCall || 'pending') === v },
    status: {
      filters: [
        ...toFilters(uniq([...SHEET_STATUSES.map((o) => o.value), ...data.map((l) => l.status)]), statusLabel),
        { text: 'Follow-up: upcoming', value: 'fu:green' },
        { text: 'Follow-up: due today / slightly late', value: 'fu:yellow' },
        { text: 'Follow-up: missed', value: 'fu:red' },
      ],
      onFilter: (v, l) => (String(v).startsWith('fu:') ? followUpBucket(l) === v.slice(3) : l.status === v),
    },
    assignedTo: { filters: [{ text: 'Unassigned', value: 'Unassigned' }, ...counselors.map((c) => ({ text: c.name, value: c._id }))], filterSearch: true, onFilter: (v, l) => (l.assignedTo || 'Unassigned') === v },
  };
  const sheetColumns = columns.map((c) => (columnFilters[c.key] ? { ...c, ...columnFilters[c.key], filterMultiple: true } : c));

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('leadId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDraggedOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    setDraggedOverCol(null);
    setDraggingId(null);
    if (id) {
      await handleStatusChange(id, targetStatus);
    }
  };

  const renderKanbanBoard = () => {
    const columnsList = [
      { key: 'new', title: 'New leads', color: '#96958e', bg: 'var(--ux-surface-2)' },
      { key: 'contacted', title: 'First contact', color: '#DE5C2B', bg: 'var(--ux-surface-2)' },
      { key: 'qualified', title: 'Profile qualified', color: '#111111', bg: 'var(--ux-surface-2)' },
      { key: 'converted', title: 'Converted', color: '#15803d', bg: 'var(--ux-surface-2)' },
      { key: 'closed', title: 'Archived / closed', color: '#dc2626', bg: 'var(--ux-surface-2)' }
    ];

    return (
      <div 
        style={{ 
          display: 'flex', 
          gap: '16px', 
          overflowX: 'auto', 
          padding: '12px 0', 
          minHeight: '600px', 
          alignItems: 'flex-start',
          scrollbarWidth: 'thin'
        }}
      >
        {columnsList.map(col => {
          const colLeads = filtered.filter(l => l.status === col.key);
          const isOver = draggedOverCol === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedOverCol !== col.key) {
                  setDraggedOverCol(col.key);
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDraggedOverCol(col.key);
              }}
              onDragLeave={() => {
                setDraggedOverCol(prev => prev === col.key ? null : prev);
              }}
              onDrop={(e) => handleDrop(e, col.key)}
              style={{
                flex: '1 0 280px',
                background: isOver ? 'var(--ux-brand-soft)' : 'var(--ux-surface-2)',
                border: isOver ? '1.5px dashed var(--ux-brand)' : '1px solid var(--ux-line-2)',
                borderRadius: '24px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '750px',
                overflowY: 'auto',
                boxShadow: 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 6px 2px' }}>
                <span style={{ fontWeight: 600, fontSize: '13.5px', letterSpacing: '-0.01em', color: 'var(--ux-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                  {col.title}
                </span>
                <span className="nx-tab-count" style={{ background: '#fff', border: '1px solid var(--ux-line-2)' }}>
                  {colLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100px' }}>
                {colLeads.length === 0 ? (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--ux-text-3)', fontSize: '12px', border: '1.5px dashed var(--ux-line)', borderRadius: '18px', background: 'transparent', transition: 'all 0.2s' }}>
                    Drag leads here
                  </div>
                ) : (
                  colLeads.map(l => {
                    const isDragging = draggingId === l._id;
                    return (
                      <div
                        key={l._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, l._id)}
                        onDragEnd={handleDragEnd}
                        style={{
                          background: 'var(--ux-surface)',
                          border: '1px solid var(--ux-line-2)',
                          borderRadius: '18px',
                          padding: '14px',
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          opacity: isDragging ? 0.35 : 1,
                          transform: isDragging ? 'scale(0.96)' : 'scale(1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isDragging ? 'none' : '0 1px 2px rgba(17,17,17,0.03)'
                        }}
                        onMouseEnter={(e) => {
                          if (!draggingId) {
                            e.currentTarget.style.borderColor = 'rgba(17,17,17,0.2)';
                            e.currentTarget.style.boxShadow = '0 12px 28px -18px rgba(17,17,17,0.25)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!draggingId) {
                            e.currentTarget.style.borderColor = 'var(--ux-line-2)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,17,17,0.03)';
                          }
                        }}
                      >
                        {/* Name & Country */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: '13.5px' }}>{l.name}</span>
                          <span style={{ fontSize: '13px' }} title={l.dreamCountry}>
                            {getCountryFlag(l.dreamCountry)}
                          </span>
                        </div>

                        {/* Contact & Edu details */}
                        <div style={{ color: 'var(--ux-text-2)', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                          <span><PhoneOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />{l.phone}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MailOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />{l.email}</span>
                          <span style={{ color: 'var(--ux-text-3)', fontSize: '11px', marginTop: '2px' }}><ReadOutlined style={{ marginRight: 6 }} />{l.highestEducation}</span>
                          <span style={{ color: 'var(--ux-text-3)', fontSize: '11px' }}><EnvironmentOutlined style={{ marginRight: 6 }} />{l.currentCity}</span>
                          <span style={{ color: 'var(--ux-text-2)', fontSize: '11px', fontWeight: 500, marginTop: '4px' }}><UserOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />Counselor: <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{counselorName(l.assignedTo)}</span></span>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '4px', borderTop: '1px solid var(--ux-line-2)', paddingTop: '10px' }}>
                          <span
                            title={l.latestSource || l.source}
                            style={{ fontSize: '11px', color: l.latestSource && l.latestSource !== l.source ? 'var(--ux-brand-strong)' : 'var(--ux-text-3)', fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            {l.latestSource || l.source || 'Website'}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenLead(l)}
                              className="nx-btn nx-btn--light nx-btn--sm"
                              style={{ height: 30, padding: '0 12px', fontSize: '12px' }}
                            >
                              Workspace
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const currentProgress = selectedLead ? getStatusProgress(selectedLead.status) : null;
  const currentTemp = selectedLead ? getTemperatureMeter(selectedLead.status) : null;

  return (
    <div>
      <Header title={VIEW_TITLES[view]?.title || 'Student leads & consultations'} subtitle={VIEW_TITLES[view]?.subtitle || 'All eligibility checks and consultation bookings'} />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav leadCounts={leadCounts} />
        {stageFilter && (() => {
          const col = STAGE_COLUMNS.find((c) => c.key === stageFilter);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px', padding: '8px 14px', borderRadius: 12, background: '#FFF7F2', border: '1px solid #F6D3C2', fontSize: 13.5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: col?.color || '#DE5C2B' }} />
              <span>Stage: <b>{col?.label || stageFilter}</b> · {filtered.length} lead{filtered.length === 1 ? '' : 's'}</span>
              <Button size="small" style={{ marginLeft: 'auto' }} onClick={() => { searchParams.delete('stage'); setSearchParams(searchParams); }}>Clear</Button>
            </div>
          );
        })()}
        <div className="page-stats-grid page-stats-grid--7">
          <StatsCard icon={<ContactsOutlined />} label="Total leads" value={countRows.length} color="brand" loading={loading} onClick={() => { setQuickFilter(''); setStatusFilter('all'); setDateRange(null); navigate(VIEW_PATHS.all); }} active={view === 'all' && !dateRange && !quickFilter && statusFilter === 'all'} />
          <StatsCard
            icon={<CalendarOutlined />}
            label="Today's leads"
            value={countRows.filter((l) => dayjs(l.createdAt).isSame(dayjs(), 'day')).length}
            color="brand"
            loading={loading}
            onClick={() => { setQuickFilter(''); setDateRange([dayjs(), dayjs()]); if (view !== 'all') navigate(VIEW_PATHS.all); }}
            active={!quickFilter && !!dateRange && dateRange[0]?.isSame(dayjs(), 'day') && dateRange[1]?.isSame(dayjs(), 'day')}
          />
          <StatsCard icon={<UserAddOutlined />} label="New (not contacted)" value={countRows.filter(isPendingNew).length} color="brand" loading={loading}
            onClick={() => { setDateRange(null); setQuickFilter('new'); if (view !== 'all') navigate(VIEW_PATHS.all); }} active={quickFilter === 'new'} />
          <StatsCard icon={<TrophyOutlined />} label="Converted" value={countRows.filter(l => l.status === 'converted').length} color="brand" loading={loading} onClick={() => { setQuickFilter(''); navigate(VIEW_PATHS.converted); }} active={view === 'converted'} />
          <StatsCard icon={<FireOutlined />} label="Interested" value={countRows.filter(l => l.status === 'interested').length} color="brand" loading={loading} onClick={() => { setQuickFilter(''); navigate(VIEW_PATHS.interested); }} active={view === 'interested'} />
          <StatsCard icon={<ClockCircleOutlined />} label="50 / 50" value={countRows.filter(l => l.status === 'fifty_fifty').length} color="brand" loading={loading} onClick={() => { setQuickFilter(''); setStatusFilter('fifty_fifty'); navigate(VIEW_PATHS.all); }} active={view === 'all' && statusFilter === 'fifty_fifty'} />
          <StatsCard icon={<CheckCircleOutlined />} label="Not interested" value={countRows.filter(l => l.status === 'not_interested').length} color="brand" loading={loading} onClick={() => { setQuickFilter(''); navigate(VIEW_PATHS.not_interested); }} active={view === 'not_interested'} />
        </div>

        {/* Follow-ups by due date, and whether they were kept on time (Follow-up page only) */}
        {view === 'followup' && (() => {
          const withFu = countRows.filter((l) => followUpBucket(l));
          const recent = countRows.flatMap((l) => (l.followUpHistory || []).filter((h) => dayjs(h.doneAt).isAfter(dayjs().subtract(30, 'day'))));
          const onTime = recent.filter((h) => h.onTime).length;
          return (
            <div className="page-table-card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Follow-ups</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Set a follow-up date in a lead; logging a call, WhatsApp or note on it marks it done.</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="nx-status nx-status--neutral">Last 30 days: {recent.length ? `${Math.round((onTime / recent.length) * 100)}% on time` : 'no follow-ups done yet'}</span>
                  {recent.length > 0 && <span style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{onTime} on time · {recent.length - onTime} late</span>}
                  {quickFilter && <Button size="small" onClick={() => setQuickFilter('')}>Clear filter</Button>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {FU_BOXES.map((b) => {
                  const list = withFu.filter((l) => followUpBucket(l) === b.key).sort((x, y) => new Date(x.nextFollowUpDate) - new Date(y.nextFollowUpDate));
                  const active = quickFilter === `fu_${b.key}`;
                  return (
                    <div key={b.key} role="button" tabIndex={0} onClick={() => { setDateRange(null); setQuickFilter(active ? '' : `fu_${b.key}`); }}
                      style={{ cursor: 'pointer', borderRadius: 14, padding: 14, background: b.bg, border: `2px solid ${active ? b.fg : b.line}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, color: b.fg }}>{b.title}</span>
                        <span style={{ fontSize: 26, fontWeight: 800, color: b.fg }}>{list.length}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginBottom: 8 }}>{b.hint}</div>
                      {list.slice(0, 4).map((l) => {
                        const late = dayjs().startOf('day').diff(dayjs(l.nextFollowUpDate).startOf('day'), 'day');
                        return (
                          <div key={l._id} onClick={(e) => { e.stopPropagation(); handleOpenLead(l); }}
                            style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, padding: '5px 8px', borderRadius: 8, background: '#fff', marginTop: 4 }}>
                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name || 'Unnamed'}</span>
                            <span style={{ color: b.fg, whiteSpace: 'nowrap' }}>{late < 0 ? dayjs(l.nextFollowUpDate).format('D MMM') : late === 0 ? 'Today' : `${late}d late`}</span>
                          </div>
                        );
                      })}
                      {list.length > 4 && <div style={{ fontSize: 12, color: b.fg, marginTop: 6 }}>+{list.length - 4} more · click to see all</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="nx-toolbar page-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
          {/* Row 1: filters */}
          <div className="page-toolbar-left" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240, maxWidth: '100%' }} allowClear />
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(v) => setDateRange(v && v[0] && v[1] ? v : null)}
              format="D MMM YYYY"
              placeholder={['From date', 'To date']}
              allowClear
              presets={[
                { label: 'Today', value: [dayjs(), dayjs()] },
                { label: 'Yesterday', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
                { label: 'Last 7 days', value: [dayjs().subtract(6, 'day'), dayjs()] },
                { label: 'Last 30 days', value: [dayjs().subtract(29, 'day'), dayjs()] },
                { label: 'This month', value: [dayjs().startOf('month'), dayjs()] },
                { label: 'Last month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
              ]}
              disabledDate={(d) => d && d.isAfter(dayjs().endOf('day'))}
              style={{ width: 250 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
              <Option value="all">All statuses</Option>
              {SHEET_STATUSES.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
            </Select>
            <Select value={followUpFilter} onChange={setFollowUpFilter} style={{ width: 190 }}>
              <Option value="all">All lead interactions</Option>
              <Option value="due">Follow-up due / overdue</Option>
              <Option value="call_done">Call done</Option>
              <Option value="call_pending">Call pending</Option>
            </Select>
            <Select
              mode="multiple"
              allowClear
              placeholder="Filter by tag"
              value={tagFilter}
              onChange={setTagFilter}
              options={allTagOptions}
              maxTagCount="responsive"
              style={{ minWidth: 180, maxWidth: 320 }}
            />
            {!ownLeadsOnly && (
              <Select value={counselorFilter} onChange={setCounselorFilter} style={{ width: 160 }}>
                <Option value="all">All counselors</Option>
                <Option value="Unassigned">Unassigned</Option>
                {counselors.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
              </Select>
            )}

            <Select value={docsFilter} onChange={setDocsFilter} style={{ width: 190 }}>
              <Option value="all">All documents</Option>
              <Option value="any">Uploaded documents</Option>
              <Option value="review">Documents to review</Option>
            </Select>

            {/* Pipeline Selector Dropdown */}
            <Select 
              value={selectedPipelineId} 
              onChange={(val) => {
                setSelectedPipelineId(val);
                if (val !== 'default') {
                  navigate(`/crm/board?pipeline=${val}${viewMode === 'table' ? '&view=table' : ''}`);
                }
              }} 
              style={{ width: 230 }}
              placeholder="Select Pipeline"
            >
              <Option value="default">Default leads ({data.length})</Option>
              {pipelines.map(p => (
                <Option key={p._id} value={p._id}>{p.name} ({p.submissionCount || 0})</Option>
              ))}
            </Select>

            {/* View Mode Toggle */}
          </div>
          {/* Row 2: view, actions and the count */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', paddingTop: 10, borderTop: '1px solid #f1f1ef' }}>
            <div style={{ display: 'flex', border: '1px solid #eeede8', background: '#ffffff', borderRadius: '999px', padding: '3px', height: '40px', alignItems: 'center' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '0 14px',
                  borderRadius: '999px',
                  background: viewMode === 'table' ? '#111111' : 'transparent',
                  color: viewMode === 'table' ? '#fff' : 'var(--ux-text-2)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s'
                }}
              >
                <UnorderedListOutlined style={{ marginRight: 6 }} />Table view
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '0 14px',
                  borderRadius: '999px',
                  background: viewMode === 'kanban' ? '#111111' : 'transparent',
                  color: viewMode === 'kanban' ? '#fff' : 'var(--ux-text-2)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s'
                }}
              >
                <AppstoreOutlined style={{ marginRight: 6 }} />Stage board
              </button>
              <button
                onClick={() => setViewMode('journey')}
                style={{
                  padding: '0 14px',
                  borderRadius: '999px',
                  background: viewMode === 'journey' ? '#111111' : 'transparent',
                  color: viewMode === 'journey' ? '#fff' : 'var(--ux-text-2)',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s'
                }}
              >
                <NodeIndexOutlined style={{ marginRight: 6 }} />Journey
              </button>
            </div>

            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              Export leads
            </Button>
            {can('leads', 'create') && !ownLeadsOnly && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('csv-import-file').click()}
              >
                Import leads
              </Button>
            )}
            <Button
              type="primary"
              icon={<RobotOutlined />}
              loading={batchScoring}
              onClick={handleBatchScoreLeads}
            >
              AI auto-score leads
            </Button>
            <input 
              type="file" 
              id="csv-import-file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              style={{ display: 'none' }} 
            />
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ux-text-2)', whiteSpace: 'nowrap' }}>Total <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{filtered.length}</strong> leads{dateRange ? (dateRange[0].isSame(dateRange[1], 'day') ? ` on ${dateRange[0].format('D MMM YYYY')}` : ` from ${dateRange[0].format('D MMM')} to ${dateRange[1].format('D MMM YYYY')}`) : ''}</div>
          </div>
        </div>
        
        {viewMode === 'journey' ? (
          <LeadJourneyView leads={filtered} onOpen={handleOpenLead} onChanged={(id, patch) => { setData((prev) => prev.map((l) => (l._id === id ? { ...l, ...patch } : l))); invalidateCache('/admin/leads'); }} />
        ) : viewMode === 'table' ? (
          <div className="page-table-card">
            {selectedRowKeys.length > 0 && (
              <div className="lead-bulk-bar">
                <strong>{selectedRowKeys.length} selected</strong>
                <Select
                  mode="tags"
                  value={bulkTags}
                  onChange={setBulkTags}
                  options={manualTagOptions}
                  placeholder="Tag, e.g. VIP"
                  style={{ minWidth: 200 }}
                  tokenSeparators={[',']}
                />
                <Button type="primary" size="small" onClick={() => applyBulkTags('add')}>Add tag</Button>
                <Button size="small" onClick={() => applyBulkTags('remove')}>Remove tag</Button>
                <Button size="small" type="text" onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </div>
            )}
            <Table 
              rowKey="_id" 
              columns={sheetColumns}
              rowSelection={can('leads', 'update') ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined}
              dataSource={filtered} 
              loading={loading} 
              pagination={{ pageSize: 15 }} 
              scroll={{ x: 1500 }}
              sticky={{ offsetHeader: 0 }}
              bordered
              size="middle"
              className="leads-sheet"
              onRow={(record) => ({
                onClick: () => handleOpenLead(record),
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        ) : (
          <LeadStageBoard leads={filtered} onOpen={handleOpenLead} onChanged={(id, patch) => { setData((prev) => prev.map((l) => (l._id === id ? { ...l, ...patch } : l))); invalidateCache('/admin/leads'); }} />
        )}
      </div>

      {/* Lead Detail & Marketing Workspace Modal (Clean Light Theme) */}
      <Modal 
        open={!!selectedLead} 
        onCancel={() => setSelectedLead(null)} 
        footer={null} 
        title={null}
        closable={false} 
        width={1180}
        centered
        style={{ top: 20, maxWidth: '96vw' }}
        styles={{ 
          body: { padding: 0 },
          content: { 
            padding: 0, 
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid var(--ux-line-2)',
            boxShadow: '0 24px 60px -24px rgba(17, 17, 17, 0.3)'
          } 
        }}
      >
        {selectedLead && (
          <div style={{ background: 'var(--ux-surface)', color: 'var(--ux-text)', display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. TOP HEADER BAR */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '20px 28px',
              borderBottom: '1px solid var(--ux-line-2)',
              background: 'var(--ux-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  minWidth: '52px',
                  borderRadius: '50%',
                  background: 'var(--ux-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: 600
                }}>
                  {selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ color: 'var(--ux-ink)', fontSize: '21px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                      {selectedLead.name}
                    </h2>
                    <span className={`nx-status ${selectedLead.verified ? 'nx-status--success' : 'nx-status--warning'}`}>
                      {selectedLead.verified ? <CheckCircleOutlined /> : null}
                      {selectedLead.verified ? 'Verified' : 'Unverified'}
                    </span>
                    {!!selectedLead.duplicateLeads?.length && (
                      <span className="nx-status nx-status--accent">
                        <NodeIndexOutlined /> {selectedLead.duplicateLeads.length + 1} linked lead records
                      </span>
                    )}
                    {selectedLead.totalInquiries > 1 && (
                      <span className="nx-status nx-status--neutral">
                        <RetweetOutlined /> {selectedLead.totalInquiries} enquiries on this record
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 12px', marginTop: '6px', fontSize: '12.5px', color: 'var(--ux-text-2)' }}>
                    <span>Registered: <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{new Date(selectedLead.createdAt).toLocaleDateString()}</strong></span>
                    <span>•</span>
                    <span>Source: <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{selectedLead.source}</strong></span>
                    {selectedLead.latestSource && selectedLead.latestSource !== selectedLead.source && (
                      <>
                        <span>•</span>
                        <span>
                          Latest enquiry: <strong style={{ color: 'var(--ux-brand-strong)', fontWeight: 600 }}>{selectedLead.latestSource}</strong>
                          {selectedLead.lastInquiryAt && ` (${new Date(selectedLead.lastInquiryAt).toLocaleDateString()})`}
                        </span>
                      </>
                    )}
                    {describeAdTouch(selectedLead.attribution?.lastTouch) && (
                      <>
                        <span>•</span>
                        <span title={describeAdTouch(selectedLead.attribution?.firstTouch) ? `First visit: ${describeAdTouch(selectedLead.attribution.firstTouch)}` : undefined}>
                          Campaign: <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{describeAdTouch(selectedLead.attribution.lastTouch)}</strong>
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>ID: <code style={{ fontSize: '11px', background: 'var(--ux-surface-3)', padding: '2px 8px', borderRadius: '999px', color: 'var(--ux-text-2)' }}>{selectedLead._id?.slice(-6)}</code></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'var(--ux-surface-2)',
                  border: '1px solid var(--ux-line-2)',
                  borderRadius: '999px',
                  height: '40px',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '15px' }}>{getCountryFlag(selectedLead.dreamCountry)}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ux-ink)' }}>
                    Target: {selectedLead.dreamCountry}
                  </span>
                </div>
                {(() => {
                  const sid = selectedLead.userId || data.find((l) => l._id === selectedLead._id)?.journey?.userId;
                  return sid ? (
                    <Button onClick={() => setOpenStudentId(sid)} style={{ height: 40, borderRadius: 999 }}>Journey &amp; documents</Button>
                  ) : null;
                })()}
                <button
                  onClick={() => setSelectedLead(null)}
                  aria-label="Close"
                  style={{
                    background: 'var(--ux-surface)',
                    border: '1px solid var(--ux-line)',
                    color: 'var(--ux-ink)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ux-surface-2)'; e.currentTarget.style.color = 'var(--ux-ink)'; e.currentTarget.style.borderColor = 'rgba(17,17,17,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ux-surface)'; e.currentTarget.style.color = 'var(--ux-ink)'; e.currentTarget.style.borderColor = 'var(--ux-line)'; }}
                >
                  <CloseOutlined />
                </button>
              </div>
            </div>

            {/* 2. STATUS + NEXT FOLLOW-UP (one simple row) */}
            {(() => {
              const box = FU_BOXES.find((x) => x.key === followUpBucket(selectedLead));
              return (
                <div style={{ background: 'var(--ux-surface-2)', borderBottom: '1px solid var(--ux-line-2)', padding: '12px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 24px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ux-text-2)' }}>
                    Status
                    <Select value={selectedLead.status} size="small" style={{ width: 160 }} onChange={(val) => handleStatusChange(selectedLead._id, val)}>
                      {SHEET_STATUSES.map((o) => <Option key={o.value} value={o.value}><StatusChip status={o.value} style={{ height: 22 }} /></Option>)}
                      {!SHEET_STATUSES.some((o) => o.value === selectedLead.status) && <Option value={selectedLead.status}><StatusChip status={selectedLead.status} style={{ height: 22 }} /></Option>}
                    </Select>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ux-text-2)' }}>
                    Next follow-up
                    {selectedLead.nextFollowUpDate ? (
                      <span style={{ fontWeight: 700, color: box?.fg || 'var(--ux-ink)', background: box?.bg, border: box ? `1px solid ${box.line}` : 'none', borderRadius: 999, padding: '2px 10px' }}>
                        {dayjs(selectedLead.nextFollowUpDate).format('D MMM YYYY')}{box ? ` · ${box.key === 'green' ? 'Upcoming' : box.key === 'yellow' ? (dayjs().isSame(dayjs(selectedLead.nextFollowUpDate), 'day') ? 'Today' : 'Slightly late') : 'Missed'}` : ''}
                      </span>
                    ) : <span style={{ color: 'var(--ux-text-3)' }}>Not set</span>}
                  </span>
                </div>
              );
            })()}

            {/* 3. MAIN WORKSPACE CONTENT (Split Layout) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '24px 28px', background: 'var(--ux-surface-2)', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              
              {/* LEFT COLUMN: Student Profile & History Cards (Fixed Width) */}
              <div style={{ flex: '0 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Profile Details Card */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '18px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                    Student contact & academic
                  </div>
                  
                  {(() => {
                    const st = leadStudent;
                    const rows = [
                      ['Phone', st?.phone || selectedLead.phone],
                      ['Email', selectedLead.email],
                      ['Country', st?.dreamCountry || selectedLead.dreamCountry],
                      ['Intake', st?.preferredIntake || selectedLead.preferredIntake],
                      ['Course', st?.dreamCourse],
                      ['Highest qualification', st?.highestEducation || selectedLead.highestEducation],
                      ['Percentage', st?.percentage ? `${st.percentage}%` : ''],
                      ['Passout year', st?.passoutYear],
                      ['City', st?.currentCity || selectedLead.currentCity],
                      ['Total inquiries', `${selectedLead.totalInquiries || 1}${selectedLead.totalInquiries > 1 ? ' (repeat student)' : ''}`],
                    ];
                    const missing = (v) => !v || ['Not specified', 'Not provided', 'Undecided'].includes(v);
                    return (
                      <>
                        <div style={{ marginBottom: 12 }}>
                          {leadStudentLoading ? (
                            <span style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>Checking student account…</span>
                          ) : st ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              <span className={`nx-status ${st.profileCompleted ? 'nx-status--success' : 'nx-status--warning'}`}>{st.profileCompleted ? 'Profile filled' : 'Profile not filled yet'}</span>
                              {st.stageLabel && <span className="nx-status nx-status--accent">{st.phaseLabel} · {st.stageLabel}</span>}
                              <span className="nx-status nx-status--neutral">{st.referredBy ? `Mentor: ${st.referredBy.name}` : 'Direct sign-up'}</span>
                              <span className="nx-status nx-status--neutral">{st.documentsUploaded} documents</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>No student account with this email yet (lead form details only)</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {rows.map(([label, value]) => (
                            <div key={label} style={{ padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: 12, gridColumn: label === 'Email' || label === 'Course' ? 'span 2' : undefined, minWidth: 0 }}>
                              <div style={{ color: 'var(--ux-text-2)', fontSize: 11 }}>{label}</div>
                              <div style={{ color: missing(value) ? 'var(--ux-text-3)' : 'var(--ux-ink)', fontSize: 13, fontWeight: 600, marginTop: 2, wordBreak: 'break-word' }}>
                                {missing(value) ? 'Not filled' : value}
                              </div>
                            </div>
                          ))}
                        </div>
                        {st && (
                          <Button block style={{ marginTop: 12 }} onClick={() => setOpenStudentId(st._id)}>
                            Open full student profile & documents
                          </Button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* AI Lead Intelligence Card */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid var(--ux-line-2)',
                  padding: '18px',
                  boxShadow: '0 1px 2px rgba(17,17,17,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RobotOutlined style={{ color: 'var(--ux-brand)' }} /> AI lead intelligence
                    </span>
                    <Button
                      size="small"
                      icon={<ThunderboltOutlined />}
                      loading={scoringLeadId === selectedLead._id}
                      onClick={() => handleScoreSingleLead(selectedLead._id)}
                    >
                      Re-score
                    </Button>
                  </div>

                  {selectedLead.aiScoring?.score !== undefined ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', color: selectedLead.aiScoring.category === 'Hot' ? '#dc2626' : selectedLead.aiScoring.category === 'Warm' ? '#b45309' : 'var(--ux-ink)' }}>
                          {selectedLead.aiScoring.category === 'Hot' ? 'Hot lead' : selectedLead.aiScoring.category === 'Warm' ? 'Warm lead' : 'Cold lead'}
                        </span>
                        <span className={`nx-status ${selectedLead.aiScoring.category === 'Hot' ? 'nx-status--danger' : selectedLead.aiScoring.category === 'Warm' ? 'nx-status--warning' : 'nx-status--neutral'}`}>
                          {selectedLead.aiScoring.score}/100 score
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ background: 'var(--ux-surface-3)', height: '8px', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{
                          height: '100%',
                          width: `${selectedLead.aiScoring.score}%`,
                          background: selectedLead.aiScoring.category === 'Hot' ? '#dc2626' : selectedLead.aiScoring.category === 'Warm' ? '#f59e0b' : 'var(--ux-ink)',
                          borderRadius: '999px'
                        }} />
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--ux-text-2)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                        {selectedLead.aiScoring.rationale}
                      </p>

                      {selectedLead.aiScoring.suggestedAction && (
                        <div style={{ background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', padding: '10px 12px', borderRadius: '14px', fontSize: '12px', color: 'var(--ux-text)', lineHeight: 1.45 }}>
                          <strong style={{ fontWeight: 600 }}><BulbOutlined style={{ color: 'var(--ux-brand)' }} /> Counselor action:</strong> {selectedLead.aiScoring.suggestedAction}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <p style={{ fontSize: '12.5px', color: 'var(--ux-text-3)', marginBottom: '10px' }}>No AI score calculated yet</p>
                      <Button
                        size="small"
                        type="primary"
                        icon={<RobotOutlined />}
                        loading={scoringLeadId === selectedLead._id}
                        onClick={() => handleScoreSingleLead(selectedLead._id)}
                      >
                        Calculate AI score
                      </Button>
                    </div>
                  )}
                </div>

                {/* Inquired Universities Card - Always Visible */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '18px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BankOutlined style={{ color: 'var(--ux-text-3)' }} /> Inquired universities ({selectedLead.interestedUniversities?.length || 0})
                  </div>
                  {selectedLead.interestedUniversities && selectedLead.interestedUniversities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedLead.interestedUniversities.map((u, idx) => (
                        <div key={idx} style={{ padding: '10px 12px', background: 'var(--ux-surface-2)', borderRadius: '14px', border: '1px solid var(--ux-line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: 'var(--ux-ink)', fontSize: '12.5px', fontWeight: 600 }}>{u.name}</div>
                            <div style={{ color: 'var(--ux-text-3)', fontSize: '11.5px' }}>{u.country} {u.source ? `• ${u.source}` : ''}</div>
                          </div>
                          <span style={{ color: 'var(--ux-text-3)', fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>{new Date(u.date).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--ux-text-3)', textAlign: 'center', padding: '16px 12px', background: 'var(--ux-surface-2)', borderRadius: '14px', border: '1.5px dashed var(--ux-line)', fontSize: '12px' }}>
                      Student ne abhi tak kisi university ki eligibility check nahi ki hai.
                    </div>
                  )}
                </div>

                {/* Saved Universities from Shortlist - Always Visible */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '18px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarOutlined style={{ color: 'var(--ux-text-3)' }} /> Shortlisted / saved universities ({selectedLead.savedUniversities?.length || 0})
                  </div>
                  {selectedLead.savedUniversities && selectedLead.savedUniversities.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedLead.savedUniversities.map((u, idx) => (
                        <div key={idx} style={{ padding: '10px 12px', background: 'var(--ux-surface-2)', borderRadius: '14px', border: '1px solid var(--ux-line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: 'var(--ux-ink)', fontSize: '12.5px', fontWeight: 600 }}>{u.name}</div>
                            <div style={{ color: 'var(--ux-text-3)', fontSize: '11.5px' }}>{u.countryName || 'Global'} {u.tuition ? `• ${u.tuition}` : ''}</div>
                          </div>
                          <span className="nx-status nx-status--accent" style={{ height: 22 }}>Saved</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--ux-text-3)', textAlign: 'center', padding: '16px 12px', background: 'var(--ux-surface-2)', borderRadius: '14px', border: '1.5px dashed var(--ux-line)', fontSize: '12px' }}>
                      Student ne abhi tak koi university bookmark/save nahi ki hai.
                    </div>
                  )}
                </div>

                {/* Counselor Assignment & Pipeline Control */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '18px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Change pipeline stage
                    </span>
                    <Select 
                      value={selectedLead.status} 
                      style={{ width: '100%' }}
                      onChange={(val) => handleStatusChange(selectedLead._id, val)}
                    >
                      {Object.keys(statusColors).map(s => (
                        <Option key={s} value={s}>
                          <StatusChip status={s} style={{ height: 22 }} />
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Assigned counselor
                    </span>
                    <Select 
                      value={selectedLead.assignedTo || 'Unassigned'} 
                      style={{ width: '100%' }}
                      onChange={(val) => handleCounselorChange(selectedLead._id, val)}
                      disabled={!canReassign}
                      labelRender={({ value }) => counselorName(value)}
                    >
                      <Option value="Unassigned"><span style={{ color: 'var(--ux-text-3)' }}>Unassigned</span></Option>
                      {counselors.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                    </Select>
                  </div>

                  {selectedLead.nextFollowUpDate && (
                    <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--ux-brand-soft)', borderRadius: '14px' }}>
                      <span style={{ color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'block', marginBottom: '2px', fontSize: '12px' }}>
                        Next follow-up scheduled
                      </span>
                      <div style={{ color: 'var(--ux-ink)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarOutlined /> {new Date(selectedLead.nextFollowUpDate).toLocaleDateString()}
                        {(() => {
                          const b = followUpBucket(selectedLead);
                          const box = FU_BOXES.find((x) => x.key === b);
                          return box ? <span style={{ marginLeft: 6, fontSize: 11.5, fontWeight: 700, color: box.fg, background: box.bg, border: `1px solid ${box.line}`, borderRadius: 999, padding: '1px 8px' }}>{box.title}</span> : null;
                        })()}
                      </div>
                    </div>
                  )}
                  {(selectedLead.followUpHistory || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <span style={{ color: 'var(--ux-text-2)', fontWeight: 600, display: 'block', marginBottom: 6, fontSize: 12 }}>Follow-up record</span>
                      {[...selectedLead.followUpHistory].reverse().slice(0, 6).map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5, padding: '6px 0', borderBottom: '1px solid var(--ux-line-2)' }}>
                          <span>Due {dayjs(h.dueDate).format('D MMM')} · done {dayjs(h.doneAt).format('D MMM')}{h.by ? ` by ${h.by}` : ''}</span>
                          <span style={{ fontWeight: 700, color: h.onTime ? '#047857' : '#B91C1C' }}>{h.onTime ? 'On time' : `${h.daysLate}d late`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Communication & Timeline Hub */}
              <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '20px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)', height: '100%' }}>
                  <Tabs 
                    defaultActiveKey="timeline"
                    items={[
                      {
                        key: 'timeline',
                        label: <span><ClockCircleOutlined /> Remarks & follow-up</span>,
                        children: (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Log Call Note Form */}
                            <div style={{ background: 'var(--ux-surface-2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--ux-line-2)' }}>
                              <h4 style={{ color: 'var(--ux-ink)', marginBottom: '10px', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>
                                Add a remark
                              </h4>
                              <Form form={activityForm} layout="vertical" onFinish={handleLogActivity} initialValues={{ type: 'call' }}>
                                <Form.Item name="type" style={{ marginBottom: '10px' }}>
                                  <Segmented options={[{ label: 'Call', value: 'call' }, { label: 'WhatsApp', value: 'whatsapp' }, { label: 'Email', value: 'email' }, { label: 'Note', value: 'note' }]} />
                                </Form.Item>
                                <Form.Item name="comment" rules={[{ required: true, message: 'Write what you talked about' }]} style={{ marginBottom: '12px' }}>
                                  <Input.TextArea 
                                    placeholder="What did you talk about? e.g. Wants Canada for Sep 2027, will share marks by Friday, asked about loans."
                                    rows={3}
                                  />
                                </Form.Item>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                  <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', fontWeight: 600 }}>Next follow-up date</span>} name="nextFollowUpDate" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                    <DatePicker style={{ width: '100%' }} format="D MMM YYYY" placeholder="When to follow up next" disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))} />
                                  </Form.Item>

                                  <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', fontWeight: 600 }}>Change status (optional)</span>} name="status" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                    <Select placeholder="Keep current status" allowClear>
                                      {SHEET_STATUSES.map((o) => <Option key={o.value} value={o.value}><StatusChip status={o.value} style={{ height: 22 }} /></Option>)}
                                    </Select>
                                  </Form.Item>
                                </div>

                                <Button type="primary" htmlType="submit" style={{ marginTop: '14px' }}>
                                  Save remark
                                </Button>
                              </Form>
                            </div>

                            {/* Timeline Feed */}
                            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                              {(!selectedLead.activities || selectedLead.activities.length === 0) ? (
                                <div style={{ color: 'var(--ux-text-3)', textAlign: 'center', padding: '30px 20px', background: 'var(--ux-surface-2)', borderRadius: '16px', border: '1.5px dashed var(--ux-line)' }}>
                                  No interactions logged yet. Log your first call notes or inquiries above.
                                </div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {selectedLead.activities.slice().reverse().map((act, actIdx) => {
                                    // Things the system logged on its own show as a small grey line; remarks by staff get a card
                                    const auto = act.type === 'status_change' || /bot/i.test(act.performedBy || '') || /^(Follow-up set for|Follow-up date removed|Lead assignment|Direct booking|Chatbot:)/.test(act.comment || '');
                                    const when = dayjs(act.date).format('D MMM YYYY, h:mm A');
                                    if (auto) {
                                      return (
                                        <div key={actIdx} style={{ fontSize: 12, color: 'var(--ux-text-3)', padding: '2px 4px' }}>
                                          {when} · {act.comment}{act.performedBy ? ` · ${act.performedBy}` : ''}
                                        </div>
                                      );
                                    }
                                    const kind = { call: 'Call', whatsapp: 'WhatsApp', email: 'Email' }[act.type] || 'Note';
                                    return (
                                      <div key={actIdx} style={{ background: '#fff', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--ux-line-2)', borderLeft: `3px solid ${actIdx === 0 ? '#DE5C2B' : 'var(--ux-line)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12, marginBottom: 4 }}>
                                          <span><b style={{ color: 'var(--ux-ink)' }}>{kind}</b> <span style={{ color: 'var(--ux-text-3)' }}>by {act.performedBy || 'Admin'}</span></span>
                                          <span style={{ color: 'var(--ux-text-3)' }}>{when}</span>
                                        </div>
                                        <div style={{ fontSize: 13.5, color: 'var(--ux-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{act.comment}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      },
                      {
                        key: 'whatsapp',
                        label: <span><WhatsAppOutlined /> WhatsApp studio</span>,
                        children: (
                          <div>
                            {/* AI 1-Click Smart Reply Assistant Banner */}
                            <div style={{
                              background: 'var(--ux-surface-2)',
                              border: '1px solid var(--ux-line-2)',
                              borderRadius: '16px',
                              padding: '14px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--ux-ink)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <RobotOutlined style={{ color: 'var(--ux-brand)' }} /> AI 1-click smart WhatsApp assistant
                                </span>
                                <Button
                                  size="small"
                                  type="primary"
                                  loading={generatingAiReply}
                                  onClick={() => handleGenerateAiReply('whatsapp', aiGoal)}
                                >
                                  Generate reply
                                </Button>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[
                                  { key: 'book_call', label: 'Book 1-on-1 call' },
                                  { key: 'request_documents', label: 'Request academic transcripts' },
                                  { key: 'intake_deadline', label: 'Intake deadline alert' },
                                  { key: 'shortlist_pitch', label: 'Pitch top universities' }
                                ].map(g => (
                                  <button
                                    key={g.key}
                                    type="button"
                                    onClick={() => {
                                      setAiGoal(g.key);
                                      handleGenerateAiReply('whatsapp', g.key);
                                    }}
                                    style={{
                                      height: '32px',
                                      padding: '0 14px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      border: aiGoal === g.key ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line)',
                                      background: aiGoal === g.key ? 'var(--ux-ink)' : '#ffffff',
                                      color: aiGoal === g.key ? '#ffffff' : 'var(--ux-text-2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {g.label}
                                  </button>
                                ))}
                              </div>

                              {aiReplyTip && (
                                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--ux-text)', background: 'var(--ux-brand-soft)', padding: '8px 12px', borderRadius: '12px' }}>
                                  <strong style={{ fontWeight: 600, color: 'var(--ux-brand-strong)' }}><BulbOutlined /> Counselor tip:</strong> {aiReplyTip}
                                </div>
                              )}
                            </div>

                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ux-text-2)', marginBottom: '8px' }}>Pre-built templates</div>

                            {/* Template Choice Chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                              {whatsappTemplates.map(t => {
                                const isSelected = waTemplateKey === t.key;
                                return (
                                  <div 
                                    key={t.key}
                                    onClick={() => {
                                      setWaMessage(t.text(selectedLead));
                                      setWaTemplateKey(t.key);
                                    }}
                                    style={{
                                      flex: '1 1 120px',
                                      background: '#ffffff',
                                      border: isSelected ? '1.5px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                                      borderRadius: '16px',
                                      padding: '12px 10px',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <span style={{ fontSize: '16px', display: 'block', marginBottom: '4px', color: isSelected ? 'var(--ux-ink)' : 'var(--ux-text-3)' }}>
                                      {t.key === 'welcome' ? <SmileOutlined /> : t.key === 'consultation' ? <CalendarOutlined /> : <EditOutlined />}
                                    </span>
                                    <span style={{ color: isSelected ? 'var(--ux-ink)' : 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>
                                      {t.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <Form layout="vertical">
                              <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontWeight: 600, fontSize: '12.5px' }}>Message preview / editor</span>}>
                                <Input.TextArea
                                  value={waMessage}
                                  onChange={(e) => setWaMessage(e.target.value)}
                                  rows={5}
                                />
                              </Form.Item>

                              <Button
                                type="primary"
                                icon={<WhatsAppOutlined />}
                                onClick={() => handleWhatsAppSend(selectedLead)}
                              >
                                Launch WhatsApp chat & log
                              </Button>
                            </Form>
                          </div>
                        )
                      },
                      {
                        key: 'email',
                        label: <span><MailOutlined /> Email studio</span>,
                        children: (
                          <div>
                            {/* AI 1-Click Smart Reply Assistant Banner for Email */}
                            <div style={{
                              background: 'var(--ux-surface-2)',
                              border: '1px solid var(--ux-line-2)',
                              borderRadius: '16px',
                              padding: '14px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--ux-ink)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <RobotOutlined style={{ color: 'var(--ux-brand)' }} /> AI 1-click email composer
                                </span>
                                <Button
                                  size="small"
                                  type="primary"
                                  loading={generatingAiReply}
                                  onClick={() => handleGenerateAiReply('email', aiGoal)}
                                >
                                  Generate email
                                </Button>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[
                                  { key: 'book_call', label: 'Counseling invite' },
                                  { key: 'request_documents', label: 'Document checklist' },
                                  { key: 'intake_deadline', label: 'Intake deadline alert' },
                                  { key: 'scholarship_pitch', label: 'Scholarship pitch' }
                                ].map(g => (
                                  <button
                                    key={g.key}
                                    type="button"
                                    onClick={() => {
                                      setAiGoal(g.key);
                                      handleGenerateAiReply('email', g.key);
                                    }}
                                    style={{
                                      height: '32px',
                                      padding: '0 14px',
                                      borderRadius: '999px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      border: aiGoal === g.key ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line)',
                                      background: aiGoal === g.key ? 'var(--ux-ink)' : '#ffffff',
                                      color: aiGoal === g.key ? '#ffffff' : 'var(--ux-text-2)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {g.label}
                                  </button>
                                ))}
                              </div>

                              {aiReplyTip && (
                                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--ux-text)', background: 'var(--ux-brand-soft)', padding: '8px 12px', borderRadius: '12px' }}>
                                  <strong style={{ fontWeight: 600, color: 'var(--ux-brand-strong)' }}><BulbOutlined /> Counselor tip:</strong> {aiReplyTip}
                                </div>
                              )}
                            </div>

                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ux-text-2)', marginBottom: '8px' }}>Pre-built templates</div>

                            {/* Template Choice Chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                              {emailTemplates.map(t => {
                                const isSelected = emailTemplateKey === t.key;
                                return (
                                  <div 
                                    key={t.key}
                                    onClick={() => {
                                      setEmailSubject(t.subject(selectedLead));
                                      setEmailBody(t.html(selectedLead));
                                      setEmailTemplateKey(t.key);
                                    }}
                                    style={{
                                      flex: '1 1 120px',
                                      background: '#ffffff',
                                      border: isSelected ? '1.5px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                                      borderRadius: '16px',
                                      padding: '12px 10px',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <span style={{ fontSize: '16px', display: 'block', marginBottom: '4px', color: isSelected ? 'var(--ux-ink)' : 'var(--ux-text-3)' }}>
                                      {t.key === 'welcome' ? <SmileOutlined /> : t.key === 'consultation' ? <PhoneOutlined /> : <EditOutlined />}
                                    </span>
                                    <span style={{ color: isSelected ? 'var(--ux-ink)' : 'var(--ux-text-2)', fontSize: '12px', fontWeight: 600 }}>
                                      {t.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <Form layout="vertical">
                              <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontWeight: 600, fontSize: '12.5px' }}>Subject line</span>}>
                                <Input
                                  value={emailSubject}
                                  onChange={(e) => setEmailSubject(e.target.value)}
                                />
                              </Form.Item>

                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                                  <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontWeight: 600, fontSize: '12.5px' }}>Email HTML body</span>}>
                                    <Input.TextArea
                                      value={emailBody}
                                      onChange={(e) => setEmailBody(e.target.value)}
                                      rows={6}
                                      style={{ fontFamily: 'monospace', fontSize: 12 }}
                                    />
                                  </Form.Item>
                                </div>

                                <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Email preview</span>
                                  <div
                                    style={{
                                      flex: 1,
                                      background: 'var(--ux-surface-2)',
                                      color: 'var(--ux-text)',
                                      padding: '12px',
                                      borderRadius: '14px',
                                      border: '1px solid var(--ux-line-2)',
                                      overflowY: 'auto',
                                      maxHeight: '140px',
                                      fontSize: '12px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: emailBody }}
                                  />
                                </div>
                              </div>

                              <Button
                                type="primary"
                                icon={<MailOutlined />}
                                onClick={() => handleEmailSend(selectedLead)}
                                loading={sendingEmail}
                              >
                                Send email & log interaction
                              </Button>
                            </Form>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </Modal>
      <StudentDrawer studentId={openStudentId} open={Boolean(openStudentId)} onClose={() => setOpenStudentId(null)} onChanged={() => { invalidateCache('/admin/leads'); fetchLeads(true); }} />
    </div>
  );
};

export default Leads;
