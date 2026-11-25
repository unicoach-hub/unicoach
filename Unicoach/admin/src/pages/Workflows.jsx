import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Tag, Modal, Select, Input, InputNumber, message, Space, Badge, Drawer,
  Switch, Row, Col, Empty, Spin, Popconfirm, Alert, Timeline, Checkbox,
} from 'antd';
import {
  PlusOutlined, ThunderboltOutlined, DeleteOutlined, MailOutlined, MessageOutlined,
  ClockCircleOutlined, UserAddOutlined, BranchesOutlined, SaveOutlined, ApartmentOutlined,
  ApiOutlined, RobotOutlined, TagOutlined, FileTextOutlined, StarOutlined,
  CheckCircleOutlined, PlayCircleOutlined, HistoryOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// ─── Step types ───────────────────────────────────────────────
// Must stay in step with NODE_CATALOG in backend/controllers/workflowController.js
const NODE_TYPES = {
  trigger:     { label: 'Trigger',                 icon: <ThunderboltOutlined />, group: 'trigger' },
  email:       { label: 'Send Email',              icon: <MailOutlined />,        group: 'Messages' },
  whatsapp:    { label: 'Send WhatsApp',           icon: <MessageOutlined />,     group: 'Messages' },
  ai_message:  { label: 'AI: Write & Send',        icon: <RobotOutlined />,       group: 'AI' },
  ai_classify: { label: 'AI: Read Reply',          icon: <RobotOutlined />,       group: 'AI' },
  ai_score:    { label: 'AI: Score Lead',          icon: <StarOutlined />,        group: 'AI' },
  pipeline:    { label: 'Move Stage',              icon: <ApartmentOutlined />,   group: 'CRM' },
  counselor:   { label: 'Assign Counselor',        icon: <UserAddOutlined />,     group: 'CRM' },
  tag:         { label: 'Add Tag',                 icon: <TagOutlined />,         group: 'CRM' },
  note:        { label: 'Add Note',                icon: <FileTextOutlined />,    group: 'CRM' },
  delay:       { label: 'Wait / Delay',            icon: <ClockCircleOutlined />, group: 'Flow' },
  condition:   { label: 'If / Condition',          icon: <BranchesOutlined />,    group: 'Flow' },
  webhook:     { label: 'Webhook',                 icon: <ApiOutlined />,         group: 'Flow' },
  calendar:    { label: 'Note (old step)',         icon: <FileTextOutlined />,    group: 'Flow' },
};

const TRIGGERS = [
  { type: 'lead_created',       label: 'New lead comes in' },
  { type: 'lead_stage_changed', label: 'Lead moves to a stage' },
  { type: 'followup_due',       label: 'Follow-up date is due' },
  { type: 'no_reply',           label: 'Lead goes quiet for N days' },
  { type: 'whatsapp_reply',     label: 'Student replies on WhatsApp' },
  { type: 'manual',             label: 'Only when I run it by hand' },
];

const STAGES = ['new', 'contacted', 'qualified', 'interested', 'fifty_fifty', 'not_interested', 'converted', 'closed'];
const INTENTS = ['interested', 'wants_price', 'wants_call', 'not_now', 'not_interested', 'wrong_number', 'question', 'other'];


// Ready-made automations, so a new workflow does not start from an empty canvas.
const STARTERS = {
  blank: { label: 'Blank — I will build it myself', trigger: { type: 'lead_created', config: {} }, nodes: [], edges: [] },
  chaser: {
    label: 'Follow-up chaser — chase a lead when its follow-up date is due',
    trigger: { type: 'followup_due', config: {} },
    nodes: [
      { id: 'n2', type: 'ai_score', x: 60, y: 180, config: { label: 'AI: score this lead' } },
      { id: 'n3', type: 'condition', x: 60, y: 320, config: { label: 'Hot lead?', field: 'score', op: 'gt', value: '75' } },
      { id: 'n4', type: 'ai_message', x: 60, y: 460, config: { label: 'AI writes a nudge', channel: 'whatsapp', goal: 'book_call' } },
      { id: 'n5', type: 'note', x: 400, y: 460, config: { label: 'Note for the counsellor', message: 'Follow-up due for {{name}} — please call.' } },
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
      { id: 'n2', type: 'ai_classify', x: 60, y: 180, config: { label: 'AI reads the reply', expectIntent: 'interested', apply: true } },
      { id: 'n3', type: 'pipeline', x: 60, y: 320, config: { label: 'Move to interested', stage: 'interested' } },
      { id: 'n4', type: 'tag', x: 400, y: 320, config: { label: 'Tag for later', tag: 'needs-a-human' } },
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
      { id: 'n2', type: 'ai_message', x: 60, y: 180, config: { label: 'AI writes a check-in', channel: 'whatsapp', goal: 're_engage' } },
      { id: 'n3', type: 'delay', x: 60, y: 320, config: { label: 'Wait 2 days', duration: 2, unit: 'days' } },
      { id: 'n4', type: 'tag', x: 60, y: 460, config: { label: 'Tag: revive attempted', tag: 'revive-sent' } },
    ],
    edges: [
      { from: 'n1', to: 'n2', branch: '' },
      { from: 'n2', to: 'n3', branch: '' },
      { from: 'n3', to: 'n4', branch: '' },
    ],
  },
};

const triggerLabel = (type) => TRIGGERS.find((t) => t.type === type)?.label || 'Trigger';
const timeAgo = (date) => {
  if (!date) return 'Never run';
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
};

// ─── Canvas ───────────────────────────────────────────────────
const WorkflowCanvas = ({ workflow, onDeleteNode, onNodeClick }) => {
  const NODE_W = 270;
  const NODE_H = 76;
  const height = Math.max(420, ...workflow.nodes.map((n) => (n.y || 0) + 160));

  const renderEdge = (edge, idx) => {
    const from = workflow.nodes.find((n) => n.id === edge.from);
    const to = workflow.nodes.find((n) => n.id === edge.to);
    if (!from || !to) return null;
    const x1 = from.x + NODE_W / 2;
    const y1 = from.y + NODE_H;
    const x2 = to.x + NODE_W / 2;
    const y2 = to.y;
    const midY = (y1 + y2) / 2;
    const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    const colour = edge.branch === 'no' ? '#b0aea6' : edge.branch === 'yes' ? '#2e9e6b' : '#d6d3ca';
    return (
      <g key={idx}>
        <path d={path} fill="none" stroke={colour} strokeWidth="2" strokeDasharray={edge.branch === 'no' ? '5 4' : ''} />
        {edge.branch && (
          <text x={(x1 + x2) / 2 + 10} y={midY - 4} fontSize="11" fill={colour} fontWeight="600">
            {edge.branch.toUpperCase()}
          </text>
        )}
        <circle r="4" fill="#DE5C2B">
          <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
        </circle>
        <circle cx={x1} cy={y1} r="5" fill="#ffffff" stroke="#d6d3ca" strokeWidth="2" />
        <circle cx={x2} cy={y2} r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
      </g>
    );
  };

  const renderNode = (node) => {
    const type = NODE_TYPES[node.type] || NODE_TYPES.note;
    const isTrigger = node.type === 'trigger';
    return (
      <div
        key={node.id}
        onClick={() => onNodeClick(node)}
        style={{
          position: 'absolute', left: node.x, top: node.y, width: NODE_W, height: NODE_H,
          background: '#ffffff', border: `1px solid ${isTrigger ? 'var(--ux-ink)' : 'var(--ux-line)'}`,
          borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px',
          cursor: 'pointer', zIndex: 10,
        }}
      >
        <span className="nx-icon-circle" style={{ flexShrink: 0 }}>{type.icon}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ux-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.config?.label || type.label}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>{type.label}</div>
        </div>
        {!isTrigger && (
          <Button
            type="text" size="small" danger icon={<DeleteOutlined />}
            onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="nx-card" style={{ position: 'relative', height, overflow: 'auto', background: '#faf9f6' }}>
      <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }}>
        {workflow.edges.map(renderEdge)}
      </svg>
      {workflow.nodes.map(renderNode)}
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

  const [testOpen, setTestOpen] = useState(false);
  const [testLead, setTestLead] = useState(null);
  const [testing, setTesting] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
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
    setDirty(false);
    setLastRun(null);
  };

  const patchSelected = (patch) => {
    setSelected((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const addNode = (type) => {
    if (!selected) return;
    const last = selected.nodes[selected.nodes.length - 1];
    const id = `n${Date.now()}`;
    const node = { id, type, x: last?.x ?? 60, y: (last?.y ?? 40) + 140, config: { label: NODE_TYPES[type].label } };
    patchSelected({
      nodes: [...selected.nodes, node],
      edges: last ? [...selected.edges, { from: last.id, to: id, branch: '' }] : selected.edges,
    });
  };

  const deleteNode = (nodeId) => {
    patchSelected({
      nodes: selected.nodes.filter((n) => n.id !== nodeId),
      edges: selected.edges.filter((e) => e.from !== nodeId && e.to !== nodeId),
    });
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
      message.success('Workflow saved');
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (wf) => {
    const turningOn = !wf.active;
    if (turningOn && dirty) return message.warning('Save your changes first');
    if (turningOn && wf.trigger?.type === 'manual') {
      return message.warning('This workflow only runs by hand — pick a real trigger first');
    }
    try {
      const { data } = await API.post(`/admin/workflows/${wf._id}/toggle`);
      message.success(data.active ? 'Workflow is live — it will run on its own now' : 'Workflow paused');
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
    message.success('Workflow deleted');
  };

  const runTest = async () => {
    if (!testLead) return message.warning('Pick a lead to test with');
    setTesting(true);
    try {
      const { data } = await API.post(`/admin/workflows/${selected._id}/test-run`, { leadId: testLead });
      setLastRun(data.run);
      setTestOpen(false);
      message.success('Test finished — see the step log below');
    } catch (err) {
      message.error(err.response?.data?.error || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const openHistory = async () => {
    const { data } = await API.get('/admin/workflows/runs', { params: { workflow: selected._id, limit: 30 } });
    setRuns(data || []);
    setHistoryOpen(true);
  };

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

  const setCfg = (patch) => setActiveNode((n) => ({ ...n, config: { ...n.config, ...patch } }));

  const waTemplates = templates.filter((t) => t.type === 'whatsapp');

  // ── node config forms ──
  const renderNodeConfig = () => {
    if (!activeNode) return null;
    const cfg = activeNode.config || {};

    switch (activeNode.type) {
      case 'trigger': {
        const trig = activeNode.trigger || { type: 'lead_created', config: {} };
        const setTrig = (patch) => setActiveNode((n) => ({ ...n, trigger: { ...trig, ...patch } }));
        return (
          <>
            <div>
              <label className="nx-label">What starts this workflow</label>
              <Select
                value={trig.type}
                style={{ width: '100%' }}
                onChange={(type) => { setTrig({ type, config: {} }); setCfg({ label: triggerLabel(type) }); }}
              >
                {TRIGGERS.map((t) => <Option key={t.type} value={t.type}>{t.label}</Option>)}
              </Select>
            </div>
            {trig.type === 'lead_stage_changed' && (
              <div>
                <label className="nx-label">Which stage</label>
                <Select
                  value={trig.config?.stage} style={{ width: '100%' }} placeholder="Any stage"
                  onChange={(stage) => setTrig({ config: { ...trig.config, stage } })}
                >
                  {STAGES.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </div>
            )}
            {trig.type === 'no_reply' && (
              <div>
                <label className="nx-label">Quiet for how many days</label>
                <InputNumber
                  min={1} max={90} value={trig.config?.days ?? 3} style={{ width: '100%' }}
                  onChange={(days) => setTrig({ config: { ...trig.config, days } })}
                />
              </div>
            )}
            {trig.type === 'lead_created' && (
              <div>
                <label className="nx-label">Only from this source (optional)</label>
                <Input
                  value={trig.config?.source || ''} placeholder="e.g. book-consultation"
                  onChange={(e) => setTrig({ config: { ...trig.config, source: e.target.value } })}
                />
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
            <Alert type="info" showIcon message="Use {{name}}, {{dreamCountry}}, {{preferredIntake}} — they get filled in per lead." />
          </>
        );

      case 'whatsapp':
        return (
          <>
            <div>
              <label className="nx-label">Approved WhatsApp template</label>
              <Select
                value={cfg.template} style={{ width: '100%' }} placeholder="Pick a template"
                onChange={(template) => {
                  const t = waTemplates.find((x) => x._id === template);
                  setCfg({ template, label: t ? `WhatsApp: ${t.name}` : cfg.label });
                }}
              >
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
            <Alert type="warning" showIcon message="Only Meta-approved templates can be sent to someone who has not written to us in the last 24 hours." />
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
                placeholder="Mention that the consultation is free. Keep it under 4 lines." />
            </div>
            <Alert
              type="info" showIcon
              message="On WhatsApp this only sends if the student wrote to us in the last 24 hours. Otherwise the AI's message is saved on the lead as a draft for the counsellor."
            />
          </>
        );

      case 'ai_classify':
        return (
          <>
            <div>
              <label className="nx-label">Branch YES when the intent is</label>
              <Select value={cfg.expectIntent} style={{ width: '100%' }} placeholder="No branching — just read it"
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
        return <Alert type="info" showIcon message="Scores the lead Hot / Warm / Cold and writes it on the lead. Use an If / Condition on 'score' right after to split hot leads from the rest." />;

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
            <TextArea rows={4} value={cfg.message || ''} onChange={(e) => setCfg({ message: e.target.value })} placeholder="Follow-up due — call {{name}}" />
          </div>
        );

      case 'delay':
        return (
          <Space.Compact style={{ width: '100%' }}>
            <InputNumber min={1} value={cfg.duration ?? 2} style={{ width: '50%' }} onChange={(duration) => setCfg({ duration, label: `Wait ${duration} ${cfg.unit || 'hours'}` })} />
            <Select value={cfg.unit || 'hours'} style={{ width: '50%' }} onChange={(unit) => setCfg({ unit, label: `Wait ${cfg.duration ?? 2} ${unit}` })}>
              <Option value="minutes">minutes</Option>
              <Option value="hours">hours</Option>
              <Option value="days">days</Option>
            </Select>
          </Space.Compact>
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
                <Option value="score">AI score (needs an AI: Score step first)</Option>
                <Option value="ai.intent">AI intent (needs an AI: Read Reply step first)</Option>
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
                <Input value={cfg.value || ''} onChange={(e) => setCfg({ value: e.target.value })} placeholder="e.g. Canada or 80" />
              </div>
            )}
            <Alert type="info" showIcon message="Add the next two steps, then set one line to YES and the other to NO below." />
            <div>
              <label className="nx-label">Branches out of this step</label>
              {selected.edges.filter((e) => e.from === activeNode.id).map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12.5, flex: 1 }}>
                    → {selected.nodes.find((n) => n.id === e.to)?.config?.label || e.to}
                  </span>
                  <Select
                    size="small" value={e.branch || ''} style={{ width: 110 }}
                    onChange={(branch) => patchSelected({
                      edges: selected.edges.map((x) => (x.from === e.from && x.to === e.to ? { ...x, branch } : x)),
                    })}
                  >
                    <Option value="">always</Option>
                    <Option value="yes">YES</Option>
                    <Option value="no">NO</Option>
                  </Select>
                </div>
              ))}
            </div>
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

  const groups = ['Messages', 'AI', 'CRM', 'Flow'];

  return (
    <div>
      <Header
        title="Automation Workflows"
        subtitle="Draw an automation once — a trigger, then the steps. Live workflows run on their own, AI steps write and read the messages."
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
                  <div
                    key={wf._id}
                    onClick={() => openWorkflow(wf)}
                    style={{
                      padding: '16px 18px', borderRadius: 20, cursor: 'pointer', background: '#fff',
                      border: isSelected ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className={`nx-status ${wf.active ? 'nx-status--success' : 'nx-status--neutral'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {wf.active ? 'Live' : 'Draft'}
                      </span>
                      <Badge count={wf.nodes?.length || 0} style={{ backgroundColor: isSelected ? '#111' : '#96958e', fontSize: 10, boxShadow: 'none' }} />
                    </div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 600, margin: '0 0 4px', color: 'var(--ux-ink)' }}>{wf.name}</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--ux-text-2)', margin: '0 0 8px' }}>{wf.description || triggerLabel(wf.trigger?.type)}</p>
                    <Tag bordered={false} style={{ fontSize: 11, marginBottom: 8 }}>{triggerLabel(wf.trigger?.type)}</Tag>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ux-text-3)' }}>
                      <span><ThunderboltOutlined /> {wf.stats?.runs || 0} runs</span>
                      <span>{timeAgo(wf.stats?.lastRunAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* canvas */}
          <Col xs={24} lg={17}>
            {!selected ? (
              <div className="nx-card" style={{ height: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderStyle: 'dashed' }}>
                <span className="nx-icon-circle" style={{ width: 56, height: 56, fontSize: 22 }}><ApartmentOutlined /></span>
                <h3 style={{ margin: 0 }}>Select a workflow</h3>
                <p style={{ fontSize: 13, color: 'var(--ux-text-3)', margin: 0 }}>Pick one on the left, or create a new one.</p>
              </div>
            ) : (
              <div>
                <div className="nx-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span className="nx-icon-circle"><ApartmentOutlined /></span>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{selected.name}</h3>
                      <span style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>
                        {triggerLabel(selected.trigger?.type)} · {selected.nodes.length} steps{dirty ? ' · unsaved changes' : ''}
                      </span>
                    </div>
                  </div>
                  <Space size="middle" wrap>
                    <Space size={8}>
                      <span className={`nx-status ${selected.active ? 'nx-status--success' : 'nx-status--neutral'}`}>{selected.active ? 'Live' : 'Off'}</span>
                      <Switch size="small" checked={selected.active} onChange={() => toggleActive(selected)} />
                    </Space>
                    <Button icon={<HistoryOutlined />} onClick={openHistory}>History</Button>
                    <Button icon={<PlayCircleOutlined />} onClick={() => setTestOpen(true)}>Test run</Button>
                    <Popconfirm title="Delete this workflow?" onConfirm={() => removeWorkflow(selected)}>
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                    <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!dirty}>Save</Button>
                  </Space>
                </div>

                {selected.active && dirty && (
                  <Alert style={{ marginBottom: 12 }} type="warning" showIcon
                    message="This workflow is live. Your edits only start running once you press Save." />
                )}

                <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
                  {groups.map((g) => (
                    <div key={g} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="nx-label" style={{ marginRight: 2 }}>{g}</span>
                      {Object.entries(NODE_TYPES).filter(([, t]) => t.group === g).map(([key, t]) => (
                        <button key={key} type="button" className="nx-btn nx-btn--light nx-btn--sm" onClick={() => addNode(key)}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <WorkflowCanvas
                  workflow={selected}
                  onDeleteNode={deleteNode}
                  onNodeClick={(node) => {
                    setActiveNode(node.type === 'trigger'
                      ? { ...node, config: { ...node.config }, trigger: selected.trigger || { type: 'lead_created', config: {} } }
                      : { ...node, config: { ...node.config } });
                    setDrawerOpen(true);
                  }}
                />

                {lastRun && (
                  <div className="nx-card" style={{ marginTop: 16, padding: 18 }}>
                    <h4 style={{ margin: '0 0 12px' }}>Test run — {lastRun.status}</h4>
                    <Timeline
                      items={(lastRun.steps || []).map((s) => ({
                        color: s.ok ? 'green' : 'red',
                        children: <span><strong>{s.label || s.type}</strong>{s.info ? ` — ${s.info}` : ''}</span>,
                      }))}
                    />
                    {lastRun.error && <Alert type="error" showIcon message={lastRun.error} />}
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* node config */}
      <Drawer
        title={activeNode ? `Configure: ${NODE_TYPES[activeNode.type]?.label}` : ''}
        placement="right" styles={{ wrapper: { width: 460 } }}
        open={drawerOpen} onClose={() => setDrawerOpen(false)} destroyOnClose
        extra={<Button type="primary" icon={<CheckCircleOutlined />} onClick={saveNode}>Done</Button>}
      >
        {activeNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="nx-label">Step name</label>
              <Input value={activeNode.config?.label || ''} onChange={(e) => setCfg({ label: e.target.value })} />
            </div>
            {renderNodeConfig()}
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
          <Alert type="info" showIcon message="A new workflow is always a draft. Nothing runs until you switch it to Live." />
        </div>
      </Modal>

      {/* test run */}
      <Modal
        title="Test this workflow on one lead" open={testOpen} onCancel={() => setTestOpen(false)}
        onOk={runTest} okText="Run it" confirmLoading={testing}
      >
        <Alert type="warning" showIcon style={{ margin: '12px 0' }}
          message="This is a real run: messages in it really go out to that lead." />
        <Select
          showSearch optionFilterProp="children" style={{ width: '100%' }} placeholder="Pick a lead"
          value={testLead} onChange={setTestLead}
        >
          {leads.map((l) => <Option key={l._id} value={l._id}>{l.name} — {l.phone}</Option>)}
        </Select>
      </Modal>

      {/* history */}
      <Drawer title="Recent runs" placement="right" styles={{ wrapper: { width: 520 } }} open={historyOpen} onClose={() => setHistoryOpen(false)}>
        {!runs.length && <Empty description="No runs yet" />}
        {runs.map((r) => (
          <div key={r._id} className="nx-card" style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 13.5 }}>{r.leadName || 'Lead'}</strong>
              <Tag color={{ done: 'green', failed: 'red', waiting: 'gold', running: 'blue', stopped: 'default' }[r.status]}>{r.status}</Tag>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', marginBottom: 8 }}>{timeAgo(r.createdAt)}</div>
            <Timeline
              items={(r.steps || []).map((s) => ({
                color: s.ok ? 'green' : 'red',
                children: <span style={{ fontSize: 12.5 }}>{s.label || s.type}{s.info ? ` — ${s.info}` : ''}</span>,
              }))}
            />
            {r.error && <div style={{ fontSize: 12, color: '#c0392b' }}>{r.error}</div>}
          </div>
        ))}
      </Drawer>
    </div>
  );
};

export default Workflows;
