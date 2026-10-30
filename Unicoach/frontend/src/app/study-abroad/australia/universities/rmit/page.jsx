import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const rmitData = {
  name: "RMIT University",
  country: "Australia",
  location: "Melbourne, Victoria, Australia",
  city: "Melbourne",
  established: 1887,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "22:1",
  acceptanceRate: null,
  accreditation: "TEQSA, CRICOS",
  avgCostOfLiving: "INR 3.30 L",
  logo: "/logos/verified-RMIT University.png",
  heroImage: "https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=1200",
  notification: "RMIT University is a dual-sector university, offering both vocational (TAFE) and higher education programs.",
  topCourses: [
    { name: "Accounting", count: 23 },
    { name: "Advertising", count: 3 },
    { name: "Aerospace Engineering", count: 9 },
    { name: "Animation", count: 2 },
    { name: "Architecture", count: 5 }
  ],
  featuredCourse: {
    name: "Master of Information Technology",
    duration: "24 Months",
    tuition: 32
  },
  intakeDeadlines: [
    { name: "FEB'2026", status: "Intake Open" },
    { name: "JUL'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band, with no individual component below 6.0 for most programmes." },
    { title: "Other English Tests", detail: "TOEFL iBT, PTE Academic and other tests are accepted; check the minimum score for your program." },
    { title: "Undergraduate Degree", detail: "Relevant bachelor's degree from a recognised university." },
    { title: "Work Experience", detail: "Some postgraduate programmes (e.g., MBA) may require 2+ years of relevant professional work experience." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "119" }
    ]
  },
  coursesFees: [
    { name: "Master of Information Technology", duration: "24 Months", tuition: 32 },
    { name: "Master of Business Analytics and AI Strategy", duration: "See course page", tuition: 34 }
  ],
  description: "RMIT University, founded in Melbourne in 1887, is a public university of technology, design and enterprise and a dual-sector institution offering both vocational (TAFE) and higher education. It is ranked 119th in the QS World University Rankings 2027.",
  longDescription: "RMIT University was established in Melbourne in 1887 and has grown into a globally recognised university of technology, design, and enterprise. It holds the distinction of being the largest dual-sector university in the world, offering both TAFE and higher education programmes.\n\nRMIT's Melbourne Campuses:\n- City Campus (Melbourne CBD) — the main hub for most programmes\n- Brunswick Campus — specialising in design and creative arts\n- Bundoora Campus — home to technology and science programmes\n\nWith over 90,000 students from more than 194 countries, RMIT offers a dynamic and multicultural learning environment with strong industry connections. The university's RMIT Activator programme has allocated AUD 2.56 million to support over 140 startups since 2015.\n\nRMIT is particularly renowned for:\n- Fashion and Design — consistently ranked among the top globally\n- Engineering and Technology — deep industry ties with top engineering firms\n- Business — strong MBA and accounting programmes\n- Creative Industries — animation, architecture, and media arts\n\nStudents benefit from real-world learning through project-based curricula, industry placements, and RMIT's extensive network of employer partners spanning global leaders like Mercedes-Benz, BHP, Deloitte, and Microsoft.",
  studentLife: [
    "Recreation",
    "Art, Culture, and Entertainment",
    "Working While Studying",
    "World-Class Dining",
    "Sports at RMIT",
    "Student Clubs and Communities",
    "Campus Life",
    "Kirrip at RMIT"
  ],
  alumni: null,
  costOfLiving: {
    description: "Living in Melbourne as an RMIT student is an exciting experience. Melbourne is consistently rated one of the world's most liveable cities. Housing costs vary widely from on-campus accommodation to private rentals. Public transport via the Myki card covers trams, trains, and buses across the city.",
    inr: "3.30 L",
    usd: "USD 3,882",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 1.50 L" },
      { name: "Food & Groceries", value: "INR 0.80 L" },
      { name: "Books & Supplies", value: "INR 0.30 L" },
      { name: "Transportation", value: "INR 0.40 L" },
      { name: "Personal & Misc", value: "INR 0.30 L" }
    ]
  },
  placements: {
    description: "RMIT University offers comprehensive career development services through its Careers and Employability team. The university is deeply connected with industry — from global tech firms to creative agencies — and provides students with practical learning experiences through placements and industry projects.",
    services: [
      "Job Shop Assistance",
      "Industry Connections",
      "Career Advice and Support",
      "Global Opportunities",
      "Jobs On Campus",
      "Success Stories",
      "Accessibility and Support"
    ],
    recruiters: [
      "Mercedes-Benz",
      "BHP",
      "Deloitte",
      "Accenture",
      "ANZ",
      "NAB (National Australia Bank)",
      "L'Oréal",
      "Jacobs",
      "EY (Ernst & Young)",
      "Microsoft"
    ]
  },
  alumniPerks: [
    "30% Off National Gallery of Victoria Membership",
    "Alumni Business Directory listing",
    "Oxford Scholar Hotel Discounts (15% off food and beverage)",
    "Library Access — databases, e-journals, and physical collections",
    "New Alumni Pass — first-year post-graduation guidance",
    "Free Career Consultations with professional consultants",
    "Free Online Will Service"
  ],
  faqs: [
    { question: "What is RMIT University's ranking?", answer: "RMIT is ranked 119th in the QS World University Rankings 2027." },
    { question: "What are RMIT University fees for international PG students?", answer: "Fees vary by program. For 2027, the Master of Information Technology is A$47,040 per year (about ₹32 lakh) and the Master of Business Analytics and AI Strategy is A$50,880 per year (about ₹34 lakh), at ₹67 per Australian dollar." },
    { question: "What are RMIT University courses for UG students?", answer: "RMIT offers undergraduate programs in accounting, engineering, fashion and design, architecture, animation, computer science, business, nursing and more." },
    { question: "Where is the RMIT University campus?", answer: "RMIT's main campus is the City campus in Melbourne's CBD. It also has Brunswick and Bundoora campuses in Victoria." },
    { question: "When are RMIT's intakes?", answer: "Most postgraduate programs start in February or July; check your program page." },
    { question: "What are the English requirements at RMIT?", answer: "Most postgraduate programs ask for IELTS 6.5 overall with no band below 6.0, or an accepted equivalent." },
    { question: "Does RMIT University offer accommodation to international students?", answer: "RMIT can help you find accommodation, including student apartments near the City campus." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#119 in QS World University Rankings 2027"
};

const RMITPage = () => {
  return <UniversityDetailTemplate 
      uniData={rmitData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default RMITPage;
