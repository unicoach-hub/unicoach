import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Globe, Award, CalendarDays, Clock, MapPin, Wallet, FileText, GraduationCap, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCourseDetail } from '../utils/searchApi';

// UniCoach brand accent (was CourseFinder blue #226CF5).
const BLUE = '#DE5C2B';
const FLAG = { 1: '🇺🇸', 2: '🇦🇺', 3: '🇨🇦', 4: '🇬🇧', 5: '🇳🇿', 6: '🇸🇬', 7: '🇦🇪', 8: '🇮🇪', 9: '🇩🇪', 10: '🇫🇷', 16: '🇮🇹', 19: '🇪🇸', 25: '🇲🇾' };
const money = (m) => (m && m.amount ? `${m.currency || ''} ${Number(m.amount).toLocaleString()}`.trim() : null);

const Section = ({ title, children }) => (
  <div className="bg-white border border-slate-200" style={{ borderRadius: 4 }}>
    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 font-['Onest',sans-serif] font-semibold text-[14px] text-slate-700" style={{ borderRadius: '4px 4px 0 0' }}>{title}</div>
    <div className="p-4">{children}</div>
  </div>
);
const Row = ({ label, value, strong }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50 last:border-0 text-[13.5px]">
    <span className="text-slate-500">{label}</span>
    <span className={`text-right ${strong ? 'font-semibold text-[#DE5C2B]' : 'font-medium text-slate-700'}`}>{value || '—'}</span>
  </div>
);

export default function ProgramDetailPage() {
  const { cfId } = useParams();
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth() || {};
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { setLoading(false); return; }
    setLoading(true); setNotFound(false);
    getCourseDetail(cfId).then((data) => { setD(data); document.title = `${data?.name || 'Program'} | UniCoach`; })
      .catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [cfId, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-[76px] flex items-center justify-center px-4 font-['Onest',sans-serif]">
        <div className="bg-white border border-slate-200 p-8 max-w-md w-full text-center" style={{ borderRadius: 6 }}>
          <div className="w-14 h-14 mx-auto flex items-center justify-center" style={{ background: '#eef4ff', borderRadius: 999 }}><Lock size={24} color={BLUE} /></div>
          <h1 className="font-['Onest',sans-serif] text-xl font-bold text-slate-800 mt-4">Sign in to view this program</h1>
          <p className="text-[14px] text-slate-500 mt-2">Create a free account to see full program details, fees, requirements and intakes.</p>
          <button onClick={() => openLoginModal && openLoginModal()} className="mt-5 w-full text-white text-[14px] font-semibold py-3" style={{ background: BLUE, borderRadius: 4 }}>Sign in / Create account</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-slate-50 pt-[120px] flex items-center justify-center text-slate-400 font-['Onest',sans-serif]"><Loader2 className="animate-spin mr-2" size={22} /> Loading program…</div>;
  if (notFound || !d) return (
    <div className="min-h-screen bg-slate-50 pt-[120px] text-center font-['Onest',sans-serif]">
      <p className="text-slate-500">Program not found.</p>
      <button onClick={() => navigate('/search-programs')} className="mt-3 text-[#DE5C2B] font-medium">← Back to search</button>
    </div>
  );

  const u = d.university || {};
  const rk = u.rankings || {};
  const eng = d.testRequirements?.english || [];
  const std = d.testRequirements?.standardized || [];
  const intakes = d.intakesList || d.intakes || [];
  const avgSch = d.averageScholarship ? `${(d.tuitionFee?.currency) || ''} ${Number(d.averageScholarship).toLocaleString()}`.trim() : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-[76px] pb-16 font-['Onest',sans-serif]">
      {/* top bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 hover:text-[#DE5C2B]"><ArrowLeft size={16} /> Back</button>
          <div className="font-['Onest',sans-serif] font-semibold text-slate-700 text-[15px]">Program Details</div>
          <div className="text-[12px] text-slate-400">{d['last-updated-on'] ? `Updated ${new Date(d['last-updated-on']).toLocaleDateString()}` : ''}</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* left: university card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 p-5 text-center sticky top-[90px]" style={{ borderRadius: 4 }}>
            <div className="w-20 h-20 mx-auto flex items-center justify-center font-['Onest',sans-serif] font-bold text-[22px]" style={{ background: '#eef4ff', color: BLUE, borderRadius: 8 }}>
              {(u.name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('')}
            </div>
            <h2 className="font-['Onest',sans-serif] font-bold text-[16px] text-slate-800 mt-3 leading-snug">{u.name}</h2>
            <div className="text-[13px] text-slate-500 mt-1">{FLAG[u.cfCountryId] || ''} {[u.city, u.state, u.countryName].filter(Boolean).join(', ')}</div>
            {(rk.qs || rk.usNews) && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {rk.qs ? <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium" style={{ background: '#FDF4EF', color: BLUE, borderRadius: 2 }}><Award size={11} />QS #{rk.qs}</span> : null}
                {rk.usNews ? <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium" style={{ background: '#F1F6F2', color: '#2E4836', borderRadius: 2 }}>US News #{rk.usNews}</span> : null}
                {rk.webometricsWorld ? <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium" style={{ background: '#f8fafc', color: '#475569', borderRadius: 2 }}>Webometrics #{rk.webometricsWorld}</span> : null}
              </div>
            )}
            {u['website-url'] && <a href={u['website-url'].startsWith('http') ? u['website-url'] : `https://${u['website-url']}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-[#DE5C2B] font-medium mt-3"><Globe size={13} /> University website</a>}
            <button onClick={() => navigate('/search-programs')} className="mt-4 w-full text-[13px] text-[#DE5C2B] border border-[#DE5C2B] py-2" style={{ borderRadius: 4 }}>Back to search</button>
          </div>
        </div>

        {/* right: program details */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="font-['Onest',sans-serif] text-[22px] font-bold text-slate-800 leading-snug">{d.name}</h1>
            {d.concentration && <p className="text-[13px] text-slate-500 mt-1">{d.concentration}</p>}
          </div>

          <Section title="Program Details">
            <Row label="Duration" value={d.duration} />
            <Row label="Campus" value={d.campus} />
            <Row label="Intakes" value={Array.isArray(intakes) ? intakes.join(', ') : intakes} />
            <Row label="Application Deadline" value={d.applicationDeadline} />
            <Row label="Application Fee" value={d.applicationFee?.isWaived ? 'Waived' : (money(d.applicationFee) || 'N/A')} />
            <Row label="Yearly Tuition Fee" value={money(d.tuitionFee)} strong />
            {money(d.deposit) && <Row label="Initial Deposit" value={money(d.deposit)} />}
            {avgSch && <Row label="Average Scholarship" value={avgSch} />}
            {d.tuitionFeeRemarks && <p className="text-[12.5px] text-slate-500 mt-2 pt-2 border-t border-slate-100">{d.tuitionFeeRemarks}</p>}
          </Section>

          <Section title="English Proficiency Test Requirements">
            {eng.length ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">{eng.map((t, i) => <Row key={i} label={t.test} value={t.score} />)}</div>
            ) : <p className="text-[13px] text-slate-400">Please refer to the university's official page.</p>}
          </Section>

          <Section title="Standardized Test Requirements">
            {std.length ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">{std.map((t, i) => <Row key={i} label={t.test} value={t.score} />)}</div>
            ) : <p className="text-[13px] text-slate-500">No Test Requirement.</p>}
          </Section>

          <Section title="Entry Requirements">
            <p className="text-[13.5px] text-slate-600 whitespace-pre-line">{d.entryRequirements || "Please refer to the university's official page for detailed entry requirements."}</p>
          </Section>

          {d.remarks && <Section title="Remarks"><p className="text-[13.5px] text-slate-600 whitespace-pre-line">{d.remarks}</p></Section>}

          <div className="flex gap-3">
            <button onClick={() => navigate('/search-programs')} className="text-[14px] font-semibold text-white px-5 py-2.5" style={{ background: BLUE, borderRadius: 4 }}>Explore more programs</button>
          </div>
        </div>
      </div>
    </div>
  );
}
