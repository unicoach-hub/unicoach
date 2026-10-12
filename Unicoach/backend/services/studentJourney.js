const User = require('../models/User');
const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const { sendEmail } = require('../utils/email');
const { escapeHtml } = require('../utils/escapeHtml');
const { STUDENT_STAGES, STAGE_KEYS, PHASES, stageInfo, normalizeStage } = require('../config/studentStages');

const FRONTEND = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');

// Fields asked once in the onboarding form (also what the admin sees on the student's profile)
const PROFILE_FIELDS = ['dreamCountry', 'preferredIntake', 'dreamCourse', 'highestEducation', 'percentage', 'passoutYear'];

const cleanHandle = (v) => String(v || '').trim().toLowerCase().replace(/^@/, '').slice(0, 60);

/**
 * Links a brand-new student to the mentor whose referral link they came from.
 * Only approved, active mentors count; a student is never re-assigned once linked. Never throws.
 */
const applyReferral = async (userId, handle) => {
  try {
    const h = cleanHandle(handle);
    if (!h || !/^[a-z0-9._-]+$/.test(h)) return null;
    const mentor = await UnicoachMentor.findOne({ handle: h, applicationStatus: 'APPROVED', active: { $ne: false } })
      .select('_id name userId')
      .lean();
    if (!mentor || String(mentor.userId || '') === String(userId)) return null;
    const res = await User.updateOne(
      { _id: userId, referredBy: { $exists: false } },
      { $set: { referredBy: mentor._id, referredAt: new Date() } }
    );
    return res.modifiedCount ? mentor : null;
  } catch (err) {
    console.warn('[Referral] could not link student to mentor:', err.message);
    return null;
  }
};

const stageEmailHtml = (name, stage) => {
  const phaseIndex = PHASES.findIndex((p) => p.key === stage.phase);
  const steps = PHASES.map((p, i) => {
    const done = i < phaseIndex;
    const current = i === phaseIndex;
    const text = current ? `${p.label}: ${stage.label}` : p.label;
    const color = current ? (stage.outcome === 'bad' ? '#dc2626' : '#0f172a') : done ? '#0f172a' : '#94a3b8';
    return `<tr><td style="padding:4px 0;font-size:13px;color:${color};font-weight:${current ? 700 : 500}">
      <span style="display:inline-block;width:18px;color:${done || current ? '#DE5C2B' : '#cbd5e1'}">${done ? '&#10003;' : current ? '&#9679;' : '&#9675;'}</span>${escapeHtml(text)}</td></tr>`;
  }).join('');
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#fff;border-radius:16px;border:1px solid #e2e8f0">
    <h1 style="color:#DE5C2B;font-size:24px;margin:0 0 20px;font-weight:800">UniCoach</h1>
    <h2 style="color:#1e293b;font-size:19px;margin:0 0 8px">Hi ${escapeHtml(name || 'there')}, you are now at: ${escapeHtml(stage.label)}</h2>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 18px">${escapeHtml(stage.message)}</p>
    <table style="border-collapse:collapse;margin:0 0 22px">${steps}</table>
    <a href="${FRONTEND()}/dashboard" style="background:#DE5C2B;color:#fff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;display:inline-block">Open my dashboard</a>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px">Questions? Reply to this email or message your counsellor from the dashboard.</p>
  </div>`;
};

/**
 * Moves a student to `stageKey`, records who did it and (optionally) emails the student.
 * Returns the updated user, or null when the stage is unknown / the student is missing.
 */
const setStudentStage = async (userId, stageKey, { by = '', note = '', notify = true } = {}) => {
  if (!STAGE_KEYS.includes(stageKey)) return null;
  const user = await User.findById(userId);
  if (!user) return null;
  if (normalizeStage(user.journeyStage) === stageKey) return user;
  user.journeyStage = stageKey;
  user.stageUpdatedAt = new Date();
  user.stageHistory.push({ stage: stageKey, by, note: String(note || '').slice(0, 500) });
  await user.save();
  if (notify && user.email) {
    const stage = stageInfo(stageKey);
    sendEmail({
      to: user.email,
      subject: `Your UniCoach journey: ${stage.label}`,
      html: stageEmailHtml(user.name, stage),
    }).catch((e) => console.warn('[Stage] email failed (non-blocking):', e.message));
  }
  return user;
};

// keep STUDENT_STAGES referenced for callers that import it from here
module.exports = { STUDENT_STAGES, PROFILE_FIELDS, applyReferral, setStudentStage, cleanHandle };
