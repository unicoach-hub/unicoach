import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const satData = {
  examShortName: 'SAT Books',
  title: 'Digital SAT Study Material & Books 2025–2026',
  subtitle: 'Succeed in the new Adaptive Digital SAT format with College Board official & top publisher prep materials.',
  updatedDate: 'Updated for Digital SAT Format',
  description: 'With the SAT transition to a fully digital, adaptive format, standard paper-based books are outdated. You need modern prep material aligned with shorter reading passages and the built-in Desmos graphing calculator.',
  booksList: [
    {
      name: "The Official Digital SAT Study Guide (College Board)",
      publisher: "College Board Official",
      bestFor: "Official Adaptive Tests & Formats",
      category: "Official Guide",
      rating: "4.9",
      description: "The primary official resource. Details the new digital adaptive formats and includes four authentic digital practice tests published directly by the test creators.",
      sectionalStrength: "Exact Test Specifications & Math/Reading Framework",
      price: "Approx. ₹2,400",
      link: "https://www.amazon.in/s?k=Official+Digital+SAT+Study+Guide+College+Board"
    },
    {
      name: "Princeton Review SAT Premium Prep 2026",
      publisher: "The Princeton Review",
      bestFor: "Full Strategy Package & 8 Mock Tests",
      category: "Comprehensive",
      rating: "4.8",
      description: "Provides comprehensive math review, reading comprehension strategies, and online adaptive mock test engine access.",
      sectionalStrength: "Math Techniques & Adaptive Mock Simulation Engine",
      price: "Approx. ₹2,500",
      link: "https://www.amazon.in/s?k=Princeton+Review+Digital+SAT+Premium+Prep"
    },
    {
      name: "SAT Prep Black Book (Mike Barrett)",
      publisher: "Mike Barrett (ACT Prep LLC)",
      bestFor: "Deconstructing Test Traps & Flaws",
      category: "Strategy",
      rating: "4.8",
      description: "Explains how the SAT is designed and teaches you how to leverage systematic test question structures to find correct answers without guesswork.",
      sectionalStrength: "Strategic Reasoning & Reading Passage Analysis",
      price: "Approx. ₹1,800",
      link: "https://www.amazon.in/s?k=SAT+Prep+Black+Book+Mike+Barrett"
    },
    {
      name: "Barron's Digital SAT Study Guide Premium",
      publisher: "Barron's Educational Series",
      bestFor: "Targeted Math & Writing Drills",
      category: "Practice Mocks",
      rating: "4.7",
      description: "Offers targeted subject reviews, guidance on solving quadratics with Desmos, and 5 full adaptive mock test drills.",
      sectionalStrength: "Algebra, Advanced Math & Problem Solving",
      price: "Approx. ₹1,499",
      link: "https://www.amazon.in/s?k=Barrons+Digital+SAT+Study+Guide"
    },
    {
      name: "The Critical Reader: The Complete Guide to SAT Reading",
      publisher: "Erica L. Meltzer",
      bestFor: "SAT Reading & Evidence-Based Questions",
      category: "Reading",
      rating: "4.9",
      description: "Universally acknowledged as the gold standard for SAT Reading. Explains rhetorical analysis and vocabulary-in-context questions.",
      sectionalStrength: "Reading Comprehension & Question Breakdown",
      price: "Approx. ₹2,200",
      link: "https://www.amazon.in/s?k=The+Critical+Reader+Erica+Meltzer+SAT"
    }
  ],
  prepTips: [
    "Download the College Board Bluebook app and take official adaptive diagnostic tests under exam conditions.",
    "Master the built-in Desmos graphing calculator to solve complex systems of equations and polynomials in seconds.",
    "Focus on high-frequency grammar punctuation rules (semi-colons, colons, em-dashes) for easy score wins.",
    "Practice reading speed with dense academic texts (scientific journals, historical speeches, literature excerpts)."
  ],
  faqs: [
    {
      q: "What is a good score on the Digital SAT?",
      a: "A score of 1250+ is good, while scores above 1450 place you in the top 5% of test-takers globally, making you highly competitive for top US & Canadian universities and merit scholarships."
    },
    {
      q: "How does the multistage adaptive scoring work?",
      a: "The test consists of two modules per section. Performing well on Module 1 unlocks a higher-difficulty Module 2, enabling you to score up to 800 per section."
    },
    {
      q: "How long should high school students prepare for the SAT?",
      a: "Usually, 2 to 3 months of focused practice (4-6 hours per week) is optimal to achieve a 100-180 point jump."
    }
  ]
};

const SATBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="sat" data={satData} />;
};

export default SATBooksPage;
