/**
 * Frontend Multi-Attribute University Search Matcher
 * Supports smart acronym expansion, course matching, degree matching, and course highlights.
 */

// Course Synonyms & Aliases
const COURSE_SYNONYMS = [
  { canonical: 'Computer Science', aliases: ['cs', 'cse', 'computer science', 'computer engineering', 'computing', 'software systems', 'software'] },
  { canonical: 'Software Engineering', aliases: ['swe', 'se', 'software engineering', 'software development', 'devops'] },
  { canonical: 'Data Science', aliases: ['ds', 'data science', 'data analytics', 'big data', 'data engineering', 'analytics'] },
  { canonical: 'Artificial Intelligence', aliases: ['ai', 'ml', 'artificial intelligence', 'machine learning', 'deep learning', 'nlp', 'generative ai'] },
  { canonical: 'Cybersecurity', aliases: ['security', 'infosec', 'cyber', 'cybersecurity', 'network security'] },
  { canonical: 'Information Technology', aliases: ['it', 'mis', 'information technology', 'information systems'] },
  { canonical: 'Cloud Computing', aliases: ['cloud', 'cloud computing', 'aws', 'azure'] },
  { canonical: 'UI/UX Design', aliases: ['ui', 'ux', 'ui/ux', 'design', 'hci', 'interaction design', 'human computer interaction', 'product design'] },
  { canonical: 'Robotics', aliases: ['robotics', 'mechatronics', 'automation'] },
  { canonical: 'Mechanical Engineering', aliases: ['mech', 'mechanical', 'mechanical engineering'] },
  { canonical: 'Electrical Engineering', aliases: ['eee', 'ece', 'electrical', 'electronics', 'electrical engineering'] },
  { canonical: 'Civil Engineering', aliases: ['civil', 'civil engineering', 'structural engineering'] },
  { canonical: 'Aerospace Engineering', aliases: ['aero', 'aerospace', 'aeronautical', 'aerospace engineering'] },
  { canonical: 'Biomedical Engineering', aliases: ['bme', 'biomed', 'biomedical', 'biomedical engineering', 'bioengineering'] },
  { canonical: 'Chemical Engineering', aliases: ['chem', 'chemical', 'chemical engineering'] },
  { canonical: 'Industrial Engineering', aliases: ['industrial', 'industrial engineering', 'operations'] },
  { canonical: 'Environmental Engineering', aliases: ['environmental', 'clean energy', 'renewable energy'] },
  { canonical: 'Business Administration', aliases: ['mba', 'bba', 'business', 'management', 'business administration'] },
  { canonical: 'Business Analytics', aliases: ['ba', 'business analytics', 'business intelligence', 'bi'] },
  { canonical: 'Finance', aliases: ['finance', 'fintech', 'banking', 'investment banking'] },
  { canonical: 'Marketing', aliases: ['marketing', 'digital marketing', 'advertising'] },
  { canonical: 'International Business', aliases: ['ib', 'international business', 'global trade'] },
  { canonical: 'Supply Chain Management', aliases: ['supply chain', 'logistics', 'scm'] },
  { canonical: 'Accounting', aliases: ['accounting', 'accounts', 'tax', 'cpa', 'acca'] },
  { canonical: 'Human Resource Management', aliases: ['hr', 'hrm', 'human resources'] },
  { canonical: 'Public Health', aliases: ['mph', 'public health', 'healthcare'] },
  { canonical: 'Medicine', aliases: ['medicine', 'mbbs', 'md', 'pre-med', 'medical', 'surgery'] },
  { canonical: 'Nursing', aliases: ['nursing', 'nurse', 'healthcare practice'] },
  { canonical: 'Pharmacy', aliases: ['pharmacy', 'pharmd', 'pharmacology'] },
  { canonical: 'Biotechnology', aliases: ['biotech', 'biotechnology', 'bioinformatics', 'molecular biology'] },
  { canonical: 'Psychology', aliases: ['psychology', 'psych', 'cognitive science', 'behavioral science'] },
  { canonical: 'Law', aliases: ['law', 'llm', 'legal', 'corporate law'] },
  { canonical: 'Economics', aliases: ['economics', 'econ', 'econometrics'] },
  { canonical: 'Architecture', aliases: ['architecture', 'arch', 'urban design'] },
  { canonical: 'Media & Journalism', aliases: ['journalism', 'media', 'mass comm', 'film'] },
  { canonical: 'Hospitality Management', aliases: ['hospitality', 'hotel management', 'tourism'] }
];

const DEGREE_SYNONYMS = [
  { canonical: "Master's", aliases: ['ms', 'msc', 'masters', 'master', 'postgraduate', 'pg'] },
  { canonical: "Bachelor's", aliases: ['bs', 'bsc', 'bachelors', 'bachelor', 'undergraduate', 'ug'] },
  { canonical: "PhD", aliases: ['phd', 'doctorate', 'doctoral'] }
];

const UNIVERSITY_ACRONYMS = {
  // Ireland
  'tcd': 'Trinity College Dublin',
  'ucd': 'University College Dublin',
  'ucc': 'University College Cork',
  'ug': 'University of Galway',
  'nuig': 'University of Galway',
  'dcu': 'Dublin City University',
  'ul': 'University of Limerick',
  'mu': 'Maynooth University',
  'tu dublin': 'Technological University Dublin',
  'tud': 'Technological University Dublin',
  'mtu': 'Munster Technological University',
  'atu': 'Atlantic Technological University',
  'setu': 'South East Technological University',
  'tus': 'Technological University of the Shannon',
  'dkit': 'Dundalk Institute of Technology',
  // Canada / US popular
  'uoft': 'University of Toronto',
  'ubc': 'University of British Columbia',
  'mcgill': 'McGill University',
  'waterloo': 'University of Waterloo',
  'uwaterloo': 'University of Waterloo',
  'mit': 'Massachusetts Institute of Technology',
  'nyu': 'New York University',
  'cmu': 'Carnegie Mellon University',
  'ucla': 'University of California Los Angeles',
  'ucb': 'University of California Berkeley'
};

export function expandSearchTerms(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return [];
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const terms = new Set([q]);

  // Clean punctuation
  const cleanQ = q.replace(/[^a-z0-9\s]/gi, ' ').trim();
  if (cleanQ) terms.add(cleanQ);

  // Check university acronyms
  if (UNIVERSITY_ACRONYMS[cleanQ] || UNIVERSITY_ACRONYMS[q]) {
    const fullUni = UNIVERSITY_ACRONYMS[cleanQ] || UNIVERSITY_ACRONYMS[q];
    terms.add(fullUni.toLowerCase());
  }

  // Check course synonyms
  for (const item of COURSE_SYNONYMS) {
    const isDirectMatch = item.aliases.some(alias => {
      if (alias.length <= 4) {
        const regex = new RegExp(`(^|\\s)${alias}(\\s|$)`, 'i');
        return regex.test(q);
      }
      return q.includes(alias) || alias.includes(q);
    });

    if (isDirectMatch) {
      terms.add(item.canonical.toLowerCase());
      item.aliases.forEach(a => terms.add(a));
    }
  }

  // Check degree synonyms
  for (const item of DEGREE_SYNONYMS) {
    const isDirectMatch = item.aliases.some(alias => {
      if (alias.length <= 3) {
        const regex = new RegExp(`(^|\\s)${alias}(\\s|$)`, 'i');
        return regex.test(q);
      }
      return q.includes(alias);
    });

    if (isDirectMatch) {
      terms.add(item.canonical.toLowerCase());
      item.aliases.forEach(a => terms.add(a));
    }
  }

  return Array.from(terms);
}

/**
 * Checks whether a university matches the given search query.
 */
function getUniversityCourseList(uni) {
  if (!uni) return [];
  const list = [];
  if (Array.isArray(uni.courses)) list.push(...uni.courses);
  if (Array.isArray(uni.topCourses)) list.push(...uni.topCourses);
  if (Array.isArray(uni.popularCourses)) list.push(...uni.popularCourses);
  if (Array.isArray(uni.specializations)) list.push(...uni.specializations);
  if (typeof uni.specializations === 'string') {
    list.push(...uni.specializations.split(/[,/]/).map(s => s.trim()).filter(Boolean));
  }
  if (typeof uni.popular === 'string') {
    list.push(...uni.popular.split(/[,/]/).map(s => s.trim()).filter(Boolean));
  }
  return Array.from(new Set(list));
}

function getUniversityDegreeList(uni) {
  if (!uni) return [];
  const list = [];
  if (Array.isArray(uni.degreeLevels)) list.push(...uni.degreeLevels);
  if (Array.isArray(uni.degrees)) list.push(...uni.degrees);
  return Array.from(new Set(list));
}

export function matchesUniversitySearch(uni, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return true;
  if (!uni) return false;

  const terms = expandSearchTerms(rawQuery);
  const uniName = (uni.name || '').toLowerCase();
  const uniShortName = (uni.shortName || '').toLowerCase();
  const uniCity = (uni.city || '').toLowerCase();
  const uniState = (uni.state || '').toLowerCase();
  const uniLocation = (uni.location || '').toLowerCase();
  const uniCountry = (uni.countryName || uni.country?.name || (typeof uni.country === 'string' ? uni.country : '')).toLowerCase();
  const uniDesc = (uni.description || '').toLowerCase();
  const courses = getUniversityCourseList(uni);
  const degreeLevels = getUniversityDegreeList(uni);
  const tags = Array.isArray(uni.categoryTags) ? uni.categoryTags : (Array.isArray(uni.tags) ? uni.tags : []);

  for (const term of terms) {
    if (term.length < 2) continue;

    // Direct name match
    if (uniName.includes(term)) return true;

    // Short name match (e.g., UCD, DCU, TCD, etc.)
    if (uniShortName && (uniShortName === term || uniShortName.includes(term) || term.includes(uniShortName))) return true;

    // City / State / Location match
    if (uniCity && uniCity.includes(term)) return true;
    if (uniState && uniState.includes(term)) return true;
    if (uniLocation && uniLocation.includes(term)) return true;

    // Country match
    if (uniCountry && uniCountry.includes(term)) return true;

    // Courses match
    const hasCourseMatch = courses.some(c => {
      const cLower = c.toLowerCase();
      if (term.length <= 4) {
        const regex = new RegExp(`(^|\\s)${term}(\\s|$)`, 'i');
        return regex.test(cLower);
      }
      return cLower.includes(term);
    });
    if (hasCourseMatch) return true;

    // Degree levels match
    const hasDegreeMatch = degreeLevels.some(d => d.toLowerCase().includes(term));
    if (hasDegreeMatch) return true;

    // Category tags
    const hasTagMatch = tags.some(t => t.toLowerCase().includes(term));
    if (hasTagMatch) return true;

    // Description match
    if (uniDesc && uniDesc.includes(term)) return true;
  }

  return false;
}

/**
 * Finds all courses in the university that specifically match the search query.
 */
export function getMatchedCoursesForUniversity(uni, rawQuery) {
  if (!rawQuery || !rawQuery.trim() || !uni) return [];
  const terms = expandSearchTerms(rawQuery);
  const courses = getUniversityCourseList(uni);

  const matched = [];
  courses.forEach(course => {
    const cLower = course.toLowerCase();
    const isMatch = terms.some(term => {
      if (term.length < 2) return false;
      if (term.length <= 4) {
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
