import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

/**
 * Authenticates requests via Bearer JWT token in Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in to access this resource.', 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Attach user payload
    req.user = {
      id: decoded.id,
      role: decoded.role || 'customer',
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication: attaches req.user if token is valid, otherwise continues as guest
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        req.user = {
          id: decoded.id,
          role: decoded.role || 'customer',
          username: decoded.username,
          email: decoded.email,
        };
      } catch (err) {
        // Token invalid/expired - treat as guest
        req.user = null;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'customer')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: requires ${roles.join(' or ')} privileges.`,
          403
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireCustomer = requireRole('customer');

export default {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireCustomer,
};
