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
  totalStudents: 66263,
  intlStudents: 18554,
  type: "PUBLIC",
  studentFacultyRatio: "18:1",
  acceptanceRate: "65%",
  accreditation: "AACSB, EQUIS, AMBA",
  avgStudyCost: "INR 8.00 L",
  avgCostOfLiving: "INR 4.00 L",
  logo: "https://logo.clearbit.com/deakin.edu.au",
  heroImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200",
  topCourses: [
    { name: "Accounting", count: 23 },
    { name: "Advertising", count: 2 },
    { name: "Animal Husbandry", count: 1 },
    { name: "Animation", count: 7 },
    { name: "Anthropology", count: 1 }
  ],
  featuredCourse: {
    name: "Master of Business Administration (International)",
    duration: "24 Months",
    tuition: 26.60
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "FEB'2025", status: "Closed" },
    { name: "MAR'2025", status: "Closed" },
    { name: "JUN'2025", status: "Intake Open" },
    { name: "JUL'2025", status: "Intake Open" },
    { name: "OCT'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 minimum overall band, with no individual component below 6.0 for most programmes." },
    { title: "TOEFL iBT Score", detail: "79+ minimum overall score with minimum of 20 in writing for most programmes." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree from a recognised university with minimum credit average (65%)." }
  ],
  rankings: {
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "217" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2022", rank: "221" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "197" },
      { category: "Best World Ranking Schools - 2024", rank: "197 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "266" },
      { category: "Best World Ranking Schools - 2022", rank: "283" }
    ],
    "Times Higher Education": [
      { category: "Best National Schools - 2024", rank: "16 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "251 - 300" },
      { category: "Best World Ranking Schools - 2022", rank: "251 - 300" }
    ],
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2022", rank: "13" }
    ]
  },
  coursesFees: [
    { name: "Master of Business Administration (International)", duration: "24 Months", tuition: 26.60 },
    { name: "Master of Professional Accounting in Artificial Intelligence", duration: "24 Months", tuition: 25.29 },
    { name: "Master of Professional Accounting in Business Analytics", duration: "24 Months", tuition: 25.29 },
    { name: "Master of Finance in Accounting", duration: "24 Months", tuition: 25.29 },
    { name: "Master of Business Analytics in Accounting", duration: "24 Months", tuition: 23.54 },
    { name: "Master of Information Systems in Accounting", duration: "24 Months", tuition: 23.54 }
  ],
  description: "Deakin University, established in 1974 in Geelong, Victoria, is one of Australia's most innovative universities. Accredited by AACSB, EQUIS, and AMBA — the triple crown of business education — Deakin is internationally recognised for its flexible, student-centred approach to learning.",
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
  alumni: [
    { name: "Julia Gillard", profession: "Former Prime Minister of Australia" },
    { name: "Sally Capp", profession: "Lord Mayor of Melbourne" },
    { name: "Tim Flannery", profession: "Environmental Scientist" },
    { name: "Jane Lu", profession: "Entrepreneur" },
    { name: "Cate Blanchett", profession: "Actress" }
  ],
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
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Telstra Corporation Ltd.", "National Australia Bank", "IBM Australia", "Accenture Australia",
      "ANZ Banking Group", "PwC Australia", "Westpac Banking Corporation", "Deloitte Australia",
      "Commonwealth Bank of Australia", "KPMG Australia"
    ]
  },
  faqs: [
    { question: "Is Deakin University a good university?", answer: "Yes, Deakin is ranked #197 in the QS World University Rankings 2025 and holds the prestigious triple accreditation — AACSB, EQUIS, and AMBA — for its Business School." },
    { question: "How do I get admission to Deakin University?", answer: "International applicants need to provide academic transcripts, proof of English proficiency (IELTS 6.0+ or equivalent), and apply through the Deakin online portal." },
    { question: "Is Deakin University public or private?", answer: "Deakin University is a public research university funded by the Australian government." },
    { question: "Why choose Deakin University?", answer: "Deakin offers triple-accredited business programmes, innovative CloudDeakin learning platform, flexible study options, and excellent graduate employment outcomes." },
    { question: "Is Deakin University good for international students?", answer: "Yes, with over 18,554 international students, Deakin has a dedicated International Student Services team providing comprehensive support from arrival to graduation." },
    { question: "What is the ranking of Deakin University?", answer: "Deakin is ranked #197 globally in the QS World University Rankings 2025 and #13 nationally by Webometrics." },
    { question: "What is the pass rate for Deakin University?", answer: "Deakin has high completion and graduate employability rates, with strong outcomes particularly in business, health, and technology disciplines." },
    { question: "How many students are at Deakin University?", answer: "Deakin has approximately 66,263 enrolled students, of whom 18,554 are international students." },
    { question: "How hard is it to get into Deakin University?", answer: "With an acceptance rate of 65%, Deakin is relatively accessible for qualified international applicants." },
    { question: "Is Deakin University accredited?", answer: "Yes, Deakin holds AACSB, EQUIS, and AMBA triple accreditation for its Business School, and is registered with TEQSA as a provider of higher education in Australia." },
    { question: "Who are the notable alumni of Deakin University?", answer: "Notable alumni include former Prime Minister Julia Gillard, Lord Mayor of Melbourne Sally Capp, environmental scientist Tim Flannery, entrepreneur Jane Lu, and actress Cate Blanchett." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ]
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
