import { defineConfig, devices } from "@playwright/test";

/**
 * The smoke test: the Prism mock and the app (a production build made with MOCK=1), then the example page in both
 * themes at 1440 and 375 px. Chromium only. In CI the build step has already built with MOCK=1, so only `next start`
 * runs here; locally the app is built first.
 */
const CI = !!process.env.CI;
const PORT = 3000;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm mock",
      url: "http://127.0.0.1:4010/api/v1/site",
      reuseExistingServer: !CI,
      timeout: 120_000,
      stdout: "ignore",
    },
    {
      command: CI ? "pnpm start" : "pnpm build && pnpm start",
      url: `http://127.0.0.1:${PORT}/example`,
      env: { MOCK: "1" },
      reuseExistingServer: !CI,
      timeout: 300_000,
    },
  ],
});
