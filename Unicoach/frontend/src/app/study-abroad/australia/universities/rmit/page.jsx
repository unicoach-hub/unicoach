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
  totalStudents: 91573,
  intlStudents: 18000,
  type: "PUBLIC",
  studentFacultyRatio: "22:1",
  acceptanceRate: "22%",
  accreditation: "TEQSA, CRICOS",
  avgCostOfLiving: "INR 3.30 L",
  logo: "https://logo.clearbit.com/rmit.edu.au",
  heroImage: "https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=1200",
  notification: "RMIT University is the largest dual-sector University in the world.",
  topCourses: [
    { name: "Accounting", count: 23 },
    { name: "Advertising", count: 3 },
    { name: "Aerospace Engineering", count: 9 },
    { name: "Animation", count: 2 },
    { name: "Architecture", count: 5 }
  ],
  featuredCourse: {
    name: "Master of Professional Accounting",
    duration: "24 Months",
    tuition: 26.80
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "FEB'2025", status: "Intake Open" },
    { name: "MAR'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "JUL'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "OCT'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band, with no individual component below 6.0 for most programmes." },
    { title: "TOEFL iBT Score", detail: "79+ minimum overall score for most postgraduate programmes." },
    { title: "Undergraduate Degree", detail: "Relevant bachelor's degree from a recognised university." },
    { title: "Work Experience", detail: "Some postgraduate programmes (e.g., MBA) may require 2+ years of relevant professional work experience." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "123" },
      { category: "Best National Schools - 2025", rank: "9" },
      { category: "Best World Ranking Schools - 2024", rank: "140" },
      { category: "Best World Ranking Schools - 2023", rank: "190" },
      { category: "Best World Ranking Schools - 2022", rank: "206" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "301 - 350" },
      { category: "Best Schools - 2022", rank: "301 - 350" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "209" },
      { category: "Best Schools - 2022", rank: "244" }
    ]
  },
  coursesFees: [
    { name: "Master of Professional Accounting", duration: "24 Months", tuition: 26.80 },
    { name: "Bachelor of Accounting and Bachelor of Commerce in Finance", duration: "48 Months", tuition: 24.70 },
    { name: "Bachelor of Accounting and Bachelor of Business in Management", duration: "48 Months", tuition: 24.70 },
    { name: "Bachelor of Accounting and Bachelor of Laws", duration: "60 Months", tuition: 24.70 },
    { name: "Bachelor of Accounting", duration: "36 Months", tuition: 24.70 },
    { name: "Bachelor of Accounting and Bachelor of Commerce in Economics", duration: "48 Months", tuition: 26.17 }
  ],
  description: "RMIT University, established in Melbourne in 1887, is a global university of technology, design, and enterprise — and the largest dual-sector university in the world. With over 91,573 students from 194+ countries, RMIT is QS-ranked #123 globally in 2025.",
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
  alumni: [
    { name: "Kate Torney", profession: "Business Leader and Former Journalist" },
    { name: "Jose Manuel Entrecanales", profession: "CEO of ACCIONA" }
  ],
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
      "Mercedes-Benz", "BHP", "Deloitte", "Accenture", "ANZ",
      "NAB (National Australia Bank)", "L'Oréal", "Jacobs", "EY (Ernst & Young)", "Microsoft"
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
    { question: "What is RMIT University's ranking?", answer: "RMIT is ranked #123 globally (up from #140 in 2024) and #9 nationally in Australia in the QS World University Rankings 2025." },
    { question: "What are RMIT University fees for international PG students?", answer: "Postgraduate tuition fees at RMIT typically range from INR 24.70 L to INR 26.80 L per year for international students depending on the programme." },
    { question: "What is the RMIT University application fee?", answer: "RMIT University does not charge a separate application fee for most programmes. Some specific programmes may have processing fees." },
    { question: "What are RMIT University courses for UG students?", answer: "RMIT offers UG programmes in accounting, engineering, fashion design, architecture, animation, computer science, business, nursing, and many more disciplines." },
    { question: "Where is the RMIT University campus?", answer: "RMIT's main campus is the City Campus in Melbourne's CBD. It also has Brunswick and Bundoora campuses in Victoria." },
    { question: "Where is the RMIT University Bundoora campus?", answer: "The Bundoora campus is located in Melbourne's northern suburbs and is home to RMIT's science and technology programmes." },
    { question: "What are RMIT University MBA fees for international students?", answer: "RMIT's MBA fees for international students are approximately INR 26–28 L per year." },
    { question: "What are RMIT University tuition fees for international students?", answer: "International student tuition fees range from approximately INR 12–28 L per year depending on the programme and level of study." },
    { question: "Does RMIT University offer scholarships for international students?", answer: "Yes, RMIT offers a range of scholarships including the RMIT International Excellence Scholarship, reducing fees by up to 50% for high-achieving international students." },
    { question: "What are RMIT University graduate programs?", answer: "Popular graduate programmes include Master of Professional Accounting, Master of Business Administration, Master of Engineering (various specialisations), and Master of Architecture." },
    { question: "Does RMIT University offer accommodation to international students?", answer: "Yes, RMIT provides accommodation options including on-campus student apartments at the City Campus and nearby managed residences, with priority for first-year international students." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ]
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
