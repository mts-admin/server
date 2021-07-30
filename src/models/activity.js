const { Schema, model } = require('mongoose');
const { ACTIVITY_STATUS } = require('../constants/activity');

const activitySchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  viewed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(ACTIVITY_STATUS),
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

activitySchema.index({ content: 1 });

const Activity = model('Activity', activitySchema);

module.exports = Activity;
