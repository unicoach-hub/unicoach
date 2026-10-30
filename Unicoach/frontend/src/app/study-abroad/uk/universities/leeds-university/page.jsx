import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const leedsData = {
  name: "University of Leeds",
  location: "Leeds, West Yorkshire, UK",
  city: "Leeds",
  established: 1904,
  accreditation: "AACSB",
  avgStudyCost: "INR 60.00 L",
  avgCostOfLiving: "INR 18.00 L",
  type: "PUBLIC",
  logo: "/logos/verified-University of Leeds.png",
  heroImage: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200",
  description: "The University of Leeds received its royal charter in 1904 and is a member of the Russell Group of research-intensive UK universities.\n\nIt is ranked 77th in the world in the QS World University Rankings 2027.\n\nThe University of Leeds has one main campus in the Woodhouse area, close to Leeds city centre, and offers undergraduate, taught postgraduate and research degrees across a wide range of subjects.\n\nMost taught Master's courses start in September; check each course page for start dates and application deadlines.",
  topCourses: [
    { name: "Accounting", count: 4 },
    { name: "Advertising", count: 2 },
    { name: "Aerospace Engineering", count: 9 },
    { name: "Animal and Veterinary Studies", count: 1 },
    { name: "Architecture", count: 5 }
  ],
  intakeDeadlines: [
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL, PTE or another accepted test; the minimum score depends on the course. Check the course page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree in a relevant subject; the minimum grade (UK 2:1 or 2:2 equivalent) depends on the course." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "QS World University Rankings 2027", rank: "=77" },
      { category: "QS World University Rankings 2025", rank: "82" }
    ]
  },
  coursesFees: [
    { name: "MSc in Advanced Computer Science (Sept 2027, international fee)", duration: "12 Months", tuition: 44 }
  ],
  costOfLiving: {
    description: "Generally, the cost of living in the UK while studying at Leeds can be around INR 40K per week for undergraduate and postgraduate students.",
    inr: "0.40L",
    usd: "471",
    breakdown: [
      { name: "Rent & Bills (Per Week)", value: "£150 - £220" },
      { name: "Food & Household (Per Week)", value: "£50 - £70" },
      { name: "Local Transport (Per Week)", value: "£15 - £25" }
    ]
  },
  placements: {
    description: "The University of Leeds Careers Centre supports students with placements, internships and graduate job applications.",
    services: [
      "Integrated Placements",
      "Summer Internships",
      "Insight Days",
      "The Leeds Internship Programme",
      "Careers Centre Support"
    ],
    recruiters: [
      "Deloitte", "KPMG", "PwC", "EY", "Goldman Sachs", "Morgan Stanley",
      "J.P. Morgan", "Barclays", "HSBC", "Unilever"
    ]
  },
  studentLife: [
    "Food", "Housing", "Fun Activities", "Extracurricular Activities", "Clubs and Sports", "Representation"
  ],
  alumni: [
    { name: "Hage Geingob", profession: "President of Namibia" },
    { name: "Mark Byford", profession: "Former Deputy Director-General of the BBC" },
    { name: "Richard Quest", profession: "Reporter for CNN" },
    { name: "Anita Rani", profession: "English Radio and TV Presenter" },
    { name: "Jay Rayner", profession: "Writer and Restaurant Critic" },
    { name: "Alan Yentob", profession: "BBC Creative Director" },
    { name: "Piers Sellers", profession: "NASA Astronaut" }
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

const LeedsPage = () => {
  return <UniversityDetailTemplate 
      uniData={leedsData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default LeedsPage;
