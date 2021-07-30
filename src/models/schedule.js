const { Schema, model } = require('mongoose');

const { SCHEDULE_PERMISSIONS } = require('../constants/users');

const scheduleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name of this schedule'],
      minlength: [3, 'Description must have more or equal then 3 characters'],
      maxlength: [50, 'Description must have less or equal then 50 characters'],
    },
    description: {
      type: String,
      minlength: [3, 'Description must have more or equal then 3 characters'],
      maxlength: [
        100,
        'Description must have less or equal then 100 characters',
      ],
    },
    owner: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
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
          enum: Object.values(SCHEDULE_PERMISSIONS),
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

scheduleSchema.virtual('visits', {
  ref: 'Visit',
  foreignField: 'scheduleId',
  localField: '_id',
});

scheduleSchema.index({ name: 1, description: 1 });

const Schedule = model('Schedule', scheduleSchema);

module.exports = Schedule;
