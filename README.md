# Ruach

Turn your media library into a conversation. Ruach lets organizations (churches,
ministries, coaches, podcasters, educators, and other content-heavy sites) add their
existing videos, sermons, podcast episodes, and articles, then install a single
`<script>` tag that gives website visitors a conversational assistant for discovering
that content by asking questions in natural language.

This repository is at **milestone 1** of a much larger build brief (see
`docs/architecture.md` for the full context and phasing). Milestone 1 proves the
vertical slice end-to-end, entirely with mock providers and no live credentials:
create an organization → add a website → create a widget → import a mock YouTube
resource → add a transcript → generate AI categorization → approve the resource →
open the widget preview → ask a question → receive a real, database-backed
recommendation.

## Quick start

Requires Node 20+, pnpm, and a local PostgreSQL instance (via Docker or natively).

```bash
pnpm install
cp .env.example .env   # then edit DATABASE_URL / AUTH_SECRET if needed

# Postgres via Docker:
docker compose up -d
# -- or, if you don't have Docker, run Postgres natively and point DATABASE_URL at it.

pnpm db:migrate
pnpm db:seed
pnpm dev
```

Then open http://localhost:3000, log in with the seeded dev user printed by
`pnpm db:seed` (`owner@ruach.dev` / `devpassword123`), and walk the golden path from
the dashboard: Websites → Widgets → Resources.

No `OPENAI_API_KEY`, YouTube, or Vimeo credentials are required for any of this --
every provider is mocked by default (see `docs/local-development.md`).

## Repository layout

```
apps/dashboard        Next.js app: subscriber dashboard, public widget/chat API, widget embed page
packages/database      Prisma schema, tenant-scoping guardrail, service layer
packages/shared-types  Zod schemas shared across packages (chat, retrieval, provider contracts)
packages/providers      ResourceProvider interface + mock YouTube/Vimeo/GenericUrl/Manual providers
packages/retrieval      RetrievalProvider interface + Postgres full-text search implementation
packages/ai             AIProvider interface, MockAIProvider, OpenAIProvider, categorization + chat pipeline
docs/                   Architecture, multi-tenancy, local dev, and other reference docs
```

## Testing

```bash
pnpm test              # unit tests (vitest) across all packages
pnpm --filter @ruach/dashboard test:e2e   # Playwright: golden path + cross-tenant isolation
pnpm tenant-check       # CI backstop: forbids bypassing the tenant-scoping service layer
```

The entire test suite runs with only `DATABASE_URL` set -- no live third-party
credentials required (see `docs/local-development.md`).

## Documentation

- `docs/architecture.md` -- system design, package boundaries, and what's deferred past milestone 1
- `docs/multi-tenancy.md` -- the tenant-isolation strategy and how to extend it safely
- `docs/local-development.md` -- environment variables, mock providers, seed data
