import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const ucdData = {
  name: "University College Dublin",
  country: "Ireland",
  location: "Dublin, Leinster, Ireland",
  city: "Dublin",
  established: 1854,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "17:1",
  acceptanceRate: null,
  accreditation: "AACSB, EQUIS, AMBA (UCD Smurfit School)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "/logos/verified-University College Dublin.png",
  heroImage: "https://images.unsplash.com/photo-1565073624497-7144969d401a?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Aerospace Engineering", count: 1 },
    { name: "Architecture", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Banking and Finance", count: 4 }
  ],
  featuredCourse: null,
  intakeDeadlines: [
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL iBT or another accepted test is required; the minimum score varies by programme." },
    { title: "Undergraduate Degree", detail: "Usually an upper second-class honours degree (2.1) or equivalent; the exact grade varies by programme." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "100" }
    ]
  },
  coursesFees: [],
  description: "University College Dublin (UCD), whose origins date to 1854, is Ireland's largest university and is based on a parkland campus at Belfield in south Dublin. It is ranked 100th in the QS World University Rankings 2027, second in Ireland, and is a member of the Universitas 21 network.",
  longDescription: "University College Dublin (UCD) has a rich history, having been established in 1854. Over the years, it has grown into one of Ireland's leading universities, known for its commitment to academic excellence and research innovation.\n\nAs a student, you will join a vibrant community with a total enrolment of 35,286, including 8,500 international students from diverse backgrounds. This multicultural environment enhances your educational experience and prepares you for a global career.\n\nUCD is located in Dublin, featuring a stunning 133-hectare campus equipped with state-of-the-art facilities. Key amenities include:\n- Modern lecture halls and laboratories\n- Libraries with extensive resources and digital access\n- Sports facilities and recreational areas\n- Student accommodation and dining options\n\nThe university offers a wide range of programmes tailored to meet industry demands. Popular fields of study include:\n- Business and Management (AACSB-accredited)\n- Engineering and Architecture\n- Science and Health Sciences\n- Arts and Humanities\n- Law and International Relations\n\nUCD boasts an acceptance rate of 25%, with multiple intake periods throughout the year. The university provides robust support services for international students, ensuring you have the resources needed to succeed.",
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
    { name: "Gabriel Byrne", profession: "Actor" },
    { name: "Mairead McGuinness", profession: "Politician" },
    { name: "Catherine Day", profession: "EU Official" }
  ],
  costOfLiving: {
    description: "Living in Dublin as an international student at University College Dublin involves several key expenses. Housing is typically the largest cost, with options ranging from on-campus accommodation at UCD's Belfield campus to private rentals. Books and supplies are essential, while transportation costs vary depending on proximity to campus.",
    inr: "11.60 L",
    usd: "USD 13,647",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 6.20 L" },
      { name: "Food & Groceries", value: "INR 2.20 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 1.00 L" },
      { name: "Personal & Misc", value: "INR 1.60 L" }
    ]
  },
  placements: {
    description: "University College Dublin offers comprehensive placement assistance through its Career Development Centre. Services include career counselling, workshops, seminars, job fairs, and networking events. The placement rate for international students is supported by UCD's strong employer network of multinational companies headquartered in Dublin.",
    services: [
      "Internships and Placement Support",
      "Online Job Portal",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "PWC",
      "Google",
      "Deloitte",
      "Microsoft",
      "Accenture",
      "Ernst & Young",
      "KPMG",
      "Johnson & Johnson",
      "Intel",
      "J.P. Morgan"
    ]
  },
  faqs: [
    { question: "Is University College Dublin a good university?", answer: "UCD is ranked 100th in the QS World University Rankings 2027, second among Irish universities." },
    { question: "How do I get admission to University College Dublin?", answer: "You usually need an honours bachelor's degree (often a 2.1 or equivalent), an accepted English test score, and an application through UCD's online portal. Requirements vary by programme." },
    { question: "Is University College Dublin public or private?", answer: "UCD is a public university funded by the Irish state." },
    { question: "Why choose University College Dublin?", answer: "UCD offers a wide choice of programmes, a large Belfield campus, and a business school (UCD Smurfit) accredited by AACSB, EQUIS and AMBA." },
    { question: "Is University College Dublin good for international students?", answer: "UCD has a large international student community, an international office, and on-campus accommodation." },
    { question: "What is the ranking of University College Dublin?", answer: "UCD is ranked 100th in the QS World University Rankings 2027." },
    { question: "What are UCD's fees for international students?", answer: "Non-EU fees vary by programme; check the official UCD fee schedule for your course before applying." },
    { question: "Who are the notable alumni of University College Dublin?", answer: "Notable alumni include actor Gabriel Byrne, former EU Commissioner Mairead McGuinness, and former European Commission Secretary-General Catherine Day." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#100 in QS World University Rankings 2027"
};

const UCDPage = () => {
  return <UniversityDetailTemplate 
      uniData={ucdData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default UCDPage;
