import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button, Input, Select, Space, message, Row, Col, Modal, Form,
  Popconfirm, Badge, Tooltip, Table, Tabs, Calendar, Upload, Avatar, Progress, Switch
} from 'antd';
import {
  SendOutlined, CalendarOutlined, MessageOutlined, ApiOutlined, BarChartOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, UploadOutlined,
  InstagramOutlined, FacebookOutlined, YoutubeOutlined, LinkedinOutlined,
  TwitterOutlined, RobotOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EyeOutlined, ShareAltOutlined, ThunderboltOutlined, UserOutlined,
  HeartOutlined, GlobalOutlined, WarningOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import API from '../api/axios';

const { Option } = Select;
const { TextArea } = Input;

const ALL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: <InstagramOutlined /> },
  { id: 'facebook', name: 'Facebook', icon: <FacebookOutlined /> },
  { id: 'youtube', name: 'YouTube', icon: <YoutubeOutlined /> },
  { id: 'linkedin', name: 'LinkedIn', icon: <LinkedinOutlined /> },
  { id: 'twitter', name: 'Twitter (X)', icon: <TwitterOutlined /> },
  { id: 'telegram', name: 'Telegram', icon: <SendOutlined /> },
  { id: 'quora', name: 'Quora', icon: <ShareAltOutlined /> }
];

const SocialMediaManagement = () => {
  const location = useLocation();

  // Determine active tab based on current URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/inbox')) return 'inbox';
    if (path.includes('/accounts')) return 'accounts';
    if (path.includes('/analytics')) return 'analytics';
    return 'publisher';
  };

  const activeTab = getTabFromPath();

  // Data states
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Publisher State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'facebook', 'linkedin', 'telegram']);
  const [previewPlatform, setPreviewPlatform] = useState('instagram');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishing, setPublishing] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTargetPlatform, setAiTargetPlatform] = useState('instagram');
  const [aiTone, setAiTone] = useState('enthusiastic');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Inbox Reply State
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [inboxFilterPlatform, setInboxFilterPlatform] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, postRes, commRes, anaRes] = await Promise.all([
        API.get('/admin/social/accounts'),
        API.get('/admin/social/posts'),
        API.get('/admin/social/comments'),
        API.get('/admin/social/analytics')
      ]);
      setAccounts(accRes.data);
      setPosts(postRes.data);
      setComments(commRes.data);
      setAnalytics(anaRes.data);
    } catch {
      message.error('Failed to load social media management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Platform selection toggles
  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) {
        message.warning('At least one platform must be selected!');
        return;
      }
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const selectAllPlatforms = () => {
    if (selectedPlatforms.length === ALL_PLATFORMS.length) {
      setSelectedPlatforms(['instagram']);
    } else {
      setSelectedPlatforms(ALL_PLATFORMS.map(p => p.id));
    }
  };

  // Media upload handler
  const handleMediaUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMediaUrls(prev => [...prev, res.data.url]);
      message.success('Media uploaded successfully!');
    } catch {
      message.error('Media upload failed');
    }
  };

  // Publish / Schedule Handler
  const handlePublishPost = async () => {
    if (!postContent.trim()) {
      message.error('Please enter post content or generate with AI!');
      return;
    }
    if (selectedPlatforms.length === 0) {
      message.error('Please select at least one platform!');
      return;
    }
    if (isScheduling && !scheduledDate) {
      message.error('Please pick a date and time for scheduling!');
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: postTitle || 'Social Post',
        content: postContent,
        mediaUrls,
        platforms: selectedPlatforms,
        status: isScheduling ? 'scheduled' : 'published',
        scheduledAt: isScheduling ? scheduledDate : null
      };

      const res = await API.post('/admin/social/posts', payload);
      message.success(res.data.message || 'Action completed successfully!');
      
      // Reset form
      setPostTitle('');
      setPostContent('');
      setMediaUrls([]);
      setIsScheduling(false);
      setScheduledDate('');

      fetchData();
    } catch {
      message.error('Failed to process post action');
    } finally {
      setPublishing(false);
    }
  };

  // AI Generator Handler
  const handleGenerateAiCaption = async () => {
    if (!aiPrompt.trim()) {
      message.error('Please enter a topic or prompt for AI!');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await API.post('/admin/social/ai-caption', {
        prompt: aiPrompt,
        platform: aiTargetPlatform,
        tone: aiTone
      });

      setPostContent(res.data.caption);
      message.success(`AI Caption generated for ${res.data.platform.toUpperCase()} (${res.data.characterCount} chars)!`);
      setAiModalOpen(false);
      setAiPrompt('');
    } catch {
      message.error('Failed to generate AI caption');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Inline Reply Handler
  const handleSendReply = async () => {
    if (!selectedComment || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await API.post(`/admin/social/comments/${selectedComment._id}/reply`, { replyText });
      message.success(`Reply posted to ${selectedComment.platform.toUpperCase()}!`);
      setSelectedComment(null);
      setReplyText('');
      fetchData();
    } catch {
      message.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Account Connection Toggle
  const handleToggleAccount = async (platform, currentConnected) => {
    try {
      await API.post('/admin/social/accounts/toggle', { platform, connected: !currentConnected });
      message.success(`${platform.toUpperCase()} account status updated!`);
      fetchData();
    } catch {
      message.error('Failed to update account status');
    }
  };

  // Calendar Cell Renderer
  const dateCellRender = (value) => {
    if (!value || !value.format) return null;
    const cellDateStr = value.format('YYYY-MM-DD');

    const dayPosts = posts.filter(p => {
      const targetDate = p.status === 'scheduled' ? p.scheduledAt : p.publishedAt;
      if (!targetDate) return false;
      const d = new Date(targetDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}` === cellDateStr;
    });

    if (dayPosts.length === 0) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dayPosts.map(post => (
          <div
            key={post._id}
            style={{
              fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
              background: post.status === 'published' ? '#e8f6ec' : '#fef3c7',
              color: post.status === 'published' ? '#15803d' : '#b45309',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
          >
            {post.status === 'published' ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {post.title || post.content.slice(0, 15)}
          </div>
        ))}
      </div>
    );
  };

  const filteredComments = comments.filter(c => {
    if (inboxFilterPlatform === 'all') return true;
    return c.platform === inboxFilterPlatform;
  });

  return (
    <div>
      <Header
        title="Social media"
        subtitle="Multi-platform publisher, AI caption assistant, content calendar and unified social inbox"
        extra={
          <Button
            type="primary"
            className="nx-btn--accent"
            icon={<RobotOutlined />}
            onClick={() => setAiModalOpen(true)}
          >
            AI caption assistant
          </Button>
        }
      />

      <div className="dashboard-content">

        {/* ── TAB 1: 1-CLICK PUBLISHER ── */}
        {activeTab === 'publisher' && (
          <Row gutter={[16, 16]}>
            {/* Left Column: Post Creator */}
            <Col xs={24} lg={14}>
              <div className="nx-card p-5 sm:p-6">
                <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
                  <span className="nx-icon-circle"><EditOutlined /></span>
                  <span className="nx-section-title">Multi-channel post creator</span>
                </div>
                
                {/* Channel Selectors */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <label className="nx-label">Target platforms <span className="nx-muted" style={{ fontWeight: 500 }}>· one-click broadcast</span></label>
                    <Button size="small" type="link" onClick={selectAllPlatforms}>
                      {selectedPlatforms.length === ALL_PLATFORMS.length ? 'Deselect all' : 'Select all channels'}
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ALL_PLATFORMS.map(p => {
                      const isSelected = selectedPlatforms.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePlatform(p.id)}
                          className={`nx-tab ${isSelected ? 'nx-tab--active' : ''}`}
                          style={{ height: 38, padding: '0 14px', fontSize: 13, cursor: 'pointer' }}
                        >
                          {p.icon} {p.name}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Post Title & Text Box */}
                <div style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="Post Headline / Title (optional)"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />

                  <div style={{ position: 'relative' }}>
                    <TextArea
                      rows={5}
                      placeholder="Write your post caption here or click 'AI Generate Caption'..."
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      style={{ padding: 14, fontSize: 14 }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: 'var(--ux-text-3)' }}>
                      <span>Character count: {postContent.length}</span>
                      {selectedPlatforms.includes('twitter') && postContent.length > 280 && (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}><WarningOutlined /> Exceeds Twitter 280 character limit</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Uploader */}
                <div style={{ marginBottom: 20 }}>
                  <label className="nx-label" style={{ display: 'block', marginBottom: 8 }}>Media attachments (images / videos)</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Upload showUploadList={false} customRequest={({ file }) => handleMediaUpload(file)}>
                      <Button icon={<UploadOutlined />}>
                        Upload photo/video
                      </Button>
                    </Upload>

                    {mediaUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={url} alt="Attached" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--ux-line)' }} />
                        <span
                          onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', width: 18, height: 18, borderRadius: '50%', textAlign: 'center', fontSize: 10, cursor: 'pointer', lineHeight: '18px', boxShadow: '0 0 0 2px #fff' }}
                        >✕</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule Option Toggle */}
                <div style={{ padding: 16, background: 'var(--ux-surface-2)', borderRadius: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>Schedule for future publishing</span>
                      <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>Post will automatically broadcast at your set time</div>
                    </div>
                    <Switch checked={isScheduling} onChange={setIsScheduling} />
                  </div>

                  {isScheduling && (
                    <div style={{ marginTop: 12 }}>
                      <Input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    type="primary"
                    size="large"
                    loading={publishing}
                    onClick={handlePublishPost}
                    icon={isScheduling ? <CalendarOutlined /> : <SendOutlined />}
                    style={{ flex: 1 }}
                  >
                    {isScheduling ? 'Schedule post' : `Publish to ${selectedPlatforms.length} channels`}
                  </Button>
                </div>
              </div>
            </Col>

            {/* Right Column: Live Device Mockup Preview */}
            <Col xs={24} lg={10}>
              <div className="nx-card p-5 sm:p-6">
                <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                  <span className="nx-icon-circle"><EyeOutlined /></span>
                  <span className="nx-section-title">Live device preview</span>
                </div>
                
                {/* Preview Platform Switcher */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                  {ALL_PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreviewPlatform(p.id)}
                      className={`nx-tab ${previewPlatform === p.id ? 'nx-tab--active' : ''}`}
                      style={{ height: 34, padding: '0 12px', fontSize: 12 }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Smartphone Device Frame */}
                <div style={{ border: '1px solid var(--ux-line)', borderRadius: 24, padding: 16, background: '#ffffff' }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar src="https://api.dicebear.com/7.x/bottts/svg?seed=UniCoach" size="large" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)' }}>UniCoach Official</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)' }}>Sponsored • Just now</div>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div style={{ fontSize: 13, color: 'var(--ux-text)', whiteSpace: 'pre-wrap', marginBottom: 12, lineHeight: 1.5 }}>
                    {postContent || 'Your post preview will appear here in real-time as you type or generate AI captions...'}
                  </div>

                  {/* Media Preview */}
                  {mediaUrls.length > 0 && (
                    <img src={mediaUrls[0]} alt="Post Media" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: 12 }} />
                  )}

                  {/* Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--ux-line-2)', paddingTop: 10, fontSize: 12, color: 'var(--ux-text-2)', fontWeight: 500 }}>
                    <span><HeartOutlined /> 1.2k likes</span>
                    <span><MessageOutlined /> 84 comments</span>
                    <span><ShareAltOutlined /> Share</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* ── TAB 2: CONTENT CALENDAR ── */}
        {activeTab === 'calendar' && (
          <div className="nx-card p-4 sm:p-5" style={{ overflowX: 'auto' }}>
            <Calendar dateCellRender={dateCellRender} />
          </div>
        )}

        {/* ── TAB 3: UNIFIED SOCIAL INBOX ── */}
        {activeTab === 'inbox' && (
          <div>
            {/* ── Social Platform Box Cards Row ── */}
            <div style={{ marginBottom: 20 }}>
              <label className="nx-label" style={{ display: 'block', marginBottom: 10 }}>
                Choose a platform
              </label>

              <Row gutter={[12, 12]}>
                {/* All Channels Box */}
                <Col xs={12} sm={6} md={3}>
                  <div
                    onClick={() => setInboxFilterPlatform('all')}
                    className={`nx-card ${inboxFilterPlatform === 'all' ? 'nx-card--dark' : ''}`}
                    style={{
                      padding: 14, cursor: 'pointer', textAlign: 'center', height: '100%',
                      color: inboxFilterPlatform === 'all' ? '#ffffff' : 'var(--ux-ink)',
                      transition: 'background 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    <span className="nx-icon-circle" style={{ margin: '0 auto', ...(inboxFilterPlatform === 'all' ? { background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: '#fff' } : {}) }}><GlobalOutlined /></span>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8 }}>All inbox</div>
                    <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2 }}>{comments.length} total</div>
                  </div>
                </Col>

                {/* 7 Platform Box Cards */}
                {ALL_PLATFORMS.map(p => {
                  const count = comments.filter(c => c.platform === p.id).length;
                  const isSelected = inboxFilterPlatform === p.id;
                  return (
                    <Col xs={12} sm={6} md={3} key={p.id}>
                      <div
                        onClick={() => setInboxFilterPlatform(p.id)}
                        className={`nx-card ${isSelected ? 'nx-card--dark' : ''}`}
                        style={{
                          padding: 14, cursor: 'pointer', textAlign: 'center', height: '100%',
                          color: isSelected ? '#ffffff' : 'var(--ux-ink)',
                          transition: 'background 0.2s ease, border-color 0.2s ease'
                        }}
                      >
                        <span className="nx-icon-circle" style={{ margin: '0 auto', ...(isSelected ? { background: 'rgba(255,255,255,0.1)', borderColor: 'transparent', color: '#fff' } : {}) }}>{p.icon}</span>
                        <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2 }}>{count} comments</div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* Inbox List & Reply Area */}
            <Row gutter={[16, 16]}>
              {/* Comment Feed */}
              <Col xs={24} lg={12}>
                <div className="nx-card p-5 sm:p-6">
                  <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                    <span className="nx-icon-circle"><MessageOutlined /></span>
                    <span className="nx-section-title">
                      Incoming comments <span className="nx-muted" style={{ fontWeight: 500 }}>· {inboxFilterPlatform === 'all' ? 'All channels' : (ALL_PLATFORMS.find(p => p.id === inboxFilterPlatform)?.name || inboxFilterPlatform)}</span>
                    </span>
                  </div>
                  {filteredComments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--ux-text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span className="nx-icon-circle" style={{ marginBottom: 8 }}><MessageOutlined /></span>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ux-ink)' }}>No comments received yet for {inboxFilterPlatform === 'all' ? 'all channels' : (ALL_PLATFORMS.find(p => p.id === inboxFilterPlatform)?.name || inboxFilterPlatform)}</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>When real users comment on your social media posts, they will appear here in real-time.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
                      {filteredComments.map(c => {
                        const platObj = ALL_PLATFORMS.find(p => p.id === c.platform);
                        return (
                          <div
                            key={c._id}
                            onClick={() => setSelectedComment(c)}
                            style={{
                              padding: 14, borderRadius: 16, cursor: 'pointer',
                              background: selectedComment?._id === c._id ? '#ffffff' : 'var(--ux-surface-2)',
                              border: `1px solid ${selectedComment?._id === c._id ? 'var(--ux-ink)' : 'var(--ux-line-2)'}`,
                              transition: 'background 0.15s ease, border-color 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <Avatar src={c.authorAvatar} size="small" icon={<UserOutlined />} />
                                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ux-ink)' }}>{c.authorName}</span>
                                <span className="nx-status nx-status--neutral">{platObj?.icon} {platObj?.name || c.platform}</span>
                              </div>
                              <span className={`nx-status ${c.status === 'replied' ? 'nx-status--success' : 'nx-status--accent'}`}>
                                {c.status === 'replied' ? 'Replied' : 'New'}
                              </span>
                            </div>

                            <div style={{ fontSize: 11.5, color: 'var(--ux-text-3)', fontWeight: 500, marginBottom: 4 }}>Post: {c.postTitle}</div>
                            <div style={{ fontSize: 13, color: 'var(--ux-text)' }}>"{c.commentText}"</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Col>

              {/* Direct Inline Reply Composer */}
              <Col xs={24} lg={12}>
                <div className="nx-card p-5 sm:p-6">
                  <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                    <span className="nx-icon-circle"><SendOutlined /></span>
                    <span className="nx-section-title">Direct reply</span>
                  </div>
                  {selectedComment ? (
                    <div>
                      <div style={{ padding: 16, background: 'var(--ux-surface-2)', borderRadius: 16, marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>Replying to {selectedComment.authorName} on {ALL_PLATFORMS.find(p => p.id === selectedComment.platform)?.name || selectedComment.platform}</div>
                        <div style={{ fontSize: 13, color: 'var(--ux-text-2)', marginTop: 4 }}>"{selectedComment.commentText}"</div>
                      </div>

                      {selectedComment.replies?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <label className="nx-label">Previous replies</label>
                          {selectedComment.replies.map((r, idx) => (
                            <div key={idx} style={{ padding: '10px 14px', background: '#ffffff', borderRadius: 14, marginTop: 6, border: '1px solid var(--ux-line-2)', fontSize: 12.5, color: 'var(--ux-text)' }}>
                              <strong style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{r.repliedBy}:</strong> {r.replyText}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginBottom: 16 }}>
                        <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Your response</label>
                        <TextArea
                          rows={4}
                          placeholder="Write direct response to comment..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                        />
                      </div>

                      <Button
                        type="primary" size="large" block
                        loading={sendingReply}
                        onClick={handleSendReply}
                        icon={<SendOutlined />}
                      >
                        Post reply to {ALL_PLATFORMS.find(p => p.id === selectedComment.platform)?.name || selectedComment.platform}
                      </Button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ux-text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span className="nx-icon-circle"><MessageOutlined /></span>
                      <div>Select a comment from the list to view details and send a direct reply</div>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* ── TAB 4: CONNECTED CHANNELS ── */}
        {activeTab === 'accounts' && (
          <Row gutter={[16, 16]}>
            {accounts.map(acc => {
              const platObj = ALL_PLATFORMS.find(p => p.id === acc.platform);
              return (
                <Col xs={24} sm={12} md={8} key={acc._id}>
                  <div className="nx-card p-5 h-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span className="nx-icon-circle">{platObj?.icon || <ShareAltOutlined />}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ux-ink)' }}>{acc.accountName}</div>
                          <div style={{ fontSize: 12, color: 'var(--ux-text-3)' }}>{acc.handle}</div>
                        </div>
                      </div>
                      <Switch checked={acc.connected} onChange={() => handleToggleAccount(acc.platform, acc.connected)} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ux-line-2)', paddingTop: 12, fontSize: 12 }}>
                      <span style={{ color: 'var(--ux-text-2)' }}>Status</span>
                      <span className={`nx-status ${acc.connected ? 'nx-status--success' : 'nx-status--neutral'}`}>{acc.connected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}

        {/* ── TAB 5: PERFORMANCE ANALYTICS ── */}
        {activeTab === 'analytics' && analytics && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={12} sm={6}>
                <div className="nx-card p-5 h-full">
                  <span className="nx-icon-circle"><SendOutlined /></span>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', fontWeight: 500, marginTop: 14 }}>Published posts</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ux-ink)', marginTop: 2 }}>
                    {posts.filter(p => p.status === 'published').length}
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="nx-card p-5 h-full">
                  <span className="nx-icon-circle"><HeartOutlined /></span>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', fontWeight: 500, marginTop: 14 }}>Total likes</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ux-ink)', marginTop: 2 }}>
                    {analytics.totalLikes.toLocaleString()}
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="nx-card p-5 h-full">
                  <span className="nx-icon-circle"><ShareAltOutlined /></span>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', fontWeight: 500, marginTop: 14 }}>Total shares</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ux-ink)', marginTop: 2 }}>
                    {analytics.totalShares.toLocaleString()}
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="nx-card p-5 h-full">
                  <span className="nx-icon-circle"><EyeOutlined /></span>
                  <div style={{ fontSize: 13, color: 'var(--ux-text-2)', fontWeight: 500, marginTop: 14 }}>Total impressions</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ux-ink)', marginTop: 2 }}>
                    {analytics.totalViews.toLocaleString()}
                  </div>
                </div>
              </Col>
            </Row>

            <div className="nx-card p-5 sm:p-6">
              <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                <span className="nx-icon-circle"><BarChartOutlined /></span>
                <span className="nx-section-title">Top performing posts</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
              <Table
                rowKey="_id"
                dataSource={analytics.topPosts}
                pagination={false}
                columns={[
                  { title: 'Post title', dataIndex: 'title', key: 'title', render: (t, r) => <strong style={{ fontWeight: 600, color: 'var(--ux-ink)' }}>{t || r.content.slice(0, 30)}</strong> },
                  { title: 'Channels', dataIndex: 'platforms', key: 'platforms', render: (p) => <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.map(id => <span key={id} className="nx-status nx-status--neutral">{id}</span>)}</div> },
                  { title: 'Likes', dataIndex: ['metrics', 'likes'], key: 'likes' },
                  { title: 'Shares', dataIndex: ['metrics', 'shares'], key: 'shares' },
                  { title: 'Views', dataIndex: ['metrics', 'views'], key: 'views' }
                ]}
              />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── AI CAPTION ASSISTANT MODAL ── */}
      <Modal
        title="AI caption & hashtag assistant"
        open={aiModalOpen}
        onCancel={() => setAiModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Topic / prompt</label>
            <Input
              placeholder="e.g. Rhodes Scholarship 2026 application tips for Indian students"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Target platform</label>
              <Select value={aiTargetPlatform} onChange={setAiTargetPlatform} style={{ width: '100%' }}>
                {ALL_PLATFORMS.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
              </Select>
            </div>
            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>Tone of voice</label>
              <Select value={aiTone} onChange={setAiTone} style={{ width: '100%' }}>
                <Option value="enthusiastic">Enthusiastic</Option>
                <Option value="professional">Professional</Option>
                <Option value="urgent">Urgent / deadline</Option>
                <Option value="educational">Educational</Option>
              </Select>
            </div>
          </div>

          <Button
            type="primary" size="large"
            className="nx-btn--accent"
            loading={generatingAi}
            onClick={handleGenerateAiCaption}
            icon={<RobotOutlined />}
            style={{ marginTop: 6 }}
          >
            Generate caption & fill editor
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SocialMediaManagement;
