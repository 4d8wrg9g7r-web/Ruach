import { BillingInterval, OrganizationRole, SubscriptionStatus } from "@prisma/client";
import { rawDb, tenantDb } from "../client";

export async function createOrganizationWithOwner(params: {
  name: string;
  slug: string;
  ownerUserId: string;
}) {
  return tenantDb.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: params.name, slug: params.slug },
    });
    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: params.ownerUserId,
        role: OrganizationRole.OWNER,
      },
    });
    return organization;
  });
}

/**
 * Free-tier org creation via a redeemed FreeTierAccessCode: creates the org
 * (planKey "free") + owner membership + marks the code used, all in one
 * transaction so the same code can never be redeemed twice under a race.
 * FreeTierAccessCode isn't tenant-scoped, so it passes through the guard
 * unintercepted inside this same tenantDb transaction (see tenant-guard.ts).
 */
export async function createOrganizationFromAccessCode(params: {
  name: string;
  slug: string;
  ownerUserId: string;
  accessCodeId: string;
}) {
  return tenantDb.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: params.name, slug: params.slug, planKey: "free" },
    });
    await tx.organizationMember.create({
      data: { organizationId: organization.id, userId: params.ownerUserId, role: OrganizationRole.OWNER },
    });
    const claimed = await tx.freeTierAccessCode.updateMany({
      where: { id: params.accessCodeId, usedAt: null },
      data: { usedByUserId: params.ownerUserId, usedAt: new Date() },
    });
    if (claimed.count === 0) throw new Error("This access code has already been used.");
    return organization;
  });
}

/**
 * Paid-org creation from a completed Stripe Checkout session (signup flow) --
 * creates the org + owner membership with the purchased plan/subscription fields
 * already set, in one transaction (mirrors createOrganizationFromAccessCode).
 */
export async function createOrganizationFromCheckout(params: {
  name: string;
  slug: string;
  ownerUserId: string;
  planKey: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodEnd: Date;
}) {
  return tenantDb.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: params.name,
        slug: params.slug,
        planKey: params.planKey,
        stripeCustomerId: params.stripeCustomerId,
        stripeSubscriptionId: params.stripeSubscriptionId,
        subscriptionStatus: params.subscriptionStatus,
        billingInterval: params.billingInterval,
        currentPeriodEnd: params.currentPeriodEnd,
      },
    });
    await tx.organizationMember.create({
      data: { organizationId: organization.id, userId: params.ownerUserId, role: OrganizationRole.OWNER },
    });
    return organization;
  });
}

/** Syncs subscription state onto an already-existing org (plan upgrade/downgrade, renewal, cancellation). */
export async function applySubscriptionToOrganization(
  organizationId: string,
  params: {
    planKey?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: SubscriptionStatus;
    billingInterval?: BillingInterval;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
  },
) {
  return rawDb.organization.update({ where: { id: organizationId }, data: params });
}

export async function getOrganizationByStripeCustomerId(stripeCustomerId: string) {
  return rawDb.organization.findUnique({ where: { stripeCustomerId } });
}

/** Cross-tenant by design -- used by the usage-warning cron (lib/usage-warnings.ts), which has to check every org's usage, not one tenant's. Not exposed to any request path that resolves a single organizationId. */
export async function listAllOrganizations() {
  return rawDb.organization.findMany();
}

/** Dedup marker for the usage-warning cron so the same 75%/90% threshold email isn't sent more than once per billing period -- see usage-warnings.ts for how this is compared against the current period's start. */
export async function recordUsageWarningSent(organizationId: string, threshold: "75" | "90") {
  const field = threshold === "75" ? "usageWarning75SentAt" : "usageWarning90SentAt";
  return rawDb.organization.update({ where: { id: organizationId }, data: { [field]: new Date() } });
}

export async function getOrganizationByStripeSubscriptionId(stripeSubscriptionId: string) {
  return rawDb.organization.findUnique({ where: { stripeSubscriptionId } });
}

/**
 * Identity-resolution lookup: "which organizations does this user belong to."
 * This intentionally uses rawDb, not tenantDb — at this point in a request we do not
 * yet know the organizationId, because resolving it IS the point of this query. Every
 * subsequent query in the request must use the resolved organizationId via tenantDb.
 * This is the one narrow, documented exception to "always query through tenantDb."
 */
export async function getMembershipsForUser(userId: string) {
  return rawDb.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });
}

export async function getMembership(organizationId: string, userId: string) {
  return tenantDb.organizationMember.findFirst({
    where: { organizationId, userId },
  });
}

export async function getOrganizationBySlug(slug: string) {
  // Organization itself is the tenant root, not tenant-owned — looking it up by
  // slug is how a request establishes which tenant it's operating in.
  return rawDb.organization.findUnique({ where: { slug } });
}

export async function getOrganization(organizationId: string) {
  return rawDb.organization.findUnique({ where: { id: organizationId } });
}

/**
 * Public lookup: resolves an unauthenticated prayer-wall request's publicPrayerWallId
 * to its organization. Same boundary as widgetService.getWidgetByPublicId -- there is
 * no session yet to fall back on. Uses rawDb intentionally.
 */
export async function getOrganizationByPublicPrayerWallId(publicPrayerWallId: string) {
  const organization = await rawDb.organization.findUnique({ where: { publicPrayerWallId } });
  if (!organization || !organization.prayerWallEnabled) return null;
  return organization;
}

/**
 * Same lookup as getOrganizationByPublicPrayerWallId but WITHOUT the prayerWallEnabled
 * check -- exists only so Settings' live branding preview iframe (which needs to
 * render the wall before an admin has enabled it) still works while disabled. The
 * caller (PrayerWallPage) MUST verify the requester is that same org's authenticated
 * staff member before using this; calling it for an arbitrary/unauthenticated visitor
 * would let them see a disabled wall's contents, defeating the enabled flag entirely.
 */
export async function getOrganizationByPublicPrayerWallIdForPreview(publicPrayerWallId: string) {
  return rawDb.organization.findUnique({ where: { publicPrayerWallId } });
}

export async function dismissOnboardingChecklist(organizationId: string) {
  return rawDb.organization.update({ where: { id: organizationId }, data: { onboardingChecklistDismissedAt: new Date() } });
}

/** Called once, whether the setup wizard was completed or skipped -- either way, don't auto-redirect there again. */
export async function markOnboardingWizardSeen(organizationId: string) {
  return rawDb.organization.update({ where: { id: organizationId }, data: { onboardingWizardSeenAt: new Date() } });
}

export async function enablePrayerWall(
  organizationId: string,
  params: {
    enabled: boolean;
    forwardingEmails: string[];
    brandColor: string | null;
    logoUrl: string | null;
    testimoniesEnabled?: boolean;
    testimoniesPageName?: string;
  },
) {
  return rawDb.organization.update({
    where: { id: organizationId },
    data: {
      prayerWallEnabled: params.enabled,
      prayerRequestForwardingEmails: params.forwardingEmails,
      prayerWallBrandColor: params.brandColor,
      prayerWallLogoUrl: params.logoUrl,
      ...(params.testimoniesEnabled !== undefined ? { testimoniesEnabled: params.testimoniesEnabled } : {}),
      ...(params.testimoniesPageName !== undefined ? { testimoniesPageName: params.testimoniesPageName } : {}),
    },
  });
}
