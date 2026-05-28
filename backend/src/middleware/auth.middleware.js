'use strict';

const tokenService = require('../services/token.service');
const { HTTP_STATUS, ROLES } = require('../utils/constants');
const { errorResponse } = require('../utils/response');

/**
 * authenticate — Verifies the Bearer JWT access token.
 * On success, attaches `req.user = { id, email, role }`.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization header missing or malformed', null, HTTP_STATUS.UNAUTHORIZED);
  }

  const token = authHeader.slice(7); // strip "Bearer "
  try {
    const decoded = tokenService.verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
    return errorResponse(res, message, null, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * authorize — Role-based access control gate.
 * Must be used AFTER authenticate.
 *
 * @param {...string} roles - allowed roles
 * @returns Express middleware
 *
 * @example
 * router.delete('/admin-only', authenticate, authorize(ROLES.ADMIN), handler)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated', null, HTTP_STATUS.UNAUTHORIZED);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${roles.join(' or ')}`,
        null,
        HTTP_STATUS.FORBIDDEN
      );
    }
    next();
  };
}

module.exports = { authenticate, authorize };
