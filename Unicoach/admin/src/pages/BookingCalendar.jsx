import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, message, Row, Col, Popconfirm, Badge, Tooltip, Table, Tabs, Calendar, Upload } from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, LinkOutlined,
  CalendarOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined,
  VideoCameraOutlined, FileTextOutlined, ApartmentOutlined, EyeOutlined,
  UnorderedListOutlined, UploadOutlined, MailOutlined, PhoneOutlined, GlobalOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import API from '../api/axios';
import { getFormShareLink } from '../config';

const { Option } = Select;
const { TextArea } = Input;

const BookingCalendar = () => {
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'events'
  const [slotViewMode, setSlotViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlotDetail, setSelectedSlotDetail] = useState(null);

  // Event modal state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

  // Selected pipeline stages
  const [selectedPipelineStages, setSelectedPipelineStages] = useState([]);

  const handleMediaUpload = async (file, fieldName) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.url;
      form.setFieldsValue({ [fieldName]: fileUrl });
      message.success('File uploaded successfully!');
    } catch (err) {
      message.error(err.response?.data?.message || 'File upload failed');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, slotsRes, pipelinesRes] = await Promise.all([
        API.get('/admin/bookings/events'),
        API.get('/admin/bookings/slots'),
        API.get('/admin/pipelines')
      ]);
      setEvents(eventsRes.data);
      setSlots(slotsRes.data);
      setPipelines(pipelinesRes.data);
    } catch { message.error('Failed to load booking calendar data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getBookingLink = (slug) => {
    const shareBase = getFormShareLink(slug);
    return shareBase.replace('/f/', '/book/');
  };

  const copyBookingLink = (slug) => {
    const url = getBookingLink(slug);
    navigator.clipboard.writeText(url).then(() => {
      message.success('Booking link copied to clipboard!');
    }).catch(() => {
      Modal.info({ title: 'Shareable Booking Link', content: url });
    });
  };

  const openCreateEvent = () => {
    setEditingEvent(null);
    setSelectedPipelineStages([]);
    form.resetFields();
    setEventModalOpen(true);
  };

  const openEditEvent = (evt) => {
    setEditingEvent(evt);
    const p = pipelines.find(p => p._id === (evt.pipeline?._id || evt.pipeline));
    setSelectedPipelineStages(p?.stages || []);
    form.setFieldsValue({
      title: evt.title,
      subheading: evt.subheading,
      description: evt.description,
      imageUrl: evt.imageUrl,
      videoUrl: evt.videoUrl,
      durationMinutes: evt.durationMinutes || 30,
      startTime: evt.startTime || '10:00',
      endTime: evt.endTime || '18:00',
      pipeline: evt.pipeline?._id || evt.pipeline,
      stageName: evt.stageName,
    });
    setEventModalOpen(true);
  };

  const handlePipelineSelectChange = (pId) => {
    const p = pipelines.find(item => item._id === pId);
    setSelectedPipelineStages(p?.stages || []);
    if (p?.stages?.length > 0) {
      form.setFieldsValue({ stageName: p.stages[0].name });
    }
  };

  const handleSubmitEvent = async () => {
    try {
      const values = await form.validateFields();
      if (editingEvent) {
        await API.put(`/admin/bookings/events/${editingEvent._id}`, values);
        message.success('Booking Event updated!');
      } else {
        await API.post('/admin/bookings/events', values);
        message.success('Booking Event created!');
      }
      setEventModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save booking event');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await API.delete(`/admin/bookings/events/${id}`);
      message.success('Booking Event deleted');
      fetchData();
    } catch { message.error('Failed to delete event'); }
  };

  const handleUpdateSlotStatus = async (slotId, status) => {
    try {
      await API.put(`/admin/bookings/slots/${slotId}`, { status });
      message.success(`Status set to ${status}`);
      fetchData();
    } catch { message.error('Failed to update slot'); }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await API.delete(`/admin/bookings/slots/${slotId}`);
      message.success('Booking slot removed');
      fetchData();
    } catch { message.error('Failed to delete slot'); }
  };

  const slotColumns = [
    { title: 'Student', dataIndex: 'studentName', key: 'studentName', render: (text, r) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{text}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>{r.studentEmail} • {r.studentPhone}</div>
      </div>
    )},
    { title: 'Booking Event', dataIndex: 'bookingEvent', key: 'bookingEvent', render: (evt) => (
      <span className="nx-status nx-status--neutral">{evt?.title || 'Counseling Session'}</span>
    )},
    { title: 'Date & Time Slot', dataIndex: 'bookingDate', key: 'bookingDate', render: (date, r) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>
          <CalendarOutlined style={{ marginRight: 4, color: 'var(--ux-text-3)' }} />
          {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ux-text-2)', fontWeight: 500 }}>
          <ClockCircleOutlined style={{ marginRight: 4, color: 'var(--ux-text-3)' }} />{r.timeSlot}
        </div>
      </div>
    )},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status, record) => (
      <Select value={status} size="small" onChange={(val) => handleUpdateSlotStatus(record._id, val)} style={{ width: 120 }}>
        <Option value="confirmed"><span className="nx-status nx-status--success">Confirmed</span></Option>
        <Option value="completed"><span className="nx-status nx-status--neutral">Completed</span></Option>
        <Option value="cancelled"><span className="nx-status nx-status--danger">Cancelled</span></Option>
      </Select>
    )},
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Popconfirm title="Delete this booking?" onConfirm={() => handleDeleteSlot(r._id)}>
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    )}
  ];

  const dateCellRender = (value) => {
    if (!value || !value.format) return null;
    const cellDateStr = value.format('YYYY-MM-DD');

    const daySlots = slots.filter(s => {
      if (!s.bookingDate) return false;
      let slotDateStr = '';
      if (typeof s.bookingDate === 'string') {
        if (s.bookingDate.includes('T')) {
          slotDateStr = s.bookingDate.split('T')[0];
        } else if (s.bookingDate.includes('-')) {
          const parts = s.bookingDate.split('-');
          if (parts[0].length === 4) slotDateStr = s.bookingDate;
          else if (parts[2].length === 4) slotDateStr = `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
        }
      }
      if (!slotDateStr) {
        const d = new Date(s.bookingDate);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          slotDateStr = `${yyyy}-${mm}-${dd}`;
        }
      }
      return slotDateStr === cellDateStr;
    });

    if (daySlots.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '2px 0' }}>
        {daySlots.map(slot => (
          <div
            key={slot._id}
            onClick={(e) => { e.stopPropagation(); setSelectedSlotDetail(slot); }}
            style={{
              fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
              background: slot.status === 'confirmed' ? 'var(--ux-ink)' : slot.status === 'completed' ? 'var(--ux-brand-soft)' : '#fff1f0',
              color: slot.status === 'confirmed' ? '#ffffff' : slot.status === 'completed' ? 'var(--ux-brand-strong)' : '#dc2626',
              border: 'none',
              cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
          >
            {slot.timeSlot} · {slot.studentName}
          </div>
        ))}
      </div>
    );
  };

  const handleCellRender = (current, info) => {
    if (info && info.type === 'date') return dateCellRender(current);
    if (!info) return dateCellRender(current);
    return info.originNode;
  };

  return (
    <div>
      <Header
        title="Booking calendar"
        subtitle="Manage 1-on-1 counseling links, webinars, video pages, time slot dates & bookings"
        showBack
        backUrl="/crm/pipelines"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateEvent} size="large">
            Create booking event
          </Button>
        }
      />

      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 20 }}
          items={[
            {
              key: 'slots',
              label: (
                <span>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Booked schedules ({slots.length})
                </span>
              ),
              children: (
                <div>
                  {/* View Mode Switcher */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <div style={{ display: 'flex', border: '1px solid var(--ux-line-2)', background: 'var(--ux-surface)', borderRadius: 999, padding: 3 }}>
                      <button
                        onClick={() => setSlotViewMode('calendar')}
                        style={{
                          height: 34, padding: '0 16px', borderRadius: 999, border: 'none',
                          background: slotViewMode === 'calendar' ? 'var(--ux-ink)' : 'transparent',
                          color: slotViewMode === 'calendar' ? '#ffffff' : 'var(--ux-text-2)',
                          fontWeight: 600, fontSize: 12.5, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <CalendarOutlined style={{ marginRight: 6 }} />Calendar view
                      </button>
                      <button
                        onClick={() => setSlotViewMode('table')}
                        style={{
                          height: 34, padding: '0 16px', borderRadius: 999, border: 'none',
                          background: slotViewMode === 'table' ? 'var(--ux-ink)' : 'transparent',
                          color: slotViewMode === 'table' ? '#ffffff' : 'var(--ux-text-2)',
                          fontWeight: 600, fontSize: 12.5, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <UnorderedListOutlined style={{ marginRight: 6 }} />Table view
                      </button>
                    </div>
                  </div>

                  <Card style={{ borderRadius: 24, border: '1px solid var(--ux-line-2)', boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}>
                    {slotViewMode === 'calendar' ? (
                      <div className="overflow-x-auto">
                        <Calendar dateCellRender={dateCellRender} cellRender={handleCellRender} />
                      </div>
                    ) : (
                      <Table rowKey="_id" columns={slotColumns} dataSource={slots} loading={loading} scroll={{ x: 800 }} pagination={{ pageSize: 10 }} />
                    )}
                  </Card>
                </div>
              )
            },
            {
              key: 'events',
              label: (
                <span>
                  <LinkOutlined style={{ marginRight: 6 }} />
                  Booking link templates ({events.length})
                </span>
              ),
              children: (
                <Row gutter={[20, 20]}>
                  {events.map(evt => (
                    <Col xs={24} md={12} lg={8} key={evt._id}>
                      <Card style={{ borderRadius: 24, background: 'var(--ux-surface)', border: '1px solid var(--ux-line-2)', boxShadow: '0 1px 2px rgba(17,17,17,0.03)', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <span className="nx-status nx-status--success" style={{ marginBottom: 8 }}><CheckCircleOutlined /> Active</span>
                            <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: 0 }}>{evt.title}</h3>
                          </div>
                          <Badge count={evt.bookingCount || 0} style={{ backgroundColor: '#DE5C2B' }} />
                        </div>

                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginBottom: 4 }}>
                            <ClockCircleOutlined style={{ marginRight: 6 }} />{evt.durationMinutes} mins slot ({evt.startTime} - {evt.endTime})
                          </div>
                          {evt.videoUrl && (
                            <div style={{ fontSize: 12.5, color: 'var(--ux-ink)', fontWeight: 500, marginBottom: 4 }}>
                              <VideoCameraOutlined style={{ marginRight: 6 }} />Video attached
                            </div>
                          )}
                          <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
                            Pipeline: <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{evt.pipeline?.name || '—'}</strong> ({evt.stageName || 'Stage 1'})
                          </div>
                        </div>

                        {/* Shareable Booking Link */}
                        <div style={{
                          padding: '8px 8px 8px 14px', borderRadius: 14, background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', marginBottom: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        }}>
                          <a
                            href={getBookingLink(evt.slug)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: 11, color: '#DE5C2B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                          >
                            <LinkOutlined style={{ marginRight: 4 }} />{getBookingLink(evt.slug)}
                          </a>
                          <Tooltip title="Copy booking link">
                            <Button size="small" icon={<CopyOutlined />} onClick={() => copyBookingLink(evt.slug)} />
                          </Tooltip>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button size="small" icon={<EditOutlined />} onClick={() => openEditEvent(evt)} style={{ flex: 1 }}>Edit</Button>
                          <Popconfirm title="Delete this booking event?" onConfirm={() => handleDeleteEvent(evt._id)}>
                            <Button size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )
            }
          ]}
        />
      </div>

      {/* ── Create/Edit Event Modal ── */}
      <Modal
        title={editingEvent ? 'Edit booking event' : 'Create booking event'}
        open={eventModalOpen}
        onOk={handleSubmitEvent}
        onCancel={() => setEventModalOpen(false)}
        okText={editingEvent ? 'Update' : 'Create booking link'}
        width={620}
        className="premium-modal"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Event title *" rules={[{ required: true, message: 'Enter event title' }]}>
            <Input placeholder="e.g. 1-on-1 Study Abroad Counseling, USA Visa Guidance" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="subheading" label="Sub-heading">
                <Input placeholder="e.g. Book your free 30-min strategy session" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="durationMinutes" label="Slot duration (minutes)">
                <Select defaultValue={30}>
                  <Option value={15}>15 Minutes</Option>
                  <Option value={30}>30 Minutes</Option>
                  <Option value={45}>45 Minutes</Option>
                  <Option value={60}>60 Minutes</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="imageUrl" label="Cover image (URL or upload)">
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input placeholder="Image URL or upload below" />
                  <Upload
                    showUploadList={false}
                    customRequest={({ file }) => handleMediaUpload(file, 'imageUrl')}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="videoUrl" label="Video (embed URL or upload)">
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input placeholder="YouTube embed or video URL" />
                  <Upload
                    showUploadList={false}
                    customRequest={({ file }) => handleMediaUpload(file, 'videoUrl')}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="startTime" label="Working start time">
                <Input placeholder="10:00" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="endTime" label="Working end time">
                <Input placeholder="18:00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="pipeline" label="Auto-route to pipeline">
                <Select placeholder="Select Pipeline" onChange={handlePipelineSelectChange}>
                  {pipelines.map(p => <Option key={p._id} value={p._id}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="stageName" label="Target stage">
                <Select placeholder="Select Stage">
                  {selectedPipelineStages.map((s, idx) => (
                    <Option key={idx} value={s.name}>{s.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Detailed description / content">
            <TextArea rows={3} placeholder="Provide details about what will be covered in this session..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Slot Detail Modal (when clicking item in calendar cell) ── */}
      <Modal
        title="Booking details"
        open={!!selectedSlotDetail}
        onCancel={() => setSelectedSlotDetail(null)}
        footer={
          <Button type="primary" onClick={() => setSelectedSlotDetail(null)}>
            Close
          </Button>
        }
        width={460}
      >
        {selectedSlotDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ padding: '14px 16px', background: 'var(--ux-surface-2)', borderRadius: 16, border: '1px solid var(--ux-line-2)' }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)' }}>{selectedSlotDetail.studentName}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                <span><MailOutlined style={{ marginRight: 5, color: 'var(--ux-text-3)' }} />{selectedSlotDetail.studentEmail}</span>
                <span><PhoneOutlined style={{ marginRight: 5, color: 'var(--ux-text-3)' }} />{selectedSlotDetail.studentPhone}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '12px 14px', background: 'var(--ux-brand-soft)', borderRadius: 16 }}>
                <span style={{ fontSize: 11.5, color: 'var(--ux-brand-strong)', fontWeight: 600 }}>Time slot</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}><ClockCircleOutlined style={{ marginRight: 6, color: 'var(--ux-brand-strong)' }} />{selectedSlotDetail.timeSlot}</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', borderRadius: 16 }}>
                <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 600 }}>Booking date</span>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}>
                  <CalendarOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />{new Date(selectedSlotDetail.bookingDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>Dream country & intake</label>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}>
                <GlobalOutlined style={{ marginRight: 6, color: 'var(--ux-text-3)' }} />{selectedSlotDetail.dreamCountry || 'Not specified'} ({selectedSlotDetail.preferredIntake || '2026'})
              </div>
            </div>

            {selectedSlotDetail.notes && (
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>Student notes</label>
                <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', padding: '10px 12px', borderRadius: 12, marginTop: 4 }}>
                  {selectedSlotDetail.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingCalendar;
