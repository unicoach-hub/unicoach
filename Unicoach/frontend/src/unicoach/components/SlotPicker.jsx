import React, { useState } from 'react';
import { Calendar, Clock, Globe2, AlertCircle, Sparkles, Moon, Sun } from 'lucide-react';
import { TimezoneOptions } from './TimezoneOptions';

const SlotPicker = ({ 
  groupedSlots, 
  userTimezone = 'Asia/Kolkata', 
  mentorTimezone = 'Europe/Dublin',
  onChangeTimezone,
  selectedSlot, 
  onSelectSlot, 
  loading 
}) => {
  const [selectedDateKey, setSelectedDateKey] = useState(
    groupedSlots?.[0]?.dateKey || null
  );

  // Sync if groupedSlots loads or changes
  const activeDateKey = selectedDateKey && groupedSlots.some(g => g.dateKey === selectedDateKey)
    ? selectedDateKey
    : groupedSlots?.[0]?.dateKey || null;

  const activeGroup = groupedSlots?.find(g => g.dateKey === activeDateKey);

  const totalSlotsCount = Array.isArray(groupedSlots)
    ? groupedSlots.reduce((acc, g) => acc + (Array.isArray(g.slots) ? g.slots.length : 0), 0)
    : 0;


  // Clean country/city label for mentor
  const getMentorCityLabel = (tz) => {
    if (!tz) return 'Abroad';
    if (tz.includes('Dublin')) return '🇮🇪 Dublin, Ireland';
    if (tz.includes('London')) return '🇬🇧 London, UK';
    if (tz.includes('Berlin')) return '🇩🇪 Berlin, Germany';
    if (tz.includes('Paris')) return '🇫🇷 Paris, France';
    if (tz.includes('Amsterdam')) return '🇳🇱 Amsterdam, Netherlands';
    if (tz.includes('New_York')) return '🇺🇸 New York, USA';
    if (tz.includes('Los_Angeles')) return '🇺🇸 San Francisco / LA, USA';
    if (tz.includes('Toronto')) return '🇨🇦 Toronto, Canada';
    if (tz.includes('Dubai')) return '🇦🇪 Dubai, UAE';
    if (tz.includes('Singapore')) return '🇸🇬 Singapore';
    if (tz.includes('Sydney')) return '🇦🇺 Sydney, Australia';
    if (tz.includes('Kolkata')) return '🇮🇳 India (IST)';
    return tz.split('/').pop().replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-sm">
        <div className="w-8 h-8 border-2 border-[#DE5C2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Checking real-time calendar availability...</p>
      </div>
    );
  }

  if (!groupedSlots || groupedSlots.length === 0 || totalSlotsCount === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-3xl border border-amber-200/90 p-6 sm:p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
          Currently Fully Booked
        </div>
        <h4 className="text-base font-extrabold text-slate-900 mb-1">
          No Upcoming Slots Available
        </h4>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed mb-4">
          This mentor has not opened any 1:1 call windows for the upcoming days. You cannot book this session right now until new slots are published.
        </p>
        <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 max-w-md mx-auto text-left flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Need urgent advice?</strong> You can connect via <strong>Priority DM</strong> to get a direct verified answer within 24–48 hours, or check back once the mentor publishes new calendar slots.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm">
      {/* Header with Title and Timezone */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#DE5C2B]" />
          Select Date & Time
        </h2>

        {/* Compact Timezone Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={userTimezone}
              onChange={(e) => onChangeTimezone && onChangeTimezone(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-none outline-none cursor-pointer pr-1 focus:ring-0"
              title="Change displayed timezone"
            >
              <TimezoneOptions current={userTimezone} />
            </select>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            Mentor: {getMentorCityLabel(mentorTimezone)}
          </span>
        </div>
      </div>

      {/* Date Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-thin">
        {groupedSlots.map((group) => {
          const isActive = group.dateKey === activeDateKey;
          return (
            <button
              key={group.dateKey}
              type="button"
              onClick={() => setSelectedDateKey(group.dateKey)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold">{group.displayDate}</div>
              <div className={`text-[10px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {group.slots.length} available
              </div>
            </button>
          );
        })}
      </div>

      {/* Slots Grid with Dual-Time & Next-Day Detection */}
      {activeGroup && activeGroup.slots.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {activeGroup.slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1 cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 shadow-2xs'
                  }`}
                >
                  {/* Student Local Time (Primary) */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-extrabold text-sm">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#DE5C2B]'}`} />
                      <span>{slot.startTimeStr}</span>
                    </div>

                    {/* Day / Time Status Badges */}
                    {slot.isNextDayForStudent && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`} title="This session falls on the next calendar day in your local time!">
                        <Moon className="w-2.5 h-2.5" />
                        <span>Next Day</span>
                      </span>
                    )}

                    {!slot.isNextDayForStudent && slot.isPrimeHoursForStudent && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        🔥 Peak
                      </span>
                    )}
                  </div>

                  {/* Mentor Home Time Subtitle (Secondary Dual Time) */}
                  <div className="flex items-center justify-between text-[11px] mt-0.5">
                    <span className={isSelected ? 'text-indigo-100' : 'text-slate-500 font-medium'}>
                      {slot.mentorStartTimeStr} ({mentorTimezone.includes('Dublin') ? 'Dublin' : mentorTimezone.split('/')[1]?.replace(/_/g, ' ') || 'Mentor'})
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {slot.durationMinutes || 30}m
                    </span>
                  </div>

                  {/* Service Specificity Tag */}
                  {slot.serviceTitle && slot.serviceTitle !== 'All 1:1 Services' && (
                    <div className="mt-1">
                      <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      } truncate block max-w-full`}>
                        🎯 {slot.serviceTitle}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Slot Confirmation Summary Card */}
          {selectedSlot && (
            <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-2.5 text-xs text-indigo-950 animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Selected Session Time:
                </p>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  <strong>{selectedSlot.startTimeStr} – {selectedSlot.endTimeStr}</strong> ({userTimezone === 'Asia/Kolkata' ? 'India IST' : userTimezone}) 
                  {selectedSlot.mentorStartTimeStr && (
                    <span> ⇄ <strong>{selectedSlot.mentorStartTimeStr}</strong> in mentor's time ({getMentorCityLabel(mentorTimezone)})</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500 py-4 text-center">
          No slots remaining for this date.
        </p>
      )}
    </div>
  );
};

export default SlotPicker;
