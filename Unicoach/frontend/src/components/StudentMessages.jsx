import { useCallback, useEffect, useRef, useState } from 'react';
import { Paperclip, Send, FileText, Image as ImageIcon, Upload, CheckCircle2, Clock, AlertTriangle, Loader2, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import compressImage from '../utils/compressImage';

const POLL_MS = 10000;
const MAX_MB = 5;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp';

const STATUS = {
  requested: { label: 'Upload needed', cls: 'bg-red-50 text-red-700 border-red-200', Icon: AlertTriangle },
  reupload: { label: 'Upload again', cls: 'bg-red-50 text-red-700 border-red-200', Icon: AlertTriangle },
  uploaded: { label: 'In review', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
};

const timeLabel = (d) => {
  const date = new Date(d);
  return new Date().toDateString() === date.toDateString()
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};
const sizeLabel = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// Chat with the counselor plus the document checklist, inside the student dashboard
const StudentMessages = ({ token, onUnreadChange }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  // Before attaching a file in chat the student says what it is, so it gets a proper name
  const [attachOpen, setAttachOpen] = useState(false);
  const [docType, setDocType] = useState('');
  const [docName, setDocName] = useState('');
  const docMetaRef = useRef(null);
  const fileRef = useRef(null);
  const targetDocRef = useRef(null);
  const endRef = useRef(null);

  const api = useCallback((path, opts = {}) => fetch(`${API_BASE_URL}/student-chat${path}`, {
    ...opts,
    credentials: 'include',
    headers: { ...(token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  }), [token]);

  const load = useCallback(async () => {
    try {
      const res = await api('/');
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError('');
      onUnreadChange?.(0);
    } catch {
      setError('Could not load your messages. Check your connection and try again.');
    }
  }, [api, onUnreadChange]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [data?.messages?.length]);

  const send = async (file = null, documentId = null) => {
    const body = text.trim();
    if (!body && !file) return;
    const form = new FormData();
    if (body && !documentId) form.append('text', body);
    if (file) form.append('file', file);
    if (documentId) form.append('documentId', documentId);
    if (file && !documentId && docMetaRef.current) {
      form.append('docType', docMetaRef.current.type);
      if (docMetaRef.current.name) form.append('docName', docMetaRef.current.name);
    }
    documentId ? setUploadingId(documentId) : setSending(true);
    try {
      const res = await api('/messages', { method: 'POST', body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Could not send');
      if (!documentId) setText('');
      if (file && !documentId) {
        setDocType('');
        setDocName('');
        docMetaRef.current = null;
      }
      setError('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
      setUploadingId(null);
    }
  };

  const pick = (documentId = null) => {
    targetDocRef.current = documentId;
    docMetaRef.current = null;
    fileRef.current?.click();
  };

  // Chat attachment: remember the chosen type, then open the file picker
  const chooseChatFile = () => {
    if (!docType) {
      setError('Choose what this document is first');
      return;
    }
    if (docType === 'Other' && !docName.trim()) {
      setError('Type a name for this document');
      return;
    }
    setError('');
    targetDocRef.current = null;
    docMetaRef.current = { type: docType, name: docType === 'Other' ? docName.trim() : '' };
    setAttachOpen(false);
    fileRef.current?.click();
  };

  const onFile = async (e) => {
    const picked = e.target.files[0];
    e.target.value = '';
    if (!picked) return;
    const ready = await compressImage(picked);
    if (ready.size > MAX_MB * 1024 * 1024) {
      setError(`This file is larger than ${MAX_MB} MB. Compress it or send a smaller scan.`);
      return;
    }
    send(ready, targetDocRef.current);
  };

  const openFile = async (docId) => {
    const tab = window.open('', '_blank');
    try {
      const res = await api(`/documents/${docId}/file`);
      const json = await res.json();
      if (!res.ok) throw new Error();
      if (tab) tab.location.replace(json.url);
      else window.location.assign(json.url);
    } catch {
      tab?.close();
      setError('Could not open the file.');
    }
  };

  if (!data && !error) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#DE5C2B]" /></div>;
  }

  const docs = data?.documents || [];
  const todo = docs.filter((d) => d.status === 'requested' || d.status === 'reupload');
  const counselor = data?.counselor;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
      <input ref={fileRef} type="file" accept={ACCEPT} onChange={onFile} className="hidden" />

      {/* Chat */}
      <section className="bg-white border border-slate-200 rounded-3xl flex flex-col h-[70vh] min-h-[460px] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          {counselor?.avatar ? (
            <img src={counselor.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="w-10 h-10 rounded-full bg-orange-50 text-[#C04A1D] flex items-center justify-center font-black">
              {counselor ? counselor.name[0] : <MessageCircle size={18} />}
            </span>
          )}
          <div>
            <p className="font-bold text-slate-900 text-sm">{counselor ? `${counselor.name} · your counselor` : 'UniCoach team'}</p>
            <p className="text-xs text-slate-500">Ask anything about your application. Share documents here.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" aria-live="polite">
          {data?.messages?.length === 0 && (
            <p className="text-center text-sm text-slate-500 mt-10">Say hello to your counselor. Replies usually come within a few hours.</p>
          )}
          {data?.messages?.map((m) => {
            const mine = m.senderType === 'student';
            return (
              <div key={m._id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                {m.kind === 'request' ? (
                  <div className="max-w-[85%] rounded-2xl border border-dashed border-[#DE5C2B] px-4 py-3 text-sm text-slate-800">
                    <p className="font-bold">Please upload these documents</p>
                    <p className="text-slate-600">{m.requestTitles.join(', ')}</p>
                    {m.text && <p className="mt-1">{m.text}</p>}
                  </div>
                ) : m.kind === 'file' && m.document ? (
                  <button type="button" onClick={() => openFile(m.document._id)} className={`max-w-[85%] flex items-center gap-3 rounded-2xl px-4 py-3 text-left border ${mine ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200'}`}>
                    {m.document.file?.mime?.startsWith('image/') ? <ImageIcon size={20} className="text-[#DE5C2B]" /> : <FileText size={20} className="text-[#DE5C2B]" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 truncate">{m.document.title}</span>
                      {m.document.file && <span className="block text-xs text-slate-500">{sizeLabel(m.document.file.size)} · tap to open</span>}
                    </span>
                  </button>
                ) : (
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${mine ? 'bg-[#DE5C2B] text-white' : 'bg-slate-100 text-slate-900'}`}>{m.text}</div>
                )}
                <span className="text-[11px] text-slate-400 mt-1">{mine ? 'You' : m.senderName} · {timeLabel(m.createdAt)}</span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {error && <p className="px-5 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100">{error}</p>}

        {attachOpen && (
          <div className="px-4 pt-3 border-t border-slate-100 bg-[#FAF9F6]">
            <p className="text-xs font-semibold text-slate-700 mb-2">What are you sending?</p>
            <div className="flex flex-wrap gap-1.5">
              {(data?.docTypes || []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocType(t)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold border cursor-pointer ${docType === t ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-slate-700 border-slate-200 hover:border-orange-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {docType === 'Other' && (
              <input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                maxLength={60}
                placeholder="Name this document, e.g. Gap year letter"
                className="mt-2 w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#DE5C2B]"
              />
            )}
            <div className="flex justify-end gap-2 py-3">
              <button type="button" onClick={() => setAttachOpen(false)} className="h-9 px-4 rounded-full text-sm font-semibold text-slate-600 cursor-pointer">Cancel</button>
              <button type="button" onClick={chooseChatFile} className="h-9 px-4 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-sm font-semibold cursor-pointer">Choose file</button>
            </div>
          </div>
        )}

        <form
          className="flex items-end gap-2 px-4 py-3 border-t border-slate-100"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <button type="button" onClick={() => setAttachOpen((v) => !v)} disabled={sending} aria-label="Attach a document" aria-expanded={attachOpen} className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#DE5C2B] hover:border-orange-200 cursor-pointer">
            <Paperclip size={18} />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            maxLength={4000}
            placeholder="Write a message"
            aria-label="Message"
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#DE5C2B] max-h-32"
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Send" className="p-2.5 rounded-xl bg-[#DE5C2B] text-white disabled:opacity-40 cursor-pointer">
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </section>

      {/* Document checklist */}
      <aside className="bg-white border border-slate-200 rounded-3xl p-5 h-fit">
        <h3 className="font-bold text-slate-900">My documents</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {todo.length ? `${todo.length} still needed` : docs.length ? 'Nothing pending right now' : 'Your counselor will ask for documents here.'}
        </p>
        <ul className="space-y-2.5">
          {docs.map((d) => {
            const s = STATUS[d.status];
            const needsUpload = d.status === 'requested' || d.status === 'reupload';
            return (
              <li key={d._id} className="border border-slate-100 rounded-2xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{d.title}</p>
                    {d.from === 'staff' && <p className="text-xs text-slate-500">Shared by UniCoach</p>}
                    {d.status === 'reupload' && d.note && <p className="text-xs text-red-600 mt-0.5">{d.note}</p>}
                  </div>
                  {d.from !== 'staff' && (
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>
                      <s.Icon size={12} /> {s.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  {needsUpload && (
                    <button type="button" onClick={() => pick(d._id)} disabled={uploadingId === d._id} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-[#DE5C2B] cursor-pointer">
                      {uploadingId === d._id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload
                    </button>
                  )}
                  {d.file && (
                    <button type="button" onClick={() => openFile(d._id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:border-orange-200 cursor-pointer">
                      View
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-slate-400 mt-4">PDF or photo, up to {MAX_MB} MB. Photos are compressed before upload. Only you and your UniCoach counselor can see these files.</p>
      </aside>
    </div>
  );
};

export default StudentMessages;
