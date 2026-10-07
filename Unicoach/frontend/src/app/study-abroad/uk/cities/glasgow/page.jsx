import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Glasgow
const universitiesData = getByCity('uk', 'Glasgow');

// Filter Categories
const filterCategories = {
    fees: [
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
    "Engineering Design", "Industrial Design", "Physiotherapy", "Astronomy", "Interior Design",
    "Theatre", "Social Work", "Dental Studies", "Animal and Veterinary Studies", "Cyber Security",
    "Physical Sciences", "Biochemistry", "Philosophy and Religious Studies", "History",
    "Media & Communication", "Public Health", "Civil Engineering", "Mechanical Engineering",
    "Electrical Engineering", "Biomedical Engineering", "Aerospace Engineering", "Marine Engineering",
    "Legal Studies", "Law", "Music", "Archaeology", "Dance", "Banking and Finance",
    "Teaching / Education studies", "Risk Management", "Language and Literature", "Film and TV production",
    "Journalism", "Creative Writing", "Sociology", "Political Science", "Nursing and midwifery",
    "Chemical Engineering", "Mathematics", "Photography", "Animation", "International Relations",
    "Geography", "Psychology", "Business Analytics", "Physics", "Data Science", "Accounting",
    "Earth Sciences / Geoscience", "Geology", "Environmental science / management", "Arts / Fine Art",
    "Graphic and Design Studies", "Creative Arts", "Fashion Design", "Crafts and textiles",
    "Product Design", "Biological Sciences", "Genetics", "Zoology", "Biotechnology",
    "Architecture", "Construction Management", "International / Global Business", "Sales And Marketing",
    "Human resource Management", "Business Administration", "Chemistry", "Pharmacology / Pharmacy",
    "Business Management", "Anthropology", "Medicine and Medical Studies", "Economics",
    "Computer Science", "Artificial Intelligence / Machine Learning", "Information technology",
    "Computer Engineering", "Environmental Engineering", "Software Engineering", "Management"
];

export default function GlasgowPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Glasgow"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Glasgow</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Glasgow, Scotland"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
