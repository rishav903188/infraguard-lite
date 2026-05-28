'use strict';

const axios = require('axios');
const monitorRepo = require('../repositories/monitor.repository');
const resultRepo = require('../repositories/result.repository');
const alertRepo = require('../repositories/alert.repository');
const logger = require('../config/logger');
const { env } = require('../config/env');
const { MONITOR_STATUS, ALERT_TYPES } = require('../utils/constants');

/**
 * Perform a single health check on a monitor.
 * Saves the result, updates monitor state, and triggers alerts.
 *
 * @param {object} monitor - Monitor document
 */
async function checkMonitor(monitor) {
  const startTime = Date.now();
  let status = MONITOR_STATUS.DOWN;
  let statusCode = null;
  let responseTime = null;
  let error = null;

  try {
    const response = await axios({
      method: monitor.method || 'GET',
      url: monitor.url,
      timeout: env.healthCheck.timeoutMs,
      validateStatus: () => true, // don't throw on 4xx/5xx — record them
      headers: monitor.headers ? Object.fromEntries(monitor.headers) : {},
    });

    statusCode = response.status;
    responseTime = Date.now() - startTime;
    // Consider 2xx and 3xx as "up"
    status = statusCode < 400 ? MONITOR_STATUS.UP : MONITOR_STATUS.DOWN;
  } catch (err) {
    responseTime = Date.now() - startTime;
    error = err.message || 'Request failed';
    status = MONITOR_STATUS.DOWN;

    logger.warn(`[HealthCheck] Monitor "${monitor.name}" (${monitor.url}) failed: ${error}`);
  }

  // Save the result record
  await resultRepo.create({
    monitorId: monitor._id,
    status,
    statusCode,
    responseTime,
    error,
    checkedAt: new Date(),
  });

  // Update lastChecked and lastStatus on monitor
  await monitorRepo.updateLastChecked(monitor._id, status);

  if (status === MONITOR_STATUS.DOWN) {
    const updated = await monitorRepo.incrementFailures(monitor._id);
    const failures = updated.consecutiveFailures;

    // Trigger alert on hitting the threshold (and then every Nth hit after)
    if (failures === env.healthCheck.consecutiveFailuresThreshold) {
      await alertRepo.create({
        monitorId: monitor._id,
        userId: monitor.userId,
        type: ALERT_TYPES.DOWN,
        message: `Monitor "${monitor.name}" has been down for ${failures} consecutive checks. URL: ${monitor.url}`,
      });
      logger.warn(`[Alert] DOWN alert created for monitor "${monitor.name}"`);
    }
  } else {
    // Was it previously failing? If so, create a recovered alert
    if (monitor.consecutiveFailures >= env.healthCheck.consecutiveFailuresThreshold) {
      await alertRepo.create({
        monitorId: monitor._id,
        userId: monitor.userId,
        type: ALERT_TYPES.RECOVERED,
        message: `Monitor "${monitor.name}" has recovered. URL: ${monitor.url}`,
      });
      logger.info(`[Alert] RECOVERED alert created for monitor "${monitor.name}"`);
    }
    await monitorRepo.resetFailures(monitor._id);
  }

  return { status, statusCode, responseTime };
}

module.exports = { checkMonitor };
