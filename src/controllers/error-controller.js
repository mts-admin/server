const createError = require('http-errors');
const { isCelebrateError } = require('celebrate');

const HTTP_CODE = require('../constants/http-codes');

const handleJWTError = () =>
  createError(HTTP_CODE.UNAUTHORIZED, 'Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  createError(
    HTTP_CODE.UNAUTHORIZED,
    'Your token has expired! Please log in again.'
  );

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return createError(HTTP_CODE.BAD_REQUEST, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue).join(', ');
  const message = Object.keys(err.keyValue).includes('email')
    ? 'User with this email already exists'
    : `This value must be unique: ${value}. Please use another one!`;

  return createError(HTTP_CODE.BAD_REQUEST, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return createError(HTTP_CODE.BAD_REQUEST, message);
};

const handleJoiError = (err) => {
  const fullMessage = [];
  // err.details is Map so we need to iterate it by forEach
  err.details.forEach((value) => {
    const errorMessage = value.details.map((i) => i.message).join('; ');
    fullMessage.push(errorMessage);
  });
  const message = `Validation error: ${fullMessage.join('; ')}`;

  return createError(HTTP_CODE.BAD_REQUEST, message);
};

const handleLimitFIleSizeError = () =>
  createError(HTTP_CODE.BAD_REQUEST, 'File size is too large!');

const sendError = (err, req, res) => {
  // Operational, trusted error
  if (createError.isHttpError(err)) {
    console.log(err.message, err.statusCode);

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown error
  console.error(err);

  return res.status(HTTP_CODE.SERVER_ERROR).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_CODE.SERVER_ERROR;
  err.status = 'error';

  let error = Object.create(err);

  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.code === 'LIMIT_FILE_SIZE') error = handleLimitFIleSizeError(error);
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (isCelebrateError(error)) error = handleJoiError(error);

  sendError(error, req, res);
};
