import React, { useEffect } from 'react';
import AiVisaInterviewPrep from '../components/AiVisaInterviewPrep';
import { FinderPage, FinderHero } from '../components/ui/FinderForm';

const AiVisaPrepPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Mock Visa Interview Simulator & Prep | UniCoach';
  }, []);

  return (
    <FinderPage>
      <FinderHero
        eyebrow="AI Visa Interview Prep"
        title="Practise your visa interview"
        subtitle="Answer real US F-1, UK, Canada and Germany visa officer questions and get instant confidence and risk feedback."
        steps={[
          { label: 'Pick visa', sub: 'Country, type' },
          { label: 'Answer', sub: 'Officer questions' },
          { label: 'Feedback', sub: 'Score and risks' },
          { label: 'Improve', sub: 'Try again' },
        ]}
        active={0}
      />
      <div className="mt-8">
        <AiVisaInterviewPrep />
      </div>
    </FinderPage>
  );
};

export default AiVisaPrepPage;
