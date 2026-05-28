'use strict';

const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Analytics
 *   description: Uptime and performance analytics
 */

/**
 * @openapi
 * /analytics:
 *   get:
 *     summary: Get global analytics across all user monitors
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMonitors:
 *                       type: integer
 *                     activeMonitors:
 *                       type: integer
 *                     monitorsUp:
 *                       type: integer
 *                     monitorsDown:
 *                       type: integer
 *                     unreadAlerts:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', analyticsController.global);

/**
 * @openapi
 * /analytics/{monitorId}:
 *   get:
 *     summary: Get detailed analytics for a specific monitor
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: monitorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the monitor
 *     responses:
 *       200:
 *         description: Detailed monitor analytics including uptime %, avg response time, recent results
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Monitor not found
 */
router.get('/:monitorId', analyticsController.byMonitor);

module.exports = router;
