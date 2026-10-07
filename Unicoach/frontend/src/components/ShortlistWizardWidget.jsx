import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLead } from '../context/LeadContext';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, ArrowRight } from 'lucide-react';

const countryShortlistOptions = [
  { name: 'UK', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'USA', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'France', flag: 'https://flagcdn.com/w40/fr.png' },
  { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png' }
];

const ShortlistWizardWidget = ({ title = "Get Your University Shortlist", subtitle = "Not sure which university fits your GPA and budget? Let us help you." }) => {
  const { user } = useAuth();
  const { verifiedLead, openEligibilityModal } = useLead();
  const [selectedCountry, setSelectedCountry] = useState('');

  const isLoggedIn = Boolean(user || verifiedLead || (typeof window !== 'undefined' && localStorage.getItem('user_info')));

  // If user is already logged in / lead is verified, hide the duplicate input fields & show Dashboard banner!
  if (isLoggedIn) {
    const studentName = user?.name || verifiedLead?.name || 'Student';
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={13} className="text-indigo-400 animate-pulse" /> Profile & Criteria Saved
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight">Your Shortlist is Ready in Your Dashboard 🎯</h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Welcome back, <strong className="text-white">{studentName}</strong>! You have already entered your details. Access your personalized university recommendations & eligibility calculations anytime.
          </p>
        </div>
        <Link 
          to="/dashboard" 
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs md:text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          View Dashboard Shortlist <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // If new guest user: Render quick dream country selector to capture lead for first time
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs text-left">
      <h3 className="text-xl font-black text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 text-xs font-semibold mb-6">
        {subtitle}
      </p>

      <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 border border-slate-150/70 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-150 text-indigo-700 flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </span>
            <span className="font-extrabold text-slate-800 text-xs md:text-sm">Get My University Shortlist in 60 Secs</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] font-black text-indigo-600">0%</span>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-0" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-xs md:text-sm">Choose your dream country:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {countryShortlistOptions.map((country) => (
              <button
                key={country.name}
                onClick={() => {
                  setSelectedCountry(country.name);
                  openEligibilityModal('wizard-shortlist');
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black tracking-wide border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  selectedCountry === country.name
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <img 
                  src={country.flag} 
                  alt={country.name} 
                  className="w-4.5 h-4.5 rounded-full object-cover shrink-0" 
                />
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortlistWizardWidget;
