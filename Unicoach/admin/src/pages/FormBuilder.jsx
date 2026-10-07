import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, message, Row, Col, Switch, Popconfirm, Badge, Tooltip, Table } from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, LinkOutlined,
  EyeOutlined, FileTextOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CheckCircleOutlined, FormOutlined,
  FontSizeOutlined, MailOutlined, PhoneOutlined, NumberOutlined, AlignLeftOutlined, DownSquareOutlined, CalendarOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import API from '../api/axios';
import { getFormShareLink } from '../config';

const { Option } = Select;
const { TextArea } = Input;

const FIELD_TYPES = [
  { value: 'text', label: 'Text', placeholder: 'Single line text' },
  { value: 'email', label: 'Email', placeholder: 'Email address' },
  { value: 'phone', label: 'Phone', placeholder: 'Phone number' },
  { value: 'number', label: 'Number', placeholder: 'Numeric value' },
  { value: 'textarea', label: 'Long text', placeholder: 'Multi-line text' },
  { value: 'select', label: 'Dropdown', placeholder: 'Select from options' },
  { value: 'date', label: 'Date', placeholder: 'Date picker' },
];

// Presentation only: icon shown next to each field type
const FIELD_TYPE_ICONS = {
  text: <FontSizeOutlined />,
  email: <MailOutlined />,
  phone: <PhoneOutlined />,
  number: <NumberOutlined />,
  textarea: <AlignLeftOutlined />,
  select: <DownSquareOutlined />,
  date: <CalendarOutlined />,
};

const FormBuilder = () => {
  const [forms, setForms] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);

  // Form builder state
  const [formName, setFormName] = useState('');
  const [formPipeline, setFormPipeline] = useState('');
  const [formHeaderTitle, setFormHeaderTitle] = useState('');
  const [formHeaderDesc, setFormHeaderDesc] = useState('');
  const [formSuccessMsg, setFormSuccessMsg] = useState('');
  const [fields, setFields] = useState([
    { label: 'Full Name', type: 'text', required: true, placeholder: '', options: [] },
    { label: 'Email', type: 'email', required: true, placeholder: '', options: [] },
    { label: 'Phone', type: 'phone', required: true, placeholder: '', options: [] },
  ]);

  // Add field state
  const [addFieldModal, setAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, pipelinesRes] = await Promise.all([
        API.get('/admin/forms'),
        API.get('/admin/pipelines')
      ]);
      setForms(formsRes.data);
      setPipelines(pipelinesRes.data);
    } catch { message.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetFormState = () => {
    setFormName('');
    setFormPipeline('');
    setFormHeaderTitle('');
    setFormHeaderDesc('');
    setFormSuccessMsg('');
    setFields([
      { label: 'Full Name', type: 'text', required: true, placeholder: '', options: [] },
      { label: 'Email', type: 'email', required: true, placeholder: '', options: [] },
      { label: 'Phone', type: 'phone', required: true, placeholder: '', options: [] },
    ]);
  };

  const openCreate = () => {
    setEditingForm(null);
    resetFormState();
    setModalOpen(true);
  };

  const openEdit = (form) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormPipeline(form.pipeline?._id || form.pipeline);
    setFormHeaderTitle(form.headerTitle || '');
    setFormHeaderDesc(form.headerDescription || '');
    setFormSuccessMsg(form.successMessage || '');
    setFields(form.fields.map(f => ({ ...f, options: f.options || [] })));
    setModalOpen(true);
  };

  const addField = () => {
    if (!newFieldLabel.trim()) return message.warning('Enter field label');
    const field = {
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: '',
      options: newFieldType === 'select' ? newFieldOptions.split(',').map(o => o.trim()).filter(Boolean) : []
    };
    setFields([...fields, field]);
    setAddFieldModal(false);
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
  };

  const removeField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const moveField = (idx, direction) => {
    const newFields = [...fields];
    const target = idx + direction;
    if (target < 0 || target >= newFields.length) return;
    [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
    setFields(newFields);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return message.warning('Enter form name');
    if (!formPipeline) return message.warning('Select a pipeline');
    if (fields.length === 0) return message.warning('Add at least one field');

    const payload = {
      name: formName.trim(),
      pipeline: formPipeline,
      fields,
      headerTitle: formHeaderTitle || formName,
      headerDescription: formHeaderDesc,
      successMessage: formSuccessMsg || 'Thank you! Your response has been recorded.'
    };

    try {
      if (editingForm) {
        await API.put(`/admin/forms/${editingForm._id}`, payload);
        message.success('Form updated!');
      } else {
        await API.post('/admin/forms', payload);
        message.success('Form created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save form');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/forms/${id}`);
      message.success('Form deleted');
      fetchData();
    } catch { message.error('Failed to delete form'); }
  };

  const getFormLink = (slug) => {
    return getFormShareLink(slug);
  };

  const copyLink = (slug) => {
    const url = getFormShareLink(slug);
    navigator.clipboard.writeText(url).then(() => {
      message.success('Form link copied to clipboard!');
    }).catch(() => {
      Modal.info({ title: 'Shareable Form Link', content: url });
    });
  };

  return (
    <div>
      <Header
        title="Form builder"
        subtitle="Create custom forms with shareable links — submissions auto-flow into your pipelines"
        showBack
        backUrl="/crm/pipelines"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size="large">
            Create form
          </Button>
        }
      />

      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        {forms.length === 0 && !loading ? (
          <Card style={{ borderRadius: 24, textAlign: 'center', padding: '48px 20px', border: '1.5px dashed var(--ux-line)', boxShadow: 'none' }}>
            <span className="nx-icon-circle" style={{ width: 56, height: 56, fontSize: 22, margin: '0 auto 16px' }}><FormOutlined /></span>
            <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>No forms yet</h3>
            <p style={{ color: 'var(--ux-text-3)', marginBottom: 20 }}>Create your first form to start capturing leads</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Create form</Button>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {forms.map(form => (
              <Col xs={24} md={12} lg={8} key={form._id}>
                <Card style={{ borderRadius: 24, background: 'var(--ux-surface)', border: '1px solid var(--ux-line-2)', boxShadow: '0 1px 2px rgba(17,17,17,0.03)', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className={`nx-status ${form.active ? 'nx-status--success' : 'nx-status--neutral'}`} style={{ marginBottom: 8 }}>
                        {form.active ? <CheckCircleOutlined /> : null}
                        {form.active ? 'Active' : 'Inactive'}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: 0 }}>{form.name}</h3>
                    </div>
                    <Badge count={form.submissionCount || 0} style={{ backgroundColor: '#DE5C2B' }} />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginBottom: 4 }}>
                      <FileTextOutlined style={{ marginRight: 6 }} />{form.fields?.length || 0} fields
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
                      Pipeline: <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{form.pipeline?.name || '—'}</strong>
                    </div>
                  </div>

                  {/* Shareable Link */}
                  <div style={{
                    padding: '8px 8px 8px 14px', borderRadius: 14,
                    background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', marginBottom: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}>
                    <a
                      href={getFormLink(form.slug)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: '#DE5C2B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                    >
                      <LinkOutlined style={{ marginRight: 4 }} />{getFormLink(form.slug)}
                    </a>
                    <Tooltip title="Copy link">
                      <Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(form.slug)} />
                    </Tooltip>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(form)} style={{ flex: 1 }}>Edit</Button>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => { setPreviewForm(form); setPreviewOpen(true); }} style={{ flex: 1 }}>Preview</Button>
                    <Popconfirm title="Delete this form?" onConfirm={() => handleDelete(form._id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ── Create/Edit Form Modal ── */}
      <Modal
        title={editingForm ? 'Edit form' : 'Create form'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingForm ? 'Update form' : 'Create form'}
        width={640}
        className="premium-modal"
        destroyOnHidden
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Form name *</label>
            <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Study Abroad Inquiry" />
          </div>

          <div>
            <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Pipeline (submissions go here) *</label>
            <Select value={formPipeline} onChange={setFormPipeline} style={{ width: '100%' }} placeholder="Select pipeline">
              {pipelines.map(p => <Option key={p._id} value={p._id}>{p.name} ({p.stages?.length} stages)</Option>)}
            </Select>
          </div>

          <Row gutter={[12, 16]}>
            <Col xs={24} sm={12}>
              <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Header title</label>
              <Input value={formHeaderTitle} onChange={e => setFormHeaderTitle(e.target.value)} placeholder="Submit Your Details" />
            </Col>
            <Col xs={24} sm={12}>
              <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Success message</label>
              <Input value={formSuccessMsg} onChange={e => setFormSuccessMsg(e.target.value)} placeholder="Thank you!" />
            </Col>
          </Row>

          <div>
            <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Description</label>
            <Input value={formHeaderDesc} onChange={e => setFormHeaderDesc(e.target.value)} placeholder="Optional description shown on the form page" />
          </div>

          {/* Fields Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13 }}>Form fields ({fields.length})</label>
              <Button size="small" icon={<PlusOutlined />} onClick={() => setAddFieldModal(true)}>
                Add field
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((field, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px 8px 8px', borderRadius: 16,
                  background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)',
                }}>
                  <span className="nx-icon-circle" style={{ width: 34, height: 34, minWidth: 34, fontSize: 14, background: '#fff' }}>{FIELD_TYPE_ICONS[field.type] || <FontSizeOutlined />}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>{field.label}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginLeft: 2 }}>{field.type}</span>
                    {field.required && <span className="nx-status nx-status--accent" style={{ height: 20, fontSize: 10.5 }}>Required</span>}
                  </div>
                  <Space size="small">
                    <Button size="small" type="text" icon={<ArrowUpOutlined />} onClick={() => moveField(idx, -1)} disabled={idx === 0} />
                    <Button size="small" type="text" icon={<ArrowDownOutlined />} onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} />
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeField(idx)} />
                  </Space>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Add Field Modal ── */}
      <Modal
        title="Add form field"
        open={addFieldModal}
        onOk={addField}
        onCancel={() => setAddFieldModal(false)}
        okText="Add field"
        className="premium-modal"
        destroyOnHidden
        width={440}
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>Field label *</label>
            <Input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} placeholder="e.g. Dream Country, Preferred Intake" />
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>Field type</label>
            <Select value={newFieldType} onChange={setNewFieldType} style={{ width: '100%' }}>
              {FIELD_TYPES.map(t => <Option key={t.value} value={t.value}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{FIELD_TYPE_ICONS[t.value]} {t.label}</span></Option>)}
            </Select>
          </div>
          {newFieldType === 'select' && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>Dropdown options (comma-separated)</label>
              <Input value={newFieldOptions} onChange={e => setNewFieldOptions(e.target.value)} placeholder="e.g. USA, UK, Canada, Australia" />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Switch checked={newFieldRequired} onChange={setNewFieldRequired} size="small" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ux-text-2)' }}>Required field</span>
          </div>
        </div>
      </Modal>

      {/* ── Form Preview Modal ── */}
      <Modal
        title="Form preview"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={480}
        className="premium-modal"
        destroyOnHidden
      >
        {previewForm && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: '0 0 6px' }}>{previewForm.headerTitle || previewForm.name}</h2>
              {previewForm.headerDescription && <p style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{previewForm.headerDescription}</p>}
            </div>
            {previewForm.fields?.map((field, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>
                  {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <TextArea rows={3} placeholder={field.placeholder || field.label} disabled />
                ) : field.type === 'select' ? (
                  <Select placeholder={`Select ${field.label}`} style={{ width: '100%' }} disabled>
                    {field.options?.map((opt, i) => <Option key={i} value={opt}>{opt}</Option>)}
                  </Select>
                ) : (
                  <Input type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.placeholder || field.label} disabled
                  />
                )}
              </div>
            ))}
            <Button type="primary" block size="large" style={{ marginTop: 8 }} disabled>
              Submit
            </Button>
            <div style={{ marginTop: 16, padding: '8px 8px 8px 14px', background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <a href={getFormLink(previewForm.slug)} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#DE5C2B', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                <LinkOutlined style={{ marginRight: 4 }} /> {getFormLink(previewForm.slug)}
              </a>
              <Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(previewForm.slug)}>Copy link</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FormBuilder;
