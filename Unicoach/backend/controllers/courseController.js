const Course = require('../models/Course');
const escapeRegex = require('../utils/escapeRegex');
const University = require('../models/University');
const Country = require('../models/Country');
const { 
  syncSingleCourseFromUrl, 
  syncCoursesFromCatalog, 
  discoverCourseUrlsFromCatalog 
} = require('../services/courseCrawlerService');
const { clearShortlistCache, clearCache } = require('../utils/cache');

const FX_RATES_TO_INR = {
  EUR: 94.0,
  USD: 87.0,
  GBP: 112.5,
  AUD: 57.0,
  CAD: 63.5,
  NZD: 52.0,
  SGD: 66.0,
  CHF: 98.0,
  INR: 1.0
};

/**
 * Public: Get courses with high-performance filters, search, and pagination
 */
exports.getPublicCourses = async (req, res) => {
  try {
    const {
      search,
      universityId,
      countryId,
      countryName,
      degreeLevel,
      discipline,
      maxFee,
      minIelts,
      isStem,
      intake,
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = req.query;

    const query = { syncStatus: 'ACTIVE' };

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { courseName: { $regex: escaped, $options: 'i' } },
        { discipline: { $regex: escaped, $options: 'i' } },
        { universityName: { $regex: escaped, $options: 'i' } },
        { countryName: { $regex: escaped, $options: 'i' } }
      ];
    }

    if (universityId) query.university = universityId;
    if (countryId) query.country = countryId;
    if (countryName) query.countryName = { $regex: new RegExp(`^${escapeRegex(countryName)}$`, 'i') };
    if (degreeLevel) query.degreeLevel = degreeLevel;
    if (discipline) query.discipline = { $regex: escapeRegex(discipline), $options: 'i' };
    if (isStem === 'true' || isStem === true) query.isStem = true;
    if (intake) query.intakes = { $in: [new RegExp(escapeRegex(intake), 'i')] };

    if (maxFee && !isNaN(Number(maxFee))) {
      query['annualFee.inrAmount'] = { $lte: Number(maxFee) };
    }

    if (minIelts && !isNaN(Number(minIelts))) {
      query.minIeltsScore = { $lte: Number(minIelts) };
    }

    const sortOptions = {};
    if (sortBy === 'fee_asc') sortOptions['annualFee.inrAmount'] = 1;
    else if (sortBy === 'fee_desc') sortOptions['annualFee.inrAmount'] = -1;
    else if (sortBy === 'ielts_asc') sortOptions.minIeltsScore = 1;
    else if (sortBy === 'name_asc') sortOptions.courseName = 1;
    else sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('university', 'name logo website rank city type tuitionFeeUSD minIeltsScore')
        .populate('country', 'name code')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum,
      courses
    });
  } catch (error) {
    console.error('Error fetching public courses:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve courses' });
  }
};

/**
 * Public: Get single course by ID
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('university')
      .populate('country');

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving course' });
  }
};

/**
 * Public: Get all courses for a specific university
 */
exports.getUniversityCourses = async (req, res) => {
  try {
    const { universityId } = req.params;
    const courses = await Course.find({ university: universityId, syncStatus: 'ACTIVE' })
      .sort({ degreeLevel: 1, courseName: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error fetching university courses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch courses for this university' });
  }
};

/**
 * Admin: Discover courses from a university catalog URL (Preview before sync)
 */
exports.adminDiscoverCatalog = async (req, res) => {
  try {
    const { catalogUrl } = req.body;
    if (!catalogUrl) {
      return res.status(400).json({ success: false, error: 'catalogUrl is required' });
    }

    const discovered = await discoverCourseUrlsFromCatalog(catalogUrl);
    res.status(200).json({
      success: true,
      count: discovered.length,
      urls: discovered
    });
  } catch (error) {
    console.error('Error discovering catalog URLs:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Synchronize a single course from its official URL
 */
exports.adminSyncCourseUrl = async (req, res) => {
  try {
    const { courseUrl, universityId } = req.body;
    if (!courseUrl || !universityId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both courseUrl and universityId are required' 
      });
    }

    const course = await syncSingleCourseFromUrl(courseUrl, universityId);
    res.status(200).json({
      success: true,
      message: 'Course successfully extracted and synced into database',
      course
    });
  } catch (error) {
    console.error('Error syncing course from URL:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Batch crawl and sync multiple courses from a university catalog
 */
exports.adminBatchSyncCatalog = async (req, res) => {
  try {
    const { catalogUrl, universityId, limit = 10 } = req.body;
    if (!catalogUrl || !universityId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both catalogUrl and universityId are required' 
      });
    }

    const batchLimit = Math.min(25, Math.max(1, parseInt(limit, 10)));
    const results = await syncCoursesFromCatalog(catalogUrl, universityId, batchLimit);

    res.status(200).json({
      success: true,
      message: `Batch sync complete: ${results.successful.length} synced, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error during batch catalog sync:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Create a course manually with full KC-style attributes
 */
exports.adminCreateCourse = async (req, res) => {
  try {
    const {
      universityId,
      courseName,
      courseCode,
      degreeLevel = "Master's",
      discipline = 'General',
      duration,
      annualFee,
      applicationFee,
      intakes = [],
      minIeltsScore,
      ieltsRequirement,
      academicRequirement,
      applicationDeadline,
      isStem = false,
      hasInternship = false,
      sourceUrl
    } = req.body;

    if (!universityId || !courseName) {
      return res.status(400).json({ success: false, error: 'universityId and courseName are required' });
    }

    const university = await University.findById(universityId).populate('country');
    if (!university) {
      return res.status(404).json({ success: false, error: 'University not found' });
    }

    const feeAmount = Number(annualFee?.amount) || 0;
    const feeCurrency = (annualFee?.currency || 'EUR').toUpperCase();
    const rate = FX_RATES_TO_INR[feeCurrency] || 90.0;
    const inrAmount = Math.round(feeAmount * rate);

    const countryName = university.country?.name || 'Worldwide';

    const courseDoc = new Course({
      courseName: courseName.trim(),
      courseCode: courseCode?.trim() || undefined,
      university: university._id,
      universityName: university.name,
      country: university.country?._id || university.country,
      countryName: countryName,
      city: university.city || '',
      degreeLevel,
      discipline,
      duration,
      annualFee: {
        amount: feeAmount,
        currency: feeCurrency,
        inrAmount
      },
      applicationFee: {
        amount: Number(applicationFee?.amount) || 0,
        currency: (applicationFee?.currency || feeCurrency).toUpperCase(),
        isWaived: Boolean(applicationFee?.isWaived)
      },
      intakes: Array.isArray(intakes) ? intakes : [],
      minIeltsScore: Number(minIeltsScore) || undefined,
      ieltsRequirement: ieltsRequirement || (Number(minIeltsScore) ? `${minIeltsScore} overall` : undefined),
      academicRequirement,
      applicationDeadline,
      isStem: Boolean(isStem),
      hasInternship: Boolean(hasInternship),
      sourceUrl: sourceUrl?.trim() || `${university.website || 'https://university.edu'}/courses/${Date.now()}`,
      syncStatus: 'ACTIVE'
    });

    await courseDoc.save();

    // Sync course name into parent university courses array
    await University.findByIdAndUpdate(university._id, {
      $addToSet: { courses: courseDoc.courseName }
    });

    clearShortlistCache();
    clearCache('/api/courses'); // admin edits must show up immediately, not after the 5-min cache
    res.status(201).json({ success: true, course: courseDoc });
  } catch (error) {
    console.error('Error creating course manually:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Update course details manually
 */
exports.adminUpdateCourse = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Recompute INR fee if annualFee is provided
    if (updateData.annualFee) {
      const feeAmount = Number(updateData.annualFee.amount) || 0;
      const feeCurrency = (updateData.annualFee.currency || 'EUR').toUpperCase();
      const rate = FX_RATES_TO_INR[feeCurrency] || 90.0;
      updateData.annualFee = {
        amount: feeAmount,
        currency: feeCurrency,
        inrAmount: Math.round(feeAmount * rate)
      };
    }

    const previousCourse = await Course.findById(req.params.id);
    if (!previousCourse) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If courseName changed, update in parent university
    if (updateData.courseName && updateData.courseName !== previousCourse.courseName) {
      await University.findByIdAndUpdate(updated.university, {
        $pull: { courses: previousCourse.courseName }
      });
      await University.findByIdAndUpdate(updated.university, {
        $addToSet: { courses: updated.courseName }
      });
    }

    clearShortlistCache();
    clearCache('/api/courses'); // admin edits must show up immediately, not after the 5-min cache
    res.status(200).json({ success: true, course: updated });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Delete a course
 */
exports.adminDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Remove course name from parent university if exists
    if (course.university && course.courseName) {
      await University.findByIdAndUpdate(course.university, {
        $pull: { courses: course.courseName }
      });
    }

    clearShortlistCache();
    clearCache('/api/courses'); // admin edits must show up immediately, not after the 5-min cache
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Get active scheduler status & academic season details
 */
exports.getSchedulerStatus = async (req, res) => {
  try {
    const { getSchedulerStatus } = require('../services/courseUpdateSchedulerService');
    const status = getSchedulerStatus();
    res.status(200).json({ success: true, scheduler: status });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

/**
 * Admin: Manually trigger an immediate course update sweep
 */
exports.adminTriggerSchedulerSweep = async (req, res) => {
  try {
    const { runAutonomousCourseUpdateSweep } = require('../services/courseUpdateSchedulerService');
    const limit = req.body?.limit ? parseInt(req.body.limit, 10) : 50;

    // Trigger asynchronously so admin request doesn't timeout
    runAutonomousCourseUpdateSweep({ limit }).catch(err => {
      console.error('Background update sweep error:', err);
    });

    res.status(202).json({
      success: true,
      message: `Course update sweep initiated in background (limit: ${limit} courses). Check /api/courses/scheduler-status for live progress.`
    });
  } catch (error) {
    console.error('Error triggering scheduler sweep:', error);
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message });
  }
};

