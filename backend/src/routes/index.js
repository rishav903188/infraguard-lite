'use strict';

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const monitorRoutes = require('./monitor.routes');
const analyticsRoutes = require('./analytics.routes');

/**
 * @openapi
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'InfraGuard Lite API is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
  });
});

router.use('/auth', authRoutes);
router.use('/monitors', monitorRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
