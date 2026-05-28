'use strict';

const logger = require('../config/logger');

/**
 * Centralized error handler middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 * - Validation errors (Zod, via validate middleware)
 * - Mongoose validation errors
 * - Mongoose duplicate key (E11000)
 * - JWT errors
 * - Generic application errors with statusCode
 * - Unknown/unhandled errors (500)
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const requestId = req.id || 'unknown';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn(`[${requestId}] Mongoose validation error`, { errors });
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    logger.warn(`[${requestId}] Duplicate key: ${field}`);
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Custom validation error (from validate middleware)
  if (err.isValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Application errors with explicit statusCode
  if (err.statusCode) {
    logger.warn(`[${requestId}] App error ${err.statusCode}: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown errors — log full stack in dev, hide details in prod
  logger.error(`[${requestId}] Unhandled error: ${err.message}`, {
    stack: err.stack,
  });

  const body = {
    success: false,
    message: 'Internal server error',
  };

  if (process.env.NODE_ENV === 'development') {
    body.error = err.message;
    body.stack = err.stack;
  }

  return res.status(500).json(body);
}

module.exports = errorMiddleware;
