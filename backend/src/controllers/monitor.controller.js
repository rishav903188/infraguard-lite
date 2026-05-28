'use strict';

const monitorService = require('../services/monitor.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * POST /api/v1/monitors
 */
const create = asyncHandler(async (req, res) => {
  const monitor = await monitorService.createMonitor(req.user.id, req.validated);
  successResponse(res, 'Monitor created', { monitor }, HTTP_STATUS.CREATED);
});

/**
 * GET /api/v1/monitors
 */
const getAll = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await monitorService.getUserMonitors(req.user.id, page, limit);
  successResponse(res, 'Monitors retrieved', result);
});

/**
 * GET /api/v1/monitors/:id
 */
const getOne = asyncHandler(async (req, res) => {
  const monitor = await monitorService.getMonitorById(req.params.id, req.user.id);
  successResponse(res, 'Monitor retrieved', { monitor });
});

/**
 * PUT /api/v1/monitors/:id
 */
const update = asyncHandler(async (req, res) => {
  const monitor = await monitorService.updateMonitor(req.params.id, req.user.id, req.validated);
  successResponse(res, 'Monitor updated', { monitor });
});

/**
 * DELETE /api/v1/monitors/:id
 */
const remove = asyncHandler(async (req, res) => {
  await monitorService.deleteMonitor(req.params.id, req.user.id);
  successResponse(res, 'Monitor deleted');
});

/**
 * PATCH /api/v1/monitors/:id/toggle
 */
const toggle = asyncHandler(async (req, res) => {
  const monitor = await monitorService.toggleMonitor(
    req.params.id,
    req.user.id,
    req.validated.isActive
  );
  const state = monitor.isActive ? 'resumed' : 'paused';
  successResponse(res, `Monitor ${state}`, { monitor });
});

module.exports = { create, getAll, getOne, update, remove, toggle };
