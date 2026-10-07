import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Landmark, ShieldCheck, Scale, BadgeIndianRupee, FileText, Users, Home as HomeIcon,
  ChevronDown, PhoneCall, ArrowRight, CircleCheck,
} from 'lucide-react';
import ServiceEnquiryForm from '../components/ServiceEnquiryForm';
import BackButton from '../components/ui/BackButton';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));

const formatLakh = (n) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2).replace(/\.00$/, '')} Cr` : `₹${Math.round(n / 1e5)} L`);

const LOAN_FIELDS = [
  { name: 'loanAmount', label: 'Loan amount needed', type: 'select', required: true, half: true,
    options: ['Up to ₹20 Lakh', '₹20–40 Lakh', '₹40–75 Lakh', '₹75 Lakh – ₹1.5 Cr', 'Above ₹1.5 Cr'] },
  { name: 'admitStatus', label: 'Admission status', type: 'select', required: true, half: true,
    options: ['Admit received', 'Applied, awaiting result', 'Not applied yet'] },
  { name: 'university', label: 'University & course', type: 'text', placeholder: 'e.g. University of Toronto, MS Computer Science' },
  { name: 'collateral', label: 'Can you offer collateral (property / FD)?', type: 'select', half: true,
    options: ['Yes', 'No', 'Not sure'] },
  { name: 'coApplicantIncome', label: "Co-applicant's annual income", type: 'select', half: true,
    options: ['Below ₹5 Lakh', '₹5–10 Lakh', '₹10–20 Lakh', 'Above ₹20 Lakh', 'No co-applicant'] },
];

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
      <span className="text-[13px] font-semibold text-slate-600">{label}</span>
      <span className="text-[14px] font-black text-slate-900 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-0.5">{display}</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.10)]">
      <div className="lg:col-span-3 space-y-6">
        <Slider label="Loan amount" value={amount} display={formatLakh(amount)} min={500000} max={15000000} step={100000} onChange={setAmount} />
        <Slider label="Interest rate (per year)" value={rate} display={`${rate.toFixed(1)}%`} min={7} max={15} step={0.1} onChange={setRate} />
        <Slider label="Repayment tenure" value={years} display={`${years} years`} min={3} max={15} step={1} onChange={setYears} />
        <p className="text-[11.5px] text-slate-400">Indicative only. Actual EMI depends on the lender, moratorium and whether interest is paid during the course.</p>
      </div>
      <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#FFF8F4] to-[#FFEFE6] border border-orange-100 p-5 sm:p-6 flex flex-col justify-center">
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#C04A1D]">Monthly EMI</p>
        <p className="mt-1 text-[34px] sm:text-[40px] font-black text-slate-900 leading-none tracking-tight">{formatINR(emi)}</p>
        <div className="mt-5 h-2.5 rounded-full bg-orange-100 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-[#DE5C2B] rounded-full transition-all duration-300" style={{ width: `${principalShare}%` }} />
        </div>
        <div className="mt-3 space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-[#DE5C2B]" />Principal</span><span className="font-bold text-slate-900">{formatINR(amount)}</span></div>
          <div className="flex justify-between"><span className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-orange-200" />Total interest</span><span className="font-bold text-slate-900">{formatINR(totalInterest)}</span></div>
          <div className="flex justify-between pt-1.5 border-t border-orange-100"><span className="text-slate-600">Total payable</span><span className="font-black text-slate-900">{formatINR(totalPayable)}</span></div>
        </div>
        <a href="#loan-form" className="mt-5 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white text-[13px] font-bold transition-colors">
          Check my loan options <ArrowRight size={14} />
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
    <main className="bg-[#FAF9F6] pt-[88px] sm:pt-[100px] pb-16">
      {/* ── Hero + Form ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-7 pt-2 lg:pt-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 text-[12px] font-bold text-[#C04A1D] shadow-2xs">
            <Landmark size={14} /> Education Loans
          </span>
          <h1 className="mt-4 font-outfit text-[34px] sm:text-[46px] lg:text-[52px] font-black text-[#111111] leading-[1.06] tracking-[-0.03em]">
            Fund your study abroad, <span className="text-[#DE5C2B]">without the paperwork maze</span>
          </h1>
          <p className="mt-4 text-[15px] sm:text-[16.5px] text-slate-600 leading-relaxed max-w-xl">
            Compare education loans from banks and NBFCs for your university, with or without collateral.
            We guide you from the first call to the sanction letter you need for your visa.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-2.5 max-w-xl">
            {['Secured & collateral-free options', 'Banks and NBFCs compared side by side', 'Sanction letter for visa proof of funds', 'Free guidance, all fees shown upfront'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[13.5px] font-medium text-slate-800">
                <CircleCheck size={17} className="text-[#DE5C2B] shrink-0" /> {t}
              </li>
            ))}
          </ul>
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
        <h2 className="font-outfit text-[26px] sm:text-[32px] font-black text-[#111111] tracking-tight">Education loan EMI calculator</h2>
        <p className="mt-1.5 text-[14px] text-slate-600 mb-6">See what your monthly repayment could look like after the moratorium.</p>
        <EmiCalculator />
      </section>

      {/* ── How it works ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <h2 className="font-outfit text-[26px] sm:text-[32px] font-black text-[#111111] tracking-tight mb-6">How it works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white rounded-2xl border border-slate-200/90 p-5">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center"><step.icon size={19} /></span>
                <span className="font-mono text-[13px] font-black text-slate-300">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Documents ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <h2 className="font-outfit text-[26px] sm:text-[32px] font-black text-[#111111] tracking-tight mb-6">Documents you'll need</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DOCUMENTS.map((doc) => (
            <div key={doc.group} className="bg-white rounded-2xl border border-slate-200/90 p-5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-orange-50 text-[#DE5C2B] ring-1 ring-orange-100 flex items-center justify-center"><doc.icon size={17} /></span>
                <h3 className="text-[15px] font-bold text-slate-900">{doc.group}</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {doc.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700"><CircleCheck size={15} className="text-emerald-600 mt-0.5 shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
        <h2 className="font-outfit text-[26px] sm:text-[32px] font-black text-[#111111] tracking-tight mb-6 text-center">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer"
              >
                <span className="text-[14.5px] font-bold text-slate-900">{faq.q}</span>
                <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="px-4 sm:px-5 pb-5 -mt-1 text-[13.5px] text-slate-600 leading-relaxed">{faq.a}</p>}
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="#loan-form" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[14px] font-bold shadow-md shadow-orange-500/20 transition-colors">
            Talk to a loan advisor <ArrowRight size={15} />
          </a>
        </div>
      </section>
    </main>
  );
};

export default EducationLoanPage;
