import React from 'react';
import { Clock, AlertTriangle, X } from 'lucide-react';

const ReservationTimer = ({ reservation, formattedTime, secondsLeft, onCancel }) => {
  if (!reservation || secondsLeft <= 0) return null;

  // Max 600 seconds
  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / 600) * 100));
  const isUrgent = secondsLeft < 120; // Less than 2 minutes

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-md transition-colors ${
        isUrgent 
          ? 'bg-rose-950/90 text-rose-50 border-rose-800' 
          : 'bg-slate-900/95 text-white border-slate-800'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-indigo-400" />
            )}
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">
                Temporary Slot Lock Active
              </p>
              <p className="text-sm font-bold">
                Reserved for <span className="font-mono text-indigo-400">{formattedTime}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Release lock"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationTimer;
