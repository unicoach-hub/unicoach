import { useState } from 'react';
import { Button, Checkbox, Empty, Input, Modal, Select, Tooltip, message } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import API from '../api/axios';

// One row of dots per lead: enquiry → interested, then (once the journey is started) the converted
// student's steps: walk-in → documents → application → offer → fees → visa.
const STEPS = [
  { key: 'enquiry', label: 'Enquiry' },
  { key: 'interest', label: 'Interested' },
  { key: 'registration', label: 'Walk-in' },
  { key: 'documents', label: 'Documents' },
  { key: 'application', label: 'Application' },
  { key: 'offer', label: 'Offer' },
  { key: 'fees', label: 'Fees' },
  { key: 'visa', label: 'Visa' },
];

// Mirrors backend/config/studentStages.js
const STAGE = {
  registered: ['registration', 'Walk-in'],
  docs_pending: ['documents', 'Docs pending'],
  docs_review: ['documents', 'Docs received'],
  docs_rejected: ['documents', 'Docs re-upload', 'bad'],
  applied: ['application', 'Applied'],
  offer_received: ['offer', 'Offer received'],
  offer_accepted: ['offer', 'Offer accepted'],
  offer_rejected: ['offer', 'Offer declined', 'bad'],
  fees_paid: ['fees', 'Fees paid'],
  visa_filing: ['visa', 'Visa file ready'],
  visa_applied: ['visa', 'Visa submitted'],
  visa_approved: ['visa', 'Visa approved', 'good'],
  visa_rejected: ['visa', 'Visa refused', 'bad'],
};

const idx = (key) => STEPS.findIndex((s) => s.key === key);
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');

// Where the lead is: index of the current step, its label, whether it went badly, and dates per step
const placeOf = (lead) => {
  const dates = { enquiry: lead.createdAt };
  // A journey counts once it was started from Leads, or the team already moved the student past Walk-in.
  // (Every website sign-up has an account at Walk-in by default; that alone is not a walk-in.)
  const started = lead.journey && (lead.userId || lead.journey.stage !== 'registered' || (lead.journey.history || []).length > 0);
  if (started) {
    const [phase, label, outcome] = STAGE[lead.journey.stage] || STAGE.registered;
    dates.registration = lead.journey.since;
    for (const h of lead.journey.history || []) {
      const ph = STAGE[h.stage]?.[0];
      if (ph && !dates[ph]) dates[ph] = h.at;
    }
    return { at: idx(phase), label, bad: outcome === 'bad', done: outcome === 'good' && phase === 'visa', dates };
  }
  switch (lead.status) {
    case 'converted': return { at: idx('interest'), label: 'Converted · start journey', dates };
    case 'interested': return { at: idx('interest'), label: 'Interested', dates };
    case 'fifty_fifty': return { at: idx('interest'), label: '50 / 50', dates };
    case 'not_interested': return { at: idx('interest'), label: 'Not interested', bad: true, dates };
    default: return { at: idx('enquiry'), label: 'New', dates };
  }
};

const STAGE_OPTIONS = [
  ['Walk-in', ['registered']],
  ['Documents', ['docs_pending', 'docs_review', 'docs_rejected']],
  ['Application', ['applied']],
  ['Offer', ['offer_received', 'offer_accepted', 'offer_rejected']],
  ['Fees', ['fees_paid']],
  ['Visa', ['visa_filing', 'visa_applied', 'visa_approved', 'visa_rejected']],
].map(([label, keys]) => ({ label, title: label, options: keys.map((k) => ({ value: k, label: STAGE[k][1] })) }));

const LeadJourneyView = ({ leads, onOpen, onChanged }) => {
  const [busy, setBusy] = useState('');
  const [pending, setPending] = useState(null); // { lead, stage }
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);

  const start = async (lead) => {
    setBusy(lead._id);
    try {
      const { data } = await API.post(`/admin/leads/${lead._id}/start-journey`);
      message.success(data.created ? (data.canLogin ? 'Student account created and journey started' : 'Journey started (no email, so the student cannot log in yet)') : 'Linked to the existing student account');
      onChanged?.(lead._id, { journey: data.journey, status: 'converted', userId: data.journey.userId });
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not start the journey');
    } finally { setBusy(''); }
  };

  const saveStage = async () => {
    const { lead, stage } = pending;
    setBusy(lead._id);
    try {
      const { data } = await API.patch(`/admin/leads/${lead._id}/journey-stage`, { stage, note, notify });
      message.success(`Moved to ${STAGE[stage][1]}${notify ? ' · student emailed' : ''}`);
      onChanged?.(lead._id, { journey: data.journey });
      setPending(null); setNote(''); setNotify(true);
    } catch (e) {
      message.error(e.response?.data?.message || 'Could not update the stage');
    } finally { setBusy(''); }
  };

  if (!leads.length) return <div className="page-table-card" style={{ padding: 40 }}><Empty description="No leads" /></div>;
  return (
    <div className="page-table-card" style={{ padding: '6px 0', overflowX: 'auto' }}>
      <div style={{ minWidth: 980 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 190px', padding: '10px 20px', borderBottom: '1px solid var(--ux-line-2)', fontSize: 12, color: 'var(--ux-text-2)' }}>
          <span>Lead</span>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, textAlign: 'center' }}>
            {STEPS.map((s, i) => <span key={s.key} style={{ color: i < 2 ? 'var(--ux-text-2)' : '#DE5C2B' }}>{s.label}</span>)}
          </div>
          <span style={{ textAlign: 'right' }}>Now</span>
        </div>
        {leads.map((lead) => {
          const p = placeOf(lead);
          const nowColor = p.bad ? '#dc2626' : p.done ? '#16a34a' : '#DE5C2B';
          return (
            <div key={lead._id} onClick={() => onOpen?.(lead)} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 190px', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--ux-line-2)', cursor: onOpen ? 'pointer' : 'default' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name || 'Unnamed'}</div>
                <div style={{ fontSize: 12, color: 'var(--ux-text-2)' }}>{lead.phone || lead.email || ''}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, alignItems: 'start' }}>
                {STEPS.map((s, i) => {
                  const reached = i <= p.at;
                  const isNow = i === p.at;
                  const color = isNow ? nowColor : reached ? '#16a34a' : '#d6d3cd';
                  return (
                    <div key={s.key} style={{ position: 'relative', textAlign: 'center' }}>
                      {i > 0 && <span style={{ position: 'absolute', top: 7, right: '50%', width: '100%', height: 2, background: i <= p.at ? '#16a34a' : '#e7e5e0' }} />}
                      <Tooltip title={isNow ? p.label : s.label}>
                        <span style={{ position: 'relative', display: 'inline-block', width: isNow ? 16 : 12, height: isNow ? 16 : 12, marginTop: isNow ? 0 : 2, borderRadius: '50%', background: reached ? color : '#fff', border: `2px solid ${color}`, boxShadow: isNow ? `0 0 0 4px ${color}22` : 'none' }} />
                      </Tooltip>
                      <div style={{ fontSize: 10.5, color: 'var(--ux-text-3)', marginTop: 2, minHeight: 14 }}>{reached ? fmt(p.dates[s.key]) : ''}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                {placeOf(lead).at >= idx('registration') ? (
                  <Select
                    size="small"
                    value={lead.journey.stage}
                    style={{ width: 175 }}
                    options={STAGE_OPTIONS}
                    loading={busy === lead._id}
                    onChange={(stage) => { setPending({ lead, stage }); setNote(''); setNotify(true); }}
                  />
                ) : lead.status === 'not_interested' ? (
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: nowColor, background: `${nowColor}14` }}>{p.label}</span>
                ) : (
                  <Button size="small" type={lead.status === 'converted' ? 'primary' : 'default'} icon={<RocketOutlined />} loading={busy === lead._id} onClick={() => start(lead)}>
                    Start journey
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        open={!!pending}
        title={pending ? `Move ${pending.lead.name || 'student'} to ${STAGE[pending.stage][1]}?` : ''}
        okText="Update stage"
        confirmLoading={!!pending && busy === pending.lead._id}
        onOk={saveStage}
        onCancel={() => setPending(null)}
      >
        <Input.TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the team (optional), e.g. Offer from University of Leeds" maxLength={500} />
        <Checkbox style={{ marginTop: 10 }} checked={notify} onChange={(e) => setNotify(e.target.checked)}>Email the student about this update</Checkbox>
        <div style={{ fontSize: 12, color: 'var(--ux-text-2)', marginTop: 8 }}>The student sees this on their dashboard, and their mentor sees it under My Students.</div>
      </Modal>
    </div>
  );
};

export default LeadJourneyView;
