import React from 'react';
import ExamBooksTemplate from '../../../../components/ExamBooksTemplate';

const pteData = {
  examShortName: 'PTE Books',
  title: 'PTE Academic Preparation Books 2025–2026',
  subtitle: 'Achieve a 79+ Superior English score on the Pearson Test of English with AI-optimized study guides.',
  updatedDate: 'Updated for 2025–2026 AI Scoring',
  description: 'Following recent updates to the Pearson AI scoring engine, rote templates are no longer enough. To ace the automated scoring algorithm, you need prep material focusing on continuous oral fluency, academic vocabulary collocations, and structured writing templates.',
  booksList: [
    {
      name: "The Official Guide to PTE Academic (Pearson)",
      publisher: "Pearson Education",
      bestFor: "AI Scoring Rubrics & 20 Task Types",
      category: "Official Guide",
      rating: "4.9",
      description: "Written directly by the test creators. Gives the definitive explanation of all 20 task types and how the AI grading system evaluates pronunciation, oral fluency, and content.",
      sectionalStrength: "Scoring Rubrics, Task Formats & Official Practice Tests",
      price: "Approx. ₹3,500",
      link: "https://www.amazon.in/s?k=Official+Guide+to+PTE+Academic+Pearson"
    },
    {
      name: "PTE Academic Practice Tests Plus (Volumes 1 & 2)",
      publisher: "Pearson Longman",
      bestFor: "Real Audio Accents & Examiner Annotations",
      category: "Practice Mocks",
      rating: "4.8",
      description: "Contains authentic past examination papers, audio CDs featuring British, American, and Australian accents, and sample responses graded by Pearson examiners.",
      sectionalStrength: "Repeat Sentence, Write from Dictation & Re-tell Lecture",
      price: "Approx. ₹1,200",
      link: "https://www.amazon.in/s?k=PTE+Academic+Practice+Tests+Plus"
    },
    {
      name: "Expert PTE Academic Coursebook (B1 & B2)",
      publisher: "Pearson ELT",
      bestFor: "Core Foundations & Integrated Skills",
      category: "Comprehensive",
      rating: "4.7",
      description: "Step-by-step modular lessons with online portal access for real-time homework feedback, grammar drills, and academic writing modules.",
      sectionalStrength: "Speaking Fluency, Essay Structures & Reading Fill in the Blanks",
      price: "Approx. ₹1,495",
      link: "https://www.amazon.in/s?k=Expert+PTE+Academic+Coursebook"
    },
    {
      name: "Wiley’s PTE Advantage for Academic",
      publisher: "Wiley India",
      bestFor: "Oral Fluency & India-Specific Pronunciation Hacks",
      category: "Strategy",
      rating: "4.7",
      description: "Offers simplified structures and templates tailored for non-native English speakers to improve microphone clarity and eliminate speech pauses.",
      sectionalStrength: "Read Aloud & Describe Image Task Mastery",
      price: "Approx. ₹700",
      link: "https://www.amazon.in/s?k=Wileys+PTE+Advantage+for+Academic"
    },
    {
      name: "PTE Academic 79 Plus Target Mastery",
      publisher: "Pearson Prep Masters",
      bestFor: "Advanced 79+ Score Booster (Band 8 Equivalent)",
      category: "Score Booster",
      rating: "4.8",
      description: "A specialized revision guide designed to push candidates from 65 to 79+ for maximum Australian/UK immigration and university points.",
      sectionalStrength: "Summarize Spoken Text, Highlight Correct Summary & Collocations",
      price: "Approx. ₹650",
      link: "https://www.amazon.in/s?k=PTE+Academic+79+Plus"
    }
  ],
  prepTips: [
    "Understand the AI scoring algorithm: Continuous oral fluency and natural rhythm are prioritized over complex accents.",
    "Master high-weightage tasks: 'Read Aloud', 'Repeat Sentence', and 'Write from Dictation' contribute over 50% of the total test score.",
    "Build strong academic collocations: Essential for acing Reading 'Fill in the Blanks' tasks.",
    "Maintain strict typing accuracy: A single typographical or spelling mistake reduces your word score to 0."
  ],
  faqs: [
    {
      q: "PTE Academic vs PTE Core: Which books should I buy?",
      a: "If you are applying for university admission worldwide or Australian/UK visas, choose PTE Academic. If you are applying for Canadian PR/work permit, choose PTE Core."
    },
    {
      q: "How does the automated AI score the speaking section?",
      a: "The algorithm measures acoustic speech rhythm, oral fluency (lack of hesitations/false starts), and phonetic accuracy based on thousands of native and non-native speech models."
    },
    {
      q: "How long does it take to prepare for PTE Academic?",
      a: "Because PTE is computer-scored, students with good English fundamentals can achieve a target score of 65–79 in just 3 to 5 weeks of focused mock practice."
    }
  ]
};

const PTEBooksPage = () => {
  return <ExamBooksTemplate currentExamKey="pte" data={pteData} />;
};

export default PTEBooksPage;
