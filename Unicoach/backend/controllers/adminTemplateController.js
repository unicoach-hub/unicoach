const Template = require('../models/Template');

const seedDefaultTemplates = async () => {
  try {
    const count = await Template.countDocuments();
    if (count === 0) {
      await Template.insertMany([
        {
          name: 'Welcome & Profile Evaluation',
          type: 'email',
          subject: '🎓 Welcome to UniCoach, {name}! Your Study Abroad Evaluation is Ready',
          body: 'Hi {name},\n\nThank you for exploring universities for {dreamCountry} with UniCoach!\n\nOur senior admission advisors have reviewed your profile for {preferredIntake}. Based on your academic background in {highestEducation}, you are eligible for top-ranked universities and partial scholarships.\n\nSchedule your 1-on-1 counseling session here:\nhttps://unicoach.in/priority-dm\n\nBest Regards,\nUniCoach Admissions Team'
        },
        {
          name: 'Scholarship Deadline Alert',
          type: 'email',
          subject: '⏰ Urgent Scholarship Cutoff for {dreamCountry} - Fall 2026',
          body: 'Hello {name},\n\nThis is a priority alert regarding upcoming scholarship deadlines for {dreamCountry}.\n\nOver $15,000 in tuition waivers are currently closing their early-bird submission window. Ensure your SOP and academic transcripts are submitted before the cutoff.\n\nTrack live deadlines here:\nhttps://unicoach.in/scholarships\n\nWarm regards,\nUniCoach Scholarship Desk'
        },
        {
          name: 'Free Visa Mock Interview Invite',
          type: 'email',
          subject: '✈️ Prepare for your {dreamCountry} Visa Interview with AI & Experts',
          body: 'Dear {name},\n\nNavigating visa interviews can be challenging. UniCoach offers free mock visa interviews tailored to consular requirements.\n\nPractice now:\nhttps://unicoach.in/ai-tools/visa-prep\n\nSee you on the other side of your global journey!\nUniCoach Visa Advisory'
        }
      ]);
    }
  } catch (e) {
    console.warn('Could not seed default templates:', e.message);
  }
};

/**
 * GET /api/admin/templates
 * GET all templates
 */
exports.getAllTemplates = async (req, res) => {
  try {
    await seedDefaultTemplates();
    const templates = await Template.find().sort({ createdAt: -1 });
    return res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/templates
 * Create template
 */
exports.createTemplate = async (req, res) => {
  try {
    const { name, type, subject, body, wabaTemplateName, wabaLanguageCode, wabaParameters, metaCategory } = req.body;
    if (!name || !type || !body) {
      return res.status(400).json({ message: 'Name, type, and body are required.' });
    }

    const escapedName = String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Template.findOne({ name: { $regex: new RegExp(`^${escapedName}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ message: `A template named "${existing.name}" already exists. Edit it or choose a different name.` });
    }

    const template = new Template({ 
      name, 
      type, 
      subject, 
      body,
      wabaTemplateName: wabaTemplateName || '',
      wabaLanguageCode: wabaLanguageCode || 'en_US',
      wabaParameters: wabaParameters || '',
      ...(metaCategory ? { metaCategory } : {})
    });
    await template.save();
    return res.status(201).json(template);
  } catch (err) {
    console.error('Error creating template:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/templates/:id
 * Update template
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { name, type, subject, body, wabaTemplateName, wabaLanguageCode, wabaParameters, metaCategory } = req.body;
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (name && name !== template.name) {
      const existing = await Template.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: 'Template name already exists.' });
      }
      template.name = name;
    }

    if (type !== undefined) template.type = type;
    if (subject !== undefined) template.subject = subject;
    if (body !== undefined) template.body = body;
    if (wabaTemplateName !== undefined) template.wabaTemplateName = wabaTemplateName;
    if (wabaLanguageCode !== undefined) template.wabaLanguageCode = wabaLanguageCode;
    if (wabaParameters !== undefined) template.wabaParameters = wabaParameters;
    if (metaCategory !== undefined) template.metaCategory = metaCategory;

    await template.save();
    return res.json(template);
  } catch (err) {
    console.error('Error updating template:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/templates/:id/sync-meta
 * Sync template status with Meta WABA Cloud API
 */
exports.syncMeta = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Ask Meta for the real status of the template with this name
    const settings = await require('../models/Settings').findOne();
    if (!settings?.wabaAccessToken || !settings?.wabaAccountId) {
      return res.status(400).json({ message: 'WhatsApp is not connected. Connect it in Settings → WhatsApp Business.' });
    }
    if (!template.wabaTemplateName) {
      return res.status(400).json({ message: 'Add the Meta template name to this template first.' });
    }
    const r = await fetch(`https://graph.facebook.com/v20.0/${settings.wabaAccountId}/message_templates?name=${encodeURIComponent(template.wabaTemplateName)}&fields=name,status,language,rejected_reason`, {
      headers: { Authorization: `Bearer ${settings.wabaAccessToken}` },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ message: data?.error?.message || 'Could not reach Meta' });
    const match = (data.data || []).find((t) => t.name === template.wabaTemplateName && (!template.wabaLanguageCode || t.language === template.wabaLanguageCode)) || (data.data || [])[0];
    if (!match) {
      return res.status(404).json({ message: `No template named "${template.wabaTemplateName}" on your WhatsApp account. Create it in WhatsApp Manager first.` });
    }
    template.metaStatus = match.status;
    template.rejectionReason = match.status === 'REJECTED' ? (match.rejected_reason || '') : '';
    await template.save();

    return res.json({
      success: true,
      message: `Meta says: ${match.status}`,
      template
    });
  } catch (err) {
    console.error('Error syncing template with Meta:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/templates/:id
 * Delete template
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    return res.json({ success: true, message: 'Template deleted successfully!' });
  } catch (err) {
    console.error('Error deleting template:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


// ─── Submit a WhatsApp template to Meta for review ───
// The admin writes the message with {name}, {dreamCountry}… like other templates. Meta wants numbered
// variables ({{1}}, {{2}}) plus an example for each, so we convert on the way out and remember which
// field fills which number (wabaParameters) for sending later.
const SAMPLE_VALUES = {
  name: 'Rahul',
  email: 'rahul@example.com',
  phone: '9876543210',
  dreamCountry: 'Ireland',
  preferredIntake: 'September 2027',
  highestEducation: "Bachelor's",
  currentCity: 'Delhi',
  student_name: 'Rahul',
  student_email: 'rahul@example.com',
  student_phone: '9876543210',
  dream_country: 'Ireland',
  preferred_intake: 'September 2027',
  booking_date: '15 Aug 2026',
  slot_time: '11:30 AM',
};

const toMetaBody = (body) => {
  const keys = [];
  // Accepts both {{student_name}} and {name}
  const text = String(body).replace(/\{\{\s*(\w+)\s*\}\}|\{(\w+)\}/g, (_, doubleKey, singleKey) => {
    const key = doubleKey || singleKey;
    if (!keys.includes(key)) keys.push(key);
    return `{{${keys.indexOf(key) + 1}}}`;
  });
  return { text, keys };
};

const slugName = (name) => String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 500);

/**
 * POST /api/admin/templates/:id/submit-meta
 * Sends (or re-sends after an edit) a WhatsApp template to Meta. Status then comes back on the webhook.
 */
exports.submitMeta = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    if (template.type !== 'whatsapp') return res.status(400).json({ message: 'Only WhatsApp templates go to Meta.' });

    const settings = await require('../models/Settings').findOne();
    if (!settings?.wabaAccessToken || !settings?.wabaAccountId) {
      return res.status(400).json({ message: 'WhatsApp is not connected. Connect it in Settings → WhatsApp Business.' });
    }

    const { text, keys } = toMetaBody(template.body.trim());
    // Meta's own rules, checked here so the admin gets a clear message
    if (text.length > 1024) return res.status(400).json({ message: 'Message is too long for WhatsApp (1024 characters max).' });
    if (/^\{\{\d+\}\}/.test(text) || /\{\{\d+\}\}[.!?\s]*$/.test(text)) {
      return res.status(400).json({ message: 'WhatsApp does not allow a variable like {name} at the very start or end. Add some words before/after it.' });
    }
    if (/\{\{\d+\}\}\s*\{\{\d+\}\}/.test(text)) {
      return res.status(400).json({ message: 'Two variables cannot sit next to each other. Put words between them.' });
    }

    const metaName = template.wabaTemplateName || slugName(template.name);
    if (!/^[a-z0-9_]+$/.test(metaName)) {
      return res.status(400).json({ message: 'Meta template name may only use small letters, numbers and _ (e.g. event_reminder).' });
    }
    const language = template.wabaLanguageCode || 'en_US';
    const bodyComponent = {
      type: 'BODY',
      text,
      ...(keys.length ? { example: { body_text: [keys.map((k) => SAMPLE_VALUES[k] || k)] } } : {}),
    };

    const graph = async (path, payload) => {
      const r = await fetch(`https://graph.facebook.com/v20.0/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${settings.wabaAccessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error?.error_user_msg || data?.error?.message || `Meta API error ${r.status}`);
      return data;
    };

    let status = 'PENDING';
    if (template.metaTemplateId) {
      // Already on Meta: send the edited text for review again
      await graph(template.metaTemplateId, { category: template.metaCategory, components: [bodyComponent] });
    } else {
      const data = await graph(`${settings.wabaAccountId}/message_templates`, {
        name: metaName,
        language,
        category: template.metaCategory || 'UTILITY',
        components: [bodyComponent],
      });
      template.metaTemplateId = data.id;
      status = data.status || 'PENDING';
      if (data.category) template.metaCategory = data.category;
    }

    template.wabaTemplateName = metaName;
    template.wabaLanguageCode = language;
    template.wabaParameters = keys.join(',');
    template.metaStatus = status;
    template.rejectionReason = '';
    template.metaSubmittedAt = new Date();
    await template.save();

    return res.json({ success: true, message: status === 'APPROVED' ? 'Approved by Meta' : 'Sent to Meta for review. Status updates here on its own.', template });
  } catch (err) {
    console.error('Error submitting template to Meta:', err.message);
    return res.status(502).json({ message: `Meta did not accept it: ${err.message}` });
  }
};
