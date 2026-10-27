import request from 'supertest';
import app from '../src/app.js';

describe('Health and System Routes', () => {
  it('GET / should return 200 with API welcome info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('IMovies API');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/health should return health status object', async () => {
    const res = await request(app).get('/api/health');
    // In test environment without active DB, status is 503 (degraded) or 200 (healthy)
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('imovies-backend');
    expect(['healthy', 'degraded']).toContain(res.body.status);
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(res.body.environment).toBe('test');
    expect(res.body.database).toBeDefined();
    expect(typeof res.body.database.status).toBe('string');
  });

  it('GET /api/nonexistent-route-for-testing should trigger 404 not found handler', async () => {
    const res = await request(app).get('/api/nonexistent-route-for-testing');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot GET /api/nonexistent-route-for-testing');
  });
});
