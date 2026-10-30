import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const coventryData = {
  name: "Coventry University",
  location: "Coventry, West Midlands, UK",
  city: "Coventry",
  established: 1843,
  accreditation: "Association to Advance Collegiate Schools of Business (AACSB)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 2.00 L",
  type: "PUBLIC",
  logo: "/logos/verified-Coventry University.png",
  heroImage: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200",
  description: "Coventry University traces its history to the Coventry School of Design, founded in 1843, and became a university in 1992.\n\nIt is ranked 581 in the world in the QS World University Rankings 2027.\n\nThe main campus is in Coventry city centre. Popular areas of study include Engineering, Business, Health, Computing and Arts.\n\nMany postgraduate courses have several start dates a year (for example January, March, May, July, September and November), and the university provides support services for international students.",
  topCourses: [
    { name: "Accounting", count: 8 },
    { name: "Advertising", count: 2 },
    { name: "Aerospace Engineering", count: 6 },
    { name: "Animation", count: 4 },
    { name: "Architecture", count: 10 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAR'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Closed" },
    { name: "JUL'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL, PTE or another accepted test; the minimum score depends on the course. Check the course page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree in a relevant subject; the minimum grade (UK 2:1 or 2:2 equivalent) depends on the course." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "QS World University Rankings 2027", rank: "581" },
      { category: "QS World University Rankings 2025", rank: "=531" }
    ]
  },
  coursesFees: [
    { name: "MSc in Computer Science (2026-27, international fee)", duration: "Full-time", tuition: 25 }
  ],
  costOfLiving: {
    description: "Coventry University, located in the vibrant city of Coventry, offers a diverse and enriching experience for international students. The cost of living in Coventry is relatively moderate compared to other major UK cities. Students can expect to spend a significant portion of their budget on housing, books/supplies, transportation, and personal leisure.",
    inr: "9.40L",
    usd: "11059",
    breakdown: [
      { name: "Housing / Rent", value: "£450 - £650/mo" },
      { name: "Food & Personal", value: "£200 - £250/mo" },
      { name: "Books & Supplies", value: "£50 - £80/yr" },
      { name: "Local Travel", value: "£45 - £60/mo" }
    ]
  },
  placements: {
    description: "Coventry University offers comprehensive placement assistance for international students to help them secure employment opportunities both during and after their studies. The university's Career Services team provides personalized career counselling to students, guiding them through the job search process and helping them identify suitable career paths. Workshops and seminars are regularly organized to enhance students' employability skills, with topics ranging from resume writing to interview preparation.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Jaguar Land Rover", "Rolls-Royce", "Siemens", "Deloitte", "IBM",
      "EY (Ernst & Young)", "PwC", "Bosch", "Airbus", "NHS"
    ]
  },
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots",
    "Special Attractions"
  ],
  blogs: [
    { title: "How To Get Jobs In UK In 2025: Process, Eligibility & Visa", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "Part Time Job Vacancies in the United Kingdom 2025", readTime: "14 mins read", date: "Mar 15, 2025" },
    { title: "How to Get Job in UK from India in 2024: Student Guide", readTime: "11 mins read", date: "Mar 15, 2025" },
    { title: "List Of 5 Demanding Jobs In UK For 2024: Salary & Work Visa", readTime: "7 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs In UK for Indian Students 2025", readTime: "9 mins read", date: "Mar 15, 2025" },
    { title: "Best Internships in UK for International Students 2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
};

const CoventryPage = () => {
  return <UniversityDetailTemplate 
      uniData={coventryData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default CoventryPage;
