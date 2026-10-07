import React from 'react';
import { GraduationCap } from 'lucide-react';

const CoursesAndFees = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Top Specializations Tags */}
      {data?.topCourses && (
        <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Courses & Programs</h3>
          <div className="flex flex-wrap gap-2">
            {data.topCourses.map((c, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-xl">
                {c.name} {c.count ? `(${c.count})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Courses and Fees List */}
      <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6">Courses, Fees and Durations</h2>
        
        {data?.coursesFees ? (
          <div className="space-y-3">
            {data.coursesFees.map((course, idx) => (
              <div key={idx} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={20} />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-slate-850 text-sm">{course.name}</h4>
                    <span className="text-xs text-slate-400 font-bold block mt-0.5">Duration: {course.duration}</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1st Year Tuition</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    ₹{course.tuition} Lakh / yr
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <span className="text-xs font-bold text-slate-600">Average Annual Tuition Fee: ₹45.2 Lakh INR/yr</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesAndFees;
