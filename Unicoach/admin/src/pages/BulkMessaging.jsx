import React, { useEffect, useState } from 'react';
import { Select, Button, Space, List, Progress, Input, message, Alert, Tooltip, Row, Col, Modal } from 'antd';
import { SendOutlined, MailOutlined, MessageOutlined, CheckCircleOutlined, SyncOutlined, CheckOutlined, DashboardOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// Parse the manual recipients textarea: one "name, email, phone" per line (missing fields tolerated).
const parseCustomRecipients = (raw) =>
  String(raw || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(',').map(p => p.trim());
      const recipient = { name: '', email: '', phone: '' };
      // Tolerate missing/reordered fields: detect email and phone by shape
      parts.forEach((part) => {
        if (!part) return;
        if (!recipient.email && part.includes('@')) recipient.email = part;
        else if (!recipient.phone && /^\+?[\d\s()-]{7,}$/.test(part)) recipient.phone = part;
        else if (!recipient.name) recipient.name = part;
      });
      return recipient;
    })
    .filter(r => r.email || r.phone);

const BulkMessaging = () => {
  const [templates, setTemplates] = useState([]);
  const [target, setTarget] = useState('leads');
  const [channel, setChannel] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customInput, setCustomInput] = useState('');
  
  // SMTP Status
  const [smtpStatus, setSmtpStatus] = useState('checking'); // 'checking' | 'active' | 'simulator' | 'error'
  const [settings, setSettings] = useState(null);
  const [verifyingSmtp, setVerifyingSmtp] = useState(false);

  // Stats Counts
  const [leadsCount, setLeadsCount] = useState(0);
  const [verifiedLeadsCount, setVerifiedLeadsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  // Sending progress state
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendingLog, setSendingLog] = useState([]);
  const [summaryText, setSummaryText] = useState('');

  // Fetch initial templates & stats
  const loadData = async () => {
    try {
      // 1. Fetch templates
      const templatesRes = await API.get('/admin/templates');
      setTemplates(templatesRes.data);

      // 2. Fetch stats counts
      const statsRes = await API.get('/admin/stats');
      if (statsRes.data) {
        setLeadsCount(statsRes.data.leads || 0);
        setVerifiedLeadsCount(statsRes.data.verifiedLeads || 0);
        setUsersCount(statsRes.data.studentUsers ?? statsRes.data.users ?? 0);
      }

      // 3. Fetch settings to inspect SMTP setup
      const settingsRes = await API.get('/admin/settings-manage');
      if (settingsRes.data) {
        setSettings(settingsRes.data);
        if (settingsRes.data.smtpHost && settingsRes.data.smtpUser && (settingsRes.data.hasSmtpPass || settingsRes.data.smtpPass)) {
          setSmtpStatus('active');
        } else {
          setSmtpStatus('simulator');
        }
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to load messaging configuration data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter templates by selected channel
  const filteredTemplates = templates.filter(t => t.type === channel);

  // Auto-select first template when channel changes
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      setSelectedTemplate(filteredTemplates[0]._id);
    } else {
      setSelectedTemplate(null);
    }
  }, [channel, templates]);

  // Test SMTP connection manually
  const verifySmtpConnection = async () => {
    if (!settings || !settings.smtpHost || !settings.smtpUser) {
      message.warning('Please set up SMTP settings first in Settings page!');
      return;
    }
    setVerifyingSmtp(true);
    try {
      const res = await API.post('/admin/messaging/verify-smtp', {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser
        // smtpPass is never sent to the browser; the server uses the stored password
      });
      if (res.data && res.data.success) {
        setSmtpStatus('active');
        message.success('SMTP Server Connected Successfully!');
      }
    } catch (err) {
      setSmtpStatus('error');
      message.error(err.response?.data?.message || 'SMTP Handshake failed.');
    } finally {
      setVerifyingSmtp(false);
    }
  };

  const TARGET_LABELS = {
    leads: 'All Verified Leads',
    'all-leads': 'All Leads (including unverified)',
    users: 'All Registered Users',
    custom: 'Manual Recipient List'
  };

  // Submit Bulk Campaign (asks for confirmation first)
  const handleSendBulk = () => {
    if (!selectedTemplate) {
      message.error('Please select a message template first!');
      return;
    }

    if (target === 'custom' && !customInput.trim()) {
      message.error('Please input at least one recipient in manual CSV box!');
      return;
    }

    const customRecipients = target === 'custom' ? parseCustomRecipients(customInput) : [];
    if (target === 'custom' && customRecipients.length === 0) {
      message.error('No valid recipients found. Use one "name, email, phone" per line.');
      return;
    }

    const recipientCount = target === 'custom'
      ? customRecipients.length
      : target === 'leads' ? verifiedLeadsCount
      : target === 'all-leads' ? leadsCount
      : usersCount;
    const templateName = templates.find(t => t._id === selectedTemplate)?.name || 'selected template';

    Modal.confirm({
      title: `Send ${channel === 'email' ? 'email' : 'WhatsApp'} campaign?`,
      content: `This will send "${templateName}" to ${TARGET_LABELS[target] || target} — ${recipientCount} recipient${recipientCount === 1 ? '' : 's'}. This cannot be undone.`,
      okText: 'Send Campaign',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => executeSendBulk(customRecipients)
    });
  };

  const executeSendBulk = async (customRecipients) => {
    setSending(true);
    setSendProgress(10);
    setSendingLog([]);
    setSummaryText('Initializing campaign deployment...');

    try {
      const payload = {
        target,
        channel,
        templateId: selectedTemplate,
        customRecipients
      };

      const res = await API.post('/admin/messaging/send-bulk', payload);

      if (res.data && res.data.success) {
        const logs = res.data.logs || [];
        setSendProgress(40);
        
        // animate logs typing
        let progress = 50;
        const step = Math.max(1, Math.round(50 / logs.length));
        
        for (let i = 0; i < logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setSendingLog(prev => [...prev, logs[i]]);
          progress = Math.min(100, progress + step);
          setSendProgress(progress);
        }

        setSendProgress(100);
        setSummaryText(res.data.summary);
        message.success('Campaign sent successfully!');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Bulk messaging campaign failed.');
      setSendProgress(0);
      setSummaryText('Failed to complete campaign.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Header title="Bulk messaging" subtitle="Reach your student leads with personalised bulk email or WhatsApp campaigns" />

      <div className="dashboard-content">
        <Row gutter={[16, 16]}>

          {/* Main Controls Card */}
          <Col xs={24} lg={14}>
            <div className="nx-card p-5 sm:p-6 h-full">
              <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                <span className="nx-icon-circle"><SendOutlined /></span>
                <span className="nx-section-title">Campaign setup</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 1. Target Audience */}
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>Target Audience</label>
                  <Select value={target} onChange={(val) => setTarget(val)} style={{ width: '100%' }}>
                    <Option value="leads">All Verified Leads ({verifiedLeadsCount} students)</Option>
                    <Option value="all-leads">All Leads (including unverified) ({leadsCount})</Option>
                    <Option value="users">All Registered Users ({usersCount} accounts)</Option>
                    <Option value="custom">Manual Recipient List (CSV Format)</Option>
                  </Select>
                </div>

                {target === 'custom' && (
                  <div>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>
                      Recipients Entry (comma-separated: name,email,phone - one per line)
                    </label>
                    <TextArea 
                      rows={5} 
                      placeholder="Rahul,rahul@example.com,9876543210&#10;Amit,amit@example.com,8765432109"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                  </div>
                )}

                {/* 2. Channel & Status */}
                <Row gutter={16}>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>Messaging Channel</label>
                    <Select value={channel} onChange={(val) => setChannel(val)} style={{ width: '100%' }}>
                      <Option value="email">Email Campaign</Option>
                      <Option value="whatsapp">WhatsApp Message</Option>
                    </Select>
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>
                      {channel === 'email' ? 'SMTP Configuration' : 'WhatsApp Gateway'}
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minHeight: 32 }}>
                      {channel === 'email' ? (
                        <>
                          {smtpStatus === 'active' && <span className="nx-status nx-status--success">SMTP active</span>}
                          {smtpStatus === 'simulator' && <span className="nx-status nx-status--warning">Simulator logs</span>}
                          {smtpStatus === 'error' && <span className="nx-status nx-status--danger">Verification error</span>}
                          
                          <Tooltip title="Test connection handshake">
                            <Button 
                              icon={<SyncOutlined spin={verifyingSmtp} />} 
                              size="small"
                              onClick={verifySmtpConnection}
                            >
                              Verify
                            </Button>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          {settings?.wabaAccessToken && settings?.wabaPhoneNumberId ? (
                            <span className="nx-status nx-status--success">Meta WABA active</span>
                          ) : settings?.twilioAccountSid && settings?.twilioAuthToken ? (
                            <span className="nx-status nx-status--neutral">Twilio fallback</span>
                          ) : (
                            <span className="nx-status nx-status--warning">Simulator logs</span>
                          )}
                        </>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* 3. Select Message Template */}
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>Message Template</label>
                  <Select 
                    value={selectedTemplate} 
                    onChange={(val) => setSelectedTemplate(val)} 
                    style={{ width: '100%' }}
                    placeholder={filteredTemplates.length === 0 ? "No templates configured for this channel" : "Select Template"}
                  >
                    {filteredTemplates.map(t => (
                      <Option key={t._id} value={t._id}>{t.name}</Option>
                    ))}
                  </Select>
                </div>

                {/* Template Preview Body */}
                {selectedTemplate && (
                  <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--ux-ink)' }}>
                      <strong style={{ fontWeight: 600 }}>Subject preview:</strong> {templates.find(t => t._id === selectedTemplate)?.subject || 'N/A'}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 10, whiteSpace: 'pre-wrap', color: 'var(--ux-text-2)', lineHeight: 1.55 }}>
                      <strong style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>Body preview:</strong><br />
                      {templates.find(t => t._id === selectedTemplate)?.body}
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<SendOutlined />} 
                  onClick={handleSendBulk} 
                  loading={sending}
                >
                  Send campaign
                </Button>

              </div>
            </div>
          </Col>

          {/* Delivery Logs Panel */}
          <Col xs={24} lg={10}>
            <div className="nx-card p-5 sm:p-6 h-full">
              <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                <span className="nx-icon-circle"><DashboardOutlined /></span>
                <span className="nx-section-title">Sender dashboard</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Progress Indicators */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--ux-ink)', fontSize: 13 }}>
                    <strong style={{ fontWeight: 600 }}>Delivery status</strong>
                    <span style={{ fontWeight: 600 }}>{sendProgress}%</span>
                  </div>
                  <Progress percent={sendProgress} status={sending ? 'active' : 'normal'} showInfo={false} />
                  {summaryText && (
                    <Alert 
                      message={summaryText} 
                      type={summaryText.includes('failed') && !summaryText.includes('0 failed') ? 'warning' : 'success'} 
                      style={{ marginTop: 12, fontWeight: 600, fontSize: 12, borderRadius: 14 }}  
                    />
                  )}
                </div>

                {/* Real-time Logger Terminal */}
                <div style={{ 
                  flexGrow: 1, 
                  background: 'var(--ux-ink)',
                  border: '1px solid var(--ux-ink)',
                  borderRadius: 18, 
                  padding: 16, 
                  height: 380, 
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  {sendingLog.length === 0 && !sending && (
                    <div style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 140 }}>
                      No campaign active.<br />Configure setup and click Send.
                    </div>
                  )}

                  {sendingLog.map((log, index) => (
                    <div key={index} style={{ marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: log.status === 'success' ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                          [{log.status.toUpperCase()}]
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.recipient}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
                        To: {log.name} — {log.status === 'success' ? 'Delivery verified' : `Error: ${log.error}`}
                      </div>
                    </div>
                  ))}

                  {sending && (
                    <div style={{ color: '#F4A07D', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <SyncOutlined spin /> <span>Processing outreach batch...</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </Col>

        </Row>
      </div>
    </div>
  );
};

export default BulkMessaging;
