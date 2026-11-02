import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Scale, BadgeIndianRupee, FileText, Users, Home as HomeIcon,
  ChevronDown, PhoneCall, ArrowRight, CircleCheck,
} from 'lucide-react';
import ServiceEnquiryForm from '../components/ServiceEnquiryForm';
import BackButton from '../components/ui/BackButton';
import { CounterBox } from '../components/ui/BrandElements';
import { StationSign, Sticker, DesiHeading } from '../components/desi/DesiKit';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));

const formatLakh = (n) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2).replace(/\.00$/, '')} Cr` : `₹${Math.round(n / 1e5)} L`);

const LOAN_FIELDS = [
  { name: 'loanAmount', label: 'Loan amount', type: 'select', required: true, half: true,
    options: ['Up to ₹20 Lakh', '₹20–40 Lakh', '₹40–75 Lakh', '₹75 Lakh – ₹1.5 Cr', 'Above ₹1.5 Cr'] },
  { name: 'admitStatus', label: 'Admission status', type: 'select', required: true, half: true,
    options: ['Admit received', 'Applied, awaiting result', 'Not applied yet'] },
  { name: 'university', label: 'University & course', type: 'text', placeholder: 'e.g. University of Toronto, MS Computer Science' },
  { name: 'collateral', label: 'Collateral (property / FD)', type: 'select', half: true,
    options: ['Yes', 'No', 'Not sure'] },
  { name: 'coApplicantIncome', label: 'Co-applicant income (yearly)', type: 'select', half: true,
    options: ['Below ₹5 Lakh', '₹5–10 Lakh', '₹10–20 Lakh', 'Above ₹20 Lakh', 'No co-applicant'] },
];

// Icon tile colours for the step and document cards
const TONES = ['#F2B705', '#14837E', '#B8285B', '#DE5C2B'];

const STEPS = [
  { icon: PhoneCall, title: 'Free profile call', text: 'Share your admit, course and budget. We tell you which loan types you qualify for.' },
  { icon: Scale, title: 'Compare lenders', text: 'Public banks, private banks and NBFCs side by side: interest, margin, collateral and processing fees.' },
  { icon: FileText, title: 'Documents & filing', text: 'We prepare your checklist and help you file with the lender you choose.' },
  { icon: BadgeIndianRupee, title: 'Sanction letter', text: 'Use the sanction letter for your visa financials, and plan disbursement with your university.' },
];

const DOCUMENTS = [
  { icon: Users, group: 'Student', items: ['Admission / offer letter', 'PAN & Aadhaar', '10th, 12th & degree mark sheets', 'IELTS / GRE / TOEFL scores', 'Cost of attendance from the university'] },
  { icon: ShieldCheck, group: 'Co-applicant', items: ['PAN & Aadhaar', 'Last 2 years ITR / Form 16', 'Last 6 months bank statements', 'Salary slips or business proof'] },
  { icon: HomeIcon, group: 'Collateral (if secured loan)', items: ['Property title deed', 'Approved building plan', 'Valuation & legal report (lender arranges)', 'FD / LIC policy, if used instead'] },
];

const FAQS = [
  { q: 'Can I get an education loan without collateral?', a: 'Yes. Many private banks and NBFCs offer unsecured loans for strong profiles and well-ranked universities. Limits and interest depend on your university, course and co-applicant income, so we compare options for your exact case.' },
  { q: 'How much loan can I get?', a: 'Secured loans can usually cover most of your cost of attendance. Unsecured limits are lower and vary by lender and university. Tell us your admit and budget and we will show realistic numbers.' },
  { q: 'When do I start repaying?', a: 'Most education loans have a moratorium: the course duration plus a grace period (often 6–12 months). Some lenders ask for simple interest during the course; paying it reduces your final EMI.' },
  { q: 'Is the loan sanction letter accepted for visa?', a: 'Yes, a sanction letter from a recognised lender is commonly used as proof of funds for student visas (e.g. Canada, USA, UK, Australia). Check the latest rules for your country.' },
  { q: 'Do you charge for loan guidance?', a: 'Our loan guidance call is free. You pay the lender only its own processing fee, if any. We tell you every fee upfront.' },
];

// Defined outside EmiCalculator so React keeps the same element while dragging
const Slider = ({ label, value, display, min, max, step, onChange }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[15px] font-bold text-[#16130F]">{label}</span>
      <span className="font-urbanist text-[16px] font-black text-[#16130F] bg-[#FFF1B8] border-2 border-[#16130F] px-2.5 py-0.5" style={{ borderRadius: 8 }}>{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[#DE5C2B] cursor-pointer"
      aria-label={label}
    />
  </div>
);

const PRIMARY_CTA = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#16130F] text-white text-[15px] font-bold border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform';

const EmiCalculator = () => {
  const [amount, setAmount] = useState(4000000);
  const [rate, setRate] = useState(10.5);
  const [years, setYears] = useState(10);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    const value = r === 0 ? amount / n : (amount * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    return { emi: value, totalPayable: value * n, totalInterest: value * n - amount };
  }, [amount, rate, years]);

  const principalShare = Math.round((amount / totalPayable) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 bg-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] p-5 sm:p-8" style={{ borderRadius: 20 }}>
      <div className="lg:col-span-3 space-y-6">
        <Slider label="Loan amount" value={amount} display={formatLakh(amount)} min={500000} max={15000000} step={100000} onChange={setAmount} />
        <Slider label="Interest rate (per year)" value={rate} display={`${rate.toFixed(1)}%`} min={7} max={15} step={0.1} onChange={setRate} />
        <Slider label="Repayment tenure" value={years} display={`${years} years`} min={3} max={15} step={1} onChange={setYears} />
        <p className="text-[14px] text-[#5B544A]">Indicative only. Actual EMI depends on the lender, moratorium and whether interest is paid during the course.</p>
      </div>
      <div className="lg:col-span-2 bg-[#F2B705] border-[3px] border-[#16130F] p-5 sm:p-6 flex flex-col justify-center" style={{ borderRadius: 16 }}>
        <p className="font-urbanist text-[15px] font-extrabold text-[#16130F]">Monthly EMI</p>
        <p className="mt-1 font-urbanist text-[36px] sm:text-[42px] font-black text-[#16130F] leading-none tracking-[-0.03em]">{formatINR(emi)}</p>
        <div className="mt-5 h-3.5 rounded-full bg-white border-2 border-[#16130F] overflow-hidden" aria-hidden="true">
          <div className="h-full bg-[#16130F] transition-all duration-300" style={{ width: `${principalShare}%` }} />
        </div>
        <div className="mt-3 space-y-1.5 text-[14px] text-[#16130F]">
          <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#16130F]" />Principal</span><span className="font-bold">{formatINR(amount)}</span></div>
          <div className="flex justify-between"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#16130F]" />Total interest</span><span className="font-bold">{formatINR(totalInterest)}</span></div>
          <div className="flex justify-between pt-1.5 border-t-2 border-[#16130F]"><span>Total payable</span><span className="font-black">{formatINR(totalPayable)}</span></div>
        </div>
        <a href="#loan-form" className={`mt-5 ${PRIMARY_CTA}`}>
          Check my loan options <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
};

const EducationLoanPage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = 'Education Loan for Study Abroad | Compare Banks & NBFCs | UniCoach';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px] pt-[88px] sm:pt-[100px] pb-20">
      {/* ── Hero + Form ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-7 pt-2 lg:pt-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <StationSign hi="Paise ki tension kam" en="EDUCATION LOAN" className="-rotate-2" />
          <h1 className="mt-5 font-urbanist text-[34px] sm:text-[46px] lg:text-[54px] font-black text-[#16130F] leading-[1.05] tracking-[-0.04em]">
            Fund your study abroad,{' '}
            <span className="px-2 leading-[1.25] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 10 }}>without the paperwork maze</span>
          </h1>
          <Sticker bg="#FBD9E6" tilt={-1.5} className="mt-5 !text-[14px]">Papa ki FD mat todo, education loan le lo 💸</Sticker>
          <p className="mt-5 text-[16px] sm:text-[17px] font-medium text-[#3D3830] leading-relaxed max-w-xl">
            Compare education loans from banks and NBFCs for your university, with or without collateral.
            We guide you from the first call to the sanction letter you need for your visa.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5 max-w-xl">
            {['Secured & collateral-free options', 'Banks and NBFCs compared side by side', 'Sanction letter for visa proof of funds', 'Free guidance, all fees shown upfront'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[15px] font-semibold text-[#16130F]">
                <CircleCheck size={19} className="text-[#14837E] shrink-0" /> {t}
              </li>
            ))}
          </ul>

          {/* Red-pen proof beside the tall form: one loan, three lenders, how much the rate really costs */}
          <div className="mt-12 max-w-xl">
            <DesiHeading hi="Rate ka khel samjho">1% ka farak, lakhs ka nuksaan.</DesiHeading>
            <p className="mt-3 text-[15px] text-[#3D3830] leading-relaxed">
              Same loan, same 10 years. Bas lender alag. Hum tumhare profile pe lenders compare karke sabse sasta raasta dikhate hain.
            </p>
            <div className="mt-9 mr-2">
              <figure className="relative bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] px-5 pt-5 pb-10 -rotate-[0.8deg] text-[14px] text-[#16130F]" style={{ borderRadius: 12 }}>
                <figcaption className="font-urbanist text-[16px] font-black text-[#16130F] pb-2 border-b-2 border-[#16130F]">₹40 lakh education loan · 10 years</figcaption>
                <div className="mt-2 grid grid-cols-[1fr_64px_96px] gap-x-3 text-[13px] font-bold text-[#5B544A] pb-1.5">
                  <span>Lender</span><span className="text-right">Rate</span><span className="text-right">Total interest</span>
                </div>
                {[
                  ['Public bank, with collateral', '9.5%', '₹22.1 L', true],
                  ['Private bank', '10.75%', '₹25.4 L', false],
                  ['NBFC, no collateral', '12.5%', '₹30.3 L', false],
                ].map(([name, rate, interest, best]) => (
                  <div key={name} className="grid grid-cols-[1fr_64px_96px] gap-x-3 items-center py-2 border-t border-dashed border-[#16130F]/30">
                    <span>{name}</span>
                    <span className="text-right font-semibold">{rate}</span>
                    <span className="text-right font-bold">
                      {best ? (
                        <span className="relative inline-block">
                          {interest}
                          <svg aria-hidden="true" viewBox="0 0 120 40" preserveAspectRatio="none" className="absolute -inset-x-2.5 -inset-y-1.5 w-[calc(100%+20px)] h-[calc(100%+12px)] overflow-visible pointer-events-none">
                            <ellipse cx="60" cy="20" rx="58" ry="17" fill="none" stroke="#D0362E" strokeWidth="2.5" transform="rotate(-3 60 20)" vectorEffect="non-scaling-stroke" />
                          </svg>
                        </span>
                      ) : interest}
                    </span>
                  </div>
                ))}
                <p className="mt-2 text-[13px] text-[#5B544A]">Example rates for illustration. Your rate depends on the lender, your profile and collateral.</p>
                <span className="absolute -top-4 right-4 rotate-[4deg] text-[22px] leading-none text-[#D0362E]" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                  ₹8 lakh bach gaye!
                </span>
                <span className="absolute -bottom-3 left-6 -rotate-2 text-[22px] leading-none text-[#D0362E]" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                  Collateral hai to rate kam
                </span>
              </figure>
            </div>
            <a href="#loan-form" className={`mt-9 ${PRIMARY_CTA}`}>
              Compare lenders for me <ArrowRight size={15} />
            </a>
          </div>
        </motion.div>

        <div id="loan-form" className="lg:col-span-5 lg:sticky lg:top-[100px] scroll-mt-28">
          <ServiceEnquiryForm
            source="Education Loan Enquiry"
            title="Check your loan options"
            subtitle="Free call with a loan advisor within one working day."
            submitLabel="Get My Loan Options"
            fields={LOAN_FIELDS}
            successTitle="We'll call you with your loan options"
            successText="A UniCoach loan advisor will call you within one working day to compare lenders for your university and profile."
          />
        </div>
      </section>

      {/* ── EMI calculator ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <DesiHeading hi="EMI ka hisaab">Education loan EMI calculator</DesiHeading>
        <p className="mt-2 text-[15px] text-[#3D3830] mb-7">See what your monthly repayment could look like after the moratorium.</p>
        <EmiCalculator />
      </section>

      {/* ── How it works ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <DesiHeading hi="Kaise hota hai" className="mb-7">How it works</DesiHeading>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-5" style={{ borderRadius: 14 }}>
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 border-2 border-[#16130F] flex items-center justify-center" style={{ borderRadius: 10, background: TONES[i % TONES.length], color: i % TONES.length === 0 ? '#16130F' : '#FFFFFF' }}><step.icon size={20} /></span>
                <CounterBox highlight={i === STEPS.length - 1}>{i + 1}</CounterBox>
              </div>
              <h3 className="mt-4 font-urbanist text-[18px] font-black text-[#16130F]">{step.title}</h3>
              <p className="mt-1.5 text-[14px] text-[#3D3830] leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Documents ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <DesiHeading hi="Kaagaz ready rakho" className="mb-7">Documents you'll need</DesiHeading>
        <div className="grid md:grid-cols-3 gap-5">
          {DOCUMENTS.map((doc, i) => (
            <div key={doc.group} className="bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-5" style={{ borderRadius: 14 }}>
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 border-2 border-[#16130F] flex items-center justify-center" style={{ borderRadius: 10, background: TONES[i % TONES.length], color: i % TONES.length === 0 ? '#16130F' : '#FFFFFF' }}><doc.icon size={18} /></span>
                <h3 className="font-urbanist text-[18px] font-black text-[#16130F]">{doc.group}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {doc.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-[#16130F]"><CircleCheck size={16} className="text-[#14837E] mt-0.5 shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <DesiHeading hi="Aapke sawaal" className="mb-7 text-center">Frequently asked questions</DesiHeading>
        <div className="space-y-3.5">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className={`bg-white border-[3px] border-[#16130F] overflow-hidden ${openFaq === i ? 'shadow-[5px_5px_0_#F2B705]' : 'shadow-[4px_4px_0_#16130F]'}`} style={{ borderRadius: 14 }}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                aria-expanded={openFaq === i}
                className="no-shine w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer"
              >
                <span className="font-urbanist text-[16px] font-extrabold text-[#16130F]">{faq.q}</span>
                <ChevronDown size={20} className={`text-[#16130F] shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="px-4 sm:px-5 pb-5 -mt-1 text-[15px] text-[#3D3830] leading-relaxed">{faq.a}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="#loan-form" className={PRIMARY_CTA}>
            Talk to a loan advisor <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </main>
  );
};

export default EducationLoanPage;
