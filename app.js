const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRouters');
const bookingRouter = require('./routes/bookingRouters');
const viewRouter = require('./routes/viewRouters');

// Start express app:
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files:
app.use(express.static(path.join(__dirname, 'public')));

// 1) GLOBAL MIDDLEWARES:
// Set security HTTP headers:
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      connectSrc: ["'self'", 'https://natours-production-1fa4.up.railway.app'],
    },
  }),
);

// Enable CORS
app.use(
  cors({
    origin: [
      'https://natours-production-1fa4.up.railway.app',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  }),
);

// Development logging:
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// Limit requests from the same API:
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000, //in miliseconds
  message: 'Too many requests from this IP!! Please try again in an hour.',
});
app.use('/api', limiter);

// Body parser, reading data from the body to req.body, and limit data size:
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection:
app.use(mongoSanitize());

// Data sanitization against Cross-Site Scripting (XSS):
app.use(xss());

// Prevent parameter pollutions:
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
      'maxGroupSize',
    ], // Array of properties that allow duplicates in the query string
  }),
);

app.use(compression());

// Test middleware:
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES:
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
