const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Lead = require('../models/Lead');
const { PHASES, normalizeStage, publicStages } = require('../config/studentStages');
const { normalizePhone } = require('../utils/twilio');

router.use(verifyToken);

const str = (v, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const publicProfile = (u) => ({
  name: u.name,
  email: u.email,
  phone: u.phone || '',
  dreamCountry: u.dreamCountry || '',
  preferredIntake: u.preferredIntake || '',
  dreamCourse: u.dreamCourse || '',
  highestEducation: u.highestEducation || '',
  percentage: u.percentage || '',
  passoutYear: u.passoutYear || '',
  currentCity: u.currentCity || '',
  profileCompleted: Boolean(u.profileCompletedAt),
  journeyStage: normalizeStage(u.journeyStage),
  stageUpdatedAt: u.stageUpdatedAt || u.createdAt,
  stageHistory: (u.stageHistory || []).map((h) => ({ stage: normalizeStage(h.stage), at: h.at })),
});

/**
 * GET /api/student/profile
 * The student's onboarding details and journey stage (with the full list of stages to draw the tracker)
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'Account not found' });
    return res.json({ profile: publicProfile(user), stages: publicStages(), phases: PHASES });
  } catch (err) {
    console.error('Error loading student profile:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/student/profile
 * Onboarding form (all fields required). Saved once; later edits just update the same fields.
 */
router.put('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });

    const body = req.body || {};
    const next = {
      name: str(body.name, 80),
      phone: str(body.phone, 20),
      dreamCountry: str(body.dreamCountry, 60),
      preferredIntake: str(body.preferredIntake, 40),
      dreamCourse: str(body.dreamCourse, 120),
      highestEducation: str(body.highestEducation, 60),
      percentage: str(body.percentage, 10),
      passoutYear: str(body.passoutYear, 4),
    };
    const missing = Object.entries(next).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) return res.status(400).json({ message: 'Please fill in every field', missing });

    const pct = Number(next.percentage.replace('%', ''));
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) return res.status(400).json({ message: 'Enter your percentage between 1 and 100 (convert CGPA to %)' });
    const year = Number(next.passoutYear);
    const thisYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(next.passoutYear) || year < 1980 || year > thisYear + 6) return res.status(400).json({ message: 'Enter a valid passout year' });

    const phone = normalizePhone(next.phone);
    if (!phone || phone.replace(/\D/g, '').length < 8) return res.status(400).json({ message: 'Enter a valid phone number' });
    if (phone !== user.phone && (await User.exists({ phone, _id: { $ne: user._id } }))) {
      return res.status(400).json({ message: 'This phone number is already used by another account' });
    }

    Object.assign(user, { ...next, phone, percentage: String(pct) });
    const firstTime = !user.profileCompletedAt;
    if (firstTime) user.profileCompletedAt = new Date();
    // Prefill the university shortlister with what we already know
    user.shortlistProfile = {
      ...(user.shortlistProfile?.toObject?.() || user.shortlistProfile || {}),
      targetCountry: user.shortlistProfile?.targetCountry || next.dreamCountry,
      intake: user.shortlistProfile?.intake || next.preferredIntake,
      gpaPercent: user.shortlistProfile?.gpaPercent || pct,
      streamMajor: user.shortlistProfile?.streamMajor || next.dreamCourse,
    };
    await user.save();


    // Keep the CRM lead in step (only fill what the counsellor hasn't set)
    if (user.email) {
      const lead = await Lead.findOne({ email: user.email.toLowerCase() });
      if (lead) {
        const fill = { dreamCountry: next.dreamCountry, preferredIntake: next.preferredIntake, highestEducation: next.highestEducation };
        for (const [k, v] of Object.entries(fill)) if (!lead[k] || ['Not specified', 'Undecided', '2026'].includes(lead[k])) lead[k] = v;
        if (!lead.phone || lead.phone === 'Not provided') lead.phone = phone;
        await lead.save().catch((e) => console.warn('[Profile] lead sync failed:', e.message));
      }
    }

    const fresh = await User.findById(user._id).lean();
    return res.json({ success: true, profile: publicProfile(fresh) });
  } catch (err) {
    console.error('Error saving student profile:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
