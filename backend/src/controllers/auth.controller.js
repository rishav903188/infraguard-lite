'use strict';

const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.validated);
  successResponse(
    res,
    'Registration successful',
    { user, accessToken, refreshToken },
    HTTP_STATUS.CREATED
  );
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  successResponse(res, 'Login successful', { user, accessToken, refreshToken });
});

/**
 * POST /api/v1/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated;
  const tokens = await authService.refresh(refreshToken);
  successResponse(res, 'Token refreshed', tokens);
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  successResponse(res, 'Logged out successfully');
});

/**
 * GET /api/v1/auth/me
 */
const me = asyncHandler(async (req, res) => {
  successResponse(res, 'Current user', { user: req.user });
});

module.exports = { register, login, refresh, logout, me };
