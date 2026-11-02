import { useEffect } from 'react';
import AiSopGenerator from '../components/AiSopGenerator';
import { StationSign, Sticker } from '../components/desi/DesiKit';

const STEPS = [
  { label: 'Your details', sub: 'University, course' },
  { label: 'Generate', sub: 'Free' },
  { label: 'Review', sub: 'Full or by section' },
  { label: 'Export', sub: 'Copy or download' },
];

const AiSopGeneratorPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Statement of Purpose (SOP) Writer & Polisher | UniCoach';
  }, []);

  return (
    <div className="min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Desi Pop hero: station sign, highlighted word, step stickers */}
        <div className="pt-6 sm:pt-8 text-center">
          <StationSign hi="Apni kahani likho" en="SOP WRITER" className="-rotate-2" />
          <h1 className="mt-5 font-urbanist text-[36px] sm:text-[54px] font-black tracking-[-0.045em] leading-[1] text-[#16130F]">
            Write your <span className="inline-block px-2.5 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>SOP</span>
          </h1>
          <p className="mt-4 text-[16px] sm:text-[18px] font-medium text-[#3D3830] max-w-2xl mx-auto">
            Add your target course, university and background. Get a unique, course-specific Statement of Purpose to copy or download.
          </p>
          <ol className="mt-6 flex flex-wrap justify-center gap-2.5">
            {STEPS.map((s, i) => (
              <li key={s.label}>
                <Sticker bg={i === 0 ? '#F2B705' : '#FFFFFF'} tilt={i % 2 ? 1 : -1}>
                  <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-[#16130F] text-white text-[11px] font-black">{i + 1}</span>
                  {s.label} <span className="font-medium text-[#5B544A]">· {s.sub}</span>
                </Sticker>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-10">
          <AiSopGenerator />
        </div>
      </div>
    </div>
  );
};

export default AiSopGeneratorPage;
