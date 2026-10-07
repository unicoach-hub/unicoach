const Pipeline = require('../models/Pipeline');
const FormSubmission = require('../models/FormSubmission');

/**
 * GET /api/admin/pipelines
 * GET all pipelines
 */
exports.getAllPipelines = async (req, res) => {
  try {
    const pipelines = await Pipeline.find().sort({ createdAt: -1 });

    const results = await Promise.all(pipelines.map(async (p) => {
      const submissionCount = await FormSubmission.countDocuments({ pipeline: p._id });
      return { ...p.toObject(), submissionCount };
    }));

    return res.json(results);
  } catch (err) {
    console.error('Error fetching pipelines:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/pipelines/:id
 * GET single pipeline with stage-wise counts
 */
exports.getPipelineById = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });

    const submissions = await FormSubmission.find({ pipeline: pipeline._id }).sort({ submittedAt: -1 });

    const stagesWithData = pipeline.stages.map(stage => ({
      ...stage.toObject(),
      submissions: submissions.filter(s => s.currentStage === stage.name)
    }));

    return res.json({ pipeline, stages: stagesWithData });
  } catch (err) {
    console.error('Error fetching pipeline:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/pipelines
 * Create pipeline
 */
exports.createPipeline = async (req, res) => {
  try {
    const { name, description, stages } = req.body;
    if (!name || !stages || stages.length === 0) {
      return res.status(400).json({ message: 'Name and at least one stage are required.' });
    }

    const pipeline = new Pipeline({
      name,
      description: description || '',
      stages: stages.map((s, i) => ({ name: s.name, color: s.color || '#6366f1', order: i })),
      createdBy: req.user?.id
    });
    await pipeline.save();
    return res.status(201).json(pipeline);
  } catch (err) {
    console.error('Error creating pipeline:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/pipelines/:id
 * Update pipeline
 */
exports.updatePipeline = async (req, res) => {
  try {
    const { name, description, stages, active } = req.body;
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });

    if (name) pipeline.name = name;
    if (description !== undefined) pipeline.description = description;
    if (active !== undefined) pipeline.active = active;
    if (stages) {
      pipeline.stages = stages.map((s, i) => ({ name: s.name, color: s.color || '#6366f1', order: i }));
    }

    await pipeline.save();
    return res.json(pipeline);
  } catch (err) {
    console.error('Error updating pipeline:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/pipelines/:id
 * Delete pipeline
 */
exports.deletePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndDelete(req.params.id);
    if (!pipeline) return res.status(404).json({ message: 'Pipeline not found' });
    await FormSubmission.deleteMany({ pipeline: req.params.id });
    return res.json({ message: 'Pipeline deleted' });
  } catch (err) {
    console.error('Error deleting pipeline:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/pipelines/submissions/:id/stage
 * Move submission to new stage
 */
exports.updateSubmissionStage = async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ message: 'Stage name is required' });

    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.currentStage = stage;
    await submission.save();
    return res.json(submission);
  } catch (err) {
    console.error('Error moving submission:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/pipelines/submissions/:id/notes
 * Add note to submission
 */
exports.addSubmissionNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required' });

    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.notes.push({ text });
    await submission.save();
    return res.json(submission);
  } catch (err) {
    console.error('Error adding note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/pipelines/submissions/:id/assign
 * Assign submission to counselor
 */
exports.assignSubmission = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const submission = await FormSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.assignedTo = assignedTo || '';
    await submission.save();
    return res.json(submission);
  } catch (err) {
    console.error('Error assigning submission:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/pipelines/submissions/:id
 * Delete submission
 */
exports.deleteSubmission = async (req, res) => {
  try {
    await FormSubmission.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Submission deleted' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
