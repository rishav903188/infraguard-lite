'use strict';

const User = require('../models/User');

/**
 * Find a user by email, optionally including the password field.
 */
async function findByEmail(email, includePassword = false) {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) query.select('+password');
  return query.lean();
}

/**
 * Find a user by ID, optionally including the refresh token.
 */
async function findById(id, includeRefreshToken = false) {
  const query = User.findById(id);
  if (includeRefreshToken) query.select('+refreshToken');
  return query.lean();
}

/**
 * Create a new user document.
 * @param {object} data - { name, email, password }
 */
async function create(data) {
  const user = new User(data);
  await user.save();
  return user.toJSON();
}

/**
 * Update the refresh token (or clear it on logout).
 * @param {string} userId
 * @param {string|null} refreshToken - pass null to clear
 */
async function updateRefreshToken(userId, refreshToken) {
  return User.findByIdAndUpdate(
    userId,
    { refreshToken },
    { new: true }
  ).lean();
}

/**
 * Find a user by ID returning the Mongoose document (not lean),
 * used for password comparison via the model method.
 */
async function findByIdDoc(id) {
  return User.findById(id).select('+password');
}

module.exports = {
  findByEmail,
  findById,
  findByIdDoc,
  create,
  updateRefreshToken,
};
