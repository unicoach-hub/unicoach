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
    <section className="px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-[1320px] mx-auto rounded-[32px] sm:rounded-[40px] bg-[#FFC93C] px-6 sm:px-12 lg:px-16 py-12 sm:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <span className="inline-block -rotate-3 rounded-full bg-[#C04A1D] text-white text-[14px] font-semibold px-4 py-1.5 shadow-lg">For students</span>
          <h2 className="mt-6 text-[44px] sm:text-[60px] lg:text-[72px] font-semibold text-[#16130F]">
            Check where you fit before you apply.
          </h2>
          <p className="mt-5 text-[17px] text-[#16130F]/75 max-w-[460px]">
            Move the sliders and see which countries match your budget and English score. No sign-up.
          </p>
          <ul className="mt-7 space-y-3">
            {['Yearly cost for every country', 'Usual IELTS ask for a master\'s', 'Exact shortlist on a free call'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[16px] font-semibold text-[#16130F]">
                <span className="w-6 h-6 rounded-full bg-[#16130F] text-white grid place-items-center"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] bg-white p-6 sm:p-9 shadow-[0_30px_60px_-30px_rgba(22,19,15,0.35)]">
          <label className="block text-[14px] font-semibold text-[#16130F]/70">Budget per year</label>
          <div className="font-heading text-[48px] sm:text-[60px] font-semibold leading-none tracking-[-0.05em] text-[#16130F] mt-1">₹{budget} lakh</div>
          <input type="range" min={8} max={60} step={1} value={budget} onChange={(e) => setBudget(+e.target.value)}
            className="w-full mt-5 accent-[#C04A1D]" aria-label="Budget per year in lakh rupees" />

          <label className="block text-[14px] font-semibold text-[#16130F]/70 mt-7">IELTS score (or equivalent)</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min={5} max={8.5} step={0.5} value={ielts} onChange={(e) => setIelts(+e.target.value)}
              className="flex-1 accent-[#C04A1D]" aria-label="IELTS score" />
            <span className="font-heading text-[28px] font-semibold text-[#16130F] w-14 text-right">{ielts.toFixed(1)}</span>
          </div>

          <div className="relative mt-7 rounded-[22px] bg-[#BFE3FF] p-6 overflow-hidden">
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-[#16130F]/70">Likely fits</div>
            <div className="font-heading text-[26px] sm:text-[30px] font-semibold text-[#16130F] mt-1 pr-28 leading-tight">
              {fits.length ? fits.map((c) => c.name).join(', ') : 'Not yet, but there are ways in'}
            </div>
            <p className="mt-2 text-[14px] text-[#16130F]/75 pr-28">
              {stretch.length
                ? `Within reach with a scholarship or a better score: ${stretch.map((c) => c.name).join(', ')}.`
                : fits.length ? 'Your counsellor will match exact universities.' : 'Scholarships, loans or a higher score can open more countries.'}
            </p>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 rotate-[-14deg] w-24 h-24 rounded-full border-[3px] grid place-items-center text-center font-heading font-bold leading-tight text-[13px] ${fits.length ? 'border-[#E5484D] text-[#E5484D]' : 'border-[#64748B] text-[#64748B]'}`}>
              {fits.length ? <>FITS<br />YOUR<br />BUDGET</> : <>NEEDS<br />A PLAN</>}
            </div>
          </div>

          <Link to="/book-consultation" className="group mt-6 inline-flex items-center gap-3 rounded-full bg-[#16130F] text-white pl-6 pr-2 py-2 text-[15px] font-semibold">
            Get my exact shortlist
            <span className="w-9 h-9 rounded-full bg-white text-[#16130F] grid place-items-center transition-transform group-hover:translate-x-1"><ArrowRight className="w-4 h-4" /></span>
          </Link>
          <p className="mt-4 text-[12px] text-[#16130F]/55">Indicative yearly cost (tuition + living) for a master&apos;s. Not admission advice.</p>
        </div>
      </div>
    </section>
  );
};

export default FitChecker;
