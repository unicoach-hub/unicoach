import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, Handle, Position,
  addEdge, useNodesState, useEdgesState, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Input, Select, Switch, Table, Modal, message, Popconfirm, Tooltip, Upload, Empty, Checkbox } from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, SaveOutlined, DeleteOutlined, MessageOutlined, PictureOutlined,
  AppstoreOutlined, UnorderedListOutlined, LinkOutlined, PhoneOutlined, CustomerServiceOutlined,
  ThunderboltOutlined, UploadOutlined, CloseOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

// WhatsApp chatbot flow builder: drag steps onto the canvas and connect them.
// Flow Start (keywords like "hi") → messages, media, buttons, lists, links, contact cards, hand to a person.
// Each button / list option has its own connector, so every choice can lead somewhere different.

const FlowCtx = createContext(null);
const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;

const NODE_TYPES_META = {
  start: { label: 'Flow Start', icon: <ThunderboltOutlined />, color: '#0f766e' },
  text: { label: 'Message', icon: <MessageOutlined />, color: '#2563eb' },
  question: { label: 'Ask a question', icon: <QuestionCircleOutlined />, color: '#9333ea' },
  media: { label: 'Image / Video / PDF', icon: <PictureOutlined />, color: '#7c3aed' },
  buttons: { label: 'Message + Buttons', icon: <AppstoreOutlined />, color: '#DE5C2B' },
  list: { label: 'List menu', icon: <UnorderedListOutlined />, color: '#b45309' },
  link: { label: 'Link button', icon: <LinkOutlined />, color: '#0891b2' },
  contact: { label: 'Call / Contact card', icon: <PhoneOutlined />, color: '#16a34a' },
  handoff: { label: 'Talk to a person', icon: <CustomerServiceOutlined />, color: '#be123c' },
};

const DEFAULT_DATA = {
  text: () => ({ text: 'Hi! 👋 Welcome to UniCoach.' }),
  question: () => ({ text: 'What is your name?', field: 'name', validate: 'text', options: [] }),
  media: () => ({ mediaType: 'image', mediaUrl: '', text: '' }),
  buttons: () => ({ text: 'What would you like to do?', buttons: [{ id: uid('b'), label: 'Study abroad' }, { id: uid('b'), label: 'Talk to a mentor' }] }),
  list: () => ({ text: 'Which country are you interested in?', buttonLabel: 'Choose country', rows: [{ id: uid('r'), label: 'Ireland' }, { id: uid('r'), label: 'USA' }, { id: uid('r'), label: 'UK' }] }),
  link: () => ({ text: 'Book your free counselling session here:', buttonLabel: 'Book now', url: 'https://www.unicoach.com/' }),
  contact: () => ({ contactName: 'UniCoach', phone: '' }),
  handoff: () => ({ text: 'Thanks! Someone from our team will reply here soon.' }),
};

// ─── Node building blocks ───
const Shell = ({ id, type, children, noTarget, noSource }) => {
  const { removeNode } = useContext(FlowCtx);
  const meta = NODE_TYPES_META[type];
  return (
    <div className="flow-node" style={{ width: 270, background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 6px 18px rgba(15,23,42,0.08)', borderLeft: `4px solid ${meta.color}` }}>
      {!noTarget && <Handle type="target" position={Position.Left} style={{ width: 12, height: 12, background: '#fff', border: `2px solid ${meta.color}` }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: meta.color }}>{meta.icon} {meta.label}</span>
        {type !== 'start' && (
          <button type="button" className="nodrag" onClick={() => removeNode(id)} aria-label="Delete step" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><CloseOutlined /></button>
        )}
      </div>
      <div style={{ padding: 10, display: 'grid', gap: 8 }}>{children}</div>
      {!noSource && <Handle type="source" position={Position.Right} style={{ width: 12, height: 12, background: meta.color, border: '2px solid #fff' }} />}
    </div>
  );
};

const useData = (id) => {
  const { updateNode } = useContext(FlowCtx);
  return useCallback((patch) => updateNode(id, patch), [id, updateNode]);
};

const TextArea = ({ value, onChange, placeholder, rows = 3, max = 1024 }) => (
  <Input.TextArea className="nodrag" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoSize={{ minRows: rows, maxRows: 8 }} maxLength={max} showCount={max <= 1024} style={{ fontSize: 12.5 }} />
);

const MediaPicker = ({ data, set, allowNone }) => {
  const [uploading, setUploading] = useState(false);
  const upload = async ({ file }) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data: res } = await API.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const kind = file.type.startsWith('video') ? 'video' : file.type === 'application/pdf' ? 'document' : 'image';
      set({ mediaUrl: res.url, mediaType: kind, fileName: file.name });
    } catch {
      message.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="nodrag" style={{ display: 'grid', gap: 6 }}>
      <Select size="small" value={data.mediaType || (allowNone ? 'none' : 'image')} onChange={(v) => set({ mediaType: v, ...(v === 'none' ? { mediaUrl: '' } : {}) })}
        options={[...(allowNone ? [{ value: 'none', label: 'No image' }] : []), { value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }, { value: 'document', label: 'PDF / document' }]} />
      {data.mediaType && data.mediaType !== 'none' && (
        <>
          {data.mediaUrl && data.mediaType === 'image' && <img src={data.mediaUrl} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />}
          {data.mediaUrl && data.mediaType !== 'image' && <div style={{ fontSize: 11.5, color: '#475569', wordBreak: 'break-all' }}>{data.fileName || data.mediaUrl}</div>}
          <div style={{ display: 'flex', gap: 6 }}>
            <Upload showUploadList={false} customRequest={upload} accept={data.mediaType === 'video' ? 'video/mp4' : data.mediaType === 'document' ? 'application/pdf' : 'image/png,image/jpeg'}>
              <Button size="small" icon={<UploadOutlined />} loading={uploading}>Upload</Button>
            </Upload>
            <Input size="small" placeholder="or paste https:// link" value={data.mediaUrl} onChange={(e) => set({ mediaUrl: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
};

const StartNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="start" noTarget>
      <div style={{ fontSize: 12, color: '#475569' }}>Starts when the student sends:</div>
      <Select className="nodrag" mode="tags" size="small" value={data.keywords || []} onChange={(v) => set({ keywords: v.map((k) => k.toLowerCase().trim()).filter(Boolean) })} placeholder="hi, hello, help" tokenSeparators={[',']} />
      <Select className="nodrag" size="small" value={data.matchType || 'exact'} onChange={(v) => set({ matchType: v })}
        options={[{ value: 'exact', label: 'Exactly this word' }, { value: 'contains', label: 'Message contains this word' }]} />
    </Shell>
  );
};

const TextNode = ({ id, data }) => {
  const set = useData(id);
  return <Shell id={id} type="text"><TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Type the message" /></Shell>;
};

const MediaNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="media">
      <MediaPicker data={data} set={set} />
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Caption (optional)" rows={2} />
    </Shell>
  );
};

const OptionRows = ({ items, field, set, max, maxLen, placeholder, color, withDescription }) => (
  <div style={{ display: 'grid', gap: 6 }}>
    {items.map((b, i) => (
      <div key={b.id} style={{ position: 'relative', display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <Input className="nodrag" size="small" value={b.label} maxLength={maxLen} placeholder={placeholder}
            onChange={(e) => set({ [field]: items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            style={{ borderColor: color, color, fontWeight: 600, textAlign: 'center' }} />
          {items.length > 1 && <Button className="nodrag" size="small" type="text" icon={<CloseOutlined />} onClick={() => set({ [field]: items.filter((_, j) => j !== i) })} />}
        </div>
        {withDescription && (
          <Input className="nodrag" size="small" value={b.description} maxLength={72} placeholder="Short description (optional)"
            onChange={(e) => set({ [field]: items.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} />
        )}
        <Handle id={b.id} type="source" position={Position.Right} style={{ top: 12, right: -22, width: 12, height: 12, background: color, border: '2px solid #fff' }} />
      </div>
    ))}
    {items.length < max && (
      <Button className="nodrag" size="small" type="dashed" icon={<PlusOutlined />} onClick={() => set({ [field]: [...items, { id: uid(field === 'rows' ? 'r' : 'b'), label: '' }] })}>
        Add {field === 'rows' ? 'option' : 'button'}
      </Button>
    )}
  </div>
);

const ButtonsNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="buttons" noSource>
      <MediaPicker data={data} set={set} allowNone />
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Message above the buttons" />
      <Input className="nodrag" size="small" value={data.footer} onChange={(e) => set({ footer: e.target.value })} maxLength={60} placeholder="Small footer text (optional)" />
      <div style={{ fontSize: 11.5, color: '#64748b' }}>Up to 3 buttons, 20 letters each. Connect each one to what comes next.</div>
      <OptionRows items={data.buttons || []} field="buttons" set={set} max={3} maxLen={20} placeholder="Button text" color={NODE_TYPES_META.buttons.color} />
    </Shell>
  );
};

const ListNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="list" noSource>
      <Input className="nodrag" size="small" value={data.header} onChange={(e) => set({ header: e.target.value })} maxLength={60} placeholder="Heading (optional)" />
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Message" />
      <Input className="nodrag" size="small" value={data.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} maxLength={20} placeholder="Menu button text, e.g. Choose" />
      <div style={{ fontSize: 11.5, color: '#64748b' }}>Up to 10 options, 24 letters each.</div>
      <OptionRows items={data.rows || []} field="rows" set={set} max={10} maxLen={24} placeholder="Option" color={NODE_TYPES_META.list.color} withDescription />
    </Shell>
  );
};

const LinkNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="link">
      <MediaPicker data={data} set={set} allowNone />
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Message" />
      <Input className="nodrag" size="small" value={data.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} maxLength={20} placeholder="Button text, e.g. Book now" />
      <Input className="nodrag" size="small" value={data.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://www.unicoach.com/…" status={data.url && !/^https:\/\//.test(data.url) ? 'error' : undefined} />
    </Shell>
  );
};

const ContactNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="contact">
      <div style={{ fontSize: 11.5, color: '#64748b' }}>Sends a contact card; the student taps it to call or save the number.</div>
      <Input className="nodrag" size="small" value={data.contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="Name, e.g. UniCoach Counselling" />
      <Input className="nodrag" size="small" value={data.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+91 98xxxxxxxx (company number)" />
    </Shell>
  );
};

const HandoffNode = ({ id, data }) => {
  const set = useData(id);
  return (
    <Shell id={id} type="handoff" noSource>
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="Message to the student" rows={2} />
      <div style={{ fontSize: 11.5, color: '#64748b' }}>Stops the bot for this student for 24 hours and marks the chat “Agent needed” in the WhatsApp Inbox.</div>
    </Shell>
  );
};

// Where an answer can be saved; the matching check is picked automatically
const ANSWER_FIELDS = [
  { value: 'name', label: 'Name', validate: 'text' },
  { value: 'email', label: 'Email', validate: 'email' },
  { value: 'dreamCountry', label: 'Country', validate: 'text' },
  { value: 'course', label: 'Course', validate: 'text' },
  { value: 'preferredIntake', label: 'Intake', validate: 'text' },
  { value: 'highestEducation', label: 'Education', validate: 'text' },
  { value: 'college', label: 'College', validate: 'text' },
  { value: 'currentCity', label: 'City', validate: 'text' },
  { value: 'custom', label: 'Other (only in chat)', validate: 'text' },
];

const QuestionNode = ({ id, data }) => {
  const set = useData(id);
  const options = data.options || [];
  return (
    <Shell id={id} type="question">
      <TextArea value={data.text} onChange={(text) => set({ text })} placeholder="e.g. Which country are you planning for?" rows={2} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Save answer as</div>
          <Select className="nodrag" size="small" style={{ width: '100%' }} value={data.field || 'name'} options={ANSWER_FIELDS}
            onChange={(v) => set({ field: v, validate: ANSWER_FIELDS.find((f) => f.value === v)?.validate || 'text' })} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Check answer</div>
          <Select className="nodrag" size="small" style={{ width: '100%' }} value={data.validate || 'text'} onChange={(v) => set({ validate: v })}
            options={[{ value: 'text', label: 'Any text' }, { value: 'email', label: 'Email' }, { value: 'number', label: 'Number' }, { value: 'phone', label: 'Phone' }]} />
        </div>
      </div>
      {data.field === 'custom' && <Input className="nodrag" size="small" value={data.customKey} onChange={(e) => set({ customKey: e.target.value.replace(/[^\w]/g, '') })} placeholder="name for it, e.g. budget" />}
      <div style={{ fontSize: 11.5, color: '#64748b' }}>Quick answers (optional, up to 3 buttons):</div>
      {options.map((o, i) => (
        <div key={i} style={{ display: 'flex', gap: 4 }}>
          <Input className="nodrag" size="small" value={o.label} maxLength={20} placeholder="e.g. Ireland"
            onChange={(e) => set({ options: options.map((x, j) => (j === i ? { label: e.target.value } : x)) })} />
          <Button className="nodrag" size="small" type="text" icon={<CloseOutlined />} onClick={() => set({ options: options.filter((_, j) => j !== i) })} />
        </div>
      ))}
      {options.length < 3 && <Button className="nodrag" size="small" type="dashed" icon={<PlusOutlined />} onClick={() => set({ options: [...options, { label: '' }] })}>Add quick answer</Button>}
      <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
        {data.field === 'custom' ? 'Kept with the chat.' : 'Saved on the student\'s Lead (a new Lead is made if needed).'} Use {'{'}{data.field === 'custom' ? data.customKey || 'answer' : data.field || 'name'}{'}'} in later messages.
      </div>
    </Shell>
  );
};

const nodeTypes = { start: StartNode, text: TextNode, question: QuestionNode, media: MediaNode, buttons: ButtonsNode, list: ListNode, link: LinkNode, contact: ContactNode, handoff: HandoffNode };

// ─── Editor ───
const Editor = ({ flowId, onBack }) => {
  const [flow, setFlow] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [problems, setProblems] = useState(null);
  const rf = useReactFlow();

  useEffect(() => {
    API.get(`/admin/chat-flows/${flowId}`).then(({ data }) => {
      setFlow(data);
      setNodes(data.nodes || []);
      setEdges((data.edges || []).map((e) => ({ ...e, animated: true })));
    }).catch(() => message.error('Could not open the flow'));
  }, [flowId]);

  const updateNode = useCallback((id, patch) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
    setDirty(true);
  }, [setNodes]);
  const removeNode = useCallback((id) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    setDirty(true);
  }, [setNodes, setEdges]);
  const ctx = useMemo(() => ({ updateNode, removeNode }), [updateNode, removeNode]);

  const onConnect = useCallback((params) => {
    // One connection per output: a new line from the same button replaces the old one
    setEdges((es) => addEdge({ ...params, id: uid('e'), animated: true }, es.filter((e) => !(e.source === params.source && (e.sourceHandle || null) === (params.sourceHandle || null)))));
    setDirty(true);
  }, [setEdges]);

  const addNode = (type) => {
    const center = rf.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setNodes((ns) => [...ns, { id: uid('n'), type, position: { x: center.x - 135 + Math.random() * 40, y: center.y - 80 + Math.random() * 40 }, data: DEFAULT_DATA[type]() }]);
    setDirty(true);
  };

  const save = async (extra = {}) => {
    setSaving(true);
    try {
      const { data } = await API.put(`/admin/chat-flows/${flowId}`, {
        name: flow.name,
        isDefault: flow.isDefault,
        nodes: nodes.map(({ id, type, position, data: d }) => ({ id, type, position, data: d })),
        edges: edges.map(({ id, source, sourceHandle, target }) => ({ id, source, sourceHandle, target })),
        ...extra,
      });
      setFlow(data);
      setDirty(false);
      message.success(extra.active === true ? 'Saved and switched on' : extra.active === false ? 'Switched off' : 'Saved');
      return true;
    } catch (err) {
      const d = err.response?.data;
      if (d?.problems?.length) setProblems(d.problems);
      else message.error(d?.message || 'Could not save', 6);
      if (extra.active === true) setFlow((f) => ({ ...f, active: false }));
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (!flow) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;

  return (
    <FlowCtx.Provider value={ctx}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => { if (!dirty || window.confirm('Leave without saving?')) onBack(); }}>Flows</Button>
        <Input value={flow.name} onChange={(e) => { setFlow({ ...flow, name: e.target.value }); setDirty(true); }} style={{ width: 240, fontWeight: 700 }} placeholder="Flow name" />
        <Tooltip title="Replies to any message that matches no keyword (once a day per student)">
          <Checkbox checked={flow.isDefault} onChange={(e) => { setFlow({ ...flow, isDefault: e.target.checked }); setDirty(true); }}>Default reply</Checkbox>
        </Tooltip>
        <div style={{ flex: 1 }} />
        {dirty && <span style={{ fontSize: 12, color: '#b45309' }}>Unsaved changes</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, background: flow.active ? '#f0fdf4' : '#f1f5f9', border: `1px solid ${flow.active ? '#bbf7d0' : '#e2e8f0'}` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: flow.active ? '#16a34a' : '#94a3b8' }} />
          <span style={{ fontSize: 13, color: flow.active ? '#15803d' : '#64748b', fontWeight: 600 }}>{flow.active ? 'Live' : 'Off'}</span>
          <Switch size="small" checked={flow.active} loading={saving} onChange={(on) => { setFlow({ ...flow, active: on }); save({ active: on }); }} />
        </span>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => save()} disabled={!dirty}>Save changes</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 12, height: 'calc(100vh - 230px)', minHeight: 560 }}>
        <div className="nx-card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ux-text-3)', margin: '2px 4px 6px' }}>ADD A STEP</div>
          {Object.entries(NODE_TYPES_META).filter(([k]) => k !== 'start').map(([k, m]) => (
            <button
              key={k}
              type="button"
              onClick={() => addNode(k)}
              className="flow-palette-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #eef0f3', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#1e293b' }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${m.color}14`, color: m.color, flexShrink: 0 }}>{m.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
            </button>
          ))}
          <div style={{ marginTop: 'auto', fontSize: 11.5, color: 'var(--ux-text-3)', lineHeight: 1.5, padding: '10px 4px 2px', borderTop: '1px solid #f1f5f9' }}>
            Click a step to add it, then drag from the dot on its right to the next step. Every button has its own dot.
          </div>
        </div>
        <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={(c) => { onNodesChange(c); if (c.some((x) => x.type === 'position' && !x.dragging)) setDirty(true); }}
            onEdgesChange={(c) => { onEdgesChange(c); if (c.some((x) => x.type === 'remove')) setDirty(true); }}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ maxZoom: 0.9, padding: 0.3 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2, strokeDasharray: '6 4' } }}
          >
            <Background gap={18} size={1.5} />
            <MiniMap pannable zoomable style={{ width: 150, height: 96, borderRadius: 10, border: '1px solid #e5e7eb' }} maskColor="rgba(241,245,249,0.7)" nodeColor={(n) => NODE_TYPES_META[n.type]?.color || '#94a3b8'} nodeBorderRadius={6} />
            <Controls showInteractive={false} style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.08)' }} />
          </ReactFlow>
        </div>
      </div>

      <Modal open={!!problems} title="Fix these before switching it on" onCancel={() => setProblems(null)} footer={<Button onClick={() => setProblems(null)}>OK</Button>}>
        <ul style={{ paddingLeft: 18 }}>{(problems || []).map((p) => <li key={p}>{p}</li>)}</ul>
      </Modal>
    </FlowCtx.Provider>
  );
};

// ─── List of flows ───
const ChatbotFlows = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/chat-flows');
      setFlows(Array.isArray(data) ? data : []);
    } catch {
      message.error('Could not load flows');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // Ready-made UniCoach support menu, added switched off so it can be checked first
  const addTemplate = async () => {
    try {
      const { data } = await API.post('/admin/chat-flows/templates/unicoach-support');
      message.success('Template added (Off). Review it, then switch it on.');
      setEditing(data._id);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not add the template');
    }
  };

  const create = async () => {
    try {
      const { data } = await API.post('/admin/chat-flows', { name: 'New chatbot' });
      setEditing(data._id);
    } catch {
      message.error('Could not create');
    }
  };
  const toggle = async (f, on) => {
    try {
      await API.put(`/admin/chat-flows/${f._id}`, { active: on });
      load();
    } catch (err) {
      const d = err.response?.data;
      message.error(d?.problems?.length ? `${d.message}: ${d.problems.join(' ')}` : d?.message || 'Could not update', 8);
    }
  };
  const remove = async (id) => {
    await API.delete(`/admin/chat-flows/${id}`).catch(() => message.error('Could not delete'));
    load();
  };

  return (
    <div>
      <Header
        title="WhatsApp chatbot"
        subtitle="Automatic replies: when a student sends “hi”, the bot answers with messages, images, buttons and links"
        extra={!editing && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Popconfirm title="Add the UniCoach support menu?" description="It is added switched off so you can review it first." okText="Add" onConfirm={addTemplate}>
              <Button>Add UniCoach support template</Button>
            </Popconfirm>
            <Button type="primary" icon={<PlusOutlined />} onClick={create}>New chatbot flow</Button>
          </div>
        )}
      />
      <div className="dashboard-content">
        {editing ? (
          <ReactFlowProvider>
            <Editor flowId={editing} onBack={() => { setEditing(null); load(); }} />
          </ReactFlowProvider>
        ) : (
          <div className="page-table-card" style={{ overflowX: 'auto' }}>
            <Table
              rowKey="_id"
              loading={loading}
              dataSource={flows}
              locale={{ emptyText: <Empty description="No chatbot flows yet" /> }}
              onRow={(f) => ({ onClick: () => setEditing(f._id), style: { cursor: 'pointer' } })}
              columns={[
                { title: 'Flow', dataIndex: 'name', render: (v, f) => <div><div style={{ fontWeight: 600 }}>{v}</div>{f.isDefault && <span className="nx-status nx-status--accent" style={{ marginTop: 4 }}>Default reply</span>}</div> },
                { title: 'Starts on', dataIndex: 'keywords', render: (k, f) => (k?.length ? k.map((w) => <span key={w} className="nx-status nx-status--neutral" style={{ marginRight: 4 }}>{w}</span>) : f.isDefault ? 'Any other message' : '—') },
                { title: 'Times run', dataIndex: 'runs' },
                { title: 'Live', key: 'active', render: (_, f) => <span onClick={(e) => e.stopPropagation()}><Switch checked={f.active} onChange={(on) => toggle(f, on)} /></span> },
                {
                  title: '', key: 'del',
                  render: (_, f) => (
                    <span onClick={(e) => e.stopPropagation()}>
                      <Popconfirm title="Delete this flow?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => remove(f._id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotFlows;
