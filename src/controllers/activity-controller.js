const createError = require('http-errors');

const Activity = require('../models/activity');
const User = require('../models/user');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { updateOne, deleteOne } = require('./handler-factory');
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
    .filter()
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
    .filter()
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
  const activity = await Activity.findById(req.params.id, (err, item) => {
    if (item && !item.viewed && req.user._id.equals(item.userId)) {
      item.viewed = true;
      item.save();
    }
  });

  if (!activity) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'Activity not found!'));
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
    createdBy: req.user._id,
  });

  res.status(HTTP_CODE.SUCCESS_CREATED).json({
    status: 'success',
    data: activity,
  });
});

const updateActivity = updateOne(Activity, {
  match: {
    _id: ['params', 'id'],
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
};
