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
  totalStudents: 54000,
  intlStudents: 21000,
  type: "PUBLIC",
  studentFacultyRatio: "19:1",
  acceptanceRate: "40%",
  accreditation: "AACSB, EQUIS, AMBA",
  avgStudyCost: "INR 20.00 L",
  avgCostOfLiving: "INR 9.00 L",
  logo: "https://logo.clearbit.com/uq.edu.au",
  heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200",
  notification: "According to QS World University Rankings 2025, The University of Queensland is ranked #43 globally — one of the world's top 50 universities.",
  topCourses: [
    { name: "Business Administration", count: 45 },
    { name: "Computer Science", count: 38 },
    { name: "Biological Sciences", count: 52 },
    { name: "Engineering", count: 67 },
    { name: "Medicine and Medical Studies", count: 22 }
  ],
  featuredCourse: {
    name: "Master of Business Administration",
    duration: "18 Months",
    tuition: 48.00
  },
  intakeDeadlines: [
    { name: "FEB'2025", status: "Intake Open" },
    { name: "JUL'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" },
    { name: "NOV'2025", status: "Closed" }
  ],
  requirements: [
    { title: "IELTS Academic Band", detail: "6.5 minimum overall band (7.0 for some programmes like Law and Medicine), with no individual component below 6.0." },
    { title: "TOEFL iBT Score", detail: "87+ minimum overall score with minimum 20 in each component for most programmes." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree from a recognised university equivalent to an Australian bachelor's degree." },
    { title: "Grade Requirements", detail: "Minimum GPA of 3.5/4.0 or equivalent for postgraduate coursework. Research programmes require Honours or equivalent." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "43" },
      { category: "Best National Schools - 2025", rank: "6" },
      { category: "Best World Ranking Schools - 2024", rank: "43 - 1500" },
      { category: "Best World Ranking Schools - 2023", rank: "53" },
      { category: "Best World Ranking Schools - 2022", rank: "54" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2024", rank: "93" },
      { category: "Best World Ranking Schools - 2023", rank: "90" },
      { category: "Best National Schools - 2024", rank: "6" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "46" },
      { category: "Best World Global Universities - 2022", rank: "55" }
    ],
    "Academic Ranking of World Universities": [
      { category: "Global Ranking - 2023", rank: "55" },
      { category: "Global Ranking - 2022", rank: "55" }
    ]
  },
  coursesFees: [
    { name: "Master of Business Administration", duration: "18 Months", tuition: 48.00 },
    { name: "Master of Science (Computer Science)", duration: "24 Months", tuition: 20.00 },
    { name: "Master of Engineering Science (Mechanical)", duration: "24 Months", tuition: 22.00 },
    { name: "Master of Public Health", duration: "24 Months", tuition: 19.50 },
    { name: "Master of Data Science", duration: "24 Months", tuition: 21.00 },
    { name: "Master of Environmental Management", duration: "24 Months", tuition: 18.00 },
    { name: "Doctor of Philosophy (PhD)", duration: "48 Months", tuition: 20.00 },
    { name: "Master of Laws", duration: "24 Months", tuition: 25.00 }
  ],
  description: "The University of Queensland (UQ), established in 1909, is one of Australia's leading research-intensive universities and a member of the prestigious Group of Eight. Ranked #43 globally by QS (2025), UQ is celebrated for science, engineering, health, and business excellence.",
  longDescription: "The University of Queensland (UQ) was founded in 1909 as Queensland's first university. Located in Brisbane, UQ has grown into one of Australia's leading research-intensive universities and a proud member of the Group of Eight — the alliance of Australia's top eight research universities.\n\nUQ operates across multiple campuses:\n- St Lucia Campus (main campus) — a stunning riverside campus covering 114 hectares\n- Herston Campus — home to the medical and health sciences\n- Gatton Campus — specialising in agriculture, veterinary science, and sport\n- UQ Diamantina Institute (Princess Alexandra Hospital) — cutting-edge medical research\n\nUQ is home to several world-class research institutes and centres:\n- Queensland Brain Institute (QBI)\n- Institute for Molecular Bioscience (IMB)\n- Australian Institute for Bioengineering and Nanotechnology (AIBN)\n- Sustainable Minerals Institute (SMI)\n\nThe university boasts over 54,000 students including 21,000 international students from 140+ countries, and an alumni network of 300,000+ graduates across the globe.\n\nUQ is particularly renowned for:\n- Life and Biological Sciences — consistently ranked in the global top 50\n- Engineering and Mining — world-class facilities and industry connections\n- Business — AACSB, EQUIS, and AMBA triple-accredited UQ Business School\n- Public Health and Medicine — landmark research in cancer, vaccines, and infectious diseases\n- Environmental Sciences — leading work on Great Barrier Reef conservation\n\nThe university has produced world-changing research including the development of the HPV (cervical cancer) vaccine — one of the most significant medical advances in recent history.",
  studentLife: [
    "Student Clubs and Societies (250+)",
    "UQ Sport — World-class athletic facilities",
    "Libraries and Digital Learning Hub",
    "Research Laboratories and Innovation Spaces",
    "Student Accommodation (St Lucia and Gatton)",
    "Mental Health and Counselling Services",
    "Cultural and Arts Events",
    "International Student Support Services"
  ],
  alumni: [
    { name: "Peter Beattie", profession: "Former Premier of Queensland" },
    { name: "Kerr Neilson", profession: "Co-founder, Platinum Asset Management" },
    { name: "Ian Frazer", profession: "Co-inventor of the HPV vaccine" },
    { name: "Julia Gillard", profession: "Adjunct Professor at UQ (Former PM of Australia)" },
    { name: "Cameron Clyne", profession: "Former CEO of National Australia Bank" }
  ],
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
      "BHP Billiton", "Queensland Government", "KPMG Australia", "Deloitte Australia",
      "Aurecon", "Queensland Rail", "Rio Tinto", "Suncorp Group",
      "Commonwealth Bank of Australia", "CSIRO"
    ]
  },
  faqs: [
    { question: "What is UQ's global ranking?", answer: "The University of Queensland is ranked #43 globally in the QS World University Rankings 2025, making it one of the world's top 50 universities and #6 in Australia." },
    { question: "Is UQ a member of the Group of Eight?", answer: "Yes, UQ is a founding member of the Group of Eight (Go8), the alliance of Australia's eight leading research-intensive universities." },
    { question: "What are UQ fees for international students?", answer: "International student fees at UQ typically range from INR 18–22 L per year for most postgraduate programmes, and up to INR 48 L for the MBA." },
    { question: "Where is the main UQ campus located?", answer: "UQ's main campus is St Lucia, a 114-hectare riverside campus 7km from Brisbane's CBD, known for its beautiful sandstone architecture and green spaces." },
    { question: "What is UQ known for academically?", answer: "UQ is particularly renowned for biological sciences, engineering, public health, law, and business. Its research on the HPV vaccine and Queensland Brain Institute are world-famous." },
    { question: "What are the top postgraduate courses at UQ?", answer: "Popular postgraduate programmes include MBA, Master of Data Science, Master of Public Health, Master of Engineering Science, and Master of Environmental Management." },
    { question: "Does UQ offer scholarships for international students?", answer: "Yes, UQ offers numerous scholarships including the UQ International Scholarship (up to 100% tuition waiver), Graduate School Scholarships, and various faculty-specific awards." },
    { question: "What are the IELTS requirements for UQ?", answer: "Most UQ programmes require IELTS 6.5+ overall with no individual band below 6.0. Some programmes like Law and Medicine require 7.0+." },
    { question: "What is the acceptance rate at UQ?", answer: "UQ has an overall acceptance rate of approximately 40% for international students, though this varies significantly by programme." },
    { question: "What is student life like at UQ?", answer: "UQ has a vibrant student community with 250+ student clubs, world-class sports facilities (UQ Sport), multiple libraries, on-campus residences, and extensive cultural and arts events." }
  ],
  blogs: [
    { title: "Finding Part-Time Jobs in Australia", readTime: "10 mins read", date: "Mar 15, 2025" }
  ]
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
