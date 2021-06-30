const R = require('ramda');
const createError = require('http-errors');

const Schedule = require('../models/schedule');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');

const checkSchedulePermissions = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Schedule not found'));
  }

  if (!schedule.owner.equals(req.user._id)) {
    return next(
      createError(
        HTTP_CODE.FORBIDDEN,
        'You are not allowed to perform this action'
      )
    );
  }

  next();
});

// this middleware checks if user is a participant of a current schedule
// and if he has permissions to permorf some actions with visits
const checkVisitsPermissions = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(
    req.params.scheduleId || req.params.id
  );

  if (!schedule) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Schedule not found'));
  }

  if (schedule.owner.equals(req.user._id)) return next();

  const participant = R.propOr([], 'participants', schedule).find(({ user }) =>
    user.equals(req.user._id)
  );

  if (!participant) {
    return next(
      createError(
        HTTP_CODE.FORBIDDEN,
        'You are not a participant of this schedule'
      )
    );
  }

  if (!participant.permissions.includes(req.method)) {
    return next(
      createError(
        HTTP_CODE.FORBIDDEN,
        'You are not allowed to perform this action inside this schedule'
      )
    );
  }

  next();
});

module.exports = { checkSchedulePermissions, checkVisitsPermissions };
