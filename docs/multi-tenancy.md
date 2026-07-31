# Multi-tenancy

Every organization-owned table carries an `organizationId` column (see
`packages/database/prisma/schema.prisma`). Cross-tenant leakage is prevented by three
independent layers, not one -- if any single layer has a bug, the others still hold.

## Layer 1: the service layer

`packages/database/src/services/*.ts` is the only sanctioned way for the rest of the
app to read or write tenant-owned data. Every exported function takes
`organizationId` explicitly and passes it into the `where`/`data` clause of every
query. Application code (dashboard pages, server actions, API routes) calls these
functions -- it never constructs a Prisma query against a tenant model directly.

## Layer 2: the tenant-guard Prisma extension (runtime backstop)

`packages/database/src/tenant-guard.ts` wraps the Prisma client in a Client Extension
that inspects every query against a tenant-owned model and **throws** if it doesn't
find `organizationId` in the `where` clause (for reads/updates/deletes) or `data`
(for creates). This exists so a bug in the service layer becomes a loud runtime error
instead of a silent cross-tenant leak.

Two consequences of how this is implemented:

- `findUnique`/`findUniqueOrThrow` are **disallowed entirely** on tenant models,
  because Prisma's unique selectors for these models are typically just `{ id }`,
  which can't carry `organizationId` alongside it in the type system. Use
  `findFirst({ where: { id, organizationId } })` instead -- every service-layer
  function already does this.
- Similarly, single-record `update`/`delete` are avoided in favor of
  `updateMany`/`deleteMany` with `{ id, organizationId }` in the `where`, followed by
  a `findFirst` re-fetch if the caller needs the updated row. This is a deliberate
  convention, not a guard limitation -- see any service file for the pattern.

**Raw SQL bypasses this extension.** Client Extensions only intercept the standard
model delegate methods (`findMany`, `create`, etc.), not `$queryRaw`/`$executeRaw`.
The one place in the codebase that uses raw SQL against a tenant model is
`packages/retrieval/src/LocalRetrievalProvider.ts` (full-text search needs SQL
functions Prisma's query builder doesn't expose). `organizationId` is included
directly and manually in that query's `WHERE` clause -- treat any edit to that file
with the same scrutiny as the guard itself.

## Layer 3: the CI grep check

`scripts/check-tenant-scoping.sh` (wired up as `pnpm tenant-check`) scans every `.ts`/
`.tsx` file outside the service layer for direct `tenantDb.`/`rawDb.` usage and fails
if it finds any. This catches the case Layer 2 can't: code that imports `tenantDb`
directly and happens to pass a correct `where` clause today, but has no structural
reason to keep doing so tomorrow. Only the service layer, `client.ts`, the seed
script, and `LocalRetrievalProvider.ts` (documented above) are exempt.

## The public widget boundary

The public widget/chat API routes (`apps/dashboard/app/api/widget/[publicWidgetId]/`)
have no session -- there's no user to check a role against. The only thing standing
between a visitor and another organization's data is the `publicWidgetId ->
organizationId` resolution in `widgetService.getWidgetByPublicId()`
(`packages/database/src/services/widget-service.ts`). Every downstream call in that
request path (retrieval search, resource lookups, conversation writes) uses the
`organizationId` resolved there via the normal tenant-guarded service layer -- it is
never re-derived from client input.

This boundary is covered by a dedicated automated test:
`apps/dashboard/e2e/tenant-isolation.spec.ts`. It creates two organizations, seeds one
with a resource that would strongly match a given query, and asserts the *other*
organization's widget never returns it -- while confirming the first organization's
own widget still can (so the test can't pass by the widget simply being broken).

## Documented exceptions

A few queries are legitimately un-scoped because resolving `organizationId` *is* what
they do -- they can't require what they're computing:

- `organizationService.getMembershipsForUser(userId)` -- "which orgs does this user
  belong to" (identity resolution, e.g. after login).
- `organizationService.getOrganizationBySlug(slug)` / `getOrganization(id)` --
  `Organization` is the tenant root, not a tenant-owned table.
- `widgetService.getWidgetByPublicId(publicWidgetId)` -- the public boundary
  described above.
- `userService.*` -- `User` is not organization-owned (a user can belong to multiple
  organizations).

Each of these is called out with a doc comment at its definition explaining why it
uses `rawDb` instead of `tenantDb`. If you find yourself reaching for `rawDb` anywhere
else, that's very likely a bug, not a new legitimate exception.

## Extending this safely

When adding a new tenant-owned model:

1. Add `organizationId` as a real column (not just via a parent relation) -- see the
   brief's explicit example list in its multi-tenancy section, which includes
   `ConversationMessage` and `AnalyticsEvent`-style child records even though they
   also belong to a parent that has its own `organizationId`.
2. Add the model name to `TENANT_SCOPED_MODELS` in `tenant-guard.ts`.
3. Write service-layer functions that take `organizationId` as an explicit parameter
   and use `findFirst`/`findMany`/`updateMany`/`deleteMany`/`create`/`createMany`
   only.
4. Run `pnpm tenant-check` before committing.
