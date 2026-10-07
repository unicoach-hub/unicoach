import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Modal, Select, Input, message, Space, Tooltip, Row, Col, Badge, Switch, Drawer, Form } from 'antd';
import { 
  PlusOutlined, ThunderboltOutlined, DeleteOutlined,
  MailOutlined, MessageOutlined, ClockCircleOutlined, UserAddOutlined,
  BranchesOutlined, SaveOutlined, ApartmentOutlined,
  EditOutlined, ApiOutlined, CalendarOutlined, SettingOutlined,
  CheckCircleOutlined, ArrowRightOutlined, CloseOutlined, FormOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

// ─── Node Type Definitions ────────────────────────────────────
const NODE_TYPES = {
  trigger:   { label: 'Trigger',            icon: <ThunderboltOutlined /> },
  email:     { label: 'Send Email',         icon: <MailOutlined /> },
  whatsapp:  { label: 'Send WhatsApp',      icon: <MessageOutlined /> },
  pipeline:  { label: 'Move Pipeline Stage',icon: <ApartmentOutlined /> },
  counselor: { label: 'Assign Counselor',   icon: <UserAddOutlined /> },
  calendar:  { label: 'Calendar / Schedule',icon: <CalendarOutlined /> },
  delay:     { label: 'Wait / Delay',       icon: <ClockCircleOutlined /> },
  condition: { label: 'If / Condition',     icon: <BranchesOutlined /> },
  webhook:   { label: 'Webhook',            icon: <ApiOutlined /> },
};

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-1',
    name: 'Welcome Lead Sequence',
    description: 'Auto-greet new leads with email + WhatsApp follow-up when form is submitted',
    active: true,
    executedCount: 482,
    lastRun: '2 hours ago',
    nodes: [
      { id: 'n1', type: 'trigger',  x: 60, y: 40,  config: { label: 'Form: Study Abroad Inquiry', triggerType: 'form', details: 'Triggers when student fills Study Abroad form' } },
      { id: 'n2', type: 'email',    x: 60, y: 180, config: { label: 'Send Welcome Email', template: 'welcome', subject: 'Welcome to UniCoach!' } },
      { id: 'n3', type: 'delay',    x: 60, y: 320, config: { label: 'Wait 2 Hours', duration: '2', unit: 'hours' } },
      { id: 'n4', type: 'whatsapp', x: 60, y: 460, config: { label: 'WhatsApp Greeting', template: 'welcome_wa', message: 'Hi! Thanks for choosing UniCoach.' } },
    ],
    edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }]
  },
  {
    id: 'wf-2',
    name: 'Pipeline Stage Auto-Nudge',
    description: 'When lead moves to "Contacted" stage, auto-assign counselor and schedule calendar reminder',
    active: true,
    executedCount: 194,
    lastRun: '5 hours ago',
    nodes: [
      { id: 'n1', type: 'trigger',   x: 60, y: 40,  config: { label: 'Pipeline Stage: Contacted', triggerType: 'pipeline', details: 'Triggers on stage change to Contacted' } },
      { id: 'n2', type: 'counselor', x: 60, y: 180, config: { label: 'Assign Counselor', counselor: 'Pooja Sharma' } },
      { id: 'n3', type: 'calendar',  x: 60, y: 320, config: { label: 'Schedule Counseling Call', eventType: 'counseling_call' } },
      { id: 'n4', type: 'whatsapp',  x: 60, y: 460, config: { label: 'Send Counselor Contact Card', template: 'counselor_card' } },
    ],
    edges: [{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }, { from: 'n3', to: 'n4' }]
  }
];

// ─── Workflow Canvas ──────────────────────────────────────────
const WorkflowCanvas = ({ workflow, onAddNode, onDeleteNode, onNodeClick }) => {
  const NODE_W = 270;
  const NODE_H = 76;

  const renderEdge = (edge, idx) => {
    const fromNode = workflow.nodes.find(n => n.id === edge.from);
    const toNode = workflow.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return null;

    const x1 = fromNode.x + NODE_W / 2;
    const y1 = fromNode.y + NODE_H;
    const x2 = toNode.x + NODE_W / 2;
    const y2 = toNode.y;
    const midY = (y1 + y2) / 2;

    return (
      <g key={idx}>
        <path
          d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
          fill="none" stroke="#d6d3ca" strokeWidth="2"
        />
        {/* Animated dot */}
        <circle r="4" fill="#DE5C2B">
          <animateMotion
            dur="2.5s" repeatCount="indefinite"
            path={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
          />
        </circle>
        <circle cx={x1} cy={y1} r="5" fill="#ffffff" stroke="#d6d3ca" strokeWidth="2" />
        <circle cx={x2} cy={y2} r="5" fill="#111111" stroke="#ffffff" strokeWidth="2" />
      </g>
    );
  };

  const renderNode = (node, index) => {
    const type = NODE_TYPES[node.type] || NODE_TYPES.trigger;
    const isFirst = index === 0;

    return (
      <div
        key={node.id}
        onClick={() => onNodeClick(node)}
        style={{
          position: 'absolute',
          left: node.x,
          top: node.y,
          width: NODE_W,
          height: NODE_H,
          background: '#ffffff',
          border: '1px solid var(--ux-line)',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 14px',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
          boxShadow: '0 1px 2px rgba(17,17,17,0.03)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 12px 28px -18px rgba(17,17,17,0.25)';
          e.currentTarget.style.borderColor = 'rgba(17,17,17,0.25)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,17,17,0.03)';
          e.currentTarget.style.borderColor = 'var(--ux-line)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Icon Badge */}
        <span className="nx-icon-circle">
          {type.icon}
        </span>

        {/* Node Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ux-text-3)', lineHeight: 1.1 }}>
            {type.label}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ux-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3 }}>
            {node.config?.label || type.label}
          </div>
          {node.config?.details && (
            <div style={{ fontSize: 11, color: 'var(--ux-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.config.details}
            </div>
          )}
        </div>

        {/* Configure settings hint icon */}
        <SettingOutlined style={{ fontSize: 13, color: 'var(--ux-text-3)' }} />

        {/* Step number badge */}
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: isFirst ? 'var(--ux-brand)' : 'var(--ux-ink)', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {index + 1}
        </div>

        {/* Delete button (not on trigger) */}
        {!isFirst && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
            style={{
              position: 'absolute', top: -8, right: -8,
              width: 22, height: 22, borderRadius: '50%',
              background: '#ffffff', border: '1px solid var(--ux-line)',
              color: 'var(--ux-text-3)', fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s ease',
              opacity: 0, pointerEvents: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f0'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'var(--ux-line)'; e.currentTarget.style.color = 'var(--ux-text-3)'; }}
            className="node-delete-btn"
          >
            <DeleteOutlined />
          </button>
        )}
      </div>
    );
  };

  const lastNode = workflow.nodes[workflow.nodes.length - 1];
  const addBtnY = lastNode ? lastNode.y + NODE_H + 40 : 60;
  const canvasH = Math.max(addBtnY + 80, 520);

  return (
    <div style={{
      position: 'relative', width: '100%', height: canvasH,
      background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, #d6d3ca 0.8px, transparent 0.8px)',
        backgroundSize: '20px 20px', opacity: 0.7,
      }} />

      {/* SVG Edges */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {workflow.edges.map((edge, idx) => renderEdge(edge, idx))}
      </svg>

      {/* Nodes */}
      {workflow.nodes.map((node, idx) => renderNode(node, idx))}

      {/* Add Step (+) */}
      <div style={{ position: 'absolute', left: 60 + NODE_W / 2 - 18, top: addBtnY, zIndex: 20 }}>
        <Tooltip title="Add next step">
          <button
            onClick={onAddNode}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--ux-ink)',
              border: 'none', color: '#ffffff', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'none',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <PlusOutlined />
          </button>
        </Tooltip>
      </div>

      <style>{`
        div:hover > .node-delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
};

// ─── Main Workflows Page ──────────────────────────────────────
const Workflows = () => {
  const [workflows, setWorkflows] = useState(DEFAULT_WORKFLOWS);
  const [selectedWf, setSelectedWf] = useState(null);
  const [addNodeModal, setAddNodeModal] = useState(false);
  const [newNodeType, setNewNodeType] = useState('email');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [createWfModal, setCreateWfModal] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');

  // Node Configuration Drawer
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [activeNode, setActiveNode] = useState(null);

  // Dynamic Integration Data from backend
  const [formsList, setFormsList] = useState([]);
  const [pipelinesList, setPipelinesList] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);

  // Fetch Forms, Pipelines, and Templates
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const [fRes, pRes, tRes] = await Promise.all([
          API.get('/admin/forms').catch(() => ({ data: [] })),
          API.get('/admin/pipelines').catch(() => ({ data: [] })),
          API.get('/admin/templates').catch(() => ({ data: [] }))
        ]);
        setFormsList(fRes.data || []);
        setPipelinesList(pRes.data || []);
        setTemplatesList(tRes.data || []);
      } catch (err) {
        console.error('Error loading integrations data:', err);
      }
    };
    fetchIntegrations();
  }, []);

  const handleSelectWorkflow = (wf) => {
    setSelectedWf({ ...wf, nodes: [...wf.nodes], edges: [...wf.edges] });
  };

  const handleAddNode = () => {
    setNewNodeType('email');
    setNewNodeLabel('');
    setAddNodeModal(true);
  };

  const confirmAddNode = () => {
    if (!selectedWf) return;
    const lastNode = selectedWf.nodes[selectedWf.nodes.length - 1];
    const newId = `n${Date.now()}`;
    const typeObj = NODE_TYPES[newNodeType];
    const newNode = {
      id: newId,
      type: newNodeType,
      x: lastNode.x,
      y: lastNode.y + 140,
      config: { label: newNodeLabel || typeObj.label, details: typeObj.label }
    };
    const updated = {
      ...selectedWf,
      nodes: [...selectedWf.nodes, newNode],
      edges: [...selectedWf.edges, { from: lastNode.id, to: newId }],
    };
    setSelectedWf(updated);
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    setAddNodeModal(false);
    message.success(`Added "${typeObj.label}" step`);
  };

  const handleDeleteNode = (nodeId) => {
    if (!selectedWf) return;
    const updated = {
      ...selectedWf,
      nodes: selectedWf.nodes.filter(n => n.id !== nodeId),
      edges: selectedWf.edges.filter(e => e.from !== nodeId && e.to !== nodeId),
    };
    setSelectedWf(updated);
    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
  };

  const handleCreateWorkflow = () => {
    if (!newWfName.trim()) return message.warning('Enter workflow name');
    const newWf = {
      id: `wf-${Date.now()}`,
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom automation workflow',
      active: false,
      executedCount: 0,
      lastRun: 'Never',
      nodes: [{ id: 'n1', type: 'trigger', x: 60, y: 40, config: { label: 'Select Trigger Source', triggerType: 'form', details: 'Click to configure trigger' } }],
      edges: []
    };
    setWorkflows(prev => [...prev, newWf]);
    setSelectedWf(newWf);
    setCreateWfModal(false);
    setNewWfName('');
    setNewWfDesc('');
    message.success(`Workflow "${newWf.name}" created`);
  };

  const toggleWorkflowActive = (wfId) => {
    setWorkflows(prev => prev.map(w => w.id === wfId ? { ...w, active: !w.active } : w));
    if (selectedWf?.id === wfId) setSelectedWf(prev => ({ ...prev, active: !prev.active }));
  };

  const openNodeConfig = (node) => {
    setActiveNode({ ...node, config: { ...node.config } });
    setConfigDrawerOpen(true);
  };

  const saveNodeConfig = () => {
    if (!selectedWf || !activeNode) return;
    const updatedNodes = selectedWf.nodes.map(n => n.id === activeNode.id ? activeNode : n);
    const updatedWf = { ...selectedWf, nodes: updatedNodes };
    setSelectedWf(updatedWf);
    setWorkflows(prev => prev.map(w => w.id === updatedWf.id ? updatedWf : w));
    setConfigDrawerOpen(false);
    message.success('Node configuration saved');
  };

  return (
    <div>
      <Header
        title="Automation Workflows"
        subtitle="Build visual node-to-node automated outreach sequences — connect triggers, forms, pipelines, calendars, emails, WhatsApp"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateWfModal(true)}>
            Create workflow
          </Button>
        }
      />

      <div className="dashboard-content">
        <Row gutter={[16, 16]}>

          {/* ── Left Panel: Workflow List ── */}
          <Col xs={24} lg={7}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="nx-label" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px', marginBottom: 2 }}>
                Workflows <span className="nx-tab-count">{workflows.length}</span>
              </div>
              {workflows.map(wf => {
                const isSelected = selectedWf?.id === wf.id;
                return (
                  <div
                    key={wf.id}
                    onClick={() => handleSelectWorkflow(wf)}
                    style={{
                      padding: '16px 18px', borderRadius: 20, cursor: 'pointer',
                      background: '#ffffff',
                      border: isSelected ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line-2)',
                      boxShadow: isSelected ? '0 0 0 1px var(--ux-ink)' : '0 1px 2px rgba(17,17,17,0.03)',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className={`nx-status ${wf.active ? 'nx-status--success' : 'nx-status--neutral'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {wf.active ? 'Live' : 'Draft'}
                      </span>
                      <Badge count={wf.nodes.length} style={{ backgroundColor: isSelected ? '#111111' : '#96958e', fontSize: 10, boxShadow: 'none' }} />
                    </div>

                    <h4 style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', margin: '0 0 4px' }}>{wf.name}</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--ux-text-2)', margin: '0 0 10px', lineHeight: '1.45' }}>{wf.description}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500 }}>
                        <ThunderboltOutlined style={{ marginRight: 4 }} />{wf.executedCount} runs
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500 }}>
                        {wf.lastRun}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* ── Right Panel: Canvas ── */}
          <Col xs={24} lg={17}>
            {selectedWf ? (
              <div>
                {/* Canvas Toolbar */}
                <div className="nx-card" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                  padding: '14px 20px', marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <span className="nx-icon-circle"><ApartmentOutlined /></span>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: 0, lineHeight: 1.25 }}>{selectedWf.name}</h3>
                      <span style={{ fontSize: 12.5, color: 'var(--ux-text-3)' }}>{selectedWf.nodes.length} steps · click any node to configure</span>
                    </div>
                  </div>
                  <Space size="middle">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`nx-status ${selectedWf.active ? 'nx-status--success' : 'nx-status--neutral'}`}>
                        {selectedWf.active ? 'Live' : 'Off'}
                      </span>
                      <Switch
                        checked={selectedWf.active}
                        onChange={() => toggleWorkflowActive(selectedWf.id)}
                        size="small"
                      />
                    </div>
                    <Button icon={<SaveOutlined />}>Save</Button>
                  </Space>
                </div>

                {/* Node Palette */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }} role="group" aria-label="Add a step">
                  {Object.entries(NODE_TYPES).filter(([k]) => k !== 'trigger').map(([key, type]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setNewNodeType(key);
                        setNewNodeLabel('');
                        setAddNodeModal(true);
                      }}
                      type="button"
                      className="nx-btn nx-btn--light nx-btn--sm"
                      style={{ fontWeight: 500 }}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>

                {/* Canvas */}
                <WorkflowCanvas
                  workflow={selectedWf}
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  onNodeClick={openNodeConfig}
                />
              </div>
            ) : (
              <div className="nx-card" style={{
                height: 500, padding: 24,
                borderStyle: 'dashed', borderColor: 'var(--ux-line)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <span className="nx-icon-circle" style={{ width: 56, height: 56, fontSize: 22 }}><ApartmentOutlined /></span>
                <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: 0 }}>Select a workflow</h3>
                <p style={{ fontSize: 13, color: 'var(--ux-text-3)', margin: 0, textAlign: 'center', maxWidth: 320 }}>
                  Choose a workflow from the left panel to view its automation steps, or create a new one
                </p>
              </div>
            )}
          </Col>

        </Row>
      </div>

      {/* ── Node Configuration Drawer ── */}
      <Drawer
        title={activeNode ? `Configure node: ${NODE_TYPES[activeNode.type]?.label || 'Node'}` : 'Configure node'}
        placement="right"
        styles={{ wrapper: { width: 440 } }}
        open={configDrawerOpen}
        onClose={() => setConfigDrawerOpen(false)}
        destroyOnClose
        extra={
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={saveNodeConfig}>
            Save node
          </Button>
        }
      >
        {activeNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Display Node Label */}
            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Step Title / Name</label>
              <Input
                value={activeNode.config.label || ''}
                onChange={e => setActiveNode({
                  ...activeNode,
                  config: { ...activeNode.config, label: e.target.value }
                })}
                placeholder="Enter title"
              />
            </div>

            {/* ── 1. TRIGGER NODE CONFIG ── */}
            {activeNode.type === 'trigger' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Trigger Source Event</label>
                  <Select
                    value={activeNode.config.triggerType || 'form'}
                    onChange={val => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, triggerType: val, details: `Trigger: ${val}` }
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="form">Custom form submission</Option>
                    <Option value="pipeline">Pipeline stage move</Option>
                    <Option value="calendar">Counseling / calendar booking</Option>
                    <Option value="lead">New lead created</Option>
                    <Option value="webhook">External webhook event</Option>
                  </Select>
                </div>

                {activeNode.config.triggerType === 'form' && (
                  <div>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Select Custom Form</label>
                    <Select
                      value={activeNode.config.formId || (formsList[0]?._id)}
                      onChange={(fId) => {
                        const selectedForm = formsList.find(f => f._id === fId);
                        setActiveNode({
                          ...activeNode,
                          config: {
                            ...activeNode.config,
                            formId: fId,
                            label: `Form: ${selectedForm?.name || 'Inquiry Form'}`,
                            details: `Triggers on form submit`
                          }
                        });
                      }}
                      style={{ width: '100%' }}
                      placeholder="Select Form"
                    >
                      {formsList.map(f => (
                        <Option key={f._id} value={f._id}>{f.name} ({f.fields?.length} fields)</Option>
                      ))}
                    </Select>
                  </div>
                )}

                {activeNode.config.triggerType === 'pipeline' && (
                  <div>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Select Pipeline & Stage</label>
                    <Select
                      value={activeNode.config.pipelineId || (pipelinesList[0]?._id)}
                      onChange={(pId) => {
                        const selectedP = pipelinesList.find(p => p._id === pId);
                        const firstStage = selectedP?.stages?.[0]?.name || 'Stage 1';
                        setActiveNode({
                          ...activeNode,
                          config: {
                            ...activeNode.config,
                            pipelineId: pId,
                            stageName: firstStage,
                            label: `Pipeline: ${selectedP?.name}`,
                            details: `Stage: ${firstStage}`
                          }
                        });
                      }}
                      style={{ width: '100%' }}
                      placeholder="Select Pipeline"
                    >
                      {pipelinesList.map(p => (
                        <Option key={p._id} value={p._id}>{p.name} ({p.stages?.length} stages)</Option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* ── 2. EMAIL NODE CONFIG ── */}
            {activeNode.type === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Email Template</label>
                  <Select
                    value={activeNode.config.template || 'welcome'}
                    onChange={val => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, template: val, details: `Template: ${val}` }
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="welcome">Welcome & eligibility greeting</Option>
                    <Option value="consultation">Counseling session invitation</Option>
                    <Option value="custom">Custom email message</Option>
                  </Select>
                </div>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Subject Line</label>
                  <Input
                    value={activeNode.config.subject || 'Welcome to UniCoach Study Abroad'}
                    onChange={e => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, subject: e.target.value }
                    })}
                    placeholder="Enter email subject"
                  />
                </div>
              </div>
            )}

            {/* ── 3. WHATSAPP NODE CONFIG ── */}
            {activeNode.type === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>WhatsApp Message Template</label>
                  <Select
                    value={activeNode.config.template || 'welcome_wa'}
                    onChange={val => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, template: val, details: `WA: ${val}` }
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="welcome_wa">Welcome message & document request</Option>
                    <Option value="counselor_card">Counselor intro card</Option>
                    <Option value="followup">24h follow-up nudge</Option>
                    <Option value="custom_wa">Custom WhatsApp text</Option>
                  </Select>
                </div>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Message Content</label>
                  <TextArea
                    rows={4}
                    value={activeNode.config.message || 'Hi {name}, thanks for reaching out to UniCoach!'}
                    onChange={e => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, message: e.target.value }
                    })}
                    placeholder="WhatsApp message body"
                  />
                </div>
              </div>
            )}

            {/* ── 4. PIPELINE MOVE NODE CONFIG ── */}
            {activeNode.type === 'pipeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Target Pipeline</label>
                  <Select
                    value={activeNode.config.targetPipelineId || (pipelinesList[0]?._id)}
                    onChange={(pId) => {
                      const selectedP = pipelinesList.find(p => p._id === pId);
                      const targetStage = selectedP?.stages?.[0]?.name || 'New Lead';
                      setActiveNode({
                        ...activeNode,
                        config: {
                          ...activeNode.config,
                          targetPipelineId: pId,
                          targetStage: targetStage,
                          details: `Move to ${targetStage}`
                        }
                      });
                    }}
                    style={{ width: '100%' }}
                  >
                    {pipelinesList.map(p => (
                      <Option key={p._id} value={p._id}>{p.name}</Option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* ── 5. COUNSELOR ASSIGN NODE CONFIG ── */}
            {activeNode.type === 'counselor' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Assign To Counselor</label>
                  <Select
                    value={activeNode.config.counselor || 'Pooja Sharma'}
                    onChange={val => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, counselor: val, details: `Assign: ${val}` }
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="Pooja Sharma">Pooja Sharma</Option>
                    <Option value="Rohan Verma">Rohan Verma</Option>
                    <Option value="Amit Patel">Amit Patel</Option>
                    <Option value="Sara Khan">Sara Khan</Option>
                    <Option value="round_robin">Auto round-robin assignment</Option>
                  </Select>
                </div>
              </div>
            )}

            {/* ── 6. CALENDAR NODE CONFIG ── */}
            {activeNode.type === 'calendar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Event / Calendar Action</label>
                  <Select
                    value={activeNode.config.eventType || 'counseling_call'}
                    onChange={val => setActiveNode({
                      ...activeNode,
                      config: { ...activeNode.config, eventType: val, details: `Event: ${val}` }
                    })}
                    style={{ width: '100%' }}
                  >
                    <Option value="counseling_call">Schedule 1-on-1 counseling call</Option>
                    <Option value="webinar_invite">Send webinar calendar invite</Option>
                    <Option value="followup_reminder">Set follow-up reminder</Option>
                  </Select>
                </div>
              </div>
            )}

            {/* ── 7. DELAY NODE CONFIG ── */}
            {activeNode.type === 'delay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Row gutter={12}>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Duration</label>
                    <Input
                      type="number"
                      value={activeNode.config.duration || '2'}
                      onChange={e => setActiveNode({
                        ...activeNode,
                        config: { ...activeNode.config, duration: e.target.value, details: `Wait ${e.target.value} ${activeNode.config.unit || 'hours'}` }
                      })}
                    />
                  </Col>
                  <Col span={12}>
                    <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Time Unit</label>
                    <Select
                      value={activeNode.config.unit || 'hours'}
                      onChange={val => setActiveNode({
                        ...activeNode,
                        config: { ...activeNode.config, unit: val, details: `Wait ${activeNode.config.duration || 2} ${val}` }
                      })}
                      style={{ width: '100%' }}
                    >
                      <Option value="minutes">Minutes</Option>
                      <Option value="hours">Hours</Option>
                      <Option value="days">Days</Option>
                    </Select>
                  </Col>
                </Row>
              </div>
            )}

          </div>
        )}
      </Drawer>

      {/* ── Add Node Modal ── */}
      <Modal
        title="Add automation step"
        open={addNodeModal}
        onOk={confirmAddNode}
        onCancel={() => setAddNodeModal(false)}
        okText="Add step"
        className="premium-modal"
        destroyOnHidden
        width={520}
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>Choose action / step type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
              {Object.entries(NODE_TYPES).filter(([k]) => k !== 'trigger').map(([key, type]) => (
                <div
                  key={key}
                  onClick={() => setNewNodeType(key)}
                  style={{
                    padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                    background: newNodeType === key ? 'var(--ux-surface-2)' : '#ffffff',
                    border: newNodeType === key ? '1px solid var(--ux-ink)' : '1px solid var(--ux-line)',
                    boxShadow: newNodeType === key ? '0 0 0 1px var(--ux-ink)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                >
                  <span style={{ color: 'var(--ux-ink)', fontSize: 17 }}>{type.icon}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ux-ink)' }}>{type.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Step title</label>
            <Input
              value={newNodeLabel}
              onChange={e => setNewNodeLabel(e.target.value)}
              placeholder={`e.g. ${NODE_TYPES[newNodeType]?.label}`}
            />
          </div>
        </div>
      </Modal>

      {/* ── Create Workflow Modal ── */}
      <Modal
        title="Create new workflow"
        open={createWfModal}
        onOk={handleCreateWorkflow}
        onCancel={() => setCreateWfModal(false)}
        okText="Create workflow"
        className="premium-modal"
        destroyOnHidden
        width={480}
      >
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Workflow name</label>
            <Input
              value={newWfName}
              onChange={e => setNewWfName(e.target.value)}
              placeholder="e.g. Welcome Sequence, Application Follow-up"
            />
          </div>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Description (optional)</label>
            <Input
              value={newWfDesc}
              onChange={e => setNewWfDesc(e.target.value)}
              placeholder="Brief description of what this workflow does"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Workflows;
