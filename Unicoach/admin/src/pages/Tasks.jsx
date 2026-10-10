import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, Segmented, Tag, Tooltip, Popconfirm, Drawer, Empty, message, Checkbox,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined, SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const { RangePicker } = DatePicker;

const PRIORITY = {
  high: { label: 'High', color: 'red' },
  medium: { label: 'Medium', color: 'gold' },
  low: { label: 'Low', color: 'default' },
};
const STATUS = {
  todo: { label: 'To do', color: 'default' },
  in_progress: { label: 'In progress', color: 'blue' },
  done: { label: 'Done', color: 'green' },
};

// Quick date filters
const QUICK = {
  all: null,
  today: () => [dayjs().startOf('day'), dayjs().endOf('day')],
  week: () => [dayjs().startOf('day'), dayjs().add(6, 'day').endOf('day')],
  overdue: 'overdue',
};

const isOverdue = (t) => t.status !== 'done' && t.dueAt && new Date(t.dueAt) < new Date();
const dueLabel = (d) => (d ? dayjs(d).format('D MMM YYYY, h:mm A') : 'No due date');

// Lets the sidebar badge refresh after a change here
const notifyTasksChanged = () => window.dispatchEvent(new Event('tasks_updated'));

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [canManage, setCanManage] = useState({});
  const [me, setMe] = useState('');
  const [loading, setLoading] = useState(true);
  const [assignees, setAssignees] = useState([]);

  const [scope, setScope] = useState('mine');
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [quick, setQuick] = useState('all');
  const [range, setRange] = useState(null);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState({ open: false, record: null });
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [comment, setComment] = useState('');
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { scope };
      if (status !== 'all') params.status = status;
      if (priority !== 'all') params.priority = priority;
      if (scope === 'all' && assigneeFilter !== 'all') params.assignee = assigneeFilter;
      if (quick === 'overdue') params.overdue = '1';
      const dates = quick !== 'all' && quick !== 'overdue' ? QUICK[quick]() : range;
      if (dates?.[0]) params.from = dates[0].startOf('day').toISOString();
      if (dates?.[1]) params.to = dates[1].endOf('day').toISOString();
      if (search.trim()) params.q = search.trim();
      const { data } = await API.get('/admin/tasks', { params });
      setTasks(data.tasks || []);
      setCanManage(data.canManage || {});
      setMe(data.me || '');
    } catch {
      message.error('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [scope, status, priority, assigneeFilter, quick, range, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    API.get('/admin/tasks/assignees').then((r) => setAssignees(r.data || [])).catch(() => {});
  }, []);

  const stats = useMemo(() => ({
    updates: tasks.filter((t) => t.unread > 0 || t.isNew).length,
    open: tasks.filter((t) => t.status !== 'done').length,
    overdue: tasks.filter(isOverdue).length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks]);

  const openModal = (record = null) => {
    form.resetFields();
    form.setFieldsValue(record ? {
      title: record.title,
      description: record.description,
      assignee: record.assignee.id === me ? 'me' : record.assignee.id,
      dueAt: record.dueAt ? dayjs(record.dueAt) : null,
      priority: record.priority,
    } : { assignee: 'me', priority: 'medium', dueAt: dayjs().add(1, 'day').hour(18).minute(0) });
    setModal({ open: true, record });
  };

  const save = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, dueAt: values.dueAt ? values.dueAt.toISOString() : null };
      if (modal.record) await API.patch(`/admin/tasks/${modal.record._id}`, payload);
      else await API.post('/admin/tasks', payload);
      message.success(modal.record ? 'Task updated' : 'Task added');
      setModal({ open: false, record: null });
      notifyTasksChanged();
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not save the task');
    } finally {
      setSaving(false);
    }
  };

  const setTaskStatus = async (task, next) => {
    try {
      const { data } = await API.patch(`/admin/tasks/${task._id}`, { status: next });
      setTasks((list) => list.map((t) => (t._id === data._id ? data : t)));
      if (detail?._id === data._id) setDetail(data);
      notifyTasksChanged();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update the task');
    }
  };

  // Open a task's details; this also clears its "new" highlight
  const openDetail = async (task) => {
    setDetail(task);
    if (!task.unread && !task.isNew) return;
    try {
      const { data } = await API.post(`/admin/tasks/${task._id}/seen`);
      setTasks((list) => list.map((t) => (t._id === data._id ? data : t)));
      setDetail(data);
      notifyTasksChanged();
    } catch {
      /* the highlight just stays until next time */
    }
  };

  const remove = async (task) => {
    try {
      await API.delete(`/admin/tasks/${task._id}`);
      message.success('Task deleted');
      notifyTasksChanged();
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not delete the task');
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await API.post(`/admin/tasks/${detail._id}/comments`, { text: comment });
      setDetail(data);
      setTasks((list) => list.map((t) => (t._id === data._id ? data : t)));
      setComment('');
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not add the comment');
    }
  };

  const canEditTask = (t) => t.createdBy.id === me || canManage.update;
  const canDeleteTask = (t) => t.createdBy.id === me || canManage.delete;
  const canChangeStatus = (t) => t.assignee.id === me || canEditTask(t);

  const columns = [
    {
      title: '',
      key: 'done',
      width: 44,
      render: (_, t) => (
        <Checkbox
          checked={t.status === 'done'}
          disabled={!canChangeStatus(t)}
          onChange={(e) => setTaskStatus(t, e.target.checked ? 'done' : 'todo')}
          aria-label={t.status === 'done' ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
        />
      ),
    },
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (title, t) => (
        <button type="button" onClick={() => openDetail(t)} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
          {(t.unread > 0 || t.isNew) && (
            <span className="task-new-badge">{t.isNew ? 'New task' : `${t.unread} new update${t.unread === 1 ? '' : 's'}`}</span>
          )}
          <strong style={{ color: 'var(--ux-ink)', fontWeight: 600, textDecoration: t.status === 'done' ? 'line-through' : 'none', opacity: t.status === 'done' ? 0.6 : 1 }}>{title}</strong>
          {t.description && <div style={{ fontSize: 12, color: 'var(--ux-text-3)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>}
          {t.comments?.length > 0 && <div style={{ fontSize: 11.5, color: t.unread ? 'var(--ux-brand-strong)' : 'var(--ux-text-3)', fontWeight: t.unread ? 600 : 400, marginTop: 2 }}><MessageOutlined /> {t.comments.length}</div>}
        </button>
      ),
    },
    {
      title: 'Assigned to',
      key: 'assignee',
      render: (_, t) => (
        <div style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{t.assignee.id === me ? 'You' : t.assignee.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>by {t.createdBy.id === me ? 'you' : t.createdBy.name}</div>
        </div>
      ),
    },
    {
      title: 'Due',
      dataIndex: 'dueAt',
      key: 'dueAt',
      render: (d, t) => (
        <span style={{ color: isOverdue(t) ? '#c0392b' : 'var(--ux-text-2)', fontWeight: isOverdue(t) ? 600 : 400, whiteSpace: 'nowrap' }}>
          {isOverdue(t) && <ClockCircleOutlined style={{ marginRight: 4 }} />}{dueLabel(d)}
        </span>
      ),
    },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={PRIORITY[p].color}>{PRIORITY[p].label}</Tag> },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s, t) => (
        <Select
          size="small"
          value={s}
          disabled={!canChangeStatus(t)}
          onChange={(v) => setTaskStatus(t, v)}
          style={{ width: 130 }}
          options={Object.entries(STATUS).map(([value, m]) => ({ value, label: m.label }))}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, t) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={t.unread ? 'New comments: open to read' : 'Comments and details'}>
            <Button size="small" type="text" icon={<MessageOutlined style={t.unread ? { color: 'var(--ux-brand)' } : undefined} />} onClick={() => openDetail(t)} aria-label="Open task" />
          </Tooltip>
          {canEditTask(t) && <Tooltip title="Edit"><Button size="small" type="text" icon={<EditOutlined />} onClick={() => openModal(t)} aria-label="Edit task" /></Tooltip>}
          {canDeleteTask(t) && (
            <Popconfirm title="Delete this task?" onConfirm={() => remove(t)}>
              <Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="Delete task" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const assigneeOptions = assignees.map((p) => ({
    value: p.id === me || (p.kind === 'owner' && user?.role === 'admin') ? 'me' : p.id,
    label: p.id === me || (p.kind === 'owner' && user?.role === 'admin') ? `Me (${p.name})` : `${p.name}${p.title ? ` · ${p.title}` : ''}`,
  }));

  return (
    <div>
      <Header
        title="Tasks"
        subtitle={canManage.create ? 'Give tasks to your team and track them by due date' : 'Your tasks and to-dos'}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>New task</Button>}
      />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <div className="page-stats-grid page-stats-grid--4">
          <StatsCard icon={<MessageOutlined />} label="New updates" value={stats.updates} color="brand" loading={loading} />
          <StatsCard icon={<ClockCircleOutlined />} label="Open" value={stats.open} color="brand" loading={loading} />
          <StatsCard icon={<ClockCircleOutlined />} label="Overdue" value={stats.overdue} color="brand" loading={loading} />
          <StatsCard icon={<ClockCircleOutlined />} label="Done" value={stats.done} color="brand" loading={loading} />
        </div>

        <div className="nx-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          {canManage.view && (
            <Segmented
              value={scope}
              onChange={(v) => { setScope(v); setAssigneeFilter('all'); }}
              options={[{ label: 'My tasks', value: 'mine' }, { label: 'Team tasks', value: 'all' }]}
            />
          )}
          <Segmented
            value={quick}
            onChange={(v) => { setQuick(v); if (v !== 'all') setRange(null); }}
            options={[{ label: 'All dates', value: 'all' }, { label: 'Today', value: 'today' }, { label: 'This week', value: 'week' }, { label: 'Overdue', value: 'overdue' }]}
          />
          <RangePicker
            value={range}
            onChange={(v) => { setRange(v); if (v) setQuick('all'); }}
            format="D MMM YYYY"
            placeholder={['Due from', 'Due to']}
          />
          <Select value={status} onChange={setStatus} style={{ width: 150 }} options={[
            { value: 'open', label: 'Not done' },
            { value: 'all', label: 'Any status' },
            ...Object.entries(STATUS).map(([value, m]) => ({ value, label: m.label })),
          ]} />
          <Select value={priority} onChange={setPriority} style={{ width: 140 }} options={[
            { value: 'all', label: 'Any priority' },
            ...Object.entries(PRIORITY).map(([value, m]) => ({ value, label: m.label })),
          ]} />
          {scope === 'all' && (
            <Select
              value={assigneeFilter}
              onChange={setAssigneeFilter}
              style={{ width: 180 }}
              options={[{ value: 'all', label: 'Everyone' }, ...assignees.map((p) => ({ value: p.id, label: p.name }))]}
            />
          )}
          <Input prefix={<SearchOutlined />} placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
        </div>

        <div className="page-table-card">
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={tasks}
            loading={loading}
            scroll={{ x: 900 }}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            rowClassName={(t) => [(t.unread > 0 || t.isNew) && 'task-row--unread', isOverdue(t) && 'task-row--overdue'].filter(Boolean).join(' ')}
            locale={{ emptyText: <Empty description={quick === 'overdue' ? 'Nothing overdue' : 'No tasks here. Use "New task" to add one.'} /> }}
          />
        </div>
      </div>

      <Modal
        title={modal.record ? 'Edit task' : 'New task'}
        open={modal.open}
        onCancel={() => setModal({ open: false, record: null })}
        onOk={() => form.submit()}
        okText={modal.record ? 'Save' : 'Add task'}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Task" rules={[{ required: true, whitespace: true, message: 'What needs to be done?' }]}>
            <Input placeholder="e.g. Call Rahul about his IELTS score" maxLength={160} />
          </Form.Item>
          <Form.Item name="description" label="Details (optional)">
            <Input.TextArea rows={3} maxLength={2000} placeholder="Anything they need to know" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', columnGap: 12 }}>
            <Form.Item name="assignee" label="Assign to" rules={[{ required: true, message: 'Choose someone' }]}>
              <Select options={assigneeOptions} disabled={!canManage.create} showSearch optionFilterProp="label" />
            </Form.Item>
            <Form.Item name="priority" label="Priority">
              <Select options={Object.entries(PRIORITY).map(([value, m]) => ({ value, label: m.label }))} />
            </Form.Item>
          </div>
          <Form.Item name="dueAt" label="Due date and time">
            <DatePicker showTime={{ format: 'h:mm A', minuteStep: 15 }} format="D MMM YYYY, h:mm A" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title={detail?.title} open={Boolean(detail)} onClose={() => setDetail(null)} width={460}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Tag color={STATUS[detail.status].color}>{STATUS[detail.status].label}</Tag>
              <Tag color={PRIORITY[detail.priority].color}>{PRIORITY[detail.priority].label} priority</Tag>
              {isOverdue(detail) && <Tag color="red">Overdue</Tag>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ux-text-2)', display: 'grid', gap: 4 }}>
              <div>Assigned to <strong>{detail.assignee.id === me ? 'you' : detail.assignee.name}</strong> by {detail.createdBy.id === me ? 'you' : detail.createdBy.name}</div>
              <div>Due: <strong>{dueLabel(detail.dueAt)}</strong></div>
              {detail.completedAt && <div>Done on {dueLabel(detail.completedAt)}</div>}
            </div>
            {detail.description && <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{detail.description}</p>}
            {canChangeStatus(detail) && (
              <Segmented
                value={detail.status}
                onChange={(v) => setTaskStatus(detail, v)}
                options={Object.entries(STATUS).map(([value, m]) => ({ value, label: m.label }))}
              />
            )}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Comments</div>
              {detail.comments?.length ? detail.comments.map((c) => (
                <div key={c._id} style={{ padding: '8px 10px', background: 'var(--ux-surface-2)', borderRadius: 12, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>{c.by.id === me ? 'You' : c.by.name} · {dueLabel(c.at)}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{c.text}</div>
                </div>
              )) : <div style={{ fontSize: 13, color: 'var(--ux-text-3)' }}>No comments yet</div>}
              <Input.TextArea rows={2} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add an update or a question" style={{ marginTop: 8 }} />
              <Button type="primary" onClick={addComment} disabled={!comment.trim()} style={{ marginTop: 8 }}>Add comment</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Tasks;
