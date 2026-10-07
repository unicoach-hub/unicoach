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
  totalStudents: 27000,
  intlStudents: 6500,
  type: "PUBLIC",
  studentFacultyRatio: "20:1",
  acceptanceRate: "75%",
  accreditation: "Ontario College of Teachers (OCT)",
  avgStudyCost: "INR 0.50 L",
  avgCostOfLiving: "INR 0.25 L",
  logo: "https://logo.clearbit.com/humber.ca",
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
  coursesFees: [
    { name: "Ontario Graduate Certificate in Professional Accounting", duration: "48 Months", tuition: 11.04 },
    { name: "Advanced Diploma in Business Administration (Accounting)", duration: "36 Months", tuition: 10.30 },
    { name: "Diploma in Accounting (Business)", duration: "24 Months", tuition: 10.30 },
    { name: "Graduate Certificate in Professional Accounting Practice", duration: "18 Months", tuition: 11.04 }
  ],
  description: "Humber College - North was established in 1967 and has since grown into a prominent institution known for its commitment to quality education. Over the years, it has expanded its offerings and facilities, becoming a hub for students seeking practical and industry-relevant training.",
  longDescription: "Humber College - North was established in 1967 and has since grown into a prominent institution known for its commitment to quality education. Over the years, it has expanded its offerings and facilities, becoming a hub for students seeking practical and industry-relevant training.\n\nWith a total enrollment of 27000, Humber College - North boasts a vibrant student body that includes 6500 international students. This diverse community enriches the learning environment, allowing you to gain a global perspective while pursuing your education.\n\nThe campus is located in Toronto, featuring state-of-the-art facilities designed to support your academic journey. Key amenities include:\n- Modern classrooms equipped with the latest technology\n- Extensive library resources\n- Dedicated study spaces and labs\n- Recreational facilities for physical wellness\n\nHumber College - North offers a variety of programs that align with industry demands. Some popular programs include:\n- Business Administration\n- Media Studies\n- Health Sciences\n- Engineering Technology\n\nThe acceptance rate at Humber College - North is 75%, with multiple intake periods throughout the year. The institution provides robust support services for international students, ensuring you have the resources needed to succeed.\n\nHumber College - North is accredited by the following bodies:\n- Ontario College of Teachers (OCT)\n- Relevant Program accrediting bodies\n\nIn conclusion, Humber College - North is dedicated to providing a quality education that prepares you for a successful career. With its diverse programs and supportive environment, you will be well-equipped to meet the challenges of the professional world.",
  studentLife: [
    "Student Groups and Organizations",
    "Libraries and Study Resources",
    "Labs and Research Facilities",
    "Athletic Facilities and Grounds",
    "Housing",
    "Social and Recreational Spots"
  ],
  alumni: [
    { name: "Sarah Taylor", profession: "Entrepreneur" },
    { name: "Michael Chang", profession: "Award-winning Chef" },
    { name: "Emily Patel", profession: "Humanitarian" },
    { name: "David Lee", profession: "Innovative Architect" }
  ],
  costOfLiving: {
    description: "Living in Toronto as an international student attending Humber College - North involves various expenses. Housing is typically the largest cost, with options ranging from on-campus residences to private rentals. Books and supplies are essential for academic success, while transportation costs can vary depending on the proximity of your accommodation to the college. Personal expenses include groceries, clothing, and entertainment, which are necessary for a balanced lifestyle. Miscellaneous expenses cover unforeseen costs such as healthcare or emergency travel. Overall, the cost of living in Toronto requires careful budgeting to ensure a comfortable and enriching experience.",
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
    description: "Humber College - North provides comprehensive placement assistance to international students to help them transition into the workforce. The Career Centre offers career counselling services to assist students in exploring career options, developing job search strategies, and improving their resumes and interview skills. Workshops and seminars are regularly organized on topics such as networking, personal branding, and job search techniques. Recent examples include a resume writing workshop, a LinkedIn networking seminar, and a mock interview event.",
    services: [
      "Job Fairs and Networking Events",
      "Internships and Placement Support",
      "Online Job Portal",
      "OPT and CPT Guidance",
      "Visa and Work Authorisation Guidance",
      "Cultural Adjustment"
    ],
    recruiters: [
      "Manulife", "Sun Life Financial", "CGI Inc.", "Google", "RBC", "IBM"
    ]
  },
  faqs: [
    { question: "Is Humber College - North a good university?", answer: "Yes, Humber is highly recognized for its career-focused education, polytechnic model, and outstanding links to industry partners." },
    { question: "How do I get admission to Humber College - North?", answer: "Admission requires submitting an academic transcript, language proficiency test scores, and fulfilling specific course pre-requisites." },
    { question: "Is Humber College - North public or private?", answer: "Humber College - North is a public college located in Toronto, Ontario." },
    { question: "Why choose Humber College - North?", answer: "It offers a rich campus environment, state-of-the-art labs, hands-on learning, and co-op options that provide real-world work experience." },
    { question: "Is Humber College - North good for international students?", answer: "Yes, with over 6,500 international students, Humber provides robust peer tutoring, health services, and cultural events." },
    { question: "What is the ranking of Humber College - North?", answer: "Humber ranks #79 nationally and #6214 globally according to Webometrics 2023." },
    { question: "What is the pass rate for Humber College - North?", answer: "It boasts high graduation rates, and over 85% of graduates find employment within six months." },
    { question: "How many students are at Humber College - North?", answer: "There are approximately 27,000 students enrolled, including 6,500 international students." },
    { question: "How hard is it to get into Humber College - North?", answer: "The acceptance rate is 75%, making it relatively open to qualified domestic and international applicants." },
    { question: "Is Humber College - North accredited?", answer: "Yes, it is accredited by the Ontario Ministry of Colleges and Universities and specialized bodies such as the Ontario College of Teachers (OCT)." },
    { question: "Who are the notable alumni of Humber College - North and what are their professions?", answer: "Notable alumni include Sarah Taylor (Entrepreneur), Michael Chang (Award-winning Chef), Emily Patel (Humanitarian), and David Lee (Innovative Architect)." }
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
