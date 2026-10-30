import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Award, MapPin, Building } from 'lucide-react';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';
import { HookBand, BarCompare } from '../../../../../components/ui/Infographics';
import { FinderCard, FinderField, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../../../components/ui/FinderForm';

const universityDatabase = [
  { id: 2,  name: "Monash University",                  city: "Melbourne",    state: "Victoria",        location: "Melbourne, Victoria, Australia",             rank: "Rank 31 QS Rankings",  rankValue: 31,   tuition: 42, type: "PUBLIC", logo: "https://logo.clearbit.com/monash.edu",           website: "https://www.monash.edu",           courses: ["Business Analytics","Data Science","Computer Science","Business Administration","Accounting","Artificial Intelligence / Machine Learning","Economics","Software Engineering"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB"], description: "A leading research university in Melbourne offering a Master of Business Analytics at its Clayton campus.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 3,  name: "University of Queensland",           city: "Brisbane",     state: "Queensland",      location: "Brisbane, Queensland, Australia",            rank: "Rank 40 QS Rankings",  rankValue: 40,   tuition: 41, type: "PUBLIC", logo: "https://logo.clearbit.com/uq.edu.au",            website: "https://www.uq.edu.au",            courses: ["Business Analytics","Data Science","Computer Science","Business Administration","Accounting","Economics","Environmental science / management","Software Engineering"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "UQ's Master of Business Analytics is now online-only; on campus in Brisbane, international students can take the Master of Business (Information Systems field).", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 4,  name: "Macquarie University",               city: "Sydney",       state: "New South Wales", location: "Sydney, New South Wales, Australia",        rank: "Rank 126 QS Rankings", rankValue: 126,  tuition: 33, type: "PUBLIC", logo: "https://logo.clearbit.com/mq.edu.au",            website: "https://www.mq.edu.au",            courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Accounting","Finance","Economics","Software Engineering"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A research-intensive Sydney university offering a Master of Business Analytics at its Macquarie Park campus.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 5,  name: "RMIT University",                    city: "Melbourne",    state: "Victoria",        location: "Melbourne, Victoria, Australia",             rank: "Rank 119 QS Rankings", rankValue: 119,  tuition: 34, type: "PUBLIC", logo: "https://logo.clearbit.com/rmit.edu.au",          website: "https://www.rmit.edu.au",          courses: ["Business Analytics","Data Science","Computer Science","Business Administration","Accounting","Software Engineering","Artificial Intelligence / Machine Learning","Cyber Security"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A technology and design university in Melbourne's CBD offering the Master of Business Analytics and AI Strategy.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 6,  name: "Queensland University of Technology", city: "Brisbane",    state: "Queensland",      location: "Brisbane, Queensland, Australia",            rank: "Rank 240 QS Rankings", rankValue: 240,  tuition: 30, type: "PUBLIC", logo: "https://logo.clearbit.com/qut.edu.au",           website: "https://www.qut.edu.au",           courses: ["Business Analytics","Data Science","Computer Science","Business Administration","Software Engineering","Accounting","Architecture","Information technology"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "QUT has no Master of Business Analytics; its closest option for international students is the Master of Data Science in Brisbane.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 7,  name: "Deakin University",                  city: "Melbourne",    state: "Victoria",        location: "Melbourne, Victoria, Australia",             rank: "Rank 227 QS Rankings", rankValue: 227,  tuition: 30, type: "PUBLIC", logo: "https://logo.clearbit.com/deakin.edu.au",        website: "https://www.deakin.edu.au",        courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Accounting","Nursing and midwifery","Software Engineering","Artificial Intelligence / Machine Learning"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["MAR","JUL","NOV"], description: "Deakin offers a Master of Business Analytics at its Melbourne Burwood campus, with three intakes a year.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 8,  name: "Swinburne University of Technology", city: "Melbourne",    state: "Victoria",        location: "Melbourne, Victoria, Australia",             rank: "Rank 291 QS Rankings", rankValue: 291,  tuition: 31, type: "PUBLIC", logo: "https://logo.clearbit.com/swinburne.edu.au",    website: "https://www.swinburne.edu.au",    courses: ["Business Analytics","Data Science","Computer Science","Business Administration","Software Engineering","Artificial Intelligence / Machine Learning","Accounting","Cyber Security"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","NOV"], description: "Swinburne has no Master of Business Analytics; its closest option is the Master of Data Science at the Hawthorn campus in Melbourne.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 9,  name: "La Trobe University",                city: "Melbourne",    state: "Victoria",        location: "Melbourne, Victoria, Australia",             rank: "Rank 241 QS Rankings", rankValue: 241,  tuition: 31, type: "PUBLIC", logo: "https://logo.clearbit.com/latrobe.edu.au",      website: "https://www.latrobe.edu.au",      courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Accounting","Nursing and midwifery","Environmental science / management","Software Engineering"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["MAR","JUL","NOV"], description: "A research-intensive Melbourne university offering a Master of Business Analytics at its Bundoora campus.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 10, name: "Adelaide University",      city: "Adelaide",     state: "South Australia", location: "Adelaide, South Australia, Australia",      rank: "Rank 79 QS Rankings", rankValue: 79,  tuition: 37, type: "PUBLIC", logo: "https://logo.clearbit.com/unisa.edu.au",        website: "https://www.adelaide.edu.au",        courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Accounting","Engineering Science","Software Engineering","Marketing"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "Formed in 2026 from the University of Adelaide and UniSA, offering a Master of Business Analytics at its Adelaide City campus.", eligibility: "Bachelor's degree, IELTS 6.5+", deadline: "Varies by course" },
  { id: 11, name: "James Cook University",              city: "Brisbane",   state: "Queensland",      location: "Brisbane & Cairns, Queensland, Australia",          rank: "Rank 438 QS Rankings", rankValue: 438,  tuition: 27, type: "PUBLIC", logo: "https://logo.clearbit.com/jcu.edu.au",           website: "https://www.jcu.edu.au",           courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Marine science","Accounting","Tourism","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","SEP"], description: "JCU has no Master of Business Analytics; its closest option is the Master of Data Science (Professional), taught in Cairns and Brisbane.", eligibility: "Bachelor's degree + IELTS/PTE", deadline: "Varies by course" },
  { id: 12, name: "University of the Sunshine Coast",  city: "Sippy Downs",  state: "Queensland",      location: "Sippy Downs, Queensland, Australia",         rank: "Rank 851-900 QS Rankings",              rankValue: 851, tuition: 23, type: "PUBLIC", logo: "https://logo.clearbit.com/usc.edu.au",           website: "https://www.unisc.edu.au",           courses: ["Business Analytics","Data Science","Business Administration","Computer Science","Accounting","Nursing and midwifery","Environmental science / management","Teaching / Education studies"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["MAR","JUL"], description: "UniSC offers a 1.5-year Master of Business Intelligence and Analytics on the Sunshine Coast.", eligibility: "Bachelor's degree + IELTS/PTE", deadline: "Varies by course" }
];

const degreeCategories = ["Postgraduate","Ph.D.","PG Diploma /Certificate","Undergraduate","UG Diploma /Certificate /Associate Degree"];
const courseCategories = ["Business Analytics","Industrial Engineering","Broadcast Media","Engineering Design","Industrial Design","Physiotherapy","Astronomy","Speech Pathology","Interior Design","Theatre","Social Work","Dental Studies","Animal and Veterinary Studies","Justice studies","Materials and Mineral Engineering","Manufacturing Engineering","General Engineering And Technology","Electronics","Cyber Security","Automotive engineering","Robotics","Physical Sciences","Biochemistry","Information Systems","Philosophy and Religious Studies","History","Media & Communication","Commerce","Public Health","Game Development","Civil Engineering","Mechanical Engineering","Electrical Engineering","Biomedical Engineering","Aerospace Engineering","Mining Engineering","Geomatic Engineering","Engineering Science","Petroleum Engineering","Legal Studies","Law","Music","Archaeology","Dance","Banking and Finance","Teaching / Education studies","Risk Management","Language and Literature","Social and Cultural Courses","Film and TV production","Journalism","Creative Writing","Advertising","Audio Visual Studies","Sociology","Political Science","Occupational Health & Safety","Nursing and midwifery","Chemical Engineering","Mathematics","Statistics","Linguistic","English language","Photography","Animation","International Relations","Behavioural Science","Geography","Psychology","Sport / Exercise Science","Physics","Data Science","Food / Agricultural Science","Accounting","Earth Sciences / Geoscience","Geology","Environmental science / management","Marine science","Human Geography","Arts / Fine Art","Graphic and Design Studies","Creative Arts","Fashion Design","Product Design","Biological Sciences","Genetics","Zoology","Forensics","Biotechnology","Architecture","Construction Management","Landscape design and architecture","Planning","Building Technology","Surveying","International / Global Business","Sales And Marketing","Human resource Management","Business Administration","Project Management","Innovation / Entrepreneurship","Organisation Management","Chemistry","Food And Hospitality","Data Analytics","Pharmacology / Pharmacy","Business Management","Leadership Development","Tourism","Anthropology","Medicine and Medical Studies","Economics","Computer Science","Artificial Intelligence / Machine Learning","Health Sciences / Administration","Information technology","Computer Graphics","Computer Engineering","Environmental Engineering","Software Engineering","Web Development","Management","Interdisciplinary Studies"];
const cityCategories = ["Adelaide","Brisbane","Melbourne","Sippy Downs","Sydney"];
const intakeCategories = ["FEB","MAR","JUL","SEP","NOV"];
// Five lowest first-year fees from the list above, for the fee chart under the results
const lowestFeeUnis = [...new Map(universityDatabase.filter((u) => typeof u.tuition === 'number' && u.tuition > 0).map((u) => [u.name, u])).values()]
  .sort((a, b) => a.tuition - b.tuition)
  .slice(0, 5)
  .map((u) => ({ label: u.name, value: u.tuition, display: `₹${u.tuition} Lakh` }));

const feeRanges = [{ id: "max10", label: "Max ₹10 Lacs", max: 10 },{ id: "max20", label: "Max ₹20 Lacs", max: 20 },{ id: "max30", label: "Max ₹30 Lacs", max: 30 },{ id: "max40", label: "Max ₹40 Lacs", max: 40 },{ id: "above40", label: "₹40 Lacs +", min: 40 }];

const AustraliaBusinessAnalyticsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState(["Postgraduate"]);
  const [selectedCourses, setSelectedCourses] = useState(["Business Analytics"]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [openAccordions, setOpenAccordions] = useState({ fees: true, degree: true, courses: true, cities: true, intake: true });

  const toggleAccordion = (s) => setOpenAccordions(p => ({ ...p, [s]: !p[s] }));
  const handleFilterToggle = (v, l, sl) => { sl(l.includes(v) ? l.filter(i => i !== v) : [...l, v]); setCurrentPage(1); };
  const handleClearAll = () => { setSelectedDegrees([]); setSelectedCourses([]); setSelectedCities([]); setSelectedIntakes([]); setSelectedFees([]); setSearchTerm(''); setCurrentPage(1); };

  const activeChips = [
    ...selectedDegrees.map(d => ({ category: 'degree', label: d, val: d })),
    ...selectedCourses.map(c => ({ category: 'courses', label: c, val: c })),
    ...selectedCities.map(ci => ({ category: 'cities', label: ci, val: ci })),
    ...selectedIntakes.map(i => ({ category: 'intakes', label: i, val: i })),
    ...selectedFees.map(f => { const r = feeRanges.find(x => x.id === f); return r ? { category: 'fees', label: r.label, val: f } : null; }).filter(Boolean)
  ];

  const handleRemoveChip = (chip) => {
    if (chip.category === 'degree') setSelectedDegrees(p => p.filter(d => d !== chip.val));
    if (chip.category === 'courses') setSelectedCourses(p => p.filter(c => c !== chip.val));
    if (chip.category === 'cities') setSelectedCities(p => p.filter(c => c !== chip.val));
    if (chip.category === 'intakes') setSelectedIntakes(p => p.filter(i => i !== chip.val));
    if (chip.category === 'fees') setSelectedFees(p => p.filter(f => f !== chip.val));
    setCurrentPage(1);
  };

  const filteredUniversities = universityDatabase.filter(uni => {
    if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) return false;
    if (selectedDegrees.length > 0 && !uni.degrees.some(d => selectedDegrees.includes(d))) return false;
    if (selectedCourses.length > 0 && !uni.courses.some(c => selectedCourses.includes(c))) return false;
    if (selectedCities.length > 0 && !selectedCities.includes(uni.city)) return false;
    if (selectedIntakes.length > 0 && !uni.intakes.some(i => selectedIntakes.includes(i))) return false;
    if (selectedFees.length > 0) {
      if (uni.tuition === null) return false;
      const ok = selectedFees.some(fid => { const r = feeRanges.find(x => x.id === fid); if (!r) return false; if (r.max !== undefined && uni.tuition > r.max) return false; if (r.min !== undefined && uni.tuition < r.min) return false; return true; });
      if (!ok) return false;
    }
    return true;
  });

  const sorted = [...filteredUniversities].sort((a, b) => sortBy === 'rank' ? a.rankValue - b.rankValue : sortBy === 'fees' ? ((a.tuition ?? 999) - (b.tuition ?? 999)) : a.name.localeCompare(b.name));
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const current = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) { setCurrentPage(n); window.scrollTo({ top: 150, behavior: 'smooth' }); } };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-teal-100/40 via-emerald-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-300/10 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1340px]">
        <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/study-abroad/australia" className="hover:text-teal-600 transition-colors">Study Abroad in Australia</Link>
          <span>/</span>
          <span className="text-slate-700">Masters in Business Analytics</span>
        </div>

        <div className="mb-10 max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Top Universities in Australia for Masters (MS) in{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Business Analytics</span>{' '}
            (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Explore Australia's top universities for Masters in Business Analytics — compare QS rankings, tuition fees, cities, and eligibility.
          </p>
        </div>

        <HookBand value={universityDatabase.length} label="Australian universities on this page for Business Analytics. Filter by city, fees and intake below." hi="तुलना करो" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="sticky top-28 bg-white border border-[#E6E0D4] p-5 shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] z-30" style={{ borderRadius: 18 }}>
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE6DA] mb-5">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-[#16130F]"><Filter size={15} className="text-[#DE5C2B]" /> Filters</span>
              <button onClick={handleClearAll} className="text-[12.5px] font-semibold text-[#DE5C2B] hover:text-[#86351A] cursor-pointer">Clear All</button>
            </div>
            <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {[
                { key: 'fees', label: '1st Year Fees', items: feeRanges.map(r => ({ label: r.label, id: r.id })), list: selectedFees, setList: setSelectedFees, isId: true },
                { key: 'degree', label: 'Degree', items: degreeCategories.map(d => ({ label: d, id: d })), list: selectedDegrees, setList: setSelectedDegrees, isId: false },
                { key: 'cities', label: 'Cities', items: cityCategories.map(c => ({ label: c, id: c })), list: selectedCities, setList: setSelectedCities, isId: false },
                { key: 'intake', label: 'Intake', items: intakeCategories.map(i => ({ label: i, id: i })), list: selectedIntakes, setList: setSelectedIntakes, isId: false },
              ].map(({ key, label, items, list, setList }) => (
                <React.Fragment key={key}>
                  <div>
                    <button onClick={() => toggleAccordion(key)} className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3">
                      <span>{label}</span>
                      <ChevronDown size={14} className={`transition-transform text-[#9A9184] ${openAccordions[key] ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordions[key] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                          {items.map(item => (
                            <label key={item.id} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer">
                              <input type="checkbox" checked={list.includes(item.id)} onChange={() => handleFilterToggle(item.id, list, setList)} className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer" />
                              {item.label}
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="h-px bg-[#ECE6DA]" />
                </React.Fragment>
              ))}
              {/* Courses special */}
              <div>
                <button onClick={() => toggleAccordion('courses')} className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3">
                  <span>Courses</span>
                  <ChevronDown size={14} className={`transition-transform text-[#9A9184] ${openAccordions.courses ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.courses && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5 max-h-[220px] overflow-y-auto">
                      {courseCategories.map(c => (
                        <label key={c} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer">
                          <input type="checkbox" checked={selectedCourses.includes(c)} onChange={() => handleFilterToggle(c, selectedCourses, setSelectedCourses)} className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer" />
                          {c}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col gap-6">
            {/* Search and Sort */}
            <FinderCard>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] xl:grid-cols-[1fr_220px_auto] gap-3 items-end">
                <FinderField label="Search">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B544A] pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      placeholder="Search by course (e.g. CS, MBA, Data Science), university, city..."
                      className={`${FINDER_FIELD} pl-10`}
                      style={FIELD_RADIUS}
                    />
                  </div>
                </FinderField>
                <FinderField label="Sort by">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${FINDER_FIELD} cursor-pointer`} style={FIELD_RADIUS}>
                    <option value="rank">QS Rankings</option>
                    <option value="fees">Tuition: Low to High</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </FinderField>
                <p className="text-[13.5px] text-[#5B544A] whitespace-nowrap sm:col-span-2 xl:col-span-1 xl:h-11 xl:flex xl:items-center">
                  <span className="font-bold text-[#16130F]">{sorted.length}</span>&nbsp;universities
                </p>
              </div>
            </FinderCard>

            {/* Active Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-white/70 border border-[#E6E0D4] p-3.5" style={{ borderRadius: 18 }}>
                <span className="text-[13.5px] font-semibold text-[#16130F] mr-1">Active filters</span>
                {activeChips.map((chip, idx) => (
                  <FinderChip key={idx} on onClick={() => handleRemoveChip(chip)} aria-label={`Remove ${chip.label}`}>
                    {chip.label} <X size={13} className="stroke-[2.5]" />
                  </FinderChip>
                ))}
                <button onClick={handleClearAll} className="text-[13px] font-semibold text-[#DE5C2B] hover:text-[#86351A] ml-1 cursor-pointer">Clear All</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {current.map(uni => {
                  const matchedCourses = searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : [];
                  return (
                  <motion.div key={uni.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={getUniversityLogo(uni.name, uni.logo)} alt={uni.name} className="w-10 h-10 object-contain" onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name.charAt(0))}&background=0d9488&color=fff&size=36`; }} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-teal-600 transition-colors">{uni.name}</h3>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1"><MapPin size={11} />{uni.location}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50"><p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p><p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1"><Award size={12} className="text-teal-600" />{uni.rank.replace("Rank ", "").replace(" QS Rankings", "")}</p></div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50"><p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1st Yr Fees</p><p className="text-xs font-black text-teal-600 mt-0.5">₹{uni.tuition} Lakh</p></div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50"><p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</p><p className="text-[10px] font-black text-teal-600 mt-1 flex items-center gap-1"><Building size={11} />{uni.type}</p></div>
                      </div>
                      <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2 mb-3">{uni.description}</p>

                      {/* Matched course highlight */}
                      {matchedCourses.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 bg-teal-50 border border-teal-200/80 px-2.5 py-1.5 rounded-xl">
                          <span className="text-[9px] font-black text-teal-700 uppercase tracking-wide">✓ Matched Course:</span>
                          {matchedCourses.slice(0, 3).map((mc, idx) => (
                            <span key={idx} className="text-[10px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                              {mc}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-4">{uni.courses.slice(0, 3).map(c => <span key={c} className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{c}</span>)}</div>
                      <div className="bg-slate-50 border border-slate-100/50 p-3 rounded-xl mb-4 text-[11px] font-bold text-slate-600 flex flex-col gap-1">
                        <div className="flex justify-between"><span>Eligibility:</span><span className="text-slate-800 text-right font-semibold">{uni.eligibility}</span></div>
                        <div className="flex justify-between"><span>Deadline:</span><span className="text-teal-600 font-black">{uni.deadline}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 border-t border-slate-100 pt-4 mt-2">
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">Visit School</a>
                      <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-bold transition-colors">Check Eligibility</Link>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
              {sorted.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">No universities match your active filters.</div>}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-slate-100 pt-8">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => handlePageChange(n)} className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${currentPage === n ? 'bg-teal-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>{n}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>Next</button>
              </div>
            )}
            {lowestFeeUnis.length >= 3 && (
              <BarCompare
                kicker="Budget picks"
                title="Lowest first-year tuition on this page"
                items={lowestFeeUnis}
                className="mt-10"
              />
            )}
          </main>
        </div>

      {/* CTA Section */}
      <StudyAbroadCTA country="Australia" />

      </div>
    </div>
  );
};

export default AustraliaBusinessAnalyticsPage;
