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

    // Anyone we have spoken to: old statuses plus the sheet-style ones (Interested, 50 / 50, Not interested, Converted)
    const contacted = await Lead.countDocuments({ $or: [{ status: { $in: ['contacted', 'qualified', 'interested', 'fifty_fifty', 'not_interested', 'converted'] } }, { phoneCall: 'done' }] });
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


/**
 * GET /api/admin/stats/attention
 * What needs doing now: overdue follow-ups and tasks, uncalled leads, waiting applications/requests,
 * WhatsApp chats waiting for a person, today's sessions, events coming up. Staff limited to their own
 * leads only see their own leads and tasks.
 */
exports.getAttention = async (req, res) => {
  try {
    const { scopedStaffId } = require('../utils/leadAccess');
    const StaffTask = require('../models/StaffTask');
    const SupportRequest = require('../models/SupportRequest');
    const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
    const UnicoachBooking = require('../unicoach/models/UnicoachBooking');
    const WhatsappContact = require('../models/WhatsappContact');
    const WhatsappEvent = require('../models/WhatsappEvent');
    const Campaign = require('../models/Campaign');

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const dayAgo = new Date(now - 24 * 3600e3);
    const weekAhead = new Date(now.getTime() + 7 * 86400e3);

    const own = scopedStaffId(req);
    const leadScope = own ? { assignedTo: own } : {};
    const open = { status: { $nin: ['converted', 'closed', 'not_interested'] } };
    const isOwner = req.user?.role === 'admin';
    const me = isOwner ? null : String(req.staff?._id || '');
    const taskScope = isOwner ? {} : { 'assignee.id': me };
    const pick = 'name phone dreamCountry nextFollowUpDate createdAt assignedTo';

    const [
      overdueFollowUps, overdueFollowUpCount, dueTodayCount,
      uncalled, uncalledCount, followUpListCount,
      overdueTasks, overdueTaskCount, tasksTodayCount,
      newRequests, pendingMentors, needsAgent, unreadWhatsapp,
      sessionsToday, upcomingEvents, eventsWithoutDate, pausedCampaigns,
    ] = await Promise.all([
      Lead.find({ ...leadScope, ...open, nextFollowUpDate: { $lt: startOfDay } }).select(pick).sort({ nextFollowUpDate: 1 }).limit(6).lean(),
      Lead.countDocuments({ ...leadScope, ...open, nextFollowUpDate: { $lt: startOfDay } }),
      Lead.countDocuments({ ...leadScope, ...open, nextFollowUpDate: { $gte: startOfDay, $lte: endOfDay } }),
      Lead.find({ ...leadScope, status: 'new', phoneCall: { $ne: 'done' }, createdAt: { $lt: dayAgo } }).select(pick).sort({ createdAt: 1 }).limit(6).lean(),
      Lead.countDocuments({ ...leadScope, status: 'new', phoneCall: { $ne: 'done' }, createdAt: { $lt: dayAgo } }),
      Lead.countDocuments({ ...leadScope, followUp: { $in: ['interested', 'fifty_fifty'] } }),
      StaffTask.find({ ...taskScope, status: { $ne: 'done' }, dueAt: { $lt: now } }).select('title dueAt priority assignee').sort({ dueAt: 1 }).limit(6).lean(),
      StaffTask.countDocuments({ ...taskScope, status: { $ne: 'done' }, dueAt: { $lt: now } }),
      StaffTask.countDocuments({ ...taskScope, status: { $ne: 'done' }, dueAt: { $gte: now, $lte: endOfDay } }),
      own ? 0 : SupportRequest.countDocuments({ status: 'New' }),
      own ? 0 : UnicoachMentor.countDocuments({ applicationStatus: 'PENDING' }),
      own ? 0 : WhatsappContact.countDocuments({ needsAgent: true }),
      own ? 0 : WhatsappEvent.countDocuments({ kind: 'message', direction: 'in', readByAdmin: { $ne: true } }),
      own ? 0 : UnicoachBooking.countDocuments({ state: 'CONFIRMED', startUtc: { $gte: startOfDay, $lte: endOfDay } }),
      own ? [] : Event.find({ published: true, eventStart: { $gte: now, $lte: weekAhead } }).select('title eventStart attendees').sort({ eventStart: 1 }).limit(4).lean(),
      own ? 0 : Event.countDocuments({ published: true, $or: [{ eventStart: null }, { eventStart: { $exists: false } }] }),
      own ? 0 : Campaign.countDocuments({ status: 'paused' }),
    ]);

    return res.json({
      followUps: {
        overdue: overdueFollowUpCount,
        today: dueTodayCount,
        items: overdueFollowUps.map((l) => ({ id: l._id, name: l.name, phone: l.phone, country: l.dreamCountry, due: l.nextFollowUpDate })),
      },
      uncalled: {
        count: uncalledCount,
        items: uncalled.map((l) => ({ id: l._id, name: l.name, phone: l.phone, country: l.dreamCountry, since: l.createdAt })),
      },
      followUpList: followUpListCount,
      tasks: {
        overdue: overdueTaskCount,
        today: tasksTodayCount,
        items: overdueTasks.map((t) => ({ id: t._id, title: t.title, due: t.dueAt, priority: t.priority, assignee: t.assignee?.name || '' })),
      },
      newRequests,
      pendingMentors,
      whatsapp: { needsAgent, unread: unreadWhatsapp },
      sessionsToday,
      upcomingEvents: upcomingEvents.map((e) => ({ id: e._id, title: e.title, start: e.eventStart, registered: (e.attendees || []).length })),
      eventsWithoutDate,
      pausedCampaigns,
    });
  } catch (err) {
    console.error('Error building attention list:', err);
    return res.status(500).json({ message: 'Could not load what needs attention' });
  }
};
