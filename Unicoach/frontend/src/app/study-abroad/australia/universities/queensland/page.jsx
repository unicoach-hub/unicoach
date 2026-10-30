import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const queenslandData = {
  name: "The University of Queensland",
  country: "Australia",
  location: "Brisbane, Queensland, Australia",
  city: "Brisbane",
  established: 1909,
  totalStudents: null,
  intlStudents: null,
  type: "PUBLIC",
  studentFacultyRatio: "19:1",
  acceptanceRate: null,
  accreditation: null,
  avgStudyCost: "INR 20.00 L",
  avgCostOfLiving: "INR 9.00 L",
  logo: "/logos/The University of Queensland.webp",
  heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200",
  notification: "According to the QS World University Rankings 2027, The University of Queensland is ranked 40th in the world.",
  topCourses: [
    { name: "Business Administration", count: 45 },
    { name: "Computer Science", count: 38 },
    { name: "Biological Sciences", count: 52 },
    { name: "Engineering", count: 67 },
    { name: "Medicine and Medical Studies", count: 22 }
  ],
  featuredCourse: {
    name: "Master of Computer Science",
    duration: "See course page",
    tuition: 41
  },
  intakeDeadlines: [
    { name: "FEB'2026", status: "Intake Open" },
    { name: "JUL'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "Most postgraduate coursework programs ask for IELTS 6.5 overall with no band below 6.0; some, such as law and medicine, ask for more." },
    { title: "Other English Tests", detail: "TOEFL iBT, PTE Academic and other tests are accepted; check the minimum score for your program." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree recognised as equivalent to an Australian bachelor's; the required GPA varies by program." }
  ],
  rankings: {
    "QS World University Rankings": [
      { category: "World University Rankings - 2027", rank: "40" }
    ]
  },
  coursesFees: [
    { name: "Master of Computer Science", duration: "See course page", tuition: 41 },
    { name: "Master of Business", duration: "See course page", tuition: 41 }
  ],
  description: "The University of Queensland (UQ), established in 1909, is Queensland's oldest university and a member of the Group of Eight research universities. It is ranked 40th in the QS World University Rankings 2027 and is known for science, engineering, health and business.",
  longDescription: "The University of Queensland (UQ) was founded in 1909 as Queensland's first university. Located in Brisbane, UQ has grown into one of Australia's leading research-intensive universities and a proud member of the Group of Eight — the alliance of Australia's top eight research universities.\n\nUQ operates across multiple campuses:\n- St Lucia Campus (main campus) — a stunning riverside campus covering 114 hectares\n- Herston Campus — home to the medical and health sciences\n- Gatton Campus — specialising in agriculture, veterinary science, and sport\n- UQ Diamantina Institute (Princess Alexandra Hospital) — cutting-edge medical research\n\nUQ is home to several world-class research institutes and centres:\n- Queensland Brain Institute (QBI)\n- Institute for Molecular Bioscience (IMB)\n- Australian Institute for Bioengineering and Nanotechnology (AIBN)\n- Sustainable Minerals Institute (SMI)\n\nThe university boasts over 54,000 students including 21,000 international students from 140+ countries, and an alumni network of 300,000+ graduates across the globe.\n\nUQ is particularly renowned for:\n- Life and Biological Sciences — consistently ranked in the global top 50\n- Engineering and Mining — world-class facilities and industry connections\n- Business — AACSB, EQUIS, and AMBA triple-accredited UQ Business School\n- Public Health and Medicine — landmark research in cancer, vaccines, and infectious diseases\n- Environmental Sciences — leading work on Great Barrier Reef conservation\n\nThe university has produced world-changing research including the development of the HPV (cervical cancer) vaccine — one of the most significant medical advances in recent history.",
  studentLife: [
    "Student Clubs and Societies",
    "UQ Sport — World-class athletic facilities",
    "Libraries and Digital Learning Hub",
    "Research Laboratories and Innovation Spaces",
    "Student Accommodation (St Lucia and Gatton)",
    "Mental Health and Counselling Services",
    "Cultural and Arts Events",
    "International Student Support Services"
  ],
  alumni: null,
  costOfLiving: {
    description: "Brisbane is one of Australia's most affordable major cities with a warm subtropical climate. International students at UQ typically live in and around the St Lucia suburb, with easy public transport access to the CBD. Housing options include on-campus colleges, shared houses, and private rentals.",
    inr: "9.00 L",
    usd: "USD 10,588",
    breakdown: [
      { name: "Housing & Utilities", value: "INR 4.50 L" },
      { name: "Food & Groceries", value: "INR 1.90 L" },
      { name: "Books & Supplies", value: "INR 0.60 L" },
      { name: "Transportation", value: "INR 1.00 L" },
      { name: "Personal & Misc", value: "INR 1.00 L" }
    ]
  },
  placements: {
    description: "UQ's Employability team offers comprehensive career development services including career counselling, job fair events, industry networking sessions, and access to the UQ CareerHub portal with thousands of job listings. UQ's Brisbane location places graduates at the heart of Queensland's growing economy.",
    services: [
      "Career Counselling and Development",
      "UQ CareerHub — Online Job Portal",
      "Industry Networking Events",
      "Internship and Work-Integrated Learning",
      "Resume and Interview Workshops",
      "Employer On-Campus Recruitment",
      "Global Alumni Network Access"
    ],
    recruiters: [
      "BHP Billiton",
      "Queensland Government",
      "KPMG Australia",
      "Deloitte Australia",
      "Aurecon",
      "Queensland Rail",
      "Rio Tinto",
      "Suncorp Group",
      "Commonwealth Bank of Australia",
      "CSIRO"
    ]
  },
  faqs: [
    { question: "What is UQ's global ranking?", answer: "The University of Queensland is ranked 40th in the QS World University Rankings 2027, sixth among Australian universities." },
    { question: "Is UQ a member of the Group of Eight?", answer: "Yes, UQ is a member of the Group of Eight (Go8), the alliance of Australia's eight leading research-intensive universities." },
    { question: "What are UQ fees for international students?", answer: "Fees vary by program. For example, the Master of Computer Science and the Master of Business are both A$60,952 per year for 2027 (about ₹41 lakh at ₹67 per Australian dollar)." },
    { question: "Where is the main UQ campus located?", answer: "UQ's main campus is at St Lucia in Brisbane, on the Brisbane River. It also has campuses at Herston and Gatton." },
    { question: "Does UQ have a Master of Business Analytics?", answer: "UQ's Master of Business Analytics is now online only and part-time, so it does not lead to a student visa. On campus, international students can take the Master of Business with an Information Systems field." },
    { question: "When are UQ's intakes?", answer: "Most postgraduate programs start in Semester 1 (February) or Semester 2 (July); check your program page." },
    { question: "What are the IELTS requirements for UQ?", answer: "Most programs require IELTS 6.5 overall with no band below 6.0. Some programs, such as law and medicine, ask for more." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ],
  rank: "#40 in QS World University Rankings 2027"
};

const QueenslandPage = () => {
  return <UniversityDetailTemplate 
      uniData={queenslandData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default QueenslandPage;
