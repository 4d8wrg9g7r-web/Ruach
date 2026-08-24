import { PrismaClient } from "@prisma/client";
import { withTenantGuard } from "./tenant-guard";

declare global {
  // eslint-disable-next-line no-var
  var __ruachPrisma: PrismaClient | undefined;
}

/**
 * Neon's compute can cold-start on the first connection after an idle period --
 * production currently stays always-on specifically to avoid that (see the
 * Aug 2026 PrismaClientInitializationError incident: 331 failed requests over 3
 * weeks, root-caused to Neon's default 5s-ish connect timeout being too short for
 * a cold start). Always-on avoids most of it, but doesn't guarantee it -- a Neon
 * maintenance blip, a brief regional hiccup, or a future environment that isn't
 * always-on all hit the same failure mode. Widening the timeout here (rather than
 * only in the DATABASE_URL env var, which isn't version-controlled and is easy to
 * forget when standing up a new environment) is cheap insurance: it only matters
 * on the rare connection that's actually slow to establish, and does nothing on a
 * healthy connection. Only appends params the URL doesn't already set explicitly,
 * so an operator's own tuning always wins.
 */
function withConnectionTimeouts(
  databaseUrl: string | undefined,
): string | undefined {
  if (!databaseUrl) return databaseUrl;
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    return databaseUrl; // malformed -- let Prisma's own error surface, don't mask it with a second one here.
  }
  if (!url.searchParams.has("connect_timeout"))
    url.searchParams.set("connect_timeout", "15");
  if (!url.searchParams.has("pool_timeout"))
    url.searchParams.set("pool_timeout", "15");
  return url.toString();
}

function createRawClient() {
  return new PrismaClient({
    datasourceUrl: withConnectionTimeouts(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Reuse a single PrismaClient across hot reloads in dev (Next.js).
const rawPrisma = globalThis.__ruachPrisma ?? createRawClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__ruachPrisma = rawPrisma;
}

/**
 * Tenant-guarded client. This is what the service layer (src/services/*) uses for
 * every query against an organization-owned model. Never import `rawPrisma` outside
 * of auth (which queries User by email/id, a non-tenant-owned model) and this file.
 */
export const tenantDb = withTenantGuard(rawPrisma);

/**
 * Raw, unguarded client — only for models that are NOT organization-owned
 * (User) and for the seed script. Do not use for tenant-scoped models.
 */
export const rawDb = rawPrisma;

export * from "@prisma/client";
