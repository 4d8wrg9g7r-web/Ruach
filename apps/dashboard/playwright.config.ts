import { defineConfig } from "@playwright/test";

const E2E_PORT = 3100;

// The standard test suite must run with no live third-party credentials (brief §57)
// -- only DATABASE_URL is required. This is mechanized, not just conventional: the
// e2e suite always spawns its OWN dev server on a dedicated port (never reuses
// whatever a developer happens to have running on :3000) with provider credentials
// explicitly blanked out, regardless of what's in the local .env. Next.js's env
// loader never overwrites a variable already present in process.env, so setting
// these to "" here forces YouTubeProvider/VimeoProvider/OpenAIProvider to fall back
// to their mocks for the duration of the test run -- e2e specs use fake video IDs
// (e.g. mock-yt-e2e-01) that only the mocks recognize.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: false,
  // Run serially against a single dev-server instance -- with workers > 1, two test
  // files hitting an uncompiled Next.js dev server at once caused first-navigation
  // flakiness (route compilation on first hit adds latency under concurrent load).
  workers: 1,
  // "html" (never auto-opened) alongside "list" so a CI failure has something to
  // actually attach and download -- a plain list report only exists in the log.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  retries: process.env.CI ? 1 : 0,
  webServer: {
    command: `pnpm exec next dev --port ${E2E_PORT}`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      YOUTUBE_API_KEY: "",
      VIMEO_ACCESS_TOKEN: "",
      OPENAI_API_KEY: "",
      // .env hardcodes NEXTAUTH_URL to :3000; NextAuth uses it verbatim to build
      // redirect targets (sign-in, etc.), so without this override every auth
      // redirect on this dedicated test server would send the browser to the wrong
      // port and fail with ERR_CONNECTION_REFUSED.
      NEXTAUTH_URL: `http://localhost:${E2E_PORT}`,
    },
  },
});
