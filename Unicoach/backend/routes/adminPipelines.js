const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const adminPipelineController = require('../controllers/adminPipelineController');

router.use(verifyToken, requireAdmin);

// Pipelines CRUD
router.get('/', adminPipelineController.getAllPipelines);
router.get('/:id', adminPipelineController.getPipelineById);
router.post('/', adminPipelineController.createPipeline);
router.put('/:id', adminPipelineController.updatePipeline);
router.delete('/:id', adminPipelineController.deletePipeline);

// Pipeline Submissions Management
router.put('/submissions/:id/stage', adminPipelineController.updateSubmissionStage);
router.put('/submissions/:id/notes', adminPipelineController.addSubmissionNote);
router.put('/submissions/:id/assign', adminPipelineController.assignSubmission);
router.delete('/submissions/:id', adminPipelineController.deleteSubmission);

module.exports = router;
