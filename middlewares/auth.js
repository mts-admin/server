const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const httpCodes = require('../constants/http-codes');

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      createError(
        httpCodes.UNAUTHORIZED,
        'You are not logged in! Please log in to get access.'
      )
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      createError(
        httpCodes.UNAUTHORIZED,
        'The user belonging to this token does no longer exist.'
      )
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      createError(
        httpCodes.UNAUTHORIZED,
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
          httpCodes.FORBIDDEN,
          'You do not have permission to perform this action'
        )
      );
    }

    next();
  };

module.exports = { getMe, protect, restrictTo };
