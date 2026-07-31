# Local development

## Prerequisites

- Node 20+
- pnpm (`corepack enable pnpm` or `brew install pnpm`)
- PostgreSQL 16, via either:
  - Docker: `docker compose up -d` (uses `docker-compose.yml` at the repo root,
    credentials `ruach` / `ruach`, database `ruach_dev`), or
  - A native install (e.g. `brew install postgresql@16`) -- just make sure
    `DATABASE_URL` in your `.env` points at it. If you create your own role, matching
    the Docker credentials (`ruach`/`ruach`) means `.env.example` works unmodified
    either way.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:migrate   # applies packages/database/prisma/migrations
pnpm db:seed       # idempotent -- safe to re-run
pnpm dev
```

`pnpm db:seed` prints the dev login (`owner@ruach.dev` / `devpassword123`), the seeded
organization's slug, and its widget's `publicWidgetId`.

## Environment variables

See `.env.example` for the full list. Only `DATABASE_URL` is required to run the app
and the full test suite -- everything else is optional and gates an *additional*
capability rather than being required for the app to function:

| Variable | Required? | Effect if unset |
|---|---|---|
| `DATABASE_URL` | Yes | -- |
| `AUTH_SECRET` | Yes (any value works locally) | NextAuth session signing |
| `NEXTAUTH_URL` | Yes | Used to build the widget install snippet's script URL |
| `OPENAI_API_KEY` | No | `MockAIProvider` is used instead of `OpenAIProvider` |
| `YOUTUBE_API_KEY` | No | Not read yet -- YouTube is mock-only in milestone 1 |
| `VIMEO_ACCESS_TOKEN` | No | Not read yet -- Vimeo is mock-only in milestone 1 |

## Mock providers

Every external integration is mocked by default so the repository runs with zero
production credentials (brief §57):

- **`MockYouTubeProvider`** / **`MockVimeoProvider`** (`packages/providers`) --
  deterministic, no network calls. Paste any `youtube.com/watch?v=...` or
  `vimeo.com/...`-shaped URL into the dashboard's resource import form; a small set of
  known mock video IDs (matching the seed data) return richer fixed content, and any
  other ID still resolves to a plausible synthetic result.
- **`GenericUrlProvider`** -- this one is *not* mocked; it does real, SSRF-guarded
  HTTPS fetches for Open Graph metadata, since that requires no credentials and is
  genuinely useful to exercise locally. See `packages/providers/src/ssrf-guard.ts`.
- **`MockAIProvider`** (`packages/ai`) -- deterministic keyword-matching against a
  fixed vocabulary that overlaps the seed data's topics (anxiety, forgiveness,
  leadership, marriage, grief, waiting, etc.). No network calls. This is the default;
  set `OPENAI_API_KEY` to switch to `OpenAIProvider`.
- **`LocalRetrievalProvider`** (`packages/retrieval`) -- Postgres full-text search.
  No external vector store or embedding API involved.

## Seed data

`packages/database/prisma/seed.ts` creates one organization ("Riverside Fellowship
(Demo Org -- fictional)"), one website, one widget, one collection, two action links,
and seven **fictional** resources (clearly marked `[FICTIONAL]` in their titles)
spanning anxiety, forgiveness, leadership, marriage, grief, waiting, and new-believer
topics -- each already transcript-backed, categorized, approved, and indexed, so the
widget preview has something to search against immediately after seeding. The script
is idempotent: re-running it looks up existing rows by natural key (email, slug,
`organizationId` + `sourceProvider` + `externalId`) before creating anything.

## Running tests

```bash
pnpm test                                    # unit tests, all packages
pnpm --filter @ruach/dashboard test:e2e       # Playwright: golden path + tenant isolation
pnpm tenant-check                             # grep-based tenant-scoping CI check
```

The Playwright config starts the dev server automatically (`webServer` in
`apps/dashboard/playwright.config.ts`) and reuses an already-running one if present.
The e2e tests assume the database has been migrated and seeded (the tenant-isolation
test specifically depends on the seeded "anxiety" resource existing).
