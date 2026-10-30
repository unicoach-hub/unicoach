import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const deakinData = {
  name: "Deakin University",
  country: "Australia",
  location: "Geelong, Victoria, Australia",
  city: "Geelong",
  established: 1974,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "18:1",
  acceptanceRate: null,
  accreditation: null,
  avgStudyCost: "INR 8.00 L",
  avgCostOfLiving: "INR 4.00 L",
  logo: "/logos/Deakin University.svg",
  heroImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200",
  topCourses: [
    { name: "Accounting", count: 23 },
    { name: "Advertising", count: 2 },
    { name: "Animal Husbandry", count: 1 },
    { name: "Animation", count: 7 },
    { name: "Anthropology", count: 1 }
  ],
  featuredCourse: {
    name: "Master of Business Analytics",
    duration: "See course page",
    tuition: 30
  },
  intakeDeadlines: [
    { name: "MAR'2026", status: "Intake Open" },
    { name: "JUL'2026", status: "Intake Open" },
    { name: "NOV'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "Varies by course. For example, the Master of Business Analytics asks for IELTS 6.5 overall with no band below 6.0." },
    { title: "Other English Tests", detail: "TOEFL iBT, PTE Academic and other tests are accepted; check the minimum score for your course." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree recognised as equivalent to an Australian bachelor's; some courses need a related discipline." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "227" }
    ]
  },
  coursesFees: [
    { name: "Master of Business Analytics", duration: "See course page", tuition: 30 }
  ],
  description: "Deakin University, established in 1974, is a public university headquartered in Geelong, Victoria, with campuses in Geelong, Melbourne (Burwood) and Warrnambool and a large online offering. It is ranked 227th in the QS World University Rankings 2027.",
  longDescription: "Deakin University has grown significantly since its founding in 1974 to become a leading institution known for innovative teaching and research. With a total student community of over 66,263, including 18,554 international students, Deakin is a vibrant and globally diverse university.\n\nDeakin's campuses are located across Victoria, including Geelong (Waurn Ponds and Waterfront) and Melbourne (Burwood and City), each equipped with state-of-the-art facilities:\n- Modern lecture halls and collaborative workspaces\n- Extensive libraries and digital learning platforms\n- Research centres and innovation labs\n- Sports and recreational facilities\n\nDeakin offers a wide range of programmes across business, health, technology, and education. The AACSB, EQUIS, and AMBA-accredited Business School is among the most prestigious in Australia.\n\nWith an acceptance rate of 65% and multiple intake periods throughout the year, Deakin welcomes international students with robust support services ensuring a smooth transition to life in Australia.",
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
    description: "Living in Geelong as an international student at Deakin University involves several key expenses. Geelong is relatively affordable compared to Sydney or Melbourne, with housing options ranging from on-campus accommodation to private rentals. Transportation is moderate with public transport being convenient.",
    inr: "9.00 L",
    usd: "USD 10,588",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.50 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 1.10 L" },
      { name: "Personal & Misc", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "Deakin University provides extensive placement assistance for international students. The university offers career counselling services, workshops on resume writing, interview skills, and networking. Job fairs and networking events are organised throughout the year, connecting students with major Australian employers.",
    services: [
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Telstra Corporation Ltd.",
      "National Australia Bank",
      "IBM Australia",
      "Accenture Australia",
      "ANZ Banking Group",
      "PwC Australia",
      "Westpac Banking Corporation",
      "Deloitte Australia",
      "Commonwealth Bank of Australia",
      "KPMG Australia"
    ]
  },
  faqs: [
    { question: "What is Deakin University's ranking?", answer: "Deakin is ranked 227th in the QS World University Rankings 2027." },
    { question: "How do I get admission to Deakin University?", answer: "International applicants need a recognised bachelor's degree, an accepted English test score (for example IELTS 6.5 with no band below 6.0 for the Master of Business Analytics), and an application through Deakin's online portal." },
    { question: "Is Deakin University public or private?", answer: "Deakin University is a public university." },
    { question: "How much is the Master of Business Analytics at Deakin?", answer: "The 2026 international fee is A$44,200 per year (about ₹30 lakh at ₹67 per Australian dollar). It is taught at the Melbourne Burwood campus and online, with March, July and November intakes." },
    { question: "When are Deakin's intakes?", answer: "Deakin teaches in trimesters, so many courses start in March, July and November. Check your course page for its intakes." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#227 in QS World University Rankings 2027"
};

const DeakinPage = () => {
  return <UniversityDetailTemplate 
      uniData={deakinData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default DeakinPage;
