const ApiResponse = require('../utils/response');

/**
 * Centralized error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  // Handle unique constraint violations from PostgreSQL (error code 23505)
  if (err.code === '23505') {
    return ApiResponse.error(res, 'Data duplikat: Presensi untuk tanggal ini sudah tercatat.', null, 409);
  }

  // Hide detailed stack trace in production
  const errors = process.env.NODE_ENV === 'development' ? { stack: err.stack, details: err } : null;

  return ApiResponse.error(res, message, errors, statusCode);
};

module.exports = errorHandler;
