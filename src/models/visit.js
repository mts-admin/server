const { Schema, model } = require('mongoose');
const { differenceInMilliseconds } = require('date-fns');

const { VISIT_RECURRING, VISIT_STATUS } = require('../constants/visits');

const visitSchema = new Schema(
  {
    scheduleId: {
      type: Schema.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    recurring: {
      type: String,
      required: true,
      enum: Object.values(VISIT_RECURRING),
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    // Array with numbers of days of week, 0 represents Sunday
    // Only for recurring === 'WEEKLY'
    daysOfWeek: {
      type: [Number],
      default: undefined,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    notes: String,
    status: {
      type: String,
      required: true,
      enum: Object.values(VISIT_STATUS),
    },
    // ID of group of visits with recurring (daily, weekly)
    groupId: String,
    createdBy: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
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

visitSchema.virtual('duration').get(function () {
  const diff = differenceInMilliseconds(this.startTime, this.endTime);

  const seconds = Math.abs(diff) / 1000;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  return `${String(hours).padStart(2, 0)}:${minutes}`;
});

const Visit = model('Visit', visitSchema);

module.exports = Visit;
