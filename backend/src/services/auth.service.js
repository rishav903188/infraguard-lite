'use strict';

const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const tokenService = require('./token.service');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Create error helper for service-layer errors.
 */
function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
async function register(data) {
  // Check for existing user
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw createError('Email already registered', HTTP_STATUS.CONFLICT);
  }

  // Create user (password hashed by pre-save hook in model)
  const user = await userRepo.create(data);

  const tokenPayload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken = tokenService.generateAccessToken(tokenPayload);
  const refreshToken = tokenService.generateRefreshToken({ id: user._id.toString() });

  // Store hashed refresh token
  await userRepo.updateRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
}

/**
 * Login an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
async function login(email, password) {
  // Explicitly include password field for comparison
  const userDoc = await userRepo.findByEmail(email, true);
  if (!userDoc) {
    throw createError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, userDoc.password);
  if (!isMatch) {
    throw createError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const tokenPayload = { id: userDoc._id.toString(), email: userDoc.email, role: userDoc.role };
  const accessToken = tokenService.generateAccessToken(tokenPayload);
  const refreshToken = tokenService.generateRefreshToken({ id: userDoc._id.toString() });

  // Store the new refresh token
  await userRepo.updateRefreshToken(userDoc._id, refreshToken);

  // Strip sensitive fields from the response
  const { password: _, refreshToken: __, ...user } = userDoc;
  return { user, accessToken, refreshToken };
}

/**
 * Issue a new access token using a valid refresh token.
 * @param {string} refreshToken
 * @returns {{ accessToken: string, refreshToken: string }}
 */
async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(refreshToken);
  } catch {
    throw createError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
  }

  // Fetch user with stored refresh token
  const userDoc = await userRepo.findById(decoded.id, true);
  if (!userDoc || userDoc.refreshToken !== refreshToken) {
    throw createError('Refresh token mismatch — please login again', HTTP_STATUS.UNAUTHORIZED);
  }

  // Rotate: issue new pair
  const tokenPayload = { id: userDoc._id.toString(), email: userDoc.email, role: userDoc.role };
  const newAccessToken = tokenService.generateAccessToken(tokenPayload);
  const newRefreshToken = tokenService.generateRefreshToken({ id: userDoc._id.toString() });

  await userRepo.updateRefreshToken(userDoc._id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Logout: clear refresh token from DB.
 * @param {string} userId
 */
async function logout(userId) {
  await userRepo.updateRefreshToken(userId, null);
}

module.exports = { register, login, refresh, logout };
