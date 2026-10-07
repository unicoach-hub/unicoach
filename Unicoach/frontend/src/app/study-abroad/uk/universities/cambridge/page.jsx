import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const cambridgeData = {
  name: "University of Cambridge",
  location: "Cambridge - Massachusetts, UK", // Matches user prompt's specific location string
  city: "Cambridge",
  established: 1209,
  totalStudents: 24270,
  intlStudents: 9949,
  type: "PUBLIC",
  logo: "/logos/University of Cambridge.jpg",
  heroImage: "/images/universities/cambridge.jpg",
  description: "The University of Cambridge, established in 1209, is one of the oldest, largest and most prestigious universities in the world. Renowned for its academic excellence and pioneering research, it has produced some of the world's most influential scientists, writers, and political leaders.\n\nWith a collegiate system consisting of 31 colleges, Cambridge offers a unique, close-knit learning community. Students benefit from individual or small-group supervisions with world-leading authorities in their respective fields.\n\nThe university provides top-tier facilities including the Cambridge University Library, university museums, and extensive sports facilities. It is consistently ranked among the top universities globally for research output, teaching quality, and graduate employability.",
  topCourses: [
    { name: "Banking and Finance", count: 1 },
    { name: "Business Administration", count: 2 },
    { name: "Philosophy and Religious Studies", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2025", status: "Intake Open" },
    { name: "SEP'2025", status: "Intake Open" },
    { name: "OCT'2025", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "110+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "7.5+ minimum band required for admission, with no band less than 7.0." },
    { title: "Undergraduate Degree", detail: "First-class honors degree expected (minimum equivalent of 3.8+ GPA)." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2023", rank: "2" },
      { category: "Best World Ranking Schools - 2022", rank: "3" }
    ],
    "US News": [
      { category: "Best World Ranking Schools - 2023", rank: "8" },
      { category: "Best World Ranking Schools - 2022", rank: "2" }
    ],
    "Webometrics - World": [
      { category: "Best World Ranking Schools - 2023", rank: "12" }
    ],
    "Times Higher Education": [
      { category: "Best World Ranking Schools - 2023", rank: "3" },
      { category: "Best World Ranking Schools - 2022", rank: "5" }
    ]
  },
  coursesFees: [
    { name: "Master of Finance", duration: "12 Months", tuition: 58.14 }
  ],
  placements: {
    description: "The University of Cambridge offers exceptional career support through the Careers Service, providing lifetime support to students and alumni. They organize specialized career fairs, workshops, networking events with global recruiters, and collateral-free funding options to help students secure internships and graduate positions globally.",
    services: [
      "Internships and Placement Support",
      "Visa and Work Authorisation Guidance",
      "One-on-One Career Advising",
      "Global Recruiter Networks"
    ],
    recruiters: [
      "Google", "Microsoft", "Amazon", "Barclays", "PwC", "Deloitte",
      "McKinsey & Company", "Boston Consulting Group", "Goldman Sachs"
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
    { name: "Isaac Newton", profession: "Physicist" },
    { name: "Charles Darwin", profession: "Biologist" },
    { name: "Stephen Hawking", profession: "Cosmologist" },
    { name: "Alan Turing", profession: "Computer Scientist" },
    { name: "John Maynard Keynes", profession: "Economist" }
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

const CambridgePage = () => {
  return <UniversityDetailTemplate 
      uniData={cambridgeData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default CambridgePage;
