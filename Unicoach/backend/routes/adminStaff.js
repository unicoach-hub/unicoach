const express = require('express');
const router = express.Router();
const { verifyToken, requireAdminSession, requireOwner } = require('../middleware/auth');
const { can } = require('../config/staffPermissions');
const adminStaffController = require('../controllers/adminStaffController');

router.use(verifyToken);

// Staff list for the counselor picker in Leads: anyone who can see leads
const canSeeLeads = (req, res, next) =>
  req.user.role === 'admin' || can(req.staff?.permissions, 'leads', 'view')
    ? next()
    : res.status(403).json({ code: 'NO_PERMISSION', message: "You don't have permission to do this." });
router.get('/assignable', requireAdminSession, canSeeLeads, adminStaffController.getAssignableStaff);

// Everything else (accounts and their access) is owner only
router.use(requireOwner);

router.get('/', adminStaffController.getStaff);
router.post('/', adminStaffController.createStaff);
router.put('/:id', adminStaffController.updateStaff);
router.delete('/:id', adminStaffController.deleteStaff);

module.exports = router;
