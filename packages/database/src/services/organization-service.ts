import { OrganizationRole } from "@prisma/client";
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

export async function enablePrayerWall(
  organizationId: string,
  params: { enabled: boolean; forwardingEmail: string | null; brandColor: string | null; logoUrl: string | null },
) {
  return rawDb.organization.update({
    where: { id: organizationId },
    data: {
      prayerWallEnabled: params.enabled,
      prayerRequestForwardingEmail: params.forwardingEmail,
      prayerWallBrandColor: params.brandColor,
      prayerWallLogoUrl: params.logoUrl,
    },
  });
}
