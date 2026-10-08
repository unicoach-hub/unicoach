import { useMemo } from 'react';
import { getTimezoneOptionGroups } from '../utils/timezoneHelper';

// <option> groups for a time zone <select>: popular cities first, then every time zone worldwide
export const TimezoneOptions = ({ current }) => {
  const groups = useMemo(() => getTimezoneOptionGroups(current), [current]);
  return groups.map((g) => (
    <optgroup key={g.label} label={g.label}>
      {g.options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </optgroup>
  ));
};
