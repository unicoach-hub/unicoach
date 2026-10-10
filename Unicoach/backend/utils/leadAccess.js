// Lead visibility for staff limited to their own leads (staff.leadScope 'assigned').
// Leads are assigned by staff id (Lead.assignedTo holds the staff member's id as a string).

// The staff id to restrict to, or null when this account may see every lead (owner, or scope 'all')
const scopedStaffId = (req) =>
  req.user?.role === 'staff' && req.staff?.leadScope !== 'all' ? String(req.staff._id) : null;

const canAccessLead = (req, lead) => {
  const staffId = scopedStaffId(req);
  return !staffId || String(lead?.assignedTo || '') === staffId;
};

// Name for activity logs ("performed by")
const actorName = (req, fallback = 'Admin') => (req.user?.role === 'staff' ? req.staff?.name || 'Staff' : fallback);

module.exports = { scopedStaffId, canAccessLead, actorName };
