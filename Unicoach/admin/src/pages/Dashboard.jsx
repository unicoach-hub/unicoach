import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TeamOutlined,
  RiseOutlined,
  SettingOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  CrownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  UserAddOutlined,
  ApartmentOutlined,
  SendOutlined,
  ReadOutlined,
  BankOutlined,
  PieChartOutlined,
  FunnelPlotOutlined,
  TrophyOutlined,
  FileTextOutlined,
  NotificationOutlined,
  CalendarOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Header from '../components/Header';
import API from '../api/axios';
import { getCachedData, fetchWithCache } from '../utils/cache';
import { useAuth } from '../context/AuthContext';

const EMPTY_STATS = {
  users: 0,
  studentUsers: 0,
  blogs: 0,
  news: 0,
  events: 0,
  universities: 0,
  scholarships: 0,
  leads: 0,
  verifiedLeads: 0,
  contacted: 0,
  converted: 0,
  newRequests: 0,
  approvedMentors: 0,
  pendingMentors: 0,
  upcomingSessions: 0,
  leadTrends: null,
  destinationStats: [],
  conversionFunnel: [],
  counselorStats: [],
};

const DONUT_COLORS = ['#111111', '#DE5C2B', '#F4A07D', '#8F8E87', '#D6D3CA', '#5F5E58'];

const MODULE_TABS = [
  { to: '/', label: 'Overview', exact: true },
  { to: '/leads', label: 'Leads' },
  { to: '/crm/board', label: 'Pipeline' },
  { to: '/requests', label: 'Support' },
  { to: '/unicoach', label: 'Creators' },
  { to: '/blogs', label: 'Content' },
  { to: '/universities', label: 'Universities' },
  { to: '/automation/email', label: 'Automation' },
];

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const formatDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const formatMonth = (iso, withYear) => {
  const month = new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'short' });
  return withYear ? `${month} ’${iso.slice(2, 4)}` : month;
};
const formatMonthLong = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

// Lead activity ranges; the backend returns one series per key (see backend/utils/leadTrend.js)
const TREND_RANGES = [
  { key: '7d', label: '7D', summary: 'in the last 7 days', compare: 'previous 7 days' },
  { key: '30d', label: '30D', summary: 'in the last 30 days', compare: 'previous 30 days' },
  { key: '90d', label: '3M', summary: 'in the last 3 months', compare: 'previous 3 months' },
  { key: '1y', label: '1Y', summary: 'in the last 12 months', compare: 'previous 12 months' },
  { key: 'all', label: 'All', summary: 'all time', compare: null },
];

const toChartBars = (series) =>
  (series?.buckets || []).map((b, i) => {
    const g = series.granularity;
    let label = formatDay(b.start);
    let title = formatDay(b.start);
    if (g === 'week') {
      title = `${formatDay(b.start)} – ${formatDay(b.end)}`;
    } else if (g === 'month') {
      label = formatMonth(b.start, i === 0 || b.start.slice(5, 7) === '01');
      title = formatMonthLong(b.start);
    } else if (g === 'year') {
      label = b.start.slice(0, 4);
      title = label;
    }
    if (b.current && g !== 'day') title += ' (so far)';
    return { key: b.start, label, title, total: b.total, verified: b.verified, current: b.current };
  });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-2xl bg-[#ecebe6] ${className}`} />;

/* ---------- Metric cards (reference: Operations / Data Transfer) ---------- */
const MetricCard = ({ to, icon, title, value, total, totalLabel, percent, variant = 'light' }) => {
  const filled = Math.round((percent / 100) * 10);
  return (
    <Link
      to={to}
      className={`nx-card ${variant === 'accent' ? 'nx-card--accent' : ''} p-5 flex flex-col justify-between min-h-[236px] no-underline transition-transform hover:-translate-y-0.5`}
      style={{ color: variant === 'accent' ? '#fff' : 'var(--ux-ink)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="nx-icon-circle">{icon}</span>
          <span className="text-[15px] font-semibold">{title}</span>
        </div>
        <ArrowRightOutlined className="text-[13px] opacity-60" />
      </div>
      <div className="flex items-end gap-2 mt-4">
        <span className="text-[46px] leading-none font-semibold tracking-[-0.05em]">{value}</span>
        <div className="flex flex-col items-start gap-1 pb-1">
          <span className="nx-chip">{percent}%</span>
          <span className={`text-[12px] ${variant === 'accent' ? 'text-white/75' : 'text-[var(--ux-text-3)]'}`}>
            / {total} {totalLabel}
          </span>
        </div>
      </div>
      <div className="nx-segments mt-4" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`nx-segment ${i < filled ? 'nx-segment--on' : ''}`} />
        ))}
      </div>
    </Link>
  );
};

/* ---------- Capsule chart (reference: Statistics) ---------- */
const CapsuleChart = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.total));
  const axisMax = Math.max(4, Math.ceil(max / 4) * 4);
  const ticks = [axisMax, (axisMax * 3) / 4, axisMax / 2, axisMax / 4, 0];
  const peak = data.reduce((best, d) => (d.total > (best?.total || 0) ? d : best), null);

  return (
    <div className="nx-capsule-chart">
      <div className="nx-capsule-axis">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="nx-capsule-plot">
        {data.map((d) => {
          const height = d.total > 0 ? Math.max(16, (d.total / axisMax) * 100) : 0;
          const fill = d.total > 0 ? (d.verified / d.total) * 100 : 0;
          return (
            <div key={d.key} className={`nx-capsule-col ${d.current ? 'nx-capsule-col--today' : ''}`}>
              <div className="nx-capsule-track" title={`${d.title}: ${d.total} new, ${d.verified} verified`}>
                {d.total === 0 ? (
                  <span className="nx-capsule-empty" />
                ) : (
                  <span className="nx-capsule" style={{ height: `${height}%` }}>
                    <span className="nx-capsule-fill" style={{ height: `${fill}%` }} />
                    <span className="nx-capsule-dot" style={{ top: 8 }} />
                    {fill > 0 && fill < 100 && (
                      <span className="nx-capsule-dot" style={{ bottom: `calc(${fill}% - 5px)`, background: '#111' }} />
                    )}
                    {peak && peak.key === d.key && (
                      <span className="nx-capsule-tip" style={{ top: 0 }}>
                        {d.total} new
                      </span>
                    )}
                  </span>
                )}
              </div>
              <span className="nx-capsule-label">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Quick link cards (reference: right column) ---------- */
const QuickSquare = ({ to, icon, title, count, hint }) => (
  <Link to={to} className="nx-card nx-card--soft p-4 flex flex-col items-center justify-center gap-2 text-center no-underline min-h-[132px] transition-colors">
    <span className="relative nx-icon-circle bg-white">
      {icon}
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[#DE5C2B] text-white text-[11px] font-bold grid place-items-center">
          {count}
        </span>
      )}
    </span>
    <span className="text-[14px] font-semibold leading-tight">{title}</span>
    <span className="text-[11.5px] text-[var(--ux-text-3)]">{hint}</span>
  </Link>
);

const QuickRow = ({ to, icon, title, text }) => (
  <Link to={to} className="nx-card nx-card--soft p-4 flex flex-col gap-3 no-underline group transition-colors">
    <div className="flex items-start justify-between">
      <span className="nx-icon-circle bg-white">{icon}</span>
      <ArrowUpOutlined className="rotate-45 text-[14px] opacity-70 group-hover:opacity-100" />
    </div>
    <div>
      <p className="text-[14.5px] font-semibold">{title}</p>
      <p className="text-[12.5px] text-[var(--ux-text-3)] mt-0.5 truncate">{text}</p>
    </div>
  </Link>
);

const SectionTitle = ({ icon, title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <span className="nx-icon-circle">{icon}</span>
      <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-[var(--ux-ink)]">{title}</h3>
    </div>
    {right}
  </div>
);

const CONTENT_META = {
  blog: { icon: <FileTextOutlined />, label: 'Blog', path: 'blogs' },
  news: { icon: <NotificationOutlined />, label: 'News', path: 'news' },
  event: { icon: <CalendarOutlined />, label: 'Event', path: 'events' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const cachedStats = getCachedData('/admin/stats');
  const [loadingStats, setLoadingStats] = useState(!cachedStats);
  const [stats, setStats] = useState({ ...EMPTY_STATS, ...(cachedStats || {}) });
  const [recentContent, setRecentContent] = useState(getCachedData('/admin/content?limit=5') || []);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await fetchWithCache('/admin/stats', async () => (await API.get('/admin/stats')).data, {
          onBackgroundUpdate: (fresh) => setStats({ ...EMPTY_STATS, ...fresh }),
        });
        setStats({ ...EMPTY_STATS, ...data });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    const fetchRecent = async () => {
      try {
        const { data } = await fetchWithCache('/admin/content?limit=5', async () => (await API.get('/admin/content?limit=5')).data, {
          onBackgroundUpdate: (fresh) => setRecentContent(Array.isArray(fresh) ? fresh : []),
        });
        setRecentContent(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load recent content', err);
      }
    };
    fetchStats();
    fetchRecent();
  }, []);

  const rangeMeta = TREND_RANGES.find((r) => r.key === range) || TREND_RANGES[1];
  const trendSeries = stats.leadTrends?.[range] || null;
  const trend = useMemo(() => toChartBars(trendSeries), [trendSeries]);
  const trendTotal = trendSeries?.total || 0;
  const trendVerified = trendSeries?.verified || 0;
  const trendPrevious = trendSeries?.previous || null;
  const trendChange = trendPrevious && trendPrevious.total > 0
    ? Math.round(((trendTotal - trendPrevious.total) / trendPrevious.total) * 100)
    : null;

  const destinations = (stats.destinationStats || []).filter((d) => d.name);
  const destinationTotal = destinations.reduce((sum, d) => sum + d.value, 0);
  const topDestinations = destinations.slice(0, 5);
  if (destinations.length > 5) {
    topDestinations.push({ name: 'Others', value: destinations.slice(5).reduce((s, d) => s + d.value, 0) });
  }

  const funnel = stats.conversionFunnel || [];
  const funnelBase = funnel[0]?.value || 0;
  const counselors = (stats.counselorStats || []).slice(0, 5);
  const counselorMax = Math.max(1, ...counselors.map((c) => c.leads));

  const firstName = (user?.name || 'Admin').split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <Header title={`${greeting()}, ${firstName}`} subtitle={today} />

      <div className="dashboard-content">
        {/* Hero headline */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mt-2 mb-6">
          <h2 className="text-[34px] sm:text-[46px] xl:text-[54px] leading-[1.04] font-medium tracking-[-0.045em] text-[var(--ux-ink)]">
            Managing{' '}
            <span className="inline-grid place-items-center align-middle w-[54px] h-[38px] sm:w-[66px] sm:h-[46px] rounded-full bg-white border border-[var(--ux-line)] text-[18px] sm:text-[21px] -mt-1">
              <TeamOutlined />
            </span>{' '}
            your students
            <br />
            and{' '}
            <span className="inline-grid place-items-center align-middle w-[54px] h-[38px] sm:w-[66px] sm:h-[46px] rounded-full bg-[#DE5C2B] text-white text-[18px] sm:text-[21px] -mt-1">
              <RiseOutlined />
            </span>{' '}
            growth
          </h2>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/settings" className="nx-round-btn w-[52px] h-[52px]" aria-label="Settings">
              <SettingOutlined />
            </Link>
            <Link to="/blogs/create" className="nx-btn-dark">
              <PlusOutlined /> New blog post
            </Link>
          </div>
        </section>

        {/* Module tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1" style={{ scrollbarWidth: 'none' }} aria-label="Modules">
          {MODULE_TABS.map((t) => (
            <Link key={t.to} to={t.to} className={`nx-tab ${t.exact ? 'nx-tab--active' : ''}`}>
              {t.label}
              {t.to === '/requests' && stats.newRequests > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#DE5C2B] text-white text-[11px] font-bold grid place-items-center">
                  {stats.newRequests}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {loadingStats ? (
                <>
                  <Skeleton className="h-[236px]" />
                  <Skeleton className="h-[236px]" />
                  <Skeleton className="h-[236px] sm:col-span-2 2xl:col-span-1" />
                </>
              ) : (
                <>
                  <MetricCard
                    to="/leads"
                    icon={<SafetyCertificateOutlined />}
                    title="Verified leads"
                    value={stats.verifiedLeads}
                    total={stats.leads}
                    totalLabel="leads"
                    percent={pct(stats.verifiedLeads, stats.leads)}
                  />
                  <MetricCard
                    to="/crm/board"
                    icon={<PhoneOutlined />}
                    title="Contacted"
                    value={stats.contacted}
                    total={stats.leads}
                    totalLabel="leads"
                    percent={pct(stats.contacted, stats.leads)}
                    variant="accent"
                  />
                  {/* Creators promo (reference: dark "Take your automation" card) */}
                  <Link
                    to="/unicoach"
                    className="nx-card nx-card--dark relative overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row 2xl:flex-col sm:items-end 2xl:items-stretch justify-between gap-4 min-h-[200px] 2xl:min-h-[236px] no-underline sm:col-span-2 2xl:col-span-1"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -right-16 -top-16 w-56 h-56 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(222,92,43,0.55), rgba(222,92,43,0) 70%)' }}
                    />
                    <span aria-hidden="true" className="absolute right-5 top-5 text-[64px] text-white/10">
                      <CrownOutlined />
                    </span>
                    <div className="relative">
                      <p className="text-[24px] sm:text-[28px] 2xl:text-[24px] leading-[1.12] font-medium tracking-[-0.03em] max-w-[340px] 2xl:max-w-[220px]">
                        {stats.approvedMentors} mentors live,{' '}
                        <span className="text-[#F4A07D]">{stats.upcomingSessions} sessions</span> booked
                      </p>
                      <p className="text-[12.5px] text-white/55 mt-2">
                        {stats.pendingMentors > 0
                          ? `${stats.pendingMentors} mentor application${stats.pendingMentors === 1 ? '' : 's'} waiting for review`
                          : 'No mentor applications waiting'}
                      </p>
                    </div>
                    <span className="nx-cta-light relative h-12 px-6 rounded-full text-[14px] font-semibold inline-flex items-center justify-center gap-2 shrink-0">
                      Open Creator Hub <ArrowRightOutlined />
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Lead activity */}
            <section className="nx-card p-5 sm:p-6">
              <SectionTitle
                icon={<BarChartOutlined />}
                title="Lead activity"
                right={
                  <div className="flex items-center gap-4 flex-wrap justify-end">
                    <div className="hidden md:flex items-center gap-4 text-[12.5px] text-[var(--ux-text-2)]">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#111]" /> New leads</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#DE5C2B]" /> Verified</span>
                    </div>
                    <div className="flex p-1 rounded-full bg-[var(--ux-surface-2)] border border-[var(--ux-line-2)]" role="tablist" aria-label="Range">
                      {TREND_RANGES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          role="tab"
                          aria-selected={range === r.key}
                          onClick={() => setRange(r.key)}
                          className={`h-8 px-3 sm:px-3.5 rounded-full text-[12.5px] font-semibold cursor-pointer transition-colors ${
                            range === r.key ? 'bg-[#111] text-white' : 'text-[var(--ux-text-2)] hover:text-[#111]'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                }
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 mb-4 -mt-1">
                <span className="text-[30px] font-semibold tracking-[-0.04em] text-[var(--ux-ink)]">{trendTotal}</span>
                <span className="text-[13px] text-[var(--ux-text-2)]">
                  new lead{trendTotal === 1 ? '' : 's'} {rangeMeta.summary}
                  {range === 'all' && trendSeries?.since ? ` (since ${formatMonthLong(trendSeries.since)})` : ''} · {trendVerified} verified
                </span>
                {rangeMeta.compare && trendPrevious && (
                  trendChange === null ? (
                    <span className="text-[12px] text-[var(--ux-text-3)]">
                      {trendPrevious.total} in the {rangeMeta.compare}
                    </span>
                  ) : (
                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                        trendChange > 0
                          ? 'bg-[#E7F4EC] text-[#1F7A45]'
                          : trendChange < 0
                            ? 'bg-[#FBE9E4] text-[#B4401A]'
                            : 'bg-[var(--ux-surface-2)] text-[var(--ux-text-2)]'
                      }`}
                      title={`${trendPrevious.total} new lead${trendPrevious.total === 1 ? '' : 's'} in the ${rangeMeta.compare}`}
                    >
                      {trendChange === 0
                        ? `Same as ${rangeMeta.compare}`
                        : `${trendChange > 0 ? '▲' : '▼'} ${Math.abs(trendChange)}% vs ${rangeMeta.compare}`}
                    </span>
                  )
                )}
              </div>
              {loadingStats ? (
                <Skeleton className="h-[260px]" />
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: trend.length > 14 ? trend.length * 30 : 0 }}>
                    <CapsuleChart data={trend} />
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right column: shortcuts */}
          <aside className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-4 content-start">
            <QuickSquare
              to="/requests"
              icon={<CustomerServiceOutlined />}
              title="Support"
              count={stats.newRequests}
              hint={stats.newRequests > 0 ? `${stats.newRequests} new` : 'All caught up'}
            />
            <QuickSquare
              to="/unicoach"
              icon={<UserAddOutlined />}
              title="Mentor apps"
              count={stats.pendingMentors}
              hint={stats.pendingMentors > 0 ? `${stats.pendingMentors} to review` : 'None pending'}
            />
            <div className="col-span-2 sm:col-span-2 xl:col-span-2 flex flex-col gap-4">
              <QuickRow to="/crm/board" icon={<ApartmentOutlined />} title="Pipeline board" text="Move leads from new to converted" />
              <QuickRow to="/bulk-messaging" icon={<SendOutlined />} title="Bulk messaging" text="Reach leads on email and WhatsApp" />
            </div>
            <div className="col-span-2 sm:col-span-4 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <QuickRow to="/blogs" icon={<ReadOutlined />} title="Content" text={`${stats.blogs} blogs · ${stats.news} news · ${stats.events} events`} />
              <QuickRow to="/universities" icon={<BankOutlined />} title="Universities" text={`${stats.universities.toLocaleString('en-IN')} universities · ${stats.scholarships} scholarships`} />
            </div>
          </aside>
        </div>

        {/* Insights row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Destinations donut */}
          <section className="nx-card p-5 sm:p-6">
            <SectionTitle icon={<PieChartOutlined />} title="Destinations" />
            {destinationTotal === 0 ? (
              <p className="text-[13px] text-[var(--ux-text-3)] py-10 text-center">No destination data yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative w-[150px] h-[150px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topDestinations} dataKey="value" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} cornerRadius={6} stroke="none">
                        {topDestinations.map((d, i) => (
                          <Cell key={d.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} leads`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
                    <div>
                      <p className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--ux-ink)] leading-none">{destinationTotal}</p>
                      <p className="text-[11px] text-[var(--ux-text-3)] mt-1">leads</p>
                    </div>
                  </div>
                </div>
                <ul className="flex-1 min-w-0 space-y-2.5">
                  {topDestinations.map((d, i) => (
                    <li key={d.name} className="flex items-center justify-between gap-2 text-[13px]">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-[4px] shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="truncate text-[var(--ux-text-2)]">{d.name}</span>
                      </span>
                      <span className="font-semibold text-[var(--ux-ink)]">{pct(d.value, destinationTotal)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Conversion funnel */}
          <section className="nx-card p-5 sm:p-6">
            <SectionTitle icon={<FunnelPlotOutlined />} title="Conversion funnel" />
            <div className="space-y-3.5">
              {funnel.map((step) => {
                const p = pct(step.value, funnelBase);
                return (
                  <div key={step.name}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-[var(--ux-text-2)]">{step.name}</span>
                      <span className="text-[13px] text-[var(--ux-text-3)]">
                        <strong className="text-[var(--ux-ink)] text-[15px] font-semibold">{step.value}</strong> · {p}%
                      </span>
                    </div>
                    <div className="nx-progress-track h-[12px] rounded-full">
                      <div className="nx-progress-fill rounded-full" style={{ width: `${Math.max(p, step.value > 0 ? 4 : 0)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Counsellor performance */}
          <section className="nx-card p-5 sm:p-6">
            <SectionTitle
              icon={<TrophyOutlined />}
              title="Counsellors"
              right={<Link to="/users" className="text-[12.5px] font-semibold text-[#DE5C2B] hover:text-[#C04A1D]">Manage</Link>}
            />
            {counselors.length === 0 ? (
              <p className="text-[13px] text-[var(--ux-text-3)] py-10 text-center">No leads assigned yet</p>
            ) : (
              <ul className="space-y-3">
                {counselors.map((c) => {
                  const name = c.name || 'Unassigned';
                  const share = pct(c.leads, counselorMax);
                  return (
                    <li key={name} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[var(--ux-surface-2)]">
                      <span className="w-10 h-10 rounded-full bg-white border border-[var(--ux-line)] grid place-items-center text-[14px] font-semibold text-[var(--ux-ink)] shrink-0">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[13px] font-semibold text-[var(--ux-ink)] truncate">{name}</span>
                          <span className="text-[11.5px] text-[var(--ux-text-3)] shrink-0">
                            {c.leads} leads · {c.converted} won
                          </span>
                        </div>
                        <div className="nx-slider-track mt-2">
                          <div className="nx-slider-fill" style={{ width: `${share}%` }} />
                          <span className="nx-slider-knob" style={{ left: `${Math.min(97, Math.max(3, share))}%` }} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Recent content */}
        <div className="mt-4">
          <section className="nx-card p-5 sm:p-6 min-w-0">
            <SectionTitle
              icon={<ReadOutlined />}
              title="Recent content"
              right={<Link to="/blogs" className="text-[12.5px] font-semibold text-[#DE5C2B] hover:text-[#C04A1D]">View all</Link>}
            />
            {recentContent.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[14px] font-semibold text-[var(--ux-ink)]">No content yet</p>
                <p className="text-[12.5px] text-[var(--ux-text-3)] mt-1">Blogs, news and events you publish show up here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[560px] text-left border-separate border-spacing-y-1.5 px-1">
                  <thead>
                    <tr className="text-[12px] text-[var(--ux-text-3)]">
                      <th className="font-medium px-3 pb-1">Title</th>
                      <th className="font-medium px-3 pb-1">Type</th>
                      <th className="font-medium px-3 pb-1">Created</th>
                      <th className="font-medium px-3 pb-1">Status</th>
                      <th className="font-medium px-3 pb-1 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContent.map((item) => {
                      const meta = CONTENT_META[item.type] || CONTENT_META.blog;
                      return (
                        <tr key={item._id} className="bg-[var(--ux-surface-2)] text-[13px]">
                          <td className="px-3 py-3 rounded-l-2xl">
                            <span className="flex items-center gap-3 min-w-0">
                              <span className="w-9 h-9 rounded-full bg-white border border-[var(--ux-line-2)] grid place-items-center shrink-0 text-[var(--ux-ink)]">
                                {meta.icon}
                              </span>
                              <span className="font-semibold text-[var(--ux-ink)] truncate max-w-[280px]">{item.title}</span>
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[var(--ux-text-2)]">{meta.label}</td>
                          <td className="px-3 py-3 text-[var(--ux-text-2)] whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-semibold ${
                                item.published ? 'bg-[#e8f6ec] text-[#15803d]' : 'bg-[var(--ux-surface-3)] text-[var(--ux-text-2)]'
                              }`}
                            >
                              {item.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-3 py-3 rounded-r-2xl text-right">
                            <Link
                              to={`/${meta.path}/edit/${item._id}`}
                              className="nx-round-btn nx-round-btn--sm ml-auto"
                              aria-label={`Edit ${item.title}`}
                            >
                              <EditOutlined />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
