import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import './PublicFormPage.css';

const PublicFormPage = () => {
  // Extract slug from URL path /f/:slug
  const slug = window.location.pathname.split('/f/')[1];

  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
    fetch(`${apiUrl}/api/forms/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setFormConfig(data);
        const initial = {};
        data.fields.forEach(f => { initial[f.label] = ''; });
        setFormData(initial);
      })
      .catch(() => setLoadError(true));
  }, [slug]);

  const handleChange = (label, value) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    for (const field of formConfig.fields) {
      if (field.required && (!formData[field.label] || formData[field.label].toString().trim() === '')) {
        setError(`"${field.label}" is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const apiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
      const res = await fetch(`${apiUrl}/api/forms/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Submission failed');
      setSubmitted(true);
      setSuccessMsg(result.message || formConfig.successMessage || 'Thank you!');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (!slug) return <div className="pf-container"><p>Invalid form link</p></div>;
  if (loadError) return (
    <div className="pf-container">
      <div className="pf-card pf-error-card">
        <div className="pf-error-icon">🔗</div>
        <h2>Form Not Found</h2>
        <p>This form link is invalid or the form has been deactivated.</p>
      </div>
    </div>
  );
  if (!formConfig) return (
    <div className="pf-container">
      <div className="pf-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="pf-spinner" />
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading form...</p>
      </div>
    </div>
  );

  // Success state
  if (submitted) return (
    <div className="pf-container">
      <div className="pf-card pf-success-card">
        <div className="pf-success-icon">✅</div>
        <h2>Submitted Successfully!</h2>
        <p>{successMsg}</p>
      </div>
    </div>
  );

  return (
    <div className="pf-container">
      <div className="pf-card">
        {/* Header */}
        <div className="pf-header">
          <div className="pf-brand">
            <span className="pf-brand-icon">🎓</span>
            <span className="pf-brand-text">UniCoach</span>
          </div>
          <h1 className="pf-title">{formConfig.headerTitle || formConfig.name}</h1>
          {formConfig.headerDescription && (
            <p className="pf-description">{formConfig.headerDescription}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pf-form">
          {formConfig.fields.map((field, idx) => (
            <div key={idx} className="pf-field">
              <label className="pf-label">
                {field.label}
                {field.required && <span className="pf-required">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  className="pf-input pf-textarea"
                  placeholder={field.placeholder || field.label}
                  value={formData[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  className="pf-input pf-select"
                  value={formData[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="pf-input"
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  placeholder={field.placeholder || field.label}
                  value={formData[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && <div className="pf-error">{error}</div>}

          <button type="submit" className="pf-submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div className="pf-footer">
          Powered by <strong>UniCoach</strong>
        </div>
      </div>
    </div>
  );
};

export default PublicFormPage;
