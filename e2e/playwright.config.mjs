// Browser checks of the BUILT site. CI builds dist/ (tools/build.mjs) and
// serves it under /kids-ai-test/ — the same prefix as GitHub Pages — so
// wrong relative paths fail here, not on the live site.
//
// Mobile = Chromium with a 390 px phone viewport and touch. It is an
// emulation, not a real phone.
import { defineConfig, devices } from '@playwright/test';

const PORT = 8765;

export default defineConfig({
  testDir: './tests',
  workers: 1,
  retries: 1,                 // a test that passes only on retry is reported as flaky
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'report' }]],
  outputDir: 'results',
  use: {
    baseURL: `http://127.0.0.1:${PORT}/kids-ai-test/`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: undefined } },
    { name: 'mobile-390', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    // site/kids-ai-test -> ../dist is created by the workflow
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 --directory ../site`,
    url: `http://127.0.0.1:${PORT}/kids-ai-test/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
