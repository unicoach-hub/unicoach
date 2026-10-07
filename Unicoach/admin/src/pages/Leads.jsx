import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Select, message, Input, Modal, Tabs, Timeline, DatePicker, Button, Form, Popover, Tooltip, Progress, Badge, Spin, Popconfirm } from 'antd';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { escapeHtml as esc, plainTextToHtml } from '../utils/escapeHtml';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  ContactsOutlined,
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
  AppstoreOutlined
} from '@ant-design/icons';

const { Option } = Select;

const counselors = ['Pooja Sharma', 'Rohan Verma', 'Amit Patel', 'Sara Khan'];

const statusColors = {
  new: 'blue', contacted: 'cyan', qualified: 'green', converted: 'purple', closed: 'red',
};

// Presentation only: kit status-pill class per lead status
const statusChipClass = {
  new: 'nx-status--neutral', contacted: 'nx-status--accent', qualified: 'nx-status--dark', converted: 'nx-status--success', closed: 'nx-status--danger',
};
const StatusChip = ({ status, style }) => (
  <span className={`nx-status ${statusChipClass[status] || 'nx-status--neutral'}`} style={{ textTransform: 'capitalize', ...style }}>{status}</span>
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

const Leads = () => {
  const navigate = useNavigate();
  const cachedLeads = getCachedData('/admin/leads:list:all:all:all');
  const [data, setData] = useState(cachedLeads || []);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('default');
  const [loading, setLoading] = useState(!cachedLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all'); // all | due
  const [counselorFilter, setCounselorFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

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
    const cacheKey = `/admin/leads:list:${statusFilter}:${followUpFilter}:${counselorFilter}`;
    if (!getCachedData(cacheKey) || force) {
      setLoading(true);
    }
    try {
      const params = {};
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
        type: 'call',
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

  const filtered = data.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: '13.5px' }}>{text}</span>
            {record.totalInquiries > 1 && (
              <span className="nx-status nx-status--accent" style={{ height: 20, padding: '0 7px', fontSize: 10.5, gap: 4 }}>
                <RetweetOutlined /> {record.totalInquiries}x
              </span>
            )}
          </div>
          {record.interestedUniversities?.length > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
              <BankOutlined style={{ color: 'var(--ux-text-3)' }} /> <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {record.interestedUniversities[record.interestedUniversities.length - 1].name}
              </span>
            </div>
          )}
        </div>
      ) 
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 500 }}>{text}</span> },
    { title: 'Country', dataIndex: 'dreamCountry', key: 'dreamCountry', render: (text) => <span className="nx-status nx-status--neutral">{getCountryFlag(text)} {text}</span> },
    { title: 'Intake', dataIndex: 'preferredIntake', key: 'preferredIntake', render: (text) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13, fontWeight: 500 }}>{text}</span> },
    { title: 'Education', dataIndex: 'highestEducation', key: 'highestEducation', render: (text) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13, fontWeight: 500 }}>{text}</span> },
    { title: 'Verified', dataIndex: 'verified', key: 'verified', render: (v) => <span className={`nx-status ${v ? 'nx-status--success' : 'nx-status--warning'}`}>{v ? 'Yes' : 'No'}</span> },
    {
      title: 'AI Lead Score',
      key: 'aiScoring',
      width: 145,
      render: (_, record) => {
        const scoring = record.aiScoring;
        const isScoringThis = scoringLeadId === record._id;

        if (isScoringThis) {
          return (
            <span className="nx-status nx-status--neutral">
              <LoadingOutlined /> Analyzing...
            </span>
          );
        }

        if (scoring && scoring.score !== undefined && scoring.score !== null) {
          const category = scoring.category || (scoring.score >= 80 ? 'Hot' : scoring.score >= 50 ? 'Warm' : 'Cold');
          // Hot / Warm / Cold keep a red / amber / neutral mapping
          const color = category === 'Hot' ? '#dc2626' : category === 'Warm' ? '#b45309' : 'var(--ux-text-2)';
          const chipClass = category === 'Hot' ? 'nx-status--danger' : category === 'Warm' ? 'nx-status--warning' : 'nx-status--neutral';

          const popoverContent = (
            <div style={{ maxWidth: 280, color: 'var(--ux-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, borderBottom: '1px solid var(--ux-line-2)', paddingBottom: 8 }}>
                <span style={{ fontWeight: 600, color }}>{category} lead ({scoring.score}/100)</span>
                <span className={`nx-status ${chipClass}`}>{scoring.conversionProbability || 'High Fit'}</span>
              </div>
              <p style={{ fontSize: 12, marginBottom: 8, color: 'var(--ux-text-2)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>AI insight:</strong> {scoring.rationale || 'High conversion probability based on intake timeline.'}
              </p>
              {scoring.suggestedAction && (
                <div style={{ background: 'var(--ux-surface-2)', padding: '8px 10px', borderRadius: 12, fontSize: 11.5, color: 'var(--ux-text)', border: '1px solid var(--ux-line-2)', marginBottom: 10 }}>
                  <strong style={{ fontWeight: 600 }}><BulbOutlined style={{ color: 'var(--ux-brand)' }} /> Action:</strong> {scoring.suggestedAction}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleScoreSingleLead(record._id); }}
                className="nx-btn nx-btn--accent nx-btn--sm"
                style={{ width: '100%' }}
              >
                <RobotOutlined /> Re-evaluate with AI
              </button>
            </div>
          );

          return (
            <Popover content={popoverContent} title={null} trigger="hover">
              <span className={`nx-status ${chipClass}`} style={{ cursor: 'pointer' }}>
                {category}
                <span style={{ opacity: 0.65, fontWeight: 500 }}>{scoring.score}</span>
              </span>
            </Popover>
          );
        }

        return (
          <Button
            size="small"
            type="dashed"
            icon={<RobotOutlined />}
            loading={isScoringThis}
            onClick={() => handleScoreSingleLead(record._id)}
            style={{ fontSize: 12 }}
          >
            AI score
          </Button>
        );
      }
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status, record) => (
        <Select value={status} size="small" onChange={(val) => handleStatusChange(record._id, val)} style={{ width: 120 }}>
          {Object.keys(statusColors).map(s => <Option key={s} value={s}><StatusChip status={s} style={{ height: 22 }} /></Option>)}
        </Select>
      ),
    },
    {
      title: 'Counselor',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (counselor, record) => (
        <Select
          value={counselor || 'Unassigned'}
          size="small"
          onChange={(val) => handleCounselorChange(record._id, val)}
          style={{ width: 140 }}
        >
          <Option value="Unassigned"><span style={{ color: 'var(--ux-text-3)' }}>Unassigned</span></Option>
          {counselors.map(c => <Option key={c} value={c}>{c}</Option>)}
        </Select>
      )
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (s, record) => {
        // A returning student's newest form (e.g. "Education Loan Enquiry") matters more than how they first arrived
        const latest = record.latestSource && record.latestSource !== s ? record.latestSource : null;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            {latest && (
              <span className="nx-status nx-status--accent">
                Latest: {latest}
              </span>
            )}
            <span className="nx-status nx-status--neutral">{latest ? `First: ${s}` : s}</span>
            {record.lastInquiryAt && (
              <span style={{ fontSize: 11, color: 'var(--ux-text-3)' }}>
                {record.totalInquiries > 1 ? `${record.totalInquiries} enquiries · ` : ''}
                last {new Date(record.lastInquiryAt).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Next Follow-up',
      dataIndex: 'nextFollowUpDate',
      key: 'nextFollowUpDate',
      render: (date, record) => {
        if (!date) return <span style={{ color: 'var(--ux-text-3)', fontSize: 12 }}>None</span>;
        const isPast = new Date(date) < new Date() && record.status !== 'converted' && record.status !== 'closed';
        return (
          <span style={{ color: isPast ? '#dc2626' : 'var(--ux-text-2)', fontSize: 12, fontWeight: isPast ? 600 : 500, whiteSpace: 'nowrap' }}>
            {isPast ? <ClockCircleOutlined style={{ marginRight: 4 }} /> : null}{new Date(date).toLocaleDateString()}
          </span>
        );
      }
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="action-btn-group">
          <button onClick={(e) => { e.stopPropagation(); handleOpenLead(record); }} className="action-btn action-btn--view" title="Open Lead Details"><EyeOutlined /></button>
          <Popconfirm
            title="Delete this lead?"
            description="This permanently removes the lead and its activity history."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={(e) => { e?.stopPropagation(); handleDelete(record._id); }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <button onClick={(e) => e.stopPropagation()} className="action-btn action-btn--delete" title="Delete Lead"><DeleteOutlined /></button>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
                          <span style={{ color: 'var(--ux-text-2)', fontSize: '11px', fontWeight: 500, marginTop: '4px' }}><UserOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />Counselor: <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{l.assignedTo || 'Unassigned'}</span></span>
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
      <Header title="Student leads & consultations" subtitle="All eligibility checks and consultation bookings" />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        <div className="page-stats-grid page-stats-grid--4">
          <StatsCard icon={<ContactsOutlined />} label="Total leads" value={data.length} color="brand" loading={loading} />
          <StatsCard icon={<CheckCircleOutlined />} label="Verified leads" value={data.filter(l => l.verified).length} color="brand" loading={loading} />
          <StatsCard icon={<FireOutlined />} label="Qualified leads" value={data.filter(l => l.status === 'qualified').length} color="brand" loading={loading} />
          <StatsCard icon={<TrophyOutlined />} label="Converted leads" value={data.filter(l => l.status === 'converted').length} color="brand" loading={loading} />
        </div>

        <div className="nx-toolbar page-toolbar">
          <div className="page-toolbar-left" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280, maxWidth: '100%' }} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
              <Option value="all">All statuses</Option>
              {Object.keys(statusColors).map(s => <Option key={s} value={s}><span style={{ textTransform: 'capitalize' }}>{s}</span></Option>)}
            </Select>
            <Select value={followUpFilter} onChange={setFollowUpFilter} style={{ width: 190 }}>
              <Option value="all">All lead interactions</Option>
              <Option value="due">Follow-up due / overdue</Option>
            </Select>
            <Select value={counselorFilter} onChange={setCounselorFilter} style={{ width: 160 }}>
              <Option value="all">All counselors</Option>
              <Option value="Unassigned">Unassigned</Option>
              {counselors.map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>

            {/* Pipeline Selector Dropdown */}
            <Select 
              value={selectedPipelineId} 
              onChange={(val) => {
                setSelectedPipelineId(val);
                if (val !== 'default') {
                  navigate(`/crm/board?pipeline=${val}`);
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
                onClick={() => {
                  if (pipelines.length > 0) {
                    navigate('/crm/board');
                  } else {
                    setViewMode('kanban');
                  }
                }}
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
                <AppstoreOutlined style={{ marginRight: 6 }} />Pipeline board
              </button>
            </div>

            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
            >
              Export leads
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('csv-import-file').click()}
            >
              Import leads
            </Button>
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
          </div>
          <div style={{ fontSize: 13, color: 'var(--ux-text-2)', whiteSpace: 'nowrap' }}>Total <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{filtered.length}</strong> leads</div>
        </div>
        
        {viewMode === 'table' ? (
          <div className="page-table-card">
            <Table 
              rowKey="_id" 
              columns={columns} 
              dataSource={filtered} 
              loading={loading} 
              pagination={{ pageSize: 15 }} 
              scroll={{ x: 1200 }} 
              onRow={(record) => ({
                onClick: () => handleOpenLead(record),
                style: { cursor: 'pointer' }
              })}
            />
          </div>
        ) : (
          renderKanbanBoard()
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
                    {selectedLead.totalInquiries > 1 && (
                      <span className="nx-status nx-status--accent">
                        <RetweetOutlined /> {selectedLead.totalInquiries}x repeat student
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

            {/* 2. PIPELINE PROGRESS STEPPER (Clean SaaS Flow) */}
            <div style={{ 
              background: 'var(--ux-surface-2)',
              borderBottom: '1px solid var(--ux-line-2)',
              padding: '16px 28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em' }}>
                  Admission pipeline stage
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--ux-text-2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Current status: <StatusChip status={selectedLead.status} />
                </span>
              </div>

              {/* Step Flow Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'new', label: '1. Form submitted', icon: <FileTextOutlined />, desc: 'Inquiry received' },
                  { key: 'contacted', label: '2. First contact', icon: <PhoneOutlined />, desc: 'Call / WhatsApp sent' },
                  { key: 'qualified', label: '3. Profile qualified', icon: <FireOutlined />, desc: 'Eligible for intake' },
                  { key: 'converted', label: '4. Enrolled', icon: <TrophyOutlined />, desc: 'Admitted & processing' }
                ].map((step, idx) => {
                  const isActive = selectedLead.status === step.key;
                  const stepIndex = ['new', 'contacted', 'qualified', 'converted'].indexOf(selectedLead.status);
                  const isCompleted = stepIndex > idx;

                  return (
                    <div 
                      key={step.key}
                      onClick={() => handleStatusChange(selectedLead._id, step.key)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '18px',
                        cursor: 'pointer',
                        background: isActive ? 'var(--ux-ink)' : '#ffffff',
                        border: isActive ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                        color: isActive ? '#ffffff' : 'var(--ux-text-2)',
                        boxShadow: 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <span style={{
                        width: '32px',
                        height: '32px',
                        minWidth: '32px',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '14px',
                        background: isActive ? 'rgba(255,255,255,0.14)' : isCompleted ? 'var(--ux-brand-soft)' : 'var(--ux-surface-2)',
                        color: isActive ? '#ffffff' : isCompleted ? 'var(--ux-brand-strong)' : 'var(--ux-text-2)'
                      }}>{isCompleted ? <CheckOutlined /> : step.icon}</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: isActive ? '#ffffff' : 'var(--ux-ink)' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '11px', color: isActive ? 'rgba(255,255,255,0.65)' : 'var(--ux-text-3)' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. MAIN WORKSPACE CONTENT (Split Layout) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '24px 28px', background: 'var(--ux-surface-2)', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
              
              {/* LEFT COLUMN: Student Profile & History Cards (Fixed Width) */}
              <div style={{ flex: '0 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Profile Details Card */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--ux-line-2)', padding: '18px', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: '12px' }}>
                    Student contact & academic
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Phone number</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '13px', fontWeight: 600 }}>{selectedLead.phone}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Email address</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '12px', fontWeight: 600, wordBreak: 'break-all', textAlign: 'right' }}>{selectedLead.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Preferred intake</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{selectedLead.preferredIntake || '2026'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Highest education</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{selectedLead.highestEducation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Current city</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{selectedLead.currentCity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '9px 12px', background: 'var(--ux-surface-2)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--ux-text-2)', fontSize: '12px' }}>Total inquiries</span>
                      <span style={{ color: 'var(--ux-ink)', fontSize: '12px', fontWeight: 600 }}>
                        {selectedLead.totalInquiries || 1} {selectedLead.totalInquiries > 1 ? '(repeat student)' : 'Inquiry'}
                      </span>
                    </div>
                  </div>
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
                    >
                      <Option value="Unassigned"><span style={{ color: 'var(--ux-text-3)' }}>Unassigned</span></Option>
                      {counselors.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </div>

                  {selectedLead.nextFollowUpDate && (
                    <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--ux-brand-soft)', borderRadius: '14px' }}>
                      <span style={{ color: 'var(--ux-brand-strong)', fontWeight: 600, display: 'block', marginBottom: '2px', fontSize: '12px' }}>
                        Next follow-up scheduled
                      </span>
                      <div style={{ color: 'var(--ux-ink)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarOutlined /> {new Date(selectedLead.nextFollowUpDate).toLocaleDateString()}
                      </div>
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
                        label: <span><ClockCircleOutlined /> Interaction history & notes</span>,
                        children: (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Log Call Note Form */}
                            <div style={{ background: 'var(--ux-surface-2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--ux-line-2)' }}>
                              <h4 style={{ color: 'var(--ux-ink)', marginBottom: '12px', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>
                                Log follow-up call / interaction summary
                              </h4>
                              <Form form={activityForm} layout="vertical" onFinish={handleLogActivity}>
                                <Form.Item name="comment" rules={[{ required: true, message: 'Please enter call summary notes' }]} style={{ marginBottom: '12px' }}>
                                  <Input.TextArea 
                                    placeholder="Enter follow-up details (e.g., student wants to apply for Sep 2026, requested scholarship checklist, mother joined the call...)" 
                                    rows={3}
                                  />
                                </Form.Item>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                  <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', fontWeight: 600 }}>Set next follow-up date</span>} name="nextFollowUpDate" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                    <DatePicker style={{ width: '100%' }} />
                                  </Form.Item>

                                  <Form.Item label={<span style={{ color: 'var(--ux-text-2)', fontSize: '12.5px', fontWeight: 600 }}>Update status (optional)</span>} name="status" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                    <Select placeholder="Optionally change status" allowClear>
                                      {Object.keys(statusColors).map(s => <Option key={s} value={s}><span style={{ textTransform: 'capitalize' }}>{s}</span></Option>)}
                                    </Select>
                                  </Form.Item>
                                </div>

                                <Button type="primary" htmlType="submit" style={{ marginTop: '14px' }}>
                                  Save interaction note
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
                                <Timeline
                                  mode="left"
                                  items={selectedLead.activities.slice().reverse().map((act, actIdx) => {
                                    // Neutral ink dots; the latest interaction is highlighted in orange
                                    const dotColor = actIdx === 0 ? '#DE5C2B' : '#111111';

                                    return {
                                      color: dotColor,
                                      children: (
                                        <div style={{ background: 'var(--ux-surface-2)', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--ux-line-2)', marginBottom: '4px' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px', fontSize: '11.5px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>
                                              {getActivityHeader(act.type)}
                                            </span>
                                            <span style={{ color: 'var(--ux-text-3)', fontWeight: 500 }}>{new Date(act.date).toLocaleString()}</span>
                                          </div>
                                          <div style={{ fontSize: '13px', color: 'var(--ux-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                            {act.comment}
                                          </div>
                                          <div style={{ fontSize: '11px', color: 'var(--ux-text-3)', marginTop: '6px', textAlign: 'right' }}>
                                            Logged by: <strong>{act.performedBy || 'Admin'}</strong>
                                          </div>
                                        </div>
                                      )
                                    };
                                  })}
                                />
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
    </div>
  );
};

export default Leads;
