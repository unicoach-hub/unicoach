import React, { useEffect, useState } from 'react';
import { Table, Popconfirm, message, Input } from 'antd';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';
import { DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

const Users = () => {
  const cachedUsers = getCachedData('/admin/users:list');
  const [data, setData] = useState(cachedUsers || []);
  const [loading, setLoading] = useState(!cachedUsers);
  const [search, setSearch] = useState('');

  const fetchUsers = async (force = false) => {
    if (!getCachedData('/admin/users:list') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/users:list',
        async () => (await API.get('/admin/users')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setData(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setData(Array.isArray(data) ? data : []);
    } catch (err) { message.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    try { 
      await API.delete(`/admin/users/${id}`); 
      message.success('User deleted'); 
      invalidateCache('/admin/users');
      invalidateCache('/admin/stats');
      fetchUsers(true); 
    }
    catch (err) { message.error(err?.response?.data?.error || err?.response?.data?.message || 'Delete failed'); }
  };

  const filtered = data.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (text) => <span style={{ color: 'var(--ux-text-2)' }}>{text}</span> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (text) => <span style={{ color: 'var(--ux-text-2)' }}>{text}</span> },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <span className={`nx-status ${role === 'admin' ? 'nx-status--dark' : 'nx-status--neutral'}`}>{role}</span> },
    { title: 'Joined', dataIndex: 'createdAt', key: 'createdAt', render: (d) => <span style={{ color: 'var(--ux-text-3)', fontSize: 13 }}>{new Date(d).toLocaleDateString()}</span> },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
          <button className="action-btn action-btn--delete"><DeleteOutlined /></button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Header title="Registered users" subtitle="Manage all registered users" />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<UserOutlined />} label="Total users" value={data.length} color="brand" loading={loading} />
          <StatsCard icon={<UserOutlined />} label="Administrators" value={data.filter(u => u.role === 'admin').length} color="brand" loading={loading} />
          <StatsCard icon={<UserOutlined />} label="Students" value={data.filter(u => u.role !== 'admin').length} color="brand" loading={loading} />
        </div>

        <div className="nx-toolbar">
          <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320, maxWidth: '100%' }} />
        </div>
        <div className="page-table-card">
          <Table rowKey="_id" columns={columns} dataSource={filtered} loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 15 }} />
        </div>
      </div>
    </div>
  );
};

export default Users;
