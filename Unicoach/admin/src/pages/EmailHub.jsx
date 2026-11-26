import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Row, Col, Statistic, Progress, Alert, Tabs, Tag, Tooltip, Empty } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, 
  MailOutlined, SendOutlined, CheckCircleOutlined, SyncOutlined,
  SafetyCertificateOutlined, ExclamationCircleOutlined, HistoryOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import API from '../api/axios';

import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';

const { TextArea } = Input;
const { Option } = Select;

const EmailHub = () => {
  // Templates state
  const cachedData = getCachedData('/admin/email-hub:bundle');
  const [templates, setTemplates] = useState(cachedData?.templates || []);

  // Sent emails: our own log, so it survives Resend's 30-day window
  const [log, setLog] = useState({ rows: [], total: 0, counts: {} });
  const [logLoading, setLogLoading] = useState(false);
  const [logQuery, setLogQuery] = useState('');
  const [logStatus, setLogStatus] = useState();
  const [logPage, setLogPage] = useState(1);
  const [loading, setLoading] = useState(!cachedData);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // SMTP state
  const [smtpStatus, setSmtpStatus] = useState(cachedData?.smtpStatus || 'checking');
  const [settings, setSettings] = useState(cachedData?.settings || null);
  const [verifyingSmtp, setVerifyingSmtp] = useState(false);

  // Bulk send state
  const [bulkForm] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [leadsCount, setLeadsCount] = useState(cachedData?.leadsCount || 0);
  const [usersCount, setUsersCount] = useState(cachedData?.usersCount || 0);

  const fetchData = async (force = false) => {
    if (!getCachedData('/admin/email-hub:bundle') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/email-hub:bundle',
        async () => {
          const [templatesRes, statsRes, settingsRes] = await Promise.all([
            API.get('/admin/templates'),
            API.get('/admin/stats'),
            API.get('/admin/settings-manage')
          ]);
          const emailTemplates = (Array.isArray(templatesRes.data) ? templatesRes.data : []).filter(t => t.type === 'email');
          const leads = statsRes.data?.verifiedLeads || 0;
          const users = statsRes.data?.studentUsers ?? statsRes.data?.users ?? 0;
          const setts = settingsRes.data || null;
          const status = setts?.smtpHost && setts?.smtpUser ? 'active' : 'simulator';
          return {
            templates: emailTemplates,
            leadsCount: leads,
            usersCount: users,
            settings: setts,
            smtpStatus: status
          };
        },
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setTemplates(fresh.templates);
            setLeadsCount(fresh.leadsCount);
            setUsersCount(fresh.usersCount);
            setSettings(fresh.settings);
            setSmtpStatus(fresh.smtpStatus);
          }
        }
      );

      setTemplates(data.templates);
      setLeadsCount(data.leadsCount);
      setUsersCount(data.usersCount);
      setSettings(data.settings);
      setSmtpStatus(data.smtpStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  // Which provider sends email (Resend) and whether it's set up
  const [emailStatus, setEmailStatus] = useState(null);
  useEffect(() => {
    API.get('/admin/messaging/email-status').then((r) => setEmailStatus(r.data)).catch(() => setEmailStatus({ configured: false }));
  }, []);

  useEffect(() => { fetchData(); }, []);

  // SMTP Verify
  const verifySmtp = async () => {
    if (!settings) return;
    setVerifyingSmtp(true);
    try {
      const { data } = await API.post('/admin/messaging/verify-smtp', {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        // smtpPass is never sent to the browser; the server uses the stored password
      });
      setSmtpStatus(data.success ? 'active' : 'error');
      message.success('SMTP connection verified!');
    } catch {
      setSmtpStatus('error');
      message.error('SMTP verification failed');
    } finally {
      setVerifyingSmtp(false);
    }
  };

  // Template CRUD
  const handleOpenCreate = () => {
    setEditingId(null);
    setModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({ type: 'email' });
    }, 0);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record._id);
    setModalOpen(true);
    setTimeout(() => { form.setFieldsValue(record); }, 0);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/templates/${id}`);
      message.success('Template deleted!');
      invalidateCache('/admin/email-hub');
      invalidateCache('/admin/templates');
      fetchData(true);
    } catch { message.error('Failed to delete'); }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.type = 'email';
      if (editingId) {
        await API.put(`/admin/templates/${editingId}`, values);
        message.success('Template updated!');
      } else {
        await API.post('/admin/templates', values);
        message.success('Template created!');
      }
      invalidateCache('/admin/email-hub');
      invalidateCache('/admin/templates');
      setModalOpen(false);
      fetchData(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save');
    }
  };

  // Bulk Send (asks for confirmation first)
  const handleBulkSend = async () => {
    let values;
    try {
      values = await bulkForm.validateFields();
    } catch {
      return;
    }
    if (!values.templateId) {
      message.warning('Please select an email template first');
      return;
    }
    const recipientCount =values.target === 'users' ? usersCount : leadsCount;
    const targetLabel = values.target === 'users' ? 'All Registered Users' : 'All Verified Leads';
    const templateName = templates.find(t => t._id === values.templateId)?.name || 'selected template';
    Modal.confirm({
      title: 'Send email campaign?',
      content: `This will email "${templateName}" to ${targetLabel} — ${recipientCount} recipient${recipientCount === 1 ? '' : 's'}. This cannot be undone.`,
      okText: 'Send Campaign',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => executeBulkSend(values)
    });
  };

  const executeBulkSend = async (values) => {
    setSending(true);
    setSendProgress(0);
    try {
      const { data } = await API.post('/admin/messaging/send-bulk', {
        channel: 'email',
        templateId: values.templateId,
        target: values.target,
      });
      
      // Simulate progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 30;
        if (p >= 100) { p = 100; clearInterval(interval); }
        setSendProgress(Math.round(p));
      }, 300);

      message.success(data.message || 'Bulk email campaign sent!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to send campaign');
    } finally {
      setTimeout(() => setSending(false), 2000);
    }
  };

  const columns = [
    {
      title: 'Template name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: 14 }}>{text}</strong>
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <span style={{ color: 'var(--ux-text-2)' }}>{text || '—'}</span>
    },
    {
      title: 'Body preview',
      dataIndex: 'body',
      key: 'body',
      render: (text) => (
        <span style={{ color: 'var(--ux-text-3)', fontSize: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {text}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button shape="circle" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} aria-label="Edit template" />
          <Popconfirm title="Delete this template?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Button shape="circle" danger icon={<DeleteOutlined />} aria-label="Delete template" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const smtpStatusClass = smtpStatus === 'active' ? 'nx-status--success' : smtpStatus === 'error' ? 'nx-status--danger' : 'nx-status--warning';


  const loadEmailLog = React.useCallback(async () => {
    setLogLoading(true);
    try {
      const { data } = await API.get('/admin/messaging/email-log', {
        params: { q: logQuery || undefined, status: logStatus || undefined, page: logPage, limit: 20 },
      });
      setLog(data || { rows: [], total: 0, counts: {} });
    } catch {
      setLog({ rows: [], total: 0, counts: {} });
    } finally {
      setLogLoading(false);
    }
  }, [logQuery, logStatus, logPage]);

  useEffect(() => { loadEmailLog(); }, [loadEmailLog]);

  const STATUS_COLOUR = {
    sent: 'default', delivered: 'green', opened: 'blue', clicked: 'geekblue',
    delayed: 'gold', bounced: 'red', complained: 'volcano', failed: 'red',
  };
  const WHAT_IT_MEANS = {
    sent: 'Handed to Resend. No word back yet.',
    delivered: 'The mailbox accepted it.',
    opened: 'They opened it.',
    clicked: 'They clicked a link in it.',
    delayed: 'Being retried — the mailbox is busy or greylisting us.',
    bounced: 'It could not be delivered. The address is wrong or blocking us.',
    complained: 'They pressed "spam". The lead is now unsubscribed.',
    failed: 'It never left — see the reason.',
  };

  const logColumns = [
    {
      title: 'Sent',
      dataIndex: 'at',
      width: 150,
      render: (v) => (v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    { title: 'To', dataIndex: 'to', render: (v) => <span style={{ fontSize: 13 }}>{v || '—'}</span> },
    { title: 'Subject', dataIndex: 'subject', render: (v) => <span style={{ fontSize: 13 }}>{v || '—'}</span> },
    {
      title: 'What happened',
      dataIndex: 'status',
      width: 150,
      render: (v, row) => (
        <Tooltip title={row.error || WHAT_IT_MEANS[v]}>
          <Tag color={STATUS_COLOUR[v] || 'default'}>{v}</Tag>
        </Tooltip>
      ),
    },
    { title: 'Sent by', dataIndex: 'sentBy', width: 140, render: (v, row) => <span style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>{v || row.kind || '—'}</span> },
  ];
  return (
    <div>
      <Header
        title="Email Hub"
        subtitle="Create email templates and send campaigns to leads picked by tags"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Create email template
          </Button>
        }
      />

      <div className="dashboard-content">

        {/* SMTP + Quick Stats Row with Skeleton Screen */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {loading ? (
            [1, 2, 3].map((idx) => (
              <Col xs={24} lg={8} key={idx}>
                <div className="nx-card p-6 h-full animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-28 bg-[#ecebe6] rounded-full" />
                    <div className="h-5 w-20 bg-[#ecebe6] rounded-full" />
                  </div>
                  <div className="h-8 w-32 bg-[#ecebe6] rounded-xl mb-3" />
                  <div className="h-4 w-48 bg-[#ecebe6] rounded-full mb-4" />
                  <div className="h-9 w-full bg-[#ecebe6] rounded-full" />
                </div>
              </Col>
            ))
          ) : (
            <>
              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="nx-icon-circle"><SafetyCertificateOutlined /></span>
                      <span className="nx-section-title">Email sending</span>
                    </div>
                    <span className={`nx-status ${emailStatus?.configured ? 'nx-status--success' : 'nx-status--warning'}`}>
                      {emailStatus?.configured ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      {emailStatus ? (emailStatus.configured ? 'Connected' : 'Not set up') : 'Checking'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ux-text-2)', margin: 0 }}>
                    All email goes out through <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>Resend</strong>
                    {emailStatus?.from ? <> from <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{emailStatus.from}</strong></> : null}.
                    {emailStatus && !emailStatus.configured && ' Until the Resend key is added on the server, emails are only simulated.'}
                  </p>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="nx-icon-circle"><MailOutlined /></span>
                    <span className="nx-section-title">Email templates</span>
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Total templates" value={templates.length} styles={{ content: { color: 'var(--ux-ink)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em' } }} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Verified leads" value={leadsCount} styles={{ content: { color: 'var(--ux-ink)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em' } }} />
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="nx-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="nx-icon-circle"><SendOutlined /></span>
                    <span className="nx-section-title">Send a campaign</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ux-text-2)', margin: '0 0 14px' }}>
                    Pick people by tags (event, country, intake, source or your own), add a meet link, preview and send.
                  </p>
                  <Button type="primary" block icon={<SendOutlined />} onClick={() => navigate('/automation/campaign')}>
                    New campaign
                  </Button>
                </div>
              </Col>
            </>
          )}
        </Row>

        {/* Dynamic Variables Helper */}
        <div className="nx-card p-5" style={{ marginBottom: 16 }}>
          <div className="flex items-start gap-3">
            <span className="nx-icon-circle"><InfoCircleOutlined /></span>
            <div>
              <h4 className="nx-section-title" style={{ margin: 0, fontSize: 15 }}>Dynamic variables</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <span className="nx-status nx-status--neutral"><strong>{"{name}"}</strong></span>
                <span className="nx-status nx-status--neutral"><strong>{"{email}"}</strong></span>
                <span className="nx-status nx-status--neutral"><strong>{"{phone}"}</strong></span>
                <span className="nx-status nx-status--neutral"><strong>{"{dreamCountry}"}</strong></span>
                <span className="nx-status nx-status--neutral"><strong>{"{preferredIntake}"}</strong></span>
                <span className="nx-status nx-status--neutral"><strong>{"{highestEducation}"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Templates Table */}
        <div className="page-table-card">
          <Table dataSource={templates} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 8 }} />
        </div>

        {/* Sent emails — our own record, Resend only keeps 30 days */}
        <div className="nx-card p-5" style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
            <div className="flex items-center gap-3">
              <span className="nx-icon-circle"><HistoryOutlined /></span>
              <div>
                <h4 className="nx-section-title" style={{ margin: 0, fontSize: 15 }}>Sent emails</h4>
                <span style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>
                  Every email we send, and what happened to it. Kept here for good — Resend's own logs stop at 30 days.
                </span>
              </div>
            </div>
            <Space wrap>
              <Input.Search
                allowClear placeholder="Search address or subject" style={{ width: 240 }}
                onSearch={(v) => { setLogQuery(v); setLogPage(1); }}
              />
              <Select
                allowClear placeholder="Any outcome" style={{ width: 160 }} value={logStatus}
                onChange={(v) => { setLogStatus(v); setLogPage(1); }}
                options={['sent', 'delivered', 'opened', 'clicked', 'delayed', 'bounced', 'complained', 'failed']
                  .map((v) => ({ value: v, label: `${v}${log.counts?.[v] ? ` (${log.counts[v]})` : ''}` }))}
              />
              <Button icon={<ReloadOutlined />} onClick={loadEmailLog} loading={logLoading}>Refresh</Button>
            </Space>
          </div>

          {!logLoading && !log.rows.length ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nothing logged yet. Emails sent from now on will appear here."
            />
          ) : (
            <Table
              size="small"
              dataSource={log.rows}
              columns={logColumns}
              rowKey="_id"
              loading={logLoading}
              pagination={{ current: logPage, pageSize: 20, total: log.total, showSizeChanger: false, onChange: setLogPage }}
            />
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingId ? 'Edit Email Template' : 'Create Email Template'}
          open={modalOpen}
          onOk={handleModalSubmit}
          onCancel={() => setModalOpen(false)}
          okText="Save Template"
          width={600}
          destroyOnHidden
          className="premium-modal"
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }} initialValues={{ type: 'email' }}>
            <Form.Item name="name" label="Template Name" rules={[{ required: true, message: 'Enter template name' }]}>
              <Input placeholder="e.g. Welcome Email, Visa Update" />
            </Form.Item>
            <Form.Item name="subject" label="Email Subject" rules={[{ required: true, message: 'Enter email subject' }]}>
              <Input placeholder="e.g. Hello {name}, update on {dreamCountry}" />
            </Form.Item>
            <Form.Item name="body" label="Email Body" rules={[{ required: true, message: 'Enter email body' }]}>
              <TextArea rows={6} placeholder={"Dear {name},\n\nWe saw you are interested in studying in {dreamCountry}.\n\nBest Regards,\nUniCoach Team"} />
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </div>
  );
};

export default EmailHub;
