import { useState } from 'react';
import { Modal, Checkbox, Input, Tag, message } from 'antd';
import API from '../api/axios';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');
const PHASE_COLORS = { registration: '#64748b', documents: '#0ea5e9', application: '#8b5cf6', offer: '#16a34a', fees: '#ca8a04', visa: '#DE5C2B' };
const accentFor = (stage) => (stage.outcome === 'bad' ? '#dc2626' : stage.outcome === 'good' ? '#16a34a' : PHASE_COLORS[stage.phase] || '#64748b');

// Kanban of the 9 journey stages: total per stage on top, drag a student card to move them
const StudentsBoard = ({ students, stages, phases = [], canEdit, onOpen, onMoved }) => {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);
  const [pending, setPending] = useState(null); // { student, stage }
  const [notify, setNotify] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const byStage = Object.fromEntries(stages.map((s) => [s.key, []]));
  for (const st of students) (byStage[st.journeyStage] || byStage[stages[0]?.key] || []).push(st);

  const drop = (stageKey) => {
    setOverStage(null);
    const student = students.find((s) => s._id === dragId);
    setDragId(null);
    if (!student || !canEdit || student.journeyStage === stageKey) return;
    setNotify(true);
    setNote('');
    setPending({ student, stage: stages.find((s) => s.key === stageKey) });
  };

  const confirm = async () => {
    setSaving(true);
    try {
      await API.patch(`/admin/students/${pending.student._id}/stage`, { stage: pending.stage.key, note, notify });
      message.success(`${pending.student.name} moved to ${pending.stage.label}`);
      setPending(null);
      onMoved?.();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Could not move the student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {!canEdit && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 12, background: '#fef3c7', color: '#92400e', fontSize: 13 }}>
          You can view this board but not move students. Ask the owner to turn on <strong>Students, Stages &amp; Documents → Edit</strong> for your role in Staff &amp; Roles.
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {stages.map((stage) => {
          const list = byStage[stage.key] || [];
          const isOver = overStage === stage.key && dragId;
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { if (canEdit) { e.preventDefault(); setOverStage(stage.key); } }}
              onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
              onDrop={(e) => { e.preventDefault(); drop(stage.key); }}
              style={{
                flex: '0 0 248px',
                background: isOver ? 'rgba(222,92,43,0.08)' : 'var(--ux-surface-2, #f6f5f2)',
                border: isOver ? '2px dashed #DE5C2B' : '2px solid transparent',
                borderRadius: 16,
                padding: 10,
                minHeight: 320,
                transition: 'background .15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px', borderBottom: `3px solid ${accentFor(stage)}`, marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ux-ink)' }}>
                  <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: PHASE_COLORS[stage.phase] }}>{phases.find((p) => p.key === stage.phase)?.label}</span>
                  {stage.label}
                </span>
                <span style={{ minWidth: 26, height: 22, padding: '0 8px', borderRadius: 11, background: accentFor(stage), color: '#fff', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {list.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '62vh', overflowY: 'auto' }}>
                {list.length === 0 && <div style={{ fontSize: 12, color: 'var(--ux-text-3)', textAlign: 'center', padding: '18px 0' }}>{canEdit ? 'Drop a student here' : 'No students'}</div>}
                {list.map((s) => (
                  <div
                    key={s._id}
                    draggable={canEdit}
                    onDragStart={(e) => { setDragId(s._id); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    onClick={() => onOpen(s._id)}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--ux-border, #ececec)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      cursor: canEdit ? 'grab' : 'pointer',
                      opacity: dragId === s._id ? 0.5 : 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)' }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)', marginTop: 2 }}>
                      {[s.dreamCountry, s.preferredIntake].filter(Boolean).join(' · ') || 'Profile not filled'}
                    </div>
                    {s.dreamCourse && <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)' }}>{s.dreamCourse}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 6 }}>
                      {s.referredBy ? <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>{s.referredBy.name}</Tag> : <span />}
                      <span style={{ fontSize: 11, color: 'var(--ux-text-3)' }}>{fmt(s.stageUpdatedAt || s.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(pending)}
        title={pending ? `Move ${pending.student.name} to "${pending.stage.label}"?` : ''}
        okText="Move"
        onOk={confirm}
        confirmLoading={saving}
        onCancel={() => setPending(null)}
      >
        <Input.TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" maxLength={500} style={{ marginBottom: 10 }} />
        <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)}>Email the student about this update</Checkbox>
      </Modal>
    </>
  );
};

export default StudentsBoard;
