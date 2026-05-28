'use strict';

const cron = require('node-cron');
const monitorRepo = require('../repositories/monitor.repository');
const healthService = require('../services/health.service');
const logger = require('../config/logger');

// Max concurrent health checks to avoid hammering the event loop
const CONCURRENCY_LIMIT = 10;

/**
 * Run health checks in batches to limit concurrency.
 * @param {Array} monitors
 */
async function runChecksInBatches(monitors) {
  const results = { checked: 0, up: 0, down: 0, errors: 0 };

  for (let i = 0; i < monitors.length; i += CONCURRENCY_LIMIT) {
    const batch = monitors.slice(i, i + CONCURRENCY_LIMIT);

    const settled = await Promise.allSettled(
      batch.map((monitor) => healthService.checkMonitor(monitor))
    );

    settled.forEach((result, idx) => {
      results.checked++;
      if (result.status === 'fulfilled') {
        result.value.status === 'up' ? results.up++ : results.down++;
      } else {
        results.errors++;
        logger.error(
          `[HealthCheckJob] Unhandled error for monitor "${batch[idx].name}": ${result.reason?.message}`
        );
      }
    });
  }

  return results;
}

/**
 * Register and start the health check cron job.
 * Runs every 5 minutes: "5 * * * *"
 */
function startHealthCheckJob() {
  const schedule = '*/5 * * * *';

  logger.info(`[HealthCheckJob] Registered — schedule: "${schedule}"`);

  const task = cron.schedule(schedule, async () => {
    logger.info('[HealthCheckJob] Starting health check run...');
    const jobStart = Date.now();

    try {
      const activeMonitors = await monitorRepo.findActiveMonitors();

      if (activeMonitors.length === 0) {
        logger.info('[HealthCheckJob] No active monitors. Skipping.');
        return;
      }

      logger.info(`[HealthCheckJob] Checking ${activeMonitors.length} active monitor(s)...`);

      const results = await runChecksInBatches(activeMonitors);
      const duration = ((Date.now() - jobStart) / 1000).toFixed(2);

      logger.info(
        `[HealthCheckJob] Run complete in ${duration}s — ` +
          `checked: ${results.checked}, up: ${results.up}, down: ${results.down}, errors: ${results.errors}`
      );
    } catch (err) {
      logger.error(`[HealthCheckJob] Job failed: ${err.message}`, { stack: err.stack });
    }
  });

  return task;
}

module.exports = { startHealthCheckJob };
