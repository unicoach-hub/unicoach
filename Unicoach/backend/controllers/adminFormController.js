const crypto = require('crypto');
const CustomForm = require('../models/CustomForm');

const generateSlug = () => crypto.randomBytes(4).toString('hex');

/**
 * GET /api/admin/forms
 * GET all forms
 */
exports.getAllForms = async (req, res) => {
  try {
    const forms = await CustomForm.find().populate('pipeline', 'name').sort({ createdAt: -1 });
    return res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/forms/:id
 * GET single form
 */
exports.getFormById = async (req, res) => {
  try {
    const form = await CustomForm.findById(req.params.id).populate('pipeline', 'name stages');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    return res.json(form);
  } catch (err) {
    console.error('Error fetching form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/forms
 * Create form
 */
exports.createForm = async (req, res) => {
  try {
    const { name, pipeline, fields, headerTitle, headerDescription, successMessage } = req.body;
    if (!name || !pipeline || !fields || fields.length === 0) {
      return res.status(400).json({ message: 'Name, pipeline, and at least one field are required.' });
    }

    const slug = generateSlug();
    const form = new CustomForm({
      name,
      slug,
      pipeline,
      fields,
      headerTitle: headerTitle || name,
      headerDescription: headerDescription || '',
      successMessage: successMessage || 'Thank you! Your response has been recorded.',
      createdBy: req.user?.id
    });
    await form.save();
    return res.status(201).json(form);
  } catch (err) {
    console.error('Error creating form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/forms/:id
 * Update form
 */
exports.updateForm = async (req, res) => {
  try {
    const { name, pipeline, fields, headerTitle, headerDescription, successMessage, active } = req.body;
    const form = await CustomForm.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    if (name) form.name = name;
    if (pipeline) form.pipeline = pipeline;
    if (fields) form.fields = fields;
    if (headerTitle !== undefined) form.headerTitle = headerTitle;
    if (headerDescription !== undefined) form.headerDescription = headerDescription;
    if (successMessage !== undefined) form.successMessage = successMessage;
    if (active !== undefined) form.active = active;

    await form.save();
    return res.json(form);
  } catch (err) {
    console.error('Error updating form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/forms/:id
 * Delete form
 */
exports.deleteForm = async (req, res) => {
  try {
    const form = await CustomForm.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    return res.json({ message: 'Form deleted' });
  } catch (err) {
    console.error('Error deleting form:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
