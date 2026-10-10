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
  FileTextOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import AiBlogGeneratorModal from '../components/AiBlogGeneratorModal';

const { Option } = Select;

const Blogs = () => {
  const cachedBlogs = getCachedData('/admin/content:blog');
  const [data, setData] = useState(cachedBlogs || []);
  const [loading, setLoading] = useState(!cachedBlogs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  const { can } = usePermissions();

  const fetchBlogs = async (force = false) => {
    if (!getCachedData('/admin/content:blog') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/content:blog',
        async () => (await API.get('/admin/content?type=blog')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/content/${id}`);
      message.success('Blog deleted');
      invalidateCache('/admin/content');
      invalidateCache('/admin/stats');
      fetchBlogs(true);
    } catch (err) {
      message.error('Delete failed');
    }
  };

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
    const matchCategory = categoryFilter === 'all' || (item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase()));
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
    {
      title: 'Title', dataIndex: 'title', key: 'title',
      render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Slug', dataIndex: 'slug', key: 'slug',
      render: (text) => <span style={{ color: 'var(--ux-text-3)', fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Category', dataIndex: 'category', key: 'category',
      render: (text) => <span className="nx-status nx-status--neutral">{text || 'General'}</span>,
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
          {can('blogs', 'update') && (
          <button onClick={() => navigate(`/blogs/edit/${record._id}`)} className="action-btn action-btn--edit">
            <EditOutlined />
          </button>
          )}
          {can('blogs', 'delete') && (
          <Popconfirm title="Delete this blog?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
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
      <Header title="Blogs & Articles" subtitle="Manage all blog posts" />
      <div className="dashboard-content">
        {/* Mini stats dashboard */}
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<FileTextOutlined />} label="Total Blogs" value={data.length} color="indigo" loading={loading} />
          <StatsCard icon={<FileTextOutlined />} label="Published Blogs" value={data.filter(b => b.published && (!b.publishDate || new Date(b.publishDate) <= new Date())).length} color="emerald" loading={loading} />
          <StatsCard icon={<FileTextOutlined />} label="Draft / Scheduled" value={data.filter(b => !b.published || (b.publishDate && new Date(b.publishDate) > new Date())).length} color="amber" loading={loading} />
        </div>

        {/* Toolbar */}
        <div className="page-toolbar nx-toolbar">
          <div className="page-toolbar-left" style={{ flexWrap: 'wrap' }}>
            <Input
              prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />}
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 264 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ minWidth: 155 }}>
              <Option value="all">All statuses</Option>
              <Option value="published">Published</Option>
              <Option value="scheduled">Scheduled</Option>
              <Option value="draft">Draft</Option>
            </Select>
            <Select value={categoryFilter} onChange={setCategoryFilter} style={{ minWidth: 190 }}>
              <Option value="all">All categories</Option>
              <Option value="colleges">Colleges</Option>
              <Option value="courses">Courses</Option>
              <Option value="exams">Exams</Option>
              <Option value="expense">Expense Calculator</Option>
              <Option value="scholarships">Scholarships</Option>
              <Option value="visa">Visa Guidance</Option>
              <Option value="study abroad">Study Abroad</Option>
              <Option value="general">General</Option>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => setAiModalOpen(true)} className="nx-btn nx-btn--accent">
              <ThunderboltOutlined /> Write blog with AI
            </button>
            {can('blogs', 'create') && (
            <button type="button" onClick={() => navigate('/blogs/create')} className="nx-btn nx-btn--dark">
              <PlusOutlined /> New blog
            </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="page-table-card">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={filtered}
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10 }}
          />
        </div>

        {/* AI SEO Blog Generator Modal */}
        <AiBlogGeneratorModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onApplyBlog={async (aiBlog) => {
            try {
              const res = await API.post('/admin/content', {
                type: 'blog',
                title: aiBlog.title,
                slug: aiBlog.slug,
                metaTitle: aiBlog.metaTitle,
                metaDescription: aiBlog.metaDescription,
                category: aiBlog.category,
                sections: aiBlog.sections,
                published: false
              });
              message.success('Draft Blog created with AI!');
              navigate(`/blogs/edit/${res.data._id}`);
            } catch (err) {
              message.error('Failed to create AI blog draft.');
            }
          }}
        />
      </div>
    </div>
  );
};

export default Blogs;
