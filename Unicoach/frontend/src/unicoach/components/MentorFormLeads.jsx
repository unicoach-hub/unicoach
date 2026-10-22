import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, FileText, Loader2, Search } from 'lucide-react';
import { getMentorFormReferrals } from '../api/unicoachApi';
import { SITE_URL } from '../../config';

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const csvCell = (v) => `"${String(Array.isArray(v) ? v.join(', ') : v ?? '').replace(/"/g, '""')}"`;

// Mentor dashboard → "Form leads": the UniCoach forms a mentor can share (each link carries
// ?ref=<handle>) and a sheet of every student who filled one through the mentor's link.
const MentorFormLeads = ({ handle }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!handle) return undefined;
    let alive = true;
    getMentorFormReferrals(handle)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [handle]);

  const linkFor = (slug) => `${SITE_URL}/f/${slug}?ref=${encodeURIComponent(data?.handle || handle || '')}`;
  const copy = async (slug) => {
    try {
      await navigator.clipboard.writeText(linkFor(slug));
      setCopied(slug);
      setTimeout(() => setCopied(''), 1600);
    } catch { /* clipboard blocked; the link is visible to copy by hand */ }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.submissions || []).filter((s) =>
      (!formFilter || s.formName === formFilter) &&
      (!q || Object.values(s.data).join(' ').toLowerCase().includes(q)));
  }, [data, search, formFilter]);

  // Columns = every question asked across the shown submissions, in first-seen order
  const columns = useMemo(() => {
    const seen = [];
    rows.forEach((r) => Object.keys(r.data).forEach((k) => { if (!seen.includes(k)) seen.push(k); }));
    return seen;
  }, [rows]);

  const download = () => {
    const header = ['Submitted on', 'Form', 'Status', ...columns];
    const lines = rows.map((r) => [fmt(r.submittedAt), r.formName, r.stage, ...columns.map((c) => r.data[c])].map(csvCell).join(','));
    const blob = new Blob(['﻿' + [header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `UniCoach_form_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (error) return <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-red-600">{error}</div>;
  if (!data) return <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#DE5C2B]" /></div>;

  const formNames = [...new Set((data.submissions || []).map((s) => s.formName))];

  return (
    <div className="space-y-5">
      {/* Share links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-[16px] font-semibold text-slate-900">Your form links</h3>
        <p className="text-[13px] text-slate-500 mt-0.5">Share these with students. Anyone who fills a form through your link shows up below.</p>
        <div className="mt-4 space-y-2">
          {data.forms.length === 0 && <p className="text-[13px] text-slate-400">No forms are live right now.</p>}
          {data.forms.map((f) => (
            <div key={f.slug} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
              <FileText className="w-4 h-4 text-[#DE5C2B] shrink-0" />
              <span className="text-[13.5px] font-semibold text-slate-800">{f.name}</span>
              <span className="text-[12px] text-slate-500 truncate flex-1 min-w-[180px]">{linkFor(f.slug)}</span>
              <button type="button" onClick={() => copy(f.slug)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-slate-200 text-[12.5px] font-semibold text-slate-700 hover:border-[#DE5C2B] hover:text-[#DE5C2B] cursor-pointer">
                {copied === f.slug ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sheet of submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold text-slate-900">Students from your links <span className="text-slate-400 font-normal">({data.submissions.length})</span></h3>
            <p className="text-[13px] text-slate-500 mt-0.5">What each student filled and when.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="h-9 pl-9 pr-3 rounded-full border border-slate-200 text-[13px] outline-none focus:border-[#DE5C2B]" />
            </label>
            {formNames.length > 1 && (
              <select value={formFilter} onChange={(e) => setFormFilter(e.target.value)} className="h-9 px-3 rounded-full border border-slate-200 text-[13px] bg-white">
                <option value="">All forms</option>
                {formNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
            <button type="button" onClick={download} disabled={!rows.length} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#111] text-white text-[13px] font-semibold disabled:opacity-40 cursor-pointer">
              <Download className="w-4 h-4" /> Download Excel
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 text-center text-[13px] text-slate-400 py-8">No submissions yet. Share a link above to get started.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-[13px]">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">#</th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Submitted on</th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Form</th>
                  <th className="px-3 py-2.5 font-semibold whitespace-nowrap">Status</th>
                  {columns.map((c) => <th key={c} className="px-3 py-2.5 font-semibold whitespace-nowrap">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r._id} className="hover:bg-orange-50/40">
                    <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{fmt(r.submittedAt)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{r.formName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#C04A1D] text-[12px] font-semibold">{r.stage}</span></td>
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2.5 text-slate-700 max-w-[260px] truncate" title={String(r.data[c] ?? '')}>
                        {Array.isArray(r.data[c]) ? r.data[c].join(', ') : String(r.data[c] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorFormLeads;
