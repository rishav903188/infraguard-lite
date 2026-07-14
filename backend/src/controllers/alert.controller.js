'use strict';

const alertRepo = require('../repositories/alert.repository');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * GET /api/v1/alerts
 */
const getAll = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const { alerts, total } = await alertRepo.findByUserId(req.user.id, { page, limit });

  successResponse(res, 'Alerts retrieved', {
    alerts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * PATCH /api/v1/alerts/read-all
 */
const markAllRead = asyncHandler(async (req, res) => {
  await alertRepo.markAllReadByUser(req.user.id);
  successResponse(res, 'All alerts marked as read');
});

module.exports = { getAll, markAllRead };