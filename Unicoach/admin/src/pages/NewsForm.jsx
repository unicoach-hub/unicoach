import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Switch, Spin, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import Header from '../components/Header';
import BlockBuilder from '../components/BlockBuilder';
import API from '../api/axios';
import { NotificationOutlined, GlobalOutlined, PictureOutlined, UploadOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

const NewsForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', body: '', sections: [], imageUrl: '', slug: '', metaTitle: '', metaDescription: '', published: false, publishDate: null, category: 'General',
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
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          published: data.published || false,
          publishDate: data.publishDate || null,
          category: data.category || 'General',
        });
      }).catch(() => message.error('Failed to load news'));
    }
  }, [id, isEdit]);

  // Helper to format URLs to be absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API.defaults.baseURL.replace('/api', '');
    return `${base}${url}`;
  };

  // Cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingCover(true);

    try {
      const { data } = await API.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, imageUrl: data.url }));
      message.success('Cover image uploaded!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { message.warning('Title is required'); return; }
    if (!form.sections || form.sections.length === 0) { message.warning('Please add at least one content section'); return; }
    
    setLoading(true);
    try {
      const payload = { ...form, type: 'news' };
      if (isEdit) { await API.put(`/admin/content/${id}`, payload); message.success('News updated'); }
      else { await API.post('/admin/content', payload); message.success('News created'); }
      navigate('/news');
    } catch (err) { message.error('Failed to save news'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Header title={isEdit ? 'Edit News' : 'Create News'} subtitle={isEdit ? 'Update news article' : 'Write a new news article'} backUrl="/news" />
      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="content-form">
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><NotificationOutlined /></span>
              <h3 className="nx-section-title">Content</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-field">
                <label className="nx-label">Title <span className="form-required">*</span></label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter news title" className="form-input" />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Category</label>
                <Select
                  value={form.category || 'News Releases'}
                  onChange={(val) => setForm({ ...form, category: val })}
                  className="custom-admin-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <Select.Option value="News Releases">News Releases (Newsroom Main)</Select.Option>
                  <Select.Option value="Student Reports">Student Reports (Research Index)</Select.Option>
                  <Select.Option value="In the Press">In the Press (Media Coverage)</Select.Option>
                  <Select.Option value="Corporate Update">Corporate Update</Select.Option>
                  <Select.Option value="Immigration Updates">Immigration & Visa Updates</Select.Option>
                  <Select.Option value="University News">University & Admissions News</Select.Option>
                  <Select.Option value="Policy Changes">Policy Changes & Regulations</Select.Option>
                  <Select.Option value="General">General Bulletin</Select.Option>
                </Select>
                <span className="nx-muted" style={{ fontSize: '12px', marginTop: '2px', display: 'block' }}>
                  Determines which tab and section this news appears on in the frontend Newsroom.
                </span>
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

          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><PictureOutlined /></span>
              <h3 className="nx-section-title">Media</h3>
            </div>
            <div className="content-form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                <label className="nx-label" style={{ margin: 0 }}>Cover Image</label>
                <span className="nx-status nx-status--neutral">
                  Recommended: 1200 × 675 px (16:9 Landscape)
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
                          This news article will automatically go live on this exact date & time.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="content-form-actions nx-card" style={{ padding: '16px 20px' }}>
            <div className="content-form-buttons" style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={loading} className="nx-btn nx-btn--dark">
                {loading ? 'Saving...' : isEdit ? 'Update News' : form.published && form.publishDate && new Date(form.publishDate) > new Date() ? 'Schedule News' : 'Save News'}
              </button>
              <button type="button" onClick={() => navigate('/news')} className="nx-btn nx-btn--light">Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsForm;
