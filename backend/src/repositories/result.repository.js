'use strict';

const MonitoringResult = require('../models/MonitoringResult');

/**
 * Create a new monitoring result record.
 */
async function create(data) {
  const result = new MonitoringResult(data);
  await result.save();
  return result.toJSON();
}

/**
 * Get paginated results for a monitor, newest first.
 * @param {string} monitorId
 * @param {object} options - { page, limit }
 */
async function findByMonitorId(monitorId, { page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const [results, total] = await Promise.all([
    MonitoringResult.find({ monitorId })
      .sort({ checkedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MonitoringResult.countDocuments({ monitorId }),
  ]);
  return { results, total };
}

/**
 * Aggregate analytics for a single monitor.
 * Returns: totalChecks, totalFailures, avgResponseTime, uptimePercentage
 */
async function getAggregatedStats(monitorId) {
  const [agg] = await MonitoringResult.aggregate([
    { $match: { monitorId: monitorId } },
    {
      $group: {
        _id: null,
        totalChecks: { $sum: 1 },
        totalFailures: {
          $sum: { $cond: [{ $eq: ['$status', 'down'] }, 1, 0] },
        },
        avgResponseTime: { $avg: '$responseTime' },
      },
    },
    {
      $project: {
        _id: 0,
        totalChecks: 1,
        totalFailures: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        uptimePercentage: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$totalChecks', '$totalFailures'] },
                    '$totalChecks',
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
  ]);

  return (
    agg || {
      totalChecks: 0,
      totalFailures: 0,
      avgResponseTime: null,
      uptimePercentage: null,
    }
  );
}

/**
 * Get last N results for a monitor (used for chart data).
 */
async function getRecentResults(monitorId, limit = 50) {
  return MonitoringResult.find({ monitorId })
    .sort({ checkedAt: -1 })
    .limit(limit)
    .select('status statusCode responseTime checkedAt')
    .lean();
}

/**
 * Get the most recent result for a monitor.
 */
async function getLatestResult(monitorId) {
  return MonitoringResult.findOne({ monitorId })
    .sort({ checkedAt: -1 })
    .lean();
}

module.exports = {
  create,
  findByMonitorId,
  getAggregatedStats,
  getRecentResults,
  getLatestResult,
};
