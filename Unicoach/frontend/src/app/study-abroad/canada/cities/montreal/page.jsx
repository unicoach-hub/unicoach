import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Montreal
const universitiesData = getByCity('canada', 'Montreal');

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
        { label: "JAN", value: "jan" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Physiotherapy", "Astronomy", "Theatre", "Social Work",
    "Dental Studies", "Animal and Veterinary Studies", "Materials and Mineral Engineering",
    "Manufacturing Engineering", "General Engineering And Technology", "Biochemistry",
    "Philosophy and Religious Studies", "History", "Media & Communication", "Public Health",
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Biomedical Engineering",
    "Mining Engineering", "Law", "Music", "Archaeology", "Dance", "Banking and Finance",
    "Teaching / Education studies", "Language and Literature", "Journalism", "Sociology",
    "Political Science", "Nursing and midwifery", "Chemical Engineering", "Mathematics",
    "Geography", "Psychology", "Physics", "Food / Agricultural Science", "Accounting",
    "Earth Sciences / Geoscience", "Geology", "Environmental science / management",
    "Arts / Fine Art", "Graphic and Design Studies", "Biological Sciences", "Biotechnology",
    "Architecture", "Construction Management", "Business Administration", "Project Management",
    "Chemistry", "Pharmacology / Pharmacy", "Anthropology", "Medicine and Medical Studies",
    "Economics", "Computer Science", "Information technology", "Computer Engineering",
    "Environmental Engineering", "Software Engineering", "Management"
];

export default function MontrealPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Montreal"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Montreal</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Montreal, Quebec"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
