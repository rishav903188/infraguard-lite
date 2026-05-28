'use strict';

const express = require('express');
const router = express.Router();

const monitorController = require('../controllers/monitor.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validate');
const {
  createMonitorSchema,
  updateMonitorSchema,
  toggleMonitorSchema,
} = require('../validators/monitor.validator');

// All monitor routes require authentication
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Monitors
 *   description: Manage API/website monitors
 */

/**
 * @openapi
 * /monitors:
 *   post:
 *     summary: Create a new monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, url]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My API
 *               url:
 *                 type: string
 *                 example: https://api.example.com/health
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS]
 *                 default: GET
 *               interval:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 60
 *                 default: 5
 *               headers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       201:
 *         description: Monitor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createMonitorSchema), monitorController.create);

/**
 * @openapi
 * /monitors:
 *   get:
 *     summary: Get all monitors for authenticated user
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of monitors with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', monitorController.getAll);

/**
 * @openapi
 * /monitors/{id}:
 *   get:
 *     summary: Get a single monitor by ID
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monitor details
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Monitor not found
 */
router.get('/:id', monitorController.getOne);

/**
 * @openapi
 * /monitors/{id}:
 *   put:
 *     summary: Update a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               method:
 *                 type: string
 *               interval:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Monitor updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Monitor not found
 */
router.put('/:id', validate(updateMonitorSchema), monitorController.update);

/**
 * @openapi
 * /monitors/{id}:
 *   delete:
 *     summary: Delete a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monitor deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Monitor not found
 */
router.delete('/:id', monitorController.remove);

/**
 * @openapi
 * /monitors/{id}/toggle:
 *   patch:
 *     summary: Pause or resume a monitor
 *     tags: [Monitors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Monitor paused or resumed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Monitor not found
 */
router.patch('/:id/toggle', validate(toggleMonitorSchema), monitorController.toggle);

module.exports = router;
