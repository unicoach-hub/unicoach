const mongoose = require('mongoose');
const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachService = require('../models/UnicoachService');
const UnicoachReview = require('../models/UnicoachReview');

/**
 * Directory ranking stats stored on each mentor so the public directory can sort and
 * filter thousands of mentors in the database instead of in memory.
 *
 * rankScore is a Bayesian average: every mentor starts with PRIOR_WEIGHT "virtual" reviews of
 * PRIOR_RATING, so a single 5-star review cannot outrank 200 reviews averaging 4.8, and a
 * brand-new mentor sits in the middle of the list instead of at the very top.
 */
const PRIOR_RATING = 4.0;
const PRIOR_WEIGHT = 5;

const computeRankScore = (ratingSum, reviewCount) =>
  Number(((PRIOR_RATING * PRIOR_WEIGHT + ratingSum) / (PRIOR_WEIGHT + reviewCount)).toFixed(4));

/** Recompute and save one mentor's directory stats. Never throws: callers are request handlers. */
const refreshMentorStats = async (mentorId) => {
  try {
    const [reviewAgg] = await UnicoachReview.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(String(mentorId)) } },
      { $group: { _id: null, sum: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);
    const services = await UnicoachService.find({ mentorId, active: true }).select('type priceInINR').lean();

    const reviewCount = reviewAgg?.count || 0;
    const ratingSum = reviewAgg?.sum || 0;

    await UnicoachMentor.updateOne({ _id: mentorId }, {
      $set: {
        ratingAvg: reviewCount > 0 ? Number((ratingSum / reviewCount).toFixed(2)) : 0,
        reviewCount,
        rankScore: computeRankScore(ratingSum, reviewCount),
        startingPriceINR: services.length > 0 ? Math.min(...services.map((s) => s.priceInINR || 0)) : null,
        serviceTypes: [...new Set(services.map((s) => s.type))]
      }
    });
  } catch (err) {
    console.error(`Failed to refresh directory stats for mentor ${mentorId}:`, err.message);
  }
};

/** Fill in stats for mentors created before these fields existed (no-op once they are all set). */
const backfillMentorStats = async () => {
  const missing = await UnicoachMentor.find({ rankScore: { $exists: false } }).select('_id').lean();
  for (const m of missing) await refreshMentorStats(m._id);
  if (missing.length > 0) console.log(`📊 Directory stats backfilled for ${missing.length} mentor(s).`);
};

module.exports = { refreshMentorStats, backfillMentorStats, computeRankScore };
