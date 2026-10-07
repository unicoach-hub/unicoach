const mongoose = require('mongoose');
const SupportRequest = require('../models/SupportRequest');
const Event = require('../models/Event');
const { sendEmail } = require('../utils/email');
const { callLLM, cleanJsonResponse } = require('../utils/aiService');
const { escapeHtml, plainTextToHtml } = require('../utils/escapeHtml');

// ?eventId=<id> filter shared by the list and the CSV export ('' / 'all' = no filter)
function readEventIdFilter(raw) {
  if (raw === undefined || raw === null || raw === '' || raw === 'All' || raw === 'all') return {};
  if (typeof raw !== 'string' || !mongoose.Types.ObjectId.isValid(raw)) return { error: 'Invalid eventId' };
  return { eventId: raw };
}

// ?category= matches like the admin category tabs: case-insensitive "contains", so the 'Other' tab
// also finds 'Other Inquiry' ('' / 'all' / a non-string value = no filter)
function readCategoryFilter(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw === 'All' || raw === 'all') return null;
  return new RegExp(raw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

// Registrations per event for the admin Event filter, newest event first
function countByEvent(docs) {
  const byEvent = new Map();
  docs.forEach((doc) => {
    if (!doc.eventId) return;
    const key = String(doc.eventId);
    const entry = byEvent.get(key) || { eventId: key, eventTitle: '', eventStart: null, count: 0 };
    entry.count += 1;
    if (!entry.eventTitle && doc.eventTitle) entry.eventTitle = doc.eventTitle;
    if (!entry.eventStart && doc.eventStart) entry.eventStart = doc.eventStart;
    byEvent.set(key, entry);
  });
  const time = (d) => (d ? new Date(d).getTime() : 0);
  return [...byEvent.values()].sort((a, b) => time(b.eventStart) - time(a.eventStart));
}

// Quoted CSV cell. Text starting with = + - @ would run as a formula in Excel/Sheets, so it gets a
// leading apostrophe; a plain phone number such as +91 98765 43210 is left as is.
function csvCell(value) {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !/^\+?[\d\s()-]+$/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

// "2026-10-05 18:30" in India time (sortable in a spreadsheet)
function toIstDateTime(date) {
  const time = date ? new Date(date).getTime() : NaN;
  if (Number.isNaN(time)) return '';
  return new Date(time + 330 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
}

/**
 * POST /api/support-requests/test-smtp  (kept path; now a Resend delivery test)
 * Sends a test email to the counsellor's own address, the same way student replies are sent.
 */
exports.testSmtp = async (req, res) => {
  try {
    const user = typeof req.body.user === 'string' ? req.body.user.trim() : '';
    const name = typeof req.body.name === 'string' && req.body.name.trim() ? req.body.name.trim().slice(0, 60) : 'UniCoach Advisory';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) {
      return res.status(400).json({ error: 'Enter a valid email address to receive the test email.' });
    }

    const result = await sendEmail({
      to: user,
      from: `"${name.replace(/["<>]/g, '')}" <${user}>`,
      subject: 'UniCoach test email: delivery works',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e6e4dd; border-radius: 12px; max-width: 500px; color: #18181b;">
          <h2 style="margin: 0 0 10px 0; font-size: 18px;">Email delivery is working</h2>
          <p>This test was sent through Resend from the verified UniCoach domain, exactly like your replies to students.</p>
          <p>Hit <strong>Reply</strong> on this email: the reply should land in ${escapeHtml(user)}.</p>
          <p style="color: #96958e; font-size: 12px; margin-top: 20px;">Sent from the UniCoach admin panel</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: result?.simulated
        ? 'Resend is not configured on this server, so the email was only simulated.'
        : `Test email sent to ${user} through Resend. Check your inbox.`,
    });
  } catch (err) {
    console.error('Email test error:', err.message);
    return res.status(500).json({ error: `Could not send: ${err.message}` });
  }
};

/**
 * POST /api/support-requests
 */
exports.createSupportRequest = async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    const newRequest = new SupportRequest({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      category: category ? category.trim() : 'General Inquiry',
      message: message ? message.trim() : '',
      status: 'New',
    });

    const saved = await newRequest.save();

    try {
      await sendEmail({
        to: saved.email,
        subject: `We have received your request regarding ${saved.category} — UniCoach`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4f46e5; margin: 0;">UniCoach Overseas Education</h2>
              <p style="color: #64748b; font-size: 14px;">Priority Support &amp; Admission Counseling</p>
            </div>
            <p>Hi <strong>${escapeHtml(saved.name)}</strong>,</p>
            <p>Thank you for reaching out to us. We have received your priority inquiry regarding <strong>${escapeHtml(saved.category)}</strong>.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px; margin: 18px 0; border-radius: 8px;">
              <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Your Message:</strong></p>
              <p style="margin: 6px 0 0 0; font-size: 14px; font-style: italic; color: #0f172a;">${saved.message ? plainTextToHtml(saved.message) : 'No additional details provided.'}</p>
            </div>
            <p>Our senior counselor will review your situation and get back to you with personalized guidance and next steps shortly.</p>
            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">Best regards,<br/><strong>UniCoach Advisory Team</strong></p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('Auto-acknowledgement email error:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      data: saved,
      message: 'Priority DM submitted successfully. Our team will contact you shortly.',
    });
  } catch (err) {
    console.error('Error submitting support request:', err);
    return res.status(500).json({ error: 'Server error while submitting request.' });
  }
};

/**
 * GET /api/support-requests
 */
exports.getAllSupportRequests = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      isBooked,
      from,
      to,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    const categoryMatch = readCategoryFilter(category);
    if (categoryMatch) query.category = categoryMatch;

    if (status && status !== 'All' && status !== 'all') {
      query.status = status;
    }

    const eventFilter = readEventIdFilter(req.query.eventId);
    if (eventFilter.error) {
      return res.status(400).json({ error: eventFilter.error });
    }
    if (eventFilter.eventId) query.eventId = eventFilter.eventId;

    if (isBooked !== undefined && isBooked !== '') {
      query.isBooked = isBooked === 'true' || isBooked === true;
    }

    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { message: searchRegex },
        { category: searchRegex },
        { eventTitle: searchRegex },
      ];
    }

    if (from || to) {
      query.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [requests, totalCount] = await Promise.all([
      SupportRequest.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      SupportRequest.countDocuments(query),
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [allDocs, newCount, bookedCount, notBookedCount, todaySentCount, todayNewCount] = await Promise.all([
      SupportRequest.find({}, 'category status isBooked replies createdAt eventId eventTitle eventStart'),
      SupportRequest.countDocuments({ status: 'New' }),
      SupportRequest.countDocuments({ isBooked: true }),
      SupportRequest.countDocuments({ isBooked: false }),
      SupportRequest.countDocuments({ 'replies.sentAt': { $gte: startOfToday } }),
      SupportRequest.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    const categoryCounts = {};
    allDocs.forEach((doc) => {
      const cat = doc.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const eventCounts = countByEvent(allDocs);

    return res.json({
      success: true,
      requests,
      eventCounts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      stats: {
        totalAll: allDocs.length,
        newCount,
        bookedCount,
        notBookedCount,
        todaySentCount,
        todayNewCount,
        categoryCounts,
        eventCounts,
      },
    });
  } catch (err) {
    console.error('Error fetching support requests:', err);
    return res.status(500).json({ error: 'Server error while fetching requests.' });
  }
};

/**
 * PATCH /api/support-requests/:id/status
 */
exports.updateSupportRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, scheduledDate, isBooked, customStatusText } = req.body;

    const reqDoc = await SupportRequest.findById(id);
    if (!reqDoc) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    if (status) reqDoc.status = status;
    if (isBooked !== undefined) reqDoc.isBooked = Boolean(isBooked);
    if (scheduledDate) reqDoc.scheduledDate = new Date(scheduledDate);
    if (customStatusText !== undefined) reqDoc.customStatusText = customStatusText;

    if (note && note.trim()) {
      reqDoc.notes.push({
        note: note.trim(),
        date: new Date(),
        author: req.user?.name || 'Admin',
      });
    }

    const updated = await reqDoc.save();

    return res.json({
      success: true,
      data: updated,
      message: 'Status updated successfully.',
    });
  } catch (err) {
    console.error('Error updating support request status:', err);
    return res.status(500).json({ error: 'Server error while updating request.' });
  }
};

/**
 * POST /api/support-requests/:id/ai-reply
 */
exports.generateAiReply = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name: bodyName,
      email: bodyEmail,
      category: bodyCategory,
      message: bodyMessage,
      tone = 'Empathetic & Highly Informative',
      counselorName = 'Senior Study Abroad Advisor',
      senderEmail = 'support@unicoach.in',
    } = req.body;

    let studentName = bodyName || 'Student';
    let studentCategory = bodyCategory || 'Study Abroad & Visa Guidance';
    let studentMessage = bodyMessage || '';
    let reqDoc = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      reqDoc = await SupportRequest.findById(id);
      if (reqDoc) {
        studentName = reqDoc.name || studentName;
        studentCategory = reqDoc.category || studentCategory;
        studentMessage = reqDoc.message || studentMessage;
      }
    }

    const systemPrompt = `You are a world-class Senior International Admissions & Visa Immigration Counselor at UniCoach Overseas Education.
Your task is to draft an exceptional, highly specific, and actionable email response to a student who submitted a priority inquiry.

Counselor Name: ${counselorName}
Selected Tone: ${tone}

Student Inquiry Details:
- Student Name: ${studentName}
- Target Topic / Category: ${studentCategory}
- Inquiry Message: "${studentMessage}"

Crucial Counseling Instructions:
1. Greet the student warmly by name.
2. Directly answer their specific questions. If their message is written in Hindi/Hinglish, accurately interpret their study abroad goals and deliver an expert, easy-to-follow reply.
3. If they inquire about Canada: mention DLI colleges & universities, upcoming intakes, IELTS/PTE cutoffs, GIC living expense account (CAD $20,635), SDS category, and PGWP.
4. Output STRICTLY as a JSON object: {"subject": "...", "emailBody": "..."}`;

    let draftSubject = `Guidance on ${studentCategory} — UniCoach Senior Advisory`;
    let draftBody = '';

    try {
      const response = await callLLM(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Draft the tailored email for ${studentName} asking about "${studentCategory}". Inquiry: "${studentMessage}". Tone: ${tone}` }
        ],
        { jsonMode: true, temperature: 0.35, maxTokens: 2000 }
      );

      const cleaned = cleanJsonResponse(response.content);
      const parsed = JSON.parse(cleaned);
      draftSubject = parsed.subject || draftSubject;
      draftBody = parsed.emailBody || parsed.reply || response.content;
    } catch (llmErr) {
      console.warn('[Support Request AI] fallback:', llmErr.message);
      draftSubject = `Guidance on ${studentCategory} — UniCoach Senior Advisory`;
      draftBody = `Hi ${studentName},\n\nThank you for contacting UniCoach regarding "${studentCategory}".\n\nWe have reviewed your inquiry and our senior team is ready to guide you step-by-step through admissions, scholarships, and visa processing.\n\nBest regards,\n${counselorName}\nUniCoach Advisory Team`;
    }

    if (reqDoc) {
      reqDoc.aiDraftReply = draftBody;
      await reqDoc.save().catch(() => {});
    }

    return res.json({
      success: true,
      subject: draftSubject,
      emailBody: draftBody,
      message: 'AI response drafted successfully.',
    });
  } catch (err) {
    console.error('Error generating AI reply:', err);
    return res.status(500).json({ error: 'Failed to generate AI reply.', details: err.message });
  }
};

/**
 * POST /api/support-requests/:id/send-email
 */
exports.sendSupportEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      html,
      text,
      senderEmail,
      senderName,
      attachments,
      smtpConfig,
      studentEmail,
      studentName,
      category
    } = req.body;

    if (!subject || (!html && !text)) {
      return res.status(400).json({ error: 'Subject and email body are required.' });
    }

    let reqDoc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      reqDoc = await SupportRequest.findById(id);
    }

    const recipientEmail = (reqDoc && reqDoc.email) || studentEmail;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email address is required.' });
    }

    const formattedFrom = senderEmail
      ? `"${senderName || 'UniCoach Advisory'}" <${senderEmail}>`
      : undefined;

    // Prefer the plain-text body: escape it, then convert newlines, so student-provided
    // data (name, message, category) quoted in the reply can never inject HTML.
    const emailHtml = text ? plainTextToHtml(text) : (html || '');

    // 1. Immediately update database record so UI and CRM state reflect the sent email instantly
    if (reqDoc) {
      reqDoc.status = 'Email sent';
      reqDoc.replies.push({
        subject,
        content: emailHtml,
        sentAt: new Date(),
        sender: senderEmail ? `${senderName || 'Advisor'} (${senderEmail})` : (senderName || 'UniCoach Advisor'),
        method: 'email',
      });
      reqDoc.notes.push({
        note: `Sent email: "${subject}"`,
        date: new Date(),
        author: senderName || 'Admin',
      });
      await reqDoc.save();
    }

    // 2. Dispatch email asynchronously via pooled SMTP in background (fire-and-track)
    sendEmail({
      to: recipientEmail,
      from: formattedFrom,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${escapeHtml(subject)}</title>
          <style>
            body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body style="background-color: #f8fafc; padding: 32px 16px; margin: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.06);">
                  
                  <!-- Brand Header Bar -->
                  <tr>
                    <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="left">
                            <div style="font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                              UniCoach<span style="color: #4f46e5;">.</span>
                            </div>
                            <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.6px; text-transform: uppercase; margin-top: 2px;">
                              Admissions &amp; Visa Advisory
                            </div>
                          </td>
                          <td align="right">
                            <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                              ● Official Response
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content Area -->
                  <tr>
                    <td style="padding: 32px 32px 24px;">
                      <div style="font-size: 15px; line-height: 1.7; color: #1e293b;">
                        ${emailHtml}
                      </div>
                    </td>
                  </tr>

                  <!-- Trust & Contact Box -->
                  <tr>
                    <td style="padding: 0 32px 32px;">
                      <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 0 10px 10px 0; padding: 14px 18px; font-size: 13px; color: #475569; line-height: 1.6;">
                        💬 <strong>Have follow-up questions?</strong> Simply reply directly to this email and your assigned counselor will continue assisting you.
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f1f5f9; text-align: center;">
                      <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                        UniCoach Overseas Education • Building Global Careers
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                        &copy; ${new Date().getFullYear()} UniCoach Advisory Concierge • 🔒 Confidential Educational Guidance
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: text || html?.replace(/<[^>]*>/g, ''),
      attachments: attachments || [],
      smtpConfig: smtpConfig || null,
    })
      .then((mailResult) => {
        console.log(`✅ [Support Email] Dispatched to ${recipientEmail} (${mailResult?.messageId})`);
      })
      .catch(async (emailErr) => {
        console.error(`❌ [Support Email] Background dispatch error for ${recipientEmail}:`, emailErr.message);
        if (reqDoc && reqDoc._id) {
          await SupportRequest.findByIdAndUpdate(reqDoc._id, {
            $push: {
              notes: {
                note: `⚠️ Email delivery warning: ${emailErr.message}`,
                date: new Date(),
                author: 'System Delivery Agent',
              },
            },
          }).catch(() => {});
        }
      });

    // 3. Immediately return success response to client (<100ms)
    return res.json({
      success: true,
      message: `Email successfully dispatched to ${recipientEmail}`,
      data: reqDoc,
    });
  } catch (err) {
    console.error('Error sending email to student:', err);
    return res.status(500).json({ error: 'Failed to dispatch email.', details: err.message });
  }
};

/**
 * DELETE /api/support-requests/:id
 */
exports.deleteSupportRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SupportRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    // An event registration also leaves the event's list, so the count matches Requests and the
    // student can register again (the filter on the email keeps the count from dropping twice)
    if (deleted.eventId && deleted.email) {
      try {
        await Event.updateOne(
          { _id: deleted.eventId, 'attendees.email': deleted.email },
          { $pull: { attendees: { email: deleted.email } }, $inc: { registrationCount: -1 } }
        );
      } catch (seatErr) {
        console.warn('Deleted request, but could not release the event seat:', seatErr.message);
      }
    }
    return res.json({ success: true, message: 'Request deleted successfully.' });
  } catch (err) {
    console.error('Error deleting support request:', err);
    return res.status(500).json({ error: 'Server error while deleting request.' });
  }
};

/**
 * GET /api/support-requests/export/csv
 */
exports.exportSupportRequestsCsv = async (req, res) => {
  try {
    const { category, status, from, to } = req.query;
    const query = {};

    const categoryMatch = readCategoryFilter(category);
    if (categoryMatch) query.category = categoryMatch;
    if (status && status !== 'All' && status !== 'all') query.status = status;
    const eventFilter = readEventIdFilter(req.query.eventId);
    if (eventFilter.error) {
      return res.status(400).json({ error: eventFilter.error });
    }
    if (eventFilter.eventId) query.eventId = eventFilter.eventId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const docs = await SupportRequest.find(query).sort({ createdAt: -1 });

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Category', 'Status', 'IsBooked', 'Event', 'Event Date (IST)', 'Intake', 'Message', 'Created At'];
    const rows = docs.map((d) => [
      d._id,
      csvCell(d.name),
      csvCell(d.email),
      csvCell(d.phone),
      csvCell(d.category),
      csvCell(d.status),
      d.isBooked ? 'Yes' : 'No',
      csvCell(d.eventTitle),
      csvCell(toIstDateTime(d.eventStart)),
      csvCell(d.intake),
      csvCell(d.message),
      d.createdAt ? d.createdAt.toISOString() : '',
    ]);

    // BOM so Excel opens Hindi/accented names as UTF-8
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=support_requests_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return res.status(500).json({ error: 'Server error during export.' });
  }
};
