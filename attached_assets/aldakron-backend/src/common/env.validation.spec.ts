import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validConfig = {
    NODE_ENV: 'development',
    PORT: 4000,
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_ACCESS_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
    CORS_ORIGINS: 'http://localhost:3000',
  };

  it('passes with a valid configuration', () => {
    expect(() => validateEnv(validConfig)).not.toThrow();
  });

  it('throws when JWT_ACCESS_SECRET is too short', () => {
    expect(() =>
      validateEnv({ ...validConfig, JWT_ACCESS_SECRET: 'too-short' }),
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL, ...rest } = validConfig;
    expect(() => validateEnv(rest)).toThrow();
  });
});
