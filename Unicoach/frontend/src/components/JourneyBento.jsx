import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useLead } from '../context/LeadContext';

// "Your study abroad journey in 4 steps" as a bento grid: four gradient cards with 3D illustrations
// (3dicons.co, CC0) and real campus photos. Step 1 opens the free counselling form; the others open their tool.
const ICON = (name) => `/images/3d/${name}.webp`;

const STEPS = {
  counselling: {
    step: '01',
    title: 'Personalized Counselling',
    text: 'One-on-one guidance to build a profile that shows your academics, achievements and goals, and a shortlist of universities that fit you.',
    cta: 'Book Free Counselling',
  },
  sop: {
    step: '02',
    title: 'SOP & Documents',
    text: 'Draft your SOP with our AI writer, then polish your SOP, LORs and resume with experts who have been through admissions.',
    cta: 'Try the AI SOP Writer',
    to: '/ai-tools/sop-generator',
  },
  loans: {
    step: '03',
    title: 'Loans & Funding',
    text: 'Compare education loans with or without collateral and find scholarships you qualify for, from first call to sanction letter.',
    cta: 'Check Loan Options',
    to: '/education-loan',
  },
  visa: {
    step: '04',
    title: 'Visa & Mocks',
    text: 'Practise real visa interview questions with our AI officer and counsellors, get documents checked, and sort housing before you fly.',
    cta: 'Practice a Visa Mock',
    to: '/ai-tools/visa-prep',
  },
};

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
});

// A 3D piece or chip that pops in after its card has arrived
const Pop = ({ children, delay = 0, from = 'scale', className = '', style }) => {
  const start = from === 'up' ? { opacity: 0, y: 24 } : { opacity: 0, scale: 0.3, rotate: -18 };
  const end = from === 'up' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, rotate: 0 };
  return (
    <motion.div
      className={className}
      style={style}
      initial={start}
      whileInView={end}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay }}
    >
      {children}
    </motion.div>
  );
};

// Gentle up-and-down float for the 3D pieces
const Float = ({ children, delay = 0, distance = 8, className = '', style, enter = 0.35 }) => (
  <motion.div
    className={className}
    style={style}
    animate={{ y: [0, -distance, 0] }}
    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    <Pop delay={enter + delay * 0.25}>{children}</Pop>
  </motion.div>
);

const CardText = ({ s, onAction, dark = false }) => (
  <div className="relative z-10 max-w-[380px]">
    <span className={`inline-flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide ${dark ? 'bg-white/20 text-white' : 'bg-white/70 text-[#2A1A12]'}`}>
      STEP {s.step} OF 04
    </span>
    <h3 className={`font-outfit text-[22px] sm:text-[26px] font-bold tracking-[-0.03em] leading-[1.1] ${dark ? 'text-white' : 'text-[#2A1A12]'}`}>
      {s.title}
    </h3>
    <p className={`mt-2 text-[13.5px] sm:text-[14.5px] leading-relaxed ${dark ? 'text-white/85' : 'text-[#5A4636]'}`}>{s.text}</p>
    <button
      type="button"
      onClick={() => onAction(s)}
      className={`group mt-4 inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-bold cursor-pointer ${dark ? 'text-white' : 'text-[#2A1A12]'}`}
    >
      {s.cta}
      <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
    </button>
  </div>
);

const Chip = ({ children, className = '', delay = 0.75 }) => (
  <motion.div
    className={`bg-white/95 backdrop-blur rounded-2xl shadow-[0_18px_40px_-12px_rgba(42,26,18,0.35)] border border-white ${className}`}
    initial={{ opacity: 0, y: 22, scale: 0.92 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ type: 'spring', stiffness: 200, damping: 18, delay }}
  >
    {children}
  </motion.div>
);

// ── 1. Shortlist: fanned real campus photos ──
const ShortlistArt = () => (
  <div className="relative h-[200px] sm:h-[235px] w-full max-w-[370px] mx-auto">
    {[
      { img: 'stanford', rot: -10, x: '4%', z: 1 },
      { img: 'columbia', rot: 10, x: '58%', z: 1 },
    ].map((c) => (
      <motion.div
        key={c.img}
        className="absolute top-8 w-[38%] aspect-[3/4] rounded-[22px] overflow-hidden border-[5px] border-white shadow-[0_20px_40px_-14px_rgba(0,0,0,0.35)]"
        style={{ left: c.x, zIndex: c.z }}
        initial={{ opacity: 0, rotate: 0, x: c.rot < 0 ? '55%' : '-55%' }}
        whileInView={{ opacity: 1, rotate: c.rot, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.45 }}
      >
        <img src={`/images/universities/${c.img}.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
      </motion.div>
    ))}
    <Float className="absolute left-1/2 top-0 -translate-x-1/2 w-[46%] z-10" distance={6}>
      <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden border-[6px] border-white shadow-[0_28px_50px_-14px_rgba(0,0,0,0.45)]">
        <img src="/images/universities/monash.jpg" alt="University campus" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#2A1A12] text-white text-[12px] font-semibold shadow-lg">
        1,500+ Universities
      </span>
      <Chip className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-max px-3.5 py-2.5 flex items-center gap-2.5">
        <img src={ICON('medal')} alt="" className="w-9 h-9 shrink-0" />
        <span className="min-w-0">
          <span className="block text-[13px] font-bold text-[#2A1A12] whitespace-nowrap">Your best-fit match</span>
          <span className="block text-[11px] text-slate-500">Dream · Target · Safe</span>
        </span>
      </Chip>
    </Float>
    <Float className="absolute -right-2 bottom-4 w-[22%] z-20" delay={0.8}>
      <img src={ICON('target')} alt="" loading="lazy" className="w-full drop-shadow-xl" />
    </Float>
  </div>
);

// ── 2. Finance: stacked 3D coins + scholarship meter ──
const FinanceArt = () => (
  <div className="relative h-[150px] w-full">
    <Float className="absolute left-0 top-2 w-[42%]" distance={7}>
      <img src={ICON('rupee')} alt="" loading="lazy" className="w-full drop-shadow-2xl -rotate-6" />
    </Float>
    <Float className="absolute left-[22%] top-[52%] w-[26%]" delay={0.6} distance={6}>
      <img src={ICON('3d-coin')} alt="" loading="lazy" className="w-full drop-shadow-xl rotate-12" />
    </Float>
    <Chip className="absolute right-0 top-6 w-[58%] p-4">
      <p className="text-[13.5px] font-semibold text-[#2A1A12]">Scholarship eligibility</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#5B5BF7]"
            initial={{ width: 0 }}
            whileInView={{ width: '67%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <span className="text-[17px] font-bold text-[#2A1A12]">67%</span>
      </div>
    </Chip>
  </div>
);

// ── 2. SOP & documents: folder + document + review toast ──
const SopArt = () => (
  <div className="relative h-[170px] sm:h-[190px] w-full">
    <Float className="absolute left-[4%] top-6 w-[48%]" distance={7}>
      <img src={ICON('folder')} alt="" loading="lazy" className="w-full drop-shadow-2xl -rotate-6" />
    </Float>
    <Float className="absolute right-[6%] top-0 w-[34%]" delay={0.7}>
      <img src={ICON('file-text')} alt="" loading="lazy" className="w-full drop-shadow-xl rotate-12" />
    </Float>
    <Chip className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[88%] px-4 py-3 flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white grid place-items-center shrink-0">
        <Check size={18} strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Statement of Purpose</span>
        <span className="block text-[13.5px] font-bold text-[#2A1A12]">Reviewed by an expert</span>
      </span>
    </Chip>
  </div>
);

// ── 4. Visa: suitcase, shield, pin + approval toast ──
const VisaArt = () => (
  <div className="relative h-[180px] sm:h-[215px] w-full max-w-[420px] mx-auto">
    <Float className="absolute left-[4%] top-6 w-[36%]" distance={7}>
      <img src={ICON('travel')} alt="" loading="lazy" className="w-full drop-shadow-2xl -rotate-3" />
    </Float>
    <Float className="absolute left-[38%] top-0 w-[26%]" delay={0.5}>
      <img src={ICON('shield')} alt="" loading="lazy" className="w-full drop-shadow-xl" />
    </Float>
    <Float className="absolute right-[2%] top-10 w-[22%]" delay={1.1} distance={9}>
      <img src={ICON('map-pin')} alt="" loading="lazy" className="w-full drop-shadow-xl" />
    </Float>
    <Chip className="absolute right-[2%] bottom-0 w-max max-w-[92%] p-3.5 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white grid place-items-center shrink-0">
        <Check size={20} strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Congratulations!</span>
        <span className="block text-[13px] font-semibold text-[#2A1A12] whitespace-nowrap">Your student visa is approved</span>
      </span>
    </Chip>
  </div>
);

export const JourneyBento = () => {
  const navigate = useNavigate();
  const { openEligibilityModal } = useLead();

  const handleAction = (step) => {
    if (step.to) {
      navigate(step.to);
      return;
    }
    openEligibilityModal?.(`Homepage Steps - ${step.title}`);
  };

  return (
    <section id="how-it-works" className="pt-3 sm:pt-5 pb-8 sm:pb-12 bg-[#FAF9F6] relative z-10 w-full max-w-full">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* Header */}
        <motion.div {...rise()} className="max-w-3xl mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#DE5C2B]" />
            <span className="text-[12px] sm:text-[12.5px] font-bold text-slate-800 tracking-wide uppercase">How UniCoach works</span>
          </div>
          <h2 className="font-['Inter',sans-serif] text-[30px] sm:text-[38px] lg:text-[40px] font-black text-[#111111] leading-[1.1] tracking-[-0.035em]">
            Your study abroad journey in <span className="text-[#DE5C2B]">4 steps</span>
          </h2>
          <p className="text-[13.5px] sm:text-[16px] text-slate-600 mt-2.5 leading-relaxed">
            From choosing a university to your visa interview, here is how we help at every step.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
          {/* 01 Counselling: wide, warm orange */}
          <motion.div
            {...rise(0.05)}
            className="lg:col-span-8 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 grid md:grid-cols-[1fr_1.05fr] gap-6 items-center"
            style={{ background: 'radial-gradient(120% 120% at 0% 0%, #FFD8C2 0%, #FFB48A 45%, #FF9A62 100%)' }}
          >
            <CardText s={STEPS.counselling} onAction={handleAction} />
            <ShortlistArt />
          </motion.div>

          {/* 02 SOP: periwinkle */}
          <motion.div
            {...rise(0.12)}
            className="lg:col-span-4 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 flex flex-col gap-4"
            style={{ background: 'radial-gradient(120% 110% at 100% 0%, #DCE2FF 0%, #B8C2FF 55%, #A3AEFA 100%)' }}
          >
            <SopArt />
            <CardText s={STEPS.sop} onAction={handleAction} />
          </motion.div>

          {/* 03 Loans: violet */}
          <motion.div
            {...rise(0.08)}
            className="lg:col-span-4 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 flex flex-col gap-4"
            style={{ background: 'radial-gradient(120% 110% at 0% 0%, #F5C9B8 0%, #C9A5E8 50%, #8F7BE8 100%)' }}
          >
            <FinanceArt />
            <CardText s={STEPS.loans} onAction={handleAction} />
          </motion.div>

          {/* 04 Visa: soft cream, wide */}
          <motion.div
            {...rise(0.15)}
            className="lg:col-span-8 relative overflow-hidden rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 grid md:grid-cols-[1fr_1.1fr] gap-6 items-center"
            style={{ background: 'radial-gradient(120% 130% at 100% 100%, #FFE3D6 0%, #FDF1EA 55%, #FBF6F2 100%)' }}
          >
            <CardText s={STEPS.visa} onAction={handleAction} />
            <VisaArt />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JourneyBento;
