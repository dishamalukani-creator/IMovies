import { generateToken, verifyToken } from '../src/utils/jwt.js';

describe('JWT Utility Service', () => {
  it('should generate a valid signed JWT and decode payload correctly', () => {
    const payload = {
      id: '507f1f77bcf86cd799439011',
      role: 'customer',
      username: 'test_user',
      email: 'test@imovies.com',
    };

    const token = generateToken(payload, '1h');
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.username).toBe(payload.username);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.exp).toBeDefined();
  });

  it('should generate an admin token with admin role', () => {
    const payload = {
      id: '607f1f77bcf86cd799439022',
      role: 'admin',
      username: 'admin_master',
      email: 'admin@imovies.com',
    };

    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.role).toBe('admin');
  });

  it('should throw an error when verifying an invalid or tampered token', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tamperedsignature';
    expect(() => {
      verifyToken(invalidToken);
    }).toThrow();
  });
});
