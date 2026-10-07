import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Melbourne, Australia
const universitiesData = getByCity('australia', 'Melbourne');

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
    { label: "UG Diploma / Certificate / Associate Degree", value: "ug-diploma" },
    { label: "Postgraduate", value: "postgraduate" }
  ],
  intake: [
    { label: "FEB", value: "feb" },
    { label: "MAR", value: "mar" },
    { label: "JUL", value: "jul" },
    { label: "NOV", value: "nov" }
  ]
};

// All courses for filter
const allCourses = [
  "Industrial Engineering", "Broadcast Media", "Engineering Design", "Industrial Design",
  "Physiotherapy", "Speech Pathology", "Interior Design", "Theatre", "Social Work",
  "Dental Studies", "Animal and Veterinary Studies", "Materials and Mineral Engineering",
  "Manufacturing Engineering", "General Engineering And Technology", "Electronics",
  "Cyber Security", "Automotive engineering", "Robotics", "Physical Sciences",
  "Biochemistry", "Information Systems", "Philosophy and Religious Studies", "History",
  "Media & Communication", "Commerce", "Public Health", "Game Development",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
  "Biomedical Engineering", "Aerospace Engineering", "Engineering Science",
  "Legal Studies", "Law", "Music", "Archaeology", "Banking and Finance",
  "Teaching / Education studies", "Language and Literature", "Film and TV production",
  "Journalism", "Advertising", "Audio Visual Studies", "Sociology", "Political Science",
  "Occupational Health & Safety", "Nursing and midwifery", "Chemical Engineering",
  "Mathematics", "Statistics", "Photography", "Animation", "International Relations",
  "Behavioural Science", "Geography", "Psychology", "Sport / Exercise Science",
  "Business Analytics", "Physics", "Data Science", "Food / Agricultural Science",
  "Accounting", "Earth Sciences / Geoscience", "Environmental science / management",
  "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts", "Fashion Design",
  "Product Design", "Biological Sciences", "Biotechnology", "Architecture",
  "Construction Management", "Landscape design and architecture", "Planning",
  "Building Technology", "International / Global Business", "Sales And Marketing",
  "Human resource Management", "Business Administration", "Project Management",
  "Innovation / Entrepreneurship", "Chemistry", "Food And Hospitality",
  "Pharmacology / Pharmacy", "Business Management", "Anthropology",
  "Medicine and Medical Studies", "Economics", "Computer Science",
  "Health Sciences / Administration", "Information technology", "Computer Graphics",
  "Computer Engineering", "Environmental Engineering", "Software Engineering",
  "Web Development", "Management"
];

export default function MelbournePage() {
  return (
    <CityUniversitiesTemplate
      cityName="Melbourne"
      // 👇 Page Header Texts — Customize anytime directly here:
      title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Melbourne</span></>}
      subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
      badgeText="Study in Melbourne, Victoria"
      universitiesData={universitiesData}
      filterCategories={filterCategories}
      allCourses={allCourses}
    />
  );
}
