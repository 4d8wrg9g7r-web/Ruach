import { rawDb } from "../client";

export interface PublicPrayerWallConfig {
  organizationId: string;
  /** Needed by callers that gate a feature (prayerCategories, prayerTeamNotifications, ...) -- features are per-org-plan regardless of which wall (org or campus) is being viewed. */
  organizationPlanKey: string;
  /** null = the org-level default wall. Set = a specific campus's wall (Website.prayerWallEnabled). */
  websiteId: string | null;
  displayName: string;
  prayerWallBrandColor: string | null;
  prayerWallLogoUrl: string | null;
  prayerRequestForwardingEmails: string[];
  /**
   * Testimonies are a sub-feature of this same wall (same publicPrayerWallId page,
   * branding, and PrayerWallAccount login -- see the Testimony model's doc comment),
   * so this whole config is only reachable when prayerWallEnabled is true already
   * (resolvePublicPrayerWall returns null otherwise) -- there's no independent
   * "testimonies without the prayer wall" state to handle.
   */
  testimoniesEnabled: boolean;
  testimoniesPageName: string;
}

/**
 * A publicPrayerWallId can belong to either an Organization (the org-level default
 * wall, always present) or a Website (a campus-specific wall, Multi-Site+ only, see
 * campusScopedPrayerWalls). Every public /prayer/[publicPrayerWallId]/* page and its
 * Server Actions resolve through this one function so neither has to know which kind
 * of row it got -- same rawDb public-lookup boundary as
 * organizationService.getOrganizationByPublicPrayerWallId (no session exists yet).
 */
export async function resolvePublicPrayerWall(publicPrayerWallId: string): Promise<PublicPrayerWallConfig | null> {
  const organization = await rawDb.organization.findUnique({ where: { publicPrayerWallId } });
  if (organization) {
    if (!organization.prayerWallEnabled) return null;
    return {
      organizationId: organization.id,
      organizationPlanKey: organization.planKey,
      websiteId: null,
      displayName: organization.name,
      prayerWallBrandColor: organization.prayerWallBrandColor,
      prayerWallLogoUrl: organization.prayerWallLogoUrl,
      prayerRequestForwardingEmails: organization.prayerRequestForwardingEmails,
      testimoniesEnabled: organization.testimoniesEnabled,
      testimoniesPageName: organization.testimoniesPageName,
    };
  }

  const website = await rawDb.website.findUnique({ where: { publicPrayerWallId }, include: { organization: true } });
  if (website && website.prayerWallEnabled) {
    return {
      organizationId: website.organizationId,
      organizationPlanKey: website.organization.planKey,
      websiteId: website.id,
      displayName: website.name,
      prayerWallBrandColor: website.prayerWallBrandColor,
      prayerWallLogoUrl: website.prayerWallLogoUrl,
      prayerRequestForwardingEmails: website.prayerRequestForwardingEmails,
      testimoniesEnabled: website.testimoniesEnabled,
      testimoniesPageName: website.testimoniesPageName,
    };
  }

  return null;
}

/**
 * Same lookup as resolvePublicPrayerWall but WITHOUT the prayerWallEnabled check --
 * exists only so a live branding preview iframe (Settings, or the Websites "Prayer
 * Wall" tab) can render a wall before it's been enabled. The caller MUST verify the
 * requester is that same organization's authenticated staff (checking
 * result.organizationId against the signed-in staff org covers both the
 * Organization and Website cases identically) before using this -- calling it for an
 * arbitrary/unauthenticated visitor would let them see a disabled wall's contents.
 */
export async function resolvePublicPrayerWallForPreview(publicPrayerWallId: string): Promise<PublicPrayerWallConfig | null> {
  const organization = await rawDb.organization.findUnique({ where: { publicPrayerWallId } });
  if (organization) {
    return {
      organizationId: organization.id,
      organizationPlanKey: organization.planKey,
      websiteId: null,
      displayName: organization.name,
      prayerWallBrandColor: organization.prayerWallBrandColor,
      prayerWallLogoUrl: organization.prayerWallLogoUrl,
      prayerRequestForwardingEmails: organization.prayerRequestForwardingEmails,
      testimoniesEnabled: organization.testimoniesEnabled,
      testimoniesPageName: organization.testimoniesPageName,
    };
  }

  const website = await rawDb.website.findUnique({ where: { publicPrayerWallId }, include: { organization: true } });
  if (website) {
    return {
      organizationId: website.organizationId,
      organizationPlanKey: website.organization.planKey,
      websiteId: website.id,
      displayName: website.name,
      prayerWallBrandColor: website.prayerWallBrandColor,
      prayerWallLogoUrl: website.prayerWallLogoUrl,
      prayerRequestForwardingEmails: website.prayerRequestForwardingEmails,
      testimoniesEnabled: website.testimoniesEnabled,
      testimoniesPageName: website.testimoniesPageName,
    };
  }

  return null;
}
