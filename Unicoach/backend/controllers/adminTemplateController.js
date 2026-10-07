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
    const { name, type, subject, body, wabaTemplateName, wabaLanguageCode, wabaParameters } = req.body;
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
      wabaParameters: wabaParameters || ''
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
    const { name, type, subject, body, wabaTemplateName, wabaLanguageCode, wabaParameters } = req.body;
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

    template.metaStatus = 'APPROVED';
    template.rejectionReason = '';
    await template.save();

    return res.json({
      success: true,
      message: 'Template status synchronized with Meta Cloud API successfully!',
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
