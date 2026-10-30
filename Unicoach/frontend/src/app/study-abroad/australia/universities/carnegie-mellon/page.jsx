import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const carnegieData = {
  name: "Carnegie Mellon University - Australia",
  country: "Australia",
  location: "Adelaide, South Australia, Australia",
  city: "Adelaide",
  established: 2006,
  totalStudents: null,
  intlStudents: null,
  type: "PRIVATE",
  studentFacultyRatio: null,
  acceptanceRate: null,
  accreditation: "TEQSA (Tertiary Education Quality and Standards Agency)",
  avgStudyCost: "INR 0.80 L",
  avgCostOfLiving: "INR 0.40 L",
  logo: "/logos/Carnegie_Mellon_University.webp",
  heroImage: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200",
  topCourses: [
    { name: "Business Administration", count: 1 },
    { name: "Information Systems", count: 1 },
    { name: "Management", count: 2 }
  ],
  featuredCourse: null,
  intakeDeadlines: null,
  requirements: null,
  rankings: null,
  coursesFees: null,
  description: "Carnegie Mellon University Australia operated in Adelaide's Torrens Building (Victoria Square) from 2006, offering CMU master's degrees in information technology and public policy. In June 2022 it announced it would close and stop admitting new students, so you cannot apply to this campus now.",
  longDescription: "Carnegie Mellon University Australia was a branch campus of Carnegie Mellon University (Pittsburgh, USA) in Adelaide, South Australia. It opened in 2006 in the Torrens Building on Victoria Square and offered the Master of Science in Information Technology and Management and the Master of Science in Public Policy and Management.\n\nIn June 2022 the campus announced it would close. Students already enrolled could finish their degrees, but no new students are admitted. If you are interested in Carnegie Mellon, look at programmes on its Pittsburgh campus, or at universities in Adelaide such as Adelaide University and Flinders University.",
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
    description: "Adelaide is one of Australia's most affordable major cities, making it an excellent choice for international students. Housing ranges from on-campus accommodation to private rentals. The city's efficient public transport system keeps transportation costs reasonable.",
    inr: "10.68 L",
    usd: "USD 12,565",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 5.00 L" },
      { name: "Food & Groceries", value: "INR 2.00 L" },
      { name: "Books & Supplies", value: "INR 0.80 L" },
      { name: "Transportation", value: "INR 1.50 L" },
      { name: "Personal & Misc", value: "INR 1.38 L" }
    ]
  },
  placements: {
    description: "CMU-Australia provides comprehensive placement assistance through a dedicated Career Services department. Individual career counselling sessions, workshops on job search, resume writing, interview techniques, and networking are provided. Recent workshops include 'Effective Networking Strategies' and 'LinkedIn for Job Search'.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Google",
      "Microsoft",
      "Deloitte",
      "Ernst & Young",
      "Accenture",
      "Amazon",
      "IBM",
      "PwC Australia",
      "Goldman Sachs",
      "Cisco Systems"
    ]
  },
  faqs: [
    { question: "Can I still apply to Carnegie Mellon University Australia?", answer: "No. The Adelaide campus announced in June 2022 that it would close and it no longer admits new students." },
    { question: "What did CMU Australia offer?", answer: "It offered Carnegie Mellon master's degrees in Information Technology and Management and in Public Policy and Management, taught in Adelaide." },
    { question: "Where can I study Carnegie Mellon's programmes now?", answer: "Carnegie Mellon's degrees are offered at its main campus in Pittsburgh, USA. Check cmu.edu for current programmes and fees." },
    { question: "Which universities in Adelaide can I consider instead?", answer: "Adelaide University (ranked 79th in the QS World University Rankings 2027) and Flinders University (374th) are public universities in Adelaide." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  rank: "Campus closed: no longer admitting new students"
};

const CarnegiePage = () => {
  return <UniversityDetailTemplate 
      uniData={carnegieData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default CarnegiePage;
