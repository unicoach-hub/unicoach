const SavedUniversity = require('../models/SavedUniversity');
const User = require('../models/User');
const Lead = require('../models/Lead');

/**
 * GET /api/saved-universities
 */
exports.getSavedUniversities = async (req, res) => {
  try {
    const userId = req.user.id;
    const saved = await SavedUniversity.find({ user: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, savedUniversities: saved });
  } catch (err) {
    console.error('Error fetching saved universities:', err);
    return res.status(500).json({ error: 'Failed to fetch saved universities' });
  }
};

/**
 * POST /api/saved-universities/toggle
 */
exports.toggleSavedUniversity = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      universityId,
      name,
      countryName,
      city,
      logo,
      rank,
      tuition,
      tuitionFeeUSD,
      minGpaPercent,
      minIeltsScore,
      acceptanceRate,
      categoryTag,
      matchScore,
      website,
      eligibility,
      notes
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'University name is required' });
    }

    const existing = await SavedUniversity.findOne({ user: userId, name: name.trim() });

    if (existing) {
      await SavedUniversity.deleteOne({ _id: existing._id });

      // Sync removal with CRM Lead profile
      try {
        const userObj = await User.findById(userId);
        if (userObj && (userObj.phone || userObj.email)) {
          const digits = userObj.phone ? userObj.phone.replace(/\D/g, '') : '';
          const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
          const normalizedEmail = userObj.email ? userObj.email.toLowerCase().trim() : null;

          const matchOr = [];
          if (userObj.phone) matchOr.push({ phone: userObj.phone });
          if (last10) matchOr.push({ phone: new RegExp(last10 + '$') });
          if (normalizedEmail) matchOr.push({ email: normalizedEmail });

          if (matchOr.length > 0) {
            const matchingLeads = await Lead.find({ $or: matchOr });
            for (const lead of matchingLeads) {
              lead.activities.push({
                type: 'note',
                comment: `Student removed saved university from shortlist: ${name.trim()}`,
                date: new Date(),
                performedBy: 'Student'
              });
              if (lead.savedUniversities) {
                lead.savedUniversities = lead.savedUniversities.filter(u => u.name?.toLowerCase() !== name.trim().toLowerCase());
              }
              await lead.save();
            }
          }
        }
      } catch (syncErr) {
        console.warn('Saved university lead removal sync skipped:', syncErr.message);
      }

      return res.json({ 
        success: true, 
        saved: false, 
        message: `Removed ${name} from saved list`, 
        removedId: existing._id 
      });
    } else {
      const cleanCategory = (categoryTag && ['safe', 'target', 'dream'].includes(String(categoryTag).toLowerCase()))
        ? String(categoryTag).toLowerCase()
        : 'target';

      const newSaved = new SavedUniversity({
        user: userId,
        universityId: universityId ? String(universityId) : null,
        name: name.trim(),
        countryName: countryName || 'International',
        city: city || '',
        logo: logo || '',
        rank: rank || '',
        tuition: tuition || '',
        tuitionFeeUSD: tuitionFeeUSD || 0,
        // Only values the shortlist marked official; no made-up minimums
        minGpaPercent: minGpaPercent || null,
        minIeltsScore: minIeltsScore || null,
        acceptanceRate: acceptanceRate || null,
        categoryTag: cleanCategory,
        matchScore: matchScore || 80,
        website: website || '',
        eligibility: eligibility || '',
        notes: notes || ''
      });

      await newSaved.save();

      // Sync new save with CRM Lead profile
      try {
        const userObj = await User.findById(userId);
        if (userObj && (userObj.phone || userObj.email)) {
          const digits = userObj.phone ? userObj.phone.replace(/\D/g, '') : '';
          const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
          const normalizedEmail = userObj.email ? userObj.email.toLowerCase().trim() : null;

          const matchOr = [];
          if (userObj.phone) matchOr.push({ phone: userObj.phone });
          if (last10) matchOr.push({ phone: new RegExp(last10 + '$') });
          if (normalizedEmail) matchOr.push({ email: normalizedEmail });

          const matchingLeads = matchOr.length > 0 ? await Lead.find({ $or: matchOr }) : [];

          // If no lead exists for this student, auto-create one from their profile
          if (matchingLeads.length === 0) {
            const newLead = new Lead({
              name: userObj.name || 'Unknown Student',
              email: normalizedEmail || userObj.email || 'student@unicoach.com',
              phone: userObj.phone || '+910000000000',
              dreamCountry: userObj.dreamCountry || 'Undecided',
              preferredIntake: userObj.preferredIntake || '2026',
              highestEducation: userObj.highestEducation || 'Not specified',
              currentCity: userObj.currentCity || 'Not specified',
              source: 'student-dashboard',
              status: 'new',
              verified: true,
              totalInquiries: 1,
              lastInquiryAt: new Date(),
              savedUniversities: [{
                name: name.trim(),
                countryName: countryName || '',
                city: city || '',
                rank: rank || '',
                tuition: tuition || '',
                savedAt: new Date()
              }],
              interestedUniversities: [],
              activities: [{
                type: 'note',
                comment: `Lead auto-created from student dashboard. Student saved university: ${name.trim()} (${countryName || 'Global'})`,
                date: new Date(),
                performedBy: 'System'
              }]
            });
            await newLead.save();
          } else {
            for (const lead of matchingLeads) {
              lead.activities.push({
                type: 'note',
                comment: `Student bookmarked / saved university to shortlist: ${name.trim()} (${countryName || 'Global'})`,
                date: new Date(),
                performedBy: 'Student'
              });

              if (!lead.savedUniversities) lead.savedUniversities = [];
              const alreadySaved = lead.savedUniversities.some(u => u.name?.toLowerCase() === name.trim().toLowerCase());
              if (!alreadySaved) {
                lead.savedUniversities.push({
                  name: name.trim(),
                  countryName: countryName || '',
                  city: city || '',
                  rank: rank || '',
                  tuition: tuition || '',
                  savedAt: new Date()
                });
              }
              await lead.save();
            }
          }
        }
      } catch (syncErr) {
        console.warn('Saved university lead sync skipped:', syncErr.message);
      }

      return res.json({ 
        success: true, 
        saved: true, 
        message: `Saved ${name} to your shortlist!`, 
        savedUniversity: newSaved 
      });
    }
  } catch (err) {
    console.error('Error toggling saved university:', err);
    return res.status(500).json({ error: 'Failed to toggle saved university' });
  }
};

/**
 * DELETE /api/saved-universities/:id
 */
exports.deleteSavedUniversity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await SavedUniversity.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) {
      return res.status(404).json({ error: 'Saved university record not found' });
    }

    // Sync removal with CRM Lead profile
    try {
      const userObj = await User.findById(userId);
      if (userObj && (userObj.phone || userObj.email)) {
        const digits = userObj.phone ? userObj.phone.replace(/\D/g, '') : '';
        const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
        const normalizedEmail = userObj.email ? userObj.email.toLowerCase().trim() : null;

        const matchOr = [];
        if (userObj.phone) matchOr.push({ phone: userObj.phone });
        if (last10) matchOr.push({ phone: new RegExp(last10 + '$') });
        if (normalizedEmail) matchOr.push({ email: normalizedEmail });

        if (matchOr.length > 0) {
          const matchingLeads = await Lead.find({ $or: matchOr });
          for (const lead of matchingLeads) {
            lead.activities.push({
              type: 'note',
              comment: `Student removed saved university from dashboard: ${deleted.name}`,
              date: new Date(),
              performedBy: 'Student'
            });
            if (lead.savedUniversities) {
              lead.savedUniversities = lead.savedUniversities.filter(u => u.name?.toLowerCase() !== deleted.name?.toLowerCase());
            }
            await lead.save();
          }
        }
      }
    } catch (syncErr) {
      console.warn('Saved university delete lead sync skipped:', syncErr.message);
    }

    return res.json({ success: true, message: 'University removed from saved list' });
  } catch (err) {
    console.error('Error deleting saved university:', err);
    return res.status(500).json({ error: 'Failed to remove university' });
  }
};

/**
 * PUT /api/saved-universities/:id/notes
 */
exports.updateSavedUniversityNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await SavedUniversity.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { notes: notes || '' } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Saved university not found' });
    }

    return res.json({ success: true, savedUniversity: updated });
  } catch (err) {
    console.error('Error updating notes:', err);
    return res.status(500).json({ error: 'Failed to update notes' });
  }
};
