'use strict';

const { registerSchema, loginSchema, refreshTokenSchema } = require('../../validators/auth.validator');

describe('Auth Validators', () => {
  // ─── registerSchema ──────────────────────────────────────────────────────
  describe('registerSchema', () => {
    const valid = { name: 'John Doe', email: 'john@example.com', password: 'Secret123' };

    it('passes with valid data', () => {
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('john@example.com'); // lowercased
    });

    it('fails when name is too short', () => {
      const result = registerSchema.safeParse({ ...valid, name: 'Jo' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/3 characters/);
    });

    it('fails with invalid email', () => {
      const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('fails when password has no uppercase', () => {
      const result = registerSchema.safeParse({ ...valid, password: 'secret123' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/uppercase/);
    });

    it('fails when password has no number', () => {
      const result = registerSchema.safeParse({ ...valid, password: 'SecretABC' });
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toMatch(/number/);
    });

    it('fails when password is too short', () => {
      const result = registerSchema.safeParse({ ...valid, password: 'Sec1' });
      expect(result.success).toBe(false);
    });

    it('normalizes email to lowercase', () => {
      const result = registerSchema.safeParse({ ...valid, email: 'JOHN@EXAMPLE.COM' });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('john@example.com');
    });
  });

  // ─── loginSchema ─────────────────────────────────────────────────────────
  describe('loginSchema', () => {
    it('passes with valid credentials', () => {
      const result = loginSchema.safeParse({ email: 'john@example.com', password: 'Secret123' });
      expect(result.success).toBe(true);
    });

    it('fails with missing password', () => {
      const result = loginSchema.safeParse({ email: 'john@example.com' });
      expect(result.success).toBe(false);
    });

    it('fails with invalid email', () => {
      const result = loginSchema.safeParse({ email: 'bad', password: 'Secret123' });
      expect(result.success).toBe(false);
    });
  });

  // ─── refreshTokenSchema ───────────────────────────────────────────────────
  describe('refreshTokenSchema', () => {
    it('passes with a token string', () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: 'some.jwt.token' });
      expect(result.success).toBe(true);
    });

    it('fails with missing refreshToken', () => {
      const result = refreshTokenSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
