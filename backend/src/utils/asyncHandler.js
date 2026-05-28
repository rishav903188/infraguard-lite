'use strict';

/**
 * Wraps an async Express route handler to automatically catch errors
 * and pass them to the next() error middleware — no try/catch boilerplate needed.
 *
 * @param {Function} fn - async route handler
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/resource', asyncHandler(async (req, res) => {
 *   const data = await someService.get();
 *   res.json(data);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
