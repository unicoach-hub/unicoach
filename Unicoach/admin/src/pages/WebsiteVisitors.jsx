import React, { useEffect, useMemo, useState } from 'react';
import { Segmented, Table, Tag, Spin, Alert, Button, Input, Drawer, Empty, Tooltip } from 'antd';
import {
  ReloadOutlined, UserOutlined, BugOutlined, FileTextOutlined, AimOutlined, MobileOutlined, DesktopOutlined,
  TabletOutlined, LinkOutlined, ArrowLeftOutlined, CheckCircleFilled, WarningFilled, EnvironmentOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import API from '../api/axios';

// Admin → Developer → Visitors (owner only): anonymous website visitors from the site's tracker
// (frontend/src/utils/visitorTracking.js → backend/controllers/visitorController.js)

const n = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('en-IN'));
const dur = (sec) => {
  if (!sec) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : m ? `${m}m ${s}s` : `${s}s`;
};
const ago = (d) => {
  if (!d) return '—';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};
const when = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');
const DeviceIcon = ({ d }) => (d === 'mobile' ? <MobileOutlined /> : d === 'tablet' ? <TabletOutlined /> : <DesktopOutlined />);

const Card = ({ title, icon, children, extra }) => (
  <div className="nx-card" style={{ padding: 16, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--ux-ink)' }}>{icon}{title}</div>
      {extra}
    </div>
    {children}
  </div>
);

const Metric = ({ label, value, sub, color, hint }) => (
  <div className="nx-card" style={{ padding: 14 }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || 'var(--ux-ink)', lineHeight: 1.2 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
      {hint ? <Tooltip title={hint}><span style={{ borderBottom: '1px dotted currentColor' }}>{label}</span></Tooltip> : label}
      {sub && <span style={{ color: 'var(--ux-text-3)' }}> · {sub}</span>}
    </div>
  </div>
);

const ISSUE_LABELS = { err: 'JavaScript error', api: 'API failed', rage: 'Rage clicks', fa: 'Form left half-filled' };
const ISSUE_COLORS = { err: 'red', api: 'volcano', rage: 'orange', fa: 'gold' };

const IssueTags = ({ issues = {} }) => (
  <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
    {issues.formAbandons > 0 && <Tag color="gold" style={{ margin: 0 }}>{issues.formAbandons} form left</Tag>}
    {issues.errors > 0 && <Tag color="red" style={{ margin: 0 }}>{issues.errors} error</Tag>}
    {issues.apiFails > 0 && <Tag color="volcano" style={{ margin: 0 }}>{issues.apiFails} API fail</Tag>}
    {issues.rageClicks > 0 && <Tag color="orange" style={{ margin: 0 }}>{issues.rageClicks} rage click</Tag>}
  </span>
);

const visitorName = (v) => v.leadName || `Visitor ${v._id.slice(0, 6).toUpperCase()}`;
const place = (v) => [v.city, v.region, v.country && v.country !== 'IN' ? v.country : ''].filter(Boolean).join(', ') || 'Unknown city';

/* ───────────── one visitor's timeline ───────────── */

const EVENT_LOOK = {
  pv: { color: '#64748b', text: (e) => <><b>Viewed</b> <code>{e.path}</code>{e.title ? <span style={{ color: 'var(--ux-text-3)' }}> · {e.title}</span> : null}</> },
  cv: { color: '#16a34a', text: (e) => <><b style={{ color: '#16a34a' }}>Filled a form:</b> {e.detail} on <code>{e.path}</code></> },
  fs: { color: '#2563eb', text: (e) => <>Started typing in <b>{e.detail}</b></> },
  fa: { color: '#d97706', text: (e) => <><b style={{ color: '#d97706' }}>Left a form half-filled:</b> {e.detail}</> },
  err: { color: '#dc2626', text: (e) => <><b style={{ color: '#dc2626' }}>Error:</b> {e.detail}</> },
  api: { color: '#dc2626', text: (e) => <><b style={{ color: '#dc2626' }}>API failed:</b> {e.detail}</> },
  rage: { color: '#ea580c', text: (e) => <><b style={{ color: '#ea580c' }}>Rage clicks</b> on {e.detail}</> },
};

const VisitorDrawer = ({ id, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    setData(null);
    setError('');
    API.get(`/admin/dev/visitors/${id}`).then((r) => setData(r.data), () => setError('Could not load this visitor'));
  }, [id]);

  // Oldest visit first, newest event last inside each visit
  const sessions = useMemo(() => {
    if (!data) return [];
    const map = new Map();
    [...data.events].reverse().forEach((e) => {
      const k = e.sessionId || 'unknown';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    });
    return [...map.values()].reverse();
  }, [data]);

  const v = data?.visitor;
  return (
    <Drawer open={Boolean(id)} onClose={onClose} width={620} title={v ? visitorName(v) : 'Visitor'} destroyOnHidden>
      {error && <Alert type="error" message={error} />}
      {!data && !error && <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>}
      {v && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            <div><div style={{ fontWeight: 800, fontSize: 18 }}>{n(v.sessions)}</div><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>visits</div></div>
            <div><div style={{ fontWeight: 800, fontSize: 18 }}>{n(v.pageviews)}</div><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>pages viewed</div></div>
            <div><div style={{ fontWeight: 800, fontSize: 18 }}>{dur(v.timeSec)}</div><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>time on site</div></div>
            <div><div style={{ fontWeight: 800, fontSize: 18 }}>{ago(v.firstSeen)}</div><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>first visit</div></div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ux-text-2)', display: 'grid', gap: 4 }}>
            <div><EnvironmentOutlined /> {place(v)} · <DeviceIcon d={v.device} /> {v.device} · {v.os} · {v.browser}{v.screen ? ` · ${v.screen}px` : ''}</div>
            <div><LinkOutlined /> First came from <b>{v.firstSource || 'direct'}</b> on <code>{v.landingPage}</code>{v.lastSource && v.lastSource !== v.firstSource ? <> · last time from <b>{v.lastSource}</b></> : null}</div>
            {v.converted
              ? <div style={{ color: '#16a34a' }}><CheckCircleFilled /> Filled a form ({v.lastConversion}) {v.convertedAt ? ago(v.convertedAt) : ''}{v.leadId ? <> · <Link to={`/leads?lead=${v.leadId}`}>Open in Leads</Link></> : null}</div>
              : <div style={{ color: '#d97706' }}><WarningFilled /> Has not filled any form yet</div>}
          </div>
          {sessions.length === 0 ? <Empty description="No activity recorded" /> : sessions.map((evs, i) => (
            <div key={evs[0]._id} className="nx-card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                Visit {sessions.length - i} · {when(evs[0].at)}
                <span style={{ fontWeight: 400, color: 'var(--ux-text-3)' }}> · {evs.filter((e) => e.type === 'pv').length} pages · {dur(evs.reduce((a, e) => a + (e.durationSec || 0), 0))}</span>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {evs.map((e) => {
                  const look = EVENT_LOOK[e.type] || EVENT_LOOK.pv;
                  return (
                    <div key={e._id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 8, fontSize: 12.5, alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--ux-text-3)' }}>{new Date(e.at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                      <span style={{ borderLeft: `3px solid ${look.color}`, paddingLeft: 8, wordBreak: 'break-word' }}>{look.text(e)}</span>
                      <span style={{ color: 'var(--ux-text-3)', whiteSpace: 'nowrap' }}>{e.type === 'pv' && e.durationSec ? `${dur(e.durationSec)}${e.scroll != null ? ` · ${e.scroll}%` : ''}` : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

/* ───────────── page ───────────── */

const VIEW_OPTIONS = [
  { value: 'returning', label: 'Came back, no form' },
  { value: 'issues', label: 'Had a problem' },
  { value: 'converted', label: 'Filled a form' },
  { value: 'all', label: 'Everyone' },
];

const WebsiteVisitors = () => {
  const [days, setDays] = useState(30);
  const [view, setView] = useState('returning');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [pageView, setPageView] = useState('pages');

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        API.get('/admin/dev/visitors/summary', { params: { days } }),
        API.get('/admin/dev/visitors', { params: { view, days, page, q: search } }),
      ]);
      setSummary(s.data);
      setList(l.data);
      setError('');
    } catch (err) {
      setError(err.response?.status === 403 ? 'Only the account owner can see website visitors.' : 'Could not load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days, view, page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div><Header title="Website visitors" /><div className="dashboard-content"><Alert type="error" message={error} /></div></div>;
  if (!summary || !list) return <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>;

  const t = summary.totals;
  const columns = [
    {
      title: 'Visitor',
      key: 'who',
      render: (_, v) => (
        <div style={{ minWidth: 170 }}>
          <div style={{ fontWeight: 700 }}>{v.converted ? <CheckCircleFilled style={{ color: '#16a34a', marginRight: 6 }} /> : null}{visitorName(v)}</div>
          <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}><DeviceIcon d={v.device} /> {place(v)} · {v.os} · {v.browser}</div>
        </div>
      ),
    },
    { title: 'Visits', dataIndex: 'sessions', align: 'right', width: 70, render: (x) => <b>{n(x)}</b> },
    { title: 'Pages', dataIndex: 'pageviews', align: 'right', width: 70, render: n },
    { title: 'Time', dataIndex: 'timeSec', align: 'right', width: 90, render: (x) => <span style={{ whiteSpace: 'nowrap' }}>{dur(x)}</span> },
    {
      title: 'Came from',
      key: 'src',
      render: (_, v) => (
        <div style={{ fontSize: 12.5, maxWidth: 200 }}>
          <div>{v.firstSource || 'direct'}</div>
          {v.lastSource && v.lastSource !== v.firstSource && <div style={{ color: 'var(--ux-text-3)' }}>last: {v.lastSource}</div>}
        </div>
      ),
    },
    { title: 'Last page', dataIndex: 'lastPage', render: (p) => <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{p}</code> },
    { title: 'Problems', key: 'issues', render: (_, v) => <IssueTags issues={v.issues} /> },
    { title: 'Last seen', dataIndex: 'lastSeen', width: 110, render: ago },
  ];

  const pageColumns = [
    { title: 'Page', dataIndex: 'path', render: (p) => <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{p}</code> },
    { title: 'Views', dataIndex: 'views', align: 'right', width: 80, render: n },
    { title: 'People', dataIndex: 'visitors', align: 'right', width: 80, render: n },
    { title: 'Avg time', dataIndex: 'avgSec', align: 'right', width: 90, render: dur },
    { title: 'Scrolled', dataIndex: 'avgScroll', align: 'right', width: 90, render: (x) => (x == null ? '—' : `${x}%`) },
    {
      title: <Tooltip title="Of the people who saw this page, how many filled a form (on any page)">Filled a form</Tooltip>,
      key: 'conv', align: 'right', width: 120,
      render: (_, r) => <span style={{ fontWeight: 700, color: r.converted ? '#16a34a' : 'var(--ux-text-3)' }}>{pct(r.converted, r.visitors)}</span>,
    },
  ];
  const exitColumns = [
    { title: 'Page people left from', dataIndex: 'path', render: (p) => <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{p}</code> },
    { title: 'Visits ended here', dataIndex: 'exits', align: 'right', width: 140, render: n },
    { title: <Tooltip title="Visits that saw only this one page">Left after 1 page</Tooltip>, dataIndex: 'bounces', align: 'right', width: 140, render: n },
  ];
  const issueColumns = [
    { title: 'Problem', dataIndex: 'type', width: 170, render: (x) => <Tag color={ISSUE_COLORS[x]}>{ISSUE_LABELS[x] || x}</Tag> },
    { title: 'Where', dataIndex: 'path', render: (p) => <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{p}</code> },
    { title: 'Details', dataIndex: 'detail', render: (d) => <span style={{ fontSize: 12.5, wordBreak: 'break-word' }}>{d}</span> },
    { title: 'Times', dataIndex: 'count', align: 'right', width: 70, render: n },
    { title: 'People', dataIndex: 'visitors', align: 'right', width: 70, render: n },
    { title: 'Last', dataIndex: 'lastAt', width: 110, render: ago },
  ];

  const Breakdown = ({ title, rows, label = (x) => x || 'Unknown' }) => (
    <Card title={title}>
      {rows.length === 0 ? <div style={{ color: 'var(--ux-text-3)', fontSize: 13 }}>No data yet</div> : (
        <div style={{ display: 'grid', gap: 6 }}>
          {rows.map((r) => (
            <div key={r._id || 'none'} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label(r._id)}</span>
              <span style={{ whiteSpace: 'nowrap' }}><b>{n(r.visitors)}</b> <span style={{ color: r.converted ? '#16a34a' : 'var(--ux-text-3)' }}>· {pct(r.converted, r.visitors)} form</span></span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <Header
        title="Website visitors"
        subtitle="Anonymous people on unicoach.com: who keeps coming back, what they read, where they get stuck. Names appear only after someone fills a form."
        extra={(
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Segmented value={days} onChange={(d) => { setDays(d); setPage(1); }} options={[{ value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }]} />
            <Link to="/developer"><Button icon={<ArrowLeftOutlined />}>Developer</Button></Link>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>Refresh</Button>
          </div>
        )}
      />
      <div className="dashboard-content" style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <Metric label="Visitors" value={n(t.visitors)} sub={`${n(t.pageviews)} pages viewed`} />
          <Metric label="Came back, no form" value={n(t.returningNoForm)} color="#DE5C2B" hint="Visited 2 or more times and never filled a form: the people to retarget" />
          <Metric label="Filled a form" value={n(t.converted)} sub={pct(t.converted, t.visitors)} color="#16a34a" />
          <Metric label="Left a form half-filled" value={n(t.formAbandons)} color={t.formAbandons ? '#d97706' : undefined} hint="Typed into a form and left without sending it" />
          <Metric label="Had a problem" value={n(t.withIssues)} color={t.withIssues ? '#dc2626' : undefined} hint="Saw a JavaScript error, a failed API call, or clicked something again and again" />
        </div>

        {t.visitors === 0 && (
          <Alert type="info" showIcon message="No visitors recorded yet" description="Tracking starts on the live site (www.unicoach.com) once this version is deployed. Your own laptop and the admin panel are never tracked. To keep your own visits out, open https://www.unicoach.com/?uc_notrack=1 once in each browser you use." />
        )}

        <Card
          title="People"
          icon={<UserOutlined />}
          extra={(
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ maxWidth: '100%', overflowX: 'auto' }}><Segmented value={view} onChange={(x) => { setView(x); setPage(1); }} options={VIEW_OPTIONS} /></div>
              <Input.Search allowClear placeholder="City, source, page, name" value={q} onChange={(e) => setQ(e.target.value)} onSearch={(x) => { setSearch(x.trim()); setPage(1); }} style={{ width: 230 }} />
            </div>
          )}
        >
          <Table
            size="small"
            rowKey="_id"
            loading={loading}
            dataSource={list.rows}
            columns={columns}
            scroll={{ x: 900 }}
            onRow={(v) => ({ onClick: () => setOpen(v._id), style: { cursor: 'pointer' } })}
            pagination={{ current: page, pageSize: 50, total: list.total, showSizeChanger: false, onChange: setPage, showTotal: (x) => `${n(x)} people` }}
            locale={{ emptyText: view === 'returning' ? 'Nobody has come back without filling a form in this period' : 'Nobody here yet' }}
          />
        </Card>

        <Card
          title="Pages"
          icon={<FileTextOutlined />}
          extra={<div style={{ maxWidth: '100%', overflowX: 'auto' }}><Segmented size="small" value={pageView} onChange={setPageView} options={[{ value: 'pages', label: 'Most viewed' }, { value: 'exits', label: 'Where people leave' }, { value: 'issues', label: 'Problems' }]} /></div>}
        >
          {pageView === 'pages' && <Table size="small" rowKey="path" dataSource={summary.pages} columns={pageColumns} pagination={{ pageSize: 15, showSizeChanger: false }} scroll={{ x: 700 }} />}
          {pageView === 'exits' && <Table size="small" rowKey="path" dataSource={summary.exits} columns={exitColumns} pagination={false} scroll={{ x: 500 }} />}
          {pageView === 'issues' && <Table size="small" rowKey={(r) => `${r.type}${r.path}${r.detail}`} dataSource={summary.issues} columns={issueColumns} pagination={{ pageSize: 15, showSizeChanger: false }} scroll={{ x: 800 }} locale={{ emptyText: 'No problems recorded' }} />}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <Breakdown title="Where they came from (first visit)" rows={summary.sources} label={(x) => x || 'direct'} />
          <Breakdown title="Cities" rows={summary.cities} label={(x) => x || 'Unknown city'} />
          <Breakdown title="Devices" rows={summary.devices} />
        </div>

        <Card title="Show ads to people who came back" icon={<AimOutlined />}>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ux-text-2)' }}>
            Anyone who visits 3 or more times without filling a form sends a <b>ReturningVisitor</b> event to the Meta pixel (and <b>returning_no_lead</b> to Google Analytics). To show them ads:
            <ol style={{ margin: '6px 0 0', paddingLeft: 20, listStyle: 'decimal' }}>
              <li>Meta Ads Manager → <b>Audiences</b> → Create audience → <b>Custom audience</b> → <b>Website</b>.</li>
              <li>Pick the UniCoach pixel, choose <b>ReturningVisitor</b> under events, last 30 days. Name it "Came back, no form".</li>
              <li>Use this audience in an ad set, for example a free counsellor call offer.</li>
            </ol>
            Meta needs about 100 people in an audience before it can show ads to it.
          </div>
        </Card>

        <div style={{ fontSize: 12, color: 'var(--ux-text-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <BugOutlined /> Data is anonymous (no IP addresses, nothing anyone typed) and is deleted 90 days after a visitor's last visit.
        </div>
      </div>
      <VisitorDrawer id={open} onClose={() => setOpen(null)} />
    </div>
  );
};

export default WebsiteVisitors;
