const { Schema, model } = require('mongoose');
const { ACTIVITY_STATUS } = require('../constants/activity');

const activitySchema = new Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500,
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
  createdAt: Date,
  becameActiveAt: Date,
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

activitySchema.index({ userId: 1, status: 1, content: 1 });

const Activity = model('Activity', activitySchema);

module.exports = Activity;
