import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Tag, Modal, Select, Input, InputNumber, message, Space, Drawer,
  Switch, Row, Col, Empty, Spin, Popconfirm, Alert, Timeline, Checkbox, Tooltip,
} from 'antd';
import {
  PlusOutlined, ThunderboltOutlined, DeleteOutlined, MailOutlined, MessageOutlined,
  ClockCircleOutlined, UserAddOutlined, BranchesOutlined, SaveOutlined, ApartmentOutlined,
  ApiOutlined, RobotOutlined, TagOutlined, FileTextOutlined, StarOutlined, EditOutlined,
  CheckCircleOutlined, PlayCircleOutlined, HistoryOutlined, WarningOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// ─── Step types ───────────────────────────────────────────────
// Must stay in step with NODE_CATALOG in backend/controllers/workflowController.js
const NODE_TYPES = {
  trigger:     { label: 'Trigger',          icon: <ThunderboltOutlined />, group: 'trigger', blurb: '' },
  email:       { label: 'Send Email',       icon: <MailOutlined />,        group: 'Send a message', blurb: 'Your own email, with the student’s name filled in.' },
  whatsapp:    { label: 'Send WhatsApp',    icon: <MessageOutlined />,     group: 'Send a message', blurb: 'An approved WhatsApp template.' },
  ai_message:  { label: 'AI writes & sends',icon: <RobotOutlined />,       group: 'Send a message', blurb: 'AI writes the message from this lead’s own details, then sends it.' },
  ai_classify: { label: 'AI reads the reply', icon: <RobotOutlined />,     group: 'Let AI decide',  blurb: 'Reads the student’s last reply and works out what they want.' },
  ai_score:    { label: 'AI scores the lead', icon: <StarOutlined />,      group: 'Let AI decide',  blurb: 'Gives the lead a Hot / Warm / Cold score.' },
  condition:   { label: 'If / Condition',   icon: <BranchesOutlined />,    group: 'Let AI decide',  blurb: 'Splits the flow in two: one path for yes, one for no.' },
  pipeline:    { label: 'Move stage',       icon: <ApartmentOutlined />,   group: 'Update the lead', blurb: 'Moves the lead to another stage in the pipeline.' },
  counselor:   { label: 'Assign counselor', icon: <UserAddOutlined />,     group: 'Update the lead', blurb: 'Hands the lead to one of your team.' },
  tag:         { label: 'Add tag',          icon: <TagOutlined />,         group: 'Update the lead', blurb: 'Puts a tag on the lead so you can filter it later.' },
  note:        { label: 'Add note',         icon: <FileTextOutlined />,    group: 'Update the lead', blurb: 'Writes a note in the lead’s activity.' },
  delay:       { label: 'Wait',             icon: <ClockCircleOutlined />, group: 'Timing',          blurb: 'Pauses here and carries on later.' },
  webhook:     { label: 'Webhook',          icon: <ApiOutlined />,         group: 'Timing',          blurb: 'Sends the lead to another system over HTTP.' },
  calendar:    { label: 'Note (old step)',  icon: <FileTextOutlined />,    group: 'Timing',          blurb: 'Kept so older workflows keep working.' },
};

const GROUPS = ['Send a message', 'Let AI decide', 'Update the lead', 'Timing'];

const TRIGGERS = [
  { type: 'lead_created',       label: 'A new lead comes in',            plain: 'a new lead comes in' },
  { type: 'lead_stage_changed', label: 'A lead moves to a stage',        plain: 'a lead moves to a stage' },
  { type: 'followup_due',       label: 'A follow-up date is due',        plain: 'a follow-up date falls due' },
  { type: 'no_reply',           label: 'A lead goes quiet for N days',   plain: 'a lead goes quiet' },
  { type: 'whatsapp_reply',     label: 'A student replies on WhatsApp',  plain: 'a student replies on WhatsApp' },
  { type: 'manual',             label: 'Only when I run it by hand',     plain: 'you run it by hand' },
];

const STAGES = ['new', 'contacted', 'qualified', 'interested', 'fifty_fifty', 'not_interested', 'converted', 'closed'];
const INTENTS = ['interested', 'wants_price', 'wants_call', 'not_now', 'not_interested', 'wrong_number', 'question', 'other'];

// Ready-made automations, so a new workflow does not start from an empty page.
const STARTERS = {
  blank: { label: 'Blank — I will build it myself', trigger: { type: 'lead_created', config: {} }, nodes: [], edges: [] },
  chaser: {
    label: 'Follow-up chaser — chase a lead when its follow-up date is due',
    trigger: { type: 'followup_due', config: {} },
    nodes: [
      { id: 'n2', type: 'ai_score', config: { label: 'AI scores this lead' } },
      { id: 'n3', type: 'condition', config: { label: 'Is it a hot lead?', field: 'score', op: 'gt', value: '75' } },
      { id: 'n4', type: 'ai_message', config: { label: 'AI writes a nudge', channel: 'whatsapp', goal: 'book_call' } },
      { id: 'n5', type: 'note', config: { label: 'Note for the counsellor', message: 'Follow-up due for {{name}} — please call.' } },
    ],
    edges: [
      { from: 'n1', to: 'n2', branch: '' },
      { from: 'n2', to: 'n3', branch: '' },
      { from: 'n3', to: 'n4', branch: 'yes' },
      { from: 'n3', to: 'n5', branch: 'no' },
    ],
  },
  reader: {
    label: 'Reply reader — read every WhatsApp reply and sort the lead',
    trigger: { type: 'whatsapp_reply', config: {} },
    nodes: [
      { id: 'n2', type: 'ai_classify', config: { label: 'AI reads the reply', expectIntent: 'interested', apply: true } },
      { id: 'n3', type: 'pipeline', config: { label: 'Move to interested', stage: 'interested' } },
      { id: 'n4', type: 'tag', config: { label: 'Tag for a human', tag: 'needs-a-human' } },
    ],
    edges: [
      { from: 'n1', to: 'n2', branch: '' },
      { from: 'n2', to: 'n3', branch: 'yes' },
      { from: 'n2', to: 'n4', branch: 'no' },
    ],
  },
  reviver: {
    label: 'Quiet lead reviver — one nudge when a lead goes quiet',
    trigger: { type: 'no_reply', config: { days: 5 } },
    nodes: [
      { id: 'n2', type: 'ai_message', config: { label: 'AI writes a check-in', channel: 'whatsapp', goal: 're_engage' } },
      { id: 'n3', type: 'delay', config: { label: 'Wait 2 days', duration: 2, unit: 'days' } },
      { id: 'n4', type: 'tag', config: { label: 'Tag: revive attempted', tag: 'revive-sent' } },
    ],
    edges: [
      { from: 'n1', to: 'n2', branch: '' },
      { from: 'n2', to: 'n3', branch: '' },
      { from: 'n3', to: 'n4', branch: '' },
    ],
  },
};

const DEFAULT_CONFIG = {
  delay: { duration: 2, unit: 'hours' },
  condition: { field: 'status', op: 'eq', value: '' },
  ai_message: { channel: 'whatsapp', goal: 'book_call' },
  ai_classify: { apply: true },
  email: { subject: '', body: '' },
};

const trig = (type) => TRIGGERS.find((t) => t.type === type);
const triggerLabel = (type) => trig(type)?.label || 'Trigger';
const timeAgo = (date) => {
  if (!date) return 'Never run';
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
};

// What a step will actually do, in words — shown under its name so the page reads like a sentence.
const describeStep = (node, templates = []) => {
  const c = node.config || {};
  switch (node.type) {
    case 'email': return c.subject ? `Email: “${c.subject}”` : 'No subject or message yet';
    case 'whatsapp': {
      const t = templates.find((x) => x._id === c.template);
      return t ? `Template “${t.name}”` : 'No template chosen yet';
    }
    case 'ai_message': return `AI writes it and sends on ${c.channel === 'email' ? 'email' : 'WhatsApp'}`;
    case 'ai_classify': return c.expectIntent ? `Yes when the student is “${String(c.expectIntent).replace(/_/g, ' ')}”` : 'Reads the reply and tags it';
    case 'ai_score': return 'Hot / Warm / Cold, saved on the lead';
    case 'condition': return c.value || c.op === 'exists' ? `If ${c.field} ${c.op} ${c.op === 'exists' ? '' : c.value}` : 'Not set up yet';
    case 'pipeline': return c.stage ? `Move to “${c.stage}”` : 'No stage chosen yet';
    case 'counselor': return c.counselor ? `Give it to ${c.counselor}` : 'Nobody chosen yet';
    case 'tag': return c.tag ? `Tag “${c.tag}”` : 'No tag typed yet';
    case 'note':
    case 'calendar': return c.message ? `“${String(c.message).slice(0, 60)}”` : 'Nothing written yet';
    case 'delay': return `Pause for ${c.duration ?? 2} ${c.unit || 'hours'}`;
    case 'webhook': return c.url || 'No URL yet';
    default: return '';
  }
};

// A step that would do nothing (or fail) until it is filled in.
const needsSetup = (node) => {
  const c = node.config || {};
  switch (node.type) {
    case 'whatsapp': return !c.template;
    case 'email': return !String(c.body || '').trim();
    case 'pipeline': return !c.stage;
    case 'counselor': return !c.counselor;
    case 'tag': return !String(c.tag || '').trim();
    case 'note':
    case 'calendar': return !String(c.message || '').trim();
    case 'condition': return c.op !== 'exists' && !String(c.value ?? '').trim();
    case 'webhook': return !/^https?:\/\//i.test(c.url || '');
    default: return false;
  }
};

// ─── Flow helpers (the list the page draws, worked out from the saved edges) ──
const childOf = (edges, from, branch = '') => {
  const outs = edges.filter((e) => e.from === from);
  if (branch) return outs.find((e) => (e.branch || '') === branch)?.to || '';
  return (outs.find((e) => !e.branch) || outs[0])?.to || '';
};

const chainFrom = (nodes, edges, startId) => {
  const out = [];
  const seen = new Set();
  let id = startId;
  while (id && !seen.has(id)) {
    seen.add(id);
    const node = nodes.find((n) => n.id === id);
    if (!node) break;
    out.push(node);
    if (node.type === 'condition') break; // its two branches are drawn separately
    id = childOf(edges, id);
  }
  return out;
};

// Numbers the steps the way the page reads them: the main list, then each YES path, then each NO path.
const numberSteps = (nodes, edges, startId) => {
  const map = {};
  let n = 1;
  const walk = (id) => {
    for (const node of chainFrom(nodes, edges, id)) {
      if (map[node.id]) return;
      map[node.id] = n++;
      if (node.type === 'condition') {
        walk(childOf(edges, node.id, 'yes'));
        walk(childOf(edges, node.id, 'no'));
      }
    }
  };
  walk(startId);
  return map;
};

// ─── One step row ─────────────────────────────────────────────
const StepRow = ({ node, index, onEdit, onDelete, templates }) => {
  const type = NODE_TYPES[node.type] || NODE_TYPES.note;
  const warn = needsSetup(node);
  return (
    <div
      className="nx-card"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        border: warn ? '1px solid #e8b14a' : '1px solid var(--ux-line-2)',
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: 999, background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{index}</span>
      <span className="nx-icon-circle" style={{ flexShrink: 0 }}>{type.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)' }}>
          {node.config?.label || type.label}
          {warn && <Tag color="gold" style={{ marginLeft: 8, fontSize: 11 }}><WarningOutlined /> Needs setting up</Tag>}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>{describeStep(node, templates)}</div>
      </div>
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(node)}>Edit</Button>
        <Popconfirm title="Remove this step?" onConfirm={() => onDelete(node.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </div>
  );
};

const AddHere = ({ onClick, label = 'Add a step here' }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
    <button type="button" className="nx-btn nx-btn--light nx-btn--sm" onClick={onClick} style={{ fontWeight: 500 }}>
      <PlusOutlined /> {label}
    </button>
  </div>
);

const Connector = () => (
  <div style={{ height: 14, display: 'flex', justifyContent: 'center' }}>
    <span style={{ width: 2, background: 'var(--ux-line)' }} />
  </div>
);

// ─── A chain of steps, with branches drawn underneath a condition ─────────────
const StepChain = ({ wf, startId, numbers, onEdit, onDelete, onAdd, templates, parentId, branch = '' }) => {
  const chain = chainFrom(wf.nodes, wf.edges, startId);

  if (!chain.length) {
    return <AddHere onClick={() => onAdd(parentId, branch)} label="Add the first step" />;
  }

  return (
    <div>
      {chain.map((node, i) => {
        const isCondition = node.type === 'condition';
        const n = numbers[node.id] || 0;
        return (
          <div key={node.id}>
            {i > 0 && <Connector />}
            <StepRow node={node} index={n} onEdit={onEdit} onDelete={onDelete} templates={templates} />
            {!isCondition && <AddHere onClick={() => onAdd(node.id, '')} />}
            {isCondition && (
              <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                {['yes', 'no'].map((b) => (
                  <div key={b} style={{ flex: '1 1 320px', minWidth: 280 }}>
                    <div style={{
                      fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 8,
                      color: b === 'yes' ? '#2e9e6b' : '#96958e',
                    }}>
                      {b === 'yes' ? 'IF YES →' : 'IF NO →'}
                    </div>
                    <div style={{
                      borderLeft: `2px solid ${b === 'yes' ? '#cfe9dc' : 'var(--ux-line)'}`,
                      paddingLeft: 12,
                    }}>
                      <StepChain
                        wf={wf} startId={childOf(wf.edges, node.id, b)} numbers={numbers}
                        onEdit={onEdit} onDelete={onDelete} onAdd={onAdd}
                        templates={templates} parentId={node.id} branch={b}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dirty, setDirty] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [leads, setLeads] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [starter, setStarter] = useState('chaser');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerAt, setPickerAt] = useState({ parentId: '', branch: '' });

  const [testOpen, setTestOpen] = useState(false);
  const [testLead, setTestLead] = useState(null);
  const [testing, setTesting] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [runs, setRuns] = useState([]);

  const loadWorkflows = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/workflows');
      setWorkflows(data || []);
      return data || [];
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not load workflows');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  useEffect(() => {
    (async () => {
      const [t, s, l] = await Promise.all([
        API.get('/admin/templates').catch(() => ({ data: [] })),
        API.get('/admin/staff/assignable').catch(() => ({ data: [] })),
        API.get('/admin/leads').catch(() => ({ data: [] })),
      ]);
      setTemplates(Array.isArray(t.data) ? t.data : t.data?.templates || []);
      setStaff(Array.isArray(s.data) ? s.data : []);
      setLeads((Array.isArray(l.data) ? l.data : l.data?.leads || []).slice(0, 100));
    })();
  }, []);

  const openWorkflow = async (wf) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave them?')) return;
    const { data } = await API.get(`/admin/workflows/${wf._id}`);
    setSelected(data);
    setRuns(data.recentRuns || []);
    setDirty(false);
    setLastRun(null);
  };

  const patchSelected = (patch) => {
    setSelected((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const triggerNode = selected?.nodes?.find((n) => n.type === 'trigger') || selected?.nodes?.[0];

  // Only keep what the trigger can still reach, so removing a step never leaves orphans behind
  const pruned = (nodes, edges) => {
    if (!triggerNode) return { nodes, edges };
    const keep = new Set([triggerNode.id]);
    let added = true;
    while (added) {
      added = false;
      for (const e of edges) {
        if (keep.has(e.from) && !keep.has(e.to)) { keep.add(e.to); added = true; }
      }
    }
    return {
      nodes: nodes.filter((n) => keep.has(n.id)),
      edges: edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    };
  };

  const addStep = (type) => {
    const { parentId, branch } = pickerAt;
    const id = `n${Date.now()}`;
    const node = { id, type, x: 60, y: 40, config: { label: NODE_TYPES[type].label, ...(DEFAULT_CONFIG[type] || {}) } };
    const match = (e) => e.from === parentId && (e.branch || '') === (branch || '');
    const old = selected.edges.find(match);
    const edges = selected.edges.filter((e) => !match(e));
    edges.push({ from: parentId, to: id, branch: branch || '' });
    if (old) edges.push({ from: id, to: old.to, branch: '' });
    patchSelected({ nodes: [...selected.nodes, node], edges });
    setPickerOpen(false);
    setActiveNode({ ...node });
    setDrawerOpen(true);
  };

  const deleteStep = (nodeId) => {
    const child = childOf(selected.edges, nodeId);
    const edges = [];
    for (const e of selected.edges) {
      if (e.from === nodeId) continue;
      if (e.to === nodeId) { if (child) edges.push({ ...e, to: child }); continue; }
      edges.push(e);
    }
    const next = pruned(selected.nodes.filter((n) => n.id !== nodeId), edges);
    patchSelected(next);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await API.put(`/admin/workflows/${selected._id}`, {
        name: selected.name,
        description: selected.description,
        trigger: selected.trigger,
        nodes: selected.nodes,
        edges: selected.edges,
      });
      setSelected((prev) => ({ ...data, recentRuns: prev?.recentRuns || [] }));
      setDirty(false);
      await loadWorkflows();
      message.success('Saved');
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const brokenSteps = (selected?.nodes || []).filter((n) => n.type !== 'trigger' && needsSetup(n));

  const toggleActive = async (wf) => {
    const turningOn = !wf.active;
    if (turningOn && dirty) return message.warning('Save your changes first');
    if (turningOn && wf.trigger?.type === 'manual') return message.warning('Pick a real trigger first — "by hand" never runs on its own');
    if (turningOn && brokenSteps.length) return message.warning(`${brokenSteps.length} step(s) still need setting up`);
    try {
      const { data } = await API.post(`/admin/workflows/${wf._id}/toggle`);
      message.success(data.active ? 'Live — it runs on its own now' : 'Paused');
      await loadWorkflows();
      if (selected?._id === wf._id) setSelected((p) => ({ ...p, active: data.active }));
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not change this');
    }
  };

  const createWorkflow = async () => {
    if (!newName.trim()) return message.warning('Give it a name');
    try {
      const { data } = await API.post('/admin/workflows', { name: newName.trim(), description: newDesc.trim() });
      const preset = STARTERS[starter];
      let created = data;
      if (preset && preset.nodes.length) {
        const trigNode = { ...data.nodes[0], config: { label: triggerLabel(preset.trigger.type) } };
        const res = await API.put(`/admin/workflows/${data._id}`, {
          trigger: preset.trigger,
          nodes: [trigNode, ...preset.nodes],
          edges: preset.edges,
        });
        created = res.data;
      }
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      await loadWorkflows();
      openWorkflow(created);
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not create');
    }
  };

  const removeWorkflow = async (wf) => {
    await API.delete(`/admin/workflows/${wf._id}`);
    if (selected?._id === wf._id) setSelected(null);
    await loadWorkflows();
    message.success('Deleted');
  };

  const runTest = async () => {
    if (!testLead) return message.warning('Pick a lead to test with');
    setTesting(true);
    try {
      const { data } = await API.post(`/admin/workflows/${selected._id}/test-run`, { leadId: testLead });
      setLastRun(data.run);
      setTestOpen(false);
      message.success('Test finished — the step log is at the bottom of the page');
    } catch (err) {
      message.error(err.response?.data?.error || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const refreshRuns = async () => {
    const { data } = await API.get('/admin/workflows/runs', { params: { workflow: selected._id, limit: 20 } });
    setRuns(data || []);
    message.success('Activity refreshed');
  };

  const setCfg = (patch) => setActiveNode((n) => ({ ...n, config: { ...n.config, ...patch } }));

  const saveNode = () => {
    if (activeNode.type === 'trigger') {
      patchSelected({
        trigger: activeNode.trigger,
        nodes: selected.nodes.map((n) => (n.id === activeNode.id ? { ...n, config: activeNode.config } : n)),
      });
    } else {
      patchSelected({ nodes: selected.nodes.map((n) => (n.id === activeNode.id ? { ...n, config: activeNode.config } : n)) });
    }
    setDrawerOpen(false);
  };

  const editTrigger = () => {
    setActiveNode({ ...triggerNode, config: { ...triggerNode.config }, trigger: selected.trigger || { type: 'lead_created', config: {} } });
    setDrawerOpen(true);
  };

  const openPicker = (parentId, branch) => {
    setPickerAt({ parentId, branch });
    setPickerOpen(true);
  };

  const waTemplates = templates.filter((t) => t.type === 'whatsapp');

  // ── node config forms ──
  const renderNodeConfig = () => {
    if (!activeNode) return null;
    const cfg = activeNode.config || {};

    switch (activeNode.type) {
      case 'trigger': {
        const t = activeNode.trigger || { type: 'lead_created', config: {} };
        const setTrig = (patch) => setActiveNode((n) => ({ ...n, trigger: { ...t, ...patch } }));
        return (
          <>
            <div>
              <label className="nx-label">Start this workflow when…</label>
              <Select value={t.type} style={{ width: '100%' }}
                onChange={(type) => { setTrig({ type, config: {} }); setCfg({ label: triggerLabel(type) }); }}>
                {TRIGGERS.map((x) => <Option key={x.type} value={x.type}>{x.label}</Option>)}
              </Select>
            </div>
            {t.type === 'lead_stage_changed' && (
              <div>
                <label className="nx-label">Which stage</label>
                <Select value={t.config?.stage} style={{ width: '100%' }} placeholder="Any stage"
                  onChange={(stage) => setTrig({ config: { ...t.config, stage } })}>
                  {STAGES.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </div>
            )}
            {t.type === 'no_reply' && (
              <div>
                <label className="nx-label">Quiet for how many days</label>
                <InputNumber min={1} max={90} value={t.config?.days ?? 3} style={{ width: '100%' }}
                  onChange={(days) => setTrig({ config: { ...t.config, days } })} />
              </div>
            )}
            {t.type === 'lead_created' && (
              <div>
                <label className="nx-label">Only from this source (leave blank for all)</label>
                <Input value={t.config?.source || ''} placeholder="e.g. book-consultation"
                  onChange={(e) => setTrig({ config: { ...t.config, source: e.target.value } })} />
              </div>
            )}
          </>
        );
      }

      case 'email':
        return (
          <>
            <div>
              <label className="nx-label">Subject</label>
              <Input value={cfg.subject || ''} onChange={(e) => setCfg({ subject: e.target.value })} placeholder="Your study abroad plan" />
            </div>
            <div>
              <label className="nx-label">Message</label>
              <TextArea rows={8} value={cfg.body || ''} onChange={(e) => setCfg({ body: e.target.value })} placeholder={'Hi {{name}},\n\n…'} />
            </div>
            <Alert type="info" showIcon message="Use {{name}}, {{dreamCountry}}, {{preferredIntake}} — each lead gets its own." />
          </>
        );

      case 'whatsapp':
        return (
          <>
            <div>
              <label className="nx-label">Approved WhatsApp template</label>
              <Select value={cfg.template} style={{ width: '100%' }} placeholder="Pick a template"
                onChange={(template) => {
                  const t = waTemplates.find((x) => x._id === template);
                  setCfg({ template, label: t ? `WhatsApp: ${t.name}` : cfg.label });
                }}>
                {waTemplates.map((t) => (
                  <Option key={t._id} value={t._id} disabled={t.metaStatus !== 'APPROVED'}>
                    {t.name} {t.metaStatus !== 'APPROVED' ? `(${t.metaStatus})` : ''}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="nx-label">Values for the template, separated by |</label>
              <Input value={cfg.params || ''} placeholder="{{name}}|{{dreamCountry}}" onChange={(e) => setCfg({ params: e.target.value })} />
            </div>
            <Alert type="warning" showIcon message="Only Meta-approved templates can reach someone who has not written to us in the last 24 hours." />
          </>
        );

      case 'ai_message':
        return (
          <>
            <div>
              <label className="nx-label">Send as</label>
              <Select value={cfg.channel || 'whatsapp'} style={{ width: '100%' }} onChange={(channel) => setCfg({ channel })}>
                <Option value="whatsapp">WhatsApp</Option>
                <Option value="email">Email</Option>
              </Select>
            </div>
            <div>
              <label className="nx-label">What should the message do</label>
              <Select value={cfg.goal || 'book_call'} style={{ width: '100%' }} onChange={(goal) => setCfg({ goal })}>
                <Option value="book_call">Get them on a counselling call</Option>
                <Option value="re_engage">Wake up a quiet lead</Option>
                <Option value="answer_query">Answer their question</Option>
                <Option value="share_documents">Ask for documents</Option>
              </Select>
            </div>
            <div>
              <label className="nx-label">Extra instruction for the AI (optional)</label>
              <TextArea rows={4} value={cfg.customPrompt || ''} onChange={(e) => setCfg({ customPrompt: e.target.value })}
                placeholder="Say the consultation is free. Keep it under 4 lines." />
            </div>
            <Alert type="info" showIcon
              message="On WhatsApp this sends only if the student wrote to us in the last 24 hours. Otherwise the message is saved on the lead as a draft for the counsellor." />
          </>
        );

      case 'ai_classify':
        return (
          <>
            <div>
              <label className="nx-label">Go down the YES path when the student is…</label>
              <Select value={cfg.expectIntent} style={{ width: '100%' }} placeholder="No split — just read and tag it"
                allowClear onChange={(expectIntent) => setCfg({ expectIntent })}>
                {INTENTS.map((i) => <Option key={i} value={i}>{i.replace(/_/g, ' ')}</Option>)}
              </Select>
            </div>
            <Checkbox checked={cfg.apply !== false} onChange={(e) => setCfg({ apply: e.target.checked })}>
              Also tag the lead and update its stage from what the AI read
            </Checkbox>
          </>
        );

      case 'ai_score':
        return <Alert type="info" showIcon message="Scores the lead Hot / Warm / Cold. Put an If / Condition on “score” right after to treat hot leads differently." />;

      case 'pipeline':
        return (
          <div>
            <label className="nx-label">Move the lead to</label>
            <Select value={cfg.stage} style={{ width: '100%' }} onChange={(stage) => setCfg({ stage, label: `Move to ${stage}` })}>
              {STAGES.map((s) => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </div>
        );

      case 'counselor':
        return (
          <div>
            <label className="nx-label">Assign to</label>
            <Select value={cfg.counselor} style={{ width: '100%' }} showSearch optionFilterProp="children"
              onChange={(counselor) => setCfg({ counselor, label: `Assign to ${counselor}` })}>
              {staff.map((s) => <Option key={s._id} value={s.name}>{s.name}</Option>)}
            </Select>
          </div>
        );

      case 'tag':
        return (
          <div>
            <label className="nx-label">Tag to add</label>
            <Input value={cfg.tag || ''} onChange={(e) => setCfg({ tag: e.target.value })} placeholder="hot-lead" />
          </div>
        );

      case 'note':
      case 'calendar':
        return (
          <div>
            <label className="nx-label">Note to write on the lead</label>
            <TextArea rows={4} value={cfg.message || ''} onChange={(e) => setCfg({ message: e.target.value })}
              placeholder="Follow-up due — please call {{name}}" />
          </div>
        );

      case 'delay':
        return (
          <div>
            <label className="nx-label">Wait for</label>
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber min={1} value={cfg.duration ?? 2} style={{ width: '50%' }}
                onChange={(duration) => setCfg({ duration, label: `Wait ${duration} ${cfg.unit || 'hours'}` })} />
              <Select value={cfg.unit || 'hours'} style={{ width: '50%' }}
                onChange={(unit) => setCfg({ unit, label: `Wait ${cfg.duration ?? 2} ${unit}` })}>
                <Option value="minutes">minutes</Option>
                <Option value="hours">hours</Option>
                <Option value="days">days</Option>
              </Select>
            </Space.Compact>
          </div>
        );

      case 'condition':
        return (
          <>
            <div>
              <label className="nx-label">Check this</label>
              <Select value={cfg.field || 'status'} style={{ width: '100%' }} onChange={(field) => setCfg({ field })}>
                <Option value="status">Stage</Option>
                <Option value="dreamCountry">Dream country</Option>
                <Option value="preferredIntake">Intake</Option>
                <Option value="tags">Tags</Option>
                <Option value="score">AI score (needs an “AI scores the lead” step first)</Option>
                <Option value="ai.intent">AI intent (needs an “AI reads the reply” step first)</Option>
              </Select>
            </div>
            <div>
              <label className="nx-label">Is</label>
              <Select value={cfg.op || 'eq'} style={{ width: '100%' }} onChange={(op) => setCfg({ op })}>
                <Option value="eq">equal to</Option>
                <Option value="ne">not equal to</Option>
                <Option value="gt">greater than</Option>
                <Option value="lt">less than</Option>
                <Option value="contains">contains</Option>
                <Option value="exists">filled in</Option>
              </Select>
            </div>
            {cfg.op !== 'exists' && (
              <div>
                <label className="nx-label">This value</label>
                <Input value={cfg.value || ''} onChange={(e) => setCfg({ value: e.target.value })} placeholder="e.g. Canada, or 75" />
              </div>
            )}
            <Alert type="info" showIcon message="Back on the page you get two lists under this step: IF YES and IF NO. Put the steps for each one there." />
          </>
        );

      case 'webhook':
        return (
          <div>
            <label className="nx-label">POST the lead to this URL</label>
            <Input value={cfg.url || ''} onChange={(e) => setCfg({ url: e.target.value })} placeholder="https://hooks.example.com/uc" />
          </div>
        );

      default:
        return null;
    }
  };

  const stepCount = (selected?.nodes || []).filter((n) => n.type !== 'trigger').length;

  return (
    <div>
      <Header
        title="Automation Workflows"
        subtitle="Pick what starts it, then list what should happen. Switch it on and it runs by itself."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Create workflow</Button>}
      />

      <div className="dashboard-content">
        <Row gutter={[16, 16]}>
          {/* list */}
          <Col xs={24} lg={7}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="nx-label" style={{ padding: '0 4px' }}>
                Workflows <span className="nx-tab-count">{workflows.length}</span>
              </div>

              {loading && <Spin />}
              {!loading && !workflows.length && (
                <div className="nx-card" style={{ padding: 24 }}>
                  <Empty description="No workflows yet. Create one to automate follow-ups." />
                </div>
              )}

              {workflows.map((wf) => {
                const isSelected = selected?._id === wf._id;
                return (
                  <div key={wf._id} onClick={() => openWorkflow(wf)}
                    style={{
                      padding: '16px 18px', borderRadius: 20, cursor: 'pointer', background: '#fff',
                      border: isSelected ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className={`nx-status ${wf.active ? 'nx-status--success' : 'nx-status--neutral'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {wf.active ? 'Live' : 'Draft'}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>
                        {(wf.nodes?.length || 1) - 1} steps
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 4px', color: 'var(--ux-ink)' }}>{wf.name}</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--ux-text-2)', margin: '0 0 8px' }}>
                      When {trig(wf.trigger?.type)?.plain || 'something happens'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ux-text-3)' }}>
                      <span><ThunderboltOutlined /> {wf.stats?.runs || 0} runs</span>
                      <span>{timeAgo(wf.stats?.lastRunAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* the workflow itself */}
          <Col xs={24} lg={17}>
            {!selected ? (
              <div className="nx-card" style={{ height: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderStyle: 'dashed' }}>
                <span className="nx-icon-circle" style={{ width: 56, height: 56, fontSize: 22 }}><ApartmentOutlined /></span>
                <h3 style={{ margin: 0 }}>Pick a workflow</h3>
                <p style={{ fontSize: 13, color: 'var(--ux-text-3)', margin: 0 }}>Choose one on the left, or create a new one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* toolbar */}
                <div className="nx-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 20px' }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{selected.name}</h3>
                    <span style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>
                      When {trig(selected.trigger?.type)?.plain || '…'} · {stepCount} step{stepCount === 1 ? '' : 's'}
                      {dirty ? ' · not saved yet' : ''}
                    </span>
                  </div>
                  <Space size="middle" wrap>
                    <Tooltip title={selected.active ? 'It is running on its own' : 'Switch on to let it run on its own'}>
                      <Space size={8}>
                        <span className={`nx-status ${selected.active ? 'nx-status--success' : 'nx-status--neutral'}`}>{selected.active ? 'Live' : 'Off'}</span>
                        <Switch size="small" checked={selected.active} onChange={() => toggleActive(selected)} />
                      </Space>
                    </Tooltip>
                    <Button icon={<PlayCircleOutlined />} onClick={() => setTestOpen(true)}>Test run</Button>
                    <Popconfirm title="Delete this workflow?" onConfirm={() => removeWorkflow(selected)}>
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!dirty}>Save</Button>
                  </Space>
                </div>

                {dirty && selected.active && (
                  <Alert type="warning" showIcon message="This one is live. Your changes only start running once you press Save." />
                )}
                {!!brokenSteps.length && (
                  <Alert type="warning" showIcon
                    message={brokenSteps.length === 1
                      ? 'One step still needs setting up — it is marked below.'
                      : `${brokenSteps.length} steps still need setting up — they are marked below.`} />
                )}

                {/* 1 · trigger */}
                <section>
                  <div className="nx-label" style={{ marginBottom: 8 }}>Step 1 · When should this run?</div>
                  <div className="nx-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', border: '1px solid var(--ux-ink)' }}>
                    <span className="nx-icon-circle" style={{ flexShrink: 0 }}><ThunderboltOutlined /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600 }}>{triggerLabel(selected.trigger?.type)}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>
                        {selected.trigger?.type === 'no_reply' && `After ${selected.trigger?.config?.days ?? 3} quiet days`}
                        {selected.trigger?.type === 'lead_stage_changed' && (selected.trigger?.config?.stage ? `Only the “${selected.trigger.config.stage}” stage` : 'Any stage')}
                        {selected.trigger?.type === 'lead_created' && (selected.trigger?.config?.source ? `Only from “${selected.trigger.config.source}”` : 'Any source')}
                        {['followup_due', 'whatsapp_reply', 'manual'].includes(selected.trigger?.type) && 'Runs for the lead it happened to'}
                      </div>
                    </div>
                    <Button size="small" icon={<EditOutlined />} onClick={editTrigger}>Change</Button>
                  </div>
                </section>

                {/* 2 · steps */}
                <section>
                  <div className="nx-label" style={{ marginBottom: 8 }}>Step 2 · What should happen, in order?</div>
                  <StepChain
                    wf={selected}
                    startId={childOf(selected.edges, triggerNode?.id)}
                    numbers={numberSteps(selected.nodes, selected.edges, childOf(selected.edges, triggerNode?.id))}
                    templates={templates}
                    parentId={triggerNode?.id}
                    branch=""
                    onEdit={(node) => { setActiveNode({ ...node, config: { ...node.config } }); setDrawerOpen(true); }}
                    onDelete={deleteStep}
                    onAdd={openPicker}
                  />
                </section>

                {/* 3 · activity */}
                <section>
                  <div className="nx-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    Step 3 · What it has done so far
                    <Button size="small" icon={<HistoryOutlined />} onClick={refreshRuns}>Refresh</Button>
                  </div>
                  <div className="nx-card" style={{ padding: 18 }}>
                    {lastRun && (
                      <div style={{ marginBottom: 18 }}>
                        <h4 style={{ margin: '0 0 10px' }}>Your test run — {lastRun.status}</h4>
                        <Timeline items={(lastRun.steps || []).map((s) => ({
                          color: s.ok ? 'green' : 'red',
                          children: <span style={{ fontSize: 12.5 }}><strong>{s.label || s.type}</strong>{s.info ? ` — ${s.info}` : ''}</span>,
                        }))} />
                        {lastRun.error && <Alert type="error" showIcon message={lastRun.error} />}
                      </div>
                    )}
                    {!runs.length && !lastRun && <Empty description="It has not run for anybody yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    {runs.map((r) => (
                      <div key={r._id} style={{ padding: '10px 0', borderTop: '1px solid var(--ux-line-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: 13.5 }}>{r.leadName || 'Lead'}</strong>
                          <Space>
                            <Tag color={{ done: 'green', failed: 'red', waiting: 'gold', running: 'blue', stopped: 'default' }[r.status]}>{r.status}</Tag>
                            <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>{timeAgo(r.createdAt)}</span>
                          </Space>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 4 }}>
                          {(r.steps || []).map((s) => s.label || s.type).join(' → ') || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* add a step */}
      <Modal title="Add a step" open={pickerOpen} onCancel={() => setPickerOpen(false)} footer={null} width={720}>
        <p style={{ color: 'var(--ux-text-3)', fontSize: 13, margin: '4px 0 18px' }}>
          {pickerAt.branch ? `This step goes on the ${pickerAt.branch.toUpperCase()} path.` : 'It will be added right here in the list.'}
        </p>
        {GROUPS.map((g) => (
          <div key={g} style={{ marginBottom: 18 }}>
            <div className="nx-label" style={{ marginBottom: 8 }}>{g}</div>
            <Row gutter={[10, 10]}>
              {Object.entries(NODE_TYPES).filter(([k, t]) => t.group === g && k !== 'calendar').map(([key, t]) => (
                <Col xs={24} sm={12} key={key}>
                  <button type="button" onClick={() => addStep(key)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 14, cursor: 'pointer',
                      border: '1px solid var(--ux-line-2)', background: '#fff', display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                    <span className="nx-icon-circle" style={{ flexShrink: 0 }}>{t.icon}</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{t.label}</span>
                      <span style={{ display: 'block', fontSize: 12, color: 'var(--ux-text-3)' }}>{t.blurb}</span>
                    </span>
                  </button>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Modal>

      {/* node config */}
      <Drawer
        title={activeNode ? (activeNode.type === 'trigger' ? 'When should this run?' : `Set up: ${NODE_TYPES[activeNode.type]?.label}`) : ''}
        placement="right" styles={{ wrapper: { width: 460 } }}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} destroyOnClose
        extra={<Button type="primary" icon={<CheckCircleOutlined />} onClick={saveNode}>Done</Button>}
      >
        {activeNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="nx-label">Step name (only you see it)</label>
              <Input value={activeNode.config?.label || ''} onChange={(e) => setCfg({ label: e.target.value })} />
            </div>
            {renderNodeConfig()}
            <Alert type="info" showIcon message="Press Done, then Save at the top — nothing changes until you save." />
          </div>
        )}
      </Drawer>

      {/* create */}
      <Modal title="New workflow" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={createWorkflow} okText="Create">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <Input placeholder="Name, e.g. Follow-up chaser" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <TextArea rows={3} placeholder="What it does" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <div>
            <label className="nx-label">Start from</label>
            <Select value={starter} style={{ width: '100%' }} onChange={setStarter}>
              {Object.entries(STARTERS).map(([key, v]) => <Option key={key} value={key}>{v.label}</Option>)}
            </Select>
          </div>
          <Alert type="info" showIcon message="A new workflow is a draft. Nothing runs until you switch it to Live." />
        </div>
      </Modal>

      {/* test run */}
      <Modal title="Test it on one lead" open={testOpen} onCancel={() => setTestOpen(false)} onOk={runTest} okText="Run it" confirmLoading={testing}>
        <Alert type="warning" showIcon style={{ margin: '12px 0' }} message="This is a real run — messages in it really go out to that lead." />
        <Select showSearch optionFilterProp="children" style={{ width: '100%' }} placeholder="Pick a lead" value={testLead} onChange={setTestLead}>
          {leads.map((l) => <Option key={l._id} value={l._id}>{l.name} — {l.phone}</Option>)}
        </Select>
      </Modal>
    </div>
  );
};

export default Workflows;
