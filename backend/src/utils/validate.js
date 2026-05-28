'use strict';

const { ZodError } = require('zod');

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Attaches the parsed, type-safe data to req.validated on success.
 * Passes a formatted error to next() on failure.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Format Zod errors into a user-friendly structure
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      const err = new Error('Validation failed');
      err.statusCode = 400;
      err.isValidationError = true;
      err.errors = errors;
      return next(err);
    }

    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
