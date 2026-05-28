'use strict';

const { z } = require('zod');

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const createMonitorSchema = z.object({
  name: z
    .string({ required_error: 'Monitor name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  url: z
    .string({ required_error: 'URL is required' })
    .url('Must be a valid URL')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://'),

  method: z
    .enum(VALID_METHODS, {
      errorMap: () => ({ message: `Method must be one of: ${VALID_METHODS.join(', ')}` }),
    })
    .default('GET'),

  interval: z
    .number({ invalid_type_error: 'Interval must be a number' })
    .int('Interval must be an integer')
    .min(1, 'Interval must be at least 1 minute')
    .max(60, 'Interval must be at most 60 minutes')
    .default(5),

  headers: z.record(z.string()).optional().default({}),
});

const updateMonitorSchema = createMonitorSchema.partial();

const toggleMonitorSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive (boolean) is required' }),
});

module.exports = { createMonitorSchema, updateMonitorSchema, toggleMonitorSchema };
