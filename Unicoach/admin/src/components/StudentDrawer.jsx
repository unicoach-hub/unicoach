import { useCallback, useEffect, useState } from 'react';
import { Drawer, Select, Button, Input, Checkbox, Timeline, Tag, Empty, Spin, message, Tooltip } from 'antd';
import { DownloadOutlined, EyeOutlined, FileZipOutlined, FileOutlined } from '@ant-design/icons';
import API from '../api/axios';
import { can } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const fmt = (d, withTime = false) => (d
  ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}) })
  : '—');
const sizeText = (n) => (!n ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const DOC_STATUS = { uploaded: ['To review', 'orange'], approved: ['Approved', 'green'], reupload: ['Re-upload asked', 'red'], requested: ['Requested', 'default'] };

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--ux-border, #f0f0f0)' }}>
    <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>{label}</span>
    <span style={{ color: 'var(--ux-ink)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{value || '—'}</span>
  </div>
);

// Everything about one student in one place: profile, journey stage (editable), referring mentor and documents
const StudentDrawer = ({ studentId, open, onClose, onChanged }) => {
  const { user } = useAuth();
  const canEdit = can(user, 'students', 'update');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [savingMentor, setSavingMentor] = useState(false);

  useEffect(() => {
    if (!open || mentors.length) return;
    API.get('/admin/students/mentors').then(({ data: d }) => setMentors(d.mentors || [])).catch(() => {});
  }, [open, mentors.length]);

  const changeMentor = async (value) => {
    setSavingMentor(true);
    try {
      await API.patch(`/admin/students/${studentId}/mentor`, { mentorId: value === 'none' ? null : value });
      message.success(value === 'none' ? 'Mentor removed' : 'Mentor linked');
      await load();
      onChanged?.();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Could not change the mentor');
    } finally {
      setSavingMentor(false);
    }
  };

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data: d } = await API.get(`/admin/students/${studentId}`);
      setData(d);
      setStage(d.student.journeyStage);
      setNote('');
    } catch {
      message.error('Could not load this student');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const stages = data?.stages || [];
  const labelOf = (k) => stages.find((s) => s.key === k)?.label || k;
  const s = data?.student;

  const saveStage = async () => {
    setSaving(true);
    try {
      await API.patch(`/admin/students/${studentId}/stage`, { stage, note, notify });
      message.success(notify ? 'Stage updated and student emailed' : 'Stage updated');
      await load();
      onChanged?.();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Could not update the stage');
    } finally {
      setSaving(false);
    }
  };

  const openDoc = async (doc, download) => {
    try {
      const { data: d } = await API.get(`/admin/students/${studentId}/documents/${doc._id}/file`, { params: download ? { download: 1 } : {} });
      window.open(d.url, '_blank', 'noopener');
    } catch {
      message.error('Could not open the file');
    }
  };

  const downloadAll = async () => {
    setZipping(true);
    try {
      const res = await API.get(`/admin/students/${studentId}/documents.zip`, { responseType: 'blob', timeout: 300000 });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(s?.name || 'Student').replace(/[^a-z0-9]+/gi, '_')}_Documents.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Could not create the ZIP');
    } finally {
      setZipping(false);
    }
  };

  const uploaded = (data?.documents || []).filter((d) => d.file);
  const pending = (data?.documents || []).filter((d) => !d.file);

  return (
    <Drawer open={open} onClose={onClose} width={560} title={s ? s.name : 'Student'} destroyOnHidden>
      {loading || !s ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <section>
            <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>Profile</h4>
            {!s.profileCompletedAt && <Tag color="orange" style={{ marginBottom: 8 }}>Onboarding form not filled yet</Tag>}
            <Row label="Email" value={s.email} />
            <Row label="Phone" value={s.phone} />
            <Row label="Country" value={s.dreamCountry} />
            <Row label="Intake" value={s.preferredIntake} />
            <Row label="Course" value={s.dreamCourse} />
            <Row label="Qualification" value={s.highestEducation} />
            <Row label="Percentage" value={s.percentage ? `${s.percentage}%` : ''} />
            <Row label="Passout year" value={s.passoutYear} />
            <Row label="Joined" value={fmt(s.createdAt, true)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--ux-border, #f0f0f0)' }}>
              <span style={{ color: 'var(--ux-text-2)', fontSize: 13 }}>Referred by mentor</span>
              <Select
                size="small"
                value={s.referredBy?._id || 'none'}
                onChange={changeMentor}
                disabled={!canEdit || savingMentor}
                loading={savingMentor}
                showSearch={{ optionFilterProp: 'label' }}
                style={{ minWidth: 220 }}
                options={[{ value: 'none', label: 'Direct sign-up (no mentor)' }, ...mentors.map((m) => ({ value: m._id, label: `${m.name} (@${m.handle})` }))]}
              />
            </div>
          </section>

          <section>
            <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Journey stage</h4>
            {/* Paper-style timeline: one dot per phase with the date it was reached */}
            {(() => {
              const phases = data?.phases || [];
              const cur = stages.find((st) => st.key === s.journeyStage);
              const curIdx = phases.findIndex((p) => p.key === cur?.phase);
              const reached = {};
              for (const h of s.stageHistory || []) {
                const st = stages.find((x) => x.key === h.stage);
                if (st && !reached[st.phase]) reached[st.phase] = { at: h.at, label: st.label };
              }
              if (!reached.registration) reached.registration = { at: s.createdAt, label: 'Walk-in' };
              return (
                <div style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0 16px', overflowX: 'auto', paddingBottom: 4 }}>
                  {phases.map((p, i) => {
                    const done = i < curIdx || (i === curIdx);
                    const isCur = i === curIdx;
                    const bad = isCur && cur?.outcome === 'bad';
                    const dot = bad ? '#dc2626' : isCur ? '#DE5C2B' : done ? '#16a34a' : '#cbd5e1';
                    const info = isCur ? { at: (s.stageHistory || []).slice().reverse().find((h) => h.stage === s.journeyStage)?.at || reached[p.key]?.at, label: cur?.label } : reached[p.key];
                    return (
                      <div key={p.key} style={{ flex: '1 0 78px', textAlign: 'center', position: 'relative' }}>
                        {i > 0 && <span style={{ position: 'absolute', top: 8, right: '50%', width: '100%', height: 2, background: i <= curIdx ? '#16a34a' : '#e2e8f0' }} />}
                        <span style={{ position: 'relative', display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: dot, border: '3px solid #fff', boxShadow: `0 0 0 1.5px ${dot}` }} />
                        <div style={{ fontSize: 11.5, fontWeight: 600, marginTop: 4, color: done ? 'var(--ux-ink)' : 'var(--ux-text-3)' }}>{done && info?.label ? info.label : p.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--ux-text-2)' }}>{done && info?.at ? fmt(info.at) : '—'}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Select
                value={stage}
                onChange={setStage}
                disabled={!canEdit}
                style={{ flex: 1, minWidth: 220 }}
                options={(data?.phases || []).map((p) => ({ label: p.label, title: p.label, options: stages.filter((st) => st.phase === p.key).map((st) => ({ value: st.key, label: st.label })) }))}
              />
              <Button type="primary" onClick={saveStage} loading={saving} disabled={!canEdit || stage === s.journeyStage}>Update</Button>
            </div>
            {canEdit && stage !== s.journeyStage && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Input.TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" maxLength={500} />
                <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)}>Email the student about this update</Checkbox>
              </div>
            )}
            <Timeline
              style={{ marginTop: 16 }}
              items={[...(s.stageHistory || [])].reverse().map((h) => ({
                children: (
                  <div>
                    <strong>{labelOf(h.stage)}</strong>
                    <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{fmt(h.at, true)}{h.by ? ` · ${h.by}` : ''}</div>
                    {h.note && <div style={{ fontSize: 12.5, marginTop: 2 }}>{h.note}</div>}
                  </div>
                ),
              })).concat([{ color: 'gray', children: <div><strong>Walk-in</strong><div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{fmt(s.createdAt, true)}</div></div> }])}
            />
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Documents ({uploaded.length})</h4>
              <Button icon={<FileZipOutlined />} onClick={downloadAll} loading={zipping} disabled={!uploaded.length}>Download all (ZIP)</Button>
            </div>
            {!uploaded.length && !pending.length ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {uploaded.map((d) => {
                  const [label, color] = DOC_STATUS[d.status] || [d.status, 'default'];
                  return (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--ux-border, #eee)', borderRadius: 10 }}>
                      <FileOutlined style={{ color: 'var(--ux-text-3)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{d.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.file.name} · {sizeText(d.file.size)} · {fmt(d.uploadedAt)}
                        </div>
                      </div>
                      <Tag color={color}>{label}</Tag>
                      <Tooltip title="Open"><Button size="small" icon={<EyeOutlined />} onClick={() => openDoc(d, false)} /></Tooltip>
                      <Tooltip title="Download"><Button size="small" icon={<DownloadOutlined />} onClick={() => openDoc(d, true)} /></Tooltip>
                    </div>
                  );
                })}
                {pending.length > 0 && (
                  <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)', marginTop: 4 }}>
                    Waiting for: {pending.map((d) => d.title).join(', ')}
                  </div>
                )}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--ux-text-3)', marginTop: 8 }}>Approve or ask for a re-upload from the Student Inbox chat.</div>
          </section>
        </div>
      )}
    </Drawer>
  );
};

export default StudentDrawer;
