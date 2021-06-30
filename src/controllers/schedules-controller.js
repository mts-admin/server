const createError = require('http-errors');

const User = require('../models/user');
const Visit = require('../models/visit');
const Schedule = require('../models/schedule');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const APIFeatures = require('../utils/api-features');

// checking if schedule exists was implemented in middleware
const getSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findById(req.params.id).populate(
    'owner participants.user',
    'name avatar'
  );

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

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

  res.status(HTTP_CODE.SUCCESS).json({
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

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: schedules,
  });
});

const createSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: schedule,
  });
});

// checking if schedule exists was implemented in middleware
const updateSchedule = catchAsync(async (req, res, next) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: schedule,
  });
});

// checking if schedule exists was implemented in middleware
const deleteSchedule = catchAsync(async (req, res, next) => {
  await Visit.deleteMany({ scheduleId: req.params.id });
  await Schedule.findByIdAndDelete(req.params.id);

  res.status(HTTP_CODE.SUCCESS_DELETED).json({
    status: 'success',
    data: null,
  });
});

const addParticipant = catchAsync(async (req, res, next) => {
  const { participantEmail, permissions } = req.body;

  const participant = await User.findOne({ email: participantEmail });

  if (!participant) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  if (participant._id.equals(req.user._id)) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'You cannot invite yourself!')
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
  ).populate('participants.user', 'name avatar');

  if (!schedule) {
    return next(
      createError(
        HTTP_CODE.BAD_REQUEST,
        'This schedule does not exist or user is already a participant!'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
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
  ).populate('participants.user', 'name avatar');

  if (!schedule) {
    return next(
      createError(
        HTTP_CODE.BAD_REQUEST,
        'This schedule does not exist or user is not a participant!'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
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
  ).populate('participants.user', 'name avatar');

  if (!schedule) {
    return next(
      createError(
        HTTP_CODE.NOT_FOUND,
        'This schedule does not exist or user is not a participant!'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
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
        HTTP_CODE.NOT_FOUND,
        'This schedule does not exist or you are not a participant!'
      )
    );
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getSchedule,
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
