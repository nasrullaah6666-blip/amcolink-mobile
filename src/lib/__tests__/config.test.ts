// The app must refuse production in test builds, refuse secret keys, and accept staging.
function load(env: Record<string, string | undefined>) {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, { EXPO_PUBLIC_APP_ENV: undefined, EXPO_PUBLIC_SUPABASE_URL: undefined, EXPO_PUBLIC_SUPABASE_KEY: undefined }, env);
  for (const k of Object.keys(env)) if (env[k] === undefined) delete process.env[k];
  const { config } = require('../config');
  process.env = saved;
  return config;
}

const STAGING = 'https://ckhoycpsjftavuqxxnss.supabase.co';
const PROD = 'https://mjqhfqylarqgtqdfjsen.supabase.co';

test('staging with a publishable key is accepted', () => {
  const c = load({ EXPO_PUBLIC_SUPABASE_URL: STAGING, EXPO_PUBLIC_SUPABASE_KEY: 'sb_publishable_abc123' });
  expect(c.configProblem).toBeNull();
  expect(c.isStaging).toBe(true);
});

test('missing settings are reported', () => {
  expect(load({}).configProblem).toMatch(/not set up/);
});

test('production is refused in a development or preview build', () => {
  expect(load({ EXPO_PUBLIC_SUPABASE_URL: PROD, EXPO_PUBLIC_SUPABASE_KEY: 'sb_publishable_x' }).configProblem).toMatch(/PRODUCTION/);
  expect(load({ EXPO_PUBLIC_APP_ENV: 'preview', EXPO_PUBLIC_SUPABASE_URL: PROD, EXPO_PUBLIC_SUPABASE_KEY: 'sb_publishable_x' }).configProblem).toMatch(/PRODUCTION/);
});

test('production is allowed only in a production build', () => {
  const c = load({ EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_SUPABASE_URL: PROD, EXPO_PUBLIC_SUPABASE_KEY: 'sb_publishable_x' });
  expect(c.configProblem).toBeNull();
  expect(c.isStaging).toBe(false);
});

test('secret keys are refused', () => {
  expect(load({ EXPO_PUBLIC_SUPABASE_URL: STAGING, EXPO_PUBLIC_SUPABASE_KEY: 'sb_secret_abc' }).configProblem).toMatch(/secret/);
});

test('a wrong address is refused', () => {
  expect(load({ EXPO_PUBLIC_SUPABASE_URL: 'https://evil.example.com', EXPO_PUBLIC_SUPABASE_KEY: 'sb_publishable_x' }).configProblem).toMatch(/wrong/);
});
