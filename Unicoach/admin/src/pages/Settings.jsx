import React, { useEffect, useState } from 'react';
import {
  Button, Input, Form, Row, Col, message, Spin, Modal, Space,
  Divider, Tooltip, Switch, Table, Popconfirm, Select
} from 'antd';
import {
  SettingOutlined, LockOutlined, UnlockOutlined, EyeOutlined, EyeInvisibleOutlined,
  SaveOutlined, SafetyCertificateOutlined, BookOutlined, CheckCircleOutlined,
  InstagramOutlined, FacebookOutlined, YoutubeOutlined, LinkedinOutlined,
  TwitterOutlined, SendOutlined, ShareAltOutlined, RobotOutlined, KeyOutlined,
  MobileOutlined, MailOutlined, PhoneOutlined, UserAddOutlined, EditOutlined,
  DeleteOutlined, TeamOutlined, GlobalOutlined, CloudUploadOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [testingCloudinary, setTestingCloudinary] = useState(false);

  // Employee State
  const [employees, setEmployees] = useState([]);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empSubmitting, setEmpSubmitting] = useState(false);
  const [empForm] = Form.useForm();

  // Security Locking States
  const [isLocked, setIsLocked] = useState({
    general: true,
    social: true,
    waba: true,
    smtp: true,
    ai: true,
    employees: true,
    cloudinary: true
  });

  const toggleLock = (section) => {
    setIsLocked(prev => {
      const newState = !prev[section];
      if (!newState) {
        message.info(`Unlocked ${section.toUpperCase()} for editing`);
      }
      return { ...prev, [section]: newState };
    });
  };

  const [formState, setFormState] = useState({
    siteName: 'UniCoach',
    supportEmail: 'support@unicoach.com',
    supportPhone: '+91 95186 57944',

    // Twilio & Meta WABA
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    wabaAccessToken: '',
    wabaPhoneNumberId: '',
    wabaAccountId: '',

    // SMTP Email
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',

    // 📸 Meta / Instagram
    metaAppId: '',
    metaAppSecret: '',
    metaPageAccessToken: '',
    instagramAccountId: '',

    // ▶️ YouTube
    youtubeApiKey: '',
    youtubeClientId: '',
    youtubeClientSecret: '',

    // 💼 LinkedIn
    linkedinClientId: '',
    linkedinClientSecret: '',
    linkedinOrgId: '',

    // 🐦 Twitter (X)
    twitterApiKey: '',
    twitterApiSecret: '',
    twitterAccessToken: '',
    twitterAccessSecret: '',

    // ✈️ Telegram
    telegramBotToken: '',
    telegramChatId: '',

    // ❓ Quora
    quoraSpaceUrl: '',

    // 🤖 AI Assistant Key
    geminiApiKey: '',

    // ☁️ Cloudinary Media Storage
    cloudinaryCloudName: 'slsut3se',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: ''
  });

  const fetchSettingsAndEmployees = async () => {
    setLoading(true);
    try {
      const [settingsRes, empRes] = await Promise.all([
        API.get('/admin/settings-manage'),
        API.get('/admin/employees')
      ]);

      if (settingsRes.data) {
        setFormState(prev => ({ 
          ...prev, 
          ...settingsRes.data,
          cloudinaryCloudName: settingsRes.data.cloudinaryCloudName || 'slsut3se'
        }));
      }

      if (Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
    } catch {
      message.error('Failed to load settings & employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndEmployees();
  }, []);

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleTestCloudinary = async () => {
    if (!formState.cloudinaryCloudName || !formState.cloudinaryApiKey || !formState.cloudinaryApiSecret) {
      return message.warning('Please enter Cloud Name, API Key, and API Secret to test');
    }
    setTestingCloudinary(true);
    try {
      const res = await API.post('/admin/settings-manage/test-cloudinary', {
        cloudinaryCloudName: formState.cloudinaryCloudName,
        cloudinaryApiKey: formState.cloudinaryApiKey,
        cloudinaryApiSecret: formState.cloudinaryApiSecret
      });
      if (res.data.success) {
        message.success('🎉 ' + res.data.message);
      }
    } catch (err) {
      message.error('❌ ' + (err.response?.data?.error || 'Cloudinary verification failed'));
    } finally {
      setTestingCloudinary(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await API.put('/admin/settings-manage', formState);
      message.success('🔒 All Settings & API Credentials saved securely!');
      
      // Re-lock all sections
      setIsLocked({
        general: true,
        social: true,
        waba: true,
        smtp: true,
        ai: true,
        employees: true,
        cloudinary: true
      });

      fetchSettingsAndEmployees();
    } catch {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Employee CRUD Handlers
  const handleOpenEmpModal = (emp = null) => {
    setEditingEmp(emp);
    if (emp) {
      empForm.setFieldsValue(emp);
    } else {
      empForm.resetFields();
      empForm.setFieldsValue({
        role: 'Senior Counselor',
        branch: 'Panipat Head Office',
        status: 'active'
      });
    }
    setEmpModalOpen(true);
  };

  const handleSaveEmployee = async (values) => {
    setEmpSubmitting(true);
    try {
      if (editingEmp) {
        await API.put(`/admin/employees/${editingEmp._id}`, values);
        message.success('Counselor employee updated successfully!');
      } else {
        await API.post('/admin/employees', values);
        message.success('New Counselor employee added to system!');
      }
      setEmpModalOpen(false);
      fetchSettingsAndEmployees();
    } catch {
      message.error('Failed to save employee');
    } finally {
      setEmpSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await API.delete(`/admin/employees/${id}`);
      message.success('Employee deleted');
      fetchSettingsAndEmployees();
    } catch {
      message.error('Failed to delete employee');
    }
  };

  const empColumns = [
    {
      title: 'Employee name',
      dataIndex: 'name',
      key: 'name',
      render: (t, r) => (
        <div>
          <strong style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: 14 }}>{t}</strong>
          <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>{r.specialization}</div>
        </div>
      )
    },
    {
      title: 'Mobile / WhatsApp phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <span style={{ fontWeight: 500, color: 'var(--ux-ink)', whiteSpace: 'nowrap' }}>
          <PhoneOutlined style={{ marginRight: 4, color: 'var(--ux-text-3)' }} /> {phone}
        </span>
      )
    },
    {
      title: 'Email address',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span style={{ color: 'var(--ux-text-2)' }}>{email}</span>
    },
    {
      title: 'Role & branch',
      dataIndex: 'role',
      key: 'role',
      render: (role, r) => (
        <div>
          <span className="nx-status nx-status--neutral">{role}</span>
          <div style={{ fontSize: 11, color: 'var(--ux-text-3)', marginTop: 4 }}>{r.branch}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <span className={`nx-status ${st === 'active' ? 'nx-status--success' : 'nx-status--neutral'}`} style={{ textTransform: 'capitalize' }}>{st}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEmpModal(record)} aria-label="Edit employee" />
          <Popconfirm title="Delete employee?" onConfirm={() => handleDeleteEmployee(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete employee" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Site settings, counselors, social media credentials, WABA and SMTP"
        extra={
          <Space wrap size="small">
            <Button
              icon={<BookOutlined />}
              onClick={() => setGuideModalOpen(true)}
            >
              Social setup guide
            </Button>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSettings}
              loading={saving}
            >
              Save settings
            </Button>
          </Space>
        }
      />

      <Spin spinning={loading}>
        <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── SECTION 1: ⚙️ GENERAL SYSTEM SETTINGS ── */}
          <div className="nx-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="nx-icon-circle"><SettingOutlined /></span>
                <span className="nx-section-title">General platform settings</span>
              </div>
              <Button size="small" icon={isLocked.general ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleLock('general')}>
                {isLocked.general ? 'Unlock to edit' : 'Lock'}
              </Button>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Site name</label>
                <Input
                  disabled={isLocked.general}
                  value={formState.siteName}
                  onChange={e => handleChange('siteName', e.target.value)}
                />
              </Col>
              <Col xs={24} md={8}>
                <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Support email</label>
                <Input
                  disabled={isLocked.general}
                  value={formState.supportEmail}
                  onChange={e => handleChange('supportEmail', e.target.value)}
                />
              </Col>
              <Col xs={24} md={8}>
                <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Support phone</label>
                <Input
                  disabled={isLocked.general}
                  value={formState.supportPhone}
                  onChange={e => handleChange('supportPhone', e.target.value)}
                />
              </Col>
            </Row>
          </div>

          {/* ── SECTION 2: 👥 TEAM & EMPLOYEE COUNSELORS MANAGER ── */}
          <div className="nx-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="nx-icon-circle"><TeamOutlined /></span>
                <span className="nx-section-title">Team & employee counselors</span>
                <span className="nx-tab-count">{employees.length}</span>
              </div>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => handleOpenEmpModal()}
              >
                Add employee counselor
              </Button>
            </div>
            <div style={{ marginTop: -6, marginBottom: 14, fontSize: 12.5, color: 'var(--ux-text-2)' }}>
              Add staff members, counselors, and their mobile numbers here. Their phone numbers will dynamically populate across CRM call actions and WhatsApp buttons.
            </div>

            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <Table rowKey="_id" dataSource={employees} columns={empColumns} pagination={false} size="small" scroll={{ x: 700 }} />
            </div>
          </div>

          {/* ── SECTION 3: 🔑 SOCIAL MEDIA PLATFORM CREDENTIALS ── */}
          <div className="nx-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="nx-icon-circle"><KeyOutlined /></span>
                <span className="nx-section-title">Social media & multi-channel API credentials</span>
                <span className={`nx-status ${isLocked.social ? 'nx-status--neutral' : 'nx-status--warning'}`}>
                  {isLocked.social ? <LockOutlined /> : <UnlockOutlined />}
                  {isLocked.social ? 'Locked, read-only' : 'Unlocked, editing'}
                </span>
              </div>
              <Button
                type={isLocked.social ? 'default' : 'primary'}
                icon={isLocked.social ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => toggleLock('social')}
              >
                {isLocked.social ? 'Unlock & edit credentials' : 'Lock section'}
              </Button>
            </div>
            <Row gutter={[16, 16]}>

              {/* 1. Meta / Instagram / Facebook */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><InstagramOutlined /></span><span className="nx-icon-circle" style={{ background: '#fff' }}><FacebookOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>Meta (Instagram & Facebook) Graph API</span>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Meta app ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="1234567890"
                        value={formState.metaAppId}
                        onChange={e => handleChange('metaAppId', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Meta app secret</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="••••••••••••"
                        value={formState.metaAppSecret}
                        onChange={e => handleChange('metaAppSecret', e.target.value)}
                      />
                    </Col>
                    <Col span={24}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Page access token</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="EAA..."
                        value={formState.metaPageAccessToken}
                        onChange={e => handleChange('metaPageAccessToken', e.target.value)}
                      />
                    </Col>
                    <Col span={24}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Instagram account ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="178414..."
                        value={formState.instagramAccountId}
                        onChange={e => handleChange('instagramAccountId', e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* 2. YouTube Data API */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><YoutubeOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>YouTube Data API v3 (Google Cloud)</span>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={24}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>YouTube API key</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="AIzaSy..."
                        value={formState.youtubeApiKey}
                        onChange={e => handleChange('youtubeApiKey', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Google client ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="client_id.apps.googleusercontent.com"
                        value={formState.youtubeClientId}
                        onChange={e => handleChange('youtubeClientId', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Client secret</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="GOCSPX-..."
                        value={formState.youtubeClientSecret}
                        onChange={e => handleChange('youtubeClientSecret', e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* 3. LinkedIn API */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><LinkedinOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>LinkedIn Community API</span>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>LinkedIn client ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="77..."
                        value={formState.linkedinClientId}
                        onChange={e => handleChange('linkedinClientId', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Client secret</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="••••••••••••"
                        value={formState.linkedinClientSecret}
                        onChange={e => handleChange('linkedinClientSecret', e.target.value)}
                      />
                    </Col>
                    <Col span={24}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Organization URN / ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="urn:li:organization:12345678"
                        value={formState.linkedinOrgId}
                        onChange={e => handleChange('linkedinOrgId', e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* 4. Twitter (X) API */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><TwitterOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>Twitter / X API v2</span>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>API key</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="API Key"
                        value={formState.twitterApiKey}
                        onChange={e => handleChange('twitterApiKey', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>API secret</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="API Secret"
                        value={formState.twitterApiSecret}
                        onChange={e => handleChange('twitterApiSecret', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Access token</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="Access Token"
                        value={formState.twitterAccessToken}
                        onChange={e => handleChange('twitterAccessToken', e.target.value)}
                      />
                    </Col>
                    <Col span={12}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Access secret</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="Access Secret"
                        value={formState.twitterAccessSecret}
                        onChange={e => handleChange('twitterAccessSecret', e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* 5. Telegram Bot API */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><SendOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>Telegram Bot API</span>
                  </div>

                  <Row gutter={[12, 12]}>
                    <Col span={14}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Bot HTTP token (@BotFather)</label>
                      <Input.Password
                        disabled={isLocked.social}
                        placeholder="7123456789:AAE..."
                        value={formState.telegramBotToken}
                        onChange={e => handleChange('telegramBotToken', e.target.value)}
                      />
                    </Col>
                    <Col span={10}>
                      <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Channel chat ID</label>
                      <Input
                        disabled={isLocked.social}
                        placeholder="@unicoach_updates"
                        value={formState.telegramChatId}
                        onChange={e => handleChange('telegramChatId', e.target.value)}
                      />
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* 6. Quora Space Integration */}
              <Col xs={24} lg={12}>
                <div style={{ padding: 18, background: 'var(--ux-surface-2)', borderRadius: 18, border: '1px solid var(--ux-line-2)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span className="nx-icon-circle" style={{ background: '#fff' }}><ShareAltOutlined /></span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)', marginLeft: 2 }}>Quora Space integration</span>
                  </div>

                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Quora space URL</label>
                  <Input
                    disabled={isLocked.social}
                    placeholder="https://www.quora.com/q/unicoach"
                    value={formState.quoraSpaceUrl}
                    onChange={e => handleChange('quoraSpaceUrl', e.target.value)}
                  />
                </div>
              </Col>

            </Row>
          </div>

          {/* ── SECTION 4: ✉️ SMTP EMAIL & TWILIO WABA ── */}
          <Row gutter={[16, 16]}>
            {/* SMTP Server */}
            <Col xs={24} lg={12}>
              <div className="nx-card p-5 sm:p-6 h-full">
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="nx-icon-circle"><MailOutlined /></span>
                    <span className="nx-section-title">SMTP mail server</span>
                  </div>
                  <Button size="small" icon={isLocked.smtp ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleLock('smtp')}>
                    {isLocked.smtp ? 'Unlock' : 'Lock'}
                  </Button>
                </div>
                <Row gutter={[12, 12]}>
                  <Col span={16}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>SMTP host</label>
                    <Input disabled={isLocked.smtp} value={formState.smtpHost} onChange={e => handleChange('smtpHost', e.target.value)} placeholder="smtp.gmail.com" />
                  </Col>
                  <Col span={8}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Port</label>
                    <Input disabled={isLocked.smtp} value={formState.smtpPort} onChange={e => handleChange('smtpPort', e.target.value)} placeholder="587" />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>SMTP user</label>
                    <Input disabled={isLocked.smtp} value={formState.smtpUser} onChange={e => handleChange('smtpUser', e.target.value)} placeholder="user@gmail.com" />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>SMTP password</label>
                    <Input.Password disabled={isLocked.smtp} value={formState.smtpPass} onChange={e => handleChange('smtpPass', e.target.value)} placeholder="••••••••" />
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Twilio & Meta WABA */}
            <Col xs={24} lg={12}>
              <div className="nx-card p-5 sm:p-6 h-full">
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="nx-icon-circle"><MobileOutlined /></span>
                    <span className="nx-section-title">Meta WABA & Twilio OTP API</span>
                  </div>
                  <Button size="small" icon={isLocked.waba ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleLock('waba')}>
                    {isLocked.waba ? 'Unlock' : 'Lock'}
                  </Button>
                </div>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>WABA phone ID</label>
                    <Input disabled={isLocked.waba} value={formState.wabaPhoneNumberId} onChange={e => handleChange('wabaPhoneNumberId', e.target.value)} />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>WABA access token</label>
                    <Input.Password disabled={isLocked.waba} value={formState.wabaAccessToken} onChange={e => handleChange('wabaAccessToken', e.target.value)} />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Twilio SID</label>
                    <Input disabled={isLocked.waba} value={formState.twilioAccountSid} onChange={e => handleChange('twilioAccountSid', e.target.value)} />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Twilio token</label>
                    <Input.Password disabled={isLocked.waba} value={formState.twilioAuthToken} onChange={e => handleChange('twilioAuthToken', e.target.value)} />
                  </Col>
                </Row>
              </div>
            </Col>

            {/* ☁️ Cloudinary CDN Media Storage */}
            <Col xs={24}>
              <div className="nx-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 18 }}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="nx-icon-circle"><CloudUploadOutlined /></span>
                    <span className="nx-section-title">Cloudinary CDN media & image storage</span>
                    <span className="nx-status nx-status--success"><CheckCircleOutlined /> Global CDN active</span>
                  </div>
                  <Space wrap size="small">
                    <Button
                      size="small"
                      loading={testingCloudinary}
                      onClick={handleTestCloudinary}
                    >
                      Test Cloudinary
                    </Button>
                    <Button size="small" icon={isLocked.cloudinary ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleLock('cloudinary')}>
                      {isLocked.cloudinary ? 'Unlock' : 'Lock'}
                    </Button>
                  </Space>
                </div>
                <div style={{ marginTop: -6, marginBottom: 14, fontSize: 12.5, color: 'var(--ux-text-2)', lineHeight: 1.6 }}>
                  Auto-optimizes and serves all uploaded blog covers, student avatars, documents, and social media banners via high-speed global Cloudinary CDN.
                </div>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={8}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Cloud name</label>
                    <Input 
                      disabled={isLocked.cloudinary} 
                      value={formState.cloudinaryCloudName} 
                      onChange={e => handleChange('cloudinaryCloudName', e.target.value)} 
                      placeholder="e.g. slsut3se" 
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>API key</label>
                    <Input 
                      disabled={isLocked.cloudinary} 
                      value={formState.cloudinaryApiKey} 
                      onChange={e => handleChange('cloudinaryApiKey', e.target.value)} 
                      placeholder="e.g. 123456789012345" 
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>API secret</label>
                    <Input.Password 
                      disabled={isLocked.cloudinary} 
                      value={formState.cloudinaryApiSecret} 
                      onChange={e => handleChange('cloudinaryApiSecret', e.target.value)} 
                      placeholder="••••••••••••••••" 
                    />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Bottom Save Action */}
          <div style={{ textAlign: 'center', marginTop: 4, width: '100%' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveSettings}
              loading={saving}
              size="large"
              style={{
                width: '100%',
                maxWidth: 440,
                height: 'auto',
                minHeight: 48,
                whiteSpace: 'normal'
              }}
            >
              Save credentials & connect all channels
            </Button>
          </div>

        </div>
      </Spin>

      {/* ── ADD / EDIT EMPLOYEE COUNSELOR MODAL ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="nx-icon-circle"><UserAddOutlined /></span>
            <span style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>{editingEmp ? 'Edit employee counselor' : 'Add new employee counselor'}</span>
          </div>
        }
        open={empModalOpen}
        onCancel={() => setEmpModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={empForm} layout="vertical" onFinish={handleSaveEmployee} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Employee Full Name *" rules={[{ required: true, message: 'Please enter employee name' }]}>
            <Input placeholder="e.g. Sagar Sharma" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="phone" label="Mobile / WhatsApp Number *" rules={[{ required: true, message: 'Enter mobile number' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="+91 95186 57944" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="sagar@unicoach.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="role" label="Designated Role">
                <Select style={{ width: '100%' }}>
                  <Option value="Senior Study Abroad Counselor">Senior Study Abroad Counselor</Option>
                  <Option value="Visa & Scholarship Advisor">Visa & Scholarship Advisor</Option>
                  <Option value="Branch Manager">Branch Manager</Option>
                  <Option value="Admission Executive">Admission Executive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="specialization" label="Specialization">
                <Input placeholder="e.g. USA & UK Admissions" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={() => setEmpModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={empSubmitting}>
              Save employee counselor
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── STEP-BY-STEP SETUP GUIDE MODAL ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="nx-icon-circle"><BookOutlined /></span>
            <span style={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>Social media channels setup & connection guide</span>
          </div>
        }
        open={guideModalOpen}
        onCancel={() => setGuideModalOpen(false)}
        footer={null}
        width={720}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--ux-text-2)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '18px 0 4px' }}>1. Instagram & Facebook (Meta Graph API)</h3>
          <p>Go to <strong>developers.facebook.com</strong> ➔ Create App (Business) ➔ Add Instagram Graph API & Pages API ➔ Generate Access Token & paste App ID & Secret above.</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '18px 0 4px' }}>2. YouTube (Google Cloud Console)</h3>
          <p>Visit <strong>console.cloud.google.com</strong> ➔ Enable <em>YouTube Data API v3</em> ➔ Create OAuth 2.0 Credentials ➔ Paste API Key & Client Secret above.</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '18px 0 4px' }}>3. LinkedIn (Community Management API)</h3>
          <p>Visit <strong>developer.linkedin.com</strong> ➔ Create App ➔ Link your Company Page ➔ Request <em>Share on LinkedIn</em> product permissions.</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '18px 0 4px' }}>4. Twitter / X (Twitter API v2)</h3>
          <p>Visit <strong>developer.twitter.com</strong> ➔ Generate API Key, API Secret & User Access Tokens with <em>Read and Write</em> permissions.</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '18px 0 4px' }}>5. Telegram (Telegram Bot API, about 2 minutes)</h3>
          <p>Open Telegram app ➔ Search <strong>@BotFather</strong> ➔ Send <code>/newbot</code> ➔ Copy HTTP API Token ➔ Add Bot as Admin to your Telegram Channel!</p>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
