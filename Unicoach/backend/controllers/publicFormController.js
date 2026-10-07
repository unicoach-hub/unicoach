const CustomForm = require('../models/CustomForm');
const FormSubmission = require('../models/FormSubmission');

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
      if (field.required && (!data[field.label] || data[field.label].toString().trim() === '')) {
        return res.status(400).json({ message: `"${field.label}" is required` });
      }
    }

    const pipeline = form.pipeline;
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
      return res.status(500).json({ message: 'Pipeline has no stages configured' });
    }

    const firstStage = pipeline.stages.sort((a, b) => a.order - b.order)[0].name;

    const submission = new FormSubmission({
      form: form._id,
      pipeline: pipeline._id,
      currentStage: firstStage,
      data,
      submittedAt: new Date()
    });
    await submission.save();

    form.submissionCount = (form.submissionCount || 0) + 1;
    await form.save();

    return res.status(201).json({
      success: true,
      message: form.successMessage || 'Thank you! Your response has been recorded.'
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
