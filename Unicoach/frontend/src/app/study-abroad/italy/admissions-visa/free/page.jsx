import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, 
  HelpCircle, Coins, FileText, UserCheck, ShieldAlert, ChevronDown, 
  Check, Info, Award, Target, Landmark, X, ChevronRight, GraduationCap, 
  Phone, Wallet, BookOpen, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import ShortlistWizardWidget from '../../../../../components/ShortlistWizardWidget';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'why-italy', title: 'Why Study in Italy?' },
  { id: 'pathways', title: 'Scholarship Pathways' },
  { id: 'isee', title: 'What is ISEE Parificato?' },
  { id: 'universities', title: 'Top Public Universities' },
  { id: 'timeline', title: 'Admission Process' },
  { id: 'visa-reqs', title: 'Visa & Financial Reqs' },
  { id: 'living-costs', title: 'Living Costs & Work' },
  { id: 'faq', title: 'FAQ' }
];

const countryShortlistOptions = [
  { name: 'UK', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'USA', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'France', flag: 'https://flagcdn.com/w40/fr.png' },
  { name: 'Sweden', flag: 'https://flagcdn.com/w40/se.png' },
  { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png' },
  { name: 'Other', flag: '🌍' }
];

const scholarshipPathways = [
  {
    path: "Path 1: Regional DSU",
    who: "All students (need-based)",
    covers: "Full tuition + ~€7,200/yr + 1 free meal/day",
    deadline: "July – September",
    common: "Most common path for Indian students"
  },
  {
    path: "Path 2: MAECI (Government of Italy)",
    who: "Masters/PhD students (merit-based)",
    covers: "€900/month stipend + health insurance",
    deadline: "May",
    common: "Highly prestigious and competitive"
  },
  {
    path: "Path 3: Invest Your Talent (IYT)",
    who: "Engineering, Design, and Economics students",
    covers: "€1,000/month + 3-month internship",
    deadline: "Late February",
    common: "Fuses academic study with practical work experience"
  }
];

const scholarshipComparison = [
  { feature: "Best For", dsu: "All students", maeci: "Masters/PhD", iyt: "Engineering/Design/Econ" },
  { feature: "Basis", dsu: "Need-based", maeci: "Merit-based", iyt: "Merit + specific fields" },
  { feature: "Tuition Coverage", dsu: "100% waiver", maeci: "Stipend only", iyt: "Stipend only" },
  { feature: "Cash Stipend", dsu: "~€7,200/year", maeci: "€900/month", iyt: "€1,000/month" },
  { feature: "Additional Benefits", dsu: "1 free meal/day", maeci: "Health insurance", iyt: "3-month internship" },
  { feature: "Application Deadline", dsu: "July–Sept", maeci: "May", iyt: "Late February" },
  { feature: "Renewal Requirement", dsu: "Pass minimum CFUs", maeci: "Academic performance", iyt: "Academic performance" }
];

const iseeChecklist = [
  { type: "Family Composition", req: "List all members in household", source: "Municipal Office / Tehsildar" },
  { type: "Income Certificate", req: "ITR-V or Form 16 of earning members", source: "Income Tax Dept / Employer" },
  { type: "Bank Certificate", req: "Year-end balance + average balance", source: "Bank Branch Manager" },
  { type: "Property Deed", req: "Property area in sq. meters (or rental proof)", source: "Revenue Office" }
];

const lowCostUnis = [
  { name: "University of Bologna", fee: "€157 – €4,080 (~₹16k – ₹4.19 Lakh)", note: "Founded in 1088 - oldest university in the West" },
  { name: "University of Turin", fee: "~€300 (~₹30,877)", note: "Strong in Economics, Law, and Medicine" },
  { name: "Sapienza University of Rome", fee: "~€300 (~₹30,877)", note: "Largest university in Europe by enrollment" },
  { name: "University of Florence", fee: "€156 – €2,800 (~₹16k – ₹2.88 Lakh)", note: "Excellent for Architecture and Art History" }
];

const timelinePhases = [
  { phase: "Phase 1: Selection", dates: "Oct – Dec 2025", checks: ["Shortlist universities and programs", "Check language requirements (IELTS or MOI)", "Review scholarship deadlines"] },
  { phase: "Phase 2: University Application", dates: "Jan – Apr 2026", checks: ["Submit academic transcripts and SOP", "Apply through university portals", "Track application status"] },
  { phase: "Phase 3: Universitaly Portal", dates: "Apr – Jun 2026", checks: ["Complete mandatory government pre-enrollment", "Get Universitaly summary document"] },
  { phase: "Phase 4: Visa & Scholarship", dates: "Jun – Aug 2026", checks: ["Apply for student visa at VFS Global", "Submit financial proof", "Attend consular interview (if required)"] },
  { phase: "Phase 5: DSU Application", dates: "Jul – Sept 2026", checks: ["Apply to regional scholarship agency", "Submit legalized ISEE documents", "Wait for award confirmation"] }
];

const masterChecklist = [
  "Academic transcripts (HED attested + MEA apostilled)",
  "Degree certificates (HED attested + MEA apostilled)",
  "Statement of Purpose (SOP)",
  "Letters of Recommendation (LORs)",
  "Language proficiency proof (IELTS/MOI/B2 certificate)",
  "Universitaly Pre-enrolment Summary",
  "ISEE Parificato Family composition certificate",
  "ISEE Parificato Income certificate (ITR-V/Form 16)",
  "ISEE Parificato Bank certificate (year-end balance)",
  "ISEE Parificato Property deed (with square footage)",
  "Valid passport (10 years max, 2 blank pages)",
  "Passport photos (2)",
  "6 months bank statements (stamped)",
  "3 years ITR (applicant + sponsor)",
  "Health insurance (€30,000 + repatriation clause)",
  "Accommodation proof (first 30 days)",
  "Flight reservation (round-trip or €2,000 buffer)"
];

const faqsList = [
  { q: "Can I study in Italy without IELTS?", a: "Yes. Many public universities accept a Medium of Instruction (MOI) certificate if your previous degree was in English. However, some scholarships (like Invest Your Talent) recommend IELTS for competitiveness." },
  { q: "Is the scholarship guaranteed every year?", a: "No. Initial DSU grants are based on income. For renewal, you must earn a minimum number of CFUs (credits) by August each year." },
  { q: "What's the difference between HRD and Apostille?", a: "HRD Attestation is state-level authentication of your degree, whereas Apostille is national-level legalization by the Ministry of External Affairs (MEA). Both are required for the Declaration of Value (DOV) needed for your visa." },
  { q: "What is ISEE Parificato?", a: "An Italian economic indicator that translates your Indian family income and assets into a format Italian universities use to calculate your tuition fees and scholarship eligibility. The target is to keep ISEE below €23,000–€26,000 for 100% aid." },
  { q: "How much bank balance is required?", a: "You need to show a minimum of €6,079.45 (~₹6.3 Lakhs) for the first year—even if you have a scholarship." },
  { q: "Can I work while studying?", a: "Yes. You can work up to 20 hours/week during term. Average pay: €8–€12/hour." },
  { q: "What's the visa success rate?", a: "Historically ~98.2%. Recent projections suggest ~85-88% with stricter document scrutiny." }
];

const ItalyFree = () => {
  const [activeSection, setActiveSection] = useState('why-italy');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Simulator State
  const [familyIncomeINR, setFamilyIncomeINR] = useState(400000);
  const [propertySizeSqM, setPropertySizeSqM] = useState(50);

  // Shortlist Wizard State
  const [selectedCountry, setSelectedCountry] = useState('Italy');
  const { openEligibilityModal } = useLead();

  const exchangeRate = 102.92; // Target rate: €1 = ₹102.92

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€${valInEUR.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹${Math.round(valInINR).toLocaleString('en-IN')}`;
  };

  const getEstimatedEligibility = () => {
    const incomeEUR = familyIncomeINR / exchangeRate;
    const propertyWeightEUR = propertySizeSqM * 100;
    const calculatedISEE = incomeEUR + propertyWeightEUR;

    let bracket = "Lowest Bracket (Max Benefits)";
    let tuitionWaiver = "100% Waiver (Free)";
    let canteenMeals = "2 Free Meals / Day";
    let cashStipendEUR = 7200; // Updated to match textual €7,200

    if (calculatedISEE > 26000) {
      bracket = "Highest Bracket (No Scholarship)";
      tuitionWaiver = "Full Tuition Payable (approx. €4,080)";
      canteenMeals = "Standard Student Rates";
      cashStipendEUR = 0;
    } else if (calculatedISEE > 23000) {
      bracket = "Middle Bracket (Partial Benefits)";
      tuitionWaiver = "Partial Waiver / Reductions";
      canteenMeals = "1 Free Meal / Day";
      cashStipendEUR = 3500;
    }

    return {
      calculatedISEE,
      bracket,
      tuitionWaiver,
      canteenMeals,
      cashStipendEUR
    };
  };

  const est = getEstimatedEligibility();

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-x-clip pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-blue-450/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/5 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-[1440px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/italy" className="hover:text-indigo-650 transition-colors">Italy</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study for Free</span>
        </div>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Coins size={14} className="text-indigo-650 animate-pulse" />
            <span>Last Updated: December 23, 2025</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>6 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Study in Italy for Free:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">2026 Complete Guide</span> for Indian Students
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Unlock free education pathways, calculate ISEE thresholds, and access regional scholarships to study debt-free.
          </p>
        </motion.div>

        {/* Big Truth Intro Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Info size={14} />
              <span>💡 The Big Truth About "Free" Education in Italy</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              You don't need to be rich to study in Europe.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              While the UK and USA demand massive tuition fees, Italy offers a different path—near-zero tuition through the Italian "Right to Study" (DSU) system and the ISEE Parificato.
            </p>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Here's the reality: <strong className="text-indigo-300">62% of international students</strong> in Italy receive tuition waivers (2023 data). With the right documentation, you can join them.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              This guide shows you exactly how—from scholarship pathways to ISEE documentation to step-by-step admissions.
            </p>
          </div>
        </motion.div>

        {/* Currency Tool Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-3">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2 Column Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_360px] gap-8 xl:gap-12">
          
          {/* Main Content Area */}
          <div className="space-y-16 min-w-0">

            {/* Section 1: Why Study in Italy */}
            <section id="why-italy" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🇮🇹 Why Study in Italy? (2026 Perspective)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy treats education as a public good, scaling university costs based on household financials rather than inflating rates.
              </p>

              {/* Advantages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-black">
                    💰
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Near-Zero Tuition</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    The ISEE system scales tuition fees down to as low as ~€156/year.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center mb-4 font-black">
                    🌍
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">500+ English Programs</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Diverse courses including AI, Green Engineering, and Luxury Management.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">
                    ✈️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Schengen Travel</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Visa-free travel access to 29 Schengen zone countries.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 font-black">
                    🎓
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Academic Excellence</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Global pedigree in Architecture, Engineering, and Fashion programs.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-black">
                    ⏰
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">12-Month Stay-Back</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Stay back up to 12 months after graduation to find work or start business.
                  </p>
                </div>

                <div className="bg-white border border-slate-105 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 font-black">
                    🏛️
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">62% Get Waivers</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    A strong majority of international students receive financial aid or waivers.
                  </p>
                </div>
              </div>
            </section>

            {/* University shortlist picker widget */}
            <section id="shortlist-wizard" className="scroll-mt-24">
              <ShortlistWizardWidget 
                title="Get Your University Shortlist" 
                subtitle="Not sure which university fits your GPA and budget? Let us help you." 
              />
            </section>

            {/* Section 2: Top 3 Scholarship Pathways */}
            <section id="pathways" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏆 Top 3 Scholarship Pathways</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Italy offers three main routes to 100% funding. Choose based on your academic profile and eligibility criteria.
              </p>

              {/* Pathways Cards */}
              <div className="space-y-4 mb-8">
                {scholarshipPathways.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{item.path}</h4>
                      <span className="bg-indigo-55/65 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md shrink-0">
                        {item.deadline}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                      <p>🎯 <strong>Target:</strong> {item.who}</p>
                      <p>💰 <strong>Coverage:</strong> {item.covers}</p>
                      <p className="text-emerald-600 font-bold">✓ {item.common}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                Scholarship Comparison Table
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Feature</th>
                        <th className="p-5 font-black text-indigo-700 text-xs uppercase tracking-wider bg-indigo-50/20">Regional DSU</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">MAECI</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Invest Your Talent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {scholarshipComparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.feature}</td>
                          <td className="p-5 text-indigo-900 bg-indigo-50/5 font-bold">{row.dsu}</td>
                          <td className="p-5 text-slate-600">{row.maeci}</td>
                          <td className="p-5 text-slate-655">{row.iyt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3: What is ISEE Parificato? */}
            <section id="isee" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📊 What is ISEE Parificato? (Your Golden Ticket)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                The ISEE Parificato is the single most important document in your journey. It translates your Indian family income into an Italian economic indicator.
              </p>

              {/* Interactive Simulator */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <div className="max-w-2xl mx-auto text-center mb-6">
                  <h4 className="font-extrabold text-slate-900 text-sm md:text-base uppercase tracking-wider">
                    DSU Scholarship Eligibility Simulator
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Toggle values to estimate your eligibility category and tuition fees reduction.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="space-y-6 flex flex-col justify-center">
                    <div>
                      <label className="text-[10px] text-slate-450 font-black uppercase tracking-wider block mb-2">Annual Family Income: ₹{familyIncomeINR.toLocaleString()}</label>
                      <input 
                        type="range"
                        min={100000}
                        max={5000000}
                        step={50000}
                        value={familyIncomeINR}
                        onChange={(e) => setFamilyIncomeINR(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-extrabold mt-1">
                        <span>₹1 Lakh</span>
                        <span>₹25 Lakhs</span>
                        <span>₹50 Lakhs</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-450 font-black uppercase tracking-wider block mb-2">Residential Property Area: {propertySizeSqM} Sq Meters</label>
                      <input 
                        type="range"
                        min={0}
                        max={300}
                        step={10}
                        value={propertySizeSqM}
                        onChange={(e) => setPropertySizeSqM(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-extrabold mt-1">
                        <span>0 (Rented)</span>
                        <span>150 SQM</span>
                        <span>300 SQM</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
                    <div>
                      <span className="text-[9px] text-indigo-300 font-black uppercase tracking-wider">Estimated Bracket</span>
                      <h5 className="font-black text-indigo-400 text-sm mt-1">{est.bracket}</h5>
                      
                      <div className="space-y-2 mt-4 text-[11px] text-slate-350 border-t border-white/10 pt-4">
                        <div className="flex justify-between">
                          <span>Tuition Waiver:</span>
                          <span className="text-white font-extrabold">{est.tuitionWaiver}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Canteen Canteen:</span>
                          <span className="text-white font-extrabold">{est.canteenMeals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. ISEE Value:</span>
                          <span className="text-white font-extrabold">~ €{Math.round(est.calculatedISEE).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-baseline">
                      <span className="text-[9px] font-black text-slate-450 uppercase">Cash Stipend:</span>
                      <span className="text-xl font-black text-indigo-400">{formatCost(est.cashStipendEUR)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-2 text-xs text-indigo-900 font-semibold leading-relaxed">
                  <p>🎯 <strong>Target:</strong> Keep ISEE below €23,000–€26,000 for 100% aid.</p>
                  <p>💡 <strong>Advantage for Indians:</strong> Italian authorities value foreign property at a flat rate (~€500 per sq. meter), which helps middle-class Indian families qualify easily.</p>
                </div>
              </div>

              {/* ISEE Documents Checklist */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-indigo-600" size={18} />
                ISEE Documentation Checklist
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Document Type</th>
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Requirements details</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Source Authority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {iseeChecklist.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.type}</td>
                          <td className="p-5 text-slate-600">{row.req}</td>
                          <td className="p-5 text-slate-500 text-xs font-bold">{row.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <span className="text-xs font-extrabold text-amber-950">
                  ⚠️ ALL DOCUMENTS MUST BE TRANSLATED INTO ITALIAN & APOSTILLED
                </span>
              </div>
            </section>

            {/* Section 4: Top Public Universities */}
            <section id="universities" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏛️ Top Public Universities (Low-Cost)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Public universities in Italy use the ISEE system to scale fees. Here are leading institutions and their scaled costs:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {lowCostUnis.map((uni, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">{uni.name}</h4>
                    <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block mb-3">Tuition fee scale:</span>
                    <span className="text-base font-black text-slate-800 block mb-2">{uni.fee}</span>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">{uni.note}</p>
                  </div>
                ))}
              </div>

              {/* Tuition Scaling Diagram */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={18} />
                How ISEE Scales Your Tuition
              </h3>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-rose-800 font-black uppercase block mb-1">Higher Income Bracket</span>
                      <h5 className="font-black text-slate-900 text-xs">ISEE &gt; €26,000</h5>
                    </div>
                    <span className="text-base font-black text-rose-700">Full fee (up to €4,080)</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase block mb-1">Middle Income Bracket</span>
                      <h5 className="font-black text-slate-900 text-xs">ISEE €23k - €26k</h5>
                    </div>
                    <span className="text-base font-black text-slate-700">Partial reduction</span>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-black uppercase block mb-1">Lower Income Bracket</span>
                      <h5 className="font-black text-slate-900 text-xs">ISEE &lt; €23,000</h5>
                    </div>
                    <span className="text-base font-black text-emerald-700">Minimum fee (~€156)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Admission Process */}
            <section id="timeline" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📅 Step-by-Step Admission Process (2026 Timeline)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Strict adherence to the Italian academic timeline is essential to secure admission and regional scholarships.
              </p>

              {/* Timeline Accordion or visual checklist */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:pointer-events-none">
                {timelinePhases.map((phase, idx) => (
                  <div key={idx} className="relative pl-12 flex gap-4">
                    <span className="absolute left-3 w-6.5 h-6.5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">{idx + 1}</span>
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full">
                      <div className="flex justify-between items-baseline gap-2 mb-3">
                        <h4 className="font-black text-slate-900 text-sm md:text-base">{phase.phase}</h4>
                        <span className="text-[10px] font-black text-indigo-600 uppercase whitespace-nowrap">{phase.dates}</span>
                      </div>
                      <ul className="space-y-2">
                        {phase.checks.map((check, checkIdx) => (
                          <li key={checkIdx} className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                            <span className="text-indigo-550">•</span>
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 6: Visa & Financial Reqs */}
            <section id="visa-reqs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🛂 Visa & Financial Requirements</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Even if you secure a 100% scholarship, you must demonstrate a minimum bank balance to obtain your student visa.
              </p>

              {/* Requirement highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Minimum Bank Balance</span>
                    <span className="text-2xl font-black text-indigo-750 block">{formatCost(6079.45)}</span>
                    <span className="text-slate-400 text-[10px] font-semibold mt-1 block">Annual reserve amount required</span>
                  </div>
                  <div className="mt-6 bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-2.5">
                    <span className="text-rose-700 font-black">⚠️</span>
                    <span className="text-[11px] text-rose-950 font-bold leading-normal">
                      THIS IS REQUIRED EVEN IF YOU HAVE A SCHOLARSHIP
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3">Visa Approval Rates</span>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Historically:</span>
                      <span className="font-extrabold text-slate-900">~98.2%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-650">
                      <span>2025 Projection:</span>
                      <span className="font-extrabold text-indigo-600">~85-88% (stricter scrutiny)</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 text-[10px] font-bold text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Common rejections occur due to financial document gaps.
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Tips checklist */}
              <div className="bg-slate-50 border border-slate-150/70 rounded-2xl p-6">
                <h5 className="font-extrabold text-slate-900 text-sm mb-4">Visa Success Strategy</h5>
                <ul className="space-y-3">
                  {[
                    "Demonstrate at least €6,079.45 minimum bank balance",
                    "Maintain the balance even if regional scholarship is guaranteed",
                    "Clearly articulate why you chose Italy (avoid mentioning cost as the only driver)",
                    "Detail how the academic modules align with post-grad career goals",
                    "Submit exactly 6 months of manager-stamped bank statements",
                    "Submit 3 years of ITR for both yourself and primary sponsor",
                    "Highlight genuine educational intent throughout the consular interview"
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-650">
                      <span className="text-emerald-600 shrink-0 font-black">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 7: Living Costs & Work */}
            <section id="living-costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💶 Living Costs & Part-Time Work</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                While tuition can be completely free, you need to budget for your monthly living expenditures in Italy.
              </p>

              {/* City comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="border border-slate-100 rounded-2xl p-5 bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Major Italian Cities</h5>
                  <span className="text-[10px] text-slate-450 block mb-1">Milan, Rome, Venice</span>
                  <span className="text-xl font-black text-slate-800">€700 – €1,200 / month</span>
                </div>

                <div className="border border-slate-100 rounded-2xl p-5 bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Mid / Small Cities</h5>
                  <span className="text-[10px] text-slate-450 block mb-1">Pisa, Bari, Turin, Padua</span>
                  <span className="text-xl font-black text-slate-800">€500 – €600 / month</span>
                </div>
              </div>

              {/* Budget breakdown visual */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Wallet size={18} className="text-indigo-650" />
                  Monthly Budget Breakdown (Student in Turin)
                </h4>

                <div className="space-y-4">
                  {[
                    { item: "Rent (Shared Room)", amount: 350, percent: 50 },
                    { item: "Groceries", amount: 200, percent: 28 },
                    { item: "Public Transport", amount: 35, percent: 5 },
                    { item: "Phone & Internet", amount: 20, percent: 3 },
                    { item: "Personal / Misc", amount: 95, percent: 14 }
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{row.item}</span>
                        <span>€{row.amount}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${row.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-black uppercase">
                  <span className="text-slate-500">Total Monthly Cost:</span>
                  <span className="text-slate-950 font-bold">€700</span>
                </div>
              </div>

              {/* Part-time rights */}
              <div className="border border-slate-100 rounded-[24px] p-6 bg-white shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-650" />
                  Part-Time Work Rights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <li className="bg-slate-50 p-4 rounded-xl text-center">
                    <span className="text-xl font-black text-slate-800 block">20 hrs</span>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block mt-1">Per week limit</span>
                  </li>
                  <li className="bg-slate-50 p-4 rounded-xl text-center">
                    <span className="text-xl font-black text-slate-800 block">€8 - €12</span>
                    <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wider block mt-1">Hourly pay rate</span>
                  </li>
                  <li className="bg-slate-50 p-4 rounded-xl text-center flex flex-col justify-center items-center">
                    <span className="text-emerald-700 text-xs font-black uppercase">Covers Expenses</span>
                    <span className="text-slate-450 text-[9px] font-semibold block mt-1">Covers basic monthly costs</span>
                  </li>
                </ul>
              </div>

              {/* DSU Scholarship Renewal */}
              <div className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-indigo-950 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Award size={18} className="text-indigo-650" />
                  🔄 DSU Scholarship Renewal Requirements
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  {[
                    { yr: "Year 1", rule: "Pass minimum CFUs by August" },
                    { yr: "Year 2", rule: "Pass minimum CFUs by August" },
                    { yr: "Year 3", rule: "Pass minimum CFUs by August" }
                  ].map((row, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-100/50 relative">
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block mb-1">{row.yr}</span>
                      <p className="text-slate-700 text-xs font-extrabold mt-1">{row.rule}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-xs text-indigo-900/80 font-semibold space-y-1">
                  <p>• <strong>CFU:</strong> Crediti Formativi Universitari (Italian credit evaluation system).</p>
                  <p className="text-rose-700 font-extrabold">⚠️ Failing to earn the required CFUs results in absolute scholarship loss and possible claw-back.</p>
                </div>
              </div>
            </section>

            {/* Master Document Checklist Checklist */}
            <section id="checklist" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📝 Master Document Checklist</h2>
              </div>
              
              <div className="bg-white border border-slate-105 rounded-3xl p-6 md:p-8 shadow-xs">
                <ul className="space-y-3.5">
                  {masterChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-755 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                      <span className="text-slate-700 text-xs font-bold leading-normal">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 bg-indigo-50/40 border border-indigo-100/55 p-4 rounded-xl text-xs font-semibold text-indigo-950 text-center">
                  💡 ALL FOREIGN DOCUMENTS MUST BE TRANSLATED TO ITALIAN & APOSTILLED
                </div>
              </div>
            </section>

            {/* Section 8: FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Got questions about studying in Italy for free? We have answers:
              </p>

              <div className="space-y-4">
                {faqsList.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-150/70 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-750 transition-colors gap-4 cursor-pointer"
                      >
                        <span className="text-sm md:text-base font-extrabold leading-snug">{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-5 pt-1 text-slate-500 text-xs md:text-sm font-semibold leading-relaxed border-t border-slate-55">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>



            {/* Closing CTA */}
            <div className="mt-12">
              <StudyAbroadCTA country="Italy" />
            </div>

            {/* Disclaimer */}
            <p className="text-slate-450 text-[10px] font-semibold leading-relaxed text-center mt-6">
              Disclaimer: Fees, exchange rates, deadlines, and requirements are subject to change. Always verify with official sources and your specific university/consulate.
            </p>

          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block relative h-full">
            <div className="sticky top-28 space-y-6">
              
              {/* Navigation list */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xs">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-5 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-600" />
                  Guide Navigation
                </h4>
                
                <nav className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isActive ? 'bg-indigo-600 scale-125' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`} />
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Quick Advisor CTA */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <h5 className="font-black text-sm mb-2 tracking-tight leading-snug">
                  Want to study in Italy for Free?
                </h5>
                <p className="text-white/80 text-[11px] font-semibold leading-relaxed mb-5">
                  Our UniCoach counsellors can assist you with shortlists, ISEE documents, and DSU applications.
                </p>
                <Link
                  to="/book-consultation"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs rounded-xl shadow-xs transition-colors"
                >
                  Consult an Expert
                  <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
};

export default ItalyFree;
