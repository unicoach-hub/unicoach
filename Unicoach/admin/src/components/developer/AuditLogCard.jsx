import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Button, Alert, Select } from 'antd';
import { ReloadOutlined, SearchOutlined, FileProtectOutlined } from '@ant-design/icons';
import API from '../../api/axios';

// Admin → Developer → Admin action log (owner only): who did what in the panel.
// Backend: middleware/adminAudit.js writes it, controllers/auditController.js reads it.

const when = (d) => (d
  ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
  : '—');

// Plain-English names for the actions we record
const ACTION_LABELS = {
  'unicoach.booking.refund': 'Refund',
  'unicoach.booking.retryTransfer': 'Retry transfer',
  'unicoach.payout.process': 'Payout processed',
  'unicoach.weeklyPayout.paid': 'Payout marked paid',
  'unicoach.mentor.routeAccount': 'Payout account',
  'unicoach.mentor.delete': 'Mentor deleted',
  'unicoach.mentor.application': 'Application changed',
  'unicoach.mentor.status': 'Mentor on/off',
  'unicoach.mentor.verify': 'Verified badge',
  'unicoach.review.delete': 'Review deleted',
  'staff.create': 'Staff added',
  'staff.update': 'Staff changed',
  'staff.delete': 'Staff removed',
  'admin.profile.update': 'Admin profile',
  'settings.update': 'Settings changed',
  'lead.delete': 'Lead deleted',
  'user.delete': 'User deleted',
  'student.delete': 'Student deleted',
  'backup.run': 'Backup started',
  'backup.download': 'Backup downloaded',
};

// Money and access actions are the ones worth spotting at a glance
const MONEY = new Set([
  'unicoach.booking.refund', 'unicoach.booking.retryTransfer', 'unicoach.payout.process',
  'unicoach.weeklyPayout.paid', 'unicoach.mentor.routeAccount',
]);
const ACCESS = new Set(['staff.create', 'staff.update', 'staff.delete', 'admin.profile.update', 'settings.update']);

const AuditLogCard = ({ Card }) => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actor, setActor] = useState('');
  const [action, setAction] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = (opts = {}) => {
    setLoading(true);
    const params = { page: opts.page ?? page, limit: 20, actor: opts.actor ?? actor, action: opts.action ?? action };
    API.get('/admin/dev/audit', { params })
      .then((r) => {
        setRows(Array.isArray(r.data?.entries) ? r.data.entries : []);
        setTotal(r.data?.total || 0);
        setError('');
      })
      .catch(() => setError('Could not load the action log'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load({ page: 1 }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    {
      title: 'When', dataIndex: 'createdAt', width: 150,
      render: (d) => <span style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{when(d)}</span>,
    },
    {
      title: 'Who', key: 'who', width: 180,
      render: (_, r) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.actorName || r.actorEmail || 'Unknown'}</div>
          <Tag color={r.actorRole === 'admin' ? 'gold' : 'default'} style={{ marginTop: 2, fontSize: 11 }}>
            {r.actorRole === 'admin' ? 'Owner' : 'Staff'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Action', dataIndex: 'action', width: 170,
      render: (a) => (
        <Tag color={MONEY.has(a) ? 'red' : ACCESS.has(a) ? 'purple' : 'blue'} style={{ fontSize: 11.5 }}>
          {ACTION_LABELS[a] || a}
        </Tag>
      ),
    },
    {
      title: 'What happened', dataIndex: 'summary',
      render: (t, r) => (
        <span style={{ fontSize: 12.5 }}>
          {t || r.path}
          {!r.ok && <Tag color="red" style={{ marginLeft: 6, fontSize: 11 }}>failed ({r.statusCode})</Tag>}
        </span>
      ),
    },
  ];

  return (
    <Card
      title="Admin action log"
      icon={<FileProtectOutlined />}
      extra={<Button icon={<ReloadOutlined />} loading={loading} onClick={() => load()}>Refresh</Button>}
    >
      <p style={{ fontSize: 12.5, color: 'var(--ux-text-2)', margin: '0 0 12px' }}>
        Who refunded, deleted or approved what. Reads are not recorded, and the log is kept for a year.
      </p>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by person"
          value={actor}
          allowClear
          onChange={(e) => setActor(e.target.value)}
          onPressEnter={() => { setPage(1); load({ page: 1 }); }}
          style={{ maxWidth: 240 }}
        />
        <Select
          placeholder="All actions"
          value={action}
          allowClear
          style={{ minWidth: 220 }}
          onChange={(v) => { setAction(v); setPage(1); load({ page: 1, action: v }); }}
          options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Button onClick={() => { setPage(1); load({ page: 1 }); }}>Search</Button>
      </div>

      <Table
        rowKey="_id"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={loading}
        locale={{ emptyText: 'Nothing recorded yet.' }}
        pagination={{
          current: page,
          pageSize: 20,
          total,
          showSizeChanger: false,
          onChange: (p) => { setPage(p); load({ page: p }); },
        }}
        scroll={{ x: 760 }}
      />
    </Card>
  );
};

export default AuditLogCard;
