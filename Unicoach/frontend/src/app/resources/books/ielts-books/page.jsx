import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const ieltsData = {
  examShortName: 'IELTS Books',
  title: 'Top IELTS Preparation Books 2025–2026',
  subtitle: 'Handpicked by global mentors to help you score Band 7.5+ in Academic & General Training modules.',
  updatedDate: 'Updated for 2025–2026 Format',
  description: 'To prepare effectively for the IELTS exam, choosing the right books is crucial to ace the exam. Everyone learns differently, but these handpicked books will make your journey to a band 7.5+ much easier by focusing on real exam patterns, audio scripts, and high-scoring essay templates.',
  booksList: [
    {
      name: "The Official Cambridge Guide to IELTS",
      publisher: "Cambridge University Press",
      bestFor: "Comprehensive Strategy (All Bands)",
      category: "Comprehensive",
      rating: "4.9",
      description: "Directly from the official test creators. Offers step-by-step guidance and 8 full-length practice tests with audio MP3 and answer keys.",
      sectionalStrength: "Band 7.0–9.0 Strategy & Academic/General Context",
      price: "Approx. ₹2,200",
      link: "https://www.amazon.in/s?k=The+Official+Cambridge+Guide+to+IELTS"
    },
    {
      name: "Cambridge IELTS Academic Series (Books 15 to 19)",
      publisher: "Cambridge Assessment English",
      bestFor: "Authentic Mock Exam Simulations",
      category: "Practice Mocks",
      rating: "4.9",
      description: "Each book contains four authentic examination papers from Cambridge Assessment English. Perfect for final timing and score benchmarking.",
      sectionalStrength: "Exact Exam-Level Listening & Reading Questions",
      price: "Approx. ₹1,450 / book",
      link: "https://www.amazon.in/s?k=Cambridge+IELTS+Academic+18+19"
    },
    {
      name: "Barron's IELTS Superpack (Latest Edition)",
      publisher: "Barron's Educational Series",
      bestFor: "Self-Study Complete Package",
      category: "Comprehensive",
      rating: "4.8",
      description: "Includes the core manual with MP3 audio, full practice tests, and the 500 Essential Words guide. Highly popular among Indian self-prep students.",
      sectionalStrength: "All 4 Modules: Listening, Reading, Writing, Speaking",
      price: "Approx. ₹3,499",
      link: "https://www.amazon.in/s?k=Barrons+IELTS+Superpack"
    },
    {
      name: "Simone Braverman's Target Band 7",
      publisher: "Simone Braverman (IELTS-Blog)",
      bestFor: "Quick Hacks & Time Management",
      category: "Strategy",
      rating: "4.7",
      description: "Written by a top-scoring test-taker. Provides highly practical, easy-to-use techniques for working professionals and busy students.",
      sectionalStrength: "Time Management, Cue Cards & Score Boosting",
      price: "Approx. ₹699",
      link: "https://www.amazon.in/s?k=Simone+Braverman+Target+Band+7"
    },
    {
      name: "Check Your English Vocabulary for IELTS",
      publisher: "Bloomsbury (Rawdon Wyatt)",
      bestFor: "Lexical Resource & Collocations",
      category: "Vocabulary",
      rating: "4.8",
      description: "A workbook filled with vocabulary exercises, collocations, and idioms to help students push their Lexical Resource score to Band 7.5+.",
      sectionalStrength: "Lexical Variety for Writing Task 2 & Speaking Part 3",
      price: "Approx. ₹799",
      link: "https://www.amazon.in/s?k=Check+Your+English+Vocabulary+for+IELTS"
    },
    {
      name: "IELTS Advantage: Writing Skills",
      publisher: "Delta Publishing (Richard Brown)",
      bestFor: "Band 8.0+ Essay & Graph Mastery",
      category: "Writing",
      rating: "4.9",
      description: "Specialized masterclass on Academic Task 1 (graphs, maps, diagrams) and Task 2 structured opinion/discussion essay frameworks.",
      sectionalStrength: "Coherence, Cohesion & Academic Grammar",
      price: "Approx. ₹1,150",
      link: "https://www.amazon.in/s?k=IELTS+Advantage+Writing+Skills"
    },
    {
      name: "IELTS Advantage: Speaking & Listening Skills",
      publisher: "Delta Publishing (Jon Marks)",
      bestFor: "Fluency & Audio Accent Training",
      category: "Speaking",
      rating: "4.8",
      description: "Step-by-step audio scripts, pronunciation drills, and cue card preparation tactics for achieving high fluency in speaking interviews.",
      sectionalStrength: "Speaking Fluency, Natural Idioms & Audio Comprehension",
      price: "Approx. ₹1,200",
      link: "https://www.amazon.in/s?k=IELTS+Advantage+Speaking+Listening"
    },
    {
      name: "Collins English for IELTS Series",
      publisher: "Collins ELT",
      bestFor: "Focused Module-Wise Skill Drills",
      category: "Comprehensive",
      rating: "4.7",
      description: "Structured 12-unit topic-based books covering Grammar, Key Vocabulary, Reading, and Listening for students targeting Band 6.5–7.5.",
      sectionalStrength: "Grammar Foundation & Topic-Specific Lexicon",
      price: "Approx. ₹850 / module",
      link: "https://www.amazon.in/s?k=Collins+English+for+IELTS"
    }
  ],
  prepTips: [
    "Take an initial diagnostic mock test under strict exam timing to baseline your current band score.",
    "Familiarize yourself with the 4 modules: Listening (40 mins), Reading (60 mins), Writing (60 mins), and Speaking (11-14 mins).",
    "Practice Reading passages in 18 minutes instead of 20 minutes to maintain an exam time cushion.",
    "Develop active shorthand note-taking skills for Listening sections (watch out for spellings and singular/plural nouns).",
    "Master structured essay templates: Introduction (Paraphrase), Body Paragraph 1 (Idea + Example), Body 2, and Conclusion.",
    "Use the English 'shadowing' technique with BBC/NPR podcasts to enhance natural pronunciation and intonation."
  ],
  faqs: [
    {
      q: "Can I rely solely on IELTS books for preparation?",
      a: "While books are great for learning the structure and vocabulary, you should supplement them with online speaking practice and professional feedback on your essays to ensure you hit a band 7.5+."
    },
    {
      q: "How can I improve my IELTS writing skills using books?",
      a: "Look for books that provide sample essays with examiner comments (like IELTS Advantage). Analyze why an essay scored a band 6.0 vs a band 8.0, and pay close attention to cohesive devices and vocabulary variety."
    },
    {
      q: "Do I need to buy the latest edition of an IELTS book?",
      a: "Generally, yes. Although the core format remains similar, newer Cambridge editions (17, 18, 19) reflect modern trends in reading passage topics and speaking cue card structures."
    },
    {
      q: "How long should I study with IELTS books each day?",
      a: "A focused study of 1.5 to 2 hours daily for 6-8 weeks is usually optimal for students with intermediate English skills to achieve their target band."
    }
  ]
};

const IELTSBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="ielts" data={ieltsData} />;
};

export default IELTSBooksPage;
