import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message, Switch, Spin, DatePicker } from 'antd';
import dayjs from 'dayjs';
import Header from '../components/Header';
import BlockBuilder from '../components/BlockBuilder';
import AiBlogGeneratorModal from '../components/AiBlogGeneratorModal';
import API from '../api/axios';
import { FileTextOutlined, GlobalOutlined, PictureOutlined, UploadOutlined, DeleteOutlined, ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';

const BlogForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [importingDocx, setImportingDocx] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const coverInputRef = useRef(null);
  const docxInputRef = useRef(null);

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
      }).catch(() => message.error('Failed to load blog'));
    }
  }, [id, isEdit]);

  // Helper to format URLs to be absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API.defaults.baseURL.replace('/api', '');
    return `${base}${url}`;
  };

  // Handle Docx Upload & Parse
  const handleDocxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setImportingDocx(true);

    try {
      const { data } = await API.post('/admin/content/import-docx', formData);
      
      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        sections: data.sections || []
      }));
      message.success('Word document content imported successfully!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to import Word document');
    } finally {
      setImportingDocx(false);
      e.target.value = '';
    }
  };

  // Cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingCover(true);

    try {
      const { data } = await API.post('/admin/upload', formData);
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
      const sanitizedSlug = form.slug ? form.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^\w-]+/g, '-') : undefined;
      const payload = { ...form, slug: sanitizedSlug, type: 'blog' };
      if (isEdit) { await API.put(`/admin/content/${id}`, payload); message.success('Blog updated'); }
      else { await API.post('/admin/content', payload); message.success('Blog created'); }
      navigate('/blogs');
    } catch (err) { message.error('Failed to save blog'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Header title={isEdit ? 'Edit Blog' : 'Create Blog'} subtitle={isEdit ? 'Update blog post' : 'Write a new blog post'} backUrl="/blogs" />
      <div className="dashboard-content">
        <form onSubmit={handleSubmit} className="content-form">
          {/* Main Content Card */}
          <div className="form-card">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <span className="nx-icon-circle"><FileTextOutlined /></span>
                <h3 className="nx-section-title">Content</h3>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(true)}
                  className="nx-btn nx-btn--accent nx-btn--sm"
                >
                  <ThunderboltOutlined /> Write with AI
                </button>

                <input
                  type="file"
                  ref={docxInputRef}
                  onChange={handleDocxUpload}
                  accept=".docx"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => docxInputRef.current.click()}
                  disabled={importingDocx}
                  className="nx-btn nx-btn--light nx-btn--sm"
                >
                  <UploadOutlined /> {importingDocx ? 'Importing...' : 'Import from Word (.docx)'}
                </button>
              </div>
            </div>

            <div className="content-form-fields">
              <div className="content-form-field">
                <label className="nx-label">Title <span className="form-required">*</span></label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter blog title"
                  className="form-input"
                />
              </div>

              <div className="content-form-field">
                <label className="nx-label">Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {[
                    { val: 'Colleges', label: 'Colleges' },
                    { val: 'Courses', label: 'Courses' },
                    { val: 'Exams', label: 'Exams' },
                    { val: 'Expense Calculator', label: 'Expense Calculator' },
                    { val: 'Scholarships', label: 'Scholarships' },
                    { val: 'Visa Guidance', label: 'Visa Guidance' },
                    { val: 'Study Abroad', label: 'Study Abroad' }
                  ].map(c => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.val })}
                      className={`nx-tab ${form.category === c.val ? 'nx-tab--active' : ''}`}
                      style={{ height: '34px', padding: '0 14px', fontSize: '12.5px' }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  list="blog-categories"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Select from above or type custom category"
                  className="form-input"
                />
                <datalist id="blog-categories">
                  <option value="Colleges" />
                  <option value="Courses" />
                  <option value="Exams" />
                  <option value="Expense Calculator" />
                  <option value="Scholarships" />
                  <option value="Visa Guidance" />
                  <option value="Study Abroad" />
                  <option value="General" />
                </datalist>
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

          {/* Image Card */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><PictureOutlined /></span>
              <h3 className="nx-section-title">Media</h3>
            </div>
            <div className="content-form-field">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                <label className="nx-label" style={{ margin: 0 }}>Cover Image</label>
                <span className="nx-status nx-status--neutral">
                  Recommended: 1200 × 630 px (Landscape Blog Banner)
                </span>
              </div>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {uploadingCover ? (
                <div className="flex items-center justify-center gap-3 py-9 px-5 rounded-[18px] border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-wait">
                  <Spin size="small" />
                  <span className="text-[12.5px] font-semibold text-[var(--ux-text-2)]">Uploading Image...</span>
                </div>
              ) : form.imageUrl ? (
                <div className="cover-preview-container" style={{ borderColor: 'var(--ux-line-2)', background: 'var(--ux-surface-2)', borderRadius: '18px' }}>
                  <img src={getAbsoluteUrl(form.imageUrl)} alt="Cover preview" />
                  <div className="cover-preview-overlay" style={{ background: 'rgba(17, 17, 17, 0.45)' }}>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current.click()}
                      className="nx-btn nx-btn--light nx-btn--sm"
                    >
                      <UploadOutlined /> Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                      className="nx-btn nx-btn--danger nx-btn--sm"
                    >
                      <DeleteOutlined /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-center py-9 px-5 rounded-[18px] border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-pointer select-none transition-colors hover:bg-[var(--ux-surface-3)]"
                  onClick={() => coverInputRef.current.click()}
                >
                  <span className="nx-icon-circle mb-3" style={{ background: '#fff' }}><UploadOutlined /></span>
                  <span className="text-[13.5px] font-semibold text-[var(--ux-ink)] mb-1">Choose local image</span>
                  <span className="text-[12px] text-[var(--ux-text-3)]">PNG, JPG, WEBP or GIF up to 10MB • Ideal Ratio: 16:9 or 21:9 (1200×630 px)</span>
                </div>
              )}
            </div>
          </div>

          {/* SEO Card */}
          <div className="form-card">
            <div className="flex items-center gap-3 mb-5">
              <span className="nx-icon-circle"><GlobalOutlined /></span>
              <h3 className="nx-section-title">SEO settings</h3>
            </div>
            <div className="content-form-fields">
              <div className="content-form-field">
                <label className="nx-label">Custom Slug (URL Path)</label>
                <input
                  type="text" value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/^\/+/, '').replace(/\s+/g, '-') })}
                  placeholder="e.g. my-custom-slug (leave blank to auto-generate from title)"
                  className="form-input"
                />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Meta Title</label>
                <input
                  type="text" value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="SEO optimized title"
                  className="form-input"
                />
              </div>
              <div className="content-form-field">
                <label className="nx-label">Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="Brief SEO description for search engines"
                  rows={3}
                  className="form-input form-textarea"
                />
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
                          This post will automatically go live on this exact date & time.
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
                {loading ? 'Saving...' : isEdit ? 'Update Blog' : form.published && form.publishDate && new Date(form.publishDate) > new Date() ? 'Schedule Blog' : 'Save Blog'}
              </button>
              <button type="button" onClick={() => navigate('/blogs')} className="nx-btn nx-btn--light">
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* AI SEO Blog Generator Modal */}
        <AiBlogGeneratorModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onApplyBlog={(aiBlog) => {
            setForm(prev => ({
              ...prev,
              title: aiBlog.title || prev.title,
              slug: aiBlog.slug || prev.slug,
              metaTitle: aiBlog.metaTitle || prev.metaTitle,
              metaDescription: aiBlog.metaDescription || prev.metaDescription,
              category: aiBlog.category || prev.category,
              sections: aiBlog.sections || prev.sections
            }));
          }}
        />
      </div>
    </div>
  );
};

export default BlogForm;
