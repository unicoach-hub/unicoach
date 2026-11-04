import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Smartphone, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Public account-deletion page. Google Play requires a web link where users can ask for their account
// and data to be deleted; the app itself deletes instantly from Profile → "Account delete karo".
// Requests land in Admin → Support as category "Account Deletion".
const DeleteAccountPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter your name, the email you signed up with, and your phone number.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE_URL}/support-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          category: 'Account Deletion',
          message: `Please delete my UniCoach account and data.${form.message.trim() ? `\n\n${form.message.trim()}` : ''}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send the request.');
      }
      setStatus('sent');
    } catch (err) {
      setError(err.message || 'Could not send the request. Please email privacy@unicoach.com instead.');
      setStatus('idle');
    }
  };

  const input =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:border-[#14837E] focus:ring-4 focus:ring-teal-500/10 transition placeholder:text-slate-400';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pt-[80px]">
      <section className="bg-white border-b border-slate-200/80 pt-10 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight size={13} className="text-slate-400" />
            <span>Legal</span>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#D0362E]">Delete account</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Delete your UniCoach account</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            You can delete your UniCoach account and the data linked to it at any time, from the app or with the form below.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-3">
            <Smartphone size={18} className="text-[#14837E]" /> Fastest: delete in the app
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Open the UniCoach app and log in.</li>
            <li>Go to <strong>Profile</strong> and tap <strong>Account delete karo</strong> at the bottom.</li>
            <li>Type <strong>DELETE</strong> and confirm. Your account is deleted straight away.</li>
          </ol>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-black text-slate-900 mb-3">What gets deleted</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            <li>Your login and study profile (country, course, intake, marks)</li>
            <li>Saved universities, courses and scholarships</li>
            <li>Your chat with your counsellor</li>
            <li>Documents you uploaded (the files are deleted from our storage)</li>
            <li>IELTS and writing practice attempts</li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            We keep a record of your original enquiry (name, email, phone) for our records and where the law requires it, such as for an
            application already submitted to a university. To remove that too, mention it in the form or email{' '}
            <a href="mailto:privacy@unicoach.com" className="text-[#DE5C2B] font-bold hover:underline">privacy@unicoach.com</a>.
          </p>
        </section>

        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-1">
            <Trash2 size={18} className="text-[#D0362E]" /> Ask us to delete it
          </h2>
          <p className="text-sm text-slate-600 mb-5">No app? Send this form. We confirm by email and delete the account within 7 days.</p>

          {status === 'sent' ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-900">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>Request received. We have emailed {form.email.trim()} and will delete the account within 7 days.</span>
            </div>
          ) : (
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Full name</span>
                <input className={input} value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label className="block">
                <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Account email</span>
                <input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Phone</span>
                <input className={input} type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">Anything else? (optional)</span>
                <textarea className={`${input} min-h-[90px]`} value={form.message} onChange={set('message')} />
              </label>
              {error && <p className="sm:col-span-2 text-sm font-semibold text-[#D0362E]">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="sm:col-span-2 py-3.5 rounded-xl bg-[#D0362E] hover:bg-[#b52d26] disabled:opacity-60 text-white font-bold text-sm cursor-pointer"
              >
                {status === 'sending' ? 'Sending…' : 'Request account deletion'}
              </button>
            </form>
          )}
        </section>

        <p className="text-xs text-slate-500">
          See our <Link to="/privacy-policy" className="font-bold text-[#14837E] hover:underline">Privacy Policy</Link> for how we handle your data.
        </p>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
