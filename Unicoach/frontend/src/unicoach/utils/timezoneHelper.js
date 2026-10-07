/**
 * Timezone Helpers for UniCoach
 * Seamlessly manages international mentors (Dublin, London, NY, etc.) and Indian students (Asia/Kolkata).
 */

export const POPULAR_TIMEZONES = [
  { value: 'Europe/Dublin', label: '🇮🇪 Dublin, Ireland (Europe/Dublin)', city: 'Dublin', country: 'Ireland' },
  { value: 'Europe/London', label: '🇬🇧 London, UK (Europe/London)', city: 'London', country: 'United Kingdom' },
  { value: 'Europe/Berlin', label: '🇩🇪 Berlin / Munich (Europe/Berlin)', city: 'Berlin', country: 'Germany' },
  { value: 'Europe/Paris', label: '🇫🇷 Paris, France (Europe/Paris)', city: 'Paris', country: 'France' },
  { value: 'Europe/Amsterdam', label: '🇳🇱 Amsterdam (Europe/Amsterdam)', city: 'Amsterdam', country: 'Netherlands' },
  { value: 'America/New_York', label: '🇺🇸 New York / Boston (America/New_York)', city: 'New York', country: 'USA' },
  { value: 'America/Chicago', label: '🇺🇸 Chicago / Austin (America/Chicago)', city: 'Chicago', country: 'USA' },
  { value: 'America/Los_Angeles', label: '🇺🇸 San Francisco / Seattle (America/Los_Angeles)', city: 'San Francisco', country: 'USA' },
  { value: 'America/Toronto', label: '🇨🇦 Toronto / Waterloo (America/Toronto)', city: 'Toronto', country: 'Canada' },
  { value: 'America/Vancouver', label: '🇨🇦 Vancouver (America/Vancouver)', city: 'Vancouver', country: 'Canada' },
  { value: 'Asia/Dubai', label: '🇦🇪 Dubai, UAE (Asia/Dubai)', city: 'Dubai', country: 'UAE' },
  { value: 'Asia/Singapore', label: '🇸🇬 Singapore (Asia/Singapore)', city: 'Singapore', country: 'Singapore' },
  { value: 'Australia/Sydney', label: '🇦🇺 Sydney / Melbourne (Australia/Sydney)', city: 'Sydney', country: 'Australia' },
  { value: 'Asia/Kolkata', label: '🇮🇳 India (IST, Asia/Kolkata)', city: 'New Delhi / Bengaluru', country: 'India' },
];

/**
 * Accurately convert local date + time in an IANA timezone into a UTC Date object
 */
export const getZonedDateToUtc = (dateStr, timeStr, timeZone = 'Asia/Kolkata') => {
  if (!dateStr || !timeStr) return new Date();
  if (!timeZone || timeZone === 'UTC') {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Naive UTC representation
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(naiveUtc);
    const p = {};
    for (const part of parts) {
      p[part.type] = part.value;
    }

    const zonedHour = Number(p.hour) === 24 ? 0 : Number(p.hour);
    const zonedYear = Number(p.year);
    const zonedMonth = Number(p.month);
    const zonedDay = Number(p.day);
    const zonedMinute = Number(p.minute);

    const asIfUtc = Date.UTC(zonedYear, zonedMonth - 1, zonedDay, zonedHour, zonedMinute, 0);
    const offsetMs = asIfUtc - naiveUtc.getTime();

    return new Date(naiveUtc.getTime() - offsetMs);
  } catch (e) {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }
};

/**
 * Convert mentor local time (e.g. "21:00") into Indian Standard Time (IST)
 * and provide actionable feedback on whether Indian students can attend.
 */
export const convertMentorTimeToIST = (timeStr, mentorTimezone = 'Europe/Dublin', baseDateStr = null) => {
  if (!timeStr) return null;

  const todayStr = baseDateStr || new Date().toISOString().split('T')[0];
  const trueUtc = getZonedDateToUtc(todayStr, timeStr, mentorTimezone);

  if (isNaN(trueUtc.getTime())) return null;

  // Format in India (Asia/Kolkata)
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const istTimeStr = istFormatter.format(trueUtc);

  // Check date in mentor timezone vs India timezone
  const mentorDate = trueUtc.toLocaleDateString('en-CA', { timeZone: mentorTimezone });
  const istDate = trueUtc.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const isNextDay = istDate > mentorDate;
  const isPrevDay = istDate < mentorDate;

  // Extract IST hour (24h) to determine availability health
  const ist24Formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  });
  const istHour24 = Number(ist24Formatter.format(trueUtc)) % 24;

  const isLateNight = istHour24 >= 23 || istHour24 < 6; // 11 PM to 6 AM in India
  const isEarlyMorning = istHour24 >= 6 && istHour24 < 9; // 6 AM to 9 AM in India
  const isPrimeHours = istHour24 >= 17 && istHour24 <= 22; // 5 PM to 10 PM in India (best booking hours!)

  let statusBadge = {
    type: 'neutral',
    text: 'Standard Time'
  };

  if (isLateNight) {
    statusBadge = {
      type: 'warning',
      text: '🌙 Late Night in India'
    };
  } else if (isPrimeHours) {
    statusBadge = {
      type: 'success',
      text: '🔥 Prime Student Hours'
    };
  } else if (isEarlyMorning) {
    statusBadge = {
      type: 'info',
      text: '🌅 Early Morning'
    };
  }

  return {
    istTimeStr,
    isNextDay,
    isPrevDay,
    isLateNight,
    isEarlyMorning,
    isPrimeHours,
    statusBadge,
    istDateStr: istDate,
    mentorDateStr: mentorDate
  };
};

/**
 * Returns formatted difference string between mentor's timezone and India
 */
export const getTimezoneDiff = (mentorTimezone = 'Europe/Dublin') => {
  try {
    const now = new Date();
    // Get offsets
    const getOffsetMinutes = (tz) => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'longOffset'
      }).formatToParts(now);
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';
      const match = tzName.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
      if (!match) return 0;
      const sign = match[1] === '-' ? -1 : 1;
      const hours = Number(match[2] || 0);
      const minutes = Number(match[3] || 0);
      return sign * (hours * 60 + minutes);
    };

    const mentorOffset = getOffsetMinutes(mentorTimezone);
    const istOffset = 330; // India is UTC+5:30 = 330 mins

    const diffMinutes = istOffset - mentorOffset;
    const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
    const remMins = Math.abs(diffMinutes) % 60;

    let timeDiffStr = `${diffHours}h`;
    if (remMins > 0) timeDiffStr += ` ${remMins}m`;

    if (diffMinutes > 0) {
      return `India is ${timeDiffStr} ahead of your location`;
    } else if (diffMinutes < 0) {
      return `India is ${timeDiffStr} behind your location`;
    } else {
      return `Same timezone as India (IST)`;
    }
  } catch (e) {
    return 'Timezone synced';
  }
};

/**
 * Recommended mentor hours for maximum Indian student bookings
 */
export const getRecommendedMentorHours = (mentorTimezone = 'Europe/Dublin') => {
  switch (mentorTimezone) {
    case 'Europe/Dublin':
    case 'Europe/London':
      return {
        mentorWindow: '10:00 AM – 06:00 PM (Dublin/UK)',
        istWindow: '02:30 PM – 10:30 PM IST',
        note: 'Perfect match for Indian college students and working professionals!'
      };
    case 'Europe/Berlin':
    case 'Europe/Paris':
    case 'Europe/Amsterdam':
      return {
        mentorWindow: '11:00 AM – 06:30 PM (CET)',
        istWindow: '02:30 PM – 10:00 PM IST',
        note: 'Covers high-intent evening Indian learners after college/work.'
      };
    case 'America/New_York':
    case 'America/Toronto':
      return {
        mentorWindow: '08:00 AM – 01:00 PM (EST)',
        istWindow: '05:30 PM – 10:30 PM IST',
        note: 'Morning slots for you align with evening prime booking time in India.'
      };
    case 'America/Los_Angeles':
    case 'America/Vancouver':
      return {
        mentorWindow: '08:00 AM – 11:30 AM (PST)',
        istWindow: '08:30 PM – 12:00 AM IST',
        note: 'Early morning PST allows Indian students to connect before sleep.'
      };
    case 'Asia/Dubai':
      return {
        mentorWindow: '01:00 PM – 08:30 PM (GST)',
        istWindow: '02:30 PM – 10:00 PM IST',
        note: 'Convenient 1.5 hr difference with India.'
      };
    case 'Australia/Sydney':
      return {
        mentorWindow: '06:00 PM – 10:30 PM (AEST)',
        istWindow: '01:30 PM – 06:00 PM IST',
        note: 'Your post-work evening lines up with afternoon in India.'
      };
    default:
      return {
        mentorWindow: 'Flexible',
        istWindow: '02:00 PM – 10:30 PM IST',
        note: 'Target afternoon and evening IST for best student show-up rates.'
      };
  }
};
