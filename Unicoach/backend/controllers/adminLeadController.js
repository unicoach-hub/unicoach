const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { scopedStaffId, canAccessLead } = require('../utils/leadAccess');
const { cleanManualTags, refreshAutoTags } = require('../utils/leadTags');

/**
 * Helper to resolve the name shown in lead activity ("performed by")
 */
async function getAdminName(userId, req) {
  if (req?.user?.role === 'staff') return req.staff?.name || 'Staff';
  let adminName = 'Admin';
  if (userId) {
    const adminUser = await User.findById(userId);
    if (adminUser) adminName = adminUser.name || adminUser.username || 'Admin';
  }
  return adminName;
}

// Leads are assigned by staff id; older leads may still hold a plain name
async function counselorName(value) {
  if (!value || value === 'Unassigned') return 'Unassigned';
  if (!mongoose.Types.ObjectId.isValid(value)) return value;
  const staff = await Staff.findById(value).select('name').lean();
  return staff?.name || value;
}

/**
 * GET /api/admin/leads
 * GET all leads with optional filters
 */
exports.getAllLeads = async (req, res) => {
  try {
    const { status, verified, source, followUpFilter, assignedTo } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (verified !== undefined) filter.verified = verified === 'true';
    if (source) filter.source = source;
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'Unassigned') {
        filter.$or = [{ assignedTo: 'Unassigned' }, { assignedTo: { $exists: false } }];
      } else {
        filter.assignedTo = assignedTo;
      }
    }

    // Staff limited to their own leads only ever see those, whatever filter they pick
    const ownOnly = scopedStaffId(req);
    if (ownOnly) {
      delete filter.$or;
      filter.assignedTo = ownOnly;
    }

    if (followUpFilter === 'due') {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      filter.nextFollowUpDate = { $lte: endOfToday };
      filter.status = { $nin: ['converted', 'closed'] };
    }

    // Newest enquiry first: a returning student who just submitted another form (e.g. education loan)
    // moves back to the top instead of staying wherever their first enquiry put them
    const leads = await Lead.find(filter).select('-activities').lean();
    const lastActivity = (l) => new Date(l.lastInquiryAt || l.createdAt || 0).getTime();
    leads.sort((a, b) => lastActivity(b) - lastActivity(a));
    return res.json(leads);
  } catch (err) {
    console.error('Error fetching admin leads:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/leads/:id
 * GET single lead
 */
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    if (!canAccessLead(req, lead)) return res.status(404).json({ message: 'Not found' });
    return res.json(lead);
  } catch (err) {
    console.error('Error fetching lead by ID:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/leads/:id
 * Update lead status/notes/assignedTo
 */
exports.updateLead = async (req, res) => {
  try {
    const { status, notes, assignedTo } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    if (!canAccessLead(req, lead)) return res.status(404).json({ message: 'Not found' });

    const adminName = await getAdminName(req.user?.id, req);

    if (status && status !== lead.status) {
      lead.activities.push({
        type: 'status_change',
        comment: `Status updated from "${lead.status}" to "${status}"`,
        performedBy: adminName,
        date: new Date()
      });
    }

    if (assignedTo !== undefined && assignedTo !== lead.assignedTo) {
      // Staff limited to their own leads can't hand them to someone else
      if (scopedStaffId(req)) return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only a manager or the admin can reassign leads' });
      lead.activities.push({
        type: 'note',
        comment: `Lead assignment updated from "${await counselorName(lead.assignedTo)}" to "${await counselorName(assignedTo)}"`,
        performedBy: adminName,
        date: new Date()
      });
      lead.assignedTo = assignedTo;
    }

    lead.status = status || lead.status;
    lead.notes = notes !== undefined ? notes : lead.notes;

    const updatedLead = await lead.save();
    return res.json(updatedLead);
  } catch (err) {
    console.error('Error updating lead:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/:id/activity
 * Add a follow-up activity log
 */
exports.addActivity = async (req, res) => {
  try {
    const { type, comment, nextFollowUpDate, status } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (!canAccessLead(req, lead)) return res.status(404).json({ message: 'Lead not found' });

    const adminName = await getAdminName(req.user?.id, req);

    lead.activities.push({
      type: type || 'note',
      comment,
      performedBy: adminName,
      date: new Date()
    });

    if (nextFollowUpDate) {
      lead.nextFollowUpDate = new Date(nextFollowUpDate);
    }
    
    if (status && status !== lead.status) {
      lead.activities.push({
        type: 'status_change',
        comment: `Status updated from "${lead.status}" to "${status}"`,
        performedBy: adminName,
        date: new Date()
      });
      lead.status = status;
    }

    const savedLead = await lead.save();
    return res.json(savedLead);
  } catch (err) {
    console.error('Error adding activity:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/:id/send-email
 * Send email to lead and log it
 */
exports.sendLeadEmail = async (req, res) => {
  try {
    const { subject, html } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (!canAccessLead(req, lead)) return res.status(404).json({ message: 'Lead not found' });

    const adminName = await getAdminName(req.user?.id, req);

    lead.activities.push({
      type: 'email',
      comment: `Email Sent: "${subject}".`,
      performedBy: adminName,
      date: new Date()
    });

    const savedLead = await lead.save();

    // Dispatch email asynchronously in background via pooled SMTP
    sendEmail({
      to: lead.email,
      subject,
      html,
    })
      .then((emailResult) => {
        console.log(`✅ [Lead Email] Dispatched to ${lead.email} (${emailResult?.messageId})`);
      })
      .catch((err) => {
        console.error(`❌ [Lead Email] Failed to send email to ${lead.email}:`, err.message);
      });

    return res.json({ lead: savedLead, emailResult: { dispatched: true } });
  } catch (err) {
    console.error('Error sending lead email:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch email' });
  }
};

/**
 * POST /api/admin/leads/:id/log-whatsapp
 * Log a WhatsApp click event
 */
exports.logWhatsApp = async (req, res) => {
  try {
    const { templateName, messageContent } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (!canAccessLead(req, lead)) return res.status(404).json({ message: 'Lead not found' });

    const adminName = await getAdminName(req.user?.id, req);

    lead.activities.push({
      type: 'whatsapp',
      comment: `WhatsApp Chat initiated. Template: "${templateName || 'Custom'}". Message: "${(messageContent || '').substring(0, 100)}..."`,
      performedBy: adminName,
      date: new Date()
    });

    const savedLead = await lead.save();
    return res.json(savedLead);
  } catch (err) {
    console.error('Error logging whatsapp:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/import
 * Bulk import leads
 */
exports.importLeads = async (req, res) => {
  try {
    // Import updates existing leads by email, so it needs access to every lead
    if (scopedStaffId(req)) return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only a manager or the admin can import leads' });
    const { leads } = req.body;
    if (!Array.isArray(leads)) {
      return res.status(400).json({ error: 'Leads must be an array' });
    }

    const errors = [];
    const bulkOps = [];
    let processedCount = 0;

    const adminName = await getAdminName(req.user?.id, req);

    for (let i = 0; i < leads.length; i++) {
      const l = leads[i];
      if (!l.name || !l.email || !l.phone || !l.dreamCountry || !l.preferredIntake || !l.highestEducation || !l.currentCity) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      processedCount++;
      const nextFollowUpDate = l.nextFollowUpDate ? new Date(l.nextFollowUpDate) : null;
      const parsedFollowUp = nextFollowUpDate && !isNaN(nextFollowUpDate.getTime()) ? nextFollowUpDate : undefined;

      bulkOps.push({
        updateOne: {
          filter: { email: l.email.toLowerCase() },
          update: {
            $set: {
              name: l.name,
              phone: l.phone,
              dreamCountry: l.dreamCountry,
              preferredIntake: l.preferredIntake,
              highestEducation: l.highestEducation,
              currentCity: l.currentCity,
              status: l.status || 'new',
              notes: l.notes || '',
              verified: l.verified !== undefined ? l.verified : false,
              ...(parsedFollowUp ? { nextFollowUpDate: parsedFollowUp } : {})
            },
            $setOnInsert: {
              email: l.email.toLowerCase(),
              source: l.source || 'imported',
              activities: [{
                type: 'note',
                comment: 'Lead imported via admin CSV import panel',
                performedBy: adminName,
                date: new Date()
              }],
              createdAt: new Date()
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await Lead.bulkWrite(bulkOps);
      // bulkWrite skips the save hook, so work out the auto tags for these leads now
      await refreshAutoTags({ email: { $in: leads.filter((l) => l.email).map((l) => String(l.email).toLowerCase()) } });
    }

    return res.json({
      success: true,
      count: processedCount,
      errors: errors.length > 0 ? errors : null
    });
  } catch (err) {
    console.error('Error importing leads:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/leads/tags
 * Every tag in use with how many leads have it (auto and manual), for pickers and filters
 */
exports.getTags = async (req, res) => {
  try {
    const own = scopedStaffId(req);
    const match = own ? { assignedTo: own } : {};
    const [auto, manual] = await Promise.all(['autoTags', 'tags'].map((field) => Lead.aggregate([
      { $match: match },
      { $unwind: `$${field}` },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ])));
    return res.json({
      auto: auto.map((t) => ({ tag: t._id, count: t.count })),
      manual: manual.map((t) => ({ tag: t._id, count: t.count })),
    });
  } catch (err) {
    console.error('Error listing lead tags:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/leads/:id/tags  { tags: [...] }  (manual tags only; auto tags can't be edited)
 */
exports.setTags = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).select('assignedTo tags');
    if (!lead || !canAccessLead(req, lead)) return res.status(404).json({ message: 'Not found' });
    const tags = cleanManualTags(req.body.tags);
    await Lead.updateOne({ _id: lead._id }, { $set: { tags } });
    return res.json({ tags });
  } catch (err) {
    console.error('Error setting lead tags:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/leads/bulk-tags  { ids: [...], add: [...], remove: [...] }
 */
exports.bulkTags = async (req, res) => {
  try {
    const ids = (Array.isArray(req.body.ids) ? req.body.ids : []).filter((id) => mongoose.Types.ObjectId.isValid(id)).slice(0, 2000);
    const add = cleanManualTags(req.body.add);
    const remove = cleanManualTags(req.body.remove);
    if (!ids.length || (!add.length && !remove.length)) return res.status(400).json({ message: 'Choose leads and a tag' });
    const filter = { _id: { $in: ids } };
    const own = scopedStaffId(req);
    if (own) filter.assignedTo = own;
    if (add.length) await Lead.updateMany(filter, { $addToSet: { tags: { $each: add } } });
    if (remove.length) await Lead.updateMany(filter, { $pull: { tags: { $in: remove } } });
    return res.json({ updated: ids.length });
  } catch (err) {
    console.error('Error bulk tagging leads:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/leads/:id
 * Delete lead
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).select('assignedTo');
    if (!lead || !canAccessLead(req, lead)) return res.status(404).json({ message: 'Not found' });
    await Lead.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
