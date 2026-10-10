const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const StudentConversation = require('../models/StudentConversation');
const StudentDocument = require('../models/StudentDocument');
const StudentMessage = require('../models/StudentMessage');
const {
  storeStudentFile, fileAccessUrl, getOrCreateConversation, postMessage, publicDocument, loadMessages, cleanText,
  DOC_TYPES, resolveDocTitle,
} = require('../services/studentFile');

// The counselor shown to the student: name and photo only
const counselorFor = async (convo) => {
  if (!mongoose.Types.ObjectId.isValid(convo.assignedTo)) return null;
  const staff = await Staff.findById(convo.assignedTo).select('name avatar title').lean();
  return staff ? { name: staff.name, avatar: staff.avatar || '', title: staff.title || 'Counselor' } : null;
};

/**
 * GET /api/student-chat
 * The signed-in student's chat, documents and counselor. Opening it marks their messages read.
 */
exports.getMyFile = async (req, res) => {
  try {
    const convo = await getOrCreateConversation(req.user.id);
    const [messages, documents, counselor] = await Promise.all([
      loadMessages(convo._id),
      StudentDocument.find({ student: req.user.id }).sort({ createdAt: -1 }).lean(),
      counselorFor(convo),
    ]);
    if (convo.unreadForStudent) await StudentConversation.updateOne({ _id: convo._id }, { $set: { unreadForStudent: 0 } });
    return res.json({ messages, documents: documents.map(publicDocument), counselor, docTypes: DOC_TYPES });
  } catch (err) {
    console.error('Error loading student file:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/student-chat/unread
 */
exports.getUnread = async (req, res) => {
  try {
    const convo = await StudentConversation.findOne({ student: req.user.id }).select('unreadForStudent').lean();
    const unread = convo?.unreadForStudent || 0;
    if (!unread) return res.json({ unread: 0 });
    // Latest message from the counselor, for the notification preview
    const last = await StudentMessage.findOne({ conversation: convo._id, senderType: 'staff' })
      .sort({ createdAt: -1 }).select('senderName kind text requestTitles createdAt').lean();
    const preview = !last ? '' : last.kind === 'request'
      ? `Please upload: ${(last.requestTitles || []).join(', ')}`
      : last.kind === 'file' ? `Sent a file: ${last.text || 'document'}` : last.text;
    return res.json({ unread, last: last ? { from: last.senderName || 'Your counselor', text: preview.slice(0, 140), at: last.createdAt } : null });
  } catch (err) {
    console.error('Error loading unread count:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/student-chat/messages  (multipart: text, file?, documentId?)
 * documentId = which requested document this file answers
 */
exports.sendMessage = async (req, res) => {
  try {
    const text = cleanText(req.body.text);
    if (!text && !req.file) return res.status(400).json({ message: 'Write a message or attach a file' });

    const user = await User.findById(req.user.id).select('name').lean();
    const convo = await getOrCreateConversation(req.user.id);
    let document;

    if (req.file) {
      const docId = req.body.documentId;
      if (docId && mongoose.Types.ObjectId.isValid(docId)) {
        // Answering a request: only the student's own, and not one already approved
        document = await StudentDocument.findOne({ _id: docId, student: req.user.id, status: { $ne: 'approved' } });
        if (!document) return res.status(404).json({ message: 'That document request was not found' });
      } else {
        // A file sent in chat must say what it is, so it gets a proper name
        const title = resolveDocTitle(req.body.docType, req.body.docName);
        if (!title) return res.status(400).json({ message: 'Choose what this document is (e.g. Passport) before sending' });
        document = new StudentDocument({ student: req.user.id, title, from: 'student' });
      }
      const file = await storeStudentFile(req.file, { studentName: user?.name, docTitle: document.title });
      Object.assign(document, { file, status: 'uploaded', note: '', uploadedAt: new Date() });
      await document.save();
    }

    const msg = await postMessage(convo, {
      senderType: 'student',
      senderName: user?.name || 'Student',
      kind: document ? 'file' : 'text',
      text: text || (document ? document.title : ''),
      document: document?._id,
    });
    return res.status(201).json({ message: { ...msg.toObject(), document: document ? publicDocument(document) : null } });
  } catch (err) {
    console.error('Error sending student message:', err);
    return res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Could not send the message' });
  }
};

/**
 * GET /api/student-chat/documents/:id/file
 * Short-lived link to one of the student's own files
 */
exports.openDocument = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Not found' });
    const doc = await StudentDocument.findOne({ _id: req.params.id, student: req.user.id }).lean();
    if (!doc?.file?.url) return res.status(404).json({ message: 'Not found' });
    return res.json({ url: await fileAccessUrl(doc) });
  } catch (err) {
    console.error('Error opening student document:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
