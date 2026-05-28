'use strict';

const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * GET /api/v1/analytics
 * Global analytics across all monitors for the authenticated user.
 */
const global = asyncHandler(async (req, res) => {
  const data = await analyticsService.getGlobalAnalytics(req.user.id);
  successResponse(res, 'Global analytics retrieved', data);
});

/**
 * GET /api/v1/analytics/:monitorId
 * Detailed analytics for a single monitor.
 */
const byMonitor = asyncHandler(async (req, res) => {
  const data = await analyticsService.getMonitorAnalytics(req.params.monitorId, req.user.id);
  successResponse(res, 'Monitor analytics retrieved', data);
});

module.exports = { global, byMonitor };
