const CustomForm = require('../models/CustomForm');
const FormSubmission = require('../models/FormSubmission');
const Lead = require('../models/Lead');
const { normalizePhone } = require('../utils/twilio');
const { findLeadsByContact, linkLeadToDuplicates } = require('../utils/leadMatching');
const { readAttribution } = require('../utils/attribution');
const { sendMetaEvent } = require('../services/metaConversions');

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
      referrer = await UnicoachMentor.findOne({ handle: refHandle }).select('_id handle').lean();
    }

    const formLabel = form.headerTitle || form.name || form.slug || 'Custom form';
    const formSource = `Form: ${formLabel}`;
    const mentorTag = referrer ? `Mentor: ${referrer.handle}` : '';
    const formTags = [formSource];
    if (referrer) formTags.push(`mentor:${referrer.handle}`, mentorTag);

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

    return res.status(201).json({
      success: true,
      message: form.successMessage || 'Thank you! Your response has been recorded.'
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
