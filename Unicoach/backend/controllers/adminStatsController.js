const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Blog = require('../models/Blog');
const News = require('../models/News');
const Event = require('../models/Event');
const Lead = require('../models/Lead');
const University = require('../models/University');
const Scholarship = require('../models/Scholarship');
const { buildLeadTrends } = require('../utils/leadTrend');

/**
 * GET /api/admin/stats
 * Aggregate dashboard statistics and analytics
 */
exports.getAdminStats = async (req, res) => {
  try {
    // NOTE: this endpoint is strictly read-only (no demo seeding / auto-assignment).

    // 1. Fetch count stats
    const [users, studentUsers, blogs, news, events, leads, verifiedLeads, universities, scholarships] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Blog.countDocuments(),
      News.countDocuments(),
      Event.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ verified: true }),
      University.countDocuments(),
      Scholarship.countDocuments(),
    ]);

    // 2. Perform Analytics Aggregations
    const destinationStats = await Lead.aggregate([
      { $match: { dreamCountry: { $exists: true, $ne: '' } } },
      { $group: { _id: '$dreamCountry', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    const contacted = await Lead.countDocuments({ status: { $in: ['contacted', 'qualified', 'converted'] } });
    const qualified = await Lead.countDocuments({ status: { $in: ['qualified', 'converted'] } });
    const converted = await Lead.countDocuments({ status: 'converted' });
    const conversionFunnel = [
      { name: 'Registered', value: leads },
      { name: 'Verified', value: verifiedLeads },
      { name: 'Contacted', value: contacted },
      { name: 'Qualified', value: qualified },
      { name: 'Converted', value: converted }
    ];

    const counselorStats = await Lead.aggregate([
      { $group: {
          _id: '$assignedTo',
          leads: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
      }},
      { $project: { name: '$_id', leads: 1, converted: 1, _id: 0 } },
      { $sort: { leads: -1 } }
    ]);
    // Leads are assigned by staff id: show the staff member's name
    const staffNames = Object.fromEntries(
      (await Staff.find({ _id: { $in: counselorStats.map((c) => c.name).filter((n) => mongoose.Types.ObjectId.isValid(n)) } }).select('name').lean())
        .map((st) => [String(st._id), st.name])
    );
    counselorStats.forEach((c) => { c.name = staffNames[c.name] || c.name || 'Unassigned'; });

    // New leads per IST day over all time; the dashboard chart slices this into
    // 7D / 30D (daily), 3M (weekly), 1Y (monthly) and All (monthly or yearly).
    const dailyLeads = await Lead.aggregate([
      { $match: { createdAt: { $type: 'date' } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
          total: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] } }
      }}
    ]);
    const leadTrends = buildLeadTrends(dailyLeads);

    // Work waiting for the team (all read-only counts)
    const SupportRequest = require('../models/SupportRequest');
    const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
    const UnicoachBooking = require('../unicoach/models/UnicoachBooking');
    const [newRequests, approvedMentors, pendingMentors, upcomingSessions] = await Promise.all([
      SupportRequest.countDocuments({ status: 'New' }),
      UnicoachMentor.countDocuments({ applicationStatus: 'APPROVED' }),
      UnicoachMentor.countDocuments({ applicationStatus: 'PENDING' }),
      UnicoachBooking.countDocuments({ state: 'CONFIRMED' }),
    ]);

    return res.json({
      leadTrends,
      newRequests,
      approvedMentors,
      pendingMentors,
      upcomingSessions,
      contacted,
      converted,
      users,
      studentUsers,
      blogs,
      news,
      events,
      leads,
      verifiedLeads,
      universities,
      scholarships,
      destinationStats,
      conversionFunnel,
      counselorStats,
    });
  } catch (err) {
    console.error('Error in stats endpoint:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
