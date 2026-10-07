import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, ChevronDown, Award, MapPin, Building
} from 'lucide-react';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';

// ─────────────────────────────────────────────
// Ireland University Database — PhD (11 Institutions)
// ─────────────────────────────────────────────
const universityDatabase = [
  {
    id: 1,
    name: "Trinity College Dublin",
    city: "Dublin",
    state: "Leinster",
    location: "Dublin, Leinster, Ireland",
    rank: "Rank 98 QS Rankings",
    rankValue: 98,
    tuition: 23,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tcd.ie",
    website: "https://www.tcd.ie",
    courses: ["Computer Science", "Law", "Medicine and Medical Studies", "Business Administration", "Philosophy and Religious Studies", "History", "Engineering Science", "Data Science", "Mathematics", "Psychology", "Economics", "Biological Sciences", "Chemistry", "Biochemistry"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "Ireland's oldest university, founded in 1592, with a strong doctoral tradition across sciences, humanities, law, and engineering.",
    eligibility: "Master's degree, IELTS 6.5+ or equivalent",
    deadline: "Mar 01, 2026"
  },
  {
    id: 2,
    name: "University College Dublin (UCD)",
    city: "Dublin",
    state: "Leinster",
    location: "Dublin, Leinster, Ireland",
    rank: "Rank 171 QS Rankings",
    rankValue: 171,
    tuition: 21,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucd.ie",
    website: "https://www.ucd.ie",
    courses: ["Computer Science", "Data Science", "Business Administration", "Engineering Science", "Architecture", "Nursing and midwifery", "Economics", "Psychology", "Biological Sciences", "Environmental science / management", "Law", "Software Engineering"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Ireland's largest research university offering extensive PhD programmes across engineering, sciences, business, and health sciences.",
    eligibility: "Master's degree or equivalent, IELTS 6.5+ or equivalent",
    deadline: "Mar 15, 2026"
  },
  {
    id: 3,
    name: "University College Cork (UCC)",
    city: "Cork",
    state: "Munster",
    location: "Cork, Munster, Ireland",
    rank: "Rank 292 QS Rankings",
    rankValue: 292,
    tuition: 17,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucc.ie",
    website: "https://www.ucc.ie",
    courses: ["Computer Science", "Food / Agricultural Science", "Nursing and midwifery", "Law", "Medicine and Medical Studies", "Biological Sciences", "Environmental science / management", "Psychology", "Pharmacology / Pharmacy", "Economics", "Chemistry", "Biochemistry"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A leading research university in Cork offering doctoral programmes in medicine, food sciences, law, and environmental studies.",
    eligibility: "Master's or Honours degree, IELTS 6.5+ or equivalent",
    deadline: "Apr 01, 2026"
  },
  {
    id: 4,
    name: "Dublin City University (DCU)",
    city: "Dublin",
    state: "Leinster",
    location: "Dublin, Leinster, Ireland",
    rank: "Rank 436 QS Rankings",
    rankValue: 436,
    tuition: 13,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/dcu.ie",
    website: "https://www.dcu.ie",
    courses: ["Computer Science", "Data Science", "Software Engineering", "Media & Communication", "Nursing and midwifery", "Teaching / Education studies", "Cyber Security", "Engineering Science", "Mathematics", "Biotechnology"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A dynamic Dublin university with active doctoral research in computing, communication, biotechnology, and education.",
    eligibility: "Master's or First-Class Honours, IELTS 6.5+ or equivalent",
    deadline: "Apr 15, 2026"
  },
  {
    id: 5,
    name: "University of Limerick",
    city: "Limerick",
    state: "Limerick",
    location: "Limerick, Limerick, Ireland",
    rank: "Rank 531 QS Rankings",
    rankValue: 531,
    tuition: 16,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ul.ie",
    website: "https://www.ul.ie",
    courses: ["Engineering Science", "Business Administration", "Computer Science", "Nursing and midwifery", "Sport / Exercise Science", "Law", "Mathematics", "Data Science", "Psychology", "Mechanical Engineering"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A vibrant research university in Limerick with strong doctoral programmes in engineering, health, and business sciences.",
    eligibility: "Master's or First Honours, IELTS 6.5+ or equivalent",
    deadline: "Apr 01, 2026"
  },
  {
    id: 6,
    name: "Maynooth University",
    city: "Maynooth",
    state: "Kildare",
    location: "Maynooth, Kildare, Ireland",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 12,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mu.ie",
    website: "https://www.mu.ie",
    courses: ["Computer Science", "Mathematics", "Data Science", "Psychology", "Sociology", "Law", "Economics", "Philosophy and Religious Studies", "History", "Geography", "Media & Communication", "Political Science", "Statistics"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A growing research university with active doctoral programmes in computing, social sciences, and humanities near Dublin.",
    eligibility: "Master's or First-Class Honours, IELTS 6.5+ or equivalent",
    deadline: "May 01, 2026"
  },
  {
    id: 7,
    name: "Technological University Dublin (TU Dublin)",
    city: "Dublin",
    state: "Leinster",
    location: "Dublin, Leinster, Ireland",
    rank: "Rank --",
    rankValue: 9999,
    tuition: 12,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/tudublin.ie",
    website: "https://www.tudublin.ie",
    courses: ["Computer Science", "Engineering Science", "Business Administration", "Architecture", "Food And Hospitality", "Tourism", "Construction Management", "Building Technology", "Software Engineering", "Data Analytics"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Ireland's first technological university offering research-led doctoral programmes in engineering, science, and creative disciplines.",
    eligibility: "Master's or equivalent, IELTS 6.0+ or equivalent",
    deadline: "May 01, 2026"
  },
  {
    id: 8,
    name: "National University of Ireland",
    city: "Galway",
    state: "County Galway",
    location: "Galway, County Galway, Ireland",
    rank: "Rank --",
    rankValue: 9999,
    tuition: 7,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/nuigalway.ie",
    website: "https://www.universityofgalway.ie",
    courses: ["Medicine and Medical Studies", "Engineering Science", "Business Administration", "Law", "Computer Science", "Nursing and midwifery", "Psychology", "Environmental science / management", "Economics", "Biological Sciences"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "Located on Ireland's Wild Atlantic Way, NUI Galway is celebrated for doctoral research in medicine, marine science, and law.",
    eligibility: "Master's or First Honours, IELTS 6.5+ or equivalent",
    deadline: "Apr 15, 2026"
  },
  {
    id: 9,
    name: "Munster Technological University (MTU)",
    city: "Cork",
    state: "Cork",
    location: "Cork, Cork, Ireland",
    rank: "Rank --",
    rankValue: 9999,
    tuition: 14,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mtu.ie",
    website: "https://www.mtu.ie",
    courses: ["Computer Science", "Engineering Science", "Business Administration", "Tourism", "Food And Hospitality", "Arts / Fine Art", "Nursing and midwifery", "Biological Sciences", "Chemistry"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A leading technological university in Cork and Kerry supporting doctoral research in applied sciences, engineering, and creative arts.",
    eligibility: "Master's or equivalent, IELTS 6.0+ or equivalent",
    deadline: "May 01, 2026"
  },
  {
    id: 10,
    name: "South East Technological University (SETU)",
    city: "Waterford",
    state: "Munster",
    location: "Waterford, Munster, Ireland",
    rank: "Rank --",
    rankValue: 9999,
    tuition: 14,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/setu.ie",
    website: "https://www.setu.ie",
    courses: ["Computer Science", "Engineering Science", "Business Administration", "Tourism", "Arts / Fine Art", "Nursing and midwifery", "Sports Management", "Human resource Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "Ireland's newest technological university supporting doctoral research in STEM, business, and creative disciplines in the South East.",
    eligibility: "Master's or equivalent, IELTS 6.0+ or equivalent",
    deadline: "May 15, 2026"
  },
  {
    id: 11,
    name: "Atlantic Technological University (ATU)",
    city: "Galway",
    state: "Connacht",
    location: "Galway, Connacht, Ireland",
    rank: "Rank --",
    rankValue: 9999,
    tuition: 12,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/atu.ie",
    website: "https://www.atu.ie",
    courses: ["Computer Science", "Engineering Science", "Business Administration", "Tourism", "Food And Hospitality", "Arts / Fine Art", "Nursing and midwifery", "Environmental science / management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A vibrant technological university spanning the Atlantic coast of Ireland, supporting doctoral research in STEM and creative areas.",
    eligibility: "Master's or equivalent, IELTS 6.0+ or equivalent",
    deadline: "May 15, 2026"
  }
];

// ─────────────────────────────────────────────
// Sidebar Filter Categories
// ─────────────────────────────────────────────
const degreeCategories = [
  "Ph.D.", "PG Diploma /Certificate", "Undergraduate", "UG Diploma /Certificate /Associate Degree", "Postgraduate"
];

const courseCategories = [
  "Physiotherapy", "Theatre", "Dental Studies", "Animal and Veterinary Studies",
  "Cyber Security", "Biochemistry", "Information Systems", "Philosophy and Religious Studies",
  "History", "Media & Communication", "Civil Engineering", "Mechanical Engineering",
  "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering", "Law", "Music",
  "Banking and Finance", "Teaching / Education studies", "Language and Literature",
  "Social and Cultural Courses", "Journalism", "Sociology", "Political Science",
  "Nursing and midwifery", "Chemical Engineering", "Mathematics", "Statistics",
  "International Relations", "Geography", "Psychology", "Sport / Exercise Science",
  "Physics", "Data Science", "Food / Agricultural Science", "Accounting", "Geology",
  "Environmental science / management", "Arts / Fine Art", "Graphic and Design Studies",
  "Biological Sciences", "Biotechnology", "Architecture", "International / Global Business",
  "Sales And Marketing", "Human resource Management", "Business Administration", "Chemistry",
  "Food And Hospitality", "Data Analytics", "Pharmacology / Pharmacy", "Business Management",
  "Tourism", "Medicine and Medical Studies", "Economics", "Computer Science",
  "Health Sciences / Administration", "Information technology", "Computer Engineering",
  "Environmental Engineering", "Software Engineering"
];

const cityCategories = [
  "Cork", "Dublin", "Galway", "Limerick", "Maynooth", "Waterford"
];

const intakeCategories = ["JAN", "SEP"];

const feeRanges = [
  { id: "max10", label: "Max ₹10 Lacs", max: 10 },
  { id: "max20", label: "Max ₹20 Lacs", max: 20 },
  { id: "max30", label: "Max ₹30 Lacs", max: 30 },
  { id: "max40", label: "Max ₹40 Lacs", max: 40 },
  { id: "above40", label: "₹40 Lacs +", min: 40 }
];

const IrelandPhDPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState(["Ph.D."]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);

  const [openAccordions, setOpenAccordions] = useState({
    fees: true, degree: true, courses: true, cities: true, intake: true
  });

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterToggle = (value, list, setList) => {
    setList(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedDegrees([]);
    setSelectedCourses([]);
    setSelectedCities([]);
    setSelectedIntakes([]);
    setSelectedFees([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const activeChips = [];
  selectedDegrees.forEach(d => activeChips.push({ category: 'degree', label: d, val: d }));
  selectedCourses.forEach(c => activeChips.push({ category: 'courses', label: c, val: c }));
  selectedCities.forEach(ci => activeChips.push({ category: 'cities', label: ci, val: ci }));
  selectedIntakes.forEach(i => activeChips.push({ category: 'intakes', label: i, val: i }));
  selectedFees.forEach(f => {
    const matchedRange = feeRanges.find(range => range.id === f);
    if (matchedRange) activeChips.push({ category: 'fees', label: matchedRange.label, val: f });
  });

  const handleRemoveChip = (chip) => {
    if (chip.category === 'degree') setSelectedDegrees(selectedDegrees.filter(d => d !== chip.val));
    if (chip.category === 'courses') setSelectedCourses(selectedCourses.filter(c => c !== chip.val));
    if (chip.category === 'cities') setSelectedCities(selectedCities.filter(ci => ci !== chip.val));
    if (chip.category === 'intakes') setSelectedIntakes(selectedIntakes.filter(i => i !== chip.val));
    if (chip.category === 'fees') setSelectedFees(selectedFees.filter(f => f !== chip.val));
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
      const matchesSomeRange = selectedFees.some(feeId => {
        const range = feeRanges.find(r => r.id === feeId);
        if (!range) return false;
        if (range.max !== undefined && uni.tuition > range.max) return false;
        if (range.min !== undefined && uni.tuition < range.min) return false;
        return true;
      });
      if (!matchesSomeRange) return false;
    }
    return true;
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    if (sortBy === 'rank') return a.rankValue - b.rankValue;
    if (sortBy === 'fees') return (a.tuition === null ? 999 : a.tuition) - (b.tuition === null ? 999 : b.tuition);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedUniversities.length / itemsPerPage);
  const currentUniversities = sortedUniversities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-violet-100/40 via-purple-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-violet-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-purple-300/10 to-violet-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1340px]">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/study-abroad/ireland" className="hover:text-violet-600 transition-colors">Study Abroad in Ireland</Link>
          <span>/</span>
          <span className="text-slate-700">PhD in Ireland</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-left max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            List of Top Universities & Colleges in Ireland for{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              PhD
            </span>{' '}
            — Ranking & Fees (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Explore Ireland's top doctoral programmes — compare QS rankings, tuition fees, research areas, and eligibility requirements.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <aside className="sticky top-28 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] z-30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider">
                <Filter size={15} className="text-violet-600" />
                Filters
              </span>
              <button onClick={handleClearAll} className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer transition-colors">
                Clear All
              </button>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">

              {/* Fees */}
              <div>
                <button onClick={() => toggleAccordion('fees')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5">
                  <span>1st Year Fees</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.fees ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.fees && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {feeRanges.map(range => (
                        <label key={range.id} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-violet-600 cursor-pointer select-none">
                          <input type="checkbox" checked={selectedFees.includes(range.id)} onChange={() => handleFilterToggle(range.id, selectedFees, setSelectedFees)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Degree */}
              <div>
                <button onClick={() => toggleAccordion('degree')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5">
                  <span>Degree</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.degree ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.degree && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {degreeCategories.map(deg => (
                        <label key={deg} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-violet-600 cursor-pointer select-none">
                          <input type="checkbox" checked={selectedDegrees.includes(deg)} onChange={() => handleFilterToggle(deg, selectedDegrees, setSelectedDegrees)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span>{deg}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Courses */}
              <div>
                <button onClick={() => toggleAccordion('courses')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5">
                  <span>Courses</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.courses ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.courses && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5 max-h-[220px] overflow-y-auto">
                      {courseCategories.map(course => (
                        <label key={course} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-violet-600 cursor-pointer select-none">
                          <input type="checkbox" checked={selectedCourses.includes(course)} onChange={() => handleFilterToggle(course, selectedCourses, setSelectedCourses)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span>{course}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Cities */}
              <div>
                <button onClick={() => toggleAccordion('cities')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5">
                  <span>Cities</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.cities ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.cities && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {cityCategories.map(city => (
                        <label key={city} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-violet-600 cursor-pointer select-none">
                          <input type="checkbox" checked={selectedCities.includes(city)} onChange={() => handleFilterToggle(city, selectedCities, setSelectedCities)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span>{city}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Intake */}
              <div>
                <button onClick={() => toggleAccordion('intake')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5">
                  <span>Intake</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.intake ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.intake && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {intakeCategories.map(intake => (
                        <label key={intake} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-violet-600 cursor-pointer select-none">
                          <input type="checkbox" checked={selectedIntakes.includes(intake)} onChange={() => handleFilterToggle(intake, selectedIntakes, setSelectedIntakes)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
                          <span>{intake}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </aside>

          {/* Listing */}
          <main className="flex-1 flex flex-col gap-6">

            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/50 border border-white/60 p-5 rounded-[24px] backdrop-blur-md shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by course (e.g. CS, MBA, Biotech), university, city..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-violet-400 transition-colors"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-550">
                  <span className="text-slate-800 font-black">{sortedUniversities.length}</span> Universities Found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Sort By:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-700 focus:border-violet-400 transition-colors">
                    <option value="rank">QS Rankings</option>
                    <option value="fees">Tuition Fee: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-violet-50/30 border border-violet-100/50 p-3.5 rounded-2xl">
                <span className="text-[10px] text-violet-500 font-black uppercase tracking-wider mr-1.5">Active:</span>
                {activeChips.map((chip, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-violet-100 rounded-full text-xs font-bold text-violet-700 shadow-sm">
                    <span>{chip.label}</span>
                    <button onClick={() => handleRemoveChip(chip)} className="text-slate-400 hover:text-violet-600 transition-colors cursor-pointer">
                      <X size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                ))}
                <button onClick={handleClearAll} className="text-[11px] font-black text-violet-600 hover:underline ml-2 cursor-pointer">Clear All</button>
              </div>
            )}

            {/* University Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <AnimatePresence mode="popLayout">
                {currentUniversities.map((uni) => {
                  const matchedCourses = searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : [];
                  return (
                  <motion.div
                    key={uni.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={getUniversityLogo(uni.name, uni.logo)} alt={uni.name} className="w-10 h-10 object-contain" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name.charAt(0))}&background=7c3aed&color=fff&size=36`; }} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-violet-600 transition-colors">{uni.name}</h3>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                            <MapPin size={11} className="text-slate-400" />
                            {uni.location}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1">
                            <Award size={12} className="text-violet-600" />
                            {uni.rank.replace("Rank ", "").replace(" QS Rankings", "")}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1st Year Fees</p>
                          <p className="text-xs font-black text-violet-600 mt-0.5">{uni.tuition ? `₹ ${uni.tuition} Lakh` : '-/-'}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                          <p className="text-[10px] font-black text-violet-600 mt-1 uppercase tracking-wider flex items-center gap-1">
                            <Building size={11} className="text-violet-500" />
                            {uni.type}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-slate-550 font-medium leading-relaxed italic line-clamp-2 mb-2">{uni.description}</p>
                        {/* Matched course highlight */}
                        {matchedCourses.length > 0 && (
                          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 bg-violet-50 border border-violet-200/80 px-2.5 py-1.5 rounded-xl">
                            <span className="text-[9px] font-black text-violet-700 uppercase tracking-wide">✓ Matched Course:</span>
                            {matchedCourses.slice(0, 3).map((mc, idx) => (
                              <span key={idx} className="text-[10px] font-black bg-violet-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                                {mc}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {uni.courses.slice(0, 3).map(c => (
                            <span key={c} className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{c}</span>
                          ))}
                          {uni.courses.length > 3 && (
                            <span className="text-[9.5px] font-bold text-slate-400 px-1 py-0.5">+{uni.courses.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100/50 p-3 rounded-xl mb-4 text-[11px] font-bold text-slate-650 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Eligibility:</span>
                          <span className="text-slate-800 text-right font-semibold">{uni.eligibility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deadline:</span>
                          <span className="text-violet-600 font-black">{uni.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-slate-100 pt-4 mt-2">
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors text-xs font-bold shadow-sm">
                        Visit School
                      </a>
                      <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold">
                        Check Eligibility
                      </Link>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>

              {sortedUniversities.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
                  No Irish universities match your active filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-slate-100 pt-8">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(no => (
                  <button key={no} onClick={() => handlePageChange(no)} className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${currentPage === no ? 'bg-violet-600 text-white shadow-md' : 'border border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}>{no}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}>Next</button>
              </div>
            )}

          </main>
        </div>

      {/* CTA Section */}
      <StudyAbroadCTA country="Ireland" />

      </div>
    </div>
  );
};

export default IrelandPhDPage;
