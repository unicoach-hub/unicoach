import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronRight, Menu, X, Search, LayoutDashboard, LogOut,
    User as UserIcon, GraduationCap, Award, Calculator, FileText,
    Compass, Mic, Sparkles, Headphones, ArrowRight, ArrowLeft, Zap,
    Globe, BookOpen, Newspaper, Calendar, Radio, ExternalLink, Landmark, Plane
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { clearUserStorage } from '../utils/userStorage';
import logo from '@/assets/blackunicoachlogo.webp';

// ─────────────────────────────────────────────
// Country mega-menu data (matching the reference structure)
// ─────────────────────────────────────────────
const countryData = {
    USA: {
        fullName: 'USA',
        slug: 'usa',
        col1Title: 'TOP CITIES IN USA',
        col2Title: 'TOP COURSES IN USA',
        col3Title: 'TOP UNIVERSITIES IN USA',
        col1: [
            { name: 'Universities in Chicago', slug: 'chicago' },
            { name: 'Universities in Boston', slug: 'boston' },
            { name: 'Universities in Philadelphia', slug: 'philadelphia' },
            { name: 'Universities in Los Angeles', slug: 'los-angeles' },
            { name: 'Universities in Atlanta', slug: 'atlanta' },
        ],
        col2: [
            { name: 'Masters in USA', slug: 'masters' },
            { name: 'Masters in computer science in USA', slug: 'masters-cs' },
            { name: 'Masters in data science in USA', slug: 'masters-data-science' },
        ],
        col3: [
            { name: 'Harvard University', slug: 'harvard' },
            { name: 'Stanford University', slug: 'stanford' },
            { name: 'Northeastern University', slug: 'northeastern' },
            { name: 'Columbia University', slug: 'columbia' },
            { name: 'Yale University', slug: 'yale' },
        ],
    },
    UK: {
        fullName: 'UK',
        slug: 'uk',
        col1Title: 'TOP CITIES IN UK',
        col2Title: 'TOP COURSES IN UK',
        col3Title: 'TOP UNIVERSITIES IN UK',
        col1: [
            { name: 'Universities in London', slug: 'london' },
            { name: 'Universities in Glasgow', slug: 'glasgow' },
            { name: 'Universities in Leeds', slug: 'leeds' },
            { name: 'Universities in Birmingham', slug: 'birmingham' },
            { name: 'Universities in Edinburgh', slug: 'edinburgh' },
        ],
        col2: [
            { name: 'Masters in UK', slug: 'masters' },
            { name: 'Masters in Computer Science in UK', slug: 'masters-cs' },
            { name: 'Masters in Physiotherapy in UK', slug: 'masters-physiotherapy' },
        ],
        col3: [
            { name: 'University of Oxford', slug: 'oxford' },
            { name: 'University of Cambridge', slug: 'cambridge' },
            { name: 'Coventry University', slug: 'coventry' },
            { name: 'University of Leeds', slug: 'leeds-university' },
            { name: 'University of East London', slug: 'east-london' },
        ],
    },
    Canada: {
        fullName: 'Canada',
        slug: 'canada',
        col1Title: 'TOP CITIES IN CANADA',
        col2Title: 'TOP COURSES IN CANADA',
        col3Title: 'TOP UNIVERSITIES IN CANADA',
        col1: [
            { name: 'Universities in Halifax', slug: 'halifax' },
            { name: 'Universities in Montreal', slug: 'montreal' },
            { name: 'Universities in Toronto', slug: 'toronto' },
            { name: 'Universities in Edmonton', slug: 'edmonton' },
            { name: 'Universities in London, Canada', slug: 'london-canada' },
        ],
        col2: [
            { name: 'Masters in Canada', slug: 'masters' },
            { name: 'PhD in Canada', slug: 'phd' },
            { name: 'Masters in Computer Science in Canada', slug: 'masters-cs' },
        ],
        col3: [
            { name: 'Conestoga College', slug: 'conestoga' },
            { name: 'University of Toronto', slug: 'toronto-university' },
            { name: 'Lambton College', slug: 'lambton' },
            { name: 'Humber College', slug: 'humber' },
            { name: 'Centennial College', slug: 'centennial' },
        ],
    },
    Ireland: {
        fullName: 'Ireland',
        slug: 'ireland',
        col1Title: 'TOP CITIES IN IRELAND',
        col2Title: 'TOP COURSES IN IRELAND',
        col3Title: 'TOP UNIVERSITIES IN IRELAND',
        col1: [{ name: 'Universities in Dublin', slug: 'cities/dublin' }],
        col2: [
            { name: 'Masters in Ireland', slug: 'masters' },
            { name: 'PhD in Ireland', slug: 'phd' },
            { name: 'Masters in Data Science in Ireland', slug: 'masters-data-science' },
        ],
        col3: [
            { name: 'Trinity College', slug: 'trinity' },
            { name: 'IT Carlow', slug: 'it-carlow' },
            { name: 'Dublin City University', slug: 'dcu' },
            { name: 'University College Dublin', slug: 'ucd' },
            { name: 'University of Limerick', slug: 'limerick' },
        ],
    },
    Australia: {
        fullName: 'Australia',
        slug: 'australia',
        col1Title: 'TOP CITIES IN AUSTRALIA',
        col2Title: 'TOP COURSES IN AUSTRALIA',
        col3Title: 'TOP UNIVERSITIES IN AUSTRALIA',
        col1: [
            { name: 'Universities in Melbourne', slug: 'melbourne' },
            { name: 'Universities in Sydney', slug: 'sydney' },
            { name: 'Universities in Adelaide', slug: 'adelaide' },
            { name: 'Universities in Perth', slug: 'perth' },
            { name: 'Universities in Brisbane', slug: 'brisbane' },
        ],
        col2: [
            { name: 'Masters in Australia', slug: 'masters' },
            { name: 'Masters in Business Analytics in Australia', slug: 'masters-business-analytics' },
            { name: 'Masters in Public Health in Australia', slug: 'masters-public-health' },
        ],
        col3: [
            { name: 'Deakin University', slug: 'deakin' },
            { name: 'Monash University', slug: 'monash' },
            { name: 'RMIT University', slug: 'rmit' },
            { name: 'Carnegie Mellon University', slug: 'carnegie-mellon' },
            { name: 'The University of Queensland', slug: 'queensland' },
        ],
    },
    Germany: {
        fullName: 'Germany',
        slug: 'germany',
        col1Title: 'ADMISSIONS & VISA',
        col2Title: 'UNIVERSITIES IN GERMANY',
        col3Title: 'TOP COURSES IN GERMANY',
        col1: [
            { name: 'Intakes in Germany', slug: 'intakes' },
            { name: 'Summer Intake in Germany', slug: 'summer-intake' },
            { name: 'Winter intake in Germany', slug: 'winter-intake' },
            { name: 'Germany Study Visa', slug: 'visa' },
            { name: 'Why Study in Germany', slug: 'why-study' },
        ],
        col2: [
            { name: 'Best Universities in Germany', slug: 'best' },
            { name: 'Top Universities in Germany for Masters', slug: 'top-masters' },
            { name: 'Affordable Universities in Germany', slug: 'affordable' },
            { name: 'Public Universities in Germany', slug: 'public' },
            { name: 'Top Universities in Germany for Engineering', slug: 'engineering' },
        ],
        col3: [
            { name: 'Masters (MS) in Germany', slug: 'masters' },
            { name: 'MBA in Germany', slug: 'mba' },
            { name: 'PhD in Germany', slug: 'phd' },
            { name: 'Bachelors in Germany', slug: 'bachelors' },
            { name: 'Best Courses to Study in Germany', slug: 'best-courses' },
        ],
    },
    France: {
        fullName: 'France',
        slug: 'france',
        col1Title: 'ADMISSIONS & VISA',
        col2Title: 'UNIVERSITIES IN FRANCE',
        col3Title: 'TOP COURSES IN FRANCE',
        col1: [
            { name: 'France Intakes', slug: 'intakes' },
            { name: 'France Student Visa', slug: 'visa' },
            { name: 'Why Study in France', slug: 'why-study' },
        ],
        col2: [
            { name: 'Top Universities in France', slug: 'top' },
            { name: 'Affordable Universities in France', slug: 'affordable' },
            { name: 'Public Universities in France', slug: 'public' },
        ],
        col3: [
            { name: 'Masters (MS) in France', slug: 'masters' },
            { name: 'MBA in France', slug: 'mba' },
            { name: 'MBBS in France', slug: 'mbbs' },
            { name: 'MIM in France', slug: 'mim' },
            { name: 'MA in France', slug: 'ma' },
        ],
    },
    'New Zealand': {
        fullName: 'New Zealand',
        slug: 'new-zealand',
        col1Title: 'ADMISSIONS & VISA',
        col2Title: 'UNIVERSITIES IN NEW ZEALAND',
        col3Title: 'TOP COURSES IN NEW ZEALAND',
        col1: [
            { name: 'Intakes in New Zealand', slug: 'intakes' },
            { name: 'July Intake in New Zealand', slug: 'july-intake' },
            { name: 'New Zealand Student Visa', slug: 'visa' },
        ],
        col2: [
            { name: 'Top Universities in New Zealand', slug: 'top' },
            { name: 'Best Universities in New Zealand', slug: 'best' },
            { name: 'Affordable Universities in New Zealand', slug: 'affordable' },
            { name: 'Public Universities in New Zealand', slug: 'public' },
        ],
        col3: [
            { name: 'Masters (MS) in New Zealand', slug: 'masters' },
            { name: 'MBA in New Zealand', slug: 'mba' },
            { name: 'MBBS in New Zealand', slug: 'mbbs' },
            { name: 'MPH in New Zealand', slug: 'mph' },
            { name: 'MA in New Zealand', slug: 'ma' },
        ],
    },
    Italy: {
        fullName: 'Italy',
        slug: 'italy',
        col1Title: 'ADMISSIONS & VISA',
        col2Title: 'UNIVERSITIES IN ITALY',
        col3Title: 'TOP COURSES IN ITALY',
        col1: [
            { name: 'Italy Intakes', slug: 'intakes' },
            { name: 'Italy Student Visa', slug: 'visa' },
            { name: 'Study in Italy for Free', slug: 'free' },
        ],
        col2: [
            { name: 'Top Universities in Italy', slug: 'top' },
            { name: 'Public Universities in Italy', slug: 'public' },
        ],
        col3: [
            { name: 'Masters (MS) in Italy', slug: 'masters' },
            { name: 'MBA in Italy', slug: 'mba' },
            { name: 'MA in Italy', slug: 'ma' },
            { name: 'MBBS in Italy', slug: 'mbbs' },
        ],
    },
};

const examDataExtended = {
    IELTS: {
        fullName: 'IELTS',
        slug: 'ielts',
        headerLinks: [
            { name: 'Live Events & Masterclasses', path: '/events' },
            { name: 'Free IELTS Mock Tests', path: '/exams/ielts/practice-test' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'IELTS Overview', path: '/exams/ielts/overview' },
                    { name: 'IELTS Syllabus', path: '/exams/ielts/syllabus' },
                    { name: 'IELTS Types', path: '/exams/ielts/types' },
                    { name: 'IELTS Exam Fees', path: '/exams/ielts/fees' },
                    { name: 'IELTS Eligibility', path: '/exams/ielts/eligibility' },
                    { name: 'IELTS Dates', path: '/exams/ielts/dates' },
                    { name: 'IELTS Registration', path: '/exams/ielts/registration' },
                    { name: 'IELTS Coaching Centres', path: '/exams/ielts/coaching-centres' },
                    { name: 'IELTS Results', path: '/exams/ielts/results' },
                    { name: 'IELTS Slot Booking', path: '/exams/ielts/slot-booking' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Test', path: '/exams/ielts/practice-test' },
                    { name: 'Speaking', path: '/exams/ielts/speaking' },
                    { name: 'Writing', path: '/exams/ielts/writing' },
                    { name: 'Reading', path: '/exams/ielts/reading' },
                    { name: 'Listening', path: '/exams/ielts/listening' }
                ]
            }
        ]
    },
    Duolingo: {
        fullName: 'Duolingo English Test',
        slug: 'duolingo',
        headerLinks: [
            { name: 'Free Duolingo Practice Test', path: '/exams/duolingo/practice-test' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'Duolingo Overview', path: '/exams/duolingo/overview' },
                    { name: 'Duolingo Syllabus', path: '/exams/duolingo/syllabus' },
                    { name: 'Duolingo Exam Fees', path: '/exams/duolingo/fees' },
                    { name: 'Duolingo Preparation', path: '/exams/duolingo/preparation' },
                    { name: 'Duolingo Sample Questions', path: '/exams/duolingo/sample-questions' }
                ]
            },
            {
                title: 'DUOLINGO ACCEPTED COUNTRIES',
                items: [
                    { name: 'Australia', path: '/exams/duolingo/australia' },
                    { name: 'Canada', path: '/exams/duolingo/canada' },
                    { name: 'Germany', path: '/exams/duolingo/germany' },
                    { name: 'Ireland', path: '/exams/duolingo/ireland' },
                    { name: 'UK', path: '/exams/duolingo/uk' }
                ]
            }
        ]
    },
    SAT: {
        fullName: 'SAT',
        slug: 'sat',
        headerLinks: [
            { name: 'Free SAT Prep Classes', path: '/exams/sat/preparation' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'SAT Overview', path: '/exams/sat/overview' },
                    { name: 'SAT Syllabus', path: '/exams/sat/syllabus' },
                    { name: 'SAT Exam Fees', path: '/exams/sat/fees' },
                    { name: 'SAT Registration', path: '/exams/sat/registration' },
                    { name: 'SAT Test Centers', path: '/exams/sat/registration' },
                    { name: 'SAT Results', path: '/exams/sat/results' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Math Practice', path: '/exams/sat/preparation' },
                    { name: 'Reading & Writing Practice', path: '/exams/sat/preparation' }
                ]
            }
        ]
    },
    PTE: {
        fullName: 'PTE Academic',
        slug: 'pte',
        headerLinks: [
            { name: 'Free PTE masterclass', path: '/exams/pte' },
            { name: 'Free PTE Mock Tests', path: '/exams/pte' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'PTE Overview', path: '/exams/pte/overview' },
                    { name: 'PTE Syllabus', path: '/exams/pte/syllabus' },
                    { name: 'PTE Exam Fees', path: '/exams/pte/fees' },
                    { name: 'PTE Dates', path: '/exams/pte/dates' },
                    { name: 'PTE Registration', path: '/exams/pte/registration' },
                    { name: 'PTE Centres', path: '/exams/pte/centres' },
                    { name: 'PTE Results', path: '/exams/pte/results' },
                    { name: 'PTE Slot Booking', path: '/exams/pte/slot-booking' },
                    { name: 'PTE Preparation', path: '/exams/pte/preparation' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Speaking Practice', path: '/exams/pte/preparation' },
                    { name: 'Writing Practice', path: '/exams/pte/preparation' },
                    { name: 'Reading Practice', path: '/exams/pte/preparation' },
                    { name: 'Listening Practice', path: '/exams/pte/preparation' }
                ]
            }
        ]
    },
    TOEFL: {
        fullName: 'TOEFL iBT',
        slug: 'toefl',
        headerLinks: [
            { name: 'Free TOEFL Mock Tests', path: '/exams/toefl' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'TOEFL Overview', path: '/exams/toefl/overview' },
                    { name: 'TOEFL Syllabus', path: '/exams/toefl/syllabus' },
                    { name: 'TOEFL Exam Fees', path: '/exams/toefl/fees' },
                    { name: 'TOEFL Dates', path: '/exams/toefl/dates' },
                    { name: 'TOEFL Registration', path: '/exams/toefl/registration' },
                    { name: 'TOEFL Results', path: '/exams/toefl/results' },
                    { name: 'TOEFL Preparation', path: '/exams/toefl/preparation' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Speaking Practice', path: '/exams/toefl/preparation' },
                    { name: 'Writing Practice', path: '/exams/toefl/preparation' },
                    { name: 'Reading Practice', path: '/exams/toefl/preparation' },
                    { name: 'Listening Practice', path: '/exams/toefl/preparation' }
                ]
            }
        ]
    },
    GRE: {
        fullName: 'GRE General Test',
        slug: 'gre',
        headerLinks: [
            { name: 'Free GRE Mock Tests', path: '/exams/gre/practice-test' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'GRE Overview', path: '/exams/gre/overview' },
                    { name: 'GRE Syllabus', path: '/exams/gre/syllabus' },
                    { name: 'GRE Exam Fees', path: '/exams/gre/fees' },
                    { name: 'GRE Dates', path: '/exams/gre/dates' },
                    { name: 'GRE Registration', path: '/exams/gre/registration' },
                    { name: 'GRE Results', path: '/exams/gre/results' },
                    { name: 'GRE Slot Booking', path: '/exams/gre/slot-booking' },
                    { name: 'GRE Preparation', path: '/exams/gre/preparation' },
                    { name: 'GRE Practice Test', path: '/exams/gre/practice-test' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Quantitative Reasoning', path: '/exams/gre/practice-test' },
                    { name: 'Verbal Reasoning', path: '/exams/gre/practice-test' },
                    { name: 'Analytical Writing', path: '/exams/gre/practice-test' }
                ]
            }
        ]
    },
    GMAT: {
        fullName: 'GMAT Focus Edition',
        slug: 'gmat',
        headerLinks: [
            { name: 'Free GMAT Prep Resources', path: '/exams/gmat' }
        ],
        sections: [
            {
                title: 'EXAM DETAILS',
                items: [
                    { name: 'GMAT Overview', path: '/exams/gmat/overview' },
                    { name: 'GMAT Syllabus', path: '/exams/gmat/syllabus' },
                    { name: 'GMAT Exam Fees', path: '/exams/gmat/fees' },
                    { name: 'GMAT Dates', path: '/exams/gmat/dates' },
                    { name: 'GMAT Registration', path: '/exams/gmat/registration' },
                    { name: 'GMAT Results', path: '/exams/gmat/results' },
                    { name: 'GMAT Preparation', path: '/exams/gmat/preparation' },
                    { name: 'GMAT Sample Papers', path: '/exams/gmat/sample-papers' }
                ]
            },
            {
                title: 'PRACTICE',
                items: [
                    { name: 'Quantitative Section', path: '/exams/gmat/syllabus' },
                    { name: 'Verbal Section', path: '/exams/gmat/syllabus' },
                    { name: 'Data Insights', path: '/exams/gmat/syllabus' }
                ]
            }
        ]
    }
};

const resourceDataExtended = {
    BOOKS: {
        title: 'BOOKS FOR EXAM PREP',
        items: [
            { name: 'IELTS Books', path: '/resources/books/ielts-books' },
            { name: 'SAT Books', path: '/resources/books/sat-books' },
            { name: 'PTE Books', path: '/resources/books/pte-books' },
            { name: 'TOEFL Books', path: '/resources/books/toefl-books' },
            { name: 'GRE Books', path: '/resources/books/gre-books' },
            { name: 'GMAT Books', path: '/resources/books/gmat-books' }
        ]
    },
    LOR: {
        title: 'LOR (LETTER OF RECOMMENDATION)',
        items: [
            { name: 'LOR Blog', path: '/resources/lor/lor-blog' },
            { name: 'LOR for Masters', path: '/resources/lor/lor-masters' },
            { name: 'LOR for PhD', path: '/resources/lor/lor-phd' }
        ]
    },
    SOP: {
        title: 'SOP (STATEMENT OF PURPOSE)',
        items: [
            { name: 'Statement of Purpose', path: '/resources/sop/statement-of-purpose' },
            { name: 'SOP for Masters', path: '/resources/sop/sop-masters' },
            { name: 'SOP for MBA', path: '/resources/sop/sop-mba' },
            { name: 'SOP for PhD', path: '/resources/sop/sop-phd' }
        ]
    },
    CALCULATORS: {
        title: 'ADMISSION & GPA CALCULATORS',
        items: [
            { name: '✨ Admission & Scholarship Checker', path: '/eligibility-calculator' },
            { name: 'CGPA to GPA Calculator', path: '/resources/calculators/cgpa-to-gpa' },
            { name: 'CGPA to Percentage Calculator', path: '/resources/calculators/cgpa-to-percentage' },
            { name: 'CGPA to Marks Calculator', path: '/resources/calculators/cgpa-to-marks' }
        ]
    },
    OTHER: {
        title: 'OTHER RESOURCES',
        items: [
            { name: 'Counsellors', path: '/book-consultation' }
        ]
    }
};

const aiToolsNavData = [
    {
        title: 'SHORTLIST & PLAN',
        items: [
            {
                name: 'University Shortlister',
                desc: 'Explore 1,500+ global universities by fees & ranking',
                path: '/universities',
                badge: '1,500+ Unis',
                icon: GraduationCap,
                iconKey: 'graduation',
                iconBg: 'bg-blue-50 text-blue-600',
                iconHoverBg: 'group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(37,99,235,0.35)]',
                cardHoverStyle: 'hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-white',
                badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200/80 group-hover:border-blue-300 group-hover:bg-blue-100/60',
                color: '#2563eb',
            },
            {
                name: 'Scholarship Tracker',
                desc: 'Live merit & need cutoff clocks with calendar sync',
                path: '/scholarships',
                badge: 'Live Clocks',
                icon: Award,
                iconKey: 'award',
                iconBg: 'bg-amber-50 text-amber-600',
                iconHoverBg: 'group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(217,119,6,0.35)]',
                cardHoverStyle: 'hover:border-amber-200 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-white',
                badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200/80 group-hover:border-amber-300 group-hover:bg-amber-100/60',
                color: '#d97706',
            },
            {
                name: 'Admission & ROI Calculator',
                desc: 'Predict acceptance probability & scholarship fit',
                path: '/eligibility-calculator',
                badge: 'Popular',
                icon: Calculator,
                iconKey: 'calculator',
                iconBg: 'bg-emerald-50 text-emerald-600',
                iconHoverBg: 'group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(5,150,105,0.35)]',
                cardHoverStyle: 'hover:border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-white',
                badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:border-emerald-300 group-hover:bg-emerald-100/60',
                color: '#059669',
            },
            {
                name: 'AI 6-Month Roadmap',
                desc: 'Personalized intake & milestone timeline planner',
                path: '/ai-tools/study-roadmap',
                badge: 'AI Engine',
                icon: Compass,
                iconKey: 'compass',
                iconBg: 'bg-purple-50 text-purple-600',
                iconHoverBg: 'group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(147,51,234,0.35)]',
                cardHoverStyle: 'hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-white',
                badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200/80 group-hover:border-purple-300 group-hover:bg-purple-100/60',
                color: '#9333ea',
            },
            {
                name: 'Education Loan',
                desc: 'Compare banks & NBFCs, EMI calculator',
                path: '/education-loan',
                badge: 'Free Advice',
                icon: Landmark,
                iconKey: 'landmark',
                iconBg: 'bg-orange-50 text-[#DE5C2B]',
                iconHoverBg: 'group-hover:bg-[#DE5C2B] group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(222,92,43,0.35)]',
                cardHoverStyle: 'hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-white',
                badgeStyle: 'bg-orange-50 text-[#DE5C2B] border-orange-200/80 group-hover:border-orange-300 group-hover:bg-orange-100/60',
                color: '#DE5C2B',
            },
        ]
    },
    {
        title: 'WRITE & PRACTISE',
        items: [
            {
                name: 'AI Statement of Purpose (SOP)',
                desc: 'Ivy-caliber tailored academic & career SOP writer',
                path: '/ai-tools/sop-generator',
                badge: 'AI Writer',
                icon: FileText,
                iconKey: 'sop',
                iconBg: 'bg-rose-50 text-rose-600',
                iconHoverBg: 'group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(225,29,72,0.35)]',
                cardHoverStyle: 'hover:border-rose-200 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-white',
                badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200/80 group-hover:border-rose-300 group-hover:bg-rose-100/60',
                color: '#e11d48',
            },
            {
                name: 'AI Mock Visa Interview',
                desc: 'Real Consular VO question simulator with scoring',
                path: '/ai-tools/visa-prep',
                badge: 'Interactive',
                icon: Mic,
                iconKey: 'mic',
                iconBg: 'bg-cyan-50 text-cyan-600',
                iconHoverBg: 'group-hover:bg-cyan-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(8,145,178,0.35)]',
                cardHoverStyle: 'hover:border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-white',
                badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-200/80 group-hover:border-cyan-300 group-hover:bg-cyan-100/60',
                color: '#0891b2',
            },
            {
                name: 'IELTS AI Essay Examiner',
                desc: 'Official Cambridge band 0-9 scoring & feedback',
                path: '/ai-tools/ielts-evaluator',
                badge: 'Band 0-9',
                icon: Sparkles,
                iconKey: 'sparkles',
                iconBg: 'bg-indigo-50 text-indigo-600',
                iconHoverBg: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(79,70,229,0.35)]',
                cardHoverStyle: 'hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-white',
                badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 group-hover:border-indigo-300 group-hover:bg-indigo-100/60',
                color: '#4f46e5',
            },
            {
                name: 'Visa & Pre-Departure',
                desc: 'Visa filing, housing, forex & insurance',
                path: '/visa-assistance',
                badge: 'End-to-End',
                icon: Plane,
                iconKey: 'plane',
                iconBg: 'bg-orange-50 text-[#DE5C2B]',
                iconHoverBg: 'group-hover:bg-[#DE5C2B] group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(222,92,43,0.35)]',
                cardHoverStyle: 'hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-white',
                badgeStyle: 'bg-orange-50 text-[#DE5C2B] border-orange-200/80 group-hover:border-orange-300 group-hover:bg-orange-100/60',
                color: '#DE5C2B',
            },
            {
                name: '1-on-1 Expert Consultation',
                desc: 'Book 30-min strategy review with certified counsellors',
                path: '/book-consultation',
                badge: 'Free Session',
                icon: Headphones,
                iconKey: 'headphones',
                iconBg: 'bg-orange-50 text-[#DE5C2B]',
                iconHoverBg: 'group-hover:bg-[#DE5C2B] group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(222,92,43,0.35)]',
                cardHoverStyle: 'hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-white',
                badgeStyle: 'bg-orange-50 text-[#DE5C2B] border-orange-200/80 group-hover:border-orange-300 group-hover:bg-orange-100/60',
                color: '#DE5C2B',
            },
        ]
    }
];

// ─────────────────────────────────────────────
// Micro-Interactive Animated Icon Components for AI & Tools Dropdown
// ─────────────────────────────────────────────

// 1. University Shortlister: Graduation Cap Toss & Gold Sparkle Bursts
const NavShortlisterIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
            animate={isHovered ? {
                y: [0, -5, 1, 0],
                rotate: [0, -14, 8, 0],
                scale: [1, 1.15, 1.05, 1]
            } : { y: 0, rotate: 0, scale: 1 }}
            transition={isHovered ? { duration: 0.65, ease: 'easeInOut' } : { duration: 0.2 }}
        >
            <GraduationCap className="w-5 h-5 text-blue-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
        </motion.div>

        {isHovered && (
            <>
                <motion.span
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: [0, -9] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.05 }}
                    className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047]"
                />
                <motion.span
                    animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], x: [-2, -8], y: [0, -4] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: 0.2 }}
                    className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-200"
                />
                <span className="absolute inset-0 rounded-xl border border-blue-400/50 animate-ping opacity-30 pointer-events-none" />
            </>
        )}
    </div>
);

// 2. Scholarship Tracker: Pendulum Medal Swing & Specular Light Beam
const NavScholarshipIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
            animate={isHovered ? {
                rotate: [-15, 15, -9, 9, -3, 0],
                scale: [1, 1.14, 1]
            } : { rotate: 0, scale: 1 }}
            transition={isHovered ? { duration: 0.85, ease: 'easeOut' } : { duration: 0.2 }}
        >
            <Award className="w-5 h-5 text-amber-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
        </motion.div>

        {/* Specular golden light beam sweep across the medal */}
        {isHovered && (
            <>
                <motion.div
                    initial={{ x: '-120%', y: '-120%' }}
                    animate={{ x: '220%', y: '220%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.7 }}
                    className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/45 to-transparent pointer-events-none"
                />
                <motion.span
                    animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0], y: [0, -8] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fef08a]"
                />
            </>
        )}
    </div>
);

// 3. Admission & ROI Calculator: Live Match Score Counter (88% -> 98% FIT)
const NavCalculatorIcon = ({ isHovered }) => {
    const [matchScore, setMatchScore] = useState(88);

    useEffect(() => {
        let interval;
        if (isHovered) {
            interval = setInterval(() => {
                setMatchScore((prev) => (prev >= 98 ? 88 : prev + 3));
            }, 250);
        } else {
            setMatchScore(88);
        }
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {!isHovered ? (
                <Calculator className="w-5 h-5 text-emerald-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
            ) : (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center leading-none select-none"
                >
                    <span className="font-mono text-[11px] font-black text-emerald-700 group-hover:text-white tracking-tight">
                        {matchScore}%
                    </span>
                    <span className="text-[7px] uppercase font-bold text-emerald-600 group-hover:text-emerald-100 tracking-wider mt-0.5">
                        MATCH
                    </span>
                </motion.div>
            )}
            {isHovered && (
                <span className="absolute inset-0 rounded-xl border border-emerald-400/50 animate-ping opacity-30 pointer-events-none" />
            )}
        </div>
    );
};

// 4. AI 6-Month Roadmap: 360° Compass Needle Spin to North-East & Radar Wave
const NavRoadmapIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
            animate={isHovered ? {
                rotate: [0, 360, 405],
                scale: [1, 1.16, 1.05]
            } : { rotate: 0, scale: 1 }}
            transition={isHovered ? { duration: 0.85, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0.2 }}
        >
            <Compass className="w-5 h-5 text-purple-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
        </motion.div>

        {isHovered && (
            <>
                <span className="absolute inset-0 rounded-xl border border-purple-400/80 animate-ping opacity-40 pointer-events-none" />
                <motion.span
                    animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: 0.1 }}
                    className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc]"
                />
            </>
        )}
    </div>
);

// 5. AI Statement of Purpose (SOP): Vertical Glowing Laser Scan Sweep
const NavSopIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
            animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <FileText className="w-5 h-5 text-rose-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
        </motion.div>

        {/* High-tech AI Document Laser Scanning Line */}
        {isHovered && (
            <>
                <motion.div
                    animate={{ y: [-13, 13, -13] }}
                    transition={{ repeat: Infinity, duration: 1.15, ease: 'easeInOut' }}
                    className="absolute left-1 right-1 h-[2px] bg-rose-400 shadow-[0_0_8px_#f43f5e] rounded-full pointer-events-none"
                />
                <motion.span
                    animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                    className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-rose-300"
                />
            </>
        )}
    </div>
);

// 6. AI Mock Visa Interview: 3-Bar Audio Voice Equalizer & Live Beacon
const NavVisaIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {!isHovered ? (
            <Mic className="w-5 h-5 text-cyan-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
        ) : (
            /* 3-Bar Equalizer dancing dynamically on hover */
            <div className="flex items-center justify-center gap-1 h-5 select-none">
                <motion.span
                    animate={{ height: [5, 16, 7, 14, 5] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                    className="w-1 rounded-full bg-cyan-600 group-hover:bg-white"
                />
                <motion.span
                    animate={{ height: [12, 6, 18, 9, 12] }}
                    transition={{ repeat: Infinity, duration: 0.52, delay: 0.08, ease: 'easeInOut' }}
                    className="w-1 rounded-full bg-cyan-600 group-hover:bg-white"
                />
                <motion.span
                    animate={{ height: [7, 15, 8, 16, 7] }}
                    transition={{ repeat: Infinity, duration: 0.65, delay: 0.15, ease: 'easeInOut' }}
                    className="w-1 rounded-full bg-cyan-600 group-hover:bg-white"
                />
            </div>
        )}

        {isHovered && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
        )}
    </div>
);

// 7. IELTS AI Essay Examiner: Twirling Starburst & Live Band Ticker (7.5 -> 8.5)
const NavIeltsIcon = ({ isHovered }) => {
    const [band, setBand] = useState('7.5');

    useEffect(() => {
        let interval;
        if (isHovered) {
            interval = setInterval(() => {
                setBand((prev) => (prev === '7.5' ? '8.0' : prev === '8.0' ? '8.5' : '7.5'));
            }, 320);
        } else {
            setBand('7.5');
        }
        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {!isHovered ? (
                <Sparkles className="w-5 h-5 text-indigo-600 transition-colors group-hover:text-white" strokeWidth={2.2} />
            ) : (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center leading-none select-none"
                >
                    <span className="font-mono text-[10.5px] font-black text-indigo-700 group-hover:text-white tracking-tight">
                        {band}
                    </span>
                    <span className="text-[7px] uppercase font-bold text-indigo-600 group-hover:text-indigo-100 tracking-wider mt-0.5">
                        BAND
                    </span>
                </motion.div>
            )}

            {isHovered && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0.5 rounded-xl border-t border-r border-indigo-300/80 pointer-events-none"
                />
            )}
        </div>
    );
};

// 8. 1-on-1 Expert Consultation: Headset Micro-Shake & Live Counselor Pulse
const NavConsultationIcon = ({ isHovered }) => (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <motion.div
            animate={isHovered ? {
                rotate: [-8, 8, -5, 5, -2, 0],
                scale: [1, 1.15, 1.05]
            } : { rotate: 0, scale: 1 }}
            transition={isHovered ? { duration: 0.65, ease: 'easeOut' } : { duration: 0.2 }}
        >
            <Headphones className="w-5 h-5 text-[#DE5C2B] transition-colors group-hover:text-white" strokeWidth={2.2} />
        </motion.div>

        {/* Live Counselor Online Beacon */}
        {isHovered && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            </span>
        )}
    </div>
);

// ── Interactive Tool Card Component with Rich Micro-Interactions ──
const NavAiToolCard = ({ tool, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);

    const renderIcon = () => {
        switch (tool.iconKey) {
            case 'graduation':
                return <NavShortlisterIcon isHovered={isHovered} />;
            case 'award':
                return <NavScholarshipIcon isHovered={isHovered} />;
            case 'calculator':
                return <NavCalculatorIcon isHovered={isHovered} />;
            case 'compass':
                return <NavRoadmapIcon isHovered={isHovered} />;
            case 'sop':
                return <NavSopIcon isHovered={isHovered} />;
            case 'mic':
                return <NavVisaIcon isHovered={isHovered} />;
            case 'sparkles':
                return <NavIeltsIcon isHovered={isHovered} />;
            case 'headphones':
                return <NavConsultationIcon isHovered={isHovered} />;
            default:
                return tool.icon ? <tool.icon className="w-5 h-5" /> : null;
        }
    };

    return (
        <Link
            to={tool.path}
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative flex items-start gap-3.5 p-2.5 rounded-2xl bg-white border border-slate-100 ${tool.cardHoverStyle} hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer min-w-0 active:scale-[0.98] overflow-hidden`}
        >
            {/* Top accent indicator line (matches Journey active milestone bar) */}
            <div className="absolute top-0 left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-[#DE5C2B] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full z-20 pointer-events-none" />

            {/* Ambient Radial Hover Light Bloom */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{
                    background: `radial-gradient(circle at top left, ${tool.color}15 0%, transparent 70%)`
                }}
            />

            {/* Micro-Interactive Icon Shell with Halo */}
            <div
                className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconHoverBg} flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:shadow-md group-hover:ring-4 group-hover:ring-orange-500/10 relative overflow-hidden z-10`}
            >
                {renderIcon()}
            </div>

            <div className="min-w-0 flex-1 z-10">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[0.875rem] font-bold text-slate-800 group-hover:text-[#DE5C2B] transition-colors truncate">
                        {tool.name}
                    </span>
                    <span
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border transition-all duration-200 flex-shrink-0 leading-none group-hover:scale-105 group-hover:shadow-2xs ${tool.badgeStyle}`}
                    >
                        {tool.badge}
                    </span>
                </div>
                <p className="text-[11.5px] text-slate-500 font-normal leading-tight whitespace-normal break-words line-clamp-1 group-hover:text-slate-600">
                    {tool.desc}
                </p>
            </div>

            {/* Gliding Spring Arrow Indicator */}
            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#DE5C2B] self-center flex-shrink-0 pl-0.5 z-10">
                <ArrowRight size={14} className="stroke-[2.5]" />
            </div>
        </Link>
    );
};

const Navbar = () => {
    const { user, logout, openLoginModal } = useAuth();
    const { openEligibilityModal, verifiedLead, clearLead } = useLead();

    // Support both registered student (useAuth) and verified lead (useLead/localStorage)
    const currentUser = user || verifiedLead || (() => {
        try {
            const u = localStorage.getItem('user_info');
            if (u) return JSON.parse(u);
            const l = localStorage.getItem('lead_info');
            if (l) return JSON.parse(l);
        } catch (e) { }
        return null;
    })();

    const handleLogout = async () => {
        if (logout) {
            try { await logout(); } catch (e) { }
        }
        if (clearLead) clearLead();
        clearUserStorage();
        window.location.href = '/';
    };

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeCountry, setActiveCountry] = useState('USA');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeExam, setActiveExam] = useState('IELTS');
    const [activeResourceTab, setActiveResourceTab] = useState('BOOKS');
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const [mobileExpandedCountry, setMobileExpandedCountry] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };
    const closeTimer = useRef(null);

    // Automatically close mobile menu and dropdowns upon route change
    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);

    const [allCountriesData] = useState(countryData);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 15);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
    }, [location]);

    // Lock background scroll when mobile drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const selectedData = allCountriesData[activeCountry] || allCountriesData.USA;

    const open = (name) => {
        clearTimeout(closeTimer.current);
        setActiveDropdown(name);
    };
    const close = () => {
        closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
    };

    const navLinks = [
        { name: 'Study Abroad', path: '/study-abroad', type: 'study' },
        { name: 'Toolkit', path: '/ai-tools', type: 'tools' },
        { name: 'Exams', path: '/exams', type: 'exam' },
        { name: 'Resources', path: '/resources', type: 'resources' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'UniCoach', path: '/unicoach', badge: 'New' },
        { name: 'Digest', path: '/unicoach-digest' },
        { name: 'Events', path: '/events' },
        { name: 'Newsroom', path: '/newsroom' },
    ];

    const isActive = (path) => location.pathname === path;
    const isUnicoachDashboard = location.pathname.startsWith('/unicoach/dashboard');

    return (
        <header
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300
                ${scrolled
                    ? 'bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-b border-slate-100'
                    : 'bg-white border-b border-slate-100/60'}`}
        >
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-[74px] md:h-[80px]">

                    {/* Logo using main logo image */}
                    <Link to="/" className="flex-shrink-0 flex items-center select-none pr-2" data-cursor="pointer">
                        <img
                            src={logo}
                            alt="UniCoach Logo"
                            className="h-9 md:h-11 w-auto object-contain"
                            width="164"
                            height="44"
                        />
                    </Link>

                    {/* Desktop nav links with precise margins or Studio Header */}
                    {isUnicoachDashboard ? (
                        <div className="hidden lg:flex items-center gap-3 h-full">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/90 text-[#DE5C2B] text-xs font-black uppercase tracking-wider shadow-2xs">
                                <Zap size={13} className="fill-[#DE5C2B]" />
                                <span>Mentor Creator Studio</span>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 border border-emerald-200/60">
                                    0% Fee
                                </span>
                            </div>

                            {localStorage.getItem('unicoach_mentor_handle') && (
                                <a
                                    href={`/@${localStorage.getItem('unicoach_mentor_handle')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#DE5C2B] bg-slate-50 hover:bg-orange-50/60 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors"
                                    title="View your live public storefront"
                                >
                                    <span className="font-mono">/@{localStorage.getItem('unicoach_mentor_handle')}</span>
                                    <ExternalLink size={12} className="text-slate-400" />
                                </a>
                            )}
                        </div>
                    ) : (
                        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
                            {navLinks.map((link) => (
                                <div
                                    key={link.name}
                                    className="relative flex items-center h-full"
                                    onMouseEnter={() => link.type && open(link.name)}
                                    onMouseLeave={() => link.type && close()}
                                >
                                    {link.type ? (
                                        <Link
                                            to={link.path}
                                            onClick={() => setActiveDropdown(null)}
                                            data-cursor="pointer"
                                            className={`group relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-[0.84rem] xl:text-[0.875rem] font-bold tracking-tight transition-all duration-200 whitespace-nowrap hover:scale-[1.02] active:scale-95
                                            ${activeDropdown === link.name || isActive(link.path) || (link.type === 'study' && location.pathname.includes('/study-abroad'))
                                                    ? 'text-[#DE5C2B] bg-orange-50/80 shadow-2xs'
                                                    : 'text-slate-700 hover:text-[#DE5C2B] hover:bg-slate-50'}`}
                                        >
                                            {/* Micro-pulsing indicator dot when dropdown is open */}
                                            {activeDropdown === link.name && (
                                                <span className="relative flex h-1.5 w-1.5 mr-0.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DE5C2B] opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DE5C2B]" />
                                                </span>
                                            )}

                                            <span>{link.name}</span>


                                            <ChevronDown
                                                size={13}
                                                className={`transition-all duration-300 mt-0.5 transform
                                                ${activeDropdown === link.name ? 'rotate-180 text-[#DE5C2B] scale-110' : 'text-slate-400 group-hover:text-slate-600'}`}
                                            />

                                            {/* Terracotta active line with subtle glow */}
                                            {((link.type === 'study' && location.pathname.includes('/study-abroad')) || isActive(link.path) || activeDropdown === link.name) && (
                                                <motion.div
                                                    layoutId="navActiveLine"
                                                    className="absolute bottom-[-16px] left-2 right-2 h-[2.5px] bg-[#DE5C2B] rounded-full shadow-[0_2px_8px_rgba(222,92,43,0.4)]"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    ) : (
                                        <Link
                                            to={link.path}
                                            data-cursor="pointer"
                                            className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-[0.84rem] xl:text-[0.875rem] font-bold tracking-tight transition-all duration-200 whitespace-nowrap hover:scale-[1.02] active:scale-95
                                            ${isActive(link.path)
                                                    ? 'text-[#DE5C2B] bg-orange-50/80 shadow-2xs'
                                                    : 'text-slate-700 hover:text-[#DE5C2B] hover:bg-slate-50'}`}
                                        >
                                            <span>{link.name}</span>
                                            {link.badge && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white shadow-2xs group-hover:scale-105 transition-transform">
                                                    {link.badge}
                                                </span>
                                            )}

                                            {/* Underline for standard active items */}
                                            {isActive(link.path) && (
                                                <motion.div
                                                    layoutId="navActiveLine"
                                                    className="absolute bottom-[-16px] left-2 right-2 h-[2.5px] bg-[#DE5C2B] rounded-full shadow-[0_2px_8px_rgba(222,92,43,0.4)]"
                                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    )}

                                    {/* STUDY ABROAD mega-dropdown */}
                                    <AnimatePresence>
                                        {activeDropdown === link.name && link.type === 'study' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                                className="absolute top-[calc(100%-8px)] left-[-180px] w-[980px] bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 flex whitespace-normal text-left"
                                                onMouseEnter={() => open(link.name)}
                                                onMouseLeave={close}
                                            >
                                                {/* Left sidebar: off-white styled background list */}
                                                <div className="w-[210px] flex-shrink-0 bg-slate-50 border-r border-slate-100 p-4 flex flex-col gap-1">
                                                    {Object.keys(allCountriesData).map((country) => {
                                                        const isActiveCountry = activeCountry === country;
                                                        return (
                                                            <button
                                                                key={country}
                                                                onMouseEnter={() => setActiveCountry(country)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-[0.88rem] font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95
                                                                ${isActiveCountry
                                                                        ? 'bg-[#DE5C2B] text-white shadow-[0_4px_14px_rgba(222,92,43,0.28)] scale-[1.02]'
                                                                        : 'text-slate-600 hover:bg-slate-100/90 hover:text-[#DE5C2B] hover:translate-x-1'}`}
                                                            >
                                                                <span className="truncate">{country}</span>
                                                                <ChevronRight
                                                                    size={14}
                                                                    className={isActiveCountry ? 'text-white flex-shrink-0' : 'text-slate-400 group-hover:text-[#DE5C2B] flex-shrink-0 transition-transform group-hover:translate-x-0.5'}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Right content: 3 column navigation links */}
                                                <div className="flex-1 p-7 flex flex-col min-w-0">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <Link
                                                            to={`/study-abroad/${selectedData.slug}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="inline-flex items-center gap-1.5 text-[1.12rem] font-black text-slate-800 hover:text-[#DE5C2B] transition-colors group"
                                                        >
                                                            <span>Study in {selectedData.fullName}</span>
                                                            <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform text-[#DE5C2B] stroke-[2.5]" />
                                                        </Link>

                                                        <Link
                                                            to="/study-abroad"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="inline-flex items-center gap-1 text-[0.82rem] font-bold text-[#DE5C2B] hover:text-[#C04A1D] bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors"
                                                        >
                                                            <span>Explore All Destinations</span>
                                                            <ArrowRight size={13} />
                                                        </Link>
                                                    </div>

                                                    <div className="w-full h-[1px] bg-slate-100 mb-5" />

                                                    <div
                                                        className="grid gap-6 xl:gap-8"
                                                        style={{
                                                            gridTemplateColumns: `repeat(${(selectedData.col1?.length > 0 ? 1 : 0) + (selectedData.col2?.length > 0 ? 1 : 0) + (selectedData.col3?.length > 0 ? 1 : 0) || 3}, minmax(0, 1fr))`
                                                        }}
                                                    >
                                                        {/* Cities / Col 1 */}
                                                        {selectedData.col1 && selectedData.col1.length > 0 && (
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4 truncate">
                                                                    {selectedData.col1Title}
                                                                </p>
                                                                <ul className="space-y-3">
                                                                    {selectedData.col1.map((item, i) => (
                                                                        <li key={i} className="min-w-0">
                                                                            <Link
                                                                                to={item.isUniversity ? `/study-abroad/${selectedData.slug}` : `/study-abroad/${selectedData.slug}/${item.slug}`}
                                                                                className="block text-[0.88rem] text-slate-600 font-semibold hover:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words"
                                                                            >
                                                                                {item.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {/* Courses / Col 2 */}
                                                        {selectedData.col2 && selectedData.col2.length > 0 && (
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4 truncate">
                                                                    {selectedData.col2Title}
                                                                </p>
                                                                <ul className="space-y-3">
                                                                    {selectedData.col2.map((item, i) => (
                                                                        <li key={i} className="min-w-0">
                                                                            <Link
                                                                                to={
                                                                                    selectedData.slug === 'usa'
                                                                                        ? (item.slug === 'masters-cs'
                                                                                            ? `/study-abroad/usa/courses/computer-science`
                                                                                            : item.slug === 'masters-data-science'
                                                                                                ? `/study-abroad/usa/courses/data-science`
                                                                                                : `/study-abroad/usa/courses/masters`)
                                                                                        : selectedData.slug === 'uk'
                                                                                            ? (item.slug === 'masters-cs'
                                                                                                ? `/study-abroad/uk/courses/computer-science`
                                                                                                : item.slug === 'masters-physiotherapy'
                                                                                                    ? `/study-abroad/uk/courses/physiotherapy`
                                                                                                    : `/study-abroad/uk/courses/masters`)
                                                                                            : selectedData.slug === 'canada'
                                                                                                ? (item.slug === 'masters-cs'
                                                                                                    ? `/study-abroad/canada/courses/computer-science`
                                                                                                    : item.slug === 'phd'
                                                                                                        ? `/study-abroad/canada/courses/phd`
                                                                                                        : `/study-abroad/canada/courses/masters`)
                                                                                                : selectedData.slug === 'australia'
                                                                                                    ? (item.slug === 'masters-business-analytics'
                                                                                                        ? `/study-abroad/australia/courses/business-analytics`
                                                                                                        : item.slug === 'masters-public-health'
                                                                                                            ? `/study-abroad/australia/courses/public-health`
                                                                                                            : `/study-abroad/australia/courses/masters`)
                                                                                                    : selectedData.slug === 'ireland'
                                                                                                        ? (item.slug === 'masters'
                                                                                                            ? `/study-abroad/ireland/courses/masters`
                                                                                                            : item.slug === 'phd'
                                                                                                                ? `/study-abroad/ireland/courses/phd`
                                                                                                                : item.slug === 'masters-data-science'
                                                                                                                    ? `/study-abroad/ireland/courses/data-science`
                                                                                                                    : `/study-abroad/ireland/courses/${item.slug}`)
                                                                                                        : !['usa', 'uk', 'canada', 'australia', 'ireland', 'germany', 'france', 'new-zealand', 'italy'].includes(selectedData.slug)
                                                                                                            ? `/study-abroad/${selectedData.slug}/${item.slug}`
                                                                                                            : ['germany', 'france', 'new-zealand', 'italy'].includes(selectedData.slug)
                                                                                                                ? `/study-abroad/${selectedData.slug}/universities/${item.slug}`
                                                                                                                : `/study-abroad/${selectedData.slug}/${selectedData.col1[0].slug}`
                                                                                }
                                                                                className="block text-[0.88rem] text-slate-600 font-semibold hover:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words"
                                                                            >
                                                                                {item.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {/* Universities / Col 3 */}
                                                        {selectedData.col3 && selectedData.col3.length > 0 && (
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4 truncate">
                                                                    {selectedData.col3Title}
                                                                </p>
                                                                <ul className="space-y-3">
                                                                    {selectedData.col3.map((item, i) => (
                                                                        <li key={i} className="min-w-0">
                                                                            <Link
                                                                                to={
                                                                                    !['usa', 'uk', 'canada', 'australia', 'ireland', 'germany', 'france', 'new-zealand', 'italy'].includes(selectedData.slug)
                                                                                        ? `/study-abroad/${selectedData.slug}`
                                                                                        : ['usa', 'uk', 'canada', 'australia', 'ireland'].includes(selectedData.slug)
                                                                                            ? `/study-abroad/${selectedData.slug}/universities/${item.slug}`
                                                                                            : ['germany', 'france', 'new-zealand', 'italy'].includes(selectedData.slug)
                                                                                                ? `/study-abroad/${selectedData.slug}/courses/${item.slug}`
                                                                                                : `/study-abroad/${selectedData.slug}/${selectedData.col1[0].slug}`
                                                                                }
                                                                                className="block text-[0.88rem] text-slate-600 font-semibold hover:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words"
                                                                            >
                                                                                {item.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* EXAMS dropdown */}
                                    <AnimatePresence>
                                        {activeDropdown === link.name && link.type === 'exam' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                                className="absolute top-[calc(100%-8px)] left-[-100px] w-[840px] bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 flex whitespace-normal text-left"
                                                onMouseEnter={() => open(link.name)}
                                                onMouseLeave={close}
                                            >
                                                {/* Left sidebar of exams */}
                                                <div className="w-[210px] flex-shrink-0 bg-slate-50 border-r border-slate-100 p-4 flex flex-col gap-1">
                                                    {Object.keys(examDataExtended).map((exam) => {
                                                        const isActiveExam = activeExam === exam;
                                                        return (
                                                            <button
                                                                key={exam}
                                                                onMouseEnter={() => setActiveExam(exam)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-[0.88rem] font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-95
                                                                ${isActiveExam
                                                                        ? 'bg-[#DE5C2B] text-white shadow-[0_4px_14px_rgba(222,92,43,0.28)] scale-[1.02]'
                                                                        : 'text-slate-600 hover:bg-slate-100/90 hover:text-[#DE5C2B] hover:translate-x-1'}`}
                                                            >
                                                                <span className="truncate">{exam}</span>
                                                                <ChevronRight
                                                                    size={14}
                                                                    className={isActiveExam ? 'text-white flex-shrink-0' : 'text-slate-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5'}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Right content area */}
                                                <div className="flex-1 p-7 flex flex-col min-w-0">
                                                    {/* Header row containing CTAs */}
                                                    <div className="flex items-center justify-between gap-3 mb-5">
                                                        <div className="flex flex-wrap gap-5">
                                                            {(examDataExtended[activeExam] || examDataExtended.IELTS).headerLinks.map((hLink, i) => (
                                                                <Link
                                                                    key={i}
                                                                    to={hLink.path}
                                                                    onClick={() => setActiveDropdown(null)}
                                                                    className="inline-flex items-center gap-1 text-[0.95rem] font-black text-slate-800 hover:text-[#DE5C2B] transition-colors group"
                                                                >
                                                                    <span>{hLink.name}</span>
                                                                    <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform text-[#DE5C2B] flex-shrink-0" />
                                                                </Link>
                                                            ))}
                                                        </div>

                                                        <Link
                                                            to="/exams"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="inline-flex items-center gap-1 text-[0.82rem] font-bold text-[#DE5C2B] hover:text-[#C04A1D] bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors flex-shrink-0"
                                                        >
                                                            <span>View All Exams Hub</span>
                                                            <ArrowRight size={13} />
                                                        </Link>
                                                    </div>

                                                    <div className="w-full h-[1px] bg-slate-100 mb-5" />

                                                    {/* Content Grid */}
                                                    <div className="grid grid-cols-2 gap-7">
                                                        {(examDataExtended[activeExam] || examDataExtended.IELTS).sections.map((section, sIdx) => {
                                                            const isDetails = section.title === 'EXAM DETAILS';
                                                            return (
                                                                <div key={sIdx} className="min-w-0">
                                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-4 truncate">
                                                                        {section.title}
                                                                    </p>
                                                                    {isDetails ? (
                                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                                            {section.items.map((item, itemIdx) => (
                                                                                <Link
                                                                                    key={itemIdx}
                                                                                    to={item.path}
                                                                                    className="block text-[0.88rem] text-slate-600 font-semibold hover:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words"
                                                                                >
                                                                                    {item.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <ul className="space-y-3">
                                                                            {section.items.map((item, itemIdx) => (
                                                                                <li key={itemIdx} className="min-w-0">
                                                                                    <Link
                                                                                        to={item.path}
                                                                                        className="block text-[0.88rem] text-slate-600 font-semibold hover:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words"
                                                                                    >
                                                                                        {item.name}
                                                                                    </Link>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* RESOURCES dropdown */}
                                    <AnimatePresence>
                                        {activeDropdown === link.name && link.type === 'resources' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                                className="absolute top-[calc(100%-8px)] left-[-150px] w-[740px] bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 flex whitespace-normal text-left"
                                                onMouseEnter={() => open(link.name)}
                                                onMouseLeave={close}
                                            >
                                                {/* Left sidebar: off-white background styled list of resource categories */}
                                                <div className="w-[210px] flex-shrink-0 bg-slate-50 border-r border-slate-100 p-4 flex flex-col gap-1">
                                                    {Object.keys(resourceDataExtended).map((tabKey) => {
                                                        const isActiveTab = activeResourceTab === tabKey;
                                                        return (
                                                            <button
                                                                key={tabKey}
                                                                onMouseEnter={() => setActiveResourceTab(tabKey)}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-[0.88rem] font-bold rounded-xl transition-all duration-200 cursor-pointer
                                                                ${isActiveTab
                                                                        ? 'bg-[#DE5C2B] text-white shadow-[0_4px_14px_rgba(222,92,43,0.22)]'
                                                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-[#DE5C2B]'}`}
                                                            >
                                                                <span className="truncate">{tabKey}</span>
                                                                <ChevronRight
                                                                    size={14}
                                                                    className={isActiveTab ? 'text-white flex-shrink-0' : 'text-slate-400 flex-shrink-0'}
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Right content panel */}
                                                <div className="flex-1 p-7 flex flex-col justify-start min-w-0">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h3 className="text-[1.05rem] font-black text-slate-800 tracking-tight">
                                                            {resourceDataExtended[activeResourceTab].title}
                                                        </h3>
                                                        <Link
                                                            to="/resources"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="inline-flex items-center gap-1 text-[0.82rem] font-bold text-[#DE5C2B] hover:text-[#C04A1D] bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors flex-shrink-0"
                                                        >
                                                            <span>View All Resources</span>
                                                            <ArrowRight size={13} />
                                                        </Link>
                                                    </div>

                                                    <div className="w-full h-[1px] bg-slate-100 mb-5" />

                                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                                        {resourceDataExtended[activeResourceTab].items.map((item) => (
                                                            <Link
                                                                key={item.name}
                                                                to={item.path}
                                                                className="flex items-center gap-2 group/item min-w-0 hover:translate-x-1 transition-all duration-150"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#DE5C2B] group-hover/item:scale-125 transition-all duration-150 flex-shrink-0" />
                                                                <span className="text-[0.88rem] text-slate-600 font-semibold group-hover/item:text-[#DE5C2B] transition-colors leading-snug whitespace-normal break-words">
                                                                    {item.name}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* AI & TOOLS dropdown */}
                                    <AnimatePresence>
                                        {activeDropdown === link.name && link.type === 'tools' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                                className="absolute top-[calc(100%-8px)] left-[-160px] w-[840px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden z-50 p-6 whitespace-normal text-left"
                                                onMouseEnter={() => open(link.name)}
                                                onMouseLeave={close}
                                            >
                                                {/* 2-Column Grid */}
                                                <div className="grid grid-cols-2 gap-5">
                                                    {aiToolsNavData.map((category, cIdx) => (
                                                        <div key={cIdx} className="space-y-2 min-w-0">
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] animate-pulse shadow-[0_0_6px_#DE5C2B]" />
                                                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.14em] truncate">
                                                                    {category.title}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                {category.items.map((tool, tIdx) => (
                                                                    <NavAiToolCard
                                                                        key={tIdx}
                                                                        tool={tool}
                                                                        onSelect={() => setActiveDropdown(null)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Bottom Quick-Action Bar */}
                                                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-2 text-[11.5px] font-medium text-slate-500">
                                                        <span className="relative flex h-2.5 w-2.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                                        </span>
                                                        <span>Over <strong className="text-slate-800 font-bold">50,000+</strong> study abroad profiles shortlisted with UniCoach</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <Link
                                                            to="/ai-tools"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-[12px] font-bold text-slate-700 hover:text-[#DE5C2B] flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95 group"
                                                        >
                                                            <span>View Full Toolkit</span>
                                                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                                                        </Link>
                                                        <Link
                                                            to="/eligibility-calculator"
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="text-[12px] font-bold text-white bg-[#DE5C2B] hover:bg-[#c2410c] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(222,92,43,0.25)] hover:shadow-[0_6px_16px_rgba(222,92,43,0.35)] transition-all active:scale-95 group"
                                                        >
                                                            <Sparkles size={13} className="animate-pulse" />
                                                            <span>Check Profile Fit</span>
                                                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </nav>
                    )}

                    {/* Right side controls with ample breathing room */}
                    <div className="flex items-center gap-2.5 xl:gap-3.5 ml-2 xl:ml-6 flex-shrink-0">

                        {/* Sign in / User profile */}
                        {currentUser ? (
                            /* Desktop User Profile Button & Dropdown */
                            <div className="relative group hidden md:block">
                                <button className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full bg-white/90 hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-[#DE5C2B] text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-orange-100 select-none">
                                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 select-none max-w-[110px] truncate">{currentUser.name}</span>
                                    <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:rotate-180" />
                                </button>

                                {/* Premium Dropdown Card */}
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-[0_20px_45px_rgba(15,23,42,0.12)] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                                    {/* User Info Header */}
                                    <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-100/80">
                                        <div className="flex items-center gap-2.5">
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-[#DE5C2B] text-white font-black flex items-center justify-center text-sm shadow-xs select-none">
                                                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                                </div>
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-black text-slate-800 truncate">{currentUser.name}</p>
                                                    {(currentUser.isMentor || currentUser.role === 'mentor') && (
                                                        <span className="px-1.5 py-0.2 bg-orange-100 text-[#DE5C2B] text-[9.5px] font-bold rounded-full">Mentor</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="space-y-0.5">
                                        {/* 1. Student Dashboard */}
                                        <Link
                                            to="/dashboard"
                                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#DE5C2B] hover:bg-orange-50/60 rounded-xl transition-all duration-150 flex items-center justify-between group/item cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-orange-100/70 text-[#DE5C2B] flex items-center justify-center">
                                                    <LayoutDashboard size={14} />
                                                </div>
                                                <span>Student Dashboard</span>
                                            </div>
                                            <ChevronRight size={13} className="text-slate-300 group-hover/item:text-[#DE5C2B] group-hover/item:translate-x-0.5 transition-all" />
                                        </Link>

                                        {/* 2. Mentor Creator Studio — only for accounts that actually have a mentor profile */}
                                        {(currentUser.isMentor || currentUser.mentorHandle || currentUser.role === 'mentor') && (
                                        <Link
                                            to={currentUser.mentorHandle ? `/unicoach/dashboard/${currentUser.mentorHandle}` : "/unicoach/dashboard"}
                                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#DE5C2B] hover:bg-orange-50/60 rounded-xl transition-all duration-150 flex items-center justify-between group/item cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#DE5C2B] flex items-center justify-center">
                                                    <Sparkles size={14} />
                                                </div>
                                                <span>Mentor Creator Studio</span>
                                            </div>
                                            <ChevronRight size={13} className="text-slate-300 group-hover/item:text-[#DE5C2B] group-hover/item:translate-x-0.5 transition-all" />
                                        </Link>
                                        )}

                                        <div className="h-px bg-slate-100 my-1" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 rounded-xl transition-all duration-150 flex items-center gap-2.5 cursor-pointer"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-red-100/60 text-red-500 flex items-center justify-center">
                                                <LogOut size={14} />
                                            </div>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                data-cursor="pointer"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs md:text-sm font-bold text-white bg-[#111111] hover:bg-[#DE5C2B] rounded-full shadow-md shadow-black/10 hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer select-none no-underline"
                            >
                                <UserIcon size={14} className="text-white/80" />
                                <span>Login</span>
                            </Link>
                        )}

                        {/* Mobile hamburger menu */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen
                                ? <X size={24} />
                                : <Menu size={24} />}
                        </button>
                    </div>

                </div>
            </div>

            {/* ══════════════ MOBILE RESPONSIVE DRAWER (FULL HEIGHT) ══════════════ */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="lg:hidden fixed top-[74px] md:top-[80px] left-0 right-0 bottom-0 w-full bg-white border-t border-slate-100 flex flex-col z-[99] overflow-hidden"
                    >
                        <div className="max-w-[1360px] w-full mx-auto px-4 pt-3 pb-12 flex-1 overflow-y-auto flex flex-col justify-between">

                            {isUnicoachDashboard ? (
                                <div className="py-3 space-y-4">
                                    <div className="p-4 bg-orange-50/90 border border-orange-200 rounded-2xl shadow-xs">
                                        <div className="flex items-center gap-2 text-[#DE5C2B] font-black text-xs uppercase tracking-wider mb-1">
                                            <Zap size={14} className="fill-[#DE5C2B]" />
                                            <span>Mentor Creator Studio</span>
                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">
                                                0% Fee
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Manage your 1:1 sessions, priority DMs, digital products, and withdrawals.
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2">Studio Shortcuts</p>
                                        <Link
                                            to="/unicoach/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14.5px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                        >
                                            <LayoutDashboard size={18} className="text-[#DE5C2B]" />
                                            <span>Creator Studio Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14.5px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                        >
                                            <GraduationCap size={18} className="text-[#DE5C2B]" />
                                            <span>Switch to Student Dashboard</span>
                                        </Link>
                                        <Link
                                            to="/unicoach"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14.5px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                        >
                                            <Sparkles size={18} className="text-[#DE5C2B]" />
                                            <span>Explore Mentors Marketplace</span>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Accordeon Section: Study Abroad */}
                                    <MobileAccordion
                                        icon={Globe}
                                        title="Study Abroad"
                                        isOpen={mobileExpanded === 'study'}
                                        onToggle={() => setMobileExpanded(mobileExpanded === 'study' ? null : 'study')}
                                    >
                                        <div className="space-y-2 pt-1">
                                            <Link
                                                to="/study-abroad"
                                                onClick={() => setMobileOpen(false)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 text-[#DE5C2B] font-bold text-xs border border-orange-200/70 hover:bg-orange-100/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Globe size={15} />
                                                    <span>View All Study Abroad Destinations</span>
                                                </div>
                                                <ChevronRight size={14} />
                                            </Link>
                                            <div className="space-y-1.5">
                                                {Object.entries(allCountriesData).map(([country, data]) => {
                                                    const isCountryExpanded = mobileExpandedCountry === country;
                                                    return (
                                                        <div key={country} className="rounded-xl border border-slate-200/70 bg-white overflow-hidden shadow-2xs">
                                                            <button
                                                                onClick={() => setMobileExpandedCountry(isCountryExpanded ? null : country)}
                                                                className="w-full flex items-center justify-between py-2.5 px-3 text-[14.5px] font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                                            >
                                                                <span>{country}</span>
                                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${isCountryExpanded ? 'bg-orange-100/70 text-[#DE5C2B] rotate-180' : 'text-slate-400'}`}>
                                                                    <ChevronDown size={14} strokeWidth={2.4} />
                                                                </div>
                                                            </button>

                                                            <AnimatePresence>
                                                                {isCountryExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="overflow-hidden px-3 py-2.5 space-y-3 bg-slate-50/50 border-t border-slate-100"
                                                                    >
                                                                    {/* Render mobile sections for cities, courses, universities */}
                                                                    <div>
                                                                        <p className="text-[12px] font-black text-slate-600 uppercase tracking-wider mb-2">{data.col1Title}</p>
                                                                        <div className="grid grid-cols-1 gap-1">
                                                                            {data.col1.map((item, idx) => (
                                                                                <Link
                                                                                    key={idx}
                                                                                    to={item.isUniversity ? `/study-abroad/${data.slug}` : `/study-abroad/${data.slug}/${item.slug}`}
                                                                                    onClick={() => setMobileOpen(false)}
                                                                                    className="text-[14px] text-[#DE5C2B] font-semibold hover:underline py-1 block leading-snug"
                                                                                >
                                                                                    {item.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[12px] font-black text-slate-600 uppercase tracking-wider mb-2">{data.col2Title}</p>
                                                                        <div className="grid grid-cols-1 gap-1">
                                                                            {data.col2.map((item, idx) => (
                                                                                <Link
                                                                                    key={idx}
                                                                                    to={
                                                                                        data.slug === 'usa'
                                                                                            ? (item.slug === 'masters-cs'
                                                                                                ? `/study-abroad/usa/courses/computer-science`
                                                                                                : item.slug === 'masters-data-science'
                                                                                                    ? `/study-abroad/usa/courses/data-science`
                                                                                                    : `/study-abroad/usa/courses/masters`)
                                                                                            : data.slug === 'uk'
                                                                                                ? (item.slug === 'masters-cs'
                                                                                                    ? `/study-abroad/uk/courses/computer-science`
                                                                                                    : item.slug === 'masters-physiotherapy'
                                                                                                        ? `/study-abroad/uk/courses/physiotherapy`
                                                                                                        : `/study-abroad/uk/courses/masters`)
                                                                                                : data.slug === 'canada'
                                                                                                    ? (item.slug === 'masters-cs'
                                                                                                        ? `/study-abroad/canada/courses/computer-science`
                                                                                                        : item.slug === 'phd'
                                                                                                            ? `/study-abroad/canada/courses/phd`
                                                                                                            : `/study-abroad/canada/courses/masters`)
                                                                                                    : data.slug === 'australia'
                                                                                                        ? (item.slug === 'masters-business-analytics'
                                                                                                            ? `/study-abroad/australia/courses/business-analytics`
                                                                                                            : item.slug === 'masters-public-health'
                                                                                                                ? `/study-abroad/australia/courses/public-health`
                                                                                                                : `/study-abroad/australia/courses/masters`)
                                                                                                        : !['usa', 'uk', 'canada', 'australia', 'ireland', 'germany', 'france', 'new-zealand', 'italy'].includes(data.slug)
                                                                                                            ? `/study-abroad/${data.slug}/${item.slug}`
                                                                                                            : ['germany', 'france', 'new-zealand', 'italy'].includes(data.slug)
                                                                                                                ? `/study-abroad/${data.slug}/universities/${item.slug}`
                                                                                                                : `/study-abroad/${data.slug}/${data.col1[0].slug}`
                                                                                    }
                                                                                    onClick={() => setMobileOpen(false)}
                                                                                    className="text-[14px] text-[#DE5C2B] font-semibold hover:underline py-1 block leading-snug"
                                                                                >
                                                                                    {item.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[12px] font-black text-slate-600 uppercase tracking-wider mb-2">{data.col3Title}</p>
                                                                        <div className="grid grid-cols-1 gap-1">
                                                                            {data.col3.map((item, idx) => (
                                                                                <Link
                                                                                    key={idx}
                                                                                    to={
                                                                                        !['usa', 'uk', 'canada', 'australia', 'ireland', 'germany', 'france', 'new-zealand', 'italy'].includes(data.slug)
                                                                                            ? `/study-abroad/${data.slug}`
                                                                                            : ['usa', 'uk', 'canada', 'australia'].includes(data.slug)
                                                                                                ? `/study-abroad/${data.slug}/universities/${item.slug}`
                                                                                                : ['germany', 'france', 'new-zealand', 'italy'].includes(data.slug)
                                                                                                    ? `/study-abroad/${data.slug}/courses/${item.slug}`
                                                                                                    : `/study-abroad/${data.slug}/${data.col1[0].slug}`
                                                                                    }
                                                                                    onClick={() => setMobileOpen(false)}
                                                                                    className="text-[14px] text-[#DE5C2B] font-semibold hover:underline py-1 block leading-snug"
                                                                                >
                                                                                    {item.name}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        </div>
                                    </MobileAccordion>

                                    {/* Accordion Section: Admission Toolkit */}
                                    <MobileAccordion
                                        icon={Compass}
                                        title="Toolkit"
                                        badge="9 Tools"
                                        isOpen={mobileExpanded === 'tools'}
                                        onToggle={() => setMobileExpanded(mobileExpanded === 'tools' ? null : 'tools')}
                                    >
                                        <div className="space-y-3 pt-1">
                                            {/* Sleek Gradient CTA Banner */}
                                            <Link
                                                to="/ai-tools"
                                                onClick={() => setMobileOpen(false)}
                                                className="group relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#DE5C2B] to-[#F97316] text-white font-bold text-xs shadow-md shadow-orange-500/15 active:scale-[0.99] transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                                                        <Sparkles size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-[13px] leading-tight text-white">Explore Full AI Tools Suite</p>
                                                        <p className="text-[10.5px] text-white/85 font-normal leading-tight mt-0.5">Shortlist unis, live scholarships & mock visa</p>
                                                    </div>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                                                    <ChevronRight size={14} className="text-white" />
                                                </div>
                                            </Link>

                                            {/* Grouped Tool Cards */}
                                            {aiToolsNavData.map((category, cIdx) => (
                                                <div key={cIdx} className="space-y-1.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 pt-1">
                                                        {category.title}
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {category.items.map((tool, idx) => (
                                                            <Link
                                                                key={idx}
                                                                to={tool.path}
                                                                onClick={() => setMobileOpen(false)}
                                                                className="group flex items-center justify-between p-2.5 bg-white hover:bg-orange-50/50 rounded-2xl text-xs font-semibold text-slate-800 border border-slate-200/70 hover:border-orange-200 transition-all shadow-2xs active:scale-[0.98]"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${tool.iconBg || 'bg-orange-50 text-[#DE5C2B]'} ${tool.iconHoverBg || 'group-hover:bg-[#DE5C2B] group-hover:text-white'}`}>
                                                                        {tool.icon && (
                                                                            <tool.icon
                                                                                className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 text-current group-hover:text-white"
                                                                                strokeWidth={2.2}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="font-bold text-slate-900 group-hover:text-[#DE5C2B] transition-colors truncate block text-[12.5px]">
                                                                            {tool.name}
                                                                        </span>
                                                                        {tool.desc && (
                                                                            <p className="text-[10px] text-slate-500 font-normal truncate max-w-[200px] xs:max-w-[240px]">
                                                                                {tool.desc}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-2 shadow-2xs ${tool.badgeStyle || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                                    {tool.badge}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </MobileAccordion>

                                    {/* Accordion Section: Exams */}
                                    <MobileAccordion
                                        icon={GraduationCap}
                                        title="Exams"
                                        badge="Hub"
                                        isOpen={mobileExpanded === 'exams'}
                                        onToggle={() => setMobileExpanded(mobileExpanded === 'exams' ? null : 'exams')}
                                    >
                                        <div className="space-y-2.5 pt-1">
                                            <Link
                                                to="/exams"
                                                onClick={() => setMobileOpen(false)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 text-[#DE5C2B] font-bold text-xs border border-orange-200/70 hover:bg-orange-100/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap size={15} />
                                                    <span>Explore All Exams Hub</span>
                                                </div>
                                                <ChevronRight size={14} />
                                            </Link>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.keys(examDataExtended).map((exam) => {
                                                    const slug = examDataExtended[exam]?.slug || exam.toLowerCase();
                                                    return (
                                                        <Link
                                                            key={exam}
                                                            to={`/exams/${slug}`}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="flex flex-col items-center justify-center py-2.5 px-3 bg-white rounded-xl hover:bg-orange-50/70 hover:border-orange-200 text-[#DE5C2B] font-bold text-xs border border-slate-200/70 shadow-2xs transition-all active:scale-[0.98]"
                                                        >
                                                            <span>{exam}</span>
                                                            <span className="text-[9px] font-medium text-slate-400 mt-0.5">Prep & Guide</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </MobileAccordion>

                                    {/* Accordion Section: Resources */}
                                    <MobileAccordion
                                        icon={BookOpen}
                                        title="Resources"
                                        isOpen={mobileExpanded === 'resources'}
                                        onToggle={() => setMobileExpanded(mobileExpanded === 'resources' ? null : 'resources')}
                                    >
                                        <div className="space-y-3 pt-1">
                                            <Link
                                                to="/resources"
                                                onClick={() => setMobileOpen(false)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 text-[#DE5C2B] font-bold text-xs border border-orange-200/70 hover:bg-orange-100/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={15} />
                                                    <span>View All Resources & Toolkits</span>
                                                </div>
                                                <ChevronRight size={14} />
                                            </Link>
                                            {Object.entries(resourceDataExtended).map(([key, section]) => (
                                                <div key={key} className="space-y-1.5">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{section.title}</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {section.items.map((item) => (
                                                            <Link
                                                                key={item.name}
                                                                to={item.path}
                                                                onClick={() => setMobileOpen(false)}
                                                                className="text-xs text-slate-800 hover:text-[#DE5C2B] font-bold py-2 px-2.5 bg-white rounded-xl hover:bg-orange-50/60 transition-all text-center border border-slate-200/70 shadow-2xs truncate block"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </MobileAccordion>

                                    {/* Standard Nav links for Mobile — Clean list style */}
                                    <div className="pt-2 pb-1 space-y-0.5">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 py-1">
                                            Explore UniCoach
                                        </p>
                                        {[
                                            { name: 'UniCoach Mentorship', path: '/unicoach', icon: Sparkles, badge: 'Popular', color: 'text-amber-600 bg-amber-50' },
                                            { name: 'Blogs & Articles', path: '/blogs', icon: FileText, color: 'text-blue-600 bg-blue-50' },
                                            { name: 'UniCoach Digest', path: '/unicoach-digest', icon: Newspaper, color: 'text-emerald-600 bg-emerald-50' },
                                            { name: 'Global Events', path: '/events', icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
                                            { name: 'Newsroom', path: '/newsroom', icon: Radio, color: 'text-rose-600 bg-rose-50' },
                                        ].map((l) => {
                                            const Icon = l.icon;
                                            return (
                                                <Link
                                                    key={l.name}
                                                    to={l.path}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center justify-between py-2.5 px-1 rounded-lg text-[14.5px] font-semibold text-slate-800 hover:text-[#DE5C2B] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${l.color}`}>
                                                            <Icon size={16} strokeWidth={2} />
                                                        </div>
                                                        <span className="truncate">{l.name}</span>
                                                    </div>
                                                    {l.badge ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-orange-100/80 text-[#DE5C2B]">
                                                            {l.badge}
                                                        </span>
                                                    ) : (
                                                        <ChevronRight size={15} className="text-slate-300" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ══════════ BOTTOM AUTH SECTION (CLEAN SINGLE AUTH) ══════════ */}
                            <div className="pt-4 pb-2 mt-auto border-t border-slate-100">
                                {currentUser ? (
                                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs">
                                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/70">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-[#DE5C2B] text-white font-bold flex items-center justify-center text-xs shadow-xs select-none">
                                                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-2.5">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-[#DE5C2B] hover:bg-[#C04A1D] rounded-lg text-center shadow-xs select-none"
                                            >
                                                <LayoutDashboard size={13} />
                                                <span>My Dashboard</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-center cursor-pointer select-none"
                                            >
                                                <LogOut size={13} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileOpen(false)}
                                            className="w-full py-3 px-4 flex items-center justify-center gap-2 text-center text-white font-bold text-sm bg-gradient-to-r from-orange-500 via-[#DE5C2B] to-[#DE5C2B] hover:opacity-95 active:scale-[0.99] rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer select-none no-underline"
                                        >
                                            <UserIcon size={16} />
                                            <span>Sign In to UniCoach</span>
                                        </Link>
                                        <p className="text-center text-xs text-slate-500 font-medium">
                                            Don't have an account?{' '}
                                            <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-[#DE5C2B] font-bold hover:underline">
                                                Create free account
                                            </Link>
                                        </p>
                                    </div>
                                )}

                                {/* Drawer footer copyright */}
                                <div className="pt-2 text-center">
                                    <p className="text-[10px] font-semibold text-slate-400">UniCoach Study Abroad &copy; 2026</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

// Reusable Mobile Accordion wrapper — Clean minimal list style (no bulky outer boxes)
const MobileAccordion = ({ icon: Icon, title, badge, isOpen, onToggle, children }) => (
    <div className="border-b border-slate-100 last:border-b-0 transition-colors">
        <button
            type="button"
            onClick={onToggle}
            className={`w-full flex items-center justify-between py-3.5 px-1 text-[15px] font-semibold transition-colors cursor-pointer select-none ${
                isOpen ? 'text-[#DE5C2B]' : 'text-slate-800 hover:text-slate-950'
            }`}
        >
            <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-[#DE5C2B] text-white' : 'bg-orange-50 text-[#DE5C2B]'
                    }`}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                )}
                <span className="font-semibold tracking-tight">{title}</span>
                {badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-orange-100/80 text-[#DE5C2B]">
                        {badge}
                    </span>
                )}
            </div>
            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#DE5C2B]' : 'text-slate-400'}`}>
                <ChevronDown size={16} strokeWidth={2.2} />
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden pb-3.5 pt-1 pl-3 pr-1"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default Navbar;