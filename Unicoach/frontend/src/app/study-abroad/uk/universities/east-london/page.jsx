import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const eastLondonData = {
  name: "University of East London",
  location: "London - Stratford & Docklands, London, UK",
  city: "London",
  established: 1898,
  totalStudents: 25000,
  intlStudents: 8400,
  type: "PUBLIC",
  logo: "https://logo.clearbit.com/uel.ac.uk",
  heroImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200",
  topCourses: [
    { name: "Computer Science", count: 1 },
    { name: "Business Administration", count: 1 },
    { name: "Physiotherapy", count: 1 }
  ],
  intakeDeadlines: [
    { name: "JAN'2026", status: "Intake Open" },
    { name: "MAY'2026", status: "Intake Open" },
    { name: "SEP'2026", status: "Intake Open" }
  ],
  requirements: [
    { title: "TOEFL iBT Score", detail: "79+ minimum cutoff required for English proficiency verification." },
    { title: "IELTS Academic Band", detail: "6.0+ minimum band required for admission, with no band less than 5.5." },
    { title: "Undergraduate Degree", detail: "Bachelor's degree expected with a GPA of 2.5+ or 50%+ equivalent." }
  ],
  rankings: {
    "Times Higher Education": [
      { category: "Best Young Universities - 2023", rank: "351" }
    ],
    "QS Rankings": [
      { category: "Best World Ranking Schools - 2026", rank: "900" },
      { category: "Best World Ranking Schools - 2025", rank: "900" }
    ]
  },
  coursesFees: [
    { name: "MSc in Computer Science (with Placement)", duration: "12 Months", tuition: 15 },
    { name: "MSc in Physiotherapy", duration: "24 Months", tuition: 15 },
    { name: "Master of Business Administration (MBA)", duration: "12 Months", tuition: 16 }
  ],
  description: "The University of East London (UEL) is a vibrant, modern public university focusing on careers of the future, practical skill development, and providing highly affordable, accredited international education on stunning London Docklands campuses."
};

const EastLondonPage = () => {
  return <UniversityDetailTemplate 
      uniData={eastLondonData} 
      sections={{
        overview: Overview,
        admissions: Admissions,
        rankings: Rankings,
        courses: CoursesAndFees
      }}
    />;
};

export default EastLondonPage;
