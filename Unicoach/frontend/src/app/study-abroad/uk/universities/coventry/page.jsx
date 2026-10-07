import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const coventryData = {
  name: "Coventry University",
  location: "Coventry, UK",
  city: "Coventry",
  established: 1843,
  totalStudents: 50000,
  intlStudents: 13000,
  studentFacultyRatio: "18:1",
  acceptanceRate: "65%",
  accreditation: "Association to Advance Collegiate Schools of Business (AACSB)",
  avgStudyCost: "INR 5.00 L",
  avgCostOfLiving: "INR 2.00 L",
  type: "PUBLIC",
  logo: "https://logo.clearbit.com/coventry.ac.uk",
  heroImage: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200",
  description: "Coventry University, established in 1843, has a rich history of providing quality education and fostering innovation. Over the years, it has grown significantly, evolving into a vibrant institution known for its commitment to student success and community engagement.\n\nWith a total enrollment of 50000, Coventry University boasts a diverse student body, including 13000 international students from various countries. This multicultural environment enriches your learning experience and prepares you for a global career.\n\nLocated in Coventry, the campus is equipped with state-of-the-art facilities designed to support your academic journey. Key facilities include modern lecture halls, extensive library resources, research centers, sports facilities, and student accommodation options.\n\nCoventry University offers a range of programs that align with industry needs, ensuring you receive relevant education. Popular areas of study include Engineering, Business, Health, Arts, and Social Sciences.\n\nThe university offers multiple intake periods throughout the year and provides robust support services for international students, including orientation programs and dedicated advisors.\n\nIn conclusion, Coventry University stands out for its quality education, diverse programs, and commitment to preparing you for a successful career in a globalized world.",
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
    { title: "TOEFL iBT Score", detail: "79+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "6.0+ minimum band required for admission, with no band less than 5.5." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree expected with a GPA of 2.5+ or 55%+ equivalent." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "526" },
      { category: "Best World Ranking Schools - 2024", rank: "526 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "651" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "801 - 1000" },
      { category: "Best World Ranking Schools - 2022", rank: "610 - 800" }
    ],
    "Guardian Global": [
      { category: "Best National Schools - 2025", rank: "42" },
      { category: "Best National Schools - 2024", rank: "46" }
    ],
    "UK QS Ranking": [
      { category: "Best Schools - 2023", rank: "54" }
    ]
  },
  coursesFees: [
    { name: "BSc (Hons) in Accounting and Finance", duration: "36 Months", tuition: 17.73 },
    { name: "BSc (Hons) in Accounting and Finance for International Students (Top Up)", duration: "12 Months", tuition: 17.73 },
    { name: "MSc in Professional Accounting", duration: "12 Months", tuition: 21.17 },
    { name: "BA (Hons) in International Finance and Accounting", duration: "36 Months", tuition: 17.73 }
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
      "OPT and CPT Guidance",
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
  alumni: [
    { name: "Sir John Egan", profession: "Business Leader" },
    { name: "Emma Willis", profession: "Fashion Designer" },
    { name: "Moazzam Begg", profession: "Human Rights Activist" },
    { name: "Karen Carney", profession: "Footballer" }
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
