import { useEffect } from 'react';
import AiVisaInterviewPrep from '../components/AiVisaInterviewPrep';
import { StationSign, Sticker } from '../components/desi/DesiKit';

const STEPS = [
  { label: 'Pick visa', sub: 'Country, type' },
  { label: 'Answer', sub: 'Officer questions' },
  { label: 'Feedback', sub: 'Score and risks' },
  { label: 'Improve', sub: 'Try again' },
];

const AiVisaPrepPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Mock Visa Interview Simulator & Prep | UniCoach';
  }, []);

  return (
    <div className="min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Desi Pop hero: station sign, highlighted word, step stickers */}
        <div className="pt-6 sm:pt-8 text-center">
          <StationSign hi="Visa officer se pehle practice" en="MOCK VISA INTERVIEW" className="-rotate-2" />
          <h1 className="mt-5 font-urbanist text-[34px] sm:text-[52px] font-black tracking-[-0.045em] leading-[1.05] text-[#16130F]">
            Practise your <span className="inline-block px-2.5 bg-[#B8285B] text-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>visa interview</span>
          </h1>
          <p className="mt-4 text-[16px] sm:text-[18px] font-medium text-[#3D3830] max-w-2xl mx-auto">
            Answer real US F-1, UK, Canada and Germany visa officer questions and get instant confidence and risk feedback.
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
          <AiVisaInterviewPrep />
        </div>
      </div>
    </div>
  );
};

export default AiVisaPrepPage;
