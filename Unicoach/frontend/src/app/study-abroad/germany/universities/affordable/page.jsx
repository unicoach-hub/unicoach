import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Building, BookOpen, Clock, HelpCircle,
  CheckCircle2, ArrowRight, Coins, Wallet, Sparkles, AlertCircle,
  ArrowDownToLine, Landmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const tuitionComparison = [
  {
    category: "Public Universities (15 of 16 German States)",
    feesEUR: "Free (€0)",
    feesINR: "Free (₹ 0)",
    semesterFeeEUR: "€200 - €400",
    semesterFeeINR: "₹22,000 - ₹44,000",
    roi: "Extremely High (Near-zero academic cost, high employability)",
    details: "Includes semester tickets that grant unlimited local bus, metro, and train transit."
  },
  {
    category: "Public Universities (State of Baden-Württemberg)",
    feesEUR: "€3,000 / year",
    feesINR: "₹3.3 Lakh / year",
    semesterFeeEUR: "€150 - €250",
    semesterFeeINR: "₹16,500 - ₹27,500",
    roi: "High (Elite institutions like Heidelberg, KIT, Freiburg)",
    details: "Charges non-EU students €1,500 per semester. Excellent research and lab facilities."
  },
  {
    category: "Private Universities",
    feesEUR: "€10,000 - €25,050 / year",
    feesINR: "₹11.0 Lakh - ₹27.5 Lakh / year",
    semesterFeeEUR: "€100 - €200",
    semesterFeeINR: "₹11,000 - ₹22,000",
    roi: "Moderate to High (Faster admissions, specialized MBA tracks)",
    details: "No credit-matching constraints. Faster processing times and smaller cohort sizes."
  }
];

const monthlyExpenses = [
  { item: "Student Housing (WG Flat / Dorm)", eur: 450, desc: "Shared student apartment (WG) or university dormitory. Dorms are cheapest but have long waitlists." },
  { item: "Public Health Insurance", eur: 125, desc: "Mandatory statutory insurance (TK / AOK) for students under 30. Covers doctor visits & hospitalization." },
  { item: "Groceries & Food", eur: 200, desc: "Buying from discount supermarkets (Aldi, Lidl, Netto). Cooking at home keeps food budget low." },
  { item: "Internet & Phone Connection", eur: 35, desc: "High-speed SIM plans and home Wi-Fi split with flatmates." },
  { item: "Leisure & Personal Care", eur: 80, desc: "Gym memberships, eating out, clothing, and travel." }
];

const affordableUniversities = [
  { name: "Technical University of Munich (TUM)", city: "Munich", feeStatus: "Nominal fees / Program specific", rank: "22 QS", logo: "https://logo.clearbit.com/tum.de" },
  { name: "RWTH Aachen University", city: "Aachen", feeStatus: "Tuition-Free (€300 sem fee)", rank: "105 QS", logo: "https://logo.clearbit.com/rwth-aachen.de" },
  { name: "Technical University of Berlin (TU Berlin)", city: "Berlin", feeStatus: "Tuition-Free (€300 sem fee)", rank: "145 QS", logo: "https://logo.clearbit.com/tu.berlin" },
  { name: "LMU Munich", city: "Munich", feeStatus: "Tuition-Free (€300 sem fee)", rank: "58 QS", logo: "https://logo.clearbit.com/lmu.de" },
  { name: "Humboldt University of Berlin", city: "Berlin", feeStatus: "Tuition-Free (€315 sem fee)", rank: "130 QS", logo: "https://logo.clearbit.com/hu-berlin.de" },
  { name: "University of Hamburg", city: "Hamburg", feeStatus: "Tuition-Free (€335 sem fee)", rank: "193 QS", logo: "https://logo.clearbit.com/uni-hamburg.de" }
];

const GermanyAffordable = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const formatMonthlyCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${valInINR.toLocaleString()}`;
  };

  const blockedAccountEUR = 11904;
  const blockedAccountMonthlyEUR = 992;

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-[#e0e7ff]/40 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Affordable Study Routes</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Coins size={14} className="text-indigo-650 animate-pulse" />
            <span>Low Cost Study Options 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Affordable Universities &{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Living in Germany</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Germany remains the ultimate financial gateway for international student cohorts. Master the roadmap to studying for €0 tuition and minimizing your day-to-day expenditures.
          </p>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 1. TUITION RANGE COMPARISON */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <Coins className="text-indigo-600" size={22} />
            Tuition Fee Models in Germany
          </h2>
          <p className="text-slate-500 text-xs font-semibold mb-6">Compare tuition expenses and returns across different university structures.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Structure</th>
                  <th className="pb-3 pr-4">Tuition Fee</th>
                  <th className="pb-3 pr-4 text-center">Semester Admin Fee</th>
                  <th className="pb-3 pr-4 text-right">Return on Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {tuitionComparison.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4">
                      <div className="font-extrabold text-slate-900">{t.category}</div>
                      <div className="text-[11px] text-slate-400 font-bold mt-0.5">{t.details}</div>
                    </td>
                    <td className="py-4 font-black text-indigo-650">
                      {currency === 'EUR' ? t.feesEUR : t.feesINR}
                    </td>
                    <td className="py-4 text-center font-bold text-slate-800">
                      {currency === 'EUR' ? t.semesterFeeEUR : t.semesterFeeINR}
                    </td>
                    <td className="py-4 text-right font-bold text-slate-500 max-w-xs text-xs">{t.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. BLOCKED ACCOUNT DETAILS */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Sperrkonto (Blocked Account) Requirement</h2>
              <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed">
                Even though tuition is free at public schools, the German government requires proof of financial resources to issue a student visa. You must deposit **{currency === 'EUR' ? '€11,904' : '₹ 13.11 Lakh'}** into a registered German blocked account prior to your visa appointment. This serves as your living expense backup for your first year.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[9px] text-indigo-200 font-black block uppercase tracking-wider">Total Deposit</span>
                  <span className="text-base font-black">{formatMonthlyCost(blockedAccountEUR)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[9px] text-indigo-200 font-black block uppercase tracking-wider">Monthly Payout</span>
                  <span className="text-base font-black">{formatMonthlyCost(blockedAccountMonthlyEUR)} / mo</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/10 space-y-4">
              <span className="text-xs font-black text-indigo-100 uppercase tracking-widest block">Approved Providers</span>
              <ul className="space-y-3.5 text-xs text-white/95 font-semibold">
                <li className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span>Expatrio</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded font-black text-[10px]">Fastest Setup</span>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span>Fintiba Plus</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded font-black text-[10px]">App Managed</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Coracle</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded font-black text-[10px]">No Monthly Fees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. COST OF LIVING BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-16">
          {/* Monthly Expenses Table */}
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl">
            <h2 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Wallet className="text-indigo-650" size={20} />
              Estimated Monthly Living Cost
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="pb-3 pr-4">Expense Type</th>
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3 pr-4 text-right">Cost (EUR vs INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {monthlyExpenses.map((expense, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-slate-900 font-black">{expense.item}</td>
                      <td className="py-4 text-slate-500 font-medium max-w-xs text-xs">{expense.desc}</td>
                      <td className="py-4 text-right font-black text-indigo-650">
                        {formatMonthlyCost(expense.eur)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Money Saving Roadmap Tips */}
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-[32px] p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles size={18} className="text-indigo-600" />
              How to Save Money
            </h3>
            
            <div className="space-y-4">
              {[
                { title: "Dormitories over Private Flats", desc: "Apply for Studentenwerk student residences as soon as you receive your admissions. Monthly rent is ~€250 compared to ~€500 for private flats." },
                { title: "Avoid Baden-Württemberg State", desc: "Select public universities in the other 15 states (e.g. TUM, RWTH Aachen, TU Berlin) which charge €0 tuition compared to Freiburg/Heidelberg which charge €3,000/year." },
                { title: "Part-Time Student Jobs", desc: "Students can work 140 full days or 280 half days per year. Average student wage is €13 - €16/hour, easily covering monthly living expenses." },
                { title: "Look for NC-free Programs", desc: "Programs with no grade restriction have higher intake limits and quicker processing, saving prep costs." }
              ].map((tip, idx) => (
                <div key={idx} className="bg-white/80 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="font-extrabold text-slate-800 text-xs mb-1">{tip.title}</h4>
                  <p className="text-slate-550 text-[11px] font-semibold leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. SELECTION OF TUITION-FREE PUBLIC UNIVERSITIES */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center md:text-left">Top Tuition-Free Universities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {affordableUniversities.map((uni, idx) => (
              <div 
                key={idx}
                className="bg-white/60 border border-white rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2.5 shadow-xs">
                      <img src={uni.logo} alt="" className="w-8 h-8 object-contain" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 text-xs md:text-sm leading-tight group-hover:text-indigo-650 transition-colors">{uni.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                        <MapPin size={10} />
                        {uni.city}, Germany
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black mt-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">{uni.feeStatus}</div>
                    <div className="bg-indigo-50/50 text-indigo-750 p-2.5 rounded-xl border border-indigo-100">{uni.rank} Rank</div>
                  </div>
                </div>
                
                <Link 
                  to={`/contact?university=${encodeURIComponent(uni.name)}`}
                  className="mt-6 w-full text-center py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-700 transition-all text-xs font-black"
                >
                  Verify ECTS Requirements
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 5. TOP GERMAN SCHOLARSHIPS */}
        <div className="bg-white/50 border border-white rounded-[32px] p-8 shadow-xs max-w-4xl mx-auto mb-12">
          <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Top Government & Foundation Scholarships</h3>
          <p className="text-slate-500 text-xs font-semibold mb-8 text-center">Scholarships that can further offset secondary costs like semester contribution and health insurance.</p>
          <div className="space-y-4">
            {[
              { name: "DAAD Study Scholarships", award: "Full financial coverage (€934/month for master's + healthcare + travel allowance)", target: "Highly competitive; targets excellent academic profiles with leadership skills." },
              { name: "Deutschlandstipendium", award: "€300/month merit scholarship paid for at least 2 semesters", target: "Jointly funded by the German government and private corporate partners. Open to all nationalities." },
              { name: "Heinrich Böll Foundation Scholarships", award: "Monthly financial stipend + tuition fee support", target: "Targets international students with outstanding academic records and social commitment." }
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-all">
                <p className="font-black text-slate-800 text-sm">{s.name}</p>
                <p className="text-xs text-indigo-650 font-black">{s.award}</p>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">{s.target}</p>
              </div>
            ))}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyAffordable;
