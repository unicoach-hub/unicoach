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
      if (field.type === 'heading') continue;
      const v = formData[field.label];
      const empty = v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : v.toString().trim() === '' || (field.type === 'consent' && v !== 'Yes'));
      if (field.required && empty) {
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
        // ?ref=<mentor handle> credits the mentor who shared this link
        body: JSON.stringify({ data: formData, ref: new URLSearchParams(window.location.search).get('ref') || undefined })
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
      <div className="pf-card pf-head pf-success-card">
        <h1 className="pf-title">{formConfig?.headerTitle || formConfig?.name}</h1>
        <p className="pf-description">{successMsg}</p>
        <button type="button" className="pf-link" onClick={() => { setFormData({}); setSubmitted(false); }}>Submit another response</button>
      </div>
      <p className="pf-footer">UniCoach · Study abroad, guided by seniors</p>
    </div>
  );

  return (
    <div className="pf-container">
      {/* Header card: banner image, then title and description under the brand stripe */}
      <div className="pf-card pf-head">
        {formConfig.headerImage && <img src={formConfig.headerImage} alt="" className="pf-header-image" />}
        <div className="pf-header">
          <h1 className="pf-title">{formConfig.headerTitle || formConfig.name}</h1>
          {formConfig.headerDescription && <p className="pf-description">{formConfig.headerDescription}</p>}
          <p className="pf-required-note"><span className="pf-required">*</span> Indicates required question</p>
        </div>
      </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="pf-form">
          {formConfig.fields.map((field, idx) => field.type === 'heading' ? (
            <div key={idx} className="pf-card pf-section">
              <h3>{field.label}</h3>
              {field.helpText && <p>{field.helpText}</p>}
            </div>
          ) : (
            <div key={idx} className={`pf-card pf-field${error && error.includes(`"${field.label}"`) ? ' pf-field-error' : ''}`}>
              {field.type !== 'consent' && (
                <label className="pf-label">
                  {field.label}
                  {field.required && <span className="pf-required">*</span>}
                </label>
              )}
              {field.helpText && field.type !== 'consent' && <p className="pf-help">{field.helpText}</p>}

              {['radio', 'yesno', 'checkbox'].includes(field.type) ? (
                <div className="pf-chips">
                  {(field.type === 'yesno' ? ['Yes', 'No'] : field.options || []).map((opt) => {
                    const multi = field.type === 'checkbox';
                    const cur = formData[field.label];
                    const on = multi ? (cur || []).includes(opt) : cur === opt;
                    return (
                      <button type="button" key={opt} className={`pf-chip${on ? ' on' : ''}`}
                        onClick={() => handleChange(field.label, multi ? (on ? (cur || []).filter((x) => x !== opt) : [...(cur || []), opt]) : opt)}>
                        {multi && <span className="pf-tick">{on ? '✓' : ''}</span>}{opt}
                      </button>
                    );
                  })}
                </div>
              ) : field.type === 'rating' ? (
                <div className="pf-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} aria-label={`${n} of 5`} className={Number(formData[field.label]) >= n ? 'on' : ''} onClick={() => handleChange(field.label, String(n))}>★</button>
                  ))}
                </div>
              ) : field.type === 'consent' ? (
                <label className="pf-consent">
                  <input type="checkbox" checked={formData[field.label] === 'Yes'} onChange={(e) => handleChange(field.label, e.target.checked ? 'Yes' : '')} />
                  <span>{field.helpText || field.label}{field.required && <span className="pf-required">*</span>}</span>
                </label>
              ) : field.type === 'country' ? (
                <select className="pf-input pf-select" value={formData[field.label] || ''} onChange={(e) => handleChange(field.label, e.target.value)}>
                  <option value="">Select country</option>
                  {['USA', 'UK', 'Canada', 'Australia', 'Ireland', 'Germany', 'France', 'Netherlands', 'New Zealand', 'Singapore', 'Dubai (UAE)', 'Italy', 'Other / Not decided'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : field.type === 'intake' ? (
                <select className="pf-input pf-select" value={formData[field.label] || ''} onChange={(e) => handleChange(field.label, e.target.value)}>
                  <option value="">Select intake</option>
                  {(() => { const y = new Date().getFullYear(); return [y, y + 1, y + 2].flatMap((yr) => ['January', 'May', 'September'].map((m) => `${m} ${yr}`)); })().map((o) => <option key={o} value={o}>{o}</option>)}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              ) : field.type === 'textarea' ? (
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
                  type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'url' ? 'url' : 'text'}
                  placeholder={field.placeholder || field.label}
                  value={formData[field.label] || ''}
                  onChange={e => handleChange(field.label, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && <div className="pf-error">{error}</div>}

          <div className="pf-actions">
            <button type="submit" className="pf-submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
            <button type="button" className="pf-link" onClick={() => { setFormData({}); setError(''); }}>Clear form</button>
          </div>
        </form>

      <p className="pf-footer">Never submit passwords through this form. · <strong>UniCoach</strong></p>
    </div>
  );
};

export default PublicFormPage;
