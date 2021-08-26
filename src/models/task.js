const { Schema, model } = require('mongoose');

const { TASK_STATUS } = require('../constants/sprints');

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  notes: String,
  status: {
    type: String,
    required: true,
    default: TASK_STATUS.ACTIVE,
    enum: Object.values(TASK_STATUS),
  },
  sprintId: {
    type: Schema.ObjectId,
    ref: 'Sprint',
    required: true,
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
});

taskSchema.index({ userId: 1, sprintId: 1 });

const Task = model('Task', taskSchema);

module.exports = Task;
