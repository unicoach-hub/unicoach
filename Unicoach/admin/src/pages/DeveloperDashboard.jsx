import React, { useEffect, useState } from 'react';
import { Segmented, Table, Progress, Tag, Spin, Alert, Button, Tooltip as AntTooltip } from 'antd';
import { ReloadOutlined, CloudServerOutlined, ApiOutlined, DatabaseOutlined, UserAddOutlined, LinkOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Header from '../components/Header';
import API from '../api/axios';

// Developer Dashboard (owner only): server, API traffic, outside services, database, sign-ups, Coolify
const REFRESH_MS = 30000;

const fmtUptime = (s) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
};
const n = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('en-IN'));
const pctColor = (p) => (p >= 85 ? '#dc2626' : p >= 65 ? '#d97706' : '#16a34a');

const Card = ({ title, icon, children, extra }) => (
  <div className="nx-card" style={{ padding: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--ux-ink)' }}>{icon}{title}</div>
      {extra}
    </div>
    {children}
  </div>
);

const Metric = ({ label, value, sub, color }) => (
  <div>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--ux-ink)', lineHeight: 1.2 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>{label}{sub && <span style={{ color: 'var(--ux-text-3)' }}> · {sub}</span>}</div>
  </div>
);

const Gauge = ({ label, percent, detail }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
      <span style={{ color: 'var(--ux-text-2)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{detail}</span>
    </div>
    <Progress percent={Math.min(100, Math.round(percent || 0))} showInfo={false} strokeColor={pctColor(percent || 0)} size="small" />
  </div>
);

const DeveloperDashboard = () => {
  const [range, setRange] = useState('24h');
  const [overview, setOverview] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [services, setServices] = useState(null);
  const [dbCols, setDbCols] = useState(null);
  const [coolify, setCoolify] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('endpoints');

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [o, t, s, d, c] = await Promise.all([
        API.get('/admin/dev/overview'),
        API.get('/admin/dev/traffic', { params: { range } }),
        API.get('/admin/dev/services', { params: { range } }),
        API.get('/admin/dev/database'),
        API.get('/admin/dev/coolify'),
      ]);
      setOverview(o.data);
      setTraffic(t.data);
      setServices(s.data);
      setDbCols(d.data);
      setCoolify(c.data);
      setError('');
    } catch (err) {
      setError(err.response?.status === 403 ? 'Only the account owner can open the Developer Dashboard.' : 'Could not load the dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(t);
  }, [range]);

  if (error) return <div><Header title="Developer" /><div className="dashboard-content"><Alert type="error" message={error} /></div></div>;
  if (!overview) return <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>;

  const s = overview.server;
  const mem = s.container?.limitMb
    ? { used: s.container.usedMb, total: s.container.limitMb, label: 'Memory (backend container)' }
    : { used: s.hostMemMb.total - s.hostMemMb.available, total: s.hostMemMb.total, label: 'Memory (server)', exact: s.hostMemMb.exact };
  const isLaptop = s.platform === 'darwin' || s.platform === 'win32';
  const series = (traffic?.series || []).map((p) => ({
    ...p,
    label: traffic.bucket === 'hour'
      ? new Date(p.t).toLocaleTimeString('en-IN', { hour: 'numeric' })
      : new Date(p.t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));
  const endpoints = traffic?.endpoints || [];
  const endpointRows = view === 'slow'
    ? [...endpoints].sort((a, b) => b.avgMs - a.avgMs).slice(0, 30)
    : view === 'errors'
      ? endpoints.filter((e) => e.errors || e.clientErrors).sort((a, b) => b.errors - a.errors || b.clientErrors - a.clientErrors)
      : endpoints.slice(0, 50);
  const totalReq = endpoints.reduce((a, e) => a + e.count, 0);
  const totalErr = endpoints.reduce((a, e) => a + e.errors, 0);

  return (
    <div>
      <Header
        title="Developer"
        subtitle="Server health, API traffic, database and outside services, refreshed every 30 seconds"
        extra={<Button icon={<ReloadOutlined />} loading={loading} onClick={() => load()}>Refresh</Button>}
      />
      <div className="dashboard-content" style={{ display: 'grid', gap: 14 }}>
        {/* Top numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <div className="nx-card" style={{ padding: 14 }}><Metric label="API requests (24h)" value={n(overview.traffic24h.requests)} sub={`${overview.traffic24h.avgMs} ms avg`} /></div>
          <div className="nx-card" style={{ padding: 14 }}><Metric label="Server errors (24h)" value={n(overview.traffic24h.errors)} color={overview.traffic24h.errors ? '#dc2626' : '#16a34a'} /></div>
          <div className="nx-card" style={{ padding: 14 }}><Metric label="Backend up for" value={fmtUptime(s.uptimeSec)} sub={s.env} /></div>
          <div className="nx-card" style={{ padding: 14 }}><Metric label="Database" value={`${n(overview.database.storageMb)} MB`} sub={`${n(overview.database.objects)} records`} color={overview.database.connected ? undefined : '#dc2626'} /></div>
          <div className="nx-card" style={{ padding: 14 }}><Metric label="New users (7 days)" value={n(overview.signups.users.week)} sub={`${n(overview.signups.users.day)} today`} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 14 }}>
          {/* Traffic chart */}
          <Card title="API traffic" icon={<ApiOutlined />} extra={<Segmented size="small" value={range} onChange={setRange} options={[{ value: '24h', label: '24 hours' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]} />}>
            {series.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ux-text-3)' }}>No traffic recorded yet. Numbers start appearing a minute after the live backend gets requests.</div>
            ) : (
              <div style={{ height: 240 }}>
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ left: -10, right: 8, top: 6 }}>
                    <defs>
                      <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DE5C2B" stopOpacity={0.35} /><stop offset="100%" stopColor="#DE5C2B" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" name="Requests" stroke="#DE5C2B" fill="url(#reqFill)" strokeWidth={2} />
                    <Area type="monotone" dataKey="errors" name="Server errors" stroke="#dc2626" fill="#dc262622" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginTop: 6 }}>{n(totalReq)} requests · {n(totalErr)} server errors in this period</div>
          </Card>

          {/* Server */}
          <Card title="Server" icon={<CloudServerOutlined />}>
            <div style={{ display: 'grid', gap: 12 }}>
              {isLaptop && <Alert type="info" showIcon style={{ padding: '6px 10px' }} message="These are your computer's numbers (local backend). Open the live admin to see the VPS." />}
              {mem.exact === false
                ? <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>Memory: {n(mem.total)} MB total (this system doesn't report free memory reliably)</div>
                : <Gauge label={mem.label} percent={(mem.used / mem.total) * 100} detail={`${n(mem.used)} / ${n(mem.total)} MB`} />}
              <Gauge label="CPU (backend)" percent={s.cpuPercent} detail={`${s.cpuPercent}%`} />
              <Gauge label="Load" percent={(s.loadAvg[0] / s.cpus) * 100} detail={`${s.loadAvg.join(' / ')} on ${s.cpus} cores`} />
              {s.disk && <Gauge label="Disk" percent={s.disk.percent} detail={`${s.disk.usedGb} / ${s.disk.totalGb} GB`} />}
              <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>Backend process {s.processMemMb} MB · Node {s.node} · {s.host}</div>
            </div>
          </Card>
        </div>

        {/* Endpoints */}
        <Card title="API endpoints" icon={<ApiOutlined />} extra={<Segmented size="small" value={view} onChange={setView} options={[{ value: 'endpoints', label: 'Most used' }, { value: 'slow', label: 'Slowest' }, { value: 'errors', label: 'Errors' }]} />}>
          <Table
            size="small"
            rowKey="key"
            dataSource={endpointRows}
            pagination={{ pageSize: 12, hideOnSinglePage: true }}
            locale={{ emptyText: 'Nothing yet' }}
            columns={[
              { title: 'Endpoint', dataIndex: 'key', render: (k) => <code style={{ fontSize: 12 }}>{k}</code> },
              { title: 'Requests', dataIndex: 'count', align: 'right', render: n },
              { title: 'Avg', dataIndex: 'avgMs', align: 'right', render: (v) => <span style={{ color: v > 1000 ? '#dc2626' : v > 400 ? '#d97706' : undefined }}>{v} ms</span> },
              { title: 'Slowest', dataIndex: 'maxMs', align: 'right', render: (v) => `${v} ms` },
              { title: '4xx', dataIndex: 'clientErrors', align: 'right', render: n },
              { title: '5xx', dataIndex: 'errors', align: 'right', render: (v) => <span style={{ color: v ? '#dc2626' : undefined, fontWeight: v ? 700 : 400 }}>{n(v)}</span> },
            ]}
          />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
          {/* Outside services */}
          <Card title="Outside services (calls from our backend)" icon={<LinkOutlined />}>
            <Table
              size="small"
              rowKey="name"
              pagination={false}
              dataSource={services?.services || []}
              locale={{ emptyText: 'No outside calls recorded yet' }}
              columns={[
                { title: 'Service', dataIndex: 'name', render: (v, r) => <AntTooltip title={r.hosts.join(', ')}>{v}</AntTooltip> },
                { title: 'Calls', dataIndex: 'count', align: 'right', render: n },
                { title: 'Failed', key: 'f', align: 'right', render: (_, r) => <span style={{ color: r.errors + r.clientErrors ? '#dc2626' : undefined }}>{n(r.errors + r.clientErrors)}</span> },
                { title: 'Avg', dataIndex: 'avgMs', align: 'right', render: (v) => `${v} ms` },
              ]}
            />
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(services?.configured || {}).map(([k, on]) => <Tag key={k} color={on ? 'green' : 'default'}>{k}: {on ? 'key set' : 'no key'}</Tag>)}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginTop: 6 }}>Bills and quotas are on each provider's own dashboard.</div>
          </Card>

          {/* Sign-ups */}
          <Card title="Sign-ups" icon={<UserAddOutlined />}>
            <Table
              size="small"
              pagination={false}
              rowKey="k"
              dataSource={[
                { k: 'Student accounts', ...overview.signups.users },
                { k: 'Leads', ...overview.signups.leads },
                { k: 'Mentor applications', ...overview.signups.mentorApplications },
                { k: 'Mentor bookings', ...overview.signups.bookings },
              ]}
              columns={[
                { title: '', dataIndex: 'k' },
                { title: 'Today', dataIndex: 'day', align: 'right', render: n },
                { title: '7 days', dataIndex: 'week', align: 'right', render: n },
                { title: '30 days', dataIndex: 'month', align: 'right', render: n },
              ]}
            />
          </Card>
        </div>

        {/* Coolify */}
        <Card title="Hosting (Coolify)" icon={<CloudServerOutlined />}>
          {!coolify?.configured ? (
            <Alert type="info" showIcon message="Not connected yet" description={<span>Add <code>COOLIFY_URL</code> and a read-only <code>COOLIFY_API_TOKEN</code> to the backend's environment variables in Coolify, then redeploy. Apps, databases and backups will show here.</span>} />
          ) : coolify.error ? (
            <Alert type="warning" showIcon message={coolify.error} />
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {coolify.servers.map((sv) => <Tag key={sv.name} color={sv.reachable ? 'green' : 'red'}>Server {sv.name}: {sv.reachable ? 'reachable' : 'unreachable'}</Tag>)}
              </div>
              <Table size="small" rowKey="name" pagination={false} dataSource={[...coolify.apps.map((a) => ({ ...a, kind: 'App' })), ...coolify.databases.map((d) => ({ ...d, kind: d.type || 'Database' }))]}
                columns={[
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'Type', dataIndex: 'kind' },
                  { title: 'Status', dataIndex: 'status', render: (v) => <Tag color={/running|healthy/i.test(v || '') ? 'green' : /exited|stopped|unhealthy/i.test(v || '') ? 'red' : 'default'}>{v || '—'}</Tag> },
                  { title: 'Public', dataIndex: 'public', render: (v, r) => (r.kind === 'App' ? '—' : v ? <Tag color="red">public</Tag> : <Tag color="green">private</Tag>) },
                ]}
              />
              <div style={{ fontWeight: 600, fontSize: 13 }}>Backups</div>
              {coolify.backups.length === 0 ? <Alert type="warning" showIcon message="No database backups scheduled in Coolify" /> : (
                <Table size="small" rowKey={(r) => `${r.database}-${r.frequency}`} pagination={false} dataSource={coolify.backups}
                  columns={[
                    { title: 'Database', dataIndex: 'database' },
                    { title: 'Schedule', dataIndex: 'frequency' },
                    { title: 'Last run', dataIndex: 'lastAt', render: (v) => (v ? new Date(v).toLocaleString('en-IN') : 'never') },
                    { title: 'Result', dataIndex: 'lastStatus', render: (v) => <Tag color={v === 'success' ? 'green' : v ? 'red' : 'default'}>{v || '—'}</Tag> },
                  ]}
                />
              )}
            </div>
          )}
        </Card>

        {/* Database */}
        <Card title={`Database "${overview.database.name || ''}": ${overview.database.collections || 0} collections`} icon={<DatabaseOutlined />}
          extra={<span style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>data {n(overview.database.dataMb)} MB · on disk {n(overview.database.storageMb)} MB · indexes {n(overview.database.indexMb)} MB</span>}>
          <Table
            size="small"
            rowKey="name"
            dataSource={dbCols || []}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            columns={[
              { title: 'Collection', dataIndex: 'name', render: (v) => <code style={{ fontSize: 12 }}>{v}</code> },
              { title: 'Records', dataIndex: 'count', align: 'right', render: n },
              { title: 'Data', dataIndex: 'sizeMb', align: 'right', render: (v) => (v !== undefined ? `${v} MB` : '—') },
              { title: 'On disk', dataIndex: 'storageMb', align: 'right', render: (v) => (v !== undefined ? `${v} MB` : '—') },
              { title: 'Indexes', dataIndex: 'indexMb', align: 'right', render: (v, r) => (v !== undefined ? `${v} MB (${r.indexes})` : '—') },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
