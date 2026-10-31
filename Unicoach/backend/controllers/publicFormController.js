const CustomForm = require('../models/CustomForm');
const FormSubmission = require('../models/FormSubmission');
const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { findLeadsByContact, linkLeadToDuplicates } = require('../utils/leadMatching');
const { readAttribution } = require('../utils/attribution');
const { sendMetaEvent } = require('../services/metaConversions');
const { startLeadCall } = require('../services/bolnaCalls');
const { sendEmail } = require('../utils/email');
const { escapeHtml } = require('../utils/escapeHtml');

const SITE = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');
const emailShell = (body) => `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://www.unicoach.com/logo-black.png" alt="UniCoach" width="150" style="display:inline-block;width:150px;max-width:150px;height:auto;border:0" />
    </div>
    ${body}
    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
      Need help? Reach us at <a href="mailto:unicoachedu@gmail.com" style="color: #DE5C2B; text-decoration: none;">unicoachedu@gmail.com</a>.
    </p>
  </div>`;

// Form owner (mentor / influencer) hears about every new student, account or not. Never blocks the submit.
const sendOwnerLeadEmail = ({ to, formLabel, studentName, data, fields }) => {
  const rows = fields
    .filter((f) => f.type !== 'heading' && data[f.label] !== undefined && data[f.label] !== '')
    .map((f) => {
      const v = data[f.label];
      return `<tr><td style="padding: 6px 10px; color: #64748b; font-size: 13px; vertical-align: top;">${escapeHtml(f.label)}</td>
        <td style="padding: 6px 10px; color: #1e293b; font-size: 13px; font-weight: 600;">${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v))}</td></tr>`;
    }).join('');
  sendEmail({
    kind: 'mentors',
    to,
    subject: `Naya student aaya: ${studentName} (${formLabel})`,
    html: emailShell(`
      <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Aapke form se naya student aaya 🎉</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">Form: <strong>${escapeHtml(formLabel)}</strong></p>
      <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 12px;">${rows}</table>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
        Apne saare students ek jagah dekhne ke liye isi email (${escapeHtml(to)}) se Google login karke mentor dashboard kholo.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${SITE()}/unicoach/dashboard" style="background: #DE5C2B; color: #ffffff; font-weight: 700; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-size: 14px; display: inline-block;">Dashboard kholo →</a>
      </div>`)
  }).catch((e) => console.warn('Form owner email non-blocking failed:', e.message));
};

// Thank-you note to the student who filled the form. Never blocks the submit.
const sendStudentThanksEmail = ({ to, name, formLabel, successMessage }) => {
  sendEmail({
    kind: 'counselling',
    to,
    subject: `Thank you, ${name} — UniCoach ko aapki details mil gayi`,
    html: emailShell(`
      <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Thank you, ${escapeHtml(name)}! 🎓</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">${escapeHtml(successMessage)}</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Aapne <strong>${escapeHtml(formLabel)}</strong> bhara hai. Hamari team jaldi aapse contact karegi.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${SITE()}/universities" style="background: #DE5C2B; color: #ffffff; font-weight: 700; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-size: 14px; display: inline-block;">Universities dekho →</a>
      </div>`)
  }).catch((e) => console.warn('Form thank-you email non-blocking failed:', e.message));
};

/**
 * GET /api/forms/:slug
 * GET form by slug (PUBLIC)
 */
exports.getFormBySlug = async (req, res) => {
  try {
    const form = await CustomForm.findOne({ slug: req.params.slug, active: true });
    if (!form) return res.status(404).json({ message: 'Form not found or inactive' });

    return res.json({
      name: form.name,
      slug: form.slug,
      headerTitle: form.headerTitle,
      headerDescription: form.headerDescription,
      headerImage: form.headerImage || "",
      fields: form.fields,
      successMessage: form.successMessage
    });
  } catch (err) {
    console.error('Error fetching public form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/forms/:slug/submit
 * Submit form (PUBLIC)
 */
exports.submitForm = async (req, res) => {
  try {
    const form = await CustomForm.findOne({ slug: req.params.slug, active: true }).populate('pipeline');
    if (!form) return res.status(404).json({ message: 'Form not found or inactive' });

    const { data } = req.body;
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Form data is required' });
    }

    for (const field of form.fields) {
      if (field.type === 'heading') continue;
      const v = data[field.label];
      const empty = v === undefined || v === null || (Array.isArray(v) ? v.length === 0 : v.toString().trim() === '' || (field.type === 'consent' && v !== true && v !== 'Yes'));
      if (field.required && empty) {
        return res.status(400).json({ message: `"${field.label}" is required` });
      }
    }

    const pipeline = form.pipeline;
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
      return res.status(500).json({ message: 'Pipeline has no stages configured' });
    }

    const firstStage = pipeline.stages.sort((a, b) => a.order - b.order)[0].name;

    // A mentor's share link carries ?ref=<handle>; credit that mentor if the handle is real
    let referrer = null;
    const refHandle = String(req.body.ref || '').replace(/^@/, '').trim().toLowerCase();
    if (refHandle && /^[a-z0-9._-]{2,40}$/.test(refHandle)) {
      const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
      referrer = await UnicoachMentor.findOne({ handle: refHandle }).select('_id handle name').lean();
    }

    const formLabel = form.headerTitle || form.name || form.slug || 'Custom form';
    const formSource = `Form: ${formLabel}`;
    const mentorTag = referrer ? `Mentor: ${referrer.handle}` : '';
    const formTags = [formSource];
    if (referrer) formTags.push(`mentor:${referrer.handle}`, mentorTag);
    const ownerEmail = form.ownerEmail || '';
    if (ownerEmail) formTags.push(`owner:${ownerEmail}`);

    const contactValue = (fieldNames) => {
      const match = Object.entries(data).find(([key]) => fieldNames.some((name) => key.toLowerCase().includes(name.toLowerCase())));
      return match ? String(match[1]).trim() : '';
    };
    const name = contactValue(['name', 'full name', 'student name']) || 'New Lead';
    const email = contactValue(['email', 'e-mail']) || '';
    const phone = contactValue(['phone', 'mobile', 'whatsapp']) || '';
    const dreamCountry = contactValue(['dream country', 'country']) || 'Undecided';
    const preferredIntake = contactValue(['preferred intake', 'intake']) || '2026';
    const highestEducation = contactValue(['highest education', 'education', 'qualification']) || 'Not specified';
    const currentCity = contactValue(['current city', 'city']) || 'Not specified';

    const normalizedPhone = normalizePhone(phone);
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const matchingLeads = await findLeadsByContact(Lead, { phone: normalizedPhone, email: cleanEmail });
    const lead = new Lead({
      name,
      email: cleanEmail,
      phone: normalizedPhone,
      dreamCountry,
      preferredIntake,
      highestEducation,
      currentCity,
      source: formSource,
      latestSource: formSource,
      tags: formTags,
      autoTags: formTags,
      ...(referrer && {
        referralMentorId: referrer._id,
        referralMentorName: referrer.name,
        referralMentorHandle: referrer.handle
      }),
      verified: true,
      status: 'new',
      totalInquiries: 1,
      lastInquiryAt: new Date(),
      activities: [{
        type: 'note',
        comment: `${matchingLeads.length ? 'Repeat' : 'First'} form submission via ${formSource}${referrer ? ` by mentor @${referrer.handle}` : ''}`,
        date: new Date(),
        performedBy: 'System'
      }]
    });
    await linkLeadToDuplicates(Lead, lead, matchingLeads);
    await lead.save();

    const submission = new FormSubmission({
      form: form._id,
      pipeline: pipeline._id,
      currentStage: firstStage,
      data,
      referredBy: referrer?._id || null,
      referrerHandle: referrer?.handle || '',
      ownerEmail,
      tags: formTags,
      submittedAt: new Date()
    });
    await submission.save();

    form.submissionCount = (form.submissionCount || 0) + 1;
    await form.save();

    const attribution = readAttribution(req.body);
    const valueOf = (pattern) => Object.entries(data).find(([label]) => pattern.test(label))?.[1];
    sendMetaEvent({
      eventName: 'Lead',
      eventId: attribution?.eventId,
      user: { email: valueOf(/e-?mail/i), phone: valueOf(/phone|mobile|whatsapp/i), name: valueOf(/name/i) },
      req,
      attribution,
      customData: { content_name: form.name || form.slug }
    });
    startLeadCall(lead);
    if (ownerEmail) sendOwnerLeadEmail({ to: ownerEmail, formLabel, studentName: name, data, fields: form.fields });
    if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      sendStudentThanksEmail({ to: cleanEmail, name: name === 'New Lead' ? 'there' : name, formLabel, successMessage: form.successMessage || 'Thank you! Your response has been recorded.' });
    }

    return res.status(201).json({
      success: true,
      message: form.successMessage || 'Thank you! Your response has been recorded.'
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
