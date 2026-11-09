const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const { CATEGORIES, PRIORITIES, STATUSES } = require('../utils/constants');
const { isConfigured, uploadImage } = require('../config/cloudinary');
const { asyncHandler, ApiError, str, escapeRegex, generateTicketId } = require('../utils/helpers');

// POST /api/issues  (multipart/form-data, optional "image" file)
const createIssue = asyncHandler(async (req, res) => {
  const title = str(req.body.title);
  const description = str(req.body.description);
  const category = str(req.body.category);
  const location = str(req.body.location);
  const priority = str(req.body.priority) || 'Medium';

  const errors = {};
  if (title.length < 5 || title.length > 120) errors.title = 'Title needs 5 to 120 characters.';
  if (description.length < 10 || description.length > 2000) {
    errors.description = 'Describe the problem in 10 to 2000 characters.';
  }
  if (!CATEGORIES.includes(category)) errors.category = 'Choose a category.';
  if (!location || location.length > 160) errors.location = 'Choose where the problem is.';
  if (!PRIORITIES.includes(priority)) errors.priority = 'Choose a priority.';
  if (Object.keys(errors).length) throw new ApiError(400, Object.values(errors)[0], errors);

  let image = { url: '', publicId: '' };
  if (req.file) {
    if (!isConfigured()) {
      throw new ApiError(503, 'Image uploads are not set up on the server yet. Submit without a photo.');
    }
    image = await uploadImage(req.file.buffer);
  }

  // Ticket ids are random-suffixed, so on the rare collision just try again.
  let issue;
  for (let attempt = 0; attempt < 5 && !issue; attempt++) {
    try {
      issue = await Issue.create({
        ticketId: generateTicketId(),
        title,
        description,
        category,
        location,
        priority,
        imageUrl: image.url,
        imagePublicId: image.publicId,
        createdBy: req.user._id,
      });
    } catch (err) {
      if (err.code !== 11000 || attempt === 4) throw err;
    }
  }

  await Activity.create({
    issueId: issue._id,
    updatedBy: req.user._id,
    action: 'CREATED',
    newValue: 'Pending',
  });

  res.status(201).json({ issue });
});

// GET /api/issues/mine?status=&q=
const getMyIssues = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };

  const status = str(req.query.status);
  if (status) {
    if (!STATUSES.includes(status)) throw new ApiError(400, 'Unknown status filter.');
    filter.status = status;
  }

  const q = str(req.query.q).slice(0, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { ticketId: rx }, { location: rx }, { category: rx }];
  }

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ issues });
});

// Shared by student + admin detail views. Accepts a Mongo id or a ticket id.
const findIssueForUser = async (idOrTicket, user) => {
  const lookup = mongoose.isValidObjectId(idOrTicket) ? { _id: idOrTicket } : { ticketId: idOrTicket };
  const issue = await Issue.findOne(lookup).populate('createdBy', 'name email department');
  if (!issue) throw new ApiError(404, 'Complaint not found.');

  // Students can only open their own complaints. Return 404, not 403, so ids can't be probed.
  if (user.role !== 'admin' && String(issue.createdBy?._id) !== String(user._id)) {
    throw new ApiError(404, 'Complaint not found.');
  }
  return issue;
};

// GET /api/issues/:id
const getIssue = asyncHandler(async (req, res) => {
  const issue = await findIssueForUser(str(req.params.id), req.user);
  const activities = await Activity.find({ issueId: issue._id })
    .sort({ createdAt: 1 })
    .populate('updatedBy', 'name role');
  res.json({ issue, activities });
});

// POST /api/issues/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const issue = await findIssueForUser(str(req.params.id), req.user);
  const comment = str(req.body.comment);
  if (!comment || comment.length > 500) throw new ApiError(400, 'Write a comment of up to 500 characters.');

  const activity = await Activity.create({
    issueId: issue._id,
    updatedBy: req.user._id,
    action: 'COMMENT',
    comment,
  });
  await Issue.updateOne({ _id: issue._id }, { $set: { updatedAt: new Date() } });

  await activity.populate('updatedBy', 'name role');
  res.status(201).json({ activity });
});

module.exports = { createIssue, getMyIssues, getIssue, addComment };
