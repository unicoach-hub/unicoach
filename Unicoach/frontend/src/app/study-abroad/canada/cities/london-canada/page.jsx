import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for London, Canada
const universitiesData = getByCity('canada', 'London');

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
    "Social Work", "Dental Studies", "Philosophy and Religious Studies", "History",
    "Media & Communication", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Law", "Music", "Teaching / Education studies", "Language and Literature",
    "Social and Cultural Courses", "Journalism", "Sociology", "Political Science",
    "Nursing and midwifery", "Chemical Engineering", "Mathematics", "Psychology",
    "Physics", "Food / Agricultural Science", "Accounting", "Biological Sciences",
    "Business Administration", "Chemistry", "Medicine and Medical Studies", "Economics",
    "Computer Science", "Health Sciences / Administration", "Computer Engineering",
    "Software Engineering"
];

export default function LondonCanadaPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="London"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">London</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in London, Ontario"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
