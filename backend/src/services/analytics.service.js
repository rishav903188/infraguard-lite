'use strict';

const monitorRepo = require('../repositories/monitor.repository');
const resultRepo = require('../repositories/result.repository');
const alertRepo = require('../repositories/alert.repository');
const { HTTP_STATUS } = require('../utils/constants');

function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Assert monitor ownership before returning analytics.
 */
async function assertMonitorOwnership(monitorId, userId) {
  const monitor = await monitorRepo.findById(monitorId);
  if (!monitor) throw createError('Monitor not found', HTTP_STATUS.NOT_FOUND);
  if (monitor.userId.toString() !== userId.toString()) {
    throw createError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
  return monitor;
}

/**
 * Get detailed analytics for a single monitor.
 */
async function getMonitorAnalytics(monitorId, userId) {
  const monitor = await assertMonitorOwnership(monitorId, userId);

  const [stats, recentResults, latestResult, alerts] = await Promise.all([
    resultRepo.getAggregatedStats(monitor._id),
    resultRepo.getRecentResults(monitor._id, 50),
    resultRepo.getLatestResult(monitor._id),
    alertRepo.findByMonitorId(monitor._id, { page: 1, limit: 5 }),
  ]);

  return {
    monitor: {
      id: monitor._id,
      name: monitor.name,
      url: monitor.url,
      method: monitor.method,
      interval: monitor.interval,
      isActive: monitor.isActive,
      lastChecked: monitor.lastChecked,
      lastStatus: monitor.lastStatus,
    },
    stats,
    latestResult,
    recentResults,
    recentAlerts: alerts.alerts,
  };
}

/**
 * Get aggregated analytics across ALL of a user's monitors.
 */
async function getGlobalAnalytics(userId) {
  const { monitors } = await monitorRepo.findByUserId(userId, { page: 1, limit: 1000 });

  if (!monitors.length) {
    return {
      totalMonitors: 0,
      activeMonitors: 0,
      monitorsUp: 0,
      monitorsDown: 0,
      unreadAlerts: 0,
      monitors: [],
    };
  }

  const monitorIds = monitors.map((m) => m._id);

  const [statsPerMonitor, unreadAlerts] = await Promise.all([
    Promise.all(monitorIds.map((id) => resultRepo.getAggregatedStats(id))),
    alertRepo.countUnread(userId),
  ]);

  const enriched = monitors.map((m, i) => ({
    id: m._id,
    name: m.name,
    url: m.url,
    isActive: m.isActive,
    lastStatus: m.lastStatus,
    lastChecked: m.lastChecked,
    stats: statsPerMonitor[i],
  }));

  const activeMonitors = monitors.filter((m) => m.isActive).length;
  const monitorsUp = monitors.filter((m) => m.lastStatus === 'up').length;
  const monitorsDown = monitors.filter((m) => m.lastStatus === 'down').length;

  return {
    totalMonitors: monitors.length,
    activeMonitors,
    monitorsUp,
    monitorsDown,
    unreadAlerts,
    monitors: enriched,
  };
}

module.exports = { getMonitorAnalytics, getGlobalAnalytics };
