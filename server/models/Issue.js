const mongoose = require('mongoose');
const { CATEGORIES, PRIORITIES, STATUSES } = require('../utils/constants');

const issueSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedDepartment: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Admin list screens filter on these combinations a lot.
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1 });

module.exports = mongoose.model('Issue', issueSchema);
