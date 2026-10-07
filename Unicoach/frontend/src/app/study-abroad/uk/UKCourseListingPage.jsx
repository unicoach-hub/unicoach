import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, Award, MapPin, 
  Building, Globe, Check, Info, Calendar, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import { getUniversityLogo } from '../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';

// Import local UK logo assets
import ImperialLogo from '@/assets/uk/Imperial College London.png';
import CambridgeLogo from '@/assets/uk/University of Cambridge.jpg';
import OxfordLogo from '@/assets/uk/University of Oxford.png';
import UCLLogo from '@/assets/uk/University College London.jpg';
import EdinburghLogo from '@/assets/uk/University of Edinburgh.jpg';
import ManchesterLogo from '@/assets/uk/University of Manchester.jpg';
import KCLLogo from "@/assets/uk/King's College London.png";
import UOLLogo from '@/assets/uk/University of London.jpg';
import BristolLogo from '@/assets/uk/University of Bristol.jpg';
import WarwickLogo from '@/assets/uk/University of Warwick.png';
import LeedsLogo from '@/assets/uk/University of Leeds.png';
import GlasgowLogo from '@/assets/uk/University of Glasgow.jpeg';
import DurhamLogo from '@/assets/uk/Durham University.png';
import SouthamptonLogo from '@/assets/uk/University of Southampton.jpg';
import BirminghamLogo from '@/assets/uk/University of Birmingham.jpg';
import StAndrewsLogo from '@/assets/uk/University of St Andrews.png';
import NottinghamLogo from '@/assets/uk/University of Nottingham.png';
import SheffieldLogo from '@/assets/uk/University of Sheffield.png';
import NewcastleLogo from '@/assets/uk/Newcastle University.jpg';

// ─────────────────────────────────────────────
// Combined UK University Database (52 Institutions)
// ─────────────────────────────────────────────
const universityDatabase = [
  {
    id: 1,
    name: "Royal College of Art",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 1 QS Rankings",
    rankValue: 1,
    tuition: 32,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/rca.ac.uk",
    website: "https://www.rca.ac.uk",
    courses: ["Arts / Fine Art", "Product Design", "Graphic and Design Studies"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "SEP"],
    description: "World's most influential postgraduate art and design institution offering degrees in fine art, design, and architecture.",
    eligibility: "GPA 3.0+, IELTS 6.5+, Portfolio required",
    deadline: "Jan 12, 2026"
  },
  {
    id: 2,
    name: "University of the Arts London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 2 QS Rankings",
    rankValue: 2,
    tuition: 34,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/arts.ac.uk",
    website: "https://www.arts.ac.uk",
    courses: ["Arts / Fine Art", "Fashion Design", "Graphic and Design Studies"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["AUG", "SEP"],
    description: "Europe's largest specialist art and design university, offering courses in art, design, fashion, and communication.",
    eligibility: "GPA 3.0+, IELTS 6.5+, Portfolio required",
    deadline: "Jan 25, 2026"
  },
  {
    id: 3,
    name: "Imperial College London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 2 QS Rankings",
    rankValue: 2,
    tuition: 49,
    type: "PUBLIC",
    logo: ImperialLogo,
    website: "https://www.imperial.ac.uk",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Biomedical Engineering", "Mechanical Engineering"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["AUG", "SEP"],
    description: "World-class university focusing on science, engineering, medicine, and business, with top-ranked computational research.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE recommended",
    deadline: "Jan 08, 2026"
  },
  {
    id: 4,
    name: "London Business School",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 4 QS Rankings",
    rankValue: 4,
    tuition: 143,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/london.edu",
    website: "https://www.london.edu",
    courses: ["Business Administration", "Banking and Finance", "Management", "Business Management"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "JAN"],
    description: "World-leading business school offering top-ranked MBA, Finance, and Management executive courses.",
    eligibility: "GPA 3.5+, IELTS 7.5+, GMAT 700+ required, 3+ years work exp",
    deadline: "Feb 05, 2026"
  },
  {
    id: 5,
    name: "University College London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 9 QS Rankings",
    rankValue: 9,
    tuition: 48,
    type: "PUBLIC",
    logo: UCLLogo,
    website: "https://www.ucl.ac.uk",
    courses: ["Computer Science", "Data Science", "Medicine and Medical Studies", "Architecture"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["AUG", "SEP"],
    description: "A highly prestigious, multidisciplinary research hub in central London with pioneering AI and computational programs.",
    eligibility: "GPA 3.7+, IELTS 7.5+, TOEFL 100+",
    deadline: "Jan 15, 2026"
  },
  {
    id: 6,
    name: "King's College London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 40 QS Rankings",
    rankValue: 40,
    tuition: 43,
    type: "PUBLIC",
    logo: KCLLogo,
    website: "https://www.kcl.ac.uk",
    courses: ["Computer Science", "Physiotherapy", "Law", "Nursing and midwifery", "Psychology"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Distinguished research university focusing on science, medicine, humanities, and international affairs.",
    eligibility: "GPA 3.6+, IELTS 7.0+, TOEFL 95+",
    deadline: "Jan 25, 2026"
  },
  {
    id: 7,
    name: "University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 44 QS Rankings",
    rankValue: 44,
    tuition: 18,
    type: "PUBLIC",
    logo: UOLLogo,
    website: "https://www.london.ac.uk",
    courses: ["Business Administration", "Economics", "Computer Science"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["AUG", "SEP", "JAN"],
    description: "Pioneering federal university system offering highly cost-effective and globally accessible degrees.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 85+",
    deadline: "May 01, 2026"
  },
  {
    id: 8,
    name: "The London School of Economics and Political Science",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 45 QS Rankings",
    rankValue: 45,
    tuition: 33,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/lse.ac.uk",
    website: "https://www.lse.ac.uk",
    courses: ["Economics", "Political Science", "Banking and Finance", "Sociology"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "World-famous specialist university for social sciences, economics, finance, and global politics.",
    eligibility: "GPA 3.7+, IELTS 7.5+, GRE/GMAT recommended",
    deadline: "Dec 15, 2025"
  },
  {
    id: 9,
    name: "Queen Mary University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 145 QS Rankings",
    rankValue: 145,
    tuition: 30,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/qmul.ac.uk",
    website: "https://www.qmul.ac.uk",
    courses: ["Computer Science", "Law", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "A prominent Russell Group research university in east London with excellent engineering and medicine programs.",
    eligibility: "GPA 3.2+, IELTS 6.5+, TOEFL 90+",
    deadline: "Feb 15, 2026"
  },
  {
    id: 10,
    name: "London School of Hygiene and Tropical Medicine, University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 279 QS Rankings",
    rankValue: 279,
    tuition: 26,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/lshtm.ac.uk",
    website: "https://www.lshtm.ac.uk",
    courses: ["Public Health", "Medicine and Medical Studies"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "A leading postgraduate institute dedicated to public health, global medicine, and tropical epidemiology.",
    eligibility: "GPA 3.3+, IELTS 7.0+, TOEFL 95+",
    deadline: "Mar 01, 2026"
  },
  {
    id: 11,
    name: "Brunel University London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 343 QS Rankings",
    rankValue: 343,
    tuition: 24,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/brunel.ac.uk",
    website: "https://www.brunel.ac.uk",
    courses: ["Engineering Design", "Computer Science", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Highly practical, industry-oriented university in west London known for engineering and health sciences.",
    eligibility: "GPA 2.8+, IELTS 6.5+, TOEFL 80+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 12,
    name: "SOAS, University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 379 QS Rankings",
    rankValue: 379,
    tuition: 27,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/soas.ac.uk",
    website: "https://www.soas.ac.uk",
    courses: ["International Relations", "Anthropology", "History"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Specialist higher education institution focusing on study of Asia, Africa, and the Middle East.",
    eligibility: "GPA 3.0+, IELTS 7.0+, TOEFL 95+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 13,
    name: "Goldsmiths, University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 461 QS Rankings",
    rankValue: 461,
    tuition: 23,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/gold.ac.uk",
    website: "https://www.gold.ac.uk",
    courses: ["Media & Communication", "Music", "Creative Writing"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Highly renowned for creative arts, humanities, media and communication programs with global impact.",
    eligibility: "GPA 3.0+, IELTS 6.5+, Portfolio/Writing samples required",
    deadline: "May 15, 2026"
  },
  {
    id: 14,
    name: "Kingston University",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 601 QS Rankings",
    rankValue: 601,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/kingston.ac.uk",
    website: "https://www.kingston.ac.uk",
    courses: ["Fashion Design", "Business Administration", "Civil Engineering", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Diverse and vibrant university in southwest London focusing on creative, professional, and technical studies.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 15,
    name: "University of Westminster",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 651 QS Rankings",
    rankValue: 651,
    tuition: 18,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/westminster.ac.uk",
    website: "https://www.westminster.ac.uk",
    courses: ["Journalism", "Architecture", "Computer Science"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Metropolitan university offering strong media, architecture, business and computer science courses.",
    eligibility: "GPA 2.8+, IELTS 6.5+, TOEFL 85+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 16,
    name: "Middlesex University",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 20,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mdx.ac.uk",
    website: "https://www.mdx.ac.uk",
    courses: ["Nursing and midwifery", "Information technology", "Dance"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Diverse educational institution in north London offering career-focused, practical learning formats.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 75+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 17,
    name: "London South Bank University",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 1201 QS Rankings",
    rankValue: 1201,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/lsbu.ac.uk",
    website: "https://www.lsbu.ac.uk",
    courses: ["Construction Management", "General Engineering And Technology", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Offers courses focused on employability, professional accreditations, and strong industry links.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 78+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 18,
    name: "City St George's, University of London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 350 QS Rankings",
    rankValue: 350,
    tuition: 53,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/city.ac.uk",
    website: "https://www.city.ac.uk",
    courses: ["Banking and Finance", "Journalism", "Computer Science"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Leading institution for business, journalism, engineering, and medical sciences.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 19,
    name: "Royal College of Music",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 3 QS Performing Arts",
    rankValue: 300,
    tuition: 34,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/rcm.ac.uk",
    website: "https://www.rcm.ac.uk",
    courses: ["Music"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "One of the world's greatest conservatoires, offering training from undergraduate to doctoral levels.",
    eligibility: "Audition required, IELTS 5.5+",
    deadline: "Oct 15, 2025"
  },
  {
    id: 20,
    name: "University of Greenwich",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 800 QS Rankings",
    rankValue: 800,
    tuition: 17,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/gre.ac.uk",
    website: "https://www.gre.ac.uk",
    courses: ["Computer Science", "Information technology", "Tourism"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN", "MAY"],
    description: "Vibrant university located on historical heritage campuses, offering modern, practical courses.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 79+",
    deadline: "Aug 01, 2026"
  },
  {
    id: 21,
    name: "University of Oxford",
    city: "Oxford",
    state: "Oxfordshire",
    location: "Oxford, Oxfordshire, UK",
    rank: "Rank 3 QS Rankings",
    rankValue: 3,
    tuition: 35,
    type: "PUBLIC",
    logo: OxfordLogo,
    website: "https://www.ox.ac.uk",
    courses: ["Computer Science", "Law", "Medicine and Medical Studies", "Economics", "Banking and Finance", "Biochemistry", "Business Administration", "Data Science", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP", "MAY", "JUN", "OCT", "NOV"],
    description: "The oldest university in the English-speaking world, offering world-leading computational, mathematical, and law studies.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 110+, GRE recommended",
    deadline: "Jan 09, 2026"
  },
  {
    id: 22,
    name: "University of Cambridge",
    city: "Cambridge",
    state: "Cambridgeshire",
    location: "Cambridge, Cambridgeshire, UK",
    rank: "Rank 2 QS Rankings",
    rankValue: 2,
    tuition: 29,
    type: "PUBLIC",
    logo: CambridgeLogo,
    website: "https://www.cam.ac.uk",
    courses: ["Computer Science", "Mathematics", "Engineering Science"],
    degrees: ["Postgraduate", "Ph.D.", "Undergraduate"],
    intakes: ["SEP"],
    description: "A world-renowned institution with outstanding research histories in algorithms, computing networks, and natural sciences.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE/GMAT waiver available",
    deadline: "Jan 07, 2026"
  },
  {
    id: 23,
    name: "Coventry University",
    city: "Coventry",
    state: "West Midlands",
    location: "Coventry, West Midlands, UK",
    rank: "Rank 571 QS Rankings",
    rankValue: 571,
    tuition: 18,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/coventry.ac.uk",
    website: "https://www.coventry.ac.uk",
    courses: ["Business Management", "Computer Science", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN", "MAY"],
    description: "Modern, dynamic university focused on excellent career growth support and outstanding student satisfaction metrics.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 79+",
    deadline: "Jul 01, 2026"
  },
  {
    id: 24,
    name: "University of Leeds",
    city: "Leeds",
    state: "West Yorkshire",
    location: "Leeds, West Yorkshire, UK",
    rank: "Rank 75 QS Rankings",
    rankValue: 75,
    tuition: 29,
    type: "PUBLIC",
    logo: LeedsLogo,
    website: "https://www.leeds.ac.uk",
    courses: ["Computer Science", "Chemical Engineering", "Biotechnology", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "A prestigious Russell Group university offering comprehensive postgraduate degrees in engineering, computing, and clinical sciences.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 92+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 25,
    name: "University of East London",
    city: "London",
    state: "London",
    location: "London, England, UK",
    rank: "Rank 900 QS Rankings",
    rankValue: 900,
    tuition: 15,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uel.ac.uk",
    website: "https://www.uel.ac.uk",
    courses: ["Computer Science", "Business Administration", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN", "MAY"],
    description: "Highly diverse, career-first public university providing affordable computational science, management, and physiotherapy courses.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 79+",
    deadline: "Aug 01, 2026"
  },
  {
    id: 26,
    name: "University of Glasgow",
    city: "Glasgow",
    state: "Lanarkshire",
    location: "Glasgow, Scotland, UK",
    rank: "Rank 76 QS Rankings",
    rankValue: 76,
    tuition: 32,
    type: "PUBLIC",
    logo: GlasgowLogo,
    website: "https://www.gla.ac.uk",
    courses: ["Computer Science", "Medicine and Medical Studies", "Law", "Physiotherapy"],
    degrees: ["Postgraduate", "Undergraduate", "Ph.D."],
    intakes: ["SEP", "JAN"],
    description: "Historic Scottish university combining ancient academic history with cutting-edge laboratories in medical and computing sciences.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 92+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 27,
    name: "University of Birmingham",
    city: "Birmingham",
    state: "West Midlands",
    location: "Birmingham, West Midlands, UK",
    rank: "Rank 84 QS Rankings",
    rankValue: 84,
    tuition: 9,
    type: "PUBLIC",
    logo: BirminghamLogo,
    website: "https://www.bham.ac.uk",
    courses: ["Computer Science", "Physiotherapy", "Mechanical Engineering"],
    degrees: ["Postgraduate", "Undergraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Russell Group civic university offering premier academic specializations in advanced robotics, computing, and clinical therapies.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jul 01, 2026"
  },
  {
    id: 28,
    name: "University of Edinburgh",
    city: "Edinburgh",
    state: "Midlothian",
    location: "Edinburgh, Scotland, UK",
    rank: "Rank 22 QS Rankings",
    rankValue: 22,
    tuition: 42,
    type: "PUBLIC",
    logo: EdinburghLogo,
    website: "https://www.ed.ac.uk",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Data Science", "Philosophy and Religious Studies"],
    degrees: ["Postgraduate", "Undergraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "One of the world's top research centers, pioneering computational logic, cognitive science, and machine learning models.",
    eligibility: "GPA 3.3+, IELTS 7.0+, TOEFL 100+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 29,
    name: "University of Manchester",
    city: "Manchester",
    state: "Greater Manchester",
    location: "Manchester, England, UK",
    rank: "Rank 32 QS Rankings",
    rankValue: 32,
    tuition: 24,
    type: "PUBLIC",
    logo: ManchesterLogo,
    website: "https://www.manchester.ac.uk",
    courses: ["Computer Science", "Business Administration", "Management", "Data Science"],
    degrees: ["Postgraduate", "Undergraduate", "Ph.D."],
    intakes: ["SEP", "JAN"],
    description: "Renowned for science and engineering excellence, offering stellar careers across computational fields.",
    eligibility: "GPA 3.2+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 30,
    name: "University of Bristol",
    city: "Bristol",
    state: "Bristol",
    location: "Bristol, England, UK",
    rank: "Rank 55 QS Rankings",
    rankValue: 55,
    tuition: 33,
    type: "PUBLIC",
    logo: BristolLogo,
    website: "https://www.bristol.ac.uk",
    courses: ["Computer Science", "Data Science", "Software Engineering"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Top-tier Russell Group research university offering highly competitive computational and network systems programs.",
    eligibility: "GPA 3.3+, IELTS 6.5+, TOEFL 95+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 31,
    name: "University of Warwick",
    city: "Coventry",
    state: "West Midlands",
    location: "Coventry, England, UK",
    rank: "Rank 67 QS Rankings",
    rankValue: 67,
    tuition: 31,
    type: "PUBLIC",
    logo: WarwickLogo,
    website: "https://warwick.ac.uk",
    courses: ["Computer Science", "Business Administration", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Renowned for mathematically intense computational theory and top business analytics routes.",
    eligibility: "GPA 3.4+, IELTS 7.0+, TOEFL 98+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 32,
    name: "Durham University",
    city: "Durham",
    state: "County Durham",
    location: "Durham, England, UK",
    rank: "Rank 78 QS Rankings",
    rankValue: 78,
    tuition: 28,
    type: "PUBLIC",
    logo: DurhamLogo,
    website: "https://www.durham.ac.uk",
    courses: ["Computer Science", "Mathematics", "Software Engineering"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Prestigious collegiate institution delivering outstanding computing laboratories and academic rigor.",
    eligibility: "GPA 3.2+, IELTS 6.5+, TOEFL 92+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 33,
    name: "University of Southampton",
    city: "Southampton",
    state: "Hampshire",
    location: "Southampton, England, UK",
    rank: "Rank 81 QS Rankings",
    rankValue: 81,
    tuition: 26,
    type: "PUBLIC",
    logo: SouthamptonLogo,
    website: "https://www.southampton.ac.uk",
    courses: ["Computer Science", "Engineering Science", "Electronics"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Global pioneer in Web Science, cybersecurity, and advanced engineering technologies.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 34,
    name: "University of St Andrews",
    city: "St Andrews",
    state: "Fife",
    location: "St Andrews, Scotland, UK",
    rank: "Rank 95 QS Rankings",
    rankValue: 95,
    tuition: 34,
    type: "PUBLIC",
    logo: StAndrewsLogo,
    website: "https://www.st-andrews.ac.uk",
    courses: ["Computer Science", "Data Science", "Software Engineering"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Scotland's oldest university, legendary for logic, computer architecture, and outstanding student ratios.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 100+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 35,
    name: "University of Nottingham",
    city: "Nottingham",
    state: "Nottinghamshire",
    location: "Nottingham, England, UK",
    rank: "Rank 100 QS Rankings",
    rankValue: 100,
    tuition: 27,
    type: "PUBLIC",
    logo: NottinghamLogo,
    website: "https://www.nottingham.ac.uk",
    courses: ["Computer Science", "Data Science", "Information Systems"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Highly research-focused with global campuses, offering excellent digital computing systems curricula.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 36,
    name: "University of Sheffield",
    city: "Sheffield",
    state: "South Yorkshire",
    location: "Sheffield, England, UK",
    rank: "Rank 104 QS Rankings",
    rankValue: 104,
    tuition: 19,
    type: "PUBLIC",
    logo: SheffieldLogo,
    website: "https://www.sheffield.ac.uk",
    courses: ["Computer Science", "Data Science", "Software Engineering"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Vibrant engineering school featuring large-scale computing systems and speech/cognitive research.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 88+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 37,
    name: "Newcastle University",
    city: "Newcastle upon Tyne",
    state: "Tyne and Wear",
    location: "Newcastle upon Tyne, England, UK",
    rank: "Rank 110 QS Rankings",
    rankValue: 110,
    tuition: 3,
    type: "PUBLIC",
    logo: NewcastleLogo,
    website: "https://www.ncl.ac.uk",
    courses: ["Computer Science", "Data Science", "Information technology"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Academically renowned Russell Group university with highly affordable digital computing tuition.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 38,
    name: "University of Liverpool",
    city: "Liverpool",
    state: "Merseyside",
    location: "Liverpool, England, UK",
    rank: "Rank 176 QS Rankings",
    rankValue: 176,
    tuition: 21,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/liverpool.ac.uk",
    website: "https://www.liverpool.ac.uk",
    courses: ["Physiotherapy", "Medicine and Medical Studies", "Public Health"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Highly ranked public research university offering state-of-the-art physiotherapy laboratories.",
    eligibility: "GPA 2.8+, IELTS 6.5+, TOEFL 88+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 39,
    name: "University of Dundee",
    city: "Dundee",
    state: "Angus",
    location: "Dundee, Scotland, UK",
    rank: "Rank 441 QS Rankings",
    rankValue: 441,
    tuition: 28,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/dundee.ac.uk",
    website: "https://www.dundee.ac.uk",
    courses: ["Physiotherapy", "Medicine and Medical Studies", "Public Health"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Outstanding Scottish institution famous for clinical education, medical research, and physiotherapy.",
    eligibility: "GPA 2.8+, IELTS 6.5+, TOEFL 90+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 40,
    name: "Ulster University",
    city: "Belfast",
    state: "Antrim",
    location: "Belfast, Northern Ireland, UK",
    rank: "Rank 601 QS Rankings",
    rankValue: 601,
    tuition: 20,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ulster.ac.uk",
    website: "https://www.ulster.ac.uk",
    courses: ["Physiotherapy", "Public Health", "Sports Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Renowned clinic-led health sciences and physiotherapy training paths in Northern Ireland.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 41,
    name: "Keele University",
    city: "Keele",
    state: "Staffordshire",
    location: "Keele, England, UK",
    rank: "Rank 701 QS Rankings",
    rankValue: 701,
    tuition: 20,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/keele.ac.uk",
    website: "https://www.keele.ac.uk",
    courses: ["Physiotherapy", "Medicine and Medical Studies", "Public Health"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP"],
    description: "Large, beautiful campus university specializing in health sciences and clinical physical therapy.",
    eligibility: "GPA 2.7+, IELTS 6.5+, TOEFL 85+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 42,
    name: "Nottingham Trent University",
    city: "Nottingham",
    state: "Nottinghamshire",
    location: "Nottingham, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 21,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/ntu.ac.uk",
    website: "https://www.ntu.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Outstanding employment rates with highly practical, accredited sports therapies and clinical courses.",
    eligibility: "GPA 2.5+, IELTS 6.5+, TOEFL 83+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 43,
    name: "Manchester Metropolitan University",
    city: "Manchester",
    state: "Greater Manchester",
    location: "Manchester, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 24,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/mmu.ac.uk",
    website: "https://www.mmu.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Modern university in central Manchester providing fully chartered clinical physiotherapy degrees.",
    eligibility: "GPA 2.5+, IELTS 6.5+, TOEFL 85+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 44,
    name: "Bournemouth University",
    city: "Bournemouth",
    state: "Dorset",
    location: "Bournemouth, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 20,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/bournemouth.ac.uk",
    website: "https://www.bournemouth.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Tourism"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Leading coastal educational facility specializing in occupational health and physical therapies.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Aug 01, 2026"
  },
  {
    id: 45,
    name: "Oxford Brookes University",
    city: "Oxford",
    state: "Oxfordshire",
    location: "Oxford, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/brookes.ac.uk",
    website: "https://www.brookes.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Dynamic modern university in Oxford providing highly competitive, chartered physical therapy routes.",
    eligibility: "GPA 2.6+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 46,
    name: "University of Lincoln",
    city: "Lincoln",
    state: "Lincolnshire",
    location: "Lincoln, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: 23,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/lincoln.ac.uk",
    website: "https://www.lincoln.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Historic city campus offering extensive laboratory settings and patient-led physiotherapy practices.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 79+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 47,
    name: "University of Huddersfield",
    city: "Huddersfield",
    state: "West Yorkshire",
    location: "Huddersfield, England, UK",
    rank: "Rank 801 QS Rankings",
    rankValue: 801,
    tuition: null,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/hud.ac.uk",
    website: "https://www.hud.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Vibrant Yorkshire campus renowned for high student satisfaction and physical therapy studies.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jul 31, 2026"
  },
  {
    id: 48,
    name: "Anglia Ruskin University",
    city: "Cambridge",
    state: "Cambridgeshire",
    location: "Cambridge, England, UK",
    rank: "Rank 1001 QS Rankings",
    rankValue: 1001,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/aru.ac.uk",
    website: "https://www.aru.ac.uk",
    courses: ["Physiotherapy", "Medicine and Medical Studies", "Public Health"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Modern university with strong professional clinical health partnerships across East Anglia.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jul 15, 2026"
  },
  {
    id: 49,
    name: "Leeds Beckett University",
    city: "Leeds",
    state: "West Yorkshire",
    location: "Leeds, England, UK",
    rank: "Rank --",
    rankValue: 2000,
    tuition: 13,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/leedsbeckett.ac.uk",
    website: "https://www.leedsbeckett.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Vibrant university in Leeds known for sports science, athletic training, and clinical physiotherapy.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 79+",
    deadline: "Jun 30, 2026"
  },
  {
    id: 50,
    name: "University of the West of England",
    city: "Bristol",
    state: "Bristol",
    location: "Bristol, England, UK",
    rank: "Rank --",
    rankValue: 2000,
    tuition: 18,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/uwe.ac.uk",
    website: "https://www.uwe.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Modern campus-based Bristol university with top-tier physiotherapy clinics and nursing routes.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jun 15, 2026"
  },
  {
    id: 51,
    name: "University of Wolverhampton",
    city: "Wolverhampton",
    state: "West Midlands",
    location: "Wolverhampton, West Midlands, UK",
    rank: "Rank --",
    rankValue: 2000,
    tuition: 19,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/wlv.ac.uk",
    website: "https://www.wlv.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Career-first educational institution in West Midlands with great clinical physical therapy setups.",
    eligibility: "GPA 2.4+, IELTS 6.0+, TOEFL 78+",
    deadline: "Aug 01, 2026"
  },
  {
    id: 52,
    name: "Birmingham City University",
    city: "Birmingham",
    state: "West Midlands",
    location: "Birmingham, England, UK",
    rank: "Rank --",
    rankValue: 2000,
    tuition: 21,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/bcu.ac.uk",
    website: "https://www.bcu.ac.uk",
    courses: ["Physiotherapy", "Sports Management", "Management"],
    degrees: ["Postgraduate", "Undergraduate"],
    intakes: ["SEP", "JAN"],
    description: "Leading metropolitan university in Birmingham with outstanding clinical simulation labs for physiotherapy.",
    eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+",
    deadline: "Jul 01, 2026"
  }
];

// ─────────────────────────────────────────────
// Sidebar Filter Categories Definition
// ─────────────────────────────────────────────
const degreeCategories = [
  "Postgraduate", "Ph.D.", "PG Diploma /Certificate", "Undergraduate", "UG Diploma /Certificate /Associate Degree"
];

const courseCategories = [
  "Computer Science", "Physiotherapy", "Industrial Engineering", "Broadcast Media", "Engineering Design", 
  "Industrial Design", "Astronomy", "Speech Pathology", "Interior Design", "Theatre", 
  "Social Work", "Dental Studies", "Animal and Veterinary Studies", "Justice studies", "Materials and Mineral Engineering", 
  "Manufacturing Engineering", "General Engineering And Technology", "Electronics", "Systems Engineering", "Cyber Security", 
  "Automotive engineering", "Robotics", "Physical Sciences", "Biochemistry", "Information Systems", 
  "Philosophy and Religious Studies", "History", "Media & Communication", "Commerce", "Public Health", 
  "Game Development", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Biomedical Engineering", 
  "Aerospace Engineering", "Marine Engineering", "Mining Engineering", "Engineering Science", "Petroleum Engineering", 
  "Legal Studies", "Law", "Music", "Archaeology", "Dance", 
  "Banking and Finance", "Teaching / Education studies", "Risk Management", "Language and Literature", "Social and Cultural Courses", 
  "Film and TV production", "Journalism", "Creative Writing", "Advertising", "Audio Visual Studies", 
  "Sociology", "Political Science", "Nursing and midwifery", "Radiography", "Chemical Engineering", 
  "Mathematics", "Statistics", "Linguistic", "English language", "Photography", 
  "Animation", "International Relations", "Behavioural Science", "Geography", "Psychology", 
  "Sport / Exercise Science", "Business Analytics", "Physics", "Data Science", "Food / Agricultural Science", 
  "Animal Husbandry", "Fisheries studies", "Accounting", "Earth Sciences / Geoscience", "Geology", 
  "Environmental science / management", "Marine science", "Human Geography", "Arts / Fine Art", "Graphic and Design Studies", 
  "Creative Arts", "Fashion Design", "Crafts and textiles", "Product Design", "Biological Sciences", 
  "Genetics", "Zoology", "Forensics", "Biotechnology", "Botany", 
  "Architecture", "Construction Management", "Landscape design and architecture", "Planning", "Surveying", 
  "International / Global Business", "Sales And Marketing", "Human resource Management", "Business Administration", "Sports Management", 
  "Project Management", "Innovation / Entrepreneurship", "Farm and Agribusiness", "Chemistry", "Food And Hospitality", 
  "Data Analytics", "Pharmacology / Pharmacy", "Business Management", "Leadership Development", "Logistics / Supply Chain", 
  "Tourism", "Anthropology", "Medicine and Medical Studies", "Economics", "Artificial Intelligence / Machine Learning", 
  "Health Sciences / Administration", "Information technology", "Computer Graphics", "Computer Engineering", "Environmental Engineering", 
  "Software Engineering", "Management"
];

const cityCategories = [
  "London", "Glasgow", "Leeds", "Birmingham", "Edinburgh", "Oxford", "Cambridge", "Coventry",
  "Aberdeen", "Aberystwyth", "Bangor", "Bath", "Belfast", "Bournemouth", "Bradford", 
  "Brighton", "Bristol", "Buckingham", "Canterbury", "Cardiff", "Chester", "Chichester", 
  "Cirencester", "Colchester", "Cranfield", "Derby", "Dundee", "Durham", "Egham", 
  "Exeter", "Falmouth", "Farnham", "Gloucester", "Guildford", "Hatfield", "High Wycombe", 
  "Huddersfield", "Hull", "Inverness", "Ipswich", "Keele", "Lampeter", "Lancaster", 
  "Leicester", "Lincoln", "Liverpool", "Loughborough", "Luton", "Manchester", "Middlesbrough", 
  "Newcastle upon Tyne", "Northampton", "Norwich", "Nottingham", "Ormskirk", "Paisley", 
  "Plymouth", "Portsmouth", "Preston", "Reading", "Salford", "Sheffield", "Sidcup", 
  "Southampton", "St Andrews", "Stirling", "Stoke-on-Trent", "Sunderland", "Swansea", 
  "Twickenham", "Winchester", "Wolverhampton", "Worcester", "Wrexham", "York"
];

const intakeCategories = [
  "JAN", "MAY", "AUG", "SEP", "OCT"
];

const feeRanges = [
  { id: "max10", label: "Max ₹10 Lacs", max: 10 },
  { id: "max20", label: "Max ₹20 Lacs", max: 20 },
  { id: "max30", label: "Max ₹30 Lacs", max: 30 },
  { id: "max40", label: "Max ₹40 Lacs", max: 40 },
  { id: "above40", label: "₹40 Lacs +", min: 40 }
];

const UKCourseListingPage = ({ courseOverride = null }) => {
  const { courseSlug } = useParams();
  
  // Set dynamic course based on URL slug
  const getCourseFromSlug = (slug) => {
    if (slug === 'masters-cs' || slug === 'computer-science') return "Computer Science";
    if (slug === 'masters-physiotherapy' || slug === 'physiotherapy') return "Physiotherapy";
    return "Computer Science"; // Default
  };

  const initialCourse = courseOverride || getCourseFromSlug(courseSlug);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState(["Postgraduate"]);
  const [selectedCourses, setSelectedCourses] = useState([initialCourse]);
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

  // Sync state if slug changes
  useEffect(() => {
    const activeCourse = courseOverride || getCourseFromSlug(courseSlug);
    setSelectedCourses([activeCourse]);
    setSelectedDegrees(["Postgraduate"]);
    setSelectedCities([]);
    setSelectedIntakes([]);
    setSelectedFees([]);
    setSearchTerm('');
    setCurrentPage(1);
  }, [courseSlug, courseOverride]);

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

  const courseDisplayName = initialCourse;

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
          <Link to="/study-abroad/uk" className="hover:text-indigo-600 transition-colors">Study Abroad</Link>
          <span>/</span>
          <span className="text-slate-700">Masters in {courseDisplayName}</span>
        </div>

        {/* Title */}
        <div className="mb-10 text-left max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Top Universities in UK for Masters in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">
              {courseDisplayName}
            </span>{' '}
            (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Compare tuition rates, global QS rankings, core eligibility requirements, and explore fully accredited institutions in the United Kingdom.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="sticky top-28 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[28px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] z-30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider">
                <Filter size={15} className="text-indigo-650" />
                Filters
              </span>
              <button 
                onClick={handleClearAll}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-850 cursor-pointer transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              
              {/* Fees */}
              <div>
                <button
                  onClick={() => toggleAccordion('fees')}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5"
                >
                  <span>1st Year Fees</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.fees ? 'rotate-180 text-indigo-650' : ''}`} />
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
                        <label key={range.id} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedFees.includes(range.id)}
                            onChange={() => handleFilterToggle(range.id, selectedFees, setSelectedFees)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
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
                <button
                  onClick={() => toggleAccordion('degree')}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5"
                >
                  <span>Degree</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.degree ? 'rotate-180 text-indigo-650' : ''}`} />
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
                        <label key={deg} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedDegrees.includes(deg)}
                            onChange={() => handleFilterToggle(deg, selectedDegrees, setSelectedDegrees)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
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
                <button
                  onClick={() => toggleAccordion('courses')}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5"
                >
                  <span>Courses</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.courses ? 'rotate-180 text-indigo-650' : ''}`} />
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
                        <label key={course} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCourses.includes(course)}
                            onChange={() => handleFilterToggle(course, selectedCourses, setSelectedCourses)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
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
                <button
                  onClick={() => toggleAccordion('cities')}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5"
                >
                  <span>Cities</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.cities ? 'rotate-180 text-indigo-650' : ''}`} />
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
                        <label key={city} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={() => handleFilterToggle(city, selectedCities, setSelectedCities)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                          />
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
                <button
                  onClick={() => toggleAccordion('intake')}
                  className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3.5"
                >
                  <span>Intake</span>
                  <ChevronDown size={14} className={`transform transition-transform text-slate-400 ${openAccordions.intake ? 'rotate-180 text-indigo-650' : ''}`} />
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
                        <label key={intake} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedIntakes.includes(intake)}
                            onChange={() => handleFilterToggle(intake, selectedIntakes, setSelectedIntakes)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
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
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/50 border border-white/60 p-5 rounded-[24px] backdrop-blur-md shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by course (e.g. CS, MBA, LLM), university, city..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-550">
                  <span className="text-slate-800 font-black">{sortedUniversities.length}</span> Universities Found
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-700 focus:border-indigo-400 transition-colors"
                  >
                    <option value="rank">QS Rankings</option>
                    <option value="fees">Tuition Fee: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-indigo-50/30 border border-indigo-100/50 p-3.5 rounded-2xl">
                <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mr-1.5">Active:</span>
                {activeChips.map((chip, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-650 shadow-sm"
                  >
                    <span>{chip.label}</span>
                    <button 
                      onClick={() => handleRemoveChip(chip)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <X size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={handleClearAll}
                  className="text-[11px] font-black text-indigo-650 hover:underline ml-2 cursor-pointer"
                >
                  Clear All
                </button>
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
                            {["University of Oxford", "University of Cambridge", "Coventry University", "University of Leeds", "University of East London"].includes(uni.name) ? (
                              <Link 
                                to={`/study-abroad/uk/universities/${
                                  uni.name.includes("Oxford") ? "oxford" :
                                  uni.name.includes("Cambridge") ? "cambridge" :
                                  uni.name.includes("Coventry") ? "coventry" :
                                  uni.name.includes("Leeds") ? "leeds-university" :
                                  "east-london"
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
                            {uni.rank.replace("Rank ", "").replace(" QS Rankings", "").replace(" QS Performing Arts", "")}
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
                          {uni.courses.length > 3 && (
                            <span className="text-[9.5px] font-bold text-slate-400 px-1 py-0.5">+{uni.courses.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-100/50 p-3 rounded-xl mb-4 text-[11px] font-bold text-slate-650 flex flex-col gap-1">
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
                  No UK universities match your active filters.
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

          </main>

        </div>
      </div>
    </div>
  );
};

export default UKCourseListingPage;
