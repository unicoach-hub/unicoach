const express = require('express');
const router = express.Router();
const { verifyToken, requireAdminSession } = require('../middleware/auth');
const c = require('../controllers/adminTaskController');

// Every portal account has its own tasks; who can see or assign others' tasks is checked per action
router.use(verifyToken, requireAdminSession);

router.get('/', c.listTasks);
router.get('/count', c.countMine);
router.get('/assignees', c.listAssignees);
router.post('/', c.createTask);
router.patch('/:id', c.updateTask);
router.post('/:id/comments', c.addComment);
router.post('/:id/seen', c.markSeen);
router.delete('/:id', c.deleteTask);

module.exports = router;
