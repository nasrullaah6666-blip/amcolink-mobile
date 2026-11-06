// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Files copied from the website keep the website's own lint comments exactly; don't flag them.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  {
    ignores: ['dist/*', 'android/*', 'ios/*', 'server/*', 'coverage/*', '.expo/*'],
  },
  {
    // Small Node.js helper scripts (run with `node`, not in the app).
    files: ['scripts/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { __dirname: 'readonly', process: 'readonly', require: 'readonly', module: 'writable', console: 'readonly' } },
  },
  {
    // Tests set up jest.mock() before importing the code they test, and sometimes load modules with require().
    files: ['**/__tests__/**', 'integration/**'],
    rules: { 'import/first': 'off', '@typescript-eslint/no-require-imports': 'off' },
  },
]);
