// Shared pieces of the student file (chat + documents) used by both the student and admin routes.
const path = require('path');
const multer = require('multer');
const { unicoachUploadDir } = require('../unicoach/services/uploadService');
const { storeUpload, getAccessUrl } = require('../unicoach/services/fileStorageService');
const StudentConversation = require('../models/StudentConversation');
const StudentMessage = require('../models/StudentMessage');
const Lead = require('../models/Lead');
const User = require('../models/User');

const MAX_FILE_MB = 5;
const ALLOWED = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Temp file on disk, then moved to private Cloudinary storage
const uploadStudentFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, unicoachUploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `doc_${Date.now()}_${require('crypto').randomBytes(16).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED[ext]) return cb(null, true);
    const err = new Error('Only PDF, JPG, PNG or WebP files can be uploaded');
    err.statusCode = 400;
    return cb(err);
  },
}).single('file');

// Wrap multer so size/type errors come back as a clean 400 instead of a crash
const handleUpload = (req, res, next) =>
  uploadStudentFile(req, res, (err) => {
    if (!err) return next();
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(400).json({ message: tooBig ? `File is too large. Max ${MAX_FILE_MB} MB.` : err.message || 'Upload failed' });
  });

// Standard document types students pick before sending a file, so every file arrives with a proper name
const DOC_TYPES = [
  'Passport', '10th Marksheet', '12th Marksheet', 'Degree Certificate', 'Transcripts', 'IELTS Scorecard',
  'PTE Scorecard', 'TOEFL Scorecard', 'GRE / GMAT Scorecard', 'SOP', 'LOR', 'CV / Resume', 'Bank Statement',
  'Offer Letter', 'Visa Document', 'Photo', 'Other',
];

// "Rahul Sharma" + "IELTS Scorecard" -> "Rahul_Sharma_IELTS_Scorecard"
const safePart = (v) => String(v || '').normalize('NFKD').replace(/[^\w\s-]/g, ' ').trim().replace(/\s+/g, '_').slice(0, 60);
const documentFileName = (studentName, docTitle, ext) => `${[safePart(studentName), safePart(docTitle)].filter(Boolean).join('_') || 'Document'}${ext}`;

// The document title for a chat upload: a known type, or "Other" with the student's own short name
const resolveDocTitle = (docType, docName) => {
  const type = DOC_TYPES.find((t) => t.toLowerCase() === String(docType || '').trim().toLowerCase());
  if (!type) return null;
  if (type !== 'Other') return type;
  const own = String(docName || '').trim().slice(0, 60);
  return own || null;
};

// Stores the upload privately under a clean, readable name (also used when it's downloaded)
const storeStudentFile = async (file, { studentName = '', docTitle = '' } = {}) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const niceName = docTitle ? documentFileName(studentName, docTitle, ext) : String(file.originalname || 'file').slice(0, 120);
  // Cloudinary keeps the temp file's name (plus a random suffix), so give it the readable one first
  const renamedPath = path.join(path.dirname(file.path), `${path.basename(niceName, ext)}${ext}`);
  try {
    require('fs').renameSync(file.path, renamedPath);
    file.path = renamedPath;
  } catch {
    /* keep the original temp name */
  }
  const stored = await storeUpload(file, { visibility: 'private', folder: 'unicoach/student-docs' });
  return {
    url: stored.url,
    name: niceName,
    size: file.size,
    mime: ALLOWED[path.extname(file.originalname).toLowerCase()] || file.mimetype,
  };
};

// Signed link that opens the file for 5 minutes
const fileAccessUrl = (doc) => getAccessUrl(doc.file?.url, { expiresInSeconds: 300 });

// A student's conversation; created on first use, picking up the counselor from their lead (same email)
const getOrCreateConversation = async (studentId) => {
  let convo = await StudentConversation.findOne({ student: studentId });
  if (convo) return convo;
  const user = await User.findById(studentId).select('email').lean();
  const lead = user?.email ? await Lead.findOne({ email: user.email.toLowerCase() }).select('assignedTo').lean() : null;
  try {
    convo = await StudentConversation.create({ student: studentId, assignedTo: lead?.assignedTo || 'Unassigned' });
  } catch (err) {
    if (err.code !== 11000) throw err;
    convo = await StudentConversation.findOne({ student: studentId }); // created by a parallel request
  }
  return convo;
};

// Save a message and bump the other side's unread count
const postMessage = async (convo, { senderType, senderName, kind = 'text', text = '', document, requestTitles }) => {
  const msg = await StudentMessage.create({ conversation: convo._id, senderType, senderName, kind, text, document, requestTitles });
  const preview = kind === 'request' ? `Requested: ${requestTitles.join(', ')}` : kind === 'file' ? `📎 ${text || 'File'}` : text;
  await StudentConversation.updateOne(
    { _id: convo._id },
    {
      $set: { lastMessageAt: msg.createdAt, lastMessagePreview: preview.slice(0, 140) },
      $inc: senderType === 'student' ? { unreadForStaff: 1 } : { unreadForStudent: 1 },
    }
  );
  return msg;
};

const publicDocument = (d) => ({
  _id: d._id,
  title: d.title,
  status: d.status,
  from: d.from,
  note: d.note,
  file: d.file?.url ? { name: d.file.name, size: d.file.size, mime: d.file.mime } : null,
  uploadedAt: d.uploadedAt,
  reviewedAt: d.reviewedAt,
  createdAt: d.createdAt,
});

const loadMessages = (convoId) =>
  StudentMessage.find({ conversation: convoId })
    .sort({ createdAt: -1 })
    .limit(300)
    .populate('document')
    .lean()
    .then((rows) => rows.reverse().map((m) => ({ ...m, document: m.document ? publicDocument(m.document) : null })));

const cleanText = (v) => (typeof v === 'string' ? v.trim().slice(0, 4000) : '');

module.exports = {
  DOC_TYPES,
  resolveDocTitle,
  handleUpload,
  storeStudentFile,
  fileAccessUrl,
  getOrCreateConversation,
  postMessage,
  publicDocument,
  loadMessages,
  cleanText,
};
