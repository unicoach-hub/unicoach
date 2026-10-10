// Country display data and the country's own currency for fees (stored in USD in the database).
export const COUNTRY_META = {
  uk: { code: 'gb', name: 'United Kingdom', flagUrl: 'https://flagcdn.com/w40/gb.png', flag: '🇬🇧', currency: 'GBP', symbol: '£', rateFromUSD: 0.79, majorCities: ['london', 'birmingham', 'manchester', 'edinburgh', 'glasgow', 'leeds', 'bristol', 'sheffield', 'coventry'] },
  usa: { code: 'us', name: 'United States', flagUrl: 'https://flagcdn.com/w40/us.png', flag: '🇺🇸', currency: 'USD', symbol: '$', rateFromUSD: 1.0, majorCities: ['new york', 'boston', 'los angeles', 'chicago', 'san francisco', 'seattle', 'atlanta', 'philadelphia'] },
  canada: { code: 'ca', name: 'Canada', flagUrl: 'https://flagcdn.com/w40/ca.png', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', rateFromUSD: 1.36, majorCities: ['toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton'] },
  germany: { code: 'de', name: 'Germany', flagUrl: 'https://flagcdn.com/w40/de.png', flag: '🇩🇪', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['berlin', 'munich', 'frankfurt', 'hamburg', 'stuttgart', 'cologne'] },
  australia: { code: 'au', name: 'Australia', flagUrl: 'https://flagcdn.com/w40/au.png', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', rateFromUSD: 1.52, majorCities: ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'] },
  ireland: { code: 'ie', name: 'Ireland', flagUrl: 'https://flagcdn.com/w40/ie.png', flag: '🇮🇪', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['dublin', 'cork', 'galway', 'limerick'] },
  france: { code: 'fr', name: 'France', flagUrl: 'https://flagcdn.com/w40/fr.png', flag: '🇫🇷', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['paris', 'lyon', 'marseille', 'toulouse', 'nice'] },
  italy: { code: 'it', name: 'Italy', flagUrl: 'https://flagcdn.com/w40/it.png', flag: '🇮🇹', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['rome', 'milan', 'florence', 'turin', 'bologna'] },
  'new-zealand': { code: 'nz', name: 'New Zealand', flagUrl: 'https://flagcdn.com/w40/nz.png', flag: '🇳🇿', currency: 'NZD', symbol: 'NZ$', rateFromUSD: 1.65, majorCities: ['auckland', 'wellington', 'christchurch'] },
  singapore: { code: 'sg', name: 'Singapore', flagUrl: 'https://flagcdn.com/w40/sg.png', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', rateFromUSD: 1.34, majorCities: ['singapore'] }
};

// A USD amount in the country's own currency, e.g. 20000 → "€18,400" for Ireland (rounded to 100)
export const formatInCountryCurrency = (usdAmount, meta) => {
  const m = meta || { currency: 'USD', symbol: '$', rateFromUSD: 1 };
  const local = Math.round((Number(usdAmount) * (m.rateFromUSD || 1)) / 100) * 100;
  return `${m.symbol}${local.toLocaleString('en-US')}`;
};

export const getCountryMeta = (countryCodeOrName = '') => {
  // Some pages pass the populated country document ({ _id, name, code }) straight from the API
  const value = countryCodeOrName && typeof countryCodeOrName === 'object'
    ? (countryCodeOrName.name || countryCodeOrName.code || '')
    : countryCodeOrName;
  const norm = String(value).toLowerCase().trim();
  if (norm.includes('uk') || norm.includes('united kingdom') || norm.includes('england') || norm.includes('scotland')) return COUNTRY_META.uk;
  if (norm.includes('usa') || norm.includes('united states') || norm.includes('america')) return COUNTRY_META.usa;
  if (norm.includes('canada')) return COUNTRY_META.canada;
  if (norm.includes('germany') || norm.includes('deutschland')) return COUNTRY_META.germany;
  if (norm.includes('australia')) return COUNTRY_META.australia;
  if (norm.includes('ireland')) return COUNTRY_META.ireland;
  if (norm.includes('france')) return COUNTRY_META.france;
  if (norm.includes('italy')) return COUNTRY_META.italy;
  if (norm.includes('zealand')) return COUNTRY_META['new-zealand'];
  if (norm.includes('singapore')) return COUNTRY_META.singapore;
  return { code: 'un', name: value || 'International', flagUrl: null, flag: '🌐', currency: 'USD', symbol: '$', rateFromUSD: 1.0, majorCities: [] };
};

