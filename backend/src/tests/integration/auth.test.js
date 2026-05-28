'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_long_32chars';
process.env.MONGO_URI = 'mongodb://localhost/test';

const request = require('supertest');
const app = require('../../app');
const testDb = require('../testDb');

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await testDb.connect();
  });

  afterEach(async () => {
    await testDb.clearDatabase();
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  const validUser = {
    name: 'Integration User',
    email: 'integration@example.com',
    password: 'Password123',
  };

  // ─── POST /api/v1/auth/register ───────────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    it('201 — registers a new user and returns tokens', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('400 — rejects invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('400 — rejects weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('409 — rejects duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
      const res = await request(app).post('/api/v1/auth/register').send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── POST /api/v1/auth/login ──────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);
    });

    it('200 — logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('401 — rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPass1' });

      expect(res.status).toBe(401);
    });

    it('401 — rejects unknown email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/v1/auth/refresh ────────────────────────────────────────────
  describe('POST /api/v1/auth/refresh', () => {
    it('200 — issues new tokens with valid refresh token', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send(validUser);
      const { refreshToken } = reg.body.data;

      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // token rotated
    });

    it('401 — rejects invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'bad.token.here' });

      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/v1/auth/logout ─────────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    it('200 — logs out and invalidates refresh token', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send(validUser);
      const { accessToken, refreshToken } = reg.body.data;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(logoutRes.status).toBe(200);

      // Old refresh token should now be rejected
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401);
    });

    it('401 — rejects logout without token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/v1/auth/me ──────────────────────────────────────────────────
  describe('GET /api/v1/auth/me', () => {
    it('200 — returns current user info', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send(validUser);
      const { accessToken } = reg.body.data;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('401 — rejects request without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
