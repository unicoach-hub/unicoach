import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Loader2, Lock, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import CountrySelect from './ui/CountrySelect';
import { FINDER_FIELD, FinderButton, FinderChip } from './ui/FinderForm';

/**
 * Lead-capture form used by the service pages (education loan, visa & pre-departure…).
 * Every submission lands in Admin → Leads (and Support Requests) through /leads/book-consultation,
 * tagged with `source` so the team can filter by service.
 *
 * `fields`: extra service-specific questions:
 *   { name, label, type: 'select' | 'text' | 'chips', options?: string[], placeholder?, required?, half? }
 * Answers are written into the lead's query/notes as "Label: value" lines.
 */

const INTAKES = ['Fall 2026', 'Spring 2027', 'Fall 2027', 'Later'];

// Fields, labels, chips and button follow the Course Finder form look (ui/FinderForm)
const inputClass = `${FINDER_FIELD} rounded-[10px]`;

// Native selects in the same cream field look as the inputs and the country picker, with one chevron
const Select = ({ value, onChange, placeholder, options }) => (
  <div className="relative">
    <select value={value} onChange={onChange}
      className={`${inputClass} appearance-none !bg-[#F8F5EF] focus:!bg-white pr-9 cursor-pointer ${value ? '' : '!text-[#9A9184]'}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o} className="text-[#16130F]">{o}</option>)}
    </select>
    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9184] pointer-events-none" />
  </div>
);

const Label = ({ children, required }) => (
  <label className="block text-[12.5px] font-semibold text-[#16130F] mb-1.5">
    {children}{required && ' *'}
  </label>
);

const ServiceEnquiryForm = ({
  source,
  title = 'Get a free callback',
  subtitle = 'Our advisor will call you within one working day.',
  submitLabel = 'Request Free Callback',
  fields = [],
  successTitle = 'Request received!',
  successText = 'Our advisor will call you within one working day.',
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    destination: '',
    intake: '',
  });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setAnswer = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));
  const toggleChip = (key, option) =>
    setAnswers((a) => {
      const current = Array.isArray(a[key]) ? a[key] : [];
      return { ...a, [key]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return 'Please enter a valid email address.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) return 'Please enter a valid phone / WhatsApp number.';
    if (!form.destination) return 'Please choose your study destination.';
    for (const field of fields) {
      if (!field.required) continue;
      const value = answers[field.name];
      if (!value || (Array.isArray(value) && value.length === 0)) return `Please fill in: ${field.label}.`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setSubmitting(true);

    const details = fields
      .map((field) => {
        const value = answers[field.name];
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        return `${field.label}: ${Array.isArray(value) ? value.join(', ') : value}`;
      })
      .filter(Boolean);

    try {
      const res = await fetch(`${API_BASE_URL}/leads/book-consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          destination: form.destination,
          intake: form.intake || undefined,
          university: answers.university || undefined,
          query: [`Service: ${source}`, ...details].join(' | '),
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || 'We could not submit your request. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('We could not reach our servers. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E6E0D4] shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] overflow-hidden" style={{ borderRadius: 18 }}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-900">{successTitle}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{successText}</p>
            <p className="mt-4 text-xs text-slate-400">
              Reference: {form.name.split(' ')[0]} · {form.phone}
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="p-5 sm:p-7" noValidate>
            <h3 className="font-outfit text-[20px] sm:text-[22px] font-black text-[#16130F] tracking-[-0.02em]">{title}</h3>
            <p className="text-[13.5px] text-[#5B544A] mt-1 mb-5">{subtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label required>Full name</Label>
                <input className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Aarav Sharma" autoComplete="name" />
              </div>
              <div>
                <Label required>Email</Label>
                <input className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div>
                <Label required>Phone / WhatsApp</Label>
                <input className={inputClass} type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              <div>
                <Label required>Study destination</Label>
                {/* Every country, searchable, with the popular study destinations pinned on top */}
                <CountrySelect
                  value={form.destination}
                  onChange={(name) => setForm((f) => ({ ...f, destination: name }))}
                  placeholder="Select country"
                  extraOptions={['Not decided yet']}
                />
              </div>
              <div>
                <Label>Intake</Label>
                <Select value={form.intake} onChange={set('intake')} placeholder="Select intake" options={INTAKES} />
              </div>

              {fields.map((field) => (
                <div key={field.name} className={`flex flex-col ${field.half ? '' : 'sm:col-span-2'}`}>
                  <Label required={field.required}>{field.label}</Label>
                  <div className="mt-auto">
                  {field.type === 'select' && (
                    <Select value={answers[field.name] || ''} onChange={(e) => setAnswer(field.name, e.target.value)} placeholder="Select" options={field.options} />
                  )}
                  {field.type === 'text' && (
                    <input
                      className={inputClass}
                      value={answers[field.name] || ''}
                      onChange={(e) => setAnswer(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.type === 'chips' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((o) => {
                        const active = (answers[field.name] || []).includes(o);
                        return (
                          <FinderChip key={o} on={active} onClick={() => toggleChip(field.name, o)}>
                            {o}
                          </FinderChip>
                        );
                      })}
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-[13px] font-medium text-[#984D3D] bg-[#FBF2EF] border border-[#C97C6A] rounded-[10px] px-3.5 py-2.5">{error}</p>
            )}

            <FinderButton type="submit" disabled={submitting} className="mt-5 w-full">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Submitting…' : submitLabel}
              {!submitting && <ArrowRight size={15} />}
            </FinderButton>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-[#5B544A]">
              <Lock size={12} /> Your details are only shared with your UniCoach advisor. No spam.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceEnquiryForm;
