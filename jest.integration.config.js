// Read-only tests against the STAGING project. Run on GitHub (npm run test:integration).
module.exports = { preset: 'jest-expo', testEnvironment: 'node', testMatch: ['<rootDir>/integration/**/*.test.ts'] };
