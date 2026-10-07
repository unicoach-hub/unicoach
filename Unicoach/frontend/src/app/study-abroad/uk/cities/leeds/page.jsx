import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// University Data for Leeds
const universitiesData = getByCity('uk', 'Leeds');

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
    "Broadcast Media", "Industrial Design", "Physiotherapy", "Interior Design", "Theatre",
    "Social Work", "Dental Studies", "Cyber Security", "Biochemistry", "History",
    "Media & Communication", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Law", "Music", "Dance", "Banking and Finance", "Teaching / Education studies",
    "Language and Literature", "Film and TV production", "Journalism", "Creative Writing",
    "Audio Visual Studies", "Sociology", "Political Science", "Nursing and midwifery",
    "Chemical Engineering", "Mathematics", "Photography", "Animation", "International Relations",
    "Geography", "Psychology", "Sport / Exercise Science", "Physics", "Food / Agricultural Science",
    "Accounting", "Earth Sciences / Geoscience", "Environmental science / management", "Arts / Fine Art",
    "Graphic and Design Studies", "Creative Arts", "Fashion Design", "Product Design",
    "Biological Sciences", "Forensics", "Biotechnology", "Architecture", "Construction Management",
    "International / Global Business", "Sales And Marketing", "Human resource Management",
    "Business Administration", "Sports Management", "Chemistry", "Food And Hospitality",
    "Business Management", "Tourism", "Medicine and Medical Studies", "Economics",
    "Computer Science", "Health Sciences / Administration", "Information technology"
];

export default function LeedsPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Leeds"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Leeds</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Leeds, United Kingdom"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}
