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
  totalStudents: 35286,
  intlStudents: 8500,
  type: "PUBLIC",
  studentFacultyRatio: "17:1",
  acceptanceRate: "25%",
  accreditation: "Association to Advance Collegiate Schools of Business (AACSB)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 3.00 L",
  logo: "https://logo.clearbit.com/ucd.ie",
  heroImage: "https://images.unsplash.com/photo-1565073624497-7144969d401a?w=1200",
  topCourses: [
    { name: "Accounting", count: 1 },
    { name: "Aerospace Engineering", count: 1 },
    { name: "Architecture", count: 2 },
    { name: "Artificial Intelligence / Machine Learning", count: 1 },
    { name: "Banking and Finance", count: 4 }
  ],
  featuredCourse: {
    name: "MSc Accounting & Finance Management",
    duration: "12 Months",
    tuition: 22.54
  },
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "MAY'2025", status: "Intake Open" },
    { name: "AUG'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Closed" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall, with no individual component below 6.0 for most programmes." },
    { title: "TOEFL iBT Score", detail: "90+ minimum cutoff, with minimum section scores as specified by each programme." },
    { title: "Undergraduate Degree", detail: "Upper Second-Class Honours (2:1) or equivalent from a recognised university." }
  ],
  rankings: {
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "236" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "126" },
      { category: "Best National Schools - 2024", rank: "51 - 1500" },
      { category: "Best World Ranking Schools - 2024", rank: "126 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "181" },
      { category: "Best World Ranking Schools - 2022", rank: "101" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "201 - 250" },
      { category: "Best World Ranking Schools - 2022", rank: "201 - 250" }
    ],
    "Complete University Guide": [
      { category: "Best National Schools - 2025", rank: "2" }
    ]
  },
  coursesFees: [
    { name: "MSc Accounting & Finance Management", duration: "12 Months", tuition: 22.54 },
    { name: "MSc Computer Science", duration: "12 Months", tuition: 24.00 },
    { name: "MSc Data Analytics", duration: "12 Months", tuition: 21.00 },
    { name: "MSc Business Analytics", duration: "12 Months", tuition: 23.00 },
    { name: "MSc Architecture", duration: "24 Months", tuition: 20.00 }
  ],
  description: "University College Dublin (UCD), established in 1854, is Ireland's largest and most globally connected university. Located on a stunning Belfield campus, UCD is ranked #2 nationally and is a member of the prestigious Universitas 21 global network.",
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
    { name: "William C. Campbell", profession: "Nobel Laureate" },
    { name: "Donal Skehan", profession: "Chef" },
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
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "PWC", "Google", "Deloitte", "Microsoft", "Accenture",
      "Ernst & Young", "KPMG", "Johnson & Johnson", "Intel", "J.P. Morgan"
    ]
  },
  faqs: [
    { question: "Is University College Dublin a good university?", answer: "Yes, UCD is Ireland's second-ranked university nationally and is ranked #126 globally by QS in 2025, making it one of the world's top 200 institutions." },
    { question: "How do I get admission to University College Dublin?", answer: "Admission requires a 2:1 Honours degree or equivalent, English language proficiency (IELTS 6.5+), and submission of supporting documents via the UCD online application portal." },
    { question: "Is University College Dublin public or private?", answer: "UCD is a public research university, one of Ireland's seven universities funded by the Irish government." },
    { question: "Why choose University College Dublin?", answer: "UCD offers world-class research, AACSB-accredited business programmes, a stunning campus, and a diverse student community of 35,000+ students." },
    { question: "Is University College Dublin good for international students?", answer: "Absolutely. UCD hosts over 8,500 international students and offers dedicated support services, on-campus accommodation, and a vibrant multicultural community." },
    { question: "What is the ranking of University College Dublin?", answer: "UCD is ranked #126 globally in the 2025 QS World University Rankings and #2 nationally in Ireland." },
    { question: "What is the pass rate for University College Dublin?", answer: "UCD has strong academic outcomes with high graduation rates across its programmes." },
    { question: "How many students are at University College Dublin?", answer: "UCD has approximately 35,286 enrolled students, of whom 8,500 are international students." },
    { question: "How hard is it to get into University College Dublin?", answer: "UCD has an acceptance rate of approximately 25%, making it selective, particularly for popular programmes like Business, Law, and Computer Science." },
    { question: "Is University College Dublin accredited?", answer: "Yes, UCD's Business School is AACSB-accredited, one of the most prestigious business school accreditations globally." },
    { question: "Who are the notable alumni of University College Dublin?", answer: "Notable alumni include Nobel Laureate William C. Campbell, actor Gabriel Byrne, MEP Mairead McGuinness, and chef Donal Skehan." }
  ],
  blogs: [
    { title: "Part-Time Jobs in Ireland for Students: Top Opportunities & Salary", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Highest Paying Jobs in Ireland for Indians: Complete Details!", readTime: "13 mins read", date: "Mar 15, 2025" },
    { title: "Jobs in Ireland for Indians: How to find out job opportunities in 2024-2025", readTime: "12 mins read", date: "Mar 15, 2025" }
  ]
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
