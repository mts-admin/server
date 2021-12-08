const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const createError = require('http-errors');
// const xss = require('xss-clean');

const router = require('./routes');
const globalErrorHandler = require('./controllers/error-controller');
const HTTP_CODE = require('./constants/http-codes');

const app = express();

app.set('view engine', 'pug');

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
app.options('*', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers (should be placed first)
app.use(helmet());

// Limit requests from same IP
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
// app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compress all responses
app.use(compression());

// 2) ROUTES
app.use('/api/v1', router);

require('./cronjobs');

// for routes which are not exists
app.all('*', (req, res, next) => {
  next(
    createError(
      HTTP_CODE.NOT_FOUND,
      `Can't find ${req.originalUrl} on this server`
    )
  );
});

// 3) Global error handler
app.use(globalErrorHandler);

module.exports = app;
