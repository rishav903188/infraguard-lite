'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate a short-lived JWT access token.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string}
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

/**
 * Generate a long-lived JWT refresh token.
 * @param {{ id: string }} payload
 * @returns {string}
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

/**
 * Verify and decode a JWT access token.
 * @param {string} token
 * @returns {{ id: string, email: string, role: string }}
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

/**
 * Verify and decode a JWT refresh token.
 * @param {string} token
 * @returns {{ id: string }}
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
