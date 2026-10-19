import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Spin, Tooltip } from 'antd';
import {
  ReloadOutlined, CheckCircleOutlined, HeartOutlined, StarOutlined, SafetyCertificateOutlined, RiseOutlined,
  ThunderboltOutlined, SendOutlined, WarningOutlined, IdcardOutlined, DollarOutlined, QuestionCircleOutlined,
  MessageOutlined, EyeOutlined, CloseCircleOutlined, WhatsAppOutlined, SettingOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTip, Legend } from 'recharts';
import Header from '../components/Header';
import API from '../api/axios';

// Approximate per-message prices for India (INR, incl. GST) as shown in the BSP dashboard we compared
// with. Meta changes these; confirm in Meta Business Manager → Billing before relying on them.
const PRICES = [
  ['Marketing', '≈ ₹0.99', 'Offers, events, newsletters'],
  ['Utility', '≈ ₹0.13', 'Booking and application updates'],
  ['Authentication', '≈ ₹0.13', 'OTPs and login codes'],
  ['Service', 'Free', 'Replies within 24h of a student message'],
];

const TONES = {
  good: { fg: '#047857', bg: '#ECFDF5', line: '#A7F3D0' },
  warn: { fg: '#B45309', bg: '#FFFBEB', line: '#FDE68A' },
  bad: { fg: '#B91C1C', bg: '#FEF2F2', line: '#FECACA' },
  info: { fg: '#6D28D9', bg: '#F5F3FF', line: '#DDD6FE' },
  plain: { fg: '#0F172A', bg: '#F8FAFC', line: '#E2E8F0' },
};

const qualityTone = (q) => ({ GREEN: 'good', YELLOW: 'warn', RED: 'bad' }[q] || 'plain');
const qualityText = (q) => ({ GREEN: 'High', YELLOW: 'Medium', RED: 'Low' }[q] || 'Not rated yet');
const tierText = (t, n) => (t === 'TIER_UNLIMITED' ? 'Unlimited' : n ? (n >= 1000 ? `${n / 1000}K` : String(n)) : t ? t.replace('TIER_', '') : '—');
const pretty = (v) => (v ? String(v).replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '—');

const Tile = ({ icon, label, value, sub, tone = 'plain', help }) => {
  const t = TONES[tone];
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', display: 'grid', placeItems: 'center', color: t.fg, fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--ux-text-2)', display: 'flex', gap: 5, alignItems: 'center' }}>
          {label}
          {help && <Tooltip title={help}><QuestionCircleOutlined style={{ fontSize: 11 }} /></Tooltip>}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.fg, lineHeight: 1.25, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

const Stat = ({ icon, value, label, color }) => (
  <div className="nx-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <span style={{ width: 44, height: 44, borderRadius: 12, background: `${color}14`, color, display: 'grid', placeItems: 'center', fontSize: 20 }}>{icon}</span>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--ux-text-2)' }}>{label}</div>
    </div>
  </div>
);

const WhatsappDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncedAt, setSyncedAt] = useState(null);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data: d } = await API.get('/admin/whatsapp/overview');
      setData(d);
      setSyncedAt(new Date());
    } catch {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // Live: refresh every 45 s while the tab is visible, and right away when you come back to it
    const tick = () => { if (document.visibilityState === 'visible') load(true); };
    const t = setInterval(tick, 45000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, []);

  const a = data?.account;
  const tr = data?.traffic;
  const totals = tr?.totals || { sent: 0, delivered: 0, read: 0, failed: 0, replies: 0 };
  const rate = (n) => (totals.sent ? `${Math.round((n / totals.sent) * 100)}%` : '—');
  const chart = (tr?.days || []).map((d) => ({ ...d, label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }));
  const remaining = a?.tierLimit != null ? Math.max(0, a.tierLimit - (tr?.sentToday || 0)) : null;

  return (
    <div>
      <Header
        title="WhatsApp dashboard"
        subtitle="Account health from Meta and your last 30 days of messages"
        extra={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {syncedAt && <span style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px #16a34a22' }} />Live · synced {syncedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            <Button icon={<ReloadOutlined />} onClick={() => load()} loading={loading}>Refresh</Button>
          </div>
        )}
      />
      <Spin spinning={loading && !data}>
        <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {data && !data.connected && !data.error && (
            <div className="nx-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <WhatsAppOutlined style={{ fontSize: 28, color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>WhatsApp is not connected yet</div>
                  <div style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>Connect your number in Settings to see account health here. Message stats below still work.</div>
                </div>
              </div>
              <Link to="/settings"><Button type="primary" icon={<SettingOutlined />}>Open Settings</Button></Link>
            </div>
          )}
          {data?.metaError && (
            <div className="nx-card" style={{ padding: 16, borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B', fontSize: 13 }}>
              Meta did not answer: {data.metaError}. The token may have expired; reconnect in Settings.
            </div>
          )}

          {a && (
            <div className="nx-card p-5 sm:p-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <WhatsAppOutlined style={{ fontSize: 22, color: '#16a34a' }} />
                <span style={{ fontWeight: 700, fontSize: 17 }}>{a.displayName || 'WhatsApp Business API'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: a.status === 'CONNECTED' ? '#047857' : '#B45309', background: a.status === 'CONNECTED' ? '#ECFDF5' : '#FFFBEB', padding: '3px 10px', borderRadius: 999 }}>● {pretty(a.status) || 'Unknown'}</span>
                {a.officialBadge && <span style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF', padding: '3px 10px', borderRadius: 999 }}>Official business</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <Tile icon={<CheckCircleOutlined />} label="Account status" value={pretty(a.status)} tone={a.status === 'CONNECTED' ? 'good' : 'warn'} help="Whether this number is live on the Cloud API." />
                <Tile icon={<HeartOutlined />} label="Messaging health" value={a.status === 'CONNECTED' ? 'Available' : 'Limited'} tone={a.status === 'CONNECTED' ? 'good' : 'warn'} help="Can the number send messages right now." />
                <Tile icon={<StarOutlined />} label="Quality rating" value={qualityText(a.quality)} tone={qualityTone(a.quality)} help="Based on how students react (blocks, reports) over the last 7 days. Low quality can lower your limit." />
                <Tile icon={<SafetyCertificateOutlined />} label="Quality score" value={a.quality || '—'} tone={qualityTone(a.quality)} />
                <Tile icon={<RiseOutlined />} label="Messaging tier" value={tierText(a.tier, a.tierLimit)} tone="info" help="How many different people you can start a conversation with in 24 hours. Meta raises it as you send good-quality messages." />
                <Tile icon={<ThunderboltOutlined />} label="Daily limit" value={a.tierLimit != null ? a.tierLimit.toLocaleString('en-IN') : tierText(a.tier, a.tierLimit)} sub="new conversations / day" tone="good" />
                <Tile icon={<SendOutlined />} label="Sent messages" value={(tr?.sentToday || 0).toLocaleString('en-IN')} sub="today" tone="good" />
                <Tile icon={<WarningOutlined />} label="Remaining quota" value={remaining != null ? remaining.toLocaleString('en-IN') : '—'} sub="approx., today" tone="warn" />
                <Tile icon={<IdcardOutlined />} label="Name status" value={pretty(a.nameStatus)} tone={a.nameStatus === 'APPROVED' ? 'good' : 'warn'} help="Meta reviews your display name before it shows to students." />
                <Tile icon={<SafetyCertificateOutlined />} label="Business verification" value={pretty(a.businessVerification)} tone={a.businessVerification === 'verified' ? 'good' : 'warn'} />
                <Tile icon={<DollarOutlined />} label="Billing" value={a.currency || '—'} sub="Own Meta billing" tone="plain" />
                <Tile icon={<ThunderboltOutlined />} label="Throughput" value={pretty(a.throughput)} sub="messages per second level" tone="plain" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)' }}>
                {[['Phone number', a.phoneNumber], ['Phone number ID', a.phoneNumberId], ['WhatsApp Business Account', a.wabaId], ['Connected', a.connectedAt ? new Date(a.connectedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—']].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--ux-text-2)' }}>{k}</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2, wordBreak: 'break-all' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tr && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                <Stat icon={<SendOutlined />} value={totals.sent.toLocaleString('en-IN')} label="Messages sent" color="#0284C7" />
                <Stat icon={<CheckCircleOutlined />} value={totals.delivered.toLocaleString('en-IN')} label={`Delivered · ${rate(totals.delivered)}`} color="#059669" />
                <Stat icon={<EyeOutlined />} value={totals.read.toLocaleString('en-IN')} label={`Read · ${rate(totals.read)}`} color="#7C3AED" />
                <Stat icon={<MessageOutlined />} value={totals.replies.toLocaleString('en-IN')} label="Student replies" color="#DE5C2B" />
                <Stat icon={<CloseCircleOutlined />} value={totals.failed.toLocaleString('en-IN')} label="Failed" color="#DC2626" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 16 }} className="wa-dash-grid">
                <div className="nx-card p-5">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Message trends</div>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', marginBottom: 12 }}>Daily sent, delivered and read (last 30 days)</div>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          {[['s', '#0EA5E9'], ['d', '#10B981'], ['r', '#8B5CF6']].map(([id, c]) => (
                            <linearGradient key={id} id={`wa-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.25} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F3" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={3} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <ChartTip />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="sent" name="Sent" stroke="#0EA5E9" fill="url(#wa-s)" strokeWidth={2} />
                        <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#10B981" fill="url(#wa-d)" strokeWidth={2} />
                        <Area type="monotone" dataKey="read" name="Read" stroke="#8B5CF6" fill="url(#wa-r)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="nx-card p-5">
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Pricing (INR)</div>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', marginBottom: 12 }}>Approx. per-message rates for India, incl. GST</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {PRICES.map(([name, price, desc]) => (
                      <div key={name} style={{ border: '1px solid var(--ux-line-2)', borderRadius: 12, padding: '10px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>{name}</span><span>{price}</span></div>
                        <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginTop: 2 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginTop: 10 }}>Rates change from time to time; check Meta Business Manager for the latest.</div>
                </div>
              </div>
            </>
          )}
          {data?.error && <div className="nx-card" style={{ padding: 24 }}>Could not load the dashboard. Try Refresh.</div>}
        </div>
      </Spin>
    </div>
  );
};

export default WhatsappDashboard;
