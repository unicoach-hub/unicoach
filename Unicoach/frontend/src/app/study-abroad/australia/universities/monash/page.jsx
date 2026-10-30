import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const monashData = {
  name: "Monash University",
  country: "Australia",
  location: "Melbourne, Victoria, Australia",
  city: "Melbourne",
  established: 1958,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "22:1",
  acceptanceRate: null,
  accreditation: null,
  avgCostOfLiving: "INR 17.00 L",
  logo: "/logos/Monash University.webp",
  heroImage: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200",
  topCourses: [
    { name: "Accounting", count: 108 },
    { name: "Anthropology", count: 78 },
    { name: "Archaeology", count: 40 },
    { name: "Architecture", count: 3 },
    { name: "Artificial Intelligence / Machine Learning", count: 13 }
  ],
  featuredCourse: {
    name: "Master of Business Analytics",
    duration: "See course page",
    tuition: 42
  },
  intakeDeadlines: [
    { name: "FEB'2026", status: "Intake Open" },
    { name: "JUL'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "Most postgraduate courses ask for IELTS 6.5 overall with no band below 6.0; some ask for more." },
    { title: "Application Fee", detail: "INR 5,500 for both UG and PG international students (fee waivable through UniCoach)." },
    { title: "Other English Tests", detail: "TOEFL iBT, PTE Academic and other tests are accepted; check the minimum score for your course." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree recognised as equivalent to an Australian bachelor's; the required grade varies by course." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "31" }
    ]
  },
  coursesFees: [
    { name: "Master of Business Analytics", duration: "See course page", tuition: 42 }
  ],
  description: "Monash University, established in 1958 and named after Sir John Monash, is a public research university based in Melbourne (main campus Clayton), with campuses in Malaysia and Indonesia. It is ranked 31st in the QS World University Rankings 2027 and runs the IITB-Monash Research Academy in Mumbai.",
  longDescription: "Monash University, established in 1958 in Melbourne, has grown to become Australia's largest university and one of the world's leading research institutions. With 65,000 students including 19,076 international students, Monash is a truly global university.\n\nCampuses in Australia:\n- Clayton (main campus)\n- Caulfield\n- Peninsula\n- Parkville\n- Gippsland (includes Berwick campus)\n- City (Melbourne CBD)\n\nGlobal Campuses:\n- Malaysia (Sunway campus)\n- Indonesia\n\nMonash holds AACSB, EQUIS, and AMBA triple accreditation for its Business School — placing it in the world's top 1% of business schools. The university has established the IITB-Monash Research Academy in Mumbai, fostering deep research connections with India.\n\nWith partnerships with over 115 universities worldwide and a comprehensive study abroad programme, Monash offers unparalleled global opportunities for students.",
  studentLife: [
    "Study Support",
    "Technology Services",
    "Financial Assistance",
    "Health Services",
    "Sport at Monash",
    "Student Clubs and Societies",
    "Accommodation",
    "Safety and Security"
  ],
  alumni: null,
  costOfLiving: {
    description: "Melbourne is Australia's cultural capital and one of the world's most liveable cities. International students should budget for housing (the largest expense), food, transportation, and personal expenses. Various accommodation options are available ranging from on-campus residences to private rentals.",
    inr: "17.00 L",
    usd: "USD 20,000",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 8.50 L" },
      { name: "Food & Groceries", value: "INR 3.50 L" },
      { name: "Books & Supplies", value: "INR 1.00 L" },
      { name: "Transportation", value: "INR 2.00 L" },
      { name: "Personal & Misc", value: "INR 2.00 L" }
    ]
  },
  placements: {
    description: "Monash University provides world-class placement assistance through a dedicated Careers and Employability team. Services include personalised career guidance, industry partnership programmes, networking opportunities with global employers, and access to Monash's extensive alumni network across 175 countries.",
    services: [
      "Personalised Guidance",
      "Networking Opportunities",
      "Industry Partnerships",
      "Global Opportunities",
      "Comprehensive Support Services",
      "Job Search Resources",
      "Skill Development Workshops",
      "Alumni Network"
    ],
    recruiters: [
      "Abbott Australia",
      "7-Eleven Australia",
      "ABB Australia",
      "AbbVie Australia",
      "Accenture Australia",
      "AECOM",
      "ACT Government",
      "Adidas Australia",
      "Adobe Australia",
      "ACH Group"
    ]
  },
  faqs: [
    { question: "What is Monash University's QS ranking?", answer: "Monash University is ranked 31st in the QS World University Rankings 2027, fifth among Australian universities." },
    { question: "Where are Monash University's campuses?", answer: "In Australia, Monash has campuses at Clayton, Caulfield, Peninsula and Parkville in Melbourne. It also has campuses in Malaysia and Indonesia." },
    { question: "How much is the Master of Business Analytics at Monash?", answer: "The international fee is A$62,140 per year for 2027 (about ₹42 lakh at ₹67 per Australian dollar), with a February intake at Clayton." },
    { question: "What are Monash University fees for international students?", answer: "Fees vary by course; check the course page on monash.edu for the current international fee." },
    { question: "What are Monash University scholarships for international students?", answer: "Monash offers scholarships for international students, such as the Monash International Merit Scholarship. Check amounts and eligibility on monash.edu." },
    { question: "What are Monash University accommodation services?", answer: "Monash offers on-campus residences and help finding off-campus housing." },
    { question: "What are the Monash University admissions criteria?", answer: "International students need a recognised bachelor's degree, an accepted English test score (most postgraduate courses ask for IELTS 6.5 with no band below 6.0), and any course-specific prerequisites." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  notification: "Monash University has partnerships with over 115 universities around the world. This extensive network opens doors for international students.",
  rank: "#31 in QS World University Rankings 2027"
};

const MonashPage = () => {
  return <UniversityDetailTemplate 
      uniData={monashData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default MonashPage;
