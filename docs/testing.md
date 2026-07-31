# Testing

```bash
pnpm test                                     # unit tests (vitest), all packages
pnpm --filter @ruach/dashboard test:e2e        # Playwright e2e
pnpm tenant-check                              # CI grep check, see docs/multi-tenancy.md
```

All of the above run with only `DATABASE_URL` set -- no live third-party credentials
(brief §57). The e2e suite additionally requires the database to be migrated and
seeded (`pnpm db:migrate && pnpm db:seed`) before running.

## What's covered in milestone 1

**Unit tests** (`packages/*/src/__tests__/`):
- YouTube/Vimeo URL parsing (`packages/providers`)
- The tenant-scoping guard's pure logic, `isScopedWhere`/`isScopedCreateData`
  (`packages/database`)
- `MockAIProvider`'s safety classification and categorization confidence behavior
  (`packages/ai`)

**End-to-end** (`apps/dashboard/e2e/`, Playwright):
- `golden-path.spec.ts` -- the full milestone-1 flow through the real UI: create org
  → add website → create widget → import a mock resource → confirm auto-fetched
  transcript → generate categorization → approve → open the widget preview → ask a
  question → see a database-backed recommendation card.
- `tenant-isolation.spec.ts` -- creates two organizations and asserts one widget's
  chat endpoint never surfaces the other organization's resources, with a positive
  control confirming isolation isn't just "the widget is broken."

## What's not yet covered

The full test matrix described in the brief (SSRF prevention edge cases, description-
link extraction, playlist/channel import, provider sync, subscription-limit
enforcement, accessibility automation, etc.) is out of scope for milestone 1 -- most
of that functionality doesn't exist yet either. Add tests alongside each feature as
it's built, following the existing pattern: pure logic gets a fast unit test near the
code it tests; anything crossing the tenant boundary or the full request pipeline gets
an e2e test.
