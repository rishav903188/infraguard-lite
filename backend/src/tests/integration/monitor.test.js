'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_long_32chars';
process.env.MONGO_URI = 'mongodb://localhost/test';

const request = require('supertest');
const app = require('../../app');
const testDb = require('../testDb');

describe('Monitor Integration Tests', () => {
  let accessToken;
  let userId;

  const validUser = {
    name: 'Monitor User',
    email: 'monitors@example.com',
    password: 'Password123',
  };

  const validMonitor = {
    name: 'Test API',
    url: 'https://api.example.com/health',
    method: 'GET',
    interval: 5,
  };

  beforeAll(async () => {
    await testDb.connect();
    const reg = await request(app).post('/api/v1/auth/register').send(validUser);
    accessToken = reg.body.data.accessToken;
    userId = reg.body.data.user._id;
  });

  afterEach(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.collections['monitors']?.deleteMany({});
    await mongoose.connection.collections['monitoringresults']?.deleteMany({});
    await mongoose.connection.collections['alerts']?.deleteMany({});
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  // ─── POST /api/v1/monitors ────────────────────────────────────────────────
  describe('POST /api/v1/monitors', () => {
    it('201 — creates a monitor', async () => {
      const res = await request(app)
        .post('/api/v1/monitors')
        .set(auth())
        .send(validMonitor);

      expect(res.status).toBe(201);
      expect(res.body.data.monitor.name).toBe(validMonitor.name);
      expect(res.body.data.monitor.isActive).toBe(true);
    });

    it('400 — rejects invalid URL', async () => {
      const res = await request(app)
        .post('/api/v1/monitors')
        .set(auth())
        .send({ ...validMonitor, url: 'not-a-url' });

      expect(res.status).toBe(400);
    });

    it('400 — rejects interval out of range', async () => {
      const res = await request(app)
        .post('/api/v1/monitors')
        .set(auth())
        .send({ ...validMonitor, interval: 999 });

      expect(res.status).toBe(400);
    });

    it('401 — rejects unauthenticated request', async () => {
      const res = await request(app).post('/api/v1/monitors').send(validMonitor);
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/v1/monitors ─────────────────────────────────────────────────
  describe('GET /api/v1/monitors', () => {
    it('200 — returns monitors with pagination', async () => {
      await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      await request(app).post('/api/v1/monitors').set(auth()).send({ ...validMonitor, name: 'Second' });

      const res = await request(app).get('/api/v1/monitors').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.monitors).toHaveLength(2);
      expect(res.body.data.pagination).toHaveProperty('total', 2);
    });

    it('200 — respects page and limit query params', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/monitors')
          .set(auth())
          .send({ ...validMonitor, name: `Monitor ${i}` });
      }

      const res = await request(app).get('/api/v1/monitors?page=1&limit=2').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.monitors).toHaveLength(2);
      expect(res.body.data.pagination.totalPages).toBe(3);
    });

    it('401 — requires authentication', async () => {
      const res = await request(app).get('/api/v1/monitors');
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /api/v1/monitors/:id ─────────────────────────────────────────────
  describe('GET /api/v1/monitors/:id', () => {
    it('200 — returns the monitor', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      const res = await request(app).get(`/api/v1/monitors/${id}`).set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.monitor._id).toBe(id);
    });

    it('404 — returns 404 for non-existent monitor', async () => {
      const res = await request(app)
        .get('/api/v1/monitors/507f1f77bcf86cd799439011')
        .set(auth());

      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /api/v1/monitors/:id ─────────────────────────────────────────────
  describe('PUT /api/v1/monitors/:id', () => {
    it('200 — updates the monitor', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      const res = await request(app)
        .put(`/api/v1/monitors/${id}`)
        .set(auth())
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.monitor.name).toBe('Updated Name');
    });
  });

  // ─── DELETE /api/v1/monitors/:id ─────────────────────────────────────────
  describe('DELETE /api/v1/monitors/:id', () => {
    it('200 — deletes the monitor', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      const res = await request(app).delete(`/api/v1/monitors/${id}`).set(auth());
      expect(res.status).toBe(200);

      const getRes = await request(app).get(`/api/v1/monitors/${id}`).set(auth());
      expect(getRes.status).toBe(404);
    });
  });

  // ─── PATCH /api/v1/monitors/:id/toggle ───────────────────────────────────
  describe('PATCH /api/v1/monitors/:id/toggle', () => {
    it('200 — pauses the monitor', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      const res = await request(app)
        .patch(`/api/v1/monitors/${id}/toggle`)
        .set(auth())
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.monitor.isActive).toBe(false);
    });

    it('200 — resumes the monitor', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      await request(app).patch(`/api/v1/monitors/${id}/toggle`).set(auth()).send({ isActive: false });
      const res = await request(app)
        .patch(`/api/v1/monitors/${id}/toggle`)
        .set(auth())
        .send({ isActive: true });

      expect(res.status).toBe(200);
      expect(res.body.data.monitor.isActive).toBe(true);
    });

    it('400 — rejects non-boolean isActive', async () => {
      const created = await request(app).post('/api/v1/monitors').set(auth()).send(validMonitor);
      const id = created.body.data.monitor._id;

      const res = await request(app)
        .patch(`/api/v1/monitors/${id}/toggle`)
        .set(auth())
        .send({ isActive: 'yes' });

      expect(res.status).toBe(400);
    });
  });
});
