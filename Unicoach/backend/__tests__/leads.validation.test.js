const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');

describe('Leads API & Zod Input Validation', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  test('POST /api/leads/submit should reject empty body with 400 Validation failed', async () => {
    const res = await request(app)
      .post('/api/leads/submit')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
    expect(res.body).toHaveProperty('details');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('POST /api/leads/submit should reject invalid email and phone format', async () => {
    const res = await request(app)
      .post('/api/leads/submit')
      .send({
        name: 'A', // too short (< 2 chars)
        email: 'invalid-email-format',
        phone: '123' // too short (< 10 digits)
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    
    const fieldsWithErrors = res.body.details.map(d => d.field);
    expect(fieldsWithErrors).toContain('name');
    expect(fieldsWithErrors).toContain('email');
    expect(fieldsWithErrors).toContain('phone');
  });
});
