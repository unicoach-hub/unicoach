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
  established: 1900,
  totalStudents: 7074,
  intlStudents: 264,
  type: "PRIVATE",
  studentFacultyRatio: "15:1",
  acceptanceRate: "25%",
  accreditation: "TEQSA (Tertiary Education Quality and Standards Agency)",
  avgStudyCost: "INR 0.80 L",
  avgCostOfLiving: "INR 0.40 L",
  logo: "https://logo.clearbit.com/cmu.edu",
  heroImage: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200",
  topCourses: [
    { name: "Business Administration", count: 1 },
    { name: "Information Systems", count: 1 },
    { name: "Management", count: 2 }
  ],
  featuredCourse: {
    name: "Masters of Business Administration",
    duration: "24 Months",
    tuition: 41.44
  },
  intakeDeadlines: [
    { name: "MAR'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "7.0+ minimum overall band, with no individual component below 6.5." },
    { title: "TOEFL iBT Score", detail: "100+ minimum overall score as per Carnegie Mellon's global admission standards." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree from a recognised university; STEM or business background preferred for most programmes." },
    { title: "GRE / GMAT", detail: "GRE or GMAT scores required for most graduate programmes." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2023 (CMU Global)", rank: "52" },
      { category: "Best World Ranking Schools - 2017 (CMU Global)", rank: "58" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023 (CMU Global)", rank: "28" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023 (CMU Global)", rank: "118" }
    ]
  },
  coursesFees: [
    { name: "Masters of Business Administration", duration: "24 Months", tuition: 41.44 },
    { name: "Master of Science in Information Technology Management", duration: "12 Months", tuition: 38.00 },
    { name: "Master of Science in Public Policy and Management", duration: "12 Months", tuition: 36.00 },
    { name: "Master of Science in Software Engineering", duration: "12 Months", tuition: 38.00 }
  ],
  description: "Carnegie Mellon University - Australia is the Adelaide campus of the world-renowned Carnegie Mellon University (Pittsburgh, USA). It focuses on technology, management, and policy programmes, bringing CMU's globally recognised curriculum to Australia.",
  longDescription: "Carnegie Mellon University - Australia (CMU-Australia) was established in Adelaide as a branch campus of the prestigious Carnegie Mellon University, founded in 1900 in Pittsburgh, USA — consistently ranked among the world's top institutions.\n\nThe Adelaide campus offers a focused portfolio of graduate programmes aligned with CMU's strengths in technology and management:\n- Master of Information Technology Management\n- Master of Science in Public Policy and Management\n- Master of Science in Software Engineering\n- Master of Business Administration\n\nKey campus facilities include:\n- Modern classrooms equipped with the latest technology\n- Collaborative workspaces for group projects\n- Research labs for hands-on learning\n- Access to CMU's global digital resources and libraries\n\nWith an intimate class size and a student-to-faculty ratio of 15:1, CMU-Australia provides a highly personalised and rigorous academic experience. The small international student cohort (264 students) ensures close mentoring and strong alumni connections with CMU's global network of over 117,000 alumni across 150+ countries.\n\nCMU-Australia is accredited by TEQSA (Tertiary Education Quality and Standards Agency) and also by the Middle States Commission on Higher Education — the same body that accredits the main Pittsburgh campus.",
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
    { name: "Jane Smith", profession: "Entrepreneur" },
    { name: "John Doe", profession: "Scientist" },
    { name: "Emily Johnson", profession: "Artist" },
    { name: "David Lee", profession: "Politician" }
  ],
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
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Google", "Microsoft", "Deloitte", "Ernst & Young", "Accenture",
      "Amazon", "IBM", "PwC Australia", "Goldman Sachs", "Cisco Systems"
    ]
  },
  faqs: [
    { question: "Is Carnegie Mellon University - Australia a good university?", answer: "Yes, CMU-Australia brings the globally renowned Carnegie Mellon curriculum to Adelaide. CMU is ranked #52 globally by QS (2023) and is particularly renowned for computer science and technology management." },
    { question: "How do I get admission to Carnegie Mellon University - Australia?", answer: "Applicants must hold a relevant bachelor's degree, submit GRE/GMAT scores, provide proof of English proficiency (IELTS 7.0+), and submit an SOP and academic references through CMU's online portal." },
    { question: "Is Carnegie Mellon University - Australia public or private?", answer: "CMU-Australia is a private not-for-profit university, being a campus of Carnegie Mellon University based in Pittsburgh, USA." },
    { question: "Why choose Carnegie Mellon University - Australia?", answer: "Students gain access to CMU's world-class curriculum, prestigious degree, global alumni network, and the personal attention of a small campus environment in Adelaide's affordable and liveable city." },
    { question: "Is CMU Australia good for international students?", answer: "Yes, CMU-Australia offers excellent support for international students including orientation, visa guidance, and career services, with a close-knit campus community." },
    { question: "What is the ranking of Carnegie Mellon University - Australia?", answer: "The parent institution Carnegie Mellon University ranks #52 globally (QS 2023) and #28 in Times Higher Education rankings 2023." },
    { question: "How many students are at Carnegie Mellon University - Australia?", answer: "CMU-Australia has approximately 7,074 total students, including 264 international students, making it one of the more intimate campuses in Australia." },
    { question: "How hard is it to get into Carnegie Mellon University - Australia?", answer: "With an acceptance rate of 25%, CMU-Australia is selective. Successful applicants typically have strong academic backgrounds, high GRE/GMAT scores, and relevant work experience." },
    { question: "Is Carnegie Mellon University - Australia accredited?", answer: "Yes, CMU-Australia is accredited by TEQSA (Tertiary Education Quality and Standards Agency) in Australia and the Middle States Commission on Higher Education in the USA." },
    { question: "Who are the notable alumni of CMU Australia?", answer: "CMU-Australia's alumni benefit from the broader Carnegie Mellon global alumni network of 117,000+ graduates working at companies like Google, Microsoft, NASA, and Goldman Sachs." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ]
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
