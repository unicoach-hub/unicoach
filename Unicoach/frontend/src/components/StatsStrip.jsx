import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { getUniversityLogo } from './logoResolver';

// Universities students on UniCoach often shortlist (logos are in /public/logos)
const UNIS = [
  'University of Melbourne', 'Trinity College Dublin', 'University of Manchester', 'Arizona State University',
  'Northeastern University', 'University of Birmingham', 'University College Dublin', 'University of Sydney',
];

// Dark "built on the record" band: a few big numbers, then university chips
const StatsStrip = () => {
  const [scholarships, setScholarships] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/scholarships/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.stats?.totalScholarships >= 500 && setScholarships(d.stats.totalScholarships))
      .catch(() => {});
  }, []);

  const stats = [
    { value: '3,670+', label: 'universities tracked for fees, intakes and requirements' },
    scholarships
      ? { value: scholarships.toLocaleString('en-IN'), label: 'scholarships you can search today' }
      : { value: '₹24Cr+', label: 'in scholarships our students have won' },
    { value: '1:1', label: 'calls with seniors already studying abroad' },
  ];

  return (
    <section className="px-4 sm:px-6 py-10 sm:py-14">
      <div className="relative max-w-[1320px] mx-auto overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#12141F] text-white px-6 sm:px-12 lg:px-16 py-12 sm:py-16">
        <div className="pointer-events-none absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-[#DE5C2B]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-48 -left-32 w-[480px] h-[480px] rounded-full bg-[#1F6F5C]/40 blur-[120px]" />

        <h2 className="relative text-[40px] sm:text-[56px] lg:text-[68px] font-semibold max-w-[760px]">
          Built on real data, not guesswork.
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-10 sm:mt-12">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[24px] bg-white/[0.06] border border-white/10 px-6 py-7">
              <div className="font-heading text-[48px] sm:text-[60px] font-semibold leading-none tracking-[-0.05em]">{s.value}</div>
              <p className="mt-3 text-[15px] text-white/70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-8 flex gap-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex gap-3 shrink-0 animate-[stats-marquee_40s_linear_infinite]">
            {[...UNIS, ...UNIS].map((u, i) => (
              <span key={`${u}-${i}`} className="inline-flex items-center gap-2.5 shrink-0 rounded-full bg-white/[0.06] border border-white/10 pl-1.5 pr-4 py-1.5">
                <img src={getUniversityLogo(u)} alt="" className="w-8 h-8 rounded-full bg-white object-contain p-0.5" loading="lazy" />
                <span className="text-[14px] font-medium whitespace-nowrap">{u}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{'@keyframes stats-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
    </section>
  );
};

export default StatsStrip;
