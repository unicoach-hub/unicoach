import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Birmingham
const universitiesData = getByCity('uk', 'Birmingham');

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
        { label: "JAN", value: "jan" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Physiotherapy", "Interior Design", "Social Work", "Dental Studies", "Cyber Security",
    "Biochemistry", "Philosophy and Religious Studies", "History", "Media & Communication",
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Law", "Music",
    "Archaeology", "Banking and Finance", "Teaching / Education studies", "Language and Literature",
    "Film and TV production", "Journalism", "Creative Writing", "Sociology", "Political Science",
    "Nursing and midwifery", "Chemical Engineering", "Mathematics", "Photography", "International Relations",
    "Geography", "Psychology", "Sport / Exercise Science", "Business Analytics", "Physics",
    "Data Science", "Accounting", "Arts / Fine Art", "Graphic and Design Studies", "Creative Arts",
    "Fashion Design", "Biological Sciences", "Architecture", "Construction Management",
    "Sales And Marketing", "Human resource Management", "Business Administration", "Chemistry",
    "Food And Hospitality", "Pharmacology / Pharmacy", "Business Management", "Tourism",
    "Medicine and Medical Studies", "Economics", "Computer Science", "Artificial Intelligence / Machine Learning",
    "Health Sciences / Administration", "Information technology", "Software Engineering"
];

export default function BirminghamPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Birmingham"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Birmingham</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Birmingham, United Kingdom"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
