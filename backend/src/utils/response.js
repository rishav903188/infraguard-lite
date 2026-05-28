'use strict';

/**
 * Send a standardized success response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function successResponse(res, message, data = null, statusCode = 200) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Send a standardized error response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} error - additional error detail (omitted in production)
 * @param {number} statusCode - HTTP status code (default: 500)
 */
function errorResponse(res, message, error = null, statusCode = 500) {
  const body = { success: false, message };
  if (error !== null && process.env.NODE_ENV !== 'production') {
    body.error = error;
  }
  return res.status(statusCode).json(body);
}

module.exports = { successResponse, errorResponse };
