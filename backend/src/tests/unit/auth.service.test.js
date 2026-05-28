'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_32chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_long_32chars';
process.env.MONGO_URI = 'mongodb://localhost/test'; // overridden by memory server

const testDb = require('../testDb');
const authService = require('../../services/auth.service');

describe('Auth Service', () => {
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
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  // ─── register ─────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('creates a user and returns tokens', async () => {
      const result = await authService.register(validUser);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(validUser.email);
      expect(result.user.password).toBeUndefined(); // never exposed
    });

    it('throws 409 if email already registered', async () => {
      await authService.register(validUser);
      await expect(authService.register(validUser)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────
  describe('login()', () => {
    beforeEach(async () => {
      await authService.register(validUser);
    });

    it('returns tokens on valid credentials', async () => {
      const result = await authService.login(validUser.email, validUser.password);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(validUser.email);
    });

    it('throws 401 on wrong password', async () => {
      await expect(authService.login(validUser.email, 'WrongPass1')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws 401 on unknown email', async () => {
      await expect(authService.login('nobody@example.com', 'Password123')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ─── refresh ──────────────────────────────────────────────────────────────
  describe('refresh()', () => {
    it('issues new tokens with a valid refresh token', async () => {
      const { refreshToken } = await authService.register(validUser);
      const result = await authService.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBe(refreshToken); // rotated
    });

    it('throws 401 on invalid refresh token', async () => {
      await expect(authService.refresh('invalid.token.here')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('clears the refresh token in DB', async () => {
      const { user, refreshToken } = await authService.register(validUser);
      await authService.logout(user._id);

      // After logout, the old refresh token should be rejected
      await expect(authService.refresh(refreshToken)).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });
});
