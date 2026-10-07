import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const leedsData = {
  name: "University of Leeds",
  location: "Leeds, UK",
  city: "Leeds",
  established: 1904,
  totalStudents: 39000,
  intlStudents: 12000,
  studentFacultyRatio: "16:1",
  acceptanceRate: "64%",
  accreditation: "AACSB",
  avgStudyCost: "INR 60.00 L",
  avgCostOfLiving: "INR 18.00 L",
  type: "PUBLIC",
  logo: "https://logo.clearbit.com/leeds.ac.uk",
  heroImage: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200",
  description: "The University of Leeds, established in 1904, stands as a prestigious institution of academic excellence and innovation.\n\nThe institution boasts a student body of over 39,800 individuals, contributing to its multicultural academic community. Its commitment to education is evident in its awarding 29 National Teaching Fellowships to its esteemed staff.\n\nWith a proud placement among the top 100 (#82) universities worldwide, the University of Leeds offers a wide variety of more than 470 courses across its seven faculties.\n\nIt further demonstrates its commitment to accessibility by offering three intakes in autumn, spring, and summer, catering to learners from all walks of life.\n\nThe University of Leeds has one main campus in the picturesque Woodhouse area, close to the Leeds city centre.\n\nWhether you're interested in business, science, arts, or any other field, the University of Leeds has the expertise and support to help you succeed in pursuing your professional dreams.",
  topCourses: [
    { name: "Accounting", count: 4 },
    { name: "Advertising", count: 2 },
    { name: "Aerospace Engineering", count: 9 },
    { name: "Animal and Veterinary Studies", count: 1 },
    { name: "Architecture", count: 5 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Closed" },
    { name: "SEP'2025", status: "Closed" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "92+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "6.5+ minimum band required for admission, with no band less than 6.0." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree expected with a GPA of 3.0+ (or 60%+ equivalent)." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2025", rank: "82" },
      { category: "Best World Ranking Schools - 2024", rank: "75" },
      { category: "Best World Ranking Schools - 2023", rank: "86" },
      { category: "Best World Ranking Schools - 2022", rank: "92" }
    ],
    "Guardian Global": [
      { category: "Best National Schools - 2025", rank: "37" },
      { category: "Best National Schools - 2024", rank: "27" },
      { category: "Best National Schools - 2023", rank: "20" },
      { category: "Best National Schools - 2022", rank: "16" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "128" },
      { category: "Best University Ranking Schools - 2022", rank: "127" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "140" }
    ],
    "Complete University Guide": [
      { category: "Best National Schools - 2024", rank: "23 - 1500" }
    ]
  },
  coursesFees: [
    { name: "BSc in Accounting and Finance (With Study abroad)", duration: "48 Months", tuition: 35.29 },
    { name: "MSc in Accounting and Finance", duration: "12 Months", tuition: 42.81 },
    { name: "BSc in Accounting and Finance", duration: "36 Months", tuition: 35.29 },
    { name: "BSc in Accounting and Finance (With Placement)", duration: "48 Months", tuition: 35.60 }
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
    description: "Have you heard the University of Leeds has been ranked among the top 10 universities in the UK for graduate recruitment in previous years?",
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
    { name: "Timothy Allen", profession: "Photojournalist" },
    { name: "Mark Byford", profession: "Director-General of BBC" },
    { name: "Richard Quest", profession: "Reporter for CNN" },
    { name: "Anita Rani", profession: "English Radio and TV Presenter" },
    { name: "Jay Rayner", profession: "Writer and Restaurant Critic" },
    { name: "Alan Yentob", profession: "BBC Creative Director" },
    { name: "Jacky Fleming", profession: "Award-Winning Cartoonist" },
    { name: "Piers Sellers", profession: "NASA Astronaut" },
    { name: "Subir Raha", profession: "Business Leader" }
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
