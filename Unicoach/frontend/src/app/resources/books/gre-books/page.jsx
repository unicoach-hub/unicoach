import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const greData = {
  examShortName: 'GRE Books',
  title: 'GRE General Test Preparation Books 2025–2026',
  subtitle: 'Master the shortened GRE format with official ETS materials, Manhattan 5 lb., and top quantitative problem sets.',
  updatedDate: 'Updated for Shorter GRE Format',
  description: 'Targeting top MS in US/Germany or STEM/MBA programs abroad? The shortened GRE test demands high verbal logic, vocabulary in context, and quantitative problem-solving speed under intense time limits.',
  booksList: [
    {
      name: "The Official Guide to the GRE General Test (ETS)",
      publisher: "Educational Testing Service (ETS)",
      bestFor: "Official Past Prompts & Real Tests",
      category: "Official Guide",
      rating: "4.9",
      description: "Directly from the creators of the test. Contains 4 real practice tests (2 in the book, 2 online POWERPREP) and hundreds of actual past questions.",
      sectionalStrength: "Verbal Reasoning & Math Principles Benchmark",
      price: "Approx. ₹2,800",
      link: "https://www.amazon.in/s?k=Official+Guide+to+the+GRE+General+Test+ETS"
    },
    {
      name: "Manhattan Prep's 5 lb. Book of GRE Practice Problems",
      publisher: "Manhattan Prep / Kaplan",
      bestFor: "Quantitative & Verbal Practice Volume",
      category: "Practice Mocks",
      rating: "4.9",
      description: "Over 1,800 practice questions categorized into specific topic areas (algebra, geometry, probability, reading comprehension). The global industry standard.",
      sectionalStrength: "Quantitative Reasoning Math Drills (160+ Score Target)",
      price: "Approx. ₹1,800",
      link: "https://www.amazon.in/s?k=Manhattan+Prep+5+lb+Book+of+GRE+Practice+Problems"
    },
    {
      name: "GRE Prep by Magoosh",
      publisher: "Magoosh",
      bestFor: "Concept Explanations & Verbal Shortcuts",
      category: "Comprehensive",
      rating: "4.8",
      description: "Compiles their high-rated online lesson content into a convenient physical workbook with step-by-step logic breakdowns and difficulty tags.",
      sectionalStrength: "Text Completion & Sentence Equivalence Strategy",
      price: "Approx. ₹1,500",
      link: "https://www.amazon.in/s?k=GRE+Prep+by+Magoosh"
    },
    {
      name: "Barron's GRE Essential Words (Latest Edition)",
      publisher: "Barron's Educational Series",
      bestFor: "800 High-Frequency GRE Vocabulary List",
      category: "Vocabulary",
      rating: "4.7",
      description: "Includes diagnostic root-word guides, sentence completion flashcards, and the famous Barron's 800 essential word list with mnemonics.",
      sectionalStrength: "Etymology, Root Words & Advanced Verbal Lexicon",
      price: "Approx. ₹900",
      link: "https://www.amazon.in/s?k=Barrons+GRE+Essential+Words"
    },
    {
      name: "GRE Analytical Writing: Solutions to Real Essay Topics",
      publisher: "Vibrant Publishers",
      bestFor: "Analytical Writing (AWA 5.0+ Score)",
      category: "Writing",
      rating: "4.7",
      description: "Contains 60 real 'Analyze an Issue' essay prompts with sample responses scored at 6.0 and detailed structural guidelines.",
      sectionalStrength: "Analytical Writing Assessment (AWA)",
      price: "Approx. ₹750",
      link: "https://www.amazon.in/s?k=GRE+Analytical+Writing+Solutions+to+Real+Essay+Topics"
    }
  ],
  prepTips: [
    "Learn root words (Latin & Greek roots, prefixes, suffixes) to decipher unfamiliar vocabulary questions quickly.",
    "Master Quantitative Comparison tactics: test border values (0, 1, -1, fractions) rather than calculating full equations.",
    "Familiarize yourself with the shortened test structure: total test duration is now under 2 hours.",
    "Maintain an Error Log: review every mistake to classify whether it was a conceptual gap or calculation blunder."
  ],
  faqs: [
    {
      q: "What is considered a competitive GRE score?",
      a: "A score of 320+ (Quant 165+, Verbal 155+) is highly competitive for top 30 US graduate engineering and STEM programs. Elite universities like MIT and Stanford average 325–330."
    },
    {
      q: "Is the Manhattan 5 lb. book enough for Quant?",
      a: "Yes, it is widely considered the most complete math practice bank in existence. Pair it with ETS Official Guide for authentic difficulty calibration."
    },
    {
      q: "Does the GRE permit physical scratch paper?",
      a: "Yes, at test centers you receive scratch paper booklets and pencils. For the GRE at Home test, you must use an erasable whiteboard with dry-erase markers."
    }
  ]
};

const GREBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="gre" data={greData} />;
};

export default GREBooksPage;
