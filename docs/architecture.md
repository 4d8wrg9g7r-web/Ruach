# Architecture

## Context

Ruach's full build brief describes a ~10-phase, multi-tenant SaaS platform (subscriber
dashboard, embeddable widget, content processing, AI retrieval/conversation, platform
administration -- see the original brief for the complete scope). That brief explicitly
calls out that it's too large to build in one pass, and asks for a first runnable
milestone rather than the full MVP. This repository implements that milestone.

**Milestone 1 scope**: a developer can locally create an organization, add a website,
create a widget, import a mock YouTube resource, add a transcript, generate AI
categorization, approve the resource, open the widget preview, ask a question, and
receive a real, database-backed recommendation -- with zero live third-party
credentials required. Billing, live provider integrations (real YouTube/Vimeo APIs),
background job queues, and platform administration are explicitly deferred; see
"Deferred past milestone 1" below.

## System shape

A single Next.js App Router app (`apps/dashboard`) hosts three logically distinct
surfaces in one deployable unit:

1. **Authenticated dashboard** -- organization management, websites, widgets,
   resource import/review/approval. Protected by `middleware.ts` + NextAuth session.
2. **Public widget surface** -- `/widget/embed/[publicWidgetId]` (the iframe target)
   and the public `/api/widget/[publicWidgetId]/config` and `/chat` routes. No
   session; scoped entirely by `publicWidgetId`.
3. **Business logic packages** -- everything under `packages/*` is plain
   TypeScript with no Next.js request-context coupling (no `headers()`/`cookies()`
   calls), so it's usable from route handlers, server actions, the seed script, and
   test files identically.

This separation is deliberate: the public and authenticated surfaces never import each
other's session/middleware helpers, and business logic never touches Next.js request
context. That means splitting `apps/widget` or `apps/worker` out into their own
deployable units later (if/when scale demands it) is a file move, not a rewrite.

## Package boundaries

- **`@ruach/shared-types`** -- Zod schemas for cross-package contracts: the
  `ChatResponse`/`ResourceRecommendation` wire format, provider-normalized resource
  shapes, retrieval query/result shapes. No dependencies on other Ruach packages.
- **`@ruach/database`** -- Prisma schema, the tenant-scoping guardrail
  (`tenant-guard.ts`), and the service layer (`src/services/*.ts`) that is the only
  sanctioned way for the rest of the app to touch tenant-owned data. See
  `docs/multi-tenancy.md`.
- **`@ruach/providers`** -- the `ResourceProvider` interface and all provider
  implementations (mock YouTube/Vimeo, generic URL with SSRF guards, manual), plus
  the URL-detection registry and the single-URL import orchestration
  (`import-service.ts`).
- **`@ruach/retrieval`** -- the `RetrievalProvider` interface and
  `LocalRetrievalProvider`, a Postgres full-text-search implementation. The interface
  is deliberately embedding-shaped (plain query string in, opaque 0-1 relevance
  scores out) so a future pgvector or managed vector-store adapter is a drop-in
  replacement.
- **`@ruach/ai`** -- the `AIProvider` interface, `MockAIProvider` (deterministic, no
  network calls, the default), `OpenAIProvider` (only instantiated when
  `OPENAI_API_KEY` is set), `CategorizationService`, and `ChatPipeline` (the
  controlled multi-step pipeline a visitor's message goes through before a response
  is generated).

Dependency direction is one-way: `providers`, `retrieval`, and `ai` depend on
`database` and `shared-types`; nothing depends back up into `apps/dashboard`.

## The chat pipeline

`ChatPipeline.respond()` (`packages/ai/src/ChatPipeline.ts`) implements the staged
pipeline a visitor message goes through: input validation, safety classification,
intent extraction, query generation, retrieval, **database validation** (re-filtering
retrieval's candidate IDs by `organizationId` and `status === 'ACTIVE'` directly
against the database), ranking, response generation, and structured output validated
against the `ChatResponse` Zod schema.

The database-validation step is the actual enforcement point for two of the product's
hardest requirements: the AI never fabricates a resource (every trusted card field --
title, url, thumbnail, speaker, duration -- is read from the validated database row,
never from model output), and cross-tenant leakage is structurally prevented even if
retrieval returned a stale or wrong ID.

## AI provider selection

`getAIProvider()` in `packages/ai/src/index.ts` returns `MockAIProvider` unless
`OPENAI_API_KEY` is set in the environment, in which case it returns `OpenAIProvider`.
Both implement the same `AIProvider` interface, so `ChatPipeline` and
`CategorizationService` are written once and never branch on which is active.

`OpenAIProvider` uses the Chat Completions JSON-mode API rather than a newer API
surface, since this path is optional and inactive by default in local development --
see the risk note in the file's doc comment.

## Retrieval

`LocalRetrievalProvider` uses Postgres full-text search over a per-resource
`searchDocument` column (see `CategorizationService`'s `buildSearchDocument`, which
follows the brief's canonical search-document template). Query terms are OR-combined
rather than passed through `plainto_tsquery` directly, because `plainto_tsquery` ANDs
every word together -- a natural-language question like "do you have anything about
anxiety" would then require the document to also contain the word "anything," which
defeats the purpose. See the doc comment in `LocalRetrievalProvider.search()`.

## Deferred past milestone 1

Per the build plan and the brief's own phasing, these are intentionally not built yet:

- Real billing (Stripe, plan entitlements, payment processing) -- brief instruction
  #25: don't build billing before organization/website/widget/resource architecture
  is stable. A mock billing UI wired to real usage data now exists (docs/billing.md)
  as an interim step; real payment processing is still not built.
- Live YouTube/Vimeo API integration, OAuth connections, playlist/channel sync --
  brief instruction #24: don't build live sync until mock flows work. Needs
  user-provisioned API credentials when it happens.
- Background job queue (Inngest/Trigger.dev) -- mock imports are synchronous and
  instant; a queue matters once live provider sync needs retries/backoff.
- Subsplash live integration -- no public documented API; stays a scaffold-only
  provider interface per brief §16's explicit ban on inventing endpoints.
- Platform administration app (a cross-organization admin surface -- separate from
  the per-org `/audit-log` viewer, which now exists alongside `/analytics` and `/team`).
- `apps/widget` / `apps/worker` / `apps/platform-admin` as separate deployable units.
