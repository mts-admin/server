const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

const router = require('./routes');
const globalErrorHandler = require('./controllers/error-controller');
const httpCodes = require('./constants/http-codes');

const app = express();

app.set('view engine', 'pug');

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers (should be placed first)
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
// TODO: add allowed tags
app.use(xss());

// Prevent parameter pollution
// TODO: add whitelist params
app.use(
  hpp({
    // whitelist: [],
  })
);

// 2) ROUTES
app.use('/api/v1', router);

// for routes which are not exists
app.all('*', (req, res, next) => {
  next(
    createError(
      httpCodes.NOT_FOUND,
      `Can't find ${req.originalUrl} on this server`
    )
  );
});

// 3) Global error handler
app.use(globalErrorHandler);

module.exports = app;
