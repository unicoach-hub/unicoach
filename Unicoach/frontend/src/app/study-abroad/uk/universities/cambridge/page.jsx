import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const cambridgeData = {
  name: "University of Cambridge",
  location: "Cambridge, England, UK",
  city: "Cambridge",
  established: 1209,
  type: "PUBLIC",
  logo: "/logos/University of Cambridge.jpg",
  heroImage: "/images/universities/cambridge.jpg",
  description: "The University of Cambridge, established in 1209, is one of the oldest and most prestigious universities in the world. Renowned for its academic excellence and pioneering research, it has produced some of the world's most influential scientists, writers, and political leaders.\n\nWith a collegiate system consisting of 31 colleges, Cambridge offers a unique, close-knit learning community. Students benefit from individual or small-group supervisions with world-leading authorities in their respective fields.\n\nThe university provides top-tier facilities including the Cambridge University Library, university museums, and extensive sports facilities. It is ranked 6th in the world in the QS World University Rankings 2027.",
  topCourses: [
    { name: "Banking and Finance", count: 1 },
    { name: "Business Administration", count: 2 },
    { name: "Philosophy and Religious Studies", count: 1 }
  ],
  intakeDeadlines: [
    { name: "OCT'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "English Language", detail: "IELTS, TOEFL or another accepted test; the required level depends on the course. Check the course page." },
    { title: "Undergraduate Degree", detail: "Usually at least a high upper second-class (2:1) UK degree, or the international equivalent; the exact requirement varies by course." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "QS World University Rankings 2027", rank: "6" }
    ],
    "Times Higher Education": [
      { category: "THE World University Rankings 2026", rank: "3=" }
    ]
  },
  coursesFees: [
    { name: "MPhil in Advanced Computer Science (2027-28, overseas fee)", duration: "Full-time", tuition: 65 }
  ],
  placements: {
    description: "The University of Cambridge offers exceptional career support through the Careers Service, providing lifetime support to students and alumni. They organize specialized career fairs, workshops, networking events with global recruiters to help students secure internships and graduate positions globally.",
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
