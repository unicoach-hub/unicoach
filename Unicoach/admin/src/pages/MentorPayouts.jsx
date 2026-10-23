import { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Input, Modal, Spin, Table, Tag, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, CheckCircleOutlined, CalendarOutlined, ClockCircleOutlined, BankOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const Stat = ({ icon, label, value, sub, color = '#0F172A', bg = '#F8FAFC' }) => (
  <div style={{ background: bg, border: '1px solid var(--ux-line-2)', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
    <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', color, fontSize: 18 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ux-text-2)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{sub}</div>}
    </div>
  </div>
);

// Every Monday: pay each mentor what is ready (session done + 48h, nothing refunded), by bank transfer,
// then record the UTR here. UniCoach keeps 0%; the mentor gets the payment minus Razorpay's fee.
const MentorPayouts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null); // mentor row
  const [utr, setUtr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await API.get('/admin/unicoach/weekly-payouts');
      setData(d);
    } catch (e) {
      message.error(e.response?.data?.error || 'Could not load payouts');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const ready = (data?.mentors || []).filter((m) => m.ready.length);

  // Bank bulk-transfer sheet: one line per mentor with what to send this Monday
  const downloadSheet = () => {
    const head = ['Mentor', 'Handle', 'Account holder', 'Account number', 'IFSC', 'UPI', 'Amount (INR)', 'Bookings', 'Remark'];
    const rows = ready.map((m) => [m.name, `@${m.handle}`, m.bank.accountHolderName, m.bank.accountNumber, m.bank.ifscCode, m.bank.upiId, m.readyINR.toFixed(2), m.ready.map((b) => b.bookingRef).join(' '), `UniCoach payout ${new Date().toISOString().slice(0, 10)}`]);
    const blob = new Blob(['﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mentor-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const markPaid = async () => {
    if (!utr.trim()) { message.error('Add the bank reference (UTR) of the transfer'); return; }
    setSaving(true);
    try {
      const { data: r } = await API.post(`/admin/unicoach/weekly-payouts/${paying.mentorId}/paid`, { transactionRef: utr.trim(), bookingIds: paying.ready.map((b) => b._id) });
      message.success(`${inr(r.payout.amountINR)} recorded for ${paying.name}. They have been emailed.`);
      setPaying(null);
      setUtr('');
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Could not record the payout');
    } finally {
      setSaving(false);
    }
  };

  const bankLine = (b) => (b.accountNumber ? `${b.accountHolderName || ''} · ${b.accountNumber} · ${b.ifscCode || ''}` : b.upiId ? `UPI: ${b.upiId}` : null);

  const columns = [
    { title: 'Mentor', key: 'm', render: (_, m) => <div><b>{m.name}</b><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>@{m.handle}</div></div> },
    {
      title: 'Bank', key: 'bank', render: (_, m) => bankLine(m.bank)
        ? <span style={{ fontSize: 12.5 }}>{bankLine(m.bank)}</span>
        : <Tag color="red">No bank details</Tag>,
    },
    { title: 'Ready now', key: 'ready', align: 'right', render: (_, m) => <div><b style={{ color: '#047857' }}>{inr(m.readyINR)}</b><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{m.ready.length} booking{m.ready.length === 1 ? '' : 's'}</div></div> },
    { title: 'Upcoming', key: 'up', align: 'right', render: (_, m) => <div>{inr(m.upcomingINR)}<div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{m.upcoming.length} not done yet</div></div> },
    {
      title: '', key: 'act', align: 'right', width: 150,
      render: (_, m) => <Button type="primary" disabled={!m.ready.length || !bankLine(m.bank)} onClick={() => setPaying(m)}>Mark paid</Button>,
    },
  ];

  const bookingCols = [
    { title: 'Booking', dataIndex: 'bookingRef', key: 'r' },
    { title: 'Service', dataIndex: 'service', key: 's' },
    { title: 'Student', dataIndex: 'studentName', key: 'st' },
    { title: 'Date', key: 'd', render: (_, b) => day(b.when) },
    { title: 'Student paid', key: 'p', align: 'right', render: (_, b) => inr(b.paidINR) },
    { title: 'Mentor gets', key: 'n', align: 'right', render: (_, b) => <span>{inr(b.netINR)}{b.estimated && <Tag style={{ marginLeft: 6 }}>fee estimated</Tag>}</span> },
  ];

  return (
    <div className="page-container">
      <Header
        title="Mentor payouts"
        subtitle="Every Monday: pay mentors for completed bookings by bank transfer, then record it here"
        extra={(
          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={<DownloadOutlined />} disabled={!ready.length} onClick={downloadSheet}>Bank transfer sheet</Button>
            <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          </div>
        )}
      />

      {!data ? <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <Stat icon={<CalendarOutlined />} label="Next payout" value={day(data.nextPayoutDate)} sub="Every Monday" color="#1d4ed8" bg="#EFF6FF" />
            <Stat icon={<CheckCircleOutlined />} label="Ready to pay" value={inr(data.totals.readyINR)} sub={`${data.totals.mentorsToPay} mentor${data.totals.mentorsToPay === 1 ? '' : 's'}`} color="#047857" bg="#ECFDF5" />
            <Stat icon={<ClockCircleOutlined />} label="Upcoming" value={inr(data.totals.upcomingINR)} sub={`Sessions not done or within ${data.complaintWindowHours}h complaint window`} color="#B45309" bg="#FFFBEB" />
            <Stat icon={<BankOutlined />} label="UniCoach commission" value="0%" sub="Mentor gets payment minus Razorpay fee" />
          </div>

          <div className="page-table-card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 600, margin: '4px 4px 10px' }}>This week</div>
            {(data.mentors || []).length === 0 ? <Empty description="Nothing to pay yet" /> : (
              <Table rowKey="mentorId" dataSource={data.mentors} columns={columns} pagination={false}
                expandable={{
                  expandedRowRender: (m) => (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {m.ready.length > 0 && <><b style={{ color: '#047857' }}>Ready</b><Table size="small" rowKey="_id" dataSource={m.ready} columns={bookingCols} pagination={false} /></>}
                      {m.upcoming.length > 0 && <><b style={{ color: '#B45309' }}>Upcoming</b><Table size="small" rowKey="_id" dataSource={m.upcoming} columns={bookingCols} pagination={false} /></>}
                    </div>
                  ),
                }}
              />
            )}
          </div>

          <div className="page-table-card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 600, margin: '4px 4px 10px' }}>Payout history</div>
            <Table size="small" rowKey="_id" dataSource={data.history} pagination={{ pageSize: 20 }}
              locale={{ emptyText: 'No payouts recorded yet' }}
              columns={[
                { title: 'Paid on', key: 'd', render: (_, p) => day(p.processedAt || p.createdAt) },
                { title: 'Mentor', key: 'm', render: (_, p) => p.mentorId?.name || '—' },
                { title: 'Amount', key: 'a', align: 'right', render: (_, p) => inr(p.amountINR) },
                { title: 'Bookings', key: 'b', render: (_, p) => (p.bookingIds || []).length },
                { title: 'UTR', dataIndex: 'transactionRef', key: 'u' },
                { title: 'Ref', dataIndex: 'payoutRef', key: 'r' },
              ]}
            />
          </div>
        </>
      )}

      <Modal open={!!paying} title={paying ? `Record payout to ${paying.name}` : ''} okText="Mark paid" confirmLoading={saving}
        onOk={markPaid} onCancel={() => { setPaying(null); setUtr(''); }}>
        {paying && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ background: 'var(--ux-surface-2)', borderRadius: 12, padding: 12, fontSize: 13.5 }}>
              <div>Send <b>{inr(paying.readyINR)}</b> for {paying.ready.length} booking{paying.ready.length === 1 ? '' : 's'} to:</div>
              <div style={{ marginTop: 4 }}><b>{bankLine(paying.bank)}</b></div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Make the transfer from your bank first, then paste its reference here. The mentor gets an email and sees it under Earnings.</div>
            <Input placeholder="Bank reference / UTR" value={utr} onChange={(e) => setUtr(e.target.value)} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MentorPayouts;
