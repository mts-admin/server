const { Schema, model } = require('mongoose');

const { SCHEDULE_PERMISSIONS } = require('../constants/users');

const scheduleSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name of this schedule'],
  },
  description: {
    type: String,
    maxlength: [50, 'Description must have less or equal then 50 characters'],
  },
  owner: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  participants: [
    {
      _id: false,
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please provide id of a user'],
      },
      permissions: {
        type: [String],
        required: [true, 'Participant must have permissions included'],
        // TODO: find a way to validate
        enum: Object.values(SCHEDULE_PERMISSIONS),
      },
    },
  ],
});

const Schedule = model('Schedule', scheduleSchema);

module.exports = Schedule;
