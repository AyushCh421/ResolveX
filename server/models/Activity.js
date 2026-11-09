const mongoose = require('mongoose');
const { ACTIONS } = require('../utils/constants');

// One row per thing that happens to a complaint. The timeline is just these rows in order.
const activitySchema = new mongoose.Schema(
  {
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ACTIONS, required: true },
    oldValue: { type: String, default: '' },
    newValue: { type: String, default: '' },
    comment: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Activity', activitySchema);
