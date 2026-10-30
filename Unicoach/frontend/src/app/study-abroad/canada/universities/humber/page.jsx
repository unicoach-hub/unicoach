import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const humberData = {
  name: "Humber Polytechnic - North",
  country: "Canada",
  location: "Toronto, Ontario, Canada",
  city: "Toronto",
  established: 1967,
  type: "PUBLIC",
  accreditation: "Public polytechnic (legal name: Humber College Institute of Technology and Advanced Learning), Ontario",
  avgStudyCost: null,
  avgCostOfLiving: null,
  logo: "/logos/verified-Humber Polytechnic.png",
  heroImage: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200",
  topCourses: [
    { name: "Accounting", count: 4 },
    { name: "Advertising", count: 6 },
    { name: "Animation", count: 1 },
    { name: "Architecture", count: 3 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Closed" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.0 - 6.5 minimum band required for admission, with no band less than 5.5 - 6.0." },
    { title: "TOEFL iBT Score", detail: "80+ minimum cutoff required for English proficiency verification." },
    { title: "Academic Background", detail: "Secondary school graduation or post-secondary degree/diploma relevant to the chosen course." }
  ],
  rankings: {
    "Webometrics - National": [
      { category: "Best University Ranking Schools - 2023", rank: "79" },
      { category: "Best University Ranking Schools - 2022", rank: "74" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "6214" },
      { category: "Best World Ranking Schools - 2022", rank: "5668" }
    ]
  },
  coursesFees: [],
  description: "Humber Polytechnic (known as Humber College until 2024) is a public college founded in 1967. Its North Campus is in Etobicoke, in north-west Toronto, and it offers diplomas, graduate certificates and bachelor's degrees with a focus on practical, industry-linked training.",
  longDescription: "Humber Polytechnic (known as Humber College until 2024) is a public college founded in 1967. Its North Campus is in Etobicoke, in north-west Toronto, and it offers diplomas, graduate certificates and bachelor's degrees with a focus on practical, industry-linked training.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots"
  ],
  // Alumni removed until each name can be checked against a reliable source
  alumni: null,
  costOfLiving: {
    description: "Living in Toronto as an international student attending Humber Polytechnic involves various expenses. Housing is typically the largest cost, with options ranging from on-campus residences to private rentals. Books and supplies are essential for academic success, while transportation costs can vary depending on the proximity of your accommodation to the college. Personal expenses include groceries, clothing, and entertainment, which are necessary for a balanced lifestyle. Miscellaneous expenses cover unforeseen costs such as healthcare or emergency travel. Overall, the cost of living in Toronto requires careful budgeting to ensure a comfortable and enriching experience.",
    inr: "8.70 L",
    usd: "USD 10,235",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.80 L" },
      { name: "Food & Groceries", value: "INR 1.80 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 0.50 L" },
      { name: "Personal Expenses", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "Humber Polytechnic provides comprehensive placement assistance to international students to help them transition into the workforce. The Career Centre offers career counselling services to assist students in exploring career options, developing job search strategies, and improving their resumes and interview skills. Workshops and seminars are regularly organized on topics such as networking, personal branding, and job search techniques. Recent examples include a resume writing workshop, a LinkedIn networking seminar, and a mock interview event.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Manulife", "Sun Life Financial", "CGI Inc.", "Google", "RBC", "IBM"
    ]
  },
  faqs: [
    { question: "Is Humber Polytechnic a good college?", answer: "Humber is a large public polytechnic in Toronto, known for career-focused programs and links with industry." },
    { question: "How do I get admission to Humber Polytechnic?", answer: "Admission requires academic transcripts, English test scores and any program-specific prerequisites. Requirements vary by program." },
    { question: "Is Humber Polytechnic public or private?", answer: "Humber Polytechnic is a public college in Toronto, Ontario. It was renamed from Humber College in 2024; its legal name is Humber College Institute of Technology and Advanced Learning." },
    { question: "Why choose Humber Polytechnic?", answer: "It offers hands-on learning, labs and work-integrated learning options, at campuses in Toronto." },
    { question: "Is Humber Polytechnic good for international students?", answer: "Humber has a large international student community and provides support services for international students." },
    { question: "What is the ranking of Humber Polytechnic?", answer: "Colleges such as Humber are not ranked by QS. Webometrics placed Humber #79 in Canada and #6214 globally in 2023." },
    { question: "Is Humber Polytechnic recognised?", answer: "Yes. Humber is a public college under Ontario law. Some programs also hold accreditation from professional bodies; check the program page." },
  ],
  blogs: [
    { title: "Steps to get a job in Canada from India", readTime: "19 mins read", date: "Mar 15, 2025" },
    { title: "Part Time Jobs in Canada for Indian Graduates 2024: Simplified!", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "CPA Canada Course: Overview, Process, Top Colleges & Scope For Jobs", readTime: "10 mins read", date: "Mar 15, 2025" },
    { title: "Top Highest-Paying Jobs in Canada in 2025 for International Students", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Average Salary In Canada 2024 for Indian Students", readTime: "9 mins read", date: "Mar 15, 2025" },
    { title: "List of Occupations In Demand In Canada For 2024: Top 10 High-Paying Jobs with Promising Salary", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const HumberPage = () => {
  return <UniversityDetailTemplate 
      uniData={humberData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default HumberPage;
