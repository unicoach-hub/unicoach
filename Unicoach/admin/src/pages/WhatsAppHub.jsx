import React, { useEffect, useState } from 'react';
import {
  Table, Button, Progress, Row, Col, Space, message, Popconfirm,
  Tooltip, Badge, Modal, Form, Input, Select, Dropdown, Menu, Divider, Upload,
  Avatar
} from 'antd';
import { 
  MessageOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined, 
  SendOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  GlobalOutlined,
  CalendarOutlined,
  CodeOutlined,
  DownOutlined,
  MobileOutlined,
  PhoneOutlined,
  LinkOutlined,
  UploadOutlined,
  SearchOutlined,
  SettingOutlined,
  RobotOutlined,
  CheckOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const VARIABLE_GROUPS = [
  {
    key: 'personal',
    label: 'Student personal data',
    items: [
      { label: 'Student Full Name', tag: '{{student_name}}', sample: 'Rohan Sharma' },
      { label: 'Student Email ID', tag: '{{student_email}}', sample: 'rohan.sharma@example.com' },
      { label: 'Mobile Number', tag: '{{student_phone}}', sample: '+91 98765 43210' }
    ]
  },
  {
    key: 'academic',
    label: 'Academic & target profile',
    items: [
      { label: 'Dream Destination Country', tag: '{{dream_country}}', sample: 'USA' },
      { label: 'Target Preferred Intake', tag: '{{preferred_intake}}', sample: 'Fall 2026' }
    ]
  },
  {
    key: 'booking',
    label: 'Booking & appointment details',
    items: [
      { label: 'Appointment Date', tag: '{{booking_date}}', sample: '15 Aug 2026' },
      { label: 'Time Slot', tag: '{{slot_time}}', sample: '11:30 AM' }
    ]
  },
  {
    key: 'waba',
    label: 'Meta WABA positional parameters',
    items: [
      { label: 'Meta Parameter {{1}}', tag: '{{1}}', sample: 'Rohan Sharma' },
      { label: 'Meta Parameter {{2}}', tag: '{{2}}', sample: 'USA' }
    ]
  }
];

const WhatsAppHub = () => {
  // Main View Switcher Mode: 'inbox' vs 'templates'
  const [viewMode, setViewMode] = useState('inbox');

  // WABA Stats & Templates State
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  // Live WABA Web Inbox State
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Template Studio Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Real-Time Preview State
  const [headerType, setHeaderType] = useState('none');
  const [headerText, setHeaderText] = useState('🎓 UniCoach Important Update');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [footerText, setFooterText] = useState('UniCoach Overseas Education • Reply STOP to unsubscribe');
  const [buttonAction, setButtonAction] = useState('phone_call');
  const [buttonText, setButtonText] = useState('Call Counselor 📞');
  const [counselorPhone, setCounselorPhone] = useState('+91 9876543210');
  const [buttonUrl, setButtonUrl] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, templatesRes, convRes] = await Promise.all([
        API.get('/admin/messaging/whatsapp-stats'),
        API.get('/admin/templates'),
        API.get('/admin/messaging/waba-conversations')
      ]);

      setStats(statsRes.data);
      const waTemplates = (Array.isArray(templatesRes.data) ? templatesRes.data : []).filter(t => t.type === 'whatsapp');
      setTemplates(waTemplates);

      if (Array.isArray(convRes.data) && convRes.data.length > 0) {
        setConversations(convRes.data);
        setActiveConv(convRes.data[0]);
      }
    } catch {
      message.error('Failed to load WhatsApp Cloud API data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Send Direct Reply in Live WABA Inbox
  const handleSendWebInboxReply = async () => {
    if (!activeConv || !replyInputText.trim()) {
      message.warning('Please enter a message to send!');
      return;
    }

    setSendingReply(true);
    try {
      const res = await API.post(`/admin/messaging/waba-conversations/${activeConv._id}/reply`, {
        messageText: replyInputText
      });

      const newMsg = res.data.reply || {
        id: Date.now().toString(),
        sender: 'admin',
        text: replyInputText,
        timestamp: new Date(),
        status: 'sent'
      };

      // Append to active conversation locally
      const updatedConv = {
        ...activeConv,
        messages: [...(activeConv.messages || []), newMsg]
      };

      setActiveConv(updatedConv);
      setConversations(conversations.map(c => c._id === activeConv._id ? updatedConv : c));
      setReplyInputText('');
      message.success(`WABA message sent directly to ${activeConv.studentPhone}! 🚀`);
    } catch {
      message.error('Failed to dispatch WABA message');
    } finally {
      setSendingReply(false);
    }
  };

  // Quick Insert Template Into Inbox Reply Input
  const handleInsertTemplateToReply = (tmpl) => {
    if (!tmpl) return;
    const body = tmpl.body || '';
    setReplyInputText(prev => (prev ? prev + '\n' + body : body));
    message.info(`Inserted ${tmpl.name} template into reply composer`);
  };

  // Sync Template with Meta
  const handleSyncMeta = async (id) => {
    setSyncingId(id);
    try {
      const { data } = await API.post(`/admin/templates/${id}/sync-meta`);
      if (data.success) {
        message.success(data.message || 'Template synchronized with Meta Cloud API!');
        fetchData();
      }
    } catch {
      message.error('Failed to sync template status with Meta');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await API.delete(`/admin/templates/${id}`);
      message.success('WhatsApp Template deleted');
      fetchData();
    } catch {
      message.error('Failed to delete template');
    }
  };

  // AI Message Generator Handler
  const handleAiGenerateBody = async () => {
    setGeneratingAi(true);
    try {
      const res = await API.post('/admin/social/ai-caption', {
        prompt: 'WhatsApp counseling appointment confirmation and application deadline alert for study abroad students',
        platform: 'telegram',
        tone: 'professional'
      });
      const generated = res.data.caption || "Hello {{student_name}}, your study abroad guidance session for {{dream_country}} ({{preferred_intake}}) is confirmed for {{booking_date}} at {{slot_time}}!";
      setBodyContent(generated);
      form.setFieldsValue({ body: generated });
      message.success('AI Message Content generated!');
    } catch {
      message.error('Failed to generate AI message');
    } finally {
      setGeneratingAi(false);
    }
  };

  const openCreateModal = (tmpl = null) => {
    setEditingTemplate(tmpl);
    if (tmpl) {
      setBodyContent(tmpl.body || '');
      setHeaderType(tmpl.headerType || 'none');
      setHeaderText(tmpl.headerText || '🎓 UniCoach Important Update');
      setHeaderImageUrl(tmpl.headerImageUrl || '');
      setFooterText(tmpl.footerText || 'UniCoach Overseas Education');
      setButtonAction(tmpl.buttonAction || 'phone_call');
      setButtonText(tmpl.buttonText || 'Call Counselor 📞');
      setCounselorPhone(tmpl.counselorPhone || '+91 9876543210');
      setButtonUrl(tmpl.buttonUrl || '');

      form.setFieldsValue({
        name: tmpl.name,
        metaCategory: tmpl.metaCategory || 'UTILITY',
        wabaLanguageCode: tmpl.wabaLanguageCode || 'en_US',
        body: tmpl.body,
        headerType: tmpl.headerType || 'none',
        headerText: tmpl.headerText || '',
        headerImageUrl: tmpl.headerImageUrl || '',
        footerText: tmpl.footerText || '',
        buttonAction: tmpl.buttonAction || 'phone_call',
        buttonText: tmpl.buttonText || 'Call Counselor 📞',
        counselorPhone: tmpl.counselorPhone || '+91 9876543210',
        buttonUrl: tmpl.buttonUrl || ''
      });
    } else {
      const defaultBody = "Hello {{student_name}}, your study abroad guidance session for {{dream_country}} ({{preferred_intake}}) is confirmed for {{booking_date}} at {{slot_time}}!";
      setBodyContent(defaultBody);
      setHeaderType('text');
      setHeaderText('🎓 UniCoach Counseling Alert');
      setHeaderImageUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80');
      setFooterText('UniCoach Overseas Education • Panipat Center');
      setButtonAction('phone_call');
      setButtonText('Call Counselor 📞');
      setCounselorPhone('+91 9876543210');
      setButtonUrl('https://unicoach.com/book');

      form.resetFields();
      form.setFieldsValue({
        metaCategory: 'UTILITY',
        wabaLanguageCode: 'en_US',
        headerType: 'text',
        headerText: '🎓 UniCoach Counseling Alert',
        headerImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
        body: defaultBody,
        footerText: 'UniCoach Overseas Education • Panipat Center',
        buttonAction: 'phone_call',
        buttonText: 'Call Counselor 📞',
        counselorPhone: '+91 9876543210',
        buttonUrl: 'https://unicoach.com/book'
      });
    }
    setModalOpen(true);
  };

  const handleSubmitTemplate = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim().toLowerCase().replace(/\s+/g, '_'),
        type: 'whatsapp',
        subject: values.metaCategory || 'UTILITY',
        metaCategory: values.metaCategory || 'UTILITY',
        wabaLanguageCode: values.wabaLanguageCode || 'en_US',
        body: values.body,
        headerType: values.headerType || 'none',
        headerText: values.headerText || '',
        headerImageUrl: values.headerImageUrl || '',
        footerText: values.footerText || '',
        buttonAction: values.buttonAction || 'phone_call',
        buttonText: values.buttonText || 'Call Counselor 📞',
        counselorPhone: values.counselorPhone || '',
        buttonUrl: values.buttonUrl || '',
        metaStatus: 'APPROVED'
      };

      if (editingTemplate) {
        await API.put(`/admin/templates/${editingTemplate._id}`, payload);
        message.success('WhatsApp Template updated!');
      } else {
        await API.post('/admin/templates', payload);
        message.success('WhatsApp Template created & submitted to Meta Cloud API!');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const insertVariable = (tag) => {
    const currentVal = form.getFieldValue('body') || '';
    const newVal = currentVal + (currentVal.endsWith(' ') || !currentVal ? '' : ' ') + tag;
    form.setFieldsValue({ body: newVal });
    setBodyContent(newVal);
  };

  const resolveSamplePreview = (text) => {
    if (!text) return '';
    return text
      .replace(/{{student_name}}/g, 'Rohan Sharma')
      .replace(/{{student_email}}/g, 'rohan.sharma@example.com')
      .replace(/{{student_phone}}/g, '+91 98765 43210')
      .replace(/{{dream_country}}/g, 'USA')
      .replace(/{{preferred_intake}}/g, 'Fall 2026')
      .replace(/{{booking_date}}/g, '15 Aug 2026')
      .replace(/{{slot_time}}/g, '11:30 AM')
      .replace(/{{1}}/g, 'Rohan Sharma')
      .replace(/{{2}}/g, 'USA');
  };

  const variableMenuItems = VARIABLE_GROUPS.map((group) => ({
    key: group.key,
    type: 'group',
    label: <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>{group.label}</span>,
    children: group.items.map((item) => ({
      key: item.tag,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ux-ink)' }}>{item.label}</span>
          <span className="nx-status nx-status--neutral">{item.tag}</span>
        </div>
      ),
      onClick: () => insertVariable(item.tag)
    }))
  }));

  const columns = [
    {
      title: 'Template name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: 14 }}>{text}</strong>
    },
    {
      title: 'Meta category',
      dataIndex: 'metaCategory',
      key: 'metaCategory',
      render: (cat, record) => <span className="nx-status nx-status--neutral">{cat || record.subject || 'UTILITY'}</span>
    },
    {
      title: 'Meta approval status',
      dataIndex: 'metaStatus',
      key: 'metaStatus',
      render: (status) => {
        if (status === 'APPROVED') {
          return <span className="nx-status nx-status--success"><CheckCircleOutlined /> Approved</span>;
        } else if (status === 'PENDING') {
          return <span className="nx-status nx-status--warning"><ClockCircleOutlined /> Pending review</span>;
        } else {
          return <span className="nx-status nx-status--danger"><CloseCircleOutlined /> Rejected</span>;
        }
      }
    },
    {
      title: 'Message body',
      dataIndex: 'body',
      key: 'body',
      render: (text) => (
        <span style={{ color: 'var(--ux-text-2)', fontSize: 13,display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sync / Check Status on Meta Cloud API">
            <Button
              size="small"
              icon={<SyncOutlined spin={syncingId === record._id} />}
              onClick={() => handleSyncMeta(record._id)}
            >
              Sync
            </Button>
          </Tooltip>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openCreateModal(record)}
          />
          <Popconfirm title="Delete this WhatsApp template?" onConfirm={() => handleDeleteTemplate(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    return c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.studentPhone.includes(searchQuery) ||
           c.dreamCountry.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <Header
        title="WhatsApp Hub"
        subtitle="Two-way WhatsApp inbox, Meta WABA Cloud API health and approved templates"
        extra={
          <Space wrap size="small">
            {viewMode === 'templates' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openCreateModal()}
              >
                Create template
              </Button>
            )}

            <Button
              type="default"
              icon={<ReloadOutlined spin={loading} />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Space>
        }
      />

      <div className="dashboard-content">

        {/* View mode switcher */}
        <nav className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }} aria-label="WhatsApp views">
          {[
            { label: 'Live web inbox', value: 'inbox', icon: <MessageOutlined /> },
            { label: 'Templates studio', value: 'templates', icon: <FileTextOutlined /> }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`nx-tab ${viewMode === opt.value ? 'nx-tab--active' : ''}`}
              onClick={() => setViewMode(opt.value)}
              aria-pressed={viewMode === opt.value}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </nav>

        {/* ── VIEW MODE 1: LIVE WABA WEB INBOX ── */}
        {viewMode === 'inbox' && (
          <Row gutter={[16, 16]}>
            
            {/* LEFT COLUMN: STUDENT CONVERSATIONS LIST (30%) */}
            <Col xs={24} lg={7}>
              <div className="nx-card" style={{ height: 680, display: 'flex', flexDirection: 'column', padding: 14 }}>
                {/* Search Bar */}
                <Input
                  prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
                  placeholder="Search student or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ marginBottom: 14 }}
                />

                <div className="nx-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 4 }}>
                  Student chats <span className="nx-tab-count">{filteredConversations.length}</span>
                </div>

                {/* Conversation List Container */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredConversations.map(conv => {
                    const isSelected = activeConv?._id === conv._id;
                    const lastMsg = conv.messages?.[conv.messages.length - 1];

                    return (
                      <div
                        key={conv._id}
                        onClick={() => setActiveConv(conv)}
                        style={{
                          padding: 12, borderRadius: 16, cursor: 'pointer',
                          background: isSelected ? '#ffffff' : 'var(--ux-surface-2)',
                          border: `1px solid ${isSelected ? 'var(--ux-ink)' : 'var(--ux-line-2)'}`,
                          transition: 'background 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <Avatar icon={<UserOutlined />} style={{ background: isSelected ? 'var(--ux-ink)' : 'var(--ux-surface-3)', color: isSelected ? '#fff' : 'var(--ux-ink)', flexShrink: 0 }} size="small" />
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.studentName}</span>
                          </div>
                          <span className="nx-status nx-status--neutral" style={{ height: 22, fontSize: 10.5 }}>{conv.dreamCountry}</span>
                        </div>

                        <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PhoneOutlined /> {conv.studentPhone}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--ux-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                            {lastMsg?.text || 'No messages yet...'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge count={conv.unreadCount} style={{ background: 'var(--ux-brand)' }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Col>

            {/* CENTER COLUMN: WHATSAPP WEB CHAT WINDOW (45%) */}
            <Col xs={24} lg={11}>
              <div className="nx-card" style={{ height: 680, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {activeConv ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    {/* Active Chat Header */}
                    <div style={{ padding: '14px 16px', background: '#ffffff', borderBottom: '1px solid var(--ux-line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <Avatar icon={<UserOutlined />} style={{ background: 'var(--ux-ink)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {activeConv.studentName}
                            <span className="nx-status nx-status--success" style={{ height: 20, fontSize: 10.5 }}><CheckCircleOutlined /> WABA live</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>
                            {activeConv.studentPhone} • Target: {activeConv.dreamCountry} ({activeConv.preferredIntake})
                          </div>
                        </div>
                      </div>

                      {/* Template Selector Dropdown inside Header */}
                      <Select
                        placeholder="Insert template"
                        style={{ width: 170 }}
                        size="small"
                        onChange={id => {
                          const tmpl = templates.find(t => t._id === id);
                          handleInsertTemplateToReply(tmpl);
                        }}
                      >
                        {templates.map(t => (
                          <Option key={t._id} value={t._id}>{t.name}</Option>
                        ))}
                      </Select>
                    </div>

                    {/* WhatsApp Chat Message Thread */}
                    <div
                      style={{
                        flex: 1,
                        background: 'var(--ux-surface-2)',
                        padding: 16,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      {(activeConv.messages || []).map((msg, idx) => {
                        const isStudent = msg.sender === 'student';
                        return (
                          <div
                            key={idx}
                            style={{
                              alignSelf: isStudent ? 'flex-start' : 'flex-end',
                              background: isStudent ? '#ffffff' : 'var(--ux-ink)',
                              border: isStudent ? '1px solid var(--ux-line-2)' : '1px solid var(--ux-ink)',
                              borderRadius: isStudent ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                              padding: '10px 14px',
                              maxWidth: '75%'
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 600, color: isStudent ? 'var(--ux-brand)' : 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                              {isStudent ? activeConv.studentName : msg.sender === 'system' ? 'UniCoach WABA broadcast' : 'UniCoach admin'}
                            </div>

                            <div style={{ fontSize: 13, color: isStudent ? 'var(--ux-text)' : '#ffffff', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                              {msg.text}
                            </div>

                            <div style={{ textAlign: 'right', fontSize: 10, color: isStudent ? 'var(--ux-text-3)' : 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 500 }}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {!isStudent && <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: 4 }}>✓✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input Bar */}
                    <div style={{ padding: 12, background: '#ffffff', borderTop: '1px solid var(--ux-line-2)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <TextArea
                          rows={2}
                          placeholder="Type direct WABA message or select template above..."
                          value={replyInputText}
                          onChange={e => setReplyInputText(e.target.value)}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          loading={sendingReply}
                          onClick={handleSendWebInboxReply}
                          style={{ padding: '0 20px' }}
                        >
                          Send
                        </Button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--ux-text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <span className="nx-icon-circle"><MessageOutlined /></span>
                    <div>Select a student conversation from the list to open the live WABA web inbox chat</div>
                  </div>
                )}
              </div>
            </Col>

            {/* RIGHT COLUMN: STUDENT CRM LEAD INSPECTOR (25%) */}
            <Col xs={24} lg={6}>
              <div className="nx-card" style={{ height: 680, padding: 20, overflowY: 'auto' }}>
                {activeConv ? (
                  <div>
                    <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid var(--ux-line-2)' }}>
                      <Avatar size={64} icon={<UserOutlined />} style={{ background: 'var(--ux-ink)', marginBottom: 10 }} />
                      <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>{activeConv.studentName}</div>
                      <span className="nx-status nx-status--neutral" style={{ marginTop: 6 }}>Target: {activeConv.dreamCountry}</span>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                      <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--ux-text-3)' }}>Mobile number</div>
                        <div style={{ fontWeight: 600, color: 'var(--ux-ink)', wordBreak: 'break-word' }}>{activeConv.studentPhone}</div>
                      </div>

                      <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--ux-text-3)' }}>Email</div>
                        <div style={{ fontWeight: 600, color: 'var(--ux-ink)', wordBreak: 'break-word' }}>{activeConv.studentEmail}</div>
                      </div>

                      <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--ux-text-3)' }}>Preferred intake</div>
                        <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{activeConv.preferredIntake}</div>
                      </div>

                      <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--ux-text-3)', marginBottom: 4 }}>CRM pipeline stage</div>
                        <span className="nx-status nx-status--accent">Counseling scheduled</span>
                      </div>

                      <Divider style={{ margin: '6px 0' }} />

                      <Button
                        block
                        icon={<FileTextOutlined />}
                        onClick={() => message.info(`Opening CRM profile for ${activeConv.studentName}`)}
                      >
                        Open CRM lead profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--ux-text-3)' }}>
                    Select a student to view CRM lead metadata
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}

        {/* ── VIEW MODE 2: META WABA API HUB & TEMPLATES STUDIO ── */}
        {viewMode === 'templates' && (
          <div>
            {/* Hero Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                    <div className="flex items-center gap-3">
                      <span className="nx-icon-circle"><SafetyCertificateOutlined /></span>
                      <span className="nx-section-title">Meta WABA connection</span>
                    </div>
                    <span className={`nx-status ${stats?.connectionStatus === 'CONNECTED' ? 'nx-status--success' : 'nx-status--warning'}`}>
                      {stats?.connectionStatus || 'NOT_CONNECTED'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ux-ink)', margin: '0 0 6px' }}>
                    {stats?.wabaPhoneNumber || 'No number configured'}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--ux-text-2)', margin: 0 }}>
                    Quality rating: <strong style={{ color: stats?.connectionStatus === 'CONNECTED' ? 'var(--ux-ink)' : 'var(--ux-text-3)', fontWeight: 600 }}>{stats?.qualityRating || '—'}</strong>
                  </p>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                    <div className="flex items-center gap-3">
                      <span className="nx-icon-circle"><ThunderboltOutlined /></span>
                      <span className="nx-section-title">Daily messaging tier</span>
                    </div>
                    <span className="nx-status nx-status--neutral">
                      {stats?.dailyLimit ? 'Tier 1' : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ux-ink)' }}>
                      {stats?.todayConversationsCount || 0} / {stats?.dailyLimit || 0} conversations
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ux-brand)' }}>
                      {stats?.dailyLimit ? Math.round(((stats?.todayConversationsCount || 0) / stats.dailyLimit) * 100) : 0}%
                    </span>
                  </div>
                  <Progress percent={stats?.dailyLimit ? Math.round(((stats?.todayConversationsCount || 0) / stats.dailyLimit) * 100) : 0} showInfo={false} />
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                    <span className="nx-icon-circle"><SendOutlined /></span>
                    <span className="nx-section-title">Today's dispatch</span>
                  </div>
                  <Row gutter={12}>
                    <Col span={8}>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ux-ink)' }} />Sent</div>
                      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ux-ink)' }}>{stats?.sentCount || 0}</div>
                    </Col>
                    <Col span={8}>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803d' }} />Delivered</div>
                      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ux-ink)' }}>{stats?.deliveredCount || 0}</div>
                    </Col>
                    <Col span={8}>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />Failed</div>
                      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ux-ink)' }}>{stats?.failedCount || 0}</div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {/* Approved Templates Table */}
            <div className="nx-card" style={{ padding: 20 }}>
              <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16 }}>
                <div className="flex items-center gap-3">
                  <span className="nx-icon-circle"><MessageOutlined /></span>
                  <span className="nx-section-title">Meta WABA approved templates</span>
                  <span className="nx-tab-count">{templates.length}</span>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openCreateModal()}
                >
                  Add template
                </Button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <Table rowKey="_id" columns={columns} dataSource={templates} loading={loading} pagination={{ pageSize: 8 }} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── ENTERPRISE 2-COLUMN WHATSAPP TEMPLATE STUDIO MODAL ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="nx-icon-circle"><MessageOutlined /></span>
            <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
              {editingTemplate ? 'Edit WhatsApp template' : 'Create Meta WABA WhatsApp template'}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={920}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitTemplate} style={{ marginTop: 12 }}>
          <Row gutter={[24, 24]}>
            
            {/* LEFT COLUMN: EDITOR FORM */}
            <Col xs={24} md={14}>
              <div style={{ paddingRight: 10 }}>
                
                <Form.Item
                  name="name"
                  label={<span style={{ fontWeight: 600 }}>Template identifier name</span>}
                  rules={[{ required: true, message: 'Please enter template name' }]}
                >
                  <Input placeholder="e.g. counseling_booking_confirm_v1" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="metaCategory" label={<span style={{ fontWeight: 600 }}>Meta WABA category</span>}>
                      <Select style={{ width: '100%' }}>
                        <Option value="UTILITY">UTILITY (Transactional / Alerts)</Option>
                        <Option value="MARKETING">MARKETING (Offers / Announcements)</Option>
                        <Option value="AUTHENTICATION">AUTHENTICATION (OTPs)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="wabaLanguageCode" label={<span style={{ fontWeight: 600 }}>Language</span>}>
                      <Select style={{ width: '100%' }}>
                        <Option value="en_US">English (en_US)</Option>
                        <Option value="en_IN">English India (en_IN)</Option>
                        <Option value="hi_IN">Hindi (hi_IN)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Header Config */}
                <Row gutter={12}>
                  <Col span={10}>
                    <Form.Item name="headerType" label={<span style={{ fontWeight: 600 }}>Header type</span>}>
                      <Select onChange={val => { setHeaderType(val); form.setFieldsValue({ headerType: val }); }} style={{ width: '100%' }}>
                        <Option value="none">None</Option>
                        <Option value="text">Text header</Option>
                        <Option value="image">Image header</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    {headerType === 'image' ? (
                      <Form.Item label={<span style={{ fontWeight: 600 }}>Header image from device *</span>}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <Upload
                            showUploadList={false}
                            accept="image/*"
                            customRequest={async ({ file }) => {
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const res = await API.post('/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                const url = res.data.url;
                                setHeaderImageUrl(url);
                                form.setFieldsValue({ headerImageUrl: url });
                                message.success('Image uploaded from device!');
                              } catch {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  const url = e.target.result;
                                  setHeaderImageUrl(url);
                                  form.setFieldsValue({ headerImageUrl: url });
                                  message.success('Device image loaded!');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          >
                            <Button icon={<UploadOutlined />}>
                              {headerImageUrl ? 'Change device image' : 'Choose image from device'}
                            </Button>
                          </Upload>

                          {headerImageUrl && (
                            <img
                              src={headerImageUrl}
                              alt="Thumbnail"
                              style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--ux-line)' }}
                            />
                          )}
                        </div>
                      </Form.Item>
                    ) : (
                      <Form.Item name="headerText" label={<span style={{ fontWeight: 600 }}>Header title text</span>}>
                        <Input
                          placeholder="e.g. 🎓 UniCoach Counseling Alert"
                          value={headerText}
                          onChange={e => { setHeaderText(e.target.value); form.setFieldsValue({ headerText: e.target.value }); }}
                        />
                      </Form.Item>
                    )}
                  </Col>
                </Row>

                {/* Message Body Editor */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>
                      Message body *
                    </label>

                    <Space>
                      <Button
                        type="default"
                        size="small"
                        icon={<ThunderboltOutlined style={{ color: 'var(--ux-brand)' }} />}
                        onClick={handleAiGenerateBody}
                        loading={generatingAi}
                      >
                        AI write message
                      </Button>

                      <Dropdown menu={{ items: variableMenuItems }} trigger={['click']} placement="bottomRight">
                        <Button
                          size="small"
                          icon={<CodeOutlined />}
                        >
                          Insert variable <DownOutlined style={{ fontSize: 9 }} />
                        </Button>
                      </Dropdown>
                    </Space>
                  </div>

                  <Form.Item name="body" rules={[{ required: true, message: 'Please enter message content' }]} style={{ marginBottom: 0 }}>
                    <TextArea
                      rows={5}
                      placeholder="Write message body content..."
                      value={bodyContent}
                      onChange={e => { setBodyContent(e.target.value); form.setFieldsValue({ body: e.target.value }); }}
                      style={{ fontSize: 13, padding: 12 }}
                    />
                  </Form.Item>
                </div>

                {/* Footer Subtext */}
                <Form.Item name="footerText" label={<span style={{ fontWeight: 600 }}>Footer subtext (optional)</span>}>
                  <Input
                    placeholder="e.g. UniCoach Overseas Education • Reply STOP to unsubscribe"
                    value={footerText}
                    onChange={e => { setFooterText(e.target.value); form.setFieldsValue({ footerText: e.target.value }); }}
                  />
                </Form.Item>

                {/* Interactive Action Button */}
                <div style={{ background: 'var(--ux-surface-2)', padding: 16, borderRadius: 16, border: '1px solid var(--ux-line-2)', marginBottom: 16 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ux-ink)', display: 'block', marginBottom: 10 }}>
                    Interactive button action (Meta WABA CTA)
                  </label>

                  <Row gutter={12}>
                    <Col span={10}>
                      <Form.Item name="buttonAction" label={null} style={{ marginBottom: 8 }}>
                        <Select
                          value={buttonAction}
                          onChange={val => { setButtonAction(val); form.setFieldsValue({ buttonAction: val }); }}
                          style={{ width: '100%' }}
                        >
                          <Option value="phone_call">Call phone number (direct call)</Option>
                          <Option value="url_link">Open website URL link</Option>
                          <Option value="quick_reply">Quick reply text</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={14}>
                      <Form.Item name="buttonText" label={null} style={{ marginBottom: 8 }}>
                        <Input
                          placeholder="Button label (e.g. Call Counselor)"
                          value={buttonText}
                          onChange={e => { setButtonText(e.target.value); form.setFieldsValue({ buttonText: e.target.value }); }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {buttonAction === 'phone_call' && (
                    <Form.Item name="counselorPhone" label={<span style={{ fontWeight: 600, fontSize: 12 }}>Counselor phone number (auto-dials on click)</span>} style={{ marginBottom: 0 }}>
                      <Input
                        prefix={<PhoneOutlined style={{ color: 'var(--ux-text-3)' }} />}
                        placeholder="+91 9876543210 (Country code required)"
                        value={counselorPhone}
                        onChange={e => { setCounselorPhone(e.target.value); form.setFieldsValue({ counselorPhone: e.target.value }); }}
                      />
                    </Form.Item>
                  )}

                  {buttonAction === 'url_link' && (
                    <Form.Item name="buttonUrl" label={<span style={{ fontWeight: 600, fontSize: 12 }}>Target website URL</span>} style={{ marginBottom: 0 }}>
                      <Input
                        prefix={<LinkOutlined style={{ color: 'var(--ux-text-3)' }} />}
                        placeholder="https://unicoach.com/book-counseling"
                        value={buttonUrl}
                        onChange={e => { setButtonUrl(e.target.value); form.setFieldsValue({ buttonUrl: e.target.value }); }}
                      />
                    </Form.Item>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                  <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    icon={<SendOutlined />}
                  >
                    {editingTemplate ? 'Update template' : 'Submit & sync with Meta WABA'}
                  </Button>
                </div>
              </div>
            </Col>

            {/* RIGHT COLUMN: REAL-TIME WHATSAPP SMARTPHONE SCREEN PREVIEW */}
            <Col xs={24} md={10}>
              <div className="nx-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MobileOutlined style={{ color: 'var(--ux-ink)', fontSize: 16 }} />
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)' }}>
                      Live WhatsApp preview
                    </span>
                  </div>
                  <span className="nx-status nx-status--success">Meta verified</span>
                </div>

                <div
                  style={{
                    background: 'var(--ux-surface-2)',
                    borderRadius: 18,
                    padding: '16px 12px',
                    minHeight: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '4px 18px 18px 18px',
                      border: '1px solid var(--ux-line-2)',
                      padding: 12,
                      maxWidth: '92%',
                      position: 'relative'
                    }}
                  >
                    {headerType === 'image' && (
                      <img
                        src={headerImageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'}
                        alt="Header Banner"
                        style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: '12px 12px 6px 6px', marginBottom: 8 }}
                      />
                    )}

                    {headerType === 'text' && headerText && (
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', marginBottom: 6, borderBottom: '1px solid var(--ux-line-2)', paddingBottom: 4 }}>
                        {headerText}
                      </div>
                    )}

                    <div style={{ fontSize: 12.5, color: 'var(--ux-text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {resolveSamplePreview(bodyContent) || 'Write your message body in the editor to view live WhatsApp preview...'}
                    </div>

                    {footerText && (
                      <div style={{ fontSize: 10.5, color: 'var(--ux-text-3)', marginTop: 8, paddingTop: 4, borderTop: '1px dashed var(--ux-line)' }}>
                        {footerText}
                      </div>
                    )}

                    <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--ux-text-3)', marginTop: 4, fontWeight: 500 }}>
                      11:42 AM <span style={{ color: 'var(--ux-text-2)' }}>✓✓</span>
                    </div>

                    {buttonText && (
                      <div style={{ marginTop: 10, borderTop: '1px solid var(--ux-line-2)', paddingTop: 8, textAlign: 'center' }}>
                        <a
                          href={buttonAction === 'phone_call' ? `tel:${counselorPhone || '+919876543210'}` : (buttonUrl || '#')}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '8px 16px',
                            borderRadius: 999,
                            background: 'var(--ux-surface-2)',
                            color: 'var(--ux-ink)',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            border: '1px solid var(--ux-line)',
                            textDecoration: 'none'
                          }}
                        >
                          {buttonAction === 'phone_call' ? <PhoneOutlined /> : buttonAction === 'url_link' ? <LinkOutlined /> : null}
                          {buttonText}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', textAlign: 'center', marginTop: 10 }}>
                  Preview resolves dynamic sample student data (<strong style={{ color: 'var(--ux-brand-strong)', fontWeight: 600 }}>Rohan Sharma - USA - Fall 2026</strong>) live.
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default WhatsAppHub;
