import { AppError } from '../utils/AppError.js';

/**
 * 404 handler for routes not found
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} on this server`, 404));
};

export default notFoundHandler;
