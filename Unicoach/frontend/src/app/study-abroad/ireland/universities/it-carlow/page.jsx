import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const itCarlowData = {
  name: "Institute of Technology - Carlow",
  country: "Ireland",
  location: "Carlow, Ulster, Ireland",
  city: "Carlow",
  established: 1970,
  totalStudents: 10650,
  intlStudents: 1598,
  type: "PUBLIC",
  studentFacultyRatio: "15:1",
  acceptanceRate: "75%",
  accreditation: "Engineering Council (EC)",
  avgStudyCost: "INR 0.50 L",
  avgCostOfLiving: "INR 0.25 L",
  logo: "https://logo.clearbit.com/itcarlow.ie",
  heroImage: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200",
  topCourses: [
    { name: "Business Administration", count: 1 },
    { name: "Business Management", count: 1 },
    { name: "Data Science", count: 1 },
    { name: "Graphic and Design Studies", count: 1 },
    { name: "Information technology", count: 1 }
  ],
  featuredCourse: {
    name: "Master of Business",
    duration: "12 Months",
    tuition: 11.22
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 minimum overall band required for postgraduate programmes." },
    { title: "TOEFL iBT Score", detail: "79+ minimum score required for admission to most programmes." },
    { title: "Undergraduate Degree", detail: "Honours Bachelor's degree (Level 8) or equivalent qualification." }
  ],
  rankings: {
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2022", rank: "18" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2022", rank: "4901" }
    ]
  },
  coursesFees: [
    { name: "Master of Business", duration: "12 Months", tuition: 11.22 },
    { name: "MSc in Data Science", duration: "12 Months", tuition: 10.50 },
    { name: "BSc in Software Development", duration: "48 Months", tuition: 9.80 },
    { name: "BA in Graphic Design", duration: "36 Months", tuition: 9.00 }
  ],
  description: "Founded in 1970, the Institute of Technology Carlow is a leading regional institution in Ireland offering practical, career-focused programmes in engineering, business, technology, and the arts. Accredited by the Engineering Council, it delivers industry-relevant education to a diverse student community.",
  longDescription: "Founded in 1970, the Institute of Technology Carlow has grown to become a leading institution in Ireland's higher education landscape. It serves a total student population of 10,650, including 1,598 international students from across the globe.\n\nThe campus is located in the heart of Carlow, a vibrant town with a strong student community and excellent connectivity to Dublin and other major cities. Our state-of-the-art facilities are designed to provide a superior learning experience.\n\nKey campus features include:\n- Modern engineering and science laboratories\n- Business and computing resource centres\n- Student accommodation and support services\n- Sports facilities and recreational areas\n\nWe offer a range of popular programmes in engineering, business, technology, and the arts, all designed to equip you for success in your chosen field. With an acceptance rate of 75% and multiple intake periods, we welcome students from all backgrounds.\n\nAccredited by the Engineering Council (EC), our commitment to excellence is recognised by industry leaders worldwide.",
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
    { name: "John Murphy", profession: "Entrepreneur" },
    { name: "Sarah O'Connor", profession: "Scientist" },
    { name: "Michael Byrne", profession: "Politician" },
    { name: "Aisling Doyle", profession: "Artist" }
  ],
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
      "Internships and Placement Support",
      "OPT and CPT Guidance"
    ],
    recruiters: [
      "IBM", "Intel Corporation", "Boston Scientific", "Eir", "Accenture",
      "Medtronic", "Pfizer", "SAP", "Ericsson", "Johnson & Johnson"
    ]
  },
  faqs: [
    { question: "Is Institute of Technology Carlow a good choice for international students?", answer: "Yes, IT Carlow is a welcoming institution with dedicated international student support, affordable fees, and strong industry connections." },
    { question: "What programmes are offered at IT Carlow?", answer: "IT Carlow offers programmes in engineering, business administration, data science, graphic design, and information technology." },
    { question: "What is the acceptance rate at IT Carlow?", answer: "The acceptance rate is approximately 75%, making it accessible to a wide range of qualified applicants." },
    { question: "What are the English language requirements at IT Carlow?", answer: "Most programmes require IELTS 6.0 or TOEFL iBT 79+ for international students." },
    { question: "Does IT Carlow offer scholarships to international students?", answer: "Yes, IT Carlow offers merit-based scholarships and tuition reductions for high-achieving international students." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
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
