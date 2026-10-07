import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Dropdown, Menu, Row, Col } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, CodeOutlined, DownOutlined,
  MailOutlined, MessageOutlined, FileTextOutlined, MobileOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { TextArea } = Input;
const { Option } = Select;

const VARIABLE_GROUPS = [
  {
    key: 'personal',
    label: 'Student personal data',
    items: [
      { label: 'Student Full Name', tag: '{{student_name}}', sample: 'Rohan Sharma' },
      { label: 'Student Email ID', tag: '{{student_email}}', sample: 'rohan.sharma@example.com' },
      { label: 'Mobile Number', tag: '{{student_phone}}', sample: '+91 98765 43210' }
    ]
  },
  {
    key: 'academic',
    label: 'Academic & target profile',
    items: [
      { label: 'Dream Destination Country', tag: '{{dream_country}}', sample: 'USA' },
      { label: 'Target Preferred Intake', tag: '{{preferred_intake}}', sample: 'Fall 2026' }
    ]
  },
  {
    key: 'booking',
    label: 'Booking & appointment details',
    items: [
      { label: 'Appointment Date', tag: '{{booking_date}}', sample: '15 Aug 2026' },
      { label: 'Time Slot', tag: '{{slot_time}}', sample: '11:30 AM' }
    ]
  }
];

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [templateType, setTemplateType] = useState('email');
  const [subjectVal, setSubjectVal] = useState('');
  const [bodyVal, setBodyVal] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/templates');
      setTemplates(data);
    } catch {
      message.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTemplateType('email');
    const defaultSub = "Important Update regarding your {{dream_country}} Application";
    const defaultBody = "Dear {{student_name}},\n\nWe saw you are looking to study in {{dream_country}} for {{preferred_intake}}.\n\nOur counseling session is confirmed. We look forward to guiding you!\n\nBest Regards,\nUniCoach Overseas Team";
    setSubjectVal(defaultSub);
    setBodyVal(defaultBody);
    setModalOpen(true);
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({
        type: 'email',
        subject: defaultSub,
        body: defaultBody
      });
    }, 0);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record._id);
    setTemplateType(record.type);
    setSubjectVal(record.subject || '');
    setBodyVal(record.body || '');
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/templates/${id}`);
      message.success('Template deleted successfully!');
      fetchTemplates();
    } catch {
      message.error('Failed to delete template');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await API.put(`/admin/templates/${editingId}`, values);
        message.success('Template updated successfully!');
      } else {
        await API.post('/admin/templates', values);
        message.success('Template created successfully!');
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Validation failed. Please check required fields.');
    }
  };

  const insertVariable = (tag, field = 'body') => {
    const currentVal = form.getFieldValue(field) || '';
    const newVal = currentVal + (currentVal.endsWith(' ') || !currentVal ? '' : ' ') + tag;
    form.setFieldsValue({ [field]: newVal });
    if (field === 'body') setBodyVal(newVal);
    if (field === 'subject') setSubjectVal(newVal);
  };

  const resolveSamplePreview = (text) => {
    if (!text) return '';
    return text
      .replace(/{{student_name}}/g, 'Rohan Sharma')
      .replace(/{{student_email}}/g, 'rohan.sharma@example.com')
      .replace(/{{student_phone}}/g, '+91 98765 43210')
      .replace(/{{dream_country}}/g, 'USA')
      .replace(/{{preferred_intake}}/g, 'Fall 2026')
      .replace(/{{booking_date}}/g, '15 Aug 2026')
      .replace(/{{slot_time}}/g, '11:30 AM');
  };

  const getVariableMenuItems = (field = 'body') =>
    VARIABLE_GROUPS.map((group) => ({
      key: group.key,
      type: 'group',
      label: <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ux-text-3)' }}>{group.label}</span>,
      children: group.items.map((item) => ({
        key: item.tag,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ux-ink)' }}>{item.label}</span>
            <span className="nx-status nx-status--neutral">{item.tag}</span>
          </div>
        ),
        onClick: () => insertVariable(item.tag, field)
      }))
    }));

  const columns = [
    {
      title: 'Template name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{text}</strong>
    },
    {
      title: 'Channel',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="nx-status nx-status--neutral">
          {type === 'email' ? <MailOutlined /> : <MessageOutlined />}
          {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : type}
        </span>
      )
    },
    {
      title: 'Subject / identifier',
      dataIndex: 'subject',
      key: 'subject',
      render: (subj, record) => subj || record.name
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenEdit(record)} aria-label="Edit template" />
          <Popconfirm title="Delete this template?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger aria-label="Delete template" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Header
        title="Communication templates"
        subtitle="Reusable email and WhatsApp templates with dynamic variables"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Create template
          </Button>
        }
      />

      <div className="dashboard-content">
        <div className="page-table-card" style={{ overflowX: 'auto' }}>
          <Table 
            dataSource={templates} 
            columns={columns} 
            rowKey="_id" 
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        </div>

        {/* ── ENTERPRISE 2-COLUMN TEMPLATE STUDIO MODAL ── */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="nx-icon-circle"><FileTextOutlined /></span>
              <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
                {editingId ? 'Edit communication template' : 'Create communication template'}
              </span>
            </div>
          }
          open={modalOpen}
          onOk={handleModalSubmit}
          onCancel={() => setModalOpen(false)}
          okText="Save template"
          width={880}
          destroyOnHidden
          style={{ top: 20 }}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
            <Row gutter={[24, 24]}>
              
              {/* LEFT COLUMN: EDITOR FORM (55%) */}
              <Col xs={24} md={14}>
                <div style={{ paddingRight: 10 }}>
                  
                  <Form.Item
                    name="name"
                    label={<span style={{ fontWeight: 600 }}>Template name</span>}
                    rules={[{ required: true, message: 'Please input template name' }]}
                  >
                    <Input placeholder="e.g. Welcome Email, Visa Instructions, WhatsApp Booking Alert" />
                  </Form.Item>

                  <Form.Item name="type" label={<span style={{ fontWeight: 600 }}>Communication channel</span>} rules={[{ required: true }]}>
                    <Select onChange={(value) => setTemplateType(value)}>
                      <Option value="email">Email Campaign</Option>
                      <Option value="whatsapp">WhatsApp Message</Option>
                    </Select>
                  </Form.Item>

                  {templateType === 'email' && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>Email subject line *</label>
                        <Dropdown menu={{ items: getVariableMenuItems('subject') }} trigger={['click']} placement="bottomRight">
                          <Button type="link" size="small" icon={<CodeOutlined />}>
                            Subject variable
                          </Button>
                        </Dropdown>
                      </div>
                      <Form.Item name="subject" rules={[{ required: true, message: 'Please input subject' }]} style={{ marginBottom: 0 }}>
                        <Input
                          placeholder="e.g. Hello {{student_name}}, update regarding {{dream_country}}"
                          value={subjectVal}
                          onChange={e => { setSubjectVal(e.target.value); form.setFieldsValue({ subject: e.target.value }); }}
                        />
                      </Form.Item>
                    </div>
                  )}

                  {/* Body Textarea with Professional Variable Dropdown */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>Message body *</label>
                      <Dropdown menu={{ items: getVariableMenuItems('body') }} trigger={['click']} placement="bottomRight">
                        <Button
                          size="small"
                          icon={<CodeOutlined />}
                        >
                          Personalize variable <DownOutlined style={{ fontSize: 9 }} />
                        </Button>
                      </Dropdown>
                    </div>

                    <Form.Item name="body" rules={[{ required: true, message: 'Please input template body' }]}>
                      <TextArea
                        rows={6}
                        placeholder="Write content..."
                        value={bodyVal}
                        onChange={e => { setBodyVal(e.target.value); form.setFieldsValue({ body: e.target.value }); }}
                        style={{ fontSize: 13, padding: 12 }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </Col>

              {/* RIGHT COLUMN: LIVE REAL-TIME PREVIEW (45%) */}
              <Col xs={24} md={10}>
                <div className="nx-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>
                      Live preview · {templateType === 'email' ? 'Email' : 'WhatsApp'}
                    </span>
                    <span className="nx-status nx-status--neutral">Sample: Rohan Sharma</span>
                  </div>

                  <div style={{ background: 'var(--ux-surface-2)', borderRadius: 16, padding: 16 }}>
                    {templateType === 'email' ? (
                      <div>
                        <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginBottom: 4, lineHeight: 1.5 }}>
                          <strong>From:</strong> UniCoach Team &lt;admissions@unicoach.com&gt;<br />
                          <strong>To:</strong> Rohan Sharma &lt;rohan.sharma@example.com&gt;
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)', padding: '8px 0', borderTop: '1px solid var(--ux-line)', borderBottom: '1px solid var(--ux-line)', marginBottom: 10 }}>
                          Subject: {resolveSamplePreview(subjectVal) || 'Subject Line Preview'}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--ux-text)', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                          {resolveSamplePreview(bodyVal) || 'Message body content...'}
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#ffffff', border: '1px solid var(--ux-line-2)', padding: 12, borderRadius: '4px 16px 16px 16px', fontSize: 12.5, color: 'var(--ux-text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {resolveSamplePreview(bodyVal) || 'WhatsApp message preview...'}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>

      </div>
    </div>
  );
};

export default Templates;
