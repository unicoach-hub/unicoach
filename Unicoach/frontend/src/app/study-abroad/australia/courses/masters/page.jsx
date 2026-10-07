import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, Award, MapPin, Building } from 'lucide-react';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../../../utils/universitySearchMatcher';

// ─────────────────────────────────────────────
// Australia Masters — 40 Universities
// ─────────────────────────────────────────────
const universityDatabase = [
  { id: 1,  name: "University of Melbourne",           city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 14 QS Rankings",  rankValue: 14,   tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/unimelb.edu.au",       website: "https://www.unimelb.edu.au",       courses: ["Business Administration","Computer Science","Law","Medicine and Medical Studies","Engineering Science","Data Science","Architecture","Business Analytics","Accounting","Economics","Psychology","Nursing and midwifery","Software Engineering","Artificial Intelligence / Machine Learning","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "Australia's #1 ranked university offering world-class Masters programmes across medicine, law, engineering, and business.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Mar 01, 2026" },
  { id: 2,  name: "University of New South Wales",     city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                 rank: "Rank 19 QS Rankings",  rankValue: 19,   tuition: 25, type: "PUBLIC", logo: "https://logo.clearbit.com/unsw.edu.au",          website: "https://www.unsw.edu.au",          courses: ["Computer Science","Business Analytics","Engineering Science","Law","Business Administration","Data Science","Software Engineering","Finance","Medicine and Medical Studies","Accounting","Economics","Cyber Security","Artificial Intelligence / Machine Learning","Public Health","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A world top-20 university renowned for engineering, law, and business with exceptional Masters programmes.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Mar 01, 2026" },
  { id: 3,  name: "University of Sydney",              city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                 rank: "Rank 19 QS Rankings",  rankValue: 19,   tuition: 27, type: "PUBLIC", logo: "https://logo.clearbit.com/sydney.edu.au",        website: "https://www.sydney.edu.au",        courses: ["Law","Medicine and Medical Studies","Business Administration","Engineering Science","Computer Science","Architecture","Psychology","Data Science","Economics","Accounting","Business Analytics","Public Health","Nursing and midwifery","Biological Sciences","Arts / Fine Art"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "Australia's first university, consistently ranked top-20 globally for law, medicine, architecture, and the arts.", eligibility: "GPA 3.5+, IELTS 7.0+", deadline: "Mar 15, 2026" },
  { id: 4,  name: "Australian National University",    city: "Canberra",       state: "Australian Capital Territory",  location: "Canberra, Australian Capital Territory, Australia",  rank: "Rank 34 QS Rankings",  rankValue: 34,   tuition: 23, type: "PUBLIC", logo: "https://logo.clearbit.com/anu.edu.au",           website: "https://www.anu.edu.au",           courses: ["International Relations","Political Science","Law","Computer Science","Economics","Business Administration","Engineering Science","Environmental science / management","Data Science","Physics","Mathematics","Philosophy and Religious Studies","Public Health","Biological Sciences","Psychology"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["JAN","FEB","JUL"], description: "Australia's national university, a global leader in research, policy studies, and international relations.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Mar 01, 2026" },
  { id: 5,  name: "Monash University",                 city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 42 QS Rankings",  rankValue: 42,   tuition: 17, type: "PUBLIC", logo: "https://logo.clearbit.com/monash.edu",           website: "https://www.monash.edu",           courses: ["Business Analytics","Computer Science","Engineering Science","Pharmacy","Business Administration","Data Science","Law","Nursing and midwifery","Accounting","Economics","Environmental science / management","Software Engineering","Medicine and Medical Studies","Artificial Intelligence / Machine Learning","Public Health"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","NOV"], description: "A leading global research university with international campuses, known for pharmacy, engineering, and business.", eligibility: "GPA 3.3+, IELTS 6.5+", deadline: "Mar 15, 2026" },
  { id: 6,  name: "University of Queensland",          city: "Brisbane",       state: "Queensland",                    location: "Brisbane, Queensland, Australia",                    rank: "Rank 43 QS Rankings",  rankValue: 43,   tuition: 20, type: "PUBLIC", logo: "https://logo.clearbit.com/uq.edu.au",            website: "https://www.uq.edu.au",            courses: ["Business Analytics","Computer Science","Biological Sciences","Engineering Science","Business Administration","Data Science","Medicine and Medical Studies","Public Health","Economics","Environmental science / management","Nursing and midwifery","Law","Psychology","Software Engineering","Food / Agricultural Science"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A world top-50 research university celebrated for life sciences, engineering, and business programmes.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Apr 01, 2026" },
  { id: 7,  name: "University of Western Australia",   city: "Perth",          state: "Western Australia",             location: "Perth, Western Australia, Australia",               rank: "Rank 72 QS Rankings",  rankValue: 72,   tuition: 23, type: "PUBLIC", logo: "https://logo.clearbit.com/uwa.edu.au",           website: "https://www.uwa.edu.au",           courses: ["Business Administration","Computer Science","Engineering Science","Law","Medicine and Medical Studies","Data Science","Economics","Environmental science / management","Mining Engineering","Public Health","Biological Sciences","Architecture","Psychology","Accounting","Nursing and midwifery"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A prestigious Group of Eight research university in Perth offering top Masters in law, medicine, and engineering.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Apr 01, 2026" },
  { id: 8,  name: "University of Adelaide",            city: "Adelaide",       state: "South Australia",               location: "Adelaide, South Australia, Australia",              rank: "Rank 89 QS Rankings",  rankValue: 89,   tuition: 28, type: "PUBLIC", logo: "https://logo.clearbit.com/adelaide.edu.au",     website: "https://www.adelaide.edu.au",     courses: ["Engineering Science","Computer Science","Business Administration","Law","Medicine and Medical Studies","Data Science","Economics","Agriculture","Environmental science / management","Accounting","Biomedical Engineering","Public Health","Chemical Engineering","Pharmacology / Pharmacy","Biological Sciences"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","MAR","JUL","SEP"], description: "A prestigious Group of Eight university with excellence in agriculture, medicine, engineering, and wine science.", eligibility: "GPA 3.5+, IELTS 6.5+", deadline: "Apr 01, 2026" },
  { id: 9,  name: "University of Technology Sydney",   city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                rank: "Rank 90 QS Rankings",  rankValue: 90,   tuition: 40, type: "PUBLIC", logo: "https://logo.clearbit.com/uts.edu.au",           website: "https://www.uts.edu.au",           courses: ["Computer Science","Data Science","Business Administration","Software Engineering","Engineering Science","Business Analytics","Artificial Intelligence / Machine Learning","Public Health","Accounting","Cyber Security","Architecture","Communication","Nursing and midwifery","Information technology","Economics"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A leading tech-focused university in Sydney's CBD, offering innovative programmes in IT, engineering, and business.", eligibility: "GPA 3.2+, IELTS 6.5+", deadline: "Apr 15, 2026" },
  { id: 10, name: "Macquarie University",              city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                rank: "Rank 130 QS Rankings", rankValue: 130,  tuition: 26, type: "PUBLIC", logo: "https://logo.clearbit.com/mq.edu.au",            website: "https://www.mq.edu.au",            courses: ["Business Analytics","Business Administration","Computer Science","Data Science","Accounting","Law","Psychology","Economics","Engineering Science","Software Engineering","Public Health","Linguistics","International Relations","Finance","Biological Sciences"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A research-intensive Sydney university known for business analytics, cognitive science, and linguistics.", eligibility: "GPA 3.2+, IELTS 6.5+", deadline: "Apr 15, 2026" },
  { id: 11, name: "RMIT University",                   city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 140 QS Rankings", rankValue: 140,  tuition: 12, type: "PUBLIC", logo: "https://logo.clearbit.com/rmit.edu.au",          website: "https://www.rmit.edu.au",          courses: ["Business Analytics","Computer Science","Engineering Science","Business Administration","Architecture","Data Science","Software Engineering","Fashion Design","Accounting","Artificial Intelligence / Machine Learning","Information technology","Graphic and Design Studies","Cyber Security","Environmental Engineering","Project Management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","NOV"], description: "A globally connected university of technology and design, offering industry-focused Masters in the heart of Melbourne.", eligibility: "GPA 3.0+, IELTS 6.5+", deadline: "Apr 15, 2026" },
  { id: 12, name: "University of Wollongong",          city: "Wollongong",     state: "New South Wales",               location: "Wollongong, New South Wales, Australia",            rank: "Rank 162 QS Rankings", rankValue: 162,  tuition: 21, type: "PUBLIC", logo: "https://logo.clearbit.com/uow.edu.au",           website: "https://www.uow.edu.au",           courses: ["Computer Science","Engineering Science","Business Administration","Data Science","Business Analytics","Public Health","Accounting","Psychology","Mathematics","Materials and Mineral Engineering","Information Systems","Software Engineering","Environmental science / management","Nursing and midwifery","Law"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A dynamic research university south of Sydney offering excellent Masters in engineering, IT, health, and business.", eligibility: "GPA 3.0+, IELTS 6.5+", deadline: "May 01, 2026" },
  { id: 13, name: "University of Newcastle",           city: "Newcastle",      state: "New South Wales",               location: "Newcastle, New South Wales, Australia",             rank: "Rank 173 QS Rankings", rankValue: 173,  tuition: null, type: "PUBLIC", logo: "https://logo.clearbit.com/newcastle.edu.au",    website: "https://www.newcastle.edu.au",    courses: ["Engineering Science","Business Administration","Computer Science","Nursing and midwifery","Medicine and Medical Studies","Business Analytics","Data Science","Public Health","Environmental science / management","Law","Psychology","Architecture","Teaching / Education studies"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A research-led university in Newcastle known for engineering, health sciences, and sustainable development.", eligibility: "GPA 3.0+, IELTS 6.5+", deadline: "May 01, 2026" },
  { id: 14, name: "Curtin University",                 city: "Perth",          state: "Western Australia",             location: "Perth, Western Australia, Australia",               rank: "Rank 183 QS Rankings", rankValue: 183,  tuition: 12, type: "PUBLIC", logo: "https://logo.clearbit.com/curtin.edu.au",        website: "https://www.curtin.edu.au",        courses: ["Computer Science","Business Administration","Engineering Science","Data Science","Mining Engineering","Accounting","Business Analytics","Software Engineering","Public Health","Architecture","Environmental science / management","Nursing and midwifery","Economics","Information technology","Law"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A global university in Perth and Asia-Pacific known for mining engineering, business, and technology.", eligibility: "GPA 3.0+, IELTS 6.0+", deadline: "May 01, 2026" },
  { id: 15, name: "Queensland University of Technology", city: "Brisbane",    state: "Queensland",                    location: "Brisbane, Queensland, Australia",                    rank: "Rank 189 QS Rankings", rankValue: 189,  tuition: 20, type: "PUBLIC", logo: "https://logo.clearbit.com/qut.edu.au",           website: "https://www.qut.edu.au",           courses: ["Business Analytics","Computer Science","Engineering Science","Business Administration","Data Science","Software Engineering","Architecture","Journalism","Law","Public Health","Artificial Intelligence / Machine Learning","Accounting","Creative Arts","Information technology","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A leading university of technology in Brisbane's CBD, known for creative industries, STEM, and law.", eligibility: "GPA 3.0+, IELTS 6.5+", deadline: "May 01, 2026" },
  { id: 16, name: "Deakin University",                 city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 266 QS Rankings", rankValue: 266,  tuition: 18, type: "PUBLIC", logo: "https://logo.clearbit.com/deakin.edu.au",        website: "https://www.deakin.edu.au",        courses: ["Business Analytics","Nursing and midwifery","Business Administration","Computer Science","Data Science","Sport / Exercise Science","Engineering Science","Accounting","Law","Public Health","Software Engineering","Artificial Intelligence / Machine Learning","Psychology","Teaching / Education studies","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","MAR","JUL","NOV"], description: "An innovative university with strengths in nursing, business analytics, sport science, and flexible online learning.", eligibility: "GPA 3.0+, IELTS 6.0+", deadline: "May 01, 2026" },
  { id: 17, name: "Swinburne University of Technology", city: "Melbourne",    state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 285 QS Rankings", rankValue: 285,  tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/swinburne.edu.au",    website: "https://www.swinburne.edu.au",    courses: ["Computer Science","Business Analytics","Engineering Science","Data Science","Business Administration","Software Engineering","Artificial Intelligence / Machine Learning","Astronomy","Project Management","Cyber Security","Information technology","Accounting","Architecture","Design","Psychology"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","NOV"], description: "A technology-focused university celebrated for research in astronomy, entrepreneurship, engineering, and design.", eligibility: "GPA 3.0+, IELTS 6.5+", deadline: "May 01, 2026" },
  { id: 18, name: "University of Tasmania",            city: "Hobart",         state: "Tasmania",                      location: "Hobart, Tasmania, Australia",                        rank: "Rank 293 QS Rankings", rankValue: 293,  tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/utas.edu.au",          website: "https://www.utas.edu.au",          courses: ["Business Administration","Computer Science","Engineering Science","Data Science","Environmental science / management","Medicine and Medical Studies","Marine science","Law","Nursing and midwifery","Public Health","Economics","Biological Sciences","Psychology","Teaching / Education studies"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "Tasmania's leading university, renowned for marine science, environmental studies, and Antarctic research.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "May 15, 2026" },
  { id: 19, name: "Griffith University",               city: "Brisbane",       state: "Queensland",                    location: "Brisbane, Queensland, Australia",                    rank: "Rank 300 QS Rankings", rankValue: 300,  tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/griffith.edu.au",     website: "https://www.griffith.edu.au",     courses: ["Business Administration","Computer Science","Business Analytics","Public Health","Law","Nursing and midwifery","Music","Environmental science / management","Data Science","Criminology","Psychology","Teaching / Education studies","Engineering Science","Accounting","International Relations"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A progressive multi-campus university in Queensland known for criminology, music, health, and environmental sciences.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "May 15, 2026" },
  { id: 20, name: "La Trobe University",               city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 316 QS Rankings", rankValue: 316,  tuition: 12, type: "PUBLIC", logo: "https://logo.clearbit.com/latrobe.edu.au",      website: "https://www.latrobe.edu.au",      courses: ["Business Analytics","Nursing and midwifery","Business Administration","Computer Science","Data Science","Public Health","Psychology","Law","Accounting","Environmental science / management","Teaching / Education studies","Engineering Science","Social Work","Biological Sciences","Software Engineering"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A research-intensive Melbourne university with a strong focus on social justice, health sciences, and humanities.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "May 15, 2026" },
  { id: 21, name: "University of South Australia",     city: "Adelaide",       state: "South Australia",               location: "Adelaide, South Australia, Australia",              rank: "Rank 326 QS Rankings", rankValue: 326,  tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/unisa.edu.au",        website: "https://www.unisa.edu.au",        courses: ["Business Analytics","Business Administration","Computer Science","Data Science","Engineering Science","Nursing and midwifery","Public Health","Accounting","Law","Marketing","Architecture","Information Systems","Software Engineering","Cyber Security","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "South Australia's largest university with industry-focused programmes in business, health, and engineering.", eligibility: "GPA 3.0+, IELTS 6.0+", deadline: "May 15, 2026" },
  { id: 22, name: "Flinders University",               city: "Adelaide",       state: "South Australia",               location: "Adelaide, South Australia, Australia",              rank: "Rank 431 QS Rankings", rankValue: 431,  tuition: 6,  type: "PUBLIC", logo: "https://logo.clearbit.com/flinders.edu.au",     website: "https://www.flinders.edu.au",     courses: ["Nursing and midwifery","Medicine and Medical Studies","Business Administration","Data Science","Computer Science","Law","Environmental science / management","Public Health","Psychology","Social Work","Biological Sciences","Teaching / Education studies","Accounting","Engineering Science"], degrees: ["Postgraduate","Ph.D.","Undergraduate","UG Diploma /Certificate /Associate Degree"], intakes: ["FEB","MAR","JUL","SEP"], description: "A forward-thinking Adelaide university offering affordable Masters in health, law, science, and social sciences.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "May 15, 2026" },
  { id: 23, name: "Murdoch University",                city: "Perth",          state: "Western Australia",             location: "Perth, Western Australia, Australia",               rank: "Rank 431 QS Rankings", rankValue: 431,  tuition: 21, type: "PUBLIC", logo: "https://logo.clearbit.com/murdoch.edu.au",      website: "https://www.murdoch.edu.au",      courses: ["Business Administration","Computer Science","Law","Engineering Science","Environmental science / management","Data Science","Nursing and midwifery","Animal and Veterinary Studies","Business Analytics","Psychology","Accounting","Public Health"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A welcoming Perth university offering a broad range of Masters in veterinary science, law, and business.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "Jun 01, 2026" },
  { id: 24, name: "James Cook University",             city: "Townsville",     state: "Queensland",                    location: "Townsville, Queensland, Australia",                  rank: "Rank 461 QS Rankings", rankValue: 461,  tuition: 20, type: "PUBLIC", logo: "https://logo.clearbit.com/jcu.edu.au",           website: "https://www.jcu.edu.au",           courses: ["Business Analytics","Business Administration","Computer Science","Data Science","Marine science","Environmental science / management","Nursing and midwifery","Public Health","Engineering Science","Medicine and Medical Studies","Biological Sciences","Tourism","Accounting","Law"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A tropical university in Townsville specialising in marine science, tropical ecology, and public health.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "Jun 01, 2026" },
  { id: 25, name: "University of Canberra",            city: "Canberra",       state: "Australian Capital Territory",  location: "Canberra, Australian Capital Territory, Australia",  rank: "Rank 511 QS Rankings", rankValue: 511,  tuition: 17, type: "PUBLIC", logo: "https://logo.clearbit.com/canberra.edu.au",     website: "https://www.canberra.edu.au",     courses: ["Business Administration","Computer Science","Data Science","Public Health","Nursing and midwifery","Engineering Science","Business Analytics","Law","Environmental science / management","Psychology","Teaching / Education studies","Accounting","Information Systems"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["JAN","FEB","JUL","SEP"], description: "A vibrant Canberra university offering career-focused Masters in health, business, design, and IT.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "Jun 01, 2026" },
  { id: 26, name: "Victoria University",               city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank 651 QS Rankings", rankValue: 651,  tuition: 16, type: "PUBLIC", logo: "https://logo.clearbit.com/vu.edu.au",            website: "https://www.vu.edu.au",            courses: ["Business Administration","Computer Science","Engineering Science","Business Analytics","Sport / Exercise Science","Nursing and midwifery","Data Science","Accounting","Law","Software Engineering","Teaching / Education studies","Public Health"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","NOV"], description: "A dual-sector Melbourne university known for sport, business, and engineering with innovative block model teaching.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 01, 2026" },
  { id: 27, name: "Western Sydney University",         city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                rank: "Rank 641 QS Rankings", rankValue: 641,  tuition: 21, type: "PUBLIC", logo: "https://logo.clearbit.com/westernsydney.edu.au", website: "https://www.westernsydney.edu.au", courses: ["Business Administration","Computer Science","Engineering Science","Nursing and midwifery","Data Science","Public Health","Law","Psychology","Teaching / Education studies","Accounting","Social Work","Environmental science / management"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A multi-campus university serving greater western Sydney with inclusive, career-focused Masters programmes.", eligibility: "GPA 2.8+, IELTS 6.0+", deadline: "Jun 01, 2026" },
  { id: 28, name: "Australian Catholic University",    city: "Sydney",         state: "New South Wales",               location: "Sydney, New South Wales, Australia",                rank: "Rank 801 QS Rankings", rankValue: 801,  tuition: 13, type: "PUBLIC", logo: "https://logo.clearbit.com/acu.edu.au",           website: "https://www.acu.edu.au",           courses: ["Nursing and midwifery","Teaching / Education studies","Business Administration","Public Health","Social Work","Psychology","Law","Business Analytics","Accounting","Philosophy and Religious Studies","Physiotherapy"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL","SEP"], description: "A values-driven national university specialising in nursing, education, social work, and theology.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 29, name: "Edith Cowan University",            city: "Perth",          state: "Western Australia",             location: "Perth, Western Australia, Australia",               rank: "Rank 651 QS Rankings", rankValue: 651,  tuition: 12, type: "PUBLIC", logo: "https://logo.clearbit.com/ecu.edu.au",           website: "https://www.ecu.edu.au",           courses: ["Nursing and midwifery","Computer Science","Cyber Security","Business Administration","Teaching / Education studies","Creative Arts","Data Science","Business Analytics","Engineering Science","Psychology","Public Health","Accounting"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A practice-oriented Perth university recognised for nursing, education, creative arts, and cybersecurity.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 30, name: "Charles Darwin University",         city: "Darwin",         state: "Northern Territory",            location: "Darwin, Northern Territory, Australia",             rank: "Rank 801 QS Rankings", rankValue: 801,  tuition: 15, type: "PUBLIC", logo: "https://logo.clearbit.com/cdu.edu.au",           website: "https://www.cdu.edu.au",           courses: ["Business Administration","Computer Science","Nursing and midwifery","Data Science","Environmental science / management","Teaching / Education studies","Law","Business Analytics","Public Health","Engineering Science"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP"], description: "A unique university serving Australia's Top End with flexible delivery and strong ties to indigenous communities.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 31, name: "University of Southern Queensland", city: "Toowoomba",      state: "Queensland",                    location: "Toowoomba, Queensland, Australia",                   rank: "Rank 551 QS Rankings", rankValue: 551,  tuition: 14, type: "PUBLIC", logo: "https://logo.clearbit.com/usq.edu.au",           website: "https://www.usq.edu.au",           courses: ["Business Administration","Computer Science","Engineering Science","Data Science","Business Analytics","Nursing and midwifery","Teaching / Education studies","Environmental science / management","Food / Agricultural Science","Public Health","Accounting"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A flexible Queensland university offering affordable online and on-campus Masters in agriculture, IT, and business.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 32, name: "Central Queensland University",     city: "Rockhampton",    state: "Queensland",                    location: "Rockhampton, Queensland, Australia",                 rank: "Rank --",              rankValue: 9999, tuition: 14, type: "PUBLIC", logo: "https://logo.clearbit.com/cqu.edu.au",           website: "https://www.cqu.edu.au",           courses: ["Business Administration","Computer Science","Engineering Science","Nursing and midwifery","Data Science","Business Analytics","Teaching / Education studies","Mining Engineering","Safety Engineering","Public Health","Accounting"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A progressive university with campuses across Queensland offering practical, industry-focused Masters programmes.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 33, name: "Southern Cross University",         city: "Lismore",        state: "New South Wales",               location: "Lismore, New South Wales, Australia",               rank: "Rank --",              rankValue: 9999, tuition: 16, type: "PUBLIC", logo: "https://logo.clearbit.com/scu.edu.au",           website: "https://www.scu.edu.au",           courses: ["Business Administration","Nursing and midwifery","Computer Science","Business Analytics","Environmental science / management","Teaching / Education studies","Tourism","Food And Hospitality","Public Health","Accounting","Law","Data Science"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","MAY","JUL","SEP","NOV"], description: "A regional university in Northern NSW known for environment, health, and tourism programmes.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 34, name: "Federation University",             city: "Ballarat",       state: "Victoria",                      location: "Ballarat, Victoria, Australia",                      rank: "Rank --",              rankValue: 9999, tuition: 15, type: "PUBLIC", logo: "https://logo.clearbit.com/federation.edu.au",   website: "https://www.federation.edu.au",   courses: ["Business Administration","Computer Science","Engineering Science","Data Science","Nursing and midwifery","Business Analytics","Teaching / Education studies","Environmental science / management","Mining Engineering","Public Health","Accounting"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A regional Victoria university with STEM strengths and a proud history of technology and mining education.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 35, name: "Charles Sturt University",          city: "Bathurst",       state: "New South Wales",               location: "Bathurst, New South Wales, Australia",              rank: "Rank --",              rankValue: 9999, tuition: 13, type: "PUBLIC", logo: "https://logo.clearbit.com/csu.edu.au",           website: "https://www.csu.edu.au",           courses: ["Business Administration","Computer Science","Nursing and midwifery","Accounting","Business Analytics","Teaching / Education studies","Environmental science / management","Veterinary Science","Food / Agricultural Science","Public Health","Data Science","Law"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A flexible regional university offering practical and online Masters across agriculture, health, business, and IT.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 36, name: "University of Sunshine Coast",      city: "Sippy Downs",    state: "Queensland",                    location: "Sippy Downs, Queensland, Australia",                 rank: "Rank --",              rankValue: 9999, tuition: 16, type: "PUBLIC", logo: "https://logo.clearbit.com/usc.edu.au",           website: "https://www.usc.edu.au",           courses: ["Business Analytics","Business Administration","Computer Science","Data Science","Nursing and midwifery","Public Health","Environmental science / management","Engineering Science","Accounting","Teaching / Education studies"], degrees: ["Postgraduate","Ph.D.","Undergraduate","PG Diploma /Certificate"], intakes: ["FEB","JUL","SEP","NOV"], description: "A fast-growing Queensland university offering student-centred Masters in health, business, and sustainability.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 37, name: "Torrens University Australia",      city: "Adelaide",       state: "South Australia",               location: "Adelaide, South Australia, Australia",              rank: "Rank --",              rankValue: 9999, tuition: 16, type: "PUBLIC", logo: "https://logo.clearbit.com/torrens.edu.au",      website: "https://www.torrens.edu.au",      courses: ["Business Administration","Computer Science","Data Science","Business Analytics","Accounting","Graphic and Design Studies","Food And Hospitality","Teaching / Education studies","Software Engineering","Marketing"], degrees: ["Postgraduate","Undergraduate"], intakes: ["FEB","MAR","JUL","SEP","NOV"], description: "A dynamic, student-centred university specialising in creative industries, health, business, and hospitality.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 38, name: "University of Divinity",            city: "Melbourne",      state: "Victoria",                      location: "Melbourne, Victoria, Australia",                     rank: "Rank --",              rankValue: 9999, tuition: 10, type: "PUBLIC", logo: "https://logo.clearbit.com/divinity.edu.au",     website: "https://www.divinity.edu.au",     courses: ["Philosophy and Religious Studies","Theology","Teaching / Education studies"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "Australia's only specialised university for theology, offering Masters across diverse faith traditions.", eligibility: "GPA 2.5+, IELTS 6.0+", deadline: "Jun 15, 2026" },
  { id: 39, name: "Bond University",                   city: "Gold Coast",     state: "Queensland",                    location: "Gold Coast, Queensland, Australia",                  rank: "Rank --",              rankValue: 9999, tuition: 19, type: "PUBLIC", logo: "https://logo.clearbit.com/bond.edu.au",          website: "https://www.bond.edu.au",          courses: ["Law","Business Administration","Computer Science","Data Science","Business Analytics","Health Sciences / Administration","Psychology","Public Health","Accounting","Architecture","Cyber Security","Film and TV production"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["JAN","MAY","SEP"], description: "Australia's only private not-for-profit university, offering an accelerated and personalised study experience.", eligibility: "GPA 2.8+, IELTS 6.5+", deadline: "Jun 15, 2026" },
  { id: 40, name: "Fremantle - Notre Dame Australia",  city: "Fremantle",      state: "Western Australia",             location: "Fremantle, Western Australia, Australia",           rank: "Rank --",              rankValue: 9999, tuition: 15, type: "PUBLIC", logo: "https://logo.clearbit.com/notredame.edu.au",    website: "https://www.notredame.edu.au",    courses: ["Nursing and midwifery","Medicine and Medical Studies","Business Administration","Law","Teaching / Education studies","Physiotherapy","Philosophy and Religious Studies","Public Health","Psychology"], degrees: ["Postgraduate","Ph.D.","Undergraduate"], intakes: ["FEB","JUL"], description: "A faith-based university in Fremantle and Sydney offering excellent Masters in health, law, and education.", eligibility: "GPA 2.8+, IELTS 6.5+", deadline: "Jun 15, 2026" }
];

// ─────────────────────────────────────────────
// Filter Categories
// ─────────────────────────────────────────────
const degreeCategories = [
  "Postgraduate","Ph.D.","PG Diploma /Certificate","Undergraduate","UG Diploma /Certificate /Associate Degree"
];

const courseCategories = [
  "Industrial Engineering","Broadcast Media","Engineering Design","Industrial Design","Physiotherapy","Astronomy","Speech Pathology","Interior Design","Theatre","Social Work","Dental Studies","Animal and Veterinary Studies","Justice studies","Materials and Mineral Engineering","Manufacturing Engineering","General Engineering And Technology","Electronics","Cyber Security","Automotive engineering","Robotics","Physical Sciences","Biochemistry","Information Systems","Philosophy and Religious Studies","History","Media & Communication","Commerce","Public Health","Game Development","Civil Engineering","Mechanical Engineering","Electrical Engineering","Biomedical Engineering","Aerospace Engineering","Marine Engineering","Mining Engineering","Geomatic Engineering","Engineering Science","Petroleum Engineering","Legal Studies","Law","Music","Archaeology","Dance","Banking and Finance","Teaching / Education studies","Risk Management","Language and Literature","Social and Cultural Courses","Film and TV production","Journalism","Creative Writing","Advertising","Audio Visual Studies","Sociology","Political Science","Occupational Health & Safety","Nursing and midwifery","Chemical Engineering","Mathematics","Statistics","Linguistic","English language","Photography","Animation","International Relations","Behavioural Science","Geography","Psychology","Sport / Exercise Science","Business Analytics","Physics","Data Science","Food / Agricultural Science","Animal Husbandry","Accounting","Earth Sciences / Geoscience","Geology","Environmental science / management","Marine science","Human Geography","Arts / Fine Art","Graphic and Design Studies","Creative Arts","Fashion Design","Product Design","Biological Sciences","Genetics","Zoology","Forensics","Biotechnology","Botany","Architecture","Construction Management","Landscape design and architecture","Planning","Building Technology","Surveying","International / Global Business","Sales And Marketing","Human resource Management","Business Administration","Sports Management","Project Management","Innovation / Entrepreneurship","Organisation Management","Chemistry","Food And Hospitality","Data Analytics","Pharmacology / Pharmacy","Business Management","Leadership Development","Tourism","Anthropology","Medicine and Medical Studies","Economics","Computer Science","Artificial Intelligence / Machine Learning","Health Sciences / Administration","Information technology","Computer Graphics","Computer Engineering","Environmental Engineering","Software Engineering","Web Development","Management","Interdisciplinary Studies"
];

const cityCategories = [
  "Adelaide","Ballarat","Bathurst","Brisbane","Canberra","Darwin","Fremantle","Gold Coast","Hobart","Lismore","Melbourne","Newcastle","Perth","Rockhampton","Sippy Downs","Sydney","Toowoomba","Townsville","Wollongong"
];

const intakeCategories = ["JAN","FEB","MAR","MAY","JUL","SEP","NOV"];

const feeRanges = [
  { id: "max10", label: "Max ₹10 Lacs", max: 10 },
  { id: "max20", label: "Max ₹20 Lacs", max: 20 },
  { id: "max30", label: "Max ₹30 Lacs", max: 30 },
  { id: "max40", label: "Max ₹40 Lacs", max: 40 },
  { id: "above40", label: "₹40 Lacs +", min: 40 }
];

const AustraliaMastersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegrees, setSelectedDegrees] = useState(["Postgraduate"]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedIntakes, setSelectedIntakes] = useState([]);
  const [selectedFees, setSelectedFees] = useState([]);
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [openAccordions, setOpenAccordions] = useState({ fees: true, degree: true, courses: true, cities: true, intake: true });

  const toggleAccordion = (s) => setOpenAccordions(p => ({ ...p, [s]: !p[s] }));
  const handleFilterToggle = (v, l, sl) => { sl(l.includes(v) ? l.filter(i => i !== v) : [...l, v]); setCurrentPage(1); };
  const handleClearAll = () => { setSelectedDegrees([]); setSelectedCourses([]); setSelectedCities([]); setSelectedIntakes([]); setSelectedFees([]); setSearchTerm(''); setCurrentPage(1); };

  const activeChips = [
    ...selectedDegrees.map(d => ({ category: 'degree', label: d, val: d })),
    ...selectedCourses.map(c => ({ category: 'courses', label: c, val: c })),
    ...selectedCities.map(ci => ({ category: 'cities', label: ci, val: ci })),
    ...selectedIntakes.map(i => ({ category: 'intakes', label: i, val: i })),
    ...selectedFees.map(f => { const r = feeRanges.find(x => x.id === f); return r ? { category: 'fees', label: r.label, val: f } : null; }).filter(Boolean)
  ];

  const handleRemoveChip = (chip) => {
    if (chip.category === 'degree') setSelectedDegrees(p => p.filter(d => d !== chip.val));
    if (chip.category === 'courses') setSelectedCourses(p => p.filter(c => c !== chip.val));
    if (chip.category === 'cities') setSelectedCities(p => p.filter(c => c !== chip.val));
    if (chip.category === 'intakes') setSelectedIntakes(p => p.filter(i => i !== chip.val));
    if (chip.category === 'fees') setSelectedFees(p => p.filter(f => f !== chip.val));
    setCurrentPage(1);
  };

  const filteredUniversities = universityDatabase.filter(uni => {
    if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) return false;
    if (selectedDegrees.length > 0 && !uni.degrees.some(d => selectedDegrees.includes(d))) return false;
    if (selectedCourses.length > 0 && !uni.courses.some(c => selectedCourses.includes(c))) return false;
    if (selectedCities.length > 0 && !selectedCities.includes(uni.city)) return false;
    if (selectedIntakes.length > 0 && !uni.intakes.some(i => selectedIntakes.includes(i))) return false;
    if (selectedFees.length > 0) {
      if (uni.tuition === null) return false;
      const ok = selectedFees.some(fid => { const r = feeRanges.find(x => x.id === fid); if (!r) return false; if (r.max !== undefined && uni.tuition > r.max) return false; if (r.min !== undefined && uni.tuition < r.min) return false; return true; });
      if (!ok) return false;
    }
    return true;
  });

  const sorted = [...filteredUniversities].sort((a, b) => sortBy === 'rank' ? a.rankValue - b.rankValue : sortBy === 'fees' ? ((a.tuition ?? 999) - (b.tuition ?? 999)) : a.name.localeCompare(b.name));
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const current = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) { setCurrentPage(n); window.scrollTo({ top: 150, behavior: 'smooth' }); } };

  const accentColor = "amber";

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-amber-100/40 via-orange-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-amber-300/10 to-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1340px]">
        <div className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/study-abroad/australia" className="hover:text-amber-600 transition-colors">Study Abroad in Australia</Link>
          <span>/</span>
          <span className="text-slate-700">Masters in Australia</span>
        </div>

        <div className="mb-10 max-w-4xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            List of Top Universities & Colleges in Australia for{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Masters</span>{' '}
            — Ranking & Fees (2026)
          </h1>
          <p className="text-slate-500 font-semibold text-sm mt-3 leading-relaxed">
            Explore Australia's top universities for Masters programmes — compare QS rankings, tuition fees, cities, intakes, and eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="sticky top-28 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[28px] p-6 shadow-sm z-30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <span className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wider">
                <Filter size={15} className="text-amber-500" /> Filters
              </span>
              <button onClick={handleClearAll} className="text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer">Clear All</button>
            </div>
            <div className="space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {/* Fees */}
              <div>
                <button onClick={() => toggleAccordion('fees')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  <span>1st Year Fees</span>
                  <ChevronDown size={14} className={`transition-transform text-slate-400 ${openAccordions.fees ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.fees && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {feeRanges.map(r => (
                        <label key={r.id} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-amber-600 cursor-pointer">
                          <input type="checkbox" checked={selectedFees.includes(r.id)} onChange={() => handleFilterToggle(r.id, selectedFees, setSelectedFees)} className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer" />
                          {r.label}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-px bg-slate-100" />
              {/* Degree */}
              <div>
                <button onClick={() => toggleAccordion('degree')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  <span>Degree</span>
                  <ChevronDown size={14} className={`transition-transform text-slate-400 ${openAccordions.degree ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.degree && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {degreeCategories.map(d => (
                        <label key={d} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-amber-600 cursor-pointer">
                          <input type="checkbox" checked={selectedDegrees.includes(d)} onChange={() => handleFilterToggle(d, selectedDegrees, setSelectedDegrees)} className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer" />
                          {d}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-px bg-slate-100" />
              {/* Courses */}
              <div>
                <button onClick={() => toggleAccordion('courses')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  <span>Courses</span>
                  <ChevronDown size={14} className={`transition-transform text-slate-400 ${openAccordions.courses ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.courses && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5 max-h-[220px] overflow-y-auto">
                      {courseCategories.map(c => (
                        <label key={c} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-amber-600 cursor-pointer">
                          <input type="checkbox" checked={selectedCourses.includes(c)} onChange={() => handleFilterToggle(c, selectedCourses, setSelectedCourses)} className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer" />
                          {c}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-px bg-slate-100" />
              {/* Cities */}
              <div>
                <button onClick={() => toggleAccordion('cities')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  <span>Cities</span>
                  <ChevronDown size={14} className={`transition-transform text-slate-400 ${openAccordions.cities ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.cities && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5 max-h-[200px] overflow-y-auto">
                      {cityCategories.map(c => (
                        <label key={c} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-amber-600 cursor-pointer">
                          <input type="checkbox" checked={selectedCities.includes(c)} onChange={() => handleFilterToggle(c, selectedCities, setSelectedCities)} className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer" />
                          {c}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-px bg-slate-100" />
              {/* Intake */}
              <div>
                <button onClick={() => toggleAccordion('intake')} className="w-full flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  <span>Intake</span>
                  <ChevronDown size={14} className={`transition-transform text-slate-400 ${openAccordions.intake ? 'rotate-180 text-amber-500' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordions.intake && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2.5 pl-0.5">
                      {intakeCategories.map(i => (
                        <label key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 hover:text-amber-600 cursor-pointer">
                          <input type="checkbox" checked={selectedIntakes.includes(i)} onChange={() => handleFilterToggle(i, selectedIntakes, setSelectedIntakes)} className="w-4 h-4 rounded border-slate-300 text-amber-500 cursor-pointer" />
                          {i}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col gap-6">
            {/* Search + Sort */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/50 border border-white/60 p-5 rounded-[24px] backdrop-blur-md shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search by course (e.g. CS, MBA, Data Science), university, city..." className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-amber-400 transition-colors" />
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold text-slate-500"><span className="text-slate-800 font-black">{sorted.length}</span> Universities Found</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer text-slate-700 focus:border-amber-400 transition-colors">
                    <option value="rank">QS Rankings</option>
                    <option value="fees">Tuition: Low to High</option>
                    <option value="name">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center bg-amber-50/30 border border-amber-100/50 p-3.5 rounded-2xl">
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider mr-1.5">Active:</span>
                {activeChips.map((chip, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-100 rounded-full text-xs font-bold text-amber-700 shadow-sm">
                    <span>{chip.label}</span>
                    <button onClick={() => handleRemoveChip(chip)} className="text-slate-400 hover:text-amber-600 cursor-pointer"><X size={12} className="stroke-[2.5]" /></button>
                  </div>
                ))}
                <button onClick={handleClearAll} className="text-[11px] font-black text-amber-600 hover:underline ml-2 cursor-pointer">Clear All</button>
              </div>
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {current.map(uni => {
                  const matchedCourses = searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : [];
                  return (
                  <motion.div key={uni.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={getUniversityLogo(uni.name, uni.logo)} alt={uni.name} className="w-10 h-10 object-contain" onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name.charAt(0))}&background=f59e0b&color=fff&size=36`; }} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-amber-600 transition-colors">{uni.name}</h3>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1"><MapPin size={11} />{uni.location}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center gap-1"><Award size={12} className="text-amber-500" />{uni.rank.replace("Rank ", "").replace(" QS Rankings", "")}</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">1st Yr Fees</p>
                          <p className="text-xs font-black text-amber-600 mt-0.5">{uni.tuition ? `₹${uni.tuition} Lakh` : '-/-'}</p>
                        </div>
                        <div className="bg-slate-550 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Type</p>
                          <p className="text-[10px] font-black text-amber-600 mt-1 flex items-center gap-1"><Building size={11} />{uni.type}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2 mb-3">{uni.description}</p>

                      {/* Matched course highlight */}
                      {matchedCourses.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-xl">
                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wide">✓ Matched Course:</span>
                          {matchedCourses.slice(0, 3).map((mc, idx) => (
                            <span key={idx} className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                              {mc}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 mb-4">
                        {uni.courses.slice(0, 3).map(c => <span key={c} className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{c}</span>)}
                      </div>
                      <div className="bg-slate-50 border border-slate-100/50 p-3 rounded-xl mb-4 text-[11px] font-bold text-slate-600 flex flex-col gap-1">
                        <div className="flex justify-between"><span>Eligibility:</span><span className="text-slate-800 text-right font-semibold">{uni.eligibility}</span></div>
                        <div className="flex justify-between"><span>Deadline:</span><span className="text-amber-600 font-black">{uni.deadline}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 border-t border-slate-100 pt-4 mt-2">
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">Visit School</a>
                      <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-bold transition-colors">Check Eligibility</Link>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
              {sorted.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-sm">No universities match your active filters.</div>}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-slate-100 pt-8">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => handlePageChange(n)} className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${currentPage === n ? 'bg-amber-500 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>{n}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-xs transition-colors ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'}`}>Next</button>
              </div>
            )}
          </main>
        </div>

      {/* CTA Section */}
      <StudyAbroadCTA country="Australia" />

      </div>
    </div>
  );
};

export default AustraliaMastersPage;
