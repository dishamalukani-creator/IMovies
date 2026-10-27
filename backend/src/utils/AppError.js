/**
 * AppError represents an operational error that can be predicted and handled gracefully.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} statusCode - HTTP status code (4xx or 5xx)
   * @param {Array|Object} [details=null] - Optional structured validation/error details
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
