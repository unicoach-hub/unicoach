import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, DollarSign, Wallet, ArrowRight } from 'lucide-react';

const CoursesFeesSection = ({ uniData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-8">
        
        {/* Top courses tag block */}
        {uniData.topCourses && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Top Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {uniData.topCourses.map((c, i) => (
                <span key={i} className="text-xs font-bold px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  {c.name} {c.count ? `(${c.count})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Courses & Fees Table */}
        <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Courses and Fees</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">Showing popular degree programs and annual tuition estimates</p>
            </div>
          </div>

          {uniData.coursesFees && uniData.coursesFees.length > 0 ? (
            <div className="space-y-3">
              {uniData.coursesFees.map((course, idx) => (
                <div key={idx} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-850 text-sm">{course.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-0.5">
                        <span>Duration: {course.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1st Year Tuition</span>
                      <span className="text-sm font-black text-slate-900 mt-0.5 block">
                        ₹{course.tuition} Lakh / yr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <span className="text-xs font-bold text-slate-600">Average Annual Tuition Fee: {uniData.tuition || 'Contact for fee structure'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: CTA card */}
      <div className="sticky top-28 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-[28px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
          <Wallet size={24} />
        </div>
        <h3 className="text-lg font-black text-indigo-950 mb-1.5">Get Fee Breakdown</h3>
        <p className="text-xs text-indigo-600 font-bold mb-6">Get detailed cost estimates including scholarships, living expenses, and tuition waivers.</p>
        <Link
          to="/contact?tab=fees"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10"
        >
          <span>Calculate Expenses</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default CoursesFeesSection;
