'use strict';

const monitorRepo = require('../repositories/monitor.repository');
const { HTTP_STATUS, DEFAULT_PAGINATION } = require('../utils/constants');

function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Assert that a monitor exists and belongs to the requesting user.
 */
async function assertOwnership(monitorId, userId) {
  const monitor = await monitorRepo.findById(monitorId);
  if (!monitor) throw createError('Monitor not found', HTTP_STATUS.NOT_FOUND);
  if (monitor.userId.toString() !== userId.toString()) {
    throw createError('Forbidden: you do not own this monitor', HTTP_STATUS.FORBIDDEN);
  }
  return monitor;
}

/**
 * Create a new monitor for a user.
 */
async function createMonitor(userId, data) {
  return monitorRepo.create({ ...data, userId });
}

/**
 * Get paginated monitors for a user.
 */
async function getUserMonitors(userId, page, limit) {
  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGINATION.PAGE);
  const l = Math.min(
    parseInt(limit, 10) || DEFAULT_PAGINATION.LIMIT,
    DEFAULT_PAGINATION.MAX_LIMIT
  );
  const { monitors, total } = await monitorRepo.findByUserId(userId, { page: p, limit: l });
  return {
    monitors,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    },
  };
}

/**
 * Get a single monitor by ID (ownership-checked).
 */
async function getMonitorById(monitorId, userId) {
  return assertOwnership(monitorId, userId);
}

/**
 * Update a monitor (ownership-checked).
 */
async function updateMonitor(monitorId, userId, data) {
  await assertOwnership(monitorId, userId);
  return monitorRepo.update(monitorId, data);
}

/**
 * Delete a monitor and all its results (ownership-checked).
 */
async function deleteMonitor(monitorId, userId) {
  await assertOwnership(monitorId, userId);
  return monitorRepo.remove(monitorId);
}

/**
 * Toggle a monitor's active state (ownership-checked).
 */
async function toggleMonitor(monitorId, userId, isActive) {
  await assertOwnership(monitorId, userId);
  return monitorRepo.update(monitorId, { isActive });
}

module.exports = {
  createMonitor,
  getUserMonitors,
  getMonitorById,
  updateMonitor,
  deleteMonitor,
  toggleMonitor,
};
