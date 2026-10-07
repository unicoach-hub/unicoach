/**
 * Centralized Course & University Search Helper
 * Provides synonym expansion, multi-field regex builders, and course matching.
 */

// Comprehensive course aliases and canonical mappings
const COURSE_SYNONYMS = [
  {
    canonical: 'Computer Science',
    aliases: ['cs', 'cse', 'computer science', 'computer engineering', 'computing', 'software systems', 'software']
  },
  {
    canonical: 'Software Engineering',
    aliases: ['swe', 'se', 'software engineering', 'software development', 'devops', 'app development']
  },
  {
    canonical: 'Data Science',
    aliases: ['ds', 'data science', 'data analytics', 'big data', 'data engineering', 'analytics']
  },
  {
    canonical: 'Artificial Intelligence',
    aliases: ['ai', 'ml', 'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'generative ai', 'computer vision', 'computer and information sciences']
  },
  {
    canonical: 'Cybersecurity',
    aliases: ['infosec', 'cyber', 'cybersecurity', 'network security', 'information security', 'information assurance', 'information technology administration']
  },
  {
    canonical: 'Information Technology',
    aliases: ['it', 'mis', 'information technology', 'information systems', 'enterprise tech']
  },
  {
    canonical: 'Cloud Computing',
    aliases: ['cloud', 'cloud computing', 'aws', 'azure', 'devops architecture']
  },
  {
    canonical: 'UI/UX Design',
    aliases: ['ui', 'ux', 'ui/ux', 'design', 'hci', 'interaction design', 'human computer interaction', 'product design']
  },
  {
    canonical: 'Robotics',
    aliases: ['robotics', 'mechatronics', 'automation', 'autonomous systems']
  },
  {
    canonical: 'Mechanical Engineering',
    aliases: ['mech', 'mechanical', 'mechanical engineering', 'thermodynamics', 'cad']
  },
  {
    canonical: 'Electrical Engineering',
    aliases: ['eee', 'ece', 'electrical', 'electronics', 'electrical engineering', 'embedded systems', 'vlsi']
  },
  {
    canonical: 'Civil Engineering',
    aliases: ['civil', 'civil engineering', 'structural engineering', 'construction']
  },
  {
    canonical: 'Aerospace Engineering',
    aliases: ['aero', 'aerospace', 'aeronautical', 'space systems', 'aerospace engineering']
  },
  {
    canonical: 'Biomedical Engineering',
    aliases: ['bme', 'biomed', 'biomedical', 'biomedical engineering', 'bioengineering']
  },
  {
    canonical: 'Chemical Engineering',
    aliases: ['chem', 'chemical', 'chemical engineering', 'materials science']
  },
  {
    canonical: 'Industrial Engineering',
    aliases: ['industrial', 'industrial engineering', 'operations', 'systems engineering']
  },
  {
    canonical: 'Environmental Engineering',
    aliases: ['environmental', 'clean energy', 'renewable energy', 'sustainability']
  },
  {
    canonical: 'Business Administration',
    aliases: ['mba', 'bba', 'business', 'management', 'business administration', 'corporate strategy']
  },
  {
    canonical: 'Business Analytics',
    aliases: ['ba', 'business analytics', 'business intelligence', 'bi']
  },
  {
    canonical: 'Finance',
    aliases: ['finance', 'fintech', 'banking', 'investment banking', 'corporate finance', 'financial']
  },
  {
    canonical: 'Marketing',
    aliases: ['marketing', 'digital marketing', 'advertising', 'brand management']
  },
  {
    canonical: 'International Business',
    aliases: ['ib', 'international business', 'global trade']
  },
  {
    canonical: 'Supply Chain Management',
    aliases: ['supply chain', 'logistics', 'scm', 'operations management']
  },
  {
    canonical: 'Accounting',
    aliases: ['accounting', 'accounts', 'tax', 'taxation', 'cpa', 'acca', 'audit']
  },
  {
    canonical: 'Human Resource Management',
    aliases: ['hr', 'hrm', 'human resources', 'talent acquisition']
  },
  {
    canonical: 'Public Health',
    aliases: ['mph', 'public health', 'epidemiology', 'health administration', 'healthcare']
  },
  {
    canonical: 'Medicine',
    aliases: ['medicine', 'mbbs', 'md', 'pre-med', 'medical', 'surgery', 'clinical medicine']
  },
  {
    canonical: 'Nursing',
    aliases: ['nursing', 'nurse', 'bsn', 'msn', 'healthcare practice']
  },
  {
    canonical: 'Pharmacy',
    aliases: ['pharmacy', 'pharmd', 'pharmacology', 'pharmaceutics']
  },
  {
    canonical: 'Biotechnology',
    aliases: ['biotech', 'biotechnology', 'bioinformatics', 'molecular biology', 'genomics']
  },
  {
    canonical: 'Psychology',
    aliases: ['psychology', 'psych', 'cognitive science', 'behavioral science', 'mental health']
  },
  {
    canonical: 'Law',
    aliases: ['law', 'llm', 'legal', 'corporate law', 'juris doctor', 'jd']
  },
  {
    canonical: 'Economics',
    aliases: ['economics', 'econ', 'econometrics']
  },
  {
    canonical: 'Architecture',
    aliases: ['architecture', 'arch', 'urban design', 'interior design']
  },
  {
    canonical: 'Media & Journalism',
    aliases: ['journalism', 'media', 'mass communication', 'film production', 'broadcasting']
  },
  {
    canonical: 'Hospitality Management',
    aliases: ['hospitality', 'hotel management', 'tourism']
  }
];

// Degree level synonyms
const DEGREE_SYNONYMS = [
  { canonical: "Master's", aliases: ['ms', 'msc', 'masters', 'master', 'postgraduate', 'pg'] },
  { canonical: "Bachelor's", aliases: ['bs', 'bsc', 'bachelors', 'bachelor', 'undergraduate', 'ug'] },
  { canonical: "PhD", aliases: ['phd', 'doctorate', 'doctoral', 'dr'] }
];

/**
 * Expands a search query into an array of search tokens and equivalent course/degree terms.
 */
function expandCourseSearchTerms(searchTerm) {
  if (!searchTerm || typeof searchTerm !== 'string') return [];
  const rawTerm = searchTerm.trim().toLowerCase();
  if (!rawTerm) return [];

  const matchedTerms = new Set([rawTerm]);

  // Clean punctuation
  const cleanTerm = rawTerm.replace(/[^a-z0-9\s]/gi, ' ').trim();
  if (cleanTerm && cleanTerm !== rawTerm) {
    matchedTerms.add(cleanTerm);
  }

  // 1. Check Course Synonyms
  for (const item of COURSE_SYNONYMS) {
    const isDirectMatch = item.aliases.some(alias => {
      // Word boundary match for short acronyms like 'cs', 'ai', 'ds', 'mba'
      if (alias.length <= 4) {
        const regex = new RegExp(`(^|\\s)${alias}(\\s|$)`, 'i');
        return regex.test(rawTerm);
      }
      return rawTerm.includes(alias) || alias.includes(rawTerm);
    });

    if (isDirectMatch) {
      matchedTerms.add(item.canonical.toLowerCase());
      item.aliases.forEach(a => matchedTerms.add(a));
    }
  }

  // 2. Check Degree Synonyms
  for (const item of DEGREE_SYNONYMS) {
    const isDirectMatch = item.aliases.some(alias => {
      if (alias.length <= 3) {
        const regex = new RegExp(`(^|\\s)${alias}(\\s|$)`, 'i');
        return regex.test(rawTerm);
      }
      return rawTerm.includes(alias);
    });

    if (isDirectMatch) {
      matchedTerms.add(item.canonical.toLowerCase());
      item.aliases.forEach(a => matchedTerms.add(a));
    }
  }

  return Array.from(matchedTerms);
}

/**
 * Builds a MongoDB $or array covering name, city, courses, degrees, description, and tags.
 */
function buildUniversitySearchFilter(searchTerm, countryDocs = []) {
  if (!searchTerm || !searchTerm.trim()) return null;

  const searchTerms = expandCourseSearchTerms(searchTerm);
  const regexConditions = [];

  // For each expanded term, add regex conditions across all fields
  searchTerms.forEach(term => {
    // Avoid single-character broad matches
    if (term.length < 2) return;

    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    regexConditions.push(
      { name: regex },
      { city: regex },
      { courses: regex },
      { degreeLevels: regex },
      { categoryTags: regex },
      { description: regex }
    );
  });

  // Country matching if country docs provided
  if (countryDocs && countryDocs.length > 0) {
    const cleanLower = searchTerm.trim().toLowerCase();
    const matchedCountryIds = countryDocs
      .filter(c => c.name.toLowerCase().includes(cleanLower) || (c.code && c.code.toLowerCase() === cleanLower))
      .map(c => c._id);

    if (matchedCountryIds.length > 0) {
      regexConditions.push({ country: { $in: matchedCountryIds } });
    }
  }

  return regexConditions.length > 0 ? { $or: regexConditions } : null;
}

/**
 * Returns matching course titles from a university's courses array given a search query.
 */
function findMatchedCourses(coursesArray, searchTerm) {
  if (!Array.isArray(coursesArray) || coursesArray.length === 0 || !searchTerm) return [];
  const expanded = expandCourseSearchTerms(searchTerm);

  const matched = [];
  coursesArray.forEach(course => {
    const cLower = course.toLowerCase();
    const isMatch = expanded.some(term => {
      if (term.length <= 3) {
        const regex = new RegExp(`(^|\\s)${term}(\\s|$)`, 'i');
        return regex.test(cLower);
      }
      return cLower.includes(term);
    });
    if (isMatch && !matched.includes(course)) {
      matched.push(course);
    }
  });

  return matched;
}

module.exports = {
  COURSE_SYNONYMS,
  DEGREE_SYNONYMS,
  expandCourseSearchTerms,
  buildUniversitySearchFilter,
  findMatchedCourses
};
