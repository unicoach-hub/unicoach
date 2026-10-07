const mongoose = require('mongoose');
const escapeRegex = require('../utils/escapeRegex');
const Scholarship = require('../models/Scholarship');
const UserScholarship = require('../models/UserScholarship');
const { clearCache } = require('../utils/cache');

// Helper function to calculate eligibility match fit score
const computeMatchFit = (scholarship, studentProfile = {}) => {
  let score = 80;
  let reasons = [];
  let category = 'Target Match';

  const gpa = Number(studentProfile.gpa) || Number(studentProfile.percentage ? (studentProfile.percentage / 25) : 3.5);
  const ielts = Number(studentProfile.ielts) || 6.5;
  const degree = studentProfile.degree || 'Masters';
  const familyIncome = Number(studentProfile.familyIncome) || 1200000;

  const { eligibility, fundingType } = scholarship;

  // 1. Degree level match
  if (eligibility && eligibility.degreeLevels && eligibility.degreeLevels.length > 0) {
    if (eligibility.degreeLevels.includes(degree) || eligibility.degreeLevels.includes('All')) {
      score += 5;
      reasons.push(`Degree matches ${degree} criteria`);
    } else {
      score -= 20;
      reasons.push(`Degree ${degree} may not be primary target level`);
    }
  }

  // 2. IELTS / English Proficiency check
  const isIeltsWaiver = (Number(ielts) === 0 || ielts === '0' || ielts === 'Waiver' || ielts === 'Not Taken' || !ielts);
  const requiredIelts = typeof eligibility?.minIelts === 'object' ? eligibility?.minIelts?.value : eligibility?.minIelts;
  if (requiredIelts && Number(requiredIelts) > 0) {
    if (isIeltsWaiver) {
      score += 2;
      reasons.push('Evaluating with English proficiency waiver / MOI certificate');
    } else if (Number(ielts) >= Number(requiredIelts)) {
      score += 5;
      reasons.push(`IELTS ${ielts} meets cutoff of ${requiredIelts}`);
    } else {
      score -= 10;
      reasons.push(`IELTS ${ielts} is below standard ${requiredIelts} cutoff (pre-sessional may be required)`);
    }
  }

  // 3. Need-based Financial criteria
  if (eligibility && eligibility.financialCriteria && eligibility.financialCriteria.isNeedBased) {
    if (eligibility.financialCriteria.maxFamilyIncome) {
      if (familyIncome <= eligibility.financialCriteria.maxFamilyIncome) {
        score += 10;
        reasons.push('Family income aligns with financial aid bracket');
      } else {
        score -= 10;
        reasons.push('Income exceeds baseline financial aid threshold');
      }
    } else {
      score += 5;
    }
  }

  // 4. Competitiveness weighting
  if (fundingType === 'Full Ride' || scholarship.coverageLevel === 'Full') {
    if (score >= 90 && gpa >= 3.8) {
      category = 'High Match';
    } else {
      category = 'Reach / Competitive';
    }
  } else if (score >= 85) {
    category = 'High Match';
  } else if (score >= 70) {
    category = 'Target Match';
  } else {
    category = 'Reach / Competitive';
  }

  const finalScore = Math.min(99, Math.max(45, Math.round(score)));

  return {
    matchScore: finalScore,
    matchCategory: category,
    reasons
  };
};

/**
 * GET /api/scholarships
 * Public explorer with multi-facet filters
 */
exports.getAllScholarships = async (req, res) => {
  try {
    const {
      country,
      degree,
      fundingType,
      intakeSeason,
      search,
      isNeedBased,
      sort,
      page = 1,
      limit = 100
    } = req.query;

    const query = { isActive: true };

    if (country && country !== 'All' && country !== 'all') {
      query.country = new RegExp(`^${escapeRegex(country)}$`, 'i');
    }

    if (degree && degree !== 'All' && degree !== 'all') {
      query['eligibility.degreeLevels'] = { $in: [new RegExp(escapeRegex(degree), 'i')] };
    }

    if (fundingType && fundingType !== 'All' && fundingType !== 'all') {
      query.fundingType = new RegExp(`^${escapeRegex(fundingType)}$`, 'i');
    }

    if (intakeSeason && intakeSeason !== 'All' && intakeSeason !== 'all') {
      query['deadline.intakeSeason'] = new RegExp(`^${escapeRegex(intakeSeason)}$`, 'i');
    }

    if (isNeedBased === 'true') {
      query['eligibility.financialCriteria.isNeedBased'] = true;
    }

    if (typeof search === 'string' && search.trim()) {
      const s = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { universityName: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { awardCoverage: { $regex: s, $options: 'i' } },
        { 'eligibility.coursesApplicable': { $regex: s, $options: 'i' } }
      ];
    }

    let sortOptions = { 'deadline.date': 1 };
    if (sort === 'amount_desc') {
      sortOptions = { 'amount.value': -1 };
    } else if (sort === 'deadline_asc') {
      sortOptions = { 'deadline.date': 1 };
    } else if (sort === 'views_desc') {
      sortOptions = { viewsCount: -1 };
    }

    const total = await Scholarship.countDocuments(query);
    const scholarships = await Scholarship.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true,
      total,
      count: scholarships.length,
      page: Number(page),
      scholarships
    });
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    return res.status(500).json({ error: 'Failed to retrieve scholarships list' });
  }
};

/**
 * GET /api/scholarships/stats
 * Summary counts for filters & hero badges
 */
exports.getScholarshipStats = async (req, res) => {
  try {
    const total = await Scholarship.countDocuments({ isActive: true });
    const fullRides = await Scholarship.countDocuments({ isActive: true, fundingType: 'Full Ride' });
    const tuitionWaivers = await Scholarship.countDocuments({ isActive: true, fundingType: 'Tuition Waiver' });
    const livingStipends = await Scholarship.countDocuments({ isActive: true, fundingType: 'Living Stipend' });

    const countryBreakdown = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      stats: {
        totalScholarships: total,
        fullRideCount: fullRides,
        tuitionWaiverCount: tuitionWaivers,
        livingStipendCount: livingStipends,
        countries: countryBreakdown.map(c => ({ country: c._id, count: c.count }))
      }
    });
  } catch (err) {
    console.error('Error fetching scholarship stats:', err);
    return res.status(500).json({ error: 'Failed to retrieve scholarship statistics' });
  }
};

/**
 * POST /api/scholarships/calculate-match
 * Compute real-time eligibility
 */
exports.calculateMatch = async (req, res) => {
  try {
    const { scholarshipId, studentProfile } = req.body;
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    const matchData = computeMatchFit(scholarship, studentProfile || {});
    return res.json({ success: true, ...matchData });
  } catch (err) {
    console.error('Error calculating match fit:', err);
    return res.status(500).json({ error: 'Failed to calculate match fit' });
  }
};

/**
 * GET /api/scholarships/my/shortlist
 * Get all user's shortlisted scholarships
 */
exports.getMyShortlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const saved = await UserScholarship.find({ user: userId })
      .populate('scholarship')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: saved.length,
      shortlisted: saved.filter(s => s.scholarship !== null)
    });
  } catch (err) {
    console.error('Error fetching user shortlisted scholarships:', err);
    return res.status(500).json({ error: 'Failed to fetch shortlisted scholarships' });
  }
};

/**
 * POST /api/scholarships/toggle
 * Toggle save state for student shortlist
 */
exports.toggleShortlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scholarshipId, studentProfile, scholarshipData } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({ error: 'scholarshipId is required' });
    }

    let scholarship = null;
    if (mongoose.Types.ObjectId.isValid(scholarshipId)) {
      scholarship = await Scholarship.findById(scholarshipId);
    }
    if (!scholarship) {
      scholarship = await Scholarship.findOne({
        $or: [
          { customId: scholarshipId },
          { slug: String(scholarshipId).toLowerCase().replace(/_/g, '-') },
          { title: scholarshipId }
        ]
      });
    }

    // Graceful auto-creation if saving a scholarship from verified JSON dataset
    if (!scholarship && scholarshipData && scholarshipData.title) {
      scholarship = await Scholarship.findOne({ title: scholarshipData.title });
      if (!scholarship) {
        scholarship = new Scholarship({
          customId: String(scholarshipId),
          title: scholarshipData.title,
          slug: String(scholarshipId).toLowerCase().replace(/_/g, '-'),
          universityName: scholarshipData.universityName || 'University',
          country: scholarshipData.country || 'International',
          fundingType: scholarshipData.fundingType || 'Merit Scholarship',
          awardCoverage: scholarshipData.awardCoverage || '',
          amount: scholarshipData.amount || { value: 0, currency: 'USD' },
          // Created from a student's request body: keep it out of the public catalog until an admin reviews it
          isActive: false
        });
        await scholarship.save();
      }
    }

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    const existing = await UserScholarship.findOne({ user: userId, scholarship: scholarship._id });

    if (existing) {
      await UserScholarship.deleteOne({ _id: existing._id });
      await Scholarship.findByIdAndUpdate(scholarship._id, { $inc: { shortlistCount: -1 } });
      return res.json({
        success: true,
        saved: false,
        message: `Removed ${scholarship.title} from your shortlist`,
        removedId: existing._id
      });
    } else {
      const matchData = computeMatchFit(scholarship, studentProfile || {});
      const newSaved = new UserScholarship({
        user: userId,
        scholarship: scholarship._id,
        customId: scholarship.customId || scholarship._id.toString(),
        applicationStage: 'Shortlisted',
        matchScore: matchData.matchScore,
        matchCategory: matchData.matchCategory
      });

      await newSaved.save();
      await Scholarship.findByIdAndUpdate(scholarship._id, { $inc: { shortlistCount: 1 } });

      return res.json({
        success: true,
        saved: true,
        message: `Saved ${scholarship.title} to your deadline tracker!`,
        userScholarship: newSaved
      });
    }
  } catch (err) {
    console.error('Error toggling scholarship shortlist:', err);
    return res.status(500).json({ error: 'Failed to toggle scholarship shortlist' });
  }
};

/**
 * PUT /api/scholarships/stage/:id
 * Update pipeline stage & notes
 */
exports.updateStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { applicationStage, studentNotes, deadlineAlertsEnabled } = req.body;

    const updateFields = {};
    if (applicationStage) updateFields.applicationStage = applicationStage;
    if (studentNotes !== undefined) updateFields.studentNotes = studentNotes;
    if (deadlineAlertsEnabled !== undefined) updateFields.deadlineAlertsEnabled = deadlineAlertsEnabled;
    if (applicationStage === 'Applied') updateFields.appliedAt = new Date();

    const updated = await UserScholarship.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateFields },
      { new: true }
    ).populate('scholarship');

    if (!updated) {
      return res.status(404).json({ error: 'Shortlist entry not found' });
    }

    return res.json({
      success: true,
      message: 'Updated scholarship tracking status',
      userScholarship: updated
    });
  } catch (err) {
    console.error('Error updating scholarship stage:', err);
    return res.status(500).json({ error: 'Failed to update stage' });
  }
};

/**
 * DELETE /api/scholarships/my/shortlist/:id
 * Remove from shortlist
 */
exports.deleteFromShortlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await UserScholarship.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Shortlist entry not found' });
    }

    await Scholarship.findByIdAndUpdate(deleted.scholarship, { $inc: { shortlistCount: -1 } });

    return res.json({ success: true, message: 'Removed from shortlist' });
  } catch (err) {
    console.error('Error deleting from shortlist:', err);
    return res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
};

/**
 * GET /api/scholarships/:id
 * Single scholarship detail view
 */
exports.getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    let scholarship = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      scholarship = await Scholarship.findById(id);
    }
    if (!scholarship) {
      scholarship = await Scholarship.findOne({
        $or: [
          { customId: id },
          { slug: String(id).toLowerCase().replace(/_/g, '-') },
          { title: id }
        ]
      });
    }
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    Scholarship.findByIdAndUpdate(scholarship._id, { $inc: { viewsCount: 1 } }).exec().catch(() => {}); // view counter is best-effort; never crash the process

    return res.json({ success: true, scholarship });
  } catch (err) {
    console.error('Error fetching scholarship details:', err);
    return res.status(500).json({ error: 'Failed to retrieve scholarship details' });
  }
};

/**
 * POST /api/scholarships
 * Admin create scholarship
 */
exports.createScholarship = async (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.country) {
      return res.status(400).json({ error: 'Scholarship title and country are required.' });
    }

    const scholarship = new Scholarship(data);
    await scholarship.save();
    await clearCache();

    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully!',
      scholarship
    });
  } catch (err) {
    console.error('Error creating scholarship:', err);
    return res.status(500).json({ error: 'Failed to create scholarship: ' + err.message });
  }
};

/**
 * PUT /api/scholarships/:id
 * Admin update scholarship
 */
exports.updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await Scholarship.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    await clearCache();

    return res.json({
      success: true,
      message: 'Scholarship updated successfully!',
      scholarship: updated
    });
  } catch (err) {
    console.error('Error updating scholarship:', err);
    return res.status(500).json({ error: 'Failed to update scholarship: ' + err.message });
  }
};

/**
 * DELETE /api/scholarships/:id
 * Admin delete scholarship
 */
exports.deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Scholarship.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    await UserScholarship.deleteMany({ scholarship: id });
    await clearCache();

    return res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting scholarship:', err);
    return res.status(500).json({ error: 'Failed to delete scholarship' });
  }
};

/**
 * PATCH /api/scholarships/:id/toggle-featured
 * Toggle featured badge
 */
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    scholarship.featured = !scholarship.featured;
    await scholarship.save();
    await clearCache();

    return res.json({
      success: true,
      featured: scholarship.featured,
      message: `Scholarship is now ${scholarship.featured ? 'Featured' : 'Unfeatured'}`
    });
  } catch (err) {
    console.error('Error toggling featured scholarship:', err);
    return res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};
