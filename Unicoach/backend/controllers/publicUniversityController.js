const Country = require('../models/Country');
const escapeRegex = require('../utils/escapeRegex');
const University = require('../models/University');
const { buildUniversitySearchFilter, findMatchedCourses } = require('../utils/courseSearchHelper');

/**
 * GET /api/public/universities-data/countries
 * GET all countries
 */
exports.getPublicCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    return res.json(countries);
  } catch (err) {
    console.error('Error fetching public countries:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/public/universities-data/countries/:code
 * GET single country by country code (e.g., 'usa', 'uk')
 */
exports.getPublicCountryByCode = async (req, res) => {
  try {
    const country = await Country.findOne({ code: req.params.code.toLowerCase() });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    return res.json(country);
  } catch (err) {
    console.error('Error fetching public country by code:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/public/universities-data/universities
 * GET public universities with multi-attribute course, name, city & degree filters
 */
exports.getPublicUniversities = async (req, res) => {
  try {
    const { countryCode, countryId, city, category, course, search } = req.query;
    const queryConditions = [{ isActive: { $ne: false } }];

    if (countryId) {
      queryConditions.push({ country: countryId });
    } else if (countryCode) {
      const country = await Country.findOne({ code: countryCode.toLowerCase() });
      if (!country) {
        return res.json([]);
      }
      queryConditions.push({ country: country._id });
    }

    if (city) {
      queryConditions.push({ city: { $regex: new RegExp('^' + escapeRegex(city) + '$', 'i') } });
    }

    if (category) {
      queryConditions.push({ categoryTags: category.toLowerCase() });
    }

    if (course) {
      queryConditions.push({ courses: { $regex: escapeRegex(course), $options: 'i' } });
    }

    if (search && search.trim()) {
      const allCountries = await Country.find({}).select('name code').lean();
      const searchFilter = buildUniversitySearchFilter(search, allCountries);
      if (searchFilter) {
        queryConditions.push(searchFilter);
      }
    }

    const finalQuery = queryConditions.length > 1
      ? { $and: queryConditions }
      : (queryConditions.length === 1 ? queryConditions[0] : {});

    const universities = await University.find(finalQuery)
      .populate('country', 'name code')
      .lean();
    // Ranked first (by rank), then unranked alphabetically. Mongo would sort null ranks first.
    const rankOf = (u) => (u.rankingNum > 0 ? u.rankingNum : Infinity);
    universities.sort((a, b) => rankOf(a) - rankOf(b) || String(a.name).localeCompare(String(b.name)));

    // Attach matched courses if search is active
    const cleanSearch = search ? search.trim() : '';
    const formatted = universities.map(uni => {
      const matched = cleanSearch ? findMatchedCourses(uni.courses || [], cleanSearch) : [];
      return {
        ...uni,
        matchedCourses: matched
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching public universities:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/public/universities-data/universities/:id
 * One university with its country and the detailed courses we hold for it.
 */
exports.getPublicUniversityById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[a-f0-9]{24}$/i.test(String(id))) {
      return res.status(400).json({ error: 'Invalid university id' });
    }
    const uni = await University.findById(id).populate('country', 'name code').lean();
    if (!uni || uni.isActive === false) return res.status(404).json({ error: 'University not found' });

    let detailedCourses = [];
    try {
      const Course = require('../models/Course');
      detailedCourses = await Course.find({ university: uni._id }).lean();
    } catch (_) {
      detailedCourses = [];
    }

    return res.json({
      ...uni,
      countryName: uni.country && uni.country.name,
      detailedCourses,
    });
  } catch (err) {
    console.error('Error fetching public university:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
