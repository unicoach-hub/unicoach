import React from 'react';
import UniversityDetailTemplate from '@/components/UniversityDetailTemplate';
import Overview from './Overview';
import Admissions from './Admissions';
import Rankings from './Rankings';
import CoursesAndFees from './CoursesAndFees';


const eastLondonData = {
  name: "University of East London",
  location: "Stratford and Docklands, London, UK",
  city: "London",
  established: 1898,
  type: "PUBLIC",
  logo: "/logos/verified-University of East London.jpg",
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
    { title: "English Language", detail: "IELTS, TOEFL, PTE or another accepted test; the minimum score depends on the course. Check the course page." },
    { title: "Undergraduate Degree", detail: "A bachelor's degree in a relevant subject; the minimum grade (UK 2:1 or 2:2 equivalent) depends on the course." }
  ],
  rankings: {
    "QS Rankings": [
      { category: "QS World University Rankings 2027", rank: "1001-1200" },
      { category: "QS World University Rankings 2025", rank: "901-950" }
    ]
  },
  coursesFees: [
    { name: "MSc in Computer Science (international fee)", duration: "Full-time", tuition: 22 }
  ],
  description: "The University of East London (UEL) is a public university with campuses in Stratford and Docklands, east London. It focuses on career-oriented courses, and many postgraduate courses have January, May and September start dates."
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
