import request from 'supertest';
import app from '../src/app.js';
import { generateToken } from '../src/utils/jwt.js';

describe('Authentication & Access Control', () => {
  describe('Input Validation & Error Handling', () => {
    it('POST /api/auth/register should reject empty payloads with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Input validation failed');
      expect(res.body.details).toBeDefined();
    });

    it('POST /api/auth/register should reject invalid emails', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'valid_user',
        email: 'not-an-email',
        password: 'Password123!',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should reject empty credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes & Authorization', () => {
    it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('GET /api/auth/me should reject invalid Bearer tokens with 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_malformed_token');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/movies should reject unauthenticated movie creation with 401', async () => {
      const res = await request(app).post('/api/movies').send({ title: 'New Movie' });
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/movies should reject customer role from admin endpoints with 403', async () => {
      const customerToken = generateToken({
        id: '507f1f77bcf86cd799439011',
        role: 'customer',
        username: 'john_customer',
        email: 'john@example.com',
      });

      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ title: 'Unauthorized Movie Creation' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('privileges');
    });

    it('GET /api/bookings/admin/stats should reject customer token with 403', async () => {
      const customerToken = generateToken({
        id: '507f1f77bcf86cd799439011',
        role: 'customer',
        username: 'john_customer',
        email: 'john@example.com',
      });

      const res = await request(app)
        .get('/api/bookings/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
