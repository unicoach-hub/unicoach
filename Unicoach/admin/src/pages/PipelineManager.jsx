import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Space, message, Row, Col, Popconfirm, Badge, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ApartmentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';

import CrmSubNav from '../components/CrmSubNav';

const STAGE_COLORS = ['#DE5C2B', '#3b82f6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#DE5C2B'];

const PipelineManager = () => {
  const navigate = useNavigate();
  const cachedPipelines = getCachedData('/admin/pipelines:list');
  const [pipelines, setPipelines] = useState(cachedPipelines || []);
  const [loading, setLoading] = useState(!cachedPipelines);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [form] = Form.useForm();
  const [stages, setStages] = useState([]);
  const [newStageName, setNewStageName] = useState('');

  const fetchPipelines = async (force = false) => {
    if (!getCachedData('/admin/pipelines:list') || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        '/admin/pipelines:list',
        async () => (await API.get('/admin/pipelines')).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setPipelines(Array.isArray(fresh) ? fresh : []);
          }
        }
      );
      setPipelines(Array.isArray(data) ? data : []);
    } catch { message.error('Failed to load pipelines'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPipelines(); }, []);

  const openCreate = () => {
    setEditingPipeline(null);
    setStages([]);
    setModalOpen(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const openEdit = (pipeline) => {
    setEditingPipeline(pipeline);
    setStages(pipeline.stages.map(s => ({ name: s.name, color: s.color })));
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue({ name: pipeline.name, description: pipeline.description });
    }, 0);
  };

  const addStage = () => {
    const name = newStageName.trim();
    if (!name) return message.warning('Enter stage name');
    if (stages.find(s => s.name.toLowerCase() === name.toLowerCase())) return message.warning('Stage already exists');
    setStages([...stages, { name, color: STAGE_COLORS[stages.length % STAGE_COLORS.length] }]);
    setNewStageName('');
  };

  const removeStage = (idx) => {
    setStages(stages.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (stages.length === 0) return message.warning('Add at least one stage');

      const payload = { name: values.name, description: values.description || '', stages };

      if (editingPipeline) {
        await API.put(`/admin/pipelines/${editingPipeline._id}`, payload);
        message.success('Pipeline updated!');
      } else {
        await API.post('/admin/pipelines', payload);
        message.success('Pipeline created!');
      }
      invalidateCache('/admin/pipelines');
      setModalOpen(false);
      fetchPipelines(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save pipeline');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/pipelines/${id}`);
      message.success('Pipeline deleted');
      invalidateCache('/admin/pipelines');
      fetchPipelines(true);
    } catch { message.error('Failed to delete'); }
  };

  return (
    <div>
      <Header
        title="CRM Pipelines"
        subtitle="Create and manage custom sales pipelines with stages to track student journey"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size="large">
            Create pipeline
          </Button>
        }
      />

      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        {loading ? (
          <Row gutter={[20, 20]}>
            {[1, 2, 3].map((idx) => (
              <Col xs={24} md={12} lg={8} key={idx}>
                <div className="relative overflow-hidden nx-card p-6 h-full animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="h-5 w-36 bg-[#ecebe6] rounded-full mb-2" />
                      <div className="h-3 w-48 bg-[var(--ux-surface-3)] rounded-full" />
                    </div>
                    <div className="w-8 h-5 rounded-full bg-[#ecebe6]" />
                  </div>
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 w-20 bg-[#ecebe6] rounded-full" />
                    <div className="h-6 w-20 bg-[#ecebe6] rounded-full" />
                    <div className="h-6 w-20 bg-[#ecebe6] rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[var(--ux-line-2)]">
                    <div className="h-4 w-20 bg-[var(--ux-surface-3)] rounded-full" />
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-[#ecebe6] rounded-full" />
                      <div className="w-7 h-7 bg-[#ecebe6] rounded-full" />
                    </div>
                  </div>
                  {/* Shimmer sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </div>
              </Col>
            ))}
          </Row>
        ) : pipelines.length === 0 ? (
          <Card style={{ borderRadius: 24, textAlign: 'center', padding: '48px 20px', border: '1.5px dashed var(--ux-line)', boxShadow: 'none' }}>
            <span className="nx-icon-circle" style={{ width: 56, height: 56, fontSize: 22, margin: '0 auto 16px' }}><ApartmentOutlined /></span>
            <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>No pipelines yet</h3>
            <p style={{ color: 'var(--ux-text-3)', marginBottom: 20 }}>Create your first pipeline to start tracking student leads through stages</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Create pipeline</Button>
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {pipelines.map(pipeline => (
              <Col xs={24} md={12} lg={8} key={pipeline._id}>
                <Card
                  style={{ borderRadius: 24, background: 'var(--ux-surface)', border: '1px solid var(--ux-line-2)', boxShadow: '0 1px 2px rgba(17,17,17,0.03)', height: '100%', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  hoverable
                  onClick={() => navigate(`/crm/board?pipeline=${pipeline._id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: '0 0 4px' }}>{pipeline.name}</h3>
                      {pipeline.description && (
                        <p style={{ fontSize: 12.5, color: 'var(--ux-text-2)', margin: 0 }}>{pipeline.description}</p>
                      )}
                    </div>
                    <Badge count={pipeline.submissionCount || 0} style={{ backgroundColor: '#DE5C2B' }} />
                  </div>

                  {/* Stage flow visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {pipeline.stages.sort((a, b) => a.order - b.order).map((stage, idx) => (
                      <React.Fragment key={stage._id || idx}>
                        <span className="nx-status nx-status--neutral">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                          {stage.name}
                        </span>
                        {idx < pipeline.stages.length - 1 && <ArrowRightOutlined style={{ fontSize: 10, color: 'var(--ux-text-3)' }} />}
                      </React.Fragment>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--ux-line-2)' }}>
                    <span style={{ fontSize: 12, color: 'var(--ux-text-3)', fontWeight: 500 }}>{pipeline.stages.length} stages</span>
                    <Space size="small" onClick={e => e.stopPropagation()}>
                      <Button size="small" type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openEdit(pipeline); }} />
                      <Popconfirm title="Delete this pipeline?" onConfirm={() => handleDelete(pipeline._id)} okText="Yes" cancelText="No">
                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Create/Edit Pipeline Modal */}
      <Modal
        title={editingPipeline ? 'Edit Pipeline' : 'Create Pipeline'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingPipeline ? 'Update' : 'Create Pipeline'}
        width={560}
        className="premium-modal"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Pipeline Name" rules={[{ required: true, message: 'Enter pipeline name' }]}>
            <Input placeholder="e.g. Study Abroad Pipeline, Canada Applications" />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input placeholder="Brief description" />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 8 }}>
          <label style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: 13, display: 'block', marginBottom: 10 }}>Pipeline stages</label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {stages.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ux-text-3)', fontSize: 12, border: '1.5px dashed var(--ux-line)', borderRadius: 16, background: 'var(--ux-surface-2)' }}>
                No stages added yet. Type stage name below (e.g. <em>Contacted, Qualified</em>) and click Add.
              </div>
            ) : (
              stages.map((stage, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 14,
                  background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ux-ink)' }}>{stage.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--ux-text-3)', fontWeight: 500 }}>Stage {idx + 1}</span>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeStage(idx)} style={{ fontSize: 12 }} />
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={newStageName}
              onChange={e => setNewStageName(e.target.value)}
              placeholder="e.g. Contacted, Qualified, Applied"
              onPressEnter={addStage}
            />
            <Button icon={<PlusOutlined />} onClick={addStage}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PipelineManager;
