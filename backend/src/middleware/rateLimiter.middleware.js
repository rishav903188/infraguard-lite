'use strict';

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

/**
 * Format rate limit exceeded response to match our standard error format.
 */
const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
  });
};

/**
 * Global rate limiter: 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  handler,
  skip: () => env.isTest(), // disable during tests
});

/**
 * Strict auth limiter: 10 requests per 15 minutes per IP.
 * Applied only to auth routes to prevent brute force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: undefined,
  handler,
  skip: () => env.isTest(),
});

module.exports = { globalLimiter, authLimiter };
