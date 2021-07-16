const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const User = require('../models/user');
const catchAsync = require('../utils/catch-async');
const HTTP_CODE = require('../constants/http-codes');
const config = require('../../config');
const { USER_STATUS } = require('../constants/users');

const protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(
      createError(
        HTTP_CODE.UNAUTHORIZED,
        'You are not logged in! Please log in to get access.'
      )
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);

  // Check if user still exists
  const currentUser = await User.findOne({
    _id: decoded.id,
    status: USER_STATUS.ACTIVE,
  });

  if (!currentUser) {
    return next(
      createError(
        HTTP_CODE.UNAUTHORIZED,
        'This user has been deleted or deactivated.'
      )
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      createError(
        HTTP_CODE.UNAUTHORIZED,
        'User recently changed password! Please log in again.'
      )
    );
  }

  req.user = currentUser;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(
          HTTP_CODE.FORBIDDEN,
          'You do not have permission to perform this action'
        )
      );
    }

    next();
  };

module.exports = { protect, restrictTo };
