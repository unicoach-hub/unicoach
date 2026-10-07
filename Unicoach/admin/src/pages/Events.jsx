import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Popconfirm, message, Input, Select } from 'antd';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CalendarOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

// Quoted CSV cell; text that would run as a spreadsheet formula gets a leading apostrophe (phone numbers stay as they are)
const csvCell = (value) => {
  let text = value === undefined || value === null ? '' : String(value).replace(/\r?\n/g, ' ');
  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !/^[+-]?[\d\s().-]+$/.test(text))) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

// "2026-10-05 18:30" in India time, like the Requests export
const toIstDateTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  if (Number.isNaN(time)) return '';
  return new Date(time + 330 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
};

// Everyone on the event's own list. This includes people who registered before sign-ups were
// also filed in Requests, so it can be longer than "View registrations".
const downloadAttendees = (event) => {
  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const header = ['Name', 'Email', 'Phone', 'Intake', 'Registered At (IST)'];
  const rows = attendees.map((a) => [a.name, a.email, a.phone, a.intake, toIstDateTime(a.registeredAt)].map(csvCell).join(','));
  // Leading BOM so Excel reads names as UTF-8
  const blob = new Blob(['﻿' + [header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = (event.slug || event.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  link.href = url;
  link.download = `${slug || 'event'}_attendees_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Event banners are either admin uploads (/uploads/… on the API server), full URLs, or the
// public site's own static files (/events/… on the website)
const bannerSrc = (url) => {
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${API.defaults.baseURL.replace(/\/api\/?$/, '')}${url}`;
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return `${isLocal ? 'http://localhost:5173' : 'https://www.unicoach.com'}${url}`;
};

const Events = () => {
  const cachedEvents = getCachedData('/admin/content:event');
  const [data, setData] = useState(cachedEvents || []);
  const [loading, setLoading] = useState(!cachedEvents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();

  const fetchEvents = async (force = false) => {
    if (!getCachedData('/admin/content:event') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/content:event',
        async () => (await API.get('/admin/content?type=event')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) { message.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    try { 
      await API.delete(`/admin/content/${id}`); 
      message.success('Event deleted'); 
      invalidateCache('/admin/content');
      invalidateCache('/admin/stats');
      fetchEvents(true); 
    }
    catch (err) { message.error('Delete failed'); }
  };

  // On-site registrations only; events with an external form collect sign-ups elsewhere
  const getRegistrationCount = (item) => Number(item.registrationCount) || 0;
  const totalRegistrations = data.reduce((sum, ev) => sum + getRegistrationCount(ev), 0);

  const filtered = data.filter((item) => {
    const matchSearch = (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
                        (item.speaker || '').toLowerCase().includes(search.toLowerCase()) ||
                        (item.location || '').toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    const isScheduled = item.published && item.publishDate && new Date(item.publishDate) > new Date();
    if (statusFilter === 'published') {
      matchStatus = item.published && (!item.publishDate || new Date(item.publishDate) <= new Date());
    } else if (statusFilter === 'scheduled') {
      matchStatus = isScheduled;
    } else if (statusFilter === 'draft') {
      matchStatus = !item.published;
    }
    const matchCategory = categoryFilter === 'all' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchStatus && matchCategory;
  });

  const renderStatus = (record) => {
    if (!record.published) {
      return <span className="nx-status nx-status--neutral">Draft</span>;
    }
    if (record.publishDate && new Date(record.publishDate) > new Date()) {
      return (
        <span className="nx-status nx-status--warning">
          <ClockCircleOutlined /> Scheduled ({new Date(record.publishDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
        </span>
      );
    }
    return <span className="nx-status nx-status--success">Published</span>;
  };

  const getCategoryTag = (cat) => {
    switch ((cat || '').toLowerCase()) {
      case 'webinar':
        return <span className="nx-status nx-status--neutral">Webinar</span>;
      case 'fair':
        return <span className="nx-status nx-status--neutral">Virtual Fair</span>;
      case 'other':
        return <span className="nx-status nx-status--neutral">Other</span>;
      default:
        return <span className="nx-status nx-status--neutral">{cat || 'Event'}</span>;
    }
  };

  const renderHomepage = (record) => {
    if (record.showOnHomepage === false) {
      return <span className="nx-status nx-status--neutral">Hidden</span>;
    }
    if (typeof record.homepageOrder === 'number') {
      return <span className="nx-status nx-status--accent">Position {record.homepageOrder}</span>;
    }
    return <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>Auto (by date)</span>;
  };

  const renderRegistrations = (record) => {
    const count = getRegistrationCount(record);
    const attendeeCount = Array.isArray(record.attendees) ? record.attendees.length : 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <span style={{ color: 'var(--ux-ink)', fontWeight: 600, fontSize: 13 }}>{count}</span>
        {record.registrationLink && (
          <span className="nx-muted" style={{ fontSize: 12 }} title={record.registrationLink}>External form</span>
        )}
        <Link
          to={`/requests?event=${record._id}`}
          state={{ eventTitle: record.title }}
          style={{ color: 'var(--ux-brand-strong)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          View registrations
        </Link>
        {attendeeCount > 0 && (
          <button
            type="button"
            onClick={() => downloadAttendees(record)}
            title="Everyone registered on UniCoach for this event, including sign-ups from before they were added to Requests"
            style={{ padding: 0, border: 0, background: 'none', cursor: 'pointer', color: 'var(--ux-brand-strong)', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            Download list ({attendeeCount})
          </button>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {record.imageUrl ? (
            <img
              src={bannerSrc(record.imageUrl)}
              alt=""
              loading="lazy"
              style={{ width: 96, height: 48, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid var(--ux-line-2)', background: 'var(--ux-surface-2)' }}
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
          ) : (
            <span style={{ width: 96, height: 48, borderRadius: 10, flexShrink: 0, border: '1px dashed var(--ux-line-2)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--ux-text-3)' }}>No banner</span>
          )}
          <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span>
        </span>
      ),
    },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (cat) => getCategoryTag(cat) },
    { title: 'Speaker', dataIndex: 'speaker', key: 'speaker', render: (text) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{text || '—'}</span> },
    { title: 'Location', dataIndex: 'location', key: 'location', render: (text) => <span style={{ color: 'var(--ux-text-2)' }}>{text || '—'}</span> },
    { title: 'Start Date', dataIndex: 'eventStart', key: 'eventStart', render: (d) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{d ? new Date(d).toLocaleDateString() : '—'}</span> },
    { title: 'End Date', dataIndex: 'eventEnd', key: 'eventEnd', render: (d) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{d ? new Date(d).toLocaleDateString() : '—'}</span> },
    { title: 'Status', key: 'status', render: (_, record) => renderStatus(record) },
    {
      title: 'Registrations', key: 'registrations',
      sorter: (a, b) => getRegistrationCount(a) - getRegistrationCount(b),
      render: (_, record) => renderRegistrations(record),
    },
    { title: 'Homepage', key: 'homepage', render: (_, record) => renderHomepage(record) },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="action-btn-group">
          <button onClick={() => navigate(`/events/edit/${record._id}`)} className="action-btn action-btn--edit"><EditOutlined /></button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <button className="action-btn action-btn--delete"><DeleteOutlined /></button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Events & Webinars" subtitle="Manage all events and webinars" />
      <div className="dashboard-content">
        <div className="page-stats-grid page-stats-grid--4">
          <StatsCard icon={<CalendarOutlined />} label="Total Events" value={data.length} color="indigo" loading={loading} />
          <StatsCard icon={<CalendarOutlined />} label="Upcoming Events" value={data.filter(ev => ev.eventStart && new Date(ev.eventStart) > new Date()).length} color="emerald" loading={loading} />
          <StatsCard icon={<CalendarOutlined />} label="Draft / Scheduled" value={data.filter(ev => !ev.published || (ev.publishDate && new Date(ev.publishDate) > new Date())).length} color="amber" loading={loading} />
          <StatsCard icon={<TeamOutlined />} label="On-site Registrations" value={totalRegistrations} color="brand" loading={loading} />
        </div>

        <div className="page-toolbar nx-toolbar">
          <div className="page-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 155 }}>
              <Option value="all">All statuses</Option>
              <Option value="published">Published</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="draft">Draft</Option>
            </Select>
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ minWidth: 180 }}>
              <Option value="all">All categories</Option>
              <Option value="webinar">Webinars</Option>
              <Option value="fair">Virtual Fairs</Option>
              <Option value="other">Other Events</Option>
            </Select>
          </div>
          <button type="button" onClick={() => navigate('/events/create')} className="nx-btn nx-btn--dark"><PlusOutlined /> New event</button>
        </div>
        <div className="page-table-card">
          <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} scroll={{ x: 1100 }} pagination={{ pageSize: 10 }} />
        </div>
      </div>
    </div>
  );
};

export default Events;
