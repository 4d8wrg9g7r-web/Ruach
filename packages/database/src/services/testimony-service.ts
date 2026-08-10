import { tenantDb } from "../client";

const MAX_FEATURED_TESTIMONIES = 20;

/** Visitor submission: publishes immediately (no pre-approval queue), matching PrayerRequest's default-public behavior for testimonies -- see the Testimony model's doc comment. */
export async function createVisitorTestimony(params: {
  organizationId: string;
  accountId: string;
  websiteId: string | null;
  message: string;
}) {
  return tenantDb.testimony.create({
    data: {
      organizationId: params.organizationId,
      accountId: params.accountId,
      websiteId: params.websiteId,
      message: params.message,
      isFeatured: false,
      isPublic: true,
    },
  });
}

/**
 * Public wall's testimonies list: featured (staff-curated) rows first in display
 * order, then visitor submissions newest first -- two separate queries rather than
 * one findMany + sort, since "order" is only meaningful within the featured set (see
 * the model's doc comment) and mixing the two orderings in SQL would require a
 * synthetic sort key for no real benefit at this scale.
 */
export async function listPublicTestimonies(organizationId: string, websiteId?: string | null) {
  const scope = websiteId !== undefined ? { OR: [{ websiteId: null }, { websiteId }] } : {};
  const [featured, submitted] = await Promise.all([
    tenantDb.testimony.findMany({
      where: { organizationId, isFeatured: true, isPublic: true, ...scope },
      orderBy: { order: "asc" },
    }),
    tenantDb.testimony.findMany({
      where: { organizationId, isFeatured: false, isPublic: true, ...scope },
      orderBy: { createdAt: "desc" },
      include: { account: { select: { displayName: true } } },
    }),
  ]);
  return { featured, submitted };
}

/** Dashboard moderation: every testimony regardless of isPublic, staff-curated first (their own display order), then visitor submissions newest first. */
export async function listTestimoniesForModeration(organizationId: string) {
  const [featured, submitted] = await Promise.all([
    tenantDb.testimony.findMany({
      where: { organizationId, isFeatured: true },
      orderBy: { order: "asc" },
    }),
    tenantDb.testimony.findMany({
      where: { organizationId, isFeatured: false },
      orderBy: { createdAt: "desc" },
      include: { account: { select: { displayName: true, email: true } } },
    }),
  ]);
  return { featured, submitted };
}

export async function staffSetPublicVisibility(organizationId: string, testimonyId: string, isPublic: boolean) {
  return tenantDb.testimony.updateMany({ where: { id: testimonyId, organizationId }, data: { isPublic } });
}

export async function deleteTestimony(organizationId: string, testimonyId: string) {
  return tenantDb.testimony.deleteMany({ where: { id: testimonyId, organizationId } });
}

/** Staff-curated highlight -- optionally with an embedded YouTube video. videoId/embedUrl are pre-computed at write time and stored alongside the raw url, same "store both, never parse on read" pattern as YouTubeProvider.ts. */
export async function createFeaturedTestimony(params: {
  organizationId: string;
  createdByUserId: string;
  message: string;
  authorDisplayName: string;
  youtubeVideoId?: string | null;
}) {
  const count = await tenantDb.testimony.count({ where: { organizationId: params.organizationId, isFeatured: true } });
  if (count >= MAX_FEATURED_TESTIMONIES) {
    throw new Error(`Maximum of ${MAX_FEATURED_TESTIMONIES} featured testimonies reached.`);
  }
  const youtubeVideoId = params.youtubeVideoId ?? null;
  return tenantDb.testimony.create({
    data: {
      organizationId: params.organizationId,
      createdByUserId: params.createdByUserId,
      message: params.message,
      authorDisplayName: params.authorDisplayName,
      isFeatured: true,
      isPublic: true,
      youtubeVideoId,
      youtubeEmbedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : null,
      order: count,
    },
  });
}

export async function updateFeaturedTestimony(
  organizationId: string,
  testimonyId: string,
  updates: { message: string; authorDisplayName: string; youtubeVideoId?: string | null },
) {
  const youtubeVideoId = updates.youtubeVideoId ?? null;
  const result = await tenantDb.testimony.updateMany({
    where: { id: testimonyId, organizationId, isFeatured: true },
    data: {
      message: updates.message,
      authorDisplayName: updates.authorDisplayName,
      youtubeVideoId,
      youtubeEmbedUrl: youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : null,
    },
  });
  return result.count > 0;
}

/** Same swap-with-neighbor + renumber pattern as actionLinkService.reorderActionLink, scoped to isFeatured rows only -- visitor submissions never have a meaningful order. */
export async function reorderFeaturedTestimony(organizationId: string, testimonyId: string, direction: "up" | "down") {
  return tenantDb.$transaction(async (tx) => {
    const featured = await tx.testimony.findMany({
      where: { organizationId, isFeatured: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    for (let i = 0; i < featured.length; i += 1) {
      if (featured[i]!.order !== i) {
        await tx.testimony.updateMany({ where: { id: featured[i]!.id, organizationId }, data: { order: i } });
        featured[i]!.order = i;
      }
    }

    const index = featured.findIndex((t) => t.id === testimonyId);
    if (index === -1) return null;
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= featured.length) return featured;

    await tx.testimony.updateMany({ where: { id: featured[index]!.id, organizationId }, data: { order: swapWith } });
    await tx.testimony.updateMany({ where: { id: featured[swapWith]!.id, organizationId }, data: { order: index } });

    return featured;
  });
}
