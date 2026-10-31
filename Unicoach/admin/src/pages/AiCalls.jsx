import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Button, DatePicker, Drawer, Empty, Form, Input, InputNumber, Segmented, Select, Spin, Switch, Table, Tag, message,
} from 'antd';
import {
  PhoneOutlined, ReloadOutlined, SyncOutlined, ArrowDownOutlined, ArrowUpOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTip, Legend } from 'recharts';
import Header from '../components/Header';
import API from '../api/axios';
import { usePermissions } from '../utils/permissions';

// AI Calls: Riya (Bolna voice agent) — overview, call history with recording + transcript, new calls, settings
const OUTCOMES = {
  consultation_yes: { label: 'Wants counsellor', color: 'green' },
  callback: { label: 'Callback', color: 'gold' },
  not_interested: { label: 'Not interested', color: 'default' },
  do_not_call: { label: 'Do not call', color: 'red' },
  wrong_number: { label: 'Wrong number', color: 'volcano' },
  no_conversation: { label: 'No conversation', color: 'default' },
};
const PENDING = ['scheduled', 'queued', 'rescheduled', 'initiated', 'ringing', 'in-progress'];
const TRIGGERS = { auto: 'Auto (form)', manual: 'Manual', batch: 'Batch', inbound: 'Inbound', softphone: 'Team phone' };

const fmtTime = (d) => (d ? new Date(d).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
}) : '—');
const fmtDur = (s) => (!s ? '—' : s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const errText = (e, fallback) => e?.response?.data?.message || fallback;

const StatusTag = ({ call }) => {
  if (call.kind === 'human' && call.status === 'completed') return <Tag color="blue">Talked</Tag>;
  if (call.outcome && OUTCOMES[call.outcome]) return <Tag color={OUTCOMES[call.outcome].color}>{OUTCOMES[call.outcome].label}</Tag>;
  if (PENDING.includes(call.status)) return <Tag color="processing">{call.status === 'scheduled' ? 'Scheduled' : 'In progress'}</Tag>;
  if (call.status) return <Tag color="default">{call.status.replace(/-/g, ' ')}</Tag>;
  return null;
};

const Metric = ({ label, value, sub, color }) => (
  <div className="nx-card" style={{ padding: 14 }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--ux-ink)', lineHeight: 1.2 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>{label}{sub && <span style={{ color: 'var(--ux-text-3)' }}> · {sub}</span>}</div>
  </div>
);

// Bolna transcript: "assistant: ..." / "user: ..." lines → chat bubbles
const Transcript = ({ text }) => {
  const lines = useMemo(() => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = /^(assistant|user|agent|bot|human)\s*:\s*(.*)$/i.exec(l);
    return m ? { who: /assistant|agent|bot/i.test(m[1]) ? 'riya' : 'student', text: m[2] } : { who: 'note', text: l };
  }), [text]);
  if (!lines.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transcript yet" />;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: l.who === 'student' ? 'flex-end' : 'flex-start' }}>
          <div style={{
            maxWidth: '82%', padding: '8px 12px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.45,
            background: l.who === 'riya' ? 'var(--ux-surface-2, #f3f4f6)' : l.who === 'student' ? '#fff3e8' : 'transparent',
            border: '1px solid var(--ux-border, #e5e7eb)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ux-text-3)', marginBottom: 2 }}>
              {l.who === 'riya' ? 'Riya' : l.who === 'student' ? 'Student' : ''}
            </div>
            {l.text}
          </div>
        </div>
      ))}
    </div>
  );
};

// Riya's recordings are public Bolna links; team-phone recordings come through the server (Vobiz needs our keys)
const Recording = ({ call }) => {
  const [src, setSrc] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => () => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); }, [src]);
  if (!call.recordingUrl) return <span style={{ color: 'var(--ux-text-3)' }}>No recording yet</span>;
  if (call.kind !== 'human') return <audio controls preload="none" src={call.recordingUrl} style={{ width: '100%' }} />;
  if (src) return <audio controls autoPlay src={src} style={{ width: '100%' }} />;
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/ai-calls/${call._id}/recording`, { responseType: 'blob' });
      setSrc(URL.createObjectURL(data));
    } catch {
      message.error('Could not load the recording');
    } finally {
      setLoading(false);
    }
  };
  return <Button onClick={load} loading={loading}>Play recording</Button>;
};

const CallDrawer = ({ id, onClose, onChanged }) => {
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/ai-calls/${id}`);
      setCall(data);
    } catch (e) {
      message.error(errText(e, 'Could not load the call'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { setCall(null); load(); }, [load]);

  const sync = async () => {
    setSyncing(true);
    try {
      await API.post(`/admin/ai-calls/${id}/sync`);
      await load();
      onChanged?.();
      message.success('Updated from Bolna');
    } catch (e) {
      message.error(errText(e, 'Could not update from Bolna'));
    } finally {
      setSyncing(false);
    }
  };

  const fields = Object.entries(call?.extracted || {}).filter(([k]) => k !== 'outcome');

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      width={Math.min(620, typeof window !== 'undefined' ? window.innerWidth : 620)}
      title={call ? `${call.name || call.phone} · ${call.direction === 'inbound' ? 'Inbound' : 'Outbound'}${call.kind === 'human' ? ` · ${call.staffName || 'Team'}` : ' · Riya'}` : 'Call'}
      extra={call?.kind !== 'human' && <Button icon={<SyncOutlined spin={syncing} />} onClick={sync} disabled={!call}>Update from Bolna</Button>}
    >
      {loading && !call ? <Spin /> : call && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <StatusTag call={call} />
            <Tag>{TRIGGERS[call.trigger] || call.trigger}</Tag>
            <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{call.phone} · {fmtTime(call.createdAt)} · {fmtDur(call.durationSec)}</span>
          </div>
          {call.lead && (
            <Button icon={<UserOutlined />} onClick={() => navigate(`/leads?lead=${call.lead._id}`)}>
              Open lead: {call.lead.name} ({call.lead.status})
            </Button>
          )}
          {call.customInstructions && (
            <Alert type="info" showIcon message="Instructions for this call" description={call.customInstructions} />
          )}
          {call.error && <Alert type="error" showIcon message={call.error} />}

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Recording</div>
            <Recording call={call} />
          </div>

          {call.summary && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{call.summary}</div>
            </div>
          )}

          {fields.length > 0 && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>What Riya found out</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, auto) 1fr', gap: '4px 12px', fontSize: 13.5 }}>
                {fields.map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <span style={{ color: 'var(--ux-text-2)' }}>{k.replace(/_/g, ' ')}</span>
                    <span>{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Transcript</div>
            {call.kind === 'human'
              ? (call.transcript
                ? <div style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.5 }}>{call.transcript}</div>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Transcript arrives a few minutes after the call" />)
              : <Transcript text={call.transcript} />}
          </div>
        </div>
      )}
    </Drawer>
  );
};

const History = ({ reloadKey, openId, setOpenId }) => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ kind: '', direction: '', status: '', outcome: '', q: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await API.get('/admin/ai-calls', { params });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      message.error(errText(e, 'Could not load calls'));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load, reloadKey]);

  const set = (k) => (v) => { setPage(1); setFilters((f) => ({ ...f, [k]: v })); };

  const columns = [
    {
      title: '', dataIndex: 'direction', width: 36,
      render: (d) => (d === 'inbound' ? <ArrowDownOutlined style={{ color: '#2563eb' }} /> : <ArrowUpOutlined style={{ color: '#ea580c' }} />),
    },
    {
      title: 'Student', key: 'who',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.name || 'Unknown'}</div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>{r.phone}</div>
        </div>
      ),
    },
    { title: 'Result', key: 'result', render: (_, r) => <StatusTag call={r} /> },
    {
      title: 'Summary', dataIndex: 'summary', responsive: ['lg'],
      render: (s) => <span style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>{s ? `${s.slice(0, 110)}${s.length > 110 ? '…' : ''}` : '—'}</span>,
    },
    { title: 'Length', dataIndex: 'durationSec', width: 80, render: fmtDur },
    {
      title: 'By', dataIndex: 'trigger', width: 120, responsive: ['md'],
      render: (t, r) => <span title={r.requestedBy}>{r.kind === 'human' ? r.staffName || 'Team' : `Riya · ${TRIGGERS[t] || t}`}</span>,
    },
    { title: 'When', dataIndex: 'createdAt', width: 130, render: fmtTime },
  ];

  return (
    <div className="nx-card" style={{ padding: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <Input.Search allowClear placeholder="Name, number or summary" style={{ width: 240 }} onSearch={set('q')} />
        <Segmented
          value={filters.kind}
          onChange={set('kind')}
          options={[{ label: 'Riya + team', value: '' }, { label: 'Riya (AI)', value: 'ai' }, { label: 'Team phone', value: 'human' }]}
        />
        <Segmented
          value={filters.direction}
          onChange={set('direction')}
          options={[{ label: 'All', value: '' }, { label: 'Outbound', value: 'outbound' }, { label: 'Inbound', value: 'inbound' }]}
        />
        <Select
          value={filters.status}
          onChange={set('status')}
          style={{ width: 150 }}
          options={[
            { label: 'Any status', value: '' }, { label: 'Answered', value: 'answered' },
            { label: 'Not answered', value: 'unanswered' }, { label: 'Scheduled / live', value: 'pending' },
          ]}
        />
        <Select
          value={filters.outcome}
          onChange={set('outcome')}
          style={{ width: 170 }}
          options={[{ label: 'Any result', value: '' }, ...Object.entries(OUTCOMES).map(([value, o]) => ({ value, label: o.label }))]}
        />
        <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
      </div>
      <Table
        rowKey="_id"
        size="middle"
        loading={loading}
        dataSource={rows}
        columns={columns}
        scroll={{ x: true }}
        onRow={(r) => ({ onClick: () => setOpenId(r._id), style: { cursor: 'pointer' } })}
        pagination={{ current: page, total, pageSize: 25, onChange: setPage, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="No calls yet" /> }}
      />
      <CallDrawer id={openId} onClose={() => setOpenId(null)} onChanged={load} />
    </div>
  );
};

const Overview = ({ reloadKey }) => {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/admin/ai-calls/stats', { params: { days } })
      .then(({ data }) => setStats(data))
      .catch((e) => message.error(errText(e, 'Could not load stats')));
  }, [days, reloadKey]);

  if (!stats) return <Spin />;
  const t = stats.totals;
  const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');
  const s = stats.setup;
  const missing = [
    !s.apiKey && 'BOLNA_API_KEY',
    !s.agentId && 'agent ID (Settings tab or BOLNA_AGENT_ID)',
    !s.webhookSecret && 'BOLNA_WEBHOOK_SECRET',
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {missing.length > 0 && (
        <Alert type="warning" showIcon message="AI calling is not fully set up" description={`Missing on the server: ${missing.join(', ')}. See ai-call-agent/backend-setup.md.`} />
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Segmented value={days} onChange={setDays} options={[{ label: 'Today', value: 1 }, { label: '7 days', value: 7 }, { label: '30 days', value: 30 }]} />
        <Tag color={s.autoEnabled ? 'green' : 'default'}>Auto-call {s.autoEnabled ? 'ON' : 'OFF'}</Tag>
        <Tag color={s.inWindow ? 'blue' : 'default'}>
          Calling hours {s.windowStartHour}:00–{s.windowEndHour}:00 IST{s.inWindow ? ' · open now' : ' · closed now'}
        </Tag>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        <Metric label="Calls" value={t.calls} sub={`${t.inbound} inbound · ${t.team || 0} team`} />
        <Metric label="Answered" value={t.answered} sub={pct(t.answered, t.calls)} />
        <Metric label="Want a counsellor" value={t.interested} sub={pct(t.interested, t.answered)} color="#16a34a" />
        <Metric label="Callbacks asked" value={t.callbacks} />
        <Metric label="Not interested" value={t.notInterested} />
        <Metric label="Talk time" value={`${Math.round(t.seconds / 60)} min`} sub={`≈ ₹${Math.round((t.seconds / 60) * 5)}`} />
      </div>
      {stats.byDay.length > 1 && (
        <div className="nx-card" style={{ padding: 14, height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={stats.byDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <ChartTip />
              <Legend />
              <Bar dataKey="calls" name="Calls" fill="#fdba74" />
              <Bar dataKey="answered" name="Answered" fill="#ea580c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const NewCall = ({ onDone }) => {
  const [form] = Form.useForm();
  const [params] = useSearchParams();
  const [lead, setLead] = useState(null);
  const [saving, setSaving] = useState(false);
  const leadId = params.get('leadId');

  useEffect(() => {
    if (!leadId) { setLead(null); return; }
    API.get(`/admin/leads/${leadId}`)
      .then(({ data }) => { setLead(data); form.setFieldsValue({ phone: data.phone, name: data.name }); })
      .catch(() => message.error('Could not load that lead'));
  }, [leadId, form]);

  const submit = async (v) => {
    setSaving(true);
    try {
      await API.post('/admin/ai-calls', {
        leadId: lead?._id,
        phone: v.phone,
        name: v.name,
        customInstructions: v.customInstructions,
        scheduledAt: v.scheduledAt ? v.scheduledAt.toDate().toISOString() : undefined,
      });
      message.success(v.scheduledAt ? 'Call scheduled' : 'Riya is calling now');
      form.resetFields();
      onDone?.();
    } catch (e) {
      message.error(errText(e, 'Could not start the call'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nx-card" style={{ padding: 18, maxWidth: 640 }}>
      <Form form={form} layout="vertical" onFinish={submit}>
        {lead && <Alert style={{ marginBottom: 14 }} type="info" showIcon message={`Calling lead: ${lead.name}`} description="Riya gets the details this lead already gave (country, intake, education)." />}
        <Form.Item name="phone" label="Phone number" rules={[{ required: true, message: 'Enter a number' }]}>
          <Input prefix={<PhoneOutlined />} placeholder="+91 98xxxxxxxx" disabled={Boolean(lead)} />
        </Form.Item>
        <Form.Item name="name" label="Name">
          <Input placeholder="Student's name (Riya uses the first name)" disabled={Boolean(lead)} />
        </Form.Item>
        <Form.Item
          name="customInstructions"
          label="Instructions for this call (optional)"
          extra="Riya follows these on top of her usual script, e.g. “Remind them about Saturday's UK webinar at 6 PM” or “Only talk about the education loan”."
        >
          <Input.TextArea rows={3} maxLength={1000} showCount />
        </Form.Item>
        <Form.Item name="scheduledAt" label="When" extra="Leave empty to call now (only during calling hours).">
          <DatePicker showTime={{ format: 'HH:mm' }} format="D MMM YYYY, HH:mm" style={{ width: '100%' }} placeholder="Now" />
        </Form.Item>
        <Button type="primary" htmlType="submit" icon={<PhoneOutlined />} loading={saving}>Start call</Button>
      </Form>
    </div>
  );
};

const SettingsTab = () => {
  const [form] = Form.useForm();
  const [info, setInfo] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/admin/ai-calls/settings').then(({ data }) => {
      setInfo(data);
      form.setFieldsValue({
        autoEnabled: Boolean(data.autoEnabled),
        agentId: data.agentId || '',
        fromNumber: data.fromNumber || '',
        windowStartHour: data.windowStartHour ?? 9,
        windowEndHour: data.windowEndHour ?? 21,
        dailyAutoLimit: data.dailyAutoLimit ?? 100,
      });
    }).catch((e) => message.error(errText(e, 'Could not load settings')));
  }, [form]);

  const save = async (v) => {
    setSaving(true);
    try {
      await API.put('/admin/ai-calls/settings', v);
      message.success('Saved');
    } catch (e) {
      message.error(errText(e, 'Could not save'));
    } finally {
      setSaving(false);
    }
  };

  if (!info) return <Spin />;
  return (
    <div className="nx-card" style={{ padding: 18, maxWidth: 640 }}>
      {info.autoBlockedByEnv && <Alert style={{ marginBottom: 14 }} type="warning" showIcon message="BOLNA_AUTO_CALL=false on the server blocks auto calls, whatever this switch says." />}
      <Form form={form} layout="vertical" onFinish={save}>
        <Form.Item name="autoEnabled" label="Call every new website lead automatically" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="agentId" label="Bolna agent ID (outbound)" extra={info.envAgentId ? `Empty = server default ${info.envAgentId}` : 'Agent Studio → Riya → copy ID'}>
          <Input placeholder={info.envAgentId || '123e4567-…'} />
        </Form.Item>
        <Form.Item name="fromNumber" label="Caller number" extra={info.envFromNumber ? `Empty = server default ${info.envFromNumber}` : 'Your Vobiz number'}>
          <Input placeholder={info.envFromNumber || '+918065356711'} />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Form.Item name="windowStartHour" label="Calls from (hour, IST)"><InputNumber min={0} max={23} /></Form.Item>
          <Form.Item name="windowEndHour" label="Calls until (hour, IST)"><InputNumber min={1} max={24} /></Form.Item>
          <Form.Item name="dailyAutoLimit" label="Max auto calls per day"><InputNumber min={1} max={2000} /></Form.Item>
        </div>
        <Button type="primary" htmlType="submit" loading={saving}>Save</Button>
      </Form>
    </div>
  );
};

const AiCalls = () => {
  const [params, setParams] = useSearchParams();
  const { owner } = usePermissions();
  const [reloadKey, setReloadKey] = useState(0);
  const [openId, setOpenId] = useState(params.get('call'));
  const tab = params.get('tab') || (params.get('leadId') ? 'new' : 'overview');
  const setTab = (t) => setParams(t === 'overview' ? {} : { tab: t });

  return (
    <div>
      <Header
        title="AI Calls"
        subtitle="Riya (AI voice agent) and the team phone: every call with its recording, transcript and result"
        extra={<Button icon={<ReloadOutlined />} onClick={() => setReloadKey((k) => k + 1)}>Refresh</Button>}
      />
      <div className="dashboard-content" style={{ display: 'grid', gap: 14 }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { label: 'Overview', value: 'overview' },
            { label: 'Call history', value: 'history' },
            { label: 'New call', value: 'new', icon: <PhoneOutlined /> },
            ...(owner ? [{ label: 'Settings', value: 'settings', icon: <SettingOutlined /> }] : []),
          ]}
        />
        {tab === 'overview' && <Overview reloadKey={reloadKey} />}
        {tab === 'history' && <History reloadKey={reloadKey} openId={openId} setOpenId={setOpenId} />}
        {tab === 'new' && <NewCall onDone={() => { setReloadKey((k) => k + 1); setTab('history'); }} />}
        {tab === 'settings' && owner && <SettingsTab />}
      </div>
    </div>
  );
};

export default AiCalls;
