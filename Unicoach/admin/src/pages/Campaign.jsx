import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Select, Segmented, Input, Checkbox, Tag, Table, Modal, Empty, message, Tooltip } from 'antd';
import {
  SendOutlined, TeamOutlined, MailOutlined, WhatsAppOutlined, CheckCircleOutlined, CloseCircleOutlined,
  CalendarOutlined, TagsOutlined, UsergroupAddOutlined, ArrowLeftOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const VARIABLES = [
  ['{name}', 'Student name'],
  ['{event_name}', 'Event name'],
  ['{event_date}', 'Event date'],
  ['{event_time}', 'Event time'],
  ['{meet_link}', 'Joining link'],
];

// Ready-made message for event reminders; the admin can change any word
const EVENT_MESSAGE = {
  subject: 'Your joining link: {event_name}',
  body: 'Hi {name},\n\nThanks for registering for {event_name}.\n\nDate: {event_date}\nTime: {event_time}\nJoin here: {meet_link}\n\nPlease join 5 minutes early. See you there!\n\nTeam UniCoach',
};

// Same {var} filling the server does, for the preview only
const fill = (text, data) => String(text || '').replace(/\{\{\s*(\w+)\s*\}\}|\{(\w+)\}/g, (m, a, b) => {
  const key = a || b;
  const alias = { student_name: 'name' }[key] || key;
  return data[alias] !== undefined && data[alias] !== '' ? data[alias] : m;
});

const istDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '');
const istTime = (d) => (d ? `${new Date(d).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })} IST` : '');
const eventTagFor = (ev) => `Event: ${String(ev?.title || '').replace(/\s+/g, ' ').trim().slice(0, 70)}`;

const EMPTY_FILTERS = { tagsAny: [], tagsAll: [], tagsNone: [], statuses: [], counselors: [], verifiedOnly: false };

const Campaign = () => {
  const [step, setStep] = useState(1);
  const [tags, setTags] = useState({ auto: [], manual: [] });
  const [counselors, setCounselors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [events, setEvents] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);

  // Step 1: who
  const [mode, setMode] = useState('event'); // event | all | tags
  const [eventId, setEventId] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [preview, setPreview] = useState({ count: 0, unsubscribed: 0, sample: [] });
  const [previewLoading, setPreviewLoading] = useState(false);

  // Step 2: message
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [vars, setVars] = useState({ event_name: '', event_date: '', event_time: '', meet_link: '' });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    API.get('/admin/leads/tags').then((r) => setTags(r.data || { auto: [], manual: [] })).catch(() => {});
    API.get('/admin/staff/assignable').then((r) => setCounselors(r.data || [])).catch(() => {});
    API.get('/admin/templates').then((r) => setTemplates(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    API.get('/admin/content', { params: { type: 'event' } }).then((r) => setEvents(r.data || [])).catch(() => {});
    API.get('/admin/messaging/email-status').then((r) => setEmailStatus(r.data)).catch(() => {});
  }, []);

  const selectedEvent = events.find((e) => e._id === eventId);

  // The filters actually sent to the server for the chosen mode
  const audience = useMemo(() => {
    if (mode === 'event') return selectedEvent ? { tagsAny: [eventTagFor(selectedEvent)] } : null;
    if (mode === 'all') return {};
    return filters;
  }, [mode, selectedEvent, filters]);

  const loadPreview = useCallback(async () => {
    if (!audience) {
      setPreview({ count: 0, unsubscribed: 0, sample: [] });
      return;
    }
    setPreviewLoading(true);
    try {
      const { data } = await API.post('/admin/messaging/audience-preview', { audience, channel });
      setPreview(data);
    } catch {
      setPreview({ count: 0, unsubscribed: 0, sample: [] });
    } finally {
      setPreviewLoading(false);
    }
  }, [audience, channel]);

  useEffect(() => {
    const t = setTimeout(loadPreview, 250);
    return () => clearTimeout(t);
  }, [loadPreview]);

  const pickEvent = (id) => {
    setEventId(id);
    const ev = events.find((e) => e._id === id);
    if (!ev) return;
    setVars({ event_name: ev.title || '', event_date: istDate(ev.eventStart), event_time: istTime(ev.eventStart), meet_link: ev.joiningLink || '' });
    // Start from a ready event message if nothing is written yet
    if (!body.trim()) {
      setSubject(EVENT_MESSAGE.subject);
      setBody(EVENT_MESSAGE.body);
    }
  };

  const applySavedTemplate = (id) => {
    const t = templates.find((x) => x._id === id);
    if (!t) return;
    setSubject(t.subject || '');
    setBody(t.body || '');
  };

  const insertVar = (v) => setBody((b) => `${b}${b && !b.endsWith(' ') && !b.endsWith('\n') ? ' ' : ''}${v}`);

  const tagOptions = useMemo(() => [
    { label: 'Added automatically', options: tags.auto.map((t) => ({ value: t.tag, label: `${t.tag} (${t.count})` })) },
    { label: 'Added by your team', options: tags.manual.map((t) => ({ value: t.tag, label: `${t.tag} (${t.count})` })) },
  ].filter((g) => g.options.length), [tags]);

  const sample = preview.sample[0] || { name: 'Rahul' };
  const previewData = { name: sample.name || 'Student', ...vars };
  const usedVars = [...new Set((`${subject} ${body}`.match(/\{(meet_link|event_name|event_date|event_time)\}/g) || []))];
  const missingVars = usedVars.filter((v) => !vars[v.slice(1, -1)]);

  const step1Ready = Boolean(audience) && preview.count > 0;
  const step2Ready = body.trim() && (channel !== 'email' || subject.trim());

  const send = () => {
    Modal.confirm({
      title: `Send to ${preview.count} ${preview.count === 1 ? 'person' : 'people'}?`,
      content: (
        <div>
          <p style={{ margin: '6px 0' }}>By {channel === 'email' ? 'email' : 'WhatsApp'}{channel === 'email' ? `: "${fill(subject, previewData)}"` : ''}</p>
          {missingVars.length > 0 && <p style={{ color: '#c0392b', margin: 0 }}>Still empty: {missingVars.join(', ')}. They will show as written.</p>}
          <p style={{ color: 'var(--ux-text-3)', margin: '6px 0 0' }}>This can't be undone.</p>
        </div>
      ),
      okText: 'Send now',
      onOk: async () => {
        setSending(true);
        setResult(null);
        try {
          const { data } = await API.post('/admin/messaging/send-bulk', {
            channel,
            target: 'audience',
            audience,
            message: { subject, body },
            variables: vars,
          });
          setResult(data);
          message.success(data.summary || 'Sent');
        } catch (err) {
          message.error(err.response?.data?.message || 'Could not send');
        } finally {
          setSending(false);
        }
      },
    });
  };

  const setF = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));

  const StepDots = (
    <div className="campaign-steps" role="list">
      {['Who gets it', 'Write the message', 'Check and send'].map((label, i) => (
        <button
          key={label}
          type="button"
          role="listitem"
          className={`campaign-steps-item ${step === i + 1 ? 'is-on' : ''} ${step > i + 1 ? 'is-done' : ''}`}
          onClick={() => (i + 1 < step || (i + 1 === 2 && step1Ready) || (i + 1 === 3 && step1Ready && step2Ready)) && setStep(i + 1)}
        >
          <span>{step > i + 1 ? '✓' : i + 1}</span>{label}
        </button>
      ))}
    </div>
  );

  const PeopleList = (
    <div className="campaign-people">
      {preview.sample.slice(0, 8).map((p) => (
        <div key={p._id} className="campaign-person">
          <strong>{p.name}</strong>
          <span>{channel === 'email' ? p.email : p.phone}</span>
        </div>
      ))}
      {preview.count > 8 && <div className="campaign-help" style={{ margin: '6px 0 0' }}>and {preview.count - 8} more</div>}
    </div>
  );

  return (
    <div>
      <Header title="Send a campaign" subtitle="Three steps: choose people, write the message, send" showBack backUrl="/automation/email" />
      <div className="dashboard-content campaign" style={{ marginTop: 16 }}>
        {emailStatus && channel === 'email' && (
          <div className={`campaign-status ${emailStatus.configured ? '' : 'campaign-status--off'}`}>
            {emailStatus.configured ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            <span>
              {emailStatus.configured
                ? <>Emails go out through Resend{emailStatus.from ? <> from <strong>{emailStatus.from}</strong></> : null}</>
                : 'Email is not set up on the server, so messages are only simulated'}
            </span>
          </div>
        )}

        {StepDots}

        {/* STEP 1: who */}
        {step === 1 && (
          <section className="nx-card campaign-card">
            <h2 className="campaign-title">Who should get this?</h2>
            <div className="campaign-modes">
              {[
                ['event', <CalendarOutlined key="i" />, 'People registered for an event', 'Send the joining link or a reminder'],
                ['all', <UsergroupAddOutlined key="i" />, 'All leads', 'Everyone who hasn\'t unsubscribed'],
                ['tags', <TagsOutlined key="i" />, 'Choose by tags', 'Country, intake, source, your own tags…'],
              ].map(([key, icon, title, sub]) => (
                <button key={key} type="button" className={`campaign-mode ${mode === key ? 'is-on' : ''}`} onClick={() => setMode(key)}>
                  <span className="campaign-mode-icon">{icon}</span>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </button>
              ))}
            </div>

            {mode === 'event' && (
              <div style={{ marginTop: 18 }}>
                <label className="nx-label">Which event?</label>
                <Select placeholder="Pick an event" style={{ width: '100%' }} size="large" value={eventId} onChange={pickEvent}
                  options={events.map((e) => ({ value: e._id, label: `${e.title}${e.eventStart ? ` · ${istDate(e.eventStart)}` : ''}` }))} />
              </div>
            )}

            {mode === 'tags' && (
              <div className="campaign-filters">
                <div>
                  <label className="nx-label">Has any of these tags</label>
                  <Select mode="multiple" allowClear placeholder="e.g. Country: Ireland" style={{ width: '100%' }} value={filters.tagsAny} onChange={setF('tagsAny')} options={tagOptions} maxTagCount="responsive" />
                </div>
                <div>
                  <label className="nx-label">And also has all of these <span className="campaign-optional">optional</span></label>
                  <Select mode="multiple" allowClear placeholder="e.g. Intake: Sep 2027" style={{ width: '100%' }} value={filters.tagsAll} onChange={setF('tagsAll')} options={tagOptions} maxTagCount="responsive" />
                </div>
                <div>
                  <label className="nx-label">Leave out people tagged <span className="campaign-optional">optional</span></label>
                  <Select mode="multiple" allowClear placeholder="e.g. Converted" style={{ width: '100%' }} value={filters.tagsNone} onChange={setF('tagsNone')} options={tagOptions} maxTagCount="responsive" />
                </div>
                <div className="campaign-two">
                  <div>
                    <label className="nx-label">Lead status <span className="campaign-optional">optional</span></label>
                    <Select mode="multiple" allowClear placeholder="Any status" style={{ width: '100%' }} value={filters.statuses} onChange={setF('statuses')} options={STATUSES} />
                  </div>
                  <div>
                    <label className="nx-label">Counselor <span className="campaign-optional">optional</span></label>
                    <Select mode="multiple" allowClear placeholder="Anyone" style={{ width: '100%' }} value={filters.counselors} onChange={setF('counselors')}
                      options={[{ value: 'Unassigned', label: 'Unassigned' }, ...counselors.map((c) => ({ value: c._id, label: c.name }))]} />
                  </div>
                </div>
                <Checkbox checked={filters.verifiedOnly} onChange={(e) => setF('verifiedOnly')(e.target.checked)}>Only verified leads (phone confirmed)</Checkbox>
                <p className="campaign-help" style={{ margin: 0 }}>Orange tags are added automatically. Add your own tags from the Leads page.</p>
              </div>
            )}

            <div className="campaign-count">
              <TeamOutlined />
              {mode === 'event' && !selectedEvent ? <span>Pick an event to see who is registered</span> : (
                <span><strong>{previewLoading ? '…' : preview.count}</strong> {preview.count === 1 ? 'person' : 'people'} will get it
                  {preview.unsubscribed > 0 && <span className="campaign-help" style={{ margin: 0 }}> · {preview.unsubscribed} unsubscribed, left out</span>}
                </span>
              )}
            </div>
            {preview.count > 0 && PeopleList}
            {mode === 'event' && selectedEvent && !previewLoading && preview.count === 0 && (
              <p className="campaign-help">No one has registered for this event yet.</p>
            )}

            <div className="campaign-nav">
              <span />
              <Button type="primary" size="large" disabled={!step1Ready} onClick={() => setStep(2)}>
                Next: write the message <ArrowRightOutlined />
              </Button>
            </div>
          </section>
        )}

        {/* STEP 2: message */}
        {step === 2 && (
          <section className="nx-card campaign-card">
            <h2 className="campaign-title">Write the message</h2>
            <div className="campaign-two" style={{ alignItems: 'end' }}>
              <div>
                <label className="nx-label">Send by</label>
                <Segmented
                  value={channel}
                  onChange={setChannel}
                  options={[{ value: 'email', label: <span><MailOutlined /> Email</span> }, { value: 'whatsapp', label: <span><WhatsAppOutlined /> WhatsApp</span> }]}
                />
              </div>
              {templates.filter((t) => t.type === channel).length > 0 && (
                <div>
                  <label className="nx-label">Start from a saved template <span className="campaign-optional">optional</span></label>
                  <Select allowClear placeholder="Choose" style={{ width: '100%' }} onChange={applySavedTemplate}
                    options={templates.filter((t) => t.type === channel).map((t) => ({ value: t._id, label: t.name }))} />
                </div>
              )}
            </div>

            {channel === 'email' && (
              <>
                <label className="nx-label" style={{ marginTop: 16 }}>Subject</label>
                <Input size="large" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Your joining link: {event_name}" maxLength={200} />
              </>
            )}
            <label className="nx-label" style={{ marginTop: 14 }}>Message</label>
            <Input.TextArea value={body} onChange={(e) => setBody(e.target.value)} autoSize={{ minRows: 8, maxRows: 18 }} placeholder="Hi {name}, …" maxLength={10000} />
            <div className="campaign-vars">
              <span className="campaign-help" style={{ margin: 0 }}>Click to add:</span>
              {VARIABLES.map(([v, label]) => (
                <Tooltip key={v} title={`Adds ${v}`}><button type="button" className="campaign-var" onClick={() => insertVar(v)}>{label}</button></Tooltip>
              ))}
            </div>

            {usedVars.some((v) => v !== '{name}') && (
              <div className="campaign-fill">
                <div className="campaign-help" style={{ margin: '0 0 8px', fontWeight: 600 }}>Fill in the details used in your message</div>
                <div className="campaign-two">
                  {usedVars.includes('{event_name}') && <div><label className="nx-label">Event name</label><Input value={vars.event_name} onChange={(e) => setVars((x) => ({ ...x, event_name: e.target.value }))} /></div>}
                  {usedVars.includes('{event_date}') && <div><label className="nx-label">Event date</label><Input value={vars.event_date} onChange={(e) => setVars((x) => ({ ...x, event_date: e.target.value }))} placeholder="Sun, 15 Nov 2026" /></div>}
                  {usedVars.includes('{event_time}') && <div><label className="nx-label">Event time</label><Input value={vars.event_time} onChange={(e) => setVars((x) => ({ ...x, event_time: e.target.value }))} placeholder="4:00 pm IST" /></div>}
                  {usedVars.includes('{meet_link}') && (
                    <div>
                      <label className="nx-label">Joining link (Zoom / Meet)</label>
                      <Input value={vars.meet_link} status={vars.meet_link ? '' : 'warning'} onChange={(e) => setVars((x) => ({ ...x, meet_link: e.target.value }))} placeholder="https://zoom.us/j/…" />
                    </div>
                  )}
                </div>
                {missingVars.length > 0 && <p style={{ color: '#c0392b', fontSize: 12.5, margin: '8px 0 0' }}>Still empty: {missingVars.join(', ')}</p>}
              </div>
            )}

            <div className="campaign-nav">
              <Button size="large" onClick={() => setStep(1)}><ArrowLeftOutlined /> Back</Button>
              <Button type="primary" size="large" disabled={!step2Ready} onClick={() => setStep(3)}>
                Next: check and send <ArrowRightOutlined />
              </Button>
            </div>
          </section>
        )}

        {/* STEP 3: check and send */}
        {step === 3 && (
          <section className="nx-card campaign-card">
            <h2 className="campaign-title">Check and send</h2>
            <div className="campaign-review">
              <div>
                <label className="nx-label">This is what {sample.name || 'they'} will get</label>
                <div className="campaign-preview">
                  {channel === 'email' && <div className="campaign-preview-subject">{fill(subject, previewData)}</div>}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{fill(body, previewData)}</div>
                  {channel === 'email' && <div className="campaign-help" style={{ marginTop: 12 }}>— Don't want these emails? Unsubscribe (added automatically)</div>}
                </div>
              </div>
              <div>
                <label className="nx-label">Going to</label>
                <div className="campaign-count" style={{ marginTop: 0 }}>
                  <TeamOutlined /><span><strong>{preview.count}</strong> {preview.count === 1 ? 'person' : 'people'} by {channel === 'email' ? 'email' : 'WhatsApp'}</span>
                </div>
                {PeopleList}
                {missingVars.length > 0 && <p style={{ color: '#c0392b', fontSize: 12.5 }}>Still empty: {missingVars.join(', ')}</p>}
              </div>
            </div>

            <div className="campaign-nav">
              <Button size="large" onClick={() => setStep(2)}><ArrowLeftOutlined /> Back</Button>
              <Button type="primary" size="large" icon={<SendOutlined />} loading={sending} onClick={send}>
                Send to {preview.count} {preview.count === 1 ? 'person' : 'people'}
              </Button>
            </div>

            {result && (
              <div style={{ marginTop: 20 }}>
                <div className="campaign-count"><CheckCircleOutlined /><span>{result.summary}</span></div>
                <Table
                  size="small"
                  rowKey={(r) => `${r.recipient}-${r.name}`}
                  dataSource={result.logs || []}
                  pagination={{ pageSize: 20, hideOnSinglePage: true }}
                  scroll={{ x: 480 }}
                  columns={[
                    { title: 'Name', dataIndex: 'name' },
                    { title: channel === 'email' ? 'Email' : 'Phone', dataIndex: 'recipient' },
                    { title: 'Status', dataIndex: 'status', render: (st, r) => (st === 'success' ? <Tag color="green">Sent</Tag> : <Tooltip title={r.error}><Tag color="red">Failed</Tag></Tooltip>) },
                  ]}
                  locale={{ emptyText: <Empty description="No results" /> }}
                />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Campaign;
