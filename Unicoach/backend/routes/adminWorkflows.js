const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/workflowController');

router.use(verifyToken, requireAdmin);

router.get('/catalog', c.catalog);
router.get('/runs', c.runs);
router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.post('/:id/toggle', c.toggle);
router.post('/:id/test-run', c.testRun);
router.delete('/:id', c.remove);

module.exports = router;
