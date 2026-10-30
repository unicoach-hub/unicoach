import React, { useEffect } from 'react';
import AiStudyRoadmap from '../components/AiStudyRoadmap';
import { FinderPage, FinderHero } from '../components/ui/FinderForm';

const AiStudyRoadmapPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI 6-Month Study Abroad Strategic Roadmap | UniCoach';
  }, []);

  return (
    <FinderPage>
      {/* Same hero and card layout as the Course Finder */}
      <FinderHero
        eyebrow="AI Study Roadmap"
        title="Your 6-month admissions roadmap"
        subtitle="Pick your intake, country and stage. Get a week-by-week plan for exams, applications, scholarships and visa."
        steps={[
          { label: 'About you', sub: 'Intake, country' },
          { label: 'Generate', sub: 'Free' },
          { label: 'Weekly plan', sub: 'Deadlines' },
          { label: 'Tick tasks', sub: 'Track progress' },
        ]}
        active={0}
      />
      <div className="mt-8">
        <AiStudyRoadmap />
      </div>
    </FinderPage>
  );
};

export default AiStudyRoadmapPage;
