import { tenantDb } from "../client";

export async function createWebsite(params: {
  organizationId: string;
  name: string;
  primaryDomain: string;
  allowedDomains?: string[];
}) {
  return tenantDb.website.create({
    data: {
      organizationId: params.organizationId,
      name: params.name,
      primaryDomain: params.primaryDomain,
      allowedDomains: params.allowedDomains ?? [params.primaryDomain],
    },
  });
}

export async function listWebsites(organizationId: string) {
  return tenantDb.website.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

/** Used to enforce the org's plan-tier website cap before creating a new one -- see billingService.assertUnderCap. */
export async function countWebsites(organizationId: string) {
  return tenantDb.website.count({ where: { organizationId } });
}

export async function getWebsite(organizationId: string, websiteId: string) {
  return tenantDb.website.findFirst({ where: { id: websiteId, organizationId } });
}

/**
 * Website.publicPrayerWallId has no @default (unlike Organization's, which every org
 * gets eagerly at creation) -- most websites will never turn on a second campus wall,
 * so it's allocated lazily the first time an admin opens the campus's Prayer Wall
 * settings tab, not burned upfront for every website. Idempotent: a website that
 * already has one keeps it. Uses the Web Crypto global (not node:crypto's randomUUID)
 * -- this file is reachable from middleware.ts's Edge-bundled auth.ts via
 * @ruach/database's barrel export, and node:crypto imports fail that bundle. See
 * prayer-service.ts's generateToken for the same constraint.
 */
export async function ensurePrayerWallId(organizationId: string, websiteId: string) {
  const website = await tenantDb.website.findFirst({ where: { id: websiteId, organizationId } });
  if (!website) return null;
  if (website.publicPrayerWallId) return website;
  return tenantDb.website.update({ where: { id: websiteId }, data: { publicPrayerWallId: crypto.randomUUID() } });
}

/** Campus-specific prayer wall config -- mirrors organizationService.enablePrayerWall but scoped to one Website (campusScopedPrayerWalls feature, Multi-Site+ only). */
export async function enablePrayerWall(
  organizationId: string,
  websiteId: string,
  params: {
    enabled: boolean;
    forwardingEmails: string[];
    brandColor: string | null;
    logoUrl: string | null;
    testimoniesEnabled?: boolean;
    testimoniesPageName?: string;
  },
) {
  const result = await tenantDb.website.updateMany({
    where: { id: websiteId, organizationId },
    data: {
      prayerWallEnabled: params.enabled,
      prayerRequestForwardingEmails: params.forwardingEmails,
      prayerWallBrandColor: params.brandColor,
      prayerWallLogoUrl: params.logoUrl,
      ...(params.testimoniesEnabled !== undefined ? { testimoniesEnabled: params.testimoniesEnabled } : {}),
      ...(params.testimoniesPageName !== undefined ? { testimoniesPageName: params.testimoniesPageName } : {}),
    },
  });
  if (result.count === 0) return null;
  return getWebsite(organizationId, websiteId);
}

export function isDomainAllowed(
  website: { primaryDomain: string; allowedDomains: string[]; stagingDomains: string[] },
  hostname: string,
): boolean {
  const normalize = (d: string) => d.toLowerCase().replace(/^www\./, "");
  const target = normalize(hostname);
  const candidates = [website.primaryDomain, ...website.allowedDomains, ...website.stagingDomains].map(normalize);
  return candidates.includes(target);
}
