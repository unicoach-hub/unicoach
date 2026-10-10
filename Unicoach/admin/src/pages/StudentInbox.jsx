import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal, Select, Tag, Tooltip, Empty, Spin, message } from 'antd';
import {
  PaperClipOutlined, SendOutlined, CheckOutlined, ReloadOutlined, FileTextOutlined, FilePdfOutlined,
  FileImageOutlined, SearchOutlined, PlusOutlined, UnorderedListOutlined, EyeOutlined, LoadingOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';
import compressImage from '../utils/compressImage';
import { usePermissions } from '../utils/permissions';

const POLL_MS = 10000;
const MAX_MB = 5;

const STATUS = {
  requested: { label: 'Pending', color: 'red' },
  uploaded: { label: 'To review', color: 'gold' },
  approved: { label: 'Approved', color: 'green' },
  reupload: { label: 'Re-upload asked', color: 'volcano' },
};

const COMMON_DOCS = ['Passport', '10th marksheet', '12th marksheet', 'Degree certificate', 'Transcripts', 'IELTS / PTE scorecard', 'SOP', 'LORs', 'CV / Resume', 'Bank statement', 'Offer letter'];

const initials = (name = '?') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
const timeLabel = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date().toDateString() === date.toDateString();
  return today ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};
const sizeLabel = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fileIcon = (mime = '') => (mime.includes('pdf') ? <FilePdfOutlined /> : mime.startsWith('image/') ? <FileImageOutlined /> : <FileTextOutlined />);

// Opens a private document through a short-lived signed link
const openDocument = async (docId) => {
  const tab = window.open('', '_blank');
  try {
    const { data } = await API.get(`/admin/student-inbox/documents/${docId}/file`);
    if (tab) tab.location.replace(data.url);
    else window.location.assign(data.url);
  } catch {
    tab?.close();
    message.error('Could not open the file');
  }
};

const StudentInbox = () => {
  const { user, can } = usePermissions();
  const ownOnly = user?.role === 'staff' && user?.leadScope !== 'all';
  const canSend = can('inbox', 'create');
  const canReview = can('inbox', 'update');

  const [convos, setConvos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [filter, setFilter] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [tab, setTab] = useState('chat');
  const [text, setText] = useState('');
  const [sendDocType, setSendDocType] = useState(); // optional type for a file the team sends (names it properly)
  const [sending, setSending] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestTitles, setRequestTitles] = useState([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [reupload, setReupload] = useState({ doc: null, note: '' });
  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/student-inbox');
      setConvos(data || []);
    } catch {
      /* the interceptor already shows permission errors */
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadFile = useCallback(async (studentId, { quiet = false } = {}) => {
    if (!quiet) setLoadingFile(true);
    try {
      const { data } = await API.get(`/admin/student-inbox/${studentId}`);
      setFile(data);
    } catch (err) {
      if (!quiet) message.error(err.response?.data?.message || 'Could not open this student');
    } finally {
      if (!quiet) setLoadingFile(false);
    }
  }, []);

  useEffect(() => {
    loadList();
    if (!ownOnly) API.get('/admin/staff/assignable').then((r) => setCounselors(r.data || [])).catch(() => {});
  }, [loadList, ownOnly]);

  // Poll for new messages while the page is open
  useEffect(() => {
    const t = setInterval(() => {
      if (document.hidden) return;
      loadList();
      if (activeId) loadFile(activeId, { quiet: true });
    }, POLL_MS);
    return () => clearInterval(t);
  }, [activeId, loadList, loadFile]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [file?.messages?.length, tab]);

  const openStudent = (studentId) => {
    setActiveId(studentId);
    setTab('chat');
    setText('');
    loadFile(studentId).then(() => {
      loadList();
      window.dispatchEvent(new Event('inbox_updated')); // opening a chat marks it read
    });
  };

  const visibleConvos = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? convos.filter((c) => `${c.student?.name} ${c.student?.email}`.toLowerCase().includes(q)) : convos;
  }, [convos, filter]);

  const send = async (attachment = null) => {
    const body = text.trim();
    if (!body && !attachment) return;
    setSending(true);
    try {
      const form = new FormData();
      if (body) form.append('text', body);
      if (attachment) form.append('file', attachment);
      if (attachment && sendDocType) form.append('docType', sendDocType);
      await API.post(`/admin/student-inbox/${activeId}/messages`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setText('');
      await loadFile(activeId, { quiet: true });
      loadList();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not send');
    } finally {
      setSending(false);
    }
  };

  const pickFile = async (e) => {
    const picked = e.target.files[0];
    e.target.value = '';
    if (!picked) return;
    const ready = await compressImage(picked);
    if (ready.size > MAX_MB * 1024 * 1024) {
      message.error(`File is too large. Max ${MAX_MB} MB.`);
      return;
    }
    send(ready);
  };

  const sendRequest = async () => {
    if (!requestTitles.length) {
      message.error('Add at least one document');
      return;
    }
    try {
      await API.post(`/admin/student-inbox/${activeId}/requests`, { titles: requestTitles });
      message.success('Request sent');
      setRequestOpen(false);
      setRequestTitles([]);
      await loadFile(activeId, { quiet: true });
      loadList();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not send the request');
    }
  };

  const review = async (doc, status, note = '') => {
    try {
      await API.patch(`/admin/student-inbox/documents/${doc._id}`, { status, note });
      message.success(status === 'approved' ? `${doc.title} approved` : 'Asked the student to upload it again');
      setReupload({ doc: null, note: '' });
      await loadFile(activeId, { quiet: true });
      window.dispatchEvent(new Event('inbox_updated'));
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not update');
    }
  };

  const assign = async (assignedTo) => {
    try {
      await API.patch(`/admin/student-inbox/${activeId}/assign`, { assignedTo });
      message.success('Counselor updated');
      await loadFile(activeId, { quiet: true });
      loadList();
    } catch (err) {
      message.error(err.response?.data?.message || 'Could not assign');
    }
  };

  const searchStudents = async (q) => {
    if (q.trim().length < 2) {
      setStudentResults([]);
      return;
    }
    try {
      const { data } = await API.get('/admin/student-inbox/students', { params: { q } });
      setStudentResults(data || []);
    } catch {
      setStudentResults([]);
    }
  };

  const docs = file?.documents || [];
  const pendingCount = docs.filter((d) => d.status === 'requested' || d.status === 'reupload').length;
  const reviewCount = docs.filter((d) => d.status === 'uploaded').length;

  const DocRow = ({ d, compact }) => (
    <div className="inbox-doc">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="inbox-doc-title">{d.title}</div>
        {!compact && d.file && <div className="inbox-muted">{d.file.name} · {sizeLabel(d.file.size)}</div>}
        {d.status === 'reupload' && d.note && <div className="inbox-muted">Reason: {d.note}</div>}
      </div>
      <Tag color={STATUS[d.status].color} style={{ marginInlineEnd: 0 }}>{d.from === 'staff' ? 'Sent by us' : STATUS[d.status].label}</Tag>
      {d.file && (
        <Tooltip title="Open">
          <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => openDocument(d._id)} aria-label={`Open ${d.title}`} />
        </Tooltip>
      )}
      {canReview && d.status === 'uploaded' && d.from === 'student' && (
        <>
          <Tooltip title="Approve">
            <Button size="small" type="text" icon={<CheckOutlined />} onClick={() => review(d, 'approved')} aria-label={`Approve ${d.title}`} />
          </Tooltip>
          <Tooltip title="Ask to upload again">
            <Button size="small" type="text" icon={<ReloadOutlined />} onClick={() => setReupload({ doc: d, note: '' })} aria-label={`Ask to re-upload ${d.title}`} />
          </Tooltip>
        </>
      )}
    </div>
  );

  return (
    <div>
      <Header
        title="Student Inbox"
        subtitle="Chat with students and collect their documents in one place"
        extra={!ownOnly && canSend ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setNewChatOpen(true)}>New chat</Button> : null}
      />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        <div className={`inbox ${activeId ? 'inbox--open' : ''}`}>
          {/* Conversations */}
          <aside className="inbox-list">
            <div style={{ padding: 10 }}>
              <Input prefix={<SearchOutlined />} placeholder="Search students" value={filter} onChange={(e) => setFilter(e.target.value)} allowClear />
            </div>
            {loadingList ? (
              <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>
            ) : visibleConvos.length === 0 ? (
              <Empty style={{ padding: 24 }} description={ownOnly ? 'No students assigned to you yet' : 'No conversations yet'} />
            ) : (
              visibleConvos.map((c) => (
                <button key={c._id} type="button" className={`inbox-row ${activeId === c.student._id ? 'inbox-row--on' : ''} ${c.unread > 0 ? 'inbox-row--unread' : ''}`} onClick={() => openStudent(c.student._id)}>
                  <span className="inbox-avatar">{initials(c.student.name)}</span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span className="inbox-row-top">
                      <strong>{c.student.name}</strong>
                      <span className="inbox-muted">{timeLabel(c.lastMessageAt)}</span>
                    </span>
                    <span className="inbox-row-preview">{c.lastMessagePreview || 'No messages yet'}</span>
                    {!ownOnly && <span className="inbox-muted">{c.assignedName}</span>}
                  </span>
                  {c.unread > 0 && <span className="inbox-unread">{c.unread}</span>}
                </button>
              ))
            )}
          </aside>

          {/* Chat / documents */}
          <section className="inbox-main">
            {!activeId ? (
              <Empty style={{ margin: 'auto' }} description="Pick a student to open their file" />
            ) : loadingFile && !file ? (
              <Spin style={{ margin: 'auto' }} />
            ) : file && (
              <>
                <div className="inbox-main-head">
                  <button type="button" className="inbox-back" onClick={() => { setActiveId(null); setFile(null); }} aria-label="Back to list">←</button>
                  <strong>{file.student.name}</strong>
                  <span className="inbox-tabs">
                    <button type="button" className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>Chat</button>
                    <button type="button" className={tab === 'docs' ? 'on' : ''} onClick={() => setTab('docs')}>
                      Documents {pendingCount + reviewCount > 0 && <span className="inbox-unread">{pendingCount + reviewCount}</span>}
                    </button>
                  </span>
                </div>

                {tab === 'chat' ? (
                  <>
                    <div className="inbox-messages">
                      {file.messages.length === 0 && <div className="inbox-muted" style={{ textAlign: 'center', marginTop: 40 }}>No messages yet. Say hello or request documents.</div>}
                      {file.messages.map((m) => (
                        <div key={m._id} className={`inbox-msg ${m.senderType === 'staff' ? 'inbox-msg--me' : ''}`}>
                          {m.kind === 'request' ? (
                            <div className="inbox-bubble inbox-bubble--request">
                              <UnorderedListOutlined /> Documents requested: {m.requestTitles.join(', ')}
                              {m.text && <div>{m.text}</div>}
                            </div>
                          ) : m.kind === 'file' && m.document ? (
                            <button type="button" className="inbox-bubble inbox-file" onClick={() => openDocument(m.document._id)}>
                              <span className="inbox-file-icon">{fileIcon(m.document.file?.mime)}</span>
                              <span style={{ minWidth: 0 }}>
                                <span className="inbox-doc-title">{m.document.title}</span>
                                {m.document.file && <span className="inbox-muted">{m.document.file.name} · {sizeLabel(m.document.file.size)}</span>}
                              </span>
                            </button>
                          ) : (
                            <div className="inbox-bubble">{m.text}</div>
                          )}
                          <div className="inbox-meta">{m.senderType === 'staff' ? m.senderName : file.student.name} · {timeLabel(m.createdAt)}</div>
                        </div>
                      ))}
                      <div ref={endRef} />
                    </div>
                    {canSend ? (
                      <div className="inbox-composer">
                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={pickFile} style={{ display: 'none' }} />
                        <Tooltip title="Attach a file (PDF or photo, max 5 MB)">
                          <Button icon={sending ? <LoadingOutlined /> : <PaperClipOutlined />} disabled={sending} onClick={() => fileInputRef.current?.click()} aria-label="Attach file" />
                        </Tooltip>
                        <Select
                          allowClear
                          size="middle"
                          placeholder="File type"
                          value={sendDocType}
                          onChange={setSendDocType}
                          style={{ width: 130 }}
                          options={(file.docTypes || []).filter((t) => t !== 'Other').map((t) => ({ value: t, label: t }))}
                          aria-label="Type of the file you attach"
                        />
                        <Tooltip title="Request documents">
                          <Button icon={<UnorderedListOutlined />} onClick={() => setRequestOpen(true)} aria-label="Request documents" />
                        </Tooltip>
                        <Input.TextArea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Write a message"
                          autoSize={{ minRows: 1, maxRows: 5 }}
                          maxLength={4000}
                          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
                        />
                        <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={() => send()} aria-label="Send" />
                      </div>
                    ) : (
                      <div className="inbox-composer inbox-muted">You can read this chat. Ask the admin for permission to reply.</div>
                    )}
                  </>
                ) : (
                  <div className="inbox-messages">
                    {canSend && <Button icon={<UnorderedListOutlined />} onClick={() => setRequestOpen(true)} style={{ marginBottom: 12 }}>Request documents</Button>}
                    {docs.length === 0 ? <Empty description="No documents yet" /> : docs.map((d) => <DocRow key={d._id} d={d} />)}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Student details */}
          {file && activeId && (
            <aside className="inbox-side">
              <div style={{ fontWeight: 700, fontSize: 15 }}>{file.student.name}</div>
              <div className="inbox-muted">{file.student.email}</div>
              {file.student.phone && <div className="inbox-muted">{file.student.phone}</div>}
              <div className="inbox-facts">
                {[['Country', file.student.dreamCountry], ['Course', file.student.dreamCourse], ['Intake', file.student.preferredIntake], ['Education', file.student.highestEducation], ['City', file.student.currentCity]]
                  .filter(([, v]) => v)
                  .map(([k, v]) => <div key={k}><span className="inbox-muted">{k}</span> {v}</div>)}
              </div>
              {!ownOnly && canReview && (
                <div style={{ marginTop: 12 }}>
                  <div className="inbox-muted" style={{ marginBottom: 4 }}>Counselor</div>
                  <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={file.conversation.assignedTo || 'Unassigned'}
                    onChange={assign}
                    options={[{ value: 'Unassigned', label: 'Unassigned' }, ...counselors.map((c) => ({ value: c._id, label: c.name }))]}
                  />
                </div>
              )}
              <div className="inbox-side-head">
                Documents <span className="inbox-muted">{docs.filter((d) => d.status === 'approved').length} of {docs.length} approved</span>
              </div>
              {docs.length === 0 ? <div className="inbox-muted">Nothing requested yet</div> : docs.slice(0, 8).map((d) => <DocRow key={d._id} d={d} compact />)}
              {docs.length > 8 && <Button type="link" size="small" onClick={() => setTab('docs')} style={{ paddingInline: 0 }}>See all {docs.length}</Button>}
            </aside>
          )}
        </div>
      </div>

      <Modal title="Request documents" open={requestOpen} onCancel={() => setRequestOpen(false)} onOk={sendRequest} okText="Send request" destroyOnHidden>
        <p className="inbox-muted" style={{ marginTop: 0 }}>They're added to the student's checklist with an Upload button, and a message is posted in the chat.</p>
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Pick or type document names"
          value={requestTitles}
          onChange={setRequestTitles}
          options={COMMON_DOCS.map((d) => ({ value: d, label: d }))}
          tokenSeparators={[',']}
        />
      </Modal>

      <Modal
        title={`Ask to upload "${reupload.doc?.title}" again`}
        open={Boolean(reupload.doc)}
        onCancel={() => setReupload({ doc: null, note: '' })}
        onOk={() => review(reupload.doc, 'reupload', reupload.note)}
        okText="Send"
        destroyOnHidden
      >
        <Input.TextArea rows={3} maxLength={500} placeholder="What's wrong? e.g. The photo is blurry, all pages are needed" value={reupload.note} onChange={(e) => setReupload((r) => ({ ...r, note: e.target.value }))} />
      </Modal>

      <Modal title="Start a chat" open={newChatOpen} onCancel={() => setNewChatOpen(false)} footer={null} destroyOnHidden>
        <Input.Search placeholder="Search a registered student by name, email or phone" onChange={(e) => searchStudents(e.target.value)} autoFocus />
        <div style={{ marginTop: 12 }}>
          {studentResults.map((s) => (
            <button key={s._id} type="button" className="inbox-row" onClick={() => { setNewChatOpen(false); setStudentResults([]); openStudent(s._id); }}>
              <span className="inbox-avatar">{initials(s.name)}</span>
              <span style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                <strong>{s.name}</strong>
                <span className="inbox-row-preview">{s.email || s.phone}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default StudentInbox;
