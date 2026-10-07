import { useState, useEffect, useMemo } from 'react';
import { getAvailableSlots } from '../api/unicoachApi';

export const useAvailableSlots = (handle, serviceId = null) => {
  const [rawSlots, setRawSlots] = useState([]);
  const [mentorTimezone, setMentorTimezone] = useState('Europe/Dublin');
  const [customUserTimezone, setCustomUserTimezone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User's Local Browser Timezone (Pillar #2) - defaults to browser or Asia/Kolkata
  const browserTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch (e) {
      return 'Asia/Kolkata';
    }
  }, []);

  const effectiveUserTimezone = customUserTimezone || browserTimezone;

  const fetchSlots = () => {
    if (!handle) return;
    setLoading(true);
    setError(null);

    getAvailableSlots(handle, null, null, serviceId)
      .then((data) => {
        setRawSlots(data.slots || []);
        if (data.mentorTimezone) setMentorTimezone(data.mentorTimezone);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSlots();
  }, [handle, serviceId]);

  // Group slots by student's local date
  const groupedSlots = useMemo(() => {
    const groups = {};

    for (const slot of rawSlots) {
      const startDate = new Date(slot.startUtc);
      const endDate = new Date(slot.endUtc);

      // Format date in student's local timezone
      const dateKey = startDate.toLocaleDateString('en-CA', { timeZone: effectiveUserTimezone }); // YYYY-MM-DD
      const mentorDateKey = startDate.toLocaleDateString('en-CA', { timeZone: mentorTimezone }); // YYYY-MM-DD in mentor's location

      const displayDate = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: effectiveUserTimezone
      });

      const startTimeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: effectiveUserTimezone
      });

      const endTimeStr = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: effectiveUserTimezone
      });

      // Format mentor's local time for dual-time badge
      const mentorStartTimeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: mentorTimezone
      });

      // Check student local 24-hr hour
      const studentHourStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: effectiveUserTimezone
      });
      const studentHour = Number(studentHourStr) % 24;

      const isNextDayForStudent = dateKey > mentorDateKey;
      const isLateNightForStudent = studentHour >= 23 || studentHour < 6; // 11 PM to 6 AM
      const isPrimeHoursForStudent = studentHour >= 17 && studentHour <= 22; // 5 PM to 10 PM

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          displayDate,
          slots: []
        };
      }

      groups[dateKey].slots.push({
        id: slot.id,
        startUtc: slot.startUtc,
        endUtc: slot.endUtc,
        durationMinutes: slot.durationMinutes,
        startTimeStr,
        endTimeStr,
        mentorStartTimeStr,
        mentorTimezone,
        serviceId: slot.serviceId || null,
        serviceTitle: slot.serviceTitle || 'All 1:1 Services',
        isNextDayForStudent,
        isLateNightForStudent,
        isPrimeHoursForStudent,
        timeRangeStr: `${startTimeStr} - ${endTimeStr}`
      });
    }

    return Object.values(groups);
  }, [rawSlots, effectiveUserTimezone, mentorTimezone]);

  return {
    groupedSlots,
    rawSlots,
    userTimezone: effectiveUserTimezone,
    setUserTimezone: setCustomUserTimezone,
    mentorTimezone,
    setMentorTimezone,
    loading,
    error,
    refreshSlots: fetchSlots
  };
};
