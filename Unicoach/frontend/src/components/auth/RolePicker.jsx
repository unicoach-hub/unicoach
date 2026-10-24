import { Check, GraduationCap, Users } from 'lucide-react';

const ROLES = [
  { id: 'student', icon: GraduationCap, kicker: 'I want to study abroad', title: 'Student', points: 'Shortlist, scholarships, 1:1 calls' },
  { id: 'mentor', icon: Users, kicker: "I'm already studying abroad", title: 'Mentor', points: 'Guide students and earn, 0% fee' },
];

// Two tick cards: Student or Mentor
const RolePicker = ({ value, onChange }) => (
  <div role="radiogroup" aria-label="I am a" className="grid grid-cols-2 gap-2.5 mb-5">
    {ROLES.map(({ id, icon: Icon, kicker, title, points }) => {
      const on = value === id;
      return (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onChange(id)}
          className={`relative text-left rounded-2xl border-2 p-3.5 transition-all cursor-pointer ${on ? 'border-[#DE5C2B] bg-orange-50/60 shadow-[0_6px_18px_-8px_rgba(222,92,43,0.45)]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          <span className={`absolute top-3 right-3 w-5 h-5 rounded-full grid place-items-center ${on ? 'bg-[#DE5C2B] text-white' : 'border-2 border-slate-300'}`}>
            {on && <Check className="w-3 h-3" strokeWidth={3.5} />}
          </span>
          <Icon className={`w-5 h-5 ${on ? 'text-[#DE5C2B]' : 'text-slate-500'}`} />
          <p className="mt-2 text-[11px] font-semibold text-slate-500 leading-tight pr-5">{kicker}</p>
          <p className="text-[17px] font-bold text-slate-900 leading-tight mt-0.5">{title}</p>
          <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">{points}</p>
        </button>
      );
    })}
  </div>
);

export default RolePicker;
