const createError = require('http-errors');

const Activity = require('../models/activity');
const User = require('../models/user');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const moment = require('../utils/moment');
const HTTP_CODE = require('../constants/http-codes');
const { deleteOne, updateOne } = require('./handler-factory');
const { ACTIVITY_STATUS } = require('../constants/activity');

const getMyActivities = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Activity.find({
      userId: req.user._id,
      status: { $ne: ACTIVITY_STATUS.CREATED },
    }),
    req.query
  )
    .search('content')
    .sort('becameActiveAt')
    .filter()
    .populate('createdBy', 'name avatar -_id')
    .paginate();

  const activities = await query.query;
  const [currentCount, restCount] = await Promise.all([
    query.countDocuments(),
    Activity.countDocuments({
      userId: req.user._id,
      status: ACTIVITY_STATUS.CREATED,
    }),
  ]);

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: {
      currentCount,
      restCount,
    },
    data: activities,
  });
});

const getUserActivities = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    Activity.find({
      userId: req.params.userId,
    }),
    req.query
  )
    .search('content')
    .sort()
    .filter()
    .populate('createdBy', 'name avatar -_id')
    .paginate();

  const activities = await query.query;
  const totalCount = await query.countDocuments();

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    count: totalCount,
    data: activities,
  });
});

const getActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id).populate(
    'createdBy userId',
    'name avatar'
  );

  if (!activity) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Activity not found!'));
  }

  if (!activity.viewed && req.user._id.equals(activity.userId.id)) {
    activity.viewed = true;
    await activity.save();
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: activity,
  });
});

const createActivity = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.userId);

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  const activity = await Activity.create({
    ...req.body,
    ...(req.body.status === ACTIVITY_STATUS.ACTIVE && {
      becameActiveAt: moment().format(),
    }),
    createdBy: req.user._id,
    createdAt: moment().format(),
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: activity,
  });
});

const updateActivity = catchAsync(async (req, res, next) => {
  const body = {
    ...req.body,
    viewed: false,
    ...(req.body.status === ACTIVITY_STATUS.ACTIVE && {
      becameActiveAt: moment().format(),
    }),
    ...(req.body.status === ACTIVITY_STATUS.CREATED && {
      becameActiveAt: undefined,
    }),
  };

  const activity = await Activity.findByIdAndUpdate(req.params.id, body, {
    new: true,
  }).populate('createdBy', 'name avatar -_id');

  if (!activity) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Activity not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: activity,
  });
});

const changeActivityStatus = updateOne(Activity, {
  match: {
    _id: ['params', 'id'],
    userId: ['user', 'id'],
  },
  populate: {
    path: 'createdBy',
    select: 'name avatar -_id',
  },
  body: {
    viewed: true,
  },
});

const deleteActivity = deleteOne(Activity, {
  match: {
    _id: ['params', 'id'],
  },
});

module.exports = {
  getMyActivities,
  getUserActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  changeActivityStatus,
};
