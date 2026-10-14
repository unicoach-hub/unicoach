import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, GraduationCap, BookOpen, Search, ClipboardList, Users,
  Wallet, FileText, HandCoins, Info, Settings2, ChevronRight, ChevronLeft, LogOut,
} from 'lucide-react';

const BLUE = '#226CF5';

// CourseFinder-style slim left icon rail. The UniCoach top nav (76px) is shared and
// stays untouched; this rail sits in the left gutter beneath it, exactly like coursefinder.ai.
// `active` = which item is highlighted (blue rounded square). Items with a `to` navigate;
// decorative ones (B2B-only sections UniCoach doesn't have) show a tooltip and don't route.
const ITEMS = [
  { key: 'home', icon: Home, label: 'Home', to: '/' },
  { key: 'study', icon: GraduationCap, label: 'Study Abroad', to: '/study-abroad' },
  { key: 'resources', icon: BookOpen, label: 'Resources', to: '/resources' },
  { key: 'search', icon: Search, label: 'Search Programs', to: '/search-programs' },
  { key: 'enquiry', icon: ClipboardList, label: 'Enquiries' },
  { key: 'students', icon: Users, label: 'Students' },
  { key: 'wallet', icon: Wallet, label: 'Wallet' },
  { key: 'docs', icon: FileText, label: 'Documents' },
  { key: 'commission', icon: HandCoins, label: 'Commission' },
  { key: 'info', icon: Info, label: 'About' },
  { key: 'learning', icon: Settings2, label: 'Learning' },
];

export default function CfSidebar({ active = 'search' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const go = (it) => { if (it.to) navigate(it.to); };

  return (
    <aside
      className="hidden lg:flex flex-col items-center fixed left-0 top-[76px] bottom-0 z-30 bg-white border-r border-slate-200 py-3"
      style={{ width: open ? 190 : 64, transition: 'width .18s ease' }}
    >
      {/* collapse toggle — matches CF's floating chevron */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute -right-3 top-2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-[#226CF5]"
        title={open ? 'Collapse' : 'Expand'}
      >
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <nav className="flex-1 w-full flex flex-col gap-1 mt-2 px-2">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              onClick={() => go(it)}
              title={it.label}
              className={`group flex items-center gap-3 w-full h-11 ${open ? 'px-3 justify-start' : 'px-0 justify-center'} ${it.to ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ borderRadius: 8, background: isActive ? BLUE : 'transparent' }}
            >
              <Icon size={19} color={isActive ? '#fff' : '#64748b'} className={!isActive && it.to ? 'group-hover:stroke-[#226CF5]' : ''} />
              {open && (
                <span className={`text-[13.5px] font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-600'}`}>{it.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => navigate('/')}
        title="Exit search"
        className={`flex items-center gap-3 w-full h-11 ${open ? 'px-3 justify-start' : 'px-0 justify-center'} text-slate-400 hover:text-[#226CF5] mx-2`}
      >
        <LogOut size={19} />
        {open && <span className="text-[13.5px] font-medium">Exit</span>}
      </button>
    </aside>
  );
}
