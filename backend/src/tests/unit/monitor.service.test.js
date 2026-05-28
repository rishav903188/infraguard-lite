'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_long_32chars';
process.env.MONGO_URI = 'mongodb://localhost/test';

const testDb = require('../testDb');
const monitorService = require('../../services/monitor.service');
const authService = require('../../services/auth.service');

describe('Monitor Service', () => {
  let userId;

  const validMonitor = {
    name: 'My API',
    url: 'https://api.example.com/health',
    method: 'GET',
    interval: 5,
  };

  beforeAll(async () => {
    await testDb.connect();
    const { user } = await authService.register({
      name: 'Monitor Tester',
      email: 'monitor@example.com',
      password: 'Password123',
    });
    userId = user._id.toString();
  });

  afterEach(async () => {
    // Clear only monitors between tests, keep the user
    const mongoose = require('mongoose');
    await mongoose.connection.collections['monitors']?.deleteMany({});
  });

  afterAll(async () => {
    await testDb.disconnect();
  });

  // ─── createMonitor ────────────────────────────────────────────────────────
  describe('createMonitor()', () => {
    it('creates a monitor and returns it', async () => {
      const monitor = await monitorService.createMonitor(userId, validMonitor);

      expect(monitor.name).toBe(validMonitor.name);
      expect(monitor.url).toBe(validMonitor.url);
      expect(monitor.isActive).toBe(true);
      expect(monitor.userId.toString()).toBe(userId);
    });
  });

  // ─── getUserMonitors ──────────────────────────────────────────────────────
  describe('getUserMonitors()', () => {
    it('returns paginated monitors for user', async () => {
      await monitorService.createMonitor(userId, validMonitor);
      await monitorService.createMonitor(userId, { ...validMonitor, name: 'Second Monitor' });

      const result = await monitorService.getUserMonitors(userId, 1, 10);

      expect(result.monitors).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('respects page and limit parameters', async () => {
      for (let i = 0; i < 5; i++) {
        await monitorService.createMonitor(userId, { ...validMonitor, name: `Monitor ${i}` });
      }

      const result = await monitorService.getUserMonitors(userId, 1, 2);
      expect(result.monitors).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  // ─── getMonitorById ───────────────────────────────────────────────────────
  describe('getMonitorById()', () => {
    it('returns monitor for owner', async () => {
      const created = await monitorService.createMonitor(userId, validMonitor);
      const found = await monitorService.getMonitorById(created._id.toString(), userId);
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it('throws 404 for non-existent monitor', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(monitorService.getMonitorById(fakeId, userId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('throws 403 for wrong owner', async () => {
      const created = await monitorService.createMonitor(userId, validMonitor);
      const fakeUserId = '507f1f77bcf86cd799439011';
      await expect(
        monitorService.getMonitorById(created._id.toString(), fakeUserId)
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ─── updateMonitor ────────────────────────────────────────────────────────
  describe('updateMonitor()', () => {
    it('updates monitor fields', async () => {
      const created = await monitorService.createMonitor(userId, validMonitor);
      const updated = await monitorService.updateMonitor(created._id.toString(), userId, {
        name: 'Updated Name',
      });
      expect(updated.name).toBe('Updated Name');
    });
  });

  // ─── deleteMonitor ────────────────────────────────────────────────────────
  describe('deleteMonitor()', () => {
    it('deletes the monitor', async () => {
      const created = await monitorService.createMonitor(userId, validMonitor);
      await monitorService.deleteMonitor(created._id.toString(), userId);

      await expect(
        monitorService.getMonitorById(created._id.toString(), userId)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ─── toggleMonitor ────────────────────────────────────────────────────────
  describe('toggleMonitor()', () => {
    it('pauses and resumes a monitor', async () => {
      const created = await monitorService.createMonitor(userId, validMonitor);
      expect(created.isActive).toBe(true);

      const paused = await monitorService.toggleMonitor(created._id.toString(), userId, false);
      expect(paused.isActive).toBe(false);

      const resumed = await monitorService.toggleMonitor(created._id.toString(), userId, true);
      expect(resumed.isActive).toBe(true);
    });
  });
});
