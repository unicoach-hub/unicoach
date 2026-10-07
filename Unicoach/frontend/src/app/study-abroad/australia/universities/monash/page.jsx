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
  totalStudents: 65000,
  intlStudents: 19076,
  type: "PUBLIC",
  studentFacultyRatio: "22:1",
  acceptanceRate: "40%",
  accreditation: "AACSB, EQUIS, AMBA",
  avgCostOfLiving: "INR 17.00 L",
  logo: "https://logo.clearbit.com/monash.edu",
  heroImage: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200",
  topCourses: [
    { name: "Accounting", count: 108 },
    { name: "Anthropology", count: 78 },
    { name: "Archaeology", count: 40 },
    { name: "Architecture", count: 3 },
    { name: "Artificial Intelligence / Machine Learning", count: 13 }
  ],
  featuredCourse: {
    name: "Master of Accounting",
    duration: "12 Months",
    tuition: 29.01
  },
  intakeDeadlines: [
    { name: "FEB'2025", status: "Closed" },
    { name: "JUN'2025", status: "Intake Open" },
    { name: "JUL'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Closed" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band, with no individual component below 6.0 for most programmes." },
    { title: "TOEFL iBT Score", detail: "90+ minimum overall score for most postgraduate programmes." },
    { title: "Application Fee", detail: "INR 5,500 for both UG and PG international students (fee waivable through UniCoach)." },
    { title: "Undergraduate Degree", detail: "Australian bachelor's equivalent degree with a minimum credit (65%) average." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "37" },
      { category: "Best National Schools - 2025", rank: "4" },
      { category: "Best World Ranking Schools - 2024", rank: "37 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "57" },
      { category: "Best World Ranking Schools - 2022", rank: "55" },
      { category: "Best World Ranking Schools - 2020", rank: "58" }
    ],
    "Times Higher Education": [
      { category: "Best National Schools - 2024", rank: "2 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "44" },
      { category: "Best University Ranking Schools - 2020", rank: "75" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "37" }
    ]
  },
  coursesFees: [
    { name: "Master of Accounting", duration: "12 Months", tuition: 29.01 },
    { name: "Master of Professional Accounting", duration: "24 Months", tuition: 29.01 },
    { name: "Master of Business Law / Master of Professional Accounting", duration: "30 Months", tuition: 29.01 },
    { name: "BA in Global Asia and Bachelor of Business in Accounting", duration: "48 Months", tuition: 29.12 },
    { name: "Bachelor of Commerce in Accounting and Bachelor of Laws", duration: "48 Months", tuition: 30.86 },
    { name: "Bachelor of Accounting", duration: "36 Months", tuition: 29.12 }
  ],
  description: "Monash University, named after the distinguished Sir John Monash, is Australia's largest university with 8 campuses across 3 continents. It holds QS World Ranking #37 (2025) and boasts partnerships with over 115 universities globally.",
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
  alumni: [
    { name: "Annette Carey", profession: "CEO, Linfox Armaguard" },
    { name: "Brendon Gale", profession: "CEO of Richmond Football Club" },
    { name: "H.E. Saleumxay Kommasith", profession: "Minister of Foreign Affairs, Lao PDR" },
    { name: "Justice Anne Ferguson", profession: "Chief Justice of the Supreme Court of Victoria" },
    { name: "Dr Susan Carland", profession: "TV host, academic, writer and social commentator" }
  ],
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
      "Abbott Australia", "7-Eleven Australia", "ABB Australia", "AbbVie Australia",
      "Accenture Australia", "AECOM", "ACT Government", "Adidas Australia",
      "Adobe Australia", "ACH Group"
    ]
  },
  faqs: [
    { question: "What is Monash University's QS ranking?", answer: "Monash University is ranked #37 globally and #4 nationally in Australia in the QS World University Rankings 2025." },
    { question: "What are Monash University fees for UG students?", answer: "Undergraduate tuition fees for international students typically range from INR 29.12 L per year, depending on the course." },
    { question: "Where is the Monash University campus located?", answer: "Monash has campuses in Clayton, Caulfield, Peninsula, Parkville, and Gippsland in Australia, plus international campuses in Malaysia and Indonesia." },
    { question: "Which are the top Monash University courses?", answer: "Top courses include Accounting, Pharmacy, Computer Science, Engineering, Business Administration, Law, Medicine, and Master of Professional Accounting." },
    { question: "What is the Monash University MBA fees?", answer: "The MBA at Monash Business School costs approximately INR 29–31 L per year for international students." },
    { question: "What are Monash University accommodation services?", answer: "Monash offers a variety of accommodation options including on-campus residential colleges, off-campus housing, and homestay options for international students." },
    { question: "What are Monash University scholarships for international students?", answer: "Monash offers numerous scholarships including the Monash International Merit Scholarship, worth up to 50% of tuition fees for top international students." },
    { question: "What are Monash University fees for international students?", answer: "Postgraduate fees typically range from INR 17–35 L per year depending on the programme. INR 17 Lakh is the average first-year tuition for international Masters students." },
    { question: "What are the top postgraduate courses at Monash?", answer: "Top postgraduate courses include Master of Professional Accounting, MBA, Master of Engineering, and Master of Data Science." },
    { question: "What are the Monash University admissions criteria?", answer: "International students require an equivalent bachelor's degree with credit average (65%+), IELTS 6.5+ or equivalent, and relevant academic prerequisites for specialised programmes." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  notification: "Monash University has partnerships with over 115 universities around the world. This extensive network opens doors for international students."
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
