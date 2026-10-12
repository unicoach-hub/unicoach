import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Select, Input, Button, message, Empty } from 'antd';
import { CalendarOutlined, DownloadOutlined, MailOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';

const fmtDate = (d, withTime = false) => (d
  ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}), timeZone: 'Asia/Kolkata' })
  : '—');

// Everyone who registered for an event on the website. No calling or follow-up here:
// the list is for bulk emails (joining links, reminders) through Campaigns.
const EventRegistrations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventId = /^[a-f0-9]{24}$/i.test(searchParams.get('event') || '') ? searchParams.get('event') : '';
  const [rows, setRows] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    API.get('/support-requests', { params: { scope: 'events', limit: 5000, ...(eventId ? { eventId } : {}) } })
      .then(({ data }) => {
        if (!alive) return;
        setRows(data.requests || []);
        setEvents(data.stats?.eventCounts || data.eventCounts || []);
      })
      .catch(() => message.error('Could not load event registrations'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [eventId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.email, r.phone, r.eventTitle].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [rows, search]);

  const selected = events.find((e) => e.eventId === eventId);
  const upcoming = events.filter((e) => e.eventStart && new Date(e.eventStart) > new Date()).length;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await API.get('/support-requests/export/csv', {
        params: { scope: 'events', ...(eventId ? { eventId } : {}) },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Event_registrations_${(selected?.eventTitle || 'all').replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { title: 'Registered', dataIndex: 'createdAt', width: 150, render: (d) => fmtDate(d, true), sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt), defaultSortOrder: 'descend' },
    { title: 'Name', dataIndex: 'name', render: (t) => <span style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{t}</span> },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone', width: 150 },
    ...(eventId ? [] : [{ title: 'Event', dataIndex: 'eventTitle', render: (t, r) => <div><div style={{ fontWeight: 500 }}>{t || '—'}</div><div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{fmtDate(r.eventStart, true)}</div></div> }]),
    { title: 'Intake', dataIndex: 'intake', width: 110, render: (t) => t || '—' },
  ];

  return (
    <div>
      <Header title="Event registrations" subtitle="Everyone who signed up for an event. Use this list for bulk emails like joining links and reminders." />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<TeamOutlined />} label={selected ? 'Registrations for this event' : 'Total registrations'} value={selected ? selected.count : rows.length} color="brand" loading={loading} />
          <StatsCard icon={<CalendarOutlined />} label="Events with registrations" value={events.length} color="brand" loading={loading} />
          <StatsCard icon={<CalendarOutlined />} label="Upcoming events" value={upcoming} color="brand" loading={loading} />
        </div>

        <div className="nx-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Select
            value={eventId || undefined}
            onChange={(v) => setSearchParams(v ? { event: v } : {})}
            allowClear
            showSearch={{ optionFilterProp: 'label' }}
            placeholder="All events"
            style={{ minWidth: 300, maxWidth: '100%' }}
            options={events.map((e) => ({ value: e.eventId, label: `${e.eventTitle || 'Untitled'} · ${fmtDate(e.eventStart)} (${e.count})` }))}
          />
          <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280, maxWidth: '100%' }} allowClear />
          <div style={{ flex: 1 }} />
          <Button icon={<DownloadOutlined />} onClick={exportCsv} loading={exporting} disabled={!rows.length}>Export CSV</Button>
          <Button
            type="primary"
            icon={<MailOutlined />}
            disabled={!eventId}
            title={eventId ? '' : 'Pick an event first'}
            onClick={() => navigate(`/automation/campaign?event=${eventId}`)}
          >
            Email this event's registrants
          </Button>
        </div>

        <div className="page-table-card">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filtered}
            loading={loading}
            scroll={{ x: 900 }}
            pagination={{ pageSize: 25, showSizeChanger: true }}
            locale={{ emptyText: <Empty description="No registrations yet" /> }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventRegistrations;
