import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Switch, Spin, Select, DatePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import Header from '../components/Header';
import BlockBuilder from '../components/BlockBuilder';
import API from '../api/axios';
import { CalendarOutlined, GlobalOutlined, PictureOutlined, UploadOutlined, DeleteOutlined, EnvironmentOutlined, ClockCircleOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';

// Speaker social links on the event detail page (the API keeps http(s) links only)
const SPEAKER_LINK_FIELDS = [
  { key: 'linkedin', label: 'Speaker LinkedIn', placeholder: 'https://www.linkedin.com/in/...' },
  { key: 'instagram', label: 'Speaker Instagram', placeholder: 'https://www.instagram.com/...' },
  { key: 'twitter', label: 'Speaker X / Twitter', placeholder: 'https://x.com/...' },
  { key: 'youtube', label: 'Speaker YouTube', placeholder: 'https://www.youtube.com/@...' },
  { key: 'website', label: 'Speaker Website', placeholder: 'https://...' },
];
const EMPTY_SPEAKER_LINKS = Object.fromEntries(SPEAKER_LINK_FIELDS.map(({ key }) => [key, '']));

// Countries the homepage event card knows a flag for ('' = let the site guess from the title)
const COUNTRY_OPTIONS = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'France', 'Netherlands', 'Italy', 'New Zealand', 'Singapore', 'Dubai', 'Europe', 'Global'];
const DEFAULT_CTA_LABEL = 'Claim Free VIP Seat';

const helperTextStyle = { fontSize: '12px', lineHeight: 1.5, color: 'var(--ux-text-3)', margin: 0 };

const EventForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSpeaker, setUploadingSpeaker] = useState(false);
  const coverInputRef = useRef(null);
  const speakerInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', body: '', sections: [], imageUrl: '', slug: '', location: '', eventStart: '', eventEnd: '',
    registrationLink: '', joiningLink: '', description: '', category: 'webinar', speaker: '', tags: '',
    metaTitle: '', metaDescription: '', published: false, publishDate: null,
    // Homepage card controls
    country: '', speakerRole: '', speakerPhoto: '', ctaLabel: '', showOnHomepage: true, homepageOrder: null,
    // Event detail page (/events/:slug): host bio + social links, audience (one per line)
    speakerBio: '', speakerLinks: { ...EMPTY_SPEAKER_LINKS }, whoShouldAttend: '',
  });

  useEffect(() => {
    if (isEdit) {
      API.get(`/admin/content/${id}`).then(({ data }) => {
        setForm({
          title: data.title || '',
          body: data.body || '',
          sections: data.sections || [],
          imageUrl: data.imageUrl || '',
          slug: data.slug || '',
          location: data.location || '',
          // The API sends UTC; the datetime-local input (and the save below) work in the admin's local time
          eventStart: data.eventStart ? dayjs(data.eventStart).format('YYYY-MM-DDTHH:mm') : '',
          eventEnd: data.eventEnd ? dayjs(data.eventEnd).format('YYYY-MM-DDTHH:mm') : '',
          registrationLink: data.registrationLink || '',
          joiningLink: data.joiningLink || '',
          description: data.description || '',
          category: data.category || 'webinar',
          speaker: data.speaker || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          published: data.published || false,
          publishDate: data.publishDate || null,
          country: data.country || '',
          speakerRole: data.speakerRole || '',
          speakerPhoto: data.speakerPhoto || '',
          ctaLabel: data.ctaLabel || '',
          showOnHomepage: data.showOnHomepage !== false,
          homepageOrder: typeof data.homepageOrder === 'number' ? data.homepageOrder : null,
          speakerBio: data.speakerBio || '',
          speakerLinks: { ...EMPTY_SPEAKER_LINKS, ...(data.speakerLinks || {}) },
          whoShouldAttend: Array.isArray(data.whoShouldAttend) ? data.whoShouldAttend.join('\n') : '',
        });
      }).catch(() => message.error('Failed to load event'));
    }
  }, [id, isEdit]);

  // Helper to format URLs to be absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API.defaults.baseURL.replace('/api', '');
    return `${base}${url}`;
  };

  // Uploads an image through /admin/upload and stores the returned URL in the given form field
  const uploadImage = async (e, field, setUploading, label) => {
    const file = e.target.files[0];
    // Reset so picking the same file again still fires onChange
    e.target.value = '';
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const { data } = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, [field]: data.url }));
      message.success(`${label} uploaded!`);
    } catch (err) {
      message.error(err.response?.data?.message || `Failed to upload ${label.toLowerCase()}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = (e) => uploadImage(e, 'imageUrl', setUploadingCover, 'Cover image');
  const handleSpeakerUpload = (e) => uploadImage(e, 'speakerPhoto', setUploadingSpeaker, 'Speaker photo');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { message.warning('Title is required'); return; }
    if (!form.sections || form.sections.length === 0) { message.warning('Please add at least one content section'); return; }
    const speakerPhoto = form.speakerPhoto.trim();
    if (speakerPhoto && !/^(https?:\/\/|\/)/i.test(speakerPhoto)) {
      message.warning('Speaker photo must be a full https:// link or an uploaded image');
      return;
    }
    const speakerLinks = Object.fromEntries(SPEAKER_LINK_FIELDS.map(({ key }) => [key, (form.speakerLinks[key] || '').trim()]));
    const badLink = SPEAKER_LINK_FIELDS.find(({ key }) => speakerLinks[key] && !/^https?:\/\/\S+$/i.test(speakerLinks[key]));
    if (badLink) {
      message.warning(`${badLink.label} must be a full link starting with https://`);
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...form, type: 'event',
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        eventStart: form.eventStart ? new Date(form.eventStart).toISOString() : undefined,
        eventEnd: form.eventEnd ? new Date(form.eventEnd).toISOString() : undefined,
        registrationLink: form.registrationLink.trim(),
        joiningLink: form.joiningLink.trim(),
        country: form.country || '',
        speakerRole: form.speakerRole.trim(),
        speakerPhoto,
        ctaLabel: form.ctaLabel.trim(),
        speakerBio: form.speakerBio.trim(),
        speakerLinks,
        whoShouldAttend: form.whoShouldAttend.split('\n').map((line) => line.trim()).filter(Boolean),
        showOnHomepage: form.showOnHomepage !== false,
        // null clears a previously set position so the event goes back to date order
        homepageOrder: Number.isFinite(form.homepageOrder) ? form.homepageOrder : null,
      };
      if (isEdit) { await API.put(`/admin/content/${id}`, payload); message.success('Event updated'); }
      else { await API.post('/admin/content', payload); message.success('Event created'); }
      navigate('/events');
    } catch (err) { message.error('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Header title={isEdit ? 'Edit Event' : 'Create Event'} subtitle={isEdit ? 'Update event' : 'Create a new event'} backUrl="/events" />
      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="content-form">
          {/* Event Details */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><CalendarOutlined /></span>
              <h3 className="nx-section-title">Event details</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-field">
                <label className="nx-label">Title <span className="form-required">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="form-input" />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Story Sections <span className="form-required">*</span></label>
                <BlockBuilder 
                  sections={form.sections || []} 
                  onChange={(val) => setForm({ ...form, sections: val })} 
                  API={API} 
                />
              </div>
            </div>
          </div>

          {/* Speaker & Category Settings */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><UserOutlined /></span>
              <h3 className="nx-section-title">Speaker & category settings</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-row">
                <div className="content-form-field">
                  <label className="nx-label">Category</label>
                  <Select
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val })}
                    style={{ width: '100%', height: '42px' }}
                    className="custom-admin-select"
                  >
                    <Select.Option value="webinar">Webinar</Select.Option>
                    <Select.Option value="fair">Virtual Fair</Select.Option>
                    <Select.Option value="other">Other Event</Select.Option>
                  </Select>
                </div>
                <div className="content-form-field">
                  <label className="nx-label">Speaker Name</label>
                  <input type="text" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} placeholder="e.g. Joshua Vasudevan" className="form-input" />
                  <p style={helperTextStyle}>Leave empty to show no speaker on the homepage card.</p>
                </div>
              </div>
              <div className="content-form-row">
                <div className="content-form-field">
                  <label className="nx-label">Speaker Role</label>
                  <input type="text" value={form.speakerRole} onChange={(e) => setForm({ ...form, speakerRole: e.target.value })} placeholder="e.g. Career Guide Expert, Ireland" maxLength={120} className="form-input" />
                  <p style={helperTextStyle}>Shown under the speaker's name on the event card.</p>
                </div>
                <div className="content-form-field">
                  <label className="nx-label">Speaker Photo</label>
                  <input type="file" ref={speakerInputRef} onChange={handleSpeakerUpload} accept="image/*" style={{ display: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'grid', placeItems: 'center', background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', color: 'var(--ux-text-3)', fontWeight: 600 }}>
                      {uploadingSpeaker ? <Spin size="small" />
                        : form.speakerPhoto ? <img src={getAbsoluteUrl(form.speakerPhoto)} alt="Speaker preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (form.speaker.trim().charAt(0).toUpperCase() || <UserOutlined />)}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" disabled={uploadingSpeaker} onClick={() => speakerInputRef.current.click()} className="nx-btn nx-btn--light nx-btn--sm"><UploadOutlined /> {form.speakerPhoto ? 'Change' : 'Upload'}</button>
                      {form.speakerPhoto && (
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, speakerPhoto: '' }))} className="nx-btn nx-btn--light nx-btn--sm"><DeleteOutlined /> Remove</button>
                      )}
                    </div>
                  </div>
                  <input type="text" value={form.speakerPhoto} onChange={(e) => setForm({ ...form, speakerPhoto: e.target.value })} placeholder="or paste an image link (https://...)" className="form-input" />
                  <p style={helperTextStyle}>Square image works best. Leave empty to use the default photo or the speaker's initial.</p>
                </div>
              </div>
              <div className="content-form-field">
                <label className="nx-label">Speaker Bio</label>
                <textarea value={form.speakerBio} onChange={(e) => setForm({ ...form, speakerBio: e.target.value })} placeholder="A few lines about the host: background, university, experience..." rows={4} maxLength={1000} className="form-input form-textarea" />
                <p style={helperTextStyle}>Shown in the Host section of the event page ({form.speakerBio.length}/1000).</p>
              </div>
              <div className="content-form-row" style={{ flexWrap: 'wrap' }}>
                {SPEAKER_LINK_FIELDS.map(({ key, label, placeholder }) => (
                  <div className="content-form-field" key={key} style={{ minWidth: '220px' }}>
                    <label className="nx-label">{label}</label>
                    <input
                      type="url"
                      value={form.speakerLinks[key]}
                      onChange={(e) => setForm({ ...form, speakerLinks: { ...form.speakerLinks, [key]: e.target.value } })}
                      placeholder={placeholder}
                      maxLength={500}
                      className="form-input"
                    />
                  </div>
                ))}
              </div>
              <p style={helperTextStyle}>Speaker social links are optional; only full https:// links are shown on the event page.</p>
              <div className="content-form-field">
                <label className="nx-label">Who Should Attend</label>
                <textarea value={form.whoShouldAttend} onChange={(e) => setForm({ ...form, whoShouldAttend: e.target.value })} placeholder={'One per line, e.g.\nFinal-year students planning a Masters\nWorking professionals targeting Sep 2027'} rows={4} className="form-input form-textarea" />
                <p style={helperTextStyle}>One point per line (up to 12). Leave empty to hide this section on the event page.</p>
              </div>
              <div className="content-form-row">
                <div className="content-form-field">
                  <label className="nx-label">Tags (comma-separated)</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. UK, Visa, Intakes" className="form-input" />
                </div>
                <div className="content-form-field">
                  <label className="nx-label">Registration Form Link (Optional)</label>
                  <input type="url" value={form.registrationLink} onChange={(e) => setForm({ ...form, registrationLink: e.target.value })} placeholder="e.g. https://forms.gle/xyz" className="form-input" />
                  <p style={helperTextStyle}>Leave empty to collect registrations on UniCoach — they appear in Requests → Event Registration.</p>
                </div>
                <div className="content-form-field">
                  <label className="nx-label">Joining link (Zoom / Meet)</label>
                  <input type="url" value={form.joiningLink} onChange={(e) => setForm({ ...form, joiningLink: e.target.value })} placeholder="e.g. https://zoom.us/j/123456789" className="form-input" />
                  <p style={helperTextStyle}>Not shown on the website. Sent to registered people when a bulk message uses {'{meet_link}'}.</p>
                </div>
              </div>
              <div className="content-form-field">
                <label className="nx-label">Short Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter a brief summary for cards and details..." rows={3} className="form-input form-textarea" />
              </div>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><EnvironmentOutlined /></span>
              <h3 className="nx-section-title">Schedule & location</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-row">
                <div className="content-form-field">
                  <label className="nx-label">Start Date & Time</label>
                  <input type="datetime-local" value={form.eventStart} onChange={(e) => setForm({ ...form, eventStart: e.target.value })} className="form-input" />
                </div>
                <div className="content-form-field">
                  <label className="nx-label">End Date & Time</label>
                  <input type="datetime-local" value={form.eventEnd} onChange={(e) => setForm({ ...form, eventEnd: e.target.value })} className="form-input" />
                </div>
              </div>
              <div className="content-form-field">
                <label className="nx-label">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Event venue or online" className="form-input" />
              </div>
            </div>
          </div>

          {/* Homepage card */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><HomeOutlined /></span>
              <h3 className="nx-section-title">Homepage card</h3>
            </div>
            <div className="content-form-fields">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Switch
                  checked={form.showOnHomepage}
                  onChange={(val) => setForm(prev => ({ ...prev, showOnHomepage: val }))}
                />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: '14px' }}>
                    {form.showOnHomepage ? 'Show on homepage' : 'Hidden from homepage'}
                  </span>
                  <p style={helperTextStyle}>The homepage shows up to 3 published events. Hidden events stay on the Events page.</p>
                </div>
              </div>
              <div className="content-form-row">
                <div className="content-form-field">
                  <label className="nx-label">Country</label>
                  <Select
                    value={form.country}
                    onChange={(val) => setForm(prev => ({ ...prev, country: val ?? '' }))}
                    style={{ width: '100%', height: '42px' }}
                    className="custom-admin-select"
                    options={[
                      { value: '', label: 'Auto (detect from title)' },
                      ...COUNTRY_OPTIONS.map(c => ({ value: c, label: c })),
                    ]}
                  />
                  <p style={helperTextStyle}>Sets the flag and country shown on the card.</p>
                </div>
                <div className="content-form-field">
                  <label className="nx-label">Homepage Position (Optional)</label>
                  <InputNumber
                    min={1}
                    max={99}
                    precision={0}
                    value={form.homepageOrder}
                    onChange={(val) => setForm(prev => ({ ...prev, homepageOrder: typeof val === 'number' ? val : null }))}
                    placeholder="Auto"
                    style={{ width: '100%', height: '42px' }}
                  />
                  <p style={helperTextStyle}>1 = first card. Leave empty to order by date (soonest upcoming first).</p>
                </div>
              </div>
              <div className="content-form-field">
                <label className="nx-label">Button Text</label>
                <input type="text" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder={DEFAULT_CTA_LABEL} maxLength={40} className="form-input" />
                <p style={helperTextStyle}>Leave empty to show "{DEFAULT_CTA_LABEL}".</p>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><PictureOutlined /></span>
              <h3 className="nx-section-title">Media</h3>
            </div>
            <div className="content-form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                <label className="nx-label" style={{ margin: 0 }}>Cover Image / Event Banner</label>
                <span className="nx-status nx-status--neutral">
                  Recommended: 1200 × 675 px (16:9 Event Poster)
                </span>
              </div>
              <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" style={{ display: 'none' }} />

              {uploadingCover ? (
                <div className="flex items-center justify-center gap-3 py-9 px-5 rounded-[18px] border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-wait">
                  <Spin size="small" />
                  <span className="text-[12.5px] font-semibold text-[var(--ux-text-2)]">Uploading Image...</span>
                </div>
              ) : form.imageUrl ? (
                <div className="cover-preview-container" style={{ borderColor: 'var(--ux-line-2)', background: 'var(--ux-surface-2)', borderRadius: '18px' }}>
                  <img src={getAbsoluteUrl(form.imageUrl)} alt="Cover preview" />
                  <div className="cover-preview-overlay" style={{ background: 'rgba(17, 17, 17, 0.45)' }}>
                    <button type="button" onClick={() => coverInputRef.current.click()} className="nx-btn nx-btn--light nx-btn--sm"><UploadOutlined /> Change Image</button>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))} className="nx-btn nx-btn--danger nx-btn--sm"><DeleteOutlined /> Remove</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-9 px-5 rounded-[18px] border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-pointer select-none transition-colors hover:bg-[var(--ux-surface-3)]" onClick={() => coverInputRef.current.click()}>
                  <span className="nx-icon-circle mb-3" style={{ background: '#fff' }}><UploadOutlined /></span>
                  <span className="text-[13.5px] font-semibold text-[var(--ux-ink)] mb-1">Choose local image</span>
                  <span className="text-[12px] text-[var(--ux-text-3)]">PNG, JPG, WEBP or GIF up to 10MB • Ideal Ratio: 16:9 (1200×675 px)</span>
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><GlobalOutlined /></span>
              <h3 className="nx-section-title">SEO settings</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-field">
                <label className="nx-label">Custom Slug (URL Path)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. custom-url-slug (leave blank to auto-generate from title)" className="form-input" />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO optimized title" className="form-input" />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="Brief SEO description" rows={3} className="form-input form-textarea" />
              </div>
            </div>
          </div>

          {/* Publishing & Scheduling Card */}
          <div className="form-card">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <span className="nx-icon-circle"><ClockCircleOutlined /></span>
                <h3 className="nx-section-title">Publishing status & schedule</h3>
              </div>
              {form.published && (!form.publishDate || new Date(form.publishDate) <= new Date()) ? (
                <span className="nx-status nx-status--success">
                  Live on website
                </span>
              ) : form.published && form.publishDate && new Date(form.publishDate) > new Date() ? (
                <span className="nx-status nx-status--warning">
                  Scheduled for {dayjs(form.publishDate).format('DD MMM YYYY, hh:mm A')}
                </span>
              ) : (
                <span className="nx-status nx-status--neutral">
                  Draft (hidden from public)
                </span>
              )}
            </div>

            <div className="content-form-fields">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Switch 
                    checked={form.published} 
                    onChange={(val) => setForm(prev => ({ 
                      ...prev, 
                      published: val,
                      publishDate: val ? prev.publishDate : null
                    }))} 
                  />
                  <span style={{ fontWeight: 600, color: 'var(--ux-ink)', fontSize: '14px' }}>
                    {form.published ? 'Publishing Enabled' : 'Save as Draft (Unpublished)'}
                  </span>
                </div>

                {form.published && (
                  <div style={{ background: 'var(--ux-surface-2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--ux-line-2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--ux-text)' }}>
                        <input
                          type="radio"
                          name="publishMode"
                          checked={!form.publishDate || new Date(form.publishDate) <= new Date()}
                          onChange={() => setForm(prev => ({ ...prev, publishDate: null }))}
                          style={{ accentColor: 'var(--ux-ink)' }}
                        />
                        Publish immediately
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--ux-text)' }}>
                        <input
                          type="radio"
                          name="publishMode"
                          checked={Boolean(form.publishDate && new Date(form.publishDate) > new Date())}
                          onChange={() => setForm(prev => ({ ...prev, publishDate: dayjs().add(1, 'day').hour(10).minute(0).second(0).toISOString() }))}
                          style={{ accentColor: 'var(--ux-ink)' }}
                        />
                        Schedule for later (auto-publish)
                      </label>
                    </div>

                    {form.publishDate && new Date(form.publishDate) > new Date() && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--ux-line-2)' }}>
                        <span className="nx-label">Target date & time</span>
                        <DatePicker 
                          showTime={{ format: 'HH:mm' }}
                          format="YYYY-MM-DD HH:mm"
                          value={form.publishDate ? dayjs(form.publishDate) : null}
                          onChange={(date) => setForm(prev => ({ ...prev, publishDate: date ? date.toISOString() : null }))}
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                          style={{ minWidth: '220px' }}
                        />
                        <span className="nx-muted" style={{ fontSize: '12px' }}>
                          This event will automatically go live on this exact date & time.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="content-form-actions nx-card" style={{ padding: '16px 20px' }}>
            <div className="content-form-buttons" style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={loading} className="nx-btn nx-btn--dark">
                {loading ? 'Saving...' : isEdit ? 'Update Event' : form.published && form.publishDate && new Date(form.publishDate) > new Date() ? 'Schedule Event' : 'Save Event'}
              </button>
              <button type="button" onClick={() => navigate('/events')} className="nx-btn nx-btn--light">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
