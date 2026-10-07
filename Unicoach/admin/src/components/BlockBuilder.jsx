import React, { useRef } from 'react';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  UploadOutlined,
  FileTextOutlined,
  PictureOutlined,
  FontSizeOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { message, Select, Spin } from 'antd';

const { Option } = Select;

const BlockBuilder = ({ sections = [], onChange, API }) => {
  const fileInputRefs = useRef({});

  // Helper to format URLs to be absolute
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API.defaults.baseURL.replace('/api', '');
    return `${base}${url}`;
  };

  const updateSection = (index, fields) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...fields };
    onChange(updated);
  };

  const deleteSection = (index) => {
    const updated = sections.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const moveSection = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const addSection = (type) => {
    const defaults = {
      heading: { type: 'heading', content: '', level: 2, align: 'left' },
      paragraph: { type: 'paragraph', content: '', align: 'left' },
      image: { type: 'image', url: '', caption: '', align: 'center', uploading: false },
      faq: { type: 'faq', question: '', answer: '' }
    };

    const newSection = defaults[type] || defaults.paragraph;
    onChange([...sections, newSection]);
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    updateSection(index, { uploading: true });

    try {
      const { data } = await API.post('/admin/upload', formData);
      if (data && data.url) {
        updateSection(index, { url: data.url, uploading: false });
        message.success('Image uploaded successfully!');
      } else {
        throw new Error('No URL returned from server');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      updateSection(index, { uploading: false });
      message.error(err.response?.data?.message || err.message || 'Failed to upload image');
    }
  };

  const getBlockMeta = (type) => {
    switch (type) {
      case 'heading':
        return { label: 'Heading', icon: <FontSizeOutlined /> };
      case 'paragraph':
        return { label: 'Paragraph', icon: <FileTextOutlined /> };
      case 'image':
        return { label: 'Local Image', icon: <PictureOutlined /> };
      case 'faq':
        return { label: 'FAQ Accordion', icon: <QuestionCircleOutlined /> };
      default:
        return { label: type, icon: <FileTextOutlined /> };
    }
  };

  return (
    <div className="block-builder">
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-[18px] border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)]">
          <span className="nx-icon-circle mb-3" style={{ background: '#fff' }}><MenuOutlined /></span>
          <p className="text-[14px] font-semibold text-[var(--ux-ink)] mb-1">Your story starts here</p>
          <p className="text-[12.5px] text-[var(--ux-text-3)] max-w-[320px]">Click any of the buttons below to add headings, rich paragraphs, images, and FAQs.</p>
        </div>
      ) : (
        <div className="block-builder-list">
          {sections.map((section, index) => {
            const meta = getBlockMeta(section.type);
            return (
              <div
                key={index}
                className={`block-card block-card--${section.type}`}
                style={{ border: '1px solid var(--ux-line-2)', borderRadius: '18px', boxShadow: 'none' }}
              >
                {/* Controls bar */}
                <div className="block-card-controls" style={{ background: 'var(--ux-surface-2)', borderBottom: '1px solid var(--ux-line-2)', padding: '10px 12px 10px 16px' }}>
                  <span className="nx-status nx-status--neutral" style={{ background: '#fff', border: '1px solid var(--ux-line-2)', color: 'var(--ux-ink)' }}>
                    {meta.icon}
                    <span>#{index + 1} {meta.label}</span>
                  </span>

                  <div className="block-card-actions">
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="nx-round-btn nx-round-btn--sm disabled:opacity-35 disabled:cursor-not-allowed!"
                      title="Move Up"
                    >
                      <ArrowUpOutlined />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="nx-round-btn nx-round-btn--sm disabled:opacity-35 disabled:cursor-not-allowed!"
                      title="Move Down"
                    >
                      <ArrowDownOutlined />
                    </button>
                    <div className="block-action-divider" style={{ background: 'var(--ux-line)' }} />
                    <button
                      type="button"
                      onClick={() => deleteSection(index)}
                      className="nx-round-btn nx-round-btn--sm"
                      style={{ background: '#fff1f0', borderColor: 'transparent', color: '#dc2626' }}
                      title="Delete Block"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>

                {/* Block contents */}
                <div className="block-card-body">
                  {/* HEADING BLOCK */}
                  {section.type === 'heading' && (
                    <div className="block-fields">
                      <div className="block-row">
                        <div className="block-field" style={{ flex: '0 0 130px' }}>
                          <label className="nx-label">Size / Level</label>
                          <Select 
                            value={section.level || 2} 
                            onChange={(val) => updateSection(index, { level: val })}
                            style={{ width: '100%' }}
                          >
                            <Option value={2}>H2 - Major Section</Option>
                            <Option value={3}>H3 - Subsection</Option>
                            <Option value={4}>H4 - Small Heading</Option>
                          </Select>
                        </div>

                        <div className="block-field" style={{ flex: '0 0 130px' }}>
                          <label className="nx-label">Alignment</label>
                          <Select 
                            value={section.align || 'left'} 
                            onChange={(val) => updateSection(index, { align: val })}
                            style={{ width: '100%' }}
                          >
                            <Option value="left"><AlignLeftOutlined /> Left</Option>
                            <Option value="center"><AlignCenterOutlined /> Center</Option>
                            <Option value="right"><AlignRightOutlined /> Right</Option>
                          </Select>
                        </div>

                        <div className="block-field" style={{ flex: 1 }}>
                          <label className="nx-label">Heading Text</label>
                          <input 
                            type="text" 
                            value={section.content || ''} 
                            onChange={(e) => updateSection(index, { content: e.target.value })}
                            placeholder="Enter section heading..." 
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PARAGRAPH BLOCK */}
                  {section.type === 'paragraph' && (
                    <div className="block-fields">
                      <div className="block-row">
                        <div className="block-field" style={{ flex: '0 0 130px' }}>
                          <label className="nx-label">Alignment</label>
                          <Select 
                            value={section.align || 'left'} 
                            onChange={(val) => updateSection(index, { align: val })}
                            style={{ width: '100%' }}
                          >
                            <Option value="left"><AlignLeftOutlined /> Left</Option>
                            <Option value="center"><AlignCenterOutlined /> Center</Option>
                            <Option value="right"><AlignRightOutlined /> Right</Option>
                            <Option value="justify">Justify</Option>
                          </Select>
                        </div>

                        <div className="block-field" style={{ flex: 1 }}>
                          <label className="nx-label">Paragraph Text</label>
                          <textarea 
                            value={section.content || ''} 
                            onChange={(e) => updateSection(index, { content: e.target.value })}
                            placeholder="Write comprehensive story content..." 
                            className="form-input form-textarea"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IMAGE BLOCK */}
                  {section.type === 'image' && (
                    <div className="block-fields">
                      <div className="block-row-image">
                        <div className="block-image-upload-area">
                          <input 
                            type="file" 
                            ref={el => fileInputRefs.current[index] = el}
                            onChange={(e) => handleImageUpload(index, e)}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />

                          {section.uploading ? (
                            <div className="flex flex-col items-center justify-center gap-2 min-h-[140px] py-6 px-4 rounded-2xl border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-wait">
                              <Spin size="small" />
                              <span className="text-[12px] font-semibold text-[var(--ux-text-2)]">Uploading & Optimizing...</span>
                            </div>
                          ) : section.url ? (
                            <div className="block-image-preview" style={{ border: '1px solid var(--ux-line-2)', background: 'var(--ux-surface-2)' }}>
                              <img src={getAbsoluteUrl(section.url)} alt="Section Preview" />
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[index]?.click()}
                                className="nx-btn nx-btn--light nx-btn--sm absolute bottom-2.5 left-1/2 -translate-x-1/2"
                              >
                                <UploadOutlined /> Replace Image
                              </button>
                            </div>
                          ) : (
                            <div
                              className="flex flex-col items-center justify-center text-center min-h-[140px] py-6 px-4 rounded-2xl border-2 border-dashed border-[var(--ux-line)] bg-[var(--ux-surface-2)] cursor-pointer transition-colors hover:bg-[var(--ux-surface-3)]"
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              <span className="nx-icon-circle mb-2" style={{ background: '#fff' }}>
                                <UploadOutlined />
                              </span>
                              <span className="text-[12.5px] font-semibold text-[var(--ux-ink)] mb-0.5">Click to Upload Story Image</span>
                              <span className="text-[11.5px] text-[var(--ux-text-3)]" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                <span>PNG, JPG, WEBP or GIF (Max 10MB)</span>
                                <span className="nx-status nx-status--neutral" style={{ background: '#fff', border: '1px solid var(--ux-line-2)' }}>
                                  Recommended: 1000 × 560 px (16:9 In-Article)
                                </span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="block-image-meta">
                          <div className="block-field">
                            <label className="nx-label">Image Alignment</label>
                            <Select 
                              value={section.align || 'center'} 
                              onChange={(val) => updateSection(index, { align: val })}
                              style={{ width: '100%' }}
                            >
                              <Option value="left"><AlignLeftOutlined /> Left</Option>
                              <Option value="center"><AlignCenterOutlined /> Center</Option>
                              <Option value="right"><AlignRightOutlined /> Right</Option>
                            </Select>
                          </div>
                          <div className="block-field">
                            <label className="nx-label">Caption / Alt Subtitle</label>
                            <input 
                              type="text" 
                              value={section.caption || ''} 
                              onChange={(e) => updateSection(index, { caption: e.target.value })}
                              placeholder="Enter descriptive image caption..." 
                              className="form-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FAQ BLOCK */}
                  {section.type === 'faq' && (
                    <div className="block-fields">
                      <div className="block-field">
                        <label className="nx-label">FAQ Question</label>
                        <input 
                          type="text" 
                          value={section.question || ''} 
                          onChange={(e) => updateSection(index, { question: e.target.value })}
                          placeholder="e.g. What is the IELTS minimum requirement?" 
                          className="form-input"
                        />
                      </div>
                      <div className="block-field">
                        <label className="nx-label">FAQ Answer</label>
                        <textarea 
                          value={section.answer || ''} 
                          onChange={(e) => updateSection(index, { answer: e.target.value })}
                          placeholder="Detailed answer explanation..." 
                          className="form-input form-textarea"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toolbar to add new blocks */}
      <div className="block-builder-toolbar" style={{ background: 'var(--ux-surface-2)', border: '1px solid var(--ux-line-2)', boxShadow: 'none' }}>
        <span className="nx-label">Add block</span>
        <div className="block-builder-toolbar-buttons" style={{ gap: '8px' }}>
          <button type="button" onClick={() => addSection('heading')} className="nx-btn nx-btn--light nx-btn--sm">
            <FontSizeOutlined /> Heading
          </button>
          <button type="button" onClick={() => addSection('paragraph')} className="nx-btn nx-btn--light nx-btn--sm">
            <FileTextOutlined /> Paragraph
          </button>
          <button type="button" onClick={() => addSection('image')} className="nx-btn nx-btn--light nx-btn--sm">
            <PictureOutlined /> Local Image
          </button>
          <button type="button" onClick={() => addSection('faq')} className="nx-btn nx-btn--light nx-btn--sm">
            <QuestionCircleOutlined /> FAQ Accordion
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockBuilder;
