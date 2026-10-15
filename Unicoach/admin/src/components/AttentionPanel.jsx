import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockCircleOutlined, PhoneOutlined, CheckSquareOutlined, CustomerServiceOutlined, UserAddOutlined,
  WhatsAppOutlined, CalendarOutlined, WarningOutlined, ArrowRightOutlined, CheckCircleFilled, ReloadOutlined,
} from '@ant-design/icons';
import API from '../api/axios';

// "Needs attention" on the admin dashboard: everything waiting for someone, each tile opens the page to act on it.
const REFRESH_MS = 60000;

const ago = (d) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days <= 0) return 'today';
  return days === 1 ? '1 day ago' : `${days} days ago`;
};
const when = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const TONES = {
  danger: { dot: '#dc2626', soft: '#fef2f2', text: '#b91c1c' },
  warn: { dot: '#ea580c', soft: '#fff7ed', text: '#c2410c' },
  neutral: { dot: '#0f172a', soft: '#f1f5f9', text: '#0f172a' },
};

// Compact tile: icon, number and label on one line; empty ones fade back
const Tile = ({ to, icon, label, count, sub, tone = 'neutral' }) => {
  const active = count > 0;
  const t = TONES[active ? tone : 'neutral'];
  return (
    <Link to={to} className={`attn-tile${active ? ' attn-tile--on' : ''}`} style={{ '--attn-soft': t.soft }}>
      <span className="attn-icon" style={{ background: active ? t.soft : '#f6f6f4', color: active ? t.text : '#94a3b8' }}>{icon}</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: active ? t.text : '#cbd5e1' }}>{count}</span>
          <span className="attn-label" style={{ color: active ? 'var(--ux-ink, #111)' : '#94a3b8' }}>{label}</span>
        </span>
        {sub && <span className="attn-sub">{sub}</span>}
      </span>
      <ArrowRightOutlined className="attn-arrow" />
    </Link>
  );
};

const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const Row = ({ to, title, meta, badge, badgeTone = 'danger', kind }) => {
  const t = TONES[badgeTone === 'warning' ? 'warn' : badgeTone === 'accent' ? 'neutral' : 'danger'];
  return (
    <Link to={to} className="attn-row">
      <span className="attn-avatar" style={{ background: t.soft, color: t.text }}>
        {kind === 'task' ? <CheckSquareOutlined /> : kind === 'event' ? <CalendarOutlined /> : initials(title)}
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="attn-row-title">{title}</span>
        <span className="attn-row-meta">{meta}</span>
      </span>
      {badge && <span className="attn-badge" style={{ background: t.soft, color: t.text }}>{badge}</span>}
    </Link>
  );
};

const AttentionPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: d } = await API.get('/admin/stats/attention');
      setData(d);
    } catch {
      /* keep the last numbers */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, []);

  if (!data) return null;

  const urgent = data.followUps.overdue + data.tasks.overdue + data.uncalled.count + data.whatsapp.needsAgent;
  const rows = [
    ...data.tasks.items.map((t) => ({ key: `t${t.id}`, kind: 'task', to: '/tasks', title: t.title, meta: `Task · due ${when(t.due)}${t.assignee ? ` · ${t.assignee}` : ''}`, badge: t.priority === 'high' ? 'High priority' : 'Overdue' })),
    ...data.followUps.items.map((l) => ({ key: `f${l.id}`, to: '/leads', title: l.name, meta: `Follow-up · ${[l.country, l.phone].filter(Boolean).join(' · ')}`, badge: `due ${ago(l.due)}` })),
    ...data.uncalled.items.map((l) => ({ key: `u${l.id}`, to: '/leads', title: l.name, meta: `Not called yet · ${[l.country, l.phone].filter(Boolean).join(' · ')}`, badge: ago(l.since), badgeTone: 'warning' })),
  ];

  return (
    <div className="nx-card attn-card">
      <div className="attn-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="attn-pulse" style={{ background: urgent > 0 ? '#ea580c' : '#16a34a' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ux-ink, #111)', lineHeight: 1.2 }}>Needs attention</div>
            <div style={{ fontSize: 12.5, color: 'var(--ux-text-2, #64748b)' }}>
              {urgent > 0 ? `${urgent} item${urgent === 1 ? '' : 's'} overdue or waiting` : 'Nothing overdue. Nice work.'}
            </div>
          </div>
        </div>
        <button type="button" onClick={load} aria-label="Refresh" className="attn-refresh"><ReloadOutlined spin={loading} /></button>
      </div>

      <div className="attn-grid">
        <Tile to="/leads" icon={<ClockCircleOutlined />} label="Overdue follow-ups" count={data.followUps.overdue} sub={data.followUps.today ? `${data.followUps.today} due today` : null} tone="danger" />
        <Tile to="/tasks" icon={<CheckSquareOutlined />} label="Overdue tasks" count={data.tasks.overdue} sub={data.tasks.today ? `${data.tasks.today} due later today` : null} tone="danger" />
        <Tile to="/leads" icon={<PhoneOutlined />} label="Leads not called" count={data.uncalled.count} sub="over 24 hours" tone="warn" />
        <Tile to="/automation/whatsapp" icon={<WhatsAppOutlined />} label="WhatsApp waiting" count={data.whatsapp.needsAgent + data.whatsapp.unread} sub={data.whatsapp.needsAgent ? `${data.whatsapp.needsAgent} want a person` : null} tone="warn" />
        <Tile to="/requests" icon={<CustomerServiceOutlined />} label="Support requests" count={data.newRequests} tone="warn" />
        <Tile to="/unicoach" icon={<UserAddOutlined />} label="Mentor applications" count={data.pendingMentors} tone="warn" />
        <Tile to="/leads-followup" icon={<ClockCircleOutlined />} label="Follow-up list" count={data.followUpList} />
        <Tile to="/unicoach" icon={<CalendarOutlined />} label="Sessions today" count={data.sessionsToday} />
      </div>

      {(data.eventsWithoutDate > 0 || data.pausedCampaigns > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {data.eventsWithoutDate > 0 && (
            <Link to="/events" className="attn-alert" style={{ color: '#c2410c', background: '#fff7ed' }}>
              <WarningOutlined /> {data.eventsWithoutDate} published event{data.eventsWithoutDate === 1 ? ' has' : 's have'} no date
              <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Link>
          )}
          {data.pausedCampaigns > 0 && (
            <Link to="/automation/campaigns" className="attn-alert" style={{ color: '#b91c1c', background: '#fef2f2' }}>
              <WarningOutlined /> {data.pausedCampaigns} WhatsApp campaign{data.pausedCampaigns === 1 ? ' is' : 's are'} paused
              <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Link>
          )}
        </div>
      )}

      <div className="attn-lists">
        <div>
          <div className="attn-section">Do these first</div>
          {rows.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#15803d', padding: '10px 0' }}><CheckCircleFilled /> All caught up</div>
          ) : rows.slice(0, 6).map((r) => <Row key={r.key} {...r} />)}
        </div>
        <div>
          <div className="attn-section">Events this week</div>
          {data.upcomingEvents.length === 0 ? (
            <div className="attn-empty"><CalendarOutlined /> No events in the next 7 days</div>
          ) : data.upcomingEvents.map((e) => (
            <Row key={e.id} kind="event" to={`/events/edit/${e.id}`} title={e.title} meta={when(e.start)} badge={`${e.registered} registered`} badgeTone="accent" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttentionPanel;
