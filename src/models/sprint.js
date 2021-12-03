const { Schema, model } = require('mongoose');

const { SPRINT_STATUS, SPRINT_PRIORITY } = require('../constants/sprints');

const sprintSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    required: true,
    enum: Object.values(SPRINT_STATUS),
  },
  priority: {
    type: String,
    required: true,
    enum: Object.values(SPRINT_PRIORITY),
  },
  dueDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: Date,
});

sprintSchema.index({ userId: 1, status: 1 });

const Sprint = model('Sprint', sprintSchema);

module.exports = Sprint;
