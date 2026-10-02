const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const ApiResponse = require('./utils/response');

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
  })
);

// CORS configuration (strictly restricted)
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Length']
  })
);

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api', apiRoutes);

// Catch 404
app.use((req, res) => {
  return ApiResponse.error(res, `Rute ${req.method} ${req.originalUrl} tidak ditemukan`, null, 404);
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
