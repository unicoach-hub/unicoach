const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';
const app = require('../server');

// Every request here is rejected before it reaches the database
describe('Auth API & Security Validation', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  test('POST /api/auth/register should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('POST /api/auth/register needs a password (no SMS/OTP sign-up)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Student', email: 'student@example.com', phone: '+919876543210' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('POST /api/auth/login with only a phone number is rejected (no phone/OTP login)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phone: '+919876543210' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('POST /api/auth/verify-otp no longer exists', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '+919876543210', otp: '123456' });

    expect(res.status).toBe(404);
  });
});
