import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 180000,
  expect: {
    timeout: 30000,
  },
  use: {
    baseURL: "http://127.0.0.1:4170",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 4170",
    url: "http://127.0.0.1:4170",
    reuseExistingServer: true,
    timeout: 180000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--enable-experimental-web-platform-features",
            "--enable-unsafe-webgpu",
            "--disable-background-timer-throttling",
          ],
        },
      },
    },
  ],
});