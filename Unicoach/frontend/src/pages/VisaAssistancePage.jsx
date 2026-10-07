import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stamp, FileCheck2, Mic, BedDouble, CreditCard, HeartPulse, Plane, CircleCheck, ArrowRight,
} from 'lucide-react';
import ServiceEnquiryForm from '../components/ServiceEnquiryForm';
import BackButton from '../components/ui/BackButton';

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
        <div className="mt-10 text-center">
          <a href="#visa-form" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[14px] font-bold shadow-md shadow-orange-500/20 transition-colors">
            Talk to a visa advisor <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </main>
  );
};

export default VisaAssistancePage;
