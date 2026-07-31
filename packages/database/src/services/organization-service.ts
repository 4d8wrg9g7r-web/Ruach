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
