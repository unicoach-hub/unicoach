import React, { useEffect } from 'react';
import AiSopGenerator from '../components/AiSopGenerator';
import { FinderPage, FinderHero } from '../components/ui/FinderForm';

const AiSopGeneratorPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Statement of Purpose (SOP) Writer & Polisher | UniCoach';
  }, []);

  return (
    <FinderPage>
      <FinderHero
        eyebrow="AI SOP Writer"
        title="Write your SOP"
        subtitle="Add your target course, university and background. Get a unique, course-specific Statement of Purpose to copy or download."
        steps={[
          { label: 'Your details', sub: 'University, course' },
          { label: 'Generate', sub: 'Free' },
          { label: 'Review', sub: 'Full or by section' },
          { label: 'Export', sub: 'Copy or download' },
        ]}
        active={0}
      />
      <div className="mt-8">
        <AiSopGenerator />
      </div>
    </FinderPage>
  );
};

export default AiSopGeneratorPage;
