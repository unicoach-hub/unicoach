import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Empty, Spin, message, Modal, Select, Tooltip, Badge } from 'antd';
import { SearchOutlined, SendOutlined, WhatsAppOutlined, FileTextOutlined, PlusOutlined, ClockCircleOutlined, CheckOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

// WhatsApp Inbox: student conversations on the left, the chat on the right, reply box at the bottom.
// Free text is allowed for 24 hours after the student's last message; after that only an approved template.
const POLL_MS = 8000;

const timeLabel = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const Ticks = ({ status, error }) => {
  if (status === 'failed') return <Tooltip title={error || 'Not delivered'}><ExclamationCircleOutlined style={{ color: '#dc2626' }} /></Tooltip>;
  const color = status === 'read' ? '#38bdf8' : '#94a3b8';
  if (status === 'delivered' || status === 'read') {
    return <span style={{ color, letterSpacing: -6, marginRight: 4 }}><CheckOutlined /><CheckOutlined /></span>;
  }
  return <CheckOutlined style={{ color }} />;
};

const WhatsappInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null); // phone
  const [chat, setChat] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templatePick, setTemplatePick] = useState(null);
  const [templateParams, setTemplateParams] = useState([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const bottomRef = useRef(null);

  const loadList = async () => {
    try {
      const { data } = await API.get('/admin/whatsapp/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      /* keep the last list */
    } finally {
      setLoadingList(false);
    }
  };

  const loadChat = async (phone, quiet = false) => {
    if (!phone) return;
    if (!quiet) setLoadingChat(true);
    try {
      const { data } = await API.get(`/admin/whatsapp/conversations/${encodeURIComponent(phone)}`);
      setChat(data);
    } catch {
      if (!quiet) message.error('Could not load the chat');
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    API.get('/admin/whatsapp/status').then(({ data }) => setConnected(!!data.connected)).catch(() => {});
    API.get('/admin/whatsapp/templates').then(({ data }) => setTemplates(Array.isArray(data) ? data : [])).catch(() => {});
    loadList();
    const t = setInterval(loadList, POLL_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    loadChat(active);
    const t = setInterval(() => loadChat(active, true), POLL_MS);
    return () => clearInterval(t);
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages?.length, active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.phone.includes(q.replace(/\D/g, '') || '\u0000') || (c.name || '').toLowerCase().includes(q));
  }, [conversations, search]);

  const openChat = (phone) => {
    setActive(phone);
    setChat(null);
    setDraft('');
    setConversations((list) => list.map((c) => (c.phone === phone ? { ...c, unread: 0 } : c)));
  };

  const sendText = async () => {
    const text = draft.trim();
    if (!text || !active) return;
    setSending(true);
    try {
      await API.post(`/admin/whatsapp/conversations/${encodeURIComponent(active)}/send`, { text });
      setDraft('');
      await loadChat(active, true);
      loadList();
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 'WINDOW_CLOSED') {
        message.warning(data.message, 6);
        setTemplateOpen(true);
      } else {
        message.error(data?.message || 'Not sent', 6);
      }
    } finally {
      setSending(false);
    }
  };

  const pickTemplate = (name) => {
    const t = templates.find((x) => `${x.name}|${x.language}` === name);
    setTemplatePick(t || null);
    const leadName = chat?.lead?.name || chat?.name || '';
    setTemplateParams(Array.from({ length: t?.paramCount || 0 }, (_, i) => (i === 0 ? leadName : '')));
  };

  const templatePreview = templatePick
    ? templatePick.body.replace(/\{\{(\d+)\}\}/g, (_, n) => templateParams[Number(n) - 1] || `{{${n}}}`)
    : '';

  const sendTemplate = async () => {
    const phone = active || newPhone;
    if (!templatePick || !phone) return;
    setSending(true);
    try {
      await API.post(`/admin/whatsapp/conversations/${encodeURIComponent(phone)}/send`, {
        template: { name: templatePick.name, language: templatePick.language, params: templateParams, preview: templatePreview },
      });
      message.success('Template sent');
      setTemplateOpen(false);
      setTemplatePick(null);
      if (!active) setActive(phone.replace(/\D/g, '').length === 10 ? `91${phone.replace(/\D/g, '')}` : phone.replace(/\D/g, ''));
      else loadChat(active, true);
      loadList();
    } catch (err) {
      message.error(err.response?.data?.message || 'Not sent', 6);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    const d = newPhone.replace(/\D/g, '');
    if (d.length < 10) {
      message.warning('Enter a valid number');
      return;
    }
    setNewChatOpen(false);
    setActive(null);
    setChat(null);
    setTemplateOpen(true);
  };

  const windowNote = chat && !chat.windowOpen;

  return (
    <div>
      <Header title="WhatsApp Inbox" subtitle="Chat with students on your WhatsApp Business number" />
      <div className="dashboard-content" style={{ marginTop: 16 }}>
        {!connected && (
          <div className="nx-card" style={{ padding: '12px 16px', marginBottom: 12, background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 13.5 }}>
            WhatsApp is not connected yet. <Link to="/settings">Connect it in Settings → WhatsApp Business</Link>; until then nothing can be sent.
          </div>
        )}

        <div className="nx-card wa-inbox" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', height: 'calc(100vh - 210px)', minHeight: 520, overflow: 'hidden', padding: 0 }}>
          {/* Conversation list */}
          <div style={{ borderRight: '1px solid var(--ux-line-2)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: 12, display: 'flex', gap: 8, borderBottom: '1px solid var(--ux-line-2)' }}>
              <Input prefix={<SearchOutlined style={{ color: 'var(--ux-text-3)' }} />} placeholder="Search name or number" value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
              <Tooltip title="New chat (template)"><Button icon={<PlusOutlined />} onClick={() => { setNewPhone(''); setNewChatOpen(true); }} disabled={!connected} /></Tooltip>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingList ? (
                <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
              ) : filtered.length === 0 ? (
                <Empty style={{ marginTop: 60 }} description={search ? 'No match' : 'No WhatsApp conversations yet'} />
              ) : filtered.map((c) => (
                <button
                  key={c.phone}
                  type="button"
                  onClick={() => openChat(c.phone)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px',
                    border: 'none', borderBottom: '1px solid var(--ux-line-2)', cursor: 'pointer',
                    background: active === c.phone ? 'var(--ux-surface-2)' : 'transparent',
                  }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {(c.name || '#').charAt(0).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ux-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || `+${c.phone}`}</span>
                      <span style={{ fontSize: 11.5, color: c.unread ? '#16a34a' : 'var(--ux-text-3)', flexShrink: 0 }}>{timeLabel(c.lastAt)}</span>
                    </span>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--ux-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.lastDirection === 'out' ? 'You: ' : ''}{c.lastText}
                      </span>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                        {c.needsAgent && <span className="nx-status nx-status--danger" style={{ height: 18, fontSize: 10.5, padding: '0 6px' }}>Agent needed</span>}
                        {c.unread > 0 && <Badge count={c.unread} style={{ background: '#16a34a' }} />}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#efeae2' }}>
            {!active ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ux-text-2)', gap: 8 }}>
                <WhatsAppOutlined style={{ fontSize: 46, color: '#16a34a' }} />
                <div>Choose a conversation, or start a new one with +</div>
              </div>
            ) : (
              <>
                <div style={{ padding: '12px 16px', background: 'var(--ux-surface, #fff)', borderBottom: '1px solid var(--ux-line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ux-ink)' }}>{chat?.name || `+${active}`}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ux-text-2)' }}>
                      +{active}
                      {chat?.lead && <> · {chat.lead.dreamCountry} · {chat.lead.preferredIntake} · <Link to="/leads"><UserOutlined /> Lead</Link></>}
                    </div>
                  </div>
                  {chat && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {chat.needsAgent && <span className="nx-status nx-status--danger">Student asked for a person</span>}
                      <Tooltip title={chat.botPausedUntil ? 'The chatbot is quiet in this chat (you are replying). Hand it back to the bot.' : 'Stop the chatbot in this chat for 24 hours'}>
                        <Button size="small" onClick={async () => {
                          await API.post(`/admin/whatsapp/conversations/${encodeURIComponent(active)}/bot`, { paused: !chat.botPausedUntil }).catch(() => message.error('Could not update'));
                          loadChat(active, true);
                          loadList();
                        }}>{chat.botPausedUntil ? 'Resume bot' : 'Pause bot'}</Button>
                      </Tooltip>
                    <span style={{ fontSize: 12, color: chat.windowOpen ? '#15803d' : '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ClockCircleOutlined />
                      {chat.windowOpen ? `Reply window open till ${timeLabel(chat.windowEndsAt)}` : 'Reply window closed: template only'}
                    </span>
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {loadingChat && !chat ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (chat?.messages || []).map((m) => (
                    <div key={m.id} style={{ alignSelf: m.direction === 'out' ? 'flex-end' : 'flex-start', maxWidth: '72%' }}>
                      <div style={{
                        background: m.direction === 'out' ? '#d9fdd3' : '#fff', padding: '7px 10px 5px', borderRadius: 10,
                        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14, color: '#111b21',
                      }}>
                        {m.template && <div style={{ fontSize: 11.5, color: '#667781', marginBottom: 3 }}><FileTextOutlined /> Template: {m.template}</div>}
                        {m.text || (m.template ? '' : '…')}
                        <div style={{ fontSize: 11, color: '#667781', textAlign: 'right', marginTop: 2, display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
                          {m.direction === 'out' && m.sentBy && <span>{m.sentBy} ·</span>}
                          {timeLabel(m.at)}
                          {m.direction === 'out' && <Ticks status={m.status} error={m.error} />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div style={{ padding: 12, background: 'var(--ux-surface-2, #f0f2f5)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Tooltip title="Send an approved template">
                    <Button icon={<FileTextOutlined />} onClick={() => setTemplateOpen(true)} disabled={!connected} />
                  </Tooltip>
                  <Input.TextArea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendText(); } }}
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    placeholder={windowNote ? 'Over 24 hours since their last message: send a template' : 'Type a message (Enter to send, Shift+Enter for a new line)'}
                    disabled={!connected || windowNote || chat?.lead?.whatsappOptOut}
                  />
                  <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={sendText} disabled={!draft.trim() || !connected || windowNote} style={{ background: '#16a34a', borderColor: '#16a34a' }} />
                </div>
                {chat?.lead?.whatsappOptOut && <div style={{ padding: '6px 14px', fontSize: 12.5, background: '#fef2f2', color: '#991b1b' }}>This student replied STOP. WhatsApp messages to them are off.</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New chat: number first, then a template */}
      <Modal title="New WhatsApp chat" open={newChatOpen} onCancel={() => setNewChatOpen(false)} onOk={startNewChat} okText="Next: choose template">
        <p style={{ fontSize: 13, color: 'var(--ux-text-2)' }}>A new conversation has to start with an approved template.</p>
        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Number with country code, e.g. 919876543210" />
      </Modal>

      <Modal
        title="Send a template"
        open={templateOpen}
        onCancel={() => { setTemplateOpen(false); setTemplatePick(null); }}
        onOk={sendTemplate}
        okText="Send"
        confirmLoading={sending}
        okButtonProps={{ disabled: !templatePick || templateParams.some((p) => !p.trim()) }}
      >
        {templates.length === 0 ? (
          <p style={{ color: 'var(--ux-text-2)' }}>No approved templates yet. Create them in Meta (WhatsApp Manager → Message templates); once approved they show up here.</p>
        ) : (
          <>
            <Select
              style={{ width: '100%' }}
              placeholder="Choose a template"
              value={templatePick ? `${templatePick.name}|${templatePick.language}` : undefined}
              onChange={pickTemplate}
              options={templates.map((t) => ({ value: `${t.name}|${t.language}`, label: `${t.name} (${t.language})` }))}
            />
            {templatePick && (
              <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                {templateParams.map((p, i) => (
                  <Input key={i} addonBefore={`{{${i + 1}}}`} value={p} onChange={(e) => setTemplateParams((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))} />
                ))}
                <div style={{ background: '#d9fdd3', padding: '8px 10px', borderRadius: 10, whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{templatePreview}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default WhatsappInbox;
