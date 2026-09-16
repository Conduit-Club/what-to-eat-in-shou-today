import {defineConfig} from '@playwright/test';

// 同时验证非根路径部署以及配置了投稿接口时的前端行为。
export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173/food/',
    browserName: 'chromium',
    launchOptions: {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined},
  },
  webServer: {
    command: 'node node_modules/@docusaurus/core/bin/docusaurus.mjs build && node node_modules/@docusaurus/core/bin/docusaurus.mjs serve --host 127.0.0.1 --port 4173 --no-open',
    url: 'http://127.0.0.1:4173/food/',
    timeout: 120000,
    env: {
      BASE_URL: '/food/',
      CONTRIBUTION_API_URL: process.env.TEST_CONTRIBUTION_API_URL || '',
    },
  },
});
