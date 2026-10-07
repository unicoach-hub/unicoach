import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Perth, Australia
const universitiesData = getByCity('australia', 'Perth');

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
    { label: "PG Diploma / Certificate", value: "pg-diploma" },
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
  "Industrial Engineering", "Industrial Design", "Physiotherapy", "Social Work",
  "Dental Studies", "Animal and Veterinary Studies", "Cyber Security",
  "Media & Communication", "Game Development", "Civil Engineering",
  "Mechanical Engineering", "Electrical Engineering", "Biomedical Engineering",
  "Mining Engineering", "Petroleum Engineering", "Law", "Music", "Banking and Finance",
  "Teaching / Education studies", "Journalism", "Nursing and midwifery",
  "Chemical Engineering", "Mathematics", "Psychology", "Sport / Exercise Science",
  "Physics", "Food / Agricultural Science", "Accounting", "Geology",
  "Environmental science / management", "Marine science", "Arts / Fine Art",
  "Graphic and Design Studies", "Biological Sciences", "Forensics", "Biotechnology",
  "Architecture", "Construction Management", "Sales And Marketing",
  "Human resource Management", "Business Administration", "Project Management",
  "Chemistry", "Pharmacology / Pharmacy", "Medicine and Medical Studies", "Economics",
  "Computer Science", "Health Sciences / Administration", "Information technology",
  "Environmental Engineering", "Software Engineering"
];

export default function PerthPage() {
  return (
    <CityUniversitiesTemplate
      cityName="Perth"
      // 👇 Page Header Texts — Customize anytime directly here:
      title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Perth</span></>}
      subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
      badgeText="Study in Perth, Western Australia"
      universitiesData={universitiesData}
      filterCategories={filterCategories}
      allCourses={allCourses}
    />
  );
}
