'use strict';

const dotenv = require('dotenv');
dotenv.config();

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

/**
 * Validate that all required environment variables are set.
 * Fails fast at startup if anything is missing.
 */
function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  healthCheck: {
    timeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS, 10) || 10000,
    consecutiveFailuresThreshold:
      parseInt(process.env.CONSECUTIVE_FAILURES_THRESHOLD, 10) || 3,
  },

  isDev: () => env.nodeEnv === 'development',
  isTest: () => env.nodeEnv === 'test',
  isProd: () => env.nodeEnv === 'production',
};

module.exports = { env, validateEnv };
