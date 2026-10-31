import { useState } from 'react';
import { Modal, Input, Checkbox, message, Empty } from 'antd';
import API from '../api/axios';

// All Leads → Stage board. One column per step: sales statuses first, then the student's journey.
// Drag a card to another column:
//   • a sales column changes the lead's status
//   • a journey column starts the journey if needed (creates/links the student account) and sets the
//     stage on the student account, which the student dashboard and the mentor's My Students also read.
export const COLUMNS = [
  { key: 'new', label: 'New', kind: 'status', color: '#64748b' },
  { key: 'interested', label: 'Interested', kind: 'status', color: '#0ea5e9' },
  { key: 'fifty_fifty', label: '50 / 50', kind: 'status', color: '#f59e0b' },
  { key: 'registered', label: 'Walk-in', kind: 'stage', color: '#DE5C2B' },
  { key: 'docs_pending', label: 'Docs pending', kind: 'stage', color: '#0ea5e9' },
  { key: 'docs_review', label: 'Docs received', kind: 'stage', color: '#0ea5e9' },
  { key: 'docs_rejected', label: 'Docs re-upload', kind: 'stage', color: '#dc2626' },
  { key: 'applied', label: 'Applied', kind: 'stage', color: '#8b5cf6' },
  { key: 'offer_received', label: 'Offer received', kind: 'stage', color: '#16a34a' },
  { key: 'offer_accepted', label: 'Offer accepted', kind: 'stage', color: '#16a34a' },
  { key: 'offer_rejected', label: 'Offer declined', kind: 'stage', color: '#dc2626' },
  { key: 'fees_paid', label: 'Fees paid', kind: 'stage', color: '#ca8a04' },
  { key: 'visa_filing', label: 'Visa file ready', kind: 'stage', color: '#DE5C2B' },
  { key: 'visa_applied', label: 'Visa submitted', kind: 'stage', color: '#DE5C2B' },
  { key: 'visa_approved', label: 'Visa approved', kind: 'stage', color: '#16a34a' },
  { key: 'visa_rejected', label: 'Visa refused', kind: 'stage', color: '#dc2626' },
  { key: 'not_interested', label: 'Not interested', kind: 'status', color: '#94a3b8' },
];

// Same rule as the Journey view: a journey counts once started from Leads or moved past Walk-in
// (also used by the All Leads dropdown to count and filter leads per stage)
export const columnOf = (lead) => {
  const j = lead.journey;
  const started = j && (lead.userId || j.stage !== 'registered' || (j.history || []).length > 0);
  if (started) return j.stage;
  if (lead.status === 'converted') return 'registered';
  return COLUMNS.some((c) => c.key === lead.status && c.kind === 'status') ? lead.status : 'new';
};

const LeadStageBoard = ({ leads, onOpen, onChanged }) => {
  const [over, setOver] = useState(null);
  const [pending, setPending] = useState(null); // { lead, col }
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  const byCol = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
  for (const l of leads) (byCol[columnOf(l)] || byCol.new).push(l);

  const move = async (lead, col) => {
    setSaving(true);
    try {
      if (col.kind === 'status') {
        await API.put(`/admin/leads/${lead._id}`, { status: col.key });
        onChanged?.(lead._id, { status: col.key });
        message.success(`${lead.name || 'Lead'} → ${col.label}`);
      } else {
        let journey = lead.journey;
        let userId = lead.userId;
        if (!userId) {
          const { data } = await API.post(`/admin/leads/${lead._id}/start-journey`);
          journey = data.journey; userId = data.journey.userId;
        }
        if (col.key !== 'registered' || journey?.stage !== 'registered') {
          const { data } = await API.patch(`/admin/leads/${lead._id}/journey-stage`, { stage: col.key, note, notify });
          journey = data.journey;
        }
        onChanged?.(lead._id, { journey, userId, status: 'converted' });
        message.success(`${lead.name || 'Student'} → ${col.label}${notify ? ' · student emailed' : ''}`);
      }
      setPending(null); setNote(''); setNotify(true);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not move this lead');
    } finally {
      setSaving(false);
    }
  };

  const onDrop = (colKey, e) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData('leadId');
    const lead = leads.find((l) => l._id === id);
    const col = COLUMNS.find((c) => c.key === colKey);
    if (!lead || !col || columnOf(lead) === colKey) return;
    // journey moves get a note + email choice; status moves happen straight away
    if (col.kind === 'stage') setPending({ lead, col });
    else move(lead, col);
  };

  if (!leads.length) return <div className="page-table-card" style={{ padding: 40 }}><Empty description="No leads" /></div>;

  return (
    <div className="page-table-card" style={{ padding: 12, overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 10, minWidth: 'max-content', alignItems: 'flex-start' }}>
        {COLUMNS.map((c, idx) => {
          const items = byCol[c.key];
          const firstStage = idx === 3;
          return (
            <div key={c.key} style={{ display: 'flex', gap: 10 }}>
              {firstStage && (
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#DE5C2B', padding: '8px 0', borderLeft: '2px dashed #F3C9B6', alignSelf: 'stretch', textAlign: 'center' }}>
                  CONVERTED · STUDENT JOURNEY
                </div>
              )}
              <div
                onDragOver={(e) => { e.preventDefault(); setOver(c.key); }}
                onDragLeave={() => setOver((o) => (o === c.key ? null : o))}
                onDrop={(e) => onDrop(c.key, e)}
                style={{ width: 232, borderRadius: 14, background: over === c.key ? '#FFF4EE' : 'var(--ux-surface-2)', border: `1px solid ${over === c.key ? '#F3C9B6' : 'var(--ux-line-2)'}`, transition: 'background .15s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--ux-line-2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{c.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ux-text-2)' }}>{items.length}</span>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80, maxHeight: 560, overflowY: 'auto' }}>
                  {items.map((l) => (
                    <div
                      key={l._id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('leadId', l._id)}
                      onClick={() => onOpen?.(l)}
                      style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--ux-line-2)', borderLeft: `3px solid ${c.color}`, padding: '8px 10px', cursor: 'grab' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name || 'Unnamed'}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ux-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.phone && l.phone !== 'Not provided' ? l.phone : l.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--ux-text-3)', marginTop: 2 }}>{l.dreamCountry && l.dreamCountry !== 'Undecided' ? l.dreamCountry : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!pending}
        title={pending ? `Move ${pending.lead.name || 'student'} to ${pending.col.label}?` : ''}
        okText="Move"
        confirmLoading={saving}
        onOk={() => move(pending.lead, pending.col)}
        onCancel={() => setPending(null)}
      >
        {pending && !pending.lead.userId && (
          <p style={{ fontSize: 13, color: 'var(--ux-text-2)' }}>This starts the student's journey: a UniCoach account is created or linked from the lead's email/phone, and the lead is marked Converted.</p>
        )}
        <Input.TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the team (optional)" maxLength={500} />
        <Checkbox style={{ marginTop: 10 }} checked={notify} onChange={(e) => setNotify(e.target.checked)}>Email the student about this update</Checkbox>
      </Modal>
    </div>
  );
};

export default LeadStageBoard;
