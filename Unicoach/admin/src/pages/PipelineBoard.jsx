import React, { useEffect, useState } from 'react';
import { Card, Button, message, Select, Drawer, Input, Space, Empty, Spin, Popconfirm } from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined, MessageOutlined,
  FileTextOutlined, ArrowRightOutlined, CloseOutlined, SendOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import CrmSubNav from '../components/CrmSubNav';
import API from '../api/axios';
import { getCachedData, invalidateCache, fetchWithCache } from '../utils/cache';

const { Option } = Select;
const { TextArea } = Input;

const PipelineBoard = () => {
  const [searchParams] = useSearchParams();
  const pipelineIdFromUrl = searchParams.get('pipeline');

  const cachedPipelines = getCachedData('/admin/pipelines:list');
  const [pipelines, setPipelines] = useState(cachedPipelines || []);
  const [selectedPipelineId, setSelectedPipelineId] = useState(pipelineIdFromUrl || (cachedPipelines && cachedPipelines[0]?._id) || '');
  
  const cachedBoard = selectedPipelineId ? getCachedData(`/admin/pipelines:board:${selectedPipelineId}`) : null;
  const [pipelineData, setPipelineData] = useState(cachedBoard || null);
  const [loading, setLoading] = useState(!cachedBoard && Boolean(selectedPipelineId));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [draggedCard, setDraggedCard] = useState(null);

  // Fetch pipelines list
  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const { data } = await fetchWithCache(
          '/admin/pipelines:list',
          async () => (await API.get('/admin/pipelines')).data,
          {
            onBackgroundUpdate: (fresh) => {
              setPipelines(Array.isArray(fresh) ? fresh : []);
              if (!selectedPipelineId && fresh.length > 0) {
                setSelectedPipelineId(fresh[0]._id);
              }
            }
          }
        );
        setPipelines(Array.isArray(data) ? data : []);
        if (!selectedPipelineId && data.length > 0) {
          setSelectedPipelineId(data[0]._id);
        }
      } catch { message.error('Failed to load pipelines'); }
    };
    fetchPipelines();
  }, []);

  // Fetch pipeline board data
  const fetchBoard = async (force = false) => {
    if (!selectedPipelineId) return;
    const cacheKey = `/admin/pipelines:board:${selectedPipelineId}`;
    if (!getCachedData(cacheKey) || force) {
      setLoading(true);
    }
    try {
      const { data } = await fetchWithCache(
        cacheKey,
        async () => (await API.get(`/admin/pipelines/${selectedPipelineId}`)).data,
        {
          forceRefresh: force,
          onBackgroundUpdate: (fresh) => {
            setPipelineData(fresh);
          }
        }
      );
      setPipelineData(data);
    } catch { message.error('Failed to load pipeline data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBoard(); }, [selectedPipelineId]);

  // Move card to new stage
  const moveCard = async (submissionId, newStage) => {
    try {
      await API.put(`/admin/pipelines/submissions/${submissionId}/stage`, { stage: newStage });
      message.success(`Moved to "${newStage}"`);
      invalidateCache(`/admin/pipelines:board:${selectedPipelineId}`);
      fetchBoard(true);
    } catch { message.error('Failed to move card'); }
  };

  // Add note
  const addNote = async () => {
    if (!noteText.trim() || !selectedCard) return;
    try {
      await API.put(`/admin/pipelines/submissions/${selectedCard._id}/notes`, { text: noteText.trim() });
      setNoteText('');
      message.success('Note added');
      invalidateCache(`/admin/pipelines:board:${selectedPipelineId}`);
      fetchBoard(true);
      // Refresh card data
      const { data } = await API.get(`/admin/pipelines/${selectedPipelineId}`);
      setPipelineData(data);
      const updated = data.stages.flatMap(s => s.submissions).find(s => s._id === selectedCard._id);
      if (updated) setSelectedCard(updated);
    } catch { message.error('Failed to add note'); }
  };

  // Delete submission
  const deleteSubmission = async (id) => {
    try {
      await API.delete(`/admin/pipelines/submissions/${id}`);
      message.success('Lead removed');
      invalidateCache('/admin/pipelines');
      setDrawerOpen(false);
      fetchBoard(true);
    } catch { message.error('Failed to delete'); }
  };

  // Drag handlers
  const handleDragStart = (submission) => {
    setDraggedCard(submission);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = '#FFF4EE';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.background = '';
  };

  const handleDrop = (e, stageName) => {
    e.preventDefault();
    e.currentTarget.style.background = '';
    if (draggedCard && draggedCard.currentStage !== stageName) {
      moveCard(draggedCard._id, stageName);
    }
    setDraggedCard(null);
  };

  // Extract display name from submission data
  const getDisplayField = (data, keys) => {
    for (const key of keys) {
      const found = Object.entries(data).find(([k]) => k.toLowerCase().includes(key.toLowerCase()));
      if (found && found[1]) return found[1];
    }
    return '';
  };

  const openCard = (submission) => {
    setSelectedCard(submission);
    setDrawerOpen(true);
  };

  return (
    <div>
      <Header
        title="Pipeline board"
        subtitle="Drag-and-drop lead cards between stages to track student journey"
        showBack
        backUrl="/crm/pipelines"
        extra={
          <Select
            value={selectedPipelineId}
            onChange={setSelectedPipelineId}
            style={{ width: 260, maxWidth: '100%' }}
            placeholder="Select Pipeline"
            size="large"
          >
            {pipelines.map(p => (
              <Option key={p._id} value={p._id}>{p.name} ({p.submissionCount || 0})</Option>
            ))}
          </Select>
        }
      />

      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <CrmSubNav />
        {loading ? (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20 }}>
            {[1, 2, 3, 4].map((colIdx) => (
              <div
                key={colIdx}
                className="relative overflow-hidden bg-[var(--ux-surface-2)] border border-[var(--ux-line-2)] rounded-[24px] p-3 flex flex-col gap-3 animate-pulse select-none"
                style={{ minWidth: 280, maxWidth: 320, flex: '0 0 280px', minHeight: 480 }}
              >
                {/* Stage Header Skeleton */}
                <div className="flex items-center justify-between px-1.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d6d3ca]" />
                    <div className="h-4 w-28 bg-[#ecebe6] rounded-full" />
                  </div>
                  <div className="w-6 h-5 rounded-full bg-[#ecebe6]" />
                </div>

                {/* Simulated Lead Cards Skeleton */}
                {[1, 2, 3].map((cardIdx) => (
                  <div key={cardIdx} className="bg-white border border-[var(--ux-line-2)] rounded-[18px] p-3.5 space-y-2">
                    <div className="h-4 w-32 bg-[#ecebe6] rounded-full" />
                    <div className="h-3 w-40 bg-[var(--ux-surface-3)] rounded-full" />
                    <div className="h-3 w-24 bg-[var(--ux-surface-3)] rounded-full" />
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--ux-line-2)]">
                      <div className="h-4 w-16 bg-[#ecebe6] rounded-full" />
                      <div className="h-3 w-12 bg-[var(--ux-surface-3)] rounded-full" />
                    </div>
                  </div>
                ))}

                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
              </div>
            ))}
          </div>
        ) : !pipelineData ? (
          <Card style={{ borderRadius: 24, textAlign: 'center', padding: '48px 20px', border: '1.5px dashed var(--ux-line)', boxShadow: 'none' }}>
            <Empty description="Select a pipeline to view the board" />
          </Card>
        ) : (
          <div style={{
            display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 20,
            minHeight: 500,
          }}>
            {pipelineData.stages.map((stage, stageIdx) => (
              <div
                key={stage._id || stageIdx}
                className="bg-[var(--ux-surface-2)] border border-[var(--ux-line-2)] rounded-[24px] p-3 transition-colors"
                style={{
                  minWidth: 280, maxWidth: 320, flex: '0 0 280px',
                  display: 'flex', flexDirection: 'column',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.name)}
              >
                {/* Stage Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 6px 4px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ux-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stage.name}</span>
                  </div>
                  <span className="nx-tab-count" style={{ background: '#fff', border: '1px solid var(--ux-line-2)' }}>{stage.submissions?.length || 0}</span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
                  {(!stage.submissions || stage.submissions.length === 0) ? (
                    <div style={{
                      padding: 24, borderRadius: 18, textAlign: 'center',
                      border: '1.5px dashed var(--ux-line)', color: 'var(--ux-text-3)', fontSize: 12, fontWeight: 500,
                    }}>
                      Drop leads here
                    </div>
                  ) : (
                    stage.submissions.map(sub => {
                      const name = getDisplayField(sub.data, ['name', 'full name', 'first name']);
                      const email = getDisplayField(sub.data, ['email', 'e-mail']);
                      const phone = getDisplayField(sub.data, ['phone', 'mobile', 'contact']);

                      return (
                        <div
                          key={sub._id}
                          draggable
                          onDragStart={() => handleDragStart(sub)}
                          onClick={() => openCard(sub)}
                          style={{
                            padding: '14px 16px', borderRadius: 18,
                            background: 'var(--ux-surface)', border: '1px solid var(--ux-line-2)',
                            cursor: 'grab', transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(17,17,17,0.03)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 28px -18px rgba(17,17,17,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(17,17,17,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', marginBottom: 6 }}>
                            {name || 'Unknown'}
                          </div>
                          {email && (
                            <div style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, minWidth: 0, wordBreak: 'break-all' }}>
                              <MailOutlined style={{ fontSize: 11 }} /> {email}
                            </div>
                          )}
                          {phone && (
                            <div style={{ fontSize: 12, color: 'var(--ux-text-2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <PhoneOutlined style={{ fontSize: 11 }} /> {phone}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--ux-line-2)' }}>
                            <span style={{ fontSize: 11, color: 'var(--ux-text-3)', fontWeight: 500 }}>
                              <CalendarOutlined style={{ marginRight: 4 }} />
                              {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                            {sub.notes && sub.notes.length > 0 && (
                              <span className="nx-status nx-status--neutral" style={{ height: 22, fontSize: 11 }}><MessageOutlined /> {sub.notes.length} notes</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      <Drawer
        title={null}
        placement="right"
        styles={{ wrapper: { width: 420 } }}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)} />}
      >
        {selectedCard && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)', margin: '0 0 8px' }}>
                {getDisplayField(selectedCard.data, ['name', 'full name', 'first name']) || 'Lead Details'}
              </h3>
              <span className="nx-status nx-status--accent">{selectedCard.currentStage}</span>
            </div>

            {/* All form data */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: 8 }}>
                Submitted data
              </h4>
              {Object.entries(selectedCard.data).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--ux-line-2)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ux-text-2)', fontWeight: 500 }}>{key}</span>
                  <span style={{ fontSize: 13, color: 'var(--ux-ink)', fontWeight: 600, maxWidth: '55%', textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Move to stage */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: 10 }}>
                Move to stage
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {pipelineData?.stages.filter(s => s.name !== selectedCard.currentStage).map((stage, idx) => (
                  <Button
                    key={idx} size="small"
                    onClick={() => { moveCard(selectedCard._id, stage.name); setSelectedCard({ ...selectedCard, currentStage: stage.name }); }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: stage.color, display: 'inline-block' }} /> {stage.name} <ArrowRightOutlined style={{ fontSize: 10, color: 'var(--ux-text-3)' }} />
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ux-ink)', letterSpacing: '-0.01em', marginBottom: 10 }}>
                Notes ({selectedCard.notes?.length || 0})
              </h4>
              {selectedCard.notes && selectedCard.notes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {selectedCard.notes.map((note, idx) => (
                    <div key={idx} style={{ padding: '12px 14px', background: 'var(--ux-surface-2)', borderRadius: 16, border: '1px solid var(--ux-line-2)' }}>
                      <p style={{ fontSize: 13, color: 'var(--ux-text)', margin: '0 0 4px' }}>{note.text}</p>
                      <span style={{ fontSize: 11, color: 'var(--ux-text-3)' }}>
                        {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <TextArea
                  rows={2}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note about this lead..."
                />
                <Button type="primary" icon={<SendOutlined />} onClick={addNote} style={{ height: 'auto' }}>Add</Button>
              </div>
            </div>

            {/* Delete */}
            <Popconfirm title="Remove this lead from pipeline?" onConfirm={() => deleteSubmission(selectedCard._id)}>
              <Button danger block icon={<DeleteOutlined />}>
                Remove lead
              </Button>
            </Popconfirm>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PipelineBoard;
