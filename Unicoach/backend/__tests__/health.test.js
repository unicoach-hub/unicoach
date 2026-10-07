const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('System Health & Diagnostics API', () => {
  afterAll(async () => {
    // Cleanly close mongoose connection after test suite
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  test('GET /api/health should return system status and memory metrics', async () => {
    const res = await request(app).get('/api/health');
    
    // Status can be 200 (if DB connected) or 503 (if DB offline in CI)
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memoryUsage');
  });

  test('GET /api/non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/non-existent-route-for-testing-404');
    expect(res.status).toBe(404);
  });
});
