const mongoose = require('mongoose');
const StaffTask = require('../models/StaffTask');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { can } = require('../config/staffPermissions');

const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['todo', 'in_progress', 'done'];
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));

// Who is calling, and what they may do with other people's tasks
const actor = async (req) => {
  if (req.user.role === 'admin') {
    const owner = await User.findById(req.user.id).select('name username').lean();
    return { kind: 'owner', id: String(req.user.id), name: owner?.name || owner?.username || 'Admin', all: { view: true, create: true, update: true, delete: true } };
  }
  const perms = req.staff?.permissions || {};
  return {
    kind: 'staff',
    id: String(req.staff._id),
    name: req.staff.name,
    all: {
      view: can(perms, 'tasks', 'view'),
      create: can(perms, 'tasks', 'create'),
      update: can(perms, 'tasks', 'update'),
      delete: can(perms, 'tasks', 'delete'),
    },
  };
};

const person = (a) => ({ kind: a.kind, id: a.id, name: a.name });
const isMine = (task, a) => task.assignee.id === a.id;
const isCreator = (task, a) => task.createdBy.id === a.id;

// Resolve an assignee id ('me', an owner User id or a Staff id) into a person
const resolveAssignee = async (value, a) => {
  if (!value || value === 'me' || value === a.id) return person(a);
  if (!isId(value)) return null;
  const staff = await Staff.findOne({ _id: value, active: true }).select('name').lean();
  if (staff) return { kind: 'staff', id: String(staff._id), name: staff.name };
  const owner = await User.findOne({ _id: value, role: 'admin' }).select('name username').lean();
  return owner ? { kind: 'owner', id: String(owner._id), name: owner.name || owner.username || 'Admin' } : null;
};

// What's new for this person: comments/updates by others since they last opened it, or a task they haven't opened yet
const withUnread = (task, meId) => {
  const seen = task.seenBy instanceof Map ? task.seenBy.get(meId) : task.seenBy?.[meId];
  const seenAt = seen ? new Date(seen).getTime() : 0;
  const unread = (task.comments || []).filter((c) => c.by.id !== meId && new Date(c.at).getTime() > seenAt).length;
  const isNew = task.assignee.id === meId && task.createdBy.id !== meId && !seen;
  const plain = task.toObject ? task.toObject() : task;
  delete plain.seenBy;
  return { ...plain, unread, isNew };
};

const markSeen = (task, meId) => {
  task.seenBy = task.seenBy || new Map();
  task.seenBy.set(meId, new Date());
};

const parseDate = (v) => {
  if (v === null || v === '') return null;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : undefined;
};

/**
 * GET /api/admin/tasks?scope=mine|all&status=&priority=&assignee=&from=&to=&overdue=1&q=
 */
exports.listTasks = async (req, res) => {
  try {
    const a = await actor(req);
    const { scope, status, priority, assignee, from, to, overdue, q } = req.query;
    const filter = {};

    if (scope === 'all' && a.all.view) {
      if (assignee && assignee !== 'all') filter['assignee.id'] = String(assignee);
    } else {
      // Your own list: tasks assigned to you, plus tasks you gave to others
      filter.$or = [{ 'assignee.id': a.id }, { 'createdBy.id': a.id }];
    }
    if (STATUSES.includes(status)) filter.status = status;
    if (status === 'open') filter.status = { $ne: 'done' };
    if (PRIORITIES.includes(priority)) filter.priority = priority;

    const due = {};
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (fromDate) due.$gte = fromDate;
    if (toDate) due.$lte = toDate;
    if (overdue === '1') {
      due.$lt = new Date();
      filter.status = { $ne: 'done' };
    }
    if (Object.keys(due).length) filter.dueAt = due;

    const search = text(q, 80);
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = [{ $or: [{ title: re }, { description: re }] }];
    }

    const tasks = await StaffTask.find(filter).sort({ status: 1, dueAt: 1, createdAt: -1 }).limit(500).lean();
    // Open tasks first by due date (no date last), finished ones after
    const order = { todo: 0, in_progress: 0, done: 1 };
    tasks.sort((x, y) => order[x.status] - order[y.status]
      || (x.dueAt ? new Date(x.dueAt) : Infinity) - (y.dueAt ? new Date(y.dueAt) : Infinity));
    return res.json({ tasks: tasks.map((t) => withUnread(t, a.id)), canManage: a.all, me: a.id });
  } catch (err) {
    console.error('Error listing tasks:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/tasks/count  (open tasks assigned to me: the sidebar badge)
 */
exports.countMine = async (req, res) => {
  try {
    const a = await actor(req);
    const mine = await StaffTask.find({ $or: [{ 'assignee.id': a.id }, { 'createdBy.id': a.id }] })
      .select('assignee createdBy status dueAt comments.by comments.at seenBy').limit(1000).lean();
    const views = mine.map((t) => withUnread(t, a.id));
    const open = views.filter((t) => t.assignee.id === a.id && t.status !== 'done').length;
    const overdue = views.filter((t) => t.assignee.id === a.id && t.status !== 'done' && t.dueAt && new Date(t.dueAt) < new Date()).length;
    // Needs a look: new tasks for me, or tasks with comments/updates I haven't seen
    const updates = views.filter((t) => t.unread > 0 || t.isNew).length;
    return res.json({ open, overdue, updates });
  } catch (err) {
    console.error('Error counting tasks:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/tasks/assignees  (people you can give a task to)
 */
exports.listAssignees = async (req, res) => {
  try {
    const a = await actor(req);
    if (!a.all.create) return res.json([person(a)]);
    const staff = await Staff.find({ active: true }).select('name title avatar').sort({ name: 1 }).lean();
    const people = staff.map((s) => ({ kind: 'staff', id: String(s._id), name: s.name, title: s.title, avatar: s.avatar || '' }));
    if (a.kind === 'owner') people.unshift({ ...person(a), title: 'Owner' });
    return res.json(people);
  } catch (err) {
    console.error('Error listing assignees:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/tasks  { title, description, assignee, dueAt, priority }
 */
exports.createTask = async (req, res) => {
  try {
    const a = await actor(req);
    const title = text(req.body.title, 160);
    if (!title) return res.status(400).json({ message: 'Give the task a title' });

    const assignee = await resolveAssignee(req.body.assignee, a);
    if (!assignee) return res.status(400).json({ message: 'Choose who this task is for' });
    if (assignee.id !== a.id && !a.all.create) {
      return res.status(403).json({ code: 'NO_PERMISSION', message: 'You can only add tasks for yourself' });
    }
    const dueAt = parseDate(req.body.dueAt);
    if (dueAt === undefined) return res.status(400).json({ message: 'Invalid due date' });

    const task = await StaffTask.create({
      title,
      description: text(req.body.description, 2000),
      assignee,
      createdBy: person(a),
      dueAt,
      priority: PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium',
      seenBy: { [a.id]: new Date() },
    });
    return res.status(201).json(withUnread(task, a.id));
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/tasks/:id
 * The assignee can change the status; the creator or a task manager can edit everything
 */
exports.updateTask = async (req, res) => {
  try {
    const a = await actor(req);
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Task not found' });
    const task = await StaffTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const canEdit = isCreator(task, a) || a.all.update;
    const canSee = canEdit || isMine(task, a) || a.all.view;
    if (!canSee) return res.status(404).json({ message: 'Task not found' });

    const { status, title, description, dueAt, priority, assignee } = req.body;
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
      if (!isMine(task, a) && !canEdit) return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only the person doing this task can change its status' });
      if (task.status !== status) {
        const labels = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
        task.comments.push({ by: person(a), text: `Changed status to ${labels[status]}` });
      }
      task.status = status;
      task.completedAt = status === 'done' ? new Date() : undefined;
    }

    const editsDetails = [title, description, dueAt, priority, assignee].some((v) => v !== undefined);
    if (editsDetails && !canEdit) {
      return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only the person who gave this task can edit it' });
    }
    if (title !== undefined) {
      const clean = text(title, 160);
      if (!clean) return res.status(400).json({ message: 'Give the task a title' });
      task.title = clean;
    }
    if (description !== undefined) task.description = text(description, 2000);
    if (dueAt !== undefined) {
      const d = parseDate(dueAt);
      if (d === undefined) return res.status(400).json({ message: 'Invalid due date' });
      task.dueAt = d;
    }
    if (priority !== undefined && PRIORITIES.includes(priority)) task.priority = priority;
    if (assignee !== undefined) {
      const next = await resolveAssignee(assignee, a);
      if (!next) return res.status(400).json({ message: 'Choose who this task is for' });
      if (next.id !== a.id && !a.all.create) return res.status(403).json({ code: 'NO_PERMISSION', message: 'You can only add tasks for yourself' });
      task.assignee = next;
    }

    markSeen(task, a.id);
    await task.save();
    return res.json(withUnread(task, a.id));
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/tasks/:id/comments  { text }
 */
exports.addComment = async (req, res) => {
  try {
    const a = await actor(req);
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Task not found' });
    const task = await StaffTask.findById(req.params.id);
    if (!task || !(isMine(task, a) || isCreator(task, a) || a.all.view)) return res.status(404).json({ message: 'Task not found' });
    const body = text(req.body.text, 1000);
    if (!body) return res.status(400).json({ message: 'Write a comment' });
    task.comments.push({ by: person(a), text: body });
    markSeen(task, a.id);
    await task.save();
    return res.status(201).json(withUnread(task, a.id));
  } catch (err) {
    console.error('Error adding task comment:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/tasks/:id/seen  (opening a task clears its "new" highlight for you)
 */
exports.markSeen = async (req, res) => {
  try {
    const a = await actor(req);
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Task not found' });
    const task = await StaffTask.findById(req.params.id);
    if (!task || !(isMine(task, a) || isCreator(task, a) || a.all.view)) return res.status(404).json({ message: 'Task not found' });
    markSeen(task, a.id);
    await task.save();
    return res.json(withUnread(task, a.id));
  } catch (err) {
    console.error('Error marking task seen:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/tasks/:id  (the creator, or a manager with delete access)
 */
exports.deleteTask = async (req, res) => {
  try {
    const a = await actor(req);
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Task not found' });
    const task = await StaffTask.findById(req.params.id).select('createdBy assignee').lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!isCreator(task, a) && !a.all.delete) {
      return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only the person who gave this task can delete it' });
    }
    await StaffTask.deleteOne({ _id: task._id });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
