// Imported for its side effect only, at the top of every e2e spec that calls
// provider/service code directly in the test process (not just through the browser).
//
// playwright.config.ts's webServer.env blanks these for the Next.js dev server it
// spawns, which is enough for anything driven through the browser. But some specs
// (e.g. tenant-isolation.spec.ts) also call packages/providers and packages/database
// directly in the Playwright test-runner's own Node process for test setup speed --
// and @prisma/client auto-loads packages/database/.env (symlinked to the repo root
// .env) on import, which populates process.env for this process too, real
// credentials included if a developer has them configured locally.
//
// getResourceProvider() (packages/providers/src/registry.ts) reads these env vars
// fresh on every call, not once at import time, so setting them here -- before any
// test runs -- is enough to force the mock providers for the whole file, regardless
// of what's sitting in a developer's local .env. This is what actually makes brief
// §57's "runs without live credentials" guarantee hold for e2e specs like
// tenant-isolation.spec.ts, which deliberately import fake video IDs.
//
// Must be set to "" rather than `delete`d: dotenv (which @prisma/client calls
// internally on first PrismaClient access, loading packages/database/.env) only
// skips keys that are already *present* in process.env, even if empty -- a deleted
// key looks unset to it and gets silently repopulated from .env on the next Prisma
// call, undoing the override.
process.env.YOUTUBE_API_KEY = "";
process.env.VIMEO_ACCESS_TOKEN = "";
process.env.OPENAI_API_KEY = "";
