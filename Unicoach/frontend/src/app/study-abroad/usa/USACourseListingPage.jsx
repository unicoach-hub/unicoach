import logoStanford from '../../../assets/usa/Stanford/Stanford University.svg';
import logoChicago from '../../../assets/usa/Chicago/Chicago.png';
import logoUpenn from '../../../assets/usa/Philadelphia/University of Pennsylvania.png';
import logoGeorgiaTech from '../../../assets/usa/Atlanta/Georgia Institute of Technology.png';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, ChevronDown, Award, MapPin, 
  DollarSign, Building, Globe, Check, Info, Calendar, BookOpen, Clock, AlertCircle
} from 'lucide-react';
import { FinderCard, FinderField, FinderChip, FINDER_FIELD, FIELD_RADIUS } from '../../../components/ui/FinderForm';
import { HookBand, BarCompare } from '../../../components/ui/Infographics';

// ─────────────────────────────────────────────
// Combined University Database for Masters
// ─────────────────────────────────────────────
const universityDatabase = [
  {
    id: 2,
    name: "Bentley University",
    city: "Waltham",
    state: "Massachusetts",
    location: "Waltham, Massachusetts, USA",
    rank: "Not ranked (QS 2027)",
    rankValue: 9999,
    tuition: 48, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Bentley University.png",
    website: "https://www.bentley.edu",
    courses: ["Business Analytics", "Information Systems"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Business-focused private university. Its STEM-designated MS in Business Analytics (30 credits) covers Python, machine learning and big data; it does not offer an MS in Computer Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 3,
    name: "Massachusetts Institute of Technology",
    city: "Cambridge",
    state: "Massachusetts",
    location: "Cambridge, Massachusetts, USA",
    rank: "Rank 1 QS Rankings",
    rankValue: 1,
    tuition: 63, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Massachusetts Institute of Technology.png",
    website: "https://www.mit.edu",
    courses: ["Computer Science", "Artificial Intelligence / Machine Learning"],
    degrees: ["Ph.D."],
    intakes: ["SEP"],
    description: "Private research university, No. 1 in the QS World University Rankings 2027. EECS admits graduate students to its doctoral program; it has no standalone Master's in Computer Science for external applicants.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 4,
    name: "Harvard University",
    city: "Cambridge",
    state: "Massachusetts",
    location: "Cambridge, Massachusetts, USA",
    rank: "Rank 5 QS Rankings",
    rankValue: 5,
    tuition: 64, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Harvard University.png",
    website: "https://www.harvard.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League university founded in 1636. The John A. Paulson School of Engineering and Applied Sciences offers master's degrees in Data Science and in Computational Science and Engineering.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 5,
    name: "Stanford University",
    city: "Stanford",
    state: "California",
    location: "Stanford, California, USA",
    rank: "Rank 2 QS Rankings",
    rankValue: 2,
    tuition: 66, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: logoStanford,
    website: "https://www.stanford.edu",
    courses: ["Computer Science", "Data Science", "Artificial Intelligence / Machine Learning"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Private research university in Silicon Valley, founded in 1885. Offers an MS in Computer Science with AI and systems specialisations.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 6,
    name: "California Institute of Technology",
    city: "Pasadena",
    state: "California",
    location: "Pasadena, California, USA",
    rank: "Rank 7 QS Rankings",
    rankValue: 7,
    tuition: 65, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-California Institute of Technology.png",
    website: "https://www.caltech.edu",
    courses: ["Computer Science"],
    degrees: ["Ph.D."],
    intakes: ["SEP"],
    description: "Small, highly selective private science and engineering institute. Graduate admission in Computing and Mathematical Sciences is to the PhD program.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 7,
    name: "University of California, Berkeley",
    city: "Berkeley",
    state: "California",
    location: "Berkeley, California, USA",
    rank: "Rank 20 QS Rankings",
    rankValue: 20,
    tuition: 59, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-University of California, Berkeley.png",
    website: "https://www.berkeley.edu",
    courses: ["Computer Science", "Data Science", "Information Systems"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Flagship public university of the University of California system. EECS offers a professional Master of Engineering (MEng); the School of Information offers the MIMS. Fee shown is the 2026-27 non-resident MEng rate.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 8,
    name: "University of Chicago",
    city: "Chicago",
    state: "Illinois",
    location: "Chicago, Illinois, USA",
    rank: "Rank 24 QS Rankings",
    rankValue: 24,
    tuition: 63, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: logoChicago,
    website: "https://www.uchicago.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Private research university on a quarter system. The Masters Program in Computer Science (MPCS) and the MS in Applied Data Science are its main professional master's options.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 10,
    name: "University of Pennsylvania",
    city: "Philadelphia",
    state: "Pennsylvania",
    location: "Philadelphia, Pennsylvania, USA",
    rank: "Rank 15 QS Rankings",
    rankValue: 15,
    tuition: 67, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: logoUpenn,
    website: "https://www.upenn.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League university. Penn Engineering offers MSE degrees in Computer and Information Science and in Data Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 11,
    name: "Cornell University",
    city: "Ithaca",
    state: "New York",
    location: "Ithaca, New York, USA",
    rank: "Rank 16 QS Rankings",
    rankValue: 16,
    tuition: 70, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Cornell University.png",
    website: "https://www.cornell.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League university with some state-supported colleges. Cornell Engineering offers a one-year professional MEng in Computer Science in Ithaca.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 12,
    name: "Yale University",
    city: "New Haven",
    state: "Connecticut",
    location: "New Haven, Connecticut, USA",
    rank: "Rank 16 QS Rankings",
    rankValue: 16,
    tuition: 50, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Yale University.png",
    website: "https://www.yale.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League research university founded in 1701. The Graduate School of Arts and Sciences offers an MS in Computer Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 14,
    name: "Wesleyan University",
    city: "Middletown",
    state: "Connecticut",
    location: "Middletown, Connecticut, USA",
    rank: "Not ranked (QS 2027)",
    rankValue: 9999,
    tuition: null, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Wesleyan University.png",
    website: "https://www.wesleyan.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Private liberal arts university with a small two-year MA in Computer Science. Most full-time MA students receive tuition remission and a stipend in return for teaching assistant duties.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 15,
    name: "Princeton University",
    city: "Princeton",
    state: "New Jersey",
    location: "Princeton, New Jersey, USA",
    rank: "Rank 27 QS Rankings",
    rankValue: 27,
    tuition: 62, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Princeton University.png",
    website: "https://www.princeton.edu",
    courses: ["Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League research university. Computer Science offers a small Master of Science in Engineering (MSE) alongside its PhD program.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 16,
    name: "University of Michigan",
    city: "Ann Arbor",
    state: "Michigan",
    location: "Ann Arbor, Michigan, USA",
    rank: "Rank 51 QS Rankings",
    rankValue: 51,
    tuition: 65, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-University of Michigan.png",
    website: "https://umich.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Large public research university. The College of Engineering offers MS degrees in Computer Science and Engineering and in Data Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 17,
    name: "Johns Hopkins University",
    city: "Baltimore",
    state: "Maryland",
    location: "Baltimore, Maryland, USA",
    rank: "Rank 20 QS Rankings",
    rankValue: 20,
    tuition: 65, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Johns Hopkins University.png",
    website: "https://www.jhu.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private research university. The Whiting School of Engineering offers full-time MSE degrees in Computer Science and in Data Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 19,
    name: "University of California, Los Angeles",
    city: "Los Angeles",
    state: "California",
    location: "Los Angeles, California, USA",
    rank: "Rank 49 QS Rankings",
    rankValue: 49,
    tuition: 29, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-University of California, Los Angeles.png",
    website: "https://www.ucla.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Public research university in the University of California system, on a quarter calendar. Fee shown is 2026-27 non-resident graduate tuition and fees; some professional master's programs charge more.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 20,
    name: "The University of Texas at Austin",
    city: "Austin",
    state: "Texas",
    location: "Austin, Texas, USA",
    rank: "Rank 72 QS Rankings",
    rankValue: 72,
    tuition: 18, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-The University of Texas at Austin.png",
    website: "https://www.utexas.edu",
    courses: ["Computer Science", "Data Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Flagship public university of Texas, in the state capital's growing tech hub. Fee shown is non-resident graduate tuition for 9 credit hours per semester.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 21,
    name: "Columbia University in the City of New York",
    city: "New York",
    state: "New York",
    location: "New York, New York, USA",
    rank: "Rank 43 QS Rankings",
    rankValue: 43,
    tuition: 62, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/Columbia_University_in_the_City_of_New_York.webp",
    website: "https://www.columbia.edu",
    courses: ["Data Science", "Computer Science", "Business Analytics"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private Ivy League university in Manhattan. Columbia Engineering offers MS degrees in Computer Science and Data Science, charged per credit point.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 22,
    name: "New York University",
    city: "New York City",
    state: "New York",
    location: "New York City, New York, USA",
    rank: "Rank 58 QS Rankings",
    rankValue: 58,
    tuition: null, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/New_York_University.webp",
    website: "https://www.nyu.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private research university in Manhattan. MS Computer Science is offered by both the Courant Institute and the Tandon School of Engineering; the Center for Data Science offers an MS in Data Science.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 23,
    name: "Carnegie Mellon University",
    city: "Pittsburgh",
    state: "Pennsylvania",
    location: "Pittsburgh, Pennsylvania, USA",
    rank: "Rank 55 QS Rankings",
    rankValue: 55,
    tuition: 59, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/verified-Carnegie Mellon University.png",
    website: "https://www.cmu.edu",
    courses: ["Data Science", "Computer Science", "Robotics", "Software Engineering"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private research university. The School of Computer Science runs master's programs in computer science, machine learning, robotics and software engineering.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 24,
    name: "University of California, San Diego",
    city: "San Diego",
    state: "California",
    location: "San Diego, California, USA",
    rank: "Rank 81 QS Rankings",
    rankValue: 81,
    tuition: 29, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-University of California, San Diego.png",
    website: "https://ucsd.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Public research university in the University of California system, on a quarter calendar. Fee shown is 2026-27 non-resident graduate tuition; some professional master's programs charge more.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 25,
    name: "University of Washington",
    city: "Seattle",
    state: "Washington",
    location: "Seattle, Washington, USA",
    rank: "Rank 94 QS Rankings",
    rankValue: 94,
    tuition: 31, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/University_of_Washington.webp",
    website: "https://www.washington.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["SEP"],
    description: "Public research university in Seattle, close to the headquarters of Amazon and Microsoft. Fee shown is the standard non-resident graduate rate; many CS and data science master's programs are self-sustaining with their own fees.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 26,
    name: "University of Illinois Urbana-Champaign",
    city: "Urbana-Champaign",
    state: "Illinois",
    location: "Urbana-Champaign, Illinois, USA",
    rank: "Rank 74 QS Rankings",
    rankValue: 74,
    tuition: 38, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/verified-University of Illinois Urbana-Champaign.png",
    website: "https://illinois.edu",
    courses: ["Data Science", "Computer Science", "Computer Engineering"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Public research university. The Mosaic web browser was developed at its National Center for Supercomputing Applications (NCSA). Fee shown is the 2026-27 engineering (including CS) graduate rate.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 27,
    name: "University of Wisconsin-Madison",
    city: "Madison",
    state: "Wisconsin",
    location: "Madison, Wisconsin, USA",
    rank: "Rank 131 QS Rankings",
    rankValue: 131,
    tuition: 23, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/University_of_Wisconsin-Madison.webp",
    website: "https://www.wisc.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Flagship public research university of Wisconsin. Fee shown is 2026-27 non-resident graduate tuition; some professional master's programs charge more.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 28,
    name: "Georgia Institute of Technology",
    city: "Atlanta",
    state: "Georgia",
    location: "Atlanta, Georgia, USA",
    rank: "Rank 142 QS Rankings",
    rankValue: 142,
    tuition: 31, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: logoGeorgiaTech,
    website: "https://www.gatech.edu",
    courses: ["Data Science", "Computer Science", "Cyber Security"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Public research university in Atlanta. The College of Computing offers an MS in Computer Science; Georgia Tech also runs an interdisciplinary MS in Analytics and an MS in Cybersecurity.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 29,
    name: "New Jersey Institute of Technology",
    city: "Newark",
    state: "New Jersey",
    location: "Newark, New Jersey, USA",
    rank: "Rank 741-750 QS Rankings",
    rankValue: 741,
    tuition: 35, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/New_Jersey_Institute_of_Technology.webp",
    website: "https://www.njit.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate"],
    intakes: ["AUG"],
    description: "Public technological university in Newark, near New York City. Graduate tuition is charged per credit (2026-27 non-resident rate shown for 18 credits a year).",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 30,
    name: "Purdue University",
    city: "West Lafayette",
    state: "Indiana",
    location: "West Lafayette, Indiana, USA",
    rank: "Rank 100 QS Rankings",
    rankValue: 100,
    tuition: 29, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/Purdue_University.webp",
    website: "https://www.purdue.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Public research university with large engineering and computer science schools. Fee shown is the 2025-26 international graduate rate for CS/engineering, including mandatory fees.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 31,
    name: "University of Southern California",
    city: "Los Angeles",
    state: "California",
    location: "Los Angeles, California, USA",
    rank: "Rank 153 QS Rankings",
    rankValue: 153,
    tuition: 63, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PRIVATE",
    logo: "/logos/University_of_Southern_California.webp",
    website: "https://www.usc.edu",
    courses: ["Data Science", "Computer Science", "Information Systems"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Private research university in Los Angeles. Viterbi School of Engineering charges per unit (2026-27 rate shown for 24 units a year).",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
  },
  {
    id: 32,
    name: "The Ohio State University",
    city: "Columbus",
    state: "Ohio",
    location: "Columbus, Ohio, USA",
    rank: "Rank 201 QS Rankings",
    rankValue: 201,
    tuition: 41, // ₹ Lakhs/yr, international Master's tuition at 1 USD = ₹95
    type: "PUBLIC",
    logo: "/logos/The_Ohio_State_University.webp",
    website: "https://www.osu.edu",
    courses: ["Data Science", "Computer Science"],
    degrees: ["Postgraduate", "Ph.D."],
    intakes: ["AUG"],
    description: "Large public research university in Columbus. Fee shown is 2025-26 non-resident graduate tuition, surcharge and fees.",
    eligibility: "Recognised bachelor's degree; TOEFL/IELTS unless waived (minimum scores vary by program); GRE required, optional or not accepted depending on program",
    deadline: "Varies by program (fall deadlines usually fall between Dec and Feb)"
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

        <HookBand value={universityDatabase.length} label="US universities on this page. Filter by course, city, fees and intake below." hi="तुलना करो" className="mb-10" />

        {/* Main Grid: Filters Sidebar + University list */}
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          
          {/* 1. FILTER SIDEBAR (Glassmorphic Styled panel) */}
          <aside className="sticky top-28 bg-white border border-[#E6E0D4] p-5 shadow-[0_24px_60px_-36px_rgba(22,19,15,0.35)] z-30" style={{ borderRadius: 18 }}>
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE6DA] mb-5">
              <span className="flex items-center gap-2 text-[14px] font-semibold text-[#16130F]">
                <Filter size={15} className="text-[#DE5C2B]" />
                Filters
              </span>
              <button 
                onClick={handleClearAll}
                className="text-[12.5px] font-semibold text-[#DE5C2B] hover:underline cursor-pointer"
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
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3"
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
                        <label key={range.id} className="flex items-center gap-2.5 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
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

              {/* Filter Section: Degree */}
              <div>
                <button
                  onClick={() => toggleAccordion('degree')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3"
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
                        <label key={deg} className="flex items-center gap-2.5 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
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

              {/* Filter Section: Courses */}
              <div>
                <button
                  onClick={() => toggleAccordion('courses')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3"
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
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {courseCategories.map(course => (
                        <label key={course} className="flex items-center gap-2.5 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
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

              {/* Filter Section: Cities */}
              <div>
                <button
                  onClick={() => toggleAccordion('cities')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3"
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
                      className="overflow-hidden space-y-2.5 pl-0.5"
                    >
                      {cityCategories.map(city => (
                        <label key={city} className="flex items-center gap-2.5 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
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

              {/* Filter Section: Intake */}
              <div>
                <button
                  onClick={() => toggleAccordion('intake')}
                  className="w-full flex items-center justify-between text-[12.5px] font-semibold text-[#16130F] mb-3"
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
                        <label key={intake} className="flex items-center gap-2.5 text-[13px] text-[#16130F] hover:text-[#DE5C2B] cursor-pointer select-none">
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

          {/* 2. UNIVERSITY LIST CONTENT */}
          <main className="flex-1 flex flex-col gap-6">
            
            {/* Search, Sort and Summary header */}
            <FinderCard>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] lg:grid-cols-[1fr_220px_auto] gap-3 items-end">
                <FinderField label="Search">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B544A] pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      placeholder="Search by course (e.g. CS, MBA, Data Science), university, city, or state..."
                      className={`${FINDER_FIELD} pl-10`}
                      style={FIELD_RADIUS}
                    />
                  </div>
                </FinderField>
                <FinderField label="Sort by">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${FINDER_FIELD} cursor-pointer`} style={FIELD_RADIUS}>
                    <option value="rank">QS / US News Rank</option>
                    <option value="fees">Tuition Fee: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </FinderField>
                <p className="text-[13.5px] text-[#5B544A] sm:col-span-2 lg:col-span-1 lg:h-11 flex items-center lg:justify-end whitespace-nowrap">
                  <span className="font-bold text-[#16130F] mr-1">{sortedUniversities.length}</span> {sortedUniversities.length === 1 ? 'university' : 'universities'}
                </p>
              </div>
            </FinderCard>

            {/* Active Filter Chips bar */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-white/70 border border-[#E6E0D4] p-3.5" style={{ borderRadius: 18 }}>
                <span className="text-[13px] font-semibold text-[#16130F] mr-1">Active filters</span>
                {activeChips.map((chip, idx) => (
                  <FinderChip key={idx} on aria-pressed={undefined} aria-label={`Remove ${chip.label}`} onClick={() => handleRemoveChip(chip)}>
                    {chip.label} <X size={13} className="stroke-[2.5]" />
                  </FinderChip>
                ))}
                <button
                  onClick={handleClearAll}
                  className="text-[12.5px] font-semibold text-[#DE5C2B] hover:underline ml-1 cursor-pointer"
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
