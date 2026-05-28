'use strict';

const Monitor = require('../models/Monitor');

/**
 * Create a new monitor.
 */
async function create(data) {
  const monitor = new Monitor(data);
  await monitor.save();
  return monitor.toJSON();
}

/**
 * Find a monitor by ID.
 */
async function findById(id) {
  return Monitor.findById(id).lean();
}

/**
 * Get all monitors for a user with pagination.
 * @param {string} userId
 * @param {object} options - { page, limit }
 * @returns {{ monitors: Array, total: number }}
 */
async function findByUserId(userId, { page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const [monitors, total] = await Promise.all([
    Monitor.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Monitor.countDocuments({ userId }),
  ]);
  return { monitors, total };
}

/**
 * Fetch all active monitors (used by cron job).
 */
async function findActiveMonitors() {
  return Monitor.find({ isActive: true }).lean();
}

/**
 * Update monitor fields by ID.
 */
async function update(id, data) {
  return Monitor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

/**
 * Delete a monitor by ID.
 */
async function remove(id) {
  return Monitor.findByIdAndDelete(id).lean();
}

/**
 * Increment consecutiveFailures counter.
 */
async function incrementFailures(id) {
  return Monitor.findByIdAndUpdate(
    id,
    { $inc: { consecutiveFailures: 1 } },
    { new: true }
  ).lean();
}

/**
 * Reset consecutiveFailures to 0 and update lastStatus.
 */
async function resetFailures(id) {
  return Monitor.findByIdAndUpdate(
    id,
    { consecutiveFailures: 0, lastStatus: 'up' },
    { new: true }
  ).lean();
}

/**
 * Update lastChecked timestamp and lastStatus.
 */
async function updateLastChecked(id, status) {
  return Monitor.findByIdAndUpdate(
    id,
    { lastChecked: new Date(), lastStatus: status },
    { new: true }
  ).lean();
}

module.exports = {
  create,
  findById,
  findByUserId,
  findActiveMonitors,
  update,
  remove,
  incrementFailures,
  resetFailures,
  updateLastChecked,
};
