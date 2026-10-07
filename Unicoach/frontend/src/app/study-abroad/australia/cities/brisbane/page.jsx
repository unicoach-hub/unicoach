import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Brisbane, Australia
const universitiesData = getByCity('australia', 'Brisbane');

// Filter Categories
const filterCategories = {
  fees: [
    { label: "Max ₹10 Lacs", value: "10" },
    { label: "Max ₹20 Lacs", value: "20" },
    { label: "Max ₹30 Lacs", value: "30" },
    { label: "Max ₹40 Lacs", value: "40" },
    { label: "₹40 Lacs +", value: "40+" }
  ],
  degree: [
    { label: "Ph.D.", value: "phd" },
    { label: "Undergraduate", value: "undergraduate" },
    { label: "Postgraduate", value: "postgraduate" }
  ],
  intake: [
    { label: "FEB", value: "feb" },
    { label: "JUL", value: "jul" }
  ]
};

// All courses for filter
const allCourses = [
  "Broadcast Media", "Engineering Design", "Industrial Design", "Physiotherapy",
  "Interior Design", "Theatre", "Social Work", "Dental Studies",
  "Animal and Veterinary Studies", "Justice studies", "Electronics", "Cyber Security",
  "Robotics", "Biochemistry", "Information Systems", "Philosophy and Religious Studies",
  "History", "Media & Communication", "Commerce", "Public Health", "Game Development",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
  "Biomedical Engineering", "Aerospace Engineering", "Mining Engineering",
  "Legal Studies", "Law", "Music", "Dance", "Banking and Finance",
  "Teaching / Education studies", "Language and Literature", "Film and TV production",
  "Journalism", "Creative Writing", "Advertising", "Sociology", "Political Science",
  "Nursing and midwifery", "Chemical Engineering", "Mathematics", "Statistics",
  "Photography", "International Relations", "Psychology", "Sport / Exercise Science",
  "Business Analytics", "Physics", "Data Science", "Food / Agricultural Science",
  "Accounting", "Earth Sciences / Geoscience", "Environmental science / management",
  "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts", "Fashion Design",
  "Product Design", "Biological Sciences", "Forensics", "Biotechnology", "Architecture",
  "Construction Management", "Planning", "Surveying", "International / Global Business",
  "Sales And Marketing", "Human resource Management", "Business Administration",
  "Project Management", "Innovation / Entrepreneurship", "Chemistry", "Food And Hospitality",
  "Data Analytics", "Pharmacology / Pharmacy", "Business Management", "Tourism",
  "Medicine and Medical Studies", "Economics", "Computer Science",
  "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
  "Information technology", "Computer Graphics", "Computer Engineering",
  "Environmental Engineering", "Software Engineering", "Web Development", "Management",
  "Interdisciplinary Studies"
];

export default function BrisbanePage() {
  return (
    <CityUniversitiesTemplate
      cityName="Brisbane"
      // 👇 Page Header Texts — Customize anytime directly here:
      title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Brisbane</span></>}
      subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
      badgeText="Study in Brisbane, Queensland"
      universitiesData={universitiesData}
      filterCategories={filterCategories}
      allCourses={allCourses}
    />
  );
}
