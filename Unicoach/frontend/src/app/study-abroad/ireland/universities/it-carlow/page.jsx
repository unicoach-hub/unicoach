import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const itCarlowData = {
  name: "SETU Carlow (formerly Institute of Technology Carlow)",
  country: "Ireland",
  location: "Carlow, Leinster, Ireland",
  city: "Carlow",
  established: 2022,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "15:1",
  acceptanceRate: null,
  accreditation: null,
  avgStudyCost: "INR 0.50 L",
  avgCostOfLiving: "INR 0.25 L",
  logo: "/logos/verified-South East Technological University.png",
  heroImage: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200",
  topCourses: [
    { name: "Business Administration", count: 1 },
    { name: "Business Management", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Graphic and Design Studies", count: 1 },
    { name: "Information technology", count: 1 }
  ],
  featuredCourse: null,
  intakeDeadlines: [
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL iBT or another accepted test is required; the minimum score varies by programme." },
    { title: "Undergraduate Degree", detail: "An honours bachelor's degree (Level 8) or equivalent for master's programmes." }
  ],
  rankings: null,
  coursesFees: [],
  description: "SETU Carlow is the Carlow campus of South East Technological University (SETU), formed on 1 May 2022 when the Institute of Technology Carlow (founded 1970) merged with Waterford Institute of Technology. It offers career-focused programmes in engineering, computing, business and the arts.",
  longDescription: "South East Technological University (SETU) was formed on 1 May 2022 by merging the Institute of Technology Carlow and Waterford Institute of Technology. The former IT Carlow campus is now SETU Carlow, and applications go through SETU (setu.ie).\n\nSETU Carlow offers programmes in engineering, computing, business, science and the arts. Check setu.ie for current courses, fees and English language requirements.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots",
    "Special Attractions"
  ],
  alumni: null,
  costOfLiving: {
    description: "Carlow is one of Ireland's most affordable college towns, offering students a cost-effective base for their studies. Housing options range from on-campus accommodation to private rentals in the town centre. Transportation to Dublin and other cities is convenient with regular bus and rail services.",
    inr: "0.75 L",
    usd: "USD 883",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 2.50 L" },
      { name: "Food & Groceries", value: "INR 1.20 L" },
      { name: "Books & Supplies", value: "INR 0.40 L" },
      { name: "Transportation", value: "INR 0.50 L" },
      { name: "Personal & Misc", value: "INR 0.40 L" }
    ]
  },
  placements: {
    description: "IT Carlow offers extensive placement assistance to international students to help them secure job opportunities after graduation. The Career Services team provides personalised guidance, workshops on resume writing and interview skills, job fairs, and an online job portal. The institute has strong links with major multinational employers operating in Ireland.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support"
    ],
    recruiters: [
      "IBM",
      "Intel Corporation",
      "Boston Scientific",
      "Eir",
      "Accenture",
      "Medtronic",
      "Pfizer",
      "SAP",
      "Ericsson",
      "Johnson & Johnson"
    ]
  },
  faqs: [
    { question: "Does Institute of Technology Carlow still exist?", answer: "IT Carlow merged with Waterford Institute of Technology on 1 May 2022 to form South East Technological University (SETU). The Carlow campus continues as SETU Carlow." },
    { question: "How do I apply to SETU Carlow?", answer: "International students apply through SETU's website (setu.ie). Check the course page for entry requirements, fees and deadlines." },
    { question: "Is SETU ranked in the QS World University Rankings?", answer: "SETU is not ranked in the QS World University Rankings 2027." },
    { question: "What programmes are offered at SETU Carlow?", answer: "Programmes include engineering, business, computing and data science, design and the arts." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ],
  rank: "Not ranked in QS World University Rankings 2027"
};

const ITCarlowPage = () => {
  return <UniversityDetailTemplate 
      uniData={itCarlowData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default ITCarlowPage;
