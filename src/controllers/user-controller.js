const createError = require('http-errors');

const User = require('../models/user');
const APIFeatures = require('../utils/api-features');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const { USER_STATUS } = require('../constants/users');
const { createSendToken } = require('../utils/auth');
const { getOne, updateOne } = require('./handler-factory');

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('newBonusesCount');

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
  });
});

const updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  if (!user) {
    return next(createError(HTTP_CODE.NOT_FOUND, 'User not found!'));
  }

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: user,
  });
});

// TODO: add email confirmation
const updateMyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'Your current password is wrong.')
    );
  }

  user.email = req.body.email;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

const updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      createError(HTTP_CODE.BAD_REQUEST, 'Your current password is wrong.')
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.techData.passwordChangedAt = Date.now();
  await user.save();

  createSendToken(user, HTTP_CODE.SUCCESS, res);
});

const getUsersList = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(
    User.find({
      status: { $ne: USER_STATUS.INVITED },
    }),
    req.query
  ).search('name');

  const users = await query.query;

  res.status(HTTP_CODE.SUCCESS).json({
    status: 'success',
    data: users,
  });
});

const getUser = getOne(User, {
  match: {
    _id: ['params', 'id'],
  },
});

// only for status (active, deactivated) and role (user, admin)
// validation is implemented via Joi
const updateUser = updateOne(User, {
  match: {
    _id: ['params', 'id'],
  },
});

module.exports = {
  getMe,
  updateMe,
  updateMyEmail,
  updateMyPassword,
  getUser,
  updateUser,
  getUsersList,
};
