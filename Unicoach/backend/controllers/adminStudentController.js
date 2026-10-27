const mongoose = require('mongoose');
const archiver = require('archiver');
const User = require('../models/User');
const StudentDocument = require('../models/StudentDocument');
const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const escapeRegex = require('../utils/escapeRegex');
const { actorName } = require('../utils/leadAccess');
const { STAGE_KEYS, LEGACY_STAGES, PHASES, normalizeStage, publicStages } = require('../config/studentStages');
const { setStudentStage } = require('../services/studentJourney');
const { publicDocument, fileAccessUrl } = require('../services/studentFile');
const { getAccessUrl } = require('../unicoach/services/fileStorageService');

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));
const LIST_FIELDS = 'name email phone dreamCountry preferredIntake dreamCourse highestEducation percentage passoutYear currentCity profileCompletedAt journeyStage stageUpdatedAt referredBy referredAt createdAt';

/**
 * GET /api/admin/students?search=&stage=&mentor=&docs=1
 * Registered students with their profile, stage, referring mentor and document counts
 */
exports.listStudents = async (req, res) => {
  try {
    const filter = { role: 'user' };
    const search = String(req.query.search || '').trim();
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    if (STAGE_KEYS.includes(req.query.stage)) {
      const legacy = Object.keys(LEGACY_STAGES).filter((k) => LEGACY_STAGES[k] === req.query.stage);
      filter.journeyStage = req.query.stage === 'registered' ? { $in: [null, 'registered', ...legacy] } : { $in: [req.query.stage, ...legacy] };
    }
    if (req.query.mentor === 'none') filter.referredBy = { $exists: false };
    else if (isId(req.query.mentor)) filter.referredBy = req.query.mentor;

    const students = await User.find(filter).select(LIST_FIELDS).sort({ createdAt: -1 }).limit(2000)
      .populate({ path: 'referredBy', model: UnicoachMentor, select: 'name handle' }).lean();

    const ids = students.map((s) => s._id);
    const docCounts = await StudentDocument.aggregate([
      { $match: { student: { $in: ids }, 'file.url': { $exists: true, $ne: null } } },
      { $group: { _id: '$student', total: { $sum: 1 }, toReview: { $sum: { $cond: [{ $eq: ['$status', 'uploaded'] }, 1, 0] } }, last: { $max: '$uploadedAt' } } },
    ]);
    const byStudent = new Map(docCounts.map((d) => [String(d._id), d]));

    let rows = students.map((s) => {
      const d = byStudent.get(String(s._id));
      return {
        ...s,
        journeyStage: normalizeStage(s.journeyStage),
        profileCompleted: Boolean(s.profileCompletedAt),
        documents: { total: d?.total || 0, toReview: d?.toReview || 0, lastUploadAt: d?.last || null },
      };
    });
    if (req.query.docs === '1') rows = rows.filter((r) => r.documents.total > 0);

    return res.json({ students: rows, stages: publicStages(), phases: PHASES });
  } catch (err) {
    console.error('Error listing students:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/students/mentor-summary
 * How many students each mentor referred, split by stage
 */
exports.mentorSummary = async (req, res) => {
  try {
    const rows = await User.aggregate([
      { $match: { role: 'user', referredBy: { $exists: true, $ne: null } } },
      { $group: { _id: { mentor: '$referredBy', stage: { $ifNull: ['$journeyStage', 'registered'] } }, n: { $sum: 1 } } },
    ]);
    const summary = {};
    for (const r of rows) {
      const id = String(r._id.mentor);
      const stage = normalizeStage(r._id.stage);
      summary[id] = summary[id] || { total: 0, byStage: {} };
      summary[id].total += r.n;
      summary[id].byStage[stage] = (summary[id].byStage[stage] || 0) + r.n;
    }
    return res.json({ summary });
  } catch (err) {
    console.error('Error building mentor referral summary:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/students/lookup?email=
 * The registered student behind a lead (same email), for the lead popup; { student: null } if none
 */
exports.lookupByEmail = async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email || email.length > 200) return res.json({ student: null });
    const student = await User.findOne({ email, role: 'user' }).select(LIST_FIELDS)
      .populate({ path: 'referredBy', model: UnicoachMentor, select: 'name handle' }).lean();
    if (!student) return res.json({ student: null });
    const docs = await StudentDocument.countDocuments({ student: student._id, 'file.url': { $exists: true, $ne: null } });
    const stage = normalizeStage(student.journeyStage);
    const info = publicStages().find((x) => x.key === stage);
    return res.json({
      student: {
        ...student,
        journeyStage: stage,
        stageLabel: info?.label,
        phaseLabel: PHASES.find((p) => p.key === info?.phase)?.label,
        profileCompleted: Boolean(student.profileCompletedAt),
        documentsUploaded: docs,
      },
    });
  } catch (err) {
    console.error('Error looking up student by email:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/students/:id
 * One student's full profile, stage history and documents
 */
exports.getStudent = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await User.findOne({ _id: req.params.id, role: 'user' })
      .select(`${LIST_FIELDS} stageHistory targetExam targetScore shortlistProfile`)
      .populate({ path: 'referredBy', model: UnicoachMentor, select: 'name handle email avatarUrl' })
      .lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const documents = await StudentDocument.find({ student: student._id }).sort({ createdAt: -1 }).lean();
    return res.json({
      student: { ...student, journeyStage: normalizeStage(student.journeyStage), stageHistory: (student.stageHistory || []).map((h) => ({ ...h, stage: normalizeStage(h.stage) })) },
      documents: documents.map(publicDocument),
      stages: publicStages(),
      phases: PHASES,
    });
  } catch (err) {
    console.error('Error loading student:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/students/:id/stage  { stage, note?, notify? }
 * Moves the student along; emails them unless notify is false
 */
exports.updateStage = async (req, res) => {
  try {
    if (!isId(req.params.id) || !(await User.exists({ _id: req.params.id, role: 'user' }))) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const { stage, note, notify } = req.body || {};
    if (!STAGE_KEYS.includes(stage)) return res.status(400).json({ message: 'Choose a valid stage' });
    const user = await setStudentStage(req.params.id, stage, { by: actorName(req, 'Admin'), note, notify: notify !== false });
    return res.json({ success: true, journeyStage: user.journeyStage, stageUpdatedAt: user.stageUpdatedAt, stageHistory: user.stageHistory });
  } catch (err) {
    console.error('Error updating student stage:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/students/:id/mentor  { mentorId | null }
 * Sets (or clears) the mentor who referred the student, e.g. when they signed up without the link
 */
exports.updateMentor = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const { mentorId } = req.body || {};
    let update;
    if (mentorId) {
      if (!isId(mentorId) || !(await UnicoachMentor.exists({ _id: mentorId }))) return res.status(400).json({ message: 'Mentor not found' });
      update = { $set: { referredBy: mentorId, referredAt: new Date() } };
    } else {
      update = { $unset: { referredBy: 1, referredAt: 1 } };
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'user' }, update, { new: true })
      .select('referredBy referredAt')
      .populate({ path: 'referredBy', model: UnicoachMentor, select: 'name handle' }).lean();
    if (!user) return res.status(404).json({ message: 'Student not found' });
    return res.json({ success: true, referredBy: user.referredBy || null });
  } catch (err) {
    console.error('Error updating referring mentor:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/students/:id/documents/:docId/file?download=1
 * Short-lived link to open (or download) one document
 */
exports.openDocument = async (req, res) => {
  try {
    if (!isId(req.params.id) || !isId(req.params.docId)) return res.status(404).json({ message: 'Not found' });
    const doc = await StudentDocument.findOne({ _id: req.params.docId, student: req.params.id }).lean();
    if (!doc?.file?.url) return res.status(404).json({ message: 'Not found' });
    const url = req.query.download === '1'
      ? await getAccessUrl(doc.file.url, { expiresInSeconds: 300, attachment: true })
      : await fileAccessUrl(doc);
    return res.json({ url, name: doc.file.name });
  } catch (err) {
    console.error('Error opening student document:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const zipName = (s) => String(s || 'Student').normalize('NFKD').replace(/[^\w\s-]/g, ' ').trim().replace(/\s+/g, '_').slice(0, 60) || 'Student';

/**
 * GET /api/admin/students/:id/documents.zip
 * Every uploaded document of the student in one ZIP, using the readable file names
 */
exports.downloadAllDocuments = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
    const student = await User.findOne({ _id: req.params.id, role: 'user' }).select('name').lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const docs = await StudentDocument.find({ student: student._id, 'file.url': { $exists: true, $ne: null } }).sort({ createdAt: 1 }).lean();
    if (!docs.length) return res.status(404).json({ message: 'No uploaded documents yet' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName(student.name)}_Documents.zip"`);
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('warning', (e) => console.warn('[Docs zip]', e.message));
    archive.on('error', (e) => { console.error('[Docs zip] failed:', e.message); res.destroy(e); });
    archive.pipe(res);

    const used = new Set();
    for (const doc of docs) {
      try {
        const url = await fileAccessUrl(doc);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const buf = Buffer.from(await resp.arrayBuffer());
        let name = doc.file.name || `${zipName(doc.title)}`;
        for (let i = 2; used.has(name.toLowerCase()); i += 1) name = name.replace(/(\.[^.]*)?$/, `_${i}$1`);
        used.add(name.toLowerCase());
        archive.append(buf, { name });
      } catch (e) {
        archive.append(`Could not download "${doc.title}": ${e.message}\n`, { name: `MISSING_${zipName(doc.title)}.txt` });
      }
    }
    await archive.finalize();
  } catch (err) {
    console.error('Error zipping student documents:', err);
    if (!res.headersSent) return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/students/mentors  — mentors list for filters (id, name, handle)
 */
exports.listMentorsForFilter = async (req, res) => {
  try {
    const mentors = await UnicoachMentor.find({ applicationStatus: 'APPROVED' }).select('name handle').sort({ name: 1 }).lean();
    return res.json({ mentors });
  } catch (err) {
    console.error('Error listing mentors:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
