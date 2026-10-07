import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// Import local logo assets
import OccidentalLogo from '@/assets/usa/Los Angeles/Occidental College.png';
import LMU_Logo from '@/assets/usa/Los Angeles/Loyola Marymount University.png';
import CalStateLA_Logo from '@/assets/usa/Los Angeles/California State University, Los Angeles.png';
import DrewUniversityLogo from '@/assets/usa/Los Angeles/Charles R. Drew University of Medicine and Science.png';

// University Data for Los Angeles
const universitiesData = getByCity('usa', 'Los Angeles');

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
        { label: "AUG", value: "aug" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Broadcast Media", "Engineering Design", "Industrial Design",
    "Astronomy", "Interior Design", "Theatre", "Social Work", "Dental Studies",
    "General Engineering And Technology", "Electronics", "Cyber Security",
    "Robotics", "Physical Sciences", "Biochemistry", "Information Systems",
    "Philosophy and Religious Studies", "History", "Media & Communication",
    "Commerce", "Public Health", "Game Development", "Civil Engineering",
    "Mechanical Engineering", "Electrical Engineering", "Biomedical Engineering",
    "Aerospace Engineering", "Engineering Science", "Petroleum Engineering",
    "Legal Studies", "Law", "Gerontology", "Music", "Archaeology", "Dance",
    "Banking and Finance", "Teaching / Education Studies", "Risk Management",
    "Language and Literature", "Social and Cultural Courses",
    "Film and TV Production", "Journalism", "Creative Writing", "Advertising",
    "Audio Visual Studies", "Sociology", "Gender Studies", "Political Science",
    "Nursing and Midwifery", "Chemical Engineering", "Mathematics", "Statistics",
    "Linguistic", "English Language", "Photography", "Animation",
    "International Relations", "Behavioural Science", "Geography", "Psychology",
    "Sport / Exercise Science", "Business Analytics", "Physics", "Data Science",
    "Accounting", "Earth Sciences / Geoscience", "Geology",
    "Environmental Science / Management", "Human Geography", "Arts / Fine Art",
    "Graphic and Design Studies", "Creative Arts", "Fashion Design",
    "Product Design", "Biological Sciences", "Genetics", "Forensics",
    "Biotechnology", "Architecture", "Landscape Design and Architecture",
    "International / Global Business", "Sales And Marketing",
    "Human Resource Management", "Business Administration", "Project Management",
    "Innovation / Entrepreneurship", "Chemistry", "Pharmacology / Pharmacy",
    "Business Management", "Leadership Development", "Anthropology",
    "Medicine and Medical Studies", "Economics", "Computer Science",
    "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
    "Information Technology", "Computer Graphics", "Computer Engineering",
    "Environmental Engineering", "Software Engineering", "Management"
];

export default function LosAngelesPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Los Angeles"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Los Angeles</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Los Angeles, California"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}