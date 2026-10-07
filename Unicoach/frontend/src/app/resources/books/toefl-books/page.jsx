import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const toeflData = {
  examShortName: 'TOEFL Books',
  title: 'TOEFL iBT Preparation Books 2025–2026',
  subtitle: 'The best-rated study guides to achieve 100+ on the official ETS computer-delivered TOEFL test.',
  updatedDate: 'Updated for New Shortened TOEFL Format',
  description: 'TOEFL requires strong English skills tailored for academic North American and European universities. These books help you practice structured response templates, listen to long university lectures, and craft comparative academic essays.',
  booksList: [
    {
      name: "Official Guide to the TOEFL iBT Test (ETS) - Latest Edition",
      publisher: "ETS Official",
      bestFor: "Official Grading Rubrics & Real Prompts",
      category: "Official Guide",
      rating: "4.9",
      description: "Incorporates the shortened test format. Features authentic practice prompts and detailed scoring rubrics used by ETS human raters and SpeechRater AI.",
      sectionalStrength: "Official Test Rubrics & 4 Full Computer-Adaptive Tests",
      price: "Approx. ₹3,200",
      link: "https://www.amazon.in/s?k=Official+Guide+to+the+TOEFL+iBT+Test+ETS"
    },
    {
      name: "Official TOEFL iBT Tests (Volumes 1 & 2)",
      publisher: "Educational Testing Service (ETS)",
      bestFor: "Authentic Practice Volume & Audio",
      category: "Practice Mocks",
      rating: "4.8",
      description: "Each volume contains 5 full-length authentic past tests. Great for building stamina and simulating actual exam modules with interactive audio.",
      sectionalStrength: "Listening Comprehension & Reading Passages",
      price: "Approx. ₹2,100 each",
      link: "https://www.amazon.in/s?k=Official+TOEFL+iBT+Tests+Volume+1+and+2"
    },
    {
      name: "Barron's TOEFL iBT Premium with Online Audio",
      publisher: "Barron's Educational Series",
      bestFor: "Skill Building Drills & Campus Lexicon",
      category: "Comprehensive",
      rating: "4.7",
      description: "Contains 8 full practice tests, an absolute academic vocabulary review list, and online access to audio files simulating university classroom lectures.",
      sectionalStrength: "Note-Taking Strategy & Lecture Comprehension",
      price: "Approx. ₹1,400",
      link: "https://www.amazon.in/s?k=Barrons+TOEFL+iBT+Premium"
    },
    {
      name: "Kaplan TOEFL iBT Prep Plus",
      publisher: "Kaplan Test Prep",
      bestFor: "Video Lessons & Essay Templates",
      category: "Strategy",
      rating: "4.7",
      description: "Provides structured self-study plans, strategies for each question format, and full feedback for speaking and writing tasks.",
      sectionalStrength: "Writing for an Academic Discussion Templates",
      price: "Approx. ₹2,300",
      link: "https://www.amazon.in/s?k=Kaplan+TOEFL+iBT+Prep+Plus"
    }
  ],
  prepTips: [
    "Learn to take structured shorthand notes: Vital for answering questions after 4-5 minute academic lectures.",
    "Practice QWERTY typing speed: The 'Writing for an Academic Discussion' task gives you only 10 minutes to formulate a complete 100+ word response.",
    "Use clear speaking templates: State your opinion immediately, follow with 2 specific examples, and wrap up with a summary sentence.",
    "Familiarize yourself with campus vocabulary across physical sciences, social sciences, arts, and student administrative life."
  ],
  faqs: [
    {
      q: "What is a good TOEFL score for top universities?",
      a: "Most top 100 universities worldwide require a minimum composite score of 80–90. Elite Ivy League institutions look for 100+ with sectional scores of at least 25 each."
    },
    {
      q: "Can I use IELTS books to prepare for TOEFL?",
      a: "While English grammar rules overlap, test formats, timer mechanics, and speaking response types are completely different. Use TOEFL-specific books for high score results."
    },
    {
      q: "Is TOEFL easier than IELTS?",
      a: "TOEFL is 100% computer-based, including speaking (speaking into a headset rather than a live interviewer). Candidates comfortable with headphones and fast typing often prefer TOEFL."
    }
  ]
};

const TOEFLBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="toefl" data={toeflData} />;
};

export default TOEFLBooksPage;
