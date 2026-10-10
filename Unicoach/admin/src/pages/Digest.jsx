import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Popconfirm, message, Input, Select } from 'antd';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { usePermissions } from '../utils/permissions';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlaySquareOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;

const Digest = () => {
  const cachedDigest = getCachedData('/admin/content:digest');
  const [data, setData] = useState(cachedDigest || []);
  const [loading, setLoading] = useState(!cachedDigest);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const { can } = usePermissions();

  const fetchDigest = async (force = false) => {
    if (!getCachedData('/admin/content:digest') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/content:digest',
        async () => (await API.get('/admin/content?type=digest')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load digest posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDigest(); }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/content/${id}`);
      message.success('Digest post deleted');
      invalidateCache('/admin/content');
      invalidateCache('/admin/stats');
      fetchDigest(true);
    } catch (err) {
      message.error('Delete failed');
    }
  };

  const filtered = data.filter((item) => {
    const matchSearch = (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
                        (item.description || '').toLowerCase().includes(search.toLowerCase());
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

  const getCategoryTag = (cat) => {
    switch (cat) {
      case 'reviews':
        return <span className="nx-status nx-status--neutral">Student Review</span>;
      case 'insights':
        return <span className="nx-status nx-status--neutral">Expert Insight</span>;
      case 'news':
        return <span className="nx-status nx-status--neutral">Trending News</span>;
      default:
        return <span className="nx-status nx-status--neutral">{cat}</span>;
    }
  };

  const columns = [
    {
      title: 'Title', dataIndex: 'title', key: 'title',
      render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (cat) => getCategoryTag(cat),
    },
    {
      title: 'Media Type', key: 'mediaType',
      render: (_, record) => record.isVideo ? (
        <span style={{ color: 'var(--ux-ink)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <PlayCircleOutlined /> Video {record.length ? `(${record.length})` : ''}
        </span>
      ) : (
        <span style={{ color: 'var(--ux-text-2)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FileTextOutlined /> Text Article
        </span>
      ),
    },
    {
      title: 'Spotlight', dataIndex: 'isSpotlight', key: 'isSpotlight',
      render: (spot) => spot ? <span className="nx-status nx-status--accent"><StarOutlined /> Spotlight</span> : null,
    },
    {
      title: 'Status', key: 'status',
      render: (_, record) => renderStatus(record),
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt',
      render: (date) => <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="action-btn-group">
          {can('digest', 'update') && (
          <button onClick={() => navigate(`/digest/edit/${record._id}`)} className="action-btn action-btn--edit">
            <EditOutlined />
          </button>
          )}
          {can('digest', 'delete') && (
          <Popconfirm title="Delete this digest?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <button className="action-btn action-btn--delete">
              <DeleteOutlined />
            </button>
          </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Video Digest" subtitle="Manage all digital press publications and student video reviews" />
      <div className="dashboard-content">
        {/* Mini stats dashboard */}
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<PlaySquareOutlined />} label="Total Publications" value={data.length} color="indigo" loading={loading} />
          <StatsCard icon={<StarOutlined />} label="Spotlight Carousel" value={data.filter(d => d.isSpotlight).length} color="emerald" loading={loading} />
          <StatsCard icon={<PlayCircleOutlined />} label="Video Reviews" value={data.filter(d => d.isVideo).length} color="amber" loading={loading} />
        </div>

        {/* Toolbar */}
        <div className="page-toolbar nx-toolbar">
          <div className="page-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or details..."
              className="search-input"
              style={{ width: 264 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 155 }}>
              <Option value="all">All statuses</Option>
              <Option value="published">Published</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="draft">Draft</Option>
            </Select>
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ width: 190 }}>
              <Option value="all">All categories</Option>
              <Option value="reviews">Student Reviews</Option>
              <Option value="insights">Expert Insights</Option>
              <Option value="news">Trending News</Option>
            </Select>
          </div>
          {can('digest', 'create') && (
          <button type="button" onClick={() => navigate('/digest/create')} className="nx-btn nx-btn--dark">
            <PlusOutlined /> Create publication
          </button>
          )}
        </div>

        {/* Table view */}
        <div className="page-table-card">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="_id"
            loading={loading}
            scroll={{ x: 800 }}
            className="admin-table"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Digest;
