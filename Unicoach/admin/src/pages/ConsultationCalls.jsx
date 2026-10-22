import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Segmented, Select, Spin, Table, Tag, message } from 'antd';
import {
  ReloadOutlined, PhoneOutlined, CalendarOutlined, CheckCircleOutlined, DollarOutlined,
  StopOutlined, UserDeleteOutlined, ClockCircleOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTip } from 'recharts';
import Header from '../components/Header';
import API from '../api/axios';
import { AvailabilityEditor, ConsultCalendar } from '../components/ConsultationSchedule';

const STATUS = {
  confirmed: { label: 'Upcoming', color: 'blue' },
  completed: { label: 'Completed', color: 'green' },
  no_show: { label: 'No-show', color: 'orange' },
  cancelled: { label: 'Cancelled', color: 'default' },
  payment_pending: { label: 'Payment pending', color: 'gold' },
};

const to12h = (t) => {
  const [h, m] = String(t || '0:0').split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const dayLabel = (ymd) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const Stat = ({ icon, label, value, sub, color = '#0F172A', bg = '#F8FAFC' }) => (
  <div style={{ background: bg, border: '1px solid var(--ux-line-2)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
    <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', color, fontSize: 18, flexShrink: 0 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ux-text-2)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{sub}</div>}
    </div>
  </div>
);

// Paid 1:1 consultation calls booked on /book-consultation: numbers up top, the call list below
const ConsultationCalls = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', service: '', q: '' });
  const [open, setOpen] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | calendar | hours
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data: d } = await API.get('/admin/consultations', { params });
      setData(d);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not load consultation calls');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, filters.q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, filters.q]);

  const update = async (id, patch) => {
    setSaving(true);
    try {
      const { data: c } = await API.patch(`/admin/consultations/${id}`, patch);
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === id ? c : x)) }));
      setOpen((o) => (o && o._id === id ? c : o));
      message.success('Saved');
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const download = () => {
    const head = ['Ref', 'Date', 'Time', 'Service', 'Name', 'Email', 'Phone', 'Status', 'Amount (INR)', 'Counsellor', 'Student notes', 'Team notes', 'Booked on'];
    const rows = (data?.items || []).map((c) => [c.ref, c.date, to12h(c.time), c.serviceLabel, c.name, c.email, c.phone, STATUS[c.status]?.label, c.amountINR, c.counsellor, c.notes, c.teamNotes, new Date(c.createdAt).toLocaleString('en-IN')]);
    const blob = new Blob(['﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `consultation-calls-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const s = data?.stats;
  const showRate = useMemo(() => {
    if (!s) return '—';
    const done = s.completed + s.noShow;
    return done ? `${Math.round((s.completed / done) * 100)}%` : '—';
  }, [s]);

  const columns = [
    { title: 'When', key: 'when', width: 150, render: (_, c) => <div><b>{dayLabel(c.date)}</b><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{to12h(c.time)}</div></div>, sorter: (a, b) => new Date(a.startsAt) - new Date(b.startsAt) },
    { title: 'Student', key: 'who', render: (_, c) => <div><b>{c.name}</b><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{c.phone} · {c.email}</div></div> },
    { title: 'Service', dataIndex: 'serviceLabel', key: 'svc' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 130, render: (v) => <Tag color={STATUS[v]?.color}>{STATUS[v]?.label || v}</Tag> },
    { title: 'Paid', key: 'paid', width: 90, render: (_, c) => (c.payment?.paidAt ? `₹${c.amountINR}` : '—') },
    { title: 'Counsellor', dataIndex: 'counsellor', key: 'counsellor', width: 130, render: (v) => v || <span style={{ color: 'var(--ux-text-3)' }}>Not set</span> },
  ];

  return (
    <div className="page-container">
      <Header
        title="Consultation calls"
        subtitle="Paid ₹500 one-hour calls: bookings, your calendar and the hours you take calls"
        extra={(
          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={<DownloadOutlined />} onClick={download} disabled={!data?.items?.length}>Download Excel</Button>
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          </div>
        )}
      />

      <Segmented style={{ marginBottom: 12 }} value={tab} onChange={setTab}
        options={[{ label: 'Overview & calls', value: 'overview' }, { label: 'Calendar', value: 'calendar' }, { label: 'My hours', value: 'hours' }]} />

      {tab === 'hours' && <AvailabilityEditor />}
      {tab === 'calendar' && (data ? <ConsultCalendar items={data.items} onOpen={setOpen} /> : <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>)}

      {tab === 'overview' && (!data ? <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <Stat icon={<CalendarOutlined />} label="Today" value={s.today} sub="calls booked for today" color="#1d4ed8" bg="#EFF6FF" />
            <Stat icon={<ClockCircleOutlined />} label="Upcoming" value={s.upcoming} sub="confirmed, not done yet" color="#6D28D9" bg="#F5F3FF" />
            <Stat icon={<PhoneOutlined />} label="Paid bookings" value={s.totalPaid} sub="all time" />
            <Stat icon={<DollarOutlined />} label="Revenue" value={`₹${s.revenueINR.toLocaleString('en-IN')}`} sub="from paid calls" color="#047857" bg="#ECFDF5" />
            <Stat icon={<CheckCircleOutlined />} label="Show-up rate" value={showRate} sub={`${s.completed} completed · ${s.noShow} no-show`} color="#047857" />
            <Stat icon={<UserDeleteOutlined />} label="Didn't pay" value={s.abandoned} sub="picked a slot, left at payment" color="#B45309" bg="#FFFBEB" />
            <Stat icon={<StopOutlined />} label="Cancelled" value={s.cancelled} color="#B91C1C" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 12, marginTop: 12 }} className="consult-charts">
            <div className="page-table-card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Calls per day</div>
              <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginBottom: 8 }}>Paid bookings by call date, last 30 days</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={s.last30.map((d) => ({ ...d, label: dayLabel(d.date) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                  <ChartTip />
                  <Bar dataKey="calls" fill="#DE5C2B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="page-table-card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Popular slots</div>
              <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginBottom: 8 }}>Which times students pick</div>
              {s.bySlot.map((t) => {
                const max = Math.max(1, ...s.bySlot.map((x) => x.count));
                return (
                  <div key={t.time} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0', fontSize: 12.5 }}>
                    <span style={{ width: 64 }}>{to12h(t.time)}</span>
                    <span style={{ flex: 1, height: 8, background: 'var(--ux-surface-2)', borderRadius: 4, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${(t.count / max) * 100}%`, background: '#DE5C2B' }} /></span>
                    <b style={{ width: 24, textAlign: 'right' }}>{t.count}</b>
                  </div>
                );
              })}
              <div style={{ fontWeight: 600, marginTop: 14 }}>By service</div>
              {s.byService.map((x) => (
                <div key={x.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid var(--ux-line-2)' }}>
                  <span>{x.label}</span><b>{x.count}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="page-table-card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <Input.Search allowClear placeholder="Name, email, phone or ref" style={{ width: 260 }} value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
              <Select style={{ width: 170 }} value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                options={[{ value: '', label: 'All paid calls' }, ...Object.entries(STATUS).map(([value, x]) => ({ value, label: x.label }))]} />
              <Select style={{ width: 240 }} value={filters.service} onChange={(v) => setFilters((f) => ({ ...f, service: v }))}
                options={[{ value: '', label: 'All services' }, ...(data.services || []).map((x) => ({ value: x.key, label: x.label }))]} />
            </div>
            <Table rowKey="_id" size="middle" loading={loading} dataSource={data.items} columns={columns}
              pagination={{ pageSize: 25 }} onRow={(c) => ({ onClick: () => setOpen(c), style: { cursor: 'pointer' } })} scroll={{ x: 900 }} />
          </div>
        </>
      ))}

      <Drawer open={!!open} onClose={() => setOpen(null)} width={440} title={open ? `${open.name} · ${open.ref}` : ''}>
        {open && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ fontSize: 14 }}>
              <div><b>{open.serviceLabel}</b></div>
              <div>{dayLabel(open.date)}, {to12h(open.time)} (IST) · {open.durationMin} min</div>
              <div style={{ color: 'var(--ux-text-2)' }}>{open.phone} · {open.email}</div>
              <div style={{ color: 'var(--ux-text-2)' }}>Paid ₹{open.amountINR}{open.payment?.paymentId ? ` · ${open.payment.paymentId}` : ''}</div>
            </div>
            {open.notes && <div style={{ background: 'var(--ux-surface-2)', borderRadius: 10, padding: 10, fontSize: 13 }}><b>Student wrote:</b> {open.notes}</div>}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['confirmed', 'completed', 'no_show', 'cancelled'].map((k) => (
                  <Button key={k} size="small" type={open.status === k ? 'primary' : 'default'} disabled={saving} onClick={() => update(open._id, { status: k })}>{STATUS[k].label}</Button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Counsellor</div>
              <Input defaultValue={open.counsellor} key={`c-${open._id}`} placeholder="Who takes this call" onBlur={(e) => e.target.value !== open.counsellor && update(open._id, { counsellor: e.target.value })} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Team notes</div>
              <Input.TextArea rows={5} defaultValue={open.teamNotes} key={`n-${open._id}`} placeholder="What was discussed, next steps" onBlur={(e) => e.target.value !== open.teamNotes && update(open._id, { teamNotes: e.target.value })} />
            </div>
            <a href={`https://wa.me/${String(open.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><Button block icon={<PhoneOutlined />}>Message on WhatsApp</Button></a>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ConsultationCalls;
