import { defineConfig } from "@playwright/test";

// The standard test suite must run with no live third-party credentials (brief §57) --
// only DATABASE_URL is required. The dev server is started automatically here against
// the already-migrated/seeded local database.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: false,
  // Run serially against a single dev-server instance -- with workers > 1, two test
  // files hitting an uncompiled Next.js dev server at once caused first-navigation
  // flakiness (route compilation on first hit adds latency under concurrent load).
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
