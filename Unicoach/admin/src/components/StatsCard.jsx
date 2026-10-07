import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatsCard = ({ icon, label, value, color = 'indigo', trend, loading = false }) => {
  if (loading) {
    return (
      <div className={`stats-card stats-card--${color} relative overflow-hidden select-none`}>
        <div className="stats-card-top flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-200/70 animate-pulse" />
          {trend !== undefined && trend !== null && (
            <div className="w-12 h-5 rounded-full bg-slate-200/60 animate-pulse" />
          )}
        </div>
        <div className="stats-card-bottom mt-4 space-y-2">
          <div className="h-7 w-20 bg-slate-200/80 rounded-lg animate-pulse" />
          <div className="h-3 w-28 bg-slate-200/60 rounded-md animate-pulse" />
        </div>
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite] pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card-top">
        <div className={`stats-card-icon stats-card-icon--${color}`}>
          {icon}
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`stats-card-trend ${trend >= 0 ? 'stats-card-trend--up' : 'stats-card-trend--down'}`}>
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stats-card-bottom">
        <p className="stats-card-value">{value !== undefined && value !== null ? value : 0}</p>
        <p className="stats-card-label">{label}</p>
      </div>
      {/* Decorative shimmer */}
      <div className="stats-card-shimmer" />
    </div>
  );
};

export default StatsCard;
