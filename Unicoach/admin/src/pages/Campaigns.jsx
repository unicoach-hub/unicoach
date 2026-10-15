import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal, Form, Input, Select, DatePicker, Radio, Table, Progress, Drawer, Popconfirm, message, Empty, Tooltip, Segmented, Checkbox } from 'antd';
import { PlusOutlined, SendOutlined, PauseCircleOutlined, PlayCircleOutlined, StopOutlined, ReloadOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Header from '../components/Header';
import API from '../api/axios';

// WhatsApp campaigns: approved template → audience → now or scheduled; sent in the background with a live report
const STATUS = {
  scheduled: { label: 'Scheduled', cls: 'nx-status--accent' },
  running: { label: 'Sending', cls: 'nx-status--warning' },
  paused: { label: 'Paused', cls: 'nx-status--danger' },
  completed: { label: 'Completed', cls: 'nx-status--success' },
  cancelled: { label: 'Cancelled', cls: 'nx-status--neutral' },
};
const LEAD_STATUSES = [
  { value: 'new', label: 'New' }, { value: 'interested', label: 'Interested' }, { value: 'fifty_fifty', label: '50 / 50' },
  { value: 'not_interested', label: 'Not interested' }, { value: 'converted', label: 'Converted' },
];
const RECIPIENT_STATUS = {
  queued: 'Waiting', sending: 'Sending', sent: 'Sent', delivered: 'Delivered', read: 'Read', failed: 'Failed', skipped: 'Skipped',
};
const fmt = (d) => (d ? dayjs(d).format('D MMM YYYY, h:mm A') : '—');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

const StatBox = ({ label, value, sub }) => (
  <div className="nx-card" style={{ padding: '12px 14px' }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ux-ink)' }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>{label}{sub ? <span style={{ color: 'var(--ux-text-3)' }}> · {sub}</span> : null}</div>
  </div>
);

const Campaigns = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [events, setEvents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailFilter, setDetailFilter] = useState('all');
  const [detailPage, setDetailPage] = useState(1);

  const load = async () => {
    try {
      const { data } = await API.get('/admin/campaigns');
      setList(Array.isArray(data) ? data : []);
    } catch {
      message.error('Could not load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const anyActive = list.some((c) => c.status === 'running' || c.status === 'scheduled');
  useEffect(() => {
    if (!anyActive) return undefined;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [anyActive]);

  const loadDetail = async (id = openId, page = detailPage, filter = detailFilter) => {
    if (!id) return;
    try {
      const { data } = await API.get(`/admin/campaigns/${id}`, { params: { page, filter: filter === 'all' ? undefined : filter } });
      setDetail(data);
    } catch {
      message.error('Could not load the report');
    }
  };
  useEffect(() => {
    if (!openId) return undefined;
    loadDetail(openId, detailPage, detailFilter);
    const t = setInterval(() => loadDetail(openId, detailPage, detailFilter), 6000);
    return () => clearInterval(t);
  }, [openId, detailPage, detailFilter]);

  const openCreate = async () => {
    setPreview(null);
    form.resetFields();
    form.setFieldsValue({ target: 'all-leads', when: 'now', audience: {} });
    setCreateOpen(true);
    try {
      const [t, e, l] = await Promise.all([
        API.get('/admin/templates'),
        API.get('/admin/content', { params: { type: 'event' } }).catch(() => ({ data: [] })),
        API.get('/admin/leads').catch(() => ({ data: [] })),
      ]);
      setTemplates((t.data || []).filter((x) => x.type === 'whatsapp' && x.metaStatus === 'APPROVED' && x.wabaTemplateName));
      setEvents((Array.isArray(e.data) ? e.data : []).filter((ev) => (ev.attendees || []).length > 0));
      setCountries([...new Set((l.data || []).map((x) => x.dreamCountry).filter(Boolean))].sort());
    } catch {
      message.error('Could not load templates');
    }
  };

  const selectedTemplate = Form.useWatch('templateId', form);
  const target = Form.useWatch('target', form);
  const when = Form.useWatch('when', form);
  const tpl = templates.find((t) => t._id === selectedTemplate);
  const campaignVarKeys = useMemo(() => {
    const keys = (tpl?.wabaParameters || '').split(',').map((s) => s.trim()).filter(Boolean);
    return keys.filter((k) => ['meet_link', 'event_name', 'event_date', 'event_time'].includes(k));
  }, [tpl]);

  const buildPayload = (v) => ({
    name: v.name,
    templateId: v.templateId,
    target: v.target === 'event' ? `event:${v.eventId}` : v.target,
    audience: v.target === 'audience' ? v.audience : undefined,
    customRecipients: v.target === 'custom'
      ? String(v.numbers || '').split(/[\n,]+/).map((line) => {
        const [phone, ...rest] = line.split(/\s+/).filter(Boolean);
        return phone ? { phone, name: rest.join(' ') } : null;
      }).filter(Boolean)
      : undefined,
    variables: v.variables,
    scheduledAt: v.when === 'later' && v.scheduledAt ? v.scheduledAt.toISOString() : undefined,
  });

  const runPreview = async () => {
    const v = form.getFieldsValue(true);
    if (!v.templateId) { message.info('Choose a template first'); return; }
    setPreviewing(true);
    try {
      const { data } = await API.post('/admin/campaigns/preview', buildPayload(v));
      setPreview(data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not count');
    } finally {
      setPreviewing(false);
    }
  };

  const submit = async () => {
    let v;
    try { v = await form.validateFields(); } catch { return; }
    v = { ...form.getFieldsValue(true), ...v };
    setSaving(true);
    try {
      const { data } = await API.post('/admin/campaigns', buildPayload(v));
      message.success(v.when === 'later' ? `Scheduled for ${fmt(data.scheduledAt)}` : `Sending to ${data.total} people`);
      setCreateOpen(false);
      load();
      setOpenId(data._id);
      setDetailPage(1);
      setDetailFilter('all');
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not create the campaign', 8);
    } finally {
      setSaving(false);
    }
  };

  const act = async (id, action) => {
    try {
      await API.post(`/admin/campaigns/${id}/${action}`);
      load();
      if (openId === id) loadDetail();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update');
    }
  };

  const actions = (c) => (
    <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
      {(c.status === 'running' || c.status === 'scheduled') && <Tooltip title="Pause"><Button size="small" icon={<PauseCircleOutlined />} onClick={() => act(c._id, 'pause')} /></Tooltip>}
      {c.status === 'paused' && <Tooltip title="Resume"><Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => act(c._id, 'resume')} /></Tooltip>}
      {['scheduled', 'running', 'paused'].includes(c.status) && (
        <Popconfirm title="Cancel this campaign?" description="People not reached yet won't get it." okText="Cancel campaign" okButtonProps={{ danger: true }} onConfirm={() => act(c._id, 'cancel')}>
          <Tooltip title="Cancel"><Button size="small" danger icon={<StopOutlined />} /></Tooltip>
        </Popconfirm>
      )}
    </div>
  );

  const columns = [
    {
      title: 'Campaign', key: 'name',
      render: (_, c) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{c.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>Template: {c.templateName}</div>
        </div>
      ),
    },
    { title: 'Status', key: 'status', render: (_, c) => <span className={`nx-status ${STATUS[c.status]?.cls || ''}`}>{STATUS[c.status]?.label || c.status}</span> },
    {
      title: 'Progress', key: 'progress', width: 220,
      render: (_, c) => (
        <div>
          <Progress percent={pct(c.sent + c.failed, c.total)} size="small" status={c.status === 'paused' ? 'exception' : undefined} showInfo={false} />
          <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{c.sent} sent · {c.failed} failed · {c.total} total</div>
          {c.lastError && c.status === 'paused' && <div style={{ fontSize: 11.5, color: '#b91c1c' }}>{c.lastError}</div>}
        </div>
      ),
    },
    { title: 'When', key: 'when', render: (_, c) => <span style={{ fontSize: 12.5 }}>{c.status === 'scheduled' ? <><ClockCircleOutlined /> {fmt(c.scheduledAt)}</> : fmt(c.startedAt || c.scheduledAt)}</span> },
    { title: '', key: 'actions', render: (_, c) => actions(c) },
  ];

  const d = detail?.campaign;
  const s = detail?.stats;

  return (
    <div>
      <Header
        title="WhatsApp campaigns"
        subtitle="Send an approved template to many students, now or at a set time, and see who got it, read it and replied"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New campaign</Button>}
      />
      <div className="dashboard-content">
        <div className="page-table-card" style={{ overflowX: 'auto' }}>
          <Table
            rowKey="_id"
            loading={loading}
            dataSource={list}
            columns={columns}
            locale={{ emptyText: <Empty description="No campaigns yet" /> }}
            onRow={(c) => ({ onClick: () => { setOpenId(c._id); setDetail(null); setDetailPage(1); setDetailFilter('all'); }, style: { cursor: 'pointer' } })}
            pagination={{ pageSize: 15 }}
          />
        </div>
      </div>

      {/* New campaign */}
      <Modal title="New WhatsApp campaign" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submit} okText={when === 'later' ? 'Schedule' : 'Send now'} okButtonProps={{ icon: <SendOutlined />, loading: saving }} width={640} destroyOnHidden>
        <Form form={form} layout="vertical" onValuesChange={() => setPreview(null)}>
          <Form.Item name="name" label="Campaign name" rules={[{ required: true, message: 'Name it, e.g. Ireland webinar reminder' }]}>
            <Input placeholder="e.g. Ireland webinar reminder" />
          </Form.Item>
          <Form.Item name="templateId" label="Approved template" rules={[{ required: true, message: 'Choose a template' }]}
            extra={templates.length === 0 ? <span>No approved WhatsApp templates yet. <Link to="/templates">Create one and submit it to Meta</Link>.</span> : null}>
            <Select placeholder="Choose" options={templates.map((t) => ({ value: t._id, label: `${t.name} (${t.wabaTemplateName})` }))} />
          </Form.Item>
          {tpl && <div style={{ background: '#d9fdd3', borderRadius: 10, padding: '8px 10px', whiteSpace: 'pre-wrap', fontSize: 13, marginTop: -8, marginBottom: 16 }}>{tpl.body}</div>}

          <Form.Item name="target" label="Who gets it">
            <Select options={[
              { value: 'all-leads', label: 'All leads' },
              { value: 'leads', label: 'Verified leads only' },
              { value: 'audience', label: 'Filtered leads (status, country, tags…)' },
              { value: 'event', label: 'People registered for an event' },
              { value: 'custom', label: 'Paste numbers' },
            ]} />
          </Form.Item>
          {target === 'audience' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item name={['audience', 'statuses']} label="Status"><Select mode="multiple" allowClear options={LEAD_STATUSES} placeholder="Any" /></Form.Item>
              <Form.Item name={['audience', 'countries']} label="Country"><Select mode="multiple" allowClear options={countries.map((c) => ({ value: c, label: c }))} placeholder="Any" /></Form.Item>
              <Form.Item name={['audience', 'followUps']} label="Follow up"><Select mode="multiple" allowClear options={[{ value: 'interested', label: 'Interested' }, { value: 'fifty_fifty', label: '50 / 50' }]} placeholder="Any" /></Form.Item>
              <Form.Item name={['audience', 'tagsAny']} label="Has any tag"><Select mode="tags" allowClear placeholder="Type a tag" /></Form.Item>
              <Form.Item name={['audience', 'verifiedOnly']} valuePropName="checked"><Checkbox>Verified leads only</Checkbox></Form.Item>
            </div>
          )}
          {target === 'event' && (
            <Form.Item name="eventId" label="Event" rules={[{ required: true, message: 'Choose the event' }]}>
              <Select options={events.map((e) => ({ value: e._id, label: `${e.title} (${(e.attendees || []).length} registered)` }))} placeholder="Choose" showSearch optionFilterProp="label" />
            </Form.Item>
          )}
          {target === 'custom' && (
            <Form.Item name="numbers" label="Numbers (one per line, name after the number is optional)" rules={[{ required: true, message: 'Add at least one number' }]}>
              <Input.TextArea rows={4} placeholder={'919876543210 Rahul\n919812345678 Priya'} />
            </Form.Item>
          )}

          {campaignVarKeys.length > 0 && (
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Campaign variables</div>
              {campaignVarKeys.map((k) => (
                <Form.Item key={k} name={['variables', k]} style={{ marginBottom: 0 }}><Input addonBefore={k} placeholder={target === 'event' ? 'Filled from the event if left empty' : ''} /></Form.Item>
              ))}
            </div>
          )}

          <Form.Item name="when" label="When">
            <Radio.Group>
              <Radio value="now">Send now</Radio>
              <Radio value="later">Schedule</Radio>
            </Radio.Group>
          </Form.Item>
          {when === 'later' && (
            <Form.Item name="scheduledAt" rules={[{ required: true, message: 'Pick a date and time' }]}>
              <DatePicker showTime={{ format: 'h:mm A', use12Hours: true }} format="D MMM YYYY, h:mm A" disabledDate={(dt) => dt && dt < dayjs().startOf('day')} style={{ width: '100%' }} />
            </Form.Item>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 12px', borderRadius: 10, background: 'var(--ux-surface-2)' }}>
            <Button size="small" icon={<TeamOutlined />} loading={previewing} onClick={runPreview}>Count people</Button>
            {preview && (
              <span style={{ fontSize: 13 }}>
                <b>{preview.count}</b> will get it{preview.skipped ? ` · ${preview.skipped} skipped (no valid number, duplicate or replied STOP)` : ''}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 8 }}>
            Messages go out in the background at a safe pace; you can close this page. Meta charges per conversation (marketing costs more than utility).
          </div>
        </Form>
      </Modal>

      {/* Report */}
      <Drawer open={!!openId} onClose={() => { setOpenId(null); setDetail(null); }} width={760} title={d ? d.name : 'Campaign'}
        extra={d && <div style={{ display: 'flex', gap: 8 }}>{actions(d)}<Button size="small" icon={<ReloadOutlined />} onClick={() => loadDetail()} /></div>}>
        {!detail ? null : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`nx-status ${STATUS[d.status]?.cls || ''}`}>{STATUS[d.status]?.label}</span>
              <span style={{ fontSize: 13, color: 'var(--ux-text-2)' }}>Template <b>{d.templateName}</b> · {d.status === 'scheduled' ? `starts ${fmt(d.scheduledAt)}` : `started ${fmt(d.startedAt)}`}{d.finishedAt ? ` · finished ${fmt(d.finishedAt)}` : ''}</span>
            </div>
            {d.lastError && <div style={{ fontSize: 13, color: '#b91c1c' }}>{d.lastError}</div>}
            <Progress percent={pct(s.sent + s.failed, d.total)} status={d.status === 'paused' ? 'exception' : d.status === 'completed' ? 'success' : 'active'} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
              <StatBox label="People" value={d.total} sub={d.skipped ? `${d.skipped} skipped` : null} />
              <StatBox label="Sent" value={s.sent} sub={s.queued ? `${s.queued} waiting` : null} />
              <StatBox label="Delivered" value={s.delivered} sub={`${pct(s.delivered, s.sent)}%`} />
              <StatBox label="Read" value={s.read} sub={`${pct(s.read, s.delivered)}%`} />
              <StatBox label="Replied" value={s.replied} sub={`${pct(s.replied, s.delivered)}%`} />
              <StatBox label="Failed" value={s.failed} />
            </div>
            <Segmented
              value={detailFilter}
              onChange={(v) => { setDetailFilter(v); setDetailPage(1); }}
              options={[{ value: 'all', label: 'All' }, { value: 'sent', label: 'Sent' }, { value: 'failed', label: 'Failed' }, { value: 'queued', label: 'Waiting' }, { value: 'skipped', label: 'Skipped' }]}
            />
            <Table
              size="small"
              rowKey="id"
              dataSource={detail.recipients}
              pagination={{ current: detail.page, pageSize: detail.pageSize, total: detail.totalRows, onChange: setDetailPage, showSizeChanger: false }}
              columns={[
                { title: 'Name', dataIndex: 'name', render: (v) => v || '—' },
                { title: 'Number', dataIndex: 'phone', render: (v) => `+${v}` },
                {
                  title: 'Status', dataIndex: 'status',
                  render: (v, r) => (
                    <Tooltip title={r.error}>
                      <span className={`nx-status ${v === 'failed' ? 'nx-status--danger' : v === 'read' ? 'nx-status--success' : v === 'delivered' ? 'nx-status--accent' : 'nx-status--neutral'}`}>{RECIPIENT_STATUS[v] || v}</span>
                    </Tooltip>
                  ),
                },
                { title: 'Sent at', dataIndex: 'sentAt', render: (v) => (v ? dayjs(v).format('D MMM, h:mm A') : '—') },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Campaigns;
