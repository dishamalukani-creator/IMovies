import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware to check validation results from express-validator
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new AppError('Input validation failed', 400, formattedErrors));
  }
  next();
};

export default validateRequest;
