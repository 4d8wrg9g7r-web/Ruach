# Platform administration

**Status: not built.** No `apps/platform-admin` exists yet, and no
`PLATFORM_SUPER_ADMIN`/`PLATFORM_SUPPORT`/`PLATFORM_ANALYTICS` roles exist in the
schema -- only organization-level roles (`OWNER`/`ADMIN`/`CONTENT_MANAGER`/
`ANALYTICS_VIEWER`, see `OrganizationRole` in the Prisma schema) exist today.

`AuditLog` writes already happen for the auditable actions milestone 1 has (see
`packages/database/src/services/audit-service.ts` and its call sites), on the
principle that the write path is cheap to add now and painful to retrofit later --
but there is no viewer UI for it yet, platform or otherwise.
