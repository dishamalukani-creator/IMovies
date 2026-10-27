import { AppError } from '../utils/AppError.js';

/**
 * Normalizes Mongoose CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Normalizes Mongoose duplicate field key error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value for '${field}': "${value}". Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Normalizes Mongoose validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError('Validation failed', 400, errors);
};

/**
 * Development error payload with full debug info
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    details: err.details || null,
    stack: err.stack,
    error: err,
  });
};

/**
 * Production error payload (sanitized)
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    // Programming or unknown error: do not leak details to client
    console.error('💥 UNEXPECTED ERROR:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on the server.',
    });
  }
};

/**
 * Centralized express error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  const env = process.env.NODE_ENV || 'development';

  if (env === 'development' || env === 'test') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default errorHandler;
