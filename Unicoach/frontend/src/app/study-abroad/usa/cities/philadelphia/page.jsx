import { getByCity } from '@/data/universities';

'use client';

import React from 'react';
import CityUniversitiesTemplate from '@/components/CityUniversitiesTemplate';

// Import local logo assets
import UPennLogo from '@/assets/usa/Philadelphia/University of Pennsylvania.png';
import TempleLogo from '@/assets/usa/Philadelphia/Temple University.jpeg';
import SJU_Logo from "@/assets/usa/Philadelphia/Saint Joseph's University.png";
import DrexelLogo from '@/assets/usa/Philadelphia/Drexel University.png';
import JeffersonLogo from '@/assets/usa/Philadelphia/Thomas Jefferson University.jpg';

// University Data for Philadelphia
const universitiesData = getByCity('usa', 'Philadelphia');

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
        { label: "MAY", value: "may" },
        { label: "AUG", value: "aug" },
        { label: "SEP", value: "sep" }
    ]
};

// All courses for filter
const allCourses = [
    "Industrial Engineering", "Broadcast Media", "Engineering Design", "Industrial Design",
    "Physiotherapy", "Speech Pathology", "Interior Design", "Theatre", "Social Work",
    "Dental Studies", "Animal and Veterinary Studies", "Justice Studies",
    "Materials and Mineral Engineering", "Electronics", "Systems Engineering",
    "Cyber Security", "Robotics", "Physical Sciences", "Biochemistry",
    "Information Systems", "Philosophy and Religious Studies", "History",
    "Media & Communication", "Public Health", "Game Development",
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Biomedical Engineering", "Legal Studies", "Law", "Music", "Archaeology",
    "Dance", "Banking and Finance", "Teaching / Education Studies",
    "Language and Literature", "Social and Cultural Courses",
    "Film and TV Production", "Journalism", "Creative Writing", "Advertising",
    "Sociology", "Political Science", "Nursing and Midwifery",
    "Chemical Engineering", "Mathematics", "Statistics", "English Language",
    "Photography", "Animation", "International Relations", "Psychology",
    "Sport / Exercise Science", "Business Analytics", "Physics", "Data Science",
    "Accounting", "Environmental Science / Management", "Arts / Fine Art",
    "Graphic and Design Studies", "Creative Arts", "Fashion Design",
    "Biological Sciences", "Genetics", "Zoology", "Biotechnology",
    "Architecture", "Construction Management", "International / Global Business",
    "Sales And Marketing", "Human Resource Management", "Business Administration",
    "Project Management", "Innovation / Entrepreneurship", "Chemistry",
    "Food And Hospitality", "Pharmacology / Pharmacy", "Business Management",
    "Logistics / Supply Chain", "Tourism", "Anthropology",
    "Medicine and Medical Studies", "Economics", "Computer Science",
    "Artificial Intelligence / Machine Learning", "Health Sciences / Administration",
    "Information Technology", "Computer Engineering", "Environmental Engineering",
    "Software Engineering", "Management"
];

export default function PhiladelphiaPage() {
    return (
        <CityUniversitiesTemplate 
            cityName="Philadelphia"
            // 👇 Page Header Texts — Customize anytime directly here:
            title={<>Top Universities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-[#DE5C2B]">Philadelphia</span></>}
            subtitle="Explore rankings, fees, and eligibility for leading institutions in 2026."
            badgeText="Study in Philadelphia, Pennsylvania"
            universitiesData={universitiesData}
            filterCategories={filterCategories}
            allCourses={allCourses}
        />
    );
}