const createError = require('http-errors');
const { isCelebrateError } = require('celebrate');

const httpCodes = require('../constants/http-codes');
const config = require('../../config');

const handleJWTError = () =>
  createError(httpCodes.UNAUTHORIZED, 'Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  createError(
    httpCodes.UNAUTHORIZED,
    'Your token has expired! Please log in again.'
  );

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return createError(httpCodes.BAD_REQUEST, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue).join(', ');
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return createError(httpCodes.BAD_REQUEST, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return createError(httpCodes.BAD_REQUEST, message);
};

const handleJoiError = (err) => {
  const fullMessage = [];
  // err.details is Map so we need to iterate it by forEach
  err.details.forEach((value) => {
    const errorMessage = value.details.map((i) => i.message).join('; ');
    fullMessage.push(errorMessage);
  });
  const message = `Validation error: ${fullMessage.join('; ')}`;

  return createError(httpCodes.BAD_REQUEST, message);
};

const sendErrorDev = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error
  if (createError.isHttpError(err)) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown error
  return res.status(httpCodes.SERVER_ERROR).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || httpCodes.SERVER_ERROR;
  err.status = 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, req, res);
  } else if (config.nodeEnv === 'production') {
    let error = Object.create(err);

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (isCelebrateError(error)) error = handleJoiError(error);

    sendErrorProd(error, req, res);
  }
};
