import logoStanford from '../../../assets/usa/Stanford/Stanford University.svg';
import logoChicago from '../../../assets/usa/Chicago/Chicago.png';
import logoUpenn from '../../../assets/usa/Philadelphia/University of Pennsylvania.png';
import logoGeorgiaTech from '../../../assets/usa/Atlanta/Georgia Institute of Technology.png';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';

const logoBentley = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoMit = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoHarvard = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoCaltech = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoBerkeley = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoWashingtonAndLee = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoCornell = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoYale = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoWesleyan = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoPrinceton = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoMichigan = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoJhu = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoRichmond = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUcla = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUtAustin = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoColumbia = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoNyu = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoCmu = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUcsd = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoWashington = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUiuc = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUwMadison = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoNjit = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoPurdue = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoUsc = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;
const logoOhioState = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, Award, MapPin, 
  DollarSign, Building, Globe, Check, Info, Calendar, BookOpen, Clock, AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────────
// Combined University Database for Masters
// ─────────────────────────────────────────────
const universityDatabase = [
  {
    id: 1,
    name: "Rollins College",
    city: "Winter Park",
    state: "Florida",
    location: "Winter Park, Florida, USA",
    rank: "Rank 1 US News",
    rankValue: 1,
    tuition: 69, // in ₹ Lakhs/yr
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/rollins.edu",
    website: "https://www.rollins.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "SEP"],
    description: "Known for liberal arts education with excellent computing foundations and low student-to-faculty ratios.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 80+",
    deadline: "Dec 15, 2026"
  },
  {
    id: 2,
    name: "Bentley University",
    city: "Waltham",
    state: "Massachusetts",
    location: "Waltham, Massachusetts, USA",
    rank: "Rank 1 US News",
    rankValue: 1,
    tuition: null, // -/-
    type: "PUBLIC",
    logo: logoBentley,
    website: "https://www.bentley.edu",
    courses: ["Computer Science", "Data Science", "Business Analytics", "Information technology"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "JAN"],
    description: "Highly focused on integration of business disciplines with computer science and data analytics.",
    eligibility: "GPA 3.2+, IELTS 7.0+, TOEFL 90+, GRE/GMAT waiver available",
    deadline: "Feb 01, 2026"
  },
  {
    id: 3,
    name: "Massachusetts Institute of Technology",
    city: "Cambridge",
    state: "Massachusetts",
    location: "Cambridge, Massachusetts, USA",
    rank: "Rank 1 QS Rankings",
    rankValue: 1,
    tuition: 55,
    type: "PUBLIC",
    logo: logoMit,
    website: "https://www.mit.edu",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning", "Software Engineering"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Pioneering computing laboratory, birthplace of core AI concepts and advanced systems research.",
    eligibility: "GPA 3.9+, IELTS 7.5+, TOEFL 100+, GRE required (V: 160+, Q: 168+)",
    deadline: "Dec 15, 2026"
  },
  {
    id: 4,
    name: "Harvard University",
    city: "Cambridge",
    state: "Massachusetts",
    location: "Cambridge, Massachusetts, USA",
    rank: "Rank 4 QS Rankings",
    rankValue: 4,
    tuition: 52,
    type: "PUBLIC",
    logo: logoHarvard,
    website: "https://www.harvard.edu",
    courses: ["Computer Science", "Data Science", "Management"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "World-class computational science and engineering programs focusing on algorithmic foundations and big data.",
    eligibility: "GPA 3.9+, IELTS 7.5+, TOEFL 100+, GRE recommended",
    deadline: "Dec 01, 2026"
  },
  {
    id: 5,
    name: "Stanford University",
    city: "Stanford",
    state: "California",
    location: "Stanford, California, USA",
    rank: "Rank 5 QS Rankings",
    rankValue: 5,
    tuition: 60,
    type: "PUBLIC",
    logo: logoStanford,
    website: "https://www.stanford.edu",
    courses: ["Computer Science", "Data Science", "Artificial Intelligence / Machine Learning"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "At the heart of Silicon Valley, driving technology research, tech startups, and industrial AI applications.",
    eligibility: "GPA 3.9+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 08, 2026"
  },
  {
    id: 6,
    name: "California Institute of Technology",
    city: "Pasadena",
    state: "California",
    location: "Pasadena, California, USA",
    rank: "Rank 6 QS Rankings",
    rankValue: 6,
    tuition: 58,
    type: "PUBLIC",
    logo: logoCaltech,
    website: "https://www.caltech.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Highly selective, offering elite computational research in scientific computing and robotics.",
    eligibility: "GPA 3.9+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 7,
    name: "University of California, Berkeley",
    city: "Berkeley",
    state: "California",
    location: "Berkeley, California, USA",
    rank: "Rank 10 QS Rankings",
    rankValue: 10,
    tuition: 48,
    type: "PUBLIC",
    logo: logoBerkeley,
    website: "https://www.berkeley.edu",
    courses: ["Computer Science", "Data Science", "Information Systems"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Leading center for databases, cloud infrastructure, cryptography, and deep learning architectures.",
    eligibility: "GPA 3.8+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Dec 05, 2026"
  },
  {
    id: 8,
    name: "University of Chicago",
    city: "Chicago",
    state: "Illinois",
    location: "Chicago, Illinois, USA",
    rank: "Rank 10 QS Rankings",
    rankValue: 10,
    tuition: 54,
    type: "PUBLIC",
    logo: logoChicago,
    website: "https://www.uchicago.edu",
    courses: ["Computer Science", "Data Science", "Business Analytics"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Strong theoretical computer science, economics-focused data modeling, and machine learning research.",
    eligibility: "GPA 3.7+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 9,
    name: "Washington and Lee University",
    city: "Lexington",
    state: "Virginia",
    location: "Lexington, Virginia, USA",
    rank: "Rank 11 US News",
    rankValue: 11,
    tuition: 62,
    type: "PUBLIC",
    logo: logoWashingtonAndLee,
    website: "https://www.wlu.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Elite private liberal arts education with strong computational and math modeling courses.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 95+",
    deadline: "Jan 15, 2026"
  },
  {
    id: 10,
    name: "University of Pennsylvania",
    city: "Philadelphia",
    state: "Pennsylvania",
    location: "Philadelphia, Pennsylvania, USA",
    rank: "Rank 12 QS Rankings",
    rankValue: 12,
    tuition: 56,
    type: "PUBLIC",
    logo: logoUpenn,
    website: "https://www.upenn.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Outstanding Ivy League MS programs in Computer & Information Science, and Data Science.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 11,
    name: "Cornell University",
    city: "Ithaca",
    state: "New York",
    location: "Ithaca, New York, USA",
    rank: "Rank 13 QS Rankings",
    rankValue: 13,
    tuition: 58,
    type: "PUBLIC",
    logo: logoCornell,
    website: "https://www.cornell.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Famous for its computer science department, specializing in artificial intelligence and systems engineering.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 12,
    name: "Yale University",
    city: "New Haven",
    state: "Connecticut",
    location: "New Haven, Connecticut, USA",
    rank: "Rank 16 QS Rankings",
    rankValue: 16,
    tuition: 62,
    type: "PUBLIC",
    logo: logoYale,
    website: "https://www.yale.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Ivy league private research university offering strong computing foundations, cybersecurity and bioinformatics.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 13,
    name: "Smith College",
    city: "Northampton",
    state: "Massachusetts",
    location: "Northampton, Massachusetts, USA",
    rank: "Rank 16 US News",
    rankValue: 16,
    tuition: 44,
    type: "PUBLIC",
    logo: "https://logo.clearbit.com/smith.edu",
    website: "https://www.smith.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Leading liberal arts institution offering custom computing specialization options.",
    eligibility: "GPA 3.4+, IELTS 7.0+, TOEFL 90+",
    deadline: "Jan 15, 2026"
  },
  {
    id: 14,
    name: "Wesleyan University",
    city: "Middletown",
    state: "Connecticut",
    location: "Middletown, Connecticut, USA",
    rank: "Rank 17 US News",
    rankValue: 17,
    tuition: 80,
    type: "PUBLIC",
    logo: logoWesleyan,
    website: "https://www.wesleyan.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "SEP"],
    description: "Academically rigorous, project-oriented courses in databases, computing systems, and networking.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 95+",
    deadline: "Feb 01, 2026"
  },
  {
    id: 15,
    name: "Princeton University",
    city: "Princeton",
    state: "New Jersey",
    location: "Princeton, New Jersey, USA",
    rank: "Rank 17 QS Rankings",
    rankValue: 17,
    tuition: 55,
    type: "PUBLIC",
    logo: logoPrinceton,
    website: "https://www.princeton.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Exemplary research environment for algorithms, computer theory, machine learning, and systems.",
    eligibility: "GPA 3.9+, IELTS 7.5+, TOEFL 100+, GRE recommended",
    deadline: "Dec 15, 2026"
  },
  {
    id: 16,
    name: "University of Michigan",
    city: "Ann Arbor",
    state: "Michigan",
    location: "Ann Arbor, Michigan, USA",
    rank: "Rank 21 QS Rankings",
    rankValue: 21,
    tuition: 49,
    type: "PUBLIC",
    logo: logoMichigan,
    website: "https://www.umich.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Top-tier public engineering programs in computer graphics, security, databases, and data processing.",
    eligibility: "GPA 3.7+, IELTS 7.0+, TOEFL 95+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 17,
    name: "Johns Hopkins University",
    city: "Baltimore",
    state: "Maryland",
    location: "Baltimore, Maryland, USA",
    rank: "Rank 24 QS Rankings",
    rankValue: 24,
    tuition: 59,
    type: "PUBLIC",
    logo: logoJhu,
    website: "https://www.jhu.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "World leader in bioinformatics, health informatics, and data systems architectures.",
    eligibility: "GPA 3.6+, IELTS 7.0+, TOEFL 100+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 18,
    name: "University of Richmond",
    city: "Richmond",
    state: "Virginia",
    location: "Richmond, Virginia, USA",
    rank: "Rank 28 US News",
    rankValue: 28,
    tuition: 60,
    type: "PUBLIC",
    logo: logoRichmond,
    website: "https://www.richmond.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Academically sound computational foundations, close collaboration with industry experts.",
    eligibility: "GPA 3.2+, IELTS 6.5+, TOEFL 85+",
    deadline: "Feb 15, 2026"
  },
  {
    id: 19,
    name: "University of California, Los Angeles",
    city: "Los Angeles",
    state: "California",
    location: "Los Angeles, California, USA",
    rank: "Rank 29 QS Rankings",
    rankValue: 29,
    tuition: 71,
    type: "PUBLIC",
    logo: logoUcla,
    website: "https://www.ucla.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Acclaimed public research university known for deep neural network, computer system, and database studies.",
    eligibility: "GPA 3.7+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 20,
    name: "The University of Texas at Austin",
    city: "Austin",
    state: "Texas",
    location: "Austin, Texas, USA",
    rank: "Rank 32 QS Rankings",
    rankValue: 32,
    tuition: 56,
    type: "PUBLIC",
    logo: logoUtAustin,
    website: "https://www.utexas.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Highly ranked, offering exceptional industry alignment with the booming Austin silicon and software hub.",
    eligibility: "GPA 3.6+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 21,
    name: "Columbia University in the City of New York",
    city: "New York",
    state: "New York",
    location: "New York, New York, USA",
    rank: "Rank 34 QS Rankings",
    rankValue: 34,
    tuition: null,
    type: "PUBLIC",
    logo: logoColumbia,
    website: "https://www.columbia.edu",
    courses: ["Data Science", "Computer Science", "Business Analytics"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Prestigious Ivy League department offering deep studies in natural language processing and computer systems.",
    eligibility: "GPA 3.7+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 22,
    name: "New York University",
    city: "New York City",
    state: "New York",
    location: "New York City, New York, USA",
    rank: "Rank 38 QS Rankings",
    rankValue: 38,
    tuition: 55,
    type: "PUBLIC",
    logo: logoNyu,
    website: "https://www.nyu.edu",
    courses: ["Data Science", "Computer Science", "Information Systems"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "JAN"],
    description: "Courant Institute of Mathematical Sciences provides premier research in statistical and computational DS.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 100+, GRE required",
    deadline: "Jan 05, 2026"
  },
  {
    id: 23,
    name: "Carnegie Mellon University",
    city: "Pittsburgh",
    state: "Pennsylvania",
    location: "Pittsburgh, Pennsylvania, USA",
    rank: "Rank 52 QS Rankings",
    rankValue: 52,
    tuition: 59,
    type: "PUBLIC",
    logo: logoCmu,
    website: "https://www.cmu.edu",
    courses: ["Data Science", "Computer Science", "Robotics", "Software Engineering"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "First School of Computer Science in the US. Pioneers in machine learning, human-computer interaction, and software design.",
    eligibility: "GPA 3.8+, IELTS 7.5+, TOEFL 100+, GRE required",
    deadline: "Dec 10, 2026"
  },
  {
    id: 24,
    name: "University of California, San Diego",
    city: "San Diego",
    state: "California",
    location: "San Diego, California, USA",
    rank: "Rank 62 QS Rankings",
    rankValue: 62,
    tuition: 50,
    type: "PUBLIC",
    logo: logoUcsd,
    website: "https://www.ucsd.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "High-impact computing research located along the Biotech Beach, strong data engineering focus.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 25,
    name: "University of Washington",
    city: "Seattle",
    state: "Washington",
    location: "Seattle, Washington, USA",
    rank: "Rank 63 QS Rankings",
    rankValue: 63,
    tuition: 39,
    type: "PUBLIC",
    logo: logoWashington,
    website: "https://www.washington.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Direct ties to Microsoft and Amazon tech hubs. Outstanding programs in machine learning and databases.",
    eligibility: "GPA 3.6+, IELTS 7.0+, TOEFL 92+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 26,
    name: "University of Illinois Urbana-Champaign",
    city: "Urbana-Champaign",
    state: "Illinois",
    location: "Urbana-Champaign, Illinois, USA",
    rank: "Rank 64 QS Rankings",
    rankValue: 64,
    tuition: 35,
    type: "PUBLIC",
    logo: logoUiuc,
    website: "https://www.illinois.edu",
    courses: ["Data Science", "Computer Science", "Computer Engineering"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Distinguished computing history (birthplace of Mosaic web browser). Leaders in high-performance computing.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 100+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 27,
    name: "University of Wisconsin-Madison",
    city: "Madison",
    state: "Wisconsin",
    location: "Madison, Wisconsin, USA",
    rank: "Rank 83 QS Rankings",
    rankValue: 83,
    tuition: 37,
    type: "PUBLIC",
    logo: logoUwMadison,
    website: "https://www.wisc.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Academically renowned public school with highly integrated databases and computing theory programs.",
    eligibility: "GPA 3.4+, IELTS 7.0+, TOEFL 92+, GRE required",
    deadline: "Dec 15, 2026"
  },
  {
    id: 28,
    name: "Georgia Institute of Technology",
    city: "Atlanta",
    state: "Georgia",
    location: "Atlanta, Georgia, USA",
    rank: "Rank 88 QS Rankings",
    rankValue: 88,
    tuition: 31,
    type: "PUBLIC",
    logo: logoGeorgiaTech,
    website: "https://www.gatech.edu",
    courses: ["Data Science", "Computer Science", "Cyber Security", "Information Systems"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Highly ranked public research institute, known for massive-scale systems and advanced machine learning models.",
    eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 29,
    name: "New Jersey Institute of Technology",
    city: "Newark",
    state: "New Jersey",
    location: "Newark, New Jersey, USA",
    rank: "Rank 97 US News",
    rankValue: 97,
    tuition: 35,
    type: "PUBLIC",
    logo: logoNjit,
    website: "https://www.njit.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG", "JAN"],
    description: "Excellent value public university providing deep technical specialization in data warehousing and systems.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 79+, GRE required",
    deadline: "Feb 15, 2026"
  },
  {
    id: 30,
    name: "Purdue University",
    city: "West Lafayette",
    state: "Indiana",
    location: "West Lafayette, Indiana, USA",
    rank: "Rank 99 QS Rankings",
    rankValue: 99,
    tuition: 30,
    type: "PUBLIC",
    logo: logoPurdue,
    website: "https://www.purdue.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Acclaimed engineering school with comprehensive STEM OPT designated data modeling degrees.",
    eligibility: "GPA 3.3+, IELTS 7.0+, TOEFL 80+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 31,
    name: "University of Southern California",
    city: "Los Angeles",
    state: "California",
    location: "Los Angeles, California, USA",
    rank: "Rank 116 QS Rankings",
    rankValue: 116,
    tuition: 65,
    type: "PUBLIC",
    logo: logoUsc,
    website: "https://www.usc.edu",
    courses: ["Data Science", "Computer Science", "Information Systems"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "JAN"],
    description: "Large private computing department with massive industry networks throughout California.",
    eligibility: "GPA 3.4+, IELTS 7.0+, TOEFL 90+, GRE required",
    deadline: "Jan 15, 2026"
  },
  {
    id: 32,
    name: "The Ohio State University",
    city: "Columbus",
    state: "Ohio",
    location: "Columbus, Ohio, USA",
    rank: "Rank 140 QS Rankings",
    rankValue: 140,
    tuition: 25,
    type: "PUBLIC",
    logo: logoOhioState,
    website: "https://www.osu.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG", "SEP"],
    description: "Dynamic public research university with excellent, cost-effective computing and analytics facilities.",
    eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 79+, GRE required",
    deadline: "Feb 01, 2026"
  }
];

// ─────────────────────────────────────────────
// Sidebar Filter Categories Definition
// ─────────────────────────────────────────────
const degreeCategories = [
  "Postgraduate", "Ph.D.", "PG Diploma /Certificate", "Undergraduate", "UG Diploma /Certificate /Associate Degree"
];

const courseCategories = [
  "Computer Science", "Data Science", "Cyber Security", "Artificial Intelligence / Machine Learning",
  "Software Engineering", "Business Analytics", "Information Systems", "Information technology", "Computer Engineering"
];

const cityCategories = [
  "Atlanta", "Boston", "Chicago", "Los Angeles", "Philadelphia", "New York", "Pittsburgh", "Seattle", "Stanford", "Waltham", "Ithaca", "Berkeley", "Pasadena", "Ann Arbor", "Newark", "West Lafayette", "Columbus"
];

const intakeCategories = [
  "JAN", "MAR", "MAY", "AUG", "SEP", "OCT", "NOV"
];

const feeRanges = [
  { id: "max10", label: "Max ₹10 Lacs", max: 10 },
  { id: "max20", label: "Max ₹20 Lacs", max: 20 },
  { id: "max30", label: "Max ₹30 Lacs", max: 30 },
  { id: "max40", label: "Max ₹40 Lacs", max: 40 },
  { id: "above40", label: "₹40 Lacs +", min: 40 }
];

const USACourseListingPage = ({ courseOverride = null }) => {
  const { courseSlug } = useParams();
  
  // Set dynamic course based on URL slug
  const getCourseFromSlug = (slug) => {
    if (slug === 'masters-cs' || slug === 'computer-science') return "Computer Science";
    if (slug === 'masters-data-science' || slug === 'data-science') return "Data Science";
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
  const [selectedUniDetails, setSelectedUniDetails] = useState(null);

  // Accordion toggle states (for mobile and desktop filters)
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

    // 2. Degree filter (AND matches - if checked, uni must belong to at least one checked degree)
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
      // If none of the ranges match, return false
      const matchedFee = uni.tuition;
      if (matchedFee === null) {
        // null fee is treated as not matching selected fee brackets (but visible when no fee filter selected)
        return false;
      }
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
      // Treat null fees as very high for sorting at end
      const feeA = a.tuition === null ? 999 : a.tuition;
      const feeB = b.tuition === null ? 999 : b.tuition;
      return feeA - feeB;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Pagination constants
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

  const courseDisplayName = initialCourse === "Computer Science" ? "Computer Science" : "Data Science";

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background Ambience decoration */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1340px]">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/study-abroad/usa" className="hover:text-indigo-600 transition-colors">Study Abroad</Link>
          <span>/</span>
          <span className="text-slate-700">Masters in {courseDisplayName}</span>
        </div>

        {/* Title / Hero */}
        <div className="mb-10 text-left max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Top Universities in USA for Masters (MS) in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">
              {courseDisplayName}
            </span>{' '}
            (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Compare tuition rates, QS rankings, core eligibility requirements, and explore fully accredited institutions in the United States.
          </p>
        </div>

        {/* Main Grid: Filters Sidebar + University list */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          
          {/* 1. FILTER SIDEBAR (Glassmorphic Styled panel) */}
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

            {/* Scrollable Filter options list */}
            <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              
              {/* Filter Section: 1st Year Fees */}
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
                            className="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Filter Section: Degree */}
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
                            className="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{deg}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Filter Section: Courses */}
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
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {courseCategories.map(course => (
                        <label key={course} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCourses.includes(course)}
                            onChange={() => handleFilterToggle(course, selectedCourses, setSelectedCourses)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{course}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Filter Section: Cities */}
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
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {cityCategories.map(city => (
                        <label key={city} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedCities.includes(city)}
                            onChange={() => handleFilterToggle(city, selectedCities, setSelectedCities)}
                            className="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{city}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full h-[1px] bg-slate-100" />

              {/* Filter Section: Intake */}
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
                            className="w-4 h-4 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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

          {/* 2. UNIVERSITY LIST CONTENT */}
          <main className="flex-1 flex flex-col gap-6">
            
            {/* Search, Sort and Summary header */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/50 border border-white/60 p-5 rounded-[24px] backdrop-blur-md shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={17} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by course (e.g. CS, MBA, Data Science), university, city, or state..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-500">
                  <span className="text-slate-800 font-black">{sortedUniversities.length}</span> Universities Found
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-700 focus:border-indigo-400 transition-colors"
                  >
                    <option value="rank">QS / US News Rank</option>
                    <option value="fees">Tuition Fee: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips bar */}
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

            {/* University Cards list */}
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
                      {/* Logo and school name */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img 
                            src={uni.logo} 
                            alt={uni.name} 
                            className="w-10 h-10 object-contain" 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128` + uni.name.charAt(0); }} 
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-indigo-600 transition-colors">
                            {["Harvard University", "Stanford University", "Columbia University in the City of New York", "Northeastern University", "Yale University"].includes(uni.name) ? (
                              <Link 
                                to={`/study-abroad/usa/universities/${
                                  uni.name.includes("Harvard") ? "harvard" :
                                  uni.name.includes("Stanford") ? "stanford" :
                                  uni.name.includes("Columbia") ? "columbia" :
                                  uni.name.includes("Northeastern") ? "northeastern" :
                                  "yale"
                                }`} 
                                className="hover:underline"
                              >
                                {uni.name}
                              </Link>
                            ) : (
                              uni.name
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                            <MapPin size={11} />
                            {uni.location}
                          </p>
                        </div>
                      </div>

                      {/* Rank, Fees and Type grid */}
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS / US Rank</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1">
                            <Award size={12} className="text-indigo-600" />
                            {uni.rank.replace("Rank ", "")}
                          </p>
                        </div>
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1st Year Fees</p>
                          <p className="text-xs font-black text-indigo-650 mt-0.5">
                            {uni.tuition ? `₹ ${uni.tuition} Lakh` : '-/-'}
                          </p>
                        </div>
                        <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                          <p className="text-[10px] font-black text-emerald-650 mt-1 uppercase tracking-wider flex items-center gap-1">
                            <Building size={11} className="text-emerald-500" />
                            {uni.type}
                          </p>
                        </div>
                      </div>

                      {/* Course lists tags & short description */}
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-2 mb-2">
                          "{uni.description}"
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

                        <div className="flex flex-wrap gap-1.5">
                          {uni.courses.slice(0, 3).map((c, i) => (
                            <span 
                              key={i} 
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c === initialCourse ? 'bg-indigo-50 border-indigo-150 text-indigo-650' : 'bg-slate-50 border-slate-150 text-slate-500'}`}
                            >
                              {c}
                            </span>
                          ))}
                          {uni.courses.length > 3 && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-50 border border-slate-150 text-slate-400">
                              +{uni.courses.length - 3} More
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                      <button
                        onClick={() => {
                          let url = uni.website || uni.url;
                          if (!url || url === '#' || url === 'undefined') {
                            url = `https://www.google.com/search?q=${encodeURIComponent(uni.name + ' official website')}`;
                          } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                            url = 'https://' + url;
                          }
                          window.open(url, '_blank');
                        }}
                        className="flex-1 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-xs font-bold cursor-pointer"
                      >
                        Know More
                      </button>
                      <Link
                        to={`/contact?university=${encodeURIComponent(uni.name)}&course=${courseDisplayName}`}
                        className="flex-1 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors text-center text-xs font-bold"
                      >
                        Check Eligibility
                      </Link>
                    </div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>

              {sortedUniversities.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white/40 border border-white/60 rounded-[32px] backdrop-blur-md">
                  <AlertCircle className="mx-auto text-slate-300 mb-3" size={36} />
                  <p className="text-slate-500 font-extrabold text-sm">No universities match the selected filters.</p>
                  <p className="text-slate-400 text-xs mt-1">Try resetting the search or checkboxes to expand options.</p>
                  <button 
                    onClick={handleClearAll}
                    className="mt-4 px-5 py-2 bg-indigo-650 text-white text-xs font-bold rounded-xl hover:bg-indigo-750 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {getPageNumbers().map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${currentPage === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* 3. DETAILED MODAL OVERLAY */}
      <AnimatePresence>
        {selectedUniDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUniDetails(null)}
              className="absolute inset-0 bg-slate-900"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] w-full max-w-lg p-7 relative z-10"
            >
              <button 
                onClick={() => setSelectedUniDetails(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-4 pb-5 border-b border-slate-100 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={selectedUniDetails.logo} 
                    alt={selectedUniDetails.name} 
                    className="w-10 h-10 object-contain" 
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`; }}
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{selectedUniDetails.name}</h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {selectedUniDetails.location}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Overview</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {selectedUniDetails.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">QS / US News Rank</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 inline-flex items-center gap-1">
                      <Award size={13} className="text-indigo-650" />
                      {selectedUniDetails.rank}
                    </span>
                  </div>
                  <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tuition Fee / Year</span>
                    <span className="text-xs font-black text-indigo-650 mt-0.5 block">
                      {selectedUniDetails.tuition ? `₹ ${selectedUniDetails.tuition} Lakh` : '-/-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <BookOpen size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Eligibility Requirements</h5>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedUniDetails.eligibility}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Application Deadline (2026)</h5>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedUniDetails.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-black text-slate-800">Available Intakes</h5>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedUniDetails.intakes.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-7 pt-5 border-t border-slate-100">
                <a 
                  href={selectedUniDetails?.website && selectedUniDetails?.website !== '#' ? (selectedUniDetails.website.startsWith('http') ? selectedUniDetails.website : `https://${selectedUniDetails.website}`) : `https://www.google.com/search?q=${encodeURIComponent((selectedUniDetails?.name || 'university') + ' official website')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 py-3 text-center border border-slate-200 hover:bg-slate-50 text-slate-750 font-extrabold text-xs rounded-2xl transition-colors"
                >
                  Visit Website 🌐
                </a>
                <Link
                  to={`/contact?university=${encodeURIComponent(selectedUniDetails.name)}&course=${courseDisplayName}`}
                  onClick={() => setSelectedUniDetails(null)}
                  className="flex-1 py-3 text-center bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-2xl transition-colors shadow-md shadow-indigo-600/10"
                >
                  Start Application
                </Link>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default USACourseListingPage;
