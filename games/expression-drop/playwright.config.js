const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 60000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 480, height: 800 },
    actionTimeout: 15000,
  },
  reporter: 'list',
});
