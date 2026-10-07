import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Building, BookOpen, Clock, HelpCircle,
  CheckCircle2, ArrowRight, Coins, Wallet, Sparkles, AlertCircle,
  Percent, Briefcase, Info, Home, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const tuitionComparison = [
  {
    category: "Public Universities (Licence / Bachelor's)",
    feesEUR: "€2,770 / year",
    feesINR: "₹ 3.05 Lakh / year",
    subsidized: "90% Subsidized by French State",
    details: "Subsidized rate for non-EU students at national public universities."
  },
  {
    category: "Public Universities (Master's Programs)",
    feesEUR: "€3,770 / year",
    feesINR: "₹ 4.15 Lakh / year",
    subsidized: "85% Subsidized by French State",
    details: "Applicable to standard national master's degrees (e.g., Sorbonne, Paris-Saclay)."
  },
  {
    category: "Public Universities (PhD / Doctoral)",
    feesEUR: "€380 / year",
    feesINR: "₹ 41,800 / year",
    subsidized: "Fully Subsidized",
    details: "Same fee for both domestic and international PhD candidates."
  },
  {
    category: "Private Engineering Schools (Grandes Écoles)",
    feesEUR: "€6,000 - €15,000 / year",
    feesINR: "₹ 6.6 Lakh - 16.5 Lakh / year",
    subsidized: "Institution-Specific Fees",
    details: "Top schools like IMT Atlantique, CentraleSupélec (non-subsidized tracks)."
  },
  {
    category: "Elite Business Schools (HEC, ESSEC, ESCP)",
    feesEUR: "€12,000 - €30,000 / year",
    feesINR: "₹ 13.2 Lakh - 33.0 Lakh / year",
    subsidized: "Premium Private Fees",
    details: "Highest fee tier but provides massive ROI and worldwide recruitment."
  }
];

const scholarshipsList = [
  {
    name: "France Excellence Eiffel Scholarship",
    awardEUR: "€1,181 / month + Round-trip Flights",
    awardINR: "₹ 1.30 Lakh / month + Flight Tickets",
    eligibility: "Top academic profiles nominated by French institutions. Master's candidates under 25, PhD under 30.",
    coverage: "Covers monthly allowance, health insurance, cultural activities, and housing searches."
  },
  {
    name: "Charpak Master's Scholarship (Indian Students)",
    awardEUR: "Up to €5,000 tuition waiver + €860 / month stipend",
    awardINR: "Up to ₹ 5.5 Lakh tuition waiver + ₹ 94,700 / month stipend",
    eligibility: "Indian nationals under 30 pursuing a Master's degree in France. Open to all fields.",
    coverage: "Includes student visa fee waiver, social security registration, and priority CROUS housing."
  },
  {
    name: "Ampère Excellence Scholarship (ENS Lyon)",
    awardEUR: "€1,000 / month for 12-24 months",
    awardINR: "₹ 1.10 Lakh / month for 12-24 months",
    eligibility: "Excellent international candidates applying for select Master's programs at ENS Lyon.",
    coverage: "Monthly stipend to support academic and living costs in the city of Lyon."
  },
  {
    name: "Erasmus Mundus Joint Master Degrees (EMJMD)",
    awardEUR: "Fully Funded (100% tuition + €1,400 / month stipend)",
    awardINR: "Fully Funded (100% tuition + ₹ 1.54 Lakh / month stipend)",
    eligibility: "Open to students worldwide. Must apply to specific joint consortium Master's programs.",
    coverage: "Covers all tuition fees, travel costs, installation allowance, health insurance, and monthly living costs."
  }
];

const costHacks = [
  {
    title: "CAF Housing Subsidy (APL)",
    desc: "The Caisse d'Allocations Familiales (CAF) allows all international students to apply for rent assistance. You can get back €100 to €300 per month depending on your rent and accommodation type."
  },
  {
    title: "CROUS Subsidized Student Housing",
    desc: "State-run student residences (CROUS) offer the cheapest rooms starting at €200–€400/month (utilities and Wi-Fi included). Apply early as spots are limited and highly sought after."
  },
  {
    title: "Resto U (Subsidized Student Meals)",
    desc: "CROUS operates university cafeterias where students can get a complete, hot, three-course meal for just €3.30 (or €1.00 if you hold a scholarship or demonstrate financial hardship)."
  },
  {
    title: "Part-Time Job Regulations",
    desc: "Students can legally work 964 hours per year (60% of annual legal working hours). The minimum wage (SMIC) is €11.65/hour gross. This easily offsets month-to-month grocery and utility bills."
  },
  {
    title: "Imagine R Student Transport Pass",
    desc: "Under-26 students in the Paris region can buy the Imagine R card, reducing monthly transit costs to ~€30/month (a saving of over 60% compared to standard adult Navigo passes)."
  }
];

const FranceAffordable = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  // Calculator State
  const [location, setLocation] = useState('regional'); // 'paris' | 'regional'
  const [housingType, setHousingType] = useState('crous'); // 'crous' | 'shared' | 'private'
  const [foodType, setFoodType] = useState('cook'); // 'cook' | 'resto'
  const [transportType, setTransportType] = useState('discount'); // 'discount' | 'none'
  const [applyCaf, setApplyCaf] = useState(true);

  // Cost configurations
  const costConfig = {
    paris: {
      rent: { crous: 380, shared: 550, private: 800 },
      caf: { crous: 150, shared: 180, private: 250 },
      groceries: { cook: 200, resto: 280 },
      transport: { discount: 35, none: 0 },
      other: 100
    },
    regional: {
      rent: { crous: 250, shared: 380, private: 500 },
      caf: { crous: 100, shared: 120, private: 150 },
      groceries: { cook: 180, resto: 250 },
      transport: { discount: 28, none: 0 },
      other: 80
    }
  };

  const getCalculatedCosts = () => {
    const config = costConfig[location];
    const rent = config.rent[housingType];
    const cafSubsidy = applyCaf ? config.caf[housingType] : 0;
    const groceries = config.groceries[foodType];
    const transport = config.transport[transportType];
    const other = config.other;

    const netRent = Math.max(50, rent - cafSubsidy);
    const totalMonthly = netRent + groceries + transport + other;
    const totalAnnual = totalMonthly * 12;

    return {
      grossRent: rent,
      cafReduction: cafSubsidy,
      netRent,
      groceries,
      transport,
      other,
      totalMonthly,
      totalAnnual
    };
  };

  const calc = getCalculatedCosts();

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${valInINR.toLocaleString()}`;
  };

  const formatAnnualCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-50/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Affordable Routes</span>
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
            <span>France Budget Planning 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Affordable Universities &{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Living in France</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Studying in France can be surprisingly low-cost. Learn how to combine taxpayer-subsidized public tuition with national rent allowances (CAF), food discounts, and scholarships.
          </p>
        </motion.div>

        {/* Universal Currency Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency:</span>
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

        {/* SECTION 1: TUITION STRUCTURES */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <Coins className="text-indigo-605" size={22} />
            Tuition Fees: Public vs. Private
          </h2>
          <p className="text-slate-500 text-xs font-semibold mb-6">France's public universities offer identical state subsidies to non-EU students, making high-quality study affordable.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Study Category</th>
                  <th className="pb-3 pr-4">Estimated Fees (EUR vs INR)</th>
                  <th className="pb-3 pr-4">Funding Model</th>
                  <th className="pb-3 pr-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {tuitionComparison.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4">
                      <div className="font-extrabold text-slate-900">{t.category}</div>
                    </td>
                    <td className="py-4 font-black text-indigo-650">
                      {currency === 'EUR' ? t.feesEUR : t.feesINR}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${t.subsidized.includes('Subsidized') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {t.subsidized}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium text-slate-500 text-xs max-w-xs">{t.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE BUDGET CALCULATOR */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
              <Wallet className="text-indigo-650" size={24} />
              Interactive Living Expenses Calculator
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Select your parameters below to project your real out-of-pocket costs after national state allowances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
            {/* Input Controls */}
            <div className="space-y-6">
              {/* Location Selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">City Location</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setLocation('paris')}
                    className={`p-4 rounded-2xl border text-xs font-black transition-all text-left flex flex-col justify-between ${location === 'paris' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50/50 border-slate-100 text-slate-650 hover:bg-slate-100'}`}
                  >
                    <span>Paris Île-de-France</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">High Rent, Capital Life</span>
                  </button>
                  <button 
                    onClick={() => setLocation('regional')}
                    className={`p-4 rounded-2xl border text-xs font-black transition-all text-left flex flex-col justify-between ${location === 'regional' ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50/50 border-slate-100 text-slate-650 hover:bg-slate-100'}`}
                  >
                    <span>Regional (Lyon, Lille, Nantes)</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">Low Cost, Subsidized Rates</span>
                  </button>
                </div>
              </div>

              {/* Housing Type */}
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Accommodation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'crous', label: 'CROUS Dorm', desc: 'Subsidized' },
                    { key: 'shared', label: 'Flatshare', desc: 'WG / Colocation' },
                    { key: 'private', label: 'Private Studio', desc: 'Solo Flat' }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setHousingType(item.key)}
                      className={`p-3 rounded-2xl border text-xs font-black transition-all text-center flex flex-col items-center justify-center ${housingType === item.key ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-slate-50/50 border-slate-100 text-slate-650 hover:bg-slate-100'}`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Habits & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Food habits</label>
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/40">
                    <button 
                      onClick={() => setFoodType('cook')}
                      className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${foodType === 'cook' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Cook at home
                    </button>
                    <button 
                      onClick={() => setFoodType('resto')}
                      className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${foodType === 'resto' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Resto U + Cafes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Public Transport</label>
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/40">
                    <button 
                      onClick={() => setTransportType('discount')}
                      className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${transportType === 'discount' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Imagine R Pass
                    </button>
                    <button 
                      onClick={() => setTransportType('none')}
                      className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${transportType === 'none' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Bicycle / Walk
                    </button>
                  </div>
                </div>
              </div>

              {/* CAF Housing Subsidy Toggle */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-indigo-100 text-indigo-600">
                    <Home size={18} />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Apply CAF Rent Allowance (APL)</span>
                    <span className="text-[10px] text-slate-500 font-semibold block">State rebate on monthly rent</span>
                  </div>
                </div>
                <button
                  onClick={() => setApplyCaf(!applyCaf)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${applyCaf ? 'bg-indigo-650' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${applyCaf ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Calculations Output */}
            <div className="bg-slate-900 text-white rounded-[28px] p-6 md:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block mb-1">Monthly Forecast Breakdown</span>
                <div className="space-y-3.5 my-6 text-xs text-slate-300 font-semibold">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>Base Rent (Gross)</span>
                    <span className="font-extrabold text-white">{formatCost(costConfig[location].rent[housingType])}</span>
                  </div>
                  {applyCaf && (
                    <div className="flex items-center justify-between pb-2 border-b border-white/5 text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        CAF Subsidy APL
                        <Info size={12} className="text-emerald-450 cursor-pointer" />
                      </span>
                      <span className="font-extrabold">- {formatCost(costConfig[location].caf[housingType])}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>Net Rent (Housing cost)</span>
                    <span className="font-black text-white">{formatCost(calc.netRent)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>Food & Groceries</span>
                    <span className="font-extrabold text-white">{formatCost(calc.groceries)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span>Transit Fees</span>
                    <span className="font-extrabold text-white">{formatCost(calc.transport)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Miscellaneous (Sim, Utilities)</span>
                    <span className="font-extrabold text-white">{formatCost(calc.other)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mt-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-black text-slate-400 uppercase">Estimated Monthly Cost</span>
                  <span className="text-3xl font-black text-indigo-400">{formatCost(calc.totalMonthly)}</span>
                </div>
                <div className="flex items-baseline justify-between text-xs text-slate-400">
                  <span>Yearly Estimate (12 months)</span>
                  <span className="font-black text-slate-200">{formatAnnualCost(calc.totalAnnual)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TOP SCHOLARSHIPS */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center">Top Scholarships for International Students</h2>
          <p className="text-slate-500 text-xs font-semibold mb-10 text-center">Highly popular funding tracks sponsored by the French Embassy, universities, and the European Union.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scholarshipsList.map((scholarship, idx) => (
              <div 
                key={idx}
                className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      Scholarship Option
                    </span>
                    <Sparkles size={16} className="text-indigo-650 animate-pulse" />
                  </div>
                  <h3 className="font-black text-slate-950 text-sm md:text-base leading-snug group-hover:text-indigo-650 transition-colors">
                    {scholarship.name}
                  </h3>
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 my-4">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Financial Award</span>
                    <span className="text-sm font-black text-indigo-650">
                      {currency === 'EUR' ? scholarship.awardEUR : scholarship.awardINR}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs font-semibold leading-relaxed">
                    <p className="text-slate-650"><strong className="text-slate-900 font-bold block">Eligibility Requirements:</strong> {scholarship.eligibility}</p>
                    <p className="text-slate-550 mt-2"><strong className="text-slate-900 font-bold block">Coverage details:</strong> {scholarship.coverage}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-6">
                  <Link 
                    to={`/contact?subject=${encodeURIComponent(`Apply for ${scholarship.name}`)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-all shadow-xs"
                  >
                    <span>Check Application Deadlines</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: SMART COST CUTTING HACKS */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="text-indigo-600 animate-bounce" size={22} />
              National Subsidies & Budget Tips
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              France provides state subsidies designed to help students mitigate costs. Ensure you set these up immediately upon arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {costHacks.map((hack, idx) => (
              <div 
                key={idx}
                className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-5 hover:border-indigo-400 transition-all hover:bg-white hover:shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black shadow-xs mb-4 group-hover:scale-105 transition-transform">
                  {idx + 1}
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-2">{hack.title}</h4>
                <p className="text-slate-650 text-[11px] font-semibold leading-relaxed">{hack.desc}</p>
              </div>
            ))}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="France" />

      </div>
    </div>
  );
};

export default FranceAffordable;
