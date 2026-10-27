import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'imovies_cinematic_booking_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token
 * @param {Object} payload - { id, role, username, email }
 * @param {string} [expiresIn]
 * @returns {string} Signed token
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  generateToken,
  verifyToken,
};
