import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

// Rough yearly cost (tuition + living, ₹ lakh) and usual IELTS ask for a master's.
// Indicative only: the counsellor confirms real numbers per university.
const COUNTRIES = [
  { name: 'Germany', cost: 12, ielts: 6.5 },
  { name: 'France', cost: 16, ielts: 6.0 },
  { name: 'Ireland', cost: 24, ielts: 6.5 },
  { name: 'New Zealand', cost: 27, ielts: 6.5 },
  { name: 'Canada', cost: 28, ielts: 6.5 },
  { name: 'UK', cost: 32, ielts: 6.5 },
  { name: 'Australia', cost: 35, ielts: 6.5 },
  { name: 'USA', cost: 40, ielts: 6.5 },
];

// "Check before you apply": budget + IELTS in, likely countries out, with a stamp
const FitChecker = () => {
  const [budget, setBudget] = useState(25);
  const [ielts, setIelts] = useState(6.5);

  const fits = useMemo(() => COUNTRIES.filter((c) => c.cost <= budget && c.ielts <= ielts), [budget, ielts]);
  const stretch = useMemo(() => COUNTRIES.filter((c) => !fits.includes(c) && c.cost <= budget * 1.25 && c.ielts <= ielts + 0.5), [fits, budget, ielts]);

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-14 bg-[#FFF6E5]">
      <div className="max-w-[1320px] mx-auto rounded-[26px] sm:rounded-[34px] bg-[#F2B705] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] sm:shadow-[8px_8px_0_#16130F] px-5 sm:px-12 lg:px-16 py-9 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-9 lg:gap-16 items-center">
        <div className="min-w-0">
          <span className="inline-block -rotate-3 rounded-lg bg-[#D0362E] text-white text-[14px] font-extrabold px-3.5 py-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]">For students</span>
          <p className="mt-6 font-urbanist font-extrabold text-[16px] leading-none text-[#16130F]">Apply se pehle, fit check karo</p>
          <h2 className="mt-2 font-urbanist font-black text-[36px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.04em] text-[#16130F]">
            Check where you fit before you apply.
          </h2>
          <p className="mt-5 text-[15.5px] sm:text-[17px] font-medium text-[#16130F]/85 max-w-[460px]">
            Move the sliders and see which countries match your budget and English score. No sign-up.
          </p>
          <ul className="mt-7 space-y-3">
            {['Yearly cost for every country', 'Usual IELTS ask for a master\'s', 'Exact shortlist on a free call'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] sm:text-[16px] font-bold text-[#16130F]">
                <span className="w-6 h-6 rounded-md border-2 border-[#16130F] bg-white text-[#16130F] grid place-items-center shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={3.5} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-[18px] sm:rounded-[22px] bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-5 sm:p-9">
          <label className="block text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-[#5B544A]">Budget per year</label>
          <div className="font-urbanist text-[42px] sm:text-[58px] font-black leading-none tracking-[-0.04em] text-[#16130F] mt-1.5">₹{budget} lakh</div>
          <input type="range" min={8} max={60} step={1} value={budget} onChange={(e) => setBudget(+e.target.value)}
            className="w-full mt-5 accent-[#D0362E]" aria-label="Budget per year in lakh rupees" />

          <label className="block text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-[#5B544A] mt-7">IELTS score (or equivalent)</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min={5} max={8.5} step={0.5} value={ielts} onChange={(e) => setIelts(+e.target.value)}
              className="flex-1 accent-[#D0362E]" aria-label="IELTS score" />
            <span className="font-urbanist text-[30px] font-black text-[#16130F] w-14 text-right">{ielts.toFixed(1)}</span>
          </div>

          <div className="relative mt-7 rounded-[14px] bg-[#DDF3EF] border-[2.5px] border-[#16130F] p-5 sm:p-6 overflow-hidden">
            <div className="text-[12px] font-extrabold tracking-[0.12em] uppercase text-[#14837E]">Likely fits</div>
            <div className="font-urbanist text-[24px] sm:text-[30px] font-black tracking-[-0.02em] text-[#16130F] mt-1 pr-20 sm:pr-28 leading-tight">
              {fits.length ? fits.map((c) => c.name).join(', ') : 'Not yet, but there are ways in'}
            </div>
            <p className="mt-2 text-[14px] font-medium text-[#3D372F] sm:pr-28">
              {stretch.length
                ? `Within reach with a scholarship or a better score: ${stretch.map((c) => c.name).join(', ')}.`
                : fits.length ? 'Your counsellor will match exact universities.' : 'Scholarships, loans or a higher score can open more countries.'}
            </p>
            <div className={`absolute right-3 top-3 sm:right-4 sm:top-1/2 sm:-translate-y-1/2 rotate-[-14deg] w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full border-[3px] bg-white grid place-items-center text-center font-urbanist font-black leading-tight text-[10.5px] sm:text-[13px] ${fits.length ? 'border-[#D0362E] text-[#D0362E]' : 'border-[#5B544A] text-[#5B544A]'}`}>
              {fits.length ? <>FITS<br />YOUR<br />BUDGET</> : <>NEEDS<br />A PLAN</>}
            </div>
          </div>

          <Link to="/book-consultation" className="no-shine group mt-6 inline-flex items-center gap-3 rounded-full bg-[#16130F] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#DE5C2B] transition-all pl-6 pr-1.5 py-1.5 text-[15px] font-bold">
            Get my exact shortlist
            <span className="w-9 h-9 rounded-full bg-white text-[#16130F] grid place-items-center transition-transform group-hover:translate-x-1"><ArrowRight className="w-4 h-4" /></span>
          </Link>
          <p className="mt-4 text-[12.5px] text-[#5B544A]">Indicative yearly cost (tuition + living) for a master&apos;s. Not admission advice.</p>
        </div>
      </div>
    </section>
  );
};

export default FitChecker;
