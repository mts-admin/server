const R = require('ramda');
const createError = require('http-errors');

const User = require('../models/user');
const Schedule = require('../models/schedule');
const catchAsync = require('../utils/catch-async');
const httpCodes = require('../constants/http-codes');
const APIFeatures = require('../utils/api-features');

const getMySchedules = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Schedule.find({
      owner: req.user._id,
    }),
    req.query
  )
    .sort()
    .limitFields()
    .search('name', 'description')
    .paginate();

  const schedules = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: schedules,
  });
});

const getSharedSchedules = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Schedule.find({
      'participants.user': req.user._id,
    }),
    req.query
  )
    .sort()
    .limitFields()
    .search('name', 'description')
    .paginate();

  const schedules = await query.query;
  const totalCount = await query.query.countDocuments();

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: schedules,
  });
});

const createSchedule = catchAsync(async (req, res, next) => {
  const body = R.pick(['name', 'description'], req.body);

  const schedule = await Schedule.create({
    ...body,
    owner: req.user._id,
  });

  res.status(httpCodes.SUCCESS_CREATED).json({
    status: 'success',
    data: schedule,
  });
});

// checking if schedule exists was implemented in middleware
const updateSchedule = catchAsync(async (req, res, next) => {
  const body = R.pick(['name', 'description'], req.body);

  const schedule = await Schedule.findByIdAndUpdate(req.params.id, body, {
    new: true,
  });

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

// TODO: remove all visits
// checking if schedule exists was implemented in middleware
const deleteSchedule = catchAsync(async (req, res, next) => {
  await Schedule.findByIdAndDelete(req.params.id);

  res.status(httpCodes.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

const addParticipant = catchAsync(async (req, res, next) => {
  const { participantEmail, permissions } = req.body;

  const participant = await User.findOne({ email: participantEmail });

  if (!participant) {
    return next(createError(httpCodes.NOT_FOUND, 'User not found!'));
  }

  if (participant._id.equals(req.user._id)) {
    return next(
      createError(httpCodes.BAD_REQUEST, 'You cannot invite yourself!')
    );
  }

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: req.params.id,
      'participants.user': { $ne: participant._id },
    },
    {
      $push: {
        participants: {
          user: participant._id,
          permissions: permissions,
        },
      },
    },
    { new: true }
  );

  if (!schedule) {
    return next(
      createError(
        httpCodes.BAD_REQUEST,
        'This schedule does not exist or user is already a participant!'
      )
    );
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

const updateParticipant = catchAsync(async (req, res, next) => {
  const { participantId, permissions } = req.body;

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: req.params.id,
      'participants.user': participantId,
    },
    {
      'participants.$.permissions': permissions,
    },
    { new: true }
  );

  if (!schedule) {
    return next(
      createError(
        httpCodes.BAD_REQUEST,
        'This schedule does not exist or user is not a participant!'
      )
    );
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

const removeParticipant = catchAsync(async (req, res, next) => {
  const { participantId } = req.body;

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: req.params.id,
      'participants.user': participantId,
    },
    {
      $pull: {
        participants: { user: participantId },
      },
    },
    { new: true }
  );

  if (!schedule) {
    return next(
      createError(
        httpCodes.NOT_FOUND,
        'This schedule does not exist or user is not a participant!'
      )
    );
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

const leaveSchedule = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const schedule = await Schedule.findOneAndUpdate(
    {
      _id: req.params.id,
      'participants.user': userId,
    },
    {
      $pull: {
        participants: { user: userId },
      },
    },
    { new: true }
  );

  if (!schedule) {
    return next(
      createError(
        httpCodes.NOT_FOUND,
        'This schedule does not exist or you are not a participant!'
      )
    );
  }

  res.status(httpCodes.SUCCESS).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getMySchedules,
  getSharedSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  addParticipant,
  updateParticipant,
  removeParticipant,
  leaveSchedule,
};
