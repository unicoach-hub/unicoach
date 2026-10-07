import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Switch,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
  ReloadOutlined,
  TrophyOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { exportScholarshipsToExcel } from '../utils/excelExporter';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';

const { Option } = Select;

const Scholarships = () => {
  const cachedScholarships = getCachedData('/admin/scholarships:list');
  const [scholarships, setScholarships] = useState(cachedScholarships || []);
  const [loading, setLoading] = useState(!cachedScholarships);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [fundingFilter, setFundingFilter] = useState('All');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchScholarships = async (force = false) => {
    if (!getCachedData('/admin/scholarships:list') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/scholarships:list',
        async () => {
          const res = await API.get('/scholarships?limit=200');
          return res.data?.scholarships || [];
        },
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setScholarships(fresh);
          }
        }
      );
      setScholarships(data);
    } catch (err) {
      message.error('Failed to load scholarships: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingScholarship(null);
    form.resetFields();
    form.setFieldsValue({
      country: 'USA',
      fundingType: 'Partial Tuition Waiver',
      coverageLevel: 'Partial',
      awardAmountUSD: 10000,
      minGpaPercent: 75,
      minIeltsScore: 6.5,
      degreeLevels: ['Masters'],
      featured: false,
      deadlineDate: dayjs().add(90, 'day')
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingScholarship(record);
    form.resetFields();
    form.setFieldsValue({
      title: record.title,
      country: record.country,
      provider: record.provider,
      fundingType: record.fundingType,
      coverageLevel: record.coverageLevel,
      awardAmountUSD: record.awardAmountUSD,
      awardAmountString: record.awardAmountString,
      deadlineDate: record.deadlineDate ? dayjs(record.deadlineDate) : null,
      degreeLevels: record.eligibility?.degreeLevels || ['Masters'],
      minGpaPercent: record.eligibility?.minGpa?.percentage || 75,
      minIeltsScore: record.eligibility?.minIelts || 6.5,
      applicationPortalUrl: record.applicationProcess?.applicationPortalUrl || record.verifiedSource || '',
      description: record.description,
      featured: record.featured
    });
    setIsModalOpen(true);
  };

  const handleSaveScholarship = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        title: values.title,
        country: values.country,
        provider: values.provider,
        fundingType: values.fundingType,
        coverageLevel: values.coverageLevel,
        awardAmountUSD: values.awardAmountUSD,
        awardAmountString: values.awardAmountString || `$${values.awardAmountUSD?.toLocaleString()} USD`,
        deadlineDate: values.deadlineDate ? values.deadlineDate.toISOString() : null,
        eligibility: {
          degreeLevels: values.degreeLevels || ['Masters'],
          minGpa: { percentage: values.minGpaPercent || 75 },
          minIelts: values.minIeltsScore || 6.5
        },
        applicationProcess: {
          applicationPortalUrl: values.applicationPortalUrl
        },
        verifiedSource: values.applicationPortalUrl,
        description: values.description,
        featured: values.featured
      };

      if (editingScholarship) {
        await API.put(`/scholarships/${editingScholarship._id}`, payload);
        message.success('Scholarship updated successfully!');
      } else {
        await API.post('/scholarships', payload);
        message.success('Scholarship created successfully!');
      }

      invalidateCache('/admin/scholarships');
      invalidateCache('/admin/stats');
      setIsModalOpen(false);
      fetchScholarships(true);
    } catch (err) {
      message.error('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/scholarships/${id}`);
      message.success('Scholarship deleted');
      invalidateCache('/admin/scholarships');
      invalidateCache('/admin/stats');
      setScholarships(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      message.error('Failed to delete scholarship');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await API.patch(`/scholarships/${id}/toggle-featured`);
      message.success(res.data.message || 'Featured status updated');
      invalidateCache('/admin/scholarships');
      setScholarships(prev =>
        prev.map(s => (s._id === id ? { ...s, featured: res.data.featured } : s))
      );
    } catch (err) {
      message.error('Failed to toggle featured status');
    }
  };

  const handleExportCSV = () => {
    if (scholarships.length === 0) {
      message.warning('No scholarships to export');
      return;
    }
    const headers = ['Title', 'Country', 'Funding Type', 'Award Amount (USD)', 'Deadline Date', 'Featured', 'Shortlists', 'Views'];
    const rows = scholarships.map(s => [
      `"${(s.title || '').replace(/"/g, '""')}"`,
      `"${s.country || ''}"`,
      `"${s.fundingType || ''}"`,
      s.awardAmountUSD || 0,
      s.deadlineDate ? dayjs(s.deadlineDate).format('YYYY-MM-DD') : 'Rolling',
      s.featured ? 'Yes' : 'No',
      s.shortlistCount || 0,
      s.viewsCount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unicoach_scholarships_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Exported scholarships to CSV');
  };

  // Filtering
  const filteredScholarships = scholarships.filter(item => {
    const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.country?.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === 'All' || item.country?.toLowerCase() === countryFilter.toLowerCase();
    const matchesFunding = fundingFilter === 'All' || item.fundingType === fundingFilter;
    return matchesSearch && matchesCountry && matchesFunding;
  });

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 55,
      align: 'center',
      render: (_, __, index) => (
        <span className="font-semibold text-xs text-[var(--ux-text-3)]">
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      )
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      width: 80,
      align: 'center',
      render: (featured, record) => (
        <button
          onClick={() => handleToggleFeatured(record._id)}
          className="cursor-pointer w-9 h-9 rounded-full hover:bg-[var(--ux-surface-2)] transition-colors border-0 bg-transparent flex items-center justify-center mx-auto"
          title={featured ? 'Featured on Website Homepage (Click to disable)' : 'Click to feature on Website Homepage'}
        >
          {featured ? <StarFilled style={{ color: 'var(--ux-brand)', fontSize: '17px' }} /> : <StarOutlined style={{ color: 'var(--ux-text-3)', fontSize: '17px' }} />}
        </button>
      )
    },
    {
      title: 'Scholarship Name & Provider',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="py-1">
          <div className="font-semibold text-[var(--ux-ink)] text-sm leading-snug">
            {text}
          </div>
          <div className="text-xs text-[var(--ux-text-2)] font-medium flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ux-text-3)] inline-block"></span>
            <span>
              {record.provider && record.provider.toLowerCase() !== record.country?.toLowerCase() 
                ? record.provider 
                : 'Verified Academic / Institutional Grant'}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 110,
      render: (country) => (
        <span className="nx-status nx-status--neutral">
          {country || 'Global'}
        </span>
      )
    },
    {
      title: 'Funding Type & Value',
      dataIndex: 'fundingType',
      key: 'fundingType',
      width: 200,
      render: (type, record) => (
        <div className="flex flex-col items-start gap-1.5">
          <span className="nx-status nx-status--neutral">
            {type || 'Partial Tuition Waiver'}
          </span>
          <div className="font-semibold text-[13px] text-[var(--ux-ink)] flex items-center gap-1">
            <span>{record.awardAmountString || (record.awardAmountUSD ? `$${record.awardAmountUSD?.toLocaleString()} USD` : 'Varies / 100% Tuition')}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Cutoff Deadline',
      dataIndex: 'deadlineDate',
      key: 'deadlineDate',
      width: 150,
      render: (date) => {
        if (!date) {
          return (
            <span className="nx-status nx-status--neutral">
              <ReloadOutlined /> Rolling Basis
            </span>
          );
        }
        const d = dayjs(date);
        const daysLeft = d.diff(dayjs(), 'day');
        const isPast = daysLeft < 0;
        const isUrgent = daysLeft >= 0 && daysLeft <= 30;
        return (
          <div className="flex flex-col items-start gap-1.5">
            <div className="text-[13px] font-medium text-[var(--ux-ink)] flex items-center gap-1.5">
              <CalendarOutlined className="text-[var(--ux-text-3)]" />
              <span>{d.format('MMM DD, YYYY')}</span>
            </div>
            <span className={`nx-status ${
              isPast
                ? 'nx-status--neutral'
                : isUrgent
                  ? 'nx-status--danger'
                  : 'nx-status--success'
            }`}>
              {isPast ? 'Closed' : `${daysLeft}d left`}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Metrics',
      key: 'metrics',
      width: 120,
      render: (_, record) => (
        <div className="space-y-1 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-[var(--ux-text-2)]">
            <BookOutlined className="text-[var(--ux-text-3)]" />
            <span>{record.shortlistCount || 0} Saved</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--ux-text-2)]">
            <EyeOutlined className="text-[var(--ux-text-3)]" />
            <span>{record.viewsCount || 0} Views</span>
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Edit Scholarship">
            <button
              onClick={() => handleOpenEditModal(record)}
              className="action-btn action-btn--edit"
            >
              <EditOutlined className="text-sm" />
            </button>
          </Tooltip>
          <Popconfirm
            title="Delete this scholarship?"
            description="Are you sure? This will remove it from student shortlists."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Scholarship">
              <button
                className="action-btn action-btn--delete"
              >
                <DeleteOutlined className="text-sm" />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header
        title="Scholarships & Financial Aid Management"
        subtitle="Control live scholarships, cutoff deadlines, award criteria, and featured listings."
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            aria-label="Add scholarship"
          >
            <span className="hidden sm:inline">Add Scholarship</span>
          </Button>
        }
      />

      <div className="dashboard-content">
      {/* Top Metrics Cards with Skeleton Support */}
      <div className="page-stats-grid page-stats-grid--4" style={{ gap: 16, marginBottom: 16 }}>
        <StatsCard
          icon={<TrophyOutlined />}
          label="Total Scholarships"
          value={scholarships.length}
          color="indigo"
          loading={loading}
        />
        <StatsCard
          icon={<StarFilled />}
          label="Featured on Homepage"
          value={scholarships.filter(s => s.featured).length}
          color="amber"
          loading={loading}
        />
        <StatsCard
          icon={<DollarOutlined />}
          label="Full Ride & Need-Based"
          value={scholarships.filter(s => {
            const t = (s.fundingType || '').toLowerCase();
            const tit = (s.title || '').toLowerCase();
            return t.includes('full') || t.includes('need') || t.includes('100') || tit.includes('need') || tit.includes('full');
          }).length}
          color="emerald"
          loading={loading}
        />
        <StatsCard
          icon={<ClockCircleOutlined />}
          label="Active / Rolling Clocks"
          value={scholarships.filter(s => !s.deadlineDate || dayjs(s.deadlineDate).isAfter(dayjs()) || s.deadlineType === 'Rolling').length}
          color="cyan"
          loading={loading}
        />
      </div>

      {/* Action Toolbar */}
      <div className="nx-toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Input
            prefix={<SearchOutlined className="text-[var(--ux-text-3)]" />}
            placeholder="Search scholarship name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
            allowClear
          />

          <Select
            value={countryFilter}
            onChange={setCountryFilter}
            className="w-36"
          >
            <Option value="All">All Countries</Option>
            <Option value="USA">USA</Option>
            <Option value="UK">UK</Option>
            <Option value="Canada">Canada</Option>
            <Option value="Germany">Germany</Option>
            <Option value="Australia">Australia</Option>
            <Option value="Ireland">Ireland</Option>
          </Select>

          <Select
            value={fundingFilter}
            onChange={setFundingFilter}
            className="w-48"
          >
            <Option value="All">All Funding Types</Option>
            <Option value="Full Ride">Full Ride (100%)</Option>
            <Option value="Partial Tuition Waiver">Partial Tuition Waiver</Option>
            <Option value="Need-Based Aid">Need-Based Aid</Option>
            <Option value="Government Grant">Government Grant</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchScholarships}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto md:justify-end">
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportScholarshipsToExcel(filteredScholarships)}
          >
            Export Excel
          </Button>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="page-table-card">
        <Table
          columns={columns}
          dataSource={filteredScholarships}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 950 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            showTotal: (total) => `Total ${total} scholarships`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize })
          }}
          className="admin-scholarships-table"
        />
      </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--ux-line-2)]">
            <span className="nx-icon-circle">
              <TrophyOutlined />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--ux-ink)]">
              {editingScholarship ? 'Edit Scholarship Listing' : 'Create New Scholarship'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveScholarship}
        confirmLoading={submitting}
        okText={editingScholarship ? 'Save Changes' : 'Create Scholarship'}
        width={760}
        centered
        destroyOnClose
        styles={{
          body: {
            maxHeight: 'calc(80vh - 100px)',
            overflowY: 'auto',
            paddingRight: '12px',
            marginTop: '12px',
            marginBottom: '12px'
          }
        }}
      >
        <Form form={form} layout="vertical" className="space-y-4">
          {/* Section 1: General Details */}
          <div className="bg-[var(--ux-surface-2)] p-4 rounded-[18px] border border-[var(--ux-line-2)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--ux-ink)] tracking-[-0.01em] flex items-center gap-2">
              <FileTextOutlined className="text-[var(--ux-text-3)]" /> General Information
            </h4>
            <Form.Item
              name="title"
              label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Scholarship Title</span>}
              rules={[{ required: true, message: 'Title is required' }]}
              className="mb-2"
            >
              <Input placeholder="e.g., Fulbright Foreign Student Program" className="rounded-xl" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Destination Country</span>}
                  rules={[{ required: true, message: 'Country is required' }]}
                  className="mb-2"
                >
                  <Select className="rounded-xl">
                    <Option value="USA">USA</Option>
                    <Option value="UK">UK</Option>
                    <Option value="Canada">Canada</Option>
                    <Option value="Germany">Germany</Option>
                    <Option value="Australia">Australia</Option>
                    <Option value="Ireland">Ireland</Option>
                    <Option value="Global">Global / Multi-country</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="provider" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Provider / Organization</span>}
                  className="mb-2"
                >
                  <Input placeholder="e.g., US Department of State" className="rounded-xl" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="applicationPortalUrl" 
              label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Application Portal / Official URL</span>}
              className="mb-0"
            >
              <Input placeholder="https://example.org/apply" className="rounded-xl" />
            </Form.Item>
          </div>

          {/* Section 2: Funding & Value */}
          <div className="bg-[var(--ux-surface-2)] p-4 rounded-[18px] border border-[var(--ux-line-2)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--ux-ink)] tracking-[-0.01em] flex items-center gap-2">
              <DollarOutlined className="text-[var(--ux-text-3)]" /> Funding & Award Value
            </h4>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item 
                  name="fundingType" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Funding Type</span>}
                  className="mb-2"
                >
                  <Select className="rounded-xl">
                    <Option value="Full Ride">Full Ride (100% Tuition + Living)</Option>
                    <Option value="Partial Tuition Waiver">Partial Tuition Waiver</Option>
                    <Option value="Need-Based Aid">Need-Based Aid</Option>
                    <Option value="Government Grant">Government Grant</Option>
                    <Option value="Merit-Based Scholarship">Merit-Based Scholarship</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="awardAmountUSD" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Estimated Value (USD)</span>}
                  className="mb-2"
                >
                  <InputNumber
                    className="w-full rounded-xl"
                    prefix="$"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item 
              name="awardAmountString" 
              label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Display Value Text (Optional override)</span>}
              tooltip="e.g. '$20,000 / year' or 'Full Tuition + $1,500/mo stipend'"
              className="mb-0"
            >
              <Input placeholder="e.g., Full Tuition Waiver + Living Expenses" className="rounded-xl" />
            </Form.Item>
          </div>

          {/* Section 3: Eligibility & Requirements */}
          <div className="bg-[var(--ux-surface-2)] p-4 rounded-[18px] border border-[var(--ux-line-2)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--ux-ink)] tracking-[-0.01em] flex items-center gap-2">
              <SafetyCertificateOutlined className="text-[var(--ux-text-3)]" /> Admission & Academic Eligibility
            </h4>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item 
                  name="degreeLevels" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Eligible Degree Levels</span>}
                  className="mb-2"
                >
                  <Select mode="multiple" className="rounded-xl" placeholder="Select degrees">
                    <Option value="Bachelors">Bachelors</Option>
                    <Option value="Masters">Masters (MS/MSc/MA)</Option>
                    <Option value="MBA">MBA</Option>
                    <Option value="PhD">PhD / Doctorate</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item 
                  name="minGpaPercent" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Min GPA / Percentage</span>}
                  className="mb-0"
                >
                  <InputNumber min={40} max={100} suffix="%" className="w-full rounded-xl" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="minIeltsScore" 
                  label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Min IELTS / English Score</span>}
                  className="mb-0"
                >
                  <InputNumber min={5.0} max={9.0} step={0.5} className="w-full rounded-xl" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Section 4: Deadlines & Description */}
          <div className="bg-[var(--ux-surface-2)] p-4 rounded-[18px] border border-[var(--ux-line-2)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--ux-ink)] tracking-[-0.01em] flex items-center gap-2">
              <CalendarOutlined className="text-[var(--ux-text-3)]" /> Timeline & Overview
            </h4>
            <Form.Item 
              name="deadlineDate" 
              label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Official Deadline Date</span>}
              tooltip="Leave empty for Rolling Deadlines"
              className="mb-2"
            >
              <DatePicker className="w-full rounded-xl" format="YYYY-MM-DD" placeholder="Select cutoff date or leave empty for Rolling" />
            </Form.Item>

            <Form.Item 
              name="description" 
              label={<span className="text-xs font-semibold text-[var(--ux-text-2)]">Description & Selection Notes</span>}
              className="mb-0"
            >
              <Input.TextArea rows={2} placeholder="Brief summary of eligibility and benefits..." className="rounded-xl" />
            </Form.Item>
          </div>

          {/* Section 5: Homepage Feature */}
          <div className="p-3.5 bg-white border border-[var(--ux-line-2)] rounded-[18px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="nx-icon-circle">
                <StarFilled style={{ color: 'var(--ux-brand)' }} />
              </span>
              <div>
                <div className="font-semibold text-[var(--ux-ink)] text-sm">Feature on Student Homepage</div>
                <div className="text-xs text-[var(--ux-text-2)] font-medium">Spotlight this scholarship at the top of the student directory</div>
              </div>
            </div>
            <Form.Item name="featured" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Scholarships;
