import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Switch, Popconfirm, Checkbox, Radio, Space, message, Tooltip,
} from 'antd';
import {
  UserAddOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined, TeamOutlined, KeyOutlined, CopyOutlined,
  CameraOutlined, LoadingOutlined, CheckOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import StaffAvatar from '../components/StaffAvatar';

const ACTION_COLUMNS = [
  ['view', 'View'],
  ['create', 'Create'],
  ['update', 'Edit'],
  ['delete', 'Delete'],
];

const full = { view: true, create: true, update: true, delete: true };

// Quick starting points for common jobs; the admin can change any tick before saving
const ROLE_TEMPLATES = [
  {
    key: 'counselor',
    name: 'Counselor',
    description: 'Works on the leads assigned to them',
    leadScope: 'assigned',
    permissions: {
      dashboard: { view: true },
      leads: { view: true, create: true, update: true },
      inbox: { view: true, create: true, update: true },
      crm: { view: true, update: true },
      support: { view: true, update: true },
      universities: { view: true },
      scholarships: { view: true },
    },
  },
  {
    key: 'content',
    name: 'Content Writer',
    description: 'Writes blogs, news, events and digest posts',
    leadScope: 'assigned',
    permissions: {
      blogs: { view: true, create: true, update: true },
      news: { view: true, create: true, update: true },
      events: { view: true, create: true, update: true },
      digest: { view: true, create: true, update: true },
      universities: { view: true },
      scholarships: { view: true },
    },
  },
  {
    key: 'support',
    name: 'Support Executive',
    description: 'Answers student support requests and follows up on their leads',
    leadScope: 'assigned',
    permissions: {
      dashboard: { view: true },
      support: { view: true, update: true },
      inbox: { view: true, create: true },
      leads: { view: true, update: true },
      crm: { view: true },
      universities: { view: true },
      scholarships: { view: true },
    },
  },
  {
    key: 'marketing',
    name: 'Marketing',
    description: 'Runs social media, email/WhatsApp campaigns and website content',
    leadScope: 'assigned',
    permissions: {
      dashboard: { view: true },
      social: full,
      messaging: full,
      blogs: { view: true, create: true, update: true },
      news: { view: true, create: true, update: true },
      events: { view: true, create: true, update: true },
      digest: { view: true, create: true, update: true },
    },
  },
  {
    key: 'data',
    name: 'University Data Editor',
    description: 'Keeps universities, courses and scholarships up to date',
    leadScope: 'assigned',
    permissions: {
      universities: { view: true, create: true, update: true },
      scholarships: { view: true, create: true, update: true },
    },
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Runs day-to-day work across every section',
    leadScope: 'all',
    permissions: Object.fromEntries(
      ['dashboard', 'tasks', 'leads', 'inbox', 'crm', 'students', 'support', 'mentors', 'universities', 'scholarships', 'blogs', 'news', 'events', 'digest', 'messaging', 'social']
        .map((k) => [k, full])
    ),
  },
];

// Readable random password: no look-alike characters
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, (n) => chars[n % chars.length]).join('');
};

const formatDate = (d) => (d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never');

// Permission grid: one row per section, one tick per action
const PermissionMatrix = ({ sections, value = {}, onChange }) => {
  const toggle = (key, action, checked, allowed) => {
    const current = { ...(value[key] || {}) };
    if (action === 'view' && !checked) {
      // Without view nothing else works
      const next = { ...value };
      delete next[key];
      return onChange(next);
    }
    current[action] = checked;
    if (checked) current.view = true;
    const cleaned = Object.fromEntries(Object.entries(current).filter(([a, v]) => v && allowed.includes(a)));
    const next = { ...value };
    if (Object.keys(cleaned).length) next[key] = cleaned;
    else delete next[key];
    return onChange(next);
  };

  const toggleRow = (key, allowed, checked) => {
    const next = { ...value };
    if (checked) next[key] = Object.fromEntries(allowed.map((a) => [a, true]));
    else delete next[key];
    onChange(next);
  };

  const groups = [...new Set(sections.map((s) => s.group))];

  return (
    <div className="staff-matrix" role="table" aria-label="Permissions">
      <div className="staff-matrix-row staff-matrix-head" role="row">
        <span role="columnheader">Section</span>
        {ACTION_COLUMNS.map(([, label]) => <span key={label} role="columnheader">{label}</span>)}
      </div>
      {groups.map((group) => (
        <React.Fragment key={group}>
          <div className="staff-matrix-group">{group}</div>
          {sections.filter((s) => s.group === group).map((s) => {
            const perms = value[s.key] || {};
            const allOn = s.actions.every((a) => perms[a]);
            const someOn = s.actions.some((a) => perms[a]);
            return (
              <div key={s.key} className="staff-matrix-row" role="row">
                <span role="cell">
                  <Checkbox
                    checked={allOn}
                    indeterminate={someOn && !allOn}
                    onChange={(e) => toggleRow(s.key, s.actions, e.target.checked)}
                  >
                    {s.label}
                  </Checkbox>
                </span>
                {ACTION_COLUMNS.map(([action, label]) => (
                  <span key={action} role="cell">
                    {s.actions.includes(action) ? (
                      <Checkbox
                        aria-label={`${s.label}: ${label}`}
                        checked={Boolean(perms[action])}
                        onChange={(e) => toggle(s.key, action, e.target.checked, s.actions)}
                      />
                    ) : (
                      <span className="staff-matrix-na" aria-label="Not applicable">–</span>
                    )}
                  </span>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

// Short summary of someone's access for the staff table
const accessSummary = (permissions, sections) => {
  const labels = sections.filter((s) => permissions?.[s.key]?.view).map((s) => {
    const p = permissions[s.key];
    const extra = ['create', 'update', 'delete'].some((a) => p[a]);
    return `${s.label}${extra ? '' : ' (view)'}`;
  });
  return labels.length ? labels.join(', ') : 'No access';
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, record: null });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const photoInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, sectionsRes] = await Promise.all([
        API.get('/admin/staff'),
        API.get('/admin/auth/sections'),
      ]);
      setStaff(staffRes.data || []);
      setSections(sectionsRes.data || []);
    } catch {
      message.error('Could not load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (record = null) => {
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        name: record.name,
        email: record.email,
        phone: record.phone,
        avatar: record.avatar || '',
        title: record.title,
        permissions: record.permissions || {},
        leadScope: record.leadScope || 'assigned',
        password: '',
      });
    } else {
      const t = ROLE_TEMPLATES[0];
      form.setFieldsValue({ title: t.name, leadScope: t.leadScope, password: generatePassword(), avatar: '' });
      form.setFieldValue('permissions', structuredClone(t.permissions));
    }
    setModal({ open: true, record });
  };

  // Replace (not merge) the ticks: setFieldsValue deep-merges objects and would keep the old ones
  const applyTemplate = (t) => {
    form.setFieldValue('permissions', structuredClone(t.permissions));
    form.setFieldValue('title', t.name);
    form.setFieldValue('leadScope', t.leadScope);
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.error('Choose an image file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await API.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      form.setFieldValue('avatar', data.url);
      message.success('Photo uploaded');
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not upload the photo');
    } finally {
      setUploading(false);
    }
  };

  const save = async (values) => {
    if (!Object.keys(values.permissions || {}).length) {
      message.error('Tick at least one section they can access');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...values };
      if (modal.record && !payload.password) delete payload.password;
      if (modal.record) await API.put(`/admin/staff/${modal.record._id}`, payload);
      else await API.post('/admin/staff', payload);
      message.success(modal.record ? 'Staff member updated. New access applies right away.' : 'Staff member added');
      setModal({ open: false, record: null });
      if (payload.password) {
        showLoginDetails(payload.email, payload.password, modal.record ? `New password for ${payload.name}` : `${payload.name} can now sign in`);
      }
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not save the staff member');
    } finally {
      setSaving(false);
    }
  };

  const setActive = async (record, active) => {
    try {
      await API.put(`/admin/staff/${record._id}`, { active });
      message.success(active ? `${record.name} can sign in again` : `${record.name} is switched off and signed out`);
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update access');
    }
  };

  const remove = async (record) => {
    try {
      await API.delete(`/admin/staff/${record._id}`);
      message.success('Staff member removed');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not remove the staff member');
    }
  };

  const loginText = (email, password) => `UniCoach admin portal: ${window.location.origin}/login\nEmail: ${email}\nPassword: ${password}`;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Login details copied');
    } catch {
      message.error('Could not copy. Select and copy them manually.');
    }
  };

  // Passwords are stored encrypted, so an existing one can never be shown again; only a new one can be shared
  const copyLogin = () => {
    const { email, password } = form.getFieldsValue();
    if (!password) {
      message.warning('The current password can\'t be shown (it is stored encrypted). Click "Generate" to set a new one, then copy.');
      return;
    }
    copyText(loginText(email || '', password));
  };

  // Shown once, right after saving a new password: the only moment it can be seen
  const showLoginDetails = (email, password, title) => {
    const text = loginText(email, password);
    Modal.success({
      title,
      width: 460,
      content: (
        <div>
          <p style={{ color: 'var(--ux-text-2)', margin: '4px 0 10px' }}>Share these privately. The password won't be shown again.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--ux-surface-2)', padding: 12, borderRadius: 12, fontSize: 13, margin: 0 }}>{text}</pre>
        </div>
      ),
      okText: 'Copy and close',
      onOk: () => copyText(text),
    });
  };

  const columns = [
    {
      title: 'Staff member',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StaffAvatar name={name} src={r.avatar} size={40} />
          <div style={{ minWidth: 0 }}>
            <strong style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{name}</strong>
            <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>{r.email}{r.phone ? ` · ${r.phone}` : ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role & access',
      key: 'access',
      render: (_, r) => (
        <div style={{ maxWidth: 420 }}>
          <span className="nx-status nx-status--neutral">{r.title || 'Staff'}</span>
          <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginTop: 6 }}>{accessSummary(r.permissions, sections)}</div>
          {r.permissions?.leads?.view && (
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ux-ink)', marginTop: 2 }}>
              Leads: {r.leadScope === 'all' ? 'all leads' : 'only assigned to them'}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Can sign in',
      dataIndex: 'active',
      key: 'active',
      render: (active, r) => (
        <Popconfirm
          title={active ? `Switch off ${r.name}?` : `Let ${r.name} sign in again?`}
          description={active ? 'They will be signed out straight away.' : undefined}
          onConfirm={() => setActive(r, !active)}
        >
          <Switch checked={active} size="small" aria-label={`Access for ${r.name}`} />
        </Popconfirm>
      ),
    },
    { title: 'Last sign in', dataIndex: 'lastLoginAt', key: 'lastLoginAt', render: (d) => <span style={{ color: 'var(--ux-text-2)' }}>{formatDate(d)}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="Edit details, access or set a new password">
            <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} aria-label={`Edit ${r.name}`} />
          </Tooltip>
          <Popconfirm title={`Remove ${r.name}?`} description="Their account is deleted. Their past work stays." onConfirm={() => remove(r)}>
            <Button size="small" danger icon={<DeleteOutlined />} aria-label={`Remove ${r.name}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const editingPermissions = Form.useWatch('permissions', form) || {};
  const editingAvatar = Form.useWatch('avatar', form);
  const editingName = Form.useWatch('name', form);
  const editingTitle = Form.useWatch('title', form);
  // Which quick-fill matches the current ticks exactly (shown as selected)
  const sameAccess = (a, b) => JSON.stringify(Object.keys(a).sort().map((k) => [k, Object.keys(a[k]).filter((x) => a[k][x]).sort()]))
    === JSON.stringify(Object.keys(b).sort().map((k) => [k, Object.keys(b[k]).filter((x) => b[k][x]).sort()]));
  const activeTemplate = ROLE_TEMPLATES.find((t) => t.name === editingTitle && sameAccess(t.permissions, editingPermissions));

  return (
    <div>
      <Header
        title="Staff & Roles"
        subtitle="Give your team their own login and decide what each person can see and do"
        extra={
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => openModal()}>
            Add staff member
          </Button>
        }
      />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <div className="page-stats-grid page-stats-grid--3">
          <StatsCard icon={<TeamOutlined />} label="Staff members" value={staff.length} color="brand" loading={loading} />
          <StatsCard icon={<KeyOutlined />} label="Can sign in" value={staff.filter((s) => s.active).length} color="brand" loading={loading} />
          <StatsCard icon={<SafetyCertificateOutlined />} label="Switched off" value={staff.filter((s) => !s.active).length} color="brand" loading={loading} />
        </div>

        <div className="page-table-card">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={staff}
            loading={loading}
            scroll={{ x: 860 }}
            pagination={{ pageSize: 15, hideOnSinglePage: true }}
            locale={{ emptyText: 'No staff yet. Use "Add staff member" to give someone a login.' }}
          />
        </div>
      </div>

      <Modal
        title={modal.record ? `Edit ${modal.record.name}` : 'Add staff member'}
        open={modal.open}
        onCancel={() => setModal({ open: false, record: null })}
        footer={null}
        width={780}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={save} style={{ marginTop: 16 }} requiredMark={false}>
          <div className="staff-step">1. Their details and login</div>
          <Form.Item name="avatar" hidden><Input /></Form.Item>
          <div className="staff-photo-row">
            <StaffAvatar name={editingName} src={editingAvatar} size={64} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)' }}>Photo <span style={{ fontWeight: 400, color: 'var(--ux-text-3)' }}>(optional)</span></div>
              <Space size="small" style={{ marginTop: 6 }}>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }} />
                <Button size="small" icon={uploading ? <LoadingOutlined /> : <CameraOutlined />} disabled={uploading} onClick={() => photoInputRef.current?.click()}>
                  {editingAvatar ? 'Change photo' : 'Upload photo'}
                </Button>
                {editingAvatar && <Button size="small" type="text" danger onClick={() => form.setFieldValue('avatar', '')}>Remove</Button>}
              </Space>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', columnGap: 12 }}>
            <Form.Item name="name" label="Full name" rules={[{ required: true, whitespace: true, message: 'Enter their name' }]}>
              <Input placeholder="e.g. Priya Sharma" maxLength={80} />
            </Form.Item>
            <Form.Item name="email" label="Login email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
              <Input placeholder="name@example.com" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="password"
              label={modal.record ? 'New password (leave empty to keep it)' : 'Password'}
              extra={modal.record ? 'A new password signs them out everywhere.' : 'Share it privately. They can change it after signing in.'}
              rules={[
                { required: !modal.record, message: 'Set a password' },
                { min: 8, message: 'At least 8 characters' },
              ]}
            >
              <Input
                autoComplete="new-password"
                suffix={
                  <Button type="link" size="small" onClick={() => form.setFieldValue('password', generatePassword())} style={{ height: 'auto', padding: 0 }}>
                    Generate
                  </Button>
                }
              />
            </Form.Item>
            <Form.Item name="phone" label="Phone (optional)">
              <Input placeholder="+91 …" maxLength={30} />
            </Form.Item>
          </div>

          <div className="staff-step">2. Their role and what they can access</div>
          <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginBottom: 8 }}>
            Pick a ready role to tick everything for you, then change any tick you like:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            {ROLE_TEMPLATES.map((t) => {
              const on = activeTemplate?.key === t.key;
              return (
                <Tooltip key={t.key} title={t.description}>
                  <Button size="small" type={on ? 'primary' : 'default'} icon={on ? <CheckOutlined /> : null} onClick={() => applyTemplate(t)} aria-pressed={on}>
                    {t.name}
                  </Button>
                </Tooltip>
              );
            })}
          </div>
          <Form.Item name="title" label="Role name" rules={[{ required: true, whitespace: true, message: 'Give their role a name, e.g. Counselor' }]}>
            <Input placeholder="e.g. Counselor" maxLength={60} />
          </Form.Item>

          <Form.Item name="permissions" label="What can they see and do?" valuePropName="value">
            <PermissionMatrix sections={sections} />
          </Form.Item>

          {editingPermissions.leads?.view && (
            <Form.Item name="leadScope" label="Which leads can they see?">
              <Radio.Group>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Radio value="assigned">Only leads assigned to them</Radio>
                  <Radio value="all">All leads (can also reassign and import)</Radio>
                </div>
              </Radio.Group>
            </Form.Item>
          )}

          <p style={{ fontSize: 12.5, color: 'var(--ux-text-3)', margin: '4px 0 16px' }}>
            Settings (API keys, SMTP, payments) and Staff & Roles always stay with you, the owner.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={<CopyOutlined />} onClick={copyLogin}>Copy login details</Button>
            <Space>
              <Button onClick={() => setModal({ open: false, record: null })}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={saving}>{modal.record ? 'Save changes' : 'Add staff member'}</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Staff;
