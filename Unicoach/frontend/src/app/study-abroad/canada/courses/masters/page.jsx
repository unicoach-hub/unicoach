import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, Award, MapPin, 
  Building, Globe, Check, Info, Calendar, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';
import { HookBand, BarCompare } from '../../../../../components/ui/Infographics';
import { FinderCard, FinderField, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../../../components/ui/FinderForm';

// ─────────────────────────────────────────────
// Combined Canada University Database (20 Institutions)
// ─────────────────────────────────────────────
const universityDatabase = [
  {
    id: 1,
    name: "University of Toronto",
    city: "Toronto",
    state: "Ontario",
    location: "Toronto, Ontario, Canada",
    rank: "Rank 32 QS Rankings",
    rankValue: 32,
    tuition: 52,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/utoronto.ca",
    website: "https://www.utoronto.ca",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", "Software Engineering", "Management", "Business Administration", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "One of Canada's top-ranked universities, offering world-renowned programs in research, computing, medicine, and humanities.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 2,
    name: "McGill University",
    city: "Montreal",
    state: "Quebec",
    location: "Montreal, Quebec, Canada",
    rank: "Rank 30 QS Rankings",
    rankValue: 30,
    tuition: 22,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mcgill.ca",
    website: "https://www.mcgill.ca",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", "Software Engineering", "Management", "Business Administration", "Economics", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Canada's highest-ranked university in the QS 2027 rankings, attracting top students from around the world to its Montreal campus.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 3,
    name: "University of British Columbia",
    city: "Vancouver",
    state: "British Columbia",
    location: "Vancouver, British Columbia, Canada",
    rank: "Rank 45 QS Rankings",
    rankValue: 45,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ubc.ca",
    website: "https://www.ubc.ca",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", "Software Engineering", "Management", "Business Administration", "Economics"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A global centre for research and teaching, ranked 45th in the world in the QS World University Rankings 2027.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 4,
    name: "University of Alberta",
    city: "Edmonton",
    state: "Alberta",
    location: "Edmonton, Alberta, Canada",
    rank: "Rank 97 QS Rankings",
    rankValue: 97,
    tuition: 13,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ualberta.ca",
    website: "https://www.ualberta.ca",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", "Software Engineering", "Management", "Business Administration", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "MAY", "SEP"],
    description: "A world-class, research-driven university offering leading programs in energy, computing sciences, and health.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 5,
    name: "University of Waterloo",
    city: "Waterloo",
    state: "Ontario",
    location: "Waterloo, Ontario, Canada",
    rank: "Rank 113 QS Rankings",
    rankValue: 113,
    tuition: 35,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uwaterloo.ca",
    website: "https://uwaterloo.ca",
    courses: ["Computer Science", "Software Engineering", "Data Science", "Mathematics", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "MAY", "SEP"],
    description: "World-famous for its co-operative education program, engineering, and computer science degrees.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 6,
    name: "Western University",
    city: "London",
    state: "Ontario",
    location: "London, Ontario, Canada",
    rank: "Rank 142 QS Rankings",
    rankValue: 142,
    tuition: 32,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uwo.ca",
    website: "https://www.uwo.ca",
    courses: ["Computer Science", "Software Engineering", "Management", "Business Administration", "Economics", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "One of Canada's top research-intensive universities, offering excellent undergraduate and graduate programs.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 7,
    name: "Université de Montréal",
    city: "Montreal",
    state: "Quebec",
    location: "Montreal, Quebec, Canada",
    rank: "Rank 162 QS Rankings",
    rankValue: 162,
    tuition: 16,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/umontreal.ca",
    website: "https://www.umontreal.ca",
    courses: ["Computer Science", "Software Engineering", "Medicine and Medical Studies", "Economics"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A leading French-language public research university located on Mount Royal in Montreal, Quebec.",
    eligibility: "Bachelor's degree + French proficiency (programs taught in French)",
    deadline: "Varies by program"
  },
  {
    id: 8,
    name: "University of Calgary",
    city: "Calgary",
    state: "Alberta",
    location: "Calgary, Alberta, Canada",
    rank: "Rank 249 QS Rankings",
    rankValue: 249,
    tuition: 15,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ucalgary.ca",
    website: "https://www.ucalgary.ca",
    courses: ["Computer Science", "Software Engineering", "Management", "Business Administration", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "MAY", "SEP"],
    description: "A research-intensive university in Calgary, known for engineering, energy research, and entrepreneurship.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 9,
    name: "McMaster University",
    city: "Hamilton",
    state: "Ontario",
    location: "Hamilton, Ontario, Canada",
    rank: "Rank 174 QS Rankings",
    rankValue: 174,
    tuition: 38,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mcmaster.ca",
    website: "https://www.mcmaster.ca",
    courses: ["Computer Science", "Software Engineering", "Biomedical Engineering", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Research-intensive public university globally renowned for its innovative medical school and problem-based learning.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 10,
    name: "University of Ottawa",
    city: "Ottawa",
    state: "Ontario",
    location: "Ottawa, Ontario, Canada",
    rank: "Rank 228 QS Rankings",
    rankValue: 228,
    tuition: null,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uottawa.ca",
    website: "https://www.uottawa.ca",
    courses: ["Computer Science", "Software Engineering", "Management", "Business Administration", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "The largest bilingual (English-French) university in the world, offering excellent public administration and sciences.",
    eligibility: "Bachelor's degree + English or French test; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 11,
    name: "Queen's University",
    city: "Kingston",
    state: "Ontario",
    location: "Kingston, Ontario, Canada",
    rank: "Rank 179 QS Rankings",
    rankValue: 179,
    tuition: 20,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/queensu.ca",
    website: "https://www.queensu.ca",
    courses: ["Computer Science", "Software Engineering", "Business Administration", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A prestigious, historic Canadian university known for student engagement, research excellence, and business studies.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 12,
    name: "Dalhousie University",
    city: "Halifax",
    state: "Nova Scotia",
    location: "Halifax, Nova Scotia, Canada",
    rank: "Rank 298 QS Rankings",
    rankValue: 298,
    tuition: 24,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/dal.ca",
    website: "https://www.dal.ca",
    courses: ["Computer Science", "Software Engineering", "Industrial Engineering", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Dalhousie University is one of Canada's leading research-intensive universities, offering a wide range of academic programs in Halifax.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 13,
    name: "University of Saskatchewan",
    city: "Saskatoon",
    state: "Saskatchewan",
    location: "Saskatoon, Saskatchewan, Canada",
    rank: "Rank 411 QS Rankings",
    rankValue: 411,
    tuition: 12,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/usask.ca",
    website: "https://www.usask.ca",
    courses: ["Computer Science", "Software Engineering", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A member of the U15 group of Canadian research universities, noted for agricultural sciences and medicine.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 14,
    name: "Simon Fraser University",
    city: "Burnaby",
    state: "British Columbia",
    location: "Burnaby, British Columbia, Canada",
    rank: "Rank 312 QS Rankings",
    rankValue: 312,
    tuition: 15,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/sfu.ca",
    website: "https://www.sfu.ca",
    courses: ["Computer Science", "Software Engineering", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A leading comprehensive university with campuses in Vancouver, Burnaby, and Surrey, renowned for computing sciences.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 15,
    name: "University of Victoria",
    city: "Victoria",
    state: "British Columbia",
    location: "Victoria, British Columbia, Canada",
    rank: "Rank 370 QS Rankings",
    rankValue: 370,
    tuition: 6,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uvic.ca",
    website: "https://www.uvic.ca",
    courses: ["Computer Science", "Software Engineering", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A research university on Vancouver Island, known for its co-op program, ocean and climate research, and engineering and computer science.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 16,
    name: "Université Laval",
    city: "Quebec City",
    state: "Quebec",
    location: "Quebec City, Quebec, Canada",
    rank: "Rank 526 QS Rankings",
    rankValue: 526,
    tuition: 18,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ulaval.ca",
    website: "https://www.ulaval.ca",
    courses: ["Computer Science", "Software Engineering", "History", "Forestry Studies"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "The oldest French-language university in North America; most programs are taught in French. Strong in forestry and humanities research.",
    eligibility: "Bachelor's degree + French proficiency (programs taught in French)",
    deadline: "Varies by program"
  },
  {
    id: 17,
    name: "Concordia University",
    city: "Montreal",
    state: "Quebec",
    location: "Montreal, Quebec, Canada",
    rank: "Rank 497 QS Rankings",
    rankValue: 497,
    tuition: 12,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/concordia.ca",
    website: "https://www.concordia.ca",
    courses: ["Computer Science", "Software Engineering", "Business Administration", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A vibrant, modern university in downtown Montreal known for its flexible learning styles and strong business school.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 18,
    name: "University of Guelph",
    city: "Guelph",
    state: "Ontario",
    location: "Guelph, Ontario, Canada",
    rank: "Rank 546 QS Rankings",
    rankValue: 546,
    tuition: 14,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uoguelph.ca",
    website: "https://www.uoguelph.ca",
    courses: ["Computer Science", "Management", "Biological Sciences"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "Renowned for veterinary medicine, agricultural science, life sciences, and community engagement.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 19,
    name: "Wilfrid Laurier University",
    city: "Waterloo",
    state: "Ontario",
    location: "Waterloo, Ontario, Canada",
    rank: "Not ranked (QS 2027)",
    rankValue: 9999,
    tuition: 16,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/wlu.ca",
    website: "https://www.wlu.ca",
    courses: ["Computer Science", "Business Administration", "Management"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A leading public university known for its business school, music programs, and strong student-centric focus.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  },
  {
    id: 20,
    name: "Carleton University",
    city: "Ottawa",
    state: "Ontario",
    location: "Ottawa, Ontario, Canada",
    rank: "Rank 801-850 QS Rankings",
    rankValue: 801,
    tuition: 21,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/carleton.ca",
    website: "https://carleton.ca",
    courses: ["Computer Science", "Software Engineering", "Management", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["JAN", "SEP"],
    description: "A public university in Ottawa, offering strong engineering, public affairs, journalism, and high-tech programs.",
    eligibility: "Bachelor's degree + IELTS/TOEFL; min. GPA varies by program",
    deadline: "Varies by program"
  }
];

// ─────────────────────────────────────────────
// Sidebar Filter Categories Definition
// ─────────────────────────────────────────────
const degreeCategories = [
  "Postgraduate", "Ph.D.", "PG Diploma /Certificate", "Undergraduate", "UG Diploma /Certificate /Associate Degree"
];

const courseCategories = [
  "Computer Science", "Software Engineering", "Data Science", "Artificial Intelligence / Machine Learning", 
  "Management", "Business Administration", "Engineering Science", "Economics", "Medicine and Medical Studies", 
  "Mathematics", "Biological Sciences", "History", "Forestry Studies", "Industrial Engineering"
];

const cityCategories = [
  "Toronto", "Montreal", "Vancouver", "Edmonton", "Waterloo", "London", "Calgary", "Hamilton", "Ottawa", 
  "Kingston", "Halifax", "Saskatoon", "Burnaby", "Victoria", "Quebec City", "Guelph"
];

const intakeCategories = [
  "JAN", "MAY", "SEP"
];

// Five lowest first-year fees from the list above, for the fee chart under the results
const lowestFeeUnis = [...new Map(universityDatabase.filter((u) => typeof u.tuition === 'number' && u.tuition > 0).map((u) => [u.name, u])).values()]
  .sort((a, b) => a.tuition - b.tuition)
  .slice(0, 5)
  .map((u) => ({ label: u.name, value: u.tuition, display: `₹${u.tuition} Lakh` }));

const feeRanges = [
  { id: "max10", label: "Max ₹10 Lacs", max: 10 },
  { id: "max20", label: "Max ₹20 Lacs", max: 20 },
  { id: "max30", label: "Max ₹30 Lacs", max: 30 },
  { id: "max40", label: "Max ₹40 Lacs", max: 40 },
  { id: "above40", label: "₹40 Lacs +", min: 40 }
];

const CanadaMastersCoursePage = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState(["Postgraduate"]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]); // Array of feeRange IDs
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'fees' | 'name'
  const [currentPage, setCurrentPage] = useState(1);

  // Accordion toggle states
  const [openAccordions, setOpenAccordions] = useState({
    fees: true,
    degree: true,
    courses: true,
    cities: true,
    intake: true
  });

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle Multi-Select filter selections
  const handleFilterToggle = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedDegrees([]);
    setSelectedCourses([]);
    setSelectedCities([]);
    setSelectedIntakes([]);
    setSelectedFees([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Build the list of active chips
  const activeChips = [];
  selectedDegrees.forEach(d => activeChips.push({ category: 'degree', label: d, val: d }));
  selectedCourses.forEach(c => activeChips.push({ category: 'courses', label: c, val: c }));
  selectedCities.forEach(ci => activeChips.push({ category: 'cities', label: ci, val: ci }));
  selectedIntakes.forEach(i => activeChips.push({ category: 'intakes', label: i, val: i }));
  selectedFees.forEach(f => {
    const matchedRange = feeRanges.find(range => range.id === f);
    if (matchedRange) activeChips.push({ category: 'fees', label: matchedRange.label, val: f });
  });

  // Remove a single chip
  const handleRemoveChip = (chip) => {
    if (chip.category === 'degree') setSelectedDegrees(selectedDegrees.filter(d => d !== chip.val));
    if (chip.category === 'courses') setSelectedCourses(selectedCourses.filter(c => c !== chip.val));
    if (chip.category === 'cities') setSelectedCities(selectedCities.filter(ci => ci !== chip.val));
    if (chip.category === 'intakes') setSelectedIntakes(selectedIntakes.filter(i => i !== chip.val));
    if (chip.category === 'fees') setSelectedFees(selectedFees.filter(f => f !== chip.val));
    setCurrentPage(1);
  };

  // Filter core logic
  const filteredUniversities = universityDatabase.filter(uni => {
    // 1. Search filter
    if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) {
      return false;
    }

    // 2. Degree filter
    if (selectedDegrees.length > 0) {
      const degreeMatches = uni.degrees.some(d => selectedDegrees.includes(d));
      if (!degreeMatches) return false;
    }

    // 3. Courses filter
    if (selectedCourses.length > 0) {
      const courseMatches = uni.courses.some(c => selectedCourses.includes(c));
      if (!courseMatches) return false;
    }

    // 4. Cities filter
    if (selectedCities.length > 0) {
      if (!selectedCities.includes(uni.city)) return false;
    }

    // 5. Intakes filter
    if (selectedIntakes.length > 0) {
      const intakeMatches = uni.intakes.some(i => selectedIntakes.includes(i));
      if (!intakeMatches) return false;
    }

    // 6. Fees ranges filter
    if (selectedFees.length > 0) {
      const matchedFee = uni.tuition;
      if (matchedFee === null) return false;
      const matchesSomeRange = selectedFees.some(feeId => {
        const range = feeRanges.find(r => r.id === feeId);
        if (!range) return false;
        if (range.max !== undefined && matchedFee > range.max) return false;
        if (range.min !== undefined && matchedFee < range.min) return false;
        return true;
      });
      if (!matchesSomeRange) return false;
    }

    return true;
  });

  // Sort logic
  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    if (sortBy === 'rank') {
      return a.rankValue - b.rankValue;
    }
    if (sortBy === 'fees') {
      const feeA = a.tuition === null ? 999 : a.tuition;
      const feeB = b.tuition === null ? 999 : b.tuition;
      return feeA - feeB;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Pagination
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedUniversities.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUniversities = sortedUniversities.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1340px]">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/study-abroad/canada" className="hover:text-indigo-600 transition-colors">Study Abroad</Link>
          <span>/</span>
          <span className="text-slate-700">Masters in Canada</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-left max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Top Universities in Canada for{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">
              Masters
            </span>{' '}
            (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Compare tuition rates, global QS rankings, core eligibility requirements, and explore fully accredited institutions in Canada.
          </p>
        </div>

        <HookBand value={universityDatabase.length} label="Canadian universities and colleges on this page. Filter by course, city, fees and intake below." hi="तुलना करो" className="mb-10" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="sticky top-28 bg-white border border-[#E6E0D4] p-5 shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] z-30" style={{ borderRadius: 18 }}>
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE6DA] mb-5">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-[#16130F]">
                <Filter size={15} className="text-[#DE5C2B]" />
                Filters
              </span>
              <button 
                onClick={handleClearAll}
                className="text-[12.5px] font-semibold text-[#DE5C2B] hover:text-[#86351A] cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              
              {/* Fees */}
              <div>
                <button
                  onClick={() => toggleAccordion('fees')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3.5"
                >
                  <span>1st Year Fees</span>
                  <ChevronDown size={14} className={`transform transition-transform text-[#9A9184] ${openAccordions.fees ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.fees && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {feeRanges.map(range => (
                        <label key={range.id} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedFees.includes(range.id)}
                            onChange={() => handleFilterToggle(range.id, selectedFees, setSelectedFees)}
                            className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer"
                          />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-[#ECE6DA]" />

              {/* Degree */}
              <div>
                <button
                  onClick={() => toggleAccordion('degree')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3.5"
                >
                  <span>Degree</span>
                  <ChevronDown size={14} className={`transform transition-transform text-[#9A9184] ${openAccordions.degree ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.degree && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {degreeCategories.map(deg => (
                        <label key={deg} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedDegrees.includes(deg)}
                            onChange={() => handleFilterToggle(deg, selectedDegrees, setSelectedDegrees)}
                            className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer"
                          />
                          <span>{deg}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-[#ECE6DA]" />

              {/* Courses */}
              <div>
                <button
                  onClick={() => toggleAccordion('courses')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3.5"
                >
                  <span>Courses</span>
                  <ChevronDown size={14} className={`transform transition-transform text-[#9A9184] ${openAccordions.courses ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.courses && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2.5 pl-0.5 max-h-[220px] overflow-y-auto"
                    >
                      {courseCategories.map(course => (
                        <label key={course} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCourses.includes(course)}
                            onChange={() => handleFilterToggle(course, selectedCourses, setSelectedCourses)}
                            className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer"
                          />
                          <span>{course}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-[#ECE6DA]" />

              {/* Cities */}
              <div>
                <button
                  onClick={() => toggleAccordion('cities')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3.5"
                >
                  <span>Cities</span>
                  <ChevronDown size={14} className={`transform transition-transform text-[#9A9184] ${openAccordions.cities ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.cities && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2.5 pl-0.5 max-h-[220px] overflow-y-auto"
                    >
                      {cityCategories.map(city => (
                        <label key={city} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={() => handleFilterToggle(city, selectedCities, setSelectedCities)}
                            className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer"
                          />
                          <span>{city}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-[#ECE6DA]" />

              {/* Intake */}
              <div>
                <button
                  onClick={() => toggleAccordion('intake')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3.5"
                >
                  <span>Intake</span>
                  <ChevronDown size={14} className={`transform transition-transform text-[#9A9184] ${openAccordions.intake ? 'rotate-180 text-[#DE5C2B]' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.intake && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {intakeCategories.map(intake => (
                        <label key={intake} className="flex items-center gap-3 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedIntakes.includes(intake)}
                            onChange={() => handleFilterToggle(intake, selectedIntakes, setSelectedIntakes)}
                            className="w-4 h-4 rounded border-[#E6E0D4] accent-[#DE5C2B] cursor-pointer"
                          />
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
                    <option value="fees">Tuition Fee: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </FinderField>
                <p className="text-[13.5px] text-[#5B544A] whitespace-nowrap sm:col-span-2 xl:col-span-1 xl:h-11 xl:flex xl:items-center">
                  <span className="font-bold text-[#16130F]">{sortedUniversities.length}</span>&nbsp;universities
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

            {/* University cards */}
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
                          <img 
                            src={getUniversityLogo(uni.name, uni.logo)} 
                            alt={uni.name} 
                            className="w-10 h-10 object-contain" 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128` + uni.name.charAt(0); }} 
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-indigo-600 transition-colors">
                            {["University of Toronto", "McGill University", "University of Alberta", "Western University"].includes(uni.name) ? (
                              <Link 
                                to={`/study-abroad/canada/universities/${
                                  uni.name.includes("Toronto") ? "toronto" :
                                  uni.name.includes("McGill") ? "mcgill" :
                                  uni.name.includes("Alberta") ? "alberta" :
                                  "western"
                                }`} 
                                className="hover:underline text-indigo-650 hover:text-indigo-850"
                              >
                                {uni.name}
                              </Link>
                            ) : (
                              uni.name
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-405 font-bold flex items-center gap-1 mt-1">
                            <MapPin size={11} className="text-slate-400" />
                            {uni.location}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-slate-550/5 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1">
                            <Award size={12} className="text-indigo-650" />
                            {uni.rank.replace("Rank ", "").replace(" QS Rankings", "")}
                          </p>
                        </div>
                        <div className="bg-slate-550/5 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1st Year Fees</p>
                          <p className="text-xs font-black text-indigo-650 mt-0.5">
                            {uni.tuition ? `₹ ${uni.tuition} Lakh` : '-/-'}
                          </p>
                        </div>
                        <div className="bg-slate-550/5 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                          <p className="text-[10px] font-black text-emerald-650 mt-1 uppercase tracking-wider flex items-center gap-1">
                            <Building size={11} className="text-emerald-500" />
                            {uni.type}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2 mb-2">
                          {uni.description}
                        </p>

                        {/* Matched course highlight */}
                        {matchedCourses.length > 0 && (
                          <div className="mb-2.5 flex flex-wrap items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl">
                            <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wide">✓ Matched Course:</span>
                            {matchedCourses.slice(0, 3).map((mc, idx) => (
                              <span key={idx} className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                                {mc}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {uni.courses.slice(0, 3).map(c => (
                            <span key={c} className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-550/50 border border-slate-100/50 p-3 rounded-xl mb-4 text-[11px] font-bold text-slate-650 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Eligibility:</span>
                          <span className="text-slate-805 text-right font-semibold">{uni.eligibility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deadline:</span>
                          <span className="text-indigo-650 font-black">{uni.deadline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-slate-100 pt-4 mt-2">
                      <a 
                        href={uni.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-xs font-bold shadow-sm"
                      >
                        Visit School
                      </a>
                      <Link 
                        to={`/contact?university=${encodeURIComponent(uni.name)}`}
                        className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold"
                      >
                        Check Eligibility
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>

              {sortedUniversities.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">
                  No Canadian universities match your active filters.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-slate-100 pt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}
                >
                  Prev
                </button>

                {getPageNumbers().map(no => (
                  <button
                    key={no}
                    onClick={() => handlePageChange(no)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${currentPage === no ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}
                  >
                    {no}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer'}`}
                >
                  Next
                </button>
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
      <StudyAbroadCTA country="Canada" />

      </div>
    </div>
  );
};

export default CanadaMastersCoursePage;
