import React, { useState } from 'react';
import { Modal, Input, Select, Button, message, Spin, Space, Tag } from 'antd';
import { 
  ThunderboltOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  GlobalOutlined,
  BulbOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import API from '../api/axios';

const { TextArea } = Input;
const { Option } = Select;

const PRESET_TOPICS = [
  { label: '🇩🇪 Germany Study & Blocked Account Guide 2026', topic: 'Complete Guide to Study in Germany for Indian Students 2026: Cost, Public Universities & Blocked Account', country: 'Germany', category: 'Study Abroad Guide' },
  { label: '🇺🇸 USA F-1 Visa Top Questions & Red Flags', topic: 'USA F-1 Student Visa Interview: Top 25 Questions, 214(b) Rejection Reasons & Model Answers', country: 'USA', category: 'Visa & Immigration' },
  { label: '🇬🇧 UK High-Paying Master Degrees & Post-Study Visa', topic: 'Top 10 High-Paying Master Degrees in UK for 2026 with Graduate Route Post-Study Work Visa', country: 'United Kingdom', category: 'University Review' },
  { label: '🇨🇦 Canada Study Permit SDS Rules 2026', topic: 'Canada Student Visa and Study Permit Guide 2026: Financial Proof, SDS Process & PAL Updates', country: 'Canada', category: 'Visa & Immigration' },
  { label: '🇦🇺 Australia Genuine Student (GS) Requirements', topic: 'Australia Subclass 500 Visa 2026: Genuine Student GS Assessment and Living Cost Proof', country: 'Australia', category: 'Study Abroad Guide' },
  { label: '🎓 Top 10 Fully Funded Scholarships for Indian Students', topic: 'Top 10 Fully Funded International Scholarships for Indian Students in 2026: Deadlines & Eligibility', country: 'Global', category: 'Scholarships' }
];

const AiBlogGeneratorModal = ({ isOpen, onClose, onApplyBlog }) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Study Abroad Guide');
  const [targetCountry, setTargetCountry] = useState('Germany');
  const [targetAudience, setTargetAudience] = useState('Indian Students & Working Professionals');
  const [tone, setTone] = useState('Authoritative & Actionable');
  const [generating, setGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState(null);

  const handleSelectPreset = (preset) => {
    setTopic(preset.topic);
    setTargetCountry(preset.country);
    setCategory(preset.category);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      message.warning('Please enter a blog topic or title.');
      return;
    }

    setGenerating(true);
    try {
      const { data } = await API.post('/ai/generate-blog', {
        topic: topic.trim(),
        category,
        targetCountry,
        targetAudience,
        tone,
        includeFaq: true
      });

      if (data.success && data.blog) {
        setGeneratedBlog(data.blog);
        message.success('AI Blog Article generated successfully!');
      } else {
        message.error('Failed to generate blog.');
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || 'Error calling AI Content Engine.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedBlog) return;
    onApplyBlog(generatedBlog);
    message.success('Content loaded into Blog Form & Editor!');
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
          <span className="nx-icon-circle" style={{ background: 'var(--ux-brand-soft)', borderColor: 'transparent', color: 'var(--ux-brand-strong)' }}>
            <ThunderboltOutlined />
          </span>
          <span>AI SEO Blog & Educational Article Generator</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={840}
      footer={null}
      destroyOnClose
      style={{ top: 25 }}
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Quick Topic Presets */}
        <div style={{ background: 'var(--ux-surface-2)', padding: 16, borderRadius: 18, border: '1px solid var(--ux-line-2)' }}>
          <div className="nx-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <BulbOutlined /> 1-Click High-Ranking Trending Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_TOPICS.map((preset, idx) => (
              <Tag
                key={idx}
                style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 12, fontWeight: 500, margin: 0, background: '#fff', borderColor: 'var(--ux-line)', color: 'var(--ux-ink)' }}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.label}
              </Tag>
            ))}
          </div>
        </div>

        {/* Input Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
          <div>
            <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
              Article Topic / Primary Keyword <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <Input
              size="large"
              placeholder="e.g. Complete Guide to Study in Germany for Indian Students 2026"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
                Category
              </label>
              <Select value={category} onChange={setCategory} style={{ width: '100%' }} size="large">
                <Option value="Colleges">Colleges</Option>
                <Option value="Courses">Courses</Option>
                <Option value="Exams">Exams</Option>
                <Option value="Expense Calculator">Expense Calculator</Option>
                <Option value="Scholarships">Scholarships</Option>
                <Option value="Visa Guidance">Visa Guidance</Option>
                <Option value="Study Abroad">Study Abroad</Option>
                <Option value="General">General</Option>
              </Select>
            </div>

            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
                Target Country
              </label>
              <Select value={targetCountry} onChange={setTargetCountry} style={{ width: '100%' }} size="large">
                <Option value="USA">USA 🇺🇸</Option>
                <Option value="United Kingdom">United Kingdom 🇬🇧</Option>
                <Option value="Canada">Canada 🇨🇦</Option>
                <Option value="Germany">Germany 🇩🇪</Option>
                <Option value="Australia">Australia 🇦🇺</Option>
                <Option value="Ireland">Ireland 🇮🇪</Option>
                <Option value="Global">Global 🌐</Option>
              </Select>
            </div>

            <div>
              <label className="nx-label" style={{ display: 'block', marginBottom: 6 }}>
                Tone & Style
              </label>
              <Select value={tone} onChange={setTone} style={{ width: '100%' }} size="large">
                <Option value="Authoritative & Actionable">Authoritative & Actionable</Option>
                <Option value="Conversational & Engaging">Conversational & Engaging</Option>
                <Option value="In-Depth Educational Guide">In-Depth Educational Guide</Option>
                <Option value="Quick Counselor Tips">Quick Counselor Tips</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="primary"
          size="large"
          loading={generating}
          onClick={handleGenerate}
          icon={<ThunderboltOutlined />}
          className="nx-btn--accent"
        >
          {generating ? 'AI is Writing Article, Sections & FAQs...' : 'Generate Full SEO Blog Post with AI'}
        </Button>

        {/* Generated Result Preview */}
        {generatedBlog && (
          <div style={{ border: '1px solid var(--ux-line-2)', background: 'var(--ux-surface-2)', padding: 18, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', borderBottom: '1px solid var(--ux-line)', paddingBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ux-text-3)', letterSpacing: '0.08em' }}>Generated Blog Preview</span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ux-ink)' }}>
                  {generatedBlog.title}
                </h4>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12.5 }}>
              <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--ux-line-2)', color: 'var(--ux-text)' }}>
                <strong>URL Slug:</strong> <span style={{ color: 'var(--ux-text-3)' }}>/{generatedBlog.slug}</span>
              </div>
              <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--ux-line-2)', color: 'var(--ux-text)' }}>
                <strong>Estimated Sections:</strong> <span style={{ color: 'var(--ux-ink)', fontWeight: 600 }}>{generatedBlog.sections?.length || 0} Blocks</span>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--ux-line-2)', fontSize: 12.5, color: 'var(--ux-text-2)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--ux-text)' }}>Meta Description:</strong> {generatedBlog.metaDescription}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleApply}
                icon={<CheckCircleOutlined />}
              >
                Insert into Blog Form & Editor
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default AiBlogGeneratorModal;
