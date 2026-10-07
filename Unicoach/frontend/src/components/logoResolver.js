import logoMap from './logoMap.json';

// Custom overrides mapping normalized name to the target normalized name in the map
const customOverrides = {
  'universitycollegekork': 'universitycollegecork',
  'universitycollegedublin': 'universitycollegedublin',
  'dublincityuniversity': 'dublincityuniversity',
  'technologicaluniversitydublin': 'technologicaluniversitydublin',
  'universityofmelbourne': 'universityofmelbourne',
  'universityofsydney': 'universityofsydney',
  'universityofqueensland': 'universityofqueensland',
  'universityofadelaide': 'universityofadelaide',
};

// Helper function to resolve logo filename from map
const resolveLogoFilename = (normalizedInput) => {
  // 1. Check custom overrides
  if (customOverrides[normalizedInput]) {
    const targetKey = customOverrides[normalizedInput];
    // Try target key, then fallback to normalized key if not found
    const filename = logoMap[targetKey] || logoMap[normalizedInput];
    if (filename) return filename;
  }

  // 2. Check exact normalized match
  if (logoMap[normalizedInput]) {
    return logoMap[normalizedInput];
  }

  // 3. Try fuzzy/substring match
  for (const key of Object.keys(logoMap)) {
    if (key.length > 5 && (normalizedInput.includes(key) || key.includes(normalizedInput))) {
      return logoMap[key];
    }
  }

  return null;
};

const AVATAR_COLORS = [
  ['#DE5C2B', '#E87A4F'], // UniCoach Brand Orange
  ['#4F46E5', '#7C3AED'], // Indigo → Violet
  ['#0F766E', '#0D9488'], // Teal → Emerald
  ['#7C3AED', '#EC4899'], // Violet → Pink
  ['#0284C7', '#2563EB'], // Sky → Blue
  ['#059669', '#10B981'], // Emerald
  ['#D97706', '#EA580C'], // Amber → Orange
  ['#312E81', '#4F46E5'], // Deep Navy → Indigo
  ['#BE123C', '#E11D48'], // Rose
];

export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getUniversityInitials = (name = '') => {
  if (!name) return 'U';

  // 1. Check parenthetical abbreviation e.g. "Ryerson University (TMU)" -> "TMU", "Nova Scotia College of Art and Design University (NSCAD)" -> "NSCAD"
  const parenMatch = name.match(/\(([A-Z0-9\s&'+-]+)\)/i);
  if (parenMatch && parenMatch[1].length >= 2 && parenMatch[1].length <= 6) {
    const candidate = parenMatch[1].trim();
    if (!candidate.toLowerCase().includes('parent') && 
        !candidate.toLowerCase().includes('medical') &&
        !candidate.toLowerCase().includes('laurier') &&
        !candidate.toLowerCase().includes('edmonton')) {
      return candidate.toUpperCase();
    }
  }

  // 2. Curated standard acronyms for Canadian & global universities
  const cleanKey = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const known = {
    "university of toronto": "UofT",
    "university of british columbia": "UBC",
    "mcgill university": "McGill",
    "mcmaster university": "Mac",
    "university of waterloo": "UW",
    "university of alberta": "UAlberta",
    "university of calgary": "UCalgary",
    "simon fraser university": "SFU",
    "queen's university": "Queen's",
    "dalhousie university": "Dal",
    "university of ottawa": "uOttawa",
    "western university": "Western",
    "university of western ontario": "Western",
    "ryerson university": "TMU",
    "toronto metropolitan university": "TMU",
    "memorial university of newfoundland": "MUN",
    "university of prince edward island": "UPEI",
    "university of victoria": "UVic",
    "university of saskatchewan": "USask",
    "university of manitoba": "UManitoba",
    "york university": "York",
    "carleton university": "Carleton",
    "concordia university": "Concordia",
    "university of guelph": "UoG",
    "université de montréal": "UdeM",
    "université laval": "ULaval",
    "université de sherbrooke": "UdeS",
    "st. francis xavier university": "StFX",
    "nova scotia college of art and design": "NSCAD",
    "university of northern british columbia": "UNBC",
    "ontario college of art and design": "OCAD",
    "university of ontario institute of technology": "UOIT",
    "ontario tech university": "UOIT",
    "université du québec à montréal": "UQAM",
    "école de technologie supérieure": "ÉTS",
    "école des hautes études commerciales": "HEC",
    "saint mary's university": "SMU",
    "mount allison university": "MTA",
    "cape breton university": "CBU",
    "acadia university": "Acadia",
    "trent university": "Trent",
    "lakehead university": "Lakehead",
    "laurentian university": "Laurentian",
    "brock university": "Brock",
    "university of windsor": "UWindsor",
    "university of winnipeg": "UWinnipeg",
    "university of regina": "URegina",
    "university of lethbridge": "ULeth",
    "athabasca university": "Athabasca",
    "royal roads university": "RRU",
    "thompson rivers university": "TRU",
    "vancouver island university": "VIU",
    "kwantlen polytechnic university": "KPU",
    "university of the fraser valley": "UFV",
    "yukon university": "YukonU",
    "emily carr university": "ECU"
  };

  for (const [k, acr] of Object.entries(known)) {
    const normK = k.replace(/[^a-z0-9\s]/g, '').trim();
    if (cleanKey.includes(normK) || normK.includes(cleanKey)) {
      return acr;
    }
  }

  // 3. Extract uppercase letters of significant words
  const words = name
    .replace(/\[\d+\]|\(\d+\)/g, '')
    .replace(/\s*-\s*including medical and dental/gi, '')
    .replace(/\s*\(parent\)/gi, '')
    .split(/[\s/,-]+/)
    .filter(Boolean);

  const stopWords = new Set(['of', 'the', 'and', '&', 'for', 'in', 'at', 'de', 'la', 'du', 'des', 'et', 'à', 'en']);
  const filteredWords = words.filter(w => !stopWords.has(w.toLowerCase()));

  // "University of X" pattern
  if (words.length >= 2 && words[0].toLowerCase() === 'university' && words[1].toLowerCase() === 'of') {
    const restWords = words.slice(2).filter(w => !stopWords.has(w.toLowerCase()));
    if (restWords.length === 1) {
      return `U${restWords[0].substring(0, 3).toUpperCase()}`;
    }
    return `U${restWords.map(w => w[0].toUpperCase()).join('').substring(0, 3)}`;
  }

  // Standard first letters
  const letters = filteredWords.map(w => w[0].toUpperCase()).join('').substring(0, 4);
  return letters || name.substring(0, 3).toUpperCase();
};

export const generateInitialsSvg = (name = '') => {
  const [color1, color2] = getAvatarColor(name);
  const initials = getUniversityInitials(name);
  const fontSize = initials.length > 5 ? 20 : initials.length >= 4 ? 24 : initials.length === 3 ? 30 : 34;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${Math.abs(name.length)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#g_${Math.abs(name.length)})"/>
    <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Returns a local university logo URL based on the university's name
 * @param {string} name - The name of the university
 * @param {string} fallback - An optional fallback URL/image
 */
export const getUniversityLogo = (name, fallback = null) => {
  if (!name && !fallback) {
    return generateInitialsSvg('University');
  }

  const cleanName = (name || '').trim();
  const normalizedInput = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalizedInput) {
    const filename = resolveLogoFilename(normalizedInput);
    if (filename) {
      return `/logos/${filename}`;
    }
  }

  // Check if fallback is a valid URL and not broken/placeholder service
  if (fallback && typeof fallback === 'string') {
    if (!fallback.includes('via.placeholder.com') && 
        !fallback.includes('logo.clearbit.com') && 
        !fallback.includes('ui-avatars.com')) {
      return fallback;
    }
  }

  if (cleanName.startsWith('http://') || cleanName.startsWith('https://') || cleanName.startsWith('/')) {
    if (!cleanName.includes('via.placeholder.com') && 
        !cleanName.includes('logo.clearbit.com') && 
        !cleanName.includes('ui-avatars.com')) {
      return cleanName;
    }
  }

  return generateInitialsSvg(cleanName);
};
