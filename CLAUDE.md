# CLAUDE.md

Guidance for Claude Code (and human engineers) working in this repository.

## What this repo is

**Ruach** is the first runnable slice of a much larger platform: the **Church OS** — an
operating system for the local church spanning People, Ministry, Events, Learning, Staff,
Finance, Content, Digital, Operations, and Platform services. Today the repo implements the
**intelligent content discovery** slice (embeddable AI resource guide); over time it grows
toward the full platform.

The source-of-truth product and architecture specification lives in
[`docs/architecture/`](docs/architecture/):

- **[`CONSTITUTION.md`](docs/architecture/CONSTITUTION.md)** — the enforceable invariants.
  **Read this first, before planning or modifying architecture.**
- **[`BLUEPRINT.md`](docs/architecture/BLUEPRINT.md)** — the full master blueprint (product
  vision, technical constitution, phased roadmap, canonical data & security reference).
- **[`adr/`](docs/architecture/adr/)** — Architecture Decision Records. Invariants change
  only through an ADR, never silently in a feature PR.
- **[`DEFINITION_OF_DONE.md`](docs/architecture/DEFINITION_OF_DONE.md)** — the merge gate.
- **[`feature-spec-template.md`](docs/architecture/feature-spec-template.md)** — copy to
  `docs/domain/<feature>.md` before building a feature.

## Before making any changes

1. Read [`docs/architecture/CONSTITUTION.md`](docs/architecture/CONSTITUTION.md) and the
   relevant `docs/domain/*.md` files.
2. Identify which existing platform primitives and module APIs this feature must reuse.
3. Do not create duplicate Person, Organization, Campus, Event, Task, Form, File, Message,
   Workflow, Permission, or Ledger Entry concepts.
4. Preserve organization scoping and enforce authorization **server-side**.
5. External side effects must use the outbox/worker pattern — never inside a DB
   transaction.
6. Add/update audit events for sensitive actions.
7. Add migrations and automated tests, including **negative authorization tests**.
8. Do not add a new dependency or architectural pattern without an
   [ADR](docs/architecture/adr/).
9. At completion, report schema changes, module interfaces used, events added, permission
   changes, tests run, and unresolved risks.

## Human review is required for

Authentication, tenant isolation, authorization, encryption, secrets, audit, or SSO; any
giving/payment/ledger flow; HR compensation/tax/discipline data; child check-in/security
and background checks; pastoral-care confidentiality; large or destructive data
migrations/exports; and AI features that mutate records or touch highly restricted data.
See [BLUEPRINT §66](docs/architecture/BLUEPRINT.md#66-human-review-required).

## Working in the current codebase

The existing milestone and its concrete package boundaries, tenant-scoping guardrail, and
local-dev setup are documented in the repo docs:

- [`README.md`](README.md) — quick start and repository layout.
- [`docs/architecture.md`](docs/architecture.md) — current system shape and what's deferred.
- [`docs/multi-tenancy.md`](docs/multi-tenancy.md) — the tenant-isolation strategy in code.
- [`docs/local-development.md`](docs/local-development.md) — env vars, mock providers, seed
  data.

### Common commands

```bash
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
pnpm test                                   # unit tests (vitest) across packages
pnpm --filter @ruach/dashboard test:e2e     # Playwright: golden path + tenant isolation
pnpm tenant-check                           # CI backstop: forbids bypassing tenant scoping
```

When the codebase and the blueprint disagree on something already built, follow the
codebase for existing behavior and note the divergence; when building something new, follow
the blueprint and the Constitution.
