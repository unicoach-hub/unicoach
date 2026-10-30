import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stamp, FileCheck2, Mic, BedDouble, CreditCard, HeartPulse, Plane, CircleCheck, ArrowRight,
} from 'lucide-react';
import ServiceEnquiryForm from '../components/ServiceEnquiryForm';
import BackButton from '../components/ui/BackButton';
import { DesiSticker, MemeLine } from '../components/desi/Desi';
import { TruckArtFrame } from '../components/desi/DesiPop';

const VISA_FIELDS = [
  { name: 'visaType', label: 'Visa type', type: 'select', required: true, half: true,
    options: ['Student visa', 'Dependent / spouse visa', 'Post-study work visa', 'Not sure'] },
  { name: 'admitStatus', label: 'Admission status', type: 'select', required: true, half: true,
    options: ['Admit received', 'CAS / I-20 / CoE received', 'Applied, awaiting result', 'Not applied yet'] },
  { name: 'refusal', label: 'Any previous visa refusal?', type: 'select', half: true, options: ['No', 'Yes'] },
  { name: 'university', label: 'University (if known)', type: 'text', half: true, placeholder: 'e.g. University of Manchester' },
  { name: 'services', label: 'What do you need help with?', type: 'chips', required: true,
    options: ['Visa application & filing', 'Financial documents review', 'Mock visa interview', 'Accommodation', 'Forex card / money transfer', 'Travel & health insurance', 'Flight booking', 'Pre-departure briefing'] },
];

const SERVICES = [
  { icon: Stamp, title: 'Visa filing', text: 'Country-specific checklist, form filling (DS-160, GTE/GS, SDS…) and appointment booking.' },
  { icon: FileCheck2, title: 'Financial documents review', text: 'Proof of funds, loan sanction letters and sponsor documents checked before you submit.' },
  { icon: Mic, title: 'Mock visa interview', text: 'Practise with our AI visa officer and a human advisor before the real interview.', link: '/ai-tools/visa-prep', linkText: 'Try the AI mock interview' },
  { icon: BedDouble, title: 'Accommodation', text: 'Verified student housing near campus, shortlisted to your budget.' },
  { icon: CreditCard, title: 'Forex & money transfer', text: 'Forex cards and fee transfers to your university with clear exchange rates.' },
  { icon: HeartPulse, title: 'Insurance', text: 'Health and travel insurance that meets your university and visa requirements.' },
];

const VisaAssistancePage = () => {
  useEffect(() => {
    document.title = 'Student Visa & Pre-Departure Assistance | UniCoach';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-[#FAF9F6] pt-[88px] sm:pt-[100px] pb-16">
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-7 pt-2 lg:pt-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 text-[12px] font-bold text-[#C04A1D] shadow-2xs">
            <Plane size={14} /> Visa & Pre-Departure
          </span>
          <h1 className="mt-4 font-outfit text-[34px] sm:text-[46px] lg:text-[52px] font-black text-[#111111] leading-[1.06] tracking-[-0.03em]">
            From admit to arrival, <span className="text-[#DE5C2B]">we handle the hard parts</span>
          </h1>
          <MemeLine>Visa की टेंशन? Ghabrao mat, हम हैं ना 🛂</MemeLine>
          <p className="mt-4 text-[15px] sm:text-[16.5px] text-slate-600 leading-relaxed max-w-xl">
            Visa filing, document checks, interview practice, housing, forex and insurance, all with one advisor
            who knows your country's latest rules.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5 max-w-xl">
            {['One advisor for every step', 'Document check before you submit', 'AI + human mock interviews', 'Housing, forex & insurance sorted'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[13.5px] font-medium text-slate-800">
                <CircleCheck size={17} className="text-[#DE5C2B] shrink-0" /> {t}
              </li>
            ))}
          </ul>
          {/* Red-pen proof fills the space beside the tall form: the UK funds rule most refusals trip on (gov.uk/student-visa/money) */}
          <div className="mt-12 max-w-xl">
            <h2 className="font-outfit text-[24px] sm:text-[30px] font-black text-[#111111] tracking-[-0.03em] leading-[1.08]">Visa marks se nahi, ek galat date se reject hota hai.</h2>
            <p className="mt-3 text-[14.5px] text-slate-600 leading-relaxed">
              Bank statement, offer letter, loan letter. Hum official rule ke saath tumhara asli document red pen se check karte hain, file karne se pehle.
            </p>
            <div className="mt-9 mr-2">
            <figure className="relative bg-white border border-slate-200 rounded-md shadow-[0_18px_40px_-18px_rgba(22,19,15,0.35)] px-5 pt-5 pb-10 rotate-[1deg] text-[13.5px] leading-relaxed text-slate-800">
              <figcaption className="text-[13px] font-bold text-slate-900 pb-2 border-b border-slate-200">UK Student visa: financial evidence</figcaption>
              <p className="mt-3">You must show you have enough money to pay your course fees and living costs.</p>
              <p className="mt-3">
                The money must have been held in your account for{' '}
                <mark className="bg-[#FFE36E] px-0.5">at least 28 consecutive days.</mark>
              </p>
              <p className="mt-3">
                The end date of the 28-day period must be{' '}
                <span className="relative inline-block font-semibold">
                  within 31 days
                  <svg aria-hidden="true" viewBox="0 0 120 40" preserveAspectRatio="none" className="absolute -inset-x-2 -inset-y-1.5 w-[calc(100%+16px)] h-[calc(100%+12px)] overflow-visible pointer-events-none">
                    <ellipse cx="60" cy="20" rx="58" ry="17" fill="none" stroke="#D0312D" strokeWidth="2.5" transform="rotate(-3 60 20)" vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>{' '}
                of the date you apply.
              </p>
              <p className="mt-3 text-slate-500">Statements must show the account holder&apos;s name, the bank&apos;s name and the balance.</p>
              <span className="absolute -top-4 right-4 rotate-[5deg] text-[22px] leading-none text-[#D0312D]" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                28 se ek din bhi kam = refusal
              </span>
              <span className="absolute -bottom-3 left-6 -rotate-3 text-[22px] leading-none text-[#D0312D]" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                Purana statement = seedha refusal risk
              </span>
            </figure>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#visa-form" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[14px] font-bold transition-colors">
                Get a free document check <ArrowRight size={15} />
              </a>
              <a href="https://www.gov.uk/student-visa/money" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-300 hover:border-slate-900 text-[14px] font-bold text-slate-900 transition-colors">
                Read the rules
              </a>
            </div>
          </div>
        </motion.div>

        <div id="visa-form" className="lg:col-span-5 lg:sticky lg:top-[100px] scroll-mt-28">
          <ServiceEnquiryForm
            source="Visa & Pre-Departure Enquiry"
            title="Get visa & pre-departure help"
            subtitle="Tell us where you're going. An advisor will call you within one working day."
            submitLabel="Request a Callback"
            fields={VISA_FIELDS}
            successTitle="We'll call you soon"
            successText="A UniCoach visa advisor will call you within one working day with your country checklist and next steps."
          />
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <h2 className="font-outfit text-[26px] sm:text-[32px] font-black text-[#111111] tracking-tight mb-6">Everything before you fly</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col">
              <span className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center"><s.icon size={19} /></span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed flex-1">{s.text}</p>
              {s.link && (
                <Link to={s.link} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#DE5C2B] hover:text-[#C04A1D]">
                  {s.linkText} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
        <TruckArtFrame className="mt-12">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-7 xl:gap-8 px-6 py-7 sm:px-10 sm:py-8 text-center xl:text-left">
            <div className="xl:shrink-0">
              <p className="font-['Rozha_One',serif] text-[22px] sm:text-[26px] leading-none text-[#16130F]">ये हमारी</p>
              <p className="font-['Anton',sans-serif] uppercase text-[40px] sm:text-[52px] leading-[0.95] text-[#F2B705] [text-shadow:3px_3px_0_#16130F]">Visa</p>
              <p className="font-['Rozha_One',serif] text-[22px] sm:text-[26px] leading-none text-[#16130F]">लग गई है!</p>
              <p className="mt-3 text-[13.5px] font-semibold text-[#08332F] max-w-sm mx-auto xl:mx-0">Your turn next. One advisor, every document checked before you file.</p>
            </div>
            {/* passport with an approved stamp, and what gets checked before filing */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="relative shrink-0" aria-hidden="true">
                <div className="w-[112px] h-[150px] rounded-xl bg-[#1F2A5C] border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-6 flex flex-col items-center justify-center gap-2">
                  <span className="w-11 h-11 rounded-full border-2 border-[#F2B705] flex items-center justify-center">
                    <Plane size={20} className="text-[#F2B705]" />
                  </span>
                  <span className="font-['Anton',sans-serif] uppercase tracking-[0.14em] text-[13px] text-[#F2B705]">Passport</span>
                </div>
                <span className="absolute -right-8 -bottom-3 rotate-[-14deg] rounded-full border-[3px] border-[#E4007C] bg-white/90 px-3 py-1.5 font-['Anton',sans-serif] uppercase text-[14px] leading-none tracking-wide text-[#E4007C]">
                  Visa approved
                </span>
              </div>
              <ul className="shrink-0 grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-1 gap-2 text-left">
                {['Funds proof', 'Forms filled right', 'Mock interview', 'Appointment booked'].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white border-2 border-[#16130F] px-3 py-1.5 text-[12.5px] font-bold text-[#16130F]">
                    <CircleCheck size={15} className="text-[#0E9F8E] shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <a href="#visa-form" className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16130F] hover:bg-black text-[#F2B705] text-[14px] font-bold shadow-[3px_3px_0_#F2B705] transition-colors">
              Talk to a visa advisor <ArrowRight size={15} />
            </a>
          </div>
        </TruckArtFrame>
      </section>
    </main>
  );
};

export default VisaAssistancePage;
