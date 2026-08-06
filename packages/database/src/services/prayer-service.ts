import type { PrayerRequestCategory } from "@prisma/client";
import { rawDb, tenantDb } from "../client";

export async function createAccount(params: {
  organizationId: string;
  email: string;
  passwordHash: string;
  displayName?: string | null;
}) {
  return tenantDb.prayerWallAccount.create({
    data: { ...params, email: params.email.toLowerCase() },
  });
}

/**
 * findFirst, not findUnique -- the tenant guard disallows findUnique on tenant-scoped
 * models even when the lookup fields match a compound @@unique (same workaround as
 * organizationService.getMembership for OrganizationMember's @@unique([organizationId, userId])).
 */
export async function findAccountByEmail(organizationId: string, email: string) {
  return tenantDb.prayerWallAccount.findFirst({
    where: { organizationId, email: email.toLowerCase() },
  });
}

const TOKEN_BYTES = 32;

/**
 * Uses the Web Crypto API (a global in Node 19+, also available in Next.js's Edge
 * runtime) rather than node:crypto -- this file is reachable from middleware.ts's
 * Edge-bundled auth.ts via @ruach/database's barrel export, and node:crypto imports
 * fail that bundle. Cryptographically equivalent CSPRNG either way. Shared by session
 * tokens and password-reset tokens -- both are just opaque random bearer strings.
 */
function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(accountId: string, expiresAt: Date) {
  const token = generateToken();
  await rawDb.prayerWallSession.create({ data: { accountId, token, expiresAt } });
  return token;
}

/**
 * Sole tenant-resolution boundary for the logged-in prayer-wall surface, same pattern
 * as widgetService.getWidgetByPublicId -- the token is the lookup key before any
 * organizationId is known, so this must use rawDb. Every downstream prayer-wall query
 * uses the organizationId resolved from the returned account, via tenantDb.
 */
export async function getAccountBySessionToken(token: string) {
  const session = await rawDb.prayerWallSession.findUnique({
    where: { token },
    include: { account: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.account;
}

export async function deleteSession(token: string) {
  return rawDb.prayerWallSession.deleteMany({ where: { token } });
}

export async function updateAccountPassword(organizationId: string, accountId: string, passwordHash: string) {
  return tenantDb.prayerWallAccount.updateMany({ where: { id: accountId, organizationId }, data: { passwordHash } });
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Tenant-scoped (unlike PrayerWallSession) -- the reset flow always starts from
 * /prayer/[publicPrayerWallId]/..., so the organization is already known before a
 * token is ever issued. Deletes any prior unused token for this account first, same
 * single-active-token policy as the staff-account equivalent in user-service.ts.
 */
export async function createPasswordResetToken(organizationId: string, accountId: string) {
  await tenantDb.prayerWallPasswordResetToken.deleteMany({ where: { organizationId, accountId } });
  const token = generateToken();
  await tenantDb.prayerWallPasswordResetToken.create({
    data: { organizationId, accountId, token, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });
  return token;
}

export async function getValidPasswordResetToken(organizationId: string, token: string) {
  const record = await tenantDb.prayerWallPasswordResetToken.findFirst({ where: { organizationId, token } });
  if (!record || record.expiresAt <= new Date()) return null;
  return record;
}

export async function deletePasswordResetToken(organizationId: string, token: string) {
  return tenantDb.prayerWallPasswordResetToken.deleteMany({ where: { organizationId, token } });
}

export async function createPrayerRequest(params: {
  organizationId: string;
  accountId: string;
  message: string;
  isPublic: boolean;
  isAnonymous?: boolean;
  /** Only ever set when the org's plan has the prayerCategories feature -- caller's responsibility, see the submit Server Action. */
  category?: PrayerRequestCategory | null;
  /** null = submitted via the org-level default wall. Set = submitted via a specific campus's wall. */
  websiteId?: string | null;
}) {
  return tenantDb.prayerRequest.create({
    data: { ...params, publicizedAt: params.isPublic ? new Date() : null },
  });
}

/**
 * Most recently made public first -- publicizedAt is stamped whenever isPublic flips
 * to true (at submission or later via setPublicVisibility), not the original
 * submission time. Includes the submitter's displayName for attribution -- the caller
 * is responsible for not showing it when isAnonymous is true (kept here rather than
 * filtered out of the query so a request's own author can still see their name on
 * "My requests" regardless of the public anonymous flag).
 *
 * websiteId omitted = the org-level default wall, which shows every public request
 * org-wide (unchanged pre-Phase-3 behavior, regardless of which campus it came
 * through). websiteId set = a specific campus's wall, showing only requests
 * submitted through that same campus.
 */
export async function listPublicPrayerRequests(organizationId: string, websiteId?: string) {
  return tenantDb.prayerRequest.findMany({
    where: { organizationId, isPublic: true, ...(websiteId ? { websiteId } : {}) },
    orderBy: { publicizedAt: "desc" },
    include: { account: { select: { displayName: true } } },
  });
}

export async function listMyPrayerRequests(organizationId: string, accountId: string) {
  return tenantDb.prayerRequest.findMany({
    where: { organizationId, accountId },
    orderBy: { createdAt: "desc" },
  });
}

/** Includes the submitter's account so callers can email them (e.g. after a "pray" click). */
export async function getPrayerRequestById(organizationId: string, requestId: string) {
  return tenantDb.prayerRequest.findFirst({
    where: { id: requestId, organizationId },
    include: { account: true },
  });
}

export async function incrementPrayerCount(organizationId: string, requestId: string) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId },
    data: { prayerCount: { increment: 1 } },
  });
}

/**
 * accountId in the where clause is an ownership check, not just tenant scoping --
 * without it, any logged-in visitor at the same organization could mark someone
 * else's request answered, since organizationId alone only proves "same church."
 */
export async function markAnswered(organizationId: string, accountId: string, requestId: string) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId, accountId },
    data: { status: "ANSWERED", answeredAt: new Date() },
  });
}

/** Stamps publicizedAt fresh each time isPublic is set true, so re-publicizing an older request moves it back to the top of the wall (listPublicPrayerRequests orders by publicizedAt). Left untouched when hidden -- irrelevant while isPublic is false. */
export async function setPublicVisibility(
  organizationId: string,
  accountId: string,
  requestId: string,
  isPublic: boolean,
) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId, accountId },
    data: { isPublic, ...(isPublic ? { publicizedAt: new Date() } : {}) },
  });
}

export async function setAnonymous(
  organizationId: string,
  accountId: string,
  requestId: string,
  isAnonymous: boolean,
) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId, accountId },
    data: { isAnonymous },
  });
}

/**
 * Audit stamp only -- the forwarding send happens synchronously with no retry queue,
 * so this does not by itself guarantee against a duplicate send if the caller retries
 * after a failure. Set only after the send actually succeeds.
 */
export async function markForwarded(organizationId: string, requestId: string) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId },
    data: { forwardedAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Staff moderation (apps/dashboard/app/(dashboard)/prayer-wall) -- distinct from
// the functions above, which are all gated by the submitter's own accountId. These
// act on behalf of church staff via requireOrgRole/PRAYER_MODERATOR instead, so they
// intentionally have no accountId check: any request in the org is fair game.
// ---------------------------------------------------------------------------

/** Every request for the org, not just public ones -- the staff review surface, unlike listPublicPrayerRequests. Includes which campus (if any) it came through. */
export async function listPrayerRequestsForModeration(organizationId: string) {
  return tenantDb.prayerRequest.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { account: { select: { displayName: true, email: true } }, website: { select: { name: true } } },
  });
}

export async function staffSetPublicVisibility(organizationId: string, requestId: string, isPublic: boolean) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId },
    data: { isPublic, ...(isPublic ? { publicizedAt: new Date() } : {}) },
  });
}

export async function staffMarkAnswered(organizationId: string, requestId: string) {
  return tenantDb.prayerRequest.updateMany({
    where: { id: requestId, organizationId },
    data: { status: "ANSWERED", answeredAt: new Date() },
  });
}

export async function deletePrayerRequest(organizationId: string, requestId: string) {
  return tenantDb.prayerRequest.deleteMany({ where: { id: requestId, organizationId } });
}

/** Gated by the org's plan having the prayerCategories feature -- callers are responsible for that check. */
export async function setCategory(organizationId: string, requestId: string, category: PrayerRequestCategory | null) {
  return tenantDb.prayerRequest.updateMany({ where: { id: requestId, organizationId }, data: { category } });
}

/** Gated by the org's plan having the internalPrayerNotes feature -- callers are responsible for that check. Never rendered on any public/submitter-facing page. */
export async function setInternalNotes(organizationId: string, requestId: string, notes: string | null) {
  return tenantDb.prayerRequest.updateMany({ where: { id: requestId, organizationId }, data: { internalNotes: notes } });
}
