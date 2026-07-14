'use strict';

const express = require('express');
const router = express.Router();

const alertController = require('../controllers/alert.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Alerts
 *   description: Monitor down/recovered alerts
 */

/**
 * @openapi
 * /alerts:
 *   get:
 *     summary: Get all alerts for the authenticated user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of alerts
 */
router.get('/', alertController.getAll);
router.patch('/read-all', alertController.markAllRead);

module.exports = router;