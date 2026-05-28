'use strict';

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Request logger middleware.
 * - Attaches a unique request ID to req.id and the response header.
 * - Logs method, URL, status code, and duration on response finish.
 */
function requestLogger(req, res, next) {
  req.id = uuidv4();
  req.startTime = Date.now();

  // Expose request ID in response for tracing
  res.setHeader('X-Request-Id', req.id);

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

    logger[level](`${method} ${originalUrl} ${statusCode} — ${duration}ms`, {
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}

module.exports = requestLogger;
