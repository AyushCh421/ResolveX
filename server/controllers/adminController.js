const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const { CATEGORIES, PRIORITIES, STATUSES, DEPARTMENTS } = require('../utils/constants');
const { asyncHandler, ApiError, str, escapeRegex } = require('../utils/helpers');

// GET /api/admin/issues?q=&status=&category=&priority=&department=&sort=&page=&limit=
const listIssues = asyncHandler(async (req, res) => {
  const filter = {};

  const status = str(req.query.status);
  const category = str(req.query.category);
  const priority = str(req.query.priority);
  const department = str(req.query.department);

  if (status) {
    if (!STATUSES.includes(status)) throw new ApiError(400, 'Unknown status filter.');
    filter.status = status;
  }
  if (category) {
    if (!CATEGORIES.includes(category)) throw new ApiError(400, 'Unknown category filter.');
    filter.category = category;
  }
  if (priority) {
    if (!PRIORITIES.includes(priority)) throw new ApiError(400, 'Unknown priority filter.');
    filter.priority = priority;
  }
  if (department) {
    if (department === 'Unassigned') filter.assignedDepartment = '';
    else if (DEPARTMENTS.includes(department)) filter.assignedDepartment = department;
    else throw new ApiError(400, 'Unknown department filter.');
  }

  const q = str(req.query.q).slice(0, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { ticketId: rx }, { location: rx }, { description: rx }];
  }

  const sortKey = str(req.query.sort);
  const sort =
    sortKey === 'oldest' ? { createdAt: 1 } : sortKey === 'updated' ? { updatedAt: -1 } : { createdAt: -1 };

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email'),
    Issue.countDocuments(filter),
  ]);

  res.json({ issues, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

// PATCH /api/admin/issues/:id   body: { status?, assignedDepartment?, remark? }
const updateIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(str(req.params.id));
  if (!issue) throw new ApiError(404, 'Complaint not found.');

  const status = str(req.body.status);
  const hasDeptField = typeof req.body.assignedDepartment === 'string';
  const department = str(req.body.assignedDepartment);
  const remark = str(req.body.remark);

  if (status && !STATUSES.includes(status)) throw new ApiError(400, 'Choose a valid status.');
  if (hasDeptField && department && !DEPARTMENTS.includes(department)) {
    throw new ApiError(400, 'Choose a valid department.');
  }
  if (remark.length > 500) throw new ApiError(400, 'Remarks can be up to 500 characters.');

  const logs = [];
  let remarkUsed = false;
  const takeRemark = () => {
    if (remarkUsed) return '';
    remarkUsed = true;
    return remark;
  };

  if (status && status !== issue.status) {
    logs.push({ action: 'STATUS_CHANGED', oldValue: issue.status, newValue: status, comment: takeRemark() });
    issue.status = status;
    issue.resolvedAt = status === 'Resolved' ? new Date() : null;
  }

  if (hasDeptField && department !== issue.assignedDepartment) {
    logs.push({
      action: 'DEPARTMENT_ASSIGNED',
      oldValue: issue.assignedDepartment,
      newValue: department,
      comment: takeRemark(),
    });
    issue.assignedDepartment = department;
  }

  // A remark on its own is just a comment from the admin.
  if (!logs.length && remark) {
    logs.push({ action: 'COMMENT', comment: takeRemark() });
  }

  if (!logs.length) throw new ApiError(400, 'Nothing to update. Change the status, department or add a remark.');

  await issue.save();
  await Activity.insertMany(logs.map((l) => ({ ...l, issueId: issue._id, updatedBy: req.user._id })));

  await issue.populate('createdBy', 'name email department');
  const activities = await Activity.find({ issueId: issue._id })
    .sort({ createdAt: 1 })
    .populate('updatedBy', 'name role');

  res.json({ issue, activities });
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13); // last 14 days including today

  const [result] = await Issue.aggregate([
    {
      $facet: {
        totals: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
            },
          },
          { $sort: { count: -1 } },
        ],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        byDepartment: [
          { $match: { assignedDepartment: { $ne: '' } } },
          { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        daily: [
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        ],
        resolution: [
          { $match: { status: 'Resolved', resolvedAt: { $ne: null } } },
          { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } },
        ],
      },
    },
  ]);

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  result.totals.forEach((t) => {
    counts[t._id] = t.count;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Fill days with zero so the chart line has no gaps.
  const dailyMap = Object.fromEntries(result.daily.map((d) => [d._id, d.count]));
  const trend = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    trend.push({ date: key, count: dailyMap[key] || 0 });
  }

  const recent = await Issue.find({ status: { $in: ['Pending', 'In Progress'] } })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('createdBy', 'name');

  res.json({
    total,
    pending: counts.Pending,
    inProgress: counts['In Progress'],
    resolved: counts.Resolved,
    rejected: counts.Rejected,
    resolutionRate: total ? Math.round((counts.Resolved / total) * 1000) / 10 : 0,
    avgResolutionHours: result.resolution[0] ? Math.round((result.resolution[0].avgMs / 36e5) * 10) / 10 : null,
    byCategory: result.byCategory.map((c) => ({ category: c._id, count: c.count, resolved: c.resolved })),
    byPriority: result.byPriority.map((p) => ({ priority: p._id, count: p.count })),
    byDepartment: result.byDepartment.map((d) => ({ department: d._id, count: d.count })),
    trend,
    recent,
  });
});

module.exports = { listIssues, updateIssue, getAnalytics };
