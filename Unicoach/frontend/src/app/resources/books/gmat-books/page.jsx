import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const gmatData = {
  examShortName: 'GMAT Books',
  title: 'GMAT Focus Edition Best Preparation Books 2025–2026',
  subtitle: 'Excel in the new business school admissions test with official GMAC materials, Data Insights guides, and Quant shortcuts.',
  updatedDate: 'Updated for GMAT Focus Edition',
  description: 'The new GMAT Focus Edition has removed sentence correction and geometry, adding a crucial Data Insights section. These recommended books help you master high-level mathematical reasoning, integrated graphs, and executive business logic.',
  booksList: [
    {
      name: "GMAT Official Guide Focus Edition (GMAC)",
      publisher: "Graduate Management Admission Council (GMAC)",
      bestFor: "Official Past Prompts & Diagnostic Practice",
      category: "Official Guide",
      rating: "4.9",
      description: "The gold standard book containing 800+ real questions from past GMAT tests. Comes with online access code for customized adaptive question sets.",
      sectionalStrength: "Quantitative, Verbal & Data Insights Official Question Bank",
      price: "Approx. ₹3,900",
      link: "https://www.amazon.in/s?k=GMAT+Official+Guide+Focus+Edition"
    },
    {
      name: "Manhattan Prep GMAT Focus Complete Strategy Set",
      publisher: "Manhattan Prep / Kaplan",
      bestFor: "Deep Concept Breakdowns & Algebraic Shortcuts",
      category: "Comprehensive",
      rating: "4.9",
      description: "A comprehensive set targeting Quantitative, Verbal, and Data Insights. Teaches advanced arithmetic reasoning, logical arguments, and chart analysis.",
      sectionalStrength: "Data Insights Logic, Multi-Source Reasoning & Math Principles",
      price: "Approx. ₹4,500",
      link: "https://www.amazon.in/s?k=Manhattan+Prep+GMAT+Focus+Strategy+Guides"
    },
    {
      name: "PowerScore GMAT Critical Reasoning Bible",
      publisher: "PowerScore Publishing (David M. Killoran)",
      bestFor: "Verbal Logic & Argument Deconstruction",
      category: "Verbal Logic",
      rating: "4.8",
      description: "A specialized master guide for dissecting GMAT arguments, finding unstated assumptions, and resolving paradox questions.",
      sectionalStrength: "Critical Reasoning Question Taxonomy & Logic Flaws",
      price: "Approx. ₹2,200",
      link: "https://www.amazon.in/s?k=PowerScore+GMAT+Critical+Reasoning+Bible"
    },
    {
      name: "Kaplan GMAT Prep Plus Focus Edition",
      publisher: "Kaplan Test Prep",
      bestFor: "General Study Planner & 6 Adaptive CAT Mocks",
      category: "Practice Mocks",
      rating: "4.7",
      description: "An excellent all-rounder with strategy tutorials, math formulas, and 6 full-length Computer Adaptive Tests (CATs) simulating real scoring.",
      sectionalStrength: "Adaptive Mock Simulations & Timing Strategy",
      price: "Approx. ₹2,400",
      link: "https://www.amazon.in/s?k=Kaplan+GMAT+Prep+Plus"
    }
  ],
  prepTips: [
    "Dedicate extra time to Data Insights: Tables, multi-source reasoning, two-part analysis, and data sufficiency.",
    "Do not rely on a calculator for Quantitative: The GMAT Focus Quant section is non-calculator (calculator is only available in Data Insights).",
    "Master the new question bookmarking rule: You can bookmark questions and modify up to 3 answers per section before submitting.",
    "Target consistent pacing: 64 mins for Quant (21 questions), 45 mins for Verbal (23 questions), and 45 mins for Data Insights (20 questions)."
  ],
  faqs: [
    {
      q: "What changed in the new GMAT Focus Edition?",
      a: "The AWA essay and Sentence Correction have been removed, geometry is eliminated, and a new scored Data Insights section has been added. The total exam time is now only 2 hours and 15 minutes."
    },
    {
      q: "What is a good GMAT Focus score for top MBA programs?",
      a: "The Focus score scale is 205 to 805. A score of 645+ is roughly equivalent to a 700+ on the classic GMAT, making you competitive for top business schools like INSEAD, LBS, and Wharton."
    },
    {
      q: "How many adaptive mock tests should I take before test day?",
      a: "Taking 5 to 7 computer-adaptive mock tests (especially official GMAC Practice Exams 1–6) is essential to calibrate your section ordering and pacing strategy."
    }
  ]
};

const GMATBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="gmat" data={gmatData} />;
};

export default GMATBooksPage;
