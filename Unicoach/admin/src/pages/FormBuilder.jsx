import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Segmented, message, Row, Col, Switch, Popconfirm, Badge, Tooltip, Table } from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, LinkOutlined,
  EyeOutlined, FileTextOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CheckCircleOutlined, FormOutlined,
  FontSizeOutlined, MailOutlined, PhoneOutlined, NumberOutlined, AlignLeftOutlined, DownSquareOutlined, CalendarOutlined,
  CheckSquareOutlined, PictureOutlined, SwapOutlined, GlobalOutlined, StarOutlined, ClockCircleOutlined, SafetyCertificateOutlined
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
  { value: 'select', label: 'Choice: pick one (dropdown)', placeholder: 'Select from options' },
  { value: 'date', label: 'Date', placeholder: 'Date picker' },
  { value: 'radio', label: 'Choice: pick one (buttons)', placeholder: 'Pick one option' },
  { value: 'checkbox', label: 'Choice: pick many (checkboxes)', placeholder: 'Tick any options' },
  { value: 'yesno', label: 'Yes / No', placeholder: 'Yes or No' },
  { value: 'country', label: 'Study country', placeholder: 'Pick a country' },
  { value: 'intake', label: 'Intake (month & year)', placeholder: 'e.g. September 2027' },
  { value: 'rating', label: 'Rating (1–5)', placeholder: 'Star rating' },
  { value: 'url', label: 'Link / URL', placeholder: 'https://' },
  { value: 'time', label: 'Time', placeholder: 'Time picker' },
  { value: 'consent', label: 'Consent checkbox', placeholder: 'I agree to…' },
  { value: 'heading', label: 'Section heading', placeholder: 'Title between groups of fields' },
];
const WITH_OPTIONS = ['select', 'radio', 'checkbox'];

// Presentation only: icon shown next to each field type
const FIELD_TYPE_ICONS = {
  text: <FontSizeOutlined />,
  email: <MailOutlined />,
  phone: <PhoneOutlined />,
  number: <NumberOutlined />,
  textarea: <AlignLeftOutlined />,
  select: <DownSquareOutlined />,
  date: <CalendarOutlined />,
  radio: <CheckCircleOutlined />,
  checkbox: <CheckSquareOutlined />,
  yesno: <SwapOutlined />,
  country: <GlobalOutlined />,
  intake: <CalendarOutlined />,
  rating: <StarOutlined />,
  url: <LinkOutlined />,
  time: <ClockCircleOutlined />,
  consent: <SafetyCertificateOutlined />,
  heading: <FontSizeOutlined />,
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
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formPipeline, setFormPipeline] = useState('');
  const [formHeaderTitle, setFormHeaderTitle] = useState('');
  const [formHeaderDesc, setFormHeaderDesc] = useState('');
  const [formHeaderImage, setFormHeaderImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingFieldIdx, setEditingFieldIdx] = useState(null);
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
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldHelp, setNewFieldHelp] = useState('');
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
    setFormOwnerEmail('');
    setFormPipeline('');
    setFormHeaderTitle('');
    setFormHeaderDesc('');
    setFormHeaderImage('');
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
    setFormOwnerEmail(form.ownerEmail || '');
    setFormPipeline(form.pipeline?._id || form.pipeline);
    setFormHeaderTitle(form.headerTitle || '');
    setFormHeaderDesc(form.headerDescription || '');
    setFormHeaderImage(form.headerImage || '');
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
      placeholder: newFieldPlaceholder.trim(),
      helpText: newFieldHelp.trim(),
      options: WITH_OPTIONS.includes(newFieldType) ? newFieldOptions.split(',').map(o => o.trim()).filter(Boolean) : []
    };
    if (WITH_OPTIONS.includes(newFieldType) && field.options.length < 2) return message.warning('Add at least 2 options, separated by commas');
    if (newFieldType === 'heading') field.required = false;
    if (editingFieldIdx !== null) setFields(fields.map((f, i) => (i === editingFieldIdx ? { ...f, ...field } : f)));
    else setFields([...fields, field]);
    setEditingFieldIdx(null);
    setAddFieldModal(false);
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setNewFieldPlaceholder('');
    setNewFieldHelp('');
  };

  const openAddField = () => {
    setEditingFieldIdx(null);
    setNewFieldLabel(''); setNewFieldType('text'); setNewFieldRequired(false);
    setNewFieldOptions(''); setNewFieldPlaceholder(''); setNewFieldHelp('');
    setAddFieldModal(true);
  };
  const openEditField = (idx) => {
    const f = fields[idx];
    setEditingFieldIdx(idx);
    setNewFieldLabel(f.label || ''); setNewFieldType(f.type || 'text'); setNewFieldRequired(!!f.required);
    setNewFieldOptions((f.options || []).join(', ')); setNewFieldPlaceholder(f.placeholder || ''); setNewFieldHelp(f.helpText || '');
    setAddFieldModal(true);
  };
  const uploadHeaderImage = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return message.warning('Image must be under 5 MB');
    const fd = new FormData();
    fd.append('file', file);
    setUploadingImage(true);
    try {
      const { data } = await API.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormHeaderImage(data.url);
      message.success('Header image added');
    } catch (err) {
      message.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };
  const previewCurrent = () => {
    setPreviewForm({ name: formName, headerTitle: formHeaderTitle || formName, headerDescription: formHeaderDesc, headerImage: formHeaderImage, fields, slug: editingForm?.slug });
    setPreviewOpen(true);
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
    const ownerEmail = formOwnerEmail.trim().toLowerCase();
    if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) return message.warning('Owner email sahi nahi hai');
    if (!formName.trim()) return message.warning('Enter form name');
    if (!formPipeline) return message.warning('Select a pipeline');
    if (fields.length === 0) return message.warning('Add at least one field');

    const payload = {
      name: formName.trim(),
      ownerEmail,
      pipeline: formPipeline,
      fields,
      headerTitle: formHeaderTitle || formName,
      headerDescription: formHeaderDesc,
      headerImage: formHeaderImage,
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
                    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Owner: {form.ownerEmail
                        ? <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{form.ownerEmail}</strong>
                        : <span style={{ color: 'var(--ux-text-3)' }}>— (UniCoach)</span>}
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
        footer={(_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Button icon={<EyeOutlined />} onClick={previewCurrent} disabled={!fields.length}>Preview form</Button>
            <Space><CancelBtn /><OkBtn /></Space>
          </div>
        )}
        width={640}
        className="premium-modal"
        destroyOnHidden
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Owner email (mentor / influencer)</label>
            <Input type="email" value={formOwnerEmail} onChange={e => setFormOwnerEmail(e.target.value)} placeholder="e.g. riya@gmail.com" />
            <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 4 }}>
              Jo insaan ye link share karega uska email. Is form ki saari leads iske mentor dashboard par dikhengi, chahe account baad mein bane (Google login se). UniCoach ka apna form hai to khaali chhodo.
            </div>
          </div>

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

          <div>
            <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 6 }}>Header image <span style={{ fontWeight: 400, color: 'var(--ux-text-3)' }}>(optional banner above the heading)</span></label>
            {formHeaderImage ? (
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--ux-line-2)' }}>
                <img src={formHeaderImage} alt="" style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }} />
                <Space style={{ position: 'absolute', top: 8, right: 8 }}>
                  <label className="ant-btn ant-btn-default ant-btn-sm" style={{ cursor: 'pointer' }}>Change<input type="file" accept="image/*" hidden onChange={(e) => uploadHeaderImage(e.target.files?.[0])} /></label>
                  <Button size="small" danger onClick={() => setFormHeaderImage('')}>Remove</Button>
                </Space>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 84, borderRadius: 14, border: '1.5px dashed var(--ux-line-2)', background: 'var(--ux-surface-2)', cursor: 'pointer', fontSize: 13, color: 'var(--ux-text-2)' }}>
                {uploadingImage ? 'Uploading…' : <><PictureOutlined /> Click to upload an image (JPG/PNG, under 5 MB)</>}
                <input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={(e) => uploadHeaderImage(e.target.files?.[0])} />
              </label>
            )}
          </div>


          {/* Fields Editor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13 }}>Form fields ({fields.length})</label>
              <Button size="small" icon={<PlusOutlined />} onClick={openAddField}>
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
                    <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEditField(idx)} title="Edit field" />
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
        title={editingFieldIdx !== null ? 'Edit field' : 'Add form field'}
        open={addFieldModal}
        onOk={addField}
        onCancel={() => setAddFieldModal(false)}
        okText={editingFieldIdx !== null ? 'Save field' : 'Add field'}
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
          {WITH_OPTIONS.includes(newFieldType) && (() => {
            // options kept as a comma string in state; edited here as a list
            const opts = newFieldOptions === '' ? [''] : newFieldOptions.split(',').map((o) => o.trimStart());
            const setOpts = (list) => setNewFieldOptions(list.join(','));
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>How students answer</label>
                  <Segmented
                    block
                    value={newFieldType}
                    onChange={setNewFieldType}
                    options={[
                      { value: 'radio', label: 'Pick one (buttons)' },
                      { value: 'select', label: 'Pick one (dropdown)' },
                      { value: 'checkbox', label: 'Pick many (checkboxes)' },
                    ]}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>Options</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {opts.map((o, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ width: 18, height: 18, flexShrink: 0, border: '2px solid var(--ux-line-2)', borderRadius: newFieldType === 'checkbox' ? 4 : '50%' }} />
                        <Input
                          value={o}
                          placeholder={`Option ${i + 1}`}
                          onChange={(e) => setOpts(opts.map((x, j) => (j === i ? e.target.value.replace(/,/g, ' ') : x)))}
                          onPressEnter={() => setOpts([...opts, ''])}
                        />
                        <Button type="text" danger icon={<DeleteOutlined />} disabled={opts.length <= 1} onClick={() => setOpts(opts.filter((_, j) => j !== i))} />
                      </div>
                    ))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setOpts([...opts, ''])}>Add option</Button>
                  </div>
                </div>
              </div>
            );
          })()}
          {!['heading', 'yesno', 'rating', 'consent', 'country', 'radio', 'checkbox'].includes(newFieldType) && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>Placeholder (optional)</label>
              <Input value={newFieldPlaceholder} onChange={e => setNewFieldPlaceholder(e.target.value)} placeholder="Grey example text inside the box" />
            </div>
          )}
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6 }}>{newFieldType === 'heading' ? 'Small text under the heading (optional)' : newFieldType === 'consent' ? 'Consent text shown next to the tick box' : 'Help text (optional)'}</label>
            <Input value={newFieldHelp} onChange={e => setNewFieldHelp(e.target.value)} placeholder={newFieldType === 'consent' ? 'I agree to be contacted by UniCoach on WhatsApp and email' : 'Shown in small grey text under the field'} />
          </div>
          {newFieldType !== 'heading' && <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Switch checked={newFieldRequired} onChange={setNewFieldRequired} size="small" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ux-text-2)' }}>Required field</span>
          </div>}
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
            {previewForm.headerImage && <img src={previewForm.headerImage} alt="" style={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 16 }} />}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: '0 0 6px' }}>{previewForm.headerTitle || previewForm.name}</h2>
              {previewForm.headerDescription && <p style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{previewForm.headerDescription}</p>}
            </div>
            {previewForm.fields?.map((field, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: field.type === 'heading' ? 700 : 600, fontSize: field.type === 'heading' ? 16 : 13, color: 'var(--ux-ink)', display: 'block', marginBottom: 6, marginTop: field.type === 'heading' ? 8 : 0 }}>
                  {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                {field.helpText && field.type !== 'consent' && <div style={{ fontSize: 12, color: 'var(--ux-text-3)', margin: '-2px 0 6px' }}>{field.helpText}</div>}
                {field.type === 'heading' ? null : ['radio', 'checkbox', 'yesno', 'rating', 'consent'].includes(field.type) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(field.type === 'yesno' ? ['Yes', 'No'] : field.type === 'rating' ? ['★', '★★', '★★★', '★★★★', '★★★★★'] : field.type === 'consent' ? [field.helpText || 'I agree'] : field.options || []).map((o) => (
                      <span key={o} style={{ border: '1px solid var(--ux-line-2)', borderRadius: 999, padding: '4px 12px', fontSize: 12.5 }}>{field.type === 'checkbox' || field.type === 'consent' ? '☐ ' : ''}{o}</span>
                    ))}
                  </div>
                ) : field.type === 'textarea' ? (
                  <TextArea rows={3} placeholder={field.placeholder || field.label} disabled />
                ) : field.type === 'select' || field.type === 'country' ? (
                  <Select placeholder={`Select ${field.label}`} style={{ width: '100%' }} disabled>
                    {field.options?.map((opt, i) => <Option key={i} value={opt}>{opt}</Option>)}
                  </Select>
                ) : (
                  <Input type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'url' ? 'url' : field.type === 'intake' ? 'month' : 'text'}
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
