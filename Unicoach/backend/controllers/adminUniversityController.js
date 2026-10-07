const Country = require('../models/Country');
const University = require('../models/University');
const { clearCache } = require('../utils/cache');
let clearShortlistCache = () => {};
try {
  clearShortlistCache = require('./shortlistController').clearShortlistCache;
} catch (e) {}

// Country Controllers
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    return res.json(countries);
  } catch (err) {
    console.error('Error fetching countries:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });
    return res.json(country);
  } catch (err) {
    console.error('Error fetching country:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createCountry = async (req, res) => {
  try {
    const { name, code, cities, visaLinks, courseLinks } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Country name is required' });
    }
    const newCountry = new Country({ name, code, cities, visaLinks, courseLinks });
    await newCountry.save();
    await clearCache();
    return res.status(201).json(newCountry);
  } catch (err) {
    console.error('Error creating country:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Country name or code already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCountry = async (req, res) => {
  try {
    const { name, code, cities, visaLinks, courseLinks } = req.body;
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });

    if (name) country.name = name;
    if (code) country.code = code;
    if (cities) country.cities = cities;
    if (visaLinks) country.visaLinks = visaLinks;
    if (courseLinks) country.courseLinks = courseLinks;

    await country.save();
    await clearCache();
    return res.json(country);
  } catch (err) {
    console.error('Error updating country:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Country name or code already exists' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Country not found' });

    const assocCount = await University.countDocuments({ country: req.params.id });
    if (assocCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete country. It has ${assocCount} associated universities. Delete them first.` 
      });
    }

    await Country.findByIdAndDelete(req.params.id);
    await clearCache();
    return res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    console.error('Error deleting country:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// University Controllers
exports.getAllUniversities = async (req, res) => {
  try {
    const { country, city, type, search } = req.query;
    const query = {};

    if (country) query.country = country;
    if (city) query.city = city;
    if (type) query.type = type;
    if (search && search.trim()) {
      const clean = search.trim();
      query.$or = [
        { name: { $regex: clean, $options: 'i' } },
        { city: { $regex: clean, $options: 'i' } },
        { courses: { $regex: clean, $options: 'i' } }
      ];
    }

    const universities = await University.find(query)
      .populate('country', 'name code')
      .sort({ name: 1 });
      
    return res.json(universities);
  } catch (err) {
    console.error('Error fetching universities:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getUniversityById = async (req, res) => {
  try {
    const university = await University.findById(req.params.id).populate('country', 'name code');
    if (!university) return res.status(404).json({ message: 'University not found' });
    return res.json(university);
  } catch (err) {
    console.error('Error fetching university:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    const { 
      name, country, city, logo, website, rank, 
      tuition, type, description, eligibility, categoryTags,
      minScore, ieltsScore, greExam, workExp, acceptanceRate,
      courses, degreeLevels
    } = req.body;

    if (!name || !country) {
      return res.status(400).json({ message: 'University name and country are required' });
    }

    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return res.status(400).json({ message: 'Selected country does not exist' });
    }

    const newUniversity = new University({
      name,
      country,
      city,
      logo,
      website,
      rank,
      tuition,
      type,
      description,
      eligibility,
      courses: Array.isArray(courses) ? courses : (typeof courses === 'string' ? courses.split(',').map(s => s.trim()).filter(Boolean) : []),
      degreeLevels: Array.isArray(degreeLevels) ? degreeLevels : ["Bachelor's", "Master's"],
      categoryTags: categoryTags || [],
      minScore: minScore || 'GPA 3.0+',
      ieltsScore: ieltsScore || 'IELTS 6.0+',
      greExam: greExam || 'GRE Waived',
      workExp: workExp || 'Freshers Eligible',
      acceptanceRate: acceptanceRate || '66%'
    });

    await newUniversity.save();
    await newUniversity.populate('country', 'name code');
    await clearCache();
    if (clearShortlistCache) clearShortlistCache();
    return res.status(201).json(newUniversity);
  } catch (err) {
    console.error('Error creating university:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A university with this name already exists in this city/country' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (updates.courses && typeof updates.courses === 'string') {
      updates.courses = updates.courses.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (updates.country) {
      const countryExists = await Country.findById(updates.country);
      if (!countryExists) {
        return res.status(400).json({ message: 'Selected country does not exist' });
      }
    }

    const university = await University.findByIdAndUpdate(
      req.params.id, 
      { $set: updates }, 
      { new: true, runValidators: true }
    ).populate('country', 'name code');

    if (!university) return res.status(404).json({ message: 'University not found' });
    await clearCache();
    if (clearShortlistCache) clearShortlistCache();
    return res.json(university);
  } catch (err) {
    console.error('Error updating university:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A university with this name already exists in this city/country' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) return res.status(404).json({ message: 'University not found' });
    await clearCache();
    if (clearShortlistCache) clearShortlistCache();
    return res.json({ message: 'University deleted successfully' });
  } catch (err) {
    console.error('Error deleting university:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.seedDataset = async (req, res) => {
  try {
    const DEFAULT_COUNTRIES = [
      { name: 'USA', code: 'usa', cities: ['Boston', 'New York', 'Cambridge', 'Stanford', 'Chicago', 'Los Angeles'] },
      { name: 'UK', code: 'uk', cities: ['London', 'Cambridge', 'Oxford', 'Edinburgh', 'Manchester'] },
      { name: 'Australia', code: 'australia', cities: ['Melbourne', 'Sydney', 'Brisbane', 'Canberra'] },
      { name: 'Canada', code: 'canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'] },
      { name: 'Germany', code: 'germany', cities: ['Munich', 'Berlin', 'Heidelberg', 'Aachen'] },
      { name: 'Ireland', code: 'ireland', cities: ['Dublin', 'Cork', 'Galway'] },
      { name: 'Italy', code: 'italy', cities: ['Milan', 'Rome', 'Bologna'] },
      { name: 'France', code: 'france', cities: ['Paris', 'Lyon', 'Lille'] },
      { name: 'New Zealand', code: 'new-zealand', cities: ['Auckland', 'Wellington', 'Christchurch'] }
    ];

    for (const c of DEFAULT_COUNTRIES) {
      await Country.findOneAndUpdate(
        { code: c.code },
        { name: c.name, code: c.code, cities: c.cities },
        { upsert: true, new: true }
      );
    }

    const countries = await Country.find();
    await clearCache();
    return res.json({
      success: true,
      message: `Database synchronized with ${countries.length} target countries & normalized university datasets!`,
      countries
    });
  } catch (err) {
    console.error('Error seeding universities:', err);
    return res.status(500).json({ error: 'Failed to seed university dataset' });
  }
};
