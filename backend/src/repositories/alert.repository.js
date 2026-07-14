'use strict';

const Alert = require('../models/Alert');

/**
 * Create a new alert.
 */
async function create(data) {
  const alert = new Alert(data);
  await alert.save();
  return alert.toJSON();
}

/**
 * Get all alerts for a monitor, newest first.
 */
async function findByMonitorId(monitorId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [alerts, total] = await Promise.all([
    Alert.find({ monitorId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Alert.countDocuments({ monitorId }),
  ]);
  return { alerts, total };
}

/**
 * Get all alerts for a user, newest first.
 */
async function findByUserId(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [alerts, total] = await Promise.all([
    Alert.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('monitorId', 'name url')
      .lean(),
    Alert.countDocuments({ userId }),
  ]);
  return { alerts, total };
}

/**
 * Count unread alerts for a user.
 */
async function countUnread(userId) {
  return Alert.countDocuments({ userId, isRead: false });
}

/**
 * Mark all alerts for a monitor as read.
 */
async function markReadByMonitor(monitorId) {
  return Alert.updateMany({ monitorId, isRead: false }, { isRead: true });
}

/**
 * Mark all alerts for a user as read.
 */
async function markAllReadByUser(userId) {
  return Alert.updateMany({ userId, isRead: false }, { isRead: true });
}

module.exports = {
  create,
  findByMonitorId,
  findByUserId,
  countUnread,
  markReadByMonitor,
  markAllReadByUser, // ← naya
};
