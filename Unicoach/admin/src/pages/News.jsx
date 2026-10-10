import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Popconfirm, message, Input, Select } from 'antd';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { usePermissions } from '../utils/permissions';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, NotificationOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const News = () => {
  const cachedNews = getCachedData('/admin/content:news');
  const [data, setData] = useState(cachedNews || []);
  const [loading, setLoading] = useState(!cachedNews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { can } = usePermissions();

  const fetchNews = async (force = false) => {
    if (!getCachedData('/admin/content:news') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/content:news',
        async () => (await API.get('/admin/content?type=news')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/content/${id}`);
      message.success('News deleted');
      invalidateCache('/admin/content');
      invalidateCache('/admin/stats');
      fetchNews(true);
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = data.filter((item) => {
    const matchSearch = (item.title || '').toLowerCase().includes(search.toLowerCase());
    let matchStatus = true;
    const isScheduled = item.published && item.publishDate && new Date(item.publishDate) > new Date();
    if (statusFilter === 'published') {
      matchStatus = item.published && (!item.publishDate || new Date(item.publishDate) <= new Date());
    } else if (statusFilter === 'scheduled') {
      matchStatus = isScheduled;
    } else if (statusFilter === 'draft') {
      matchStatus = !item.published;
    }
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
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

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (text) => <span style={{ color: 'var(--ux-text-3)', fontSize: 12 }}>{text}</span> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: (text) => <span className="nx-status nx-status--neutral">{text || 'General'}</span> },
    { title: 'Status', key: 'status', render: (_, record) => renderStatus(record) },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (date) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{new Date(date).toLocaleDateString()}</span> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="action-btn-group">
          {can('news', 'update') && (
          <button onClick={() => navigate(`/news/edit/${record._id}`)} className="action-btn action-btn--edit"><EditOutlined /></button>
          )}
          {can('news', 'delete') && (
          <Popconfirm title="Delete this news?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <button className="action-btn action-btn--delete"><DeleteOutlined /></button>
          </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="News & Updates" subtitle="Manage all news articles" />
      <div className="dashboard-content">
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<NotificationOutlined />} label="Total News" value={data.length} color="indigo" loading={loading} />
          <StatsCard icon={<NotificationOutlined />} label="Published News" value={data.filter(n => n.published && (!n.publishDate || new Date(n.publishDate) <= new Date())).length} color="emerald" loading={loading} />
          <StatsCard icon={<NotificationOutlined />} label="Draft / Scheduled" value={data.filter(n => !n.published || (n.publishDate && new Date(n.publishDate) > new Date())).length} color="amber" loading={loading} />
        </div>

        <div className="page-toolbar nx-toolbar">
          <div className="page-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 220 }} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 155 }}>
              <Option value="all">All statuses</Option>
              <Option value="published">Published</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="draft">Draft</Option>
            </Select>
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ minWidth: 195 }}>
              <Option value="all">All categories</Option>
              <Option value="News Releases">News Releases</Option>
              <Option value="Student Reports">Student Reports</Option>
              <Option value="In the Press">In the Press</Option>
              <Option value="Corporate Update">Corporate Update</Option>
              <Option value="Immigration Updates">Immigration Updates</Option>
              <Option value="University News">University News</Option>
              <Option value="Policy Changes">Policy Changes</Option>
              <Option value="General">General Bulletin</Option>
            </Select>
          </div>
          {can('news', 'create') && (
          <button type="button" onClick={() => navigate('/news/create')} className="nx-btn nx-btn--dark"><PlusOutlined /> New news</button>
          )}
        </div>
        <div className="page-table-card">
          <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 10 }} />
        </div>
      </div>
    </div>
  );
};

export default News;
