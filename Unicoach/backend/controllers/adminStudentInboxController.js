const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const StudentConversation = require('../models/StudentConversation');
const StudentDocument = require('../models/StudentDocument');
const { scopedStaffId, actorName } = require('../utils/leadAccess');
const escapeRegex = require('../utils/escapeRegex');
const {
  storeStudentFile, fileAccessUrl, getOrCreateConversation, postMessage, publicDocument, loadMessages, cleanText,
  DOC_TYPES, resolveDocTitle,
} = require('../services/studentFile');

const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));
const notFound = (res) => res.status(404).json({ message: 'Student not found' });

// Staff limited to their own students only reach conversations assigned to them
const canAccess = (req, convo) => {
  const own = scopedStaffId(req);
  return !own || (convo && String(convo.assignedTo) === own);
};

/**
 * GET /api/admin/student-inbox
 * Conversations, newest activity first (scoped staff: only theirs)
 */
exports.listConversations = async (req, res) => {
  try {
    const own = scopedStaffId(req);
    const convos = await StudentConversation.find(own ? { assignedTo: own } : {})
      .sort({ lastMessageAt: -1 })
      .limit(300)
      .populate('student', 'name email phone avatar')
      .lean();
    const staffIds = [...new Set(convos.map((c) => c.assignedTo).filter(isId))];
    const staff = await Staff.find({ _id: { $in: staffIds } }).select('name').lean();
    const names = Object.fromEntries(staff.map((s) => [String(s._id), s.name]));
    return res.json(convos.filter((c) => c.student).map((c) => ({
      _id: c._id,
      student: c.student,
      assignedTo: c.assignedTo,
      assignedName: names[c.assignedTo] || (c.assignedTo === 'Unassigned' ? 'Unassigned' : c.assignedTo),
      lastMessageAt: c.lastMessageAt,
      lastMessagePreview: c.lastMessagePreview,
      unread: c.unreadForStaff,
    })));
  } catch (err) {
    console.error('Error listing conversations:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/student-inbox/unread
 * For the sidebar badge: students with unread messages, and uploaded documents waiting for review
 */
exports.getUnread = async (req, res) => {
  try {
    const own = scopedStaffId(req);
    const convos = await StudentConversation.find(own ? { assignedTo: own } : {}).select('student unreadForStaff').lean();
    const students = convos.map((c) => c.student);
    const [docsToReview] = await Promise.all([
      StudentDocument.countDocuments({ student: { $in: students }, status: 'uploaded', from: 'student' }),
    ]);
    return res.json({
      conversations: convos.filter((c) => c.unreadForStaff > 0).length,
      messages: convos.reduce((n, c) => n + (c.unreadForStaff || 0), 0),
      docsToReview,
    });
  } catch (err) {
    console.error('Error counting unread inbox:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/student-inbox/students?q=
 * Find a registered student to start a chat with (not for staff limited to their own students)
 */
exports.searchStudents = async (req, res) => {
  try {
    if (scopedStaffId(req)) return res.json([]);
    const q = String(req.query.q || '').trim().slice(0, 80);
    if (q.length < 2) return res.json([]);
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ role: 'user', $or: [{ name: re }, { email: re }, { phone: re }] })
      .select('name email phone')
      .limit(15)
      .lean();
    return res.json(users);
  } catch (err) {
    console.error('Error searching students:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/student-inbox/:studentId
 * The student file: profile, chat and documents. Opening it marks the student's messages read.
 */
exports.getStudentFile = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isId(studentId)) return notFound(res);
    const student = await User.findOne({ _id: studentId, role: 'user' })
      .select('name email phone currentCity dreamCountry dreamCourse preferredIntake highestEducation createdAt')
      .lean();
    if (!student) return notFound(res);

    let convo = await StudentConversation.findOne({ student: studentId });
    if (!convo) {
      if (scopedStaffId(req)) return notFound(res);
      convo = await getOrCreateConversation(studentId);
    }
    if (!canAccess(req, convo)) return notFound(res);

    const [messages, documents] = await Promise.all([
      loadMessages(convo._id),
      StudentDocument.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
    ]);
    if (convo.unreadForStaff) await StudentConversation.updateOne({ _id: convo._id }, { $set: { unreadForStaff: 0 } });
    return res.json({
      docTypes: DOC_TYPES,
      student,
      conversation: { _id: convo._id, assignedTo: convo.assignedTo },
      messages,
      documents: documents.map(publicDocument),
    });
  } catch (err) {
    console.error('Error loading student file:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Conversation for a write action, or null when this account can't reach it
const writableConversation = async (req) => {
  const { studentId } = req.params;
  if (!isId(studentId) || !(await User.exists({ _id: studentId, role: 'user' }))) return null;
  const existing = await StudentConversation.findOne({ student: studentId });
  if (!existing && scopedStaffId(req)) return null;
  const convo = existing || (await getOrCreateConversation(studentId));
  return canAccess(req, convo) ? convo : null;
};

/**
 * POST /api/admin/student-inbox/:studentId/messages  (multipart: text, file?)
 * A file sent by staff (e.g. an offer letter) is added to the student's documents as approved
 */
exports.sendMessage = async (req, res) => {
  try {
    const convo = await writableConversation(req);
    if (!convo) return notFound(res);
    const text = cleanText(req.body.text);
    if (!text && !req.file) return res.status(400).json({ message: 'Write a message or attach a file' });

    let document;
    if (req.file) {
      // Optional type (e.g. "Offer Letter") gives the file a proper name: Student_Name_Offer_Letter.pdf
      const docTitle = resolveDocTitle(req.body.docType, req.body.docName);
      const student = await User.findById(convo.student).select('name').lean();
      const file = await storeStudentFile(req.file, { studentName: student?.name, docTitle: docTitle || '' });
      document = await StudentDocument.create({
        student: convo.student,
        title: docTitle || file.name,
        from: 'staff',
        status: 'approved',
        file,
        uploadedAt: new Date(),
        requestedBy: actorName(req),
      });
    }
    const msg = await postMessage(convo, {
      senderType: 'staff',
      senderName: actorName(req, 'UniCoach'),
      kind: document ? 'file' : 'text',
      text: text || (document ? document.title : ''),
      document: document?._id,
    });
    return res.status(201).json({ message: { ...msg.toObject(), document: document ? publicDocument(document) : null } });
  } catch (err) {
    console.error('Error sending staff message:', err);
    return res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Could not send the message' });
  }
};

/**
 * POST /api/admin/student-inbox/:studentId/requests  { titles: ["Passport", "IELTS scorecard"] }
 * Adds the documents to the student's checklist and posts the request in chat
 */
exports.requestDocuments = async (req, res) => {
  try {
    const convo = await writableConversation(req);
    if (!convo) return notFound(res);
    const titles = [...new Set((Array.isArray(req.body.titles) ? req.body.titles : [])
      .map((t) => (typeof t === 'string' ? t.trim().slice(0, 120) : ''))
      .filter(Boolean))].slice(0, 20);
    if (!titles.length) return res.status(400).json({ message: 'Add at least one document' });

    const by = actorName(req);
    const docs = await StudentDocument.insertMany(titles.map((title) => ({ student: convo.student, title, status: 'requested', requestedBy: by })));
    const msg = await postMessage(convo, {
      senderType: 'staff',
      senderName: actorName(req, 'UniCoach'),
      kind: 'request',
      text: cleanText(req.body.text),
      requestTitles: titles,
    });
    return res.status(201).json({ message: msg, documents: docs.map(publicDocument) });
  } catch (err) {
    console.error('Error requesting documents:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Document plus a check that this account can reach its student
const reachableDocument = async (req) => {
  if (!isId(req.params.docId)) return null;
  const doc = await StudentDocument.findById(req.params.docId);
  if (!doc) return null;
  const convo = await StudentConversation.findOne({ student: doc.student }).select('assignedTo').lean();
  return canAccess(req, convo) ? doc : null;
};

/**
 * PATCH /api/admin/student-inbox/documents/:docId  { status: 'approved' | 'reupload', note }
 */
exports.reviewDocument = async (req, res) => {
  try {
    const doc = await reachableDocument(req);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const { status } = req.body;
    if (!['approved', 'reupload'].includes(status)) return res.status(400).json({ message: 'Choose approve or re-upload' });
    if (!doc.file?.url) return res.status(400).json({ message: 'Nothing uploaded yet' });

    doc.status = status;
    doc.note = status === 'reupload' ? cleanText(req.body.note).slice(0, 500) : '';
    doc.reviewedBy = actorName(req);
    doc.reviewedAt = new Date();
    await doc.save();

    // Tell the student in chat when something needs to be uploaded again
    if (status === 'reupload') {
      const convo = await StudentConversation.findOne({ student: doc.student });
      if (convo) {
        await postMessage(convo, {
          senderType: 'staff',
          senderName: actorName(req, 'UniCoach'),
          kind: 'text',
          text: `Please upload "${doc.title}" again${doc.note ? `: ${doc.note}` : '.'}`,
        });
      }
    }
    return res.json(publicDocument(doc));
  } catch (err) {
    console.error('Error reviewing document:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/student-inbox/documents/:docId/file
 */
exports.openDocument = async (req, res) => {
  try {
    const doc = await reachableDocument(req);
    if (!doc?.file?.url) return res.status(404).json({ message: 'Not found' });
    return res.json({ url: await fileAccessUrl(doc) });
  } catch (err) {
    console.error('Error opening document:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/student-inbox/:studentId/assign  { assignedTo: staffId | 'Unassigned' }
 */
exports.assignCounselor = async (req, res) => {
  try {
    if (scopedStaffId(req)) return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only a manager or the admin can reassign students' });
    const convo = await writableConversation(req);
    if (!convo) return notFound(res);
    const { assignedTo } = req.body;
    if (assignedTo !== 'Unassigned' && !(isId(assignedTo) && (await Staff.exists({ _id: assignedTo, active: true })))) {
      return res.status(400).json({ message: 'Choose an active staff member' });
    }
    convo.assignedTo = assignedTo;
    await convo.save();
    return res.json({ assignedTo });
  } catch (err) {
    console.error('Error assigning counselor:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
